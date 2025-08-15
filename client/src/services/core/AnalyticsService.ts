/**
 * AnalyticsService - Comprehensive analytics with event tracking, ecommerce analytics, and real-time reporting
 */

import ApiService from './ApiService';

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties?: Record<string, any>;
}

export interface EcommerceEvent {
  type: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_product' | 'begin_checkout' | 'add_payment_info';
  transactionId?: string;
  items: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand?: string;
    variant?: string;
  }>;
  value: number;
  currency: string;
  coupon?: string;
}

export interface UserProperties {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  plan?: string;
  signupDate: string;
  lastSeen: string;
  customProperties?: Record<string, any>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId: string;
  batchSize: number;
  batchInterval: number;
  autoTrackPageViews: boolean;
  autoTrackClicks: boolean;
  debugMode: boolean;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private apiService: typeof ApiService;
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private batchTimer?: NodeJS.Timeout;
  private userProperties: UserProperties | null = null;

  private constructor() {
    this.apiService = ApiService;
    this.config = {
      enabled: true,
      trackingId: process.env.REACT_APP_ANALYTICS_ID || '',
      batchSize: 10,
      batchInterval: 30000, // 30 seconds
      autoTrackPageViews: true,
      autoTrackClicks: true,
      debugMode: process.env.NODE_ENV === 'development'
    };
    
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize tracking
   */
  private initializeTracking(): void {
    if (!this.config.enabled) return;

    // Start batch processing
    this.startBatchProcessing();

    // Auto-track page views
    if (this.config.autoTrackPageViews) {
      this.setupPageViewTracking();
    }

    // Auto-track clicks
    if (this.config.autoTrackClicks) {
      this.setupClickTracking();
    }

    // Load user properties
    this.loadUserProperties();
  }

  /**
   * Track custom event
   */
  public track(name: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name,
      category: properties?.category || 'general',
      action: properties?.action || name,
      label: properties?.label,
      value: properties?.value,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties: properties || {}
    };

    this.addToQueue(event);
  }

  /**
   * Track page view
   */
  public trackPageView(path: string, title?: string): void {
    if (!this.config.enabled) return;

    this.track('page_view', {
      category: 'navigation',
      action: 'view',
      label: path,
      page_path: path,
      page_title: title || document.title,
      referrer: document.referrer
    });
  }

  /**
   * Track ecommerce event
   */
  public trackEcommerce(event: EcommerceEvent): void {
    if (!this.config.enabled) return;

    this.track(`ecommerce_${event.type}`, {
      category: 'ecommerce',
      action: event.type,
      value: event.value,
      transaction_id: event.transactionId,
      currency: event.currency,
      items: event.items,
      coupon: event.coupon
    });
  }

  /**
   * Track user action
   */
  public trackUserAction(action: string, element?: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    this.track('user_action', {
      category: 'user_interaction',
      action,
      label: element,
      element_type: element,
      ...properties
    });
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metrics: Record<string, number>): void {
    if (!this.config.enabled) return;

    this.track('performance', {
      category: 'performance',
      action: 'metrics',
      ...metrics
    });
  }

  /**
   * Track error
   */
  public trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enabled) return;

    this.track('error', {
      category: 'error',
      action: 'exception',
      label: error.message,
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context
    });
  }

  /**
   * Track timing event
   */
  public trackTiming(category: string, variable: string, value: number, label?: string): void {
    if (!this.config.enabled) return;

    this.track('timing', {
      category,
      action: 'timing',
      label,
      timing_category: category,
      timing_variable: variable,
      timing_value: value
    });
  }

  /**
   * Set user ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    this.loadUserProperties();
  }

  /**
   * Set user properties
   */
  public setUserProperties(properties: Partial<UserProperties>): void {
    this.userProperties = {
      ...this.userProperties,
      ...properties
    } as UserProperties;

    // Send user properties to server
    this.sendUserProperties();
  }

  /**
   * Get analytics report
   */
  public async getAnalyticsReport(params: {
    startDate: string;
    endDate: string;
    metrics: string[];
    dimensions?: string[];
    filters?: Record<string, any>;
  }): Promise<any> {
    const response = await this.apiService.get('/analytics/report', params);
    return response.data;
  }

  /**
   * Get real-time analytics
   */
  public async getRealTimeAnalytics(): Promise<any> {
    const response = await this.apiService.get('/analytics/realtime');
    return response.data;
  }

  /**
   * Get user journey
   */
  public async getUserJourney(userId: string, sessionId?: string): Promise<any> {
    const response = await this.apiService.get('/analytics/user-journey', {
      userId,
      sessionId
    });
    return response.data;
  }

  /**
   * Get conversion funnel
   */
  public async getConversionFunnel(steps: string[]): Promise<any> {
    const response = await this.apiService.post('/analytics/funnel', { steps });
    return response.data;
  }

  /**
   * Get cohort analysis
   */
  public async getCohortAnalysis(params: {
    startDate: string;
    endDate: string;
    cohortType: 'daily' | 'weekly' | 'monthly';
  }): Promise<any> {
    const response = await this.apiService.get('/analytics/cohort', params);
    return response.data;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.enabled === false) {
      this.stopBatchProcessing();
    } else if (config.enabled === true) {
      this.startBatchProcessing();
    }
  }

  /**
   * Get configuration
   */
  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Clear event queue
   */
  public clearQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Get queue size
   */
  public getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Add event to queue
   */
  private addToQueue(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    if (this.config.debugMode) {
      console.log('Analytics Event:', event);
    }

    // Send immediately if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.sendBatch();
    }
  }

  /**
   * Start batch processing
   */
  private startBatchProcessing(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.sendBatch();
      }
    }, this.config.batchInterval);
  }

  /**
   * Stop batch processing
   */
  private stopBatchProcessing(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  /**
   * Send batch of events
   */
  private async sendBatch(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.apiService.post('/analytics/events', {
        events,
        sessionId: this.sessionId,
        userId: this.userId,
        userProperties: this.userProperties
      });
    } catch (error) {
      console.error('Failed to send analytics batch:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Send user properties
   */
  private async sendUserProperties(): Promise<void> {
    if (!this.userProperties) return;

    try {
      await this.apiService.post('/analytics/user-properties', this.userProperties);
    } catch (error) {
      console.error('Failed to send user properties:', error);
    }
  }

  /**
   * Load user properties
   */
  private async loadUserProperties(): Promise<void> {
    if (!this.userId) return;

    try {
      const response = await this.apiService.get(`/analytics/user-properties/${this.userId}`);
      this.userProperties = response.data;
    } catch (error) {
      console.error('Failed to load user properties:', error);
    }
  }

  /**
   * Setup page view tracking
   */
  private setupPageViewTracking(): void {
    // Track initial page view
    this.trackPageView(window.location.pathname, document.title);

    // Track SPA navigation
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname, document.title);
    });

    // Override history methods for SPA tracking
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(state, title, url) {
      originalPushState.call(history, state, title, url);
      AnalyticsService.getInstance().trackPageView(url?.toString() || window.location.pathname, title);
    };

    history.replaceState = function(state, title, url) {
      originalReplaceState.call(history, state, title, url);
      AnalyticsService.getInstance().trackPageView(url?.toString() || window.location.pathname, title);
    };
  }

  /**
   * Setup click tracking
   */
  private setupClickTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        this.trackUserAction('click', 'button', {
          button_text: target.textContent?.trim(),
          button_id: target.id,
          button_class: target.className
        });
      }
      
      // Track link clicks
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        this.trackUserAction('click', 'link', {
          link_url: href,
          link_text: target.textContent?.trim(),
          link_id: target.id
        });
      }
    });
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default AnalyticsService.getInstance();