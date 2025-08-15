// Vendor Service
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Vendor API Service
// Complete vendor marketplace management and multi-vendor operations

import BaseApiService from './BaseApiService.js';

class VendorService extends BaseApiService {
  constructor() {
    super();
    this.servicePath = '/vendors';
  }

  // Vendor Discovery & Listing
  async getVendors(params = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      location,
      rating,
      verified = null,
      featured = null,
      sortBy = 'rating',
      division,
      district,
      businessType,
      deliveryOptions,
      ...filters
    } = params;

    const queryParams = { page, limit, sortBy, ...filters };
    
    if (category) queryParams.category = category;
    if (location) queryParams.location = location;
    if (rating) queryParams.rating = rating;
    if (verified !== null) queryParams.verified = verified;
    if (featured !== null) queryParams.featured = featured;
    if (division) queryParams.division = division;
    if (district) queryParams.district = district;
    if (businessType) queryParams.businessType = businessType;
    if (deliveryOptions) queryParams.deliveryOptions = deliveryOptions;

    return this.get(this.servicePath, queryParams);
  }

  async getVendorById(vendorId) {
    return this.get(`${this.servicePath}/${vendorId}`);
  }

  async getFeaturedVendors(limit = 12) {
    return this.get(`${this.servicePath}/featured`, { limit });
  }

  async getTopRatedVendors(limit = 10) {
    return this.get(`${this.servicePath}/top-rated`, { limit });
  }

  async getVerifiedVendors(params = {}) {
    return this.get(`${this.servicePath}/verified`, params);
  }

  async getNewVendors(limit = 15) {
    return this.get(`${this.servicePath}/new-vendors`, { limit });
  }

  // Vendor Registration & Onboarding
  async registerVendor(vendorData) {
    const {
      // Business Information
      businessName,
      businessType, // 'individual', 'partnership', 'corporation', 'cooperative'
      businessCategory,
      businessDescription,
      businessLicense,
      taxIdentificationNumber,
      
      // Contact Information
      contactPerson,
      email,
      phone,
      alternatePhone,
      website,
      
      // Address Information
      businessAddress,
      warehouseAddress,
      returnAddress,
      
      // Bangladesh-specific
      tradeNumber,
      nidNumber,
      bankAccountDetails,
      mobileBankingAccounts,
      
      // Documents
      documents = [],
      
      // Additional Info
      expectedCategories = [],
      estimatedRevenue,
      numberOfEmployees,
      yearsInBusiness,
      referralSource
    } = vendorData;

    const registrationData = {
      businessName,
      businessType,
      businessCategory,
      businessDescription,
      businessLicense,
      taxIdentificationNumber,
      contactPerson,
      email,
      phone,
      alternatePhone,
      website,
      businessAddress,
      warehouseAddress,
      returnAddress,
      tradeNumber,
      nidNumber,
      bankAccountDetails,
      mobileBankingAccounts,
      documents,
      expectedCategories,
      estimatedRevenue,
      numberOfEmployees,
      yearsInBusiness,
      referralSource
    };

    return this.post(`${this.servicePath}/register`, registrationData);
  }

  async checkRegistrationStatus(applicationId) {
    return this.get(`${this.servicePath}/registration/status/${applicationId}`);
  }

  async submitAdditionalDocuments(applicationId, documents) {
    return this.post(`${this.servicePath}/registration/${applicationId}/documents`, {
      documents
    });
  }

  async completeOnboarding(vendorId, onboardingData) {
    return this.post(`${this.servicePath}/${vendorId}/complete-onboarding`, onboardingData);
  }

  // Vendor Profile Management
  async updateVendorProfile(vendorId, profileData) {
    const {
      businessName,
      businessDescription,
      logo,
      banner,
      contactInfo,
      socialMedia,
      businessHours,
      holidaySchedule,
      shippingPolicies,
      returnPolicies,
      customerServiceInfo,
      preferredLanguages = ['bn', 'en']
    } = profileData;

    return this.put(`${this.servicePath}/${vendorId}/profile`, {
      businessName,
      businessDescription,
      logo,
      banner,
      contactInfo,
      socialMedia,
      businessHours,
      holidaySchedule,
      shippingPolicies,
      returnPolicies,
      customerServiceInfo,
      preferredLanguages
    });
  }

  async uploadVendorLogo(vendorId, logoFile) {
    return this.upload(`${this.servicePath}/${vendorId}/logo`, logoFile);
  }

  async uploadVendorBanner(vendorId, bannerFile) {
    return this.upload(`${this.servicePath}/${vendorId}/banner`, bannerFile);
  }

  async getVendorProfile(vendorId) {
    return this.get(`${this.servicePath}/${vendorId}/profile`);
  }

  // Vendor Store Management
  async getVendorStore(vendorId) {
    return this.get(`${this.servicePath}/${vendorId}/store`);
  }

  async updateStoreSettings(vendorId, storeData) {
    const {
      storeName,
      storeDescription,
      storeTheme,
      customColors,
      featuredProducts,
      categories,
      announcements,
      promotions,
      socialProof,
      trustBadges
    } = storeData;

    return this.put(`${this.servicePath}/${vendorId}/store`, {
      storeName,
      storeDescription,
      storeTheme,
      customColors,
      featuredProducts,
      categories,
      announcements,
      promotions,
      socialProof,
      trustBadges
    });
  }

  async getStoreAnalytics(vendorId, params = {}) {
    const {
      dateFrom,
      dateTo,
      metrics = ['visitors', 'views', 'conversions'],
      granularity = 'day'
    } = params;

    return this.get(`${this.servicePath}/${vendorId}/store/analytics`, {
      dateFrom,
      dateTo,
      metrics: metrics.join(','),
      granularity
    });
  }

  // Vendor Products
  async getVendorProducts(vendorId, params = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      status = 'active',
      sortBy = 'date_desc',
      search
    } = params;

    const queryParams = { page, limit, status, sortBy };
    if (category) queryParams.category = category;
    if (search) queryParams.search = search;

    return this.get(`${this.servicePath}/${vendorId}/products`, queryParams);
  }

  async getVendorProductCategories(vendorId) {
    return this.get(`${this.servicePath}/${vendorId}/categories`);
  }

  async getTopSellingProducts(vendorId, limit = 10) {
    return this.get(`${this.servicePath}/${vendorId}/products/top-selling`, { limit });
  }

  async getLowStockProducts(vendorId, threshold = 10) {
    return this.get(`${this.servicePath}/${vendorId}/products/low-stock`, { threshold });
  }

  // Vendor Orders Management
  async getVendorOrders(vendorId, params = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo,
      sortBy = 'date_desc',
      paymentStatus,
      fulfillmentStatus
    } = params;

    const queryParams = { page, limit, sortBy };
    if (status) queryParams.status = status;
    if (dateFrom) queryParams.dateFrom = dateFrom;
    if (dateTo) queryParams.dateTo = dateTo;
    if (paymentStatus) queryParams.paymentStatus = paymentStatus;
    if (fulfillmentStatus) queryParams.fulfillmentStatus = fulfillmentStatus;

    return this.get(`${this.servicePath}/${vendorId}/orders`, queryParams);
  }

  async updateOrderStatus(vendorId, orderId, status, notes = '') {
    return this.patch(`${this.servicePath}/${vendorId}/orders/${orderId}/status`, {
      status,
      notes
    });
  }

  async markOrderAsShipped(vendorId, orderId, shippingData) {
    const {
      trackingNumber,
      courier,
      shippingMethod,
      estimatedDelivery,
      shippingCost,
      notes
    } = shippingData;

    return this.post(`${this.servicePath}/${vendorId}/orders/${orderId}/ship`, {
      trackingNumber,
      courier,
      shippingMethod,
      estimatedDelivery,
      shippingCost,
      notes
    });
  }

  async processOrderReturn(vendorId, orderId, returnData) {
    return this.post(`${this.servicePath}/${vendorId}/orders/${orderId}/return`, returnData);
  }

  // Vendor Financial Management
  async getVendorEarnings(vendorId, params = {}) {
    const {
      dateFrom,
      dateTo,
      status = 'all',
      type = 'all'
    } = params;

    return this.get(`${this.servicePath}/${vendorId}/earnings`, {
      dateFrom,
      dateTo,
      status,
      type
    });
  }

  async getVendorPayouts(vendorId, params = {}) {
    return this.get(`${this.servicePath}/${vendorId}/payouts`, params);
  }

  async requestPayout(vendorId, payoutData) {
    const {
      amount,
      paymentMethod = 'bank_transfer',
      accountDetails,
      notes
    } = payoutData;

    return this.post(`${this.servicePath}/${vendorId}/payouts/request`, {
      amount,
      paymentMethod,
      accountDetails,
      notes
    });
  }

  async getVendorCommissions(vendorId, params = {}) {
    return this.get(`${this.servicePath}/${vendorId}/commissions`, params);
  }

  async getFinancialSummary(vendorId, period = 'month') {
    return this.get(`${this.servicePath}/${vendorId}/financial-summary`, { period });
  }

  // Vendor Analytics & Performance
  async getVendorDashboard(vendorId) {
    return this.get(`${this.servicePath}/${vendorId}/dashboard`);
  }

  async getVendorAnalytics(vendorId, params = {}) {
    const {
      dateFrom,
      dateTo,
      metrics = ['sales', 'visitors', 'conversion_rate', 'revenue'],
      granularity = 'day'
    } = params;

    return this.get(`${this.servicePath}/${vendorId}/analytics`, {
      dateFrom,
      dateTo,
      metrics: metrics.join(','),
      granularity
    });
  }

  async getPerformanceMetrics(vendorId, period = 'month') {
    return this.get(`${this.servicePath}/${vendorId}/performance`, { period });
  }

  async getVendorReports(vendorId, reportType, params = {}) {
    return this.get(`${this.servicePath}/${vendorId}/reports/${reportType}`, params);
  }

  // Vendor Reviews & Ratings
  async getVendorReviews(vendorId, params = {}) {
    const {
      page = 1,
      limit = 10,
      rating = null,
      sortBy = 'newest',
      verified = null
    } = params;

    const queryParams = { page, limit, sortBy };
    if (rating) queryParams.rating = rating;
    if (verified !== null) queryParams.verified = verified;

    return this.get(`${this.servicePath}/${vendorId}/reviews`, queryParams);
  }

  async getVendorRating(vendorId) {
    return this.get(`${this.servicePath}/${vendorId}/rating`);
  }

  async respondToReview(vendorId, reviewId, response) {
    return this.post(`${this.servicePath}/${vendorId}/reviews/${reviewId}/respond`, {
      response
    });
  }

  // Vendor Communication
  async getVendorMessages(vendorId, params = {}) {
    return this.get(`${this.servicePath}/${vendorId}/messages`, params);
  }

  async sendMessage(vendorId, messageData) {
    const {
      recipientId,
      recipientType, // 'customer', 'admin', 'support'
      subject,
      message,
      priority = 'normal',
      attachments = []
    } = messageData;

    return this.post(`${this.servicePath}/${vendorId}/messages`, {
      recipientId,
      recipientType,
      subject,
      message,
      priority,
      attachments
    });
  }

  async markMessageAsRead(vendorId, messageId) {
    return this.post(`${this.servicePath}/${vendorId}/messages/${messageId}/read`);
  }

  // Vendor Support & Help
  async getVendorTickets(vendorId, params = {}) {
    return this.get(`${this.servicePath}/${vendorId}/support/tickets`, params);
  }

  async createSupportTicket(vendorId, ticketData) {
    const {
      category,
      subject,
      description,
      priority = 'medium',
      attachments = []
    } = ticketData;

    return this.post(`${this.servicePath}/${vendorId}/support/tickets`, {
      category,
      subject,
      description,
      priority,
      attachments
    });
  }

  async replyToTicket(vendorId, ticketId, reply) {
    return this.post(`${this.servicePath}/${vendorId}/support/tickets/${ticketId}/reply`, {
      reply
    });
  }

  // Vendor Settings & Preferences
  async getVendorSettings(vendorId) {
    return this.get(`${this.servicePath}/${vendorId}/settings`);
  }

  async updateVendorSettings(vendorId, settings) {
    const {
      notifications,
      shipping,
      payment,
      tax,
      inventory,
      general,
      security
    } = settings;

    return this.put(`${this.servicePath}/${vendorId}/settings`, {
      notifications,
      shipping,
      payment,
      tax,
      inventory,
      general,
      security
    });
  }

  async updateNotificationSettings(vendorId, notificationSettings) {
    return this.patch(`${this.servicePath}/${vendorId}/settings/notifications`, {
      settings: notificationSettings
    });
  }

  // Vendor Verification & KYC
  async getKYCStatus(vendorId) {
    return this.get(`${this.servicePath}/${vendorId}/kyc/status`);
  }

  async submitKYCDocuments(vendorId, documents) {
    return this.post(`${this.servicePath}/${vendorId}/kyc/documents`, {
      documents
    });
  }

  async updateKYCInformation(vendorId, kycData) {
    const {
      personalInfo,
      businessInfo,
      financialInfo,
      documents
    } = kycData;

    return this.put(`${this.servicePath}/${vendorId}/kyc`, {
      personalInfo,
      businessInfo,
      financialInfo,
      documents
    });
  }

  // Bangladesh-Specific Features
  async verifyTradeNumber(tradeNumber) {
    return this.post(`${this.servicePath}/verify/trade-number`, { tradeNumber });
  }

  async verifyTaxNumber(taxNumber) {
    return this.post(`${this.servicePath}/verify/tax-number`, { taxNumber });
  }

  async updateMobileBankingAccounts(vendorId, accounts) {
    return this.put(`${this.servicePath}/${vendorId}/mobile-banking`, { accounts });
  }

  async getVendorsByDivision(division, params = {}) {
    return this.get(`${this.servicePath}/division/${division}`, params);
  }

  async getLocalVendors(lat, lng, radius = 50, params = {}) {
    return this.get(`${this.servicePath}/local`, {
      lat,
      lng,
      radius,
      ...params
    });
  }

  // Vendor Search & Discovery
  async searchVendors(query, params = {}) {
    const {
      page = 1,
      limit = 20,
      filters = {},
      sortBy = 'relevance'
    } = params;

    return this.get(`${this.servicePath}/search`, {
      q: query,
      page,
      limit,
      sortBy,
      ...filters
    });
  }

  async getVendorSuggestions(query, limit = 8) {
    return this.get(`${this.servicePath}/search/suggestions`, {
      q: query,
      limit
    });
  }

  // Vendor Following & Favorites
  async followVendor(vendorId, userId) {
    return this.post(`${this.servicePath}/${vendorId}/follow`, { userId });
  }

  async unfollowVendor(vendorId, userId) {
    return this.delete(`${this.servicePath}/${vendorId}/follow`, {
      data: { userId }
    });
  }

  async getVendorFollowers(vendorId, params = {}) {
    return this.get(`${this.servicePath}/${vendorId}/followers`, params);
  }

  async getFollowedVendors(userId, params = {}) {
    return this.get(`${this.servicePath}/followed`, { userId, ...params });
  }

  // Vendor Comparison
  async compareVendors(vendorIds) {
    return this.post(`${this.servicePath}/compare`, { vendorIds });
  }

  async getVendorCompetitors(vendorId, limit = 5) {
    return this.get(`${this.servicePath}/${vendorId}/competitors`, { limit });
  }

  // Bulk Operations
  async getBulkVendors(vendorIds) {
    return this.post(`${this.servicePath}/bulk`, { vendorIds });
  }

  async exportVendorData(vendorId, dataType, format = 'csv') {
    return this.get(`${this.servicePath}/${vendorId}/export/${dataType}`, { format });
  }

  // Vendor Promotions & Marketing
  async getVendorPromotions(vendorId, params = {}) {
    return this.get(`${this.servicePath}/${vendorId}/promotions`, params);
  }

  async createPromotion(vendorId, promotionData) {
    return this.post(`${this.servicePath}/${vendorId}/promotions`, promotionData);
  }

  async updatePromotion(vendorId, promotionId, promotionData) {
    return this.put(`${this.servicePath}/${vendorId}/promotions/${promotionId}`, promotionData);
  }

  async deletePromotion(vendorId, promotionId) {
    return this.delete(`${this.servicePath}/${vendorId}/promotions/${promotionId}`);
  }

  // Health Check
  async healthCheck() {
    return this.get(`${this.servicePath}/health`);
  }
}

// Create and export singleton instance
const vendorService = new VendorService();

export default vendorService;