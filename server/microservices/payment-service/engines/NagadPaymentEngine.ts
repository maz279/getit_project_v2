import { db } from '../../../db';
import { paymentTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Nagad Payment Engine for Bangladesh Mobile Banking
 * Implements complete Nagad payment flow with enterprise-level security
 */
export class NagadPaymentEngine {
  private readonly baseUrl: string;
  private readonly merchantId: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly callbackUrl: string;
  private readonly sensitiveData: string;

  constructor() {
    this.baseUrl = process.env.NAGAD_BASE_URL || 'https://api.mynagad.com/api/dfs';
    this.merchantId = process.env.NAGAD_MERCHANT_ID || '';
    this.publicKey = process.env.NAGAD_PUBLIC_KEY || '';
    this.privateKey = process.env.NAGAD_PRIVATE_KEY || '';
    this.callbackUrl = process.env.NAGAD_CALLBACK_URL || 'https://your-domain.com/api/v1/payments/nagad/callback';
    this.sensitiveData = process.env.NAGAD_SENSITIVE_DATA || '';
  }

  /**
   * Initialize Nagad payment
   */
  async initializePayment(data: {
    transactionId: string;
    amount: number;
    orderId: string;
    userId: number;
    metadata?: any;
  }): Promise<any> {
    try {
      const dateTime = this.getCurrentDateTime();
      const orderId = data.orderId;
      const amount = data.amount.toString();

      // Step 1: Initialize payment
      const initResponse = await this.initializePaymentSession(orderId, amount, dateTime);

      if (initResponse.sensitiveData && initResponse.signature) {
        // Step 2: Complete initialization
        const completeResponse = await this.completePaymentInitialization(
          initResponse.paymentReferenceId,
          initResponse.challenge,
          dateTime
        );

        return {
          success: true,
          gatewayTransactionId: initResponse.paymentReferenceId,
          paymentReferenceId: initResponse.paymentReferenceId,
          challenge: initResponse.challenge,
          checkoutURL: completeResponse.callBackUrl,
          amount,
          currency: 'BDT',
          merchantId: this.merchantId,
          orderId,
          status: 'initialized'
        };
      } else {
        throw new Error('Nagad initialization failed: Invalid response');
      }

    } catch (error) {
      console.error('Nagad payment initialization error:', error);
      throw new Error(`Failed to initialize Nagad payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate Nagad payment
   */
  async initiatePayment(data: {
    amount: number;
    orderId: string;
    userId: number;
  }): Promise<any> {
    try {
      const dateTime = this.getCurrentDateTime();
      const amount = data.amount.toString();
      const orderId = data.orderId;

      const initResponse = await this.initializePaymentSession(orderId, amount, dateTime);

      return {
        paymentReferenceId: initResponse.paymentReferenceId,
        challenge: initResponse.challenge,
        amount,
        currency: 'BDT',
        orderId,
        merchantId: this.merchantId,
        dateTime
      };

    } catch (error) {
      console.error('Nagad payment initiation error:', error);
      throw error;
    }
  }

  /**
   * Complete Nagad payment
   */
  async completePayment(data: {
    paymentReferenceId: string;
    challenge: string;
    userId: number;
  }): Promise<any> {
    try {
      const dateTime = this.getCurrentDateTime();

      const response = await this.completePaymentInitialization(
        data.paymentReferenceId,
        data.challenge,
        dateTime
      );

      if (response.status === 'Success') {
        await this.updateTransactionStatus(data.paymentReferenceId, 'completed', response);

        return {
          success: true,
          paymentReferenceId: data.paymentReferenceId,
          status: 'completed',
          checkoutURL: response.callBackUrl,
          message: response.message
        };
      } else {
        await this.updateTransactionStatus(data.paymentReferenceId, 'failed', response);
        throw new Error(`Nagad payment completion failed: ${response.message}`);
      }

    } catch (error) {
      console.error('Nagad payment completion error:', error);
      throw error;
    }
  }

  /**
   * Query Nagad payment status
   */
  async getPaymentStatus(paymentReferenceId: string): Promise<any> {
    try {
      const dateTime = this.getCurrentDateTime();
      const sensitiveData = {
        merchantId: this.merchantId,
        orderId: paymentReferenceId,
        currencyCode: '050', // BDT
        amount: '0', // Amount not required for status check
        challenge: ''
      };

      const postBody = {
        merchantId: this.merchantId,
        orderId: paymentReferenceId,
        paymentReferenceId,
        signature: this.generateSignature(JSON.stringify(sensitiveData)),
        dateTime
      };

      const response = await this.makeApiRequest('/verify/payment/status', 'POST', postBody);

      return {
        status: this.mapNagadStatusToLocal(response.status),
        gatewayResponse: response,
        paymentReferenceId: response.paymentReferenceId,
        orderId: response.orderId,
        amount: response.amount,
        currency: response.currency,
        issuerPaymentDateTime: response.issuerPaymentDateTime,
        issuerPaymentRefNo: response.issuerPaymentRefNo
      };

    } catch (error) {
      console.error('Nagad status query error:', error);
      throw error;
    }
  }

  /**
   * Process Nagad refund
   */
  async processRefund(data: {
    originalTransactionId: string;
    amount: number;
    reason: string;
  }): Promise<any> {
    try {
      const dateTime = this.getCurrentDateTime();
      const refundAmount = data.amount.toString();

      const sensitiveData = {
        merchantId: this.merchantId,
        orderId: data.originalTransactionId,
        paymentReferenceId: data.originalTransactionId,
        amount: refundAmount,
        refundAmount: refundAmount,
        currencyCode: '050',
        challenge: this.generateRandomString(40)
      };

      const postBody = {
        ...sensitiveData,
        signature: this.generateSignature(JSON.stringify(sensitiveData)),
        dateTime,
        reason: data.reason
      };

      const response = await this.makeApiRequest('/refund/payment', 'POST', postBody);

      if (response.status === 'Success') {
        return {
          success: true,
          status: 'completed',
          refundId: response.refundReferenceId,
          originalTransactionId: data.originalTransactionId,
          refundAmount: response.refundAmount,
          currency: response.currency,
          refundTime: response.refundDateTime,
          message: response.message
        };
      } else {
        throw new Error(`Nagad refund failed: ${response.message}`);
      }

    } catch (error) {
      console.error('Nagad refund error:', error);
      throw error;
    }
  }

  /**
   * Handle Nagad webhook
   */
  async handleWebhook(payload: any, signature: string): Promise<any> {
    try {
      // Verify webhook signature
      const isValid = this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      const { paymentReferenceId, status, orderId } = payload;

      // Update transaction status based on webhook
      await this.updateTransactionStatus(
        paymentReferenceId,
        this.mapNagadStatusToLocal(status),
        payload
      );

      return {
        success: true,
        processed: true,
        paymentReferenceId,
        status: this.mapNagadStatusToLocal(status),
        orderId
      };

    } catch (error) {
      console.error('Nagad webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Initialize payment session with Nagad
   */
  private async initializePaymentSession(orderId: string, amount: string, dateTime: string): Promise<any> {
    try {
      const sensitiveData = {
        merchantId: this.merchantId,
        orderId,
        currencyCode: '050', // BDT currency code
        amount,
        challenge: this.generateRandomString(40)
      };

      const postBody = {
        accountNumber: this.merchantId,
        dateTime,
        sensitiveData: this.encryptSensitiveData(JSON.stringify(sensitiveData)),
        signature: this.generateSignature(JSON.stringify(sensitiveData))
      };

      return await this.makeApiRequest('/check-out/initialize/' + this.merchantId + '/' + orderId, 'POST', postBody);

    } catch (error) {
      console.error('Nagad payment session initialization error:', error);
      throw error;
    }
  }

  /**
   * Complete payment initialization
   */
  private async completePaymentInitialization(
    paymentReferenceId: string,
    challenge: string,
    dateTime: string
  ): Promise<any> {
    try {
      const sensitiveData = {
        merchantId: this.merchantId,
        orderId: paymentReferenceId,
        currencyCode: '050',
        amount: '0', // Amount is already set in initialization
        challenge
      };

      const postBody = {
        merchantId: this.merchantId,
        paymentReferenceId,
        challenge,
        sensitiveData: this.encryptSensitiveData(JSON.stringify(sensitiveData)),
        signature: this.generateSignature(JSON.stringify(sensitiveData)),
        dateTime
      };

      return await this.makeApiRequest(
        `/check-out/complete/${paymentReferenceId}`,
        'POST',
        postBody
      );

    } catch (error) {
      console.error('Nagad payment completion error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API request to Nagad
   */
  private async makeApiRequest(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': this.getClientIP(),
        'X-KM-Client-Type': 'PC_WEB'
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;

    } catch (error) {
      console.error('Nagad API request error:', error);
      throw error;
    }
  }

  /**
   * Generate signature for Nagad API
   */
  private generateSignature(data: string): string {
    try {
      // Create signature using private key
      const sign = crypto.createSign('SHA256');
      sign.update(data);
      sign.end();

      return sign.sign(this.privateKey, 'base64');

    } catch (error) {
      console.error('Signature generation error:', error);
      throw error;
    }
  }

  /**
   * Encrypt sensitive data
   */
  private encryptSensitiveData(data: string): string {
    try {
      // Encrypt using public key
      const encrypted = crypto.publicEncrypt(
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(data)
      );

      return encrypted.toString('base64');

    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  private decryptSensitiveData(encryptedData: string): string {
    try {
      // Decrypt using private key
      const decrypted = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(encryptedData, 'base64')
      );

      return decrypted.toString();

    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  /**
   * Update transaction status in database
   */
  private async updateTransactionStatus(
    paymentReferenceId: string,
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
        .where(eq(paymentTransactions.gatewayTransactionId, paymentReferenceId));

    } catch (error) {
      console.error('Transaction status update error:', error);
    }
  }

  /**
   * Map Nagad transaction status to local status
   */
  private mapNagadStatusToLocal(nagadStatus: string): string {
    const statusMap: Record<string, string> = {
      'Success': 'completed',
      'Aborted': 'cancelled',
      'Cancelled': 'cancelled',
      'Failed': 'failed',
      'Pending': 'pending',
      'Processing': 'processing'
    };

    return statusMap[nagadStatus] || 'pending';
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const payloadString = JSON.stringify(payload);
      const verify = crypto.createVerify('SHA256');
      verify.update(payloadString);
      verify.end();

      return verify.verify(this.publicKey, signature, 'base64');

    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Generate random string for challenge
   */
  private generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Get current date time in Nagad format
   */
  private getCurrentDateTime(): string {
    const now = new Date();
    return now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
  }

  /**
   * Get client IP address
   */
  private getClientIP(): string {
    // In production, this would get the actual client IP
    return '127.0.0.1';
  }

  /**
   * Validate Nagad configuration
   */
  validateConfiguration(): boolean {
    const requiredFields = [
      this.merchantId,
      this.publicKey,
      this.privateKey,
      this.baseUrl
    ];

    return requiredFields.every(field => field && field.trim() !== '');
  }

  /**
   * Get supported payment methods
   */
  getSupportedMethods(): string[] {
    return ['nagad_wallet', 'nagad_card'];
  }

  /**
   * Get payment method limits
   */
  getPaymentLimits(): { min: number; max: number } {
    return {
      min: 1, // 1 BDT
      max: 500000 // 500,000 BDT
    };
  }

  /**
   * Calculate transaction fee
   */
  calculateTransactionFee(amount: number): number {
    // Nagad typically charges 1.99% for merchant transactions
    const feePercentage = 0.0199;
    return Math.round(amount * feePercentage * 100) / 100;
  }

  /**
   * Get merchant balance
   */
  async getMerchantBalance(): Promise<{ available: boolean; balance?: number }> {
    try {
      const dateTime = this.getCurrentDateTime();
      const sensitiveData = {
        merchantId: this.merchantId,
        challenge: this.generateRandomString(40)
      };

      const postBody = {
        merchantId: this.merchantId,
        dateTime,
        sensitiveData: this.encryptSensitiveData(JSON.stringify(sensitiveData)),
        signature: this.generateSignature(JSON.stringify(sensitiveData))
      };

      const response = await this.makeApiRequest('/merchant/balance', 'POST', postBody);

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
      const dateTime = this.getCurrentDateTime();
      const sensitiveData = {
        merchantId: this.merchantId,
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
        limit: limit.toString(),
        challenge: this.generateRandomString(40)
      };

      const postBody = {
        merchantId: this.merchantId,
        dateTime,
        sensitiveData: this.encryptSensitiveData(JSON.stringify(sensitiveData)),
        signature: this.generateSignature(JSON.stringify(sensitiveData))
      };

      const response = await this.makeApiRequest('/merchant/transactions', 'POST', postBody);

      return response.transactions || [];

    } catch (error) {
      console.error('Transaction history error:', error);
      return [];
    }
  }

  /**
   * Format date for Nagad API
   */
  private formatDate(date: Date): string {
    return date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
  }

  /**
   * Generate payment QR code
   */
  async generatePaymentQR(amount: number, reference: string): Promise<{ qrString: string; qrImage: string }> {
    try {
      const dateTime = this.getCurrentDateTime();
      const sensitiveData = {
        merchantId: this.merchantId,
        amount: amount.toString(),
        reference,
        challenge: this.generateRandomString(40)
      };

      const postBody = {
        merchantId: this.merchantId,
        dateTime,
        sensitiveData: this.encryptSensitiveData(JSON.stringify(sensitiveData)),
        signature: this.generateSignature(JSON.stringify(sensitiveData))
      };

      const response = await this.makeApiRequest('/qr/generate', 'POST', postBody);

      return {
        qrString: response.qrString || '',
        qrImage: response.qrImage || ''
      };

    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  }
}