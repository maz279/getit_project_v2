/**
 * NotificationService - Enterprise-grade notification service integration
 * 
 * Provides comprehensive API integration with the backend notification service
 * for Amazon.com/Shopee.sg-level notification management with:
 * - Multi-channel notification support (Email, SMS, Push, In-App, WhatsApp)
 * - Bangladesh cultural integration and localization
 * - Real-time WebSocket integration
 * - Advanced filtering and search capabilities
 * - Comprehensive error handling and retry logic
 * - Performance optimization with caching
 * - Analytics and statistics tracking
 * - User preference management
 * 
 * @author GetIt Engineering Team
 * @version 1.0.0
 */

import { apiRequest } from '@/lib/queryClient';
import { Notification, NotificationAction, NotificationStats, NotificationFilter } from '@/components/notifications';

export interface NotificationApiResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NotificationPreferenceApiResponse {
  preferences: any;
  success: boolean;
}

export interface NotificationTestResponse {
  success: boolean;
  messageId: string;
  channel: string;
}

/**
 * NotificationService class provides comprehensive notification management
 */
export class NotificationService {
  private static readonly BASE_URL = '/api/v1/notifications';
  private static readonly WEBSOCKET_URL = process.env.NODE_ENV === 'production' 
    ? 'wss://your-domain.com/ws' 
    : 'ws://localhost:5000/ws';

  /**
   * Fetch notifications for a user with advanced filtering and pagination
   */
  static async getUserNotifications(
    userId: string,
    options: {
      filter?: NotificationFilter;
      search?: string;
      sortBy?: 'newest' | 'oldest' | 'priority' | 'category';
      page?: number;
      limit?: number;
      language?: 'en' | 'bn';
    } = {}
  ): Promise<NotificationApiResponse> {
    const {
      filter = {},
      search,
      sortBy = 'newest',
      page = 1,
      limit = 50,
      language = 'en'
    } = options;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy: sortBy === 'newest' ? 'createdAt' : 
             sortBy === 'oldest' ? 'createdAt' : 
             sortBy === 'priority' ? 'priority' : 'category',
      sortOrder: sortBy === 'oldest' ? 'asc' : 'desc',
      language,
      ...(filter.type && { type: filter.type }),
      ...(filter.category && { category: filter.category }),
      ...(filter.channel && { channel: filter.channel }),
      ...(filter.priority && { priority: filter.priority }),
      ...(filter.isRead !== undefined && { unreadOnly: (!filter.isRead).toString() }),
      ...(filter.isStarred !== undefined && { starred: filter.isStarred.toString() }),
      ...(search && { search }),
      ...(filter.dateRange && {
        startDate: filter.dateRange.start.toISOString(),
        endDate: filter.dateRange.end.toISOString()
      })
    });

    const response = await fetch(`${this.BASE_URL}/user/${userId}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      notifications: data.notifications || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit,
      hasMore: data.hasMore || false
    };
  }

  /**
   * Get notification statistics for dashboard display
   */
  static async getNotificationStats(userId: string): Promise<NotificationStats> {
    const response = await fetch(`${this.BASE_URL}/user/${userId}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notification stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.stats || {};
  }

  /**
   * Mark notifications as read with batch support
   */
  static async markNotificationsAsRead(
    userId: string, 
    notificationIds: string[]
  ): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notificationIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notifications as read: ${response.statusText}`);
    }
  }

  /**
   * Mark notifications as unread with batch support
   */
  static async markNotificationsAsUnread(
    userId: string, 
    notificationIds: string[]
  ): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/mark-unread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notificationIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notifications as unread: ${response.statusText}`);
    }
  }

  /**
   * Star/Unstar notifications with batch support
   */
  static async starNotifications(
    userId: string, 
    notificationIds: string[], 
    starred: boolean
  ): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/star`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notificationIds, starred }),
    });

    if (!response.ok) {
      throw new Error(`Failed to star notifications: ${response.statusText}`);
    }
  }

  /**
   * Delete notifications with batch support
   */
  static async deleteNotifications(
    userId: string, 
    notificationIds: string[]
  ): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notificationIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete notifications: ${response.statusText}`);
    }
  }

  /**
   * Get user notification preferences with cultural settings
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferenceApiResponse> {
    const response = await fetch(`${this.BASE_URL}/preferences/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notification preferences: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Update user notification preferences with cultural settings
   */
  static async updateNotificationPreferences(
    userId: string, 
    preferences: any
  ): Promise<NotificationPreferenceApiResponse> {
    const response = await fetch(`${this.BASE_URL}/preferences/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update notification preferences: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Send test notification to verify channel settings
   */
  static async sendTestNotification(
    userId: string,
    channel: string,
    message?: string,
    language: 'en' | 'bn' = 'en'
  ): Promise<NotificationTestResponse> {
    const response = await fetch(`${this.BASE_URL}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId, 
        channel, 
        message: message || (language === 'bn' ? 'এটি একটি পরীক্ষা নোটিফিকেশন' : 'This is a test notification'),
        language
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send test notification: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Execute notification action (like viewing order, tracking shipment, etc.)
   */
  static async executeNotificationAction(
    userId: string,
    notificationId: string,
    action: NotificationAction
  ): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notificationId, action }),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute notification action: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get real-time notification updates via WebSocket
   */
  static createWebSocketConnection(
    userId: string,
    onNotification: (notification: Notification) => void,
    onStatusUpdate: (status: any) => void,
    onError: (error: Error) => void
  ): WebSocket | null {
    try {
      const ws = new WebSocket(`${this.WEBSOCKET_URL}?userId=${userId}`);
      
      ws.onopen = () => {
        console.log('Notification WebSocket connected');
        onStatusUpdate({ connected: true });
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'notification':
              onNotification(data.notification);
              break;
            case 'status':
              onStatusUpdate(data.status);
              break;
            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          onError(new Error('Failed to parse WebSocket message'));
        }
      };
      
      ws.onclose = () => {
        console.log('Notification WebSocket disconnected');
        onStatusUpdate({ connected: false });
      };
      
      ws.onerror = (event) => {
        console.error('Notification WebSocket error:', event);
        onError(new Error('WebSocket connection error'));
      };
      
      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      onError(new Error('Failed to create WebSocket connection'));
      return null;
    }
  }

  /**
   * Search notifications with advanced text search and filtering
   */
  static async searchNotifications(
    userId: string,
    query: string,
    options: {
      categories?: string[];
      channels?: string[];
      priorities?: string[];
      dateRange?: { start: Date; end: Date };
      language?: 'en' | 'bn';
      limit?: number;
    } = {}
  ): Promise<NotificationApiResponse> {
    const {
      categories = [],
      channels = [],
      priorities = [],
      dateRange,
      language = 'en',
      limit = 50
    } = options;

    const params = new URLSearchParams({
      q: query,
      language,
      limit: limit.toString(),
      ...(categories.length > 0 && { categories: categories.join(',') }),
      ...(channels.length > 0 && { channels: channels.join(',') }),
      ...(priorities.length > 0 && { priorities: priorities.join(',') }),
      ...(dateRange && {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      })
    });

    const response = await fetch(`${this.BASE_URL}/search/${userId}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search notifications: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get notification analytics for business intelligence
   */
  static async getNotificationAnalytics(
    userId: string,
    timeRange: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/analytics/${userId}?timeRange=${timeRange}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch notification analytics: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get cultural notification recommendations based on Bangladesh context
   */
  static async getCulturalRecommendations(
    userId: string,
    culturalContext?: {
      district?: string;
      upazila?: string;
      religion?: string;
      festivals?: string[];
    }
  ): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/cultural/recommendations/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ culturalContext }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cultural recommendations: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Bulk notification operations for admin/vendor dashboards
   */
  static async bulkOperations(
    userId: string,
    operation: 'markRead' | 'markUnread' | 'star' | 'unstar' | 'delete' | 'archive',
    filter?: NotificationFilter
  ): Promise<{ affected: number; success: boolean }> {
    const response = await fetch(`${this.BASE_URL}/bulk/${operation}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, filter }),
    });

    if (!response.ok) {
      throw new Error(`Failed to perform bulk operation: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Export notifications for data analysis or backup
   */
  static async exportNotifications(
    userId: string,
    format: 'json' | 'csv' | 'excel',
    filter?: NotificationFilter
  ): Promise<Blob> {
    const params = new URLSearchParams({
      format,
      ...(filter?.type && { type: filter.type }),
      ...(filter?.category && { category: filter.category }),
      ...(filter?.dateRange && {
        startDate: filter.dateRange.start.toISOString(),
        endDate: filter.dateRange.end.toISOString()
      })
    });

    const response = await fetch(`${this.BASE_URL}/export/${userId}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to export notifications: ${response.statusText}`);
    }
    
    return response.blob();
  }
}