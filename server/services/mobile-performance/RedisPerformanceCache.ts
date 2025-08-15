/**
 * PHASE 4: REDIS PERFORMANCE CACHE SERVICE
 * Advanced caching strategies for mobile optimization
 * Investment: $20,000 | Week 1-2: Mobile & Performance Excellence
 * Date: July 26, 2025
 */

import { z } from 'zod';
import Redis from 'ioredis';

// Cache Configuration Schema
const CacheConfigSchema = z.object({
  redisUrl: z.string(),
  keyPrefix: z.string(),
  defaultTTL: z.number(),
  maxMemory: z.string(),
  evictionPolicy: z.enum(['allkeys-lru', 'volatile-lru', 'allkeys-lfu', 'volatile-lfu']),
  compression: z.boolean(),
  clustering: z.boolean(),
  monitoring: z.boolean()
});

// Performance Cache Metrics
interface CacheMetrics {
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
  readonly avgResponseTime: number;
  readonly memoryUsage: number;
  readonly keyCount: number;
  readonly evictions: number;
  readonly connections: number;
}

// Cache Strategy Configuration
interface CacheStrategy {
  readonly name: string;
  readonly ttl: number;
  readonly maxSize: number;
  readonly compression: boolean;
  readonly warmupKeys: string[];
  readonly invalidationTriggers: string[];
}

// Search Cache Configuration
interface SearchCacheConfig {
  readonly suggestions: CacheStrategy;
  readonly results: CacheStrategy;
  readonly products: CacheStrategy;
  readonly categories: CacheStrategy;
  readonly trending: CacheStrategy;
  readonly recommendations: CacheStrategy;
}

export class RedisPerformanceCache {
  private readonly redis: Redis;
  private readonly config: z.infer<typeof CacheConfigSchema>;
  private readonly cacheMetrics: Map<string, CacheMetrics>;
  private readonly searchCacheConfig: SearchCacheConfig;
  private readonly compressionThreshold: number = 1024; // bytes

  constructor() {
    this.config = this.initializeCacheConfig();
    this.redis = this.initializeRedisClient();
    this.cacheMetrics = new Map();
    this.searchCacheConfig = this.initializeSearchCacheConfig();
    
    this.setupEventListeners();
    this.startMetricsCollection();
  }

  /**
   * Initialize cache configuration
   */
  private initializeCacheConfig(): z.infer<typeof CacheConfigSchema> {
    return {
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      keyPrefix: 'getit:bd:',
      defaultTTL: 3600, // 1 hour
      maxMemory: '256mb',
      evictionPolicy: 'allkeys-lru',
      compression: true,
      clustering: false,
      monitoring: true
    };
  }

  /**
   * Initialize Redis client with performance optimizations
   */
  private initializeRedisClient(): Redis {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: this.config.keyPrefix,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      connectTimeout: 10000,
      commandTimeout: 5000,
      compression: 'gzip'
    };

    const redis = new Redis(redisConfig);

    // Configure Redis for performance
    redis.config('SET', 'maxmemory', this.config.maxMemory);
    redis.config('SET', 'maxmemory-policy', this.config.evictionPolicy);
    redis.config('SET', 'save', ''); // Disable persistence for performance

    return redis;
  }

  /**
   * Initialize search cache configuration
   */
  private initializeSearchCacheConfig(): SearchCacheConfig {
    return {
      suggestions: {
        name: 'search_suggestions',
        ttl: 1800, // 30 minutes
        maxSize: 10000,
        compression: true,
        warmupKeys: ['popular_searches', 'trending_queries'],
        invalidationTriggers: ['product_update', 'category_update']
      },
      results: {
        name: 'search_results',
        ttl: 600, // 10 minutes
        maxSize: 5000,
        compression: true,
        warmupKeys: ['homepage_searches'],
        invalidationTriggers: ['product_update', 'inventory_update']
      },
      products: {
        name: 'product_data',
        ttl: 3600, // 1 hour
        maxSize: 20000,
        compression: true,
        warmupKeys: ['featured_products', 'trending_products'],
        invalidationTriggers: ['product_update', 'price_update']
      },
      categories: {
        name: 'category_data',
        ttl: 7200, // 2 hours
        maxSize: 1000,
        compression: false,
        warmupKeys: ['main_categories', 'popular_categories'],
        invalidationTriggers: ['category_update']
      },
      trending: {
        name: 'trending_data',
        ttl: 300, // 5 minutes
        maxSize: 500,
        compression: true,
        warmupKeys: ['homepage_trending'],
        invalidationTriggers: ['analytics_update']
      },
      recommendations: {
        name: 'recommendations',
        ttl: 1800, // 30 minutes
        maxSize: 15000,
        compression: true,
        warmupKeys: ['popular_recommendations'],
        invalidationTriggers: ['user_behavior_update', 'product_update']
      }
    };
  }

  /**
   * Setup event listeners for cache monitoring
   */
  private setupEventListeners(): void {
    this.redis.on('connect', () => {
      console.log('✅ Redis Performance Cache connected');
    });

    this.redis.on('error', (error) => {
      console.error('❌ Redis Performance Cache error:', error);
    });

    this.redis.on('reconnecting', () => {
      console.log('🔄 Redis Performance Cache reconnecting...');
    });

    this.redis.on('ready', () => {
      console.log('🚀 Redis Performance Cache ready for high-performance operations');
      this.warmupCache();
    });
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    if (!this.config.monitoring) return;

    setInterval(async () => {
      await this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  /**
   * Warmup cache with popular data
   */
  private async warmupCache(): Promise<void> {
    try {
      console.log('🔥 Warming up Redis Performance Cache...');
      
      const warmupPromises = Object.entries(this.searchCacheConfig).map(
        async ([cacheType, config]) => {
          for (const key of config.warmupKeys) {
            // Simulate warmup data loading
            await this.set(`warmup:${cacheType}:${key}`, 'warmed', config.ttl);
          }
        }
      );

      await Promise.all(warmupPromises);
      console.log('✅ Cache warmup completed');
    } catch (error) {
      console.error('❌ Cache warmup failed:', error);
    }
  }

  /**
   * Set value in cache with performance optimizations
   */
  async set(
    key: string, 
    value: any, 
    ttl?: number,
    options: {
      compress?: boolean;
      strategy?: keyof SearchCacheConfig;
    } = {}
  ): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Serialize value
      let serialized = JSON.stringify(value);
      
      // Apply compression if enabled and value is large enough
      if ((options.compress ?? this.config.compression) && 
          serialized.length > this.compressionThreshold) {
        // In production, use actual compression library
        serialized = `compressed:${serialized}`;
      }

      // Use strategy-specific TTL if provided
      const effectiveTTL = ttl || this.getStrategyTTL(options.strategy) || this.config.defaultTTL;
      
      // Set value with expiration
      const result = await this.redis.setex(key, effectiveTTL, serialized);
      
      // Update metrics
      await this.updateSetMetrics(key, Date.now() - startTime);
      
      return result === 'OK';
    } catch (error) {
      console.error(`❌ Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get value from cache with performance tracking
   */
  async get<T = any>(
    key: string,
    options: {
      decompress?: boolean;
      fallback?: () => Promise<T>;
      refreshTTL?: number;
    } = {}
  ): Promise<T | null> {
    try {
      const startTime = Date.now();
      
      // Get value from Redis
      const cached = await this.redis.get(key);
      const responseTime = Date.now() - startTime;
      
      if (cached === null) {
        // Cache miss - update metrics and try fallback
        await this.updateGetMetrics(key, responseTime, false);
        
        if (options.fallback) {
          const fallbackValue = await options.fallback();
          // Store fallback result in cache
          await this.set(key, fallbackValue, options.refreshTTL);
          return fallbackValue;
        }
        
        return null;
      }

      // Cache hit - update metrics
      await this.updateGetMetrics(key, responseTime, true);
      
      // Handle decompression
      let value = cached;
      if ((options.decompress ?? this.config.compression) && 
          cached.startsWith('compressed:')) {
        value = cached.substring(11); // Remove 'compressed:' prefix
      }

      // Parse and return
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`❌ Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Multi-get with performance optimization
   */
  async mget<T = any>(keys: string[]): Promise<Array<T | null>> {
    try {
      const startTime = Date.now();
      
      const values = await this.redis.mget(...keys);
      const responseTime = Date.now() - startTime;
      
      // Update metrics for batch operation
      await this.updateBatchMetrics(keys.length, responseTime);
      
      return values.map(value => {
        if (value === null) return null;
        try {
          // Handle decompression
          let parsedValue = value;
          if (this.config.compression && value.startsWith('compressed:')) {
            parsedValue = value.substring(11);
          }
          return JSON.parse(parsedValue) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error('❌ Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Delete key with metrics tracking
   */
  async del(key: string | string[]): Promise<number> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      const result = await this.redis.del(...keys);
      
      // Update metrics
      await this.updateDeleteMetrics(keys.length);
      
      return result;
    } catch (error) {
      console.error('❌ Redis DEL error:', error);
      return 0;
    }
  }

  /**
   * Increment counter with expiration
   */
  async incr(key: string, ttl?: number): Promise<number> {
    try {
      const pipeline = this.redis.pipeline();
      pipeline.incr(key);
      
      if (ttl) {
        pipeline.expire(key, ttl);
      }
      
      const results = await pipeline.exec();
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      console.error(`❌ Redis INCR error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Cache search suggestions with optimization
   */
  async cacheSearchSuggestions(
    query: string, 
    suggestions: any[], 
    language: string = 'en'
  ): Promise<boolean> {
    const key = `suggestions:${language}:${this.hashQuery(query)}`;
    const config = this.searchCacheConfig.suggestions;
    
    return await this.set(key, {
      query,
      suggestions,
      timestamp: Date.now(),
      language
    }, config.ttl, { strategy: 'suggestions', compress: config.compression });
  }

  /**
   * Get cached search suggestions
   */
  async getCachedSearchSuggestions(
    query: string, 
    language: string = 'en'
  ): Promise<any[] | null> {
    const key = `suggestions:${language}:${this.hashQuery(query)}`;
    const cached = await this.get(key, { 
      decompress: this.searchCacheConfig.suggestions.compression 
    });
    
    return cached?.suggestions || null;
  }

  /**
   * Cache search results with smart invalidation
   */
  async cacheSearchResults(
    query: string,
    results: any[],
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    const key = `results:${this.hashQuery(query)}`;
    const config = this.searchCacheConfig.results;
    
    return await this.set(key, {
      query,
      results,
      metadata,
      timestamp: Date.now(),
      count: results.length
    }, config.ttl, { strategy: 'results', compress: config.compression });
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(query: string): Promise<{
    results: any[];
    metadata: Record<string, any>;
    timestamp: number;
  } | null> {
    const key = `results:${this.hashQuery(query)}`;
    return await this.get(key, { 
      decompress: this.searchCacheConfig.results.compression 
    });
  }

  /**
   * Cache product data with smart updates
   */
  async cacheProduct(productId: string, productData: any): Promise<boolean> {
    const key = `product:${productId}`;
    const config = this.searchCacheConfig.products;
    
    return await this.set(key, {
      ...productData,
      cached_at: Date.now()
    }, config.ttl, { strategy: 'products', compress: config.compression });
  }

  /**
   * Get cached product
   */
  async getCachedProduct(productId: string): Promise<any | null> {
    const key = `product:${productId}`;
    return await this.get(key, { 
      decompress: this.searchCacheConfig.products.compression 
    });
  }

  /**
   * Batch cache products
   */
  async batchCacheProducts(products: Array<{ id: string; data: any }>): Promise<number> {
    const pipeline = this.redis.pipeline();
    const config = this.searchCacheConfig.products;
    
    for (const { id, data } of products) {
      const key = `product:${id}`;
      const serialized = JSON.stringify({
        ...data,
        cached_at: Date.now()
      });
      
      pipeline.setex(key, config.ttl, serialized);
    }
    
    const results = await pipeline.exec();
    return results?.filter(([error]) => !error).length || 0;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(`${this.config.keyPrefix}${pattern}`);
      if (keys.length === 0) return 0;
      
      const deleted = await this.redis.del(...keys);
      console.log(`🗑️ Invalidated ${deleted} cache keys matching pattern: ${pattern}`);
      
      return deleted;
    } catch (error) {
      console.error(`❌ Cache invalidation error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Smart cache invalidation based on triggers
   */
  async smartInvalidate(trigger: string, context: Record<string, any> = {}): Promise<void> {
    const invalidationMap: Record<string, string[]> = {
      'product_update': ['product:*', 'results:*', 'suggestions:*'],
      'category_update': ['category:*', 'suggestions:*'],
      'inventory_update': ['product:*', 'results:*'],
      'price_update': ['product:*', 'results:*'],
      'user_behavior_update': ['recommendations:*'],
      'analytics_update': ['trending:*']
    };

    const patterns = invalidationMap[trigger] || [];
    
    for (const pattern of patterns) {
      await this.invalidateByPattern(pattern);
    }
  }

  /**
   * Get strategy TTL
   */
  private getStrategyTTL(strategy?: keyof SearchCacheConfig): number | undefined {
    if (!strategy) return undefined;
    return this.searchCacheConfig[strategy]?.ttl;
  }

  /**
   * Hash query for consistent keys
   */
  private hashQuery(query: string): string {
    // Simple hash for consistent cache keys
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Update SET operation metrics
   */
  private async updateSetMetrics(key: string, responseTime: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const metricsKey = `metrics:set:${today}`;
    
    await this.redis.pipeline()
      .hincrby(metricsKey, 'operations', 1)
      .hincrby(metricsKey, 'total_time', responseTime)
      .expire(metricsKey, 86400 * 7) // Keep for 7 days
      .exec();
  }

  /**
   * Update GET operation metrics
   */
  private async updateGetMetrics(key: string, responseTime: number, hit: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const metricsKey = `metrics:get:${today}`;
    
    await this.redis.pipeline()
      .hincrby(metricsKey, 'operations', 1)
      .hincrby(metricsKey, 'total_time', responseTime)
      .hincrby(metricsKey, hit ? 'hits' : 'misses', 1)
      .expire(metricsKey, 86400 * 7) // Keep for 7 days
      .exec();
  }

  /**
   * Update batch operation metrics
   */
  private async updateBatchMetrics(keyCount: number, responseTime: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const metricsKey = `metrics:batch:${today}`;
    
    await this.redis.pipeline()
      .hincrby(metricsKey, 'operations', 1)
      .hincrby(metricsKey, 'keys', keyCount)
      .hincrby(metricsKey, 'total_time', responseTime)
      .expire(metricsKey, 86400 * 7) // Keep for 7 days
      .exec();
  }

  /**
   * Update delete operation metrics
   */
  private async updateDeleteMetrics(keyCount: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const metricsKey = `metrics:delete:${today}`;
    
    await this.redis.pipeline()
      .hincrby(metricsKey, 'operations', 1)
      .hincrby(metricsKey, 'keys', keyCount)
      .expire(metricsKey, 86400 * 7) // Keep for 7 days
      .exec();
  }

  /**
   * Collect comprehensive cache metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const info = await this.redis.info('memory');
      const stats = await this.redis.info('stats');
      
      // Parse Redis info
      const memoryUsed = this.parseRedisInfo(info, 'used_memory');
      const keyspaceHits = this.parseRedisInfo(stats, 'keyspace_hits');
      const keyspaceMisses = this.parseRedisInfo(stats, 'keyspace_misses');
      const connectedClients = this.parseRedisInfo(stats, 'connected_clients');
      
      const totalRequests = keyspaceHits + keyspaceMisses;
      const hitRate = totalRequests > 0 ? keyspaceHits / totalRequests : 0;

      const metrics: CacheMetrics = {
        hits: keyspaceHits,
        misses: keyspaceMisses,
        hitRate,
        avgResponseTime: 0, // Calculated from custom metrics
        memoryUsage: memoryUsed,
        keyCount: await this.redis.dbsize(),
        evictions: this.parseRedisInfo(stats, 'evicted_keys'),
        connections: connectedClients
      };

      const today = new Date().toISOString().split('T')[0];
      this.cacheMetrics.set(today, metrics);
      
      // Store metrics in Redis for monitoring
      await this.redis.hmset(`system:metrics:${today}`, {
        hits: metrics.hits,
        misses: metrics.misses,
        hit_rate: metrics.hitRate.toFixed(4),
        memory_usage: metrics.memoryUsage,
        key_count: metrics.keyCount,
        connections: metrics.connections,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Failed to collect cache metrics:', error);
    }
  }

  /**
   * Parse Redis INFO output
   */
  private parseRedisInfo(info: string, key: string): number {
    const match = info.match(new RegExp(`${key}:(\\d+)`));
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get current cache metrics
   */
  getCacheMetrics(date?: string): CacheMetrics | null {
    const key = date || new Date().toISOString().split('T')[0];
    return this.cacheMetrics.get(key) || null;
  }

  /**
   * Get cache configuration
   */
  getCacheConfig(): z.infer<typeof CacheConfigSchema> {
    return this.config;
  }

  /**
   * Get search cache configuration
   */
  getSearchCacheConfig(): SearchCacheConfig {
    return this.searchCacheConfig;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    connected: boolean;
    latency: number;
    memoryUsage: number;
    keyCount: number;
  }> {
    try {
      const startTime = Date.now();
      await this.redis.ping();
      const latency = Date.now() - startTime;
      
      const info = await this.redis.info('memory');
      const memoryUsage = this.parseRedisInfo(info, 'used_memory');
      const keyCount = await this.redis.dbsize();

      return {
        connected: true,
        latency,
        memoryUsage,
        keyCount
      };
    } catch (error) {
      return {
        connected: false,
        latency: -1,
        memoryUsage: -1,
        keyCount: -1
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down Redis Performance Cache...');
      await this.redis.quit();
      console.log('✅ Redis Performance Cache shutdown complete');
    } catch (error) {
      console.error('❌ Error during Redis shutdown:', error);
      this.redis.disconnect();
    }
  }
}

// Export singleton instance
export const redisCache = new RedisPerformanceCache();