import { Request, Response, NextFunction } from 'express';
import { redisService } from '../../../../services/RedisService';

/**
 * Rate Limiting Middleware
 * Amazon.com/Shopee.sg-level rate limiting with Redis support
 */

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  keyGenerator?: (req: Request) => string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  skipFailedRequests: false,
  skipSuccessfulRequests: false
};

export const rateLimitMiddleware = (max: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip rate limiting if Redis is disabled
      const healthCheck = await redisService.healthCheck();
      if (!healthCheck.connected) {
        console.warn('⚠️ Rate limiting disabled - Redis not available');
        return next();
      }

      const windowMs = windowSeconds * 1000;
      const key = `rate_limit:${req.ip}:${req.path}`;
      
      // Get current count
      const current = await redisService.get(key);
      const currentCount = current ? parseInt(current, 10) : 0;

      if (currentCount >= max) {
        // Rate limit exceeded
        const ttl = await redisService.ttl(key);
        res.set({
          'X-RateLimit-Limit': max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + ttl * 1000).toISOString()
        });

        return res.status(429).json({
          success: false,
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${ttl} seconds.`,
          retryAfter: ttl
        });
      }

      // Increment counter
      if (currentCount === 0) {
        // First request in window
        await redisService.set(key, '1', windowSeconds);
      } else {
        // Increment existing counter
        await redisService.incr(key);
      }

      // Set headers
      res.set({
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': (max - currentCount - 1).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      next();
    } catch (error) {
      // If Redis is down, allow request but log error
      console.error('Rate limiting error:', error);
      next();
    }
  };
};

export const createRateLimit = (options: Partial<RateLimitOptions> = {}) => {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keyGen = opts.keyGenerator || ((req: Request) => `rate_limit:${req.ip}:${req.path}`);
      const key = keyGen(req);
      
      const current = await redisService.get(key);
      const currentCount = current ? parseInt(current, 10) : 0;

      if (currentCount >= opts.max) {
        const ttl = await redisService.ttl(key);
        
        res.set({
          'X-RateLimit-Limit': opts.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + ttl * 1000).toISOString()
        });

        return res.status(429).json({
          success: false,
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(ttl)} seconds.`,
          retryAfter: ttl
        });
      }

      // Increment counter
      if (currentCount === 0) {
        await redisService.set(key, '1', Math.ceil(opts.windowMs / 1000));
      } else {
        await redisService.incr(key);
      }

      // Set response headers
      res.set({
        'X-RateLimit-Limit': opts.max.toString(),
        'X-RateLimit-Remaining': (opts.max - currentCount - 1).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + opts.windowMs).toISOString()
      });

      next();
    } catch (error) {
      // Fail open - allow request if rate limiting fails
      console.error('Rate limiting error:', error);
      next();
    }
  };
};