/**
 * Phase 2: Service Layer Standardization
 * Unified Cache Strategy Implementation
 * Investment: $7,000 | Week 3-4
 */

import { performance } from 'perf_hooks';

// Cache Configuration Types
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  strategy: 'LRU' | 'FIFO' | 'LFU';
  persistToDisk?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
  averageResponseTime: number;
  hitRatio: number;
}

/**
 * Enterprise-grade unified caching system
 * Supports multiple strategies and automatic optimization
 */
export class UnifiedCacheStrategy {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 300000, // 5 minutes default
      maxSize: 1000,
      strategy: 'LRU',
      persistToDisk: false,
      ...config
    };

    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      hitRatio: 0
    };

    this.startCleanupTimer();
  }

  /**
   * Get item from cache with performance tracking
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateMetrics(startTime);
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.updateMetrics(startTime);
      return null;
    }

    // Update access tracking for LRU/LFU
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    this.metrics.hits++;
    this.updateMetrics(startTime);
    
    return entry.data;
  }

  /**
   * Set item in cache with automatic eviction
   */
  async set<T>(key: string, data: T, customTtl?: number): Promise<boolean> {
    const startTime = performance.now();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      size: this.calculateSize(data)
    };

    // Check cache size limits
    if (this.cache.size >= this.config.maxSize) {
      this.evictItems();
    }

    this.cache.set(key, entry);
    
    // Persist to disk if configured
    if (this.config.persistToDisk) {
      await this.persistEntry(key, entry);
    }

    this.updateMetrics(startTime);
    return true;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.resetMetrics();
  }

  /**
   * Get cache metrics for monitoring
   */
  getMetrics(): CacheMetrics {
    this.metrics.hitRatio = this.metrics.totalRequests > 0 
      ? this.metrics.hits / this.metrics.totalRequests 
      : 0;
    return { ...this.metrics };
  }

  /**
   * Health check for service monitoring
   */
  healthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    const metrics = this.getMetrics();
    
    if (metrics.hitRatio < 0.3) {
      return {
        status: 'degraded',
        details: {
          hitRatio: metrics.hitRatio,
          issue: 'Low cache hit ratio',
          recommendation: 'Review cache TTL and key strategies'
        }
      };
    }

    if (this.cache.size === this.config.maxSize) {
      return {
        status: 'degraded',
        details: {
          cacheSize: this.cache.size,
          maxSize: this.config.maxSize,
          issue: 'Cache at maximum capacity',
          recommendation: 'Consider increasing cache size or reducing TTL'
        }
      };
    }

    return {
      status: 'healthy',
      details: {
        hitRatio: metrics.hitRatio,
        cacheSize: this.cache.size,
        averageResponseTime: metrics.averageResponseTime
      }
    };
  }

  /**
   * Evict items based on strategy
   */
  private evictItems(): void {
    const itemsToEvict = Math.max(1, Math.floor(this.config.maxSize * 0.1));
    
    switch (this.config.strategy) {
      case 'LRU':
        this.evictLRU(itemsToEvict);
        break;
      case 'LFU':
        this.evictLFU(itemsToEvict);
        break;
      case 'FIFO':
        this.evictFIFO(itemsToEvict);
        break;
    }
  }

  /**
   * LRU eviction strategy
   */
  private evictLRU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, count);

    entries.forEach(([key]) => {
      this.cache.delete(key);
      this.metrics.evictions++;
    });
  }

  /**
   * LFU eviction strategy
   */
  private evictLFU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.accessCount - b.accessCount)
      .slice(0, count);

    entries.forEach(([key]) => {
      this.cache.delete(key);
      this.metrics.evictions++;
    });
  }

  /**
   * FIFO eviction strategy
   */
  private evictFIFO(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, count);

    entries.forEach(([key]) => {
      this.cache.delete(key);
      this.metrics.evictions++;
    });
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl;
  }

  /**
   * Calculate approximate size of data
   */
  private calculateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough byte estimation
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }

  /**
   * Persist cache entry to disk (if enabled)
   */
  private async persistEntry(key: string, entry: CacheEntry<any>): Promise<void> {
    // Implementation would depend on storage backend
    // Could use IndexedDB for browser, file system for server
    // This is a placeholder for the interface
  }

  /**
   * Start cleanup timer for expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Cleanup every minute
  }

  /**
   * Remove expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.config.ttl) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Reset metrics
   */
  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      hitRatio: 0
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Factory for different cache configurations
export class CacheFactory {
  static createSearchCache(): UnifiedCacheStrategy {
    return new UnifiedCacheStrategy({
      ttl: 300000, // 5 minutes for search results
      maxSize: 500,
      strategy: 'LRU'
    });
  }

  static createAPICache(): UnifiedCacheStrategy {
    return new UnifiedCacheStrategy({
      ttl: 60000, // 1 minute for API responses
      maxSize: 1000,
      strategy: 'LFU'
    });
  }

  static createUserCache(): UnifiedCacheStrategy {
    return new UnifiedCacheStrategy({
      ttl: 900000, // 15 minutes for user data
      maxSize: 200,
      strategy: 'LRU',
      persistToDisk: true
    });
  }
}

// Global cache manager
export class GlobalCacheManager {
  private static instance: GlobalCacheManager;
  private caches = new Map<string, UnifiedCacheStrategy>();

  static getInstance(): GlobalCacheManager {
    if (!GlobalCacheManager.instance) {
      GlobalCacheManager.instance = new GlobalCacheManager();
    }
    return GlobalCacheManager.instance;
  }

  getCache(name: string): UnifiedCacheStrategy {
    if (!this.caches.has(name)) {
      // Create default cache if not exists
      this.caches.set(name, new UnifiedCacheStrategy());
    }
    return this.caches.get(name)!;
  }

  setCache(name: string, cache: UnifiedCacheStrategy): void {
    this.caches.set(name, cache);
  }

  getAllMetrics(): Record<string, CacheMetrics> {
    const metrics: Record<string, CacheMetrics> = {};
    this.caches.forEach((cache, name) => {
      metrics[name] = cache.getMetrics();
    });
    return metrics;
  }

  healthCheck(): Record<string, any> {
    const health: Record<string, any> = {};
    this.caches.forEach((cache, name) => {
      health[name] = cache.healthCheck();
    });
    return health;
  }
}