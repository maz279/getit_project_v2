import crypto from 'crypto';

/**
 * Rocket Payment Gateway Integration for GetIt Bangladesh
 * 
 * Rocket is a digital financial service by Dutch-Bangla Bank Limited (DBBL)
 * This integration provides secure mobile banking payment processing
 * 
 * Features:
 * - PIN-based payment verification
 * - Real-time transaction status
 * - Comprehensive error handling
 * - Transaction security
 * - Bengali language support
 */

interface RocketConfig {
  merchantId: string;
  merchantSecret: string;
  apiUrl: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}

interface RocketPaymentRequest {
  amount: number;
  orderId: string;
  customerPhone: string;
  currency: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

interface RocketPaymentResponse {
  success: boolean;
  transactionId?: string;
  referenceId?: string;
  status?: string;
  message?: string;
  error?: string;
  data?: any;
}

interface RocketVerificationRequest {
  transactionId: string;
  pin: string;
  orderId: string;
  referenceId: string;
}

interface RocketStatusRequest {
  transactionId: string;
}

export class RocketGateway {
  private config: RocketConfig;
  private readonly API_VERSION = 'v1';

  constructor() {
    this.config = {
      merchantId: process.env.ROCKET_MERCHANT_ID || '',
      merchantSecret: process.env.ROCKET_MERCHANT_SECRET || '',
      apiUrl: process.env.ROCKET_API_URL || 'https://api.rocket.com.bd',
      apiKey: process.env.ROCKET_API_KEY || '',
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production'
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.merchantId) {
      throw new Error('Rocket Merchant ID is required');
    }
    if (!this.config.merchantSecret) {
      throw new Error('Rocket Merchant Secret is required');
    }
    if (!this.config.apiKey) {
      throw new Error('Rocket API Key is required');
    }
  }

  /**
   * Generate signature for Rocket API authentication
   */
  private generateSignature(payload: string, timestamp: string): string {
    const stringToSign = `${payload}${timestamp}${this.config.merchantSecret}`;
    return crypto.createHash('sha256').update(stringToSign).digest('hex').toUpperCase();
  }

  /**
   * Generate request headers for Rocket API
   */
  private getHeaders(payload: string): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.generateSignature(payload, timestamp);

    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      'X-Merchant-ID': this.config.merchantId,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'User-Agent': 'GetIt-Bangladesh/1.0'
    };
  }

  /**
   * Validate Bangladesh phone number for Rocket
   */
  private validateRocketNumber(phone: string): boolean {
    // Rocket uses specific Banglalink number patterns
    const rocketPatterns = [
      /^(?:\+88|88)?(014\d{8})$/, // Primary Banglalink numbers
      /^(?:\+88|88)?(019\d{8})$/, // Some Banglalink numbers
    ];
    
    return rocketPatterns.some(pattern => pattern.test(phone));
  }

  /**
   * Format phone number for Rocket API
   */
  private formatPhoneNumber(phone: string): string {
    // Remove country code and format for Rocket
    let cleanPhone = phone.replace(/^\+88|^88/, '');
    
    if (!cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }
    
    return cleanPhone;
  }

  /**
   * Initiate Rocket payment
   */
  async initiatePayment(request: RocketPaymentRequest): Promise<RocketPaymentResponse> {
    try {
      // Validate request
      if (!this.validateRocketNumber(request.customerPhone)) {
        return {
          success: false,
          error: 'INVALID_PHONE',
          message: 'দয়া করে একটি বৈধ Rocket নম্বর দিন (014XXXXXXXX বা 019XXXXXXXX)'
        };
      }

      if (request.amount < 10) {
        return {
          success: false,
          error: 'MINIMUM_AMOUNT',
          message: 'ন্যূনতম পেমেন্ট পরিমাণ ১০ টাকা'
        };
      }

      if (request.amount > 25000) {
        return {
          success: false,
          error: 'MAXIMUM_AMOUNT',
          message: 'সর্বোচ্চ পেমেন্ট পরিমাণ ২৫,০০০ টাকা'
        };
      }

      // Prepare payload
      const payload = {
        merchant_id: this.config.merchantId,
        order_id: request.orderId,
        amount: request.amount.toFixed(2),
        currency: request.currency || 'BDT',
        customer_phone: this.formatPhoneNumber(request.customerPhone),
        description: request.description || `Payment for order ${request.orderId}`,
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const payloadString = JSON.stringify(payload);
      const headers = this.getHeaders(payloadString);

      // Make API request
      const response = await fetch(`${this.config.apiUrl}/${this.API_VERSION}/payment/initiate`, {
        method: 'POST',
        headers,
        body: payloadString
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          transactionId: responseData.data.transaction_id,
          referenceId: responseData.data.reference_id,
          status: 'pending_verification',
          message: 'পেমেন্ট শুরু হয়েছে। PIN দিয়ে নিশ্চিত করুন'
        };
      } else {
        return {
          success: false,
          error: responseData.error_code || 'INITIATION_FAILED',
          message: this.translateErrorMessage(responseData.message || 'Payment initiation failed')
        };
      }

    } catch (error) {
      console.error('Rocket payment initiation error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'নেটওয়ার্ক সমস্যার কারণে পেমেন্ট শুরু করা যায়নি'
      };
    }
  }

  /**
   * Verify PIN and complete payment
   */
  async verifyPayment(request: RocketVerificationRequest): Promise<RocketPaymentResponse> {
    try {
      // Validate PIN
      if (!request.pin || request.pin.length !== 5) {
        return {
          success: false,
          error: 'INVALID_PIN',
          message: 'দয়া করে ৫ ডিজিটের সঠিক PIN দিন'
        };
      }

      // Prepare payload
      const payload = {
        transaction_id: request.transactionId,
        pin: request.pin,
        order_id: request.orderId,
        reference_id: request.referenceId,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const payloadString = JSON.stringify(payload);
      const headers = this.getHeaders(payloadString);

      // Make API request
      const response = await fetch(`${this.config.apiUrl}/${this.API_VERSION}/payment/verify`, {
        method: 'POST',
        headers,
        body: payloadString
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          transactionId: responseData.data.transaction_id,
          status: 'completed',
          message: 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে',
          data: responseData.data
        };
      } else {
        return {
          success: false,
          error: responseData.error_code || 'VERIFICATION_FAILED',
          message: this.translateErrorMessage(responseData.message || 'PIN verification failed')
        };
      }

    } catch (error) {
      console.error('Rocket payment verification error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'নেটওয়ার্ক সমস্যার কারণে PIN যাচাই করা যায়নি'
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(request: RocketStatusRequest): Promise<RocketPaymentResponse> {
    try {
      const payload = {
        transaction_id: request.transactionId,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const payloadString = JSON.stringify(payload);
      const headers = this.getHeaders(payloadString);

      const response = await fetch(`${this.config.apiUrl}/${this.API_VERSION}/payment/status`, {
        method: 'POST',
        headers,
        body: payloadString
      });

      const responseData = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: responseData.data.transaction_id,
          status: responseData.data.status,
          message: this.translateStatusMessage(responseData.data.status),
          data: responseData.data
        };
      } else {
        return {
          success: false,
          error: 'STATUS_CHECK_FAILED',
          message: 'পেমেন্ট স্ট্যাটাস চেক করতে সমস্যা হয়েছে'
        };
      }

    } catch (error) {
      console.error('Rocket status check error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'নেটওয়ার্ক সমস্যার কারণে স্ট্যাটাস চেক করা যায়নি'
      };
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(transactionId: string): Promise<RocketPaymentResponse> {
    try {
      const payload = {
        transaction_id: transactionId,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const payloadString = JSON.stringify(payload);
      const headers = this.getHeaders(payloadString);

      const response = await fetch(`${this.config.apiUrl}/${this.API_VERSION}/payment/cancel`, {
        method: 'POST',
        headers,
        body: payloadString
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          transactionId: responseData.data.transaction_id,
          status: 'cancelled',
          message: 'পেমেন্ট বাতিল করা হয়েছে'
        };
      } else {
        return {
          success: false,
          error: 'CANCELLATION_FAILED',
          message: 'পেমেন্ট বাতিল করতে সমস্যা হয়েছে'
        };
      }

    } catch (error) {
      console.error('Rocket payment cancellation error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'নেটওয়ার্ক সমস্যার কারণে পেমেন্ট বাতিল করা যায়নি'
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(transactionId: string, amount?: number, reason?: string): Promise<RocketPaymentResponse> {
    try {
      const payload = {
        transaction_id: transactionId,
        refund_amount: amount ? amount.toFixed(2) : undefined,
        reason: reason || 'Customer requested refund',
        timestamp: Math.floor(Date.now() / 1000)
      };

      const payloadString = JSON.stringify(payload);
      const headers = this.getHeaders(payloadString);

      const response = await fetch(`${this.config.apiUrl}/${this.API_VERSION}/payment/refund`, {
        method: 'POST',
        headers,
        body: payloadString
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          transactionId: responseData.data.refund_transaction_id,
          status: 'refunded',
          message: 'রিফান্ড সফলভাবে প্রক্রিয়া করা হয়েছে',
          data: responseData.data
        };
      } else {
        return {
          success: false,
          error: 'REFUND_FAILED',
          message: 'রিফান্ড প্রক্রিয়া করতে সমস্যা হয়েছে'
        };
      }

    } catch (error) {
      console.error('Rocket refund error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'নেটওয়ার্ক সমস্যার কারণে রিফান্ড করা যায়নি'
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, timestamp: string): boolean {
    const expectedSignature = this.generateSignature(payload, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Process webhook notification
   */
  async processWebhook(payload: any, signature: string, timestamp: string): Promise<any> {
    try {
      // Verify webhook signature
      const payloadString = JSON.stringify(payload);
      if (!this.verifyWebhookSignature(payloadString, signature, timestamp)) {
        throw new Error('Invalid webhook signature');
      }

      // Process based on event type
      switch (payload.event_type) {
        case 'payment.completed':
          return {
            status: 'success',
            action: 'payment_completed',
            transaction_id: payload.data.transaction_id,
            order_id: payload.data.order_id
          };

        case 'payment.failed':
          return {
            status: 'success',
            action: 'payment_failed',
            transaction_id: payload.data.transaction_id,
            order_id: payload.data.order_id,
            reason: payload.data.failure_reason
          };

        case 'payment.cancelled':
          return {
            status: 'success',
            action: 'payment_cancelled',
            transaction_id: payload.data.transaction_id,
            order_id: payload.data.order_id
          };

        case 'refund.completed':
          return {
            status: 'success',
            action: 'refund_completed',
            transaction_id: payload.data.transaction_id,
            refund_transaction_id: payload.data.refund_transaction_id
          };

        default:
          console.log('Unknown webhook event type:', payload.event_type);
          return {
            status: 'success',
            action: 'unknown_event'
          };
      }

    } catch (error) {
      console.error('Rocket webhook processing error:', error);
      throw error;
    }
  }

  /**
   * Translate error messages to Bengali
   */
  private translateErrorMessage(message: string): string {
    const errorTranslations: Record<string, string> = {
      'Invalid phone number': 'অবৈধ ফোন নম্বর',
      'Insufficient balance': 'অপর্যাপ্ত ব্যালেন্স',
      'Invalid PIN': 'ভুল PIN',
      'Transaction limit exceeded': 'লেনদেনের সীমা অতিক্রম করেছে',
      'Account blocked': 'অ্যাকাউন্ট ব্লক করা হয়েছে',
      'Network error': 'নেটওয়ার্ক সমস্যা',
      'Service unavailable': 'সেবা বর্তমানে উপলব্ধ নেই',
      'Transaction timeout': 'লেনদেনের সময় শেষ',
      'Invalid merchant': 'অবৈধ মার্চেন্ট',
      'Payment failed': 'পেমেন্ট ব্যর্থ হয়েছে'
    };

    return errorTranslations[message] || message;
  }

  /**
   * Translate status messages to Bengali
   */
  private translateStatusMessage(status: string): string {
    const statusTranslations: Record<string, string> = {
      'pending': 'অপেক্ষমান',
      'pending_verification': 'PIN যাচাইয়ের অপেক্ষায়',
      'processing': 'প্রক্রিয়াধীন',
      'completed': 'সম্পন্ন',
      'failed': 'ব্যর্থ',
      'cancelled': 'বাতিল',
      'refunded': 'রিফান্ড করা হয়েছে',
      'expired': 'মেয়াদ শেষ'
    };

    return statusTranslations[status] || status;
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): any[] {
    return [
      {
        code: 'rocket',
        name: 'Rocket',
        nameBn: 'রকেট',
        type: 'mobile_banking',
        provider: 'Dutch-Bangla Bank',
        logo: '/images/rocket-logo.png',
        description: 'Pay securely with Rocket mobile banking',
        descriptionBn: 'রকেট মোবাইল ব্যাংকিং দিয়ে নিরাপদে পেমেন্ট করুন',
        minAmount: 10,
        maxAmount: 25000,
        fees: {
          fixed: 0,
          percentage: 0,
          description: 'No additional fees',
          descriptionBn: 'কোন অতিরিক্ত চার্জ নেই'
        },
        supportedNumbers: ['014', '019'],
        isActive: true
      }
    ];
  }
}

export default RocketGateway;