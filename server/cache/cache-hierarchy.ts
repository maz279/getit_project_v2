import { Redis } from 'ioredis';
import LRU from 'lru-cache';

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl?: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  latency: number[];
}

export class CacheHierarchy {
  // L1: In-memory cache (1ms target)
  private l1Cache: LRU<string, CacheEntry>;
  
  // L2: Redis cluster (5ms target)
  private l2Cache: Redis;
  
  // L3: CDN edge cache (20ms target) - simulated
  private l3Cache: Map<string, CacheEntry>;
  
  // L4: Database query cache (50ms target)
  private l4Cache: Map<string, CacheEntry>;

  // Metrics tracking
  private metrics: Map<string, CacheMetrics>;

  constructor() {
    // L1: Application memory cache with 10MB limit
    this.l1Cache = new LRU<string, CacheEntry>({
      max: 10000, // Max items
      ttl: 60 * 1000, // 1 minute default TTL
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    // L2: Redis cluster connection - disabled to prevent crashes
    this.l2Cache = null as any;

    // L3: CDN edge cache simulation
    this.l3Cache = new Map<string, CacheEntry>();

    // L4: Database query cache
    this.l4Cache = new Map<string, CacheEntry>();

    // Initialize metrics
    this.metrics = new Map([
      ['l1', { hits: 0, misses: 0, evictions: 0, latency: [] }],
      ['l2', { hits: 0, misses: 0, evictions: 0, latency: [] }],
      ['l3', { hits: 0, misses: 0, evictions: 0, latency: [] }],
      ['l4', { hits: 0, misses: 0, evictions: 0, latency: [] }],
    ]);

    console.log('🔄 CacheHierarchy: Using fallback mode without Redis');
  }

  private async initializeL2Connection() {
    try {
      await this.l2Cache.connect();
      console.log('✅ L2 Redis cache connected');
    } catch (error) {
      console.error('❌ L2 Redis connection failed, running in degraded mode:', error);
    }
  }

  // Main get method with waterfall through cache layers
  async get(key: string, options?: { skipL1?: boolean; skipL2?: boolean }): Promise<any> {
    const startTime = Date.now();

    // L1: In-memory cache (1ms target)
    if (!options?.skipL1) {
      const l1Start = Date.now();
      const l1Result = this.l1Cache.get(key);
      const l1Latency = Date.now() - l1Start;
      this.recordMetrics('l1', l1Latency, !!l1Result);

      if (l1Result && !this.isExpired(l1Result)) {
        return l1Result.value;
      }
    }

    // L2: Redis cluster (5ms target) - disabled
    // Redis disabled to prevent connection errors

    // L3: CDN edge cache (20ms target)
    const l3Start = Date.now();
    const l3Result = this.l3Cache.get(key);
    const l3Latency = Date.now() - l3Start;
    this.recordMetrics('l3', l3Latency, !!l3Result);

    if (l3Result && !this.isExpired(l3Result)) {
      // Backfill L1 and L2
      await this.propagateToUpperLayers(key, l3Result.value, 'l3');
      return l3Result.value;
    }

    // L4: Database query cache (50ms target)
    const l4Start = Date.now();
    const l4Result = this.l4Cache.get(key);
    const l4Latency = Date.now() - l4Start;
    this.recordMetrics('l4', l4Latency, !!l4Result);

    if (l4Result && !this.isExpired(l4Result)) {
      // Backfill all upper layers
      await this.propagateToUpperLayers(key, l4Result.value, 'l4');
      return l4Result.value;
    }

    // Cache miss
    return null;
  }

  // Set value in cache hierarchy with write-through strategy
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const cacheEntry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 3600000, // Default 1 hour
    };

    // Write to all layers (write-through)
    
    // L1: In-memory
    this.l1Cache.set(key, cacheEntry);

    // L2: Redis - disabled
    // Redis disabled to prevent connection errors

    // L3: CDN edge
    this.l3Cache.set(key, cacheEntry);

    // L4: Database query cache
    this.l4Cache.set(key, cacheEntry);
  }

  // Invalidate key from all cache layers
  async invalidate(key: string): Promise<void> {
    // Remove from all layers
    this.l1Cache.delete(key);
    
    if (this.l2Cache.status === 'ready') {
      try {
        await this.l2Cache.del(key);
      } catch (error) {
        console.error('L2 cache invalidation error:', error);
      }
    }
    
    this.l3Cache.delete(key);
    this.l4Cache.delete(key);
  }

  // Pattern-based invalidation (e.g., "user:*")
  async invalidatePattern(pattern: string): Promise<void> {
    // L1: Clear matching keys
    for (const key of this.l1Cache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        this.l1Cache.delete(key);
      }
    }

    // L2: Use Redis SCAN
    if (this.l2Cache.status === 'ready') {
      try {
        const stream = this.l2Cache.scanStream({ match: pattern });
        stream.on('data', (keys: string[]) => {
          if (keys.length) {
            this.l2Cache.del(...keys);
          }
        });
      } catch (error) {
        console.error('L2 pattern invalidation error:', error);
      }
    }

    // L3 & L4: Clear matching keys
    for (const [key] of this.l3Cache) {
      if (this.matchesPattern(key, pattern)) {
        this.l3Cache.delete(key);
      }
    }
    
    for (const [key] of this.l4Cache) {
      if (this.matchesPattern(key, pattern)) {
        this.l4Cache.delete(key);
      }
    }
  }

  // Get cache metrics
  getMetrics(): Record<string, CacheMetrics & { hitRate: number; avgLatency: number }> {
    const results: Record<string, any> = {};

    for (const [layer, metrics] of this.metrics) {
      const total = metrics.hits + metrics.misses;
      const hitRate = total > 0 ? (metrics.hits / total) * 100 : 0;
      const avgLatency = metrics.latency.length > 0 
        ? metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length 
        : 0;

      results[layer] = {
        ...metrics,
        hitRate: Number(hitRate.toFixed(2)),
        avgLatency: Number(avgLatency.toFixed(2)),
      };
    }

    return results;
  }

  // Warmup cache with frequently accessed data
  async warmup(keys: string[], fetcher: (key: string) => Promise<any>): Promise<void> {
    console.log(`🔥 Warming up cache with ${keys.length} keys...`);
    
    const warmupPromises = keys.map(async (key) => {
      try {
        const value = await fetcher(key);
        if (value) {
          await this.set(key, value);
        }
      } catch (error) {
        console.error(`Failed to warmup key ${key}:`, error);
      }
    });

    await Promise.all(warmupPromises);
    console.log('✅ Cache warmup completed');
  }

  // Private helper methods
  private isExpired(entry: CacheEntry): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private async propagateToUpperLayers(key: string, value: any, fromLayer: string): Promise<void> {
    const layers = ['l1', 'l2', 'l3', 'l4'];
    const fromIndex = layers.indexOf(fromLayer);

    // Propagate to all layers above the source
    for (let i = 0; i < fromIndex; i++) {
      if (layers[i] === 'l1') {
        this.l1Cache.set(key, { value, timestamp: Date.now() });
      } else if (layers[i] === 'l2' && this.l2Cache.status === 'ready') {
        try {
          await this.l2Cache.setex(key, 3600, JSON.stringify(value));
        } catch (error) {
          console.error('L2 propagation error:', error);
        }
      } else if (layers[i] === 'l3') {
        this.l3Cache.set(key, { value, timestamp: Date.now() });
      }
    }
  }

  private matchesPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }

  private recordMetrics(layer: string, latency: number, hit: boolean): void {
    const metrics = this.metrics.get(layer);
    if (!metrics) return;

    if (hit) {
      metrics.hits++;
    } else {
      metrics.misses++;
    }

    metrics.latency.push(latency);
    // Keep only last 1000 latency measurements
    if (metrics.latency.length > 1000) {
      metrics.latency.shift();
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('Shutting down cache hierarchy...');
    
    if (this.l2Cache.status === 'ready') {
      await this.l2Cache.quit();
    }
    
    this.l1Cache.clear();
    this.l3Cache.clear();
    this.l4Cache.clear();
    
    console.log('✅ Cache hierarchy shutdown complete');
  }
}

// Singleton instance
export const cacheHierarchy = new CacheHierarchy();