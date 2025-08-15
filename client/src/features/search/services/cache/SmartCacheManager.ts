/**
 * Smart Cache Manager - Intelligent caching with memory tracking and eviction
 * Extracted from AISearchBar for better maintainability
 */

import { CACHE_CONFIG } from '../../constants/searchConstants';
import type { CacheEntry, CacheStats } from '../../components/AISearchBar/AISearchBar.types';

export class SmartCacheManager<T> {
  private cache = new Map<string, {
    data: T;
    timestamp: number;
    ttl: number;
    accessCount: number;
    lastAccessed: number;
    size: number;
  }>();
  
  private maxSize: number;
  private maxSizeBytes: number;
  private totalSize = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    maxSize: number = CACHE_CONFIG.MAX_SIZE,
    maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
  ) {
    this.maxSize = maxSize;
    this.maxSizeBytes = maxSizeBytes;
    this.startCleanupTimer();
  }

  public set(key: string, data: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): void {
    const size = this.calculateSize(data);
    
    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.totalSize -= this.cache.get(key)!.size;
    }
    
    // Check if adding this entry would exceed memory limits
    if (this.totalSize + size > this.maxSizeBytes) {
      this.evictLeastRecentlyUsed(size);
    }
    
    // Check if we exceed max entries
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }
    
    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      size,
    };
    
    this.cache.set(key, entry);
    this.totalSize += size;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }
    
    // Update access information
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry.data;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  public delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  public clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  private calculateSize(data: T): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate (2 bytes per char)
    } catch {
      return 1024; // Default size if can't stringify
    }
  }

  private evictLeastRecentlyUsed(spaceNeeded: number = 0): void {
    // Sort by last accessed time (ascending)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed
    );
    
    let freedSpace = 0;
    const targetSpace = spaceNeeded || this.maxSizeBytes * 0.1; // Free 10% if no specific need
    
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      this.totalSize -= entry.size;
      freedSpace += entry.size;
      
      if (freedSpace >= targetSpace) {
        break;
      }
    }
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  public getStats(): CacheStats {
    let hits = 0;
    let total = 0;
    
    for (const entry of this.cache.values()) {
      total += entry.accessCount;
      if (entry.accessCount > 1) {
        hits += entry.accessCount - 1;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      hitRate: total > 0 ? hits / total : 0,
      missRate: total > 0 ? (total - hits) / total : 0,
      memoryUsage: this.totalSize,
    };
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
      }
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  // Advanced cache methods
  public warmup(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.ttl);
    }
  }

  public getUsageStats(): {
    totalAccess: number;
    averageAccessCount: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    let totalAccess = 0;
    let oldestTime = Date.now();
    let newestTime = 0;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      oldestTime = Math.min(oldestTime, entry.timestamp);
      newestTime = Math.max(newestTime, entry.timestamp);
    }

    return {
      totalAccess,
      averageAccessCount: this.cache.size > 0 ? totalAccess / this.cache.size : 0,
      oldestEntry: oldestTime,
      newestEntry: newestTime,
    };
  }
}