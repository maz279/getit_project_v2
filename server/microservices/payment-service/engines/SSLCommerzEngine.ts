import { db } from '../../../db';
import { paymentTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * SSL Commerz Payment Engine for Bangladesh Credit Card and International Payments
 * Implements complete SSL Commerz payment flow with enterprise-level security
 */
export class SSLCommerzEngine {
  private readonly baseUrl: string;
  private readonly storeId: string;
  private readonly storePassword: string;
  private readonly successUrl: string;
  private readonly failUrl: string;
  private readonly cancelUrl: string;
  private readonly ipnUrl: string;

  constructor() {
    this.baseUrl = process.env.SSLCOMMERZ_BASE_URL || 'https://sandbox.sslcommerz.com';
    this.storeId = process.env.SSLCOMMERZ_STORE_ID || '';
    this.storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
    this.successUrl = process.env.SSLCOMMERZ_SUCCESS_URL || 'https://your-domain.com/api/v1/payments/sslcommerz/success';
    this.failUrl = process.env.SSLCOMMERZ_FAIL_URL || 'https://your-domain.com/api/v1/payments/sslcommerz/fail';
    this.cancelUrl = process.env.SSLCOMMERZ_CANCEL_URL || 'https://your-domain.com/api/v1/payments/sslcommerz/cancel';
    this.ipnUrl = process.env.SSLCOMMERZ_IPN_URL || 'https://your-domain.com/api/v1/payments/sslcommerz/ipn';
  }

  /**
   * Initialize SSL Commerz payment
   */
  async initializePayment(data: {
    transactionId: string;
    amount: number;
    orderId: string;
    userId: number;
    metadata?: any;
  }): Promise<any> {
    try {
      const sessionData = await this.createSession({
        amount: data.amount,
        orderId: data.orderId,
        userId: data.userId,
        customerInfo: data.metadata?.customerInfo || {}
      });

      return {
        success: true,
        gatewayTransactionId: sessionData.sessionkey,
        sessionKey: sessionData.sessionkey,
        gatewayPageURL: sessionData.GatewayPageURL,
        directPaymentURL: sessionData.directPaymentURL,
        directPaymentURLBank: sessionData.directPaymentURLBank,
        directPaymentURLCard: sessionData.directPaymentURLCard,
        amount: data.amount.toString(),
        currency: 'BDT',
        orderId: data.orderId,
        status: 'initialized'
      };

    } catch (error) {
      console.error('SSL Commerz payment initialization error:', error);
      throw new Error(`Failed to initialize SSL Commerz payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create SSL Commerz session
   */
  async createSession(data: {
    amount: number;
    orderId: string;
    userId: number;
    customerInfo: any;
  }): Promise<any> {
    try {
      const sessionData = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        total_amount: data.amount.toString(),
        currency: 'BDT',
        tran_id: data.orderId,
        success_url: this.successUrl,
        fail_url: this.failUrl,
        cancel_url: this.cancelUrl,
        ipn_url: this.ipnUrl,
        
        // Product information
        product_name: 'GetIt Order Payment',
        product_category: 'E-commerce',
        product_profile: 'general',
        
        // Customer information
        cus_name: data.customerInfo.name || 'Customer',
        cus_email: data.customerInfo.email || 'customer@getit.com.bd',
        cus_add1: data.customerInfo.address || 'Dhaka, Bangladesh',
        cus_add2: data.customerInfo.address2 || '',
        cus_city: data.customerInfo.city || 'Dhaka',
        cus_state: data.customerInfo.state || 'Dhaka',
        cus_postcode: data.customerInfo.postcode || '1000',
        cus_country: 'Bangladesh',
        cus_phone: data.customerInfo.phone || '01700000000',
        cus_fax: data.customerInfo.fax || '',
        
        // Shipping information
        ship_name: data.customerInfo.shipName || data.customerInfo.name || 'Customer',
        ship_add1: data.customerInfo.shipAddress || data.customerInfo.address || 'Dhaka, Bangladesh',
        ship_add2: data.customerInfo.shipAddress2 || data.customerInfo.address2 || '',
        ship_city: data.customerInfo.shipCity || data.customerInfo.city || 'Dhaka',
        ship_state: data.customerInfo.shipState || data.customerInfo.state || 'Dhaka',
        ship_postcode: data.customerInfo.shipPostcode || data.customerInfo.postcode || '1000',
        ship_country: 'Bangladesh',
        
        // Additional parameters
        shipping_method: 'YES',
        num_of_item: 1,
        value_a: data.userId.toString(),
        value_b: data.orderId,
        value_c: 'GetIt Platform',
        value_d: new Date().toISOString()
      };

      const response = await this.makeApiRequest('/gwprocess/v4/api.php', 'POST', sessionData);

      if (response.status === 'SUCCESS') {
        return response;
      } else {
        throw new Error(`SSL Commerz session creation failed: ${response.failedreason}`);
      }

    } catch (error) {
      console.error('SSL Commerz session creation error:', error);
      throw error;
    }
  }

  /**
   * Validate SSL Commerz transaction
   */
  async validateTransaction(data: {
    val_id: string;
    store_id: string;
    store_passwd: string;
    format?: string;
  }): Promise<any> {
    try {
      const validationData = {
        val_id: data.val_id,
        store_id: data.store_id,
        store_passwd: data.store_passwd,
        format: data.format || 'json'
      };

      const response = await this.makeApiRequest('/validator/api/validationserverAPI.php', 'GET', validationData);

      return {
        status: this.mapSSLCommerzStatusToLocal(response.status),
        gatewayResponse: response,
        transactionId: response.tran_id,
        amount: response.amount,
        currency: response.currency,
        bankTransactionId: response.bank_tran_id,
        cardType: response.card_type,
        cardNo: response.card_no,
        cardIssuer: response.card_issuer,
        cardBrand: response.card_brand,
        cardIssuerCountry: response.card_issuer_country,
        cardIssuerCountryCode: response.card_issuer_country_code,
        riskLevel: response.risk_level,
        riskTitle: response.risk_title
      };

    } catch (error) {
      console.error('SSL Commerz validation error:', error);
      throw error;
    }
  }

  /**
   * Get SSL Commerz payment status
   */
  async getPaymentStatus(sessionKey: string): Promise<any> {
    try {
      const statusData = {
        sessionkey: sessionKey,
        store_id: this.storeId,
        store_passwd: this.storePassword
      };

      const response = await this.makeApiRequest('/validator/api/merchantTransIDvalidationAPI.php', 'GET', statusData);

      return {
        status: this.mapSSLCommerzStatusToLocal(response.status),
        gatewayResponse: response,
        sessionKey: response.sessionkey,
        transactionId: response.tran_id,
        amount: response.amount,
        currency: response.currency,
        bankTransactionId: response.bank_tran_id,
        cardType: response.card_type,
        verifySign: response.verify_sign,
        verifyKey: response.verify_key,
        riskLevel: response.risk_level
      };

    } catch (error) {
      console.error('SSL Commerz status query error:', error);
      throw error;
    }
  }

  /**
   * Process SSL Commerz refund
   */
  async processRefund(data: {
    originalTransactionId: string;
    amount: number;
    reason: string;
  }): Promise<any> {
    try {
      const refundData = {
        refund_amount: data.amount.toString(),
        refund_remarks: data.reason,
        bank_tran_id: data.originalTransactionId,
        refe_id: this.generateRefundId(),
        store_id: this.storeId,
        store_passwd: this.storePassword
      };

      const response = await this.makeApiRequest('/validator/api/merchantTransIDvalidationAPI.php', 'POST', refundData);

      if (response.status === 'success') {
        return {
          success: true,
          status: 'completed',
          refundId: response.refund_ref_id,
          originalTransactionId: data.originalTransactionId,
          refundAmount: response.refund_amount,
          currency: 'BDT',
          refundTime: new Date().toISOString(),
          bankRefId: response.bank_ref_id,
          transId: response.trans_id
        };
      } else {
        throw new Error(`SSL Commerz refund failed: ${response.errorReason}`);
      }

    } catch (error) {
      console.error('SSL Commerz refund error:', error);
      throw error;
    }
  }

  /**
   * Handle SSL Commerz webhook/IPN
   */
  async handleWebhook(payload: any, signature?: string): Promise<any> {
    try {
      // Verify the transaction with SSL Commerz
      const validation = await this.validateTransaction({
        val_id: payload.val_id,
        store_id: payload.store_id,
        store_passwd: this.storePassword
      });

      if (validation.status === 'completed') {
        // Update transaction status
        await this.updateTransactionStatus(
          payload.tran_id,
          'completed',
          validation.gatewayResponse
        );

        return {
          success: true,
          processed: true,
          transactionId: payload.tran_id,
          status: 'completed',
          amount: payload.amount,
          currency: payload.currency
        };
      } else {
        // Update as failed
        await this.updateTransactionStatus(
          payload.tran_id,
          'failed',
          validation.gatewayResponse
        );

        return {
          success: false,
          processed: true,
          transactionId: payload.tran_id,
          status: 'failed',
          reason: validation.gatewayResponse.failedreason
        };
      }

    } catch (error) {
      console.error('SSL Commerz webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Make API request to SSL Commerz
   */
  private async makeApiRequest(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      };

      const requestOptions: RequestInit = {
        method,
        headers
      };

      let url = `${this.baseUrl}${endpoint}`;

      if (method === 'GET' && data) {
        const params = new URLSearchParams(data);
        url += `?${params.toString()}`;
      } else if (method === 'POST' && data) {
        const params = new URLSearchParams(data);
        requestOptions.body = params.toString();
      }

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      return responseData;

    } catch (error) {
      console.error('SSL Commerz API request error:', error);
      throw error;
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
   * Map SSL Commerz transaction status to local status
   */
  private mapSSLCommerzStatusToLocal(sslStatus: string): string {
    const statusMap: Record<string, string> = {
      'VALID': 'completed',
      'VALIDATED': 'completed',
      'SUCCESS': 'completed',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled',
      'UNATTEMPTED': 'pending',
      'EXPIRED': 'expired'
    };

    return statusMap[sslStatus] || 'pending';
  }

  /**
   * Generate refund ID
   */
  private generateRefundId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `REF${timestamp}${random}`;
  }

  /**
   * Validate SSL Commerz configuration
   */
  validateConfiguration(): boolean {
    const requiredFields = [
      this.storeId,
      this.storePassword,
      this.baseUrl,
      this.successUrl,
      this.failUrl,
      this.cancelUrl
    ];

    return requiredFields.every(field => field && field.trim() !== '');
  }

  /**
   * Get supported payment methods
   */
  getSupportedMethods(): string[] {
    return [
      'visa',
      'mastercard',
      'amex',
      'bkash',
      'rocket',
      'nagad',
      'upay',
      'ok_wallet',
      'mcash',
      'islamic_wallet',
      'city_touch',
      'tap',
      'dutch_bangla_bank',
      'brac_bank',
      'eastern_bank',
      'ibbl_internet_banking',
      'mtb_internet_banking',
      'city_bank_internet_banking'
    ];
  }

  /**
   * Get payment method limits
   */
  getPaymentLimits(): { min: number; max: number } {
    return {
      min: 1, // 1 BDT
      max: 1000000 // 1,000,000 BDT
    };
  }

  /**
   * Calculate transaction fee
   */
  calculateTransactionFee(amount: number, paymentMethod: string): number {
    // SSL Commerz fee structure varies by payment method
    const feeStructure: Record<string, { percentage: number; fixed: number; min: number; max: number }> = {
      'visa': { percentage: 0.025, fixed: 0, min: 5, max: 200 },
      'mastercard': { percentage: 0.025, fixed: 0, min: 5, max: 200 },
      'amex': { percentage: 0.035, fixed: 0, min: 10, max: 300 },
      'bkash': { percentage: 0.018, fixed: 0, min: 2, max: 100 },
      'rocket': { percentage: 0.018, fixed: 0, min: 2, max: 100 },
      'nagad': { percentage: 0.019, fixed: 0, min: 2, max: 100 },
      'internet_banking': { percentage: 0.015, fixed: 0, min: 3, max: 150 }
    };

    const method = feeStructure[paymentMethod] || feeStructure['visa'];
    const calculatedFee = (amount * method.percentage) + method.fixed;
    
    return Math.max(method.min, Math.min(method.max, Math.round(calculatedFee * 100) / 100));
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(transactionId: string): Promise<any> {
    try {
      const detailsData = {
        tran_id: transactionId,
        store_id: this.storeId,
        store_passwd: this.storePassword
      };

      const response = await this.makeApiRequest('/validator/api/merchantTransIDvalidationAPI.php', 'GET', detailsData);

      return {
        transactionId: response.tran_id,
        amount: response.amount,
        currency: response.currency,
        status: this.mapSSLCommerzStatusToLocal(response.status),
        bankTransactionId: response.bank_tran_id,
        cardType: response.card_type,
        cardNo: response.card_no,
        cardIssuer: response.card_issuer,
        cardBrand: response.card_brand,
        storeAmount: response.store_amount,
        verifySign: response.verify_sign,
        verifyKey: response.verify_key,
        riskLevel: response.risk_level,
        riskTitle: response.risk_title,
        transactionDate: response.tran_date,
        valueA: response.value_a,
        valueB: response.value_b,
        valueC: response.value_c,
        valueD: response.value_d
      };

    } catch (error) {
      console.error('Transaction details error:', error);
      throw error;
    }
  }

  /**
   * Check transaction risk
   */
  async checkTransactionRisk(transactionId: string): Promise<any> {
    try {
      const details = await this.getTransactionDetails(transactionId);

      return {
        riskLevel: details.riskLevel,
        riskTitle: details.riskTitle,
        riskScore: this.calculateRiskScore(details.riskLevel),
        recommendations: this.getRiskRecommendations(details.riskLevel),
        cardDetails: {
          type: details.cardType,
          issuer: details.cardIssuer,
          brand: details.cardBrand,
          maskedNumber: details.cardNo
        }
      };

    } catch (error) {
      console.error('Risk check error:', error);
      throw error;
    }
  }

  /**
   * Calculate risk score from risk level
   */
  private calculateRiskScore(riskLevel: string): number {
    const riskMap: Record<string, number> = {
      '0': 0,   // No risk
      '1': 25,  // Low risk
      '2': 50,  // Medium risk
      '3': 75,  // High risk
      '4': 100  // Very high risk
    };

    return riskMap[riskLevel] || 0;
  }

  /**
   * Get risk recommendations
   */
  private getRiskRecommendations(riskLevel: string): string[] {
    const recommendations: Record<string, string[]> = {
      '0': ['Transaction approved - No additional verification needed'],
      '1': ['Monitor transaction - Standard processing recommended'],
      '2': ['Verify customer details - Additional checks recommended'],
      '3': ['Manual review required - Contact customer for verification'],
      '4': ['High risk transaction - Consider declining or extensive verification']
    };

    return recommendations[riskLevel] || ['Review transaction manually'];
  }

  /**
   * Get store status
   */
  async getStoreStatus(): Promise<any> {
    try {
      const statusData = {
        store_id: this.storeId,
        store_passwd: this.storePassword
      };

      const response = await this.makeApiRequest('/validator/api/merchantTransIDvalidationAPI.php', 'GET', statusData);

      return {
        storeId: this.storeId,
        status: response.status,
        isLive: response.is_live === 'yes',
        currency: response.currency,
        timezone: response.timezone
      };

    } catch (error) {
      console.error('Store status error:', error);
      return {
        storeId: this.storeId,
        status: 'unknown',
        isLive: false
      };
    }
  }
}