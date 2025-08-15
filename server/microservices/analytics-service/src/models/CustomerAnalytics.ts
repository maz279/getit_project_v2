import { db } from '../../../../db';
import { 
  customerAnalytics,
  users,
  orders,
  orderItems,
  products,
  userBehaviors,
  userSessions,
  reviews,
  type CustomerAnalytic,
  type InsertCustomerAnalytic
} from '../../../../../shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, count, sum, avg } from 'drizzle-orm';

/**
 * Customer Analytics Model - Amazon.com/Shopee.sg Level
 * Handles all customer-related data operations and behavior analysis
 * Provides comprehensive customer metrics, segmentation, and lifecycle management
 */
export class CustomerAnalyticsModel {
  
  /**
   * Get comprehensive customer overview metrics
   */
  async getCustomerOverviewMetrics(params: {
    startDate: Date;
    endDate: Date;
    segmentType?: string;
  }) {
    const { startDate, endDate, segmentType } = params;

    const overviewQuery = db
      .select({
        totalCustomers: sql<number>`COUNT(DISTINCT ${users.id})`,
        newCustomers: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN ${users.createdAt} >= '${startDate.toISOString()}' 
            AND ${users.createdAt} <= '${endDate.toISOString()}' 
            THEN ${users.id} 
          END)
        `,
        activeCustomers: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN ${orders.createdAt} >= '${startDate.toISOString()}' 
            AND ${orders.createdAt} <= '${endDate.toISOString()}' 
            THEN ${orders.userId} 
          END)
        `,
        returningCustomers: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN customer_orders.order_count > 1 
            THEN customer_orders.user_id 
          END)
        `,
        averageLifetimeValue: sql<number>`
          COALESCE(AVG(customer_revenue.total_revenue), 0)
        `,
        averageOrderValue: sql<number>`
          COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)
        `,
        customerRetentionRate: sql<number>`
          ROUND(
            (COUNT(DISTINCT CASE WHEN customer_orders.order_count > 1 THEN customer_orders.user_id END)::float / 
             COUNT(DISTINCT customer_orders.user_id)::float) * 100, 
            2
          )
        `,
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.userId))
      .leftJoin(
        sql`(
          SELECT 
            user_id, 
            COUNT(*) as order_count 
          FROM ${orders} 
          WHERE created_at <= '${endDate.toISOString()}'
          GROUP BY user_id
        ) as customer_orders`,
        sql`customer_orders.user_id = ${users.id}`
      )
      .leftJoin(
        sql`(
          SELECT 
            user_id, 
            SUM(CAST(total AS DECIMAL)) as total_revenue 
          FROM ${orders} 
          WHERE status = 'completed'
          GROUP BY user_id
        ) as customer_revenue`,
        sql`customer_revenue.user_id = ${users.id}`
      )
      .where(
        segmentType ? like(users.tags, `%${segmentType}%`) : undefined
      );

    const [result] = await overviewQuery;
    return result;
  }

  /**
   * Get advanced customer segmentation using RFM analysis
   */
  async getCustomerSegmentation(params: {
    method: 'rfm' | 'behavioral' | 'demographic' | 'lifecycle';
    timeRange: { startDate: Date; endDate: Date };
    minSegmentSize: number;
  }) {
    const { method, timeRange, minSegmentSize } = params;

    switch (method) {
      case 'rfm':
        return await this.getRFMSegmentation(timeRange, minSegmentSize);
      case 'behavioral':
        return await this.getBehavioralSegmentation(timeRange, minSegmentSize);
      case 'demographic':
        return await this.getDemographicSegmentation(timeRange, minSegmentSize);
      case 'lifecycle':
        return await this.getLifecycleSegmentation(timeRange, minSegmentSize);
      default:
        return await this.getRFMSegmentation(timeRange, minSegmentSize);
    }
  }

  /**
   * RFM (Recency, Frequency, Monetary) Segmentation
   */
  private async getRFMSegmentation(timeRange: { startDate: Date; endDate: Date }, minSegmentSize: number) {
    const rfmQuery = db
      .select({
        userId: orders.userId,
        recency: sql<number>`
          EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400
        `,
        frequency: sql<number>`COUNT(${orders.id})`,
        monetary: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        // Calculate RFM scores (1-5 scale)
        recencyScore: sql<number>`
          CASE 
            WHEN EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400 <= 30 THEN 5
            WHEN EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400 <= 60 THEN 4
            WHEN EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400 <= 90 THEN 3
            WHEN EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400 <= 180 THEN 2
            ELSE 1
          END
        `,
        frequencyScore: sql<number>`
          CASE 
            WHEN COUNT(${orders.id}) >= 10 THEN 5
            WHEN COUNT(${orders.id}) >= 5 THEN 4
            WHEN COUNT(${orders.id}) >= 3 THEN 3
            WHEN COUNT(${orders.id}) >= 2 THEN 2
            ELSE 1
          END
        `,
        monetaryScore: sql<number>`
          CASE 
            WHEN COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0) >= 50000 THEN 5
            WHEN COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0) >= 20000 THEN 4
            WHEN COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0) >= 10000 THEN 3
            WHEN COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0) >= 5000 THEN 2
            ELSE 1
          END
        `,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, timeRange.startDate.toISOString()),
          lte(orders.createdAt, timeRange.endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(orders.userId)
      .having(sql`COUNT(${orders.id}) >= ${minSegmentSize}`);

    const rfmData = await rfmQuery;

    // Classify customers into segments based on RFM scores
    const segments = rfmData.map(customer => ({
      ...customer,
      segment: this.classifyRFMSegment(customer.recencyScore, customer.frequencyScore, customer.monetaryScore)
    }));

    // Group by segment
    const segmentGroups = this.groupBySegment(segments);

    return segmentGroups;
  }

  /**
   * Behavioral Segmentation based on user actions
   */
  private async getBehavioralSegmentation(timeRange: { startDate: Date; endDate: Date }, minSegmentSize: number) {
    const behavioralQuery = db
      .select({
        userId: userBehaviors.userId,
        totalSessions: sql<number>`COUNT(DISTINCT ${userSessions.id})`,
        avgSessionDuration: sql<number>`COALESCE(AVG(${userSessions.duration}), 0)`,
        totalPageViews: sql<number>`COALESCE(SUM(${userBehaviors.pageViews}), 0)`,
        cartAbandonmentRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${userBehaviors.event} = 'cart_abandoned' THEN 1 END)::float / 
             COUNT(CASE WHEN ${userBehaviors.event} = 'add_to_cart' THEN 1 END)::float) * 100, 
            2
          )
        `,
        preferredDevice: sql<string>`
          MODE() WITHIN GROUP (ORDER BY ${userSessions.deviceType})
        `,
        mostActiveHour: sql<number>`
          MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM ${userBehaviors.timestamp}))
        `,
      })
      .from(userBehaviors)
      .leftJoin(userSessions, eq(userBehaviors.sessionId, userSessions.id))
      .where(
        and(
          gte(userBehaviors.timestamp, timeRange.startDate.toISOString()),
          lte(userBehaviors.timestamp, timeRange.endDate.toISOString())
        )
      )
      .groupBy(userBehaviors.userId)
      .having(sql`COUNT(DISTINCT ${userSessions.id}) >= ${minSegmentSize}`);

    const behavioralData = await behavioralQuery;

    // Classify customers based on behavior patterns
    const segments = behavioralData.map(customer => ({
      ...customer,
      segment: this.classifyBehavioralSegment(customer)
    }));

    return this.groupBySegment(segments);
  }

  /**
   * Get customer lifetime value analysis
   */
  async getCustomerLifetimeValue(params: {
    customerId?: string;
    calculationMethod: 'historical' | 'predictive' | 'cohort';
    timeRange: { startDate: Date; endDate: Date };
  }) {
    const { customerId, calculationMethod, timeRange } = params;

    const baseQuery = db
      .select({
        userId: orders.userId,
        customerEmail: users.email,
        firstOrderDate: sql<string>`MIN(${orders.createdAt})`,
        lastOrderDate: sql<string>`MAX(${orders.createdAt})`,
        totalOrders: sql<number>`COUNT(${orders.id})`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
        orderFrequency: sql<number>`
          CASE 
            WHEN MIN(${orders.createdAt}) = MAX(${orders.createdAt}) THEN 0
            ELSE COUNT(${orders.id})::float / 
                 GREATEST(EXTRACT(EPOCH FROM (MAX(${orders.createdAt}) - MIN(${orders.createdAt}))) / 86400, 1)
          END
        `,
        customerLifespan: sql<number>`
          EXTRACT(EPOCH FROM (GREATEST(MAX(${orders.createdAt}), NOW()) - MIN(${orders.createdAt}))) / 86400
        `,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(
        and(
          gte(orders.createdAt, timeRange.startDate.toISOString()),
          lte(orders.createdAt, timeRange.endDate.toISOString()),
          eq(orders.status, 'completed'),
          customerId ? eq(orders.userId, parseInt(customerId)) : undefined
        )
      )
      .groupBy(orders.userId, users.email);

    const clvData = await baseQuery;

    if (calculationMethod === 'predictive') {
      return clvData.map(customer => ({
        ...customer,
        predictedCLV: this.calculatePredictiveCLV(customer),
        clvScore: this.calculateCLVScore(customer)
      }));
    }

    return clvData;
  }

  /**
   * Get customer acquisition analysis
   */
  async getCustomerAcquisitionAnalysis(params: {
    timeRange: { startDate: Date; endDate: Date };
    channelBreakdown: boolean;
    costAnalysis: boolean;
  }) {
    const { timeRange, channelBreakdown, costAnalysis } = params;

    const acquisitionQuery = db
      .select({
        acquisitionDate: sql<string>`DATE(${users.createdAt})`,
        newCustomers: sql<number>`COUNT(${users.id})`,
        acquisitionChannel: channelBreakdown ? users.registrationSource : sql<string>`'all'`,
        firstOrderRevenue: sql<number>`
          COALESCE(SUM(
            CASE WHEN first_orders.order_rank = 1 
            THEN CAST(first_orders.total AS DECIMAL) 
            END
          ), 0)
        `,
        conversionRate: sql<number>`
          ROUND(
            (COUNT(first_orders.user_id)::float / COUNT(${users.id})::float) * 100, 
            2
          )
        `,
        averageTimeToFirstOrder: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (first_orders.created_at - ${users.createdAt})) / 86400
            ), 
            0
          )
        `,
      })
      .from(users)
      .leftJoin(
        sql`(
          SELECT 
            user_id, 
            total, 
            created_at,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as order_rank
          FROM ${orders}
          WHERE status = 'completed'
        ) as first_orders`,
        sql`first_orders.user_id = ${users.id} AND first_orders.order_rank = 1`
      )
      .where(
        and(
          gte(users.createdAt, timeRange.startDate.toISOString()),
          lte(users.createdAt, timeRange.endDate.toISOString())
        )
      )
      .groupBy(
        sql`DATE(${users.createdAt})`,
        channelBreakdown ? users.registrationSource : sql`'all'`
      )
      .orderBy(asc(sql`DATE(${users.createdAt})`));

    const acquisitionData = await acquisitionQuery;

    return acquisitionData;
  }

  /**
   * Get customer retention analysis with churn prediction
   */
  async getCustomerRetentionAnalysis(params: {
    analysisDepth: 'basic' | 'detailed';
    predictionHorizon: string;
    timeRange: { startDate: Date; endDate: Date };
  }) {
    const { analysisDepth, predictionHorizon, timeRange } = params;

    // Calculate retention by cohort
    const retentionQuery = db
      .select({
        cohort: sql<string>`TO_CHAR(${users.createdAt}, 'YYYY-MM')`,
        customersInCohort: sql<number>`COUNT(DISTINCT ${users.id})`,
        month1Retention: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN ${orders.createdAt} >= ${users.createdAt} + INTERVAL '1 month'
            AND ${orders.createdAt} < ${users.createdAt} + INTERVAL '2 months'
            THEN ${users.id} 
          END)
        `,
        month3Retention: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN ${orders.createdAt} >= ${users.createdAt} + INTERVAL '3 months'
            AND ${orders.createdAt} < ${users.createdAt} + INTERVAL '4 months'
            THEN ${users.id} 
          END)
        `,
        month6Retention: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN ${orders.createdAt} >= ${users.createdAt} + INTERVAL '6 months'
            AND ${orders.createdAt} < ${users.createdAt} + INTERVAL '7 months'
            THEN ${users.id} 
          END)
        `,
        month12Retention: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN ${orders.createdAt} >= ${users.createdAt} + INTERVAL '12 months'
            AND ${orders.createdAt} < ${users.createdAt} + INTERVAL '13 months'
            THEN ${users.id} 
          END)
        `,
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.userId))
      .where(
        and(
          gte(users.createdAt, timeRange.startDate.toISOString()),
          lte(users.createdAt, timeRange.endDate.toISOString())
        )
      )
      .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`)
      .orderBy(asc(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`));

    const retentionData = await retentionQuery;

    // Calculate churn risk if detailed analysis requested
    if (analysisDepth === 'detailed') {
      const churnRiskQuery = db
        .select({
          userId: users.id,
          lastOrderDate: sql<string>`MAX(${orders.createdAt})`,
          daysSinceLastOrder: sql<number>`
            EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400
          `,
          totalOrders: sql<number>`COUNT(${orders.id})`,
          averageOrderInterval: sql<number>`
            CASE 
              WHEN COUNT(${orders.id}) <= 1 THEN 0
              ELSE EXTRACT(EPOCH FROM (MAX(${orders.createdAt}) - MIN(${orders.createdAt}))) / 
                   (86400 * (COUNT(${orders.id}) - 1))
            END
          `,
          churnRisk: sql<string>`
            CASE 
              WHEN EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400 > 180 THEN 'high'
              WHEN EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400 > 90 THEN 'medium'
              WHEN EXTRACT(EPOCH FROM (NOW() - MAX(${orders.createdAt}))) / 86400 > 30 THEN 'low'
              ELSE 'active'
            END
          `,
        })
        .from(users)
        .leftJoin(orders, eq(users.id, orders.userId))
        .where(eq(orders.status, 'completed'))
        .groupBy(users.id)
        .having(sql`COUNT(${orders.id}) > 0`);

      const churnRiskData = await churnRiskQuery;
      return { retention: retentionData, churnRisk: churnRiskData };
    }

    return { retention: retentionData, churnRisk: null };
  }

  /**
   * Store customer analytics data
   */
  async storeCustomerAnalytics(data: InsertCustomerAnalytic) {
    return await db.insert(customerAnalytics).values(data).returning();
  }

  // Helper methods
  private classifyRFMSegment(recency: number, frequency: number, monetary: number): string {
    const rfmScore = recency + frequency + monetary;
    
    if (recency >= 4 && frequency >= 4 && monetary >= 4) return 'Champions';
    if (recency >= 3 && frequency >= 3 && monetary >= 3) return 'Loyal Customers';
    if (recency >= 4 && frequency <= 2) return 'New Customers';
    if (recency >= 3 && frequency >= 3 && monetary <= 2) return 'Potential Loyalists';
    if (recency >= 4 && frequency <= 2 && monetary >= 3) return 'Big Spenders';
    if (recency <= 2 && frequency >= 3 && monetary >= 3) return 'At Risk';
    if (recency <= 2 && frequency <= 2 && monetary >= 3) return 'Cannot Lose Them';
    if (recency <= 2 && frequency <= 2 && monetary <= 2) return 'Hibernating';
    return 'Others';
  }

  private classifyBehavioralSegment(customer: any): string {
    if (customer.totalSessions >= 20 && customer.avgSessionDuration >= 300) return 'Highly Engaged';
    if (customer.totalSessions >= 10 && customer.cartAbandonmentRate <= 30) return 'Regular Browsers';
    if (customer.cartAbandonmentRate >= 70) return 'Cart Abandoners';
    if (customer.totalSessions <= 3) return 'Occasional Visitors';
    return 'Average Users';
  }

  private calculatePredictiveCLV(customer: any): number {
    // Simple predictive CLV calculation
    const avgOrderValue = customer.averageOrderValue;
    const purchaseFrequency = customer.orderFrequency;
    const customerLifespan = Math.max(customer.customerLifespan, 365); // At least 1 year
    
    return avgOrderValue * purchaseFrequency * customerLifespan;
  }

  private calculateCLVScore(customer: any): number {
    const clv = this.calculatePredictiveCLV(customer);
    
    if (clv >= 100000) return 5;
    if (clv >= 50000) return 4;
    if (clv >= 20000) return 3;
    if (clv >= 10000) return 2;
    return 1;
  }

  private groupBySegment(customers: any[]) {
    const grouped = customers.reduce((acc, customer) => {
      const segment = customer.segment;
      if (!acc[segment]) {
        acc[segment] = [];
      }
      acc[segment].push(customer);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([segment, customers]) => ({
      segment,
      customerCount: customers.length,
      averageValue: customers.reduce((sum, c) => sum + (c.totalRevenue || c.monetary || 0), 0) / customers.length,
      customers: customers.slice(0, 10) // Sample customers for each segment
    }));
  }
}