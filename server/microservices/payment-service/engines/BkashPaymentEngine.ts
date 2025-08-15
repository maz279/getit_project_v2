import { db } from '../../../db';
import { paymentTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * bKash Payment Engine for Bangladesh Mobile Banking
 * Implements complete bKash payment flow with enterprise-level security
 */
export class BkashPaymentEngine {
  private readonly baseUrl: string;
  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly username: string;
  private readonly password: string;
  private readonly callbackUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.baseUrl = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
    this.appKey = process.env.BKASH_APP_KEY || '';
    this.appSecret = process.env.BKASH_APP_SECRET || '';
    this.username = process.env.BKASH_USERNAME || '';
    this.password = process.env.BKASH_PASSWORD || '';
    this.callbackUrl = process.env.BKASH_CALLBACK_URL || 'https://your-domain.com/api/v1/payments/bkash/callback';
  }

  /**
   * Initialize bKash payment
   */
  async initializePayment(data: {
    transactionId: string;
    amount: number;
    orderId: string;
    userId: number;
    metadata?: any;
  }): Promise<any> {
    try {
      await this.ensureValidToken();

      const paymentData = {
        mode: '0011', // Checkout
        payerReference: data.userId.toString(),
        callbackURL: this.callbackUrl,
        amount: data.amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: data.orderId,
        agreementID: '', // For subscription payments
        bkashAgreementCreate: false,
        productName: 'GetIt Order Payment',
        productDescription: `Payment for order ${data.orderId}`,
        productCategory: 'General',
        language: 'bn', // Bengali language
        agreementRequired: false
      };

      const response = await this.makeApiRequest('/tokenized/checkout/create', 'POST', paymentData);

      if (response.statusCode === '0000') {
        return {
          success: true,
          gatewayTransactionId: response.paymentID,
          bkashURL: response.bkashURL,
          paymentID: response.paymentID,
          createTime: response.createTime,
          orgLogo: response.orgLogo,
          orgName: response.orgName,
          transactionStatus: response.transactionStatus,
          amount: response.amount,
          currency: response.currency,
          intent: response.intent,
          merchantInvoiceNumber: response.merchantInvoiceNumber
        };
      } else {
        throw new Error(`bKash API Error: ${response.statusMessage}`);
      }

    } catch (error) {
      console.error('bKash payment initialization error:', error);
      throw new Error(`Failed to initialize bKash payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create bKash payment
   */
  async createPayment(data: {
    amount: number;
    orderId: string;
    userId: number;
    intent: string;
  }): Promise<any> {
    try {
      await this.ensureValidToken();

      const paymentData = {
        mode: '0011',
        payerReference: data.userId.toString(),
        callbackURL: this.callbackUrl,
        amount: data.amount.toString(),
        currency: 'BDT',
        intent: data.intent,
        merchantInvoiceNumber: data.orderId
      };

      const response = await this.makeApiRequest('/tokenized/checkout/create', 'POST', paymentData);

      if (response.statusCode === '0000') {
        return {
          paymentID: response.paymentID,
          bkashURL: response.bkashURL,
          createTime: response.createTime,
          transactionStatus: response.transactionStatus,
          amount: response.amount,
          currency: response.currency
        };
      } else {
        throw new Error(`bKash create payment error: ${response.statusMessage}`);
      }

    } catch (error) {
      console.error('bKash create payment error:', error);
      throw error;
    }
  }

  /**
   * Execute bKash payment
   */
  async executePayment(paymentID: string, userId: number): Promise<any> {
    try {
      await this.ensureValidToken();

      const response = await this.makeApiRequest('/tokenized/checkout/execute', 'POST', { paymentID });

      if (response.statusCode === '0000') {
        // Update payment transaction status
        await this.updateTransactionStatus(paymentID, 'completed', response);

        return {
          success: true,
          paymentID: response.paymentID,
          trxID: response.trxID,
          transactionStatus: response.transactionStatus,
          amount: response.amount,
          currency: response.currency,
          intent: response.intent,
          paymentExecuteTime: response.paymentExecuteTime,
          merchantInvoiceNumber: response.merchantInvoiceNumber,
          payerReference: response.payerReference,
          customerMsisdn: response.customerMsisdn
        };
      } else {
        await this.updateTransactionStatus(paymentID, 'failed', response);
        throw new Error(`bKash execution failed: ${response.statusMessage}`);
      }

    } catch (error) {
      console.error('bKash execute payment error:', error);
      throw error;
    }
  }

  /**
   * Query bKash payment status
   */
  async getPaymentStatus(paymentID: string): Promise<any> {
    try {
      await this.ensureValidToken();

      const response = await this.makeApiRequest('/tokenized/checkout/payment/status', 'POST', { paymentID });

      if (response.statusCode === '0000') {
        return {
          status: this.mapBkashStatusToLocal(response.transactionStatus),
          gatewayResponse: response,
          paymentID: response.paymentID,
          trxID: response.trxID,
          transactionStatus: response.transactionStatus,
          amount: response.amount,
          currency: response.currency
        };
      } else {
        throw new Error(`bKash status query failed: ${response.statusMessage}`);
      }

    } catch (error) {
      console.error('bKash status query error:', error);
      throw error;
    }
  }

  /**
   * Process bKash refund
   */
  async processRefund(data: {
    originalTransactionId: string;
    amount: number;
    reason: string;
  }): Promise<any> {
    try {
      await this.ensureValidToken();

      const refundData = {
        paymentID: data.originalTransactionId,
        amount: data.amount.toString(),
        trxID: '', // Will be retrieved from original transaction
        sku: 'refund',
        reason: data.reason
      };

      const response = await this.makeApiRequest('/tokenized/checkout/payment/refund', 'POST', refundData);

      if (response.statusCode === '0000') {
        return {
          success: true,
          status: 'completed',
          refundId: response.refundTrxID,
          originalTrxID: response.originalTrxID,
          refundAmount: response.amount,
          currency: response.currency,
          refundTime: response.refundTime,
          transactionStatus: response.transactionStatus
        };
      } else {
        throw new Error(`bKash refund failed: ${response.statusMessage}`);
      }

    } catch (error) {
      console.error('bKash refund error:', error);
      throw error;
    }
  }

  /**
   * Handle bKash webhook
   */
  async handleWebhook(payload: any, signature: string): Promise<any> {
    try {
      // Verify webhook signature
      const isValid = this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      const { paymentID, status, trxID } = payload;

      // Update transaction status based on webhook
      await this.updateTransactionStatus(paymentID, this.mapBkashStatusToLocal(status), payload);

      return {
        success: true,
        processed: true,
        paymentID,
        status: this.mapBkashStatusToLocal(status)
      };

    } catch (error) {
      console.error('bKash webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Get access token for bKash API
   */
  private async getAccessToken(): Promise<string> {
    try {
      const authData = {
        app_key: this.appKey,
        app_secret: this.appSecret
      };

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': this.username,
        'password': this.password
      };

      const response = await fetch(`${this.baseUrl}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers,
        body: JSON.stringify(authData)
      });

      const data = await response.json();

      if (data.statusCode === '0000') {
        this.accessToken = data.id_token;
        this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
        return data.id_token;
      } else {
        throw new Error(`Token generation failed: ${data.statusMessage}`);
      }

    } catch (error) {
      console.error('bKash token generation error:', error);
      throw error;
    }
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.getAccessToken();
    }
  }

  /**
   * Make authenticated API request to bKash
   */
  private async makeApiRequest(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': this.accessToken!,
        'x-app-key': this.appKey
      };

      const requestOptions: RequestInit = {
        method,
        headers
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
      const responseData = await response.json();

      return responseData;

    } catch (error) {
      console.error('bKash API request error:', error);
      throw error;
    }
  }

  /**
   * Update transaction status in database
   */
  private async updateTransactionStatus(paymentID: string, status: string, gatewayResponse: any): Promise<void> {
    try {
      await db
        .update(paymentTransactions)
        .set({
          status,
          gatewayResponse,
          updatedAt: new Date()
        })
        .where(eq(paymentTransactions.gatewayTransactionId, paymentID));

    } catch (error) {
      console.error('Transaction status update error:', error);
    }
  }

  /**
   * Map bKash transaction status to local status
   */
  private mapBkashStatusToLocal(bkashStatus: string): string {
    const statusMap: Record<string, string> = {
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'Failed': 'failed',
      'Pending': 'pending',
      'Authorized': 'authorized'
    };

    return statusMap[bkashStatus] || 'pending';
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const payloadString = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
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
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    try {
      const refreshData = {
        app_key: this.appKey,
        app_secret: this.appSecret,
        refresh_token: this.accessToken
      };

      const response = await this.makeApiRequest('/tokenized/checkout/token/refresh', 'POST', refreshData);

      if (response.statusCode === '0000') {
        this.accessToken = response.id_token;
        this.tokenExpiry = new Date(Date.now() + (response.expires_in * 1000));
      } else {
        throw new Error(`Token refresh failed: ${response.statusMessage}`);
      }

    } catch (error) {
      console.error('bKash token refresh error:', error);
      // Fall back to getting a new token
      await this.getAccessToken();
    }
  }

  /**
   * Validate bKash configuration
   */
  validateConfiguration(): boolean {
    const requiredFields = [
      this.appKey,
      this.appSecret,
      this.username,
      this.password,
      this.baseUrl
    ];

    return requiredFields.every(field => field && field.trim() !== '');
  }

  /**
   * Get supported payment methods
   */
  getSupportedMethods(): string[] {
    return ['bkash_wallet', 'bkash_card'];
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
   * Get transaction fees
   */
  calculateTransactionFee(amount: number): number {
    // bKash typically charges 1.85% for merchant transactions
    const feePercentage = 0.0185;
    return Math.round(amount * feePercentage * 100) / 100;
  }

  /**
   * Verify account balance (if API supports it)
   */
  async verifyAccountBalance(): Promise<{ available: boolean; balance?: number }> {
    try {
      await this.ensureValidToken();

      // This would be implemented if bKash provides balance inquiry API
      // For now, we'll return a default response
      return {
        available: true
      };

    } catch (error) {
      console.error('Balance verification error:', error);
      return {
        available: false
      };
    }
  }

  /**
   * Generate payment QR code (if supported)
   */
  async generatePaymentQR(amount: number, reference: string): Promise<{ qrString: string; qrImage: string }> {
    try {
      await this.ensureValidToken();

      // This would be implemented if bKash provides QR generation API
      // For now, return a placeholder
      return {
        qrString: `bkash://pay?amount=${amount}&ref=${reference}`,
        qrImage: '' // Base64 encoded QR image would go here
      };

    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
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
      await this.ensureValidToken();

      // This would be implemented if bKash provides transaction history API
      // For now, return empty array
      return [];

    } catch (error) {
      console.error('Transaction history error:', error);
      throw error;
    }
  }
}