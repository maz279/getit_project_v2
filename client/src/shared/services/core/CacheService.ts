/**
 * CacheService - Unified Caching Layer
 * Consolidates all caching functionality
 * 
 * Consolidates:
 * - cache/RedisService.ts
 * - cache/CommissionCacheService.ts
 * - RedisService.ts
 * - All cache operations and invalidation
 */

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
  enablePersistence: boolean;
  keyPrefix: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private tags: Map<string, Set<string>> = new Map(); // tag -> set of keys
  private accessOrder: string[] = []; // For LRU eviction

  private constructor() {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      cleanupInterval: 60000, // 1 minute
      enablePersistence: false,
      keyPrefix: 'cache:',
    };

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: this.config.maxSize,
      hitRate: 0,
      memoryUsage: 0,
    };

    this.initializeCache();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private initializeCache(): void {
    // Load from localStorage if persistence is enabled
    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }

    // Setup cleanup timer
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // Core cache operations
  public set<T>(key: string, value: T, ttl?: number, tags?: string[]): void {
    const fullKey = this.getFullKey(key);
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      tags,
    };

    // Remove existing item if it exists
    this.delete(key);

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    // Add new item
    this.cache.set(fullKey, item);
    this.updateAccessOrder(fullKey);

    // Update tags
    if (tags) {
      this.updateTags(fullKey, tags);
    }

    // Update stats
    this.stats.size = this.cache.size;
    this.updateStats();

    // Persist if enabled
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  public get<T>(key: string): T | null {
    const fullKey = this.getFullKey(key);
    const item = this.cache.get(fullKey);

    if (!item) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if expired
    if (this.isExpired(item)) {
      this.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(fullKey);

    // Update stats
    this.stats.hits++;
    this.updateStats();

    return item.data;
  }

  public has(key: string): boolean {
    const fullKey = this.getFullKey(key);
    const item = this.cache.get(fullKey);
    
    if (!item) return false;
    
    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  public delete(key: string): boolean {
    const fullKey = this.getFullKey(key);
    const item = this.cache.get(fullKey);

    if (!item) return false;

    // Remove from cache
    this.cache.delete(fullKey);

    // Remove from access order
    this.accessOrder = this.accessOrder.filter(k => k !== fullKey);

    // Remove from tags
    if (item.tags) {
      this.removeTags(fullKey, item.tags);
    }

    // Update stats
    this.stats.size = this.cache.size;
    this.updateStats();

    // Persist if enabled
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    return true;
  }

  public clear(): void {
    this.cache.clear();
    this.tags.clear();
    this.accessOrder = [];
    this.stats.size = 0;
    this.updateStats();

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  // Advanced cache operations
  public getOrSet<T>(key: string, factory: () => T | Promise<T>, ttl?: number, tags?: string[]): T | Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = factory();
    
    if (result instanceof Promise) {
      return result.then(value => {
        this.set(key, value, ttl, tags);
        return value;
      });
    } else {
      this.set(key, result, ttl, tags);
      return result;
    }
  }

  public remember<T>(key: string, factory: () => T | Promise<T>, ttl?: number, tags?: string[]): T | Promise<T> {
    return this.getOrSet(key, factory, ttl, tags);
  }

  public increment(key: string, value: number = 1): number {
    const current = this.get<number>(key) || 0;
    const newValue = current + value;
    this.set(key, newValue);
    return newValue;
  }

  public decrement(key: string, value: number = 1): number {
    return this.increment(key, -value);
  }

  // Tag-based operations
  public invalidateTag(tag: string): number {
    const keys = this.tags.get(tag);
    if (!keys) return 0;

    let count = 0;
    keys.forEach(key => {
      if (this.cache.has(key)) {
        this.cache.delete(key);
        this.accessOrder = this.accessOrder.filter(k => k !== key);
        count++;
      }
    });

    this.tags.delete(tag);
    this.stats.size = this.cache.size;
    this.updateStats();

    return count;
  }

  public invalidateTags(tags: string[]): number {
    let totalCount = 0;
    tags.forEach(tag => {
      totalCount += this.invalidateTag(tag);
    });
    return totalCount;
  }

  public getByTag(tag: string): Array<{ key: string; value: any }> {
    const keys = this.tags.get(tag);
    if (!keys) return [];

    const results: Array<{ key: string; value: any }> = [];
    keys.forEach(key => {
      const item = this.cache.get(key);
      if (item && !this.isExpired(item)) {
        results.push({
          key: key.replace(this.config.keyPrefix, ''),
          value: item.data,
        });
      }
    });

    return results;
  }

  // Batch operations
  public setMultiple<T>(items: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>): void {
    items.forEach(item => {
      this.set(item.key, item.value, item.ttl, item.tags);
    });
  }

  public getMultiple<T>(keys: string[]): Array<{ key: string; value: T | null }> {
    return keys.map(key => ({
      key,
      value: this.get<T>(key),
    }));
  }

  public deleteMultiple(keys: string[]): number {
    let count = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        count++;
      }
    });
    return count;
  }

  // Domain-specific cache methods (consolidated from existing cache services)
  
  // User cache
  public cacheUser(userId: string, userData: any, ttl: number = 600000): void {
    this.set(`user:${userId}`, userData, ttl, ['users']);
  }

  public getCachedUser(userId: string): any | null {
    return this.get(`user:${userId}`);
  }

  public invalidateUserCache(userId: string): void {
    this.delete(`user:${userId}`);
  }

  // Product cache
  public cacheProduct(productId: string, productData: any, ttl: number = 300000): void {
    this.set(`product:${productId}`, productData, ttl, ['products']);
  }

  public getCachedProduct(productId: string): any | null {
    return this.get(`product:${productId}`);
  }

  public invalidateProductCache(productId?: string): void {
    if (productId) {
      this.delete(`product:${productId}`);
    } else {
      this.invalidateTag('products');
    }
  }

  // Order cache
  public cacheOrder(orderId: string, orderData: any, ttl: number = 300000): void {
    this.set(`order:${orderId}`, orderData, ttl, ['orders']);
  }

  public getCachedOrder(orderId: string): any | null {
    return this.get(`order:${orderId}`);
  }

  public invalidateOrderCache(orderId?: string): void {
    if (orderId) {
      this.delete(`order:${orderId}`);
    } else {
      this.invalidateTag('orders');
    }
  }

  // Search cache
  public cacheSearchResults(query: string, results: any, ttl: number = 180000): void {
    const searchKey = `search:${this.hashKey(query)}`;
    this.set(searchKey, results, ttl, ['search']);
  }

  public getCachedSearchResults(query: string): any | null {
    const searchKey = `search:${this.hashKey(query)}`;
    return this.get(searchKey);
  }

  public invalidateSearchCache(): void {
    this.invalidateTag('search');
  }

  // Commission cache (consolidated from CommissionCacheService)
  public cacheCommission(key: string, data: any, ttl: number = 300000): void {
    this.set(`commission:${key}`, data, ttl, ['commissions']);
  }

  public getCachedCommission(key: string): any | null {
    return this.get(`commission:${key}`);
  }

  public invalidateCommissionCache(key?: string): void {
    if (key) {
      this.delete(`commission:${key}`);
    } else {
      this.invalidateTag('commissions');
    }
  }

  // Statistics and monitoring
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0,
      memoryUsage: 0,
    };
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys()).map(key => key.replace(this.config.keyPrefix, ''));
  }

  public getSize(): number {
    return this.cache.size;
  }

  public getMemoryUsage(): number {
    let totalSize = 0;
    this.cache.forEach((item, key) => {
      totalSize += JSON.stringify(item).length + key.length;
    });
    return totalSize;
  }

  // Configuration
  public updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    this.stats.maxSize = this.config.maxSize;
    
    // Restart cleanup timer if interval changed
    if (config.cleanupInterval && this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, this.config.cleanupInterval);
    }
  }

  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  // Private helper methods
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;
    
    const oldestKey = this.accessOrder.shift();
    if (oldestKey) {
      const item = this.cache.get(oldestKey);
      if (item?.tags) {
        this.removeTags(oldestKey, item.tags);
      }
      this.cache.delete(oldestKey);
    }
  }

  private updateTags(key: string, tags: string[]): void {
    tags.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag)!.add(key);
    });
  }

  private removeTags(key: string, tags: string[]): void {
    tags.forEach(tag => {
      const tagKeys = this.tags.get(tag);
      if (tagKeys) {
        tagKeys.delete(key);
        if (tagKeys.size === 0) {
          this.tags.delete(tag);
        }
      }
    });
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      const item = this.cache.get(key);
      if (item?.tags) {
        this.removeTags(key, item.tags);
      }
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    });

    if (expiredKeys.length > 0) {
      this.stats.size = this.cache.size;
      this.updateStats();
    }
  }

  private updateStats(): void {
    this.stats.hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;
    this.stats.memoryUsage = this.getMemoryUsage();
  }

  private hashKey(key: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private saveToStorage(): void {
    if (!this.config.enablePersistence) return;
    
    try {
      const cacheData = {
        cache: Array.from(this.cache.entries()),
        tags: Array.from(this.tags.entries()).map(([key, value]) => [key, Array.from(value)]),
        accessOrder: this.accessOrder,
        stats: this.stats,
      };
      localStorage.setItem('cacheService', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('cacheService');
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(cacheData.cache);
        this.tags = new Map(cacheData.tags.map(([key, value]: [string, string[]]) => [key, new Set(value)]));
        this.accessOrder = cacheData.accessOrder || [];
        this.stats = { ...this.stats, ...cacheData.stats };
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }

  // Cleanup on destroy
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
    
    this.clear();
  }
}

export default CacheService.getInstance();
export { CacheService, CacheItem, CacheConfig, CacheStats };