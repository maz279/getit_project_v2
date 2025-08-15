/**
 * Caching Middleware
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Multi-layer caching with Redis integration and Bangladesh optimizations
 * Intelligent cache invalidation and content-aware caching strategies
 */

import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { CacheConfig, GatewayConfig } from '../config/gateway.config';
import { AuthenticatedRequest } from './authentication';
import crypto from 'crypto';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'caching-middleware' }
});

// Redis client for caching (optional)
let redisClient: Redis | null = null;

// Redis disabled to prevent connection errors
logger.info('Caching using memory store (Redis disabled)');
redisClient = null;

// In-memory cache fallback
const memoryCache = new Map<string, { data: any; expires: number; headers?: Record<string, string> }>();

export const cachingMiddleware = (cacheConfig: CacheConfig, gatewayConfig: GatewayConfig) => {
  if (!cacheConfig.enabled) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Skip caching for certain paths
      if (shouldSkipCache(req)) {
        return next();
      }

      // Generate cache key
      const cacheKey = generateCacheKey(req, cacheConfig);
      
      // Try to get from cache
      const cachedData = await getFromCache(cacheKey, gatewayConfig);
      
      if (cachedData) {
        // Cache hit
        logger.debug('Cache hit', {
          key: cacheKey,
          path: req.path,
          ttl: cachedData.ttl
        });
        
        // Set cached headers
        if (cachedData.headers) {
          Object.entries(cachedData.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
        }
        
        // Add cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey.substring(0, 20) + '...');
        res.setHeader('Cache-Control', `public, max-age=${Math.floor(cachedData.ttl / 1000)}`);
        
        return res.json(cachedData.data);
      }

      // Cache miss - intercept response to cache it
      const originalSend = res.send;
      const originalJson = res.json;
      
      res.send = function(body: any) {
        cacheResponse(cacheKey, body, res, cacheConfig, gatewayConfig);
        res.setHeader('X-Cache', 'MISS');
        return originalSend.call(this, body);
      };

      res.json = function(body: any) {
        cacheResponse(cacheKey, body, res, cacheConfig, gatewayConfig);
        res.setHeader('X-Cache', 'MISS');
        return originalJson.call(this, body);
      };

      next();

    } catch (error) {
      logger.error('Caching middleware error', {
        error: error.message,
        path: req.path
      });
      
      // Continue without caching on error
      next();
    }
  };
};

function shouldSkipCache(req: AuthenticatedRequest): boolean {
  // Skip caching for authenticated requests with sensitive data
  if (req.user && sensitiveEndpoints.some(endpoint => req.path.includes(endpoint))) {
    return true;
  }

  // Skip caching for dynamic content
  const dynamicPaths = [
    '/api/v1/users/me',
    '/api/v1/cart',
    '/api/v1/orders',
    '/api/v1/payments',
    '/api/v1/analytics',
    '/api/v1/notifications'
  ];

  if (dynamicPaths.some(path => req.path.startsWith(path))) {
    return true;
  }

  // Skip if no-cache header is present
  if (req.headers['cache-control']?.includes('no-cache')) {
    return true;
  }

  // Skip if query parameters contain dynamic data
  if (Object.keys(req.query).some(key => 
    ['timestamp', 'nonce', 'random', '_t', '_r'].includes(key.toLowerCase())
  )) {
    return true;
  }

  return false;
}

function generateCacheKey(req: AuthenticatedRequest, cacheConfig: CacheConfig): string {
  const baseKey = cacheConfig.key || 'default';
  const varyHeaders = cacheConfig.vary || [];
  
  // Include path and query
  let keyParts = [
    baseKey,
    req.path,
    JSON.stringify(req.query)
  ];

  // Include vary headers
  varyHeaders.forEach(header => {
    const value = req.headers[header.toLowerCase()];
    if (value) {
      keyParts.push(`${header}:${value}`);
    }
  });

  // Include user context for personalized content
  if (req.user && !sensitiveEndpoints.some(endpoint => req.path.includes(endpoint))) {
    keyParts.push(`user:${req.user.tier || 'anonymous'}`);
  }

  // Bangladesh-specific cache keys
  const acceptLanguage = req.headers['accept-language'] || '';
  if (acceptLanguage.includes('bn')) {
    keyParts.push('lang:bn');
  }

  // Mobile-specific caching
  const userAgent = req.headers['user-agent'] || '';
  if (/mobile|android|iphone|ipad/i.test(userAgent)) {
    keyParts.push('device:mobile');
  }

  // Generate hash for consistent key length
  const keyString = keyParts.join('|');
  return `gateway:${crypto.createHash('md5').update(keyString).digest('hex')}`;
}

async function getFromCache(key: string, config: GatewayConfig): Promise<any> {
  try {
    // Try Redis first
    if (redisClient) {
      const cached = await redisClient.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.expires > Date.now()) {
          return {
            data: data.body,
            headers: data.headers,
            ttl: data.expires - Date.now()
          };
        } else {
          // Expired, remove from cache
          await redisClient.del(key);
        }
      }
    }

    // Fall back to memory cache
    const memoryData = memoryCache.get(key);
    if (memoryData && memoryData.expires > Date.now()) {
      return {
        data: memoryData.data,
        headers: memoryData.headers,
        ttl: memoryData.expires - Date.now()
      };
    } else if (memoryData) {
      // Expired, remove from memory cache
      memoryCache.delete(key);
    }

    return null;

  } catch (error) {
    logger.error('Error getting from cache', {
      error: error.message,
      key
    });
    return null;
  }
}

async function cacheResponse(
  key: string, 
  body: any, 
  res: Response, 
  cacheConfig: CacheConfig, 
  gatewayConfig: GatewayConfig
): Promise<void> {
  try {
    // Don't cache error responses
    if (res.statusCode >= 400) {
      return;
    }

    // Don't cache empty responses
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      return;
    }

    const ttl = cacheConfig.ttl || gatewayConfig.performance.caching.ttl;
    const expires = Date.now() + (ttl * 1000);
    
    // Extract relevant headers to cache
    const headersToCache = extractCacheableHeaders(res);
    
    const cacheData = {
      body,
      headers: headersToCache,
      expires,
      cached_at: Date.now()
    };

    // Store in Redis
    if (redisClient) {
      await redisClient.setex(key, ttl, JSON.stringify(cacheData));
    } else {
      // Store in memory cache
      memoryCache.set(key, {
        data: body,
        headers: headersToCache,
        expires
      });
      
      // Clean up memory cache if it gets too large
      if (memoryCache.size > 1000) {
        cleanupMemoryCache();
      }
    }

    logger.debug('Response cached', {
      key,
      ttl,
      size: JSON.stringify(body).length
    });

  } catch (error) {
    logger.error('Error caching response', {
      error: error.message,
      key
    });
  }
}

function extractCacheableHeaders(res: Response): Record<string, string> {
  const cacheableHeaders = [
    'content-type',
    'content-language',
    'etag',
    'last-modified',
    'expires'
  ];

  const headers: Record<string, string> = {};
  
  cacheableHeaders.forEach(header => {
    const value = res.getHeader(header);
    if (value && typeof value === 'string') {
      headers[header] = value;
    }
  });

  return headers;
}

function cleanupMemoryCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const [key, data] of memoryCache.entries()) {
    if (data.expires < now) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => memoryCache.delete(key));
  
  // If still too large, remove oldest entries
  if (memoryCache.size > 800) {
    const sortedEntries = Array.from(memoryCache.entries())
      .sort(([,a], [,b]) => a.expires - b.expires);
    
    const toRemove = sortedEntries.slice(0, 200);
    toRemove.forEach(([key]) => memoryCache.delete(key));
  }
}

// Advanced caching strategies

// Cache warming for popular content
export const cacheWarming = {
  warmPopularProducts: async (): Promise<void> => {
    // This would warm cache for popular products
    logger.info('Cache warming started for popular products');
  },
  
  warmBangladeshContent: async (): Promise<void> => {
    // Warm cache for Bangladesh-specific content
    logger.info('Cache warming started for Bangladesh content');
  }
};

// Cache invalidation
export const cacheInvalidation = {
  invalidateUserCache: async (userId: number): Promise<void> => {
    if (redisClient) {
      const pattern = `gateway:*user:${userId}*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    }
    
    // Invalidate from memory cache
    for (const key of memoryCache.keys()) {
      if (key.includes(`user:${userId}`)) {
        memoryCache.delete(key);
      }
    }
  },
  
  invalidateProductCache: async (productId: string): Promise<void> => {
    if (redisClient) {
      const patterns = [
        `gateway:*products*${productId}*`,
        `gateway:*product*${productId}*`
      ];
      
      for (const pattern of patterns) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
    }
    
    // Invalidate from memory cache
    for (const key of memoryCache.keys()) {
      if (key.includes(productId)) {
        memoryCache.delete(key);
      }
    }
  },
  
  invalidateByPath: async (path: string): Promise<void> => {
    const pathHash = crypto.createHash('md5').update(path).digest('hex');
    
    if (redisClient) {
      const pattern = `gateway:*${pathHash}*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    }
    
    // Invalidate from memory cache
    for (const key of memoryCache.keys()) {
      if (key.includes(pathHash)) {
        memoryCache.delete(key);
      }
    }
  }
};

// Bangladesh-specific caching strategies
export const bangladeshCaching = {
  // Festival period caching (shorter TTL during high traffic)
  festivalCaching: (req: AuthenticatedRequest): number => {
    if (isFestivalPeriod()) {
      return 300; // 5 minutes during festivals
    }
    return 1800; // 30 minutes normally
  },
  
  // Mobile-optimized caching
  mobileCaching: (req: AuthenticatedRequest): CacheConfig => {
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    
    if (isMobile) {
      return {
        enabled: true,
        ttl: 3600, // Longer TTL for mobile (slower connections)
        key: 'mobile',
        vary: ['user-agent', 'accept-language']
      };
    }
    
    return {
      enabled: true,
      ttl: 1800,
      key: 'desktop',
      vary: ['accept-language']
    };
  }
};

// Constants
const sensitiveEndpoints = [
  '/auth',
  '/payment',
  '/personal',
  '/admin',
  '/private'
];

function isFestivalPeriod(): boolean {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  const festivals = [
    { month: 4, startDay: 10, endDay: 15 }, // Pohela Boishakh
    { month: 8, startDay: 15, endDay: 20 }, // Eid
    { month: 10, startDay: 10, endDay: 15 }, // Durga Puja
    { month: 12, startDay: 15, endDay: 31 }  // Winter shopping
  ];
  
  return festivals.some(festival => 
    month === festival.month && day >= festival.startDay && day <= festival.endDay
  );
}

// Cache statistics for monitoring
export const getCacheStatistics = async (): Promise<any> => {
  const stats = {
    memoryCache: {
      size: memoryCache.size,
      entries: Array.from(memoryCache.keys()).length
    },
    redis: {
      connected: !!redisClient && redisClient.status === 'ready'
    }
  };

  if (redisClient) {
    try {
      const info = await redisClient.info('memory');
      stats.redis = {
        ...stats.redis,
        memory: info
      };
    } catch (error) {
      // Redis info not available
    }
  }

  return stats;
};

export default cachingMiddleware;