import { Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../../../services/LoggingService';

interface BkashConfig {
  username: string;
  password: string;
  appKey: string;
  appSecret: string;
  baseUrl: string;
  version: string;
}

interface BkashPaymentRequest {
  amount: number;
  orderId: string;
  customerPhone: string;
  currency: string;
  intent?: string;
}

interface BkashTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface BkashPaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  createTime: string;
  updateTime: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  bkashURL?: string;
}

export class BkashGateway {
  private config: BkashConfig;
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      username: process.env.BKASH_USERNAME || '',
      password: process.env.BKASH_PASSWORD || '',
      appKey: process.env.BKASH_APP_KEY || '',
      appSecret: process.env.BKASH_APP_SECRET || '',
      baseUrl: process.env.BKASH_BASE_URL || 'https://tokenized.pay.bka.sh/v1.2.0-beta',
      version: 'v1.2.0-beta'
    };

    if (!this.config.username || !this.config.password || !this.config.appKey || !this.config.appSecret) {
      logger.error('bKash configuration missing', {
        service: 'payment-service',
        gateway: 'bkash',
        missingConfig: {
          username: !this.config.username,
          password: !this.config.password,
          appKey: !this.config.appKey,
          appSecret: !this.config.appSecret
        }
      });
    }
  }

  /**
   * Get access token from bKash
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': this.config.username,
        'password': this.config.password
      };

      const body = {
        app_key: this.config.appKey,
        app_secret: this.config.appSecret
      };

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BkashTokenResponse = await response.json();

      if (data.statusCode !== '0000') {
        throw new Error(`bKash token error: ${data.statusMessage}`);
      }

      this.accessToken = data.id_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute before expiry

      logger.info('bKash access token obtained successfully', {
        service: 'payment-service',
        gateway: 'bkash',
        tokenType: data.token_type,
        expiresIn: data.expires_in
      });

      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get bKash access token', {
        service: 'payment-service',
        gateway: 'bkash',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`bKash authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create bKash payment
   */
  async createPayment(paymentData: BkashPaymentRequest): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': this.config.appKey
      };

      const body = {
        mode: '0011',
        payerReference: paymentData.customerPhone,
        callbackURL: `${process.env.FRONTEND_URL}/payment/bkash/callback`,
        amount: paymentData.amount.toString(),
        currency: paymentData.currency || 'BDT',
        intent: paymentData.intent || 'sale',
        merchantInvoiceNumber: paymentData.orderId
      };

      logger.info('Creating bKash payment', {
        service: 'payment-service',
        gateway: 'bkash',
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        customerPhone: paymentData.customerPhone.replace(/(.{3})(.*)(.{2})/, '$1***$3')
      });

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BkashPaymentResponse = await response.json();

      if (data.statusCode !== '0000') {
        throw new Error(`bKash payment creation failed: ${data.statusMessage}`);
      }

      logger.info('bKash payment created successfully', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID: data.paymentID,
        trxID: data.trxID,
        orderId: paymentData.orderId
      });

      return {
        success: true,
        transactionId: data.paymentID,
        bkashURL: data.bkashURL,
        trxID: data.trxID,
        amount: data.amount,
        currency: data.currency,
        status: data.transactionStatus,
        createTime: data.createTime,
        merchantInvoiceNumber: data.merchantInvoiceNumber
      };
    } catch (error) {
      logger.error('bKash payment creation failed', {
        service: 'payment-service',
        gateway: 'bkash',
        orderId: paymentData.orderId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute bKash payment
   */
  async executePayment(paymentID: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': this.config.appKey
      };

      const body = {
        paymentID
      };

      logger.info('Executing bKash payment', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID
      });

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BkashPaymentResponse = await response.json();

      if (data.statusCode !== '0000') {
        throw new Error(`bKash payment execution failed: ${data.statusMessage}`);
      }

      logger.info('bKash payment executed successfully', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID: data.paymentID,
        trxID: data.trxID,
        transactionStatus: data.transactionStatus
      });

      return {
        success: true,
        transactionId: data.paymentID,
        trxID: data.trxID,
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: data.transactionStatus,
        updateTime: data.updateTime,
        merchantInvoiceNumber: data.merchantInvoiceNumber
      };
    } catch (error) {
      logger.error('bKash payment execution failed', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query bKash payment status
   */
  async queryPayment(paymentID: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': this.config.appKey
      };

      const body = {
        paymentID
      };

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/payment/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BkashPaymentResponse = await response.json();

      logger.info('bKash payment status queried', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID,
        status: data.transactionStatus
      });

      return {
        success: true,
        transactionId: data.paymentID,
        trxID: data.trxID,
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: data.transactionStatus,
        updateTime: data.updateTime,
        merchantInvoiceNumber: data.merchantInvoiceNumber
      };
    } catch (error) {
      logger.error('bKash payment status query failed', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Refund bKash payment
   */
  async refundPayment(paymentID: string, amount: number, trxID: string, reason: string = 'Customer request'): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': this.config.appKey
      };

      const body = {
        paymentID,
        amount: amount.toString(),
        trxID,
        sku: 'product',
        reason
      };

      logger.info('Initiating bKash refund', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID,
        amount,
        reason
      });

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/payment/refund`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.statusCode !== '0000') {
        throw new Error(`bKash refund failed: ${data.statusMessage}`);
      }

      logger.info('bKash refund processed successfully', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID,
        refundTrxID: data.refundTrxID
      });

      return {
        success: true,
        refundTrxID: data.refundTrxID,
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: data.transactionStatus,
        refundTime: data.completedTime
      };
    } catch (error) {
      logger.error('bKash refund failed', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.config.appSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Handle bKash webhook
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-bkash-signature'] as string;
      const payload = JSON.stringify(req.body);

      if (!this.validateWebhookSignature(payload, signature)) {
        logger.error('Invalid bKash webhook signature', {
          service: 'payment-service',
          gateway: 'bkash'
        });
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      const { paymentID, status, trxID } = req.body;

      logger.info('bKash webhook received', {
        service: 'payment-service',
        gateway: 'bkash',
        paymentID,
        status,
        trxID
      });

      // Update payment status in database
      // This should be implemented based on your database structure

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('bKash webhook processing failed', {
        service: 'payment-service',
        gateway: 'bkash',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}

export const bkashGateway = new BkashGateway();