// Advanced analytics component for Phase 4 Features & Integrations
import React, { useState, useEffect, useRef } from 'react';
import { advancedCache } from '../../services/AdvancedCacheManager';

interface AnalyticsEvent {
  id: string;
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata: Record<string, any>;
}

interface UserBehavior {
  clicks: number;
  scrollDepth: number;
  timeOnPage: number;
  interactions: number;
  bounceRate: number;
  conversionEvents: number;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoadedTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export class AdvancedAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private startTime: number;
  private eventListeners: (() => void)[] = [];
  private behaviorData: UserBehavior;
  private performanceMetrics: PerformanceMetrics;
  private batchQueue: AnalyticsEvent[] = [];
  private batchTimer?: NodeJS.Timeout;
  private observers: Map<string, IntersectionObserver> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.behaviorData = {
      clicks: 0,
      scrollDepth: 0,
      timeOnPage: 0,
      interactions: 0,
      bounceRate: 0,
      conversionEvents: 0
    };
    this.performanceMetrics = {
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };

    this.initialize();
  }

  // Initialize analytics
  private initialize(): void {
    this.loadUserData();
    this.setupEventListeners();
    this.setupPerformanceTracking();
    this.setupVisibilityTracking();
    this.setupScrollTracking();
    this.setupClickTracking();
    this.setupFormTracking();
  }

  // Track custom event
  track(
    type: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata: Record<string, any> = {}
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };

    this.events.push(event);
    this.addToBatch(event);
    this.updateBehaviorData(event);

    // Cache important events
    if (['conversion', 'error', 'performance'].includes(category)) {
      advancedCache.set(`analytics_${event.id}`, event, {
        ttl: 86400000, // 24 hours
        tags: ['analytics', category],
        priority: 'high'
      });
    }
  }

  // Track page view
  trackPageView(page?: string): void {
    this.track('pageview', 'navigation', 'page_view', page || window.location.pathname, undefined, {
      referrer: document.referrer,
      title: document.title
    });
  }

  // Track user interaction
  trackInteraction(element: string, action: string, metadata: Record<string, any> = {}): void {
    this.behaviorData.interactions++;
    this.track('interaction', 'user', action, element, undefined, {
      ...metadata,
      totalInteractions: this.behaviorData.interactions
    });
  }

  // Track conversion
  trackConversion(type: string, value?: number, metadata: Record<string, any> = {}): void {
    this.behaviorData.conversionEvents++;
    this.track('conversion', 'business', type, undefined, value, {
      ...metadata,
      totalConversions: this.behaviorData.conversionEvents
    });
  }

  // Track error
  trackError(error: Error | string, metadata: Record<string, any> = {}): void {
    const errorData = typeof error === 'string' ? { message: error } : {
      message: error.message,
      stack: error.stack,
      name: error.name
    };

    this.track('error', 'technical', 'javascript_error', undefined, undefined, {
      ...errorData,
      ...metadata
    });
  }

  // Track performance
  trackPerformance(metrics: Partial<PerformanceMetrics>): void {
    Object.assign(this.performanceMetrics, metrics);
    
    this.track('performance', 'technical', 'metrics', undefined, undefined, {
      ...this.performanceMetrics,
      sessionDuration: Date.now() - this.startTime
    });
  }

  // Setup element visibility tracking
  trackElementVisibility(element: HTMLElement, threshold: number = 0.5): void {
    const observerId = `visibility_${Math.random().toString(36).substr(2, 9)}`;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.track('visibility', 'engagement', 'element_visible', 
            element.id || element.className, undefined, {
              threshold,
              elementType: element.tagName.toLowerCase(),
              intersectionRatio: entry.intersectionRatio
            }
          );
        }
      });
    }, { threshold });

    observer.observe(element);
    this.observers.set(observerId, observer);
  }

  // Get analytics data
  getEvents(filter?: { category?: string; type?: string; timeRange?: number }): AnalyticsEvent[] {
    let filteredEvents = this.events;

    if (filter) {
      if (filter.category) {
        filteredEvents = filteredEvents.filter(e => e.category === filter.category);
      }
      if (filter.type) {
        filteredEvents = filteredEvents.filter(e => e.type === filter.type);
      }
      if (filter.timeRange) {
        const cutoff = Date.now() - filter.timeRange;
        filteredEvents = filteredEvents.filter(e => e.timestamp > cutoff);
      }
    }

    return filteredEvents;
  }

  // Get user behavior summary
  getBehaviorSummary(): UserBehavior & { sessionDuration: number } {
    return {
      ...this.behaviorData,
      timeOnPage: Date.now() - this.startTime,
      sessionDuration: Date.now() - this.startTime
    };
  }

  // Get performance summary
  getPerformanceSummary(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // Export analytics data
  exportData(): {
    events: AnalyticsEvent[];
    behavior: UserBehavior;
    performance: PerformanceMetrics;
    session: { id: string; duration: number; userId?: string };
  } {
    return {
      events: this.events,
      behavior: this.getBehaviorSummary(),
      performance: this.getPerformanceSummary(),
      session: {
        id: this.sessionId,
        duration: Date.now() - this.startTime,
        userId: this.userId
      }
    };
  }

  // Clear analytics data
  clear(): void {
    this.events = [];
    this.batchQueue = [];
    this.behaviorData = {
      clicks: 0,
      scrollDepth: 0,
      timeOnPage: 0,
      interactions: 0,
      bounceRate: 0,
      conversionEvents: 0
    };
  }

  // Cleanup
  destroy(): void {
    this.eventListeners.forEach(removeListener => removeListener());
    this.observers.forEach(observer => observer.disconnect());
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.clear();
  }

  // Private methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadUserData(): void {
    // Load from localStorage or cookies
    this.userId = localStorage.getItem('userId') || undefined;
  }

  private setupEventListeners(): void {
    // Page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.track('visibility', 'engagement', 'page_hidden');
      } else {
        this.track('visibility', 'engagement', 'page_visible');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.eventListeners.push(() => document.removeEventListener('visibilitychange', handleVisibilityChange));

    // Page unload
    const handleUnload = () => {
      this.track('navigation', 'engagement', 'page_unload', undefined, undefined, {
        sessionDuration: Date.now() - this.startTime
      });
      this.sendBatch(true); // Force send
    };
    window.addEventListener('beforeunload', handleUnload);
    this.eventListeners.push(() => window.removeEventListener('beforeunload', handleUnload));
  }

  private setupPerformanceTracking(): void {
    // Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            this.performanceMetrics.cumulativeLayoutShift += (entry as any).value;
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.performanceMetrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.performanceMetrics.domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      
      this.trackPerformance(this.performanceMetrics);
    });
  }

  private setupVisibilityTracking(): void {
    // Track time on page
    setInterval(() => {
      if (!document.hidden) {
        this.behaviorData.timeOnPage = Date.now() - this.startTime;
      }
    }, 5000);
  }

  private setupScrollTracking(): void {
    let maxScrollDepth = 0;
    
    const handleScroll = () => {
      const scrollDepth = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.behaviorData.scrollDepth = Math.round(scrollDepth * 100);
        
        // Track milestone scrolls
        if (scrollDepth > 0.25 && scrollDepth < 0.5 && maxScrollDepth <= 0.25) {
          this.track('engagement', 'scroll', 'quarter_page');
        } else if (scrollDepth > 0.5 && scrollDepth < 0.75 && maxScrollDepth <= 0.5) {
          this.track('engagement', 'scroll', 'half_page');
        } else if (scrollDepth > 0.75 && maxScrollDepth <= 0.75) {
          this.track('engagement', 'scroll', 'three_quarters');
        } else if (scrollDepth > 0.9 && maxScrollDepth <= 0.9) {
          this.track('engagement', 'scroll', 'full_page');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    this.eventListeners.push(() => window.removeEventListener('scroll', handleScroll));
  }

  private setupClickTracking(): void {
    const handleClick = (event: MouseEvent) => {
      this.behaviorData.clicks++;
      
      const target = event.target as HTMLElement;
      const elementInfo = {
        tagName: target.tagName.toLowerCase(),
        id: target.id,
        className: target.className,
        text: target.textContent?.slice(0, 50)
      };
      
      this.track('interaction', 'click', 'element_click', target.id || target.className, undefined, elementInfo);
    };
    
    document.addEventListener('click', handleClick);
    this.eventListeners.push(() => document.removeEventListener('click', handleClick));
  }

  private setupFormTracking(): void {
    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      this.track('interaction', 'form', 'submit', form.id || form.className);
    };
    
    document.addEventListener('submit', handleFormSubmit);
    this.eventListeners.push(() => document.removeEventListener('submit', handleFormSubmit));
  }

  private updateBehaviorData(event: AnalyticsEvent): void {
    if (event.category === 'conversion') {
      this.behaviorData.conversionEvents++;
    }
  }

  private addToBatch(event: AnalyticsEvent): void {
    this.batchQueue.push(event);
    
    if (this.batchQueue.length >= 10) {
      this.sendBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.sendBatch(), 5000);
    }
  }

  private async sendBatch(force: boolean = false): Promise<void> {
    if (this.batchQueue.length === 0 && !force) return;
    
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    try {
      // Send to analytics endpoint
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch })
      });
    } catch (error) {
      console.error('Failed to send analytics batch:', error);
      // Re-queue failed events
      this.batchQueue.unshift(...batch);
    }
  }
}

// Singleton instance
export const analytics = new AdvancedAnalytics();

// React hook for analytics
export const useAnalytics = () => {
  const [summary, setSummary] = useState(analytics.getBehaviorSummary());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(analytics.getBehaviorSummary());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackInteraction: analytics.trackInteraction.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackElementVisibility: analytics.trackElementVisibility.bind(analytics),
    summary,
    exportData: analytics.exportData.bind(analytics)
  };
};

export default AdvancedAnalytics;