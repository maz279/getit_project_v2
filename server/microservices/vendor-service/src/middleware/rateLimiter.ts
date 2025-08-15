/**
 * Rate Limiter Middleware - Amazon.com/Shopee.sg Level Rate Limiting
 * Enterprise-grade rate limiting with Redis support and advanced configuration
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { LoggingService } from '../../../../services/LoggingService';

interface RateLimitConfig {
  points: number;      // Number of requests
  duration: number;    // Per duration in seconds
  blockDuration: number; // Block for duration in seconds
}

const loggingService = new LoggingService();

// Rate limiting configurations for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  default: {
    points: 100,        // 100 requests
    duration: 60,       // per 60 seconds
    blockDuration: 60   // block for 60 seconds
  },
  auth: {
    points: 10,         // 10 requests
    duration: 60,       // per 60 seconds
    blockDuration: 300  // block for 5 minutes
  },
  registration: {
    points: 3,          // 3 requests
    duration: 300,      // per 5 minutes
    blockDuration: 900  // block for 15 minutes
  },
  kyc: {
    points: 5,          // 5 requests
    duration: 300,      // per 5 minutes
    blockDuration: 600  // block for 10 minutes
  },
  analytics: {
    points: 50,         // 50 requests
    duration: 60,       // per 60 seconds
    blockDuration: 60   // block for 60 seconds
  },
  admin: {
    points: 200,        // 200 requests
    duration: 60,       // per 60 seconds
    blockDuration: 60   // block for 60 seconds
  }
};

// Create rate limiters (use Redis if available, fallback to memory)
const createRateLimiter = (config: RateLimitConfig, keyPrefix: string) => {
  const options = {
    keyPrefix,
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration,
    execEvenly: true,
  };

  try {
    // Try to use Redis if available
    if (process.env.REDIS_URL) {
      return new RateLimiterRedis({
        ...options,
        storeClient: require('ioredis').createClient(process.env.REDIS_URL),
      });
    }
  } catch (error) {
    loggingService.warn('Redis not available for rate limiting, using memory store');
  }

  // Fallback to memory store
  return new RateLimiterMemory(options);
};

// Initialize rate limiters
const defaultLimiter = createRateLimiter(rateLimitConfigs.default, 'vendor_default');
const authLimiter = createRateLimiter(rateLimitConfigs.auth, 'vendor_auth');
const registrationLimiter = createRateLimiter(rateLimitConfigs.registration, 'vendor_reg');
const kycLimiter = createRateLimiter(rateLimitConfigs.kyc, 'vendor_kyc');
const analyticsLimiter = createRateLimiter(rateLimitConfigs.analytics, 'vendor_analytics');
const adminLimiter = createRateLimiter(rateLimitConfigs.admin, 'vendor_admin');

/**
 * Generic rate limiter middleware
 */
const createRateLimiterMiddleware = (limiter: any, limitType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || 'unknown';
      
      await limiter.consume(key);
      
      next();
    } catch (rejRes: any) {
      const msBeforeNext = rejRes.msBeforeNext || 60000;
      const totalHits = rejRes.totalHits || 0;
      const remainingPoints = rejRes.remainingPoints || 0;

      loggingService.warn(`Rate limit exceeded for vendor service`, {
        ip: req.ip,
        endpoint: req.path,
        method: req.method,
        limitType,
        totalHits,
        remainingPoints,
        msBeforeNext,
        userAgent: req.get('User-Agent')
      });

      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': rateLimitConfigs[limitType]?.points || 100,
        'X-RateLimit-Remaining': remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
      });

      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please try again in ${Math.round(msBeforeNext / 1000)} seconds.`,
        retryAfter: Math.round(msBeforeNext / 1000),
        limitType
      });
    }
  };
};

/**
 * Default rate limiter for general endpoints
 */
export const rateLimiter = createRateLimiterMiddleware(defaultLimiter, 'default');

/**
 * Authentication rate limiter
 */
export const authRateLimiter = createRateLimiterMiddleware(authLimiter, 'auth');

/**
 * Registration rate limiter
 */
export const registrationRateLimiter = createRateLimiterMiddleware(registrationLimiter, 'registration');

/**
 * KYC rate limiter
 */
export const kycRateLimiter = createRateLimiterMiddleware(kycLimiter, 'kyc');

/**
 * Analytics rate limiter
 */
export const analyticsRateLimiter = createRateLimiterMiddleware(analyticsLimiter, 'analytics');

/**
 * Admin rate limiter
 */
export const adminRateLimiter = createRateLimiterMiddleware(adminLimiter, 'admin');

/**
 * Progressive rate limiter that increases limits for authenticated users
 */
export const progressiveRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.user ? `user_${req.user.id}` : req.ip || 'anonymous';
    
    // Different limits for authenticated vs anonymous users
    const config = req.user 
      ? { points: 200, duration: 60, blockDuration: 60 } // Higher limits for authenticated users
      : { points: 50, duration: 60, blockDuration: 120 }; // Lower limits for anonymous users

    const limiter = createRateLimiter(config, 'vendor_progressive');
    
    await limiter.consume(key);
    
    next();
  } catch (rejRes: any) {
    const msBeforeNext = rejRes.msBeforeNext || 60000;

    loggingService.warn(`Progressive rate limit exceeded`, {
      key: req.user ? `user_${req.user.id}` : req.ip,
      authenticated: !!req.user,
      endpoint: req.path,
      msBeforeNext
    });

    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. ${req.user ? 'Authenticated' : 'Anonymous'} users have different limits.`,
      retryAfter: Math.round(msBeforeNext / 1000)
    });
  }
};

/**
 * Rate limiter for specific vendor actions
 */
export const vendorActionRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.vendorId;
    const action = req.route?.path || req.path;
    const key = vendorId ? `vendor_${vendorId}_${action}` : req.ip || 'unknown';
    
    // Different limits based on action
    let config = rateLimitConfigs.default;
    
    if (action.includes('kyc')) {
      config = rateLimitConfigs.kyc;
    } else if (action.includes('analytics')) {
      config = rateLimitConfigs.analytics;
    } else if (action.includes('register')) {
      config = rateLimitConfigs.registration;
    }

    const limiter = createRateLimiter(config, 'vendor_action');
    
    await limiter.consume(key);
    
    next();
  } catch (rejRes: any) {
    const msBeforeNext = rejRes.msBeforeNext || 60000;

    loggingService.warn(`Vendor action rate limit exceeded`, {
      vendorId: req.params.vendorId,
      action: req.path,
      userId: req.user?.id,
      msBeforeNext
    });

    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Action rate limit exceeded. Please slow down your requests.',
      retryAfter: Math.round(msBeforeNext / 1000)
    });
  }
};

/**
 * Burst rate limiter for high-frequency actions
 */
export const burstRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.user ? `burst_user_${req.user.id}` : `burst_ip_${req.ip}`;
    
    // Very strict burst protection
    const config = {
      points: 20,        // 20 requests
      duration: 10,      // per 10 seconds
      blockDuration: 300 // block for 5 minutes
    };

    const limiter = createRateLimiter(config, 'vendor_burst');
    
    await limiter.consume(key);
    
    next();
  } catch (rejRes: any) {
    const msBeforeNext = rejRes.msBeforeNext || 300000; // 5 minutes default

    loggingService.error(`Burst rate limit exceeded - potential abuse`, {
      key: req.user ? `user_${req.user.id}` : req.ip,
      endpoint: req.path,
      userAgent: req.get('User-Agent'),
      msBeforeNext
    });

    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 300,
    });

    res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'Burst protection activated. Please wait before making more requests.',
      retryAfter: Math.round(msBeforeNext / 1000)
    });
  }
};