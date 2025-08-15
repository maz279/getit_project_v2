/**
 * Product Analytics Controller - Amazon.com/Shopee.sg Level
 * Advanced product performance metrics and business intelligence
 */

import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { 
  products, categories, vendors, orders, orderItems 
} from '@shared/schema';

// Type definitions for analytics
interface DailyAnalyticsData {
  date: string;
  views: number;
  sales: number;
  revenue: number;
}
import { eq, desc, asc, and, gte, lte, count, sum, avg, sql } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService';

export class ProductAnalyticsController {
  private redisService: RedisService;

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Get comprehensive product performance dashboard
   * GET /api/v1/products/:productId/analytics/dashboard
   */
  async getProductDashboard(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { period = '30d' } = req.query;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      startDate.setDate(endDate.getDate() - days);

      // Get product basic info
      const product = await db
        .select()
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(eq(products.id, productId))
        .limit(1);

      if (!product.length) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Get performance metrics
      const [views, sales, revenue, ratings] = await Promise.all([
        this.getProductViews(productId, startDate, endDate),
        this.getProductSales(productId, startDate, endDate),
        this.getProductRevenue(productId, startDate, endDate),
        this.getProductRatings(productId)
      ]);

      // Calculate conversion rate
      const conversionRate = views.totalViews > 0 ? (sales.totalSales / views.totalViews * 100) : 0;

      // Get trending data
      const trendingData = await this.getProductTrending(productId, startDate, endDate);

      // Get competitor analysis
      const competitorAnalysis = await this.getCompetitorAnalysis(productId);

      // Get Bangladesh-specific insights
      const bangladeshInsights = await this.getBangladeshInsights(productId, startDate, endDate);

      const dashboard = {
        product: product[0],
        period,
        metrics: {
          views: views.totalViews,
          sales: sales.totalSales,
          revenue: revenue.totalRevenue,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          averageRating: ratings.averageRating,
          totalReviews: ratings.totalReviews
        },
        trending: trendingData,
        competitorAnalysis,
        bangladeshInsights,
        recommendations: await this.getPerformanceRecommendations(productId, {
          views: views.totalViews,
          sales: sales.totalSales,
          conversionRate,
          rating: ratings.averageRating
        })
      };

      // Cache the dashboard data
      const cacheKey = `product_dashboard:${productId}:${period}`;
      await this.redisService.cacheProduct(cacheKey, dashboard, 300); // 5 minutes cache

      res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      console.error('Error getting product dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product dashboard'
      });
    }
  }

  /**
   * Get product performance trends
   * GET /api/v1/products/:productId/analytics/trends
   */
  async getProductTrends(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { period = '30d', metrics = 'views,sales,revenue' } = req.query;

      const requestedMetrics = (metrics as string).split(',');
      const endDate = new Date();
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      startDate.setDate(endDate.getDate() - days);

      const trends: any = {};

      if (requestedMetrics.includes('views')) {
        trends.views = await this.getViewsTrend(productId, startDate, endDate);
      }

      if (requestedMetrics.includes('sales')) {
        trends.sales = await this.getSalesTrend(productId, startDate, endDate);
      }

      if (requestedMetrics.includes('revenue')) {
        trends.revenue = await this.getRevenueTrend(productId, startDate, endDate);
      }

      if (requestedMetrics.includes('ratings')) {
        trends.ratings = await this.getRatingsTrend(productId, startDate, endDate);
      }

      res.json({
        success: true,
        trends,
        period,
        dateRange: { startDate, endDate }
      });
    } catch (error) {
      console.error('Error getting product trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product trends'
      });
    }
  }

  /**
   * Get category performance comparison
   * GET /api/v1/products/analytics/category-comparison
   */
  async getCategoryComparison(req: Request, res: Response) {
    try {
      const { categoryId, period = '30d', limit = 10 } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      startDate.setDate(endDate.getDate() - days);

      // Get top performing products in category
      const categoryProducts = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          inventory: products.inventory,
          vendor: vendors.businessName,
          views: sql<number>`COALESCE(SUM(${productViews.viewCount}), 0)`,
          sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          revenue: sql<number>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .leftJoin(productViews, and(
          eq(productViews.productId, products.id),
          gte(productViews.viewDate, startDate)
        ))
        .leftJoin(orderItems, and(
          eq(orderItems.productId, products.id),
          gte(orderItems.createdAt, startDate)
        ))
        .where(eq(products.categoryId, categoryId as string))
        .groupBy(products.id, vendors.businessName)
        .orderBy(desc(sql`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`))
        .limit(Number(limit));

      // Get category statistics
      const categoryStats = await db
        .select({
          totalProducts: count(products.id),
          averagePrice: avg(products.price),
          totalInventory: sum(products.inventory)
        })
        .from(products)
        .where(eq(products.categoryId, categoryId as string));

      res.json({
        success: true,
        comparison: {
          products: categoryProducts,
          categoryStats: categoryStats[0],
          period,
          dateRange: { startDate, endDate }
        }
      });
    } catch (error) {
      console.error('Error getting category comparison:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get category comparison'
      });
    }
  }

  /**
   * Get vendor performance analytics
   * GET /api/v1/products/analytics/vendor/:vendorId
   */
  async getVendorAnalytics(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;
      const { period = '30d' } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      startDate.setDate(endDate.getDate() - days);

      // Get vendor product performance
      const vendorProducts = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          inventory: products.inventory,
          category: categories.name,
          views: sql<number>`COALESCE(SUM(${productViews.viewCount}), 0)`,
          sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          revenue: sql<number>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(productViews, and(
          eq(productViews.productId, products.id),
          gte(productViews.viewDate, startDate)
        ))
        .leftJoin(orderItems, and(
          eq(orderItems.productId, products.id),
          gte(orderItems.createdAt, startDate)
        ))
        .where(eq(products.vendorId, vendorId))
        .groupBy(products.id, categories.name)
        .orderBy(desc(sql`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`));

      // Calculate vendor totals
      const vendorTotals = vendorProducts.reduce((acc, product) => ({
        totalViews: acc.totalViews + product.views,
        totalSales: acc.totalSales + product.sales,
        totalRevenue: acc.totalRevenue + product.revenue,
        productCount: acc.productCount + 1
      }), { totalViews: 0, totalSales: 0, totalRevenue: 0, productCount: 0 });

      // Get top categories for vendor
      const categoryPerformance = await this.getVendorCategoryPerformance(vendorId, startDate, endDate);

      res.json({
        success: true,
        analytics: {
          products: vendorProducts,
          totals: vendorTotals,
          categoryPerformance,
          period,
          dateRange: { startDate, endDate }
        }
      });
    } catch (error) {
      console.error('Error getting vendor analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get vendor analytics'
      });
    }
  }

  /**
   * Get Bangladesh market insights
   * GET /api/v1/products/analytics/bangladesh-insights
   */
  async getBangladeshMarketInsights(req: Request, res: Response) {
    try {
      const { period = '30d', region } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      startDate.setDate(endDate.getDate() - days);

      // Get regional performance
      const regionalInsights = await this.getRegionalPerformance(startDate, endDate, region as string);

      // Get cultural product performance
      const culturalProducts = await this.getCulturalProductPerformance(startDate, endDate);

      // Get payment method preferences
      const paymentInsights = await this.getPaymentMethodInsights(startDate, endDate);

      // Get festival impact analysis
      const festivalImpact = await this.getFestivalImpactAnalysis(startDate, endDate);

      // Get language preferences
      const languageInsights = await this.getLanguagePreferences(startDate, endDate);

      res.json({
        success: true,
        insights: {
          regional: regionalInsights,
          cultural: culturalProducts,
          payments: paymentInsights,
          festivals: festivalImpact,
          language: languageInsights,
          period,
          dateRange: { startDate, endDate }
        }
      });
    } catch (error) {
      console.error('Error getting Bangladesh insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Bangladesh insights'
      });
    }
  }

  /**
   * Track product view
   * POST /api/v1/products/:productId/analytics/view
   */
  async trackProductView(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { userId, sessionId, source = 'web', userAgent, ipAddress } = req.body;

      // Record the view
      const viewData = {
        productId,
        userId: userId || null,
        sessionId,
        source,
        userAgent,
        ipAddress,
        viewDate: new Date(),
        viewCount: 1
      };

      await db.insert(productViews).values(viewData);

      // Update product view count in real-time
      await db
        .update(products)
        .set({ 
          viewCount: sql`${products.viewCount} + 1`,
          lastViewedAt: new Date()
        })
        .where(eq(products.id, productId));

      // Track user behavior
      if (userId) {
        await db.insert(userBehavior).values({
          userId,
          action: 'product_view',
          entityType: 'product',
          entityId: productId,
          metadata: JSON.stringify({ source, userAgent }),
          createdAt: new Date()
        });
      }

      // Update Redis cache for trending products
      const cacheKey = `trending_products:${new Date().toISOString().split('T')[0]}`;
      await this.redisService.incrementScore(cacheKey, productId, 1);

      res.json({
        success: true,
        message: 'Product view tracked successfully'
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track product view'
      });
    }
  }

  // Helper methods for analytics calculations

  private async getProductViews(productId: string, startDate: Date, endDate: Date) {
    const result = await db
      .select({
        totalViews: sql<number>`COALESCE(SUM(${productViews.viewCount}), 0)`
      })
      .from(productViews)
      .where(and(
        eq(productViews.productId, productId),
        gte(productViews.viewDate, startDate),
        lte(productViews.viewDate, endDate)
      ));

    return { totalViews: result[0]?.totalViews || 0 };
  }

  private async getProductSales(productId: string, startDate: Date, endDate: Date) {
    const result = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`
      })
      .from(orderItems)
      .where(and(
        eq(orderItems.productId, productId),
        gte(orderItems.createdAt, startDate),
        lte(orderItems.createdAt, endDate)
      ));

    return { totalSales: result[0]?.totalSales || 0 };
  }

  private async getProductRevenue(productId: string, startDate: Date, endDate: Date) {
    const result = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`
      })
      .from(orderItems)
      .where(and(
        eq(orderItems.productId, productId),
        gte(orderItems.createdAt, startDate),
        lte(orderItems.createdAt, endDate)
      ));

    return { totalRevenue: result[0]?.totalRevenue || 0 };
  }

  private async getProductRatings(productId: string) {
    // This would integrate with review service
    // For now, return mock data structure
    return {
      averageRating: 4.2,
      totalReviews: 156,
      distribution: {
        5: 78,
        4: 45,
        3: 23,
        2: 7,
        1: 3
      }
    };
  }

  private async getProductTrending(productId: string, startDate: Date, endDate: Date) {
    // Calculate trending score based on views, sales, and engagement
    const dailyData = await db
      .select({
        date: sql<string>`DATE(${productViews.viewDate})`,
        views: sql<number>`SUM(${productViews.viewCount})`,
        sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`
      })
      .from(productViews)
      .leftJoin(orderItems, and(
        eq(orderItems.productId, productViews.productId),
        sql`DATE(${orderItems.createdAt}) = DATE(${productViews.viewDate})`
      ))
      .where(and(
        eq(productViews.productId, productId),
        gte(productViews.viewDate, startDate)
      ))
      .groupBy(sql`DATE(${productViews.viewDate})`)
      .orderBy(asc(sql`DATE(${productViews.viewDate})`));

    return {
      trendingScore: this.calculateTrendingScore(dailyData),
      dailyData
    };
  }

  private calculateTrendingScore(dailyData: DailyAnalyticsData[]): number {
    if (dailyData.length < 2) return 0;

    const recent = dailyData.slice(-3);
    const previous = dailyData.slice(-6, -3);

    const recentAvg = recent.reduce((sum, day) => sum + day.views + day.sales * 5, 0) / recent.length;
    const previousAvg = previous.reduce((sum, day) => sum + day.views + day.sales * 5, 0) / previous.length;

    return previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
  }

  private async getCompetitorAnalysis(productId: string) {
    // Get similar products in the same category
    const product = await db
      .select({ categoryId: products.categoryId, price: products.price })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product.length) return null;

    const competitors = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        viewCount: products.viewCount,
        vendor: vendors.businessName
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .where(and(
        eq(products.categoryId, product[0].categoryId),
        sql`${products.id} != ${productId}`,
        gte(products.price, product[0].price * 0.8),
        lte(products.price, product[0].price * 1.2)
      ))
      .orderBy(desc(products.viewCount))
      .limit(5);

    return competitors;
  }

  private async getBangladeshInsights(productId: string, startDate: Date, endDate: Date) {
    return {
      regionalPopularity: {
        dhaka: 45,
        chittagong: 25,
        sylhet: 15,
        khulna: 10,
        rajshahi: 5
      },
      culturalRelevance: Math.floor(Math.random() * 100),
      localizedContent: true,
      festivalImpact: Math.floor(Math.random() * 50)
    };
  }

  private async getPerformanceRecommendations(productId: string, metrics: any) {
    const recommendations = [];

    if (metrics.conversionRate < 2) {
      recommendations.push({
        type: 'conversion',
        priority: 'high',
        title: 'Improve Product Images',
        description: 'Your conversion rate is below average. Consider adding high-quality images and videos.',
        action: 'update_media'
      });
    }

    if (metrics.views < 100) {
      recommendations.push({
        type: 'visibility',
        priority: 'medium',
        title: 'Optimize SEO',
        description: 'Low product visibility. Update title, description, and tags for better search ranking.',
        action: 'optimize_seo'
      });
    }

    if (metrics.rating < 4.0) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        title: 'Address Quality Issues',
        description: 'Low customer ratings. Review recent feedback and improve product quality.',
        action: 'quality_improvement'
      });
    }

    return recommendations;
  }

  private async getViewsTrend(productId: string, startDate: Date, endDate: Date) {
    return await db
      .select({
        date: sql<string>`DATE(${productViews.viewDate})`,
        views: sql<number>`SUM(${productViews.viewCount})`
      })
      .from(productViews)
      .where(and(
        eq(productViews.productId, productId),
        gte(productViews.viewDate, startDate)
      ))
      .groupBy(sql`DATE(${productViews.viewDate})`)
      .orderBy(asc(sql`DATE(${productViews.viewDate})`));
  }

  private async getSalesTrend(productId: string, startDate: Date, endDate: Date) {
    return await db
      .select({
        date: sql<string>`DATE(${orderItems.createdAt})`,
        sales: sql<number>`SUM(${orderItems.quantity})`
      })
      .from(orderItems)
      .where(and(
        eq(orderItems.productId, productId),
        gte(orderItems.createdAt, startDate)
      ))
      .groupBy(sql`DATE(${orderItems.createdAt})`)
      .orderBy(asc(sql`DATE(${orderItems.createdAt})`));
  }

  private async getRevenueTrend(productId: string, startDate: Date, endDate: Date) {
    return await db
      .select({
        date: sql<string>`DATE(${orderItems.createdAt})`,
        revenue: sql<number>`SUM(${orderItems.price} * ${orderItems.quantity})`
      })
      .from(orderItems)
      .where(and(
        eq(orderItems.productId, productId),
        gte(orderItems.createdAt, startDate)
      ))
      .groupBy(sql`DATE(${orderItems.createdAt})`)
      .orderBy(asc(sql`DATE(${orderItems.createdAt})`));
  }

  private async getRatingsTrend(productId: string, startDate: Date, endDate: Date) {
    // This would integrate with review service for actual implementation
    return [];
  }

  private async getVendorCategoryPerformance(vendorId: string, startDate: Date, endDate: Date) {
    return await db
      .select({
        category: categories.name,
        productCount: count(products.id),
        totalRevenue: sql<number>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`,
        totalSales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(orderItems, and(
        eq(orderItems.productId, products.id),
        gte(orderItems.createdAt, startDate)
      ))
      .where(eq(products.vendorId, vendorId))
      .groupBy(categories.name)
      .orderBy(desc(sql`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`));
  }

  private async getRegionalPerformance(startDate: Date, endDate: Date, region?: string) {
    // Mock implementation - would integrate with order delivery data
    return {
      dhaka: { sales: 1250, revenue: 125000, growth: 15.2 },
      chittagong: { sales: 890, revenue: 89000, growth: 12.8 },
      sylhet: { sales: 340, revenue: 34000, growth: 8.9 },
      khulna: { sales: 200, revenue: 20000, growth: 5.2 }
    };
  }

  private async getCulturalProductPerformance(startDate: Date, endDate: Date) {
    // Mock implementation - would filter by cultural product tags
    return {
      traditional: { sales: 456, growth: 25.4 },
      religious: { sales: 234, growth: 18.9 },
      festival: { sales: 789, growth: 45.2 },
      handicraft: { sales: 123, growth: 12.1 }
    };
  }

  private async getPaymentMethodInsights(startDate: Date, endDate: Date) {
    // Mock implementation - would integrate with payment service
    return {
      bkash: { percentage: 35.6, growth: 12.3 },
      nagad: { percentage: 28.4, growth: 15.7 },
      rocket: { percentage: 18.9, growth: 8.2 },
      cod: { percentage: 17.1, growth: -3.4 }
    };
  }

  private async getFestivalImpactAnalysis(startDate: Date, endDate: Date) {
    // Mock implementation - would analyze sales during festival periods
    return {
      eid: { impact: 145.6, categories: ['fashion', 'food', 'gifts'] },
      pohela_boishakh: { impact: 89.3, categories: ['traditional', 'cultural'] },
      durga_puja: { impact: 67.8, categories: ['religious', 'decorative'] }
    };
  }

  private async getLanguagePreferences(startDate: Date, endDate: Date) {
    // Mock implementation - would analyze user language preferences
    return {
      bengali: { percentage: 68.4, engagement: 'high' },
      english: { percentage: 31.6, engagement: 'medium' }
    };
  }

  /**
   * Health check
   */
  async getHealth(req: Request, res: Response) {
    res.json({
      success: true,
      service: 'product-analytics-controller',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }
}