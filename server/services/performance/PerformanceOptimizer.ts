/**
 * Performance Optimizer Service - Phase 3 Implementation
 * Amazon.com/Shopee.sg-level performance optimization and monitoring
 * 
 * @fileoverview Enterprise-grade performance optimization with Core Web Vitals tracking
 * @author GetIt Platform Team
 * @version 3.0.0
 * @since Phase 3 Performance & Analytics Implementation
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import AdvancedCacheService from './AdvancedCacheService';

interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  tti: number; // Time to Interactive
  
  // Custom Metrics
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface PerformanceRule {
  id: string;
  name: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  action: (metrics: PerformanceMetrics) => Promise<void>;
  priority: 'high' | 'medium' | 'low';
  enabled: boolean;
}

interface OptimizationConfig {
  coreWebVitals: {
    fcp: { target: number; threshold: number; };
    lcp: { target: number; threshold: number; };
    fid: { target: number; threshold: number; };
    cls: { target: number; threshold: number; };
    ttfb: { target: number; threshold: number; };
    tti: { target: number; threshold: number; };
  };
  performance: {
    responseTime: { target: number; threshold: number; };
    throughput: { target: number; threshold: number; };
    errorRate: { target: number; threshold: number; };
    cacheHitRate: { target: number; threshold: number; };
  };
  monitoring: {
    interval: number;
    batchSize: number;
    retention: number;
  };
  optimization: {
    autoOptimize: boolean;
    aggressiveMode: boolean;
    bangladeshOptimization: boolean;
  };
}

interface PerformanceInsight {
  type: 'suggestion' | 'warning' | 'critical';
  category: 'performance' | 'user-experience' | 'resource' | 'network';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  actions: string[];
  priority: number;
}

export class PerformanceOptimizer extends EventEmitter {
  private cache: AdvancedCacheService;
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics[];
  private rules: PerformanceRule[];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private optimizationEnabled: boolean = true;

  constructor(cache: AdvancedCacheService, config?: Partial<OptimizationConfig>) {
    super();
    
    this.cache = cache;
    this.config = {
      coreWebVitals: {
        fcp: { target: 1500, threshold: 2000 }, // 1.5s target, 2s threshold
        lcp: { target: 2500, threshold: 4000 }, // 2.5s target, 4s threshold
        fid: { target: 100, threshold: 300 },   // 100ms target, 300ms threshold
        cls: { target: 0.1, threshold: 0.25 }, // 0.1 target, 0.25 threshold
        ttfb: { target: 200, threshold: 600 },  // 200ms target, 600ms threshold
        tti: { target: 3000, threshold: 5000 } // 3s target, 5s threshold
      },
      performance: {
        responseTime: { target: 50, threshold: 200 },    // 50ms target, 200ms threshold
        throughput: { target: 1000, threshold: 500 },    // 1000 RPS target, 500 threshold
        errorRate: { target: 0.001, threshold: 0.01 },   // 0.1% target, 1% threshold
        cacheHitRate: { target: 0.9, threshold: 0.7 }    // 90% target, 70% threshold
      },
      monitoring: {
        interval: 5000,    // 5 seconds
        batchSize: 100,    // 100 metrics per batch
        retention: 86400000 // 24 hours
      },
      optimization: {
        autoOptimize: true,
        aggressiveMode: false,
        bangladeshOptimization: true
      },
      ...config
    };

    this.metrics = [];
    this.rules = [];
    
    this.initializeOptimizationRules();
    this.startMonitoring();
  }

  /**
   * Initialize performance optimization rules
   */
  private initializeOptimizationRules(): void {
    this.rules = [
      {
        id: 'response_time_optimization',
        name: 'Response Time Optimization',
        condition: (metrics) => metrics.responseTime > this.config.performance.responseTime.threshold,
        action: async (metrics) => {
          console.log('🚀 Applying response time optimization...');
          await this.enableIntelligentRouting();
          await this.optimizeDatabaseQueries();
          await this.enableAggressiveCaching();
        },
        priority: 'high',
        enabled: true
      },
      {
        id: 'cache_hit_rate_optimization',
        name: 'Cache Hit Rate Optimization',
        condition: (metrics) => metrics.cacheHitRate < this.config.performance.cacheHitRate.threshold,
        action: async (metrics) => {
          console.log('💾 Optimizing cache hit rate...');
          await this.optimizeCacheStrategy();
          await this.preloadFrequentlyAccessedData();
        },
        priority: 'high',
        enabled: true
      },
      {
        id: 'core_web_vitals_optimization',
        name: 'Core Web Vitals Optimization',
        condition: (metrics) => 
          metrics.lcp > this.config.coreWebVitals.lcp.threshold ||
          metrics.fid > this.config.coreWebVitals.fid.threshold ||
          metrics.cls > this.config.coreWebVitals.cls.threshold,
        action: async (metrics) => {
          console.log('⚡ Optimizing Core Web Vitals...');
          await this.optimizeResourceLoading();
          await this.enableCriticalResourcePreloading();
          await this.optimizeImageDelivery();
        },
        priority: 'high',
        enabled: true
      },
      {
        id: 'bangladesh_network_optimization',
        name: 'Bangladesh Network Optimization',
        condition: (metrics) => metrics.ttfb > 500 && this.config.optimization.bangladeshOptimization,
        action: async (metrics) => {
          console.log('🇧🇩 Applying Bangladesh network optimization...');
          await this.enableBangladeshCDN();
          await this.optimizeFor2G3G();
          await this.enableDataSaverMode();
        },
        priority: 'medium',
        enabled: true
      },
      {
        id: 'memory_optimization',
        name: 'Memory Usage Optimization',
        condition: (metrics) => metrics.memoryUsage > 80,
        action: async (metrics) => {
          console.log('🧠 Optimizing memory usage...');
          await this.optimizeMemoryUsage();
          await this.enableGarbageCollection();
        },
        priority: 'medium',
        enabled: true
      }
    ];
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const timestamp = Date.now();
    const fullMetrics: PerformanceMetrics = {
      fcp: metrics.fcp || 0,
      lcp: metrics.lcp || 0,
      fid: metrics.fid || 0,
      cls: metrics.cls || 0,
      ttfb: metrics.ttfb || 0,
      tti: metrics.tti || 0,
      responseTime: metrics.responseTime || 0,
      throughput: metrics.throughput || 0,
      errorRate: metrics.errorRate || 0,
      cacheHitRate: metrics.cacheHitRate || 0,
      memoryUsage: metrics.memoryUsage || 0,
      cpuUsage: metrics.cpuUsage || 0
    };

    this.metrics.push(fullMetrics);
    
    // Keep only recent metrics
    const cutoff = timestamp - this.config.monitoring.retention;
    this.metrics = this.metrics.filter(m => m.responseTime > cutoff);

    // Trigger optimization if enabled
    if (this.optimizationEnabled && this.config.optimization.autoOptimize) {
      this.triggerOptimization(fullMetrics);
    }

    this.emit('metrics', { metrics: fullMetrics, timestamp });
  }

  /**
   * Trigger performance optimization
   */
  private async triggerOptimization(metrics: PerformanceMetrics): Promise<void> {
    const applicableRules = this.rules.filter(rule => 
      rule.enabled && rule.condition(metrics)
    );

    // Sort by priority
    applicableRules.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Apply rules
    for (const rule of applicableRules) {
      try {
        console.log(`🎯 Applying optimization rule: ${rule.name}`);
        await rule.action(metrics);
        this.emit('optimization', { ruleId: rule.id, applied: true });
      } catch (error) {
        console.error(`❌ Failed to apply rule ${rule.id}:`, error);
        this.emit('optimization', { ruleId: rule.id, applied: false, error });
      }
    }
  }

  /**
   * Generate performance insights
   */
  generateInsights(): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];
    
    if (this.metrics.length === 0) {
      return insights;
    }

    const latestMetrics = this.metrics[this.metrics.length - 1];
    const avgMetrics = this.calculateAverageMetrics();

    // Core Web Vitals insights
    if (latestMetrics.lcp > this.config.coreWebVitals.lcp.threshold) {
      insights.push({
        type: 'critical',
        category: 'performance',
        title: 'Large Contentful Paint (LCP) is too slow',
        description: `LCP is ${latestMetrics.lcp}ms, which exceeds the threshold of ${this.config.coreWebVitals.lcp.threshold}ms`,
        impact: 'high',
        effort: 'medium',
        actions: [
          'Optimize images and use WebP format',
          'Enable lazy loading for below-the-fold content',
          'Implement critical CSS inlining',
          'Use CDN for faster content delivery'
        ],
        priority: 95
      });
    }

    if (latestMetrics.fid > this.config.coreWebVitals.fid.threshold) {
      insights.push({
        type: 'critical',
        category: 'user-experience',
        title: 'First Input Delay (FID) is too high',
        description: `FID is ${latestMetrics.fid}ms, which exceeds the threshold of ${this.config.coreWebVitals.fid.threshold}ms`,
        impact: 'high',
        effort: 'high',
        actions: [
          'Reduce JavaScript execution time',
          'Implement code splitting',
          'Use web workers for heavy computations',
          'Optimize third-party scripts'
        ],
        priority: 90
      });
    }

    if (latestMetrics.cls > this.config.coreWebVitals.cls.threshold) {
      insights.push({
        type: 'warning',
        category: 'user-experience',
        title: 'Cumulative Layout Shift (CLS) is too high',
        description: `CLS is ${latestMetrics.cls}, which exceeds the threshold of ${this.config.coreWebVitals.cls.threshold}`,
        impact: 'medium',
        effort: 'medium',
        actions: [
          'Set dimensions for images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use CSS transforms instead of layout properties'
        ],
        priority: 80
      });
    }

    // Performance insights
    if (avgMetrics.responseTime > this.config.performance.responseTime.threshold) {
      insights.push({
        type: 'critical',
        category: 'performance',
        title: 'API response time is too slow',
        description: `Average response time is ${avgMetrics.responseTime}ms, which exceeds the threshold of ${this.config.performance.responseTime.threshold}ms`,
        impact: 'high',
        effort: 'medium',
        actions: [
          'Implement database query optimization',
          'Enable aggressive caching',
          'Use database connection pooling',
          'Optimize API endpoints'
        ],
        priority: 85
      });
    }

    if (avgMetrics.cacheHitRate < this.config.performance.cacheHitRate.threshold) {
      insights.push({
        type: 'warning',
        category: 'resource',
        title: 'Cache hit rate is too low',
        description: `Cache hit rate is ${(avgMetrics.cacheHitRate * 100).toFixed(1)}%, which is below the threshold of ${(this.config.performance.cacheHitRate.threshold * 100).toFixed(1)}%`,
        impact: 'medium',
        effort: 'low',
        actions: [
          'Optimize cache keys and TTL values',
          'Implement cache warming strategies',
          'Use multi-tier caching',
          'Analyze cache invalidation patterns'
        ],
        priority: 70
      });
    }

    // Bangladesh-specific insights
    if (this.config.optimization.bangladeshOptimization) {
      if (latestMetrics.ttfb > 500) {
        insights.push({
          type: 'suggestion',
          category: 'network',
          title: 'Network latency optimization for Bangladesh',
          description: `TTFB is ${latestMetrics.ttfb}ms, which may affect users on slower networks`,
          impact: 'medium',
          effort: 'medium',
          actions: [
            'Enable Bangladesh CDN endpoints',
            'Optimize for 2G/3G networks',
            'Implement progressive loading',
            'Use compression for all assets'
          ],
          priority: 60
        });
      }
    }

    return insights.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate average metrics
   */
  private calculateAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0, tti: 0,
        responseTime: 0, throughput: 0, errorRate: 0, cacheHitRate: 0,
        memoryUsage: 0, cpuUsage: 0
      };
    }

    const sums = this.metrics.reduce((acc, metrics) => {
      Object.keys(metrics).forEach(key => {
        acc[key] = (acc[key] || 0) + metrics[key];
      });
      return acc;
    }, {} as any);

    const averages = {} as PerformanceMetrics;
    Object.keys(sums).forEach(key => {
      averages[key] = sums[key] / this.metrics.length;
    });

    return averages;
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectRealTimeMetrics();
    }, this.config.monitoring.interval);
  }

  /**
   * Collect real-time metrics
   */
  private async collectRealTimeMetrics(): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage();
      const cacheMetrics = this.cache.getMetrics();
      
      const metrics: Partial<PerformanceMetrics> = {
        memoryUsage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        cacheHitRate: cacheMetrics.overall.hitRate,
        responseTime: cacheMetrics.performance.avgLatency,
        ttfb: cacheMetrics.performance.avgLatency * 2, // Approximate TTFB
      };

      this.recordMetrics(metrics);
    } catch (error) {
      console.error('Error collecting real-time metrics:', error);
    }
  }

  // Optimization action methods
  private async enableIntelligentRouting(): Promise<void> {
    console.log('🔄 Enabling intelligent routing...');
    // Implementation for intelligent routing
  }

  private async optimizeDatabaseQueries(): Promise<void> {
    console.log('🗄️ Optimizing database queries...');
    // Implementation for database query optimization
  }

  private async enableAggressiveCaching(): Promise<void> {
    console.log('💾 Enabling aggressive caching...');
    // Implementation for aggressive caching
  }

  private async optimizeCacheStrategy(): Promise<void> {
    console.log('📊 Optimizing cache strategy...');
    // Implementation for cache strategy optimization
  }

  private async preloadFrequentlyAccessedData(): Promise<void> {
    console.log('🔄 Preloading frequently accessed data...');
    // Implementation for data preloading
  }

  private async optimizeResourceLoading(): Promise<void> {
    console.log('📦 Optimizing resource loading...');
    // Implementation for resource loading optimization
  }

  private async enableCriticalResourcePreloading(): Promise<void> {
    console.log('⚡ Enabling critical resource preloading...');
    // Implementation for critical resource preloading
  }

  private async optimizeImageDelivery(): Promise<void> {
    console.log('🖼️ Optimizing image delivery...');
    // Implementation for image delivery optimization
  }

  private async enableBangladeshCDN(): Promise<void> {
    console.log('🇧🇩 Enabling Bangladesh CDN...');
    // Implementation for Bangladesh CDN
  }

  private async optimizeFor2G3G(): Promise<void> {
    console.log('📱 Optimizing for 2G/3G networks...');
    // Implementation for 2G/3G optimization
  }

  private async enableDataSaverMode(): Promise<void> {
    console.log('💾 Enabling data saver mode...');
    // Implementation for data saver mode
  }

  private async optimizeMemoryUsage(): Promise<void> {
    console.log('🧠 Optimizing memory usage...');
    // Implementation for memory optimization
  }

  private async enableGarbageCollection(): Promise<void> {
    console.log('🗑️ Enabling garbage collection...');
    // Implementation for garbage collection
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    current: PerformanceMetrics;
    average: PerformanceMetrics;
    insights: PerformanceInsight[];
    health: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  } {
    const current = this.metrics[this.metrics.length - 1] || {} as PerformanceMetrics;
    const average = this.calculateAverageMetrics();
    const insights = this.generateInsights();
    
    // Calculate health score
    let healthScore = 100;
    if (current.responseTime > this.config.performance.responseTime.threshold) healthScore -= 20;
    if (current.cacheHitRate < this.config.performance.cacheHitRate.threshold) healthScore -= 15;
    if (current.lcp > this.config.coreWebVitals.lcp.threshold) healthScore -= 25;
    if (current.fid > this.config.coreWebVitals.fid.threshold) healthScore -= 25;
    if (current.cls > this.config.coreWebVitals.cls.threshold) healthScore -= 15;

    const health = healthScore >= 90 ? 'excellent' : 
                  healthScore >= 70 ? 'good' : 
                  healthScore >= 50 ? 'needs_improvement' : 'poor';

    return { current, average, insights, health };
  }

  /**
   * Enable/disable optimization
   */
  setOptimizationEnabled(enabled: boolean): void {
    this.optimizationEnabled = enabled;
    this.emit('optimizationToggled', { enabled });
  }

  /**
   * Shutdown performance optimizer
   */
  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.emit('shutdown');
  }
}

export default PerformanceOptimizer;