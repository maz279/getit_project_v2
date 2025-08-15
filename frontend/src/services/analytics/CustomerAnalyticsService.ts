import { apiRequest } from '@/lib/queryClient';

export interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  totalSavings: number;
  loyaltyPoints: number;
  wishlistItems: number;
  totalReviews: number;
  customerSince: string;
  membershipTier: string;
  nextReward: string;
}

export interface OrderHistory {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
  trackingNumber?: string;
}

export interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  date: string;
  amount?: number;
  productId?: string;
}

export interface PersonalizedRecommendations {
  recommended: Array<{
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    reason: string;
    rating: number;
  }>;
  wishlistDeals: Array<{
    id: string;
    title: string;
    oldPrice: number;
    newPrice: number;
    discount: number;
    expiresAt: string;
  }>;
  categories: Array<{
    category: string;
    dealCount: number;
    maxDiscount: number;
  }>;
}

export interface LoyaltyProgram {
  currentTier: string;
  points: number;
  pointsToNext: number;
  nextTier: string;
  benefits: string[];
  rewardHistory: Array<{
    id: string;
    description: string;
    points: number;
    date: string;
    type: 'earned' | 'redeemed';
  }>;
}

export interface ShoppingInsights {
  favoriteCategory: string;
  bestShoppingDay: string;
  averageOrderSize: number;
  seasonalTrends: Array<{
    season: string;
    spendingIncrease: number;
    popularCategories: string[];
  }>;
  savingsOpportunities: Array<{
    type: string;
    description: string;
    potentialSavings: number;
  }>;
}

export interface BangladeshCustomerInsights {
  festivalShopping: {
    totalFestivalSpending: number;
    favoriteFestival: string;
    festivalSavings: number;
    upcomingFestivals: Array<{
      name: string;
      date: string;
      expectedDeals: number;
    }>;
  };
  paymentPreferences: Array<{
    method: string;
    usage: number;
    rewards: number;
  }>;
  regionalOffers: Array<{
    region: string;
    offers: number;
    savings: number;
  }>;
}

/**
 * CUSTOMER ANALYTICS SERVICE
 * Amazon.com/Shopee.sg-Level Customer Experience API Integration
 * 
 * Features:
 * - Personal shopping analytics and insights
 * - Order history and spending analysis
 * - Loyalty program tracking
 * - Personalized recommendations
 * - Bangladesh market customization
 * - Cultural shopping insights
 * - Reward and savings tracking
 */
export class CustomerAnalyticsService {
  private static baseUrl = '/api/v1/analytics/customers';

  // ============================================================================
  // CUSTOMER METRICS
  // ============================================================================

  /**
   * Get comprehensive customer metrics
   */
  static async getCustomerMetrics(timeRange: string = '30d'): Promise<CustomerMetrics> {
    const response = await apiRequest(`${this.baseUrl}/metrics?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get customer dashboard overview
   */
  static async getCustomerDashboard(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/dashboard`);
    return response.data;
  }

  /**
   * Get customer profile analytics
   */
  static async getCustomerProfile(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/profile`);
    return response.data;
  }

  // ============================================================================
  // ORDER HISTORY & SPENDING
  // ============================================================================

  /**
   * Get customer order history
   */
  static async getOrderHistory(timeRange: string = '30d', page: number = 1): Promise<OrderHistory[]> {
    const response = await apiRequest(`${this.baseUrl}/orders?timeRange=${timeRange}&page=${page}`);
    return response.data;
  }

  /**
   * Get spending patterns by category
   */
  static async getSpendingPatterns(timeRange: string = '30d'): Promise<SpendingPattern[]> {
    const response = await apiRequest(`${this.baseUrl}/spending-patterns?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get spending trends over time
   */
  static async getSpendingTrends(timeRange: string = '90d'): Promise<Array<{
    date: string;
    amount: number;
    orders: number;
  }>> {
    const response = await apiRequest(`${this.baseUrl}/spending-trends?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get monthly spending summary
   */
  static async getMonthlySpending(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/monthly-spending`);
    return response.data;
  }

  // ============================================================================
  // LOYALTY PROGRAM
  // ============================================================================

  /**
   * Get loyalty program details
   */
  static async getLoyaltyProgram(): Promise<LoyaltyProgram> {
    const response = await apiRequest(`${this.baseUrl}/loyalty`);
    return response.data;
  }

  /**
   * Get loyalty points history
   */
  static async getLoyaltyPointsHistory(page: number = 1): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/loyalty/points-history?page=${page}`);
    return response.data;
  }

  /**
   * Redeem loyalty points
   */
  static async redeemLoyaltyPoints(rewardId: string, points: number): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/loyalty/redeem`, {
      method: 'POST',
      data: { rewardId, points }
    });
    return response.data;
  }

  /**
   * Get available rewards
   */
  static async getAvailableRewards(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/loyalty/rewards`);
    return response.data;
  }

  // ============================================================================
  // PERSONALIZED RECOMMENDATIONS
  // ============================================================================

  /**
   * Get personalized product recommendations
   */
  static async getPersonalizedRecommendations(): Promise<PersonalizedRecommendations> {
    const response = await apiRequest(`${this.baseUrl}/recommendations`);
    return response.data;
  }

  /**
   * Get recommendations based on browsing history
   */
  static async getBrowsingBasedRecommendations(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/recommendations/browsing`);
    return response.data;
  }

  /**
   * Get recommendations based on purchase history
   */
  static async getPurchaseBasedRecommendations(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/recommendations/purchase`);
    return response.data;
  }

  /**
   * Get wishlist deals and notifications
   */
  static async getWishlistDeals(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/wishlist/deals`);
    return response.data;
  }

  // ============================================================================
  // SHOPPING INSIGHTS
  // ============================================================================

  /**
   * Get personal shopping insights
   */
  static async getShoppingInsights(): Promise<ShoppingInsights> {
    const response = await apiRequest(`${this.baseUrl}/insights`);
    return response.data;
  }

  /**
   * Get seasonal shopping patterns
   */
  static async getSeasonalPatterns(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/insights/seasonal`);
    return response.data;
  }

  /**
   * Get savings opportunities
   */
  static async getSavingsOpportunities(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/insights/savings`);
    return response.data;
  }

  /**
   * Get price drop alerts
   */
  static async getPriceDropAlerts(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/insights/price-drops`);
    return response.data;
  }

  // ============================================================================
  // BANGLADESH MARKET FEATURES
  // ============================================================================

  /**
   * Get Bangladesh customer insights
   */
  static async getBangladeshInsights(): Promise<BangladeshCustomerInsights> {
    const response = await apiRequest(`${this.baseUrl}/bangladesh-insights`);
    return response.data;
  }

  /**
   * Get festival shopping analytics
   */
  static async getFestivalShoppingAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/festival-shopping`);
    return response.data;
  }

  /**
   * Get payment method preferences
   */
  static async getPaymentPreferences(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/payment-preferences`);
    return response.data;
  }

  /**
   * Get regional offers and deals
   */
  static async getRegionalOffers(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/regional-offers`);
    return response.data;
  }

  // ============================================================================
  // ACTIVITY TRACKING
  // ============================================================================

  /**
   * Get recent customer activity
   */
  static async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const response = await apiRequest(`${this.baseUrl}/activity?limit=${limit}`);
    return response.data;
  }

  /**
   * Get browsing history
   */
  static async getBrowsingHistory(page: number = 1): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/browsing-history?page=${page}`);
    return response.data;
  }

  /**
   * Get search history
   */
  static async getSearchHistory(page: number = 1): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/search-history?page=${page}`);
    return response.data;
  }

  /**
   * Track customer activity
   */
  static async trackActivity(activity: {
    type: string;
    productId?: string;
    categoryId?: string;
    searchQuery?: string;
    metadata?: any;
  }): Promise<void> {
    await apiRequest(`${this.baseUrl}/activity/track`, {
      method: 'POST',
      data: activity
    });
  }

  // ============================================================================
  // WISHLIST & FAVORITES
  // ============================================================================

  /**
   * Get wishlist analytics
   */
  static async getWishlistAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/wishlist/analytics`);
    return response.data;
  }

  /**
   * Get favorite categories
   */
  static async getFavoriteCategories(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/favorites/categories`);
    return response.data;
  }

  /**
   * Get favorite brands
   */
  static async getFavoriteBrands(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/favorites/brands`);
    return response.data;
  }

  // ============================================================================
  // REVIEWS & RATINGS
  // ============================================================================

  /**
   * Get customer review analytics
   */
  static async getReviewAnalytics(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/reviews/analytics`);
    return response.data;
  }

  /**
   * Get review history
   */
  static async getReviewHistory(page: number = 1): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/reviews/history?page=${page}`);
    return response.data;
  }

  /**
   * Get review reminders
   */
  static async getReviewReminders(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/reviews/reminders`);
    return response.data;
  }

  // ============================================================================
  // CUSTOMER SUPPORT ANALYTICS
  // ============================================================================

  /**
   * Get support ticket history
   */
  static async getSupportTicketHistory(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/support/tickets`);
    return response.data;
  }

  /**
   * Get customer satisfaction scores
   */
  static async getSatisfactionScores(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/support/satisfaction`);
    return response.data;
  }

  // ============================================================================
  // PREFERENCES & SETTINGS
  // ============================================================================

  /**
   * Get customer preferences
   */
  static async getCustomerPreferences(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/preferences`);
    return response.data;
  }

  /**
   * Update customer preferences
   */
  static async updateCustomerPreferences(preferences: any): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/preferences`, {
      method: 'PUT',
      data: preferences
    });
    return response.data;
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/preferences/notifications`);
    return response.data;
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(preferences: any): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/preferences/notifications`, {
      method: 'PUT',
      data: preferences
    });
    return response.data;
  }

  // ============================================================================
  // EXPORT & SHARING
  // ============================================================================

  /**
   * Export customer analytics data
   */
  static async exportCustomerData(timeRange: string = '365d', format: 'pdf' | 'csv' = 'pdf'): Promise<void> {
    const response = await apiRequest(`${this.baseUrl}/export?timeRange=${timeRange}&format=${format}`, {
      method: 'POST',
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `my-shopping-analytics-${timeRange}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Share shopping achievements
   */
  static async shareShoppingAchievements(platform: string, achievementType: string): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/share/achievements`, {
      method: 'POST',
      data: { platform, achievementType }
    });
    return response.data;
  }

  // ============================================================================
  // GAMIFICATION & ACHIEVEMENTS
  // ============================================================================

  /**
   * Get customer achievements
   */
  static async getCustomerAchievements(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/achievements`);
    return response.data;
  }

  /**
   * Get shopping streaks
   */
  static async getShoppingStreaks(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/achievements/streaks`);
    return response.data;
  }

  /**
   * Get badges and milestones
   */
  static async getBadgesAndMilestones(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/achievements/badges`);
    return response.data;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get customer analytics health check
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiRequest(`${this.baseUrl}/health`);
    return response.data;
  }

  /**
   * Get analytics configuration
   */
  static async getAnalyticsConfig(): Promise<any> {
    const response = await apiRequest(`${this.baseUrl}/config`);
    return response.data;
  }

  /**
   * Clear customer analytics cache
   */
  static async clearAnalyticsCache(): Promise<void> {
    await apiRequest(`${this.baseUrl}/cache/clear`, {
      method: 'DELETE'
    });
  }
}