/**
 * NotificationService - Multi-channel notifications (email, SMS, push, in-app) with template management
 */

import ApiService from './ApiService';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  subject?: string;
  content: string;
  variables: string[];
  language: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in-app';
  enabled: boolean;
  config: {
    email?: {
      provider: 'sendgrid' | 'mailgun' | 'smtp';
      apiKey?: string;
      fromEmail: string;
      fromName: string;
    };
    sms?: {
      provider: 'twilio' | 'nexmo' | 'local';
      apiKey?: string;
      fromNumber: string;
    };
    push?: {
      provider: 'firebase' | 'onesignal' | 'pusher';
      apiKey?: string;
      appId?: string;
    };
    inApp?: {
      maxRetention: number; // days
      autoMarkRead: boolean;
    };
  };
}

export interface NotificationRecipient {
  id: string;
  email?: string;
  phone?: string;
  pushToken?: string;
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    categories: Record<string, boolean>;
  };
  language: string;
  timezone: string;
}

export interface NotificationRequest {
  templateId: string;
  recipients: string[] | NotificationRecipient[];
  variables?: Record<string, any>;
  channels?: Array<'email' | 'sms' | 'push' | 'in-app'>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  scheduledAt?: string;
  expiresAt?: string;
}

export interface NotificationStatus {
  id: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  channel: string;
  recipient: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;
  private apiService: typeof ApiService;
  private channels: Map<string, NotificationChannel> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private inAppNotifications: InAppNotification[] = [];
  private listeners: Array<(notifications: InAppNotification[]) => void> = [];
  private pushSubscription: PushSubscription | null = null;

  private constructor() {
    this.apiService = ApiService;
    this.initializeChannels();
    this.initializePushNotifications();
    this.loadInAppNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send notification
   */
  public async sendNotification(request: NotificationRequest): Promise<{ id: string; status: string }> {
    const response = await this.apiService.post('/notifications/send', request);
    return response.data;
  }

  /**
   * Send bulk notifications
   */
  public async sendBulkNotifications(requests: NotificationRequest[]): Promise<{ results: Array<{ id: string; status: string }> }> {
    const response = await this.apiService.post('/notifications/bulk', { requests });
    return response.data;
  }

  /**
   * Send immediate notification
   */
  public async sendImmediate(
    templateId: string,
    recipient: string,
    variables?: Record<string, any>,
    channels?: Array<'email' | 'sms' | 'push' | 'in-app'>
  ): Promise<void> {
    await this.sendNotification({
      templateId,
      recipients: [recipient],
      variables,
      channels: channels || ['email', 'in-app'],
      priority: 'medium',
      category: 'general'
    });
  }

  /**
   * Schedule notification
   */
  public async scheduleNotification(
    request: NotificationRequest,
    scheduledAt: string
  ): Promise<{ id: string; scheduledAt: string }> {
    const response = await this.apiService.post('/notifications/schedule', {
      ...request,
      scheduledAt
    });
    return response.data;
  }

  /**
   * Cancel scheduled notification
   */
  public async cancelScheduledNotification(id: string): Promise<void> {
    await this.apiService.delete(`/notifications/scheduled/${id}`);
  }

  /**
   * Get notification status
   */
  public async getNotificationStatus(id: string): Promise<NotificationStatus[]> {
    const response = await this.apiService.get(`/notifications/${id}/status`);
    return response.data;
  }

  /**
   * Get notification history
   */
  public async getNotificationHistory(
    recipient?: string,
    category?: string,
    limit?: number,
    offset?: number
  ): Promise<{ notifications: NotificationStatus[]; total: number }> {
    const response = await this.apiService.get('/notifications/history', {
      recipient,
      category,
      limit,
      offset
    });
    return response.data;
  }

  /**
   * Get notification analytics
   */
  public async getNotificationAnalytics(
    startDate: string,
    endDate: string,
    groupBy?: 'channel' | 'category' | 'template'
  ): Promise<any> {
    const response = await this.apiService.get('/notifications/analytics', {
      startDate,
      endDate,
      groupBy
    });
    return response.data;
  }

  /**
   * Create notification template
   */
  public async createTemplate(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const response = await this.apiService.post('/notifications/templates', template);
    const newTemplate = response.data;
    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  /**
   * Update notification template
   */
  public async updateTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await this.apiService.put(`/notifications/templates/${id}`, updates);
    const updatedTemplate = response.data;
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  /**
   * Delete notification template
   */
  public async deleteTemplate(id: string): Promise<void> {
    await this.apiService.delete(`/notifications/templates/${id}`);
    this.templates.delete(id);
  }

  /**
   * Get notification templates
   */
  public async getTemplates(): Promise<NotificationTemplate[]> {
    const response = await this.apiService.get('/notifications/templates');
    response.data.forEach((template: NotificationTemplate) => {
      this.templates.set(template.id, template);
    });
    return response.data;
  }

  /**
   * Get template by ID
   */
  public async getTemplate(id: string): Promise<NotificationTemplate | null> {
    if (this.templates.has(id)) {
      return this.templates.get(id)!;
    }
    
    try {
      const response = await this.apiService.get(`/notifications/templates/${id}`);
      const template = response.data;
      this.templates.set(id, template);
      return template;
    } catch (error) {
      return null;
    }
  }

  /**
   * Configure notification channel
   */
  public async configureChannel(type: string, config: NotificationChannel): Promise<void> {
    await this.apiService.put(`/notifications/channels/${type}`, config);
    this.channels.set(type, config);
  }

  /**
   * Get channel configuration
   */
  public async getChannelConfig(type: string): Promise<NotificationChannel | null> {
    if (this.channels.has(type)) {
      return this.channels.get(type)!;
    }
    
    try {
      const response = await this.apiService.get(`/notifications/channels/${type}`);
      const config = response.data;
      this.channels.set(type, config);
      return config;
    } catch (error) {
      return null;
    }
  }

  /**
   * Test notification channel
   */
  public async testChannel(type: string, recipient: string): Promise<{ success: boolean; error?: string }> {
    const response = await this.apiService.post(`/notifications/channels/${type}/test`, { recipient });
    return response.data;
  }

  /**
   * Get recipient preferences
   */
  public async getRecipientPreferences(recipientId: string): Promise<NotificationRecipient | null> {
    try {
      const response = await this.apiService.get(`/notifications/recipients/${recipientId}/preferences`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update recipient preferences
   */
  public async updateRecipientPreferences(
    recipientId: string,
    preferences: Partial<NotificationRecipient['preferences']>
  ): Promise<NotificationRecipient> {
    const response = await this.apiService.put(`/notifications/recipients/${recipientId}/preferences`, preferences);
    return response.data;
  }

  /**
   * Get in-app notifications
   */
  public getInAppNotifications(): InAppNotification[] {
    return [...this.inAppNotifications];
  }

  /**
   * Mark in-app notification as read
   */
  public async markAsRead(id: string): Promise<void> {
    await this.apiService.put(`/notifications/in-app/${id}/read`);
    
    const notification = this.inAppNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  /**
   * Mark all in-app notifications as read
   */
  public async markAllAsRead(): Promise<void> {
    await this.apiService.put('/notifications/in-app/read-all');
    
    this.inAppNotifications.forEach(notification => {
      notification.read = true;
    });
    this.notifyListeners();
  }

  /**
   * Delete in-app notification
   */
  public async deleteInAppNotification(id: string): Promise<void> {
    await this.apiService.delete(`/notifications/in-app/${id}`);
    
    this.inAppNotifications = this.inAppNotifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all in-app notifications
   */
  public async clearAllInAppNotifications(): Promise<void> {
    await this.apiService.delete('/notifications/in-app/all');
    
    this.inAppNotifications = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to push notifications
   */
  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.getVapidKey()
      });

      // Send subscription to server
      await this.apiService.post('/notifications/push/subscribe', {
        subscription: subscription.toJSON()
      });

      this.pushSubscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribeFromPushNotifications(): Promise<void> {
    if (this.pushSubscription) {
      await this.pushSubscription.unsubscribe();
      await this.apiService.delete('/notifications/push/unsubscribe');
      this.pushSubscription = null;
    }
  }

  /**
   * Subscribe to in-app notifications
   */
  public subscribeToInAppNotifications(callback: (notifications: InAppNotification[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Show browser notification
   */
  public async showBrowserNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, options);
    }
  }

  /**
   * Initialize notification channels
   */
  private async initializeChannels(): Promise<void> {
    try {
      const response = await this.apiService.get('/notifications/channels');
      response.data.forEach((channel: NotificationChannel & { type: string }) => {
        this.channels.set(channel.type, channel);
      });
    } catch (error) {
      console.error('Failed to initialize notification channels:', error);
    }
  }

  /**
   * Initialize push notifications
   */
  private async initializePushNotifications(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    }
  }

  /**
   * Load in-app notifications
   */
  private async loadInAppNotifications(): Promise<void> {
    try {
      const response = await this.apiService.get('/notifications/in-app');
      this.inAppNotifications = response.data;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load in-app notifications:', error);
    }
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.inAppNotifications));
  }

  /**
   * Get VAPID key for push notifications
   */
  private getVapidKey(): string {
    return process.env.REACT_APP_VAPID_KEY || '';
  }
}

export default NotificationService.getInstance();