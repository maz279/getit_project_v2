/**
 * PaymentService - Complete payment processing with mobile banking (bKash, Nagad, Rocket) and refund management
 */

import ApiService from './ApiService';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_banking' | 'bank_transfer' | 'cash_on_delivery';
  provider: 'bkash' | 'nagad' | 'rocket' | 'visa' | 'mastercard' | 'bank';
  name: string;
  details: {
    card?: {
      lastFour: string;
      expiryMonth: number;
      expiryYear: number;
      brand: string;
    };
    mobileBanking?: {
      phoneNumber: string;
      accountType: 'personal' | 'merchant';
    };
    bankTransfer?: {
      accountNumber: string;
      bankName: string;
      routingNumber: string;
    };
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  webhookUrl?: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: PaymentMethod;
  orderId: string;
  customerId: string;
  transactionId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason: string;
  metadata?: Record<string, any>;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reason: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MobileBankingConfig {
  bkash: {
    appKey: string;
    appSecret: string;
    username: string;
    password: string;
    baseUrl: string;
    sandboxMode: boolean;
  };
  nagad: {
    merchantId: string;
    publicKey: string;
    privateKey: string;
    baseUrl: string;
    sandboxMode: boolean;
  };
  rocket: {
    merchantId: string;
    apiKey: string;
    secretKey: string;
    baseUrl: string;
    sandboxMode: boolean;
  };
}

export interface PaymentWebhook {
  id: string;
  event: 'payment.completed' | 'payment.failed' | 'refund.completed' | 'refund.failed';
  paymentId: string;
  data: Payment | Refund;
  timestamp: string;
  signature: string;
}

class PaymentService {
  private static instance: PaymentService;
  private apiService: typeof ApiService;
  private config: MobileBankingConfig | null = null;
  private webhookListeners: Map<string, Array<(webhook: PaymentWebhook) => void>> = new Map();

  private constructor() {
    this.apiService = ApiService;
    this.initializeConfig();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Process payment
   */
  public async processPayment(request: PaymentRequest): Promise<Payment> {
    const response = await this.apiService.post('/payments/process', request);
    return response.data;
  }

  /**
   * Create payment intent
   */
  public async createPaymentIntent(request: PaymentRequest): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const response = await this.apiService.post('/payments/intent', request);
    return response.data;
  }

  /**
   * Confirm payment
   */
  public async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<Payment> {
    const response = await this.apiService.post(`/payments/intent/${paymentIntentId}/confirm`, {
      paymentMethodId
    });
    return response.data;
  }

  /**
   * Get payment details
   */
  public async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      const response = await this.apiService.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get payment history
   */
  public async getPaymentHistory(
    customerId?: string,
    orderId?: string,
    status?: string,
    limit?: number,
    offset?: number
  ): Promise<{ payments: Payment[]; total: number }> {
    const response = await this.apiService.get('/payments', {
      customerId,
      orderId,
      status,
      limit,
      offset
    });
    return response.data;
  }

  /**
   * Cancel payment
   */
  public async cancelPayment(paymentId: string, reason?: string): Promise<Payment> {
    const response = await this.apiService.post(`/payments/${paymentId}/cancel`, { reason });
    return response.data;
  }

  /**
   * Process refund
   */
  public async processRefund(request: RefundRequest): Promise<Refund> {
    const response = await this.apiService.post('/payments/refund', request);
    return response.data;
  }

  /**
   * Get refund details
   */
  public async getRefund(refundId: string): Promise<Refund | null> {
    try {
      const response = await this.apiService.get(`/payments/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get refund history
   */
  public async getRefundHistory(
    paymentId?: string,
    customerId?: string,
    limit?: number,
    offset?: number
  ): Promise<{ refunds: Refund[]; total: number }> {
    const response = await this.apiService.get('/payments/refunds', {
      paymentId,
      customerId,
      limit,
      offset
    });
    return response.data;
  }

  /**
   * Add payment method
   */
  public async addPaymentMethod(
    customerId: string,
    method: Omit<PaymentMethod, 'id' | 'createdAt' | 'isActive'>
  ): Promise<PaymentMethod> {
    const response = await this.apiService.post(`/customers/${customerId}/payment-methods`, method);
    return response.data;
  }

  /**
   * Update payment method
   */
  public async updatePaymentMethod(
    customerId: string,
    methodId: string,
    updates: Partial<PaymentMethod>
  ): Promise<PaymentMethod> {
    const response = await this.apiService.put(`/customers/${customerId}/payment-methods/${methodId}`, updates);
    return response.data;
  }

  /**
   * Delete payment method
   */
  public async deletePaymentMethod(customerId: string, methodId: string): Promise<void> {
    await this.apiService.delete(`/customers/${customerId}/payment-methods/${methodId}`);
  }

  /**
   * Get customer payment methods
   */
  public async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const response = await this.apiService.get(`/customers/${customerId}/payment-methods`);
    return response.data;
  }

  /**
   * Set default payment method
   */
  public async setDefaultPaymentMethod(customerId: string, methodId: string): Promise<PaymentMethod> {
    const response = await this.apiService.post(`/customers/${customerId}/payment-methods/${methodId}/default`);
    return response.data;
  }

  /**
   * Process bKash payment
   */
  public async processBkashPayment(
    amount: number,
    orderId: string,
    customerId: string,
    phoneNumber: string
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    const response = await this.apiService.post('/payments/bkash/create', {
      amount,
      orderId,
      customerId,
      phoneNumber
    });
    return response.data;
  }

  /**
   * Execute bKash payment
   */
  public async executeBkashPayment(paymentId: string): Promise<Payment> {
    const response = await this.apiService.post(`/payments/bkash/${paymentId}/execute`);
    return response.data;
  }

  /**
   * Process Nagad payment
   */
  public async processNagadPayment(
    amount: number,
    orderId: string,
    customerId: string,
    phoneNumber: string
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    const response = await this.apiService.post('/payments/nagad/create', {
      amount,
      orderId,
      customerId,
      phoneNumber
    });
    return response.data;
  }

  /**
   * Process Rocket payment
   */
  public async processRocketPayment(
    amount: number,
    orderId: string,
    customerId: string,
    phoneNumber: string
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    const response = await this.apiService.post('/payments/rocket/create', {
      amount,
      orderId,
      customerId,
      phoneNumber
    });
    return response.data;
  }

  /**
   * Verify mobile banking payment
   */
  public async verifyMobileBankingPayment(
    provider: 'bkash' | 'nagad' | 'rocket',
    paymentId: string,
    transactionId: string
  ): Promise<Payment> {
    const response = await this.apiService.post(`/payments/${provider}/verify`, {
      paymentId,
      transactionId
    });
    return response.data;
  }

  /**
   * Get payment analytics
   */
  public async getPaymentAnalytics(
    startDate: string,
    endDate: string,
    groupBy?: 'day' | 'week' | 'month' | 'method' | 'status'
  ): Promise<any> {
    const response = await this.apiService.get('/payments/analytics', {
      startDate,
      endDate,
      groupBy
    });
    return response.data;
  }

  /**
   * Get payment fees
   */
  public async getPaymentFees(
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<{ fees: number; total: number; breakdown: Record<string, number> }> {
    const response = await this.apiService.get('/payments/fees', {
      amount,
      currency,
      paymentMethod
    });
    return response.data;
  }

  /**
   * Validate payment method
   */
  public async validatePaymentMethod(methodId: string): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await this.apiService.post(`/payments/validate/${methodId}`);
    return response.data;
  }

  /**
   * Setup webhook
   */
  public async setupWebhook(url: string, events: string[]): Promise<{ webhookId: string; secret: string }> {
    const response = await this.apiService.post('/payments/webhooks', { url, events });
    return response.data;
  }

  /**
   * Verify webhook signature
   */
  public verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementation would verify the webhook signature
    // This is a simplified version
    return true;
  }

  /**
   * Handle webhook
   */
  public async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      const webhook: PaymentWebhook = JSON.parse(payload);
      
      // Verify signature
      if (!this.verifyWebhookSignature(payload, signature, 'webhook_secret')) {
        throw new Error('Invalid webhook signature');
      }

      // Notify listeners
      const listeners = this.webhookListeners.get(webhook.event) || [];
      listeners.forEach(listener => listener(webhook));
    } catch (error) {
      console.error('Failed to handle webhook:', error);
      throw error;
    }
  }

  /**
   * Subscribe to webhook events
   */
  public subscribeToWebhook(
    event: string,
    listener: (webhook: PaymentWebhook) => void
  ): () => void {
    if (!this.webhookListeners.has(event)) {
      this.webhookListeners.set(event, []);
    }
    
    this.webhookListeners.get(event)!.push(listener);
    
    return () => {
      const listeners = this.webhookListeners.get(event) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Generate payment receipt
   */
  public async generateReceipt(paymentId: string): Promise<{ receiptUrl: string; receiptData: any }> {
    const response = await this.apiService.post(`/payments/${paymentId}/receipt`);
    return response.data;
  }

  /**
   * Send payment receipt
   */
  public async sendReceipt(paymentId: string, email: string): Promise<void> {
    await this.apiService.post(`/payments/${paymentId}/receipt/send`, { email });
  }

  /**
   * Get supported payment methods
   */
  public async getSupportedPaymentMethods(
    country?: string,
    currency?: string
  ): Promise<{ methods: Array<{ type: string; provider: string; name: string; supported: boolean }> }> {
    const response = await this.apiService.get('/payments/supported-methods', {
      country,
      currency
    });
    return response.data;
  }

  /**
   * Get exchange rates
   */
  public async getExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
    const response = await this.apiService.get('/payments/exchange-rates', { baseCurrency });
    return response.data;
  }

  /**
   * Convert currency
   */
  public async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{ convertedAmount: number; rate: number; fees: number }> {
    const response = await this.apiService.post('/payments/convert', {
      amount,
      fromCurrency,
      toCurrency
    });
    return response.data;
  }

  /**
   * Initialize configuration
   */
  private async initializeConfig(): Promise<void> {
    try {
      const response = await this.apiService.get('/payments/config');
      this.config = response.data;
    } catch (error) {
      console.error('Failed to initialize payment configuration:', error);
    }
  }

  /**
   * Get configuration
   */
  public getConfig(): MobileBankingConfig | null {
    return this.config;
  }

  /**
   * Update configuration
   */
  public async updateConfig(config: Partial<MobileBankingConfig>): Promise<void> {
    await this.apiService.put('/payments/config', config);
    this.config = { ...this.config, ...config } as MobileBankingConfig;
  }
}

export default PaymentService.getInstance();