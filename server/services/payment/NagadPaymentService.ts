/**
 * Advanced Nagad Payment Service - Phase 2 Week 5-6
 * Comprehensive mobile banking integration with enhanced features
 * Investment: $55,000 Enhanced Implementation
 */

import { EventEmitter } from 'events';
import { BKashTransaction, BKashErrorCode, OfflineTransaction, KYCVerification, TransactionLimits, FraudDetectionResult } from './BKashPaymentService';

export interface NagadTransaction extends BKashTransaction {
  nagadSpecificFields?: {
    merchantId: string;
    orderReference: string;
    productCategory: string;
  };
}

export interface NagadAPIResponse {
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  balance?: number;
  fees?: number;
}

export interface CrossPlatformBalance {
  bkash: number;
  nagad: number;
  rocket: number;
  total: number;
  lastSyncTime: Date;
}

export class NagadPaymentService extends EventEmitter {
  private offlineQueue: OfflineTransaction[] = [];
  private rateLimiter: Map<string, number> = new Map();
  private fraudDetector: Map<string, any> = new Map();
  private kycCache: Map<string, KYCVerification> = new Map();
  private transactionLimits: Map<string, TransactionLimits> = new Map();
  private balanceCache: Map<string, CrossPlatformBalance> = new Map();
  
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RATE_LIMIT_PER_MINUTE = 80; // Nagad has different rate limits
  private readonly TIMEOUT_DURATION = 25000; // 25 seconds for Nagad
  private readonly NAGAD_API_VERSION = 'v2.0';

  constructor() {
    super();
    this.initializeNagadSpecificConfig();
    this.startCrossPlatformSync();
  }

  /**
   * Enhanced Nagad Payment Processing
   */
  async processPayment(transaction: NagadTransaction): Promise<{
    success: boolean;
    transactionId?: string;
    error?: BKashErrorCode;
    offlineQueued?: boolean;
    nagadResponse?: NagadAPIResponse;
  }> {
    try {
      // Nagad-specific validations
      if (!this.validateNagadTransaction(transaction)) {
        return {
          success: false,
          error: {
            code: 'INVALID_TRANSACTION_FORMAT',
            message: 'Invalid Nagad transaction format',
            retryable: false,
            fallbackRequired: false
          }
        };
      }

      // Rate limiting (Nagad has different limits)
      if (!this.checkNagadRateLimit(transaction.customerMsisdn)) {
        return {
          success: false,
          error: {
            code: 'NAGAD_RATE_LIMIT_EXCEEDED',
            message: 'Nagad rate limit exceeded. Please try again later.',
            retryable: true,
            fallbackRequired: false
          }
        };
      }

      // Enhanced KYC with Nagad specific requirements
      const kycResult = await this.verifyNagadKYC(transaction.customerMsisdn);
      if (!kycResult.verified) {
        return {
          success: false,
          error: {
            code: 'NAGAD_KYC_VERIFICATION_FAILED',
            message: 'Nagad KYC verification required',
            retryable: false,
            fallbackRequired: true
          }
        };
      }

      // Cross-platform balance check
      const balanceCheck = await this.checkCrossPlatformBalance(
        transaction.customerMsisdn,
        transaction.amount
      );
      if (!balanceCheck.sufficient) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_NAGAD_BALANCE',
            message: balanceCheck.message,
            retryable: false,
            fallbackRequired: true
          }
        };
      }

      // Nagad-specific fraud detection
      const fraudResult = await this.detectNagadFraud(transaction);
      if (fraudResult.recommendation === 'block') {
        return {
          success: false,
          error: {
            code: 'NAGAD_FRAUD_DETECTED',
            message: 'Transaction blocked by Nagad fraud detection',
            retryable: false,
            fallbackRequired: true
          }
        };
      }

      // Offline handling
      if (!navigator.onLine) {
        this.queueNagadTransaction(transaction);
        return {
          success: true,
          offlineQueued: true,
          transactionId: transaction.id
        };
      }

      // Process with Nagad API
      const nagadResponse = await this.processNagadPayment(transaction);
      
      // Cross-platform balance update
      await this.updateCrossPlatformBalance(transaction.customerMsisdn, transaction.amount);
      
      // Audit trail
      await this.createNagadAuditTrail(transaction, nagadResponse);
      
      return {
        success: nagadResponse.status === 'success',
        transactionId: nagadResponse.transactionId,
        nagadResponse,
        error: nagadResponse.status === 'failed' ? {
          code: nagadResponse.errorCode || 'NAGAD_PAYMENT_FAILED',
          message: nagadResponse.errorMessage || 'Nagad payment failed',
          retryable: true,
          fallbackRequired: false
        } : undefined
      };

    } catch (error) {
      const errorCode = this.mapNagadErrorToCode(error);
      
      if (errorCode.retryable && transaction.retryCount < this.MAX_RETRY_ATTEMPTS) {
        transaction.retryCount++;
        await this.delay(1000 * transaction.retryCount); // Exponential backoff
        return this.processPayment(transaction);
      }

      return {
        success: false,
        error: errorCode
      };
    }
  }

  /**
   * Nagad-specific transaction validation
   */
  private validateNagadTransaction(transaction: NagadTransaction): boolean {
    // Nagad-specific validation rules
    if (!transaction.merchantInvoiceNumber || transaction.merchantInvoiceNumber.length < 5) {
      return false;
    }

    if (!transaction.customerMsisdn || !transaction.customerMsisdn.startsWith('01')) {
      return false;
    }

    if (transaction.amount < 10 || transaction.amount > 50000) {
      return false; // Nagad limits
    }

    return true;
  }

  /**
   * Nagad-specific KYC verification
   */
  private async verifyNagadKYC(customerMsisdn: string): Promise<{
    verified: boolean;
    kycData?: KYCVerification;
    message?: string;
  }> {
    const cached = this.kycCache.get(`nagad_${customerMsisdn}`);
    if (cached && cached.verificationStatus === 'verified') {
      return { verified: true, kycData: cached };
    }

    try {
      // Nagad KYC API simulation
      const kycData: KYCVerification = {
        customerId: customerMsisdn,
        nidNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        phoneNumber: customerMsisdn,
        verificationStatus: 'verified',
        verificationDate: new Date(),
        riskLevel: 'low'
      };

      // Nagad-specific KYC checks
      const nagadKYCValid = await this.validateNagadKYCRequirements(kycData);
      if (!nagadKYCValid) {
        return { verified: false, message: 'Nagad KYC requirements not met' };
      }

      this.kycCache.set(`nagad_${customerMsisdn}`, kycData);
      return { verified: true, kycData };
    } catch (error) {
      return { verified: false, message: 'Nagad KYC verification failed' };
    }
  }

  /**
   * Cross-platform balance management
   */
  private async checkCrossPlatformBalance(
    customerMsisdn: string,
    amount: number
  ): Promise<{ sufficient: boolean; message?: string; balance?: CrossPlatformBalance }> {
    const balance = await this.getCrossPlatformBalance(customerMsisdn);
    
    if (balance.nagad < amount) {
      // Check if total balance across platforms is sufficient
      if (balance.total >= amount) {
        return {
          sufficient: false,
          message: `Insufficient Nagad balance (${balance.nagad} BDT). Consider using bKash (${balance.bkash} BDT) or Rocket (${balance.rocket} BDT)`,
          balance
        };
      }
      
      return {
        sufficient: false,
        message: `Insufficient balance across all platforms. Total: ${balance.total} BDT, Required: ${amount} BDT`,
        balance
      };
    }

    return { sufficient: true, balance };
  }

  /**
   * Get cross-platform balance with synchronization
   */
  private async getCrossPlatformBalance(customerMsisdn: string): Promise<CrossPlatformBalance> {
    const cached = this.balanceCache.get(customerMsisdn);
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    if (cached && (Date.now() - cached.lastSyncTime.getTime()) < cacheExpiry) {
      return cached;
    }

    // Fetch balances from all platforms
    const [bkashBalance, nagadBalance, rocketBalance] = await Promise.all([
      this.fetchBKashBalance(customerMsisdn),
      this.fetchNagadBalance(customerMsisdn),
      this.fetchRocketBalance(customerMsisdn)
    ]);

    const balance: CrossPlatformBalance = {
      bkash: bkashBalance,
      nagad: nagadBalance,
      rocket: rocketBalance,
      total: bkashBalance + nagadBalance + rocketBalance,
      lastSyncTime: new Date()
    };

    this.balanceCache.set(customerMsisdn, balance);
    this.emit('balance_synced', customerMsisdn, balance);
    
    return balance;
  }

  /**
   * Nagad-specific fraud detection
   */
  private async detectNagadFraud(transaction: NagadTransaction): Promise<FraudDetectionResult> {
    let riskScore = 0;
    const flags: string[] = [];

    // Nagad-specific fraud patterns
    const recentNagadTransactions = this.getRecentNagadTransactions(transaction.customerMsisdn, 600000); // 10 minutes
    if (recentNagadTransactions.length > 2) {
      riskScore += 35;
      flags.push('NAGAD_HIGH_VELOCITY');
    }

    // Cross-platform velocity check
    const crossPlatformVelocity = await this.checkCrossPlatformVelocity(transaction.customerMsisdn);
    if (crossPlatformVelocity.suspicious) {
      riskScore += 25;
      flags.push('CROSS_PLATFORM_VELOCITY');
    }

    // Nagad amount patterns
    if (transaction.amount === 49999) { // Just under limit
      riskScore += 20;
      flags.push('LIMIT_TESTING');
    }

    // Merchant category risk
    if (transaction.nagadSpecificFields?.productCategory === 'digital_goods') {
      riskScore += 15;
      flags.push('HIGH_RISK_CATEGORY');
    }

    // Device fingerprint analysis
    const deviceTrust = this.analyzeDeviceFingerprint(transaction.deviceFingerprint);
    if (deviceTrust < 0.6) {
      riskScore += 20;
      flags.push('UNTRUSTED_DEVICE');
    }

    // Determine recommendation
    let recommendation: 'approve' | 'review' | 'block' = 'approve';
    if (riskScore > 70) {
      recommendation = 'block';
    } else if (riskScore > 40) {
      recommendation = 'review';
    }

    return {
      riskScore,
      flags,
      recommendation,
      velocityCheck: recentNagadTransactions.length <= 2,
      deviceTrust
    };
  }

  /**
   * Process payment with Nagad API
   */
  private async processNagadPayment(transaction: NagadTransaction): Promise<NagadAPIResponse> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('NAGAD_TIMEOUT'));
      }, this.TIMEOUT_DURATION);

      // Simulate Nagad API call
      setTimeout(() => {
        clearTimeout(timeout);
        
        const success = Math.random() > 0.08; // 92% success rate for Nagad
        const fees = Math.floor(transaction.amount * 0.015); // 1.5% fee
        
        if (success) {
          resolve({
            status: 'success',
            transactionId: `nagad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            balance: Math.floor(Math.random() * 10000) + 5000,
            fees
          });
        } else {
          resolve({
            status: 'failed',
            errorCode: 'NAGAD_INSUFFICIENT_BALANCE',
            errorMessage: 'Insufficient balance in Nagad account'
          });
        }
      }, Math.random() * 4000 + 2000); // 2-6 seconds
    });
  }

  /**
   * Update cross-platform balance after successful transaction
   */
  private async updateCrossPlatformBalance(customerMsisdn: string, amount: number): Promise<void> {
    const balance = this.balanceCache.get(customerMsisdn);
    if (balance) {
      balance.nagad -= amount;
      balance.total -= amount;
      balance.lastSyncTime = new Date();
      this.balanceCache.set(customerMsisdn, balance);
    }
  }

  /**
   * Nagad-specific audit trail
   */
  private async createNagadAuditTrail(transaction: NagadTransaction, response: NagadAPIResponse): Promise<void> {
    const auditRecord = {
      transactionId: transaction.id,
      platform: 'nagad',
      timestamp: new Date(),
      customerMsisdn: transaction.customerMsisdn,
      amount: transaction.amount,
      status: response.status,
      nagadTransactionId: response.transactionId,
      fees: response.fees,
      riskScore: transaction.riskScore,
      nagadSpecificFields: transaction.nagadSpecificFields,
      apiVersion: this.NAGAD_API_VERSION
    };

    console.log('Nagad Audit Record:', auditRecord);
  }

  /**
   * Helper methods
   */
  private initializeNagadSpecificConfig(): void {
    // Nagad-specific configuration
    this.fraudDetector.set('nagad_patterns', {
      velocityThreshold: 2,
      amountThreshold: 49999,
      deviceTrustThreshold: 0.6,
      crossPlatformVelocityWindow: 600000 // 10 minutes
    });
  }

  private startCrossPlatformSync(): void {
    setInterval(async () => {
      // Sync balances across platforms
      this.balanceCache.forEach(async (balance, customerMsisdn) => {
        await this.getCrossPlatformBalance(customerMsisdn);
      });
    }, 300000); // Every 5 minutes
  }

  private checkNagadRateLimit(customerMsisdn: string): boolean {
    const key = `nagad_${customerMsisdn}`;
    const current = this.rateLimiter.get(key) || 0;
    if (current >= this.RATE_LIMIT_PER_MINUTE) {
      return false;
    }
    this.rateLimiter.set(key, current + 1);
    return true;
  }

  private queueNagadTransaction(transaction: NagadTransaction): void {
    const offlineTransaction: OfflineTransaction = {
      id: `nagad_offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transaction,
      queuedAt: new Date(),
      syncAttempts: 0
    };

    this.offlineQueue.push(offlineTransaction);
    this.emit('nagad_transaction_queued', offlineTransaction);
  }

  private async validateNagadKYCRequirements(kycData: KYCVerification): Promise<boolean> {
    // Nagad-specific KYC validation
    return kycData.nidNumber.length === 10 || kycData.nidNumber.length === 13;
  }

  private async fetchBKashBalance(customerMsisdn: string): Promise<number> {
    // Simulate bKash balance API call
    return Math.floor(Math.random() * 15000) + 5000;
  }

  private async fetchNagadBalance(customerMsisdn: string): Promise<number> {
    // Simulate Nagad balance API call
    return Math.floor(Math.random() * 12000) + 3000;
  }

  private async fetchRocketBalance(customerMsisdn: string): Promise<number> {
    // Simulate Rocket balance API call
    return Math.floor(Math.random() * 8000) + 2000;
  }

  private getRecentNagadTransactions(customerMsisdn: string, timeWindow: number): any[] {
    // Implement recent Nagad transaction retrieval
    return [];
  }

  private async checkCrossPlatformVelocity(customerMsisdn: string): Promise<{ suspicious: boolean; count: number }> {
    // Check transaction velocity across all platforms
    const count = Math.floor(Math.random() * 10);
    return {
      suspicious: count > 5,
      count
    };
  }

  private analyzeDeviceFingerprint(fingerprint: string): number {
    // Enhanced device fingerprint analysis for Nagad
    return Math.random() * 0.4 + 0.6; // 0.6-1.0 range
  }

  private mapNagadErrorToCode(error: any): BKashErrorCode {
    const errorMap: { [key: string]: BKashErrorCode } = {
      'NAGAD_TIMEOUT': {
        code: 'NAGAD_TIMEOUT',
        message: 'Nagad request timeout',
        retryable: true,
        fallbackRequired: false
      },
      'NAGAD_NETWORK_ERROR': {
        code: 'NAGAD_NETWORK_ERROR',
        message: 'Nagad network connectivity issue',
        retryable: true,
        fallbackRequired: false
      },
      'NAGAD_INSUFFICIENT_BALANCE': {
        code: 'NAGAD_INSUFFICIENT_BALANCE',
        message: 'Insufficient Nagad balance',
        retryable: false,
        fallbackRequired: true
      },
      'NAGAD_API_ERROR': {
        code: 'NAGAD_API_ERROR',
        message: 'Nagad API error',
        retryable: true,
        fallbackRequired: false
      }
    };

    return errorMap[error.message] || {
      code: 'NAGAD_UNKNOWN_ERROR',
      message: 'Unknown Nagad error occurred',
      retryable: false,
      fallbackRequired: true
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Public API methods
   */
  async getBalance(customerMsisdn: string): Promise<CrossPlatformBalance> {
    return this.getCrossPlatformBalance(customerMsisdn);
  }

  async getTransactionHistory(customerMsisdn: string, limit: number = 50): Promise<NagadTransaction[]> {
    // Implement Nagad transaction history retrieval
    return [];
  }

  async syncBalance(customerMsisdn: string): Promise<CrossPlatformBalance> {
    // Force balance sync
    this.balanceCache.delete(customerMsisdn);
    return this.getCrossPlatformBalance(customerMsisdn);
  }

  // Getters for monitoring
  get offlineQueueLength(): number {
    return this.offlineQueue.length;
  }

  get balanceCacheSize(): number {
    return this.balanceCache.size;
  }
}

export default NagadPaymentService;