
import { CacheItem, BulkCacheResult } from '../base/CacheConfigTypes';

export class CommissionCacheOperations {
  private static readonly API_BASE = '/functions/v1/redis-commission-cache';
  private static readonly DEFAULT_TTL = 3600;
  private static readonly CACHE_PREFIX = 'commission:';

  static buildCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  static hashFilters(filters: any): string {
    const filterString = JSON.stringify(filters, Object.keys(filters).sort());
    let hash = 0;
    for (let i = 0; i < filterString.length; i++) {
      const char = filterString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }

  static async set(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(key);
      const response = await fetch(`${this.API_BASE}/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: cacheKey,
          data,
          ttl
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.buildCacheKey(key);
      const response = await fetch(`${this.API_BASE}/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cacheKey })
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result?.data || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async delete(key: string): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(key);
      const response = await fetch(`${this.API_BASE}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cacheKey })
      });

      return response.ok;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  static async setBulk(items: CacheItem[]): Promise<BulkCacheResult> {
    try {
      const operations = items.map(item => ({
        key: this.buildCacheKey(item.key),
        data: item.data,
        ttl: item.ttl || this.DEFAULT_TTL
      }));

      const response = await fetch(`${this.API_BASE}/setBulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations })
      });

      if (!response.ok) {
        throw new Error(`Bulk cache operation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bulk cache set error:', error);
      return { success: 0, failed: items.length };
    }
  }

  static async getBulk(keys: string[]): Promise<{ [key: string]: any }> {
    try {
      const cacheKeys = keys.map(key => this.buildCacheKey(key));
      const response = await fetch(`${this.API_BASE}/getBulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: cacheKeys })
      });

      if (!response.ok) return {};

      const result = await response.json();
      return result?.data || {};
    } catch (error) {
      console.error('Bulk cache get error:', error);
      return {};
    }
  }

  static async flush(pattern?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/flush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pattern: pattern ? this.buildCacheKey(pattern) : `${this.CACHE_PREFIX}*`
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }
}
