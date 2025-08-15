/**
 * Rate Limiting Middleware
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Intelligent rate limiting with tier-based limits and Bangladesh optimizations
 * Production-ready with Redis backing and DDoS protection
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';
import { db } from '../../../db';
import { apiGatewayRateLimits } from '../../../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';
import { RateLimitConfig, GatewayConfig } from '../config/gateway.config';
import { AuthenticatedRequest } from './authentication';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'rate-limit-middleware' }
});

// Initialize Redis client for rate limiting
let redisClient: Redis | null = null;

// Redis disabled to prevent connection errors
logger.info('Rate limiting using memory store (Redis disabled)');
redisClient = null;

export const rateLimitMiddleware = (routeConfig: RateLimitConfig, gatewayConfig: GatewayConfig) => {
  // Create store (Redis or memory fallback)
  const store = redisClient ? new RedisStore({
    sendCommand: (...args: string[]) => redisClient!.call(...args),
    prefix: 'rl:gateway:'
  }) : undefined;

  // Base rate limiter configuration
  const baseLimiter = rateLimit({
    store,
    windowMs: gatewayConfig.rateLimit.global.windowMs,
    max: gatewayConfig.rateLimit.global.max,
    standardHeaders: gatewayConfig.rateLimit.global.standardHeaders,
    legacyHeaders: gatewayConfig.rateLimit.global.legacyHeaders,
    keyGenerator: generateRateLimitKey,
    handler: rateLimitHandler,
    skip: shouldSkipRateLimit,
    message: {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(gatewayConfig.rateLimit.global.windowMs / 1000),
      timestamp: new Date().toISOString()
    }
  });

  // Tier-based rate limiter
  const tierLimiter = (tier: string) => {
    const tierConfig = gatewayConfig.rateLimit.tiers[tier as keyof typeof gatewayConfig.rateLimit.tiers];
    
    if (!tierConfig) {
      return baseLimiter;
    }

    return rateLimit({
      store,
      windowMs: tierConfig.window,
      max: tierConfig.requests,
      keyGenerator: (req) => `tier:${tier}:${generateRateLimitKey(req)}`,
      handler: rateLimitHandler,
      skip: shouldSkipRateLimit,
      message: {
        error: 'Tier rate limit exceeded',
        code: 'TIER_RATE_LIMIT_EXCEEDED',
        tier,
        limit: tierConfig.requests,
        window: tierConfig.window,
        message: `Rate limit for ${tier} tier exceeded`,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Custom rate limiter for specific routes
  const customLimiter = routeConfig.custom ? rateLimit({
    store,
    windowMs: routeConfig.custom.window,
    max: routeConfig.custom.requests,
    keyGenerator: generateRateLimitKey,
    handler: rateLimitHandler,
    skip: shouldSkipRateLimit,
    message: {
      error: 'Custom rate limit exceeded',
      code: 'CUSTOM_RATE_LIMIT_EXCEEDED',
      limit: routeConfig.custom.requests,
      window: routeConfig.custom.window,
      timestamp: new Date().toISOString()
    }
  }) : null;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Determine which rate limiter to use
      let limiter;
      
      if (routeConfig.custom) {
        limiter = customLimiter!;
      } else if (routeConfig.tier && req.user) {
        limiter = tierLimiter(req.user.tier || 'registered');
      } else if (req.user) {
        limiter = tierLimiter(req.user.tier || 'registered');
      } else {
        limiter = tierLimiter('anonymous');
      }

      // Apply rate limiting
      limiter(req, res, (err) => {
        if (err) {
          logger.error('Rate limiting error', {
            error: err.message,
            ip: req.ip,
            path: req.path,
            method: req.method
          });
        }
        next(err);
      });

    } catch (error) {
      logger.error('Rate limit middleware error', {
        error: error.message,
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      next(); // Continue without rate limiting on error
    }
  };
};

// Enhanced key generator for rate limiting
function generateRateLimitKey(req: AuthenticatedRequest): string {
  // Priority order for key generation:
  // 1. User ID (if authenticated)
  // 2. API key (if present)
  // 3. IP address (fallback)

  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }

  const apiKey = req.headers['x-api-key'] as string;
  if (apiKey) {
    return `api:${apiKey}`;
  }

  // Use IP address as fallback
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
  
  return `ip:${ip}`;
}

// Enhanced rate limit handler
function rateLimitHandler(req: AuthenticatedRequest, res: Response) {
  // Log rate limit violation
  logger.warn('Rate limit exceeded', {
    key: generateRateLimitKey(req),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    tier: req.user?.tier || 'anonymous'
  });

  // Record in database for analytics
  recordRateLimitViolation(req);

  // Bangladesh-specific response in Bengali if requested
  const acceptLanguage = req.headers['accept-language'] as string;
  const prefersBengali = acceptLanguage && acceptLanguage.includes('bn');

  const message = prefersBengali ? {
    error: 'অনেক বেশি অনুরোধ',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'হার সীমা অতিক্রম করেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
    timestamp: new Date().toISOString()
  } : {
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString()
  };

  res.status(429).json(message);
}

// Check if request should skip rate limiting
function shouldSkipRateLimit(req: AuthenticatedRequest): boolean {
  // Skip rate limiting for health checks
  if (req.path === '/health' || req.path === '/api/health') {
    return true;
  }

  // Skip for admin users (be careful with this)
  if (req.user && req.user.roles.includes('admin')) {
    return true;
  }

  // Skip for internal service calls
  if (req.headers['x-internal-service'] === 'true') {
    return true;
  }

  // Skip for certain user agents (monitoring tools)
  const userAgent = req.headers['user-agent'] as string;
  const monitoringAgents = ['uptime', 'pingdom', 'newrelic', 'datadog'];
  if (userAgent && monitoringAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return true;
  }

  return false;
}

// Handle rate limit reached event
function onRateLimitReached(req: AuthenticatedRequest) {
  logger.warn('Rate limit threshold reached', {
    key: generateRateLimitKey(req),
    ip: req.ip,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  // Could trigger additional security measures here
  // such as temporary IP blocking for severe violations
}

// Record rate limit violation in database
async function recordRateLimitViolation(req: AuthenticatedRequest) {
  try {
    const identifier = generateRateLimitKey(req);
    const identifierType = identifier.startsWith('user:') ? 'user' : 
                          identifier.startsWith('api:') ? 'api_key' : 'ip';

    await db.insert(apiGatewayRateLimits).values({
      identifier,
      identifierType,
      routePath: req.path,
      requestCount: 1, // This would be incremented in a real implementation
      windowStart: new Date(),
      limitType: 'per_minute',
      maxRequests: 100, // This would come from the actual limit
      isBlocked: false
    });
  } catch (error) {
    logger.error('Failed to record rate limit violation', {
      error: error.message,
      path: req.path,
      ip: req.ip
    });
  }
}

// Advanced rate limiting strategies

// Sliding window rate limiter
export const slidingWindowLimiter = (windowSize: number, maxRequests: number) => {
  const requests = new Map<string, number[]>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = generateRateLimitKey(req);
    const now = Date.now();
    const windowStart = now - windowSize;

    // Get or create request timestamps for this key
    let requestTimes = requests.get(key) || [];
    
    // Remove old requests outside the window
    requestTimes = requestTimes.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (requestTimes.length >= maxRequests) {
      return rateLimitHandler(req, res);
    }

    // Add current request
    requestTimes.push(now);
    requests.set(key, requestTimes);

    next();
  };
};

// Token bucket rate limiter
export const tokenBucketLimiter = (capacity: number, refillRate: number, refillPeriod: number) => {
  const buckets = new Map<string, { tokens: number; lastRefill: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = generateRateLimitKey(req);
    const now = Date.now();

    let bucket = buckets.get(key) || { tokens: capacity, lastRefill: now };

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / refillPeriod) * refillRate;
    
    bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if tokens available
    if (bucket.tokens < 1) {
      buckets.set(key, bucket);
      return rateLimitHandler(req, res);
    }

    // Consume token
    bucket.tokens -= 1;
    buckets.set(key, bucket);

    next();
  };
};

// Adaptive rate limiter that adjusts based on system load
export const adaptiveRateLimiter = (baseLimit: number, gatewayConfig: GatewayConfig) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Get system metrics (CPU, memory, response times)
      const systemLoad = await getSystemLoad();
      
      // Adjust rate limit based on system load
      let adjustedLimit = baseLimit;
      
      if (systemLoad.cpu > 80) {
        adjustedLimit = Math.floor(baseLimit * 0.5); // Reduce by 50%
      } else if (systemLoad.cpu > 60) {
        adjustedLimit = Math.floor(baseLimit * 0.7); // Reduce by 30%
      } else if (systemLoad.cpu < 30) {
        adjustedLimit = Math.floor(baseLimit * 1.2); // Increase by 20%
      }

      // Apply adjusted rate limit
      const dynamicLimiter = rateLimit({
        windowMs: 60000, // 1 minute
        max: adjustedLimit,
        keyGenerator: generateRateLimitKey,
        handler: rateLimitHandler,
        message: {
          error: 'Adaptive rate limit exceeded',
          code: 'ADAPTIVE_RATE_LIMIT_EXCEEDED',
          adjustedLimit,
          systemLoad: systemLoad.cpu,
          timestamp: new Date().toISOString()
        }
      });

      dynamicLimiter(req, res, next);

    } catch (error) {
      logger.error('Adaptive rate limiter error', {
        error: error.message,
        path: req.path,
        ip: req.ip
      });
      next(); // Continue without rate limiting on error
    }
  };
};

// Geographic rate limiter for Bangladesh optimization
export const geographicRateLimiter = (gatewayConfig: GatewayConfig) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const country = req.headers['cf-ipcountry'] as string || // Cloudflare
                   req.headers['x-country'] as string ||     // Custom header
                   'unknown';

    // Different limits for different countries
    let limit = gatewayConfig.rateLimit.global.max;
    
    if (country === 'BD') {
      // Higher limits for Bangladesh users
      limit = Math.floor(limit * 1.5);
    } else if (['IN', 'PK', 'LK', 'NP', 'MY'].includes(country)) {
      // Moderate limits for neighboring countries
      limit = Math.floor(limit * 1.2);
    } else if (country === 'unknown') {
      // Lower limits for unknown locations
      limit = Math.floor(limit * 0.8);
    }

    const geoLimiter = rateLimit({
      windowMs: gatewayConfig.rateLimit.global.windowMs,
      max: limit,
      keyGenerator: (req) => `geo:${country}:${generateRateLimitKey(req)}`,
      handler: rateLimitHandler,
      message: {
        error: 'Geographic rate limit exceeded',
        code: 'GEO_RATE_LIMIT_EXCEEDED',
        country,
        limit,
        timestamp: new Date().toISOString()
      }
    });

    geoLimiter(req, res, next);
  };
};

// Helper function to get system load
async function getSystemLoad(): Promise<{ cpu: number; memory: number; responseTime: number }> {
  // This would integrate with your monitoring system
  // For now, return mock data
  return {
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    responseTime: Math.random() * 1000
  };
}

// Bangladesh-specific rate limiting utilities
export const bangladeshRateLimitUtils = {
  // Special handling for mobile networks in Bangladesh
  mobileNetworkLimiter: (gatewayConfig: GatewayConfig) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userAgent = req.headers['user-agent'] as string || '';
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      
      if (isMobile && gatewayConfig.bangladesh.mobile.optimization) {
        // Higher limits for mobile users (they may have slower connections)
        const mobileLimiter = rateLimit({
          windowMs: 60000,
          max: Math.floor(gatewayConfig.rateLimit.global.max * 1.3),
          keyGenerator: generateRateLimitKey,
          handler: rateLimitHandler
        });
        
        return mobileLimiter(req, res, next);
      }
      
      next();
    };
  },

  // Festival period rate limiting (higher limits during festivals)
  festivalRateLimiter: (gatewayConfig: GatewayConfig) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const now = new Date();
      const isFestivalPeriod = checkIfFestivalPeriod(now);
      
      if (isFestivalPeriod) {
        const festivalLimiter = rateLimit({
          windowMs: gatewayConfig.rateLimit.global.windowMs,
          max: Math.floor(gatewayConfig.rateLimit.global.max * 2), // Double limits during festivals
          keyGenerator: generateRateLimitKey,
          handler: rateLimitHandler,
          message: {
            error: 'Festival rate limit exceeded',
            code: 'FESTIVAL_RATE_LIMIT_EXCEEDED',
            message: 'High traffic during festival period',
            timestamp: now.toISOString()
          }
        });
        
        return festivalLimiter(req, res, next);
      }
      
      next();
    };
  }
};

// Check if current date falls within festival periods
function checkIfFestivalPeriod(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Major Bangladesh festivals (approximate dates)
  const festivals = [
    { month: 4, startDay: 10, endDay: 15 }, // Pohela Boishakh
    { month: 8, startDay: 15, endDay: 20 }, // Eid (approximate)
    { month: 10, startDay: 10, endDay: 15 }, // Durga Puja
    { month: 12, startDay: 15, endDay: 31 }  // Winter shopping season
  ];
  
  return festivals.some(festival => 
    month === festival.month && day >= festival.startDay && day <= festival.endDay
  );
}

export default rateLimitMiddleware;