import { apiRequest } from '@/lib/queryClient';

export interface VendorMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  conversionRate: number;
  averageOrderValue: number;
  customerRating: number;
  revenueGrowth: number;
  orderGrowth: number;
  viewGrowth: number;
  commissionEarned: number;
  pendingPayouts: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
  rating: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface SalesData {
  date: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
  products: number;
}

export interface VendorInsights {
  topPerformingProducts: ProductPerformance[];
  customerFeedback: {
    totalReviews: number;
    averageRating: number;
    recentFeedback: Array<{
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  competitorAnalysis: {
    averagePrice: number;
    marketPosition: string;
    recommendations: string[];
  };
}

export interface PayoutHistory {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  transactionId?: string;
}

export interface VendorPerformanceScore {
  overall: number;
  sales: number;
  customerService: number;
  productQuality: number;
  fulfillment: number;
  badges: string[];
}

/**
 * VENDOR ANALYTICS SERVICE
 * Amazon.com/Shopee.sg-Level Vendor Performance API Integration
 * 
 * Features:
 * - Comprehensive vendor metrics and KPIs
 * - Product performance tracking
 * - Sales and revenue analytics
 * - Customer feedback and ratings
 * - Bangladesh market insights
 * - Commission and payout management
 * - Performance benchmarking
 */
export class VendorAnalyticsService {
  private static baseUrl = '/api/v1/analytics/vendors';

  // ============================================================================
  // VENDOR METRICS
  // ============================================================================

  /**
   * Get comprehensive vendor metrics
   */
  static async getVendorMetrics(timeRange: string = '7d'): Promise<VendorMetrics> {
    const response = await apiRequest(`${this.baseUrl}/metrics?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get vendor performance score
   */
  static async getVendorPerformanceScore(): Promise<VendorPerformanceScore> {
    const response = await apiRequest(`${this.baseUrl}/performance-score`);
    return response.data;
  }

  /**
   * Get vendor analytics summary
   */
  static async getVendorAnalyticsSummary(timeRange: string = '30d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/summary?timeRange=${timeRange}`);
    return response.data;
  }

  // ============================================================================
  // SALES & REVENUE ANALYTICS
  // ============================================================================

  /**
   * Get sales data over time
   */
  static async getSalesData(timeRange: string = '7d'): Promise<SalesData[]> {
    const response = await apiRequest(`${this.baseUrl}/sales?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get revenue trends
   */
  static async getRevenueTrends(timeRange: string = '30d'): Promise<SalesData[]> {
    const response = await apiRequest(`${this.baseUrl}/revenue-trends?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get sales by category
   */
  static async getSalesByCategory(timeRange: string = '30d'): Promise<CategoryPerformance[]> {
    const response = await apiRequest(`${this.baseUrl}/sales-by-category?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get monthly sales summary
   */
  static async getMonthlySales(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/monthly-sales`);
    return response.data;
  }

  // ============================================================================
  // PRODUCT PERFORMANCE
  // ============================================================================

  /**
   * Get product performance metrics
   */
  static async getProductPerformance(timeRange: string = '30d'): Promise<ProductPerformance[]> {
    const response = await apiRequest(`${this.baseUrl}/product-performance?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get top performing products
   */
  static async getTopProducts(timeRange: string = '7d', limit: number = 10): Promise<ProductPerformance[]> {
    const response = await apiRequest(`${this.baseUrl}/top-products?timeRange=${timeRange}&limit=${limit}`);
    return response.data;
  }

  /**
   * Get category performance
   */
  static async getCategoryPerformance(timeRange: string = '30d'): Promise<CategoryPerformance[]> {
    const response = await apiRequest(`${this.baseUrl}/category-performance?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get product analytics for specific product
   */
  static async getProductAnalytics(productId: string, timeRange: string = '30d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/product/${productId}/analytics?timeRange=${timeRange}`);
    return response.data;
  }

  // ============================================================================
  // CUSTOMER ANALYTICS
  // ============================================================================

  /**
   * Get customer feedback and ratings
   */
  static async getCustomerFeedback(timeRange: string = '30d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/customer-feedback?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get customer retention metrics
   */
  static async getCustomerRetention(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/customer-retention`);
    return response.data;
  }

  /**
   * Get customer demographics
   */
  static async getCustomerDemographics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/customer-demographics`);
    return response.data;
  }

  /**
   * Get customer lifetime value
   */
  static async getCustomerLifetimeValue(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/customer-lifetime-value`);
    return response.data;
  }

  // ============================================================================
  // COMMISSION & PAYOUTS
  // ============================================================================

  /**
   * Get commission earnings
   */
  static async getCommissionEarnings(timeRange: string = '30d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/commission-earnings?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get payout history
   */
  static async getPayoutHistory(page: number = 1, limit: number = 20): Promise<{
    payouts: PayoutHistory[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiRequest(`${this.baseUrl}/payout-history?page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Get pending payouts
   */
  static async getPendingPayouts(): Promise<PayoutHistory[]> {
    const response = await apiRequest(`${this.baseUrl}/pending-payouts`);
    return response.data;
  }

  /**
   * Request payout
   */
  static async requestPayout(amount: number, method: string): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/request-payout`, {
      method: 'POST',
      data: { amount, method }
    });
    return response.data;
  }

  // ============================================================================
  // BANGLADESH MARKET ANALYTICS
  // ============================================================================

  /**
   * Get Bangladesh market insights
   */
  static async getBangladeshMarketInsights(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/bangladesh-insights`);
    return response.data;
  }

  /**
   * Get festival impact analytics
   */
  static async getFestivalImpactAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/festival-impact`);
    return response.data;
  }

  /**
   * Get regional performance
   */
  static async getRegionalPerformance(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/regional-performance`);
    return response.data;
  }

  /**
   * Get payment method analytics
   */
  static async getPaymentMethodAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/payment-methods`);
    return response.data;
  }

  // ============================================================================
  // COMPETITIVE ANALYSIS
  // ============================================================================

  /**
   * Get competitor analysis
   */
  static async getCompetitorAnalysis(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/competitor-analysis`);
    return response.data;
  }

  /**
   * Get market position
   */
  static async getMarketPosition(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/market-position`);
    return response.data;
  }

  /**
   * Get pricing recommendations
   */
  static async getPricingRecommendations(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/pricing-recommendations`);
    return response.data;
  }

  // ============================================================================
  // TRAFFIC & ENGAGEMENT
  // ============================================================================

  /**
   * Get traffic analytics
   */
  static async getTrafficAnalytics(timeRange: string = '30d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/traffic?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get engagement metrics
   */
  static async getEngagementMetrics(timeRange: string = '7d'): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/engagement?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get conversion funnel analysis
   */
  static async getConversionFunnel(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/conversion-funnel`);
    return response.data;
  }

  // ============================================================================
  // INSIGHTS & RECOMMENDATIONS
  // ============================================================================

  /**
   * Get vendor insights
   */
  static async getVendorInsights(): Promise<VendorInsights> {
    const response = await apiRequest(`${this.baseUrl}/insights`);
    return response.data;
  }

  /**
   * Get AI-powered recommendations
   */
  static async getAIRecommendations(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/ai-recommendations`);
    return response.data;
  }

  /**
   * Get growth opportunities
   */
  static async getGrowthOpportunities(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/growth-opportunities`);
    return response.data;
  }

  // ============================================================================
  // INVENTORY ANALYTICS
  // ============================================================================

  /**
   * Get inventory analytics
   */
  static async getInventoryAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/inventory-analytics`);
    return response.data;
  }

  /**
   * Get stock level alerts
   */
  static async getStockLevelAlerts(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/stock-alerts`);
    return response.data;
  }

  /**
   * Get demand forecasting
   */
  static async getDemandForecasting(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/demand-forecasting`);
    return response.data;
  }

  // ============================================================================
  // EXPORT & REPORTING
  // ============================================================================

  /**
   * Export vendor analytics data
   */
  static async exportAnalyticsData(timeRange: string = '30d', format: 'pdf' | 'excel' = 'pdf'): Promise<void> {
    const response = await apiRequest(`${this.baseUrl}/export?timeRange=${timeRange}&format=${format}`, {
      method: 'POST',
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vendor-analytics-${timeRange}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate custom vendor report
   */
  static async generateCustomReport(reportConfig: any): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/custom-report`, {
      method: 'POST',
      data: reportConfig
    });
    return response.data;
  }

  // ============================================================================
  // REAL-TIME ANALYTICS
  // ============================================================================

  /**
   * Get real-time vendor metrics
   */
  static async getRealTimeMetrics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/realtime-metrics`);
    return response.data;
  }

  /**
   * Subscribe to real-time vendor analytics
   */
  static subscribeToRealTimeAnalytics(vendorId: string, callback: (data: any) => void): WebSocket {
    const ws = new WebSocket(`ws://localhost:5000/api/v1/analytics/vendors/${vendorId}/realtime`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };
    
    ws.onerror = (error) => {
      console.error('Vendor WebSocket error:', error);
    };
    
    return ws;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get vendor health check
   */
  static async healthCheck(): Promise<{ status: string; uptime: number }> {
    const response = await apiRequest(`${this.baseUrl}/health`);
    return response.data;
  }

  /**
   * Get vendor analytics configuration
   */
  static async getAnalyticsConfig(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/config`);
    return response.data;
  }

  /**
   * Update vendor analytics preferences
   */
  static async updateAnalyticsPreferences(preferences: any): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/preferences`, {
      method: 'PUT',
      data: preferences
    });
    return response.data;
  }
}