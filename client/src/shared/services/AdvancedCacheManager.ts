// Advanced caching system for Phase 4 Performance Integration
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  compressionThreshold: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalOperations: number;
  memoryUsage: number;
  hitRate: number;
}

class AdvancedCacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer?: NodeJS.Timeout;
  private compressionCache = new Map<string, string>();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 300000, // 5 minutes
      cleanupInterval: config.cleanupInterval || 60000, // 1 minute
      compressionThreshold: config.compressionThreshold || 1024 // 1KB
    };

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalOperations: 0,
      memoryUsage: 0,
      hitRate: 0
    };

    this.startCleanupTimer();
  }

  // Set item with advanced options
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
      compress?: boolean;
    } = {}
  ): void {
    const now = Date.now();
    const ttl = options.ttl || this.config.defaultTTL;
    
    // Compress large data if needed
    let processedData = data;
    const dataSize = this.estimateSize(data);
    
    if (options.compress || dataSize > this.config.compressionThreshold) {
      try {
        const compressed = this.compress(JSON.stringify(data));
        this.compressionCache.set(key, compressed);
        processedData = `__COMPRESSED__${key}` as T;
      } catch (error) {
        console.warn('Compression failed for key:', key, error);
      }
    }

    const item: CacheItem<T> = {
      data: processedData,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
      tags: options.tags || [],
      priority: options.priority || 'medium'
    };

    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, item);
    this.updateStats();
  }

  // Get item with access tracking
  get<T>(key: string): T | null {
    this.stats.totalOperations++;
    
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (this.isExpired(item)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateHitRate();

    // Handle compressed data
    if (typeof item.data === 'string' && item.data.startsWith('__COMPRESSED__')) {
      const compressedKey = item.data.replace('__COMPRESSED__', '');
      const compressed = this.compressionCache.get(compressedKey);
      if (compressed) {
        try {
          return JSON.parse(this.decompress(compressed));
        } catch (error) {
          console.warn('Decompression failed for key:', key, error);
          this.delete(key);
          return null;
        }
      }
    }

    return item.data;
  }

  // Delete item
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.compressionCache.delete(key);
    this.updateStats();
    return deleted;
  }

  // Clear cache by tags
  clearByTags(tags: string[]): number {
    let cleared = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.some(tag => tags.includes(tag))) {
        this.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }

  // Clear expired items
  clearExpired(): number {
    let cleared = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }

  // Get cache statistics
  getStats(): CacheStats & { keys: number; compressedKeys: number } {
    return {
      ...this.stats,
      keys: this.cache.size,
      compressedKeys: this.compressionCache.size
    };
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.compressionCache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalOperations: 0,
      memoryUsage: 0,
      hitRate: 0
    };
  }

  // Get cache keys by pattern
  getKeysByPattern(pattern: RegExp): string[] {
    return Array.from(this.cache.keys()).filter(key => pattern.test(key));
  }

  // Preload cache with data
  async preload(entries: Array<{ key: string; data: any; options?: any }>): Promise<void> {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.options);
    }
  }

  // Export cache data
  export(): Array<{ key: string; data: any; metadata: any }> {
    const exported: Array<{ key: string; data: any; metadata: any }> = [];
    
    for (const [key, item] of this.cache.entries()) {
      exported.push({
        key,
        data: this.get(key), // This handles decompression
        metadata: {
          timestamp: item.timestamp,
          ttl: item.ttl,
          accessCount: item.accessCount,
          lastAccessed: item.lastAccessed,
          tags: item.tags,
          priority: item.priority
        }
      });
    }
    
    return exported;
  }

  // Import cache data
  import(data: Array<{ key: string; data: any; metadata: any }>): void {
    for (const entry of data) {
      this.set(entry.key, entry.data, {
        ttl: entry.metadata.ttl,
        tags: entry.metadata.tags,
        priority: entry.metadata.priority
      });
    }
  }

  // Private methods
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    let lowestPriority = 'high';

    // Find item with lowest priority and oldest access time
    for (const [key, item] of this.cache.entries()) {
      const priorityWeight = item.priority === 'low' ? 3 : item.priority === 'medium' ? 2 : 1;
      const timeScore = item.lastAccessed + (priorityWeight * 100000);
      
      if (timeScore < oldestTime) {
        oldestTime = timeScore;
        oldestKey = key;
        lowestPriority = item.priority;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  private updateStats(): void {
    let totalSize = 0;
    for (const item of this.cache.values()) {
      totalSize += this.estimateSize(item);
    }
    this.stats.memoryUsage = totalSize;
  }

  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalOperations > 0 
      ? (this.stats.hits / this.stats.totalOperations) * 100 
      : 0;
  }

  private estimateSize(obj: any): number {
    return JSON.stringify(obj).length * 2; // Rough estimate
  }

  private compress(data: string): string {
    // Simple compression using built-in methods
    try {
      return btoa(data);
    } catch {
      return data;
    }
  }

  private decompress(data: string): string {
    try {
      return atob(data);
    } catch {
      return data;
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.clearExpired();
    }, this.config.cleanupInterval);
  }

  // Cleanup
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Singleton instance
export const advancedCache = new AdvancedCacheManager({
  maxSize: 2000,
  defaultTTL: 600000, // 10 minutes
  cleanupInterval: 120000, // 2 minutes
  compressionThreshold: 2048 // 2KB
});

export default AdvancedCacheManager;