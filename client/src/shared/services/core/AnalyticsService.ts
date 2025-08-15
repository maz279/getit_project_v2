/**
 * AnalyticsService - Unified Analytics Tracking Service
 * Consolidates all analytics functionality
 * 
 * Consolidates:
 * - analytics/AnalyticsApiService.js
 * - ml/AnalyticsEngine.ts
 * - All analytics tracking and reporting
 */

import ApiService from './ApiService';

interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp?: number;
  sessionId?: string;
  userId?: string;
}

interface PageView {
  page: string;
  title: string;
  url: string;
  referrer?: string;
  timestamp?: number;
  sessionId?: string;
  userId?: string;
}

interface UserProperties {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  signupDate?: string;
  lastLoginDate?: string;
  totalOrders?: number;
  totalSpent?: number;
  preferredLanguage?: string;
  country?: string;
  city?: string;
  customProperties?: Record<string, any>;
}

interface EcommerceEvent {
  eventType: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_item' | 'begin_checkout' | 'add_payment_info' | 'add_shipping_info';
  transactionId?: string;
  currency?: string;
  value?: number;
  items?: Array<{
    itemId: string;
    itemName: string;
    category: string;
    price: number;
    quantity: number;
    brand?: string;
    variant?: string;
  }>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface AnalyticsConfig {
  trackingId: string;
  apiEndpoint: string;
  batchSize: number;
  flushInterval: number;
  enableAutoTrack: boolean;
  enableEcommerce: boolean;
  enableUserTracking: boolean;
  enableErrorTracking: boolean;
  debugMode: boolean;
  samplingRate: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private pageViewQueue: PageView[] = [];
  private ecommerceQueue: EcommerceEvent[] = [];
  private sessionId: string;
  private userId: string | null = null;
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = {
      trackingId: process.env.REACT_APP_ANALYTICS_ID || '',
      apiEndpoint: '/api/analytics',
      batchSize: 20,
      flushInterval: 5000,
      enableAutoTrack: true,
      enableEcommerce: true,
      enableUserTracking: true,
      enableErrorTracking: true,
      debugMode: process.env.NODE_ENV === 'development',
      samplingRate: 1.0,
    };

    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private initializeAnalytics(): void {
    if (this.isInitialized) return;

    // Setup periodic flush
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Auto-track page views if enabled
    if (this.config.enableAutoTrack) {
      this.setupAutoTracking();
    }

    // Setup error tracking if enabled
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Setup beforeunload to flush events
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    this.isInitialized = true;
    this.log('Analytics initialized');
  }

  // Configuration methods
  public configure(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.flushInterval && this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  public setUserId(userId: string | null): void {
    this.userId = userId;
    this.log('User ID set:', userId);
  }

  public setUserProperties(properties: UserProperties): void {
    if (!this.config.enableUserTracking) return;

    this.userId = properties.userId;
    this.track('user_properties_set', 'user', 'properties', undefined, properties);
  }

  // Event tracking methods
  public track(name: string, category: string, action: string, label?: string, value?: number, properties?: Record<string, any>): void {
    if (!this.shouldTrack()) return;

    const event: AnalyticsEvent = {
      name,
      category,
      action,
      label,
      value,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.eventQueue.push(event);
    this.log('Event tracked:', event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  public trackPageView(page: string, title: string, url?: string, referrer?: string): void {
    if (!this.shouldTrack()) return;

    const pageView: PageView = {
      page,
      title,
      url: url || window.location.href,
      referrer: referrer || document.referrer,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.pageViewQueue.push(pageView);
    this.log('Page view tracked:', pageView);

    if (this.pageViewQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  public trackEcommerce(event: EcommerceEvent): void {
    if (!this.config.enableEcommerce || !this.shouldTrack()) return;

    const ecommerceEvent: EcommerceEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.ecommerceQueue.push(ecommerceEvent);
    this.log('Ecommerce event tracked:', ecommerceEvent);

    if (this.ecommerceQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Ecommerce specific methods
  public trackPurchase(transactionId: string, currency: string, value: number, items: EcommerceEvent['items']): void {
    this.trackEcommerce({
      eventType: 'purchase',
      transactionId,
      currency,
      value,
      items,
    });
  }

  public trackAddToCart(itemId: string, itemName: string, category: string, price: number, quantity: number = 1): void {
    this.trackEcommerce({
      eventType: 'add_to_cart',
      items: [{
        itemId,
        itemName,
        category,
        price,
        quantity,
      }],
    });
  }

  public trackRemoveFromCart(itemId: string, itemName: string, category: string, price: number, quantity: number = 1): void {
    this.trackEcommerce({
      eventType: 'remove_from_cart',
      items: [{
        itemId,
        itemName,
        category,
        price,
        quantity,
      }],
    });
  }

  public trackViewItem(itemId: string, itemName: string, category: string, price: number): void {
    this.trackEcommerce({
      eventType: 'view_item',
      items: [{
        itemId,
        itemName,
        category,
        price,
        quantity: 1,
      }],
    });
  }

  public trackBeginCheckout(currency: string, value: number, items: EcommerceEvent['items']): void {
    this.trackEcommerce({
      eventType: 'begin_checkout',
      currency,
      value,
      items,
    });
  }

  // Common tracking methods
  public trackClick(elementId: string, elementType: string, page: string, additionalData?: Record<string, any>): void {
    this.track('click', 'interaction', 'click', elementId, undefined, {
      elementType,
      page,
      ...additionalData,
    });
  }

  public trackSearch(query: string, category?: string, resultsCount?: number): void {
    this.track('search', 'search', 'query', query, resultsCount, {
      category,
      query,
    });
  }

  public trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enableErrorTracking) return;

    this.track('error', 'error', 'javascript_error', error.message, undefined, {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      context,
    });
  }

  public trackPerformance(metric: string, value: number, additionalData?: Record<string, any>): void {
    this.track('performance', 'performance', metric, undefined, value, additionalData);
  }

  public trackFormSubmit(formId: string, formType: string, success: boolean, additionalData?: Record<string, any>): void {
    this.track('form_submit', 'form', 'submit', formId, success ? 1 : 0, {
      formType,
      success,
      ...additionalData,
    });
  }

  // Batch operations
  public async flush(): Promise<void> {
    if (this.eventQueue.length === 0 && this.pageViewQueue.length === 0 && this.ecommerceQueue.length === 0) {
      return;
    }

    const payload = {
      events: [...this.eventQueue],
      pageViews: [...this.pageViewQueue],
      ecommerceEvents: [...this.ecommerceQueue],
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
    };

    // Clear queues
    this.eventQueue = [];
    this.pageViewQueue = [];
    this.ecommerceQueue = [];

    try {
      await ApiService.post(this.config.apiEndpoint, payload);
      this.log('Analytics data flushed successfully');
    } catch (error) {
      console.error('Error flushing analytics data:', error);
      // Re-queue events on failure (with limit to prevent infinite growth)
      if (payload.events.length < 100) {
        this.eventQueue.unshift(...payload.events);
      }
      if (payload.pageViews.length < 100) {
        this.pageViewQueue.unshift(...payload.pageViews);
      }
      if (payload.ecommerceEvents.length < 100) {
        this.ecommerceQueue.unshift(...payload.ecommerceEvents);
      }
    }
  }

  // Analytics reporting methods
  public async getAnalyticsReport(startDate: string, endDate: string, metrics?: string[]): Promise<any> {
    try {
      const response = await ApiService.get(`${this.config.apiEndpoint}/report`, {
        params: {
          startDate,
          endDate,
          metrics: metrics?.join(','),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics report:', error);
      throw error;
    }
  }

  public async getPageViewStats(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await ApiService.get(`${this.config.apiEndpoint}/pageviews`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching page view stats:', error);
      throw error;
    }
  }

  public async getEcommerceStats(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await ApiService.get(`${this.config.apiEndpoint}/ecommerce`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ecommerce stats:', error);
      throw error;
    }
  }

  public async getUserAnalytics(userId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const response = await ApiService.get(`${this.config.apiEndpoint}/user/${userId}`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  // Utility methods
  public getSessionId(): string {
    return this.sessionId;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  public getQueueSizes(): { events: number; pageViews: number; ecommerce: number } {
    return {
      events: this.eventQueue.length,
      pageViews: this.pageViewQueue.length,
      ecommerce: this.ecommerceQueue.length,
    };
  }

  public clearQueues(): void {
    this.eventQueue = [];
    this.pageViewQueue = [];
    this.ecommerceQueue = [];
  }

  // Private helper methods
  private shouldTrack(): boolean {
    return this.config.samplingRate >= Math.random();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupAutoTracking(): void {
    // Track page views on route changes
    let lastUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        this.trackPageView(
          window.location.pathname,
          document.title,
          window.location.href
        );
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial page view
    this.trackPageView(
      window.location.pathname,
      document.title,
      window.location.href
    );
  }

  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        reason: event.reason,
      });
    });
  }

  private log(message: string, data?: any): void {
    if (this.config.debugMode) {
      console.log(`[Analytics] ${message}`, data);
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    this.flush();
    this.isInitialized = false;
  }
}

export default AnalyticsService.getInstance();
export { AnalyticsService, AnalyticsEvent, PageView, UserProperties, EcommerceEvent, AnalyticsConfig };