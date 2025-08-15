/**
 * Performance Monitor Service
 * Amazon.com/Shopee.sg-Level Performance Monitoring
 * Implements Core Web Vitals monitoring with real-time tracking
 */

interface PerformanceMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  TTI: number; // Time to Interactive
  CLS: number; // Cumulative Layout Shift
  FID: number; // First Input Delay
  TTFB: number; // Time to First Byte
}

interface PerformanceThresholds {
  FCP: { good: number; poor: number };
  LCP: { good: number; poor: number };
  TTI: { good: number; poor: number };
  CLS: { good: number; poor: number };
  FID: { good: number; poor: number };
  TTFB: { good: number; poor: number };
}

interface PerformanceViolation {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'error';
  timestamp: number;
  url: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private violations: PerformanceViolation[];
  private observer: PerformanceObserver | null = null;
  private monitoring: boolean = false;

  private constructor() {
    this.metrics = {
      FCP: 0,
      LCP: 0,
      TTI: 0,
      CLS: 0,
      FID: 0,
      TTFB: 0
    };

    // Amazon.com/Shopee.sg performance thresholds
    this.thresholds = {
      FCP: { good: 1000, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTI: { good: 3000, poor: 5000 },
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      TTFB: { good: 200, poor: 500 }
    };

    this.violations = [];
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start Core Web Vitals monitoring
   */
  public startMonitoring(): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.setupPerformanceObserver();
    this.measureCoreWebVitals();
    this.setupNavigationTiming();
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.monitoring) return;
    
    this.monitoring = false;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Setup Performance Observer for Core Web Vitals
   */
  private setupPerformanceObserver(): void {
    if (!window.PerformanceObserver) return;

    this.observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            this.handlePaintMetrics(entry as PerformancePaintTiming);
            break;
          case 'largest-contentful-paint':
            this.handleLCPMetrics(entry as any);
            break;
          case 'layout-shift':
            this.handleCLSMetrics(entry as any);
            break;
          case 'first-input':
            this.handleFIDMetrics(entry as any);
            break;
          case 'navigation':
            this.handleNavigationMetrics(entry as PerformanceNavigationTiming);
            break;
        }
      });
    });

    try {
      this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input', 'navigation'] });
    } catch (error) {
      console.warn('Performance Observer setup failed:', error);
    }
  }

  /**
   * Handle Paint Metrics (FCP)
   */
  private handlePaintMetrics(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-contentful-paint') {
      this.metrics.FCP = entry.startTime;
      this.checkThreshold('FCP', entry.startTime);
    }
  }

  /**
   * Handle Largest Contentful Paint (LCP)
   */
  private handleLCPMetrics(entry: any): void {
    this.metrics.LCP = entry.startTime;
    this.checkThreshold('LCP', entry.startTime);
  }

  /**
   * Handle Cumulative Layout Shift (CLS)
   */
  private handleCLSMetrics(entry: any): void {
    if (!entry.hadRecentInput) {
      this.metrics.CLS += entry.value;
      this.checkThreshold('CLS', this.metrics.CLS);
    }
  }

  /**
   * Handle First Input Delay (FID)
   */
  private handleFIDMetrics(entry: any): void {
    this.metrics.FID = entry.processingStart - entry.startTime;
    this.checkThreshold('FID', this.metrics.FID);
  }

  /**
   * Handle Navigation Metrics (TTFB)
   */
  private handleNavigationMetrics(entry: PerformanceNavigationTiming): void {
    this.metrics.TTFB = entry.responseStart - entry.fetchStart;
    this.checkThreshold('TTFB', this.metrics.TTFB);
  }

  /**
   * Measure Core Web Vitals using Performance API
   */
  private measureCoreWebVitals(): void {
    // Time to Interactive (TTI) estimation
    setTimeout(() => {
      this.estimateTTI();
    }, 1000);
  }

  /**
   * Estimate Time to Interactive (TTI)
   */
  private estimateTTI(): void {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      // Simple TTI estimation based on DOM completion and load events
      this.metrics.TTI = navigationEntry.domComplete - navigationEntry.fetchStart;
      this.checkThreshold('TTI', this.metrics.TTI);
    }
  }

  /**
   * Setup Navigation Timing monitoring
   */
  private setupNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectNavigationTiming();
      }, 100);
    });
  }

  /**
   * Collect Navigation Timing metrics
   */
  private collectNavigationTiming(): void {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationEntry) {
      // Update TTFB if not already set
      if (this.metrics.TTFB === 0) {
        this.metrics.TTFB = navigationEntry.responseStart - navigationEntry.fetchStart;
        this.checkThreshold('TTFB', this.metrics.TTFB);
      }
    }
  }

  /**
   * Check performance thresholds and log violations
   */
  private checkThreshold(metric: keyof PerformanceMetrics, value: number): void {
    const threshold = this.thresholds[metric];
    
    if (value > threshold.poor) {
      this.logViolation(metric, value, threshold.poor, 'error');
    } else if (value > threshold.good) {
      this.logViolation(metric, value, threshold.good, 'warning');
    }
  }

  /**
   * Log performance violation
   */
  private logViolation(metric: string, value: number, threshold: number, severity: 'warning' | 'error'): void {
    const violation: PerformanceViolation = {
      metric,
      value,
      threshold,
      severity,
      timestamp: Date.now(),
      url: window.location.href
    };

    this.violations.push(violation);
    
    // Limit violations array size
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-50);
    }

    // Log to console
    const message = `Performance ${severity}: ${metric} = ${value.toFixed(2)}ms (threshold: ${threshold}ms)`;
    if (severity === 'error') {
      console.error(message);
    } else {
      console.warn(message);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance violations
   */
  public getViolations(): PerformanceViolation[] {
    return [...this.violations];
  }

  /**
   * Get performance score (0-100)
   */
  public getPerformanceScore(): number {
    const scores = {
      FCP: this.getMetricScore('FCP', this.metrics.FCP),
      LCP: this.getMetricScore('LCP', this.metrics.LCP),
      TTI: this.getMetricScore('TTI', this.metrics.TTI),
      CLS: this.getMetricScore('CLS', this.metrics.CLS),
      FID: this.getMetricScore('FID', this.metrics.FID),
      TTFB: this.getMetricScore('TTFB', this.metrics.TTFB)
    };

    const validScores = Object.values(scores).filter(score => score > 0);
    return validScores.length > 0 ? validScores.reduce((a, b) => a + b) / validScores.length : 0;
  }

  /**
   * Get score for individual metric
   */
  private getMetricScore(metric: keyof PerformanceMetrics, value: number): number {
    if (value === 0) return 0;
    
    const threshold = this.thresholds[metric];
    
    if (value <= threshold.good) {
      return 100;
    } else if (value <= threshold.poor) {
      return 75 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 25;
    } else {
      return Math.max(0, 50 - ((value - threshold.poor) / threshold.poor) * 50);
    }
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): any {
    return {
      metrics: this.getMetrics(),
      score: this.getPerformanceScore(),
      violations: this.getViolations(),
      thresholds: this.thresholds,
      timestamp: Date.now(),
      url: window.location.href
    };
  }

  /**
   * Clear performance data
   */
  public clearData(): void {
    this.metrics = {
      FCP: 0,
      LCP: 0,
      TTI: 0,
      CLS: 0,
      FID: 0,
      TTFB: 0
    };
    this.violations = [];
  }
}

export default PerformanceMonitor;