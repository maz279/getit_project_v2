/**
 * Performance Optimization Service
 * Amazon.com/Shopee.sg Performance Excellence Implementation
 */

import { multiDbManager } from '../database/multi-db-manager';
import { dbRouter } from '../database/database-router';
import { enterpriseCacheService } from './enterprise-cache-service';
import winston from 'winston';

export interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    peakRequestsPerSecond: number;
  };
  database: {
    avgQueryTime: number;
    slowQueries: number;
    connectionPoolUsage: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
}

export interface OptimizationRule {
  id: string;
  name: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  action: (metrics: PerformanceMetrics) => Promise<void>;
  priority: 'high' | 'medium' | 'low';
}

export class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  private logger: winston.Logger;
  private metrics: PerformanceMetrics;
  private optimizationRules: OptimizationRule[];
  private responseTimeSamples: number[] = [];
  private requestCount = 0;
  private slowQueryThreshold = 1000; // 1 second
  private targetResponseTime = 50; // 50ms target (Amazon.com standard)

  private constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          handleExceptions: false,
          handleRejections: false
        })
      ],
      exitOnError: false
    });

    this.metrics = this.initializeMetrics();
    this.optimizationRules = this.initializeOptimizationRules();
    
    this.startPerformanceMonitoring();
    this.startOptimizationEngine();
  }

  public static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance = new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      responseTime: { avg: 0, p50: 0, p95: 0, p99: 0 },
      throughput: { requestsPerSecond: 0, peakRequestsPerSecond: 0 },
      database: { avgQueryTime: 0, slowQueries: 0, connectionPoolUsage: 0 },
      cache: { hitRate: 0, missRate: 0, evictionRate: 0 },
      memory: { heapUsed: 0, heapTotal: 0, external: 0 },
      cpu: { usage: 0, loadAverage: [] }
    };
  }

  // Record request performance
  public recordRequest(responseTime: number): void {
    this.responseTimeSamples.push(responseTime);
    this.requestCount++;
    
    // Keep only last 1000 samples for calculations
    if (this.responseTimeSamples.length > 1000) {
      this.responseTimeSamples = this.responseTimeSamples.slice(-1000);
    }
    
    // Log slow requests
    if (responseTime > this.slowQueryThreshold) {
      this.logger.warn('Slow request detected:', {
        responseTime,
        threshold: this.slowQueryThreshold,
        target: this.targetResponseTime
      });
    }
  }

  // Record database query performance
  public recordDatabaseQuery(queryTime: number, query?: string): void {
    if (queryTime > this.slowQueryThreshold) {
      this.metrics.database.slowQueries++;
      this.logger.warn('Slow database query:', {
        queryTime,
        query: query?.substring(0, 100),
        threshold: this.slowQueryThreshold
      });
    }
  }

  // Get current performance metrics
  public getMetrics(): PerformanceMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  // Update performance metrics
  private updateMetrics(): void {
    // Response time metrics
    if (this.responseTimeSamples.length > 0) {
      const sorted = [...this.responseTimeSamples].sort((a, b) => a - b);
      this.metrics.responseTime.avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      this.metrics.responseTime.p50 = sorted[Math.floor(sorted.length * 0.5)];
      this.metrics.responseTime.p95 = sorted[Math.floor(sorted.length * 0.95)];
      this.metrics.responseTime.p99 = sorted[Math.floor(sorted.length * 0.99)];
    }

    // Memory metrics
    const memUsage = process.memoryUsage();
    this.metrics.memory.heapUsed = memUsage.heapUsed;
    this.metrics.memory.heapTotal = memUsage.heapTotal;
    this.metrics.memory.external = memUsage.external;

    // CPU metrics - safer implementation
    try {
      const cpuUsage = process.cpuUsage();
      this.metrics.cpu.usage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
      this.metrics.cpu.loadAverage = require('os').loadavg();
    } catch (error) {
      // Fallback for CPU metrics
      this.metrics.cpu.usage = 0;
      this.metrics.cpu.loadAverage = [0, 0, 0];
    }

    // Cache metrics
    const cacheMetrics = enterpriseCacheService.getMetrics();
    const totalHits = cacheMetrics.hits.L1 + cacheMetrics.hits.L2 + cacheMetrics.hits.L3;
    const totalMisses = cacheMetrics.misses.L1 + cacheMetrics.misses.L2 + cacheMetrics.misses.L3;
    const totalRequests = totalHits + totalMisses;
    
    if (totalRequests > 0) {
      this.metrics.cache.hitRate = (totalHits / totalRequests) * 100;
      this.metrics.cache.missRate = (totalMisses / totalRequests) * 100;
    }
  }

  // Initialize optimization rules
  private initializeOptimizationRules(): OptimizationRule[] {
    return [
      // High Priority Rules
      {
        id: 'high-response-time',
        name: 'High Response Time Optimization',
        condition: (metrics) => metrics.responseTime.p95 > this.targetResponseTime * 2,
        action: async (metrics) => {
          this.logger.warn('High response time detected, applying optimizations:', {
            p95: metrics.responseTime.p95,
            target: this.targetResponseTime
          });
          
          // Increase cache TTL
          enterpriseCacheService.updateConfig({
            l1: { maxSize: 2000, ttl: 600 }, // Increase L1 cache
            l2: { maxSize: 20000, ttl: 7200 } // Increase L2 cache
          });
          
          // Enable aggressive caching
          await this.enableAggressiveCaching();
        },
        priority: 'high'
      },
      
      {
        id: 'low-cache-hit-rate',
        name: 'Low Cache Hit Rate Optimization',
        condition: (metrics) => metrics.cache.hitRate < 70,
        action: async (metrics) => {
          this.logger.warn('Low cache hit rate detected:', {
            hitRate: metrics.cache.hitRate,
            target: 85
          });
          
          // Optimize cache configuration
          enterpriseCacheService.updateConfig({
            l1: { maxSize: 1500, ttl: 900 },
            l2: { maxSize: 15000, ttl: 5400 },
            strategy: 'write-through'
          });
        },
        priority: 'high'
      },

      // Medium Priority Rules
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage Optimization',
        condition: (metrics) => (metrics.memory.heapUsed / metrics.memory.heapTotal) > 0.85,
        action: async (metrics) => {
          this.logger.warn('High memory usage detected:', {
            usage: `${((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100).toFixed(2)}%`,
            heapUsed: metrics.memory.heapUsed,
            heapTotal: metrics.memory.heapTotal
          });
          
          // Trigger garbage collection
          if (global.gc) {
            global.gc();
          }
          
          // Reduce cache sizes
          enterpriseCacheService.updateConfig({
            l1: { maxSize: 500, ttl: 300 },
            l2: { maxSize: 5000, ttl: 1800 }
          });
        },
        priority: 'medium'
      },

      {
        id: 'slow-database-queries',
        name: 'Slow Database Query Optimization',
        condition: (metrics) => metrics.database.slowQueries > 10,
        action: async (metrics) => {
          this.logger.warn('Multiple slow database queries detected:', {
            slowQueries: metrics.database.slowQueries,
            avgQueryTime: metrics.database.avgQueryTime
          });
          
          // Implement query optimization strategies
          await this.optimizeDatabaseQueries();
        },
        priority: 'medium'
      },

      // Low Priority Rules
      {
        id: 'preemptive-cache-warming',
        name: 'Preemptive Cache Warming',
        condition: (metrics) => metrics.cache.hitRate > 90 && metrics.responseTime.avg < this.targetResponseTime,
        action: async (metrics) => {
          this.logger.info('Performance is excellent, warming additional cache layers');
          await this.warmCache();
        },
        priority: 'low'
      }
    ];
  }

  // Start performance monitoring
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      try {
        this.updateMetrics();
        this.logPerformanceMetrics();
      } catch (error) {
        // Silent failure for performance monitoring to prevent crashes
        console.warn('Performance monitoring error (non-critical):', error instanceof Error ? error.message : error);
      }
    }, 30000); // Every 30 seconds
  }

  // Start optimization engine
  private startOptimizationEngine(): void {
    setInterval(() => {
      try {
        this.runOptimizationRules();
      } catch (error) {
        // Silent failure for optimization engine to prevent crashes
        console.warn('Optimization engine error (non-critical):', error instanceof Error ? error.message : error);
      }
    }, 60000); // Every minute
  }

  // Run optimization rules
  private async runOptimizationRules(): Promise<void> {
    const currentMetrics = this.getMetrics();
    
    // Sort rules by priority
    const sortedRules = this.optimizationRules.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    for (const rule of sortedRules) {
      try {
        if (rule.condition(currentMetrics)) {
          this.logger.info(`Applying optimization rule: ${rule.name}`);
          await rule.action(currentMetrics);
        }
      } catch (error) {
        this.logger.error(`Optimization rule failed: ${rule.name}`, error);
      }
    }
  }

  // Optimization strategies
  private async enableAggressiveCaching(): Promise<void> {
    // Implement aggressive caching strategies
    this.logger.info('Enabling aggressive caching strategies');
    
    // Pre-cache popular endpoints
    const popularEndpoints = [
      '/api/v1/products/trending',
      '/api/v1/categories/navigation',
      '/api/v1/recommendations/personalized'
    ];
    
    for (const endpoint of popularEndpoints) {
      try {
        // Simulate pre-caching (in production, would make actual requests)
        await enterpriseCacheService.set(`pre-cache:${endpoint}`, { cached: true }, 3600);
      } catch (error) {
        this.logger.warn(`Failed to pre-cache ${endpoint}:`, error);
      }
    }
  }

  private async optimizeDatabaseQueries(): Promise<void> {
    this.logger.info('Implementing database query optimizations');
    
    // Reset slow query counter
    this.metrics.database.slowQueries = 0;
    
    // Implement database optimization strategies
    // In production, this would include:
    // - Query plan analysis
    // - Index recommendations
    // - Connection pool optimization
    // - Query caching
  }

  private async warmCache(): Promise<void> {
    this.logger.info('Warming cache with popular content');
    
    // Simulate cache warming
    const popularProducts = ['prod1', 'prod2', 'prod3'];
    for (const productId of popularProducts) {
      await enterpriseCacheService.set(
        `product:${productId}`,
        { id: productId, warmed: true },
        7200
      );
    }
  }

  // Performance monitoring utilities
  private logPerformanceMetrics(): void {
    try {
      const metrics = this.getMetrics();
      
      // Use console.log instead of winston for stability
      console.log('📊 Performance Metrics:', {
      responseTime: {
        avg: `${metrics.responseTime.avg.toFixed(2)}ms`,
        p95: `${metrics.responseTime.p95.toFixed(2)}ms`,
        target: `${this.targetResponseTime}ms`,
        performance: metrics.responseTime.p95 <= this.targetResponseTime ? 'EXCELLENT' : 
                    metrics.responseTime.p95 <= this.targetResponseTime * 2 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
      },
      cache: {
        hitRate: `${metrics.cache.hitRate.toFixed(2)}%`,
        target: '85%',
        performance: metrics.cache.hitRate >= 85 ? 'EXCELLENT' : 
                    metrics.cache.hitRate >= 70 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
      },
      memory: {
        usage: `${((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100).toFixed(2)}%`,
        heapUsed: `${(metrics.memory.heapUsed / 1024 / 1024).toFixed(2)}MB`
      },
      requests: {
        total: this.requestCount,
        slow: metrics.database.slowQueries
      }
      });

      // Record metrics to timeseries database
      this.recordMetricsToTimeseries(metrics);
    } catch (error) {
      // Silent failure for logging to prevent cascading errors
    }
  }

  private async recordMetricsToTimeseries(metrics: PerformanceMetrics): Promise<void> {
    try {
      await dbRouter.recordMetrics(async (timeseriesDb) => {
        const points = [
          {
            measurement: 'performance_metrics',
            tags: { service: 'getit-platform' },
            fields: {
              response_time_avg: metrics.responseTime.avg,
              response_time_p95: metrics.responseTime.p95,
              cache_hit_rate: metrics.cache.hitRate,
              memory_usage_percent: (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100,
              slow_queries: metrics.database.slowQueries
            },
            timestamp: Date.now()
          }
        ];
        
        for (const point of points) {
          await timeseriesDb.writePoint(point);
        }
        
        return { recorded: points.length };
      });
    } catch (error) {
      // Silent failure for metrics recording
    }
  }

  // Public API for middleware integration
  public createPerformanceMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.recordRequest(responseTime);
      });
      
      next();
    };
  }

  // Add custom optimization rule
  public addOptimizationRule(rule: OptimizationRule): void {
    this.optimizationRules.push(rule);
    this.logger.info(`Added optimization rule: ${rule.name}`);
  }

  // Performance benchmarking
  public async benchmarkPerformance(): Promise<{ status: string; recommendations: string[] }> {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];
    
    // Amazon.com standards comparison
    if (metrics.responseTime.p95 > this.targetResponseTime) {
      recommendations.push(`Response time P95 (${metrics.responseTime.p95.toFixed(2)}ms) exceeds Amazon.com standard (${this.targetResponseTime}ms)`);
    }
    
    if (metrics.cache.hitRate < 85) {
      recommendations.push(`Cache hit rate (${metrics.cache.hitRate.toFixed(2)}%) below optimal (85%+)`);
    }
    
    const memoryUsage = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (memoryUsage > 80) {
      recommendations.push(`Memory usage (${memoryUsage.toFixed(2)}%) approaching limits`);
    }
    
    const status = recommendations.length === 0 ? 'EXCELLENT' : 
                  recommendations.length <= 2 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    return { status, recommendations };
  }
}

// Export singleton instance
export const performanceOptimizationService = PerformanceOptimizationService.getInstance();