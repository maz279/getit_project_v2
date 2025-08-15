/**
 * Performance Monitoring Service
 * Real-time Performance Tracking & Optimization
 * Amazon.com/Shopee.sg Performance Standards Implementation
 */

interface CoreWebVitalsMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  TTI: number; // Time to Interactive
}

interface PerformanceMetrics {
  coreWebVitals: CoreWebVitalsMetrics;
  bundleMetrics: BundlePerformanceMetrics;
  componentMetrics: ComponentPerformanceMetrics[];
  networkMetrics: NetworkPerformanceMetrics;
  timestamp: number;
}

interface BundlePerformanceMetrics {
  totalBundleSize: number;
  initialChunkSize: number;
  lazyChunkCount: number;
  compressionRatio: number;
  cacheHitRate: number;
  loadTime: number;
}

interface ComponentPerformanceMetrics {
  componentName: string;
  renderTime: number;
  bundleContribution: number;
  memoryUsage: number;
  reRenderCount: number;
  isLazilyLoaded: boolean;
}

interface NetworkPerformanceMetrics {
  downloadSpeed: number; // Mbps
  connectionType: string;
  rtt: number; // Round trip time
  effectiveType: string; // 4g, 3g, 2g, slow-2g
}

interface PerformanceBudget {
  FCP: number; // Target: 1.8s
  LCP: number; // Target: 2.5s
  FID: number; // Target: 100ms
  CLS: number; // Target: 0.1
  bundleSize: number; // Target: 500KB
}

interface PerformanceAlert {
  type: 'budget_exceeded' | 'performance_regression' | 'memory_leak' | 'slow_component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  suggestions: string[];
  timestamp: number;
}

/**
 * Performance Monitoring Service
 * Comprehensive performance tracking and optimization
 */
export class PerformanceMonitoringService {
  private performanceObserver: PerformanceObserver | null = null;
  private metricsHistory: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring: boolean = false;
  private componentObservers: Map<string, PerformanceObserver> = new Map();
  
  private performanceBudget: PerformanceBudget = {
    FCP: 1800, // 1.8s
    LCP: 2500, // 2.5s
    FID: 100,  // 100ms
    CLS: 0.1,  // 0.1
    bundleSize: 512000 // 500KB
  };

  constructor() {
    this.initializePerformanceObserver();
    this.initializeNetworkObserver();
  }

  /**
   * Initialize performance observer for Core Web Vitals
   */
  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      // Observe paint events
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('FCP', entry.startTime);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.updateMetric('LCP', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.updateMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.updateMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      this.performanceObserver = paintObserver; // Store reference for cleanup
    } catch (error) {
      console.warn('Failed to initialize performance observer:', error);
    }
  }

  /**
   * Initialize network performance observer
   */
  private initializeNetworkObserver(): void {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', () => {
          this.recordNetworkMetrics();
        });
      }
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.recordInitialMetrics();
    
    // Periodic metrics collection
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000); // Every 30 seconds

    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    // Disconnect observers
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    this.componentObservers.forEach(observer => observer.disconnect());
    this.componentObservers.clear();
    
    console.log('Performance monitoring stopped');
  }

  /**
   * Update a specific performance metric
   */
  private updateMetric(metric: keyof CoreWebVitalsMetrics, value: number): void {
    // Check against performance budget
    const budget = this.performanceBudget[metric as keyof PerformanceBudget];
    if (budget && value > budget) {
      this.createAlert('budget_exceeded', 'high', metric, value, budget);
    }

    // Store for analysis
    this.recordMetricUpdate(metric, value);
  }

  /**
   * Record metric update with timestamp
   */
  private recordMetricUpdate(metric: string, value: number): void {
    // This would integrate with a metrics storage system in production
    console.log(`Performance metric updated: ${metric} = ${value}ms`);
  }

  /**
   * Create performance alert
   */
  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    metric: string,
    currentValue: number,
    targetValue: number
  ): void {
    const suggestions = this.generateOptimizationSuggestions(metric, currentValue, targetValue);
    
    const alert: PerformanceAlert = {
      type,
      severity,
      message: `Performance budget exceeded for ${metric}`,
      metric,
      currentValue,
      targetValue,
      suggestions,
      timestamp: Date.now()
    };

    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Log critical alerts
    if (severity === 'critical') {
      console.error('CRITICAL Performance Alert:', alert.message);
    }
  }

  /**
   * Generate optimization suggestions based on metrics
   */
  private generateOptimizationSuggestions(metric: string, current: number, target: number): string[] {
    const suggestions: string[] = [];

    switch (metric) {
      case 'FCP':
        suggestions.push('Optimize critical rendering path');
        suggestions.push('Reduce initial bundle size');
        suggestions.push('Use resource preloading for critical assets');
        break;
      case 'LCP':
        suggestions.push('Optimize largest content element');
        suggestions.push('Use efficient image formats (WebP, AVIF)');
        suggestions.push('Implement better caching strategies');
        break;
      case 'FID':
        suggestions.push('Reduce main thread blocking time');
        suggestions.push('Break up long JavaScript tasks');
        suggestions.push('Use web workers for heavy computations');
        break;
      case 'CLS':
        suggestions.push('Reserve space for dynamic content');
        suggestions.push('Use aspect-ratio for images and ads');
        suggestions.push('Avoid inserting content above existing content');
        break;
      case 'bundleSize':
        suggestions.push('Implement code splitting');
        suggestions.push('Remove unused dependencies');
        suggestions.push('Use dynamic imports for non-critical features');
        break;
    }

    return suggestions;
  }

  /**
   * Record initial metrics
   */
  private recordInitialMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.fetchStart;
        const tti = navigation.loadEventEnd - navigation.fetchStart;
        
        this.updateMetric('TTFB', ttfb);
        this.updateMetric('TTI', tti);
      }

      // Bundle size estimation
      this.estimateBundleSize();
      
    } catch (error) {
      console.warn('Failed to record initial metrics:', error);
    }
  }

  /**
   * Estimate current bundle size
   */
  private estimateBundleSize(): void {
    if (typeof window === 'undefined') return;

    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;
      
      resources.forEach(resource => {
        if (resource.initiatorType === 'script' || resource.initiatorType === 'link') {
          // Estimate size based on transfer size or encoded body size
          const size = (resource as any).transferSize || (resource as any).encodedBodySize || 0;
          totalSize += size;
        }
      });

      if (totalSize > this.performanceBudget.bundleSize) {
        this.createAlert('budget_exceeded', 'high', 'bundleSize', totalSize, this.performanceBudget.bundleSize);
      }

    } catch (error) {
      console.warn('Failed to estimate bundle size:', error);
    }
  }

  /**
   * Record network metrics
   */
  private recordNetworkMetrics(): void {
    if (typeof navigator === 'undefined') return;

    try {
      const connection = (navigator as any).connection;
      if (connection) {
        const networkMetrics: NetworkPerformanceMetrics = {
          downloadSpeed: connection.downlink || 0,
          connectionType: connection.type || 'unknown',
          rtt: connection.rtt || 0,
          effectiveType: connection.effectiveType || 'unknown'
        };

        // Adjust performance budgets based on connection
        this.adjustBudgetForConnection(networkMetrics.effectiveType);
      }
    } catch (error) {
      console.warn('Failed to record network metrics:', error);
    }
  }

  /**
   * Adjust performance budgets based on connection quality
   */
  private adjustBudgetForConnection(effectiveType: string): void {
    const baseBudget = { ...this.performanceBudget };
    
    switch (effectiveType) {
      case 'slow-2g':
        this.performanceBudget.FCP = baseBudget.FCP * 3;
        this.performanceBudget.LCP = baseBudget.LCP * 3;
        this.performanceBudget.bundleSize = baseBudget.bundleSize * 0.5;
        break;
      case '2g':
        this.performanceBudget.FCP = baseBudget.FCP * 2;
        this.performanceBudget.LCP = baseBudget.LCP * 2;
        this.performanceBudget.bundleSize = baseBudget.bundleSize * 0.7;
        break;
      case '3g':
        this.performanceBudget.FCP = baseBudget.FCP * 1.5;
        this.performanceBudget.LCP = baseBudget.LCP * 1.5;
        this.performanceBudget.bundleSize = baseBudget.bundleSize * 0.8;
        break;
      case '4g':
      default:
        this.performanceBudget = { ...baseBudget };
        break;
    }
  }

  /**
   * Collect comprehensive performance metrics
   */
  private collectPerformanceMetrics(): void {
    if (!this.isMonitoring) return;

    try {
      const metrics: Partial<PerformanceMetrics> = {
        timestamp: Date.now()
      };

      // Add to history
      this.metricsHistory.push(metrics as PerformanceMetrics);
      
      // Keep only last 100 entries
      if (this.metricsHistory.length > 100) {
        this.metricsHistory = this.metricsHistory.slice(-100);
      }

    } catch (error) {
      console.warn('Failed to collect performance metrics:', error);
    }
  }

  /**
   * Get current performance report
   */
  getPerformanceReport(): {
    currentMetrics: Partial<PerformanceMetrics>;
    budgetCompliance: { [key: string]: boolean };
    recentAlerts: PerformanceAlert[];
    optimizationScore: number;
    recommendations: string[];
  } {
    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1] || {};
    const recentAlerts = this.alerts.slice(-10);
    
    // Calculate budget compliance
    const budgetCompliance: { [key: string]: boolean } = {};
    Object.entries(this.performanceBudget).forEach(([key, budget]) => {
      const current = (currentMetrics as any)?.[key] || 0;
      budgetCompliance[key] = current <= budget;
    });

    // Calculate optimization score (0-100)
    const compliancePercentage = Object.values(budgetCompliance)
      .filter(Boolean).length / Object.keys(budgetCompliance).length;
    const optimizationScore = Math.round(compliancePercentage * 100);

    // Generate recommendations
    const recommendations = recentAlerts
      .filter(alert => alert.severity === 'high' || alert.severity === 'critical')
      .flatMap(alert => alert.suggestions)
      .slice(0, 5); // Top 5 recommendations

    return {
      currentMetrics,
      budgetCompliance,
      recentAlerts,
      optimizationScore,
      recommendations
    };
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: PerformanceAlert['severity']): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): {
    metricsHistory: PerformanceMetrics[];
    alerts: PerformanceAlert[];
    budget: PerformanceBudget;
    exportTime: number;
  } {
    return {
      metricsHistory: this.metricsHistory,
      alerts: this.alerts,
      budget: this.performanceBudget,
      exportTime: Date.now()
    };
  }
}

// Singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();

// Auto-start monitoring in browser environment
if (typeof window !== 'undefined') {
  performanceMonitoringService.startMonitoring();
}

// Export types
export type {
  PerformanceMetrics,
  CoreWebVitalsMetrics,
  BundlePerformanceMetrics,
  ComponentPerformanceMetrics,
  PerformanceAlert,
  PerformanceBudget
};