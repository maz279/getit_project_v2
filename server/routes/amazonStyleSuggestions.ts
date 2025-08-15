/**
 * Amazon-Style Suggestion Routes
 * Enhanced marketplace auto-suggestion endpoints
 */

import { Router, Request, Response } from 'express';
import { AmazonStyleSuggestionService } from '../services/ai/AmazonStyleSuggestionService';

const router = Router();
const suggestionService = AmazonStyleSuggestionService.getInstance();

/**
 * GET /api/suggestions-enhanced - Amazon-style hybrid suggestions
 * Query parameters:
 * - q: search query (required)
 * - vendor_id: vendor filter (optional)
 * - location: user location (optional, e.g., 'BD' for Bangladesh)
 * - limit: max results (optional, default 10)
 */
router.get('/suggestions-enhanced', async (req: Request, res: Response) => {
  try {
    const { q, vendor_id, location, limit, user_history, user_id } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const options = {
      vendorId: vendor_id ? parseInt(vendor_id as string) : undefined,
      location: location as string || 'BD',
      userHistory: user_history ? (user_history as string).split(',') : [],
      userId: user_id as string,
      limit: limit ? parseInt(limit as string) : 10
    };

    const startTime = Date.now();
    const suggestions = await suggestionService.getSuggestions(q, options);
    const responseTime = Date.now() - startTime;

    console.log(`🚀 Amazon-style API: "${q}" → ${suggestions.length} suggestions in ${responseTime}ms`);

    res.json({
      success: true,
      data: suggestions,
      metadata: {
        query: q,
        responseTime,
        count: suggestions.length,
        options,
        hasRecentlyViewed: !!user_id
      }
    });

  } catch (error) {
    console.error('Amazon-style suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/suggestions-enhanced/stats - Index statistics
 */
router.get('/suggestions-enhanced/stats', async (req: Request, res: Response) => {
  try {
    const stats = suggestionService.getIndexStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/suggestions-enhanced/track-view - Track recently viewed product
 */
router.post('/suggestions-enhanced/track-view', async (req: Request, res: Response) => {
  try {
    const { user_id, product_id } = req.body;
    
    if (!user_id || !product_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and product_id are required'
      });
    }

    suggestionService.addRecentlyViewedProduct(user_id, parseInt(product_id));
    
    res.json({
      success: true,
      message: 'Product view tracked successfully'
    });

  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/suggestions-enhanced/recently-viewed - Get recently viewed products
 */
router.get('/suggestions-enhanced/recently-viewed', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'user_id parameter is required'
      });
    }

    const recentlyViewed = suggestionService.getRecentlyViewedProducts(user_id);
    
    res.json({
      success: true,
      data: recentlyViewed,
      count: recentlyViewed.length
    });

  } catch (error) {
    console.error('Recently viewed error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/suggestions-enhanced/debug - Debug endpoint for development
 */
router.get('/suggestions-enhanced/debug', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const suggestions = await suggestionService.getSuggestions(q, { limit: 20 });
    const stats = suggestionService.getIndexStats();

    res.json({
      success: true,
      data: {
        query: q,
        suggestions,
        indexStats: stats,
        debugInfo: {
          catalogSuggestions: suggestions.filter(s => s.source === 'catalog').length,
          querySuggestions: suggestions.filter(s => s.source === 'query').length,
          avgImportance: suggestions.reduce((sum, s) => sum + s.importance, 0) / suggestions.length,
          topSuggestions: suggestions.slice(0, 5).map(s => ({
            text: s.text,
            source: s.source,
            importance: s.importance,
            type: s.type
          }))
        }
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as amazonStyleSuggestionsRouter };