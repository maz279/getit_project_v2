// Payment Service
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Payment API Service
// Complete payment processing with Bangladesh mobile banking integration

import BaseApiService from './BaseApiService.js';

class PaymentService extends BaseApiService {
  constructor() {
    super();
    this.servicePath = '/payments';
  }

  // Payment Method Management
  async getPaymentMethods(userId = null) {
    const params = userId ? { userId } : {};
    return this.get(`${this.servicePath}/methods`, params);
  }

  async getAvailablePaymentMethods(amount = null, currency = 'BDT') {
    const params = { currency };
    if (amount) params.amount = amount;
    return this.get(`${this.servicePath}/methods/available`, params);
  }

  async addPaymentMethod(paymentMethodData) {
    const {
      type, // 'card', 'bkash', 'nagad', 'rocket', 'bank'
      isDefault = false,
      ...methodData
    } = paymentMethodData;

    return this.post(`${this.servicePath}/methods`, {
      type,
      isDefault,
      ...methodData
    });
  }

  async updatePaymentMethod(methodId, updateData) {
    return this.put(`${this.servicePath}/methods/${methodId}`, updateData);
  }

  async deletePaymentMethod(methodId) {
    return this.delete(`${this.servicePath}/methods/${methodId}`);
  }

  async setDefaultPaymentMethod(methodId) {
    return this.post(`${this.servicePath}/methods/${methodId}/default`);
  }

  // Payment Processing
  async createPayment(paymentData) {
    const {
      orderId,
      amount,
      currency = 'BDT',
      paymentMethod,
      description,
      metadata = {},
      returnUrl,
      cancelUrl
    } = paymentData;

    return this.post(this.servicePath, {
      orderId,
      amount,
      currency,
      paymentMethod,
      description,
      metadata,
      returnUrl,
      cancelUrl
    });
  }

  async getPayment(paymentId) {
    return this.get(`${this.servicePath}/${paymentId}`);
  }

  async getPayments(params = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      dateFrom,
      dateTo,
      orderId,
      userId,
      sortBy = 'date_desc'
    } = params;

    const queryParams = { page, limit, sortBy };
    if (status) queryParams.status = status;
    if (paymentMethod) queryParams.paymentMethod = paymentMethod;
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;
    if (orderId) queryParams.orderId = orderId;
    if (userId) queryParams.userId = userId;

    return this.get(this.servicePath, queryParams);
  }

  async confirmPayment(paymentId, confirmationData = {}) {
    return this.post(`${this.servicePath}/${paymentId}/confirm`, confirmationData);
  }

  async cancelPayment(paymentId, reason = '') {
    return this.post(`${this.servicePath}/${paymentId}/cancel`, { reason });
  }

  // Bangladesh Mobile Banking - bKash
  async initiateBkashPayment(paymentData) {
    const {
      amount,
      orderId,
      customerMobile,
      merchantInvoiceNumber,
      intent = 'sale'
    } = paymentData;

    return this.post(`${this.servicePath}/bkash/initiate`, {
      amount,
      orderId,
      customerMobile,
      merchantInvoiceNumber,
      intent
    });
  }

  async executeBkashPayment(paymentId, paymentExecuteData) {
    const { paymentID } = paymentExecuteData;
    return this.post(`${this.servicePath}/bkash/execute`, {
      paymentId,
      paymentID
    });
  }

  async queryBkashPayment(paymentId) {
    return this.get(`${this.servicePath}/bkash/query/${paymentId}`);
  }

  async refundBkashPayment(paymentId, refundData) {
    const {
      amount,
      trxID,
      reason,
      sku = 'GetIt-Refund'
    } = refundData;

    return this.post(`${this.servicePath}/bkash/refund`, {
      paymentId,
      amount,
      trxID,
      reason,
      sku
    });
  }

  async searchBkashTransaction(trxId) {
    return this.get(`${this.servicePath}/bkash/search/${trxId}`);
  }

  // Bangladesh Mobile Banking - Nagad
  async initiateNagadPayment(paymentData) {
    const {
      amount,
      orderId,
      customerMobile,
      productDetails,
      merchantCallbackURL
    } = paymentData;

    return this.post(`${this.servicePath}/nagad/initiate`, {
      amount,
      orderId,
      customerMobile,
      productDetails,
      merchantCallbackURL
    });
  }

  async completeNagadPayment(paymentId, completionData) {
    const { challenge } = completionData;
    return this.post(`${this.servicePath}/nagad/complete`, {
      paymentId,
      challenge
    });
  }

  async verifyNagadPayment(paymentId) {
    return this.get(`${this.servicePath}/nagad/verify/${paymentId}`);
  }

  async refundNagadPayment(paymentId, refundData) {
    const {
      amount,
      reason,
      refundRequestId
    } = refundData;

    return this.post(`${this.servicePath}/nagad/refund`, {
      paymentId,
      amount,
      reason,
      refundRequestId
    });
  }

  // Bangladesh Mobile Banking - Rocket
  async initiateRocketPayment(paymentData) {
    const {
      amount,
      orderId,
      customerMobile,
      currency = 'BDT',
      purpose = 'Payment'
    } = paymentData;

    return this.post(`${this.servicePath}/rocket/initiate`, {
      amount,
      orderId,
      customerMobile,
      currency,
      purpose
    });
  }

  async confirmRocketPayment(paymentId, confirmationData) {
    const { pin, otp } = confirmationData;
    return this.post(`${this.servicePath}/rocket/confirm`, {
      paymentId,
      pin,
      otp
    });
  }

  async checkRocketBalance(mobile) {
    return this.get(`${this.servicePath}/rocket/balance/${mobile}`);
  }

  async getRocketTransactionHistory(mobile, params = {}) {
    return this.get(`${this.servicePath}/rocket/history/${mobile}`, params);
  }

  // Card Payments
  async processCardPayment(cardData) {
    const {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardHolderName,
      amount,
      currency = 'BDT',
      orderId,
      billingAddress,
      saveCard = false
    } = cardData;

    return this.post(`${this.servicePath}/card/process`, {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardHolderName,
      amount,
      currency,
      orderId,
      billingAddress,
      saveCard
    });
  }

  async validateCard(cardNumber) {
    return this.post(`${this.servicePath}/card/validate`, { cardNumber });
  }

  async getCardBIN(cardNumber) {
    return this.get(`${this.servicePath}/card/bin/${cardNumber.substring(0, 6)}`);
  }

  // Bank Transfer
  async initiateBankTransfer(transferData) {
    const {
      amount,
      currency = 'BDT',
      orderId,
      bankCode,
      accountNumber,
      accountHolderName,
      routingNumber,
      reference
    } = transferData;

    return this.post(`${this.servicePath}/bank-transfer/initiate`, {
      amount,
      currency,
      orderId,
      bankCode,
      accountNumber,
      accountHolderName,
      routingNumber,
      reference
    });
  }

  async getBankList() {
    return this.get(`${this.servicePath}/bank-transfer/banks`);
  }

  async verifyBankAccount(bankData) {
    const { bankCode, accountNumber, accountHolderName } = bankData;
    return this.post(`${this.servicePath}/bank-transfer/verify-account`, {
      bankCode,
      accountNumber,
      accountHolderName
    });
  }

  // Cash on Delivery (COD)
  async createCODPayment(codData) {
    const {
      orderId,
      amount,
      deliveryAddress,
      customerPhone,
      customerName,
      notes
    } = codData;

    return this.post(`${this.servicePath}/cod/create`, {
      orderId,
      amount,
      deliveryAddress,
      customerPhone,
      customerName,
      notes
    });
  }

  async updateCODStatus(paymentId, status, collectedAmount = null) {
    const updateData = { status };
    if (collectedAmount) updateData.collectedAmount = collectedAmount;

    return this.patch(`${this.servicePath}/cod/${paymentId}/status`, updateData);
  }

  async getCODPayments(params = {}) {
    return this.get(`${this.servicePath}/cod`, params);
  }

  // EMI & Installments
  async getEMIOptions(amount, productCategory = null) {
    const params = { amount };
    if (productCategory) params.productCategory = productCategory;
    return this.get(`${this.servicePath}/emi/options`, params);
  }

  async createEMIPayment(emiData) {
    const {
      amount,
      tenure, // in months
      interestRate,
      orderId,
      cardNumber,
      downPayment = 0
    } = emiData;

    return this.post(`${this.servicePath}/emi/create`, {
      amount,
      tenure,
      interestRate,
      orderId,
      cardNumber,
      downPayment
    });
  }

  async getEMISchedule(emiPaymentId) {
    return this.get(`${this.servicePath}/emi/${emiPaymentId}/schedule`);
  }

  async payEMIInstallment(emiPaymentId, installmentNumber) {
    return this.post(`${this.servicePath}/emi/${emiPaymentId}/pay-installment`, {
      installmentNumber
    });
  }

  // Digital Wallets
  async getWalletBalance(walletType, userId) {
    return this.get(`${this.servicePath}/wallet/${walletType}/balance`, { userId });
  }

  async addWalletFunds(walletType, fundData) {
    const {
      amount,
      paymentMethod,
      userId
    } = fundData;

    return this.post(`${this.servicePath}/wallet/${walletType}/add-funds`, {
      amount,
      paymentMethod,
      userId
    });
  }

  async processWalletPayment(walletData) {
    const {
      walletType,
      amount,
      orderId,
      userId,
      pin
    } = walletData;

    return this.post(`${this.servicePath}/wallet/${walletType}/pay`, {
      amount,
      orderId,
      userId,
      pin
    });
  }

  // Gift Cards & Store Credit
  async validateGiftCard(cardCode) {
    return this.post(`${this.servicePath}/gift-card/validate`, { cardCode });
  }

  async redeemGiftCard(redeemData) {
    const {
      cardCode,
      amount,
      orderId
    } = redeemData;

    return this.post(`${this.servicePath}/gift-card/redeem`, {
      cardCode,
      amount,
      orderId
    });
  }

  async getStoreCredit(userId) {
    return this.get(`${this.servicePath}/store-credit`, { userId });
  }

  async useStoreCredit(creditData) {
    const {
      amount,
      orderId,
      userId
    } = creditData;

    return this.post(`${this.servicePath}/store-credit/use`, {
      amount,
      orderId,
      userId
    });
  }

  // Refunds & Returns
  async createRefund(refundData) {
    const {
      paymentId,
      amount,
      reason,
      refundMethod = 'original',
      bankDetails = null
    } = refundData;

    const requestData = {
      paymentId,
      amount,
      reason,
      refundMethod
    };

    if (bankDetails) requestData.bankDetails = bankDetails;

    return this.post(`${this.servicePath}/refunds`, requestData);
  }

  async getRefund(refundId) {
    return this.get(`${this.servicePath}/refunds/${refundId}`);
  }

  async getRefunds(params = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      paymentId,
      dateFrom,
      dateTo,
      sortBy = 'date_desc'
    } = params;

    const queryParams = { page, limit, sortBy };
    if (status) queryParams.status = status;
    if (paymentId) queryParams.paymentId = paymentId;
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;

    return this.get(`${this.servicePath}/refunds`, queryParams);
  }

  async updateRefundStatus(refundId, status, notes = '') {
    return this.patch(`${this.servicePath}/refunds/${refundId}/status`, {
      status,
      notes
    });
  }

  // Payment Analytics & Reports
  async getPaymentAnalytics(params = {}) {
    const {
      dateFrom,
      dateTo,
      groupBy = 'day',
      paymentMethod,
      currency = 'BDT'
    } = params;

    return this.get(`${this.servicePath}/analytics`, {
      dateFrom,
      dateTo,
      groupBy,
      paymentMethod,
      currency
    });
  }

  async getPaymentStatistics(period = 'month') {
    return this.get(`${this.servicePath}/statistics`, { period });
  }

  async getPaymentMethodStats(dateFrom, dateTo) {
    return this.get(`${this.servicePath}/method-stats`, {
      dateFrom,
      dateTo
    });
  }

  async generatePaymentReport(reportType, params = {}) {
    return this.post(`${this.servicePath}/reports/${reportType}`, params);
  }

  // Webhook Management
  async getWebhooks() {
    return this.get(`${this.servicePath}/webhooks`);
  }

  async createWebhook(webhookData) {
    const {
      url,
      events,
      description,
      secret
    } = webhookData;

    return this.post(`${this.servicePath}/webhooks`, {
      url,
      events,
      description,
      secret
    });
  }

  async updateWebhook(webhookId, updateData) {
    return this.put(`${this.servicePath}/webhooks/${webhookId}`, updateData);
  }

  async deleteWebhook(webhookId) {
    return this.delete(`${this.servicePath}/webhooks/${webhookId}`);
  }

  async testWebhook(webhookId, eventType) {
    return this.post(`${this.servicePath}/webhooks/${webhookId}/test`, {
      eventType
    });
  }

  // Security & Fraud Detection
  async validateTransaction(transactionData) {
    return this.post(`${this.servicePath}/security/validate`, transactionData);
  }

  async reportFraudulentActivity(reportData) {
    const {
      paymentId,
      fraudType,
      description,
      evidence = []
    } = reportData;

    return this.post(`${this.servicePath}/security/report-fraud`, {
      paymentId,
      fraudType,
      description,
      evidence
    });
  }

  async blockPaymentMethod(methodId, reason) {
    return this.post(`${this.servicePath}/security/block-method`, {
      methodId,
      reason
    });
  }

  async unblockPaymentMethod(methodId, reason) {
    return this.post(`${this.servicePath}/security/unblock-method`, {
      methodId,
      reason
    });
  }

  // Payment Gateway Configuration
  async getGatewayConfig(gateway) {
    return this.get(`${this.servicePath}/config/${gateway}`);
  }

  async updateGatewayConfig(gateway, config) {
    return this.put(`${this.servicePath}/config/${gateway}`, config);
  }

  async testGatewayConnection(gateway) {
    return this.post(`${this.servicePath}/config/${gateway}/test`);
  }

  // Currency & Exchange
  async getSupportedCurrencies() {
    return this.get(`${this.servicePath}/currencies`);
  }

  async getExchangeRates(baseCurrency = 'BDT') {
    return this.get(`${this.servicePath}/exchange-rates`, { baseCurrency });
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    return this.post(`${this.servicePath}/convert`, {
      amount,
      fromCurrency,
      toCurrency
    });
  }

  // Bulk Operations
  async processBulkPayments(payments) {
    return this.post(`${this.servicePath}/bulk/process`, { payments });
  }

  async getBulkPaymentStatus(batchId) {
    return this.get(`${this.servicePath}/bulk/status/${batchId}`);
  }

  async refundBulkPayments(refundData) {
    return this.post(`${this.servicePath}/bulk/refund`, refundData);
  }

  // Bangladesh-Specific Features
  async checkMobileBankingLimits(provider, mobile) {
    return this.get(`${this.servicePath}/bangladesh/limits/${provider}`, { mobile });
  }

  async getBangladeshPaymentMethods() {
    return this.get(`${this.servicePath}/bangladesh/methods`);
  }

  async validateBangladeshMobile(mobile) {
    return this.post(`${this.servicePath}/bangladesh/validate-mobile`, { mobile });
  }

  async getAreaWiseCODAvailability(area) {
    return this.get(`${this.servicePath}/bangladesh/cod-availability`, { area });
  }

  async getDivisionWisePaymentStats(division) {
    return this.get(`${this.servicePath}/bangladesh/stats/${division}`);
  }

  // Subscription & Recurring Payments
  async createSubscription(subscriptionData) {
    const {
      customerId,
      planId,
      paymentMethodId,
      trialDays = 0,
      metadata = {}
    } = subscriptionData;

    return this.post(`${this.servicePath}/subscriptions`, {
      customerId,
      planId,
      paymentMethodId,
      trialDays,
      metadata
    });
  }

  async getSubscription(subscriptionId) {
    return this.get(`${this.servicePath}/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(subscriptionId, updateData) {
    return this.patch(`${this.servicePath}/subscriptions/${subscriptionId}`, updateData);
  }

  async cancelSubscription(subscriptionId, reason = '') {
    return this.post(`${this.servicePath}/subscriptions/${subscriptionId}/cancel`, {
      reason
    });
  }

  async pauseSubscription(subscriptionId, pauseData) {
    return this.post(`${this.servicePath}/subscriptions/${subscriptionId}/pause`, pauseData);
  }

  async resumeSubscription(subscriptionId) {
    return this.post(`${this.servicePath}/subscriptions/${subscriptionId}/resume`);
  }

  // Payment Disputes
  async createDispute(disputeData) {
    const {
      paymentId,
      reason,
      description,
      evidence = []
    } = disputeData;

    return this.post(`${this.servicePath}/disputes`, {
      paymentId,
      reason,
      description,
      evidence
    });
  }

  async getDispute(disputeId) {
    return this.get(`${this.servicePath}/disputes/${disputeId}`);
  }

  async updateDispute(disputeId, updateData) {
    return this.patch(`${this.servicePath}/disputes/${disputeId}`, updateData);
  }

  async submitDisputeEvidence(disputeId, evidence) {
    return this.post(`${this.servicePath}/disputes/${disputeId}/evidence`, {
      evidence
    });
  }

  // Health Check
  async healthCheck() {
    return this.get(`${this.servicePath}/health`);
  }
}

// Create and export singleton instance
const paymentService = new PaymentService();

export default paymentService;