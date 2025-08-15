/**
 * Phase 4 Task 4.4: Performance Monitoring Service
 * Amazon.com/Shopee.sg Enterprise-Level Performance Monitoring
 * 
 * Features:
 * - Real-time performance metrics collection
 * - Core Web Vitals monitoring
 * - User interaction tracking
 * - Resource performance analysis
 * - Performance budgets and alerting
 * - Custom performance marks and measures
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context: Record<string, any>;
}

interface WebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  INP: number; // Interaction to Next Paint
}

interface ResourceTiming {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  transferSize: number;
  type: string;
  cached: boolean;
}

interface UserInteraction {
  type: string;
  element: string;
  timestamp: number;
  duration: number;
  path: string;
  userId?: string;
}

interface PerformanceBudget {
  metric: string;
  threshold: number;
  unit: string;
  severity: 'warning' | 'error';
  enabled: boolean;
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetric[] = [];
  private webVitals: Partial<WebVitals> = {};
  private resourceTimings: ResourceTiming[] = [];
  private userInteractions: UserInteraction[] = [];
  private performanceBudgets: PerformanceBudget[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isInitialized = false;

  private constructor() {
    this.initializePerformanceMonitoring();
    this.setupPerformanceBudgets();
    this.startMetricsCollection();
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Web Vitals monitoring
    this.setupWebVitalsMonitoring();
    
    // Resource timing monitoring
    this.setupResourceTimingMonitoring();
    
    // User interaction monitoring
    this.setupUserInteractionMonitoring();
    
    // Navigation timing
    this.setupNavigationTimingMonitoring();
    
    // Long task monitoring
    this.setupLongTaskMonitoring();
    
    this.isInitialized = true;
  }

  /**
   * Setup Web Vitals monitoring
   */
  private setupWebVitalsMonitoring(): void {
    // First Contentful Paint
    this.observePerformanceEntries('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.webVitals.FCP = entry.startTime;
          this.recordMetric('FCP', entry.startTime, 'ms', { type: 'web-vital' });
        }
      });
    });

    // Largest Contentful Paint
    this.observePerformanceEntries('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.webVitals.LCP = lastEntry.startTime;
        this.recordMetric('LCP', lastEntry.startTime, 'ms', { type: 'web-vital' });
      }
    });

    // First Input Delay
    this.observePerformanceEntries('first-input', (entries) => {
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        this.webVitals.FID = fid;
        this.recordMetric('FID', fid, 'ms', { type: 'web-vital' });
      });
    });

    // Cumulative Layout Shift
    this.observePerformanceEntries('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.webVitals.CLS = clsValue;
      this.recordMetric('CLS', clsValue, 'score', { type: 'web-vital' });
    });

    // Time to First Byte
    if (performance.getEntriesByType('navigation').length > 0) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      this.webVitals.TTFB = ttfb;
      this.recordMetric('TTFB', ttfb, 'ms', { type: 'web-vital' });
    }
  }

  /**
   * Setup resource timing monitoring
   */
  private setupResourceTimingMonitoring(): void {
    this.observePerformanceEntries('resource', (entries) => {
      entries.forEach((entry) => {
        const resourceTiming: ResourceTiming = {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
          endTime: entry.startTime + entry.duration,
          transferSize: (entry as any).transferSize || 0,
          type: this.getResourceType(entry.name),
          cached: (entry as any).transferSize === 0
        };
        
        this.resourceTimings.push(resourceTiming);
        this.recordMetric('resource-timing', entry.duration, 'ms', {
          type: 'resource',
          name: entry.name,
          resourceType: resourceTiming.type
        });
      });
    });
  }

  /**
   * Setup user interaction monitoring
   */
  private setupUserInteractionMonitoring(): void {
    const trackInteraction = (type: string, event: Event) => {
      const startTime = performance.now();
      const element = event.target as HTMLElement;
      
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const interaction: UserInteraction = {
          type,
          element: element.tagName.toLowerCase() + (element.id ? `#${element.id}` : ''),
          timestamp: startTime,
          duration: endTime - startTime,
          path: window.location.pathname,
          userId: this.getUserId()
        };
        
        this.userInteractions.push(interaction);
        this.recordMetric('user-interaction', interaction.duration, 'ms', {
          type: 'interaction',
          interactionType: type,
          element: interaction.element
        });
      });
    };

    // Track clicks
    document.addEventListener('click', (event) => trackInteraction('click', event));
    
    // Track key presses
    document.addEventListener('keydown', (event) => trackInteraction('keydown', event));
    
    // Track form submissions
    document.addEventListener('submit', (event) => trackInteraction('submit', event));
  }

  /**
   * Setup navigation timing monitoring
   */
  private setupNavigationTimingMonitoring(): void {
    window.addEventListener('load', () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart, 'ms', { type: 'navigation' });
        this.recordMetric('page-load', navEntry.loadEventEnd - navEntry.loadEventStart, 'ms', { type: 'navigation' });
        this.recordMetric('dns-lookup', navEntry.domainLookupEnd - navEntry.domainLookupStart, 'ms', { type: 'navigation' });
        this.recordMetric('tcp-connect', navEntry.connectEnd - navEntry.connectStart, 'ms', { type: 'navigation' });
        this.recordMetric('request-response', navEntry.responseEnd - navEntry.requestStart, 'ms', { type: 'navigation' });
      }
    });
  }

  /**
   * Setup long task monitoring
   */
  private setupLongTaskMonitoring(): void {
    this.observePerformanceEntries('longtask', (entries) => {
      entries.forEach((entry) => {
        this.recordMetric('long-task', entry.duration, 'ms', {
          type: 'long-task',
          startTime: entry.startTime
        });
      });
    });
  }

  /**
   * Observe performance entries
   */
  private observePerformanceEntries(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to observe ${type} performance entries:`, error);
    }
  }

  /**
   * Setup performance budgets
   */
  private setupPerformanceBudgets(): void {
    this.performanceBudgets = [
      { metric: 'FCP', threshold: 1800, unit: 'ms', severity: 'warning', enabled: true },
      { metric: 'LCP', threshold: 2500, unit: 'ms', severity: 'error', enabled: true },
      { metric: 'FID', threshold: 100, unit: 'ms', severity: 'warning', enabled: true },
      { metric: 'CLS', threshold: 0.1, unit: 'score', severity: 'error', enabled: true },
      { metric: 'TTFB', threshold: 800, unit: 'ms', severity: 'warning', enabled: true },
      { metric: 'page-load', threshold: 3000, unit: 'ms', severity: 'warning', enabled: true },
      { metric: 'resource-timing', threshold: 1000, unit: 'ms', severity: 'warning', enabled: true }
    ];
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectRuntimeMetrics();
      this.checkPerformanceBudgets();
      this.cleanupOldMetrics();
    }, 10000); // Every 10 seconds
  }

  /**
   * Collect runtime metrics
   */
  private collectRuntimeMetrics(): void {
    // Memory usage
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.recordMetric('memory-used', memory.usedJSHeapSize, 'bytes', { type: 'runtime' });
      this.recordMetric('memory-total', memory.totalJSHeapSize, 'bytes', { type: 'runtime' });
      this.recordMetric('memory-limit', memory.jsHeapSizeLimit, 'bytes', { type: 'runtime' });
    }

    // Connection info
    if ((navigator as any).connection) {
      const connection = (navigator as any).connection;
      this.recordMetric('connection-rtt', connection.rtt, 'ms', { type: 'connection' });
      this.recordMetric('connection-downlink', connection.downlink, 'mbps', { type: 'connection' });
    }

    // Frame rate
    this.measureFrameRate();
  }

  /**
   * Measure frame rate
   */
  private measureFrameRate(): void {
    let frameCount = 0;
    const startTime = performance.now();
    
    const countFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - startTime >= 1000) {
        this.recordMetric('fps', frameCount, 'fps', { type: 'runtime' });
        return;
      }
      
      requestAnimationFrame(countFrame);
    };
    
    requestAnimationFrame(countFrame);
  }

  /**
   * Check performance budgets
   */
  private checkPerformanceBudgets(): void {
    this.performanceBudgets.forEach(budget => {
      if (!budget.enabled) return;
      
      const recentMetrics = this.metrics.filter(m => 
        m.name === budget.metric && 
        Date.now() - m.timestamp < 60000 // Last minute
      );
      
      if (recentMetrics.length === 0) return;
      
      const averageValue = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
      
      if (averageValue > budget.threshold) {
        this.handleBudgetViolation(budget, averageValue);
      }
    });
  }

  /**
   * Handle budget violation
   */
  private handleBudgetViolation(budget: PerformanceBudget, actualValue: number): void {
    const violation = {
      metric: budget.metric,
      threshold: budget.threshold,
      actual: actualValue,
      severity: budget.severity,
      timestamp: Date.now()
    };
    
    console.warn(`Performance budget violation: ${budget.metric} exceeded threshold`, violation);
    
    // Send to analytics
    this.recordMetric('budget-violation', actualValue, budget.unit, {
      type: 'budget-violation',
      metric: budget.metric,
      threshold: budget.threshold,
      severity: budget.severity
    });
  }

  /**
   * Record metric
   */
  private recordMetric(name: string, value: number, unit: string, context: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      context
    };
    
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  /**
   * Track page load
   */
  trackPageLoad(pageName: string): void {
    const loadTime = performance.now();
    this.recordMetric('page-load-time', loadTime, 'ms', {
      type: 'page-load',
      page: pageName,
      url: window.location.href
    });
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(action: string, element?: string): void {
    this.recordMetric('user-action', performance.now(), 'ms', {
      type: 'user-interaction',
      action,
      element: element || 'unknown',
      timestamp: Date.now()
    });
  }

  /**
   * Create performance mark
   */
  createMark(name: string): void {
    if (performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Create performance measure
   */
  createMeasure(name: string, startMark: string, endMark?: string): void {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        this.recordMetric(name, measure.duration, 'ms', { type: 'measure' });
      }
    }
  }

  /**
   * Get resource type
   */
  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (!extension) return 'other';
    
    if (['js', 'mjs'].includes(extension)) return 'script';
    if (['css'].includes(extension)) return 'stylesheet';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) return 'font';
    if (['json', 'xml'].includes(extension)) return 'xhr';
    
    return 'other';
  }

  /**
   * Get user ID
   */
  private getUserId(): string | undefined {
    // Implementation depends on your auth system
    return localStorage.getItem('userId') || undefined;
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    this.userInteractions = this.userInteractions.filter(i => i.timestamp > oneHourAgo);
    this.resourceTimings = this.resourceTimings.filter(r => r.startTime > oneHourAgo);
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): any {
    const now = Date.now();
    const lastHour = now - 3600000;
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour);
    const recentInteractions = this.userInteractions.filter(i => i.timestamp > lastHour);
    const recentResources = this.resourceTimings.filter(r => r.startTime > lastHour);
    
    return {
      webVitals: this.webVitals,
      summary: {
        totalMetrics: recentMetrics.length,
        totalInteractions: recentInteractions.length,
        totalResources: recentResources.length,
        averageLoadTime: this.calculateAverageLoadTime(recentMetrics),
        averageInteractionTime: this.calculateAverageInteractionTime(recentInteractions),
        resourceBreakdown: this.getResourceBreakdown(recentResources)
      },
      budgetViolations: this.getBudgetViolations(recentMetrics),
      topSlowResources: this.getTopSlowResources(recentResources),
      performanceScore: this.calculatePerformanceScore(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Calculate average load time
   */
  private calculateAverageLoadTime(metrics: PerformanceMetric[]): number {
    const loadTimeMetrics = metrics.filter(m => m.name === 'page-load-time');
    if (loadTimeMetrics.length === 0) return 0;
    
    return loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length;
  }

  /**
   * Calculate average interaction time
   */
  private calculateAverageInteractionTime(interactions: UserInteraction[]): number {
    if (interactions.length === 0) return 0;
    
    return interactions.reduce((sum, i) => sum + i.duration, 0) / interactions.length;
  }

  /**
   * Get resource breakdown
   */
  private getResourceBreakdown(resources: ResourceTiming[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    resources.forEach(resource => {
      breakdown[resource.type] = (breakdown[resource.type] || 0) + 1;
    });
    
    return breakdown;
  }

  /**
   * Get budget violations
   */
  private getBudgetViolations(metrics: PerformanceMetric[]): any[] {
    return metrics.filter(m => m.context.type === 'budget-violation');
  }

  /**
   * Get top slow resources
   */
  private getTopSlowResources(resources: ResourceTiming[]): ResourceTiming[] {
    return resources
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    const { FCP, LCP, FID, CLS, TTFB } = this.webVitals;
    
    if (!FCP || !LCP || !FID || !CLS || !TTFB) return 0;
    
    const fcpScore = FCP <= 1800 ? 100 : Math.max(0, 100 - (FCP - 1800) / 20);
    const lcpScore = LCP <= 2500 ? 100 : Math.max(0, 100 - (LCP - 2500) / 25);
    const fidScore = FID <= 100 ? 100 : Math.max(0, 100 - (FID - 100) / 3);
    const clsScore = CLS <= 0.1 ? 100 : Math.max(0, 100 - (CLS - 0.1) * 1000);
    const ttfbScore = TTFB <= 800 ? 100 : Math.max(0, 100 - (TTFB - 800) / 10);
    
    return (fcpScore + lcpScore + fidScore + clsScore + ttfbScore) / 5;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const { FCP, LCP, FID, CLS, TTFB } = this.webVitals;
    
    if (FCP && FCP > 1800) {
      recommendations.push('Optimize First Contentful Paint by reducing render-blocking resources');
    }
    
    if (LCP && LCP > 2500) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and server response time');
    }
    
    if (FID && FID > 100) {
      recommendations.push('Reduce First Input Delay by optimizing JavaScript execution');
    }
    
    if (CLS && CLS > 0.1) {
      recommendations.push('Minimize Cumulative Layout Shift by setting image dimensions and avoiding dynamic content');
    }
    
    if (TTFB && TTFB > 800) {
      recommendations.push('Improve Time to First Byte by optimizing server response time');
    }
    
    return recommendations;
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics(): any {
    return {
      webVitals: this.webVitals,
      recentMetrics: this.metrics.slice(-10),
      activeConnections: (navigator as any).connection ? {
        type: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null,
      memoryUsage: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    };
  }

  /**
   * Destroy performance monitoring
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics = [];
    this.userInteractions = [];
    this.resourceTimings = [];
    this.isInitialized = false;
  }
}

export default PerformanceMonitoringService;