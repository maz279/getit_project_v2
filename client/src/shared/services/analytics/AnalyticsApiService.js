import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Analytics Service API Integration
 * Amazon.com/Shopee.sg-level business intelligence functionality with complete backend synchronization
 */
export class AnalyticsApiService {
  constructor() {
    this.baseUrl = '/api/v1/analytics';
  }

  // ================================
  // DASHBOARD ANALYTICS
  // ================================

  /**
   * Get comprehensive analytics dashboard
   */
  async getDashboard(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      timezone: filters.timezone || 'Asia/Dhaka',
      breakdown: filters.breakdown || 'daily',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/dashboard?${params}`);
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  /**
   * Get key performance indicators
   */
  async getKPIs(period = '30d', compareWith = 'previous_period') {
    const params = new URLSearchParams({
      period,
      compareWith
    });

    return await apiRequest(`${this.baseUrl}/kpis?${params}`);
  }

  // ================================
  // SALES ANALYTICS
  // ================================

  /**
   * Get sales analytics
   */
  async getSalesAnalytics(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      vendorId: filters.vendorId || '',
      categoryId: filters.categoryId || '',
      region: filters.region || '',
      breakdown: filters.breakdown || 'daily'
    });

    return await apiRequest(`${this.baseUrl}/sales?${params}`);
  }

  /**
   * Get revenue trends
   */
  async getRevenueTrends(period = '90d', breakdown = 'daily') {
    const params = new URLSearchParams({
      period,
      breakdown
    });

    return await apiRequest(`${this.baseUrl}/sales/revenue-trends?${params}`);
  }

  /**
   * Get top performing products
   */
  async getTopProducts(period = '30d', limit = 10, metric = 'revenue') {
    const params = new URLSearchParams({
      period,
      limit: limit.toString(),
      metric // 'revenue', 'units_sold', 'profit_margin'
    });

    return await apiRequest(`${this.baseUrl}/sales/top-products?${params}`);
  }

  // ================================
  // CUSTOMER ANALYTICS
  // ================================

  /**
   * Get customer analytics overview
   */
  async getCustomerAnalytics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/customers?${params}`);
  }

  /**
   * Get customer acquisition metrics
   */
  async getCustomerAcquisition(period = '30d', breakdown = 'daily') {
    const params = new URLSearchParams({
      period,
      breakdown
    });

    return await apiRequest(`${this.baseUrl}/customers/acquisition?${params}`);
  }

  /**
   * Get customer lifetime value
   */
  async getCustomerLifetimeValue(segmentation = 'cohort', period = '12m') {
    const params = new URLSearchParams({
      segmentation,
      period
    });

    return await apiRequest(`${this.baseUrl}/customers/lifetime-value?${params}`);
  }

  /**
   * Get customer churn analysis
   */
  async getChurnAnalysis(period = '30d', riskLevel = '') {
    const params = new URLSearchParams({
      period,
      riskLevel // 'high', 'medium', 'low'
    });

    return await apiRequest(`${this.baseUrl}/customers/churn-analysis?${params}`);
  }

  // ================================
  // VENDOR ANALYTICS
  // ================================

  /**
   * Get vendor performance analytics
   */
  async getVendorAnalytics(vendorId = '', period = '30d') {
    const params = new URLSearchParams({
      vendorId,
      period
    });

    return await apiRequest(`${this.baseUrl}/vendors?${params}`);
  }

  /**
   * Get vendor rankings
   */
  async getVendorRankings(period = '30d', metric = 'revenue', limit = 20) {
    const params = new URLSearchParams({
      period,
      metric,
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/vendors/rankings?${params}`);
  }

  /**
   * Get vendor growth metrics
   */
  async getVendorGrowthMetrics(vendorId, period = '90d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/vendors/${vendorId}/growth?${params}`);
  }

  // ================================
  // TRAFFIC ANALYTICS
  // ================================

  /**
   * Get website traffic analytics
   */
  async getTrafficAnalytics(period = '30d', breakdown = 'daily') {
    const params = new URLSearchParams({
      period,
      breakdown
    });

    return await apiRequest(`${this.baseUrl}/traffic?${params}`);
  }

  /**
   * Get traffic sources
   */
  async getTrafficSources(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/traffic/sources?${params}`);
  }

  /**
   * Get page performance metrics
   */
  async getPagePerformance(period = '7d', page = '') {
    const params = new URLSearchParams({
      period,
      page
    });

    return await apiRequest(`${this.baseUrl}/traffic/page-performance?${params}`);
  }

  // ================================
  // CONVERSION ANALYTICS
  // ================================

  /**
   * Get conversion funnel analysis
   */
  async getConversionFunnel(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      source: filters.source || '',
      campaign: filters.campaign || ''
    });

    return await apiRequest(`${this.baseUrl}/conversion/funnel?${params}`);
  }

  /**
   * Get cart abandonment analysis
   */
  async getCartAbandonment(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/conversion/cart-abandonment?${params}`);
  }

  /**
   * Get checkout analytics
   */
  async getCheckoutAnalytics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/conversion/checkout?${params}`);
  }

  // ================================
  // BANGLADESH-SPECIFIC ANALYTICS
  // ================================

  /**
   * Get Bangladesh market analytics
   */
  async getBangladeshMarketAnalytics(period = '30d') {
    const params = new URLSearchParams({
      period,
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/market?${params}`);
  }

  /**
   * Get regional performance (Bangladesh divisions)
   */
  async getRegionalPerformance(period = '30d') {
    const params = new URLSearchParams({
      period,
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/regional-performance?${params}`);
  }

  /**
   * Get mobile banking analytics
   */
  async getMobileBankingAnalytics(period = '30d', provider = '') {
    const params = new URLSearchParams({
      period,
      provider, // 'bkash', 'nagad', 'rocket'
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/mobile-banking?${params}`);
  }

  /**
   * Get festival impact analytics
   */
  async getFestivalImpactAnalytics(festival = '', year = new Date().getFullYear()) {
    const params = new URLSearchParams({
      festival, // 'eid', 'pohela_boishakh', 'durga_puja'
      year: year.toString(),
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/festival-impact?${params}`);
  }

  // ================================
  // CUSTOM REPORTS
  // ================================

  /**
   * Generate custom report
   */
  async generateCustomReport(reportConfig) {
    return await apiRequest(`${this.baseUrl}/reports/custom`, {
      method: 'POST',
      body: JSON.stringify(reportConfig)
    });
  }

  /**
   * Get saved reports
   */
  async getSavedReports(userId = '') {
    const params = new URLSearchParams({
      userId
    });

    return await apiRequest(`${this.baseUrl}/reports/saved?${params}`);
  }

  /**
   * Save report configuration
   */
  async saveReport(reportConfig, reportName) {
    return await apiRequest(`${this.baseUrl}/reports/save`, {
      method: 'POST',
      body: JSON.stringify({ ...reportConfig, name: reportName })
    });
  }

  /**
   * Schedule report
   */
  async scheduleReport(reportId, scheduleConfig) {
    return await apiRequest(`${this.baseUrl}/reports/schedule`, {
      method: 'POST',
      body: JSON.stringify({ reportId, scheduleConfig })
    });
  }

  // ================================
  // EXPORT FUNCTIONALITY
  // ================================

  /**
   * Export analytics data
   */
  async exportData(exportConfig) {
    const params = new URLSearchParams({
      type: exportConfig.type || 'csv',
      period: exportConfig.period || '30d',
      category: exportConfig.category || 'all'
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Get export history
   */
  async getExportHistory(limit = 20) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/export/history?${params}`);
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Subscribe to real-time analytics updates
   */
  subscribeToRealTimeUpdates(onUpdate, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/analytics/real-time/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return ws;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Format analytics data for display
   */
  formatAnalyticsData(data, type) {
    if (type === 'currency') {
      return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT'
      }).format(data);
    } else if (type === 'percentage') {
      return `${data.toFixed(2)}%`;
    } else if (type === 'number') {
      return new Intl.NumberFormat('en-BD').format(data);
    }
    return data;
  }

  /**
   * Calculate growth rate
   */
  calculateGrowthRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get trend direction
   */
  getTrendDirection(current, previous) {
    const growth = this.calculateGrowthRate(current, previous);
    if (growth > 0) return 'up';
    if (growth < 0) return 'down';
    return 'stable';
  }

  /**
   * Handle API errors with proper analytics context
   */
  handleError(error, operation) {
    console.error(`Analytics API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected analytics error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Analytics authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to view analytics data.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested analytics data was not found.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many analytics requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Analytics server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const analyticsApiService = new AnalyticsApiService();