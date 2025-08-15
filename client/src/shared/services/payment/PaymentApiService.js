// Payment API Service
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Payment Management API Service
// Complete payment processing with enterprise-grade Bangladesh mobile banking integration

import BaseApiService from '../api/BaseApiService.js';

class PaymentApiService extends BaseApiService {
  constructor() {
    super();
    this.servicePath = '/payments';
  }

  // ==========================================
  // PAYMENT METHOD MANAGEMENT
  // ==========================================

  /**
   * Get available payment methods for user
   */
  async getPaymentMethods(userId = null) {
    const params = userId ? { userId } : {};
    return this.get(`${this.servicePath}/methods`, params);
  }

  /**
   * Get available payment methods based on amount and currency
   */
  async getAvailablePaymentMethods(amount = null, currency = 'BDT') {
    const params = { currency };
    if (amount) params.amount = amount;
    return this.get(`${this.servicePath}/methods/available`, params);
  }

  /**
   * Add new payment method
   */
  async addPaymentMethod(paymentMethodData) {
    return this.post(`${this.servicePath}/methods`, paymentMethodData);
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(methodId, updateData) {
    return this.put(`${this.servicePath}/methods/${methodId}`, updateData);
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId) {
    return this.delete(`${this.servicePath}/methods/${methodId}`);
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId) {
    return this.post(`${this.servicePath}/methods/${methodId}/default`);
  }

  // ==========================================
  // BANGLADESH MOBILE BANKING PAYMENTS
  // ==========================================

  /**
   * Create bKash payment
   */
  async createBkashPayment(paymentData) {
    return this.post(`${this.servicePath}/bkash/create`, paymentData);
  }

  /**
   * Execute bKash payment
   */
  async executeBkashPayment(paymentID) {
    return this.post(`${this.servicePath}/bkash/execute`, { paymentID });
  }

  /**
   * Query bKash payment status
   */
  async queryBkashPayment(paymentID) {
    return this.get(`${this.servicePath}/bkash/query/${paymentID}`);
  }

  /**
   * Create Nagad payment
   */
  async createNagadPayment(paymentData) {
    return this.post(`${this.servicePath}/nagad/create`, paymentData);
  }

  /**
   * Confirm Nagad payment
   */
  async confirmNagadPayment(paymentId, challengeToken) {
    return this.post(`${this.servicePath}/nagad/confirm`, { paymentId, challengeToken });
  }

  /**
   * Create Rocket payment
   */
  async createRocketPayment(paymentData) {
    return this.post(`${this.servicePath}/rocket/create`, paymentData);
  }

  /**
   * Confirm Rocket payment
   */
  async confirmRocketPayment(paymentId, pin) {
    return this.post(`${this.servicePath}/rocket/confirm`, { paymentId, pin });
  }

  // ==========================================
  // CORE PAYMENT PROCESSING
  // ==========================================

  /**
   * Create payment transaction
   */
  async createPayment(paymentData) {
    return this.post(`${this.servicePath}/create`, paymentData);
  }

  /**
   * Process payment
   */
  async processPayment(paymentId, processingData = {}) {
    return this.post(`${this.servicePath}/${paymentId}/process`, processingData);
  }

  /**
   * Capture payment (for authorized payments)
   */
  async capturePayment(paymentId, captureData = {}) {
    return this.post(`${this.servicePath}/${paymentId}/capture`, captureData);
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId, reason = '') {
    return this.post(`${this.servicePath}/${paymentId}/cancel`, { reason });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    return this.get(`${this.servicePath}/${paymentId}/status`);
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId) {
    return this.get(`${this.servicePath}/${paymentId}`);
  }

  // ==========================================
  // REFUND MANAGEMENT
  // ==========================================

  /**
   * Create refund request
   */
  async createRefund(refundData) {
    return this.post(`${this.servicePath}/refunds`, refundData);
  }

  /**
   * Process refund
   */
  async processRefund(refundId) {
    return this.post(`${this.servicePath}/refunds/${refundId}/process`);
  }

  /**
   * Get refund status
   */
  async getRefundStatus(refundId) {
    return this.get(`${this.servicePath}/refunds/${refundId}/status`);
  }

  /**
   * Get user refunds
   */
  async getUserRefunds(userId, filters = {}) {
    return this.get(`${this.servicePath}/refunds/user/${userId}`, filters);
  }

  // ==========================================
  // TRANSACTION HISTORY & ANALYTICS
  // ==========================================

  /**
   * Get user payment history
   */
  async getPaymentHistory(userId, filters = {}) {
    return this.get(`${this.servicePath}/history/user/${userId}`, filters);
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(transactionId) {
    return this.get(`${this.servicePath}/transactions/${transactionId}`);
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(filters = {}) {
    return this.get(`${this.servicePath}/analytics`, filters);
  }

  /**
   * Get payment method statistics
   */
  async getPaymentMethodStats(filters = {}) {
    return this.get(`${this.servicePath}/analytics/methods`, filters);
  }

  // ==========================================
  // FRAUD DETECTION & SECURITY
  // ==========================================

  /**
   * Verify payment security
   */
  async verifyPaymentSecurity(paymentId, securityData) {
    return this.post(`${this.servicePath}/${paymentId}/verify-security`, securityData);
  }

  /**
   * Report suspicious transaction
   */
  async reportSuspiciousTransaction(transactionId, reason) {
    return this.post(`${this.servicePath}/security/report`, { transactionId, reason });
  }

  /**
   * Get fraud risk score
   */
  async getFraudRiskScore(transactionData) {
    return this.post(`${this.servicePath}/security/risk-score`, transactionData);
  }

  // ==========================================
  // WEBHOOKS & NOTIFICATIONS
  // ==========================================

  /**
   * Handle payment webhook
   */
  async handleWebhook(webhookData) {
    return this.post(`${this.servicePath}/webhooks/handle`, webhookData);
  }

  /**
   * Resend payment notification
   */
  async resendPaymentNotification(paymentId, notificationType = 'email') {
    return this.post(`${this.servicePath}/${paymentId}/notifications/resend`, { 
      type: notificationType 
    });
  }

  // ==========================================
  // PAYMENT GATEWAY MANAGEMENT
  // ==========================================

  /**
   * Get gateway status
   */
  async getGatewayStatus(gateway = null) {
    const endpoint = gateway 
      ? `${this.servicePath}/gateways/${gateway}/status`
      : `${this.servicePath}/gateways/status`;
    return this.get(endpoint);
  }

  /**
   * Test gateway connection
   */
  async testGatewayConnection(gateway) {
    return this.post(`${this.servicePath}/gateways/${gateway}/test`);
  }

  // ==========================================
  // SUBSCRIPTION & RECURRING PAYMENTS
  // ==========================================

  /**
   * Create subscription payment
   */
  async createSubscriptionPayment(subscriptionData) {
    return this.post(`${this.servicePath}/subscriptions`, subscriptionData);
  }

  /**
   * Update subscription payment
   */
  async updateSubscriptionPayment(subscriptionId, updateData) {
    return this.put(`${this.servicePath}/subscriptions/${subscriptionId}`, updateData);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, reason = '') {
    return this.post(`${this.servicePath}/subscriptions/${subscriptionId}/cancel`, { reason });
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(subscriptionId) {
    return this.get(`${this.servicePath}/subscriptions/${subscriptionId}/status`);
  }

  // ==========================================
  // BANGLADESH COMPLIANCE & REGULATIONS
  // ==========================================

  /**
   * Validate payment compliance
   */
  async validatePaymentCompliance(paymentData) {
    return this.post(`${this.servicePath}/compliance/validate`, paymentData);
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(filters = {}) {
    return this.get(`${this.servicePath}/compliance/report`, filters);
  }

  /**
   * Export transaction data for audit
   */
  async exportTransactionData(filters = {}) {
    return this.get(`${this.servicePath}/compliance/export`, filters);
  }

  // ==========================================
  // CONFIGURATION & SETTINGS
  // ==========================================

  /**
   * Get payment configuration
   */
  async getPaymentConfig() {
    return this.get(`${this.servicePath}/config`);
  }

  /**
   * Update payment configuration
   */
  async updatePaymentConfig(configData) {
    return this.put(`${this.servicePath}/config`, configData);
  }

  /**
   * Get service health
   */
  async getServiceHealth() {
    return this.get(`${this.servicePath}/health`);
  }

  /**
   * Export payment data
   */
  async exportPaymentData(filters = {}) {
    return this.get(`${this.servicePath}/export`, filters);
  }
}

// Export singleton instance
const paymentApiService = new PaymentApiService();
export default paymentApiService;