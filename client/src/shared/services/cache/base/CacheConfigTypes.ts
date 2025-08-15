
export interface CacheConfig {
  ttl: number;
  prefix: string;
}

export interface CachedCommissionData {
  data: any;
  cached_at: string;
  expires_at: string;
  cache_key: string;
}

export interface CacheItem {
  key: string;
  data: any;
  ttl?: number;
}

export interface BulkCacheResult {
  success: number;
  failed: number;
}

export interface CacheStats {
  hit_rate: number;
  total_keys: number;
  memory_usage: number;
  uptime: number;
}
