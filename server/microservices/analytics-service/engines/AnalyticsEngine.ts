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

/**
 * Advanced Analytics Engine for Amazon/Shopee-level Business Intelligence
 * Provides comprehensive analytics across all business dimensions
 */
export class AnalyticsEngine {

  /**
   * Get comprehensive dashboard overview analytics
   */
  async getDashboardOverview(timeframe: string = '30d'): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);
      
      // Parallel execution of all metrics for performance
      const [
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        averageOrderValue,
        conversionRate,
        topSellingProducts,
        recentActivity,
        growthMetrics
      ] = await Promise.all([
        this.getTotalRevenue(dateFilter),
        this.getTotalOrders(dateFilter),
        this.getTotalUsers(dateFilter),
        this.getTotalProducts(),
        this.getAverageOrderValue(dateFilter),
        this.getConversionRate(dateFilter),
        this.getTopSellingProducts(dateFilter, 5),
        this.getRecentActivity(5),
        this.getGrowthMetrics(timeframe)
      ]);

      return {
        summary: {
          totalRevenue,
          totalOrders,
          totalUsers,
          totalProducts,
          averageOrderValue,
          conversionRate
        },
        topSellingProducts,
        recentActivity,
        growthMetrics,
        timeframe,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Dashboard overview error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive sales analytics summary
   */
  async getSalesSummary(timeframe: string = '30d', vendorId?: string): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);
      const vendorFilter = vendorId ? eq(products.vendorId, vendorId) : undefined;

      const salesData = await db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(${orderItems.totalPrice}::DECIMAL), 0)`,
          totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
          totalItems: sql<number>`SUM(${orderItems.quantity})`,
          averageOrderValue: sql<number>`COALESCE(AVG(${orders.total}::DECIMAL), 0)`,
          uniqueCustomers: sql<number>`COUNT(DISTINCT ${orders.userId})`
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(
          and(
            dateFilter,
            vendorFilter,
            eq(orders.status, 'completed')
          )
        );

      // Get sales trends by day
      const salesTrends = await db
        .select({
          date: sql<string>`DATE(${orders.createdAt})`,
          revenue: sql<number>`SUM(${orderItems.totalPrice}::DECIMAL)`,
          orders: sql<number>`COUNT(DISTINCT ${orders.id})`
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(
          and(
            dateFilter,
            vendorFilter,
            eq(orders.status, 'completed')
          )
        )
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      // Get top performing products
      const topProducts = await this.getTopSellingProducts(dateFilter, 10, vendorId);

      return {
        summary: salesData[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          totalItems: 0,
          averageOrderValue: 0,
          uniqueCustomers: 0
        },
        trends: salesTrends,
        topProducts,
        timeframe,
        vendorId
      };

    } catch (error) {
      console.error('Sales summary error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive user behavior analytics
   */
  async getUserBehaviorAnalytics(timeframe: string = '30d'): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);

      // User activity breakdown
      const userActivity = await db
        .select({
          behaviorType: userBehaviors.behaviorType,
          action: userBehaviors.action,
          count: sql<number>`COUNT(*)`
        })
        .from(userBehaviors)
        .where(dateFilter)
        .groupBy(userBehaviors.behaviorType, userBehaviors.action)
        .orderBy(desc(sql`COUNT(*)`));

      // Session analytics
      const sessionAnalytics = await db
        .select({
          averageSessionDuration: sql<number>`AVG(EXTRACT(EPOCH FROM (${userSessions.lastActivity} - ${userSessions.createdAt})))`,
          totalSessions: sql<number>`COUNT(*)`,
          uniqueUsers: sql<number>`COUNT(DISTINCT ${userSessions.userId})`,
          bounceRate: sql<number>`COUNT(CASE WHEN ${userSessions.pageViews} = 1 THEN 1 END) * 100.0 / COUNT(*)`
        })
        .from(userSessions)
        .where(dateFilter);

      // Device and location analytics
      const deviceAnalytics = await db
        .select({
          deviceType: sql<string>`${userSessions.metadata}->>'deviceType'`,
          browser: sql<string>`${userSessions.metadata}->>'browser'`,
          count: sql<number>`COUNT(*)`
        })
        .from(userSessions)
        .where(dateFilter)
        .groupBy(sql`${userSessions.metadata}->>'deviceType'`, sql`${userSessions.metadata}->>'browser'`)
        .orderBy(desc(sql`COUNT(*)`));

      return {
        userActivity,
        sessionAnalytics: sessionAnalytics[0] || {
          averageSessionDuration: 0,
          totalSessions: 0,
          uniqueUsers: 0,
          bounceRate: 0
        },
        deviceAnalytics,
        timeframe
      };

    } catch (error) {
      console.error('User behavior analytics error:', error);
      throw error;
    }
  }

  /**
   * Get product performance analytics
   */
  async getProductPerformance(timeframe: string = '30d', vendorId?: string, categoryId?: string): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);
      const vendorFilter = vendorId ? eq(products.vendorId, vendorId) : undefined;
      const categoryFilter = categoryId ? eq(products.categoryId, categoryId) : undefined;

      const productPerformance = await db
        .select({
          productId: products.id,
          productName: products.name,
          productNameBn: products.nameBn,
          categoryId: products.categoryId,
          vendorId: products.vendorId,
          price: products.price,
          totalSold: sql<number>`SUM(${orderItems.quantity})`,
          totalRevenue: sql<number>`SUM(${orderItems.totalPrice}::DECIMAL)`,
          orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
          averageRating: sql<number>`COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0)`,
          viewCount: sql<number>`COUNT(CASE WHEN ${userBehaviors.action} = 'view' THEN 1 END)`,
          conversionRate: sql<number>`COUNT(DISTINCT ${orders.id}) * 100.0 / NULLIF(COUNT(CASE WHEN ${userBehaviors.action} = 'view' THEN 1 END), 0)`
        })
        .from(products)
        .leftJoin(orderItems, eq(products.id, orderItems.productId))
        .leftJoin(orders, and(
          eq(orderItems.orderId, orders.id),
          eq(orders.status, 'completed'),
          dateFilter
        ))
        .leftJoin(userBehaviors, and(
          eq(userBehaviors.targetId, products.id),
          eq(userBehaviors.targetType, 'product'),
          dateFilter
        ))
        .where(
          and(
            vendorFilter,
            categoryFilter,
            eq(products.isActive, true)
          )
        )
        .groupBy(
          products.id, 
          products.name, 
          products.nameBn, 
          products.categoryId, 
          products.vendorId, 
          products.price
        )
        .orderBy(desc(sql`SUM(${orderItems.totalPrice}::DECIMAL)`))
        .limit(50);

      return {
        products: productPerformance,
        timeframe,
        vendorId,
        categoryId
      };

    } catch (error) {
      console.error('Product performance error:', error);
      throw error;
    }
  }

  /**
   * Get revenue trends with specified granularity
   */
  async getRevenueTrends(timeframe: string = '30d', granularity: string = 'daily', vendorId?: string): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);
      const vendorFilter = vendorId ? eq(products.vendorId, vendorId) : undefined;

      let dateGrouping;
      switch (granularity) {
        case 'hourly':
          dateGrouping = sql`DATE_TRUNC('hour', ${orders.createdAt})`;
          break;
        case 'daily':
          dateGrouping = sql`DATE(${orders.createdAt})`;
          break;
        case 'weekly':
          dateGrouping = sql`DATE_TRUNC('week', ${orders.createdAt})`;
          break;
        case 'monthly':
          dateGrouping = sql`DATE_TRUNC('month', ${orders.createdAt})`;
          break;
        default:
          dateGrouping = sql`DATE(${orders.createdAt})`;
      }

      const revenueTrends = await db
        .select({
          period: dateGrouping,
          revenue: sql<number>`SUM(${orderItems.totalPrice}::DECIMAL)`,
          orders: sql<number>`COUNT(DISTINCT ${orders.id})`,
          customers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
          averageOrderValue: sql<number>`AVG(${orders.total}::DECIMAL)`
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(
          and(
            dateFilter,
            vendorFilter,
            eq(orders.status, 'completed')
          )
        )
        .groupBy(dateGrouping)
        .orderBy(dateGrouping);

      return {
        trends: revenueTrends,
        timeframe,
        granularity,
        vendorId
      };

    } catch (error) {
      console.error('Revenue trends error:', error);
      throw error;
    }
  }

  /**
   * Get customer insights and segmentation
   */
  async getCustomerInsights(timeframe: string = '30d'): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);

      // Customer segmentation based on order value and frequency
      const customerSegments = await db
        .select({
          userId: orders.userId,
          totalOrders: sql<number>`COUNT(*)`,
          totalSpent: sql<number>`SUM(${orders.total}::DECIMAL)`,
          averageOrderValue: sql<number>`AVG(${orders.total}::DECIMAL)`,
          firstOrderDate: sql<Date>`MIN(${orders.createdAt})`,
          lastOrderDate: sql<Date>`MAX(${orders.createdAt})`,
          daysSinceLastOrder: sql<number>`EXTRACT(DAY FROM NOW() - MAX(${orders.createdAt}))`,
          segment: sql<string>`
            CASE 
              WHEN COUNT(*) >= 10 AND SUM(${orders.total}::DECIMAL) >= 50000 THEN 'VIP'
              WHEN COUNT(*) >= 5 AND SUM(${orders.total}::DECIMAL) >= 20000 THEN 'Loyal'
              WHEN COUNT(*) >= 2 THEN 'Regular'
              ELSE 'New'
            END
          `
        })
        .from(orders)
        .where(
          and(
            dateFilter,
            eq(orders.status, 'completed')
          )
        )
        .groupBy(orders.userId);

      // Segment summary
      const segmentSummary = await db
        .select({
          segment: sql<string>`
            CASE 
              WHEN COUNT(*) >= 10 AND SUM(${orders.total}::DECIMAL) >= 50000 THEN 'VIP'
              WHEN COUNT(*) >= 5 AND SUM(${orders.total}::DECIMAL) >= 20000 THEN 'Loyal'
              WHEN COUNT(*) >= 2 THEN 'Regular'
              ELSE 'New'
            END
          `,
          customerCount: sql<number>`COUNT(DISTINCT ${orders.userId})`,
          totalRevenue: sql<number>`SUM(${orders.total}::DECIMAL)`,
          averageOrderValue: sql<number>`AVG(${orders.total}::DECIMAL)`
        })
        .from(orders)
        .where(
          and(
            dateFilter,
            eq(orders.status, 'completed')
          )
        )
        .groupBy(sql`
          CASE 
            WHEN COUNT(*) >= 10 AND SUM(${orders.total}::DECIMAL) >= 50000 THEN 'VIP'
            WHEN COUNT(*) >= 5 AND SUM(${orders.total}::DECIMAL) >= 20000 THEN 'Loyal'
            WHEN COUNT(*) >= 2 THEN 'Regular'
            ELSE 'New'
          END
        `);

      return {
        segmentSummary,
        customerCount: customerSegments.length,
        timeframe
      };

    } catch (error) {
      console.error('Customer insights error:', error);
      throw error;
    }
  }

  /**
   * Get Bangladesh-specific geographic distribution
   */
  async getBangladeshGeographicDistribution(timeframe: string = '30d', metric: string = 'orders'): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);

      let metricExpression;
      switch (metric) {
        case 'revenue':
          metricExpression = sql<number>`SUM(${orders.total}::DECIMAL)`;
          break;
        case 'users':
          metricExpression = sql<number>`COUNT(DISTINCT ${orders.userId})`;
          break;
        case 'orders':
        default:
          metricExpression = sql<number>`COUNT(*)`;
          break;
      }

      const geographicData = await db
        .select({
          division: sql<string>`${orders.shippingAddress}->>'division'`,
          district: sql<string>`${orders.shippingAddress}->>'district'`,
          value: metricExpression
        })
        .from(orders)
        .where(
          and(
            dateFilter,
            eq(orders.status, 'completed'),
            sql`${orders.shippingAddress}->>'division' IS NOT NULL`
          )
        )
        .groupBy(
          sql`${orders.shippingAddress}->>'division'`,
          sql`${orders.shippingAddress}->>'district'`
        )
        .orderBy(desc(metricExpression));

      // Group by division for summary
      const divisionSummary = await db
        .select({
          division: sql<string>`${orders.shippingAddress}->>'division'`,
          value: metricExpression
        })
        .from(orders)
        .where(
          and(
            dateFilter,
            eq(orders.status, 'completed'),
            sql`${orders.shippingAddress}->>'division' IS NOT NULL`
          )
        )
        .groupBy(sql`${orders.shippingAddress}->>'division'`)
        .orderBy(desc(metricExpression));

      return {
        byDistrict: geographicData,
        byDivision: divisionSummary,
        metric,
        timeframe
      };

    } catch (error) {
      console.error('Geographic distribution error:', error);
      throw error;
    }
  }

  /**
   * Get conversion funnel analytics
   */
  async getConversionFunnel(timeframe: string = '30d'): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);

      const [
        visitors,
        productViews,
        cartAdds,
        checkoutStarts,
        completedOrders
      ] = await Promise.all([
        // Unique visitors
        db.select({ count: sql<number>`COUNT(DISTINCT ${userSessions.userId})` })
          .from(userSessions)
          .where(dateFilter),

        // Product page views
        db.select({ count: sql<number>`COUNT(DISTINCT ${userBehaviors.userId})` })
          .from(userBehaviors)
          .where(
            and(
              dateFilter,
              eq(userBehaviors.behaviorType, 'product_interaction'),
              eq(userBehaviors.action, 'view')
            )
          ),

        // Cart additions
        db.select({ count: sql<number>`COUNT(DISTINCT ${userBehaviors.userId})` })
          .from(userBehaviors)
          .where(
            and(
              dateFilter,
              eq(userBehaviors.behaviorType, 'cart_interaction'),
              eq(userBehaviors.action, 'add')
            )
          ),

        // Checkout starts
        db.select({ count: sql<number>`COUNT(DISTINCT ${userBehaviors.userId})` })
          .from(userBehaviors)
          .where(
            and(
              dateFilter,
              eq(userBehaviors.behaviorType, 'checkout_interaction'),
              eq(userBehaviors.action, 'start')
            )
          ),

        // Completed orders
        db.select({ count: sql<number>`COUNT(DISTINCT ${orders.userId})` })
          .from(orders)
          .where(
            and(
              dateFilter,
              eq(orders.status, 'completed')
            )
          )
      ]);

      const visitorCount = visitors[0]?.count || 0;
      const productViewCount = productViews[0]?.count || 0;
      const cartAddCount = cartAdds[0]?.count || 0;
      const checkoutStartCount = checkoutStarts[0]?.count || 0;
      const completedOrderCount = completedOrders[0]?.count || 0;

      return {
        funnel: [
          {
            stage: 'Visitors',
            count: visitorCount,
            conversionRate: 100
          },
          {
            stage: 'Product Views',
            count: productViewCount,
            conversionRate: visitorCount > 0 ? (productViewCount / visitorCount) * 100 : 0
          },
          {
            stage: 'Cart Additions',
            count: cartAddCount,
            conversionRate: productViewCount > 0 ? (cartAddCount / productViewCount) * 100 : 0
          },
          {
            stage: 'Checkout Started',
            count: checkoutStartCount,
            conversionRate: cartAddCount > 0 ? (checkoutStartCount / cartAddCount) * 100 : 0
          },
          {
            stage: 'Orders Completed',
            count: completedOrderCount,
            conversionRate: checkoutStartCount > 0 ? (completedOrderCount / checkoutStartCount) * 100 : 0
          }
        ],
        overallConversionRate: visitorCount > 0 ? (completedOrderCount / visitorCount) * 100 : 0,
        timeframe
      };

    } catch (error) {
      console.error('Conversion funnel error:', error);
      throw error;
    }
  }

  /**
   * Get payment method analytics (Bangladesh-specific)
   */
  async getPaymentMethodAnalytics(timeframe: string = '30d'): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);

      const paymentMethodData = await db
        .select({
          paymentMethod: orders.paymentMethod,
          totalOrders: sql<number>`COUNT(*)`,
          totalRevenue: sql<number>`SUM(${orders.total}::DECIMAL)`,
          averageOrderValue: sql<number>`AVG(${orders.total}::DECIMAL)`,
          successRate: sql<number>`
            COUNT(CASE WHEN ${orders.status} = 'completed' THEN 1 END) * 100.0 / COUNT(*)
          `
        })
        .from(orders)
        .where(dateFilter)
        .groupBy(orders.paymentMethod)
        .orderBy(desc(sql`COUNT(*)`));

      return {
        paymentMethods: paymentMethodData,
        timeframe
      };

    } catch (error) {
      console.error('Payment method analytics error:', error);
      throw error;
    }
  }

  /**
   * Get vendor performance analytics
   */
  async getVendorPerformance(timeframe: string = '30d', sortBy: string = 'revenue', limit: number = 50): Promise<any> {
    try {
      const dateFilter = this.getDateFilter(timeframe);

      let orderByClause;
      switch (sortBy) {
        case 'orders':
          orderByClause = desc(sql`COUNT(DISTINCT ${orders.id})`);
          break;
        case 'rating':
          orderByClause = desc(sql`AVG(COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0))`);
          break;
        case 'revenue':
        default:
          orderByClause = desc(sql`SUM(${orderItems.totalPrice}::DECIMAL)`);
          break;
      }

      const vendorPerformance = await db
        .select({
          vendorId: vendors.id,
          businessName: vendors.businessName,
          totalRevenue: sql<number>`COALESCE(SUM(${orderItems.totalPrice}::DECIMAL), 0)`,
          totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
          totalProducts: sql<number>`COUNT(DISTINCT ${products.id})`,
          averageOrderValue: sql<number>`COALESCE(AVG(${orders.total}::DECIMAL), 0)`,
          averageRating: sql<number>`AVG(COALESCE(CAST(${products.tags}->>'rating' AS DECIMAL), 0))`,
          customerCount: sql<number>`COUNT(DISTINCT ${orders.userId})`
        })
        .from(vendors)
        .leftJoin(products, eq(vendors.id, products.vendorId))
        .leftJoin(orderItems, eq(products.id, orderItems.productId))
        .leftJoin(orders, and(
          eq(orderItems.orderId, orders.id),
          eq(orders.status, 'completed'),
          dateFilter
        ))
        .where(eq(vendors.isActive, true))
        .groupBy(vendors.id, vendors.businessName)
        .orderBy(orderByClause)
        .limit(limit);

      return {
        vendors: vendorPerformance,
        timeframe,
        sortBy,
        limit
      };

    } catch (error) {
      console.error('Vendor performance error:', error);
      throw error;
    }
  }

  /**
   * Get real-time metrics for dashboard
   */
  async getRealtimeMetrics(): Promise<any> {
    try {
      const last24h = sql`${orders.createdAt} > NOW() - INTERVAL '24 hours'`;
      const lastHour = sql`${orders.createdAt} > NOW() - INTERVAL '1 hour'`;

      const [
        ordersLast24h,
        ordersLastHour,
        revenueLast24h,
        revenueLastHour,
        activeUsers,
        onlineUsers
      ] = await Promise.all([
        db.select({ count: count() }).from(orders).where(last24h),
        db.select({ count: count() }).from(orders).where(lastHour),
        db.select({ revenue: sql<number>`COALESCE(SUM(${orders.total}::DECIMAL), 0)` })
          .from(orders).where(and(last24h, eq(orders.status, 'completed'))),
        db.select({ revenue: sql<number>`COALESCE(SUM(${orders.total}::DECIMAL), 0)` })
          .from(orders).where(and(lastHour, eq(orders.status, 'completed'))),
        db.select({ count: sql<number>`COUNT(DISTINCT ${userSessions.userId})` })
          .from(userSessions).where(last24h),
        db.select({ count: sql<number>`COUNT(DISTINCT ${userSessions.userId})` })
          .from(userSessions).where(sql`${userSessions.lastActivity} > NOW() - INTERVAL '5 minutes'`)
      ]);

      return {
        orders: {
          last24h: ordersLast24h[0]?.count || 0,
          lastHour: ordersLastHour[0]?.count || 0
        },
        revenue: {
          last24h: revenueLast24h[0]?.revenue || 0,
          lastHour: revenueLastHour[0]?.revenue || 0
        },
        users: {
          active24h: activeUsers[0]?.count || 0,
          onlineNow: onlineUsers[0]?.count || 0
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Realtime metrics error:', error);
      throw error;
    }
  }

  /**
   * Track custom analytics event
   */
  async trackEvent(userId: number, eventType: string, eventData: any, metadata?: any): Promise<void> {
    try {
      await db.insert(userBehaviors).values({
        userId,
        behaviorType: 'custom_event',
        action: eventType,
        targetType: 'system',
        targetId: 'analytics',
        metadata: {
          eventData,
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Track event error:', error);
      throw error;
    }
  }

  /**
   * Generate custom analytics report
   */
  async generateCustomReport(config: {
    metrics: string[],
    dimensions: string[],
    filters: any,
    timeframe: string,
    granularity: string
  }): Promise<any> {
    try {
      // This is a simplified implementation
      // In a production system, this would be more sophisticated
      const dateFilter = this.getDateFilter(config.timeframe);
      
      // Basic implementation for demonstration
      const reportData = await db
        .select({
          date: sql`DATE(${orders.createdAt})`,
          revenue: sql<number>`SUM(${orders.total}::DECIMAL)`,
          orders: sql<number>`COUNT(*)`
        })
        .from(orders)
        .where(and(dateFilter, eq(orders.status, 'completed')))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      return {
        config,
        data: reportData,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Custom report error:', error);
      throw error;
    }
  }

  // Private helper methods

  private getDateFilter(timeframe: string) {
    switch (timeframe) {
      case '7d':
        return gte(orders.createdAt, sql`NOW() - INTERVAL '7 days'`);
      case '30d':
        return gte(orders.createdAt, sql`NOW() - INTERVAL '30 days'`);
      case '90d':
        return gte(orders.createdAt, sql`NOW() - INTERVAL '90 days'`);
      case '1y':
        return gte(orders.createdAt, sql`NOW() - INTERVAL '1 year'`);
      default:
        return gte(orders.createdAt, sql`NOW() - INTERVAL '30 days'`);
    }
  }

  private async getTotalRevenue(dateFilter: any): Promise<number> {
    const result = await db
      .select({ revenue: sql<number>`COALESCE(SUM(${orders.total}::DECIMAL), 0)` })
      .from(orders)
      .where(and(dateFilter, eq(orders.status, 'completed')));
    return result[0]?.revenue || 0;
  }

  private async getTotalOrders(dateFilter: any): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(orders)
      .where(and(dateFilter, eq(orders.status, 'completed')));
    return result[0]?.count || 0;
  }

  private async getTotalUsers(dateFilter: any): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${orders.userId})` })
      .from(orders)
      .where(dateFilter);
    return result[0]?.count || 0;
  }

  private async getTotalProducts(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.isActive, true));
    return result[0]?.count || 0;
  }

  private async getAverageOrderValue(dateFilter: any): Promise<number> {
    const result = await db
      .select({ avg: sql<number>`COALESCE(AVG(${orders.total}::DECIMAL), 0)` })
      .from(orders)
      .where(and(dateFilter, eq(orders.status, 'completed')));
    return result[0]?.avg || 0;
  }

  private async getConversionRate(dateFilter: any): Promise<number> {
    const [visitors, orders] = await Promise.all([
      db.select({ count: sql<number>`COUNT(DISTINCT ${userSessions.userId})` })
        .from(userSessions)
        .where(dateFilter),
      db.select({ count: sql<number>`COUNT(DISTINCT ${orders.userId})` })
        .from(orders)
        .where(and(dateFilter, eq(orders.status, 'completed')))
    ]);

    const visitorCount = visitors[0]?.count || 0;
    const orderCount = orders[0]?.count || 0;

    return visitorCount > 0 ? (orderCount / visitorCount) * 100 : 0;
  }

  private async getTopSellingProducts(dateFilter: any, limit: number = 10, vendorId?: string): Promise<any[]> {
    const vendorFilter = vendorId ? eq(products.vendorId, vendorId) : undefined;

    return await db
      .select({
        productId: products.id,
        productName: products.name,
        totalSold: sql<number>`SUM(${orderItems.quantity})`,
        totalRevenue: sql<number>`SUM(${orderItems.totalPrice}::DECIMAL)`
      })
      .from(products)
      .innerJoin(orderItems, eq(products.id, orderItems.productId))
      .innerJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        eq(orders.status, 'completed'),
        dateFilter
      ))
      .where(
        and(
          vendorFilter,
          eq(products.isActive, true)
        )
      )
      .groupBy(products.id, products.name)
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(limit);
  }

  private async getRecentActivity(limit: number = 5): Promise<any[]> {
    return await db
      .select({
        activityType: userBehaviors.behaviorType,
        action: userBehaviors.action,
        userId: userBehaviors.userId,
        targetType: userBehaviors.targetType,
        targetId: userBehaviors.targetId,
        createdAt: userBehaviors.createdAt
      })
      .from(userBehaviors)
      .orderBy(desc(userBehaviors.createdAt))
      .limit(limit);
  }

  private async getGrowthMetrics(timeframe: string): Promise<any> {
    const currentPeriodFilter = this.getDateFilter(timeframe);
    const previousPeriodFilter = this.getPreviousPeriodFilter(timeframe);

    const [currentRevenue, previousRevenue, currentOrders, previousOrders] = await Promise.all([
      this.getTotalRevenue(currentPeriodFilter),
      this.getTotalRevenue(previousPeriodFilter),
      this.getTotalOrders(currentPeriodFilter),
      this.getTotalOrders(previousPeriodFilter)
    ]);

    return {
      revenueGrowth: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      orderGrowth: previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0
    };
  }

  private getPreviousPeriodFilter(timeframe: string) {
    switch (timeframe) {
      case '7d':
        return and(
          gte(orders.createdAt, sql`NOW() - INTERVAL '14 days'`),
          lte(orders.createdAt, sql`NOW() - INTERVAL '7 days'`)
        );
      case '30d':
        return and(
          gte(orders.createdAt, sql`NOW() - INTERVAL '60 days'`),
          lte(orders.createdAt, sql`NOW() - INTERVAL '30 days'`)
        );
      case '90d':
        return and(
          gte(orders.createdAt, sql`NOW() - INTERVAL '180 days'`),
          lte(orders.createdAt, sql`NOW() - INTERVAL '90 days'`)
        );
      case '1y':
        return and(
          gte(orders.createdAt, sql`NOW() - INTERVAL '2 years'`),
          lte(orders.createdAt, sql`NOW() - INTERVAL '1 year'`)
        );
      default:
        return and(
          gte(orders.createdAt, sql`NOW() - INTERVAL '60 days'`),
          lte(orders.createdAt, sql`NOW() - INTERVAL '30 days'`)
        );
    }
  }
}