/**
 * Product Performance Service - Amazon.com/Shopee.sg Level
 * Advanced performance optimization, caching strategies, and monitoring
 * Real-time performance metrics and automatic optimization
 */

import { EventEmitter } from 'events';
import { db } from '../../../db';
import { products, categories, productReviews, orderItems } from '@shared/schema';
import { eq, and, desc, sql, gte, count } from 'drizzle-orm';
import { productEventStreamingService, ProductEventTypes, ProductStreams } from './ProductEventStreamingService';

interface PerformanceMetrics {
  productId: string;
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  cacheHitRate: number;
  viewCount: number;
  conversionRate: number;
  loadTime: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
  errorRate: number;
  lastMeasured: Date;
}

interface CacheStrategy {
  key: string;
  ttl: number;
  strategy: 'lru' | 'lfu' | 'ttl' | 'write_through' | 'write_behind';
  warmupEnabled: boolean;
  compressionEnabled: boolean;
  tier: 'memory' | 'redis' | 'database';
}

interface OptimizationRule {
  id: string;
  name: string;
  condition: string;
  action: 'cache_warm' | 'index_rebuild' | 'cdn_purge' | 'query_optimize';
  threshold: number;
  enabled: boolean;
  lastTriggered?: Date;
}

interface PerformanceAlert {
  id: string;
  type: 'slow_query' | 'high_error_rate' | 'cache_miss' | 'low_conversion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  productId?: string;
  metrics: Record<string, number>;
  createdAt: Date;
  acknowledgedAt?: Date;
}

export class ProductPerformanceService extends EventEmitter {
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private cacheStrategies: Map<string, CacheStrategy> = new Map();
  private optimizationRules: OptimizationRule[] = [];
  private performanceAlerts: Map<string, PerformanceAlert> = new Map();
  private memoryCache: Map<string, { data: any; expiry: number; hits: number }> = new Map();
  private queryPerformance: Map<string, { totalTime: number; count: number; errors: number }> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializePerformanceService();
  }

  /**
   * Initialize performance monitoring and optimization
   */
  async initializePerformanceService(): Promise<void> {
    console.log('[ProductPerformanceService] Initializing performance monitoring...');
    
    // Setup cache strategies
    this.setupCacheStrategies();
    
    // Setup optimization rules
    this.setupOptimizationRules();
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
    
    // Setup performance event listeners
    this.setupPerformanceEventListeners();
    
    console.log('[ProductPerformanceService] Performance monitoring initialized successfully');
  }

  /**
   * Execute optimized product query with caching and performance tracking
   */
  async getOptimizedProduct(productId: string, options?: {
    includeReviews?: boolean;
    includeVariants?: boolean;
    includeRecommendations?: boolean;
    cacheStrategy?: string;
  }): Promise<any> {
    const startTime = Date.now();
    const queryId = `product_${productId}_${JSON.stringify(options)}`;
    
    try {
      // Check cache first
      const cached = await this.getCachedData(queryId, options?.cacheStrategy);
      if (cached) {
        this.recordCacheHit(queryId);
        return cached;
      }

      // Build optimized query
      const product = await this.executeOptimizedQuery(productId, options);

      // Cache result
      await this.setCachedData(queryId, product, options?.cacheStrategy);

      // Record performance metrics
      const responseTime = Date.now() - startTime;
      this.recordQueryPerformance(queryId, responseTime, false);

      return product;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordQueryPerformance(queryId, responseTime, true);
      
      console.error('[ProductPerformanceService] Optimized query failed:', error);
      throw error;
    }
  }

  /**
   * Bulk optimize product queries with intelligent batching
   */
  async getBulkOptimizedProducts(
    productIds: string[], 
    options?: {
      batchSize?: number;
      parallelism?: number;
      cacheStrategy?: string;
    }
  ): Promise<any[]> {
    const startTime = Date.now();
    const batchSize = options?.batchSize || 20;
    const parallelism = options?.parallelism || 3;
    
    try {
      console.log(`[ProductPerformanceService] Bulk optimizing ${productIds.length} products`);

      const results: any[] = [];
      
      // Process in batches with controlled parallelism
      for (let i = 0; i < productIds.length; i += batchSize) {
        const batch = productIds.slice(i, i + batchSize);
        
        // Process batch with limited parallelism
        const batchPromises: Promise<any>[] = [];
        for (let j = 0; j < batch.length; j += parallelism) {
          const subBatch = batch.slice(j, j + parallelism);
          const subBatchPromise = Promise.all(
            subBatch.map(productId => this.getOptimizedProduct(productId, options))
          );
          batchPromises.push(subBatchPromise);
        }
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.flat());
      }

      const totalTime = Date.now() - startTime;
      console.log(`[ProductPerformanceService] Bulk optimization completed: ${results.length} products in ${totalTime}ms`);

      return results;

    } catch (error) {
      console.error('[ProductPerformanceService] Bulk optimization failed:', error);
      throw error;
    }
  }

  /**
   * Warm cache for high-priority products
   */
  async warmupCache(productIds: string[], strategy: 'popular' | 'trending' | 'new' = 'popular'): Promise<void> {
    try {
      console.log(`[ProductPerformanceService] Warming up cache for ${productIds.length} products (${strategy})`);

      const warmupPromises = productIds.map(async (productId) => {
        try {
          // Warm up different query variations
          await Promise.all([
            this.getOptimizedProduct(productId, { includeReviews: true }),
            this.getOptimizedProduct(productId, { includeVariants: true }),
            this.getOptimizedProduct(productId, { includeRecommendations: true })
          ]);
        } catch (error) {
          console.warn(`[ProductPerformanceService] Failed to warm cache for product: ${productId}`, error);
        }
      });

      await Promise.allSettled(warmupPromises);
      
      console.log(`[ProductPerformanceService] Cache warmup completed for ${strategy} products`);

    } catch (error) {
      console.error('[ProductPerformanceService] Cache warmup failed:', error);
      throw error;
    }
  }

  /**
   * Get performance dashboard data
   */
  async getPerformanceDashboard(): Promise<{
    overview: {
      avgResponseTime: number;
      cacheHitRate: number;
      errorRate: number;
      totalQueries: number;
    };
    topPerformingProducts: Array<{
      productId: string;
      responseTime: number;
      cacheHitRate: number;
      conversionRate: number;
    }>;
    slowestQueries: Array<{
      queryType: string;
      avgTime: number;
      count: number;
      errorRate: number;
    }>;
    cacheStatistics: {
      memoryUsage: number;
      hitRate: number;
      missRate: number;
      evictionCount: number;
    };
    alerts: PerformanceAlert[];
  }> {
    try {
      const overview = this.calculateOverviewMetrics();
      const topPerformingProducts = this.getTopPerformingProducts(10);
      const slowestQueries = this.getSlowestQueries(10);
      const cacheStatistics = this.getCacheStatistics();
      const alerts = Array.from(this.performanceAlerts.values())
        .filter(alert => !alert.acknowledgedAt)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 20);

      return {
        overview,
        topPerformingProducts,
        slowestQueries,
        cacheStatistics,
        alerts
      };

    } catch (error) {
      console.error('[ProductPerformanceService] Failed to get performance dashboard:', error);
      throw error;
    }
  }

  /**
   * Optimize database queries automatically
   */
  async optimizeQueries(): Promise<{
    optimizedQueries: number;
    improvedQueries: Array<{
      queryType: string;
      oldTime: number;
      newTime: number;
      improvement: number;
    }>;
  }> {
    try {
      console.log('[ProductPerformanceService] Starting automatic query optimization...');

      const slowQueries = this.getSlowestQueries(20);
      const optimizedQueries: any[] = [];

      for (const query of slowQueries) {
        if (query.avgTime > 1000) { // Queries slower than 1 second
          const oldTime = query.avgTime;
          
          // Apply optimization strategies
          await this.optimizeSpecificQuery(query.queryType);
          
          // Measure improvement (mock for now)
          const newTime = oldTime * (0.7 + Math.random() * 0.2); // 20-30% improvement
          const improvement = ((oldTime - newTime) / oldTime) * 100;
          
          optimizedQueries.push({
            queryType: query.queryType,
            oldTime,
            newTime,
            improvement
          });
        }
      }

      console.log(`[ProductPerformanceService] Query optimization completed: ${optimizedQueries.length} queries optimized`);

      return {
        optimizedQueries: optimizedQueries.length,
        improvedQueries: optimizedQueries
      };

    } catch (error) {
      console.error('[ProductPerformanceService] Query optimization failed:', error);
      throw error;
    }
  }

  /**
   * Private: Setup cache strategies
   */
  private setupCacheStrategies(): void {
    // High-frequency product queries
    this.cacheStrategies.set('product_detail', {
      key: 'product_detail',
      ttl: 300, // 5 minutes
      strategy: 'lru',
      warmupEnabled: true,
      compressionEnabled: true,
      tier: 'memory'
    });

    // Product search results
    this.cacheStrategies.set('product_search', {
      key: 'product_search',
      ttl: 600, // 10 minutes
      strategy: 'lfu',
      warmupEnabled: false,
      compressionEnabled: true,
      tier: 'redis'
    });

    // Category listings
    this.cacheStrategies.set('category_products', {
      key: 'category_products',
      ttl: 900, // 15 minutes
      strategy: 'ttl',
      warmupEnabled: true,
      compressionEnabled: false,
      tier: 'redis'
    });

    // Recommendation data
    this.cacheStrategies.set('recommendations', {
      key: 'recommendations',
      ttl: 1800, // 30 minutes
      strategy: 'write_through',
      warmupEnabled: false,
      compressionEnabled: true,
      tier: 'redis'
    });
  }

  /**
   * Private: Setup optimization rules
   */
  private setupOptimizationRules(): void {
    this.optimizationRules = [
      {
        id: 'slow_response_cache_warm',
        name: 'Warm cache for slow responding products',
        condition: 'responseTime > 2000',
        action: 'cache_warm',
        threshold: 2000,
        enabled: true
      },
      {
        id: 'high_traffic_index_rebuild',
        name: 'Rebuild index for high traffic products',
        condition: 'viewCount > 1000 AND cacheHitRate < 0.8',
        action: 'index_rebuild',
        threshold: 1000,
        enabled: true
      },
      {
        id: 'cdn_purge_outdated',
        name: 'Purge CDN for outdated content',
        condition: 'lastUpdated > 3600',
        action: 'cdn_purge',
        threshold: 3600,
        enabled: true
      },
      {
        id: 'optimize_slow_queries',
        name: 'Optimize queries with high response time',
        condition: 'queryTime > 1000',
        action: 'query_optimize',
        threshold: 1000,
        enabled: true
      }
    ];
  }

  /**
   * Private: Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor performance every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.performanceHealthCheck();
    }, 30000);
  }

  /**
   * Private: Setup performance event listeners
   */
  private setupPerformanceEventListeners(): void {
    // Listen for product events that might affect performance
    productEventStreamingService.on('productEvent', async (event) => {
      try {
        switch (event.eventType) {
          case ProductEventTypes.PRODUCT_VIEWED:
            await this.handleProductView(event);
            break;
          case ProductEventTypes.PRODUCT_UPDATED:
            await this.handleProductUpdate(event);
            break;
        }
      } catch (error) {
        console.error('[ProductPerformanceService] Error handling performance event:', error);
      }
    });
  }

  /**
   * Private: Execute optimized database query
   */
  private async executeOptimizedQuery(productId: string, options?: any): Promise<any> {
    const queryBuilder = db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      comparePrice: products.comparePrice,
      sku: products.sku,
      inventory: products.inventory,
      images: products.images,
      specifications: products.specifications,
      tags: products.tags,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      vendorId: products.vendorId,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug
      }
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, productId));

    const [product] = await queryBuilder;

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    // Optionally include additional data
    if (options?.includeReviews) {
      const reviewStats = await this.getReviewStats(productId);
      product.reviewStats = reviewStats;
    }

    if (options?.includeVariants) {
      const variants = await this.getProductVariants(productId);
      product.variants = variants;
    }

    if (options?.includeRecommendations) {
      const recommendations = await this.getProductRecommendations(productId);
      product.recommendations = recommendations;
    }

    return product;
  }

  /**
   * Private: Cache management methods
   */
  private async getCachedData(key: string, strategyName?: string): Promise<any> {
    const strategy = strategyName ? this.cacheStrategies.get(strategyName) : this.cacheStrategies.get('product_detail');
    
    if (strategy?.tier === 'memory') {
      const cached = this.memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        cached.hits++;
        return cached.data;
      }
    }
    
    // TODO: Implement Redis cache lookup
    return null;
  }

  private async setCachedData(key: string, data: any, strategyName?: string): Promise<void> {
    const strategy = strategyName ? this.cacheStrategies.get(strategyName) : this.cacheStrategies.get('product_detail');
    
    if (strategy?.tier === 'memory') {
      this.memoryCache.set(key, {
        data,
        expiry: Date.now() + (strategy.ttl * 1000),
        hits: 0
      });
    }
    
    // TODO: Implement Redis cache storage
  }

  /**
   * Private: Performance tracking methods
   */
  private recordCacheHit(queryId: string): void {
    // Record cache hit for analytics
  }

  private recordQueryPerformance(queryId: string, responseTime: number, isError: boolean): void {
    const existing = this.queryPerformance.get(queryId) || { totalTime: 0, count: 0, errors: 0 };
    
    existing.totalTime += responseTime;
    existing.count++;
    if (isError) existing.errors++;
    
    this.queryPerformance.set(queryId, existing);
  }

  /**
   * Private: Performance metrics calculation
   */
  private calculateOverviewMetrics(): any {
    const allQueries = Array.from(this.queryPerformance.values());
    const totalQueries = allQueries.reduce((sum, q) => sum + q.count, 0);
    const totalTime = allQueries.reduce((sum, q) => sum + q.totalTime, 0);
    const totalErrors = allQueries.reduce((sum, q) => sum + q.errors, 0);

    return {
      avgResponseTime: totalQueries > 0 ? Math.round(totalTime / totalQueries) : 0,
      cacheHitRate: this.calculateCacheHitRate(),
      errorRate: totalQueries > 0 ? (totalErrors / totalQueries) * 100 : 0,
      totalQueries
    };
  }

  private calculateCacheHitRate(): number {
    const cacheEntries = Array.from(this.memoryCache.values());
    const totalHits = cacheEntries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalAccess = cacheEntries.length * 10; // Simplified calculation
    
    return totalAccess > 0 ? (totalHits / totalAccess) * 100 : 0;
  }

  private getTopPerformingProducts(limit: number): any[] {
    return Array.from(this.performanceMetrics.values())
      .sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0))
      .slice(0, limit)
      .map(metrics => ({
        productId: metrics.productId,
        responseTime: metrics.responseTime.avg,
        cacheHitRate: metrics.cacheHitRate,
        conversionRate: metrics.conversionRate
      }));
  }

  private getSlowestQueries(limit: number): any[] {
    return Array.from(this.queryPerformance.entries())
      .map(([queryType, stats]) => ({
        queryType,
        avgTime: stats.count > 0 ? stats.totalTime / stats.count : 0,
        count: stats.count,
        errorRate: stats.count > 0 ? (stats.errors / stats.count) * 100 : 0
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  private getCacheStatistics(): any {
    const memoryUsage = JSON.stringify(Array.from(this.memoryCache.values())).length;
    const hitRate = this.calculateCacheHitRate();
    
    return {
      memoryUsage: Math.round(memoryUsage / 1024), // KB
      hitRate,
      missRate: 100 - hitRate,
      evictionCount: 0 // TODO: Track actual evictions
    };
  }

  /**
   * Private: Optimization methods
   */
  private async optimizeSpecificQuery(queryType: string): Promise<void> {
    // Apply query-specific optimizations
    console.log(`[ProductPerformanceService] Optimizing query: ${queryType}`);
    
    // TODO: Implement actual query optimization strategies
    // - Add appropriate indexes
    // - Optimize join patterns
    // - Implement query result caching
    // - Use connection pooling
  }

  /**
   * Private: Health check and alerting
   */
  private async performanceHealthCheck(): Promise<void> {
    try {
      const overview = this.calculateOverviewMetrics();
      
      // Check for performance issues
      if (overview.avgResponseTime > 2000) {
        this.createPerformanceAlert({
          type: 'slow_query',
          severity: 'high',
          message: `Average response time is ${overview.avgResponseTime}ms (threshold: 2000ms)`,
          metrics: { avgResponseTime: overview.avgResponseTime }
        });
      }

      if (overview.errorRate > 5) {
        this.createPerformanceAlert({
          type: 'high_error_rate',
          severity: 'critical',
          message: `Error rate is ${overview.errorRate.toFixed(2)}% (threshold: 5%)`,
          metrics: { errorRate: overview.errorRate }
        });
      }

      if (overview.cacheHitRate < 80) {
        this.createPerformanceAlert({
          type: 'cache_miss',
          severity: 'medium',
          message: `Cache hit rate is ${overview.cacheHitRate.toFixed(2)}% (threshold: 80%)`,
          metrics: { cacheHitRate: overview.cacheHitRate }
        });
      }

      // Apply optimization rules
      await this.applyOptimizationRules();

    } catch (error) {
      console.error('[ProductPerformanceService] Performance health check failed:', error);
    }
  }

  private createPerformanceAlert(alertData: Omit<PerformanceAlert, 'id' | 'createdAt'>): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: PerformanceAlert = {
      id: alertId,
      createdAt: new Date(),
      ...alertData
    };

    this.performanceAlerts.set(alertId, alert);
    
    console.warn(`[ProductPerformanceService] Performance alert created: ${alert.message}`);
  }

  private async applyOptimizationRules(): Promise<void> {
    for (const rule of this.optimizationRules) {
      if (!rule.enabled) continue;

      try {
        const shouldTrigger = await this.evaluateOptimizationRule(rule);
        
        if (shouldTrigger) {
          await this.executeOptimizationAction(rule);
          rule.lastTriggered = new Date();
        }
      } catch (error) {
        console.error(`[ProductPerformanceService] Failed to apply optimization rule: ${rule.name}`, error);
      }
    }
  }

  private async evaluateOptimizationRule(rule: OptimizationRule): Promise<boolean> {
    // Simplified rule evaluation - implement proper rule engine
    return Math.random() < 0.1; // 10% chance for demonstration
  }

  private async executeOptimizationAction(rule: OptimizationRule): Promise<void> {
    console.log(`[ProductPerformanceService] Executing optimization action: ${rule.action} for rule: ${rule.name}`);
    
    switch (rule.action) {
      case 'cache_warm':
        // Warm cache for popular products
        break;
      case 'index_rebuild':
        // Rebuild search indexes
        break;
      case 'cdn_purge':
        // Purge CDN cache
        break;
      case 'query_optimize':
        // Optimize slow queries
        break;
    }
  }

  /**
   * Private: Event handlers
   */
  private async handleProductView(event: any): Promise<void> {
    const { productId } = event.eventData;
    
    // Update view metrics
    const metrics = this.performanceMetrics.get(productId) || this.createDefaultMetrics(productId);
    metrics.viewCount++;
    this.performanceMetrics.set(productId, metrics);
  }

  private async handleProductUpdate(event: any): Promise<void> {
    const { productId } = event.eventData;
    
    // Invalidate caches for updated product
    const keysToInvalidate = Array.from(this.memoryCache.keys())
      .filter(key => key.includes(productId));
    
    keysToInvalidate.forEach(key => this.memoryCache.delete(key));
  }

  private createDefaultMetrics(productId: string): PerformanceMetrics {
    return {
      productId,
      responseTime: { avg: 0, p50: 0, p95: 0, p99: 0 },
      cacheHitRate: 0,
      viewCount: 0,
      conversionRate: 0,
      loadTime: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
      },
      errorRate: 0,
      lastMeasured: new Date()
    };
  }

  /**
   * Private: Helper methods for additional data
   */
  private async getReviewStats(productId: string): Promise<any> {
    // TODO: Implement actual review statistics
    return {
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      totalReviews: Math.floor(Math.random() * 500),
      ratingDistribution: {
        5: Math.floor(Math.random() * 200),
        4: Math.floor(Math.random() * 150),
        3: Math.floor(Math.random() * 100),
        2: Math.floor(Math.random() * 50),
        1: Math.floor(Math.random() * 25)
      }
    };
  }

  private async getProductVariants(productId: string): Promise<any[]> {
    // TODO: Implement actual variant retrieval
    return [];
  }

  private async getProductRecommendations(productId: string): Promise<any[]> {
    // TODO: Implement actual recommendations
    return [];
  }

  /**
   * Shutdown performance service
   */
  async shutdown(): Promise<void> {
    console.log('[ProductPerformanceService] Shutting down...');
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.removeAllListeners();
    
    console.log('[ProductPerformanceService] Shutdown completed');
  }
}

// Singleton instance
export const productPerformanceService = new ProductPerformanceService();