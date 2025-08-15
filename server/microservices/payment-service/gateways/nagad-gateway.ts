import crypto from 'crypto';
import axios from 'axios';
import { PaymentGateway, PaymentRequest, PaymentResponse, PaymentStatus } from '../types/payment.types';

interface NagadConfig {
  merchantId: string;
  publicKey: string;
  privateKey: string;
  baseUrl: string;
  callbackUrl: string;
}

interface NagadPaymentRequest {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  challenge: string;
  dateTime: string;
  sensitiveData: string;
  signature: string;
}

interface NagadInitiateResponse {
  sensitiveData: string;
  signature: string;
  status: string;
  statusCode: string;
}

interface NagadExecuteResponse {
  status: string;
  statusCode: string;
  message: string;
  paymentRefId: string;
  issuerPaymentRefNo: string;
  orderData: any;
}

export class NagadGateway implements PaymentGateway {
  private config: NagadConfig;
  
  constructor(config: NagadConfig) {
    this.config = config;
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const orderId = this.generateOrderId();
      const dateTime = new Date().toISOString();
      const challenge = this.generateChallenge();
      
      // Step 1: Create sensitive data
      const sensitiveData = this.createSensitiveData({
        merchantId: this.config.merchantId,
        orderId,
        amount: request.amount.toString(),
        currency: request.currency || 'BDT',
        challenge
      });

      // Step 2: Generate signature
      const signature = this.generateSignature(sensitiveData);

      // Step 3: Initiate payment with Nagad
      const initiateResponse = await this.callNagadInitiate({
        merchantId: this.config.merchantId,
        orderId,
        amount: request.amount.toString(),
        currency: request.currency || 'BDT',
        challenge,
        dateTime,
        sensitiveData,
        signature
      });

      if (initiateResponse.statusCode !== '000') {
        throw new Error(`Nagad initiation failed: ${initiateResponse.status}`);
      }

      // Step 4: Complete payment request
      const completeResponse = await this.completePayment(
        orderId,
        initiateResponse.sensitiveData,
        initiateResponse.signature
      );

      return {
        success: true,
        transactionId: orderId,
        paymentUrl: completeResponse.callBackUrl,
        gatewayResponse: completeResponse,
        status: PaymentStatus.PENDING,
        metadata: {
          gateway: 'nagad',
          orderId,
          merchantId: this.config.merchantId,
          challenge,
          dateTime
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: PaymentStatus.FAILED,
        metadata: {
          gateway: 'nagad',
          error: error.message
        }
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      const verifyUrl = `${this.config.baseUrl}/api/dfs/verify/payment/${transactionId}`;
      
      const response = await axios.get(verifyUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0',
          'X-KM-IP-V4': await this.getClientIP(),
          'X-KM-Client-Type': 'PC_WEB'
        }
      });

      const verification = response.data;

      if (verification.status === 'Success') {
        return {
          success: true,
          transactionId,
          status: PaymentStatus.COMPLETED,
          gatewayResponse: verification,
          metadata: {
            gateway: 'nagad',
            verificationId: verification.paymentRefId,
            issuerRefNo: verification.issuerPaymentRefNo
          }
        };
      } else {
        return {
          success: false,
          transactionId,
          status: PaymentStatus.FAILED,
          error: verification.message,
          gatewayResponse: verification,
          metadata: {
            gateway: 'nagad'
          }
        };
      }

    } catch (error) {
      return {
        success: false,
        transactionId,
        status: PaymentStatus.FAILED,
        error: error.message,
        metadata: {
          gateway: 'nagad'
        }
      };
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      // Nagad refund implementation
      const refundData = {
        merchantId: this.config.merchantId,
        transactionId,
        refundAmount: amount || 0,
        reason: 'Customer requested refund'
      };

      const sensitiveData = this.createSensitiveData(refundData);
      const signature = this.generateSignature(sensitiveData);

      const refundUrl = `${this.config.baseUrl}/api/dfs/refund/request`;
      
      const response = await axios.post(refundUrl, {
        sensitiveData,
        signature
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-KM-Api-Version': 'v-0.2.0'
        }
      });

      const refundResponse = response.data;

      return {
        success: refundResponse.statusCode === '000',
        transactionId,
        status: refundResponse.statusCode === '000' ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
        gatewayResponse: refundResponse,
        metadata: {
          gateway: 'nagad',
          refundId: refundResponse.refundRefId,
          refundAmount: amount
        }
      };

    } catch (error) {
      return {
        success: false,
        transactionId,
        status: PaymentStatus.FAILED,
        error: error.message,
        metadata: {
          gateway: 'nagad'
        }
      };
    }
  }

  private async callNagadInitiate(request: NagadPaymentRequest): Promise<NagadInitiateResponse> {
    const initiateUrl = `${this.config.baseUrl}/api/dfs/check-out/initialize/${this.config.merchantId}/${request.orderId}`;
    
    const response = await axios.post(initiateUrl, {
      sensitiveData: request.sensitiveData,
      signature: request.signature
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': await this.getClientIP(),
        'X-KM-Client-Type': 'PC_WEB'
      }
    });

    return response.data;
  }

  private async completePayment(orderId: string, sensitiveData: string, signature: string): Promise<any> {
    const completeUrl = `${this.config.baseUrl}/api/dfs/check-out/complete/${orderId}`;
    
    const response = await axios.post(completeUrl, {
      sensitiveData,
      signature
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': await this.getClientIP(),
        'X-KM-Client-Type': 'PC_WEB'
      }
    });

    return response.data;
  }

  private createSensitiveData(data: any): string {
    const jsonString = JSON.stringify(data);
    const encryptedData = crypto.publicEncrypt(
      {
        key: this.config.publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(jsonString, 'utf8')
    );
    
    return encryptedData.toString('base64');
  }

  private generateSignature(sensitiveData: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(sensitiveData);
    sign.end();
    
    const signature = sign.sign(this.config.privateKey, 'base64');
    return signature;
  }

  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `NAG${timestamp}${random}`.toUpperCase();
  }

  private generateChallenge(): string {
    return crypto.randomBytes(10).toString('hex');
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      return '127.0.0.1'; // Fallback IP
    }
  }

  async handleWebhook(payload: any): Promise<boolean> {
    try {
      // Verify webhook signature
      const receivedSignature = payload.signature;
      const expectedSignature = this.generateSignature(payload.sensitiveData);
      
      if (receivedSignature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }

      // Decrypt sensitive data
      const decryptedData = this.decryptSensitiveData(payload.sensitiveData);
      const webhookData = JSON.parse(decryptedData);

      // Process webhook based on status
      switch (webhookData.status) {
        case 'Success':
          // Payment completed successfully
          await this.updatePaymentStatus(webhookData.orderId, PaymentStatus.COMPLETED, webhookData);
          break;
        case 'Cancelled':
          // Payment was cancelled
          await this.updatePaymentStatus(webhookData.orderId, PaymentStatus.CANCELLED, webhookData);
          break;
        case 'Failed':
          // Payment failed
          await this.updatePaymentStatus(webhookData.orderId, PaymentStatus.FAILED, webhookData);
          break;
      }

      return true;
    } catch (error) {
      console.error('Nagad webhook processing failed:', error);
      return false;
    }
  }

  private decryptSensitiveData(encryptedData: string): string {
    const decryptedData = crypto.privateDecrypt(
      {
        key: this.config.privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(encryptedData, 'base64')
    );
    
    return decryptedData.toString('utf8');
  }

  private async updatePaymentStatus(orderId: string, status: PaymentStatus, data: any): Promise<void> {
    // Implementation would update the payment status in the database
    // This would typically call the payment service to update the transaction
    console.log(`Updating payment ${orderId} status to ${status}`, data);
  }

  getGatewayName(): string {
    return 'nagad';
  }

  isEnabled(): boolean {
    return !!(this.config.merchantId && this.config.publicKey && this.config.privateKey);
  }

  getSupportedCurrencies(): string[] {
    return ['BDT'];
  }

  getMinimumAmount(): number {
    return 10; // Minimum 10 BDT
  }

  getMaximumAmount(): number {
    return 100000; // Maximum 100,000 BDT per transaction
  }

  getTransactionFee(amount: number): number {
    // Nagad typically charges 1.5% + VAT
    const baseFee = amount * 0.015;
    const vat = baseFee * 0.15; // 15% VAT on fee
    return baseFee + vat;
  }
}