import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Subscription Service API Integration
 * Amazon.com/Shopee.sg-level subscription commerce functionality with complete backend synchronization
 */
export class SubscriptionApiService {
  constructor() {
    this.baseUrl = '/api/v1/subscriptions';
  }

  // ================================
  // SUBSCRIPTION PLANS MANAGEMENT
  // ================================

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans(filters = {}) {
    const params = new URLSearchParams({
      category: filters.category || '',
      priceRange: filters.priceRange || '',
      duration: filters.duration || '',
      isActive: filters.isActive || 'true',
      featured: filters.featured || '',
      vendorId: filters.vendorId || ''
    });

    return await apiRequest(`${this.baseUrl}/plans?${params}`);
  }

  /**
   * Get subscription plan details
   */
  async getSubscriptionPlan(planId) {
    return await apiRequest(`${this.baseUrl}/plans/${planId}`);
  }

  /**
   * Create subscription plan
   */
  async createSubscriptionPlan(planData) {
    return await apiRequest(`${this.baseUrl}/plans`, {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(planId, updateData) {
    return await apiRequest(`${this.baseUrl}/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Delete subscription plan
   */
  async deleteSubscriptionPlan(planId) {
    return await apiRequest(`${this.baseUrl}/plans/${planId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Toggle plan availability
   */
  async togglePlanAvailability(planId, isActive) {
    return await apiRequest(`${this.baseUrl}/plans/${planId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ isActive })
    });
  }

  // ================================
  // CUSTOMER SUBSCRIPTIONS
  // ================================

  /**
   * Get customer subscriptions
   */
  async getCustomerSubscriptions(customerId, filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      sortBy: filters.sortBy || 'created_at',
      sortOrder: filters.sortOrder || 'desc',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/customers/${customerId}/subscriptions?${params}`);
  }

  /**
   * Get active subscriptions for customer
   */
  async getActiveSubscriptions(customerId) {
    return await apiRequest(`${this.baseUrl}/customers/${customerId}/subscriptions/active`);
  }

  /**
   * Create new subscription
   */
  async createSubscription(subscriptionData) {
    return await apiRequest(`${this.baseUrl}/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData)
    });
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}`);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, reason = '', cancelAtPeriodEnd = true) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, cancelAtPeriodEnd })
    });
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId, pauseDuration = '', reason = '') {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/pause`, {
      method: 'POST',
      body: JSON.stringify({ pauseDuration, reason })
    });
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/resume`, {
      method: 'POST'
    });
  }

  /**
   * Upgrade/downgrade subscription
   */
  async changeSubscriptionPlan(subscriptionId, newPlanId, prorationBehavior = 'immediate') {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/change-plan`, {
      method: 'POST',
      body: JSON.stringify({ newPlanId, prorationBehavior })
    });
  }

  // ================================
  // BILLING & PAYMENTS
  // ================================

  /**
   * Get subscription billing history
   */
  async getBillingHistory(subscriptionId, limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    return await apiRequest(`${this.baseUrl}/${subscriptionId}/billing-history?${params}`);
  }

  /**
   * Get upcoming invoice
   */
  async getUpcomingInvoice(subscriptionId) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/upcoming-invoice`);
  }

  /**
   * Process immediate payment
   */
  async processImmediatePayment(subscriptionId, amount, paymentMethodId) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/immediate-payment`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethodId })
    });
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(subscriptionId, paymentMethodData) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/payment-method`, {
      method: 'PUT',
      body: JSON.stringify(paymentMethodData)
    });
  }

  /**
   * Retry failed payment
   */
  async retryFailedPayment(subscriptionId, invoiceId) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/retry-payment`, {
      method: 'POST',
      body: JSON.stringify({ invoiceId })
    });
  }

  // ================================
  // FREE TRIALS
  // ================================

  /**
   * Start free trial
   */
  async startFreeTrial(trialData) {
    return await apiRequest(`${this.baseUrl}/trials/start`, {
      method: 'POST',
      body: JSON.stringify(trialData)
    });
  }

  /**
   * Get trial status
   */
  async getTrialStatus(customerId, planId) {
    const params = new URLSearchParams({
      customerId,
      planId
    });

    return await apiRequest(`${this.baseUrl}/trials/status?${params}`);
  }

  /**
   * Convert trial to paid subscription
   */
  async convertTrialToPaid(trialId, paymentMethodData) {
    return await apiRequest(`${this.baseUrl}/trials/${trialId}/convert`, {
      method: 'POST',
      body: JSON.stringify(paymentMethodData)
    });
  }

  /**
   * Cancel trial
   */
  async cancelTrial(trialId, reason = '') {
    return await apiRequest(`${this.baseUrl}/trials/${trialId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Extend trial period
   */
  async extendTrial(trialId, extensionDays, reason = '') {
    return await apiRequest(`${this.baseUrl}/trials/${trialId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ extensionDays, reason })
    });
  }

  // ================================
  // SUBSCRIPTION ANALYTICS
  // ================================

  /**
   * Get subscription analytics dashboard
   */
  async getSubscriptionAnalytics(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      vendorId: filters.vendorId || '',
      planType: filters.planType || '',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/analytics/dashboard?${params}`);
  }

  /**
   * Get churn analysis
   */
  async getChurnAnalysis(period = '30d', segmentation = 'plan') {
    const params = new URLSearchParams({
      period,
      segmentation // 'plan', 'duration', 'price', 'cohort'
    });

    return await apiRequest(`${this.baseUrl}/analytics/churn-analysis?${params}`);
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(period = '30d', breakdown = 'daily') {
    const params = new URLSearchParams({
      period,
      breakdown // 'daily', 'weekly', 'monthly'
    });

    return await apiRequest(`${this.baseUrl}/analytics/revenue-metrics?${params}`);
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(cohortType = 'monthly', period = '12m') {
    const params = new URLSearchParams({
      cohortType,
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/cohort-analysis?${params}`);
  }

  /**
   * Get subscription lifecycle metrics
   */
  async getLifecycleMetrics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/lifecycle-metrics?${params}`);
  }

  // ================================
  // DUNNING MANAGEMENT
  // ================================

  /**
   * Get dunning campaigns
   */
  async getDunningCampaigns() {
    return await apiRequest(`${this.baseUrl}/dunning/campaigns`);
  }

  /**
   * Create dunning campaign
   */
  async createDunningCampaign(campaignData) {
    return await apiRequest(`${this.baseUrl}/dunning/campaigns`, {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
  }

  /**
   * Get failed payments requiring dunning
   */
  async getFailedPayments(filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      daysPastDue: filters.daysPastDue || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/dunning/failed-payments?${params}`);
  }

  /**
   * Process dunning for subscription
   */
  async processDunning(subscriptionId, dunningStage = 'reminder_1') {
    return await apiRequest(`${this.baseUrl}/dunning/process`, {
      method: 'POST',
      body: JSON.stringify({ subscriptionId, dunningStage })
    });
  }

  /**
   * Update dunning settings
   */
  async updateDunningSettings(settingsData) {
    return await apiRequest(`${this.baseUrl}/dunning/settings`, {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }

  // ================================
  // COUPONS & DISCOUNTS
  // ================================

  /**
   * Apply coupon to subscription
   */
  async applyCoupon(subscriptionId, couponCode) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/apply-coupon`, {
      method: 'POST',
      body: JSON.stringify({ couponCode })
    });
  }

  /**
   * Remove coupon from subscription
   */
  async removeCoupon(subscriptionId, couponId) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/remove-coupon`, {
      method: 'POST',
      body: JSON.stringify({ couponId })
    });
  }

  /**
   * Validate coupon for subscription
   */
  async validateCoupon(couponCode, planId) {
    return await apiRequest(`${this.baseUrl}/validate-coupon`, {
      method: 'POST',
      body: JSON.stringify({ couponCode, planId })
    });
  }

  /**
   * Get available coupons for plan
   */
  async getAvailableCoupons(planId) {
    return await apiRequest(`${this.baseUrl}/plans/${planId}/available-coupons`);
  }

  // ================================
  // SUBSCRIPTION ADDONS
  // ================================

  /**
   * Get available addons for plan
   */
  async getAvailableAddons(planId) {
    return await apiRequest(`${this.baseUrl}/plans/${planId}/addons`);
  }

  /**
   * Add addon to subscription
   */
  async addAddonToSubscription(subscriptionId, addonData) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/addons`, {
      method: 'POST',
      body: JSON.stringify(addonData)
    });
  }

  /**
   * Remove addon from subscription
   */
  async removeAddonFromSubscription(subscriptionId, addonId) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/addons/${addonId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Update addon quantity
   */
  async updateAddonQuantity(subscriptionId, addonId, quantity) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/addons/${addonId}/quantity`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  // ================================
  // BANGLADESH-SPECIFIC FEATURES
  // ================================

  /**
   * Get Bangladesh subscription plans
   */
  async getBangladeshSubscriptionPlans() {
    return await apiRequest(`${this.baseUrl}/bangladesh/plans`);
  }

  /**
   * Process Bangladesh mobile banking subscription
   */
  async processBangladeshMobileBankingSubscription(subscriptionData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/mobile-banking-subscription`, {
      method: 'POST',
      body: JSON.stringify({ ...subscriptionData, country: 'BD' })
    });
  }

  /**
   * Get Bangladesh payment method options
   */
  async getBangladeshPaymentMethods() {
    return await apiRequest(`${this.baseUrl}/bangladesh/payment-methods`);
  }

  /**
   * Calculate Bangladesh tax for subscription
   */
  async calculateBangladeshTax(planId, location) {
    return await apiRequest(`${this.baseUrl}/bangladesh/calculate-tax`, {
      method: 'POST',
      body: JSON.stringify({ planId, location, country: 'BD' })
    });
  }

  // ================================
  // SUBSCRIPTION MANAGEMENT
  // ================================

  /**
   * Get subscription usage metrics
   */
  async getUsageMetrics(subscriptionId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/${subscriptionId}/usage-metrics?${params}`);
  }

  /**
   * Update subscription preferences
   */
  async updateSubscriptionPreferences(subscriptionId, preferences) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  /**
   * Get subscription notifications
   */
  async getSubscriptionNotifications(subscriptionId) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/notifications`);
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(subscriptionId, notificationSettings) {
    return await apiRequest(`${this.baseUrl}/${subscriptionId}/notification-preferences`, {
      method: 'PUT',
      body: JSON.stringify(notificationSettings)
    });
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Get real-time subscription metrics
   */
  async getRealTimeSubscriptionMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  /**
   * Subscribe to subscription events
   */
  subscribeToSubscriptionEvents(onEvent, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/subscriptions/events/subscribe`;
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
  // EXPORT & REPORTING
  // ================================

  /**
   * Export subscription data
   */
  async exportSubscriptionData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'subscriptions', 'billing', 'analytics', 'churn'
      format: filters.format || 'csv',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate subscription report
   */
  async generateSubscriptionReport(reportType, period, filters = {}) {
    return await apiRequest(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify({ reportType, period, ...filters })
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Calculate subscription price with taxes
   */
  calculatePriceWithTax(basePrice, taxRate, country = 'BD') {
    const tax = basePrice * (taxRate / 100);
    const totalPrice = basePrice + tax;
    
    return {
      basePrice: basePrice,
      taxAmount: tax,
      totalPrice: totalPrice,
      formattedBasePrice: this.formatCurrency(basePrice, country),
      formattedTaxAmount: this.formatCurrency(tax, country),
      formattedTotalPrice: this.formatCurrency(totalPrice, country)
    };
  }

  /**
   * Format currency based on country
   */
  formatCurrency(amount, country = 'BD') {
    const currencies = {
      'BD': { currency: 'BDT', locale: 'en-BD' },
      'US': { currency: 'USD', locale: 'en-US' },
      'IN': { currency: 'INR', locale: 'en-IN' }
    };
    
    const { currency, locale } = currencies[country] || currencies['BD'];
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get subscription status color
   */
  getStatusColor(status) {
    const colors = {
      'active': '#10B981',
      'trialing': '#3B82F6',
      'past_due': '#F59E0B',
      'canceled': '#EF4444',
      'unpaid': '#DC2626',
      'paused': '#8B5CF6',
      'incomplete': '#6B7280'
    };
    return colors[status.toLowerCase()] || '#6B7280';
  }

  /**
   * Calculate days until next billing
   */
  getDaysUntilNextBilling(nextBillingDate) {
    const now = new Date();
    const billing = new Date(nextBillingDate);
    const diffTime = billing.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Format subscription duration
   */
  formatDuration(duration, period) {
    const periods = {
      'day': 'day',
      'week': 'week', 
      'month': 'month',
      'year': 'year'
    };
    
    const periodName = periods[period] || period;
    return duration === 1 ? `1 ${periodName}` : `${duration} ${periodName}s`;
  }

  /**
   * Handle API errors with proper subscription context
   */
  handleError(error, operation) {
    console.error(`Subscription API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected subscription error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Subscription authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this subscription operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested subscription was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Subscription conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid subscription data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many subscription requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Subscription server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const subscriptionApiService = new SubscriptionApiService();