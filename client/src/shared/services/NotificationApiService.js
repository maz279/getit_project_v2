import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Notification Service API Integration
 * Amazon.com/Shopee.sg-level multi-channel notification functionality with complete backend synchronization
 */
export class NotificationApiService {
  constructor() {
    this.baseUrl = '/api/v1/notifications';
  }

  // ================================
  // NOTIFICATION MANAGEMENT
  // ================================

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters = {}) {
    const params = new URLSearchParams({
      type: filters.type || '', // 'email', 'sms', 'push', 'in_app'
      status: filters.status || '', // 'read', 'unread', 'archived'
      priority: filters.priority || '', // 'high', 'medium', 'low'
      category: filters.category || '', // 'order', 'payment', 'security', 'marketing'
      page: filters.page || '1',
      limit: filters.limit || '20',
      sortBy: filters.sortBy || 'created_at',
      sortOrder: filters.sortOrder || 'desc'
    });

    return await apiRequest(`${this.baseUrl}/users/${userId}?${params}`);
  }

  /**
   * Send notification
   */
  async sendNotification(notificationData) {
    return await apiRequest(`${this.baseUrl}/send`, {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(bulkData) {
    return await apiRequest(`${this.baseUrl}/send-bulk`, {
      method: 'POST',
      body: JSON.stringify(bulkData)
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    return await apiRequest(`${this.baseUrl}/${notificationId}/mark-read`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    return await apiRequest(`${this.baseUrl}/users/${userId}/mark-all-read`, {
      method: 'POST'
    });
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId, userId) {
    return await apiRequest(`${this.baseUrl}/${notificationId}/archive`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    return await apiRequest(`${this.baseUrl}/${notificationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId })
    });
  }

  // ================================
  // EMAIL NOTIFICATIONS
  // ================================

  /**
   * Send email notification
   */
  async sendEmailNotification(emailData) {
    return await apiRequest(`${this.baseUrl}/email/send`, {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(category = '') {
    const params = new URLSearchParams({
      category // 'welcome', 'order', 'payment', 'security', 'marketing'
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
   * Update email template
   */
  async updateEmailTemplate(templateId, updateData) {
    return await apiRequest(`${this.baseUrl}/email/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Get email delivery status
   */
  async getEmailDeliveryStatus(emailId) {
    return await apiRequest(`${this.baseUrl}/email/${emailId}/delivery-status`);
  }

  // ================================
  // SMS NOTIFICATIONS
  // ================================

  /**
   * Send SMS notification
   */
  async sendSMSNotification(smsData) {
    return await apiRequest(`${this.baseUrl}/sms/send`, {
      method: 'POST',
      body: JSON.stringify(smsData)
    });
  }

  /**
   * Send OTP via SMS
   */
  async sendOTP(phoneNumber, otpData) {
    return await apiRequest(`${this.baseUrl}/sms/send-otp`, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, ...otpData })
    });
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber, otpCode, sessionId) {
    return await apiRequest(`${this.baseUrl}/sms/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otpCode, sessionId })
    });
  }

  /**
   * Get SMS delivery status
   */
  async getSMSDeliveryStatus(smsId) {
    return await apiRequest(`${this.baseUrl}/sms/${smsId}/delivery-status`);
  }

  /**
   * Get SMS provider analytics
   */
  async getSMSProviderAnalytics(provider = '', period = '30d') {
    const params = new URLSearchParams({
      provider, // 'ssl_wireless', 'banglalink', 'robi', 'grameenphone'
      period
    });

    return await apiRequest(`${this.baseUrl}/sms/analytics?${params}`);
  }

  // ================================
  // PUSH NOTIFICATIONS
  // ================================

  /**
   * Send push notification
   */
  async sendPushNotification(pushData) {
    return await apiRequest(`${this.baseUrl}/push/send`, {
      method: 'POST',
      body: JSON.stringify(pushData)
    });
  }

  /**
   * Register device for push notifications
   */
  async registerDeviceForPush(deviceData) {
    return await apiRequest(`${this.baseUrl}/push/register-device`, {
      method: 'POST',
      body: JSON.stringify(deviceData)
    });
  }

  /**
   * Unregister device from push notifications
   */
  async unregisterDeviceFromPush(deviceToken, userId) {
    return await apiRequest(`${this.baseUrl}/push/unregister-device`, {
      method: 'POST',
      body: JSON.stringify({ deviceToken, userId })
    });
  }

  /**
   * Get push notification analytics
   */
  async getPushNotificationAnalytics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/push/analytics?${params}`);
  }

  /**
   * Send targeted push notifications
   */
  async sendTargetedPushNotifications(targetingData) {
    return await apiRequest(`${this.baseUrl}/push/send-targeted`, {
      method: 'POST',
      body: JSON.stringify(targetingData)
    });
  }

  // ================================
  // IN-APP NOTIFICATIONS
  // ================================

  /**
   * Get in-app notifications
   */
  async getInAppNotifications(userId, filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      priority: filters.priority || '',
      category: filters.category || '',
      limit: filters.limit || '50'
    });

    return await apiRequest(`${this.baseUrl}/in-app/users/${userId}?${params}`);
  }

  /**
   * Create in-app notification
   */
  async createInAppNotification(notificationData) {
    return await apiRequest(`${this.baseUrl}/in-app/create`, {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return await apiRequest(`${this.baseUrl}/in-app/users/${userId}/unread-count`);
  }

  /**
   * Dismiss in-app notification
   */
  async dismissInAppNotification(notificationId, userId) {
    return await apiRequest(`${this.baseUrl}/in-app/${notificationId}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  // ================================
  // NOTIFICATION PREFERENCES
  // ================================

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId) {
    return await apiRequest(`${this.baseUrl}/preferences/users/${userId}`);
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(userId, preferences) {
    return await apiRequest(`${this.baseUrl}/preferences/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  /**
   * Get notification categories
   */
  async getNotificationCategories() {
    return await apiRequest(`${this.baseUrl}/categories`);
  }

  /**
   * Update category preferences
   */
  async updateCategoryPreferences(userId, categoryId, preferences) {
    return await apiRequest(`${this.baseUrl}/preferences/users/${userId}/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  // ================================
  // BANGLADESH-SPECIFIC FEATURES
  // ================================

  /**
   * Send Bangladesh mobile banking notification
   */
  async sendMobileBankingNotification(notificationData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/mobile-banking`, {
      method: 'POST',
      body: JSON.stringify({ ...notificationData, country: 'BD' })
    });
  }

  /**
   * Send festival greetings
   */
  async sendFestivalGreetings(festival, recipientData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/festival-greetings`, {
      method: 'POST',
      body: JSON.stringify({ festival, recipientData, country: 'BD' })
    });
  }

  /**
   * Get Bengali notification templates
   */
  async getBengaliTemplates(category = '') {
    const params = new URLSearchParams({
      category,
      language: 'bn'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/bengali-templates?${params}`);
  }

  /**
   * Send prayer time notifications
   */
  async sendPrayerTimeNotifications(location, prayerType) {
    return await apiRequest(`${this.baseUrl}/bangladesh/prayer-notifications`, {
      method: 'POST',
      body: JSON.stringify({ location, prayerType, country: 'BD' })
    });
  }

  // ================================
  // AUTOMATION & WORKFLOWS
  // ================================

  /**
   * Create notification workflow
   */
  async createNotificationWorkflow(workflowData) {
    return await apiRequest(`${this.baseUrl}/workflows`, {
      method: 'POST',
      body: JSON.stringify(workflowData)
    });
  }

  /**
   * Get notification workflows
   */
  async getNotificationWorkflows(status = '') {
    const params = new URLSearchParams({
      status // 'active', 'paused', 'completed'
    });

    return await apiRequest(`${this.baseUrl}/workflows?${params}`);
  }

  /**
   * Trigger notification workflow
   */
  async triggerWorkflow(workflowId, triggerData) {
    return await apiRequest(`${this.baseUrl}/workflows/${workflowId}/trigger`, {
      method: 'POST',
      body: JSON.stringify(triggerData)
    });
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(notificationData, scheduleTime) {
    return await apiRequest(`${this.baseUrl}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ ...notificationData, scheduleTime })
    });
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(scheduleId) {
    return await apiRequest(`${this.baseUrl}/schedule/${scheduleId}/cancel`, {
      method: 'POST'
    });
  }

  // ================================
  // ANALYTICS & REPORTING
  // ================================

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      type: filters.type || '',
      category: filters.category || '',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/analytics?${params}`);
  }

  /**
   * Get delivery metrics
   */
  async getDeliveryMetrics(period = '30d', notificationType = '') {
    const params = new URLSearchParams({
      period,
      type: notificationType
    });

    return await apiRequest(`${this.baseUrl}/analytics/delivery-metrics?${params}`);
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/engagement-metrics?${params}`);
  }

  /**
   * Generate notification report
   */
  async generateNotificationReport(reportConfig) {
    return await apiRequest(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify(reportConfig)
    });
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Subscribe to real-time notifications
   */
  subscribeToRealTimeNotifications(userId, onNotification) {
    const wsUrl = `ws://${window.location.host}/api/v1/notifications/users/${userId}/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onNotification(data);
    };
    
    return ws;
  }

  /**
   * Subscribe to notification status updates
   */
  subscribeToStatusUpdates(onStatusUpdate, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/notifications/status-updates/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onStatusUpdate(data);
    };
    
    return ws;
  }

  // ================================
  // EXPORT & BULK OPERATIONS
  // ================================

  /**
   * Export notification data
   */
  async exportNotificationData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'delivery_logs', 'analytics', 'preferences'
      format: filters.format || 'csv',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Bulk delete notifications
   */
  async bulkDeleteNotifications(notificationIds, userId) {
    return await apiRequest(`${this.baseUrl}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ notificationIds, userId })
    });
  }

  /**
   * Bulk mark as read
   */
  async bulkMarkAsRead(notificationIds, userId) {
    return await apiRequest(`${this.baseUrl}/bulk-mark-read`, {
      method: 'POST',
      body: JSON.stringify({ notificationIds, userId })
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get notification priority color
   */
  getPriorityColor(priority) {
    const colors = {
      'high': '#EF4444',
      'medium': '#F59E0B',
      'low': '#10B981'
    };
    return colors[priority.toLowerCase()] || '#6B7280';
  }

  /**
   * Get notification type icon
   */
  getTypeIcon(type) {
    const icons = {
      'email': '📧',
      'sms': '📱',
      'push': '🔔',
      'in_app': '🔵'
    };
    return icons[type.toLowerCase()] || '📬';
  }

  /**
   * Format notification timestamp
   */
  formatTimestamp(timestamp, format = 'relative') {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (format === 'relative') {
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
    
    return date.toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Handle API errors with proper notification context
   */
  handleError(error, operation) {
    console.error(`Notification API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected notification error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Notification authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this notification operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested notification was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Notification conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid notification data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many notification requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Notification server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const notificationApiService = new NotificationApiService();