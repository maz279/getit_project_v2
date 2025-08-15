/**
 * Performance Monitoring Service
 * Phase 1 Week 7-8: Performance Monitoring Implementation
 * Core Web Vitals and Performance Metrics Collection
 */

// Extend Web API types for better TypeScript support
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
  bundleSize: number;
  memoryUsage: number;
  timestamp: number;
}

interface PerformanceBudget {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  bundleSize: number;
  loadTime: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private budgets: PerformanceBudget;
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled = true;

  private constructor() {
    this.budgets = {
      fcp: 1000, // 1s
      lcp: 2500, // 2.5s
      fid: 100, // 100ms
      cls: 0.1, // 0.1
      bundleSize: 500 * 1024, // 500KB
      loadTime: 2000, // 2s
    };

    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if ('processingStart' in entry) {
            const fidEntry = entry as PerformanceEventTiming;
            this.recordMetric('fid', fidEntry.processingStart - fidEntry.startTime);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);

      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let cls = 0;
        entries.forEach((entry) => {
          if ('hadRecentInput' in entry && 'value' in entry) {
            const layoutShiftEntry = entry as LayoutShift;
            if (!layoutShiftEntry.hadRecentInput) {
              cls += layoutShiftEntry.value;
            }
          }
        });
        this.recordMetric('cls', cls);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);

      // Navigation Observer
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if ('responseStart' in entry && 'requestStart' in entry) {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('ttfb', navEntry.responseStart - navEntry.requestStart);
            this.recordMetric('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
            this.recordMetric('loadComplete', navEntry.loadEventEnd - navEntry.loadEventStart);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navObserver);

      // Paint Observer
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', entry.startTime);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);
    }

    // Monitor bundle size
    this.monitorBundleSize();

    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  private recordMetric(type: keyof PerformanceMetrics, value: number) {
    const currentMetrics = this.getCurrentMetrics();
    if (type !== 'timestamp') {
      (currentMetrics as any)[type] = value;
    }
    currentMetrics.timestamp = Date.now();
    
    // Check performance budgets
    this.checkBudgets(currentMetrics);
  }

  private getCurrentMetrics(): PerformanceMetrics {
    const latest = this.metrics[this.metrics.length - 1];
    if (!latest || Date.now() - latest.timestamp > 5000) {
      const newMetrics: PerformanceMetrics = {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0,
        domContentLoaded: 0,
        loadComplete: 0,
        bundleSize: 0,
        memoryUsage: 0,
        timestamp: Date.now(),
      };
      this.metrics.push(newMetrics);
      return newMetrics;
    }
    return latest;
  }

  private checkBudgets(metrics: PerformanceMetrics) {
    const violations = [];
    
    if (metrics.fcp > this.budgets.fcp) {
      violations.push(`FCP exceeded budget: ${metrics.fcp}ms > ${this.budgets.fcp}ms`);
    }
    
    if (metrics.lcp > this.budgets.lcp) {
      violations.push(`LCP exceeded budget: ${metrics.lcp}ms > ${this.budgets.lcp}ms`);
    }
    
    if (metrics.fid > this.budgets.fid) {
      violations.push(`FID exceeded budget: ${metrics.fid}ms > ${this.budgets.fid}ms`);
    }
    
    if (metrics.cls > this.budgets.cls) {
      violations.push(`CLS exceeded budget: ${metrics.cls} > ${this.budgets.cls}`);
    }
    
    if (metrics.bundleSize > this.budgets.bundleSize) {
      violations.push(`Bundle size exceeded budget: ${metrics.bundleSize}KB > ${this.budgets.bundleSize}KB`);
    }

    if (violations.length > 0) {
      console.warn('Performance Budget Violations:', violations);
      this.reportViolations(violations);
    }
  }

  private monitorBundleSize() {
    if (typeof window === 'undefined') return;

    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let totalSize = 0;
      
      entries.forEach((entry) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          const resourceEntry = entry as PerformanceResourceTiming;
          totalSize += resourceEntry.transferSize || 0;
        }
      });
      
      if (totalSize > 0) {
        this.recordMetric('bundleSize', totalSize);
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', resourceObserver);
  }

  private monitorMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedJSHeapSize = memory.usedJSHeapSize / 1024 / 1024; // MB
        this.recordMetric('memoryUsage', usedJSHeapSize);
      }
    };

    // Update memory usage every 5 seconds
    setInterval(updateMemoryUsage, 5000);
  }

  private reportViolations(violations: string[]) {
    // Report to analytics service
    fetch('/api/analytics/performance-violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        violations,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(console.error);
  }

  // Public API
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  public getBudgets(): PerformanceBudget {
    return { ...this.budgets };
  }

  public setBudgets(budgets: Partial<PerformanceBudget>) {
    this.budgets = { ...this.budgets, ...budgets };
  }

  public measureCustomMetric(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`Custom metric ${name}: ${duration}ms`);
    return duration;
  }

  public markTimestamp(name: string) {
    performance.mark(name);
  }

  public measureBetweenMarks(startMark: string, endMark: string, measureName: string) {
    performance.measure(measureName, startMark, endMark);
    const measure = performance.getEntriesByName(measureName)[0];
    return measure.duration;
  }

  public enable() {
    this.isEnabled = true;
    this.initializeObservers();
  }

  public disable() {
    this.isEnabled = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  public exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  public clearMetrics() {
    this.metrics = [];
  }
}

export default PerformanceMonitor;