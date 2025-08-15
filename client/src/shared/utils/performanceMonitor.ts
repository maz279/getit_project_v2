/**
 * Advanced Performance Monitoring System for GetIt Platform
 * Implements Core Web Vitals tracking and real-time performance analytics
 * 
 * @fileoverview Real-time performance monitoring with Bangladesh network optimization
 * @version 2.0.0
 * @author GetIt Platform Team
 */

export interface CoreWebVitals {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  tti: number; // Time to Interactive
}

export interface PerformanceMetrics {
  timestamp: number;
  coreWebVitals: CoreWebVitals;
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
  };
  network: {
    type: string;
    downlink: number;
    rtt: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  assets: {
    totalSize: number;
    loadTime: number;
    cacheHitRate: number;
  };
}

export interface AssetLoadMetrics {
  path: string;
  loadTime: number;
  fileSize: number;
  region: string;
  options: any;
  timestamp: number;
}

export interface PerformanceThresholds {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  tti: number;
}

/**
 * Advanced Performance Monitor with real-time tracking and optimization
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private assetMetrics: AssetLoadMetrics[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private cacheStats = { hits: 0, misses: 0, totalRequests: 0 };
  
  // Performance thresholds based on Amazon.com/Shopee.sg standards
  private readonly thresholds: PerformanceThresholds = {
    fcp: 1500, // 1.5s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    ttfb: 600, // 600ms
    tti: 3000  // 3s
  };

  private currentWebVitals: Partial<CoreWebVitals> = {};
  private alertCallbacks: Array<(metric: string, value: number, threshold: number) => void> = [];

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize comprehensive performance monitoring
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.setupCoreWebVitalsTracking();
    this.setupNavigationTimingTracking();
    this.setupResourceTimingTracking();
    this.setupMemoryTracking();
    this.setupNetworkTracking();
    
    // Start real-time monitoring loop
    this.startMonitoringLoop();
    
    console.log('✅ Performance monitoring initialized');
  }

  /**
   * Setup Core Web Vitals tracking
   */
  private setupCoreWebVitalsTracking(): void {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      this.currentWebVitals.lcp = lastEntry.startTime;
      this.checkThreshold('lcp', lastEntry.startTime);
    });
    
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('lcp', lcpObserver);
    } catch (e) {
      console.warn('LCP observation not supported');
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        this.currentWebVitals.fid = fid;
        this.checkThreshold('fid', fid);
      });
    });
    
    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.set('fid', fidObserver);
    } catch (e) {
      console.warn('FID observation not supported');
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.currentWebVitals.cls = clsValue;
          this.checkThreshold('cls', clsValue);
        }
      });
    });
    
    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('cls', clsObserver);
    } catch (e) {
      console.warn('CLS observation not supported');
    }

    // First Contentful Paint (FCP)
    this.observePaintTiming();
  }

  /**
   * Observe paint timing events
   */
  private observePaintTiming(): void {
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.currentWebVitals.fcp = entry.startTime;
          this.checkThreshold('fcp', entry.startTime);
        }
      });
    });
    
    try {
      paintObserver.observe({ type: 'paint', buffered: true });
      this.observers.set('paint', paintObserver);
    } catch (e) {
      console.warn('Paint timing observation not supported');
    }
  }

  /**
   * Setup navigation timing tracking
   */
  private setupNavigationTimingTracking(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (timing) {
        this.currentWebVitals.ttfb = timing.responseStart - timing.requestStart;
        this.currentWebVitals.tti = timing.domInteractive - timing.navigationStart;
        
        this.checkThreshold('ttfb', this.currentWebVitals.ttfb);
        this.checkThreshold('tti', this.currentWebVitals.tti);
      }
    });
  }

  /**
   * Setup resource timing tracking
   */
  private setupResourceTimingTracking(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceResourceTiming) => {
        this.trackResourceLoad(entry);
      });
    });
    
    try {
      resourceObserver.observe({ type: 'resource', buffered: true });
      this.observers.set('resource', resourceObserver);
    } catch (e) {
      console.warn('Resource timing observation not supported');
    }
  }

  /**
   * Setup memory tracking
   */
  private setupMemoryTracking(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        };

        // Alert on high memory usage
        if (memoryUsage.percentage > 90) {
          this.triggerAlert('memory', memoryUsage.percentage, 90);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Setup network tracking
   */
  private setupNetworkTracking(): void {
    if (typeof window === 'undefined') return;

    const connection = (navigator as any).connection;
    if (connection) {
      // Monitor network changes
      connection.addEventListener('change', () => {
        this.recordNetworkChange(connection);
      });
    }
  }

  /**
   * Track resource loading performance
   */
  private trackResourceLoad(entry: PerformanceResourceTiming): void {
    const loadTime = entry.responseEnd - entry.startTime;
    const transferSize = entry.transferSize || 0;
    
    // Track slow resources
    if (loadTime > 1000) { // > 1 second
      console.warn(`Slow resource: ${entry.name} took ${loadTime.toFixed(2)}ms`);
    }

    // Update cache statistics
    if (transferSize === 0) {
      this.cacheStats.hits++;
    } else {
      this.cacheStats.misses++;
    }
    this.cacheStats.totalRequests++;
  }

  /**
   * Record asset load metrics
   */
  public recordAssetLoad(metrics: Omit<AssetLoadMetrics, 'timestamp'>): void {
    this.assetMetrics.push({
      ...metrics,
      timestamp: Date.now()
    });

    // Keep only last 1000 entries
    if (this.assetMetrics.length > 1000) {
      this.assetMetrics = this.assetMetrics.slice(-1000);
    }
  }

  /**
   * Record CDN selection
   */
  public recordCDNSelection(region: string): void {
    console.log(`📍 CDN region selected: ${region}`);
  }

  /**
   * Record network change
   */
  private recordNetworkChange(connection: any): void {
    console.log(`🌐 Network changed: ${connection.effectiveType}, downlink: ${connection.downlink}Mbps`);
  }

  /**
   * Check performance threshold
   */
  private checkThreshold(metric: keyof PerformanceThresholds, value: number): void {
    const threshold = this.thresholds[metric];
    
    if (value > threshold) {
      this.triggerAlert(metric, value, threshold);
    }
  }

  /**
   * Trigger performance alert
   */
  private triggerAlert(metric: string, value: number, threshold: number): void {
    console.warn(`⚠️ Performance threshold exceeded: ${metric} = ${value.toFixed(2)} (threshold: ${threshold})`);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(metric, value, threshold);
      } catch (error) {
        console.error('Performance alert callback failed:', error);
      }
    });
  }

  /**
   * Start real-time monitoring loop
   */
  private startMonitoringLoop(): void {
    setInterval(() => {
      this.collectCurrentMetrics();
    }, 10000); // Collect metrics every 10 seconds
  }

  /**
   * Collect current performance metrics
   */
  private collectCurrentMetrics(): void {
    const timestamp = Date.now();
    const memory = (performance as any).memory;
    const connection = (navigator as any).connection;

    const metrics: PerformanceMetrics = {
      timestamp,
      coreWebVitals: this.currentWebVitals as CoreWebVitals,
      pageLoad: this.getPageLoadMetrics(),
      network: {
        type: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0
      },
      memory: {
        used: memory?.usedJSHeapSize || 0,
        total: memory?.totalJSHeapSize || 0,
        percentage: memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0
      },
      assets: {
        totalSize: this.getTotalAssetSize(),
        loadTime: this.getAverageAssetLoadTime(),
        cacheHitRate: this.getCacheHitRate()
      }
    };

    this.metrics.push(metrics);

    // Keep only last 100 metric entries
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Get page load metrics
   */
  private getPageLoadMetrics(): PerformanceMetrics['pageLoad'] {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!timing) {
      return {
        domContentLoaded: 0,
        loadComplete: 0,
        firstPaint: 0
      };
    }

    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      firstPaint: this.currentWebVitals.fcp || 0
    };
  }

  /**
   * Get total asset size
   */
  private getTotalAssetSize(): number {
    return this.assetMetrics.reduce((total, asset) => total + asset.fileSize, 0);
  }

  /**
   * Get average asset load time
   */
  private getAverageAssetLoadTime(): number {
    if (this.assetMetrics.length === 0) return 0;
    
    const totalTime = this.assetMetrics.reduce((total, asset) => total + asset.loadTime, 0);
    return totalTime / this.assetMetrics.length;
  }

  /**
   * Get cache hit rate
   */
  private getCacheHitRate(): number {
    if (this.cacheStats.totalRequests === 0) return 0;
    return (this.cacheStats.hits / this.cacheStats.totalRequests) * 100;
  }

  /**
   * Get current Core Web Vitals
   */
  public getCurrentWebVitals(): CoreWebVitals {
    return this.currentWebVitals as CoreWebVitals;
  }

  /**
   * Get performance score (0-100)
   */
  public getPerformanceScore(): number {
    const vitals = this.getCurrentWebVitals();
    let score = 100;

    // Deduct points for threshold violations
    Object.entries(this.thresholds).forEach(([metric, threshold]) => {
      const value = vitals[metric as keyof CoreWebVitals];
      if (value && value > threshold) {
        const penalty = Math.min(20, (value - threshold) / threshold * 20);
        score -= penalty;
      }
    });

    return Math.max(0, Math.round(score));
  }

  /**
   * Get asset metrics
   */
  public getAssetMetrics(): AssetLoadMetrics[] {
    return [...this.assetMetrics];
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    size: number;
    hitRate: number;
    totalRequests: number;
  } {
    return {
      size: this.assetMetrics.length,
      hitRate: this.getCacheHitRate(),
      totalRequests: this.cacheStats.totalRequests
    };
  }

  /**
   * Add performance alert callback
   */
  public onPerformanceAlert(callback: (metric: string, value: number, threshold: number) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): {
    score: number;
    webVitals: CoreWebVitals;
    recommendations: string[];
    cacheStats: ReturnType<typeof this.getCacheStats>;
  } {
    const vitals = this.getCurrentWebVitals();
    const score = this.getPerformanceScore();
    const recommendations: string[] = [];

    // Generate recommendations based on thresholds
    if (vitals.fcp > this.thresholds.fcp) {
      recommendations.push('Optimize First Contentful Paint by reducing server response time');
    }
    if (vitals.lcp > this.thresholds.lcp) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and critical resources');
    }
    if (vitals.fid > this.thresholds.fid) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time');
    }
    if (vitals.cls > this.thresholds.cls) {
      recommendations.push('Minimize Cumulative Layout Shift by setting image dimensions and avoiding dynamic content');
    }

    return {
      score,
      webVitals: vitals,
      recommendations,
      cacheStats: this.getCacheStats()
    };
  }

  /**
   * Cleanup observers
   */
  public cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

export default new PerformanceMonitor();