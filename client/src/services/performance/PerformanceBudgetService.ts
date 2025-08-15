/**
 * Performance Budget Service
 * Phase 2 Week 5-6: Performance Optimization
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

interface PerformanceBudget {
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  tti: number; // Time to Interactive (ms)
  cls: number; // Cumulative Layout Shift
  bundleSize: number; // Bundle size (KB)
  requests: number; // Number of requests
}

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  tti: number;
  cls: number;
  bundleSize: number;
  requests: number;
  timestamp: number;
}

interface BudgetViolation {
  metric: string;
  actual: number;
  budget: number;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

class PerformanceBudgetService {
  private static instance: PerformanceBudgetService;
  private budget: PerformanceBudget;
  private metrics: PerformanceMetrics[] = [];
  private violations: BudgetViolation[] = [];

  private constructor() {
    // Amazon.com/Shopee.sg Performance Standards
    this.budget = {
      fcp: 1000, // 1s
      lcp: 2500, // 2.5s
      tti: 3000, // 3s
      cls: 0.1,  // 0.1
      bundleSize: 500, // 500KB
      requests: 50 // 50 requests
    };

    this.initializePerformanceObserver();
  }

  static getInstance(): PerformanceBudgetService {
    if (!PerformanceBudgetService.instance) {
      PerformanceBudgetService.instance = new PerformanceBudgetService();
    }
    return PerformanceBudgetService.instance;
  }

  private initializePerformanceObserver(): void {
    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      // FCP Observer
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('fcp', entry.startTime);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.updateMetric('lcp', entry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        this.updateMetric('cls', cls);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private updateMetric(metric: string, value: number): void {
    const currentMetrics = this.getCurrentMetrics();
    currentMetrics[metric as keyof PerformanceMetrics] = value;
    
    this.metrics.push({
      ...currentMetrics,
      timestamp: Date.now()
    });

    // Check for budget violations
    this.checkBudgetViolations(currentMetrics);
  }

  private getCurrentMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        fcp: 0,
        lcp: 0,
        tti: 0,
        cls: 0,
        bundleSize: 0,
        requests: 0,
        timestamp: Date.now()
      };
    }
    return { ...this.metrics[this.metrics.length - 1] };
  }

  private checkBudgetViolations(metrics: PerformanceMetrics): void {
    const violations: BudgetViolation[] = [];

    // Check FCP
    if (metrics.fcp > this.budget.fcp) {
      violations.push({
        metric: 'FCP',
        actual: metrics.fcp,
        budget: this.budget.fcp,
        severity: metrics.fcp > this.budget.fcp * 1.5 ? 'high' : 'medium',
        suggestion: 'Optimize critical rendering path and reduce initial payload'
      });
    }

    // Check LCP
    if (metrics.lcp > this.budget.lcp) {
      violations.push({
        metric: 'LCP',
        actual: metrics.lcp,
        budget: this.budget.lcp,
        severity: metrics.lcp > this.budget.lcp * 1.5 ? 'high' : 'medium',
        suggestion: 'Optimize largest content elements and preload critical resources'
      });
    }

    // Check TTI
    if (metrics.tti > this.budget.tti) {
      violations.push({
        metric: 'TTI',
        actual: metrics.tti,
        budget: this.budget.tti,
        severity: metrics.tti > this.budget.tti * 1.5 ? 'high' : 'medium',
        suggestion: 'Reduce JavaScript execution time and optimize long tasks'
      });
    }

    // Check CLS
    if (metrics.cls > this.budget.cls) {
      violations.push({
        metric: 'CLS',
        actual: metrics.cls,
        budget: this.budget.cls,
        severity: metrics.cls > this.budget.cls * 2 ? 'high' : 'medium',
        suggestion: 'Add size attributes to images and avoid inserting content above existing content'
      });
    }

    this.violations = violations;
  }

  public measureBundleSize(): Promise<number> {
    return new Promise((resolve) => {
      if ('navigator' in window && 'storage' in navigator) {
        // Estimate bundle size from resource timing
        const resources = performance.getEntriesByType('resource');
        const bundleSize = resources
          .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
          .reduce((total, resource) => total + ((resource as any).transferSize || 0), 0) / 1024;
        
        this.updateMetric('bundleSize', bundleSize);
        resolve(bundleSize);
      } else {
        resolve(0);
      }
    });
  }

  public measureTTI(): Promise<number> {
    return new Promise((resolve) => {
      // Simplified TTI measurement
      const startTime = performance.now();
      
      // Wait for main thread to be idle
      setTimeout(() => {
        const tti = performance.now() - startTime;
        this.updateMetric('tti', tti);
        resolve(tti);
      }, 0);
    });
  }

  public getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getViolations(): BudgetViolation[] {
    return [...this.violations];
  }

  public getComplianceScore(): number {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return 0;

    let score = 0;
    const totalMetrics = 6;

    // Score each metric
    if (currentMetrics.fcp <= this.budget.fcp) score++;
    if (currentMetrics.lcp <= this.budget.lcp) score++;
    if (currentMetrics.tti <= this.budget.tti) score++;
    if (currentMetrics.cls <= this.budget.cls) score++;
    if (currentMetrics.bundleSize <= this.budget.bundleSize) score++;
    if (currentMetrics.requests <= this.budget.requests) score++;

    return (score / totalMetrics) * 100;
  }

  public generatePerformanceReport(): {
    budget: PerformanceBudget;
    metrics: PerformanceMetrics;
    violations: BudgetViolation[];
    complianceScore: number;
    recommendations: string[];
  } {
    const recommendations = [
      'Implement code splitting for large bundles',
      'Optimize images using WebP format',
      'Enable compression (gzip/brotli)',
      'Use service workers for caching',
      'Implement resource hints (preload, prefetch)',
      'Minimize JavaScript execution time'
    ];

    return {
      budget: this.getBudget(),
      metrics: this.getCurrentMetrics(),
      violations: this.getViolations(),
      complianceScore: this.getComplianceScore(),
      recommendations
    };
  }
}

export default PerformanceBudgetService;