/**
 * Product Service Rate Limiting Middleware
 * Enterprise-level rate limiting for API protection
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

// In-memory store for rate limiting (in production, use Redis)
const store = new Map<string, RateLimitEntry>();

/**
 * Rate limiting middleware factory
 */
export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = 'Too many requests from this IP, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Use IP address as the key (in production, might want to use user ID for authenticated requests)
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Clean up expired entries (simple cleanup)
    for (const [storeKey, entry] of store.entries()) {
      if (now - entry.firstRequest > windowMs) {
        store.delete(storeKey);
      }
    }

    let entry = store.get(key);

    if (!entry) {
      // First request from this IP
      entry = {
        count: 1,
        firstRequest: now
      };
      store.set(key, entry);
    } else if (now - entry.firstRequest > windowMs) {
      // Window has expired, reset
      entry.count = 1;
      entry.firstRequest = now;
    } else {
      // Within the window, increment count
      entry.count++;
    }

    // Set rate limit headers
    const remaining = Math.max(0, max - entry.count);
    const resetTime = new Date(entry.firstRequest + windowMs);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime.toISOString());

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        message,
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Handle response to update rate limit if needed
    const originalSend = res.send;
    res.send = function(body: any) {
      const statusCode = res.statusCode;
      
      // Skip counting successful/failed requests based on options
      if (
        (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) ||
        (skipFailedRequests && (statusCode >= 400 || statusCode >= 500))
      ) {
        // Decrement the count since we're skipping this request
        const currentEntry = store.get(key);
        if (currentEntry && currentEntry.count > 0) {
          currentEntry.count--;
        }
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Specific rate limiters for different operations
 */

// General API rate limiter
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: 'Too many requests, please try again later'
});

// Search rate limiter (more restrictive)
export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests, please slow down'
});

// Create/Update rate limiter (very restrictive)
export const mutationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 mutations per minute
  message: 'Too many create/update requests, please slow down'
});

// Health check rate limiter (generous)
export const healthCheckRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 health checks per minute
  message: 'Too many health check requests'
});