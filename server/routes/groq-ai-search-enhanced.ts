/**
 * GROQ AI SEARCH ROUTES - Production Ready Enhanced
 * Complete security, monitoring, error handling, and performance optimization
 * Upgraded from attached production-ready specifications
 * July 24, 2025 - Enterprise-Grade Implementation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { GroqAIService } from '../services/ai/GroqAIService.js';

// === CUSTOM ERROR CLASSES ===
export class GroqServiceError extends Error {
  public statusCode: number;
  public details?: Record<string, unknown>;

  constructor(message: string, statusCode: number = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'GroqServiceError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends Error {
  public details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

// === TYPES ===
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    processingTime: number;
    timestamp: string;
    aiProvider: string;
    endpoint: string;
    dataIntegrity: 'authentic_only';
    requestId: string;
    [key: string]: unknown;
  };
}

// === ENHANCED VALIDATION SCHEMAS ===
const SearchSuggestionsSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()[\]{}'"/@#$%&*+=:;।]+$/, 'Invalid characters in query'),
  language: z.enum(['en', 'bn']).default('en'),
  userHistory: z.array(z.string().max(500)).max(20).optional(),
  limit: z.number().min(1).max(20).default(8).optional(),
});

const QueryEnhancementSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()[\]{}'"/@#$%&*+=:;।]+$/, 'Invalid characters in query'),
  context: z.object({
    category: z.string().max(100).optional(),
    priceRange: z.string().max(100).optional(),
    location: z.string().max(100).optional(),
  }).optional(),
});

const IntentAnalysisSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()[\]{}'"/@#$%&*+=:;।]+$/, 'Invalid characters in query'),
});

const PurchaseGuideSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()[\]{}'"/@#$%&*+=:;।]+$/, 'Invalid characters in query'),
  budget: z.string().max(100).optional(),
  preferences: z.array(z.string().max(200)).max(10).optional(),
});

// === MIDDLEWARE ===

// Rate limiting with different tiers
const createRateLimit = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: message,
        metadata: {
          processingTime: 0,
          timestamp: new Date().toISOString(),
          aiProvider: 'Rate Limited',
          endpoint: req.path,
          dataIntegrity: 'authentic_only' as const,
          requestId: generateRequestId(),
        },
      });
    },
  });

// Enhanced security middleware
const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Request logging middleware
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = generateRequestId();
  req.requestId = requestId;
  req.startTime = Date.now();
  
  console.log(`[${requestId}] ${req.method} ${req.path} - ${req.ip}`);
  
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${requestId}] Completed in ${duration}ms - Status: ${res.statusCode}`);
  });
  
  next();
};

// Enhanced error handling middleware
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.requestId || generateRequestId();
  
  console.error(`[${requestId}] Error:`, {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  if (error instanceof ValidationError) {
    return res.status(400).json(createErrorResponse(
      error.message,
      req.path,
      requestId,
      Date.now() - (req.startTime || Date.now()),
      error.details
    ));
  }

  if (error instanceof ServiceUnavailableError) {
    return res.status(503).json(createErrorResponse(
      error.message,
      req.path,
      requestId,
      Date.now() - (req.startTime || Date.now())
    ));
  }

  if (error instanceof GroqServiceError) {
    return res.status(error.statusCode).json(createErrorResponse(
      error.message,
      req.path,
      requestId,
      Date.now() - (req.startTime || Date.now()),
      error.details
    ));
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return res.status(400).json(createErrorResponse(
      'Invalid request data',
      req.path,
      requestId,
      Date.now() - (req.startTime || Date.now()),
      { validationErrors: error.errors }
    ));
  }

  // Generic error
  res.status(500).json(createErrorResponse(
    'Internal server error',
    req.path,
    requestId,
    Date.now() - (req.startTime || Date.now())
  ));
};

// === UTILITY FUNCTIONS ===

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createSuccessResponse<T>(
  data: T,
  endpoint: string,
  requestId: string,
  processingTime: number,
  additionalMetadata: Record<string, unknown> = {}
): APIResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      processingTime,
      timestamp: new Date().toISOString(),
      aiProvider: 'Groq AI',
      endpoint,
      dataIntegrity: 'authentic_only',
      requestId,
      ...additionalMetadata,
    },
  };
}

function createErrorResponse(
  error: string,
  endpoint: string,
  requestId: string,
  processingTime: number,
  details?: Record<string, unknown>
): APIResponse<never> {
  return {
    success: false,
    error,
    metadata: {
      processingTime,
      timestamp: new Date().toISOString(),
      aiProvider: 'Groq AI',
      endpoint,
      dataIntegrity: 'authentic_only',
      requestId,
      ...(details && { details }),
    },
  };
}

// Simple authentication check
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(createErrorResponse(
      'Unauthorized: Admin access required',
      req.path,
      req.requestId || generateRequestId(),
      Date.now() - (req.startTime || Date.now())
    ));
  }
  next();
}

// === ROUTER SETUP ===
const router = Router();

// Apply security and logging middleware
router.use(securityMiddleware);
router.use(requestLogger);

// Initialize Groq service with enhanced error handling
let groqService: GroqAIService;
try {
  groqService = GroqAIService.getInstance();
  console.log('✅ Groq AI Service initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Groq AI Service:', error);
  // Service will be checked in each route handler
}

// Rate limiting for different endpoints
const suggestionRateLimit = createRateLimit(60000, 30, 'Too many suggestion requests');
const enhancementRateLimit = createRateLimit(60000, 20, 'Too many enhancement requests');
const conversationRateLimit = createRateLimit(60000, 15, 'Too many conversation requests');
const healthRateLimit = createRateLimit(60000, 100, 'Too many health check requests');
const adminRateLimit = createRateLimit(60000, 10, 'Too many admin requests');

// === ROUTE HANDLERS ===

/**
 * POST /api/groq-ai/suggestions
 * Generate contextual search suggestions using Groq AI
 */
router.post('/suggestions', suggestionRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || generateRequestId();
  
  try {
    // Validate input
    const validatedData = SearchSuggestionsSchema.parse(req.body);
    
    console.log(`[${requestId}] Processing suggestions for query: "${validatedData.query.substring(0, 50)}..."`);
    
    // Check service availability
    if (!groqService || !groqService.getServiceAvailability()) {
      throw new ServiceUnavailableError('AI service temporarily unavailable');
    }

    // Process request
    const suggestions = await groqService.generateContextualSuggestions(
      validatedData.query,
      validatedData.language,
      validatedData.userHistory || []
    );

    const processingTime = Date.now() - startTime;
    
    console.log(`[${requestId}] Generated ${suggestions.length} suggestions in ${processingTime}ms`);

    res.json(createSuccessResponse(
      suggestions,
      '/api/groq-ai/suggestions',
      requestId,
      processingTime,
      {
        suggestionsCount: suggestions.length,
        language: validatedData.language,
        queryLength: validatedData.query.length,
      }
    ));

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groq-ai/search-enhancement
 * Enhance search queries with AI intelligence
 */
router.post('/search-enhancement', enhancementRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || generateRequestId();
  
  try {
    const validatedData = QueryEnhancementSchema.parse(req.body);
    
    console.log(`[${requestId}] Enhancing query: "${validatedData.query.substring(0, 50)}..."`);
    
    if (!groqService || !groqService.getServiceAvailability()) {
      throw new ServiceUnavailableError('AI service temporarily unavailable');
    }

    const enhancement = await groqService.enhanceQuery(
      validatedData.query,
      validatedData.context || {}
    );

    const processingTime = Date.now() - startTime;
    
    console.log(`[${requestId}] Query enhanced in ${processingTime}ms`);

    res.json(createSuccessResponse(
      enhancement,
      '/api/groq-ai/search-enhancement',
      requestId,
      processingTime,
      {
        confidence: enhancement.confidence,
        intent: enhancement.intent,
        categoriesFound: enhancement.categories.length,
      }
    ));

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groq-ai/analyze-intent
 * Analyze user search intent with AI
 */
router.post('/analyze-intent', enhancementRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || generateRequestId();
  
  try {
    const validatedData = IntentAnalysisSchema.parse(req.body);
    
    console.log(`[${requestId}] Analyzing intent for: "${validatedData.query.substring(0, 50)}..."`);
    
    if (!groqService || !groqService.getServiceAvailability()) {
      throw new ServiceUnavailableError('AI service temporarily unavailable');
    }

    const analysis = await groqService.analyzeIntent(validatedData.query);

    const processingTime = Date.now() - startTime;
    
    console.log(`[${requestId}] Intent analyzed in ${processingTime}ms - Intent: ${analysis.intent}`);

    res.json(createSuccessResponse(
      analysis,
      '/api/groq-ai/analyze-intent',
      requestId,
      processingTime,
      {
        intent: analysis.intent,
        confidence: analysis.confidence,
        urgency: analysis.urgency,
      }
    ));

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groq-ai/recommendations
 * Generate personalized product recommendations
 */
router.post('/recommendations', enhancementRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || generateRequestId();
  
  try {
    const validatedData = SearchSuggestionsSchema.parse(req.body);
    
    console.log(`[${requestId}] Generating recommendations for: "${validatedData.query.substring(0, 50)}..."`);
    
    if (!groqService || !groqService.getServiceAvailability()) {
      throw new ServiceUnavailableError('AI service temporarily unavailable');
    }

    // Use the suggestions method for now - could be enhanced with dedicated recommendations
    const recommendations = await groqService.generateContextualSuggestions(
      validatedData.query,
      validatedData.language,
      validatedData.userHistory || []
    );

    const processingTime = Date.now() - startTime;
    
    console.log(`[${requestId}] Generated ${recommendations.length} recommendations in ${processingTime}ms`);

    res.json(createSuccessResponse(
      recommendations,
      '/api/groq-ai/recommendations',
      requestId,
      processingTime,
      {
        recommendationsCount: recommendations.length,
        personalizationLevel: validatedData.userHistory?.length || 0,
      }
    ));

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groq-ai/purchase-guidance
 * Generate comprehensive purchase guidance using AI
 */
router.post('/purchase-guidance', enhancementRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || generateRequestId();
  
  try {
    const validatedData = PurchaseGuideSchema.parse(req.body);
    
    console.log(`[${requestId}] Generating purchase guide for: "${validatedData.query.substring(0, 50)}..."`);
    
    if (!groqService || !groqService.getServiceAvailability()) {
      throw new ServiceUnavailableError('AI service temporarily unavailable');
    }

    const guide = await groqService.generatePurchaseGuide(
      validatedData.query,
      validatedData.budget,
      validatedData.preferences
    );

    const processingTime = Date.now() - startTime;
    
    console.log(`[${requestId}] Purchase guide generated in ${processingTime}ms with ${guide.recommendations.length} recommendations`);

    res.json(createSuccessResponse(
      guide,
      '/api/groq-ai/purchase-guidance',
      requestId,
      processingTime,
      {
        recommendationsCount: guide.recommendations.length,
        tipsCount: guide.buying_tips.length,
        hasBudgetAdvice: !!guide.budget_advice,
        hasSeasonalTips: guide.seasonal_considerations.length > 0,
      }
    ));

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groq-ai/health
 * Check Groq AI service health and performance statistics
 */
router.get('/health', healthRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || generateRequestId();
  
  try {
    let healthData;
    
    if (!groqService) {
      healthData = {
        status: 'Unavailable',
        provider: 'Groq AI',
        error: 'Service not initialized',
        performance: null,
      };
    } else {
      const stats = groqService.getStats();
      const isAvailable = groqService.getServiceAvailability();
      
      healthData = {
        status: isAvailable ? 'Available' : 'Unavailable',
        provider: 'Groq AI',
        isAvailable,
        performance: {
          totalRequests: stats.totalRequests,
          successfulRequests: stats.successfulRequests,
          errorCount: stats.errorCount,
          successRate: stats.totalRequests > 0 ? 
            `${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%` : '100%',
          averageResponseTime: `${Math.round(stats.averageResponseTime)}ms`,
          cacheHits: stats.cacheHits,
          cacheSize: stats.cacheSize,
          cacheHitRate: stats.totalRequests > 0 ?
            `${((stats.cacheHits / stats.totalRequests) * 100).toFixed(2)}%` : '0%',
        },
      };
    }

    const processingTime = Date.now() - startTime;

    res.json(createSuccessResponse(
      healthData,
      '/api/groq-ai/health',
      requestId,
      processingTime,
      {
        healthCheckTime: processingTime,
      }
    ));

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/groq-ai/clear-cache
 * Clear the AI service cache (admin function)
 */
router.post('/clear-cache', adminRateLimit, requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || generateRequestId();
  
  try {
    if (!groqService) {
      throw new ServiceUnavailableError('Service not available');
    }

    const statsBefore = groqService.getStats();
    groqService.clearCache();
    const statsAfter = groqService.getStats();
    
    const processingTime = Date.now() - startTime;
    
    console.log(`[${requestId}] Cache cleared - Size before: ${statsBefore.cacheSize}, after: ${statsAfter.cacheSize}`);

    res.json(createSuccessResponse(
      {
        message: 'Groq AI cache cleared successfully',
        cacheStats: {
          sizeBefore: statsBefore.cacheSize,
          sizeAfter: statsAfter.cacheSize,
          itemsCleared: statsBefore.cacheSize - statsAfter.cacheSize,
        },
      },
      '/api/groq-ai/clear-cache',
      requestId,
      processingTime
    ));

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groq-ai/metrics
 * Get detailed performance metrics (admin function)
 */
router.get('/metrics', adminRateLimit, requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || generateRequestId();
  
  try {
    if (!groqService) {
      throw new ServiceUnavailableError('Service not available');
    }

    const stats = groqService.getStats();
    
    const detailedMetrics = {
      service: {
        name: 'GroqAIService',
        version: '2.0.0',
        provider: 'Groq AI',
        isHealthy: groqService.getServiceAvailability(),
      },
      performance: {
        requests: {
          total: stats.totalRequests,
          successful: stats.successfulRequests,
          failed: stats.errorCount,
          successRate: stats.totalRequests > 0 ? 
            (stats.successfulRequests / stats.totalRequests) * 100 : 100,
        },
        timing: {
          averageResponseTime: stats.averageResponseTime,
          timeUnit: 'milliseconds',
        },
        cache: {
          hits: stats.cacheHits,
          size: stats.cacheSize,
          hitRate: stats.totalRequests > 0 ? 
            (stats.cacheHits / stats.totalRequests) * 100 : 0,
        },
      },
      system: {
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };

    const processingTime = Date.now() - startTime;

    res.json(createSuccessResponse(
      detailedMetrics,
      '/api/groq-ai/metrics',
      requestId,
      processingTime
    ));

  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware
router.use(errorHandler);

// Handle 404 for this router
router.use('*', (req: Request, res: Response) => {
  res.status(404).json(createErrorResponse(
    `Endpoint not found: ${req.originalUrl}`,
    req.originalUrl,
    req.requestId || generateRequestId(),
    0
  ));
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up Groq AI Service...');
  if (groqService) {
    try {
      groqService.destroy();
    } catch (error) {
      console.error('Error during Groq AI Service cleanup:', error);
    }
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received, cleaning up Groq AI Service...');
  if (groqService) {
    try {
      groqService.destroy();
    } catch (error) {
      console.error('Error during Groq AI Service cleanup:', error);
    }
  }
  process.exit(0);
});

export default router;

// === TYPE AUGMENTATION ===
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}