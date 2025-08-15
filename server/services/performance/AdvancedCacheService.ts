/**
 * Advanced Cache Service - Phase 3 Implementation
 * Multi-tier cache architecture with Amazon.com-level performance
 * 
 * @fileoverview Enterprise-grade caching system with L1-L4 cache tiers
 * @author GetIt Platform Team
 * @version 3.0.0
 * @since Phase 3 Performance & Analytics Implementation
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  size: number;
  compressed: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalSize: number;
  avgResponseTime: number;
  hitRate: number;
}

interface CacheMetrics {
  l1: CacheStats;
  l2: CacheStats;
  l3: CacheStats;
  l4: CacheStats;
  overall: CacheStats;
  performance: {
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
    throughput: number;
  };
}

interface CacheConfig {
  l1: {
    maxSize: number;
    ttl: number;
    maxEntries: number;
  };
  l2: {
    maxSize: number;
    ttl: number;
    maxEntries: number;
  };
  l3: {
    maxSize: number;
    ttl: number;
    maxEntries: number;
  };
  l4: {
    maxSize: number;
    ttl: number;
    maxEntries: number;
  };
  compression: {
    enabled: boolean;
    threshold: number;
    algorithm: 'gzip' | 'deflate' | 'br';
  };
  eviction: {
    policy: 'lru' | 'lfu' | 'ttl' | 'random';
    batchSize: number;
  };
  monitoring: {
    metricsInterval: number;
    alertThresholds: {
      hitRate: number;
      latency: number;
      errorRate: number;
    };
  };
}

export class AdvancedCacheService extends EventEmitter {
  private l1Cache = new Map<string, CacheEntry>(); // In-memory hot cache
  private l2Cache = new Map<string, CacheEntry>(); // Distributed cache simulation
  private l3Cache = new Map<string, CacheEntry>(); // CDN edge cache simulation
  private l4Cache = new Map<string, CacheEntry>(); // Database query cache

  private stats: CacheMetrics;
  private config: CacheConfig;
  private metricsInterval: NodeJS.Timeout | null = null;
  private compressionEnabled: boolean = true;

  constructor(config?: Partial<CacheConfig>) {
    super();
    
    this.config = {
      l1: {
        maxSize: 50 * 1024 * 1024, // 50MB
        ttl: 5 * 60 * 1000, // 5 minutes
        maxEntries: 10000
      },
      l2: {
        maxSize: 200 * 1024 * 1024, // 200MB
        ttl: 30 * 60 * 1000, // 30 minutes
        maxEntries: 50000
      },
      l3: {
        maxSize: 500 * 1024 * 1024, // 500MB
        ttl: 2 * 60 * 60 * 1000, // 2 hours
        maxEntries: 100000
      },
      l4: {
        maxSize: 1024 * 1024 * 1024, // 1GB
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        maxEntries: 500000
      },
      compression: {
        enabled: true,
        threshold: 1024, // 1KB
        algorithm: 'gzip'
      },
      eviction: {
        policy: 'lru',
        batchSize: 100
      },
      monitoring: {
        metricsInterval: 30000, // 30 seconds
        alertThresholds: {
          hitRate: 0.85, // 85%
          latency: 10, // 10ms
          errorRate: 0.01 // 1%
        }
      },
      ...config
    };

    this.initializeStats();
    this.startMetricsCollection();
  }

  /**
   * Initialize cache statistics
   */
  private initializeStats(): void {
    const emptyStats: CacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: 0,
      avgResponseTime: 0,
      hitRate: 0
    };

    this.stats = {
      l1: { ...emptyStats },
      l2: { ...emptyStats },
      l3: { ...emptyStats },
      l4: { ...emptyStats },
      overall: { ...emptyStats },
      performance: {
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        throughput: 0
      }
    };
  }

  /**
   * Get value from cache with multi-tier lookup
   */
  async get<T = any>(key: string, tags?: string[]): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      // L1 Cache (Hot Memory)
      let result = await this.getFromTier('l1', key);
      if (result !== null) {
        this.updateStats('l1', 'hit', performance.now() - startTime);
        return result as T;
      }

      // L2 Cache (Distributed)
      result = await this.getFromTier('l2', key);
      if (result !== null) {
        // Promote to L1
        await this.setToTier('l1', key, result, this.config.l1.ttl, tags);
        this.updateStats('l2', 'hit', performance.now() - startTime);
        return result as T;
      }

      // L3 Cache (CDN Edge)
      result = await this.getFromTier('l3', key);
      if (result !== null) {
        // Promote to L1 and L2
        await this.setToTier('l1', key, result, this.config.l1.ttl, tags);
        await this.setToTier('l2', key, result, this.config.l2.ttl, tags);
        this.updateStats('l3', 'hit', performance.now() - startTime);
        return result as T;
      }

      // L4 Cache (Database Query)
      result = await this.getFromTier('l4', key);
      if (result !== null) {
        // Promote to all upper tiers
        await this.setToTier('l1', key, result, this.config.l1.ttl, tags);
        await this.setToTier('l2', key, result, this.config.l2.ttl, tags);
        await this.setToTier('l3', key, result, this.config.l3.ttl, tags);
        this.updateStats('l4', 'hit', performance.now() - startTime);
        return result as T;
      }

      // Cache miss
      this.updateStats('overall', 'miss', performance.now() - startTime);
      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      this.emit('error', { operation: 'get', key, error });
      return null;
    }
  }

  /**
   * Set value in cache with write-through strategy
   */
  async set<T = any>(key: string, value: T, ttl?: number, tags?: string[]): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      const defaultTtl = this.config.l1.ttl;
      const actualTtl = ttl || defaultTtl;

      // Write-through to all tiers based on value importance/size
      const serializedSize = this.calculateSize(value);
      
      // Always write to L1 (hot cache)
      await this.setToTier('l1', key, value, actualTtl, tags);
      
      // Write to L2 if value is moderately important
      if (serializedSize < this.config.l2.maxSize / 1000) {
        await this.setToTier('l2', key, value, this.config.l2.ttl, tags);
      }
      
      // Write to L3 for larger values or longer TTL
      if (actualTtl > this.config.l1.ttl) {
        await this.setToTier('l3', key, value, this.config.l3.ttl, tags);
      }
      
      // Write to L4 for persistent data
      if (actualTtl > this.config.l2.ttl) {
        await this.setToTier('l4', key, value, this.config.l4.ttl, tags);
      }

      this.updateStats('overall', 'set', performance.now() - startTime);
      this.emit('set', { key, size: serializedSize, tiers: ['l1', 'l2', 'l3', 'l4'] });
      
      return true;

    } catch (error) {
      console.error('Cache set error:', error);
      this.emit('error', { operation: 'set', key, error });
      return false;
    }
  }

  /**
   * Delete from all cache tiers
   */
  async delete(key: string): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      const results = await Promise.all([
        this.deleteFromTier('l1', key),
        this.deleteFromTier('l2', key),
        this.deleteFromTier('l3', key),
        this.deleteFromTier('l4', key)
      ]);

      this.updateStats('overall', 'delete', performance.now() - startTime);
      this.emit('delete', { key, success: results.every(r => r) });
      
      return results.every(r => r);

    } catch (error) {
      console.error('Cache delete error:', error);
      this.emit('error', { operation: 'delete', key, error });
      return false;
    }
  }

  /**
   * Clear cache by tags
   */
  async clearByTags(tags: string[]): Promise<number> {
    let deletedCount = 0;
    
    const tiers = [
      { name: 'l1', cache: this.l1Cache },
      { name: 'l2', cache: this.l2Cache },
      { name: 'l3', cache: this.l3Cache },
      { name: 'l4', cache: this.l4Cache }
    ];

    for (const tier of tiers) {
      for (const [key, entry] of tier.cache.entries()) {
        if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
          tier.cache.delete(key);
          deletedCount++;
        }
      }
    }

    this.emit('clearByTags', { tags, deletedCount });
    return deletedCount;
  }

  /**
   * Get from specific cache tier
   */
  private async getFromTier(tier: 'l1' | 'l2' | 'l3' | 'l4', key: string): Promise<any> {
    const cache = this.getTierCache(tier);
    const entry = cache.get(key);
    
    if (!entry) {
      this.updateStats(tier, 'miss', 0);
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      this.updateStats(tier, 'miss', 0);
      return null;
    }

    // Update access metrics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.compressed ? this.decompress(entry.value) : entry.value;
  }

  /**
   * Set to specific cache tier
   */
  private async setToTier(
    tier: 'l1' | 'l2' | 'l3' | 'l4', 
    key: string, 
    value: any, 
    ttl: number, 
    tags?: string[]
  ): Promise<boolean> {
    const cache = this.getTierCache(tier);
    const config = this.config[tier];
    
    // Check if cache is full
    if (cache.size >= config.maxEntries) {
      await this.evictFromTier(tier);
    }

    const serializedSize = this.calculateSize(value);
    const shouldCompress = this.compressionEnabled && 
                          serializedSize > this.config.compression.threshold;
    
    const entry: CacheEntry = {
      value: shouldCompress ? this.compress(value) : value,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      tags: tags || [],
      size: serializedSize,
      compressed: shouldCompress
    };

    cache.set(key, entry);
    this.updateStats(tier, 'set', 0);
    
    return true;
  }

  /**
   * Delete from specific cache tier
   */
  private async deleteFromTier(tier: 'l1' | 'l2' | 'l3' | 'l4', key: string): Promise<boolean> {
    const cache = this.getTierCache(tier);
    const deleted = cache.delete(key);
    
    if (deleted) {
      this.updateStats(tier, 'delete', 0);
    }
    
    return deleted;
  }

  /**
   * Evict entries from cache tier
   */
  private async evictFromTier(tier: 'l1' | 'l2' | 'l3' | 'l4'): Promise<void> {
    const cache = this.getTierCache(tier);
    const policy = this.config.eviction.policy;
    const batchSize = this.config.eviction.batchSize;

    const entries = Array.from(cache.entries());
    let toEvict: string[] = [];

    switch (policy) {
      case 'lru':
        toEvict = entries
          .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
          .slice(0, batchSize)
          .map(([key]) => key);
        break;
        
      case 'lfu':
        toEvict = entries
          .sort(([, a], [, b]) => a.accessCount - b.accessCount)
          .slice(0, batchSize)
          .map(([key]) => key);
        break;
        
      case 'ttl':
        toEvict = entries
          .sort(([, a], [, b]) => 
            (a.timestamp + a.ttl) - (b.timestamp + b.ttl))
          .slice(0, batchSize)
          .map(([key]) => key);
        break;
        
      case 'random':
        toEvict = entries
          .sort(() => Math.random() - 0.5)
          .slice(0, batchSize)
          .map(([key]) => key);
        break;
    }

    for (const key of toEvict) {
      cache.delete(key);
      this.updateStats(tier, 'eviction', 0);
    }
  }

  /**
   * Get cache tier map
   */
  private getTierCache(tier: 'l1' | 'l2' | 'l3' | 'l4'): Map<string, CacheEntry> {
    switch (tier) {
      case 'l1': return this.l1Cache;
      case 'l2': return this.l2Cache;
      case 'l3': return this.l3Cache;
      case 'l4': return this.l4Cache;
      default: return this.l1Cache;
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(
    tier: 'l1' | 'l2' | 'l3' | 'l4' | 'overall', 
    operation: 'hit' | 'miss' | 'set' | 'delete' | 'eviction',
    responseTime: number
  ): void {
    const stats = this.stats[tier];
    
    switch (operation) {
      case 'hit':
        stats.hits++;
        break;
      case 'miss':
        stats.misses++;
        break;
      case 'set':
        stats.sets++;
        break;
      case 'delete':
        stats.deletes++;
        break;
      case 'eviction':
        stats.evictions++;
        break;
    }

    // Update hit rate
    const total = stats.hits + stats.misses;
    stats.hitRate = total > 0 ? stats.hits / total : 0;

    // Update average response time
    if (responseTime > 0) {
      stats.avgResponseTime = (stats.avgResponseTime + responseTime) / 2;
    }
  }

  /**
   * Calculate object size
   */
  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2; // Rough UTF-16 byte size
    } catch {
      return 1024; // Default size if serialization fails
    }
  }

  /**
   * Compress value (simplified)
   */
  private compress(value: any): any {
    // In production, use actual compression library
    return { __compressed: true, data: JSON.stringify(value) };
  }

  /**
   * Decompress value (simplified)
   */
  private decompress(value: any): any {
    // In production, use actual decompression
    if (value.__compressed) {
      return JSON.parse(value.data);
    }
    return value;
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectAndEmitMetrics();
    }, this.config.monitoring.metricsInterval);
  }

  /**
   * Collect and emit metrics
   */
  private collectAndEmitMetrics(): void {
    const metrics = this.getMetrics();
    
    // Check alert thresholds
    if (metrics.overall.hitRate < this.config.monitoring.alertThresholds.hitRate) {
      this.emit('alert', {
        type: 'low_hit_rate',
        value: metrics.overall.hitRate,
        threshold: this.config.monitoring.alertThresholds.hitRate
      });
    }

    if (metrics.performance.avgLatency > this.config.monitoring.alertThresholds.latency) {
      this.emit('alert', {
        type: 'high_latency',
        value: metrics.performance.avgLatency,
        threshold: this.config.monitoring.alertThresholds.latency
      });
    }

    this.emit('metrics', metrics);
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return JSON.parse(JSON.stringify(this.stats));
  }

  /**
   * Get cache health status
   */
  getHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  } {
    const metrics = this.getMetrics();
    const hitRate = metrics.overall.hitRate;
    const latency = metrics.performance.avgLatency;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (hitRate < 0.7 || latency > 50) {
      status = 'unhealthy';
    } else if (hitRate < 0.85 || latency > 10) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        hitRate,
        latency,
        totalEntries: this.l1Cache.size + this.l2Cache.size + this.l3Cache.size + this.l4Cache.size,
        tiers: {
          l1: this.l1Cache.size,
          l2: this.l2Cache.size,
          l3: this.l3Cache.size,
          l4: this.l4Cache.size
        }
      }
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    this.l1Cache.clear();
    this.l2Cache.clear();
    this.l3Cache.clear();
    this.l4Cache.clear();

    this.emit('shutdown');
  }
}

export default AdvancedCacheService;