import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Auction Service API Integration
 * Amazon.com/Shopee.sg-level auction platform functionality with complete backend synchronization
 */
export class AuctionApiService {
  constructor() {
    this.baseUrl = '/api/v1/auctions';
  }

  // ================================
  // AUCTION MANAGEMENT
  // ================================

  /**
   * Get active auctions
   */
  async getActiveAuctions(filters = {}) {
    const params = new URLSearchParams({
      category: filters.category || '',
      priceRange: filters.priceRange || '',
      timeRange: filters.timeRange || '',
      location: filters.location || '',
      sortBy: filters.sortBy || 'ending_soon',
      page: filters.page || '1',
      limit: filters.limit || '20',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/active?${params}`);
  }

  /**
   * Get auction details
   */
  async getAuction(auctionId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}`);
  }

  /**
   * Create new auction
   */
  async createAuction(auctionData) {
    return await apiRequest(`${this.baseUrl}`, {
      method: 'POST',
      body: JSON.stringify(auctionData)
    });
  }

  /**
   * Update auction
   */
  async updateAuction(auctionId, updateData) {
    return await apiRequest(`${this.baseUrl}/${auctionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * End auction early
   */
  async endAuction(auctionId, reason = '') {
    return await apiRequest(`${this.baseUrl}/${auctionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Cancel auction
   */
  async cancelAuction(auctionId, reason) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Extend auction duration
   */
  async extendAuction(auctionId, extensionHours, reason = '') {
    return await apiRequest(`${this.baseUrl}/${auctionId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ extensionHours, reason })
    });
  }

  // ================================
  // BIDDING SYSTEM
  // ================================

  /**
   * Place bid on auction
   */
  async placeBid(auctionId, bidAmount, maxBid = null) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/bid`, {
      method: 'POST',
      body: JSON.stringify({ bidAmount, maxBid })
    });
  }

  /**
   * Get auction bidding history
   */
  async getBiddingHistory(auctionId, limit = 50) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/${auctionId}/bidding-history?${params}`);
  }

  /**
   * Get user's bids
   */
  async getUserBids(userId, filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '', // 'winning', 'outbid', 'won', 'lost'
      timeRange: filters.timeRange || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/users/${userId}/bids?${params}`);
  }

  /**
   * Set automatic bidding
   */
  async setAutomaticBidding(auctionId, maxBid, incrementAmount) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/auto-bid`, {
      method: 'POST',
      body: JSON.stringify({ maxBid, incrementAmount })
    });
  }

  /**
   * Cancel automatic bidding
   */
  async cancelAutomaticBidding(auctionId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/auto-bid`, {
      method: 'DELETE'
    });
  }

  /**
   * Get current bid status
   */
  async getCurrentBidStatus(auctionId, userId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/bid-status/${userId}`);
  }

  // ================================
  // WATCHLIST MANAGEMENT
  // ================================

  /**
   * Add auction to watchlist
   */
  async addToWatchlist(auctionId, userId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/watchlist`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  /**
   * Remove auction from watchlist
   */
  async removeFromWatchlist(auctionId, userId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/watchlist`, {
      method: 'DELETE',
      body: JSON.stringify({ userId })
    });
  }

  /**
   * Get user's watchlist
   */
  async getUserWatchlist(userId, filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '', // 'active', 'ended', 'won'
      sortBy: filters.sortBy || 'ending_soon',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/users/${userId}/watchlist?${params}`);
  }

  /**
   * Get watchlist notifications
   */
  async getWatchlistNotifications(userId) {
    return await apiRequest(`${this.baseUrl}/users/${userId}/watchlist/notifications`);
  }

  // ================================
  // SELLER AUCTION TOOLS
  // ================================

  /**
   * Get seller auctions
   */
  async getSellerAuctions(sellerId, filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '', // 'active', 'scheduled', 'ended', 'cancelled'
      sortBy: filters.sortBy || 'created_date',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/sellers/${sellerId}/auctions?${params}`);
  }

  /**
   * Get auction performance metrics
   */
  async getAuctionPerformance(auctionId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/performance`);
  }

  /**
   * Get seller auction analytics
   */
  async getSellerAnalytics(sellerId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/sellers/${sellerId}/analytics?${params}`);
  }

  /**
   * Schedule auction
   */
  async scheduleAuction(auctionData, scheduledStartTime) {
    return await apiRequest(`${this.baseUrl}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ ...auctionData, scheduledStartTime })
    });
  }

  /**
   * Clone existing auction
   */
  async cloneAuction(auctionId, modifications = {}) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/clone`, {
      method: 'POST',
      body: JSON.stringify(modifications)
    });
  }

  // ================================
  // RESERVE PRICE MANAGEMENT
  // ================================

  /**
   * Set reserve price
   */
  async setReservePrice(auctionId, reservePrice) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/reserve-price`, {
      method: 'POST',
      body: JSON.stringify({ reservePrice })
    });
  }

  /**
   * Update reserve price
   */
  async updateReservePrice(auctionId, newReservePrice, reason = '') {
    return await apiRequest(`${this.baseUrl}/${auctionId}/reserve-price`, {
      method: 'PUT',
      body: JSON.stringify({ reservePrice: newReservePrice, reason })
    });
  }

  /**
   * Remove reserve price
   */
  async removeReservePrice(auctionId, reason = '') {
    return await apiRequest(`${this.baseUrl}/${auctionId}/reserve-price`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Check if reserve price is met
   */
  async checkReservePriceMet(auctionId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/reserve-price/status`);
  }

  // ================================
  // AUTO-EXTEND MECHANISMS
  // ================================

  /**
   * Configure auto-extend settings
   */
  async configureAutoExtend(auctionId, autoExtendSettings) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/auto-extend`, {
      method: 'POST',
      body: JSON.stringify(autoExtendSettings)
    });
  }

  /**
   * Get auto-extend history
   */
  async getAutoExtendHistory(auctionId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/auto-extend/history`);
  }

  /**
   * Disable auto-extend
   */
  async disableAutoExtend(auctionId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/auto-extend`, {
      method: 'DELETE'
    });
  }

  // ================================
  // AUCTION CATEGORIES
  // ================================

  /**
   * Get auction categories
   */
  async getAuctionCategories() {
    return await apiRequest(`${this.baseUrl}/categories`);
  }

  /**
   * Get auctions by category
   */
  async getAuctionsByCategory(categoryId, filters = {}) {
    const params = new URLSearchParams({
      sortBy: filters.sortBy || 'ending_soon',
      priceRange: filters.priceRange || '',
      location: filters.location || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/categories/${categoryId}/auctions?${params}`);
  }

  /**
   * Get category trending auctions
   */
  async getCategoryTrending(categoryId, period = '7d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/categories/${categoryId}/trending?${params}`);
  }

  // ================================
  // SEARCH & DISCOVERY
  // ================================

  /**
   * Search auctions
   */
  async searchAuctions(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      category: filters.category || '',
      priceRange: filters.priceRange || '',
      location: filters.location || '',
      timeRange: filters.timeRange || '',
      sortBy: filters.sortBy || 'relevance',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/search?${params}`);
  }

  /**
   * Get auction suggestions
   */
  async getAuctionSuggestions(query, limit = 10) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/suggestions?${params}`);
  }

  /**
   * Get similar auctions
   */
  async getSimilarAuctions(auctionId, limit = 8) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/${auctionId}/similar?${params}`);
  }

  /**
   * Get recommended auctions for user
   */
  async getRecommendedAuctions(userId, limit = 20) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/users/${userId}/recommendations?${params}`);
  }

  // ================================
  // PAYMENT & SETTLEMENT
  // ================================

  /**
   * Process auction payment
   */
  async processAuctionPayment(auctionId, paymentData) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(auctionId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/payment/status`);
  }

  /**
   * Process seller payout
   */
  async processSellerPayout(auctionId, payoutData) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/payout`, {
      method: 'POST',
      body: JSON.stringify(payoutData)
    });
  }

  /**
   * Handle payment disputes
   */
  async handlePaymentDispute(auctionId, disputeData) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/payment/dispute`, {
      method: 'POST',
      body: JSON.stringify(disputeData)
    });
  }

  // ================================
  // BANGLADESH-SPECIFIC FEATURES
  // ================================

  /**
   * Process Bangladesh mobile banking payment
   */
  async processBangladeshMobileBankingPayment(auctionId, mobilePaymentData) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/payment/bangladesh-mobile-banking`, {
      method: 'POST',
      body: JSON.stringify({ ...mobilePaymentData, country: 'BD' })
    });
  }

  /**
   * Get Bangladesh auction regulations
   */
  async getBangladeshAuctionRegulations() {
    return await apiRequest(`${this.baseUrl}/bangladesh/regulations`);
  }

  /**
   * Calculate Bangladesh auction taxes
   */
  async calculateBangladeshAuctionTaxes(auctionValue, auctionType) {
    return await apiRequest(`${this.baseUrl}/bangladesh/calculate-taxes`, {
      method: 'POST',
      body: JSON.stringify({ auctionValue, auctionType, country: 'BD' })
    });
  }

  /**
   * Get Bangladesh regional auction trends
   */
  async getBangladeshRegionalTrends(division, period = '30d') {
    const params = new URLSearchParams({
      division,
      period,
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/regional-trends?${params}`);
  }

  // ================================
  // FRAUD PREVENTION
  // ================================

  /**
   * Verify auction authenticity
   */
  async verifyAuctionAuthenticity(auctionId) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/verify-authenticity`);
  }

  /**
   * Report suspicious auction
   */
  async reportSuspiciousAuction(auctionId, reportData) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/report`, {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }

  /**
   * Check bidder verification
   */
  async checkBidderVerification(userId) {
    return await apiRequest(`${this.baseUrl}/users/${userId}/verification-status`);
  }

  /**
   * Flag potential shill bidding
   */
  async flagShillBidding(auctionId, evidenceData) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/flag-shill-bidding`, {
      method: 'POST',
      body: JSON.stringify(evidenceData)
    });
  }

  // ================================
  // NOTIFICATION MANAGEMENT
  // ================================

  /**
   * Subscribe to auction notifications
   */
  async subscribeToAuctionNotifications(auctionId, notificationTypes) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/notifications/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ notificationTypes })
    });
  }

  /**
   * Unsubscribe from auction notifications
   */
  async unsubscribeFromAuctionNotifications(auctionId, notificationTypes) {
    return await apiRequest(`${this.baseUrl}/${auctionId}/notifications/unsubscribe`, {
      method: 'POST',
      body: JSON.stringify({ notificationTypes })
    });
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(userId) {
    return await apiRequest(`${this.baseUrl}/users/${userId}/notification-preferences`);
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId, preferences) {
    return await apiRequest(`${this.baseUrl}/users/${userId}/notification-preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Subscribe to live auction updates
   */
  subscribeToLiveAuctionUpdates(auctionId, onUpdate) {
    const wsUrl = `ws://${window.location.host}/api/v1/auctions/${auctionId}/live-updates`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return ws;
  }

  /**
   * Subscribe to bid notifications
   */
  subscribeToBidNotifications(userId, onNotification) {
    const wsUrl = `ws://${window.location.host}/api/v1/auctions/users/${userId}/bid-notifications`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onNotification(data);
    };
    
    return ws;
  }

  /**
   * Get real-time auction metrics
   */
  async getRealTimeAuctionMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  // ================================
  // EXPORT & REPORTING
  // ================================

  /**
   * Export auction data
   */
  async exportAuctionData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'auctions', 'bids', 'performance', 'analytics'
      format: filters.format || 'csv',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate auction report
   */
  async generateAuctionReport(reportType, period, filters = {}) {
    return await apiRequest(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify({ reportType, period, ...filters })
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Calculate auction time remaining
   */
  getTimeRemaining(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const difference = end.getTime() - now.getTime();
    
    if (difference <= 0) {
      return { ended: true, display: 'Auction Ended' };
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    let display = '';
    if (days > 0) display += `${days}d `;
    if (hours > 0) display += `${hours}h `;
    if (minutes > 0) display += `${minutes}m `;
    if (days === 0) display += `${seconds}s`;
    
    return {
      ended: false,
      days,
      hours,
      minutes,
      seconds,
      display: display.trim()
    };
  }

  /**
   * Calculate bid increment
   */
  calculateBidIncrement(currentBid) {
    if (currentBid < 100) return 5;
    if (currentBid < 500) return 10;
    if (currentBid < 1000) return 25;
    if (currentBid < 5000) return 50;
    if (currentBid < 10000) return 100;
    return 250;
  }

  /**
   * Format auction status
   */
  formatAuctionStatus(status, endTime) {
    const now = new Date();
    const end = new Date(endTime);
    
    if (status === 'ended' || now > end) {
      return { status: 'ended', display: 'Ended', color: '#6B7280' };
    } else if (status === 'active') {
      const timeLeft = this.getTimeRemaining(endTime);
      if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 30) {
        return { status: 'ending_soon', display: 'Ending Soon', color: '#DC2626' };
      }
      return { status: 'active', display: 'Active', color: '#10B981' };
    } else if (status === 'scheduled') {
      return { status: 'scheduled', display: 'Scheduled', color: '#3B82F6' };
    } else if (status === 'cancelled') {
      return { status: 'cancelled', display: 'Cancelled', color: '#6B7280' };
    }
    
    return { status: status, display: status, color: '#6B7280' };
  }

  /**
   * Format currency for auction display
   */
  formatCurrency(amount, currency = 'BDT') {
    const formatters = {
      'BDT': new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }),
      'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      'EUR': new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' })
    };
    
    return (formatters[currency] || formatters['BDT']).format(amount);
  }

  /**
   * Handle API errors with proper auction context
   */
  handleError(error, operation) {
    console.error(`Auction API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected auction error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Auction authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this auction operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested auction was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Auction conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid auction data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many auction requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Auction server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const auctionApiService = new AuctionApiService();