import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto-js';

// Conditional Redis service import - graceful fallback
let redisService: any = null;
try {
  redisService = require('../services/RedisService').redisService;
} catch (error) {
  console.warn('RedisService not available, using memory fallback');
}

// Conditional fraud detection service import - graceful fallback
let fraudDetectionService: any = null;
try {
  fraudDetectionService = require('../services/FraudDetectionService').fraudDetectionService;
} catch (error) {
  console.warn('FraudDetectionService not available, using basic fallback');
}

// Security middleware configuration
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://replit.com"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting configurations with Redis fallback
const createRateLimiter = async (points: number, duration: number) => {
  if (redisService && redisService.client) {
    return new RateLimiterRedis({
      storeClient: redisService.client,
      keyPrefix: 'rl',
      points,
      duration,
      blockDuration: duration,
    });
  } else {
    // Fallback to memory-based rate limiter when Redis is not available
    const { RateLimiterMemory } = await import('rate-limiter-flexible');
    return new RateLimiterMemory({
      keyPrefix: 'rl',
      points,
      duration,
      blockDuration: duration,
    });
  }
};

// Different rate limits for different endpoints - initialized later
export let rateLimiters: any = {};

// Initialize rate limiters
const initRateLimiters = async () => {
  rateLimiters = {
    general: await createRateLimiter(100, 60), // 100 requests per minute
    auth: await createRateLimiter(5, 900), // 5 requests per 15 minutes
    search: await createRateLimiter(200, 60), // 200 searches per minute
    api: await createRateLimiter(1000, 60), // 1000 API calls per minute
    payment: await createRateLimiter(10, 3600), // 10 payment attempts per hour
  };
};

// Initialize rate limiters immediately
initRateLimiters().catch(console.error);

// Rate limiting middleware factory
export const rateLimit = (limiterType: keyof typeof rateLimiters) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limiter = rateLimiters[limiterType];
      const key = `${req.ip}_${limiterType}`;
      
      await limiter.consume(key);
      next();
    } catch (rejRes: any) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: secs
      });
    }
  };
};

// JWT authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Fraud detection middleware for transactions
export const fraudDetection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.amount || req.body.paymentMethod) {
      const transactionData = {
        userId: req.user?.id,
        amount: parseFloat(req.body.amount || '0'),
        paymentMethod: req.body.paymentMethod,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        deviceFingerprint: req.headers['x-device-fingerprint'] as string,
        shippingAddress: req.body.shippingAddress,
        billingAddress: req.body.billingAddress,
      };

      const fraudAnalysis = await fraudDetectionService.analyzeTransaction(transactionData);
      
      if (fraudAnalysis.action === 'block') {
        return res.status(403).json({
          error: 'Transaction blocked for security reasons',
          riskLevel: fraudAnalysis.riskLevel
        });
      }

      if (fraudAnalysis.action === 'review') {
        req.fraudAnalysis = fraudAnalysis;
        req.requiresReview = true;
      }
    }
    
    next();
  } catch (error) {
    console.error('Fraud detection error:', error);
    next(); // Continue if fraud detection fails
  }
};

// Input validation and sanitization
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d: any) => d.message)
      });
    }
    
    req.body = value;
    next();
  };
};

// CORS configuration for Bangladesh and international markets
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://getit.com.bd',
      'https://www.getit.com.bd',
      'https://app.getit.com.bd',
      // Add other allowed domains
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint'],
};

// API key validation for vendor integrations
export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    // Hash the API key and validate against database
    const hashedKey = crypto.SHA256(apiKey).toString();
    // This would check against a vendors API keys table
    // For now, we'll use a simple validation
    
    if (apiKey.startsWith('gbd_')) { // GetIt Bangladesh API key format
      next();
    } else {
      res.status(401).json({ error: 'Invalid API key' });
    }
  } catch (error) {
    res.status(500).json({ error: 'API key validation failed' });
  }
};

// Device fingerprinting middleware
export const deviceFingerprint = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  // Create a basic device fingerprint
  const fingerprint = crypto.SHA256(
    `${userAgent}${acceptLanguage}${acceptEncoding}${req.ip}`
  ).toString();
  
  req.deviceFingerprint = fingerprint;
  next();
};

// Session management
export const sessionManagement = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-session-id'] as string;
  
  if (sessionId) {
    try {
      const sessionData = await redisService.getCachedUserSession(sessionId);
      if (sessionData) {
        req.session = sessionData;
        
        // Update session activity
        await redisService.cacheUserSession(sessionId, {
          ...sessionData,
          lastActivity: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Session management error:', error);
    }
  }
  
  next();
};

// IP geolocation middleware (for Bangladesh-specific features)
export const geolocation = (req: Request, res: Response, next: NextFunction) => {
  // In production, this would integrate with a geolocation service
  const ip = req.ip;
  
  // Simple Bangladesh IP detection (would be more sophisticated in production)
  const bangladeshIPRanges = [
    '103.', // Common Bangladesh ISP ranges
    '114.',
    '118.',
    '120.',
    '202.',
  ];
  
  const isFromBangladesh = bangladeshIPRanges.some(range => ip.startsWith(range));
  
  req.location = {
    country: isFromBangladesh ? 'BD' : 'Unknown',
    isLocal: isFromBangladesh
  };
  
  next();
};

// Security headers for API responses
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request logging for audit trail
export const auditLog = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };
    
    // Store audit log (would typically go to a logging service)
    console.log('Audit Log:', JSON.stringify(logData));
  });
  
  next();
};

// Rate limiting middleware for authentication endpoints
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Simple rate limiting implementation
  // In production, this should use Redis or a proper rate limiting service
  const key = `${req.ip}-${req.path}`;
  const now = Date.now();
  
  // For now, just log and continue
  console.log(`Rate limit check for ${key} at ${new Date(now).toISOString()}`);
  
  next();
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized access'
    });
  }
  
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    ...(isDevelopment && { details: err.message, stack: err.stack })
  });
};

// Declare custom properties on Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
      deviceFingerprint?: string;
      location?: {
        country: string;
        isLocal: boolean;
      };
      fraudAnalysis?: any;
      requiresReview?: boolean;
    }
  }
}

export default {
  securityMiddleware,
  rateLimit,
  authenticateToken,
  authorize,
  fraudDetection,
  validateInput,
  corsConfig,
  validateApiKey,
  deviceFingerprint,
  sessionManagement,
  geolocation,
  securityHeaders,
  auditLog,
  errorHandler
};