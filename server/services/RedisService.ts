import Redis from 'ioredis';
import { getEnterpriseRedis } from './EnterpriseRedisService';

export class RedisService {
  private client: Redis;
  private isConnected: boolean = false;
  private enterpriseRedis: any = null;

  constructor() {
    // Always use enterprise Redis in enterprise mode
    if (process.env.ENTERPRISE_MODE === 'true') {
      console.log('🔄 Using Enterprise Redis Service with multi-tier caching');
      this.isConnected = true; // Enterprise service handles connection gracefully
      this.client = null as any; // Use enterprise service instead
      return;
    }

    // Always disable Redis connections for stability
    console.log('⚠️ Redis disabled for stability - using in-memory fallback only');
    this.isConnected = false;
    this.client = null as any;
    return;
  }

  private getEnterpriseRedis() {
    if (!this.enterpriseRedis) {
      try {
        this.enterpriseRedis = getEnterpriseRedis();
      } catch (error) {
        console.warn('Failed to initialize enterprise Redis:', error.message);
        this.enterpriseRedis = null;
      }
    }
    return this.enterpriseRedis;
  }

  private async initializeConnection() {
    if (!this.client) return;
    
    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      console.warn('⚠️ Redis not available, caching disabled - continuing without Redis');
      this.isConnected = false;
    }
  }

  // Cache product data with automatic expiration
  async cacheProduct(productId: string, productData: any, ttl = 3600) {
    if (process.env.ENTERPRISE_MODE === 'true') {
      const redis = this.getEnterpriseRedis();
      if (redis) {
        return await redis.set(`product:${productId}`, productData, ttl);
      }
      return;
    }
    
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(
        `product:${productId}`, 
        ttl, 
        JSON.stringify(productData)
      );
    } catch (error) {
      console.error('Redis cache error:', error);
    }
  }

  // Get cached product
  async getCachedProduct(productId: string) {
    if (process.env.ENTERPRISE_MODE === 'true') {
      const redis = this.getEnterpriseRedis();
      if (redis) {
        return await redis.get(`product:${productId}`);
      }
      return null;
    }
    
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.client.get(`product:${productId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  // Cache search results
  async cacheSearchResults(searchKey: string, results: any, ttl = 1800) {
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(
        `search:${searchKey}`, 
        ttl, 
        JSON.stringify(results)
      );
    } catch (error) {
      console.error('Redis search cache error:', error);
    }
  }

  // Get cached search results
  async getCachedSearchResults(searchKey: string) {
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.client.get(`search:${searchKey}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis search get error:', error);
      return null;
    }
  }

  // Cache user session data
  async cacheUserSession(sessionId: string, sessionData: any, ttl = 86400) {
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(
        `session:${sessionId}`, 
        ttl, 
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error('Redis session cache error:', error);
    }
  }

  // Get cached user session
  async getCachedUserSession(sessionId: string) {
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.client.get(`session:${sessionId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis session get error:', error);
      return null;
    }
  }

  // Cache recommendations
  async cacheRecommendations(userId: number, recommendations: any, ttl = 7200) {
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(
        `recommendations:${userId}`, 
        ttl, 
        JSON.stringify(recommendations)
      );
    } catch (error) {
      console.error('Redis recommendations cache error:', error);
    }
  }

  // Get cached recommendations
  async getCachedRecommendations(userId: number) {
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.client.get(`recommendations:${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis recommendations get error:', error);
      return null;
    }
  }

  // Rate limiting functionality
  async checkRateLimit(key: string, limit: number, window: number) {
    if (!this.isConnected) return { allowed: true, remaining: limit };
    
    try {
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, window);
      }
      
      const remaining = Math.max(0, limit - current);
      
      return {
        allowed: current <= limit,
        remaining,
        resetTime: await this.client.ttl(key)
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return { allowed: true, remaining: limit };
    }
  }

  // Cache vendor data
  async cacheVendor(vendorId: string, vendorData: any, ttl = 3600) {
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(
        `vendor:${vendorId}`, 
        ttl, 
        JSON.stringify(vendorData)
      );
    } catch (error) {
      console.error('Redis vendor cache error:', error);
    }
  }

  // Get cached vendor
  async getCachedVendor(vendorId: string) {
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.client.get(`vendor:${vendorId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis vendor get error:', error);
      return null;
    }
  }

  // Cache category tree
  async cacheCategoryTree(categories: any, ttl = 86400) {
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(
        'categories:tree', 
        ttl, 
        JSON.stringify(categories)
      );
    } catch (error) {
      console.error('Redis category cache error:', error);
    }
  }

  // Get cached category tree
  async getCachedCategoryTree() {
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.client.get('categories:tree');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis category get error:', error);
      return null;
    }
  }

  // Invalidate cache patterns
  async invalidatePattern(pattern: string) {
    if (!this.isConnected) return;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Redis invalidate error:', error);
    }
  }

  // Clear user-specific caches
  async clearUserCaches(userId: number) {
    if (!this.isConnected) return;
    
    try {
      await Promise.all([
        this.invalidatePattern(`recommendations:${userId}`),
        this.invalidatePattern(`cart:${userId}`),
        this.invalidatePattern(`wishlist:${userId}`)
      ]);
    } catch (error) {
      console.error('Redis clear user caches error:', error);
    }
  }

  // Cache shopping cart
  async cacheCart(userId: number, cartData: any, ttl = 86400) {
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(
        `cart:${userId}`, 
        ttl, 
        JSON.stringify(cartData)
      );
    } catch (error) {
      console.error('Redis cart cache error:', error);
    }
  }

  // Get cached cart
  async getCachedCart(userId: number) {
    if (!this.isConnected) return null;
    
    try {
      const cached = await this.client.get(`cart:${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis cart get error:', error);
      return null;
    }
  }

  // Store analytics data temporarily for batch processing
  async storeAnalyticsEvent(eventData: any) {
    if (!this.isConnected) return;
    
    try {
      await this.client.lpush('analytics:events', JSON.stringify(eventData));
      
      // Keep only last 10000 events
      await this.client.ltrim('analytics:events', 0, 9999);
    } catch (error) {
      console.error('Redis analytics store error:', error);
    }
  }

  // Get analytics events for batch processing
  async getAnalyticsEvents(count = 100) {
    if (!this.isConnected) return [];
    
    try {
      const events = await this.client.lrange('analytics:events', 0, count - 1);
      await this.client.ltrim('analytics:events', count, -1);
      
      return events.map(event => JSON.parse(event));
    } catch (error) {
      console.error('Redis analytics get error:', error);
      return [];
    }
  }

  // Generic Redis methods for microservices compatibility
  async get(key: string): Promise<string | null> {
    if (process.env.ENTERPRISE_MODE === 'true') {
      const result = await this.enterpriseRedis.get(key);
      return result ? (typeof result === 'string' ? result : JSON.stringify(result)) : null;
    }
    
    if (!this.isConnected) return null;
    
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async setex(key: string, ttl: number, value: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.setex(key, ttl, value);
    } catch (error) {
      console.error('Redis setex error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isConnected) return 0;
    
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      return 0;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isConnected) return -1;
    
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -1;
    }
  }

  // Health check
  async healthCheck() {
    if (process.env.ENTERPRISE_MODE === 'true') {
      const redis = this.getEnterpriseRedis();
      if (redis) {
        const health = redis.getHealthStatus();
        const metrics = redis.getMetrics();
        
        return {
          status: health.healthy ? 'connected' : 'degraded',
          mode: 'enterprise',
          activeClients: health.activeClients,
          fallbackMode: health.fallbackMode,
          hitRate: `${metrics.hitRate}%`,
          uptime: `${Math.floor(health.uptime / 1000)}s`
        };
      }
      return { status: 'disconnected', mode: 'enterprise' };
    }
    
    if (!this.isConnected) return { status: 'disconnected' };
    
    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      
      return {
        status: 'connected',
        latency: `${latency}ms`
      };
    } catch (error) {
      return { status: 'error', error: (error as Error).message };
    }
  }
}

export const redisService = new RedisService();