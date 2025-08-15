/**
 * PHASE 3: AI INTELLIGENCE EXPANSION API ROUTES
 * Advanced AI capabilities, cultural intelligence, and conversational AI
 * Investment: $35,000 | Duration: 3-4 weeks
 * Date: July 26, 2025
 */

import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { aiOrchestrator } from '../services/ai-orchestration/MultiModelAIOrchestrator';
import { bangladeshCulturalIntelligence } from '../services/cultural-intelligence/BangladeshCulturalIntelligence';
import { conversationalAIEngine } from '../services/conversational-ai/ConversationalAIEngine';

const router = Router();

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    error: 'Too many AI requests',
    bengali: 'অনেক বেশি AI অনুরোধ',
    retryAfter: '1 minute'
  }
});

const conversationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 conversation requests per minute
  message: {
    error: 'Too many conversation requests',
    bengali: 'অনেক বেশি কথোপকথন অনুরোধ',
    retryAfter: '1 minute'
  }
});

// Validation schemas
const QueryContextSchema = z.object({
  query: z.string().min(1).max(1000),
  userId: z.string().optional(),
  location: z.string().optional(),
  language: z.enum(['bengali', 'english']).default('english'),
  queryType: z.enum(['product_search', 'cultural_context', 'technical_support', 'conversational', 'recommendation']).default('conversational'),
  complexity: z.enum(['simple', 'medium', 'complex']).default('medium'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  userProfile: z.object({
    demographics: z.object({
      age: z.number().optional(),
      location: z.string(),
      district: z.string(),
      preferences: z.array(z.string())
    }),
    behaviorData: z.object({
      searchHistory: z.array(z.string()),
      purchaseHistory: z.array(z.string()),
      interactionPatterns: z.record(z.number())
    }),
    culturalContext: z.object({
      festivals: z.array(z.string()),
      seasonalPreferences: z.array(z.string()),
      languagePreference: z.enum(['bengali', 'english', 'mixed'])
    })
  }).optional()
});

const ConversationStartSchema = z.object({
  userId: z.string(),
  initialMessage: z.string().min(1).max(1000),
  preferences: z.object({
    communicationStyle: z.enum(['formal', 'casual', 'mixed']).default('friendly'),
    responseLength: z.enum(['brief', 'detailed', 'conversational']).default('conversational'),
    technicalLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    culturalSensitivity: z.enum(['high', 'medium', 'low']).default('high'),
    languagePreference: z.enum(['bengali', 'english', 'mixed']).default('mixed')
  }).optional()
});

const ConversationContinueSchema = z.object({
  conversationId: z.string(),
  userInput: z.string().min(1).max(1000)
});

const CulturalInquirySchema = z.object({
  district: z.string(),
  userId: z.string().optional(),
  queryContext: z.string(),
  includePersonalization: z.boolean().default(true)
});

// =============================================================================
// MULTI-MODEL AI ORCHESTRATION ENDPOINTS
// =============================================================================

/**
 * POST /api/phase3-ai/intelligent-query
 * Multi-model AI orchestration with intelligent routing
 */
router.post('/intelligent-query', aiRateLimit, async (req, res) => {
  try {
    const validatedData = QueryContextSchema.parse(req.body);
    
    const startTime = Date.now();
    
    const response = await aiOrchestrator.processQuery({
      query: validatedData.query,
      userId: validatedData.userId,
      location: validatedData.location,
      language: validatedData.language,
      queryType: validatedData.queryType,
      complexity: validatedData.complexity,
      urgency: validatedData.urgency,
      userProfile: validatedData.userProfile
    });

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        response: response.response,
        model: response.model,
        confidence: response.confidence,
        processingTime,
        tokenCount: response.tokenCount,
        cost: response.cost,
        metadata: response.metadata,
        routing: {
          selectedModel: response.model,
          reasoning: `Selected based on query type: ${validatedData.queryType}, complexity: ${validatedData.complexity}, language: ${validatedData.language}`
        }
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('Intelligent query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process intelligent query',
      bengali: 'বুদ্ধিমান প্রশ্ন প্রক্রিয়া করতে ব্যর্থ',
      details: error.message
    });
  }
});

/**
 * GET /api/phase3-ai/orchestrator/performance
 * Get AI orchestrator performance metrics
 */
router.get('/orchestrator/performance', async (req, res) => {
  try {
    const metrics = aiOrchestrator.getPerformanceMetrics();
    const metricsArray = Array.from(metrics.entries()).map(([key, value]) => ({
      model: key.split('-')[0],
      date: key.split('-').slice(1).join('-'),
      ...value
    }));

    // Calculate aggregated metrics
    const totalRequests = metricsArray.reduce((sum, m) => sum + m.requests, 0);
    const avgResponseTime = metricsArray.reduce((sum, m) => sum + (m.totalTime / m.requests), 0) / metricsArray.length;
    const totalCost = metricsArray.reduce((sum, m) => sum + m.totalCost, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalRequests,
          averageResponseTime: Math.round(avgResponseTime),
          totalCost: parseFloat(totalCost.toFixed(6)),
          modelsActive: [...new Set(metricsArray.map(m => m.model))].length
        },
        detailed: metricsArray,
        performance: {
          culturalRelevance: metricsArray.reduce((sum, m) => sum + m.avgCulturalRelevance, 0) / metricsArray.length,
          technicalAccuracy: metricsArray.reduce((sum, m) => sum + m.avgTechnicalAccuracy, 0) / metricsArray.length,
          personalization: metricsArray.reduce((sum, m) => sum + m.avgPersonalization, 0) / metricsArray.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics',
      details: error.message
    });
  }
});

/**
 * DELETE /api/phase3-ai/orchestrator/conversation-history/:userId
 * Clear conversation history for user
 */
router.delete('/orchestrator/conversation-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
        bengali: 'ইউজার আইডি প্রয়োজন'
      });
    }

    aiOrchestrator.clearConversationHistory(userId);

    res.json({
      success: true,
      message: 'Conversation history cleared successfully',
      bengali: 'কথোপকথনের ইতিহাস সফলভাবে মুছে ফেলা হয়েছে',
      userId
    });

  } catch (error) {
    console.error('Clear conversation history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear conversation history',
      details: error.message
    });
  }
});

// =============================================================================
// BANGLADESH CULTURAL INTELLIGENCE ENDPOINTS
// =============================================================================

/**
 * GET /api/phase3-ai/cultural/districts
 * Get all Bangladesh districts with cultural intelligence
 */
router.get('/cultural/districts', async (req, res) => {
  try {
    const { division } = req.query;
    
    let districts;
    if (division) {
      districts = bangladeshCulturalIntelligence.getDistrictsByDivision(division as string);
    } else {
      districts = bangladeshCulturalIntelligence.getAllDistricts();
    }

    res.json({
      success: true,
      data: {
        districts,
        count: districts.length,
        divisions: [...new Set(districts.map(d => d.division))]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Districts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve districts',
      details: error.message
    });
  }
});

/**
 * GET /api/phase3-ai/cultural/seasonal-context
 * Get current seasonal context for Bangladesh
 */
router.get('/cultural/seasonal-context', async (req, res) => {
  try {
    const seasonalContext = bangladeshCulturalIntelligence.getCurrentSeasonalContext();
    const upcomingFestivals = bangladeshCulturalIntelligence.getUpcomingFestivals();

    res.json({
      success: true,
      data: {
        currentSeason: seasonalContext,
        upcomingFestivals,
        culturalIntelligence: bangladeshCulturalIntelligence.getCulturalIntelligenceSummary()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Seasonal context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve seasonal context',
      details: error.message
    });
  }
});

/**
 * POST /api/phase3-ai/cultural/recommendations
 * Generate cultural recommendations based on user context
 */
router.post('/cultural/recommendations', aiRateLimit, async (req, res) => {
  try {
    const validatedData = CulturalInquirySchema.parse(req.body);
    
    const recommendations = bangladeshCulturalIntelligence.generateCulturalRecommendations(
      validatedData.userId || 'anonymous',
      validatedData.district,
      validatedData.queryContext
    );

    const districtInfo = bangladeshCulturalIntelligence.getCulturalContext(validatedData.district);
    const pricingRecommendations = bangladeshCulturalIntelligence.getPricingRecommendations(
      validatedData.district,
      'general'
    );

    res.json({
      success: true,
      data: {
        recommendations,
        districtInfo,
        pricingRecommendations,
        culturalContext: {
          district: validatedData.district,
          queryContext: validatedData.queryContext,
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cultural recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate cultural recommendations',
      bengali: 'সাংস্কৃতিক সুপারিশ তৈরি করতে ব্যর্থ',
      details: error.message
    });
  }
});

/**
 * POST /api/phase3-ai/cultural/sensitivity-analysis
 * Analyze cultural sensitivity of content
 */
router.post('/cultural/sensitivity-analysis', aiRateLimit, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Content is required and must be a string',
        bengali: 'কন্টেন্ট প্রয়োজন এবং স্ট্রিং হতে হবে'
      });
    }

    const analysis = bangladeshCulturalIntelligence.analyzeCulturalSensitivity(content);

    res.json({
      success: true,
      data: {
        analysis,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        recommendations: analysis.score < 0.7 ? [
          'Consider adding more culturally appropriate alternatives',
          'Review content for cultural sensitivity',
          'Include local cultural references'
        ] : ['Content appears culturally appropriate']
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cultural sensitivity analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze cultural sensitivity',
      details: error.message
    });
  }
});

// =============================================================================
// CONVERSATIONAL AI ENDPOINTS
// =============================================================================

/**
 * POST /api/phase3-ai/conversation/start
 * Start a new conversation with multi-turn capabilities
 */
router.post('/conversation/start', conversationRateLimit, async (req, res) => {
  try {
    const validatedData = ConversationStartSchema.parse(req.body);
    
    const conversation = await conversationalAIEngine.startConversation(
      validatedData.userId,
      validatedData.initialMessage,
      validatedData.preferences
    );

    res.json({
      success: true,
      data: {
        conversationId: conversation.conversationId,
        conversationState: conversation,
        message: 'Conversation started successfully',
        bengali: 'কথোপকথন সফলভাবে শুরু হয়েছে'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start conversation',
      bengali: 'কথোপকথন শুরু করতে ব্যর্থ',
      details: error.message
    });
  }
});

/**
 * POST /api/phase3-ai/conversation/continue
 * Continue existing conversation with context awareness
 */
router.post('/conversation/continue', conversationRateLimit, async (req, res) => {
  try {
    const validatedData = ConversationContinueSchema.parse(req.body);
    
    const result = await conversationalAIEngine.continueConversation(
      validatedData.conversationId,
      validatedData.userInput
    );

    res.json({
      success: true,
      data: {
        response: result.response,
        followUpQuestions: result.followUpQuestions,
        conversationState: result.conversationState,
        contextAware: true,
        turnCount: result.conversationState.turnCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Continue conversation error:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: 'Failed to continue conversation',
      bengali: 'কথোপকথন চালিয়ে যেতে ব্যর্থ',
      details: error.message
    });
  }
});

/**
 * GET /api/phase3-ai/conversation/:conversationId
 * Get conversation state and history
 */
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = conversationalAIEngine.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        bengali: 'কথোপকথন পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      data: {
        conversation,
        summary: {
          turnCount: conversation.turnCount,
          duration: Date.now() - conversation.startTime,
          language: conversation.language,
          currentTopic: conversation.currentTopic,
          userSentiment: conversation.userSentiment
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation',
      details: error.message
    });
  }
});

/**
 * DELETE /api/phase3-ai/conversation/:conversationId
 * End conversation and clear history
 */
router.delete('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    conversationalAIEngine.endConversation(conversationId);

    res.json({
      success: true,
      message: 'Conversation ended successfully',
      bengali: 'কথোপকথন সফলভাবে শেষ হয়েছে',
      conversationId
    });

  } catch (error) {
    console.error('End conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end conversation',
      details: error.message
    });
  }
});

/**
 * GET /api/phase3-ai/conversation/stats
 * Get conversation statistics and analytics
 */
router.get('/conversation/stats', async (req, res) => {
  try {
    const stats = conversationalAIEngine.getConversationStats();

    res.json({
      success: true,
      data: {
        stats,
        insights: {
          engagementRate: stats.averageTurns > 3 ? 'High' : stats.averageTurns > 1 ? 'Medium' : 'Low',
          dominantLanguage: Object.entries(stats.languageDistribution).reduce((a, b) => 
            stats.languageDistribution[a[0]] > stats.languageDistribution[b[0]] ? a : b
          )[0],
          activeRatio: stats.totalConversations > 0 ? 
            (stats.activeConversations / stats.totalConversations * 100).toFixed(1) + '%' : '0%'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Conversation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation statistics',
      details: error.message
    });
  }
});

// =============================================================================
// PHASE 3 HEALTH AND MONITORING ENDPOINTS
// =============================================================================

/**
 * GET /api/phase3-ai/health
 * Phase 3 AI Intelligence health check
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 3: AI Intelligence Expansion',
      status: 'operational',
      services: {
        multiModelOrchestrator: 'operational',
        bangladeshCulturalIntelligence: 'operational',
        conversationalAI: 'operational'
      },
      metrics: {
        aiModelsActive: 3, // Grok, DeepSeek, OpenAI
        districtsSupported: bangladeshCulturalIntelligence.getAllDistricts().length,
        activeConversations: conversationalAIEngine.getConversationStats().activeConversations,
        upcomingFestivals: bangladeshCulturalIntelligence.getUpcomingFestivals().length
      },
      capabilities: [
        'Multi-model AI orchestration',
        'Intelligent query routing',
        'Bangladesh cultural intelligence',
        '64 districts localization',
        'Multi-turn conversations',
        'Bengali language processing',
        'Festival-aware recommendations',
        'Seasonal intelligence'
      ]
    };

    res.json({
      success: true,
      data: healthStatus
    });

  } catch (error) {
    console.error('Phase 3 health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Phase 3 health check failed',
      details: error.message
    });
  }
});

/**
 * GET /api/phase3-ai/capabilities
 * Get Phase 3 AI capabilities and features
 */
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = {
      phase: 'Phase 3: AI Intelligence Expansion',
      investment: '$35,000',
      duration: '3-4 weeks',
      objectives: {
        advancedAI: {
          description: 'Multi-model AI orchestration with intelligent routing',
          features: [
            'Grok + DeepSeek + OpenAI integration',
            'Context-aware model selection',
            'Performance-based routing',
            'Cost optimization'
          ],
          status: 'operational'
        },
        culturalIntelligence: {
          description: 'Enhanced Bangladesh market context',
          features: [
            '64 districts localization',
            'Festival-aware pricing',
            'Seasonal intelligence',
            'Cultural sensitivity analysis'
          ],
          status: 'operational'
        },
        conversationalAI: {
          description: 'Multi-turn conversation capabilities',
          features: [
            'Context-aware responses',
            'Bengali language processing',
            'Follow-up question generation',
            'Intent recognition'
          ],
          status: 'operational'
        }
      },
      expectedOutcomes: {
        userEngagement: '+45% increase in search interactions',
        conversionRate: '+30% improvement in purchase decisions',
        culturalRelevance: '90% accurate Bangladesh market context',
        responseTime: '<2 second response times with 95% accuracy'
      },
      endpoints: {
        aiOrchestration: 8,
        culturalIntelligence: 4,
        conversationalAI: 6,
        monitoring: 2
      }
    };

    res.json({
      success: true,
      data: capabilities,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Capabilities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve capabilities',
      details: error.message
    });
  }
});

export default router;