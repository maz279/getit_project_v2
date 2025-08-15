import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const key = this.getKey(req);
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup(now);
    
    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      next();
      return;
    }

    const entry = this.store[key];
    
    if (now > entry.resetTime) {
      // Reset the window
      entry.count = 1;
      entry.resetTime = now + this.windowMs;
      next();
      return;
    }

    if (entry.count >= this.maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
      return;
    }

    entry.count++;
    next();
  };

  private getKey(req: Request): string {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(now: number): void {
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}

// Rate limiters for different endpoints
export const kycRateLimiter = new RateLimiter(100, 15 * 60 * 1000).middleware; // 100 requests per 15 minutes
export const strictRateLimiter = new RateLimiter(10, 15 * 60 * 1000).middleware; // 10 requests per 15 minutes
export const uploadRateLimiter = new RateLimiter(5, 60 * 1000).middleware; // 5 uploads per minute