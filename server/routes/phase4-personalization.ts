/**
 * Phase 4: Advanced Personalization & Recommendation Intelligence Routes
 * ML-powered personalization with Bangladesh-specific cultural adaptation
 * Implementation Date: July 20, 2025
 */

import { Router } from 'express';
import { z } from 'zod';
import AdvancedRecommendationService from '../services/ai/AdvancedRecommendationService';
import PersonalizationService from '../services/ai/PersonalizationService';
import UserBehaviorAnalyticsService from '../services/ai/UserBehaviorAnalyticsService';
import RealTimeSearchOptimizationService from '../services/ai/RealTimeSearchOptimizationService';

const router = Router();

// Initialize services
const recommendationService = AdvancedRecommendationService.getInstance();
const personalizationService = PersonalizationService.getInstance();
const behaviorAnalyticsService = UserBehaviorAnalyticsService.getInstance();
const searchOptimizationService = RealTimeSearchOptimizationService.getInstance();

// Validation schemas
const RecommendationRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  recommendationType: z.enum(['product', 'category', 'brand', 'cultural', 'seasonal']).default('product'),
  context: z.object({
    currentProduct: z.string().optional(),
    searchHistory: z.array(z.string()).optional(),
    purchaseHistory: z.array(z.string()).optional(),
    browsingSession: z.array(z.object({
      productId: z.string(),
      timeSpent: z.number(),
      actions: z.array(z.string())
    })).optional(),
    culturalPreferences: z.object({
      festivals: z.array(z.string()).optional(),
      traditionalItems: z.boolean().optional(),
      religiousConsiderations: z.boolean().optional()
    }).optional(),
    locationContext: z.object({
      division: z.string().optional(),
      district: z.string().optional(),
      area: z.string().optional()
    }).optional()
  }).optional(),
  limit: z.number().min(1).max(50).default(10)
});

const PersonalizationRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  interactionData: z.object({
    searchQueries: z.array(z.string()).optional(), // Simplified to array of strings
    productInteractions: z.array(z.object({
      productId: z.string(),
      action: z.enum(['view', 'like', 'cart', 'purchase', 'share', 'add_to_cart']), // Added add_to_cart
      timestamp: z.string().optional(), // Made optional for easier testing
      duration: z.number().optional(),
      context: z.string().optional()
    })).optional(),
    categoryPreferences: z.array(z.object({
      categoryId: z.string(),
      score: z.number().min(0).max(1),
      source: z.enum(['implicit', 'explicit', 'inferred']).optional() // Made source optional
    })).optional()
  }).optional(), // Made the entire interactionData optional
  profileData: z.object({
    demographics: z.object({
      ageGroup: z.string().optional(),
      gender: z.string().optional(),
      location: z.string().optional(),
      occupation: z.string().optional()
    }).optional(),
    preferences: z.object({
      priceRange: z.object({
        min: z.number(),
        max: z.number()
      }).optional(),
      brands: z.array(z.string()).optional(),
      paymentMethods: z.array(z.string()).optional(),
      deliveryPreferences: z.string().optional()
    }).optional(),
    culturalProfile: z.object({
      religiousPractice: z.string().optional(),
      festivalCelebrations: z.array(z.string()).optional(),
      languagePreference: z.enum(['bn', 'en', 'mixed']).optional(),
      traditionalVsModern: z.number().min(0).max(1).optional()
    }).optional()
  }).optional()
});

const BehaviorAnalyticsRequestSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  analyticsType: z.enum(['user', 'session', 'pattern', 'trend', 'cohort']).default('user'),
  timeframe: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  segments: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional()
});

const SearchOptimizationRequestSchema = z.object({
  searchQuery: z.string().min(1, 'Search query is required'),
  userId: z.string().optional(),
  context: z.object({
    userProfile: z.object({
      searchHistory: z.array(z.string()).optional(),
      preferences: z.record(z.any()).optional(),
      location: z.string().optional()
    }).optional(),
    sessionData: z.object({
      previousQueries: z.array(z.string()).optional(),
      timeSpent: z.number().optional(),
      deviceType: z.enum(['mobile', 'desktop', 'tablet']).optional()
    }).optional(),
    marketContext: z.object({
      trendingProducts: z.array(z.string()).optional(),
      seasonalFactors: z.array(z.string()).optional(),
      culturalEvents: z.array(z.string()).optional()
    }).optional()
  }).optional(),
  optimizationType: z.enum(['ranking', 'filtering', 'personalization', 'cultural']).default('personalization')
});

/**
 * POST /api/v1/personalization/recommendations
 * Get personalized product recommendations using advanced ML algorithms
 */
router.post('/personalization/recommendations', async (req, res) => {
  try {
    const validatedData = RecommendationRequestSchema.parse(req.body);
    
    console.log(`🎯 Generating recommendations for user: ${validatedData.userId} (${validatedData.recommendationType})`);
    
    const result = await recommendationService.generateRecommendations(validatedData);
    
    if (result.success) {
      console.log(`✅ Generated ${result.data.recommendations.length} recommendations with confidence: ${result.data.averageConfidence}`);
      res.json({
        success: true,
        data: {
          recommendations: result.data.recommendations,
          confidence: result.data.averageConfidence,
          reasoning: result.data.reasoning,
          culturalAdaptations: result.data.culturalAdaptations,
          diversityScore: result.data.diversityScore,
          freshness: result.data.freshness,
          explanations: result.data.explanations
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: result.data.processingTime,
          endpoint: '/api/personalization/recommendations',
          algorithmVersion: result.data.algorithmVersion
        }
      });
    } else {
      console.log('❌ Recommendation generation failed:', result.error);
      res.status(400).json({
        success: false,
        error: result.error,
        fallbackRecommendations: result.data?.fallbackRecommendations || []
      });
    }
    
  } catch (error) {
    console.error('Recommendations endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/personalization/update-profile
 * Update user personalization profile with new interaction data
 */
router.post('/personalization/update-profile', async (req, res) => {
  try {
    const validatedData = PersonalizationRequestSchema.parse(req.body);
    
    console.log(`👤 Updating personalization profile for user: ${validatedData.userId}`);
    
    const result = await personalizationService.updateUserProfile(validatedData);
    
    if (result.success) {
      console.log(`✅ Profile updated with ${result.data.updatedCategories} category preferences`);
      res.json({
        success: true,
        data: {
          profileSummary: result.data.profileSummary,
          preferences: result.data.preferences,
          confidenceScores: result.data.confidenceScores,
          culturalProfile: result.data.culturalProfile,
          personalizedFeatures: result.data.personalizedFeatures,
          nextOptimizations: result.data.nextOptimizations,
          processingTime: result.data.processingTime,
          profileVersion: result.data.profileVersion,
          updatedCategories: result.data.updatedCategories
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: result.data.processingTime,
          endpoint: '/api/personalization/profile/update',
          profileVersion: result.data.profileVersion
        }
      });
    } else {
      console.log('❌ Profile update failed:', result.error);
      res.status(400).json({
        success: false,
        error: result.error,
        currentProfile: result.data?.currentProfile || {}
      });
    }
    
  } catch (error) {
    console.error('Profile update endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update personalization profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/analytics/behavior
 * Advanced user behavior analytics with ML pattern recognition
 */
router.post('/analytics/behavior', async (req, res) => {
  try {
    const validatedData = BehaviorAnalyticsRequestSchema.parse(req.body);
    
    console.log(`📊 Running behavior analytics: ${validatedData.analyticsType}`);
    
    const result = await behaviorAnalyticsService.runAnalytics(validatedData);
    
    if (result.success) {
      console.log(`✅ Analytics completed with ${result.data.patterns.length} patterns identified`);
      res.json({
        success: true,
        data: {
          patterns: result.data.patterns,
          insights: result.data.insights,
          anomalies: result.data.anomalies,
          predictions: result.data.predictions,
          segments: result.data.segments,
          metrics: result.data.metrics,
          culturalInsights: result.data.culturalInsights
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: result.data.processingTime,
          endpoint: '/api/personalization/analytics/behavior',
          analyticsType: validatedData.analyticsType
        }
      });
    } else {
      console.log('❌ Behavior analytics failed:', result.error);
      res.status(400).json({
        success: false,
        error: result.error,
        basicMetrics: result.data?.basicMetrics || {}
      });
    }
    
  } catch (error) {
    console.error('Behavior analytics endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze user behavior',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/search/optimize
 * Real-time search optimization with personalized ranking
 */
router.post('/search/optimize', async (req, res) => {
  try {
    const validatedData = SearchOptimizationRequestSchema.parse(req.body);
    
    console.log(`🔍 Optimizing search: "${validatedData.searchQuery}" (${validatedData.optimizationType})`);
    
    const result = await searchOptimizationService.optimizeSearch(validatedData);
    
    if (result.success) {
      console.log(`✅ Search optimized with ${result.data.optimizedResults.length} personalized results`);
      res.json({
        success: true,
        data: {
          optimizedResults: result.data.optimizedResults,
          personalizedRanking: result.data.personalizedRanking,
          searchInsights: result.data.searchInsights,
          culturalAdaptations: result.data.culturalAdaptations,
          refinementSuggestions: result.data.refinementSuggestions,
          performanceMetrics: result.data.performanceMetrics
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: result.data.processingTime,
          endpoint: '/api/personalization/search/optimize',
          optimizationType: validatedData.optimizationType
        }
      });
    } else {
      console.log('❌ Search optimization failed:', result.error);
      res.status(400).json({
        success: false,
        error: result.error,
        defaultResults: result.data?.defaultResults || []
      });
    }
    
  } catch (error) {
    console.error('Search optimization endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/personalization/profile/:userId
 * Get user personalization profile summary
 */
router.get('/personalization/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    console.log(`👤 Fetching personalization profile for user: ${userId}`);
    
    const result = await personalizationService.getUserProfile(userId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          profile: result.data.profile,
          preferences: result.data.preferences,
          culturalProfile: result.data.culturalProfile,
          behaviorSummary: result.data.behaviorSummary,
          recommendationTags: result.data.recommendationTags
        },
        metadata: {
          timestamp: new Date().toISOString(),
          endpoint: '/api/personalization/profile/:userId',
          profileLastUpdated: result.data.lastUpdated
        }
      });
    } else {
      console.log('❌ Profile retrieval failed:', result.error);
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('Profile retrieval endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/analytics/market-insights
 * Get market insights and trending patterns
 */
router.get('/analytics/market-insights', async (req, res) => {
  try {
    console.log('📈 Generating market insights and trending patterns');
    
    const result = await behaviorAnalyticsService.getMarketInsights();
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          trendingProducts: result.data.trendingProducts,
          categoryTrends: result.data.categoryTrends,
          culturalTrends: result.data.culturalTrends,
          seasonalPatterns: result.data.seasonalPatterns,
          userSegments: result.data.userSegments,
          marketPredictions: result.data.marketPredictions
        },
        metadata: {
          timestamp: new Date().toISOString(),
          endpoint: '/api/personalization/insights/market',
          dataFreshness: result.data.dataFreshness
        }
      });
    } else {
      console.log('❌ Market insights failed:', result.error);
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('Market insights endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/personalization/capabilities
 * Get Phase 4 personalization system capabilities
 */
/**
 * POST /api/v1/recommendations/collaborative-filtering
 * Collaborative filtering recommendations
 */
router.post('/recommendations/collaborative-filtering', async (req, res) => {
  try {
    const validatedData = RecommendationRequestSchema.parse(req.body);
    console.log(`🤝 Collaborative filtering recommendations for user: ${validatedData.userId}`);
    
    const result = await recommendationService.generateCollaborativeRecommendations(validatedData);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          recommendations: result.data.recommendations,
          modelMetrics: result.data.modelMetrics,
          processingTime: result.data.processingTime
        },
        metadata: {
          timestamp: new Date().toISOString(),
          endpoint: '/api/v1/recommendations/collaborative-filtering'
        }
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Collaborative filtering failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/recommendations/content-based
 * Content-based recommendations
 */
router.post('/recommendations/content-based', async (req, res) => {
  try {
    const validatedData = RecommendationRequestSchema.parse(req.body);
    console.log(`📄 Content-based recommendations for user: ${validatedData.userId}`);
    
    const result = await recommendationService.generateContentBasedRecommendations(validatedData);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          recommendations: result.data.recommendations,
          processingTime: result.data.processingTime
        },
        metadata: {
          timestamp: new Date().toISOString(),
          endpoint: '/api/v1/recommendations/content-based'
        }
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Content-based recommendations failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/recommendations/hybrid
 * Hybrid recommendations combining multiple algorithms
 */
router.post('/recommendations/hybrid', async (req, res) => {
  try {
    const validatedData = RecommendationRequestSchema.parse(req.body);
    console.log(`🔀 Hybrid recommendations for user: ${validatedData.userId}`);
    
    const result = await recommendationService.generateHybridRecommendations(validatedData);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          recommendations: result.data.recommendations,
          hybridWeights: result.data.hybridWeights,
          processingTime: result.data.processingTime
        },
        metadata: {
          timestamp: new Date().toISOString(),
          endpoint: '/api/v1/recommendations/hybrid'
        }
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Hybrid recommendations failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/personalization/capabilities', async (req, res) => {
  try {
    const capabilities = {
      recommendationAlgorithms: [
        'Collaborative Filtering',
        'Content-Based Filtering',
        'Matrix Factorization',
        'Deep Learning Embeddings',
        'Cultural Adaptation',
        'Seasonal Optimization'
      ],
      personalizationFeatures: [
        'Real-time Profile Learning',
        'Cross-Session Continuity',
        'Cultural Preference Detection',
        'Behavioral Pattern Recognition',
        'Implicit Feedback Processing',
        'Multi-Modal Preferences'
      ],
      analyticsCapabilities: [
        'User Journey Analysis',
        'Cohort Analysis',
        'A/B Testing Framework',
        'Anomaly Detection',
        'Predictive Analytics',
        'Cultural Trend Analysis'
      ],
      bangladeshOptimizations: [
        'Festival-based Recommendations',
        'Regional Preference Modeling',
        'Payment Method Optimization',
        'Delivery Zone Adaptation',
        'Bengali Language Processing',
        'Cultural Event Integration'
      ],
      realTimeFeatures: [
        'Dynamic Search Ranking',
        'Live Preference Updates',
        'Session-based Optimization',
        'Trend-aware Recommendations',
        'Context-sensitive Results',
        'Multi-device Continuity'
      ]
    };
    
    res.json({
      success: true,
      data: capabilities,
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: '/api/personalization/capabilities',
        version: '4.0.0'
      }
    });
    
  } catch (error) {
    console.error('Capabilities endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get capabilities',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;