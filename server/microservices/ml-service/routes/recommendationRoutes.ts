import { Router } from 'express';
import { db } from '../../../db';
import { products, users, orders, orderItems, userBehaviors, categories, vendors } from '@shared/schema';
import { eq, and, desc, sql, inArray, gte, lte, isNotNull } from 'drizzle-orm';
import { RecommendationEngine } from '../engines/RecommendationEngine';
import { authMiddleware } from '../../user-service/middleware/authMiddleware';

const router = Router();
const recommendationEngine = new RecommendationEngine();

/**
 * @route GET /api/v1/ml/recommendations/products/:userId
 * @desc Get personalized product recommendations for a user
 * @access Private
 */
router.get('/products/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const algorithm = req.query.algorithm as string || 'hybrid';
    
    // Verify user exists
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId)));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    let recommendations;
    
    switch (algorithm) {
      case 'collaborative':
        recommendations = await recommendationEngine.getCollaborativeRecommendations(parseInt(userId), limit);
        break;
      case 'content':
        recommendations = await recommendationEngine.getContentBasedRecommendations(parseInt(userId), limit);
        break;
      case 'popular':
        recommendations = await recommendationEngine.getPopularRecommendations(limit);
        break;
      case 'trending':
        recommendations = await recommendationEngine.getTrendingRecommendations(limit);
        break;
      case 'hybrid':
      default:
        recommendations = await recommendationEngine.getHybridRecommendations(parseInt(userId), limit);
        break;
    }
    
    res.json({
      success: true,
      data: {
        algorithm,
        recommendations,
        metadata: {
          userId: parseInt(userId),
          count: recommendations.length,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Product recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/ml/recommendations/similar/:productId
 * @desc Get similar products based on content similarity
 * @access Public
 */
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 8;
    
    // Verify product exists
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }
    
    const similarProducts = await recommendationEngine.getSimilarProducts(productId, limit);
    
    res.json({
      success: true,
      data: {
        baseProduct: {
          id: product.id,
          name: product.name,
          category: product.categoryId
        },
        similarProducts,
        metadata: {
          count: similarProducts.length,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/ml/recommendations/category/:categoryId
 * @desc Get category-based recommendations
 * @access Public
 */
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const limit = parseInt(req.query.limit as string) || 12;
    const sortBy = req.query.sortBy as string || 'popularity';
    
    const categoryRecommendations = await recommendationEngine.getCategoryRecommendations(
      categoryId, 
      limit, 
      sortBy
    );
    
    res.json({
      success: true,
      data: {
        categoryId,
        recommendations: categoryRecommendations,
        sortBy,
        metadata: {
          count: categoryRecommendations.length,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Category recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/ml/recommendations/bundle/:productId
 * @desc Get frequently bought together recommendations
 * @access Public
 */
router.get('/bundle/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const bundleRecommendations = await recommendationEngine.getFrequentlyBoughtTogether(productId, limit);
    
    res.json({
      success: true,
      data: {
        baseProductId: productId,
        bundleRecommendations,
        metadata: {
          count: bundleRecommendations.length,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Bundle recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bundle recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/ml/recommendations/feedback
 * @desc Record user feedback on recommendations
 * @access Private
 */
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const { productId, action, rating, context } = req.body;
    const userId = req.user?.userId;
    
    if (!productId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and action are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }
    
    // Record user behavior for learning
    await db.insert(userBehaviors).values({
      userId,
      behaviorType: 'recommendation_feedback',
      targetType: 'product',
      targetId: productId,
      action,
      metadata: {
        rating,
        context,
        timestamp: new Date().toISOString()
      }
    });
    
    // Update recommendation engine with feedback
    await recommendationEngine.recordFeedback(userId, productId, action, rating);
    
    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: {
        userId,
        productId,
        action,
        rating
      }
    });
    
  } catch (error) {
    console.error('Recommendation feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/ml/recommendations/analytics/:userId
 * @desc Get recommendation analytics for a user
 * @access Private (Admin or self)
 */
router.get('/analytics/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;
    const userRole = req.user?.role;
    
    // Check authorization
    if (userRole !== 'admin' && requestingUserId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    const analytics = await recommendationEngine.getUserRecommendationAnalytics(parseInt(userId));
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Recommendation analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/ml/recommendations/popular/:timeframe
 * @desc Get popular products in specific timeframe
 * @access Public
 */
router.get('/popular/:timeframe', async (req, res) => {
  try {
    const { timeframe } = req.params; // daily, weekly, monthly
    const limit = parseInt(req.query.limit as string) || 20;
    const categoryId = req.query.categoryId as string;
    
    const popularProducts = await recommendationEngine.getPopularProductsByTimeframe(
      timeframe,
      limit,
      categoryId
    );
    
    res.json({
      success: true,
      data: {
        timeframe,
        categoryId,
        popularProducts,
        metadata: {
          count: popularProducts.length,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Popular products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;