/**
 * BNPL Service - Amazon.com/Shopee.sg Level
 * Buy Now Pay Later financing and point-of-sale lending operations
 */

import { db } from '../../../../db.js';
import { LoggingService } from '../../../../services/LoggingService';
import { RedisService } from '../../../../services/RedisService';

export class BNPLService {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Check BNPL eligibility for customer
   */
  async checkEligibility(params: {
    customerId: string;
    orderAmount: number;
    merchantId: string;
    requestedBy: string;
  }) {
    const { customerId, orderAmount, merchantId, requestedBy } = params;

    try {
      // Get customer credit profile
      const creditProfile = await this.getCustomerCreditProfile(customerId);
      
      // Calculate eligibility based on multiple factors
      const eligibilityScore = this.calculateEligibilityScore(creditProfile, orderAmount);
      
      // Determine eligibility
      const eligible = eligibilityScore >= 650; // Minimum score threshold
      const maxAmount = this.calculateMaxEligibleAmount(creditProfile);
      
      // Get available installment options
      const installmentOptions = this.getInstallmentOptions(orderAmount, eligible);

      const eligibility = {
        eligible,
        eligibilityScore,
        maxAmount,
        approvedAmount: eligible ? Math.min(orderAmount, maxAmount) : 0,
        installmentOptions,
        interestRate: this.getInterestRate(creditProfile, orderAmount),
        riskCategory: this.getRiskCategory(eligibilityScore),
        reasons: eligible ? [] : this.getDeclineReasons(eligibilityScore, orderAmount, maxAmount),
        validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        customerId,
        merchantId,
        orderAmount,
        checkedAt: new Date().toISOString()
      };

      // Cache eligibility result
      await this.redisService.setCache(
        `bnpl_eligibility:${customerId}:${merchantId}:${orderAmount}`, 
        eligibility, 
        900 // 15 minutes
      );

      this.loggingService.logInfo('BNPL eligibility checked', {
        customerId,
        orderAmount,
        merchantId,
        eligible,
        eligibilityScore,
        maxAmount
      });

      return eligibility;

    } catch (error) {
      this.loggingService.logError('Failed to check BNPL eligibility', error);
      throw error;
    }
  }

  /**
   * Create BNPL financing offer
   */
  async createBNPLOffer(params: {
    customerId: string;
    orderAmount: number;
    merchantId: string;
    installments: number;
    interestRate: number;
    orderDetails: any;
    createdBy: string;
  }) {
    const { customerId, orderAmount, merchantId, installments, interestRate, orderDetails, createdBy } = params;

    try {
      // Verify eligibility first
      const eligibility = await this.checkEligibility({
        customerId,
        orderAmount,
        merchantId,
        requestedBy: createdBy
      });

      if (!eligibility.eligible) {
        throw new Error('Customer is not eligible for BNPL financing');
      }

      // Calculate installment details
      const installmentAmount = this.calculateInstallmentAmount(orderAmount, installments, interestRate);
      const totalAmount = installmentAmount * installments;

      const offer = {
        id: this.generateOfferId(),
        customerId,
        merchantId,
        orderAmount,
        totalAmount,
        installments,
        installmentAmount,
        interestRate,
        currency: 'BDT',
        status: 'pending',
        orderDetails,
        paymentSchedule: this.generatePaymentSchedule(installments, installmentAmount),
        termsConditions: this.getBNPLTermsConditions(),
        validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        createdBy,
        createdAt: new Date().toISOString()
      };

      // Cache offer for quick access
      await this.redisService.setCache(`bnpl_offer:${offer.id}`, offer, 1800); // 30 minutes

      this.loggingService.logInfo('BNPL offer created', {
        offerId: offer.id,
        customerId,
        merchantId,
        orderAmount,
        installments,
        totalAmount
      });

      return offer;

    } catch (error) {
      this.loggingService.logError('Failed to create BNPL offer', error);
      throw error;
    }
  }

  /**
   * Accept BNPL offer by customer
   */
  async acceptBNPLOffer(params: {
    offerId: string;
    customerId: string;
    ipAddress?: string;
    userAgent?: string;
    acceptedAt: Date;
  }) {
    const { offerId, customerId, ipAddress, userAgent, acceptedAt } = params;

    try {
      // Get offer details
      const offer = await this.getBNPLOffer(offerId);
      
      if (offer.status !== 'pending') {
        throw new Error('Offer is no longer available');
      }

      if (offer.customerId !== customerId) {
        throw new Error('Unauthorized access to offer');
      }

      if (new Date() > new Date(offer.validUntil)) {
        throw new Error('Offer has expired');
      }

      // Create BNPL transaction
      const transaction = {
        id: this.generateTransactionId(),
        offerId,
        customerId,
        merchantId: offer.merchantId,
        orderAmount: offer.orderAmount,
        totalAmount: offer.totalAmount,
        installments: offer.installments,
        installmentAmount: offer.installmentAmount,
        interestRate: offer.interestRate,
        currency: offer.currency,
        status: 'active',
        currentInstallment: 1,
        paidInstallments: 0,
        remainingAmount: offer.totalAmount,
        paymentSchedule: offer.paymentSchedule,
        orderDetails: offer.orderDetails,
        acceptanceDetails: {
          ipAddress,
          userAgent,
          acceptedAt: acceptedAt.toISOString()
        },
        nextPaymentDue: this.getNextPaymentDue(),
        createdAt: new Date().toISOString()
      };

      // Update offer status
      offer.status = 'accepted';
      offer.transactionId = transaction.id;

      // Cache transaction
      await this.redisService.setCache(`bnpl_transaction:${transaction.id}`, transaction, 86400); // 24 hours
      await this.redisService.setCache(`bnpl_offer:${offerId}`, offer, 3600);

      this.loggingService.logInfo('BNPL offer accepted', {
        offerId,
        transactionId: transaction.id,
        customerId,
        orderAmount: offer.orderAmount,
        installments: offer.installments
      });

      return {
        ...transaction,
        transactionId: transaction.id,
        message: 'BNPL offer accepted successfully',
        nextSteps: 'First payment will be due in 30 days'
      };

    } catch (error) {
      this.loggingService.logError('Failed to accept BNPL offer', error);
      throw error;
    }
  }

  /**
   * Process BNPL payment
   */
  async processBNPLPayment(params: {
    transactionId: string;
    installmentNumber: number;
    paymentMethod: string;
    amount: number;
    paidBy: string;
  }) {
    const { transactionId, installmentNumber, paymentMethod, amount, paidBy } = params;

    try {
      // Get transaction details
      const transaction = await this.getBNPLTransactionDetails(transactionId);
      
      if (transaction.status !== 'active') {
        throw new Error('BNPL transaction is not active');
      }

      // Validate payment amount
      if (Math.abs(amount - transaction.installmentAmount) > 1) { // Allow 1 BDT tolerance
        throw new Error('Invalid payment amount');
      }

      // Validate installment number
      if (installmentNumber !== transaction.currentInstallment) {
        throw new Error('Invalid installment number');
      }

      const payment = {
        id: this.generatePaymentId(),
        transactionId,
        installmentNumber,
        amount,
        paymentMethod,
        status: 'completed',
        paidBy,
        paidAt: new Date().toISOString(),
        reference: this.generatePaymentReference()
      };

      // Update transaction
      transaction.paidInstallments += 1;
      transaction.currentInstallment += 1;
      transaction.remainingAmount -= amount;
      
      if (transaction.paidInstallments >= transaction.installments) {
        transaction.status = 'completed';
        transaction.completedAt = new Date().toISOString();
      } else {
        transaction.nextPaymentDue = this.getNextPaymentDue(30); // Next payment in 30 days
      }

      // Update cache
      await this.redisService.setCache(`bnpl_transaction:${transactionId}`, transaction, 86400);

      this.loggingService.logInfo('BNPL payment processed', {
        paymentId: payment.id,
        transactionId,
        installmentNumber,
        amount,
        paymentMethod,
        remainingInstallments: transaction.installments - transaction.paidInstallments
      });

      return payment;

    } catch (error) {
      this.loggingService.logError('Failed to process BNPL payment', error);
      throw error;
    }
  }

  /**
   * Get BNPL transaction details
   */
  async getBNPLTransactionDetails(transactionId: string) {
    try {
      // Try cache first
      const cachedTransaction = await this.redisService.getCache(`bnpl_transaction:${transactionId}`);
      if (cachedTransaction) {
        return cachedTransaction;
      }

      // Mock transaction data - replace with database query
      const transaction = {
        id: transactionId,
        customerId: 'customer123',
        merchantId: 'merchant456',
        orderAmount: 10000,
        totalAmount: 10000,
        installments: 4,
        installmentAmount: 2500,
        interestRate: 0,
        currency: 'BDT',
        status: 'active',
        currentInstallment: 2,
        paidInstallments: 1,
        remainingAmount: 7500,
        nextPaymentDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Cache for future requests
      await this.redisService.setCache(`bnpl_transaction:${transactionId}`, transaction, 86400);

      return transaction;

    } catch (error) {
      this.loggingService.logError('Failed to get BNPL transaction details', error);
      throw error;
    }
  }

  /**
   * Get customer BNPL history
   */
  async getCustomerBNPLHistory(customerId: string, filters: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }) {
    try {
      // Mock history data - replace with database query
      const transactions = [
        {
          id: 'bnpl001',
          merchantId: 'merchant456',
          merchantName: 'Tech Store BD',
          orderAmount: 10000,
          totalAmount: 10000,
          installments: 4,
          status: 'active',
          paidInstallments: 1,
          remainingAmount: 7500,
          nextPaymentDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'bnpl002',
          merchantId: 'merchant789',
          merchantName: 'Fashion World',
          orderAmount: 5000,
          totalAmount: 5000,
          installments: 3,
          status: 'completed',
          paidInstallments: 3,
          remainingAmount: 0,
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Apply filters
      let filteredTransactions = transactions;
      if (filters.status && filters.status !== 'all') {
        filteredTransactions = transactions.filter(t => t.status === filters.status);
      }

      // Pagination
      const startIndex = (filters.page - 1) * filters.limit;
      const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + filters.limit);

      return {
        transactions: paginatedTransactions,
        total: filteredTransactions.length,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(filteredTransactions.length / filters.limit),
        summary: {
          totalTransactions: transactions.length,
          activeTransactions: transactions.filter(t => t.status === 'active').length,
          completedTransactions: transactions.filter(t => t.status === 'completed').length,
          totalFinanced: transactions.reduce((sum, t) => sum + t.orderAmount, 0),
          totalPaid: transactions.reduce((sum, t) => sum + (t.orderAmount - t.remainingAmount), 0)
        }
      };

    } catch (error) {
      this.loggingService.logError('Failed to get customer BNPL history', error);
      throw error;
    }
  }

  /**
   * Process early payment for BNPL
   */
  async processEarlyPayment(params: {
    transactionId: string;
    paymentMethod: string;
    applyDiscount: boolean;
    paidBy: string;
  }) {
    const { transactionId, paymentMethod, applyDiscount, paidBy } = params;

    try {
      const transaction = await this.getBNPLTransactionDetails(transactionId);
      
      if (transaction.status !== 'active') {
        throw new Error('BNPL transaction is not active');
      }

      // Calculate early payment amount
      let discountAmount = 0;
      if (applyDiscount && transaction.interestRate > 0) {
        // Calculate discount on remaining interest
        discountAmount = this.calculateEarlyPaymentDiscount(transaction);
      }

      const totalAmount = transaction.remainingAmount - discountAmount;

      const earlyPayment = {
        id: this.generatePaymentId(),
        transactionId,
        type: 'early_payment',
        originalAmount: transaction.remainingAmount,
        discountAmount,
        totalAmount,
        paymentMethod,
        status: 'completed',
        paidBy,
        paidAt: new Date().toISOString(),
        reference: this.generatePaymentReference()
      };

      // Update transaction to completed
      transaction.status = 'completed';
      transaction.remainingAmount = 0;
      transaction.paidInstallments = transaction.installments;
      transaction.completedAt = new Date().toISOString();
      transaction.earlyPayment = true;

      // Update cache
      await this.redisService.setCache(`bnpl_transaction:${transactionId}`, transaction, 86400);

      this.loggingService.logInfo('BNPL early payment processed', {
        paymentId: earlyPayment.id,
        transactionId,
        originalAmount: transaction.remainingAmount,
        discountAmount,
        totalAmount,
        paymentMethod
      });

      return earlyPayment;

    } catch (error) {
      this.loggingService.logError('Failed to process early payment', error);
      throw error;
    }
  }

  /**
   * Get BNPL analytics
   */
  async getBNPLAnalytics(params: {
    merchantId?: string;
    timeframe: string;
    currency: string;
  }) {
    try {
      // Mock analytics data - replace with database aggregations
      const analytics = {
        totalTransactions: 1250,
        totalFinanced: 15600000,
        totalCollected: 12400000,
        outstandingAmount: 3200000,
        averageOrderValue: 12480,
        averageInstallments: 3.2,
        completionRate: 94.5,
        defaultRate: 2.1,
        onTimePaymentRate: 91.3,
        earlyPaymentRate: 15.7,
        customerAcquisition: {
          new: 245,
          returning: 1005
        },
        installmentBreakdown: {
          '3_months': 65,
          '4_months': 25,
          '6_months': 10
        },
        merchantPerformance: {
          topCategories: [
            { category: 'Electronics', percentage: 35 },
            { category: 'Fashion', percentage: 28 },
            { category: 'Home & Garden', percentage: 22 },
            { category: 'Books', percentage: 15 }
          ],
          approvalRate: 78.5,
          averageOrderValue: 12480
        },
        riskMetrics: {
          lowRisk: 72,
          mediumRisk: 23,
          highRisk: 5
        },
        paymentMethods: {
          mobile_banking: 68,
          bank_transfer: 22,
          card: 10
        }
      };

      return analytics;

    } catch (error) {
      this.loggingService.logError('Failed to get BNPL analytics', error);
      throw error;
    }
  }

  // Additional methods continued...

  async updateBNPLTransactionStatus(params: {
    transactionId: string;
    status: string;
    reason?: string;
    notifyCustomer: boolean;
    updatedBy: string;
  }) {
    // Implementation for updating transaction status
    // This would include database updates and notifications
    return { success: true };
  }

  async sendPaymentReminder(params: {
    transactionId: string;
    reminderType: string;
    customMessage?: string;
    sentBy: string;
  }) {
    // Implementation for sending payment reminders
    // This would integrate with notification service
    return { success: true };
  }

  // Helper methods
  private async getBNPLOffer(offerId: string) {
    const cachedOffer = await this.redisService.getCache(`bnpl_offer:${offerId}`);
    if (cachedOffer) return cachedOffer;
    
    // Mock offer - replace with database query
    throw new Error('Offer not found');
  }

  private async getCustomerCreditProfile(customerId: string) {
    // Mock credit profile - replace with actual credit scoring
    return {
      creditScore: 720,
      paymentHistory: 95,
      accountAge: 24,
      totalSpending: 150000,
      defaultHistory: 0,
      riskCategory: 'low'
    };
  }

  private calculateEligibilityScore(creditProfile: any, orderAmount: number): number {
    let score = creditProfile.creditScore;
    
    // Adjust based on order amount
    if (orderAmount > 50000) score -= 50;
    if (orderAmount > 100000) score -= 100;
    
    // Adjust based on payment history
    score += (creditProfile.paymentHistory - 90) * 2;
    
    return Math.max(300, Math.min(850, score));
  }

  private calculateMaxEligibleAmount(creditProfile: any): number {
    const baseAmount = 25000; // Base eligibility
    const multiplier = Math.max(1, creditProfile.creditScore / 650);
    return Math.floor(baseAmount * multiplier);
  }

  private getInstallmentOptions(orderAmount: number, eligible: boolean) {
    if (!eligible) return [];
    
    const options = [];
    if (orderAmount >= 1000) options.push({ installments: 3, period: '3 months' });
    if (orderAmount >= 5000) options.push({ installments: 4, period: '4 months' });
    if (orderAmount >= 10000) options.push({ installments: 6, period: '6 months' });
    
    return options;
  }

  private getInterestRate(creditProfile: any, orderAmount: number): number {
    // Risk-based interest rate calculation
    if (creditProfile.creditScore >= 750) return 0; // 0% for excellent credit
    if (creditProfile.creditScore >= 700) return 2.5; // 2.5% for good credit
    if (creditProfile.creditScore >= 650) return 5; // 5% for fair credit
    return 8; // 8% for poor credit
  }

  private getRiskCategory(score: number): string {
    if (score >= 750) return 'low';
    if (score >= 650) return 'medium';
    return 'high';
  }

  private getDeclineReasons(score: number, orderAmount: number, maxAmount: number): string[] {
    const reasons = [];
    if (score < 650) reasons.push('Credit score below minimum threshold');
    if (orderAmount > maxAmount) reasons.push('Order amount exceeds credit limit');
    return reasons;
  }

  private calculateInstallmentAmount(orderAmount: number, installments: number, interestRate: number): number {
    if (interestRate === 0) return orderAmount / installments;
    
    const monthlyRate = interestRate / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, installments);
    return Math.ceil((orderAmount * monthlyRate * factor) / (factor - 1));
  }

  private generatePaymentSchedule(installments: number, installmentAmount: number) {
    const schedule = [];
    const startDate = new Date();
    
    for (let i = 1; i <= installments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        installmentNumber: i,
        amount: installmentAmount,
        dueDate: dueDate.toISOString(),
        status: 'pending'
      });
    }
    
    return schedule;
  }

  private getBNPLTermsConditions(): string[] {
    return [
      'Payment due every 30 days from purchase date',
      'Late payment fee of 5% applies after 7 days',
      'Early payment discounts may apply for interest-bearing plans',
      'Customer must maintain valid payment method',
      'Merchant return policy applies to BNPL purchases'
    ];
  }

  private getNextPaymentDue(days: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  private calculateEarlyPaymentDiscount(transaction: any): number {
    // Calculate 50% discount on remaining interest
    const remainingInstallments = transaction.installments - transaction.paidInstallments;
    const remainingInterest = transaction.installmentAmount * remainingInstallments - transaction.remainingAmount;
    return Math.floor(remainingInterest * 0.5);
  }

  private generateOfferId(): string {
    return 'BNPL' + Date.now() + Math.random().toString(36).substr(2, 6);
  }

  private generateTransactionId(): string {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 8);
  }

  private generatePaymentId(): string {
    return 'PAY' + Date.now() + Math.random().toString(36).substr(2, 6);
  }

  private generatePaymentReference(): string {
    return 'REF' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4);
  }
}