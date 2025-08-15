/**
 * Vendor Management API Service - Amazon.com/Shopee.sg Level
 * Complete vendor management service with all API endpoints
 */

class VendorManagementApiService {
  constructor() {
    this.baseURL = '/api/v1/vendors';
    this.token = localStorage.getItem('authToken');
  }

  // Helper method for making authenticated API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ======================
  // VENDOR REGISTRATION WORKFLOW ENDPOINTS
  // ======================

  /**
   * Step 1: Initiate Vendor Registration
   * Create basic vendor account with business information
   */
  async initiateRegistration(registrationData) {
    return this.makeRequest('/registration/initiate', {
      method: 'POST',
      body: JSON.stringify({
        businessName: registrationData.businessName,
        businessType: registrationData.businessType,
        contactEmail: registrationData.contactEmail,
        contactPhone: registrationData.contactPhone,
        businessAddress: registrationData.businessAddress,
        establishmentYear: registrationData.establishmentYear,
        employeeCount: registrationData.employeeCount,
        website: registrationData.website,
        expectedMonthlyVolume: registrationData.expectedMonthlyVolume
      })
    });
  }

  /**
   * Step 2: Submit KYC Documents
   * Upload and submit verification documents
   */
  async submitDocuments(vendorId, documents) {
    const formData = new FormData();
    
    // Add document files to form data
    Object.entries(documents).forEach(([key, file]) => {
      if (file && file instanceof File) {
        formData.append(key, file);
      }
    });

    return this.makeRequest(`/${vendorId}/registration/documents`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData
    });
  }

  /**
   * Step 3: Setup Bank Details
   * Configure banking and mobile banking information
   */
  async setupBankDetails(vendorId, bankDetails) {
    return this.makeRequest(`/${vendorId}/registration/bank-details`, {
      method: 'POST',
      body: JSON.stringify({
        bankName: bankDetails.bankName,
        branchName: bankDetails.branchName,
        accountNumber: bankDetails.accountNumber,
        accountHolderName: bankDetails.accountHolderName,
        routingNumber: bankDetails.routingNumber,
        swiftCode: bankDetails.swiftCode,
        accountType: bankDetails.accountType,
        mobileBankingAccounts: bankDetails.mobileBanking
      })
    });
  }

  /**
   * Step 4: Store Setup
   * Configure store branding and policies
   */
  async setupStore(vendorId, storeData) {
    const formData = new FormData();
    
    // Add store data
    formData.append('storeName', storeData.storeName);
    formData.append('storeDescription', storeData.storeDescription);
    formData.append('storeSlug', storeData.storeSlug);
    formData.append('categories', JSON.stringify(storeData.categories));
    formData.append('policies', JSON.stringify(storeData.policies));
    formData.append('operatingHours', JSON.stringify(storeData.operatingHours));
    formData.append('shippingAreas', JSON.stringify(storeData.shippingAreas));

    // Add image files
    if (storeData.logo) formData.append('logo', storeData.logo);
    if (storeData.banner) formData.append('banner', storeData.banner);

    return this.makeRequest(`/${vendorId}/registration/store-setup`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData
    });
  }

  /**
   * Get Registration Status
   * Track onboarding progress
   */
  async getRegistrationStatus(vendorId) {
    return this.makeRequest(`/${vendorId}/registration/status`);
  }

  // ======================
  // VENDOR PERFORMANCE MANAGEMENT ENDPOINTS
  // ======================

  /**
   * Calculate Performance Metrics
   * Trigger performance calculation for specified period
   */
  async calculatePerformanceMetrics(vendorId, period = '30d') {
    return this.makeRequest(`/${vendorId}/performance/calculate?period=${period}`, {
      method: 'POST'
    });
  }

  /**
   * Get Performance Dashboard
   * Comprehensive performance overview
   */
  async getPerformanceDashboard(vendorId) {
    return this.makeRequest(`/${vendorId}/performance/dashboard`);
  }

  /**
   * Set Performance Targets
   * Update vendor performance goals
   */
  async setPerformanceTargets(vendorId, targets) {
    return this.makeRequest(`/${vendorId}/performance/targets`, {
      method: 'POST',
      body: JSON.stringify({
        fulfillmentRateTarget: targets.fulfillmentRateTarget,
        customerRatingTarget: targets.customerRatingTarget,
        responseTimeTarget: targets.responseTimeTarget,
        returnRateTarget: targets.returnRateTarget,
        onTimeDeliveryTarget: targets.onTimeDeliveryTarget
      })
    });
  }

  /**
   * Get Performance Benchmarks
   * Industry and platform benchmarks
   */
  async getPerformanceBenchmarks(vendorId) {
    return this.makeRequest(`/${vendorId}/performance/benchmarks`);
  }

  /**
   * Process Performance Action
   * Handle warnings, probation, suspension
   */
  async processPerformanceAction(vendorId, actionData) {
    return this.makeRequest(`/${vendorId}/performance/action`, {
      method: 'POST',
      body: JSON.stringify({
        action: actionData.action,
        reason: actionData.reason,
        duration: actionData.duration,
        notes: actionData.notes
      })
    });
  }

  // ======================
  // VENDOR SUBSCRIPTION MANAGEMENT ENDPOINTS
  // ======================

  /**
   * Get Available Subscription Plans
   * List all subscription tiers with benefits
   */
  async getAvailablePlans() {
    return this.makeRequest('/subscription/plans');
  }

  /**
   * Subscribe to Plan
   * Upgrade or change subscription tier
   */
  async subscribeToPlan(vendorId, planId, paymentMethod = 'bank_transfer') {
    return this.makeRequest(`/${vendorId}/subscription/subscribe`, {
      method: 'POST',
      body: JSON.stringify({
        planId,
        paymentMethod
      })
    });
  }

  /**
   * Get Current Subscription
   * Current plan details and usage
   */
  async getCurrentSubscription(vendorId) {
    return this.makeRequest(`/${vendorId}/subscription/current`);
  }

  /**
   * Cancel Subscription
   * Cancel or downgrade subscription
   */
  async cancelSubscription(vendorId, reason, downgrade = false) {
    return this.makeRequest(`/${vendorId}/subscription/cancel`, {
      method: 'POST',
      body: JSON.stringify({
        reason,
        downgrade
      })
    });
  }

  /**
   * Get Subscription Analytics
   * ROI and subscription performance data
   */
  async getSubscriptionAnalytics(vendorId, period = '30d') {
    return this.makeRequest(`/${vendorId}/subscription/analytics?period=${period}`);
  }

  // ======================
  // VENDOR BASIC MANAGEMENT ENDPOINTS
  // ======================

  /**
   * Get Vendor Profile
   * Complete vendor information
   */
  async getVendorProfile(vendorId) {
    return this.makeRequest(`/${vendorId}`);
  }

  /**
   * Update Vendor Profile
   * Update basic vendor information
   */
  async updateVendorProfile(vendorId, profileData) {
    return this.makeRequest(`/${vendorId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  /**
   * Get Vendor List
   * Search and filter vendors
   */
  async getVendorList(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    return this.makeRequest(`${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Approve Vendor (Admin only)
   * Approve pending vendor registration
   */
  async approveVendor(vendorId, approvalData) {
    return this.makeRequest(`/${vendorId}/approve`, {
      method: 'POST',
      body: JSON.stringify(approvalData)
    });
  }

  /**
   * Reject Vendor (Admin only)
   * Reject vendor registration
   */
  async rejectVendor(vendorId, rejectionData) {
    return this.makeRequest(`/${vendorId}/reject`, {
      method: 'POST',
      body: JSON.stringify(rejectionData)
    });
  }

  // ======================
  // VENDOR ANALYTICS ENDPOINTS
  // ======================

  /**
   * Get Vendor Analytics
   * Sales, performance, and business analytics
   */
  async getVendorAnalytics(vendorId, period = '30d', metrics = []) {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    
    if (metrics.length > 0) {
      queryParams.append('metrics', metrics.join(','));
    }

    return this.makeRequest(`/${vendorId}/analytics?${queryParams.toString()}`);
  }

  /**
   * Get Sales Report
   * Detailed sales analytics
   */
  async getSalesReport(vendorId, startDate, endDate) {
    return this.makeRequest(`/${vendorId}/analytics/sales`, {
      method: 'POST',
      body: JSON.stringify({
        startDate,
        endDate
      })
    });
  }

  /**
   * Export Analytics Data
   * Download analytics in various formats
   */
  async exportAnalyticsData(vendorId, format = 'csv', period = '30d') {
    const response = await fetch(`${this.baseURL}/${vendorId}/analytics/export?format=${format}&period=${period}`, {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      }
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // ======================
  // PAYOUT MANAGEMENT ENDPOINTS
  // ======================

  /**
   * Get Payout History
   * List all vendor payouts
   */
  async getPayoutHistory(vendorId, page = 1, limit = 20) {
    return this.makeRequest(`/${vendorId}/payouts?page=${page}&limit=${limit}`);
  }

  /**
   * Request Payout
   * Request manual payout
   */
  async requestPayout(vendorId, amount, paymentMethod) {
    return this.makeRequest(`/${vendorId}/payouts/request`, {
      method: 'POST',
      body: JSON.stringify({
        amount,
        paymentMethod
      })
    });
  }

  /**
   * Get Payout Schedule
   * Current payout schedule settings
   */
  async getPayoutSchedule(vendorId) {
    return this.makeRequest(`/${vendorId}/payouts/schedule`);
  }

  /**
   * Update Payout Schedule
   * Configure automatic payout schedule
   */
  async updatePayoutSchedule(vendorId, scheduleData) {
    return this.makeRequest(`/${vendorId}/payouts/schedule`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  }

  // ======================
  // KYC MANAGEMENT ENDPOINTS
  // ======================

  /**
   * Get KYC Status
   * Current KYC verification status
   */
  async getKYCStatus(vendorId) {
    return this.makeRequest(`/${vendorId}/kyc/status`);
  }

  /**
   * Submit KYC Documents
   * Upload KYC verification documents
   */
  async submitKYCDocuments(vendorId, documents, personalInfo) {
    const formData = new FormData();
    
    // Add personal information
    formData.append('personalInfo', JSON.stringify(personalInfo));
    
    // Add document files
    Object.entries(documents).forEach(([key, file]) => {
      if (file && file instanceof File) {
        formData.append(key, file);
      }
    });

    return this.makeRequest(`/${vendorId}/kyc/submit`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData
    });
  }

  // ======================
  // STORE MANAGEMENT ENDPOINTS
  // ======================

  /**
   * Get Store Details
   * Complete store information
   */
  async getStoreDetails(vendorId) {
    return this.makeRequest(`/${vendorId}/store`);
  }

  /**
   * Update Store Settings
   * Update store configuration
   */
  async updateStoreSettings(vendorId, storeData) {
    return this.makeRequest(`/${vendorId}/store`, {
      method: 'PUT',
      body: JSON.stringify(storeData)
    });
  }

  /**
   * Upload Store Media
   * Upload store logo, banner, or other media
   */
  async uploadStoreMedia(vendorId, mediaType, file) {
    const formData = new FormData();
    formData.append('mediaType', mediaType);
    formData.append('file', file);

    return this.makeRequest(`/${vendorId}/store/media`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData
    });
  }

  // ======================
  // UTILITY METHODS
  // ======================

  /**
   * Update Authentication Token
   * Set new auth token for requests
   */
  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Get Service Health
   * Check vendor service health
   */
  async getServiceHealth() {
    const endpoints = [
      '/health',
      '/registration/health',
      '/performance/health',
      '/subscription/health',
      '/analytics/health',
      '/payouts/health'
    ];

    const healthChecks = await Promise.allSettled(
      endpoints.map(endpoint => this.makeRequest(endpoint))
    );

    return {
      overall: healthChecks.every(check => check.status === 'fulfilled') ? 'healthy' : 'degraded',
      services: healthChecks.map((check, index) => ({
        endpoint: endpoints[index],
        status: check.status === 'fulfilled' ? 'healthy' : 'error',
        response: check.status === 'fulfilled' ? check.value : check.reason.message
      }))
    };
  }

  /**
   * Upload File Helper
   * Generic file upload method
   */
  async uploadFile(file, uploadType = 'document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);

    return this.makeRequest('/upload', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData
    });
  }

  /**
   * Validate Business Information
   * Validate business data before submission
   */
  validateBusinessInfo(businessData) {
    const errors = [];

    if (!businessData.businessName) {
      errors.push('Business name is required');
    }

    if (!businessData.businessType) {
      errors.push('Business type is required');
    }

    if (!businessData.contactEmail) {
      errors.push('Contact email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessData.contactEmail)) {
      errors.push('Valid email address is required');
    }

    if (!businessData.contactPhone) {
      errors.push('Contact phone is required');
    } else if (!/^(\+880|880|0)1[3-9]\d{8}$/.test(businessData.contactPhone)) {
      errors.push('Valid Bangladesh phone number is required');
    }

    if (!businessData.businessAddress) {
      errors.push('Business address is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format Response Data
   * Standardize API response format
   */
  formatResponse(data) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle API Errors
   * Standardize error handling
   */
  handleError(error) {
    console.error('Vendor API Error:', error);
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const vendorManagementApi = new VendorManagementApiService();
export default vendorManagementApi;