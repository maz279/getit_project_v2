import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Real-time Service API Integration
 * Amazon.com/Shopee.sg-level real-time functionality with complete backend synchronization
 */
export class RealtimeApiService {
  constructor() {
    this.baseUrl = '/api/v1/realtime';
    this.wsConnections = new Map();
  }

  // ================================
  // REAL-TIME METRICS
  // ================================

  /**
   * Get real-time dashboard metrics
   */
  async getRealTimeMetrics() {
    return await apiRequest(`${this.baseUrl}/metrics`);
  }

  /**
   * Get real-time sales data
   */
  async getRealTimeSales(period = '1h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/sales?${params}`);
  }

  /**
   * Get real-time traffic data
   */
  async getRealTimeTraffic() {
    return await apiRequest(`${this.baseUrl}/traffic`);
  }

  /**
   * Get real-time orders
   */
  async getRealTimeOrders(limit = 50) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/orders?${params}`);
  }

  /**
   * Get real-time inventory updates
   */
  async getRealTimeInventory(productIds = []) {
    return await apiRequest(`${this.baseUrl}/inventory`, {
      method: 'POST',
      body: JSON.stringify({ productIds })
    });
  }

  // ================================
  // WEBSOCKET CONNECTIONS
  // ================================

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates(channel, filters = {}, onUpdate, onError = null) {
    const wsUrl = `ws://${window.location.host}/api/v1/realtime/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ 
        type: 'subscribe', 
        channel, 
        filters 
      }));
      console.log(`✅ Connected to real-time channel: ${channel}`);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Error parsing real-time data:', error);
        if (onError) onError(error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Real-time WebSocket error:', error);
      if (onError) onError(error);
    };
    
    ws.onclose = () => {
      console.log(`❌ Disconnected from real-time channel: ${channel}`);
      this.wsConnections.delete(channel);
    };

    this.wsConnections.set(channel, ws);
    return ws;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribeFromUpdates(channel) {
    const ws = this.wsConnections.get(channel);
    if (ws) {
      ws.close();
      this.wsConnections.delete(channel);
    }
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrderUpdates(onUpdate, filters = {}) {
    return this.subscribeToUpdates('orders', filters, onUpdate);
  }

  /**
   * Subscribe to payment updates
   */
  subscribeToPaymentUpdates(onUpdate, filters = {}) {
    return this.subscribeToUpdates('payments', filters, onUpdate);
  }

  /**
   * Subscribe to inventory updates
   */
  subscribeToInventoryUpdates(onUpdate, filters = {}) {
    return this.subscribeToUpdates('inventory', filters, onUpdate);
  }

  /**
   * Subscribe to user activity
   */
  subscribeToUserActivity(onUpdate, filters = {}) {
    return this.subscribeToUpdates('user_activity', filters, onUpdate);
  }

  /**
   * Subscribe to vendor activity
   */
  subscribeToVendorActivity(vendorId, onUpdate) {
    return this.subscribeToUpdates('vendor_activity', { vendorId }, onUpdate);
  }

  // ================================
  // LIVE CHAT INTEGRATION
  // ================================

  /**
   * Subscribe to live chat messages
   */
  subscribeToLiveChat(sessionId, onMessage, onError = null) {
    return this.subscribeToUpdates(`chat_${sessionId}`, {}, onMessage, onError);
  }

  /**
   * Send live chat message
   */
  async sendLiveChatMessage(sessionId, message, senderId, senderType = 'customer') {
    return await apiRequest(`${this.baseUrl}/chat/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        senderId,
        senderType,
        timestamp: new Date().toISOString()
      })
    });
  }

  /**
   * Join live chat session
   */
  async joinLiveChatSession(sessionId, participantData) {
    return await apiRequest(`${this.baseUrl}/chat/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify(participantData)
    });
  }

  /**
   * Leave live chat session
   */
  async leaveLiveChatSession(sessionId, participantId) {
    return await apiRequest(`${this.baseUrl}/chat/${sessionId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ participantId })
    });
  }

  // ================================
  // LIVE ANALYTICS
  // ================================

  /**
   * Subscribe to live analytics
   */
  subscribeToLiveAnalytics(onUpdate, filters = {}) {
    return this.subscribeToUpdates('analytics', filters, onUpdate);
  }

  /**
   * Get live visitor count
   */
  async getLiveVisitorCount() {
    return await apiRequest(`${this.baseUrl}/analytics/live-visitors`);
  }

  /**
   * Track user activity
   */
  async trackUserActivity(activityData) {
    return await apiRequest(`${this.baseUrl}/analytics/track`, {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  }

  /**
   * Get live conversion metrics
   */
  async getLiveConversionMetrics() {
    return await apiRequest(`${this.baseUrl}/analytics/live-conversions`);
  }

  // ================================
  // BANGLADESH-SPECIFIC REAL-TIME
  // ================================

  /**
   * Subscribe to Bangladesh mobile banking updates
   */
  subscribeToBangladeshMobileBanking(onUpdate) {
    return this.subscribeToUpdates('bangladesh_mobile_banking', { country: 'BD' }, onUpdate);
  }

  /**
   * Subscribe to Bangladesh shipping updates
   */
  subscribeToBangladeshShipping(onUpdate) {
    return this.subscribeToUpdates('bangladesh_shipping', { country: 'BD' }, onUpdate);
  }

  /**
   * Get live Bangladesh market metrics
   */
  async getLiveBangladeshMetrics() {
    return await apiRequest(`${this.baseUrl}/bangladesh/live-metrics`);
  }

  /**
   * Subscribe to festival activity
   */
  subscribeToFestivalActivity(festival, onUpdate) {
    return this.subscribeToUpdates('festival_activity', { 
      festival, 
      country: 'BD' 
    }, onUpdate);
  }

  /**
   * Get live prayer time notifications
   */
  subscribeToLivePrayerNotifications(location, onUpdate) {
    return this.subscribeToUpdates('prayer_notifications', { 
      location, 
      country: 'BD' 
    }, onUpdate);
  }

  // ================================
  // SYSTEM MONITORING
  // ================================

  /**
   * Subscribe to system health updates
   */
  subscribeToSystemHealth(onUpdate, onError) {
    return this.subscribeToUpdates('system_health', {}, onUpdate, onError);
  }

  /**
   * Get real-time system metrics
   */
  async getSystemMetrics() {
    return await apiRequest(`${this.baseUrl}/system/metrics`);
  }

  /**
   * Subscribe to error alerts
   */
  subscribeToErrorAlerts(onAlert) {
    return this.subscribeToUpdates('error_alerts', {}, onAlert);
  }

  /**
   * Get live performance metrics
   */
  async getLivePerformanceMetrics() {
    return await apiRequest(`${this.baseUrl}/system/performance`);
  }

  // ================================
  // AUCTION REAL-TIME
  // ================================

  /**
   * Subscribe to auction updates
   */
  subscribeToAuctionUpdates(auctionId, onUpdate) {
    return this.subscribeToUpdates(`auction_${auctionId}`, {}, onUpdate);
  }

  /**
   * Subscribe to bidding activity
   */
  subscribeToBiddingActivity(auctionId, onBid) {
    return this.subscribeToUpdates(`bidding_${auctionId}`, {}, onBid);
  }

  /**
   * Place real-time bid
   */
  async placeRealtimeBid(auctionId, bidData) {
    return await apiRequest(`${this.baseUrl}/auction/${auctionId}/bid`, {
      method: 'POST',
      body: JSON.stringify(bidData)
    });
  }

  // ================================
  // NOTIFICATION BROADCASTING
  // ================================

  /**
   * Broadcast notification
   */
  async broadcastNotification(notificationData) {
    return await apiRequest(`${this.baseUrl}/broadcast/notification`, {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(userId, onNotification) {
    return this.subscribeToUpdates(`notifications_${userId}`, {}, onNotification);
  }

  /**
   * Broadcast system announcement
   */
  async broadcastSystemAnnouncement(announcement) {
    return await apiRequest(`${this.baseUrl}/broadcast/system-announcement`, {
      method: 'POST',
      body: JSON.stringify(announcement)
    });
  }

  // ================================
  // EVENT STREAMING
  // ================================

  /**
   * Stream events
   */
  async streamEvent(eventData) {
    return await apiRequest(`${this.baseUrl}/events/stream`, {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  /**
   * Subscribe to event stream
   */
  subscribeToEventStream(eventType, onEvent) {
    return this.subscribeToUpdates(`events_${eventType}`, {}, onEvent);
  }

  /**
   * Get event history
   */
  async getEventHistory(eventType, limit = 100) {
    const params = new URLSearchParams({
      type: eventType,
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/events/history?${params}`);
  }

  // ================================
  // LIVE FEEDS
  // ================================

  /**
   * Subscribe to activity feed
   */
  subscribeToActivityFeed(feedType, onUpdate) {
    return this.subscribeToUpdates(`feed_${feedType}`, {}, onUpdate);
  }

  /**
   * Post to activity feed
   */
  async postToActivityFeed(feedData) {
    return await apiRequest(`${this.baseUrl}/feed/post`, {
      method: 'POST',
      body: JSON.stringify(feedData)
    });
  }

  /**
   * Get feed timeline
   */
  async getFeedTimeline(feedType, limit = 50) {
    const params = new URLSearchParams({
      type: feedType,
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/feed/timeline?${params}`);
  }

  // ================================
  // COLLABORATIVE FEATURES
  // ================================

  /**
   * Subscribe to collaborative editing
   */
  subscribeToCollaborativeEditing(documentId, onUpdate) {
    return this.subscribeToUpdates(`collab_${documentId}`, {}, onUpdate);
  }

  /**
   * Send collaborative edit
   */
  async sendCollaborativeEdit(documentId, editData) {
    return await apiRequest(`${this.baseUrl}/collaborative/${documentId}/edit`, {
      method: 'POST',
      body: JSON.stringify(editData)
    });
  }

  /**
   * Join collaborative session
   */
  async joinCollaborativeSession(sessionId, userData) {
    return await apiRequest(`${this.baseUrl}/collaborative/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Check connection status
   */
  getConnectionStatus(channel) {
    const ws = this.wsConnections.get(channel);
    if (!ws) return 'disconnected';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  /**
   * Get all active connections
   */
  getActiveConnections() {
    const connections = {};
    this.wsConnections.forEach((ws, channel) => {
      connections[channel] = this.getConnectionStatus(channel);
    });
    return connections;
  }

  /**
   * Reconnect to channel
   */
  reconnectToChannel(channel, onUpdate, filters = {}) {
    this.unsubscribeFromUpdates(channel);
    return this.subscribeToUpdates(channel, filters, onUpdate);
  }

  /**
   * Close all connections
   */
  closeAllConnections() {
    this.wsConnections.forEach((ws, channel) => {
      ws.close();
    });
    this.wsConnections.clear();
  }

  /**
   * Ping server
   */
  async pingServer() {
    try {
      const startTime = Date.now();
      await apiRequest(`${this.baseUrl}/ping`);
      return Date.now() - startTime;
    } catch (error) {
      throw new Error('Server ping failed');
    }
  }

  /**
   * Get server status
   */
  async getServerStatus() {
    return await apiRequest(`${this.baseUrl}/status`);
  }

  /**
   * Format real-time timestamp
   */
  formatRealTimeTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  }

  /**
   * Handle API errors with proper real-time context
   */
  handleError(error, operation) {
    console.error(`Real-time API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected real-time error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Real-time authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to access real-time data.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested real-time channel was not found.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many real-time requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Real-time server error. Please try again later.';
    }

    return errorResponse;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.closeAllConnections();
  }
}

// Export singleton instance
export const realtimeApiService = new RealtimeApiService();