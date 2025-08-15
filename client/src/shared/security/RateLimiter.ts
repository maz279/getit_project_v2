/**
 * Phase 2: Security Hardening  
 * Comprehensive Rate Limiting Implementation
 * Investment: $5,000 | Week 3-4
 */

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any) => void;
  whitelist?: string[];
  blacklist?: string[];
}

// Rate limit result
interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  totalRequests: number;
  windowStart: number;
}

// Request tracking
interface RequestRecord {
  count: number;
  windowStart: number;
  lastRequest: number;
  failures: number;
}

/**
 * In-memory rate limiter with advanced features
 */
export class InMemoryRateLimiter {
  private records = new Map<string, RequestRecord>();
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req: any) => req.ip || 'anonymous',
      whitelist: [],
      blacklist: [],
      ...config
    };

    // Start cleanup process
    this.startCleanup();
  }

  /**
   * Check if request is allowed
   */
  checkLimit(identifier: string, isSuccess = true): RateLimitResult {
    const now = Date.now();
    const key = identifier;

    // Check whitelist/blacklist
    if (this.config.blacklist?.includes(key)) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + this.config.windowMs,
        totalRequests: this.config.maxRequests + 1,
        windowStart: now
      };
    }

    if (this.config.whitelist?.includes(key)) {
      return {
        allowed: true,
        remainingRequests: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        totalRequests: 0,
        windowStart: now
      };
    }

    // Get or create record
    let record = this.records.get(key);
    
    if (!record || this.isWindowExpired(record, now)) {
      record = {
        count: 0,
        windowStart: now,
        lastRequest: now,
        failures: 0
      };
      this.records.set(key, record);
    }

    // Update record
    record.lastRequest = now;
    
    // Skip counting based on configuration
    const shouldCount = (isSuccess && !this.config.skipSuccessfulRequests) ||
                       (!isSuccess && !this.config.skipFailedRequests);
    
    if (shouldCount) {
      record.count++;
    }

    if (!isSuccess) {
      record.failures++;
    }

    // Check limit
    const allowed = record.count <= this.config.maxRequests;
    const remainingRequests = Math.max(0, this.config.maxRequests - record.count);
    const resetTime = record.windowStart + this.config.windowMs;

    // Trigger callback if limit reached
    if (!allowed && this.config.onLimitReached) {
      this.config.onLimitReached({ ip: key, record });
    }

    return {
      allowed,
      remainingRequests,
      resetTime,
      totalRequests: record.count,
      windowStart: record.windowStart
    };
  }

  /**
   * Check if time window has expired
   */
  private isWindowExpired(record: RequestRecord, now: number): boolean {
    return (now - record.windowStart) >= this.config.windowMs;
  }

  /**
   * Start cleanup process for expired records
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, Math.min(this.config.windowMs, 60000)); // Cleanup every minute or window, whichever is smaller
  }

  /**
   * Remove expired records
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.records.forEach((record, key) => {
      if (this.isWindowExpired(record, now)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.records.delete(key);
    });
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalKeys: number;
    totalRequests: number;
    averageRequestsPerKey: number;
    topRequesters: Array<{ key: string; requests: number }>;
  } {
    let totalRequests = 0;
    const requesters: Array<{ key: string; requests: number }> = [];

    this.records.forEach((record, key) => {
      totalRequests += record.count;
      requesters.push({ key, requests: record.count });
    });

    requesters.sort((a, b) => b.requests - a.requests);

    return {
      totalKeys: this.records.size,
      totalRequests,
      averageRequestsPerKey: this.records.size > 0 ? totalRequests / this.records.size : 0,
      topRequesters: requesters.slice(0, 10)
    };
  }

  /**
   * Reset limits for a specific key
   */
  resetKey(key: string): boolean {
    return this.records.delete(key);
  }

  /**
   * Clear all records
   */
  reset(): void {
    this.records.clear();
  }

  /**
   * Destroy rate limiter
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.reset();
  }
}

/**
 * Sliding window rate limiter for more precise control
 */
export class SlidingWindowRateLimiter {
  private requests = new Map<string, number[]>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check rate limit with sliding window
   */
  checkLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create request timestamps
    let timestamps = this.requests.get(identifier) || [];
    
    // Remove old timestamps
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    // Add current request
    timestamps.push(now);
    
    // Update storage
    this.requests.set(identifier, timestamps);

    // Check limit
    const allowed = timestamps.length <= this.config.maxRequests;
    const remainingRequests = Math.max(0, this.config.maxRequests - timestamps.length);

    return {
      allowed,
      remainingRequests,
      resetTime: Math.min(...timestamps) + this.config.windowMs,
      totalRequests: timestamps.length,
      windowStart: windowStart
    };
  }

  /**
   * Cleanup old entries
   */
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;

    this.requests.forEach((timestamps, key) => {
      const filtered = timestamps.filter(timestamp => timestamp > cutoff);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    });
  }
}

/**
 * Rate limiter for different types of operations
 */
export class SearchRateLimiter {
  private searchLimiter: InMemoryRateLimiter;
  private suggestionLimiter: InMemoryRateLimiter;
  private aiLimiter: InMemoryRateLimiter;
  private voiceLimiter: InMemoryRateLimiter;
  private imageLimiter: InMemoryRateLimiter;

  constructor() {
    // Search queries: 100 per minute
    this.searchLimiter = new InMemoryRateLimiter({
      windowMs: 60000,
      maxRequests: 100,
      onLimitReached: (req) => console.warn(`Search rate limit exceeded for ${req.ip}`)
    });

    // Auto-suggestions: 200 per minute
    this.suggestionLimiter = new InMemoryRateLimiter({
      windowMs: 60000,
      maxRequests: 200,
      skipFailedRequests: true
    });

    // AI search: 20 per minute (more resource intensive)
    this.aiLimiter = new InMemoryRateLimiter({
      windowMs: 60000,
      maxRequests: 20,
      onLimitReached: (req) => console.warn(`AI search rate limit exceeded for ${req.ip}`)
    });

    // Voice search: 30 per minute
    this.voiceLimiter = new InMemoryRateLimiter({
      windowMs: 60000,
      maxRequests: 30
    });

    // Image search: 10 per minute (resource intensive)
    this.imageLimiter = new InMemoryRateLimiter({
      windowMs: 60000,
      maxRequests: 10
    });
  }

  /**
   * Check search query limit
   */
  checkSearchLimit(identifier: string): RateLimitResult {
    return this.searchLimiter.checkLimit(identifier);
  }

  /**
   * Check suggestion limit
   */
  checkSuggestionLimit(identifier: string): RateLimitResult {
    return this.suggestionLimiter.checkLimit(identifier);
  }

  /**
   * Check AI search limit
   */
  checkAILimit(identifier: string): RateLimitResult {
    return this.aiLimiter.checkLimit(identifier);
  }

  /**
   * Check voice search limit
   */
  checkVoiceLimit(identifier: string): RateLimitResult {
    return this.voiceLimiter.checkLimit(identifier);
  }

  /**
   * Check image search limit
   */
  checkImageLimit(identifier: string): RateLimitResult {
    return this.imageLimiter.checkLimit(identifier);
  }

  /**
   * Get comprehensive statistics
   */
  getAllStats(): Record<string, any> {
    return {
      search: this.searchLimiter.getStats(),
      suggestions: this.suggestionLimiter.getStats(),
      ai: this.aiLimiter.getStats(),
      voice: this.voiceLimiter.getStats(),
      image: this.imageLimiter.getStats()
    };
  }

  /**
   * Destroy all limiters
   */
  destroy(): void {
    this.searchLimiter.destroy();
    this.suggestionLimiter.destroy();
    this.aiLimiter.destroy();
    this.voiceLimiter.destroy();
    this.imageLimiter.destroy();
  }
}

// Express middleware for rate limiting
export const createRateLimitMiddleware = (limiter: InMemoryRateLimiter) => {
  return (req: any, res: any, next: any) => {
    const identifier = req.ip || req.connection.remoteAddress || 'anonymous';
    const result = limiter.checkLimit(identifier);

    // Set headers
    res.set({
      'X-RateLimit-Limit': limiter['config'].maxRequests,
      'X-RateLimit-Remaining': result.remainingRequests,
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    });

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      });
    }

    next();
  };
};

// Global instance for search operations
export const searchRateLimiter = new SearchRateLimiter();

// Convenience functions
export const checkSearchRate = (identifier: string) => 
  searchRateLimiter.checkSearchLimit(identifier);

export const checkSuggestionRate = (identifier: string) => 
  searchRateLimiter.checkSuggestionLimit(identifier);

export const checkAIRate = (identifier: string) => 
  searchRateLimiter.checkAILimit(identifier);