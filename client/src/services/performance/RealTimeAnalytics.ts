/**
 * Real-Time Analytics Service
 * Phase 1 Week 7-8: Performance Monitoring Implementation
 * Real-time performance data collection and analysis
 */

interface AnalyticsEvent {
  type: string;
  data: any;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  performanceMetrics: any[];
}

class RealTimeAnalytics {
  private static instance: RealTimeAnalytics;
  private session: UserSession;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled = true;
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private retryAttempts = 3;

  private constructor() {
    this.session = this.createSession();
    this.initializeTracking();
    this.startBatchProcessing();
  }

  static getInstance(): RealTimeAnalytics {
    if (!RealTimeAnalytics.instance) {
      RealTimeAnalytics.instance = new RealTimeAnalytics();
    }
    return RealTimeAnalytics.instance;
  }

  private createSession(): UserSession {
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      performanceMetrics: [],
    };
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Track page views
    this.trackPageView();

    // Track user interactions
    this.trackUserInteractions();

    // Track performance metrics
    this.trackPerformanceMetrics();

    // Track errors
    this.trackErrors();

    // Track page visibility
    this.trackPageVisibility();
  }

  private trackPageView() {
    this.session.pageViews++;
    this.track('page_view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    });
  }

  private trackUserInteractions() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.track('click', {
        element: target.tagName,
        text: target.textContent?.substring(0, 100),
        className: target.className,
        id: target.id,
        x: event.clientX,
        y: event.clientY,
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.track('form_submit', {
        action: form.action,
        method: form.method,
        formId: form.id,
        fieldCount: form.elements.length,
      });
    });

    // Track scroll events
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.track('scroll', {
          scrollTop: window.pageYOffset,
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: document.documentElement.clientHeight,
          scrollPercent: Math.round(
            (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          ),
        });
      }, 100);
    });
  }

  private trackPerformanceMetrics() {
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.track('performance_metric', {
            name: entry.name,
            entryType: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            value: (entry as any).value,
          });
        });
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    }

    // Track resource loading
    window.addEventListener('load', () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.track('page_load', {
        domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
        loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
        ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
        domInteractive: navigationEntry.domInteractive - navigationEntry.domLoading,
      });
    });
  }

  private trackErrors() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.track('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Track promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track('promise_rejection', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  private trackPageVisibility() {
    document.addEventListener('visibilitychange', () => {
      this.track('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
      });
    });

    // Track session end
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: Date.now() - this.session.startTime,
        pageViews: this.session.pageViews,
        eventCount: this.session.events.length,
      });
      this.flushEvents();
    });
  }

  private startBatchProcessing() {
    setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, this.flushInterval);
  }

  // Public API
  public track(eventType: string, data: any) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      type: eventType,
      data,
      timestamp: Date.now(),
      sessionId: this.session.id,
      userId: this.session.userId,
    };

    this.session.events.push(event);
    this.session.lastActivity = Date.now();
    this.eventQueue.push(event);

    // Flush immediately for critical events
    if (this.isCriticalEvent(eventType)) {
      this.flushEvents();
    }

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  private isCriticalEvent(eventType: string): boolean {
    return [
      'javascript_error',
      'promise_rejection',
      'session_end',
      'form_submit',
    ].includes(eventType);
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(events);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  private async sendEvents(events: AnalyticsEvent[], attempt = 1): Promise<void> {
    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          session: this.session,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      if (attempt < this.retryAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          this.sendEvents(events, attempt + 1);
        }, delay);
      } else {
        throw error;
      }
    }
  }

  public setUserId(userId: string) {
    this.session.userId = userId;
  }

  public getSession(): UserSession {
    return { ...this.session };
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }

  public setBatchSize(size: number) {
    this.batchSize = size;
  }

  public setFlushInterval(interval: number) {
    this.flushInterval = interval;
  }

  public exportSession(): string {
    return JSON.stringify(this.session, null, 2);
  }

  public clearSession() {
    this.session = this.createSession();
    this.eventQueue = [];
  }

  // Bangladesh-specific analytics
  public trackBangladeshMetrics() {
    // Track network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.track('network_info', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    }

    // Track mobile banking interactions
    this.track('mobile_banking_availability', {
      bkash: this.checkMobileBankingSupport('bkash'),
      nagad: this.checkMobileBankingSupport('nagad'),
      rocket: this.checkMobileBankingSupport('rocket'),
    });

    // Track cultural preferences
    this.track('cultural_preferences', {
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: this.detectCurrencyPreference(),
    });
  }

  private checkMobileBankingSupport(provider: string): boolean {
    // Simulated mobile banking support check
    return ['bkash', 'nagad', 'rocket'].includes(provider);
  }

  private detectCurrencyPreference(): string {
    const locale = navigator.language;
    if (locale.startsWith('bn') || locale.includes('BD')) {
      return 'BDT';
    }
    return 'USD';
  }
}

export default RealTimeAnalytics;