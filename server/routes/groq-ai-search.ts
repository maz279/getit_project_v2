/**
 * GROQ AI SEARCH ROUTES
 * Complete DeepSeek replacement with enhanced performance and reliability
 * July 24, 2025 - Full AI Search Functionality Migration
 */

import { Router } from 'express';
import { z } from 'zod';
import { GroqAIService } from '../services/ai/GroqAIService.js';

const router = Router();
// Reset and get fresh instance to pick up new models
GroqAIService.resetInstance();
const groqService = GroqAIService.getInstance();

// Validation schemas
const SearchSuggestionsSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  language: z.enum(['en', 'bn']).default('en'),
  userHistory: z.array(z.string()).optional()
});

const QueryEnhancementSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  context: z.object({
    category: z.string().optional(),
    priceRange: z.string().optional(),
    location: z.string().optional()
  }).optional()
});

const IntentAnalysisSchema = z.object({
  query: z.string().min(1, 'Query is required')
});

const PurchaseGuideSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  budget: z.string().optional(),
  preferences: z.array(z.string()).optional()
});

/**
 * POST /api/groq-ai/suggestions
 * Generate contextual search suggestions using Groq AI
 */
router.post('/suggestions', async (req, res) => {
  try {
    const validatedData = SearchSuggestionsSchema.parse(req.body);
    console.log(`🚀 GROQ SUGGESTIONS: Processing query "${validatedData.query}"`);
    
    const startTime = Date.now();

    if (!groqService.getServiceAvailability()) {
      return res.status(503).json({
        success: false,
        error: 'AI service temporarily unavailable'
      });
    }

    const suggestions = await groqService.generateContextualSuggestions(
      validatedData.query,
      validatedData.language,
      validatedData.userHistory || []
    );

    const processingTime = Date.now() - startTime;
    console.log('✅ Groq suggestions generated in', processingTime, 'ms');

    res.json({
      success: true,
      data: suggestions,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString(),
        aiProvider: 'Groq AI',
        endpoint: '/api/groq-ai/suggestions',
        dataIntegrity: 'authentic_only',
        suggestionsCount: suggestions.length
      }
    });

  } catch (error) {
    console.error('Groq suggestions error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'AI suggestions service error'
    });
  }
});

/**
 * POST /api/groq-ai/enhance-query
 * Enhance search queries with AI intelligence
 */
router.post('/enhance-query', async (req, res) => {
  try {
    const validatedData = QueryEnhancementSchema.parse(req.body);
    console.log(`🚀 GROQ ENHANCEMENT: Processing query "${validatedData.query}"`);
    
    const startTime = Date.now();

    if (!groqService.getServiceAvailability()) {
      return res.status(503).json({
        success: false,
        error: 'AI service temporarily unavailable'
      });
    }

    const enhancement = await groqService.enhanceQuery(
      validatedData.query,
      validatedData.context || {}
    );

    const processingTime = Date.now() - startTime;
    console.log('✅ Query enhanced in', processingTime, 'ms');

    res.json({
      success: true,
      data: enhancement,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString(),
        aiProvider: 'Groq AI',
        endpoint: '/api/groq-ai/enhance-query',
        dataIntegrity: 'authentic_only'
      }
    });

  } catch (error) {
    console.error('Groq query enhancement error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Query enhancement service error'
    });
  }
});

/**
 * POST /api/groq-ai/analyze-intent
 * Analyze user search intent with AI
 */
router.post('/analyze-intent', async (req, res) => {
  try {
    const validatedData = IntentAnalysisSchema.parse(req.body);
    console.log(`🚀 GROQ INTENT: Analyzing "${validatedData.query}"`);
    
    const startTime = Date.now();

    if (!groqService.getServiceAvailability()) {
      return res.status(503).json({
        success: false,
        error: 'AI service temporarily unavailable'
      });
    }

    const analysis = await groqService.analyzeIntent(validatedData.query);

    const processingTime = Date.now() - startTime;
    console.log('✅ Intent analyzed in', processingTime, 'ms');

    res.json({
      success: true,
      data: analysis,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString(),
        aiProvider: 'Groq AI',
        endpoint: '/api/groq-ai/analyze-intent',
        dataIntegrity: 'authentic_only'
      }
    });

  } catch (error) {
    console.error('Groq intent analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Intent analysis service error'
    });
  }
});

/**
 * POST /api/groq-ai/purchase-guide
 * Generate comprehensive purchase guidance using AI
 */
router.post('/purchase-guide', async (req, res) => {
  try {
    const validatedData = PurchaseGuideSchema.parse(req.body);
    console.log(`🚀 GROQ PURCHASE GUIDE: Processing "${validatedData.query}"`);
    
    const startTime = Date.now();

    if (!groqService.getServiceAvailability()) {
      return res.status(503).json({
        success: false,
        error: 'AI service temporarily unavailable'
      });
    }

    const guide = await groqService.generatePurchaseGuide(
      validatedData.query,
      validatedData.budget,
      validatedData.preferences
    );

    const processingTime = Date.now() - startTime;
    console.log('✅ Purchase guide generated in', processingTime, 'ms');

    res.json({
      success: true,
      data: guide,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString(),
        aiProvider: 'Groq AI',
        endpoint: '/api/groq-ai/purchase-guide',
        dataIntegrity: 'authentic_only',
        recommendationsCount: guide.recommendations.length
      }
    });

  } catch (error) {
    console.error('Groq purchase guide error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Purchase guide service error'
    });
  }
});

/**
 * GET /api/groq-ai/health
 * Check Groq AI service health and performance statistics
 */
router.get('/health', async (req, res) => {
  try {
    const stats = groqService.getStats();
    const isAvailable = groqService.getServiceAvailability();

    res.json({
      success: true,
      data: {
        status: isAvailable ? 'Available' : 'Unavailable',
        provider: 'Groq AI',
        performance: {
          totalRequests: stats.totalRequests,
          successfulRequests: stats.successfulRequests,
          errorCount: stats.errorCount,
          successRate: stats.totalRequests > 0 ? 
            ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%' : '0%',
          averageResponseTime: Math.round(stats.averageResponseTime) + 'ms',
          cacheHits: stats.cacheHits,
          cacheSize: stats.cacheSize
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: '/api/groq-ai/health'
      }
    });

  } catch (error) {
    console.error('Groq health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

/**
 * POST /api/groq-ai/clear-cache
 * Clear the AI service cache (admin function)
 */
router.post('/clear-cache', async (req, res) => {
  try {
    groqService.clearCache();
    
    res.json({
      success: true,
      message: 'Groq AI cache cleared successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: '/api/groq-ai/clear-cache'
      }
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Cache clear failed'
    });
  }
});

export default router;