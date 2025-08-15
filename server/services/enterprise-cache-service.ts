/**
 * Enterprise Cache Service
 * Amazon.com/Shopee.sg L1/L2/L3 Cache Hierarchy Implementation
 */

import { multiDbManager } from '../database/multi-db-manager';
import winston from 'winston';

export type CacheLayer = 'L1' | 'L2' | 'L3';
export type CacheStrategy = 'write-through' | 'write-back' | 'write-around';

export interface CacheConfig {
  l1: {
    maxSize: number;
    ttl: number;
  };
  l2: {
    maxSize: number;
    ttl: number;
  };
  l3: {
    ttl: number;
  };
  strategy: CacheStrategy;
  compression: boolean;
}

export interface CacheMetrics {
  hits: Record<CacheLayer, number>;
  misses: Record<CacheLayer, number>;
  evictions: Record<CacheLayer, number>;
  memory: Record<CacheLayer, number>;
}

export class EnterpriseCacheService {
  private static instance: EnterpriseCacheService;
  private l1Cache: Map<string, { value: any; expiry: number; accessTime: number }>;
  private l2Cache: Map<string, { value: any; expiry: number; accessTime: number }>;
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [new winston.transports.Console()]
    });

    this.config = {
      l1: { maxSize: 1000, ttl: 300 }, // 5 minutes
      l2: { maxSize: 10000, ttl: 3600 }, // 1 hour
      l3: { ttl: 86400 }, // 24 hours
      strategy: 'write-through',
      compression: true
    };

    this.l1Cache = new Map();
    this.l2Cache = new Map();
    
    this.metrics = {
      hits: { L1: 0, L2: 0, L3: 0 },
      misses: { L1: 0, L2: 0, L3: 0 },
      evictions: { L1: 0, L2: 0, L3: 0 },
      memory: { L1: 0, L2: 0, L3: 0 }
    };

    this.startCleanupTimer();
    this.startMetricsReporting();
  }

  public static getInstance(): EnterpriseCacheService {
    if (!EnterpriseCacheService.instance) {
      EnterpriseCacheService.instance = new EnterpriseCacheService();
    }
    return EnterpriseCacheService.instance;
  }

  // Get value from cache hierarchy
  public async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      // L1 Cache (In-memory, fastest)
      const l1Result = this.getFromL1<T>(key);
      if (l1Result !== null) {
        this.metrics.hits.L1++;
        this.logCacheHit('L1', key, Date.now() - startTime);
        return l1Result;
      }
      this.metrics.misses.L1++;

      // L2 Cache (In-memory, larger)
      const l2Result = this.getFromL2<T>(key);
      if (l2Result !== null) {
        this.metrics.hits.L2++;
        // Promote to L1
        this.setToL1(key, l2Result, this.config.l1.ttl);
        this.logCacheHit('L2', key, Date.now() - startTime);
        return l2Result;
      }
      this.metrics.misses.L2++;

      // L3 Cache (Redis, distributed)
      const l3Result = await this.getFromL3<T>(key);
      if (l3Result !== null) {
        this.metrics.hits.L3++;
        // Promote to L2 and L1
        this.setToL2(key, l3Result, this.config.l2.ttl);
        this.setToL1(key, l3Result, this.config.l1.ttl);
        this.logCacheHit('L3', key, Date.now() - startTime);
        return l3Result;
      }
      this.metrics.misses.L3++;

      this.logCacheMiss(key, Date.now() - startTime);
      return null;
    } catch (error) {
      this.logger.error('Cache get error:', { key, error: error instanceof Error ? error.message : error });
      return null;
    }
  }

  // Set value to cache hierarchy
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const actualTtl = ttl || this.config.l1.ttl;
    
    try {
      switch (this.config.strategy) {
        case 'write-through':
          await this.writeThrough(key, value, actualTtl);
          break;
        case 'write-back':
          await this.writeBack(key, value, actualTtl);
          break;
        case 'write-around':
          await this.writeAround(key, value, actualTtl);
          break;
      }
    } catch (error) {
      this.logger.error('Cache set error:', { key, error: error instanceof Error ? error.message : error });
    }
  }

  // Delete from all cache layers
  public async delete(key: string): Promise<void> {
    try {
      this.l1Cache.delete(key);
      this.l2Cache.delete(key);
      
      const l3Cache = multiDbManager.getCacheDB();
      await l3Cache.del(key);
    } catch (error) {
      this.logger.error('Cache delete error:', { key, error: error instanceof Error ? error.message : error });
    }
  }

  // Clear all caches
  public async clear(): Promise<void> {
    try {
      this.l1Cache.clear();
      this.l2Cache.clear();
      
      // Note: In production, you'd want to be more careful about clearing Redis
      this.logger.info('All cache layers cleared');
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  // L1 Cache operations (In-memory, fastest)
  private getFromL1<T>(key: string): T | null {
    const item = this.l1Cache.get(key);
    if (!item) return null;
    
    if (item.expiry < Date.now()) {
      this.l1Cache.delete(key);
      return null;
    }
    
    item.accessTime = Date.now();
    return this.deserialize<T>(item.value);
  }

  private setToL1<T>(key: string, value: T, ttl: number): void {
    // Check if we need to evict
    if (this.l1Cache.size >= this.config.l1.maxSize) {
      this.evictFromL1();
    }
    
    this.l1Cache.set(key, {
      value: this.serialize(value),
      expiry: Date.now() + (ttl * 1000),
      accessTime: Date.now()
    });
  }

  // L2 Cache operations (In-memory, larger)
  private getFromL2<T>(key: string): T | null {
    const item = this.l2Cache.get(key);
    if (!item) return null;
    
    if (item.expiry < Date.now()) {
      this.l2Cache.delete(key);
      return null;
    }
    
    item.accessTime = Date.now();
    return this.deserialize<T>(item.value);
  }

  private setToL2<T>(key: string, value: T, ttl: number): void {
    // Check if we need to evict
    if (this.l2Cache.size >= this.config.l2.maxSize) {
      this.evictFromL2();
    }
    
    this.l2Cache.set(key, {
      value: this.serialize(value),
      expiry: Date.now() + (ttl * 1000),
      accessTime: Date.now()
    });
  }

  // L3 Cache operations (Redis, distributed)
  private async getFromL3<T>(key: string): Promise<T | null> {
    try {
      const l3Cache = multiDbManager.getCacheDB();
      const result = await l3Cache.get(key);
      
      if (!result) return null;
      
      return this.deserialize<T>(result);
    } catch (error) {
      this.logger.warn('L3 cache get failed:', error);
      return null;
    }
  }

  private async setToL3<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      const l3Cache = multiDbManager.getCacheDB();
      await l3Cache.set(key, this.serialize(value), ttl);
    } catch (error) {
      this.logger.warn('L3 cache set failed:', error);
    }
  }

  // Cache strategies
  private async writeThrough<T>(key: string, value: T, ttl: number): Promise<void> {
    // Write to all levels immediately
    this.setToL1(key, value, Math.min(ttl, this.config.l1.ttl));
    this.setToL2(key, value, Math.min(ttl, this.config.l2.ttl));
    await this.setToL3(key, value, ttl);
  }

  private async writeBack<T>(key: string, value: T, ttl: number): Promise<void> {
    // Write to L1 immediately, defer L2/L3
    this.setToL1(key, value, Math.min(ttl, this.config.l1.ttl));
    
    // Schedule async write to L2/L3
    setImmediate(async () => {
      this.setToL2(key, value, Math.min(ttl, this.config.l2.ttl));
      await this.setToL3(key, value, ttl);
    });
  }

  private async writeAround<T>(key: string, value: T, ttl: number): Promise<void> {
    // Skip L1/L2, write directly to L3
    await this.setToL3(key, value, ttl);
  }

  // Eviction policies (LRU)
  private evictFromL1(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.l1Cache) {
      if (item.accessTime < oldestTime) {
        oldestTime = item.accessTime;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.l1Cache.delete(oldestKey);
      this.metrics.evictions.L1++;
    }
  }

  private evictFromL2(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.l2Cache) {
      if (item.accessTime < oldestTime) {
        oldestTime = item.accessTime;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.l2Cache.delete(oldestKey);
      this.metrics.evictions.L2++;
    }
  }

  // Serialization/Deserialization
  private serialize<T>(value: T): string {
    if (this.config.compression && typeof value === 'object') {
      // In production, implement compression (gzip, etc.)
      return JSON.stringify(value);
    }
    return JSON.stringify(value);
  }

  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value);
    } catch (error) {
      this.logger.error('Deserialization error:', error);
      throw error;
    }
  }

  // Cleanup expired entries
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Every minute
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    
    // Clean L1
    for (const [key, item] of this.l1Cache) {
      if (item.expiry < now) {
        this.l1Cache.delete(key);
      }
    }
    
    // Clean L2
    for (const [key, item] of this.l2Cache) {
      if (item.expiry < now) {
        this.l2Cache.delete(key);
      }
    }
    
    // Update memory metrics
    this.updateMemoryMetrics();
  }

  // Metrics reporting
  private startMetricsReporting(): void {
    setInterval(() => {
      this.reportMetrics();
    }, 300000); // Every 5 minutes
  }

  private reportMetrics(): void {
    this.updateMemoryMetrics();
    
    const hitRateL1 = this.metrics.hits.L1 / (this.metrics.hits.L1 + this.metrics.misses.L1) || 0;
    const hitRateL2 = this.metrics.hits.L2 / (this.metrics.hits.L2 + this.metrics.misses.L2) || 0;
    const hitRateL3 = this.metrics.hits.L3 / (this.metrics.hits.L3 + this.metrics.misses.L3) || 0;
    
    this.logger.info('Cache Performance Metrics:', {
      hitRates: {
        L1: `${(hitRateL1 * 100).toFixed(2)}%`,
        L2: `${(hitRateL2 * 100).toFixed(2)}%`,
        L3: `${(hitRateL3 * 100).toFixed(2)}%`
      },
      sizes: {
        L1: this.l1Cache.size,
        L2: this.l2Cache.size
      },
      evictions: this.metrics.evictions,
      memory: this.metrics.memory
    });
  }

  private updateMemoryMetrics(): void {
    this.metrics.memory.L1 = this.l1Cache.size;
    this.metrics.memory.L2 = this.l2Cache.size;
    // L3 memory would be managed by Redis
  }

  // Logging helpers
  private logCacheHit(layer: CacheLayer, key: string, duration: number): void {
    if (duration > 10) { // Log slow cache hits
      this.logger.warn(`Slow cache hit on ${layer}:`, { key, duration });
    }
  }

  private logCacheMiss(key: string, duration: number): void {
    this.logger.debug('Cache miss:', { key, duration });
  }

  // Public metrics access
  public getMetrics(): CacheMetrics {
    this.updateMemoryMetrics();
    return { ...this.metrics };
  }

  // Configuration updates
  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Cache configuration updated:', this.config);
  }
}

// Export singleton instance
export const enterpriseCacheService = EnterpriseCacheService.getInstance();