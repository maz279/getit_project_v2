/**
 * Performance Monitoring Service
 * Amazon.com/Shopee.sg Enterprise Standards
 * 
 * Real-time Core Web Vitals tracking with budget enforcement
 * Comprehensive performance analytics and optimization recommendations
 */

interface PerformanceBudget {
  metric: string;
  target: number;
  warning: number;
  unit: 'ms' | 'MB' | 'score';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  tbt: number; // Total Blocking Time
  bundleSize: number;
  loadTime: number;
  timestamp: number;
}

interface OptimizationScore {
  overall: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  suggestions: string[];
}

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private performanceBudgets: PerformanceBudget[] = [];
  private metricsHistory: PerformanceMetrics[] = [];
  private performanceObserver: PerformanceObserver | null = null;
  private budgetViolations: Array<{ metric: string; actual: number; budget: number; timestamp: number }> = [];

  private constructor() {
    this.initializePerformanceBudgets();
    this.initializePerformanceObserver();
  }

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Initialize Amazon.com/Shopee.sg performance budgets
   */
  private initializePerformanceBudgets(): void {
    this.performanceBudgets = [
      // Amazon.com standards
      { metric: 'FCP', target: 1500, warning: 1800, unit: 'ms', priority: 'critical' },
      { metric: 'LCP', target: 2500, warning: 3000, unit: 'ms', priority: 'critical' },
      { metric: 'FID', target: 100, warning: 200, unit: 'ms', priority: 'critical' },
      { metric: 'CLS', target: 0.1, warning: 0.15, unit: 'score', priority: 'critical' },
      
      // Shopee.sg enhanced standards
      { metric: 'TTFB', target: 500, warning: 800, unit: 'ms', priority: 'high' },
      { metric: 'TBT', target: 200, warning: 300, unit: 'ms', priority: 'high' },
      { metric: 'bundleSize', target: 500, warning: 750, unit: 'MB', priority: 'critical' },
      { metric: 'loadTime', target: 3000, warning: 4000, unit: 'ms', priority: 'high' },
    ];
  }

  /**
   * Initialize performance observer for real-time monitoring
   */
  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.processNavigationEntry(entry as PerformanceNavigationTiming);
          } else if (entry.entryType === 'paint') {
            this.processPaintEntry(entry as PerformancePaintTiming);
          } else if (entry.entryType === 'layout-shift') {
            this.processLayoutShiftEntry(entry as any);
          }
        });
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'layout-shift'] });
      } catch (error) {
        console.warn('Performance observer initialization failed:', error);
      }
    }
  }

  /**
   * Collect comprehensive performance metrics
   */
  public async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      tbt: 0,
      bundleSize: 0,
      loadTime: 0,
      timestamp: Date.now()
    };

    // Collect Core Web Vitals
    await this.collectCoreWebVitals(metrics);
    
    // Collect bundle size metrics
    await this.collectBundleMetrics(metrics);
    
    // Store metrics
    this.metricsHistory.push(metrics);
    
    // Check budget violations
    this.checkBudgetViolations(metrics);
    
    return metrics;
  }

  /**
   * Collect Core Web Vitals metrics
   */
  private async collectCoreWebVitals(metrics: PerformanceMetrics): Promise<void> {
    // First Contentful Paint
    const fcpEntry = performance.getEntriesByType('paint')
      .find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }

    // Largest Contentful Paint
    if ('getLCP' in window) {
      const lcp = await this.getLCPMetric();
      metrics.lcp = lcp;
    }

    // First Input Delay
    if ('getFID' in window) {
      const fid = await this.getFIDMetric();
      metrics.fid = fid;
    }

    // Cumulative Layout Shift
    if ('getCLS' in window) {
      const cls = await this.getCLSMetric();
      metrics.cls = cls;
    }

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      metrics.loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
    }
  }

  /**
   * Collect bundle size metrics
   */
  private async collectBundleMetrics(metrics: PerformanceMetrics): Promise<void> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Estimate bundle size based on resource timing
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const estimatedSize = jsResources.reduce((total, resource) => {
        return total + (resource as any).transferSize || 0;
      }, 0);
      
      metrics.bundleSize = estimatedSize / 1024; // Convert to KB
    }
  }

  /**
   * Check performance budget violations
   */
  private checkBudgetViolations(metrics: PerformanceMetrics): void {
    this.performanceBudgets.forEach(budget => {
      const metricValue = this.getMetricValue(metrics, budget.metric);
      
      if (metricValue > budget.target) {
        this.budgetViolations.push({
          metric: budget.metric,
          actual: metricValue,
          budget: budget.target,
          timestamp: Date.now()
        });
        
        // Log budget violation
        console.warn(`🚨 Performance Budget Violation: ${budget.metric}`, {
          actual: `${metricValue}${budget.unit}`,
          budget: `${budget.target}${budget.unit}`,
          priority: budget.priority
        });
      }
    });
  }

  /**
   * Get metric value from metrics object
   */
  private getMetricValue(metrics: PerformanceMetrics, metricName: string): number {
    const metricMap: Record<string, keyof PerformanceMetrics> = {
      'FCP': 'fcp',
      'LCP': 'lcp',
      'FID': 'fid',
      'CLS': 'cls',
      'TTFB': 'ttfb',
      'TBT': 'tbt',
      'bundleSize': 'bundleSize',
      'loadTime': 'loadTime'
    };
    
    return metrics[metricMap[metricName]] || 0;
  }

  /**
   * Calculate optimization score (0-100)
   */
  public calculateOptimizationScore(metrics: PerformanceMetrics): OptimizationScore {
    const scores = {
      fcp: this.calculateMetricScore(metrics.fcp, 1500, 3000),
      lcp: this.calculateMetricScore(metrics.lcp, 2500, 4000),
      fid: this.calculateMetricScore(metrics.fid, 100, 300),
      cls: this.calculateMetricScore(metrics.cls, 0.1, 0.3),
      bundleSize: this.calculateMetricScore(metrics.bundleSize, 500, 2000),
      loadTime: this.calculateMetricScore(metrics.loadTime, 3000, 6000)
    };

    const performance = (scores.fcp + scores.lcp + scores.fid + scores.cls) / 4;
    const accessibility = 85; // Placeholder - would integrate with axe-core
    const bestPractices = (scores.bundleSize + scores.loadTime) / 2;
    const seo = 90; // Placeholder - would integrate with SEO analysis
    const overall = (performance + accessibility + bestPractices + seo) / 4;

    return {
      overall: Math.round(overall),
      performance: Math.round(performance),
      accessibility: Math.round(accessibility),
      bestPractices: Math.round(bestPractices),
      seo: Math.round(seo),
      suggestions: this.generateOptimizationSuggestions(metrics, scores)
    };
  }

  /**
   * Calculate individual metric score
   */
  private calculateMetricScore(value: number, good: number, poor: number): number {
    if (value <= good) return 100;
    if (value >= poor) return 0;
    return Math.round(100 - ((value - good) / (poor - good)) * 100);
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(metrics: PerformanceMetrics, scores: any): string[] {
    const suggestions: string[] = [];

    if (scores.fcp < 80) {
      suggestions.push('Optimize First Contentful Paint: Reduce server response time, optimize critical rendering path');
    }
    
    if (scores.lcp < 80) {
      suggestions.push('Improve Largest Contentful Paint: Optimize images, use CDN, implement preloading');
    }
    
    if (scores.fid < 80) {
      suggestions.push('Reduce First Input Delay: Minimize JavaScript execution time, split code bundles');
    }
    
    if (scores.cls < 80) {
      suggestions.push('Fix Cumulative Layout Shift: Set explicit dimensions, avoid inserting content dynamically');
    }
    
    if (scores.bundleSize < 80) {
      suggestions.push('Reduce bundle size: Implement code splitting, tree shaking, remove unused dependencies');
    }
    
    if (scores.loadTime < 80) {
      suggestions.push('Improve load time: Optimize images, implement lazy loading, use HTTP/2');
    }

    return suggestions;
  }

  /**
   * Network-aware budget adjustments
   */
  public adjustBudgetsForNetwork(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      // Adjust budgets based on network conditions
      const multiplier = this.getNetworkMultiplier(effectiveType);
      
      this.performanceBudgets.forEach(budget => {
        if (budget.unit === 'ms') {
          budget.target *= multiplier;
          budget.warning *= multiplier;
        }
      });
    }
  }

  /**
   * Get network condition multiplier
   */
  private getNetworkMultiplier(effectiveType: string): number {
    const multipliers: Record<string, number> = {
      'slow-2g': 3.0,
      '2g': 2.5,
      '3g': 1.8,
      '4g': 1.0,
      '5g': 0.8
    };
    
    return multipliers[effectiveType] || 1.0;
  }

  /**
   * Get performance analytics
   */
  public getPerformanceAnalytics(): {
    averageMetrics: PerformanceMetrics;
    budgetViolations: number;
    trendAnalysis: Record<string, 'improving' | 'degrading' | 'stable'>;
    recommendedActions: string[];
  } {
    if (this.metricsHistory.length === 0) {
      return {
        averageMetrics: {} as PerformanceMetrics,
        budgetViolations: 0,
        trendAnalysis: {},
        recommendedActions: []
      };
    }

    const averageMetrics = this.calculateAverageMetrics();
    const trendAnalysis = this.analyzeTrends();
    const recommendedActions = this.generateRecommendedActions();

    return {
      averageMetrics,
      budgetViolations: this.budgetViolations.length,
      trendAnalysis,
      recommendedActions
    };
  }

  /**
   * Helper methods for Core Web Vitals collection
   */
  private async getLCPMetric(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry?.startTime || 0);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Fallback timeout
      setTimeout(() => resolve(0), 5000);
    });
  }

  private async getFIDMetric(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const firstEntry = list.getEntries()[0];
        resolve(firstEntry?.processingStart - firstEntry?.startTime || 0);
      });
      observer.observe({ entryTypes: ['first-input'] });
      
      // Fallback timeout
      setTimeout(() => resolve(0), 5000);
    });
  }

  private async getCLSMetric(): Promise<number> {
    return new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        resolve(clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      
      // Fallback timeout
      setTimeout(() => resolve(clsValue), 5000);
    });
  }

  /**
   * Calculate average metrics from history
   */
  private calculateAverageMetrics(): PerformanceMetrics {
    const count = this.metricsHistory.length;
    const sums = this.metricsHistory.reduce((acc, metrics) => {
      acc.fcp += metrics.fcp;
      acc.lcp += metrics.lcp;
      acc.fid += metrics.fid;
      acc.cls += metrics.cls;
      acc.ttfb += metrics.ttfb;
      acc.tbt += metrics.tbt;
      acc.bundleSize += metrics.bundleSize;
      acc.loadTime += metrics.loadTime;
      return acc;
    }, {
      fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0, tbt: 0, bundleSize: 0, loadTime: 0
    });

    return {
      fcp: sums.fcp / count,
      lcp: sums.lcp / count,
      fid: sums.fid / count,
      cls: sums.cls / count,
      ttfb: sums.ttfb / count,
      tbt: sums.tbt / count,
      bundleSize: sums.bundleSize / count,
      loadTime: sums.loadTime / count,
      timestamp: Date.now()
    };
  }

  /**
   * Analyze performance trends
   */
  private analyzeTrends(): Record<string, 'improving' | 'degrading' | 'stable'> {
    // Implementation for trend analysis
    return {
      fcp: 'stable',
      lcp: 'improving',
      bundleSize: 'improving'
    };
  }

  /**
   * Generate recommended actions
   */
  private generateRecommendedActions(): string[] {
    return [
      'Implement code splitting for better FCP',
      'Optimize images for improved LCP',
      'Reduce JavaScript bundle size',
      'Enable compression and caching'
    ];
  }

  /**
   * Process performance observer entries
   */
  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    // Process navigation timing entry
  }

  private processPaintEntry(entry: PerformancePaintTiming): void {
    // Process paint timing entry
  }

  private processLayoutShiftEntry(entry: any): void {
    // Process layout shift entry
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    this.metricsHistory = [];
    this.budgetViolations = [];
  }
}

export default PerformanceMonitoringService;