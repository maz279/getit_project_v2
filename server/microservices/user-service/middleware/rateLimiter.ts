import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter configurations for different endpoints
const loginLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 5, // Number of attempts
  duration: 900, // Per 15 minutes (in seconds)
  blockDuration: 900, // Block for 15 minutes if limit exceeded
  execEvenly: true, // Spread requests evenly across duration
});

const registerLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 3, // Number of registration attempts
  duration: 3600, // Per 1 hour
  blockDuration: 3600, // Block for 1 hour if limit exceeded
});

const generalLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 100, // Number of requests
  duration: 900, // Per 15 minutes
  blockDuration: 60, // Block for 1 minute if limit exceeded
});

const passwordChangeLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 3, // Number of password change attempts
  duration: 3600, // Per 1 hour
  blockDuration: 3600, // Block for 1 hour if limit exceeded
});

/**
 * Dynamic rate limiter middleware that selects appropriate limiter based on endpoint
 */
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let limiter: RateLimiterMemory;
    let limitType = 'general';
    
    // Select appropriate limiter based on endpoint
    if (req.path.includes('/login')) {
      limiter = loginLimiter;
      limitType = 'login';
    } else if (req.path.includes('/register')) {
      limiter = registerLimiter;
      limitType = 'registration';
    } else if (req.path.includes('/change-password')) {
      limiter = passwordChangeLimiter;
      limitType = 'password_change';
    } else {
      limiter = generalLimiter;
      limitType = 'general';
    }
    
    // Apply rate limiting
    const resRateLimiter = await limiter.consume(req.ip || 'unknown');
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limiter.points);
    res.setHeader('X-RateLimit-Remaining', resRateLimiter.remainingPoints);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + resRateLimiter.msBeforeNext));
    
    next();
    
  } catch (rejRes: any) {
    // Rate limit exceeded
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    res.setHeader('Retry-After', secs);
    res.setHeader('X-RateLimit-Limit', rejRes.totalHits);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rejRes.msBeforeNext));
    
    let message = 'Too many requests. Please try again later.';
    let code = 'RATE_LIMIT_EXCEEDED';
    
    // Customize message based on limit type
    switch (req.path) {
      case '/login':
        message = 'Too many login attempts. Please try again in 15 minutes.';
        code = 'LOGIN_RATE_LIMIT_EXCEEDED';
        break;
      case '/register':
        message = 'Too many registration attempts. Please try again in 1 hour.';
        code = 'REGISTRATION_RATE_LIMIT_EXCEEDED';
        break;
      case '/change-password':
        message = 'Too many password change attempts. Please try again in 1 hour.';
        code = 'PASSWORD_CHANGE_RATE_LIMIT_EXCEEDED';
        break;
      default:
        message = `Too many requests. Please try again in ${secs} seconds.`;
        code = 'GENERAL_RATE_LIMIT_EXCEEDED';
    }
    
    res.status(429).json({
      success: false,
      message,
      code,
      retryAfter: secs,
      resetTime: new Date(Date.now() + rejRes.msBeforeNext).toISOString()
    });
  }
};

/**
 * Enhanced rate limiter for sensitive operations
 * Used for operations like email verification, password reset, etc.
 */
export const strictRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 2, // Very limited attempts
  duration: 3600, // Per 1 hour
  blockDuration: 7200, // Block for 2 hours if limit exceeded
});

/**
 * Rate limiter for OTP/verification codes
 */
export const otpRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 5, // Number of OTP attempts
  duration: 900, // Per 15 minutes
  blockDuration: 1800, // Block for 30 minutes if limit exceeded
});

/**
 * Progressive rate limiter that increases block duration on repeated violations
 */
export class ProgressiveRateLimiter {
  private violations: Map<string, number> = new Map();
  
  constructor(
    private baseLimiter: RateLimiterMemory,
    private baseBlockDuration: number = 300 // 5 minutes base
  ) {}
  
  async consume(key: string): Promise<any> {
    try {
      const result = await this.baseLimiter.consume(key);
      // Reset violations on successful consumption
      this.violations.delete(key);
      return result;
    } catch (rejRes: any) {
      // Increase violation count
      const currentViolations = this.violations.get(key) || 0;
      this.violations.set(key, currentViolations + 1);
      
      // Calculate progressive block duration
      const multiplier = Math.pow(2, Math.min(currentViolations, 5)); // Cap at 32x
      const progressiveBlockDuration = this.baseBlockDuration * multiplier;
      
      // Update the rejection response with progressive duration
      rejRes.msBeforeNext = progressiveBlockDuration * 1000;
      
      throw rejRes;
    }
  }
}

// Export progressive rate limiter instance for critical endpoints
export const progressiveLoginLimiter = new ProgressiveRateLimiter(
  new RateLimiterMemory({
    keyGenerator: (req: Request) => req.ip || 'unknown',
    points: 3,
    duration: 900,
    blockDuration: 300, // Base 5 minutes, will be progressive
  }),
  300 // 5 minutes base block duration
);