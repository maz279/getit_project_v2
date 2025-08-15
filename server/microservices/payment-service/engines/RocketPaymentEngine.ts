import { db } from '../../../db';
import { paymentTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Rocket Payment Engine for Bangladesh Mobile Banking
 * Implements complete Rocket payment flow with enterprise-level security
 */
export class RocketPaymentEngine {
  private readonly baseUrl: string;
  private readonly merchantNumber: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly callbackUrl: string;
  private readonly webhookSecret: string;

  constructor() {
    this.baseUrl = process.env.ROCKET_BASE_URL || 'https://rocket-sandbox.com.bd/api';
    this.merchantNumber = process.env.ROCKET_MERCHANT_NUMBER || '';
    this.apiKey = process.env.ROCKET_API_KEY || '';
    this.apiSecret = process.env.ROCKET_API_SECRET || '';
    this.callbackUrl = process.env.ROCKET_CALLBACK_URL || 'https://your-domain.com/api/v1/payments/rocket/callback';
    this.webhookSecret = process.env.ROCKET_WEBHOOK_SECRET || '';
  }

  /**
   * Initialize Rocket payment
   */
  async initializePayment(data: {
    transactionId: string;
    amount: number;
    orderId: string;
    userId: number;
    metadata?: any;
  }): Promise<any> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const transactionId = this.generateTransactionId();

      const paymentData = {
        merchant_number: this.merchantNumber,
        transaction_id: transactionId,
        amount: data.amount.toString(),
        currency: 'BDT',
        purpose: 'GetIt Order Payment',
        reference: data.orderId,
        callback_url: this.callbackUrl,
        timestamp,
        customer_info: {
          user_id: data.userId.toString()
        }
      };

      const signature = this.generateSignature(paymentData, timestamp);
      const response = await this.makeApiRequest('/payment/initiate', 'POST', {
        ...paymentData,
        signature
      });

      if (response.status === 'success') {
        return {
          success: true,
          gatewayTransactionId: response.transaction_id,
          paymentUrl: response.payment_url,
          transactionId: response.transaction_id,
          amount: response.amount,
          currency: response.currency,
          reference: response.reference,
          status: response.status,
          expires_at: response.expires_at
        };
      } else {
        throw new Error(`Rocket payment initialization failed: ${response.message}`);
      }

    } catch (error) {
      console.error('Rocket payment initialization error:', error);
      throw new Error(`Failed to initialize Rocket payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send Rocket payment
   */
  async sendPayment(data: {
    amount: number;
    orderId: string;
    recipientNumber: string;
    userId: number;
  }): Promise<any> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const transactionId = this.generateTransactionId();

      const paymentData = {
        merchant_number: this.merchantNumber,
        transaction_id: transactionId,
        amount: data.amount.toString(),
        currency: 'BDT',
        recipient_number: data.recipientNumber,
        purpose: 'GetIt Order Payment',
        reference: data.orderId,
        timestamp
      };

      const signature = this.generateSignature(paymentData, timestamp);
      const response = await this.makeApiRequest('/payment/send', 'POST', {
        ...paymentData,
        signature
      });

      if (response.status === 'success' || response.status === 'pending') {
        return {
          success: true,
          transactionId: response.transaction_id,
          rocketTransactionId: response.rocket_transaction_id,
          amount: response.amount,
          currency: response.currency,
          recipientNumber: response.recipient_number,
          status: response.status,
          message: response.message,
          fee: response.fee
        };
      } else {
        throw new Error(`Rocket payment failed: ${response.message}`);
      }

    } catch (error) {
      console.error('Rocket payment send error:', error);
      throw error;
    }
  }

  /**
   * Get Rocket payment status
   */
  async getPaymentStatus(transactionId: string): Promise<any> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const requestData = {
        merchant_number: this.merchantNumber,
        transaction_id: transactionId,
        timestamp
      };

      const signature = this.generateSignature(requestData, timestamp);
      const response = await this.makeApiRequest('/payment/status', 'POST', {
        ...requestData,
        signature
      });

      return {
        status: this.mapRocketStatusToLocal(response.status),
        gatewayResponse: response,
        transactionId: response.transaction_id,
        rocketTransactionId: response.rocket_transaction_id,
        amount: response.amount,
        currency: response.currency,
        completedAt: response.completed_at,
        fee: response.fee
      };

    } catch (error) {
      console.error('Rocket status query error:', error);
      throw error;
    }
  }

  /**
   * Process Rocket refund
   */
  async processRefund(data: {
    originalTransactionId: string;
    amount: number;
    reason: string;
  }): Promise<any> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const refundTransactionId = this.generateTransactionId();

      const refundData = {
        merchant_number: this.merchantNumber,
        refund_transaction_id: refundTransactionId,
        original_transaction_id: data.originalTransactionId,
        amount: data.amount.toString(),
        currency: 'BDT',
        reason: data.reason,
        timestamp
      };

      const signature = this.generateSignature(refundData, timestamp);
      const response = await this.makeApiRequest('/payment/refund', 'POST', {
        ...refundData,
        signature
      });

      if (response.status === 'success') {
        return {
          success: true,
          status: 'completed',
          refundId: response.refund_transaction_id,
          originalTransactionId: data.originalTransactionId,
          refundAmount: response.amount,
          currency: response.currency,
          refundTime: response.completed_at,
          fee: response.fee,
          message: response.message
        };
      } else {
        throw new Error(`Rocket refund failed: ${response.message}`);
      }

    } catch (error) {
      console.error('Rocket refund error:', error);
      throw error;
    }
  }

  /**
   * Handle Rocket webhook
   */
  async handleWebhook(payload: any, signature: string): Promise<any> {
    try {
      // Verify webhook signature
      const isValid = this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      const { transaction_id, status, rocket_transaction_id } = payload;

      // Update transaction status based on webhook
      await this.updateTransactionStatus(
        transaction_id,
        this.mapRocketStatusToLocal(status),
        payload
      );

      return {
        success: true,
        processed: true,
        transactionId: transaction_id,
        rocketTransactionId: rocket_transaction_id,
        status: this.mapRocketStatusToLocal(status)
      };

    } catch (error) {
      console.error('Rocket webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API request to Rocket
   */
  private async makeApiRequest(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': this.apiKey,
        'User-Agent': 'GetIt-Platform/1.0'
      };

      const requestOptions: RequestInit = {
        method,
        headers
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      return responseData;

    } catch (error) {
      console.error('Rocket API request error:', error);
      throw error;
    }
  }

  /**
   * Generate signature for Rocket API
   */
  private generateSignature(data: any, timestamp: string): string {
    try {
      // Create string to sign by concatenating values in alphabetical order of keys
      const keys = Object.keys(data).sort();
      const stringToSign = keys.map(key => `${key}=${data[key]}`).join('&') + `&timestamp=${timestamp}`;

      // Generate HMAC SHA256 signature
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(stringToSign)
        .digest('hex');

      return signature;

    } catch (error) {
      console.error('Signature generation error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const payloadString = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payloadString)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Update transaction status in database
   */
  private async updateTransactionStatus(
    transactionId: string,
    status: string,
    gatewayResponse: any
  ): Promise<void> {
    try {
      await db
        .update(paymentTransactions)
        .set({
          status,
          gatewayResponse,
          updatedAt: new Date()
        })
        .where(eq(paymentTransactions.gatewayTransactionId, transactionId));

    } catch (error) {
      console.error('Transaction status update error:', error);
    }
  }

  /**
   * Map Rocket transaction status to local status
   */
  private mapRocketStatusToLocal(rocketStatus: string): string {
    const statusMap: Record<string, string> = {
      'success': 'completed',
      'completed': 'completed',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'pending': 'pending',
      'processing': 'processing',
      'expired': 'expired'
    };

    return statusMap[rocketStatus] || 'pending';
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `RKT${timestamp}${random}`;
  }

  /**
   * Get current timestamp
   */
  private getCurrentTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  /**
   * Validate Rocket configuration
   */
  validateConfiguration(): boolean {
    const requiredFields = [
      this.merchantNumber,
      this.apiKey,
      this.apiSecret,
      this.baseUrl
    ];

    return requiredFields.every(field => field && field.trim() !== '');
  }

  /**
   * Get supported payment methods
   */
  getSupportedMethods(): string[] {
    return ['rocket_wallet', 'rocket_send_money'];
  }

  /**
   * Get payment method limits
   */
  getPaymentLimits(): { min: number; max: number } {
    return {
      min: 1, // 1 BDT
      max: 250000 // 250,000 BDT
    };
  }

  /**
   * Calculate transaction fee
   */
  calculateTransactionFee(amount: number): number {
    // Rocket typically charges 1.8% for merchant transactions
    const feePercentage = 0.018;
    const calculatedFee = amount * feePercentage;
    
    // Minimum fee of 5 BDT
    const minimumFee = 5;
    
    return Math.max(minimumFee, Math.round(calculatedFee * 100) / 100);
  }

  /**
   * Get merchant balance
   */
  async getMerchantBalance(): Promise<{ available: boolean; balance?: number }> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const requestData = {
        merchant_number: this.merchantNumber,
        timestamp
      };

      const signature = this.generateSignature(requestData, timestamp);
      const response = await this.makeApiRequest('/merchant/balance', 'POST', {
        ...requestData,
        signature
      });

      return {
        available: true,
        balance: parseFloat(response.balance || '0')
      };

    } catch (error) {
      console.error('Balance inquiry error:', error);
      return {
        available: false
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const requestData = {
        merchant_number: this.merchantNumber,
        start_date: this.formatDate(startDate),
        end_date: this.formatDate(endDate),
        limit: limit.toString(),
        timestamp
      };

      const signature = this.generateSignature(requestData, timestamp);
      const response = await this.makeApiRequest('/merchant/transactions', 'POST', {
        ...requestData,
        signature
      });

      return response.transactions || [];

    } catch (error) {
      console.error('Transaction history error:', error);
      return [];
    }
  }

  /**
   * Format date for Rocket API (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Check mobile number validity for Rocket
   */
  isValidRocketNumber(mobileNumber: string): boolean {
    // Rocket numbers in Bangladesh typically start with 017, 018, 019
    const rocketPatterns = [
      /^(\+88)?017\d{8}$/, // Grameenphone (main Rocket operator)
      /^(\+88)?018\d{8}$/, // Robi/Airtel (supports Rocket)
      /^(\+88)?019\d{8}$/  // Banglalink (supports Rocket)
    ];

    return rocketPatterns.some(pattern => pattern.test(mobileNumber));
  }

  /**
   * Generate payment QR code
   */
  async generatePaymentQR(amount: number, reference: string): Promise<{ qrString: string; qrImage: string }> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const requestData = {
        merchant_number: this.merchantNumber,
        amount: amount.toString(),
        reference,
        currency: 'BDT',
        timestamp
      };

      const signature = this.generateSignature(requestData, timestamp);
      const response = await this.makeApiRequest('/payment/qr/generate', 'POST', {
        ...requestData,
        signature
      });

      return {
        qrString: response.qr_string || '',
        qrImage: response.qr_image || ''
      };

    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  }

  /**
   * Verify merchant account
   */
  async verifyMerchantAccount(): Promise<{ verified: boolean; details?: any }> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const requestData = {
        merchant_number: this.merchantNumber,
        timestamp
      };

      const signature = this.generateSignature(requestData, timestamp);
      const response = await this.makeApiRequest('/merchant/verify', 'POST', {
        ...requestData,
        signature
      });

      return {
        verified: response.status === 'verified',
        details: {
          merchantName: response.merchant_name,
          status: response.status,
          accountType: response.account_type,
          verificationDate: response.verification_date
        }
      };

    } catch (error) {
      console.error('Merchant verification error:', error);
      return {
        verified: false
      };
    }
  }

  /**
   * Get payment method availability
   */
  async getPaymentMethodAvailability(): Promise<{ available: boolean; methods: string[] }> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const requestData = {
        merchant_number: this.merchantNumber,
        timestamp
      };

      const signature = this.generateSignature(requestData, timestamp);
      const response = await this.makeApiRequest('/payment/methods', 'GET', {
        ...requestData,
        signature
      });

      return {
        available: response.available,
        methods: response.methods || []
      };

    } catch (error) {
      console.error('Payment method availability error:', error);
      return {
        available: false,
        methods: []
      };
    }
  }

  /**
   * Send money to customer (for refunds or rewards)
   */
  async sendMoneyToCustomer(data: {
    recipientNumber: string;
    amount: number;
    purpose: string;
    reference?: string;
  }): Promise<any> {
    try {
      const timestamp = this.getCurrentTimestamp();
      const transactionId = this.generateTransactionId();

      const requestData = {
        merchant_number: this.merchantNumber,
        transaction_id: transactionId,
        recipient_number: data.recipientNumber,
        amount: data.amount.toString(),
        currency: 'BDT',
        purpose: data.purpose,
        reference: data.reference || transactionId,
        timestamp
      };

      const signature = this.generateSignature(requestData, timestamp);
      const response = await this.makeApiRequest('/payment/send-money', 'POST', {
        ...requestData,
        signature
      });

      return {
        success: response.status === 'success',
        transactionId: response.transaction_id,
        rocketTransactionId: response.rocket_transaction_id,
        amount: response.amount,
        recipientNumber: response.recipient_number,
        status: response.status,
        fee: response.fee,
        message: response.message
      };

    } catch (error) {
      console.error('Send money error:', error);
      throw error;
    }
  }
}