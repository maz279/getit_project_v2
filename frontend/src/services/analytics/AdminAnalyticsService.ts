import { apiRequest } from '@/lib/queryClient';

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  activeUsers: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
}

export interface SalesTrendData {
  date: string;
  revenue: number;
  orders: number;
  users: number;
}

export interface RevenueBreakdownData {
  name: string;
  value: number;
  percentage: number;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface BusinessIntelligence {
  executiveMetrics: {
    totalRevenue: number;
    profitMargin: number;
    marketShare: number;
    customerSatisfaction: number;
  };
  operationalMetrics: {
    fulfillmentRate: number;
    averageShippingTime: number;
    customerServiceRating: number;
    vendorPerformance: number;
  };
  marketingMetrics: {
    acquisitionCost: number;
    lifetimeValue: number;
    retentionRate: number;
    campaignROI: number;
  };
}

export interface RealTimeAnalytics {
  currentVisitors: number;
  activeSessions: number;
  liveOrders: number;
  revenueToday: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
}

export interface BangladeshAnalytics {
  festivalImpact: {
    currentFestival: string;
    salesIncrease: number;
    topCategories: string[];
    regionPerformance: Array<{
      region: string;
      sales: number;
      growth: number;
    }>;
  };
  paymentMethods: Array<{
    method: string;
    usage: number;
    successRate: number;
  }>;
  culturalInsights: {
    prayerTimeImpact: number;
    weekendTrends: number;
    seasonalPatterns: Array<{
      season: string;
      impact: number;
    }>;
  };
}

/**
 * ADMIN ANALYTICS SERVICE
 * Amazon.com/Shopee.sg-Level Business Intelligence API Integration
 * 
 * Features:
 * - Real-time dashboard metrics
 * - Executive business intelligence
 * - Sales and revenue analytics
 * - Bangladesh market insights
 * - System alerts and monitoring
 * - Export and reporting capabilities
 */
export class AdminAnalyticsService {
  private static baseUrl = '/api/v1/analytics';

  // ============================================================================
  // DASHBOARD METRICS
  // ============================================================================

  /**
   * Get comprehensive dashboard metrics
   */
  static async getDashboardMetrics(timeRange: string = '7d'): Promise<DashboardMetrics> {
    const response = await apiRequest(`${this.baseUrl}/dashboard?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get analytics overview
   */
  static async getAnalyticsOverview(timeRange: string = '7d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/overview?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get real-time dashboard data
   */
  static async getRealTimeDashboard(): Promise<RealTimeAnalytics> {
    const response = await apiRequest(`${this.baseUrl}/realtime/dashboard`);
    return response.data;
  }

  // ============================================================================
  // SALES & REVENUE ANALYTICS
  // ============================================================================

  /**
   * Get sales trends over time
   */
  static async getSalesTrends(timeRange: string = '7d'): Promise<SalesTrendData[]> {
    const response = await apiRequest(`${this.baseUrl}/sales/trends?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get sales summary
   */
  static async getSalesSummary(timeRange: string = '7d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/sales/summary?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get revenue breakdown by category
   */
  static async getRevenueBreakdown(timeRange: string = '7d'): Promise<RevenueBreakdownData[]> {
    const response = await apiRequest(`${this.baseUrl}/revenue/total?timeRange=${timeRange}&breakdown=category`);
    return response.data;
  }

  /**
   * Get monthly revenue trends
   */
  static async getMonthlyRevenue(): Promise<SalesTrendData[]> {
    const response = await apiRequest(`${this.baseUrl}/revenue/monthly`);
    return response.data;
  }

  /**
   * Get revenue forecasting
   */
  static async getRevenueForecasting(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/revenue/forecasting`);
    return response.data;
  }

  // ============================================================================
  // BUSINESS INTELLIGENCE
  // ============================================================================

  /**
   * Get executive dashboard metrics
   */
  static async getExecutiveDashboard(): Promise<BusinessIntelligence> {
    const response = await apiRequest(`${this.baseUrl}/bi/executive-dashboard`);
    return response.data;
  }

  /**
   * Get cohort analysis
   */
  static async getCohortAnalysis(timeRange: string = '90d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/bi/cohort-analysis?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get revenue optimization insights
   */
  static async getRevenueOptimization(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/bi/revenue-optimization`);
    return response.data;
  }

  // ============================================================================
  // USER & CUSTOMER ANALYTICS
  // ============================================================================

  /**
   * Get user registration statistics
   */
  static async getUserRegistrationStats(timeRange: string = '30d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/users/registration?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get user activity metrics
   */
  static async getUserActivityMetrics(timeRange: string = '7d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/users/activity?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get user retention analysis
   */
  static async getUserRetentionAnalysis(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/users/retention`);
    return response.data;
  }

  /**
   * Get user demographics
   */
  static async getUserDemographics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/users/demographics`);
    return response.data;
  }

  // ============================================================================
  // PRODUCT & INVENTORY ANALYTICS
  // ============================================================================

  /**
   * Get product performance metrics
   */
  static async getProductPerformance(timeRange: string = '30d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/products/performance?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get trending products
   */
  static async getTrendingProducts(timeRange: string = '7d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/products/trending?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get product conversion rates
   */
  static async getProductConversionRates(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/products/conversion`);
    return response.data;
  }

  // ============================================================================
  // BANGLADESH ANALYTICS
  // ============================================================================

  /**
   * Get Bangladesh festival analytics
   */
  static async getBangladeshFestivalAnalytics(): Promise<BangladeshAnalytics> {
    const response = await apiRequest(`${this.baseUrl}/bangladesh/festivals`);
    return response.data;
  }

  /**
   * Get regional performance analytics
   */
  static async getRegionalAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/bangladesh/regional`);
    return response.data;
  }

  /**
   * Get payment method analytics
   */
  static async getPaymentMethodAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/bangladesh/payments`);
    return response.data;
  }

  /**
   * Get cultural impact analytics
   */
  static async getCulturalImpactAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/bangladesh/cultural`);
    return response.data;
  }

  // ============================================================================
  // MACHINE LEARNING ANALYTICS
  // ============================================================================

  /**
   * Get sales forecasting from ML models
   */
  static async getSalesForecasting(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/ml/sales-forecasting`);
    return response.data;
  }

  /**
   * Get customer churn prediction
   */
  static async getChurnPrediction(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/ml/churn-prediction`);
    return response.data;
  }

  /**
   * Get demand forecasting
   */
  static async getDemandForecasting(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/ml/demand-forecasting`);
    return response.data;
  }

  /**
   * Get anomaly detection results
   */
  static async getAnomalyDetection(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/ml/anomaly-detection`);
    return response.data;
  }

  // ============================================================================
  // VENDOR ANALYTICS
  // ============================================================================

  /**
   * Get vendor performance metrics
   */
  static async getVendorPerformanceMetrics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/vendors/performance`);
    return response.data;
  }

  /**
   * Get vendor analytics summary
   */
  static async getVendorAnalyticsSummary(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/vendors/summary`);
    return response.data;
  }

  // ============================================================================
  // TRAFFIC & ENGAGEMENT
  // ============================================================================

  /**
   * Get traffic overview
   */
  static async getTrafficOverview(timeRange: string = '7d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/traffic/overview?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get traffic sources
   */
  static async getTrafficSources(timeRange: string = '7d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/traffic/sources?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get engagement metrics
   */
  static async getEngagementMetrics(timeRange: string = '7d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/engagement/metrics?timeRange=${timeRange}`);
    return response.data;
  }

  // ============================================================================
  // ALERTS & MONITORING
  // ============================================================================

  /**
   * Get system alerts
   */
  static async getSystemAlerts(): Promise<SystemAlert[]> {
    const response = await apiRequest(`${this.baseUrl}/alerts/system`);
    return response.data;
  }

  /**
   * Get performance alerts
   */
  static async getPerformanceAlerts(): Promise<SystemAlert[]> {
    const response = await apiRequest(`${this.baseUrl}/alerts/performance`);
    return response.data;
  }

  // ============================================================================
  // EXPORT & REPORTING
  // ============================================================================

  /**
   * Export dashboard data
   */
  static async exportDashboardData(timeRange: string = '7d', format: 'pdf' | 'excel' = 'pdf'): Promise<void> {
    const response = await apiRequest(`${this.baseUrl}/export/dashboard?timeRange=${timeRange}&format=${format}`, {
      method: 'POST',
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard-report-${timeRange}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate custom report
   */
  static async generateCustomReport(reportConfig: any): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      data: reportConfig
    });
    return response.data;
  }

  /**
   * Schedule report
   */
  static async scheduleReport(reportConfig: any): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/reports/schedule`, {
      method: 'POST',
      data: reportConfig
    });
    return response.data;
  }

  // ============================================================================
  // REAL-TIME STREAMING
  // ============================================================================

  /**
   * Subscribe to real-time analytics stream
   */
  static subscribeToRealTimeAnalytics(callback: (data: any) => void): WebSocket {
    const ws = new WebSocket(`ws://localhost:5000/api/v1/analytics/realtime/stream`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return ws;
  }

  /**
   * Health check for analytics service
   */
  static async healthCheck(): Promise<{ status: string; uptime: number }> {
    const response = await apiRequest(`${this.baseUrl}/health`);
    return response.data;
  }
}