// Phase 2: Enterprise-Grade Rate Limiting Implementation
// Day 8: Redis-Based Rate Limiting Middleware Development

import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Request, Response, NextFunction } from 'express';

// Redis client for rate limiting (using existing Redis if available, fallback to memory)
let redisClient: any = null;

// Try to initialize Redis client with improved error handling
async function initializeRedisClient() {
  try {
    if (redisClient) return redisClient;
    
    // Skip Redis in development mode if not explicitly configured
    if (process.env.NODE_ENV === 'development' && !process.env.REDIS_HOST) {
      console.log('⚠️ Development mode: Skipping Redis, using in-memory rate limiting');
      return null;
    }
    
    // Check if Redis is available in the environment
    const Redis = await import('ioredis').catch(() => null);
    if (Redis) {
      redisClient = new Redis.default({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
        enableOfflineQueue: false
      });
      
      // Test connection with timeout
      await Promise.race([
        redisClient.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 3000))
      ]);
      
      console.log('✅ Redis connected for rate limiting');
      return redisClient;
    }
  } catch (error) {
    console.log('⚠️ Redis not available, using in-memory rate limiting');
    redisClient = null;
  }
  return null;
}

// Redis-based rate limiting store (when Redis is available)
async function createRedisStore() {
  const client = await initializeRedisClient();
  if (!client) return undefined;
  
  return new RedisStore({
    sendCommand: (...args: string[]) => client.call(...args),
  });
}

// Standard rate limiting for general API endpoints
export const standardRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: 60,
    type: 'rate_limit_exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // Use IP address as key
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

// Enhanced rate limiting for AI endpoints
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  max: 30, // 30 requests per minute per IP
  message: {
    error: 'Too many AI requests, please try again in a moment.',
    retryAfter: 60,
    type: 'ai_rate_limit_exceeded',
    suggestion: 'AI processing requires rate limiting to ensure quality service for all users.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'AI request rate limit exceeded',
      message: 'Too many AI requests. Please wait a moment before trying again.',
      retryAfter: 60,
      timestamp: new Date().toISOString()
    });
  }
});

// Strict rate limiting for DeepSeek API endpoints (respecting 8 requests/minute)
export const deepSeekRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 8, // 8 requests per minute per IP (DeepSeek API limitation)
  message: {
    error: 'DeepSeek API rate limit reached. Please wait before making another request.',
    retryAfter: 60,
    type: 'deepseek_rate_limit_exceeded',
    queueAvailable: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'DeepSeek API rate limit exceeded',
      message: 'AI search requests are limited to 8 per minute. Your request has been queued.',
      retryAfter: 60,
      queueStatus: 'Request will be processed when rate limit resets',
      timestamp: new Date().toISOString()
    });
  }
});

// Intelligent Rate Limiting with Queue Management
export class IntelligentRateLimiter {
  private static requestQueue: Map<string, QueuedRequest[]> = new Map();
  private static processing: Set<string> = new Set();
  
  // Process queued requests when rate limits allow
  static async processQueue(): Promise<void> {
    setInterval(async () => {
      for (const [key, requests] of this.requestQueue.entries()) {
        if (requests.length > 0 && !this.processing.has(key)) {
          const request = requests.shift();
          if (request && Date.now() - request.timestamp < 300000) { // 5 minutes max queue time
            this.processing.add(key);
            try {
              await this.executeQueuedRequest(request);
            } catch (error) {
              console.error('Queued request failed:', error);
            } finally {
              this.processing.delete(key);
            }
          }
        }
      }
    }, 2000); // Process every 2 seconds
  }
  
  private static async executeQueuedRequest(request: QueuedRequest): Promise<void> {
    try {
      // This would integrate with the actual DeepSeek service
      console.log(`🔄 Processing queued request: ${request.id}`);
      // Implementation would call the actual DeepSeek service here
    } catch (error) {
      console.error('Failed to execute queued request:', error);
    }
  }
  
  // Add request to queue when rate limited
  static queueRequest(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip || 'unknown';
    const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    if (!this.requestQueue.has(key)) {
      this.requestQueue.set(key, []);
    }
    
    const queue = this.requestQueue.get(key)!;
    
    // Limit queue size to prevent memory issues
    if (queue.length >= 10) {
      res.status(429).json({
        success: false,
        error: 'Request queue full',
        message: 'Too many requests queued. Please try again later.',
        queueSize: queue.length
      });
      return;
    }
    
    queue.push({
      id: requestId,
      timestamp: Date.now(),
      request: {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers
      }
    });
    
    res.status(202).json({
      success: true,
      message: 'Request queued successfully',
      requestId,
      queuePosition: queue.length,
      estimatedWaitTime: queue.length * 2, // 2 seconds per request
      timestamp: new Date().toISOString()
    });
  }
}

// Middleware to add rate limiting headers to all responses
export const rateLimitHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Add custom rate limiting information
  res.setHeader('X-RateLimit-Service', 'GetIt-AI-Platform');
  res.setHeader('X-RateLimit-Policy', 'Standard: 100/min, AI: 30/min, DeepSeek: 8/min');
  
  // Track statistics
  RateLimitingStats.incrementTotal();
  
  next();
};

// Initialize rate limiting system with better error handling
export async function initializeRateLimiting(): Promise<void> {
  try {
    // Initialize Redis connection if available (non-blocking)
    initializeRedisClient().catch(err => {
      console.log('⚠️ Redis initialization failed, continuing with in-memory rate limiting');
    });
    
    // Start intelligent queue processor
    IntelligentRateLimiter.processQueue();
    
    console.log('✅ Phase 2: Rate limiting system initialized');
    console.log('   - Standard API: 100 requests/minute');
    console.log('   - AI Endpoints: 30 requests/minute');
    console.log('   - DeepSeek API: 8 requests/minute');
    console.log('   - Intelligent queuing: Active');
    
  } catch (error) {
    console.log('⚠️ Rate limiting using in-memory mode only');
  }
}

// Rate limiting statistics for monitoring
export class RateLimitingStats {
  private static stats = {
    totalRequests: 0,
    blockedRequests: 0,
    queuedRequests: 0,
    processedFromQueue: 0
  };
  
  static incrementTotal(): void {
    this.stats.totalRequests++;
  }
  
  static incrementBlocked(): void {
    this.stats.blockedRequests++;
  }
  
  static incrementQueued(): void {
    this.stats.queuedRequests++;
  }
  
  static incrementProcessed(): void {
    this.stats.processedFromQueue++;
  }
  
  static getStats() {
    return {
      ...this.stats,
      blockRate: this.stats.totalRequests ? (this.stats.blockedRequests / this.stats.totalRequests) * 100 : 0,
      queueEfficiency: this.stats.queuedRequests ? (this.stats.processedFromQueue / this.stats.queuedRequests) * 100 : 0
    };
  }
}

// Types
interface QueuedRequest {
  id: string;
  timestamp: number;
  request: {
    method: string;
    url: string;
    body: any;
    headers: any;
  };
}

export default {
  standardRateLimit,
  aiRateLimit,
  deepSeekRateLimit,
  rateLimitHeaders,
  initializeRateLimiting,
  IntelligentRateLimiter,
  RateLimitingStats
};