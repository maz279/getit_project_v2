/**
 * PaymentService - Unified Payment Processing Service
 * Consolidates all payment functionality
 * 
 * Consolidates:
 * - PaymentService.js
 * - payment/PaymentApiService.js
 * - Mobile banking services (bKash, Nagad, Rocket)
 * - All payment gateway integrations
 */

import ApiService from './ApiService';

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  isDefault: boolean;
  isActive: boolean;
  displayName: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  method: PaymentMethod;
  description: string;
  metadata: Record<string, any>;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethodId: string;
  customerId: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  cancelUrl?: string;
  clientSecret?: string;
  status: PaymentIntentStatus;
  createdAt: Date;
  expiresAt: Date;
}

interface RefundTransaction {
  id: string;
  originalTransactionId: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  gatewayRefundId?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface PaymentConfig {
  enabledProviders: PaymentProvider[];
  defaultCurrency: string;
  supportedCurrencies: string[];
  minimumAmount: number;
  maximumAmount: number;
  feesEnabled: boolean;
  feePercentage: number;
  fixedFee: number;
}

interface MobileBankingConfig {
  bkash: {
    enabled: boolean;
    sandbox: boolean;
    username: string;
    password: string;
    appKey: string;
    appSecret: string;
  };
  nagad: {
    enabled: boolean;
    sandbox: boolean;
    merchantId: string;
    merchantPrivateKey: string;
    pgPublicKey: string;
  };
  rocket: {
    enabled: boolean;
    sandbox: boolean;
    merchantId: string;
    merchantPassword: string;
  };
}

type PaymentMethodType = 'credit_card' | 'debit_card' | 'mobile_banking' | 'bank_transfer' | 'digital_wallet' | 'cash_on_delivery';
type PaymentProvider = 'stripe' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'aamarpay' | 'shurjopay' | 'paypal' | 'razorpay';
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
type PaymentType = 'purchase' | 'subscription' | 'refund' | 'payout' | 'fee' | 'adjustment';
type PaymentIntentStatus = 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'cancelled';
type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  successRate: number;
  averageAmount: number;
  popularMethods: Array<{
    method: PaymentMethodType;
    count: number;
    percentage: number;
  }>;
}

class PaymentService {
  private static instance: PaymentService;
  private config: PaymentConfig;
  private mobileBankingConfig: MobileBankingConfig;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = {
      enabledProviders: ['stripe', 'bkash', 'nagad', 'rocket', 'sslcommerz'],
      defaultCurrency: 'BDT',
      supportedCurrencies: ['BDT', 'USD', 'EUR'],
      minimumAmount: 10,
      maximumAmount: 1000000,
      feesEnabled: true,
      feePercentage: 2.5,
      fixedFee: 5,
    };

    this.mobileBankingConfig = {
      bkash: {
        enabled: true,
        sandbox: process.env.NODE_ENV === 'development',
        username: process.env.REACT_APP_BKASH_USERNAME || '',
        password: process.env.REACT_APP_BKASH_PASSWORD || '',
        appKey: process.env.REACT_APP_BKASH_APP_KEY || '',
        appSecret: process.env.REACT_APP_BKASH_APP_SECRET || '',
      },
      nagad: {
        enabled: true,
        sandbox: process.env.NODE_ENV === 'development',
        merchantId: process.env.REACT_APP_NAGAD_MERCHANT_ID || '',
        merchantPrivateKey: process.env.REACT_APP_NAGAD_PRIVATE_KEY || '',
        pgPublicKey: process.env.REACT_APP_NAGAD_PG_PUBLIC_KEY || '',
      },
      rocket: {
        enabled: true,
        sandbox: process.env.NODE_ENV === 'development',
        merchantId: process.env.REACT_APP_ROCKET_MERCHANT_ID || '',
        merchantPassword: process.env.REACT_APP_ROCKET_PASSWORD || '',
      },
    };

    this.initializeService();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private async initializeService(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load configuration from server
      const configResponse = await ApiService.get('/payments/config');
      if (configResponse.status === 200) {
        this.config = { ...this.config, ...configResponse.data };
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing payment service:', error);
    }
  }

  // Payment method management
  public async addPaymentMethod(userId: string, methodData: {
    type: PaymentMethodType;
    provider: PaymentProvider;
    metadata: Record<string, any>;
  }): Promise<{ success: boolean; method?: PaymentMethod; error?: string }> {
    try {
      const response = await ApiService.post('/payments/methods', {
        userId,
        ...methodData,
      });

      if (response.status === 201) {
        return { success: true, method: response.data };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await ApiService.get(`/payments/methods/${userId}`);
      return response.status === 200 ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  public async updatePaymentMethod(methodId: string, updates: Partial<PaymentMethod>): Promise<{ success: boolean; method?: PaymentMethod; error?: string }> {
    try {
      const response = await ApiService.put(`/payments/methods/${methodId}`, updates);
      
      if (response.status === 200) {
        return { success: true, method: response.data };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async deletePaymentMethod(methodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.delete(`/payments/methods/${methodId}`);
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async setDefaultPaymentMethod(userId: string, methodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.put(`/payments/methods/${methodId}/default`, { userId });
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Payment processing
  public async createPaymentIntent(data: {
    amount: number;
    currency: string;
    description: string;
    paymentMethodId: string;
    customerId: string;
    metadata?: Record<string, any>;
    returnUrl?: string;
    cancelUrl?: string;
  }): Promise<{ success: boolean; intent?: PaymentIntent; error?: string }> {
    try {
      const response = await ApiService.post('/payments/intents', data);
      
      if (response.status === 201) {
        return { success: true, intent: response.data };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async confirmPaymentIntent(intentId: string, paymentMethodId?: string): Promise<{ success: boolean; transaction?: PaymentTransaction; error?: string }> {
    try {
      const response = await ApiService.post(`/payments/intents/${intentId}/confirm`, {
        paymentMethodId,
      });
      
      if (response.status === 200) {
        return { success: true, transaction: response.data };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async processPayment(data: {
    amount: number;
    currency: string;
    description: string;
    paymentMethodId: string;
    customerId: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; transaction?: PaymentTransaction; error?: string }> {
    try {
      const response = await ApiService.post('/payments/process', data);
      
      if (response.status === 200) {
        return { success: true, transaction: response.data };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mobile banking specific methods
  public async processBkashPayment(data: {
    amount: number;
    currency: string;
    description: string;
    customerId: string;
    callbackUrl?: string;
  }): Promise<{ success: boolean; redirectUrl?: string; transaction?: PaymentTransaction; error?: string }> {
    try {
      const response = await ApiService.post('/payments/bkash/process', {
        ...data,
        config: this.mobileBankingConfig.bkash,
      });
      
      if (response.status === 200) {
        return { 
          success: true, 
          redirectUrl: response.data.redirectUrl,
          transaction: response.data.transaction 
        };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async processNagadPayment(data: {
    amount: number;
    currency: string;
    description: string;
    customerId: string;
    callbackUrl?: string;
  }): Promise<{ success: boolean; redirectUrl?: string; transaction?: PaymentTransaction; error?: string }> {
    try {
      const response = await ApiService.post('/payments/nagad/process', {
        ...data,
        config: this.mobileBankingConfig.nagad,
      });
      
      if (response.status === 200) {
        return { 
          success: true, 
          redirectUrl: response.data.redirectUrl,
          transaction: response.data.transaction 
        };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async processRocketPayment(data: {
    amount: number;
    currency: string;
    description: string;
    customerId: string;
    callbackUrl?: string;
  }): Promise<{ success: boolean; redirectUrl?: string; transaction?: PaymentTransaction; error?: string }> {
    try {
      const response = await ApiService.post('/payments/rocket/process', {
        ...data,
        config: this.mobileBankingConfig.rocket,
      });
      
      if (response.status === 200) {
        return { 
          success: true, 
          redirectUrl: response.data.redirectUrl,
          transaction: response.data.transaction 
        };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Transaction management
  public async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const response = await ApiService.get(`/payments/transactions/${transactionId}`);
      return response.status === 200 ? response.data : null;
    } catch (error) {
      return null;
    }
  }

  public async getTransactions(userId: string, filters?: {
    status?: PaymentStatus;
    type?: PaymentType;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaymentTransaction[]> {
    try {
      const response = await ApiService.get(`/payments/transactions/user/${userId}`, {
        params: filters,
      });
      return response.status === 200 ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  public async cancelTransaction(transactionId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post(`/payments/transactions/${transactionId}/cancel`, {
        reason,
      });
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Refund management
  public async createRefund(data: {
    transactionId: string;
    amount?: number;
    reason: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; refund?: RefundTransaction; error?: string }> {
    try {
      const response = await ApiService.post('/payments/refunds', data);
      
      if (response.status === 201) {
        return { success: true, refund: response.data };
      }

      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async getRefund(refundId: string): Promise<RefundTransaction | null> {
    try {
      const response = await ApiService.get(`/payments/refunds/${refundId}`);
      return response.status === 200 ? response.data : null;
    } catch (error) {
      return null;
    }
  }

  public async getRefunds(transactionId: string): Promise<RefundTransaction[]> {
    try {
      const response = await ApiService.get(`/payments/refunds/transaction/${transactionId}`);
      return response.status === 200 ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  // Webhook handling
  public async handleWebhook(provider: PaymentProvider, payload: any, signature: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.post(`/payments/webhooks/${provider}`, payload, {
        headers: {
          'X-Webhook-Signature': signature,
        },
      });
      
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Payment validation
  public validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
    if (amount < this.config.minimumAmount) {
      return { valid: false, error: `Minimum amount is ${this.config.minimumAmount}` };
    }
    
    if (amount > this.config.maximumAmount) {
      return { valid: false, error: `Maximum amount is ${this.config.maximumAmount}` };
    }
    
    return { valid: true };
  }

  public validateCurrency(currency: string): { valid: boolean; error?: string } {
    if (!this.config.supportedCurrencies.includes(currency)) {
      return { valid: false, error: `Currency ${currency} is not supported` };
    }
    
    return { valid: true };
  }

  public calculateFees(amount: number): { fees: number; total: number } {
    if (!this.config.feesEnabled) {
      return { fees: 0, total: amount };
    }
    
    const percentageFee = (amount * this.config.feePercentage) / 100;
    const totalFees = percentageFee + this.config.fixedFee;
    
    return {
      fees: Math.round(totalFees * 100) / 100,
      total: Math.round((amount + totalFees) * 100) / 100,
    };
  }

  // Analytics and reporting
  public async getPaymentStats(userId?: string, startDate?: string, endDate?: string): Promise<PaymentStats> {
    try {
      const response = await ApiService.get('/payments/stats', {
        params: { userId, startDate, endDate },
      });
      
      return response.status === 200 ? response.data : this.getDefaultStats();
    } catch (error) {
      return this.getDefaultStats();
    }
  }

  public async getRevenueReport(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await ApiService.get('/payments/revenue', {
        params: { startDate, endDate },
      });
      return response.status === 200 ? response.data : null;
    } catch (error) {
      return null;
    }
  }

  // Configuration management
  public updateConfig(config: Partial<PaymentConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public updateMobileBankingConfig(config: Partial<MobileBankingConfig>): void {
    this.mobileBankingConfig = { ...this.mobileBankingConfig, ...config };
  }

  public getConfig(): PaymentConfig {
    return { ...this.config };
  }

  public getMobileBankingConfig(): MobileBankingConfig {
    return { ...this.mobileBankingConfig };
  }

  public getEnabledProviders(): PaymentProvider[] {
    return this.config.enabledProviders;
  }

  public isProviderEnabled(provider: PaymentProvider): boolean {
    return this.config.enabledProviders.includes(provider);
  }

  // Helper methods
  private getDefaultStats(): PaymentStats {
    return {
      totalTransactions: 0,
      totalAmount: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      refundedTransactions: 0,
      successRate: 0,
      averageAmount: 0,
      popularMethods: [],
    };
  }

  public formatAmount(amount: number, currency: string = this.config.defaultCurrency): string {
    const formatter = new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  }

  public getPaymentMethodIcon(type: PaymentMethodType): string {
    const icons = {
      credit_card: '💳',
      debit_card: '💳',
      mobile_banking: '📱',
      bank_transfer: '🏦',
      digital_wallet: '💰',
      cash_on_delivery: '💵',
    };
    
    return icons[type] || '💳';
  }
}

export default PaymentService.getInstance();
export {
  PaymentService,
  PaymentMethod,
  PaymentTransaction,
  PaymentIntent,
  RefundTransaction,
  PaymentConfig,
  MobileBankingConfig,
  PaymentMethodType,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PaymentIntentStatus,
  RefundStatus,
  PaymentStats,
};