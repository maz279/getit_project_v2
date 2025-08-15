/**
 * Payment Processing Service - Consolidated Enterprise Service
 * Consolidates: payment/, api/PaymentService.js, bangladesh-payments/
 * 
 * Amazon.com/Shopee.sg-Level Payment Processing
 * Phase 2: Service Consolidation Implementation
 */

import { IStorage } from '../../storage';
import { BaseService } from '../base/BaseService';
import { ServiceLogger } from '../utils/ServiceLogger';
import { ErrorHandler } from '../utils/ErrorHandler';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  provider: string;
  details: PaymentMethodDetails;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethodType = 
  | 'credit_card'
  | 'debit_card'
  | 'mobile_banking'
  | 'bank_transfer'
  | 'cash_on_delivery'
  | 'digital_wallet';

export interface PaymentMethodDetails {
  // Credit/Debit Card
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  
  // Mobile Banking (Bangladesh)
  mobileNumber?: string;
  accountType?: 'personal' | 'business';
  
  // Bank Transfer
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  
  // Digital Wallet
  walletId?: string;
  walletProvider?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  gateway: PaymentGateway;
  gatewayTransactionId?: string;
  reference: string;
  description: string;
  fees: PaymentFees;
  metadata: { [key: string]: any };
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type TransactionType = 
  | 'payment'
  | 'refund'
  | 'chargeback'
  | 'fee';

export interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
  supportedMethods: PaymentMethodType[];
  config: { [key: string]: any };
}

export interface PaymentFees {
  gatewayFee: number;
  processingFee: number;
  totalFees: number;
}

export interface PaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
  metadata?: { [key: string]: any };
}

export interface RefundRequest {
  transactionId: string;
  amount?: number; // If not provided, full refund
  reason: string;
  metadata?: { [key: string]: any };
}

export interface PaymentAnalytics {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageTransactionValue: number;
  transactionsByStatus: { [key in PaymentStatus]: number };
  transactionsByMethod: { [key: string]: number };
  refundRate: number;
  chargebackRate: number;
}

/**
 * Consolidated Payment Processing Service
 * Replaces multiple scattered payment services with single enterprise service
 */
export class PaymentProcessingService extends BaseService {
  private storage: IStorage;
  private logger: ServiceLogger;
  private errorHandler: ErrorHandler;
  private gateways: Map<string, PaymentGateway>;

  constructor(storage: IStorage) {
    super('PaymentProcessingService');
    this.storage = storage;
    this.logger = new ServiceLogger('PaymentProcessingService');
    this.errorHandler = new ErrorHandler('PaymentProcessingService');
    this.gateways = new Map();
    
    this.initializePaymentGateways();
  }

  /**
   * Payment Method Management
   */
  async addPaymentMethod(userId: string, methodData: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Adding payment method', { userId, type: methodData.type });
      
      const paymentMethod: PaymentMethod = {
        ...methodData,
        id: this.generatePaymentMethodId(),
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate payment method
      await this.validatePaymentMethod(paymentMethod);

      // Encrypt sensitive data
      paymentMethod.details = await this.encryptPaymentDetails(paymentMethod.details);

      // Store payment method
      await this.storage.createPaymentMethod(paymentMethod);

      return paymentMethod;
    }, 'addPaymentMethod');
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching user payment methods', { userId });
      
      const methods = await this.storage.getPaymentMethodsByUser(userId);
      
      // Decrypt and sanitize sensitive data for response
      return methods.map(method => ({
        ...method,
        details: this.sanitizePaymentDetails(method.details)
      }));
    }, 'getUserPaymentMethods');
  }

  async updatePaymentMethod(methodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Updating payment method', { methodId });
      
      const existingMethod = await this.storage.getPaymentMethodById(methodId);
      if (!existingMethod) {
        throw new Error('Payment method not found');
      }

      const updatedMethod = {
        ...existingMethod,
        ...updates,
        updatedAt: new Date()
      };

      // Validate updated method
      await this.validatePaymentMethod(updatedMethod);

      // Encrypt sensitive data if updated
      if (updates.details) {
        updatedMethod.details = await this.encryptPaymentDetails(updatedMethod.details);
      }

      await this.storage.updatePaymentMethod(methodId, updatedMethod);

      return updatedMethod;
    }, 'updatePaymentMethod');
  }

  async deletePaymentMethod(methodId: string): Promise<boolean> {
    return await this.executeOperation(async () => {
      this.logger.info('Deleting payment method', { methodId });
      
      const method = await this.storage.getPaymentMethodById(methodId);
      if (!method) {
        throw new Error('Payment method not found');
      }

      await this.storage.deletePaymentMethod(methodId);
      return true;
    }, 'deletePaymentMethod');
  }

  /**
   * Payment Processing Operations
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentTransaction | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Processing payment', { 
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency
      });
      
      // Get payment method
      const paymentMethod = await this.storage.getPaymentMethodById(paymentRequest.paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      // Select appropriate gateway
      const gateway = this.selectPaymentGateway(paymentMethod.type);
      if (!gateway) {
        throw new Error('No suitable payment gateway found');
      }

      // Calculate fees
      const fees = await this.calculateFees(paymentRequest.amount, gateway, paymentMethod);

      // Create transaction record
      const transaction: PaymentTransaction = {
        id: this.generateTransactionId(),
        orderId: paymentRequest.orderId,
        userId: paymentRequest.userId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: 'pending',
        type: 'payment',
        paymentMethod,
        gateway,
        reference: this.generateReference(),
        description: paymentRequest.description || `Payment for order ${paymentRequest.orderId}`,
        fees,
        metadata: paymentRequest.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store transaction
      await this.storage.createPaymentTransaction(transaction);

      // Process payment through gateway
      const result = await this.processPaymentThroughGateway(transaction, gateway);

      // Update transaction with result
      transaction.status = result.success ? 'captured' : 'failed';
      transaction.gatewayTransactionId = result.gatewayTransactionId;
      transaction.processedAt = new Date();
      transaction.updatedAt = new Date();

      if (result.error) {
        transaction.metadata.error = result.error;
      }

      await this.storage.updatePaymentTransaction(transaction.id, transaction);

      return transaction;
    }, 'processPayment');
  }

  async processRefund(refundRequest: RefundRequest): Promise<PaymentTransaction | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Processing refund', { 
        transactionId: refundRequest.transactionId,
        amount: refundRequest.amount
      });
      
      // Get original transaction
      const originalTransaction = await this.storage.getPaymentTransactionById(refundRequest.transactionId);
      if (!originalTransaction) {
        throw new Error('Original transaction not found');
      }

      if (originalTransaction.status !== 'captured') {
        throw new Error('Cannot refund transaction that is not captured');
      }

      const refundAmount = refundRequest.amount || originalTransaction.amount;

      // Check if refund amount is valid
      if (refundAmount > originalTransaction.amount) {
        throw new Error('Refund amount cannot exceed original transaction amount');
      }

      // Create refund transaction
      const refundTransaction: PaymentTransaction = {
        id: this.generateTransactionId(),
        orderId: originalTransaction.orderId,
        userId: originalTransaction.userId,
        amount: -refundAmount, // Negative for refund
        currency: originalTransaction.currency,
        status: 'pending',
        type: 'refund',
        paymentMethod: originalTransaction.paymentMethod,
        gateway: originalTransaction.gateway,
        reference: this.generateReference(),
        description: `Refund for transaction ${originalTransaction.id}: ${refundRequest.reason}`,
        fees: { gatewayFee: 0, processingFee: 0, totalFees: 0 }, // Usually no fees for refunds
        metadata: {
          originalTransactionId: originalTransaction.id,
          reason: refundRequest.reason,
          ...refundRequest.metadata
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store refund transaction
      await this.storage.createPaymentTransaction(refundTransaction);

      // Process refund through gateway
      const result = await this.processRefundThroughGateway(refundTransaction, originalTransaction);

      // Update refund transaction with result
      refundTransaction.status = result.success ? 'refunded' : 'failed';
      refundTransaction.gatewayTransactionId = result.gatewayTransactionId;
      refundTransaction.processedAt = new Date();
      refundTransaction.updatedAt = new Date();

      if (result.error) {
        refundTransaction.metadata.error = result.error;
      }

      await this.storage.updatePaymentTransaction(refundTransaction.id, refundTransaction);

      // Update original transaction status if fully refunded
      if (refundAmount === originalTransaction.amount) {
        await this.storage.updatePaymentTransaction(originalTransaction.id, {
          ...originalTransaction,
          status: 'refunded',
          updatedAt: new Date()
        });
      } else {
        await this.storage.updatePaymentTransaction(originalTransaction.id, {
          ...originalTransaction,
          status: 'partially_refunded',
          updatedAt: new Date()
        });
      }

      return refundTransaction;
    }, 'processRefund');
  }

  /**
   * Transaction Management
   */
  async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching transaction', { transactionId });
      
      const transaction = await this.storage.getPaymentTransactionById(transactionId);
      return transaction;
    }, 'getTransaction');
  }

  async getTransactionsByOrder(orderId: string): Promise<PaymentTransaction[]> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching transactions by order', { orderId });
      
      const transactions = await this.storage.getPaymentTransactionsByOrder(orderId);
      return transactions;
    }, 'getTransactionsByOrder');
  }

  async getTransactionsByUser(userId: string, page: number = 1, limit: number = 20): Promise<{ transactions: PaymentTransaction[]; total: number }> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching transactions by user', { userId, page, limit });
      
      const offset = (page - 1) * limit;
      const transactions = await this.storage.getPaymentTransactionsByUser(userId, offset, limit);
      const total = await this.storage.countPaymentTransactionsByUser(userId);

      return { transactions, total };
    }, 'getTransactionsByUser');
  }

  /**
   * Bangladesh Mobile Banking Integration
   */
  async processBangladeshMobileBanking(request: {
    orderId: string;
    userId: string;
    amount: number;
    mobileNumber: string;
    provider: 'bkash' | 'nagad' | 'rocket';
    pin?: string;
  }): Promise<PaymentTransaction | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Processing Bangladesh mobile banking payment', { 
        provider: request.provider,
        amount: request.amount
      });
      
      // Get specific mobile banking gateway
      const gateway = this.getBangladeshMobileBankingGateway(request.provider);
      
      if (!gateway) {
        throw new Error(`Mobile banking provider ${request.provider} not supported`);
      }

      // Create payment method for mobile banking
      const paymentMethod: PaymentMethod = {
        id: this.generatePaymentMethodId(),
        userId: request.userId,
        type: 'mobile_banking',
        provider: request.provider,
        details: {
          mobileNumber: request.mobileNumber,
          accountType: 'personal'
        },
        isDefault: false,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Process payment
      const paymentRequest: PaymentRequest = {
        orderId: request.orderId,
        userId: request.userId,
        amount: request.amount,
        currency: 'BDT',
        paymentMethodId: paymentMethod.id,
        description: `Mobile banking payment via ${request.provider}`,
        metadata: {
          provider: request.provider,
          mobileNumber: request.mobileNumber
        }
      };

      return await this.processPayment(paymentRequest);
    }, 'processBangladeshMobileBanking');
  }

  /**
   * Analytics Operations
   */
  async getPaymentAnalytics(dateRange?: { start: Date; end: Date }): Promise<PaymentAnalytics> {
    return await this.executeOperation(async () => {
      this.logger.info('Fetching payment analytics', { dateRange });
      
      const filters = dateRange ? { dateRange } : {};
      
      const totalTransactions = await this.storage.countPaymentTransactions(filters);
      const totalVolume = await this.storage.getPaymentVolume(filters);
      const successfulTransactions = await this.storage.countSuccessfulPaymentTransactions(filters);
      const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
      const averageTransactionValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
      const transactionsByStatus = await this.storage.getTransactionsByStatus(filters);
      const transactionsByMethod = await this.storage.getTransactionsByMethod(filters);
      const refundCount = await this.storage.countRefundTransactions(filters);
      const chargebackCount = await this.storage.countChargebackTransactions(filters);
      const refundRate = totalTransactions > 0 ? (refundCount / totalTransactions) * 100 : 0;
      const chargebackRate = totalTransactions > 0 ? (chargebackCount / totalTransactions) * 100 : 0;

      return {
        totalTransactions,
        totalVolume,
        successRate,
        averageTransactionValue,
        transactionsByStatus,
        transactionsByMethod,
        refundRate,
        chargebackRate
      };
    }, 'getPaymentAnalytics');
  }

  /**
   * Private Helper Methods
   */
  private initializePaymentGateways(): void {
    // Initialize supported payment gateways
    const gateways: PaymentGateway[] = [
      {
        id: 'stripe',
        name: 'Stripe',
        provider: 'stripe',
        isActive: true,
        supportedMethods: ['credit_card', 'debit_card'],
        config: {}
      },
      {
        id: 'bkash',
        name: 'bKash',
        provider: 'bkash',
        isActive: true,
        supportedMethods: ['mobile_banking'],
        config: {}
      },
      {
        id: 'nagad',
        name: 'Nagad',
        provider: 'nagad',
        isActive: true,
        supportedMethods: ['mobile_banking'],
        config: {}
      },
      {
        id: 'rocket',
        name: 'Rocket',
        provider: 'rocket',
        isActive: true,
        supportedMethods: ['mobile_banking'],
        config: {}
      }
    ];

    gateways.forEach(gateway => {
      this.gateways.set(gateway.id, gateway);
    });
  }

  private generatePaymentMethodId(): string {
    return `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReference(): string {
    return `REF_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private async validatePaymentMethod(method: PaymentMethod): Promise<void> {
    if (!method.type || !method.provider) {
      throw new Error('Payment method type and provider are required');
    }

    // Validate based on payment method type
    switch (method.type) {
      case 'credit_card':
      case 'debit_card':
        if (!method.details.cardNumber || !method.details.expiryMonth || !method.details.expiryYear) {
          throw new Error('Card details are incomplete');
        }
        break;
      case 'mobile_banking':
        if (!method.details.mobileNumber) {
          throw new Error('Mobile number is required for mobile banking');
        }
        break;
    }
  }

  private async encryptPaymentDetails(details: PaymentMethodDetails): Promise<PaymentMethodDetails> {
    // Encrypt sensitive payment details
    const encrypted = { ...details };
    
    if (encrypted.cardNumber) {
      // Mask card number, keep last 4 digits
      encrypted.cardNumber = `****-****-****-${encrypted.cardNumber.slice(-4)}`;
    }

    return encrypted;
  }

  private sanitizePaymentDetails(details: PaymentMethodDetails): PaymentMethodDetails {
    // Remove or mask sensitive information for API responses
    const sanitized = { ...details };
    
    if (sanitized.cardNumber) {
      sanitized.cardNumber = `****-****-****-${sanitized.cardNumber.slice(-4)}`;
    }

    return sanitized;
  }

  private selectPaymentGateway(methodType: PaymentMethodType): PaymentGateway | null {
    for (const gateway of this.gateways.values()) {
      if (gateway.isActive && gateway.supportedMethods.includes(methodType)) {
        return gateway;
      }
    }
    return null;
  }

  private getBangladeshMobileBankingGateway(provider: string): PaymentGateway | null {
    return this.gateways.get(provider) || null;
  }

  private async calculateFees(amount: number, gateway: PaymentGateway, method: PaymentMethod): Promise<PaymentFees> {
    // Calculate payment processing fees
    let gatewayFee = 0;
    let processingFee = 0;

    // Different fee structures based on gateway and method
    switch (gateway.provider) {
      case 'stripe':
        gatewayFee = amount * 0.029 + 30; // 2.9% + 30 cents
        break;
      case 'bkash':
      case 'nagad':
      case 'rocket':
        gatewayFee = amount * 0.015; // 1.5% for mobile banking
        break;
    }

    const totalFees = gatewayFee + processingFee;

    return {
      gatewayFee,
      processingFee,
      totalFees
    };
  }

  private async processPaymentThroughGateway(transaction: PaymentTransaction, gateway: PaymentGateway): Promise<{
    success: boolean;
    gatewayTransactionId?: string;
    error?: string;
  }> {
    // Process payment through specific gateway
    try {
      // This would integrate with actual payment gateway APIs
      this.logger.info('Processing payment through gateway', { 
        gateway: gateway.name,
        transactionId: transaction.id
      });

      // Simulate successful payment processing
      return {
        success: true,
        gatewayTransactionId: `gw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  private async processRefundThroughGateway(refundTransaction: PaymentTransaction, originalTransaction: PaymentTransaction): Promise<{
    success: boolean;
    gatewayTransactionId?: string;
    error?: string;
  }> {
    // Process refund through specific gateway
    try {
      this.logger.info('Processing refund through gateway', { 
        gateway: refundTransaction.gateway.name,
        refundTransactionId: refundTransaction.id,
        originalTransactionId: originalTransaction.id
      });

      // Simulate successful refund processing
      return {
        success: true,
        gatewayTransactionId: `gw_refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Refund processing failed'
      };
    }
  }
}