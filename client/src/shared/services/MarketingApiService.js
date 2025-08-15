import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Marketing Service API Integration
 * Amazon.com/Shopee.sg-level marketing automation functionality with complete backend synchronization
 */
export class MarketingApiService {
  constructor() {
    this.baseUrl = '/api/v1/marketing';
  }

  // ================================
  // CAMPAIGN MANAGEMENT
  // ================================

  /**
   * Get marketing campaigns overview
   */
  async getCampaignsOverview(filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      type: filters.type || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      page: filters.page || '1',
      limit: filters.limit || '20',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/campaigns?${params}`);
  }

  /**
   * Create marketing campaign
   */
  async createCampaign(campaignData) {
    return await apiRequest(`${this.baseUrl}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, updateData) {
    return await apiRequest(`${this.baseUrl}/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Get campaign details
   */
  async getCampaign(campaignId) {
    return await apiRequest(`${this.baseUrl}/campaigns/${campaignId}`);
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId) {
    return await apiRequest(`${this.baseUrl}/campaigns/${campaignId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Launch campaign
   */
  async launchCampaign(campaignId) {
    return await apiRequest(`${this.baseUrl}/campaigns/${campaignId}/launch`, {
      method: 'POST'
    });
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId, reason = '') {
    return await apiRequest(`${this.baseUrl}/campaigns/${campaignId}/pause`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // ================================
  // PROMOTIONS & DISCOUNTS
  // ================================

  /**
   * Get active promotions
   */
  async getActivePromotions(filters = {}) {
    const params = new URLSearchParams({
      type: filters.type || '', // 'percentage', 'fixed', 'bogo', 'free_shipping'
      category: filters.category || '',
      vendorId: filters.vendorId || '',
      includeExpired: filters.includeExpired || 'false'
    });

    return await apiRequest(`${this.baseUrl}/promotions/active?${params}`);
  }

  /**
   * Create promotion
   */
  async createPromotion(promotionData) {
    return await apiRequest(`${this.baseUrl}/promotions`, {
      method: 'POST',
      body: JSON.stringify(promotionData)
    });
  }

  /**
   * Apply discount code
   */
  async applyDiscountCode(code, orderData) {
    return await apiRequest(`${this.baseUrl}/promotions/apply-code`, {
      method: 'POST',
      body: JSON.stringify({ code, orderData })
    });
  }

  /**
   * Validate coupon code
   */
  async validateCouponCode(code, userId = '', productIds = []) {
    return await apiRequest(`${this.baseUrl}/promotions/validate-coupon`, {
      method: 'POST',
      body: JSON.stringify({ code, userId, productIds })
    });
  }

  /**
   * Get promotion analytics
   */
  async getPromotionAnalytics(promotionId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/promotions/${promotionId}/analytics?${params}`);
  }

  // ================================
  // EMAIL MARKETING
  // ================================

  /**
   * Create email campaign
   */
  async createEmailCampaign(emailData) {
    return await apiRequest(`${this.baseUrl}/email/campaigns`, {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  /**
   * Send email campaign
   */
  async sendEmailCampaign(campaignId, scheduleTime = null) {
    return await apiRequest(`${this.baseUrl}/email/campaigns/${campaignId}/send`, {
      method: 'POST',
      body: JSON.stringify({ scheduleTime })
    });
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(category = '') {
    const params = new URLSearchParams({
      category // 'welcome', 'promotional', 'transactional', 'newsletter'
    });

    return await apiRequest(`${this.baseUrl}/email/templates?${params}`);
  }

  /**
   * Create email template
   */
  async createEmailTemplate(templateData) {
    return await apiRequest(`${this.baseUrl}/email/templates`, {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
  }

  /**
   * Get email campaign stats
   */
  async getEmailCampaignStats(campaignId) {
    return await apiRequest(`${this.baseUrl}/email/campaigns/${campaignId}/stats`);
  }

  // ================================
  // CUSTOMER SEGMENTATION
  // ================================

  /**
   * Get customer segments
   */
  async getCustomerSegments() {
    return await apiRequest(`${this.baseUrl}/segments`);
  }

  /**
   * Create customer segment
   */
  async createCustomerSegment(segmentData) {
    return await apiRequest(`${this.baseUrl}/segments`, {
      method: 'POST',
      body: JSON.stringify(segmentData)
    });
  }

  /**
   * Get segment customers
   */
  async getSegmentCustomers(segmentId, page = 1, limit = 50) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/segments/${segmentId}/customers?${params}`);
  }

  /**
   * Add customers to segment
   */
  async addCustomersToSegment(segmentId, customerIds) {
    return await apiRequest(`${this.baseUrl}/segments/${segmentId}/customers`, {
      method: 'POST',
      body: JSON.stringify({ customerIds })
    });
  }

  // ================================
  // LOYALTY PROGRAMS
  // ================================

  /**
   * Get loyalty programs
   */
  async getLoyaltyPrograms() {
    return await apiRequest(`${this.baseUrl}/loyalty/programs`);
  }

  /**
   * Create loyalty program
   */
  async createLoyaltyProgram(programData) {
    return await apiRequest(`${this.baseUrl}/loyalty/programs`, {
      method: 'POST',
      body: JSON.stringify(programData)
    });
  }

  /**
   * Get customer loyalty points
   */
  async getCustomerLoyaltyPoints(customerId) {
    return await apiRequest(`${this.baseUrl}/loyalty/customers/${customerId}/points`);
  }

  /**
   * Award loyalty points
   */
  async awardLoyaltyPoints(customerId, points, reason, orderId = null) {
    return await apiRequest(`${this.baseUrl}/loyalty/award-points`, {
      method: 'POST',
      body: JSON.stringify({ customerId, points, reason, orderId })
    });
  }

  /**
   * Redeem loyalty points
   */
  async redeemLoyaltyPoints(customerId, points, redemptionType, metadata = {}) {
    return await apiRequest(`${this.baseUrl}/loyalty/redeem-points`, {
      method: 'POST',
      body: JSON.stringify({ customerId, points, redemptionType, metadata })
    });
  }

  // ================================
  // AFFILIATE MARKETING
  // ================================

  /**
   * Get affiliate programs
   */
  async getAffiliatePrograms() {
    return await apiRequest(`${this.baseUrl}/affiliate/programs`);
  }

  /**
   * Register affiliate
   */
  async registerAffiliate(affiliateData) {
    return await apiRequest(`${this.baseUrl}/affiliate/register`, {
      method: 'POST',
      body: JSON.stringify(affiliateData)
    });
  }

  /**
   * Generate affiliate link
   */
  async generateAffiliateLink(affiliateId, productId, campaignId = '') {
    return await apiRequest(`${this.baseUrl}/affiliate/generate-link`, {
      method: 'POST',
      body: JSON.stringify({ affiliateId, productId, campaignId })
    });
  }

  /**
   * Get affiliate performance
   */
  async getAffiliatePerformance(affiliateId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/affiliate/${affiliateId}/performance?${params}`);
  }

  /**
   * Track affiliate conversion
   */
  async trackAffiliateConversion(conversionData) {
    return await apiRequest(`${this.baseUrl}/affiliate/track-conversion`, {
      method: 'POST',
      body: JSON.stringify(conversionData)
    });
  }

  // ================================
  // BANGLADESH-SPECIFIC MARKETING
  // ================================

  /**
   * Create Bangladesh festival campaign
   */
  async createFestivalCampaign(festival, campaignData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/festivals/${festival}/campaign`, {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
  }

  /**
   * Get Bengali content templates
   */
  async getBengaliContentTemplates(type = '') {
    const params = new URLSearchParams({
      type, // 'eid', 'pohela_boishakh', 'victory_day', 'durga_puja'
      language: 'bn'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/content-templates?${params}`);
  }

  /**
   * Create mobile banking promotion
   */
  async createMobileBankingPromotion(promotionData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/mobile-banking-promotion`, {
      method: 'POST',
      body: JSON.stringify(promotionData)
    });
  }

  /**
   * Get regional marketing insights
   */
  async getRegionalMarketingInsights(division = '') {
    const params = new URLSearchParams({
      division // 'dhaka', 'chittagong', 'sylhet', etc.
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/regional-insights?${params}`);
  }

  // ================================
  // SOCIAL MEDIA MARKETING
  // ================================

  /**
   * Schedule social media post
   */
  async scheduleSocialMediaPost(postData) {
    return await apiRequest(`${this.baseUrl}/social/schedule-post`, {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  /**
   * Get social media analytics
   */
  async getSocialMediaAnalytics(platform, period = '30d') {
    const params = new URLSearchParams({
      platform, // 'facebook', 'instagram', 'twitter', 'linkedin'
      period
    });

    return await apiRequest(`${this.baseUrl}/social/analytics?${params}`);
  }

  /**
   * Create social media campaign
   */
  async createSocialMediaCampaign(campaignData) {
    return await apiRequest(`${this.baseUrl}/social/campaigns`, {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
  }

  // ================================
  // ANALYTICS & REPORTING
  // ================================

  /**
   * Get marketing analytics dashboard
   */
  async getMarketingAnalytics(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/analytics/dashboard?${params}`);
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(campaignId = '', period = '30d') {
    const params = new URLSearchParams({
      campaignId,
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/conversion-funnel?${params}`);
  }

  /**
   * Get ROI analysis
   */
  async getROIAnalysis(campaignId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/campaigns/${campaignId}/roi?${params}`);
  }

  /**
   * Get customer acquisition cost
   */
  async getCustomerAcquisitionCost(period = '30d', channel = '') {
    const params = new URLSearchParams({
      period,
      channel
    });

    return await apiRequest(`${this.baseUrl}/analytics/customer-acquisition-cost?${params}`);
  }

  /**
   * Get marketing attribution data
   */
  async getMarketingAttribution(customerId, period = '90d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/customers/${customerId}/attribution?${params}`);
  }

  // ================================
  // A/B TESTING
  // ================================

  /**
   * Create A/B test
   */
  async createABTest(testData) {
    return await apiRequest(`${this.baseUrl}/ab-testing/tests`, {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(testId) {
    return await apiRequest(`${this.baseUrl}/ab-testing/tests/${testId}/results`);
  }

  /**
   * End A/B test
   */
  async endABTest(testId, winningVariant) {
    return await apiRequest(`${this.baseUrl}/ab-testing/tests/${testId}/end`, {
      method: 'POST',
      body: JSON.stringify({ winningVariant })
    });
  }

  // ================================
  // AUTOMATION & WORKFLOWS
  // ================================

  /**
   * Create marketing automation workflow
   */
  async createAutomationWorkflow(workflowData) {
    return await apiRequest(`${this.baseUrl}/automation/workflows`, {
      method: 'POST',
      body: JSON.stringify(workflowData)
    });
  }

  /**
   * Trigger automation workflow
   */
  async triggerAutomationWorkflow(workflowId, customerId, triggerData = {}) {
    return await apiRequest(`${this.baseUrl}/automation/workflows/${workflowId}/trigger`, {
      method: 'POST',
      body: JSON.stringify({ customerId, triggerData })
    });
  }

  /**
   * Get automation workflow performance
   */
  async getAutomationWorkflowPerformance(workflowId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/automation/workflows/${workflowId}/performance?${params}`);
  }

  // ================================
  // LEAD MANAGEMENT
  // ================================

  /**
   * Capture lead
   */
  async captureLead(leadData) {
    return await apiRequest(`${this.baseUrl}/leads/capture`, {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  /**
   * Get leads
   */
  async getLeads(filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      source: filters.source || '',
      page: filters.page || '1',
      limit: filters.limit || '20',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/leads?${params}`);
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId, status, notes = '') {
    return await apiRequest(`${this.baseUrl}/leads/${leadId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  /**
   * Convert lead to customer
   */
  async convertLeadToCustomer(leadId, customerData) {
    return await apiRequest(`${this.baseUrl}/leads/${leadId}/convert`, {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  // ================================
  // EXPORT & REPORTING
  // ================================

  /**
   * Export marketing data
   */
  async exportMarketingData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'campaigns', 'promotions', 'customers', 'analytics'
      format: filters.format || 'csv',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate marketing report
   */
  async generateMarketingReport(reportType, period, filters = {}) {
    return await apiRequest(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify({ reportType, period, ...filters })
    });
  }

  // ================================
  // REAL-TIME MONITORING
  // ================================

  /**
   * Get real-time marketing metrics
   */
  async getRealTimeMarketingMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  /**
   * Subscribe to marketing events
   */
  subscribeToMarketingEvents(onEvent, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/marketing/events/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };
    
    return ws;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Calculate campaign ROI
   */
  calculateCampaignROI(revenue, cost) {
    if (cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  }

  /**
   * Format marketing metrics
   */
  formatMarketingMetrics(metrics) {
    return {
      ...metrics,
      formattedRevenue: new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT'
      }).format(metrics.revenue || 0),
      formattedCost: new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT'
      }).format(metrics.cost || 0),
      formattedROI: `${(metrics.roi || 0).toFixed(2)}%`,
      formattedConversionRate: `${(metrics.conversionRate || 0).toFixed(2)}%`
    };
  }

  /**
   * Handle API errors with proper marketing context
   */
  handleError(error, operation) {
    console.error(`Marketing API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected marketing error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Marketing authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this marketing operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested marketing resource was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Marketing campaign conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid marketing data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many marketing requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Marketing server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const marketingApiService = new MarketingApiService();