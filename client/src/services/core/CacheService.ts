/**
 * CacheService - Advanced caching with LRU eviction, tag-based invalidation, and multi-tier storage
 * Supports in-memory, localStorage, and sessionStorage caching with intelligent eviction
 */

export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  hits: number;
  size: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // Tags for bulk invalidation
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  compress?: boolean;
  serialize?: boolean;
}

export interface CacheStats {
  total: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
  storageUsage: number;
}

class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheItem> = new Map();
  private accessOrder: string[] = [];
  private tagIndex: Map<string, Set<string>> = new Map();
  private maxMemorySize: number = 50 * 1024 * 1024; // 50MB
  private currentMemorySize: number = 0;
  private stats: CacheStats = {
    total: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    memoryUsage: 0,
    storageUsage: 0
  };

  private constructor() {
    this.initializeStorage();
    this.startCleanupTimer();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Store item in cache
   */
  public set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const {
      ttl = 300000, // 5 minutes default
      tags = [],
      storage = 'memory',
      compress = false,
      serialize = true
    } = options;

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      tags,
      hits: 0,
      size: this.calculateSize(value)
    };

    // Store based on storage type
    switch (storage) {
      case 'memory':
        this.setMemoryCache(key, item);
        break;
      case 'localStorage':
        this.setStorageCache(key, item, localStorage, serialize, compress);
        break;
      case 'sessionStorage':
        this.setStorageCache(key, item, sessionStorage, serialize, compress);
        break;
    }

    // Update tag index
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });

    this.stats.total++;
    this.updateStats();
  }

  /**
   * Get item from cache
   */
  public get<T>(key: string, defaultValue?: T): T | undefined {
    // Try memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      this.updateAccessOrder(key);
      memoryItem.hits++;
      this.stats.hits++;
      this.updateStats();
      return memoryItem.value as T;
    }

    // Try localStorage
    const localItem = this.getStorageCache<T>(key, localStorage);
    if (localItem && this.isValid(localItem)) {
      localItem.hits++;
      this.stats.hits++;
      this.updateStats();
      return localItem.value;
    }

    // Try sessionStorage
    const sessionItem = this.getStorageCache<T>(key, sessionStorage);
    if (sessionItem && this.isValid(sessionItem)) {
      sessionItem.hits++;
      this.stats.hits++;
      this.updateStats();
      return sessionItem.value;
    }

    this.stats.misses++;
    this.updateStats();
    return defaultValue;
  }

  /**
   * Check if key exists in cache
   */
  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete item from cache
   */
  public delete(key: string): boolean {
    let deleted = false;

    // Remove from memory cache
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key)!;
      this.currentMemorySize -= item.size;
      this.memoryCache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      deleted = true;
    }

    // Remove from localStorage
    if (localStorage.getItem(`cache_${key}`)) {
      localStorage.removeItem(`cache_${key}`);
      deleted = true;
    }

    // Remove from sessionStorage
    if (sessionStorage.getItem(`cache_${key}`)) {
      sessionStorage.removeItem(`cache_${key}`);
      deleted = true;
    }

    // Remove from tag index
    this.tagIndex.forEach((keys, tag) => {
      keys.delete(key);
      if (keys.size === 0) {
        this.tagIndex.delete(tag);
      }
    });

    if (deleted) {
      this.stats.total--;
      this.updateStats();
    }

    return deleted;
  }

  /**
   * Clear all cache or by tags
   */
  public clear(tags?: string[]): void {
    if (tags) {
      // Clear by tags
      tags.forEach(tag => {
        const keys = this.tagIndex.get(tag);
        if (keys) {
          keys.forEach(key => this.delete(key));
        }
      });
    } else {
      // Clear all
      this.memoryCache.clear();
      this.accessOrder = [];
      this.tagIndex.clear();
      this.currentMemorySize = 0;

      // Clear storage
      this.clearStorage(localStorage);
      this.clearStorage(sessionStorage);

      this.stats = {
        total: 0,
        hits: 0,
        misses: 0,
        hitRate: 0,
        memoryUsage: 0,
        storageUsage: 0
      };
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all cache keys
   */
  public keys(): string[] {
    const keys = new Set<string>();
    
    // Memory cache keys
    this.memoryCache.forEach((_, key) => keys.add(key));
    
    // localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keys.add(key.substring(6));
      }
    }
    
    // sessionStorage keys
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keys.add(key.substring(6));
      }
    }
    
    return Array.from(keys);
  }

  /**
   * Get cache size in bytes
   */
  public getSize(): { memory: number; localStorage: number; sessionStorage: number } {
    return {
      memory: this.currentMemorySize,
      localStorage: this.calculateStorageSize(localStorage),
      sessionStorage: this.calculateStorageSize(sessionStorage)
    };
  }

  /**
   * Preload cache with data
   */
  public preload<T>(data: Record<string, T>, options: CacheOptions = {}): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, options);
    });
  }

  /**
   * Create cache namespace
   */
  public namespace(prefix: string): CacheNamespace {
    return new CacheNamespace(this, prefix);
  }

  /**
   * Set memory cache with LRU eviction
   */
  private setMemoryCache<T>(key: string, item: CacheItem<T>): void {
    // Check if we need to evict
    while (this.currentMemorySize + item.size > this.maxMemorySize && this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift()!;
      const oldestItem = this.memoryCache.get(oldestKey);
      if (oldestItem) {
        this.currentMemorySize -= oldestItem.size;
        this.memoryCache.delete(oldestKey);
      }
    }

    this.memoryCache.set(key, item);
    this.currentMemorySize += item.size;
    this.updateAccessOrder(key);
  }

  /**
   * Set storage cache
   */
  private setStorageCache<T>(
    key: string,
    item: CacheItem<T>,
    storage: Storage,
    serialize: boolean,
    compress: boolean
  ): void {
    try {
      let data = serialize ? JSON.stringify(item) : item;
      
      if (compress && typeof data === 'string') {
        data = this.compress(data);
      }
      
      storage.setItem(`cache_${key}`, data as string);
    } catch (error) {
      console.warn('Failed to set storage cache:', error);
    }
  }

  /**
   * Get storage cache
   */
  private getStorageCache<T>(key: string, storage: Storage): CacheItem<T> | null {
    try {
      const data = storage.getItem(`cache_${key}`);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      storage.removeItem(`cache_${key}`);
      return null;
    }
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  /**
   * Check if cache item is valid
   */
  private isValid(item: CacheItem): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Calculate size of value
   */
  private calculateSize(value: any): number {
    return JSON.stringify(value).length * 2; // Rough estimate
  }

  /**
   * Calculate storage size
   */
  private calculateStorageSize(storage: Storage): number {
    let size = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_')) {
        const value = storage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }
    return size * 2; // Rough estimate
  }

  /**
   * Clear storage
   */
  private clearStorage(storage: Storage): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  /**
   * Initialize storage
   */
  private initializeStorage(): void {
    // Clean up expired items on startup
    this.cleanupExpired();
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Run every minute
  }

  /**
   * Clean up expired items
   */
  private cleanupExpired(): void {
    // Clean memory cache
    this.memoryCache.forEach((item, key) => {
      if (!this.isValid(item)) {
        this.delete(key);
      }
    });

    // Clean localStorage
    this.cleanupStorageExpired(localStorage);
    
    // Clean sessionStorage
    this.cleanupStorageExpired(sessionStorage);
  }

  /**
   * Clean up expired storage items
   */
  private cleanupStorageExpired(storage: Storage): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('cache_')) {
        const item = this.getStorageCache(key.substring(6), storage);
        if (item && !this.isValid(item)) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;
    this.stats.memoryUsage = this.currentMemorySize;
    this.stats.storageUsage = this.calculateStorageSize(localStorage) + this.calculateStorageSize(sessionStorage);
  }

  /**
   * Simple compression
   */
  private compress(data: string): string {
    // Simple compression - in real implementation, use proper compression
    return data;
  }

  /**
   * Simple decompression
   */
  private decompress(data: string): string {
    // Simple decompression - in real implementation, use proper decompression
    return data;
  }
}

/**
 * Cache namespace for prefixed operations
 */
class CacheNamespace {
  constructor(private cache: CacheService, private prefix: string) {}

  set<T>(key: string, value: T, options?: CacheOptions): void {
    return this.cache.set(`${this.prefix}:${key}`, value, options);
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.cache.get(`${this.prefix}:${key}`, defaultValue);
  }

  has(key: string): boolean {
    return this.cache.has(`${this.prefix}:${key}`);
  }

  delete(key: string): boolean {
    return this.cache.delete(`${this.prefix}:${key}`);
  }

  clear(): void {
    const keys = this.cache.keys().filter(key => key.startsWith(`${this.prefix}:`));
    keys.forEach(key => this.cache.delete(key));
  }
}

export default CacheService.getInstance();