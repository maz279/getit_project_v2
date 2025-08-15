/**
 * KYC API Service - Amazon.com/Shopee.sg-Level Implementation
 * Complete API integration for KYC operations with ML/AI capabilities
 * Features: OCR processing, face verification, fraud detection, government integration
 */

class KYCApiService {
  constructor() {
    this.baseURL = '/api/v1/kyc';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Generic API request handler with error handling
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        status: response.status
      };
    } catch (error) {
      console.error(`KYC API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error.message,
        status: error.status || 500
      };
    }
  }

  /**
   * File upload helper with progress tracking
   */
  async uploadFile(endpoint, file, additionalData = {}, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({
                success: true,
                data: response,
                status: xhr.status
              });
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Request timeout'));
        });

        xhr.timeout = this.timeout;
        xhr.open('POST', `${this.baseURL}${endpoint}`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error(`File upload error (${endpoint}):`, error);
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  // ==================== HEALTH & STATUS ====================

  /**
   * Get KYC service health status
   */
  async getHealth() {
    return this.makeRequest('/health');
  }

  /**
   * Get KYC service information
   */
  async getServiceInfo() {
    return this.makeRequest('/info');
  }

  /**
   * Get KYC statistics and metrics
   */
  async getStats() {
    return this.makeRequest('/stats');
  }

  // ==================== APPLICATION MANAGEMENT ====================

  /**
   * Create new KYC application
   */
  async createApplication(applicationData) {
    return this.makeRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  /**
   * Get all KYC applications with filtering
   */
  async getApplications(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/applications?${queryParams}` : '/applications';
    return this.makeRequest(endpoint);
  }

  /**
   * Get specific KYC application by ID
   */
  async getApplication(applicationId) {
    return this.makeRequest(`/applications/${applicationId}`);
  }

  /**
   * Update KYC application
   */
  async updateApplication(applicationId, updateData) {
    return this.makeRequest(`/applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId, status, notes = '') {
    return this.makeRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  }

  /**
   * Delete KYC application
   */
  async deleteApplication(applicationId) {
    return this.makeRequest(`/applications/${applicationId}`, {
      method: 'DELETE'
    });
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  /**
   * Upload document with OCR processing
   */
  async uploadDocument(file, documentType, applicationId, onProgress = null) {
    return this.uploadFile('/documents/upload', file, {
      documentType,
      applicationId
    }, onProgress);
  }

  /**
   * Process document with OCR
   */
  async processOCR(file, documentType, onProgress = null) {
    return this.uploadFile('/ocr/process', file, {
      type: documentType
    }, onProgress);
  }

  /**
   * Get OCR results
   */
  async getOCRResults(documentId) {
    return this.makeRequest(`/ocr/results/${documentId}`);
  }

  /**
   * Verify document authenticity
   */
  async verifyDocument(documentId, verificationType) {
    return this.makeRequest(`/documents/${documentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verificationType })
    });
  }

  // ==================== FACE VERIFICATION ====================

  /**
   * Upload selfie for face verification
   */
  async uploadSelfie(file, applicationId, onProgress = null) {
    return this.uploadFile('/face/upload', file, {
      applicationId
    }, onProgress);
  }

  /**
   * Perform face verification
   */
  async verifyFace(selfieFile, nidPhotoFile, onProgress = null) {
    const formData = new FormData();
    formData.append('selfie', selfieFile);
    if (nidPhotoFile) {
      formData.append('nidPhoto', nidPhotoFile);
    }

    return this.uploadFile('/face/verify', selfieFile, {
      nidPhoto: nidPhotoFile
    }, onProgress);
  }

  /**
   * Get face verification results
   */
  async getFaceVerificationResults(applicationId) {
    return this.makeRequest(`/face/results/${applicationId}`);
  }

  /**
   * Perform liveness detection
   */
  async livenessDetection(videoFile, onProgress = null) {
    return this.uploadFile('/face/liveness', videoFile, {}, onProgress);
  }

  // ==================== FRAUD DETECTION ====================

  /**
   * Run fraud detection analysis
   */
  async detectFraud(applicationData) {
    return this.makeRequest('/fraud/detect', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  /**
   * Get fraud risk score
   */
  async getFraudRiskScore(applicationId) {
    return this.makeRequest(`/fraud/risk-score/${applicationId}`);
  }

  /**
   * Report suspected fraud
   */
  async reportFraud(applicationId, reason, evidence = {}) {
    return this.makeRequest('/fraud/report', {
      method: 'POST',
      body: JSON.stringify({
        applicationId,
        reason,
        evidence
      })
    });
  }

  /**
   * Get fraud detection analytics
   */
  async getFraudAnalytics(timeframe = '30d') {
    return this.makeRequest(`/fraud/analytics?timeframe=${timeframe}`);
  }

  // ==================== GOVERNMENT VERIFICATION ====================

  /**
   * Verify NID with Bangladesh Election Commission
   */
  async verifyNID(nidNumber, dateOfBirth) {
    return this.makeRequest('/government/verify/nid', {
      method: 'POST',
      body: JSON.stringify({
        nidNumber,
        dateOfBirth
      })
    });
  }

  /**
   * Verify Trade License with RJSC
   */
  async verifyTradeLicense(tradeLicenseNumber, businessName) {
    return this.makeRequest('/government/verify/trade-license', {
      method: 'POST',
      body: JSON.stringify({
        tradeLicenseNumber,
        businessName
      })
    });
  }

  /**
   * Verify TIN with NBR
   */
  async verifyTIN(tinNumber, businessName) {
    return this.makeRequest('/government/verify/tin', {
      method: 'POST',
      body: JSON.stringify({
        tinNumber,
        businessName
      })
    });
  }

  /**
   * Check Bangladesh Bank records
   */
  async verifyBankAccount(accountNumber, bankCode, accountHolderName) {
    return this.makeRequest('/government/verify/bank-account', {
      method: 'POST',
      body: JSON.stringify({
        accountNumber,
        bankCode,
        accountHolderName
      })
    });
  }

  /**
   * Get government verification status
   */
  async getGovernmentVerificationStatus(applicationId) {
    return this.makeRequest(`/government/verification-status/${applicationId}`);
  }

  // ==================== ML/AI INSIGHTS ====================

  /**
   * Get ML model predictions
   */
  async getMLPredictions(applicationId) {
    return this.makeRequest(`/ml/predictions/${applicationId}`);
  }

  /**
   * Get confidence scores
   */
  async getConfidenceScores(applicationId) {
    return this.makeRequest(`/ml/confidence-scores/${applicationId}`);
  }

  /**
   * Get anomaly detection results
   */
  async getAnomalyDetection(applicationId) {
    return this.makeRequest(`/ml/anomaly-detection/${applicationId}`);
  }

  /**
   * Train ML models (admin only)
   */
  async trainMLModels(trainingData) {
    return this.makeRequest('/ml/train', {
      method: 'POST',
      body: JSON.stringify(trainingData)
    });
  }

  /**
   * Get ML model performance metrics
   */
  async getMLMetrics() {
    return this.makeRequest('/ml/metrics');
  }

  // ==================== AUDIT & COMPLIANCE ====================

  /**
   * Get audit trail for application
   */
  async getAuditTrail(applicationId, limit = 50) {
    return this.makeRequest(`/audit/trail/${applicationId}?limit=${limit}`);
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(timeframe = '24h') {
    return this.makeRequest(`/audit/statistics?timeframe=${timeframe}`);
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(startDate, endDate, format = 'json') {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      format
    });
    
    return this.makeRequest(`/audit/export?${params}`);
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(timeframe = '30d') {
    return this.makeRequest(`/compliance/report?timeframe=${timeframe}`);
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get notifications for user
   */
  async getNotifications(userId, unreadOnly = false) {
    return this.makeRequest(`/notifications/${userId}?unreadOnly=${unreadOnly}`);
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId) {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  /**
   * Send KYC status notification
   */
  async sendStatusNotification(applicationId, status, message) {
    return this.makeRequest('/notifications/send', {
      method: 'POST',
      body: JSON.stringify({
        applicationId,
        status,
        message
      })
    });
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  /**
   * Get dashboard data
   */
  async getDashboardData(timeframe = '30d') {
    return this.makeRequest(`/dashboard?timeframe=${timeframe}`);
  }

  /**
   * Get processing times analytics
   */
  async getProcessingTimesAnalytics() {
    return this.makeRequest('/analytics/processing-times');
  }

  /**
   * Get verification success rates
   */
  async getVerificationRates() {
    return this.makeRequest('/analytics/verification-rates');
  }

  /**
   * Get geographical analytics
   */
  async getGeographicalAnalytics() {
    return this.makeRequest('/analytics/geographical');
  }

  // ==================== BANGLADESH-SPECIFIC FEATURES ====================

  /**
   * Validate Bangladesh phone number
   */
  async validateBangladeshPhone(phoneNumber) {
    return this.makeRequest('/bangladesh/validate-phone', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber })
    });
  }

  /**
   * Get Bangladesh district information
   */
  async getBangladeshDistricts() {
    return this.makeRequest('/bangladesh/districts');
  }

  /**
   * Validate Bangladesh address format
   */
  async validateBangladeshAddress(address) {
    return this.makeRequest('/bangladesh/validate-address', {
      method: 'POST',
      body: JSON.stringify({ address })
    });
  }

  /**
   * Get Bangladesh business categories
   */
  async getBangladeshBusinessCategories() {
    return this.makeRequest('/bangladesh/business-categories');
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if service is available
   */
  async checkServiceAvailability() {
    try {
      const response = await this.getHealth();
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get supported document types
   */
  getSupportedDocumentTypes() {
    return [
      'nid_front',
      'nid_back',
      'trade_license',
      'tin_certificate',
      'bank_statement',
      'utility_bill',
      'passport',
      'driving_license'
    ];
  }

  /**
   * Get supported image formats
   */
  getSupportedImageFormats() {
    return ['image/jpeg', 'image/png', 'image/webp'];
  }

  /**
   * Get maximum file size (in bytes)
   */
  getMaxFileSize() {
    return 10 * 1024 * 1024; // 10MB
  }

  /**
   * Validate file before upload
   */
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file selected');
      return { valid: false, errors };
    }

    // Check file size
    if (file.size > this.getMaxFileSize()) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check file type
    const supportedTypes = [...this.getSupportedImageFormats(), 'application/pdf'];
    if (!supportedTypes.includes(file.type)) {
      errors.push('Unsupported file format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format error message for display
   */
  formatErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return 'An unexpected error occurred';
  }
}

// Export singleton instance
export default new KYCApiService();