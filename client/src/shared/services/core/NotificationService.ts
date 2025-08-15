/**
 * NotificationService - Unified Notification Service
 * Consolidates all notification functionality
 * 
 * Consolidates:
 * - NotificationService.ts
 * - NotificationApiService.js
 * - All notification channels (email, SMS, push, in-app)
 */

import ApiService from './ApiService';

interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationChannel;
  subject?: string;
  content: string;
  variables?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  transactional: boolean;
  security: boolean;
  preferences: Record<string, boolean>;
}

interface NotificationMessage {
  id?: string;
  userId: string;
  channel: NotificationChannel;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
  scheduled?: Date;
  sent?: boolean;
  read?: boolean;
  priority: NotificationPriority;
  templateId?: string;
  createdAt?: Date;
  sentAt?: Date;
  readAt?: Date;
}

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  sound?: string;
  click_action?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

interface EmailNotificationPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

interface SMSNotificationPayload {
  to: string[];
  message: string;
  from?: string;
}

type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'marketing' | 'transactional' | 'security';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

class NotificationService {
  private static instance: NotificationService;
  private inAppNotifications: NotificationMessage[] = [];
  private notificationCallbacks: Map<string, (notification: NotificationMessage) => void> = new Map();
  private pushSubscription: PushSubscription | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeService(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      await this.initializePushNotifications();
    }

    // Load in-app notifications
    await this.loadInAppNotifications();

    this.isInitialized = true;
  }

  // Core notification methods
  public async sendNotification(notification: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check user preferences
      const preferences = await this.getUserPreferences(notification.userId);
      
      if (!this.shouldSendNotification(notification, preferences)) {
        return { success: false, error: 'Notification blocked by user preferences' };
      }

      // Send based on channel
      switch (notification.channel) {
        case 'email':
          return await this.sendEmailNotification(notification);
        case 'sms':
          return await this.sendSMSNotification(notification);
        case 'push':
          return await this.sendPushNotification(notification);
        case 'in-app':
          return await this.sendInAppNotification(notification);
        default:
          return { success: false, error: 'Unknown notification channel' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async sendMultiChannelNotification(
    notification: Omit<NotificationMessage, 'channel'>,
    channels: NotificationChannel[]
  ): Promise<Array<{ channel: NotificationChannel; success: boolean; messageId?: string; error?: string }>> {
    const results = [];

    for (const channel of channels) {
      const result = await this.sendNotification({
        ...notification,
        channel,
      });
      
      results.push({
        channel,
        ...result,
      });
    }

    return results;
  }

  // Email notifications
  private async sendEmailNotification(notification: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const user = await this.getUserDetails(notification.userId);
      
      const payload: EmailNotificationPayload = {
        to: [user.email],
        subject: notification.title,
        htmlContent: notification.content,
        textContent: this.stripHtml(notification.content),
      };

      const response = await ApiService.post('/notifications/email', payload);
      
      if (response.status === 200) {
        return { success: true, messageId: response.data.messageId };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // SMS notifications
  private async sendSMSNotification(notification: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const user = await this.getUserDetails(notification.userId);
      
      if (!user.phoneNumber) {
        return { success: false, error: 'User has no phone number' };
      }

      const payload: SMSNotificationPayload = {
        to: [user.phoneNumber],
        message: `${notification.title}: ${this.stripHtml(notification.content)}`,
      };

      const response = await ApiService.post('/notifications/sms', payload);
      
      if (response.status === 200) {
        return { success: true, messageId: response.data.messageId };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Push notifications
  private async sendPushNotification(notification: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const payload: PushNotificationPayload = {
        title: notification.title,
        body: this.stripHtml(notification.content),
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        data: notification.data || {},
      };

      const response = await ApiService.post('/notifications/push', {
        userId: notification.userId,
        payload,
      });
      
      if (response.status === 200) {
        return { success: true, messageId: response.data.messageId };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // In-app notifications
  private async sendInAppNotification(notification: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const messageId = `in-app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const inAppNotification: NotificationMessage = {
        ...notification,
        id: messageId,
        sent: true,
        read: false,
        createdAt: new Date(),
        sentAt: new Date(),
      };

      // Add to in-app notifications
      this.inAppNotifications.unshift(inAppNotification);

      // Keep only last 100 notifications
      if (this.inAppNotifications.length > 100) {
        this.inAppNotifications = this.inAppNotifications.slice(0, 100);
      }

      // Trigger callbacks
      this.notifyCallbacks(inAppNotification);

      // Save to API
      await ApiService.post('/notifications/in-app', inAppNotification);

      return { success: true, messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Template management
  public async createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; template?: NotificationTemplate; error?: string }> {
    try {
      const response = await ApiService.post('/notifications/templates', template);
      
      if (response.status === 201) {
        return { success: true, template: response.data };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<{ success: boolean; template?: NotificationTemplate; error?: string }> {
    try {
      const response = await ApiService.put(`/notifications/templates/${templateId}`, updates);
      
      if (response.status === 200) {
        return { success: true, template: response.data };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    try {
      const response = await ApiService.get(`/notifications/templates/${templateId}`);
      return response.status === 200 ? response.data : null;
    } catch (error) {
      return null;
    }
  }

  public async getTemplates(type?: NotificationChannel): Promise<NotificationTemplate[]> {
    try {
      const response = await ApiService.get('/notifications/templates', {
        params: { type },
      });
      return response.status === 200 ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  public async deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.delete(`/notifications/templates/${templateId}`);
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // User preferences
  public async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await ApiService.get(`/notifications/preferences/${userId}`);
      return response.status === 200 ? response.data : this.getDefaultPreferences(userId);
    } catch (error) {
      return this.getDefaultPreferences(userId);
    }
  }

  public async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await ApiService.put(`/notifications/preferences/${userId}`, preferences);
      return { success: response.status === 200 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // In-app notification management
  public getInAppNotifications(userId: string): NotificationMessage[] {
    return this.inAppNotifications.filter(n => n.userId === userId);
  }

  public getUnreadCount(userId: string): number {
    return this.inAppNotifications.filter(n => n.userId === userId && !n.read).length;
  }

  public async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const notification = this.inAppNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date();
        
        // Update on server
        await ApiService.put(`/notifications/${notificationId}/read`);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userNotifications = this.inAppNotifications.filter(n => n.userId === userId && !n.read);
      
      for (const notification of userNotifications) {
        notification.read = true;
        notification.readAt = new Date();
      }
      
      // Update on server
      await ApiService.put(`/notifications/read-all/${userId}`);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.inAppNotifications = this.inAppNotifications.filter(n => n.id !== notificationId);
      
      // Delete from server
      await ApiService.delete(`/notifications/${notificationId}`);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Real-time callbacks
  public onNotification(callback: (notification: NotificationMessage) => void): string {
    const id = `callback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.notificationCallbacks.set(id, callback);
    return id;
  }

  public offNotification(callbackId: string): void {
    this.notificationCallbacks.delete(callbackId);
  }

  // Push notification setup
  public async subscribeToPush(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { success: false, error: 'Push notifications not supported' };
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, error: 'Push notification permission denied' };
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY!),
      });

      this.pushSubscription = subscription;

      // Save subscription to server
      await ApiService.post('/notifications/push/subscribe', {
        subscription: subscription.toJSON(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  public async unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.pushSubscription) {
        await this.pushSubscription.unsubscribe();
        this.pushSubscription = null;
        
        // Remove subscription from server
        await ApiService.post('/notifications/push/unsubscribe');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Analytics and stats
  public async getNotificationStats(userId?: string, startDate?: string, endDate?: string): Promise<NotificationStats> {
    try {
      const response = await ApiService.get('/notifications/stats', {
        params: { userId, startDate, endDate },
      });
      return response.status === 200 ? response.data : this.getDefaultStats();
    } catch (error) {
      return this.getDefaultStats();
    }
  }

  // Bulk operations
  public async sendBulkNotifications(notifications: NotificationMessage[]): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
    try {
      const response = await ApiService.post('/notifications/bulk', { notifications });
      return response.status === 200 ? response.data : [];
    } catch (error) {
      return notifications.map(() => ({ success: false, error: error.message }));
    }
  }

  // Helper methods
  private async loadInAppNotifications(): Promise<void> {
    try {
      const response = await ApiService.get('/notifications/in-app');
      if (response.status === 200) {
        this.inAppNotifications = response.data;
      }
    } catch (error) {
      console.error('Error loading in-app notifications:', error);
    }
  }

  private async initializePushNotifications(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        this.pushSubscription = subscription;
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private shouldSendNotification(notification: NotificationMessage, preferences: NotificationPreferences): boolean {
    // Check channel preference
    if (!preferences[notification.channel]) {
      return false;
    }

    // Check type preference
    switch (notification.type) {
      case 'marketing':
        return preferences.marketing;
      case 'transactional':
        return preferences.transactional;
      case 'security':
        return preferences.security;
      default:
        return true;
    }
  }

  private async getUserDetails(userId: string): Promise<any> {
    try {
      const response = await ApiService.get(`/users/${userId}`);
      return response.status === 200 ? response.data : null;
    } catch (error) {
      throw new Error('Failed to get user details');
    }
  }

  private notifyCallbacks(notification: NotificationMessage): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      email: true,
      sms: true,
      push: true,
      inApp: true,
      marketing: false,
      transactional: true,
      security: true,
      preferences: {},
    };
  }

  private getDefaultStats(): NotificationStats {
    return {
      total: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      failed: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
    };
  }
}

export default NotificationService.getInstance();
export {
  NotificationService,
  NotificationTemplate,
  NotificationPreferences,
  NotificationMessage,
  PushNotificationPayload,
  EmailNotificationPayload,
  SMSNotificationPayload,
  NotificationChannel,
  NotificationType,
  NotificationPriority,
  NotificationStats,
};