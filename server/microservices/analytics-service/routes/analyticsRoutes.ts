import { Router } from 'express';
import { db } from '../../../db';
import { 
  products, 
  users, 
  orders, 
  orderItems, 
  userBehaviors, 
  categories, 
  vendors,
  paymentTransactions,
  userSessions
} from '@shared/schema';
import { eq, and, desc, asc, sql, inArray, gte, lte, count, sum, avg, between } from 'drizzle-orm';
import { authMiddleware } from '../../user-service/middleware/authMiddleware';
import { AnalyticsEngine } from '../engines/AnalyticsEngine';

const router = Router();
const analyticsEngine = new AnalyticsEngine();

/**
 * @route GET /api/v1/analytics/dashboard/overview
 * @desc Get comprehensive dashboard overview analytics
 * @access Private (Admin)
 */
router.get('/dashboard/overview', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const overview = await analyticsEngine.getDashboardOverview(timeframe);

    res.json({
      success: true,
      data: overview,
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard overview',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/sales/summary
 * @desc Get sales analytics summary
 * @access Private (Admin/Vendor)
 */
router.get('/sales/summary', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    
    if (userRole !== 'admin' && userRole !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or vendor role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const vendorId = userRole === 'vendor' ? userId?.toString() : req.query.vendorId as string;
    
    const salesSummary = await analyticsEngine.getSalesSummary(timeframe, vendorId);

    res.json({
      success: true,
      data: salesSummary,
      timeframe,
      vendorId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sales summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/users/behavior
 * @desc Get user behavior analytics
 * @access Private (Admin)
 */
router.get('/users/behavior', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const behaviorAnalytics = await analyticsEngine.getUserBehaviorAnalytics(timeframe);

    res.json({
      success: true,
      data: behaviorAnalytics,
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('User behavior analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user behavior analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/products/performance
 * @desc Get product performance analytics
 * @access Private (Admin/Vendor)
 */
router.get('/products/performance', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    
    if (userRole !== 'admin' && userRole !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or vendor role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const vendorId = userRole === 'vendor' ? userId?.toString() : req.query.vendorId as string;
    const categoryId = req.query.categoryId as string;
    
    const productPerformance = await analyticsEngine.getProductPerformance(timeframe, vendorId, categoryId);

    res.json({
      success: true,
      data: productPerformance,
      timeframe,
      vendorId,
      categoryId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product performance',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/revenue/trends
 * @desc Get revenue trend analytics
 * @access Private (Admin/Vendor)
 */
router.get('/revenue/trends', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;
    
    if (userRole !== 'admin' && userRole !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or vendor role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const granularity = req.query.granularity as string || 'daily';
    const vendorId = userRole === 'vendor' ? userId?.toString() : req.query.vendorId as string;
    
    const revenueTrends = await analyticsEngine.getRevenueTrends(timeframe, granularity, vendorId);

    res.json({
      success: true,
      data: revenueTrends,
      timeframe,
      granularity,
      vendorId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revenue trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue trends',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/customers/insights
 * @desc Get customer insights and segmentation
 * @access Private (Admin)
 */
router.get('/customers/insights', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const customerInsights = await analyticsEngine.getCustomerInsights(timeframe);

    res.json({
      success: true,
      data: customerInsights,
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer insights',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/geographic/distribution
 * @desc Get geographic distribution analytics for Bangladesh
 * @access Private (Admin)
 */
router.get('/geographic/distribution', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const metric = req.query.metric as string || 'orders'; // orders, revenue, users
    
    const geographicData = await analyticsEngine.getBangladeshGeographicDistribution(timeframe, metric);

    res.json({
      success: true,
      data: geographicData,
      timeframe,
      metric,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Geographic distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get geographic distribution',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/conversion/funnel
 * @desc Get conversion funnel analytics
 * @access Private (Admin)
 */
router.get('/conversion/funnel', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const conversionFunnel = await analyticsEngine.getConversionFunnel(timeframe);

    res.json({
      success: true,
      data: conversionFunnel,
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Conversion funnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversion funnel',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/payments/methods
 * @desc Get payment method analytics (Bangladesh-specific)
 * @access Private (Admin)
 */
router.get('/payments/methods', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const paymentMethodAnalytics = await analyticsEngine.getPaymentMethodAnalytics(timeframe);

    res.json({
      success: true,
      data: paymentMethodAnalytics,
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Payment method analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment method analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/vendors/performance
 * @desc Get vendor performance analytics
 * @access Private (Admin)
 */
router.get('/vendors/performance', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const timeframe = req.query.timeframe as string || '30d';
    const sortBy = req.query.sortBy as string || 'revenue'; // revenue, orders, rating
    const limit = parseInt(req.query.limit as string) || 50;
    
    const vendorPerformance = await analyticsEngine.getVendorPerformance(timeframe, sortBy, limit);

    res.json({
      success: true,
      data: vendorPerformance,
      timeframe,
      sortBy,
      limit,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Vendor performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor performance',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/realtime/metrics
 * @desc Get real-time metrics dashboard
 * @access Private (Admin)
 */
router.get('/realtime/metrics', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const realtimeMetrics = await analyticsEngine.getRealtimeMetrics();

    res.json({
      success: true,
      data: realtimeMetrics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Realtime metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get realtime metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/analytics/track/event
 * @desc Track custom analytics event
 * @access Private
 */
router.post('/track/event', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { eventType, eventData, metadata } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'Event type is required',
        code: 'MISSING_EVENT_TYPE'
      });
    }

    await analyticsEngine.trackEvent(userId, eventType, eventData, metadata);

    res.json({
      success: true,
      message: 'Event tracked successfully',
      data: {
        userId,
        eventType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/analytics/reports/custom
 * @desc Generate custom analytics report
 * @access Private (Admin)
 */
router.get('/reports/custom', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        code: 'ACCESS_DENIED'
      });
    }

    const {
      metrics,
      dimensions,
      filters,
      timeframe,
      granularity
    } = req.query;

    const customReport = await analyticsEngine.generateCustomReport({
      metrics: typeof metrics === 'string' ? metrics.split(',') : [],
      dimensions: typeof dimensions === 'string' ? dimensions.split(',') : [],
      filters: filters ? JSON.parse(filters as string) : {},
      timeframe: timeframe as string || '30d',
      granularity: granularity as string || 'daily'
    });

    res.json({
      success: true,
      data: customReport,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Custom report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate custom report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;