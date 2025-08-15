import { db } from '../../../../db';
import { 
  salesAnalytics,
  orders,
  orderItems,
  products,
  vendors,
  users,
  type SalesAnalytic,
  type InsertSalesAnalytic
} from '../../../../../shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, count, sum, avg } from 'drizzle-orm';

/**
 * Sales Analytics Model - Amazon.com/Shopee.sg Level
 * Handles all sales-related data operations and calculations
 * Provides comprehensive sales metrics, trends, and forecasting capabilities
 */
export class SalesAnalyticsModel {
  
  /**
   * Get comprehensive sales metrics for a given time period
   */
  async getSalesMetrics(params: {
    startDate: Date;
    endDate: Date;
    vendorId?: string;
    categoryId?: string;
  }) {
    const { startDate, endDate, vendorId, categoryId } = params;

    const baseQuery = db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        totalItems: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
        uniqueCustomers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
        date: sql<string>`DATE(${orders.createdAt})`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          gte(orders.createdAt, startDate.toISOString()),
          lte(orders.createdAt, endDate.toISOString()),
          eq(orders.status, 'completed'),
          vendorId ? eq(products.vendorId, vendorId) : undefined,
          categoryId ? eq(products.categoryId, categoryId) : undefined
        )
      )
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(desc(sql`DATE(${orders.createdAt})`));

    return await baseQuery;
  }

  /**
   * Get sales trends with period-over-period comparison
   */
  async getSalesTrends(params: {
    startDate: Date;
    endDate: Date;
    granularity: 'daily' | 'weekly' | 'monthly';
    compareWithPrevious: boolean;
  }) {
    const { startDate, endDate, granularity, compareWithPrevious } = params;
    
    let groupByClause: any;
    let dateFormat: string;

    switch (granularity) {
      case 'weekly':
        groupByClause = sql`DATE_TRUNC('week', ${orders.createdAt})`;
        dateFormat = 'week';
        break;
      case 'monthly':
        groupByClause = sql`DATE_TRUNC('month', ${orders.createdAt})`;
        dateFormat = 'month';
        break;
      default:
        groupByClause = sql`DATE(${orders.createdAt})`;
        dateFormat = 'day';
    }

    const currentPeriodQuery = db
      .select({
        period: groupByClause,
        revenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        orders: sql<number>`COUNT(${orders.id})`,
        customers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate.toISOString()),
          lte(orders.createdAt, endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(groupByClause)
      .orderBy(groupByClause);

    const currentData = await currentPeriodQuery;

    if (!compareWithPrevious) {
      return { current: currentData, previous: null, growth: null };
    }

    // Calculate previous period dates
    const periodDiff = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDiff);
    const previousEndDate = new Date(endDate.getTime() - periodDiff);

    const previousPeriodQuery = db
      .select({
        period: groupByClause,
        revenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        orders: sql<number>`COUNT(${orders.id})`,
        customers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, previousStartDate.toISOString()),
          lte(orders.createdAt, previousEndDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(groupByClause)
      .orderBy(groupByClause);

    const previousData = await previousPeriodQuery;

    // Calculate growth rates
    const currentTotal = currentData.reduce((sum, item) => sum + item.revenue, 0);
    const previousTotal = previousData.reduce((sum, item) => sum + item.revenue, 0);
    const growthRate = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      current: currentData,
      previous: previousData,
      growth: {
        revenueGrowthRate: growthRate,
        orderGrowthRate: this.calculateGrowthRate(
          currentData.reduce((sum, item) => sum + item.orders, 0),
          previousData.reduce((sum, item) => sum + item.orders, 0)
        ),
      }
    };
  }

  /**
   * Get top performing products by sales
   */
  async getTopPerformingProducts(params: {
    startDate: Date;
    endDate: Date;
    limit: number;
    sortBy: 'revenue' | 'quantity' | 'orders';
  }) {
    const { startDate, endDate, limit, sortBy } = params;

    let orderByClause: any;
    switch (sortBy) {
      case 'quantity':
        orderByClause = desc(sql`total_quantity`);
        break;
      case 'orders':
        orderByClause = desc(sql`total_orders`);
        break;
      default:
        orderByClause = desc(sql`total_revenue`);
    }

    return await db
      .select({
        productId: products.id,
        productName: products.name,
        vendorId: products.vendorId,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS DECIMAL)), 0) as total_revenue`,
        totalQuantity: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0) as total_quantity`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id}) as total_orders`,
        averagePrice: sql<number>`COALESCE(AVG(CAST(${orderItems.unitPrice} AS DECIMAL)), 0)`,
      })
      .from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          gte(orders.createdAt, startDate.toISOString()),
          lte(orders.createdAt, endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(products.id, products.name, products.vendorId)
      .orderBy(orderByClause)
      .limit(limit);
  }

  /**
   * Get sales by geographic region (Bangladesh-specific)
   */
  async getSalesByRegion(params: {
    startDate: Date;
    endDate: Date;
    level: 'division' | 'district' | 'upazila';
  }) {
    const { startDate, endDate, level } = params;

    return await db
      .select({
        region: sql<string>`${orders.shippingDivision}`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        totalOrders: sql<number>`COUNT(${orders.id})`,
        uniqueCustomers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate.toISOString()),
          lte(orders.createdAt, endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(orders.shippingDivision)
      .orderBy(desc(sql`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`));
  }

  /**
   * Get conversion funnel metrics
   */
  async getConversionFunnel(params: {
    startDate: Date;
    endDate: Date;
  }) {
    const { startDate, endDate } = params;

    // This would typically involve user behavior tracking
    // For now, we'll use order status transitions as a proxy
    const funnelData = await db
      .select({
        stage: orders.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate.toISOString()),
          lte(orders.createdAt, endDate.toISOString())
        )
      )
      .groupBy(orders.status);

    return funnelData;
  }

  /**
   * Get payment method performance
   */
  async getPaymentMethodPerformance(params: {
    startDate: Date;
    endDate: Date;
  }) {
    const { startDate, endDate } = params;

    return await db
      .select({
        paymentMethod: orders.paymentMethod,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        totalOrders: sql<number>`COUNT(${orders.id})`,
        successRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${orders.status} = 'completed' THEN 1 END)::float / COUNT(*)::float) * 100, 
            2
          )
        `,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate.toISOString()),
          lte(orders.createdAt, endDate.toISOString())
        )
      )
      .groupBy(orders.paymentMethod)
      .orderBy(desc(sql`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`));
  }

  /**
   * Get festival impact analysis (Bangladesh-specific)
   */
  async getFestivalImpact(params: {
    festivalName: string;
    year: number;
    daysBeforeAfter: number;
  }) {
    const { festivalName, year, daysBeforeAfter } = params;

    // This would integrate with a festival calendar
    // For demonstration, we'll use a simplified approach
    const festivalDates = this.getFestivalDates(festivalName, year);
    
    if (!festivalDates) {
      return null;
    }

    const startDate = new Date(festivalDates.start.getTime() - (daysBeforeAfter * 24 * 60 * 60 * 1000));
    const endDate = new Date(festivalDates.end.getTime() + (daysBeforeAfter * 24 * 60 * 60 * 1000));

    return await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        revenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        orders: sql<number>`COUNT(${orders.id})`,
        customers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
        isFestivalPeriod: sql<boolean>`
          DATE(${orders.createdAt}) BETWEEN '${festivalDates.start.toISOString().split('T')[0]}' 
          AND '${festivalDates.end.toISOString().split('T')[0]}'
        `,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDate.toISOString()),
          lte(orders.createdAt, endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(asc(sql`DATE(${orders.createdAt})`));
  }

  /**
   * Store sales analytics data
   */
  async storeSalesAnalytics(data: InsertSalesAnalytic) {
    return await db.insert(salesAnalytics).values(data).returning();
  }

  /**
   * Get sales analytics by ID
   */
  async getSalesAnalyticsById(id: string) {
    const [result] = await db
      .select()
      .from(salesAnalytics)
      .where(eq(salesAnalytics.id, id));
    
    return result;
  }

  /**
   * Update sales analytics
   */
  async updateSalesAnalytics(id: string, data: Partial<InsertSalesAnalytic>) {
    const [result] = await db
      .update(salesAnalytics)
      .set(data)
      .where(eq(salesAnalytics.id, id))
      .returning();
    
    return result;
  }

  /**
   * Delete sales analytics
   */
  async deleteSalesAnalytics(id: string) {
    await db.delete(salesAnalytics).where(eq(salesAnalytics.id, id));
  }

  // Helper methods
  private calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private getFestivalDates(festivalName: string, year: number) {
    // Bangladesh festival calendar - simplified version
    const festivals: Record<string, { month: number; day: number; duration: number }> = {
      'eid_ul_fitr': { month: 4, day: 21, duration: 3 }, // Approximate - varies by lunar calendar
      'eid_ul_adha': { month: 7, day: 9, duration: 3 }, // Approximate - varies by lunar calendar
      'pohela_boishakh': { month: 4, day: 14, duration: 1 },
      'victory_day': { month: 12, day: 16, duration: 1 },
      'independence_day': { month: 3, day: 26, duration: 1 },
      'durga_puja': { month: 10, day: 15, duration: 5 }, // Approximate - varies
    };

    const festival = festivals[festivalName.toLowerCase()];
    if (!festival) return null;

    const start = new Date(year, festival.month - 1, festival.day);
    const end = new Date(start.getTime() + (festival.duration - 1) * 24 * 60 * 60 * 1000);

    return { start, end };
  }
}