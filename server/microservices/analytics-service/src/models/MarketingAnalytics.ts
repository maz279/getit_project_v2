import { db } from '../../../../db';
import { 
  marketingAnalytics,
  marketingCampaigns,
  marketingDiscounts,
  orders,
  orderItems,
  users,
  userBehaviors,
  notifications,
  type MarketingAnalytic,
  type InsertMarketingAnalytic
} from '../../../../../shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray, count, sum, avg } from 'drizzle-orm';

/**
 * Marketing Analytics Model - Amazon.com/Shopee.sg Level
 * Handles all marketing-related data operations and campaign analysis
 * Provides comprehensive marketing metrics, ROI analysis, and optimization insights
 */
export class MarketingAnalyticsModel {
  
  /**
   * Get comprehensive marketing campaign performance
   */
  async getCampaignPerformance(params: {
    campaignId?: string;
    timeRange: { startDate: Date; endDate: Date };
    includeROI: boolean;
    includeForecast: boolean;
  }) {
    const { campaignId, timeRange, includeROI, includeForecast } = params;

    const campaignQuery = db
      .select({
        campaignId: marketingCampaigns.id,
        campaignName: marketingCampaigns.name,
        campaignType: marketingCampaigns.type,
        status: marketingCampaigns.status,
        budget: marketingCampaigns.budget,
        spent: marketingCampaigns.spent,
        // Reach and Engagement Metrics
        totalImpressions: sql<number>`COALESCE(${marketingCampaigns.impressions}, 0)`,
        totalClicks: sql<number>`COALESCE(${marketingCampaigns.clicks}, 0)`,
        totalConversions: sql<number>`COUNT(DISTINCT ${orders.id})`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
        clickThroughRate: sql<number>`
          ROUND(
            CASE 
              WHEN COALESCE(${marketingCampaigns.impressions}, 0) = 0 THEN 0
              ELSE (COALESCE(${marketingCampaigns.clicks}, 0)::float / ${marketingCampaigns.impressions}::float) * 100
            END, 
            2
          )
        `,
        conversionRate: sql<number>`
          ROUND(
            CASE 
              WHEN COALESCE(${marketingCampaigns.clicks}, 0) = 0 THEN 0
              ELSE (COUNT(DISTINCT ${orders.id})::float / ${marketingCampaigns.clicks}::float) * 100
            END, 
            2
          )
        `,
        // Revenue Metrics
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
        revenuePerClick: sql<number>`
          ROUND(
            CASE 
              WHEN COALESCE(${marketingCampaigns.clicks}, 0) = 0 THEN 0
              ELSE COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0) / ${marketingCampaigns.clicks}
            END, 
            2
          )
        `,
        costPerClick: sql<number>`
          ROUND(
            CASE 
              WHEN COALESCE(${marketingCampaigns.clicks}, 0) = 0 THEN 0
              ELSE COALESCE(${marketingCampaigns.spent}, 0) / ${marketingCampaigns.clicks}
            END, 
            2
          )
        `,
        costPerAcquisition: sql<number>`
          ROUND(
            CASE 
              WHEN COUNT(DISTINCT ${orders.id}) = 0 THEN 0
              ELSE COALESCE(${marketingCampaigns.spent}, 0) / COUNT(DISTINCT ${orders.id})
            END, 
            2
          )
        `,
        returnOnAdSpend: sql<number>`
          ROUND(
            CASE 
              WHEN COALESCE(${marketingCampaigns.spent}, 0) = 0 THEN 0
              ELSE (COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0) / ${marketingCampaigns.spent}) * 100
            END, 
            2
          )
        `,
      })
      .from(marketingCampaigns)
      .leftJoin(orders, and(
        like(orders.referralSource, `%${marketingCampaigns.id}%`),
        gte(orders.createdAt, timeRange.startDate.toISOString()),
        lte(orders.createdAt, timeRange.endDate.toISOString()),
        eq(orders.status, 'completed')
      ))
      .where(
        and(
          campaignId ? eq(marketingCampaigns.id, campaignId) : undefined,
          gte(marketingCampaigns.createdAt, timeRange.startDate.toISOString()),
          lte(marketingCampaigns.createdAt, timeRange.endDate.toISOString())
        )
      )
      .groupBy(
        marketingCampaigns.id,
        marketingCampaigns.name,
        marketingCampaigns.type,
        marketingCampaigns.status,
        marketingCampaigns.budget,
        marketingCampaigns.spent,
        marketingCampaigns.impressions,
        marketingCampaigns.clicks
      )
      .orderBy(desc(sql`totalRevenue`));

    const performanceData = await campaignQuery;

    if (!includeForecast) {
      return { performance: performanceData, forecast: null };
    }

    // Generate performance forecast
    const forecastData = this.generateCampaignForecast(performanceData);

    return { performance: performanceData, forecast: forecastData };
  }

  /**
   * Get discount and promotion analytics
   */
  async getDiscountAnalytics(params: {
    discountId?: string;
    timeRange: { startDate: Date; endDate: Date };
    includeSegmentation: boolean;
  }) {
    const { discountId, timeRange, includeSegmentation } = params;

    const discountQuery = db
      .select({
        discountId: marketingDiscounts.id,
        discountName: marketingDiscounts.name,
        discountType: marketingDiscounts.type,
        discountValue: marketingDiscounts.value,
        minOrderValue: marketingDiscounts.minOrderValue,
        usageLimit: marketingDiscounts.usageLimit,
        // Usage Metrics
        totalUsage: sql<number>`COUNT(DISTINCT ${orders.id})`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${orders.userId})`,
        repeatUsage: sql<number>`
          COUNT(DISTINCT ${orders.userId}) - 
          COUNT(DISTINCT CASE 
            WHEN row_number() OVER (PARTITION BY ${orders.userId} ORDER BY ${orders.createdAt}) = 1 
            THEN ${orders.userId} 
          END)
        `,
        usageRate: sql<number>`
          ROUND(
            CASE 
              WHEN COALESCE(${marketingDiscounts.usageLimit}, 0) = 0 THEN 0
              ELSE (COUNT(DISTINCT ${orders.id})::float / ${marketingDiscounts.usageLimit}::float) * 100
            END, 
            2
          )
        `,
        // Financial Impact
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        totalDiscount: sql<number>`
          COALESCE(SUM(
            CASE 
              WHEN ${marketingDiscounts.type} = 'percentage' 
              THEN CAST(${orders.subtotal} AS DECIMAL) * (${marketingDiscounts.value} / 100)
              WHEN ${marketingDiscounts.type} = 'fixed' 
              THEN LEAST(${marketingDiscounts.value}, CAST(${orders.subtotal} AS DECIMAL))
              ELSE 0
            END
          ), 0)
        `,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
        averageDiscountAmount: sql<number>`
          COALESCE(AVG(
            CASE 
              WHEN ${marketingDiscounts.type} = 'percentage' 
              THEN CAST(${orders.subtotal} AS DECIMAL) * (${marketingDiscounts.value} / 100)
              WHEN ${marketingDiscounts.type} = 'fixed' 
              THEN LEAST(${marketingDiscounts.value}, CAST(${orders.subtotal} AS DECIMAL))
              ELSE 0
            END
          ), 0)
        `,
        discountToRevenueRatio: sql<number>`
          ROUND(
            CASE 
              WHEN COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0) = 0 THEN 0
              ELSE (SUM(
                CASE 
                  WHEN ${marketingDiscounts.type} = 'percentage' 
                  THEN CAST(${orders.subtotal} AS DECIMAL) * (${marketingDiscounts.value} / 100)
                  WHEN ${marketingDiscounts.type} = 'fixed' 
                  THEN LEAST(${marketingDiscounts.value}, CAST(${orders.subtotal} AS DECIMAL))
                  ELSE 0
                END
              ) / SUM(CAST(${orders.total} AS DECIMAL))) * 100
            END, 
            2
          )
        `,
      })
      .from(marketingDiscounts)
      .leftJoin(orders, and(
        eq(orders.discountId, marketingDiscounts.id),
        gte(orders.createdAt, timeRange.startDate.toISOString()),
        lte(orders.createdAt, timeRange.endDate.toISOString()),
        eq(orders.status, 'completed')
      ))
      .where(
        and(
          discountId ? eq(marketingDiscounts.id, discountId) : undefined,
          eq(marketingDiscounts.isActive, true)
        )
      )
      .groupBy(
        marketingDiscounts.id,
        marketingDiscounts.name,
        marketingDiscounts.type,
        marketingDiscounts.value,
        marketingDiscounts.minOrderValue,
        marketingDiscounts.usageLimit
      )
      .orderBy(desc(sql`totalUsage`));

    const discountData = await discountQuery;

    if (!includeSegmentation) {
      return { discounts: discountData, segmentation: null };
    }

    // Get customer segmentation for discount usage
    const segmentationData = await this.getDiscountSegmentation(timeRange);

    return { discounts: discountData, segmentation: segmentationData };
  }

  /**
   * Get email marketing performance
   */
  async getEmailMarketingAnalytics(params: {
    timeRange: { startDate: Date; endDate: Date };
    includeDetailedMetrics: boolean;
  }) {
    const { timeRange, includeDetailedMetrics } = params;

    const emailQuery = db
      .select({
        emailType: notifications.type,
        totalSent: sql<number>`COUNT(${notifications.id})`,
        delivered: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'delivered' THEN 1 END)`,
        opened: sql<number>`COUNT(CASE WHEN ${notifications.metadata}->>'opened' = 'true' THEN 1 END)`,
        clicked: sql<number>`COUNT(CASE WHEN ${notifications.metadata}->>'clicked' = 'true' THEN 1 END)`,
        deliveryRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${notifications.status} = 'delivered' THEN 1 END)::float / 
             COUNT(${notifications.id})::float) * 100, 
            2
          )
        `,
        openRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${notifications.metadata}->>'opened' = 'true' THEN 1 END)::float / 
             COUNT(CASE WHEN ${notifications.status} = 'delivered' THEN 1 END)::float) * 100, 
            2
          )
        `,
        clickThroughRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${notifications.metadata}->>'clicked' = 'true' THEN 1 END)::float / 
             COUNT(CASE WHEN ${notifications.metadata}->>'opened' = 'true' THEN 1 END)::float) * 100, 
            2
          )
        `,
        clickToOpenRate: sql<number>`
          ROUND(
            (COUNT(CASE WHEN ${notifications.metadata}->>'clicked' = 'true' THEN 1 END)::float / 
             COUNT(CASE WHEN ${notifications.metadata}->>'opened' = 'true' THEN 1 END)::float) * 100, 
            2
          )
        `,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.channel, 'email'),
          gte(notifications.createdAt, timeRange.startDate.toISOString()),
          lte(notifications.createdAt, timeRange.endDate.toISOString())
        )
      )
      .groupBy(notifications.type)
      .orderBy(desc(sql`totalSent`));

    const emailData = await emailQuery;

    if (!includeDetailedMetrics) {
      return { email: emailData, detailed: null };
    }

    // Get detailed metrics by date
    const detailedQuery = db
      .select({
        date: sql<string>`DATE(${notifications.createdAt})`,
        totalSent: sql<number>`COUNT(${notifications.id})`,
        delivered: sql<number>`COUNT(CASE WHEN ${notifications.status} = 'delivered' THEN 1 END)`,
        opened: sql<number>`COUNT(CASE WHEN ${notifications.metadata}->>'opened' = 'true' THEN 1 END)`,
        clicked: sql<number>`COUNT(CASE WHEN ${notifications.metadata}->>'clicked' = 'true' THEN 1 END)`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.channel, 'email'),
          gte(notifications.createdAt, timeRange.startDate.toISOString()),
          lte(notifications.createdAt, timeRange.endDate.toISOString())
        )
      )
      .groupBy(sql`DATE(${notifications.createdAt})`)
      .orderBy(asc(sql`DATE(${notifications.createdAt})`));

    const detailedData = await detailedQuery;

    return { email: emailData, detailed: detailedData };
  }

  /**
   * Get customer acquisition and retention analysis
   */
  async getCustomerAcquisitionAnalytics(params: {
    timeRange: { startDate: Date; endDate: Date };
    channelBreakdown: boolean;
  }) {
    const { timeRange, channelBreakdown } = params;

    const acquisitionQuery = db
      .select({
        acquisitionChannel: channelBreakdown ? users.registrationSource : sql<string>`'all'`,
        newCustomers: sql<number>`COUNT(DISTINCT ${users.id})`,
        activatedCustomers: sql<number>`
          COUNT(DISTINCT CASE 
            WHEN first_order.user_id IS NOT NULL 
            THEN ${users.id} 
          END)
        `,
        activationRate: sql<number>`
          ROUND(
            (COUNT(DISTINCT CASE WHEN first_order.user_id IS NOT NULL THEN ${users.id} END)::float / 
             COUNT(DISTINCT ${users.id})::float) * 100, 
            2
          )
        `,
        averageTimeToFirstOrder: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (first_order.created_at - ${users.createdAt})) / 86400
            ), 
            0
          )
        `,
        totalAcquisitionRevenue: sql<number>`
          COALESCE(SUM(CAST(first_order.total AS DECIMAL)), 0)
        `,
        averageFirstOrderValue: sql<number>`
          COALESCE(AVG(CAST(first_order.total AS DECIMAL)), 0)
        `,
        retentionRate30Days: sql<number>`
          ROUND(
            (COUNT(DISTINCT CASE 
              WHEN repeat_order.user_id IS NOT NULL 
              THEN ${users.id} 
            END)::float / 
             COUNT(DISTINCT CASE 
               WHEN first_order.user_id IS NOT NULL 
               THEN ${users.id} 
             END)::float) * 100, 
            2
          )
        `,
      })
      .from(users)
      .leftJoin(
        sql`(
          SELECT 
            user_id, 
            created_at, 
            total,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as order_rank
          FROM ${orders}
          WHERE status = 'completed'
        ) as first_order`,
        sql`first_order.user_id = ${users.id} AND first_order.order_rank = 1`
      )
      .leftJoin(
        sql`(
          SELECT DISTINCT user_id
          FROM ${orders}
          WHERE status = 'completed'
          AND created_at >= (
            SELECT MIN(created_at) + INTERVAL '30 days'
            FROM ${orders} o2 
            WHERE o2.user_id = ${orders}.user_id 
            AND o2.status = 'completed'
          )
        ) as repeat_order`,
        sql`repeat_order.user_id = ${users.id}`
      )
      .where(
        and(
          gte(users.createdAt, timeRange.startDate.toISOString()),
          lte(users.createdAt, timeRange.endDate.toISOString())
        )
      )
      .groupBy(
        channelBreakdown ? users.registrationSource : sql`'all'`
      )
      .orderBy(desc(sql`newCustomers`));

    return await acquisitionQuery;
  }

  /**
   * Get marketing channel attribution analysis
   */
  async getChannelAttributionAnalytics(params: {
    attributionModel: 'first_touch' | 'last_touch' | 'linear' | 'time_decay';
    timeRange: { startDate: Date; endDate: Date };
  }) {
    const { attributionModel, timeRange } = params;

    // Simplified attribution analysis
    const attributionQuery = db
      .select({
        channel: orders.referralSource,
        touchpoints: sql<number>`COUNT(DISTINCT ${userBehaviors.sessionId})`,
        conversions: sql<number>`COUNT(DISTINCT ${orders.id})`,
        revenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        averageOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS DECIMAL)), 0)`,
        conversionRate: sql<number>`
          ROUND(
            (COUNT(DISTINCT ${orders.id})::float / 
             COUNT(DISTINCT ${userBehaviors.sessionId})::float) * 100, 
            2
          )
        `,
        attributedRevenue: sql<number>`
          CASE 
            WHEN '${attributionModel}' = 'first_touch' THEN 
              COALESCE(SUM(CASE WHEN order_rank.rank = 1 THEN CAST(${orders.total} AS DECIMAL) END), 0)
            WHEN '${attributionModel}' = 'last_touch' THEN 
              COALESCE(SUM(CASE WHEN order_rank.rank = order_rank.max_rank THEN CAST(${orders.total} AS DECIMAL) END), 0)
            ELSE 
              COALESCE(SUM(CAST(${orders.total} AS DECIMAL)) / COUNT(DISTINCT ${orders.referralSource}), 0)
          END
        `,
      })
      .from(orders)
      .leftJoin(userBehaviors, eq(orders.userId, userBehaviors.userId))
      .leftJoin(
        sql`(
          SELECT 
            user_id,
            referral_source,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rank,
            COUNT(*) OVER (PARTITION BY user_id) as max_rank
          FROM ${orders}
          WHERE status = 'completed'
        ) as order_rank`,
        sql`order_rank.user_id = ${orders.userId} AND order_rank.referral_source = ${orders.referralSource}`
      )
      .where(
        and(
          gte(orders.createdAt, timeRange.startDate.toISOString()),
          lte(orders.createdAt, timeRange.endDate.toISOString()),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(orders.referralSource)
      .orderBy(desc(sql`attributedRevenue`));

    return await attributionQuery;
  }

  /**
   * Store marketing analytics data
   */
  async storeMarketingAnalytics(data: InsertMarketingAnalytic) {
    return await db.insert(marketingAnalytics).values(data).returning();
  }

  // Helper methods
  private generateCampaignForecast(performanceData: any[]) {
    return performanceData.map(campaign => {
      const currentROAS = campaign.returnOnAdSpend;
      const remainingBudget = campaign.budget - campaign.spent;
      const avgRevenuePerDollar = currentROAS / 100;

      return {
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        remainingBudget,
        projectedRevenue: remainingBudget * avgRevenuePerDollar,
        projectedConversions: Math.round(remainingBudget / campaign.costPerAcquisition),
        projectedROAS: currentROAS, // Assuming same performance
        recommendation: this.getCampaignRecommendation(campaign),
      };
    });
  }

  private async getDiscountSegmentation(timeRange: { startDate: Date; endDate: Date }) {
    return await db
      .select({
        customerSegment: sql<string>`
          CASE 
            WHEN customer_orders.order_count >= 10 THEN 'loyal'
            WHEN customer_orders.order_count >= 3 THEN 'regular'
            WHEN customer_orders.order_count = 1 THEN 'new'
            ELSE 'inactive'
          END
        `,
        discountUsage: sql<number>`COUNT(DISTINCT ${orders.discountId})`,
        totalOrders: sql<number>`COUNT(${orders.id})`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        averageDiscountAmount: sql<number>`
          COALESCE(AVG(CAST(${orders.total} AS DECIMAL) - CAST(${orders.subtotal} AS DECIMAL)), 0)
        `,
      })
      .from(orders)
      .leftJoin(
        sql`(
          SELECT 
            user_id, 
            COUNT(*) as order_count 
          FROM ${orders} 
          WHERE status = 'completed'
          GROUP BY user_id
        ) as customer_orders`,
        sql`customer_orders.user_id = ${orders.userId}`
      )
      .where(
        and(
          gte(orders.createdAt, timeRange.startDate.toISOString()),
          lte(orders.createdAt, timeRange.endDate.toISOString()),
          eq(orders.status, 'completed'),
          sql`${orders.discountId} IS NOT NULL`
        )
      )
      .groupBy(sql`
        CASE 
          WHEN customer_orders.order_count >= 10 THEN 'loyal'
          WHEN customer_orders.order_count >= 3 THEN 'regular'
          WHEN customer_orders.order_count = 1 THEN 'new'
          ELSE 'inactive'
        END
      `)
      .orderBy(desc(sql`totalRevenue`));
  }

  private getCampaignRecommendation(campaign: any): string {
    if (campaign.returnOnAdSpend < 100) return 'pause_low_performance';
    if (campaign.returnOnAdSpend > 400) return 'increase_budget';
    if (campaign.conversionRate < 1) return 'optimize_targeting';
    if (campaign.clickThroughRate < 2) return 'improve_creative';
    return 'maintain_current_strategy';
  }
}