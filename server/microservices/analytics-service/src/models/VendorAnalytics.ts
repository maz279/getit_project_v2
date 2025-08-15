import { db } from '../../../../db';
import { 
  vendorAnalytics,
  vendors,
  orders,
  orderItems,
  products,
  users,
  reviews,
  type VendorAnalytic,
  type InsertVendorAnalytic
} from '../../../../../shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, count, sum, avg } from 'drizzle-orm';

/**
 * Vendor Analytics Model - Amazon.com/Shopee.sg Level
 * Handles all vendor-related data operations and performance calculations
 * Provides comprehensive vendor metrics, rankings, and business intelligence
 */
export class VendorAnalyticsModel {
  
  /**
   * Get comprehensive vendor performance metrics
   */
  async getVendorPerformanceMetrics(params: {
    vendorId?: string;
    startDate: Date;
    endDate: Date;
    includeComparison: boolean;
  }) {
    const { vendorId, startDate, endDate, includeComparison } = params;

    const performanceQuery = db
      .select({
        vendorId: vendors.id,
        vendorName: vendors.businessName,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        totalProducts: sql<number>`COUNT(DISTINCT ${products.id})`,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
        totalCustomers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
        conversionRate: sql<number>`
          ROUND(
            (COUNT(DISTINCT CASE WHEN ${orders.status} = 'completed' THEN ${orders.id} END)::float / 
             COUNT(DISTINCT ${orders.id})::float) * 100, 
            2
          )
        `,
        averageRating: sql<number>`COALESCE(AVG(CAST(${reviews.rating} AS DECIMAL)), 0)`,
        totalReviews: sql<number>`COUNT(DISTINCT ${reviews.id})`,
      })
      .from(vendors)
      .leftJoin(products, eq(vendors.id, products.vendorId))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        gte(orders.createdAt, startDate.toISOString()),
        lte(orders.createdAt, endDate.toISOString())
      ))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .where(vendorId ? eq(vendors.id, vendorId) : undefined)
      .groupBy(vendors.id, vendors.businessName);

    const currentMetrics = await performanceQuery;

    if (!includeComparison || !vendorId) {
      return { current: currentMetrics, previous: null, growth: null };
    }

    // Get previous period metrics for comparison
    const periodDiff = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDiff);
    const previousEndDate = new Date(endDate.getTime() - periodDiff);

    const previousMetricsQuery = db
      .select({
        vendorId: vendors.id,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        totalCustomers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
      })
      .from(vendors)
      .leftJoin(products, eq(vendors.id, products.vendorId))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        gte(orders.createdAt, previousStartDate.toISOString()),
        lte(orders.createdAt, previousEndDate.toISOString())
      ))
      .where(eq(vendors.id, vendorId))
      .groupBy(vendors.id);

    const [previousMetrics] = await previousMetricsQuery;
    const [currentVendor] = currentMetrics;

    // Calculate growth rates
    const growth = previousMetrics ? {
      revenueGrowth: this.calculateGrowthRate(currentVendor.totalRevenue, previousMetrics.totalRevenue),
      orderGrowth: this.calculateGrowthRate(currentVendor.totalOrders, previousMetrics.totalOrders),
      customerGrowth: this.calculateGrowthRate(currentVendor.totalCustomers, previousMetrics.totalCustomers),
    } : null;

    return { current: currentMetrics, previous: previousMetrics, growth };
  }

  /**
   * Get vendor rankings with scoring algorithm
   */
  async getVendorRankings(params: {
    limit: number;
    sortBy: 'revenue' | 'orders' | 'rating' | 'growth' | 'overall_score';
    category?: string;
    timeRange: { startDate: Date; endDate: Date };
  }) {
    const { limit, sortBy, category, timeRange } = params;

    const rankingQuery = db
      .select({
        vendorId: vendors.id,
        vendorName: vendors.businessName,
        businessType: vendors.businessType,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        averageRating: sql<number>`COALESCE(AVG(CAST(${reviews.rating} AS DECIMAL)), 0)`,
        totalReviews: sql<number>`COUNT(DISTINCT ${reviews.id})`,
        responseTime: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${orders.updatedAt} - ${orders.createdAt}))/3600), 0)`,
        fulfillmentRate: sql<number>`
          ROUND(
            (COUNT(DISTINCT CASE WHEN ${orders.status} = 'delivered' THEN ${orders.id} END)::float / 
             COUNT(DISTINCT ${orders.id})::float) * 100, 
            2
          )
        `,
        // Overall score calculation (weighted)
        overallScore: sql<number>`
          ROUND(
            (
              (COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0) / 10000) * 0.3 +
              (COALESCE(AVG(CAST(${reviews.rating} AS DECIMAL)), 0)) * 0.25 +
              (COUNT(DISTINCT CASE WHEN ${orders.status} = 'delivered' THEN ${orders.id} END)::float / 
               GREATEST(COUNT(DISTINCT ${orders.id})::float, 1)) * 100 * 0.25 +
              (100 - LEAST(COALESCE(AVG(EXTRACT(EPOCH FROM (${orders.updatedAt} - ${orders.createdAt}))/3600), 0), 100)) * 0.2
            ), 2
          )
        `
      })
      .from(vendors)
      .leftJoin(products, eq(vendors.id, products.vendorId))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(
        eq(orderItems.orderId, orders.id),
        gte(orders.createdAt, timeRange.startDate.toISOString()),
        lte(orders.createdAt, timeRange.endDate.toISOString())
      ))
      .leftJoin(reviews, eq(products.id, reviews.productId))
      .where(
        and(
          eq(vendors.isActive, true),
          category ? eq(products.categoryId, category) : undefined
        )
      )
      .groupBy(vendors.id, vendors.businessName, vendors.businessType)
      .orderBy(this.getSortOrder(sortBy))
      .limit(limit);

    return await rankingQuery;
  }

  /**
   * Get vendor profitability analysis
   */
  async getVendorProfitability(params: {
    vendorId: string;
    timeRange: { startDate: Date; endDate: Date };
    includeProjections: boolean;
  }) {
    const { vendorId, timeRange, includeProjections } = params;

    const profitabilityQuery = db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        grossRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        netRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL) * 0.85), 0)`, // Assuming 15% platform fee
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
        commissionPaid: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL) * 0.15), 0)`, // 15% commission
        profitMargin: sql<number>`
          ROUND(
            (COALESCE(SUM(CAST(${orders.total} AS DECIMAL) * 0.85), 0) / 
             GREATEST(COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0), 1)) * 100, 
            2
          )
        `
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          eq(products.vendorId, vendorId),
          gte(orders.createdAt, timeRange.startDate.toISOString()),
          lte(orders.createdAt, timeRange.endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(asc(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`));

    const profitabilityData = await profitabilityQuery;

    if (!includeProjections) {
      return { historical: profitabilityData, projections: null };
    }

    // Simple linear projection for next 3 months
    const projections = this.generateProfitabilityProjections(profitabilityData);

    return { historical: profitabilityData, projections };
  }

  /**
   * Get vendor customer satisfaction metrics
   */
  async getVendorCustomerSatisfaction(params: {
    vendorId: string;
    timeRange: { startDate: Date; endDate: Date };
    includeReviewAnalysis: boolean;
  }) {
    const { vendorId, timeRange, includeReviewAnalysis } = params;

    const satisfactionQuery = db
      .select({
        averageRating: sql<number>`COALESCE(AVG(CAST(${reviews.rating} AS DECIMAL)), 0)`,
        totalReviews: sql<number>`COUNT(${reviews.id})`,
        fiveStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 5 THEN 1 END)`,
        fourStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 4 THEN 1 END)`,
        threeStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 3 THEN 1 END)`,
        twoStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 2 THEN 1 END)`,
        oneStarCount: sql<number>`COUNT(CASE WHEN ${reviews.rating} = 1 THEN 1 END)`,
        responseRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${reviews.vendorResponse} IS NOT NULL THEN 1 END)::float / 
             COUNT(*)::float) * 100, 
            2
          )
        `,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(
        and(
          eq(products.vendorId, vendorId),
          gte(reviews.createdAt, timeRange.startDate.toISOString()),
          lte(reviews.createdAt, timeRange.endDate.toISOString())
        )
      );

    const [satisfactionData] = await satisfactionQuery;

    if (!includeReviewAnalysis) {
      return { satisfaction: satisfactionData, reviewAnalysis: null };
    }

    // Get detailed review analysis
    const reviewAnalysisQuery = db
      .select({
        month: sql<string>`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`,
        averageRating: sql<number>`COALESCE(AVG(CAST(${reviews.rating} AS DECIMAL)), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})`,
        averageResponseTime: sql<number>`
          COALESCE(
            AVG(
              CASE 
                WHEN ${reviews.vendorResponseDate} IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (${reviews.vendorResponseDate} - ${reviews.createdAt}))/3600 
              END
            ), 
            0
          )
        `,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(
        and(
          eq(products.vendorId, vendorId),
          gte(reviews.createdAt, timeRange.startDate.toISOString()),
          lte(reviews.createdAt, timeRange.endDate.toISOString())
        )
      )
      .groupBy(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`)
      .orderBy(asc(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`));

    const reviewAnalysis = await reviewAnalysisQuery;

    return { satisfaction: satisfactionData, reviewAnalysis };
  }

  /**
   * Get vendor operational efficiency metrics
   */
  async getVendorOperationalEfficiency(params: {
    vendorId: string;
    timeRange: { startDate: Date; endDate: Date };
  }) {
    const { vendorId, timeRange } = params;

    return await db
      .select({
        averageProcessingTime: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (${orders.shippedAt} - ${orders.createdAt}))/3600
            ), 
            0
          )
        `,
        averageDeliveryTime: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (${orders.deliveredAt} - ${orders.shippedAt}))/24
            ), 
            0
          )
        `,
        onTimeDeliveryRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${orders.deliveredAt} <= ${orders.expectedDeliveryDate} THEN 1 END)::float / 
             COUNT(CASE WHEN ${orders.deliveredAt} IS NOT NULL THEN 1 END)::float) * 100, 
            2
          )
        `,
        cancellationRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${orders.status} = 'cancelled' THEN 1 END)::float / 
             COUNT(*)::float) * 100, 
            2
          )
        `,
        returnRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${orders.status} = 'returned' THEN 1 END)::float / 
             COUNT(CASE WHEN ${orders.status} = 'delivered' THEN 1 END)::float) * 100, 
            2
          )
        `,
        stockoutRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${products.inventory} = 0 THEN 1 END)::float / 
             COUNT(${products.id})::float) * 100, 
            2
          )
        `,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          eq(products.vendorId, vendorId),
          gte(orders.createdAt, timeRange.startDate.toISOString()),
          lte(orders.createdAt, timeRange.endDate.toISOString())
        )
      );
  }

  /**
   * Get vendor growth analysis with projections
   */
  async getVendorGrowthAnalysis(params: {
    vendorId: string;
    analysisType: 'comprehensive' | 'revenue' | 'customer' | 'product';
    timeRange: { startDate: Date; endDate: Date };
  }) {
    const { vendorId, analysisType, timeRange } = params;

    const growthQuery = db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        orders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        customers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
        newCustomers: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN ${orders.createdAt} = (
              SELECT MIN(o2.createdAt) 
              FROM ${orders} o2 
              INNER JOIN ${orderItems} oi2 ON o2.id = oi2.orderId
              INNER JOIN ${products} p2 ON oi2.productId = p2.id
              WHERE p2.vendorId = ${products.vendorId} 
              AND o2.userId = ${orders.userId}
            ) THEN ${orders.userId} 
          END
        )`,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          eq(products.vendorId, vendorId),
          gte(orders.createdAt, timeRange.startDate.toISOString()),
          lte(orders.createdAt, timeRange.endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(asc(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`));

    const growthData = await growthQuery;

    // Calculate month-over-month growth rates
    const growthAnalysis = this.calculateGrowthRates(growthData);

    return { monthly: growthData, analysis: growthAnalysis };
  }

  /**
   * Store vendor analytics data
   */
  async storeVendorAnalytics(data: InsertVendorAnalytic) {
    return await db.insert(vendorAnalytics).values(data).returning();
  }

  /**
   * Get vendor analytics by ID
   */
  async getVendorAnalyticsById(id: string) {
    const [result] = await db
      .select()
      .from(vendorAnalytics)
      .where(eq(vendorAnalytics.id, id));
    
    return result;
  }

  // Helper methods
  private calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private getSortOrder(sortBy: string) {
    switch (sortBy) {
      case 'revenue':
        return desc(sql`COALESCE(SUM(CAST(orders.total AS DECIMAL)), 0)`);
      case 'orders':
        return desc(sql`COUNT(DISTINCT orders.id)`);
      case 'rating':
        return desc(sql`COALESCE(AVG(CAST(reviews.rating AS DECIMAL)), 0)`);
      case 'overall_score':
        return desc(sql`overallScore`);
      default:
        return desc(sql`overallScore`);
    }
  }

  private generateProfitabilityProjections(historicalData: any[]) {
    if (historicalData.length < 3) return [];

    const recentMonths = historicalData.slice(-3);
    const avgRevenue = recentMonths.reduce((sum, month) => sum + month.grossRevenue, 0) / 3;
    const avgGrowthRate = this.calculateAverageGrowthRate(recentMonths);

    const projections = [];
    for (let i = 1; i <= 3; i++) {
      const projectedRevenue = avgRevenue * Math.pow(1 + avgGrowthRate / 100, i);
      projections.push({
        month: this.getNextMonth(historicalData[historicalData.length - 1].month, i),
        grossRevenue: Math.round(projectedRevenue),
        netRevenue: Math.round(projectedRevenue * 0.85),
        type: 'projection'
      });
    }

    return projections;
  }

  private calculateAverageGrowthRate(data: any[]): number {
    if (data.length < 2) return 0;

    let totalGrowthRate = 0;
    for (let i = 1; i < data.length; i++) {
      const growthRate = this.calculateGrowthRate(data[i].grossRevenue, data[i - 1].grossRevenue);
      totalGrowthRate += growthRate;
    }

    return totalGrowthRate / (data.length - 1);
  }

  private calculateGrowthRates(data: any[]) {
    return data.map((current, index) => {
      if (index === 0) return { ...current, growthRate: 0 };
      
      const previous = data[index - 1];
      const growthRate = this.calculateGrowthRate(current.revenue, previous.revenue);
      
      return { ...current, growthRate };
    });
  }

  private getNextMonth(currentMonth: string, increment: number): string {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + increment, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}