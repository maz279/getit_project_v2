import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Fraud Detection Service API Integration
 * Amazon.com/Shopee.sg-level fraud prevention functionality with complete backend synchronization
 */
export class FraudApiService {
  constructor() {
    this.baseUrl = '/api/v1/fraud';
  }

  // ================================
  // FRAUD DETECTION & SCORING
  // ================================

  /**
   * Analyze transaction for fraud risk
   */
  async analyzeTransaction(transactionData) {
    return await apiRequest(`${this.baseUrl}/analyze-transaction`, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  /**
   * Get real-time fraud score
   */
  async getFraudScore(userId, sessionData, transactionData = {}) {
    return await apiRequest(`${this.baseUrl}/score`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        sessionData,
        transactionData
      })
    });
  }

  /**
   * Validate user behavior patterns
   */
  async validateBehaviorPatterns(userId, behaviorData) {
    return await apiRequest(`${this.baseUrl}/validate-behavior`, {
      method: 'POST',
      body: JSON.stringify({ userId, behaviorData })
    });
  }

  /**
   * Check velocity rules
   */
  async checkVelocityRules(userId, action, metadata = {}) {
    return await apiRequest(`${this.baseUrl}/velocity-check`, {
      method: 'POST',
      body: JSON.stringify({ userId, action, metadata })
    });
  }

  // ================================
  // DEVICE FINGERPRINTING
  // ================================

  /**
   * Generate device fingerprint
   */
  async generateDeviceFingerprint(deviceData) {
    return await apiRequest(`${this.baseUrl}/device/fingerprint`, {
      method: 'POST',
      body: JSON.stringify(deviceData)
    });
  }

  /**
   * Validate device fingerprint
   */
  async validateDeviceFingerprint(fingerprintId, deviceData) {
    return await apiRequest(`${this.baseUrl}/device/validate`, {
      method: 'POST',
      body: JSON.stringify({ fingerprintId, deviceData })
    });
  }

  /**
   * Get device risk assessment
   */
  async getDeviceRiskAssessment(deviceId) {
    return await apiRequest(`${this.baseUrl}/device/${deviceId}/risk-assessment`);
  }

  /**
   * Track device anomalies
   */
  async trackDeviceAnomalies(deviceId, anomalyData) {
    return await apiRequest(`${this.baseUrl}/device/${deviceId}/anomalies`, {
      method: 'POST',
      body: JSON.stringify(anomalyData)
    });
  }

  // ================================
  // ACCOUNT PROTECTION
  // ================================

  /**
   * Detect account takeover attempts
   */
  async detectAccountTakeover(userId, loginData) {
    return await apiRequest(`${this.baseUrl}/account/takeover-detection`, {
      method: 'POST',
      body: JSON.stringify({ userId, loginData })
    });
  }

  /**
   * Monitor account anomalies
   */
  async monitorAccountAnomalies(userId, period = '7d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/account/${userId}/anomalies?${params}`);
  }

  /**
   * Verify account ownership
   */
  async verifyAccountOwnership(userId, verificationData) {
    return await apiRequest(`${this.baseUrl}/account/verify-ownership`, {
      method: 'POST',
      body: JSON.stringify({ userId, verificationData })
    });
  }

  /**
   * Lock/unlock account for security
   */
  async toggleAccountSecurity(userId, action, reason, duration = '') {
    return await apiRequest(`${this.baseUrl}/account/security-toggle`, {
      method: 'POST',
      body: JSON.stringify({ userId, action, reason, duration })
    });
  }

  // ================================
  // PAYMENT FRAUD DETECTION
  // ================================

  /**
   * Analyze payment fraud risk
   */
  async analyzePaymentFraud(paymentData) {
    return await apiRequest(`${this.baseUrl}/payment/analyze`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  /**
   * Validate payment method
   */
  async validatePaymentMethod(paymentMethodData) {
    return await apiRequest(`${this.baseUrl}/payment/validate-method`, {
      method: 'POST',
      body: JSON.stringify(paymentMethodData)
    });
  }

  /**
   * Check chargeback risk
   */
  async checkChargebackRisk(transactionData) {
    return await apiRequest(`${this.baseUrl}/payment/chargeback-risk`, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  /**
   * Bangladesh mobile banking fraud detection
   */
  async analyzeBangladeshMobileBanking(mobilePaymentData) {
    return await apiRequest(`${this.baseUrl}/payment/bangladesh-mobile-banking`, {
      method: 'POST',
      body: JSON.stringify({ ...mobilePaymentData, country: 'BD' })
    });
  }

  // ================================
  // MERCHANT & VENDOR FRAUD
  // ================================

  /**
   * Screen vendor applications
   */
  async screenVendorApplication(vendorData) {
    return await apiRequest(`${this.baseUrl}/vendor/screen-application`, {
      method: 'POST',
      body: JSON.stringify(vendorData)
    });
  }

  /**
   * Monitor vendor fraud patterns
   */
  async monitorVendorFraud(vendorId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/vendor/${vendorId}/fraud-monitoring?${params}`);
  }

  /**
   * Analyze listing fraud
   */
  async analyzeListingFraud(productData) {
    return await apiRequest(`${this.baseUrl}/vendor/analyze-listing`, {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  /**
   * Detect fake reviews
   */
  async detectFakeReviews(reviewData) {
    return await apiRequest(`${this.baseUrl}/vendor/detect-fake-reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  // ================================
  // INVESTIGATION & CASE MANAGEMENT
  // ================================

  /**
   * Create fraud investigation case
   */
  async createInvestigationCase(caseData) {
    return await apiRequest(`${this.baseUrl}/investigation/cases`, {
      method: 'POST',
      body: JSON.stringify(caseData)
    });
  }

  /**
   * Get investigation cases
   */
  async getInvestigationCases(filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      priority: filters.priority || '',
      assignedTo: filters.assignedTo || '',
      fraudType: filters.fraudType || '',
      page: filters.page || '1',
      limit: filters.limit || '20',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/investigation/cases?${params}`);
  }

  /**
   * Update investigation case
   */
  async updateInvestigationCase(caseId, updateData) {
    return await apiRequest(`${this.baseUrl}/investigation/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Add evidence to case
   */
  async addEvidence(caseId, evidenceData) {
    return await apiRequest(`${this.baseUrl}/investigation/cases/${caseId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(evidenceData)
    });
  }

  /**
   * Close investigation case
   */
  async closeInvestigationCase(caseId, resolution, actions = []) {
    return await apiRequest(`${this.baseUrl}/investigation/cases/${caseId}/close`, {
      method: 'POST',
      body: JSON.stringify({ resolution, actions })
    });
  }

  // ================================
  // FRAUD RULES ENGINE
  // ================================

  /**
   * Get fraud detection rules
   */
  async getFraudRules(category = '') {
    const params = new URLSearchParams({
      category // 'payment', 'account', 'transaction', 'behavioral'
    });

    return await apiRequest(`${this.baseUrl}/rules?${params}`);
  }

  /**
   * Create fraud detection rule
   */
  async createFraudRule(ruleData) {
    return await apiRequest(`${this.baseUrl}/rules`, {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
  }

  /**
   * Update fraud detection rule
   */
  async updateFraudRule(ruleId, ruleData) {
    return await apiRequest(`${this.baseUrl}/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData)
    });
  }

  /**
   * Test fraud rule
   */
  async testFraudRule(ruleId, testData) {
    return await apiRequest(`${this.baseUrl}/rules/${ruleId}/test`, {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  /**
   * Enable/disable fraud rule
   */
  async toggleFraudRule(ruleId, enabled) {
    return await apiRequest(`${this.baseUrl}/rules/${ruleId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled })
    });
  }

  // ================================
  // BLACKLIST & WHITELIST MANAGEMENT
  // ================================

  /**
   * Get blacklisted entities
   */
  async getBlacklist(type = '') {
    const params = new URLSearchParams({
      type // 'email', 'phone', 'ip', 'device', 'card'
    });

    return await apiRequest(`${this.baseUrl}/blacklist?${params}`);
  }

  /**
   * Add to blacklist
   */
  async addToBlacklist(entityData) {
    return await apiRequest(`${this.baseUrl}/blacklist`, {
      method: 'POST',
      body: JSON.stringify(entityData)
    });
  }

  /**
   * Remove from blacklist
   */
  async removeFromBlacklist(entityId, reason = '') {
    return await apiRequest(`${this.baseUrl}/blacklist/${entityId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Check blacklist status
   */
  async checkBlacklistStatus(entityType, entityValue) {
    return await apiRequest(`${this.baseUrl}/blacklist/check`, {
      method: 'POST',
      body: JSON.stringify({ type: entityType, value: entityValue })
    });
  }

  /**
   * Get whitelisted entities
   */
  async getWhitelist(type = '') {
    const params = new URLSearchParams({
      type
    });

    return await apiRequest(`${this.baseUrl}/whitelist?${params}`);
  }

  /**
   * Add to whitelist
   */
  async addToWhitelist(entityData) {
    return await apiRequest(`${this.baseUrl}/whitelist`, {
      method: 'POST',
      body: JSON.stringify(entityData)
    });
  }

  // ================================
  // MACHINE LEARNING MODELS
  // ================================

  /**
   * Get ML model performance
   */
  async getMLModelPerformance(modelType = '') {
    const params = new URLSearchParams({
      modelType // 'fraud_score', 'behavior_analysis', 'payment_risk'
    });

    return await apiRequest(`${this.baseUrl}/ml/model-performance?${params}`);
  }

  /**
   * Train ML model
   */
  async trainMLModel(modelData) {
    return await apiRequest(`${this.baseUrl}/ml/train`, {
      method: 'POST',
      body: JSON.stringify(modelData)
    });
  }

  /**
   * Get model predictions
   */
  async getModelPredictions(modelType, inputData) {
    return await apiRequest(`${this.baseUrl}/ml/predict`, {
      method: 'POST',
      body: JSON.stringify({ modelType, inputData })
    });
  }

  /**
   * Update model threshold
   */
  async updateModelThreshold(modelType, threshold, rationale = '') {
    return await apiRequest(`${this.baseUrl}/ml/update-threshold`, {
      method: 'POST',
      body: JSON.stringify({ modelType, threshold, rationale })
    });
  }

  // ================================
  // ANALYTICS & REPORTING
  // ================================

  /**
   * Get fraud analytics dashboard
   */
  async getFraudAnalytics(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/analytics/dashboard?${params}`);
  }

  /**
   * Get fraud trends
   */
  async getFraudTrends(period = '30d', breakdown = 'daily') {
    const params = new URLSearchParams({
      period,
      breakdown // 'hourly', 'daily', 'weekly'
    });

    return await apiRequest(`${this.baseUrl}/analytics/trends?${params}`);
  }

  /**
   * Get fraud prevention impact
   */
  async getFraudPreventionImpact(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/prevention-impact?${params}`);
  }

  /**
   * Generate fraud report
   */
  async generateFraudReport(reportType, period, filters = {}) {
    return await apiRequest(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify({ reportType, period, ...filters })
    });
  }

  // ================================
  // ALERT MANAGEMENT
  // ================================

  /**
   * Get fraud alerts
   */
  async getFraudAlerts(filters = {}) {
    const params = new URLSearchParams({
      severity: filters.severity || '',
      status: filters.status || '',
      type: filters.type || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/alerts?${params}`);
  }

  /**
   * Create fraud alert
   */
  async createFraudAlert(alertData) {
    return await apiRequest(`${this.baseUrl}/alerts`, {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(alertId, status, notes = '') {
    return await apiRequest(`${this.baseUrl}/alerts/${alertId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  /**
   * Configure alert rules
   */
  async configureAlertRules(ruleData) {
    return await apiRequest(`${this.baseUrl}/alerts/rules`, {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
  }

  // ================================
  // BANGLADESH-SPECIFIC FEATURES
  // ================================

  /**
   * Validate Bangladesh NID for fraud
   */
  async validateBangladeshNID(nid, userDetails) {
    return await apiRequest(`${this.baseUrl}/bangladesh/validate-nid`, {
      method: 'POST',
      body: JSON.stringify({ nid, userDetails, country: 'BD' })
    });
  }

  /**
   * Check mobile banking fraud patterns
   */
  async checkMobileBankingFraudPatterns(mobileNumber, provider, transactionHistory = []) {
    return await apiRequest(`${this.baseUrl}/bangladesh/mobile-banking-fraud`, {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, provider, transactionHistory })
    });
  }

  /**
   * Analyze regional fraud patterns
   */
  async analyzeBangladeshRegionalFraud(division, period = '30d') {
    const params = new URLSearchParams({
      division,
      period,
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/regional-fraud-analysis?${params}`);
  }

  // ================================
  // REAL-TIME MONITORING
  // ================================

  /**
   * Get real-time fraud metrics
   */
  async getRealTimeFraudMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  /**
   * Subscribe to fraud alerts
   */
  subscribeToFraudAlerts(onAlert, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/fraud/alerts/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onAlert(data);
    };
    
    return ws;
  }

  /**
   * Monitor live transactions
   */
  subscribeToLiveTransactionMonitoring(onTransaction, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/fraud/live-monitoring/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onTransaction(data);
    };
    
    return ws;
  }

  // ================================
  // BULK OPERATIONS
  // ================================

  /**
   * Bulk analyze transactions
   */
  async bulkAnalyzeTransactions(transactions) {
    return await apiRequest(`${this.baseUrl}/bulk/analyze-transactions`, {
      method: 'POST',
      body: JSON.stringify({ transactions })
    });
  }

  /**
   * Bulk update fraud cases
   */
  async bulkUpdateCases(caseIds, updateData) {
    return await apiRequest(`${this.baseUrl}/bulk/update-cases`, {
      method: 'POST',
      body: JSON.stringify({ caseIds, updateData })
    });
  }

  /**
   * Export fraud data
   */
  async exportFraudData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'cases', 'alerts', 'analytics', 'rules'
      format: filters.format || 'csv',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get fraud risk level color
   */
  getRiskLevelColor(riskScore) {
    if (riskScore >= 90) return '#DC2626'; // Critical - Red
    if (riskScore >= 70) return '#EA580C'; // High - Orange
    if (riskScore >= 50) return '#D97706'; // Medium - Amber
    if (riskScore >= 30) return '#CA8A04'; // Low - Yellow
    return '#059669'; // Very Low - Green
  }

  /**
   * Get fraud type icon
   */
  getFraudTypeIcon(fraudType) {
    const icons = {
      'payment': '💳',
      'account': '👤',
      'identity': '🆔',
      'transaction': '💰',
      'behavioral': '🧠',
      'device': '📱',
      'velocity': '⚡'
    };
    return icons[fraudType.toLowerCase()] || '🚨';
  }

  /**
   * Format fraud score
   */
  formatFraudScore(score, includeRisk = true) {
    const formattedScore = score.toFixed(1);
    if (!includeRisk) return formattedScore;

    let riskLevel = 'Very Low';
    if (score >= 90) riskLevel = 'Critical';
    else if (score >= 70) riskLevel = 'High';
    else if (score >= 50) riskLevel = 'Medium';
    else if (score >= 30) riskLevel = 'Low';

    return `${formattedScore} (${riskLevel})`;
  }

  /**
   * Calculate fraud prevention savings
   */
  calculatePreventionSavings(preventedAmount, costOfPrevention) {
    const savings = preventedAmount - costOfPrevention;
    const roi = costOfPrevention > 0 ? ((savings / costOfPrevention) * 100) : 0;
    
    return {
      totalSavings: savings,
      roi: roi,
      formattedSavings: new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT'
      }).format(savings),
      formattedROI: `${roi.toFixed(1)}%`
    };
  }

  /**
   * Handle API errors with proper fraud context
   */
  handleError(error, operation) {
    console.error(`Fraud API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected fraud detection error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Fraud detection authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this fraud operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested fraud resource was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Fraud data conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid fraud detection data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many fraud detection requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Fraud detection server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const fraudApiService = new FraudApiService();