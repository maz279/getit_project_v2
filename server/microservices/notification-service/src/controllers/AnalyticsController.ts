import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  notifications,
  emailLogs,
  smsLogs,
  pushNotifications,
  whatsappMessages,
  campaigns,
  users
} from '../../../../../shared/schema';
import { eq, and, desc, count, sum, avg, between, sql, gte, lte } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';

/**
 * Analytics Controller
 * Provides comprehensive notification performance analytics and reporting
 * Amazon.com/Shopee.sg-level business intelligence for notification campaigns
 */
export class AnalyticsController {
  private serviceName = 'notification-service:analytics-controller';

  /**
   * Get Delivery Analytics
   * Comprehensive delivery performance metrics
   */
  async getDeliveryAnalytics(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `analytics-delivery-${Date.now()}`;
    
    try {
      const {
        timeframe = '7d',
        channel,
        notificationType,
        startDate,
        endDate,
        groupBy = 'day'
      } = req.query;

      // Calculate date range
      const { start, end } = this.calculateDateRange(timeframe as string, startDate as string, endDate as string);

      // Build base conditions
      const conditions = [
        between(deliveryLogs.createdAt, start, end)
      ];

      if (channel) conditions.push(eq(deliveryLogs.channel, channel as string));
      if (notificationType) {
        conditions.push(sql`EXISTS (
          SELECT 1 FROM ${notifications} n 
          WHERE n.id = ${deliveryLogs.notificationId} 
          AND n.type = ${notificationType}
        )`);
      }

      // Get overall metrics
      const [overallMetrics] = await db.select({
        totalSent: count(deliveryLogs.id),
        totalDelivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
        totalFailed: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'failed' THEN 1 END)`,
        totalOpened: sql<number>`COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)`,
        totalClicked: sql<number>`COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)`,
        avgDeliveryTime: sql<number>`AVG(${deliveryLogs.deliveryTime})`,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`
      })
      .from(deliveryLogs)
      .where(and(...conditions));

      // Calculate rates
      const deliveryRate = overallMetrics.totalSent > 0 ? 
        ((overallMetrics.totalDelivered / overallMetrics.totalSent) * 100) : 0;
      const failureRate = overallMetrics.totalSent > 0 ? 
        ((overallMetrics.totalFailed / overallMetrics.totalSent) * 100) : 0;
      const openRate = overallMetrics.totalDelivered > 0 ? 
        ((overallMetrics.totalOpened / overallMetrics.totalDelivered) * 100) : 0;
      const clickRate = overallMetrics.totalOpened > 0 ? 
        ((overallMetrics.totalClicked / overallMetrics.totalOpened) * 100) : 0;

      // Get time-series data
      const timeSeriesData = await this.getTimeSeriesDeliveryData(conditions, groupBy as string);

      // Get performance by channel
      const channelPerformance = await db.select({
        channel: deliveryLogs.channel,
        sent: count(deliveryLogs.id),
        delivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
        failed: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'failed' THEN 1 END)`,
        opened: sql<number>`COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)`,
        clicked: sql<number>`COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)`,
        avgCost: sql<number>`AVG(${deliveryLogs.cost})`,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`
      })
      .from(deliveryLogs)
      .where(and(...conditions))
      .groupBy(deliveryLogs.channel);

      // Calculate channel rates
      const channelMetrics = channelPerformance.map(channel => ({
        ...channel,
        deliveryRate: channel.sent > 0 ? ((channel.delivered / channel.sent) * 100).toFixed(2) : '0.00',
        failureRate: channel.sent > 0 ? ((channel.failed / channel.sent) * 100).toFixed(2) : '0.00',
        openRate: channel.delivered > 0 ? ((channel.opened / channel.delivered) * 100).toFixed(2) : '0.00',
        clickRate: channel.opened > 0 ? ((channel.clicked / channel.opened) * 100).toFixed(2) : '0.00'
      }));

      // Get top failure reasons
      const failureReasons = await db.select({
        reason: deliveryLogs.failureReason,
        count: count(deliveryLogs.id),
        channels: sql<string[]>`ARRAY_AGG(DISTINCT ${deliveryLogs.channel})`
      })
      .from(deliveryLogs)
      .where(and(
        ...conditions,
        eq(deliveryLogs.status, 'failed'),
        sql`${deliveryLogs.failureReason} IS NOT NULL`
      ))
      .groupBy(deliveryLogs.failureReason)
      .orderBy(desc(count(deliveryLogs.id)))
      .limit(10);

      logger.info('Delivery analytics retrieved', {
        serviceId: this.serviceName,
        correlationId,
        timeframe,
        totalSent: overallMetrics.totalSent
      });

      res.json({
        success: true,
        analytics: {
          timeframe: {
            period: timeframe,
            start: start.toISOString(),
            end: end.toISOString()
          },
          overall: {
            ...overallMetrics,
            deliveryRate: parseFloat(deliveryRate.toFixed(2)),
            failureRate: parseFloat(failureRate.toFixed(2)),
            openRate: parseFloat(openRate.toFixed(2)),
            clickRate: parseFloat(clickRate.toFixed(2))
          },
          timeSeries: timeSeriesData,
          byChannel: channelMetrics,
          topFailures: failureReasons
        }
      });

    } catch (error: any) {
      logger.error('Failed to get delivery analytics', {
        serviceId: this.serviceName,
        correlationId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve delivery analytics',
        details: error.message
      });
    }
  }

  /**
   * Get Engagement Analytics
   * User engagement metrics for notifications
   */
  async getEngagementAnalytics(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `analytics-engagement-${Date.now()}`;
    
    try {
      const {
        timeframe = '7d',
        channel,
        notificationType,
        startDate,
        endDate
      } = req.query;

      const { start, end } = this.calculateDateRange(timeframe as string, startDate as string, endDate as string);

      // Get engagement metrics
      const engagementData = await db.select({
        date: sql<string>`DATE(${deliveryLogs.createdAt})`,
        channel: deliveryLogs.channel,
        sent: count(deliveryLogs.id),
        delivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
        opened: sql<number>`COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)`,
        clicked: sql<number>`COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)`,
        avgTimeToOpen: sql<number>`AVG(EXTRACT(EPOCH FROM (${deliveryLogs.openedAt} - ${deliveryLogs.deliveredAt})))`,
        avgTimeToClick: sql<number>`AVG(EXTRACT(EPOCH FROM (${deliveryLogs.clickedAt} - ${deliveryLogs.openedAt})))`
      })
      .from(deliveryLogs)
      .where(between(deliveryLogs.createdAt, start, end))
      .groupBy(sql`DATE(${deliveryLogs.createdAt})`, deliveryLogs.channel)
      .orderBy(sql`DATE(${deliveryLogs.createdAt})`);

      // Get user engagement patterns
      const userEngagement = await db.select({
        hour: sql<number>`EXTRACT(HOUR FROM ${deliveryLogs.deliveredAt})`,
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${deliveryLogs.deliveredAt})`,
        opens: sql<number>`COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)`,
        clicks: sql<number>`COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)`,
        totalDelivered: count(deliveryLogs.id)
      })
      .from(deliveryLogs)
      .where(and(
        between(deliveryLogs.createdAt, start, end),
        eq(deliveryLogs.status, 'delivered')
      ))
      .groupBy(
        sql`EXTRACT(HOUR FROM ${deliveryLogs.deliveredAt})`,
        sql`EXTRACT(DOW FROM ${deliveryLogs.deliveredAt})`
      );

      // Top performing notification types
      const topPerformingTypes = await db.select({
        notificationType: notifications.type,
        sent: count(deliveryLogs.id),
        opened: sql<number>`COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)`,
        clicked: sql<number>`COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)`,
        openRate: sql<number>`(COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)::float / COUNT(${deliveryLogs.id})) * 100`,
        clickRate: sql<number>`(COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)::float / COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)) * 100`
      })
      .from(deliveryLogs)
      .innerJoin(notifications, eq(deliveryLogs.notificationId, notifications.id))
      .where(between(deliveryLogs.createdAt, start, end))
      .groupBy(notifications.type)
      .orderBy(desc(sql`(COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)::float / COUNT(${deliveryLogs.id})) * 100`))
      .limit(10);

      // Device/Platform engagement (for push notifications)
      const deviceEngagement = await db.select({
        platform: pushNotifications.platform,
        sent: count(pushNotifications.id),
        delivered: sql<number>`COUNT(CASE WHEN ${pushNotifications.status} = 'delivered' THEN 1 END)`,
        clicked: sql<number>`COUNT(CASE WHEN ${pushNotifications.clickedAt} IS NOT NULL THEN 1 END)`,
        clickRate: sql<number>`(COUNT(CASE WHEN ${pushNotifications.clickedAt} IS NOT NULL THEN 1 END)::float / COUNT(CASE WHEN ${pushNotifications.status} = 'delivered' THEN 1 END)) * 100`
      })
      .from(pushNotifications)
      .where(between(pushNotifications.createdAt, start, end))
      .groupBy(pushNotifications.platform);

      res.json({
        success: true,
        engagement: {
          timeframe: {
            start: start.toISOString(),
            end: end.toISOString()
          },
          daily: engagementData,
          patterns: {
            byHour: userEngagement.filter(u => u.hour !== null),
            byDayOfWeek: userEngagement.filter(u => u.dayOfWeek !== null)
          },
          topPerformingTypes,
          deviceEngagement
        }
      });

    } catch (error: any) {
      logger.error('Failed to get engagement analytics', {
        serviceId: this.serviceName,
        correlationId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve engagement analytics',
        details: error.message
      });
    }
  }

  /**
   * Get Cost Analytics
   * Notification cost analysis and optimization insights
   */
  async getCostAnalytics(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `analytics-cost-${Date.now()}`;
    
    try {
      const {
        timeframe = '30d',
        channel,
        currency = 'BDT',
        startDate,
        endDate,
        groupBy = 'day'
      } = req.query;

      const { start, end } = this.calculateDateRange(timeframe as string, startDate as string, endDate as string);

      const conditions = [
        between(deliveryLogs.createdAt, start, end),
        eq(deliveryLogs.currency, currency as string)
      ];

      if (channel) conditions.push(eq(deliveryLogs.channel, channel as string));

      // Overall cost metrics
      const [overallCosts] = await db.select({
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`,
        totalSent: count(deliveryLogs.id),
        avgCostPerMessage: sql<number>`AVG(${deliveryLogs.cost})`,
        costPerDelivery: sql<number>`SUM(${deliveryLogs.cost}) / COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`
      })
      .from(deliveryLogs)
      .where(and(...conditions));

      // Cost trends over time
      const costTrends = await this.getCostTrendsData(conditions, groupBy as string);

      // Cost by channel
      const costByChannel = await db.select({
        channel: deliveryLogs.channel,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`,
        messageCount: count(deliveryLogs.id),
        avgCost: sql<number>`AVG(${deliveryLogs.cost})`,
        deliveryRate: sql<number>`(COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)::float / COUNT(${deliveryLogs.id})) * 100`,
        costEfficiency: sql<number>`SUM(${deliveryLogs.cost}) / COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`
      })
      .from(deliveryLogs)
      .where(and(...conditions))
      .groupBy(deliveryLogs.channel);

      // Cost by provider (for SMS and Email)
      const costByProvider = await db.select({
        provider: deliveryLogs.provider,
        channel: deliveryLogs.channel,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`,
        messageCount: count(deliveryLogs.id),
        avgCost: sql<number>`AVG(${deliveryLogs.cost})`,
        successRate: sql<number>`(COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)::float / COUNT(${deliveryLogs.id})) * 100`
      })
      .from(deliveryLogs)
      .where(and(
        ...conditions,
        sql`${deliveryLogs.provider} IS NOT NULL`
      ))
      .groupBy(deliveryLogs.provider, deliveryLogs.channel)
      .orderBy(desc(sql`SUM(${deliveryLogs.cost})`));

      // Bangladesh-specific provider analysis
      const bangladeshProviders = await db.select({
        provider: deliveryLogs.provider,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`,
        messageCount: count(deliveryLogs.id),
        avgCostPerSMS: sql<number>`AVG(${deliveryLogs.cost})`,
        deliveryRate: sql<number>`(COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)::float / COUNT(${deliveryLogs.id})) * 100`,
        avgDeliveryTime: sql<number>`AVG(${deliveryLogs.deliveryTime})`
      })
      .from(deliveryLogs)
      .where(and(
        ...conditions,
        eq(deliveryLogs.channel, 'sms'),
        sql`${deliveryLogs.provider} IN ('ssl_wireless', 'robi', 'grameenphone', 'banglalink')`
      ))
      .groupBy(deliveryLogs.provider);

      // Cost optimization recommendations
      const recommendations = await this.generateCostOptimizationRecommendations(costByChannel, bangladeshProviders);

      logger.info('Cost analytics retrieved', {
        serviceId: this.serviceName,
        correlationId,
        totalCost: overallCosts.totalCost,
        currency
      });

      res.json({
        success: true,
        costAnalytics: {
          timeframe: {
            start: start.toISOString(),
            end: end.toISOString()
          },
          currency,
          overall: overallCosts,
          trends: costTrends,
          byChannel: costByChannel,
          byProvider: costByProvider,
          bangladeshProviders,
          recommendations
        }
      });

    } catch (error: any) {
      logger.error('Failed to get cost analytics', {
        serviceId: this.serviceName,
        correlationId,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cost analytics',
        details: error.message
      });
    }
  }

  /**
   * Get Campaign Performance Report
   * Comprehensive campaign performance analysis
   */
  async getCampaignPerformanceReport(req: Request, res: Response) {
    try {
      const {
        campaignId,
        startDate,
        endDate,
        includeComparison = false
      } = req.query;

      let campaignConditions = [];
      
      if (campaignId) {
        campaignConditions.push(eq(campaigns.id, campaignId as string));
      }

      if (startDate && endDate) {
        campaignConditions.push(between(campaigns.createdAt, new Date(startDate as string), new Date(endDate as string)));
      }

      // Get campaign performance data
      const campaignPerformance = await db.select({
        id: campaigns.id,
        name: campaigns.name,
        type: campaigns.type,
        status: campaigns.status,
        totalRecipients: campaigns.totalRecipients,
        sentCount: campaigns.sentCount,
        deliveredCount: campaigns.deliveredCount,
        openedCount: campaigns.openedCount,
        clickedCount: campaigns.clickedCount,
        bouncedCount: campaigns.bouncedCount,
        budget: campaigns.budget,
        spentAmount: campaigns.spentAmount,
        startedAt: campaigns.startedAt,
        completedAt: campaigns.completedAt,
        creatorName: users.name
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.createdBy, users.id))
      .where(campaignConditions.length > 0 ? and(...campaignConditions) : undefined)
      .orderBy(desc(campaigns.createdAt));

      // Calculate performance metrics for each campaign
      const enrichedCampaigns = campaignPerformance.map(campaign => {
        const deliveryRate = campaign.totalRecipients > 0 ? 
          ((campaign.deliveredCount || 0) / campaign.totalRecipients * 100) : 0;
        const openRate = campaign.deliveredCount > 0 ? 
          ((campaign.openedCount || 0) / campaign.deliveredCount * 100) : 0;
        const clickRate = campaign.openedCount > 0 ? 
          ((campaign.clickedCount || 0) / campaign.openedCount * 100) : 0;
        const conversionRate = campaign.totalRecipients > 0 ? 
          ((campaign.clickedCount || 0) / campaign.totalRecipients * 100) : 0;
        const costPerClick = campaign.spentAmount && campaign.clickedCount ? 
          (parseFloat(campaign.spentAmount) / campaign.clickedCount) : 0;
        const roi = campaign.budget && campaign.spentAmount ? 
          (((parseFloat(campaign.budget) - parseFloat(campaign.spentAmount)) / parseFloat(campaign.spentAmount)) * 100) : 0;

        return {
          ...campaign,
          metrics: {
            deliveryRate: parseFloat(deliveryRate.toFixed(2)),
            openRate: parseFloat(openRate.toFixed(2)),
            clickRate: parseFloat(clickRate.toFixed(2)),
            conversionRate: parseFloat(conversionRate.toFixed(2)),
            costPerClick: parseFloat(costPerClick.toFixed(4)),
            roi: parseFloat(roi.toFixed(2))
          }
        };
      });

      // Industry benchmarks for comparison
      const benchmarks = {
        email: { deliveryRate: 95, openRate: 22, clickRate: 3.5 },
        sms: { deliveryRate: 98, openRate: 98, clickRate: 15 },
        push: { deliveryRate: 90, openRate: 7, clickRate: 1.5 },
        whatsapp: { deliveryRate: 96, openRate: 85, clickRate: 12 }
      };

      res.json({
        success: true,
        report: {
          campaigns: enrichedCampaigns,
          benchmarks: includeComparison ? benchmarks : undefined,
          summary: {
            totalCampaigns: enrichedCampaigns.length,
            activeCampaigns: enrichedCampaigns.filter(c => c.status === 'running').length,
            completedCampaigns: enrichedCampaigns.filter(c => c.status === 'completed').length,
            avgDeliveryRate: enrichedCampaigns.reduce((sum, c) => sum + c.metrics.deliveryRate, 0) / enrichedCampaigns.length,
            avgOpenRate: enrichedCampaigns.reduce((sum, c) => sum + c.metrics.openRate, 0) / enrichedCampaigns.length,
            avgClickRate: enrichedCampaigns.reduce((sum, c) => sum + c.metrics.clickRate, 0) / enrichedCampaigns.length
          }
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate campaign performance report',
        details: error.message
      });
    }
  }

  /**
   * Generate Daily Analytics Summary
   * Automated daily summary generation for analytics dashboard
   */
  async generateDailyAnalyticsSummary(req: Request, res: Response) {
    try {
      const { date = new Date().toISOString().split('T')[0] } = req.query;
      const targetDate = new Date(date as string);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Check if summary already exists
      const [existingSummary] = await db.select().from(notificationAnalytics)
        .where(eq(notificationAnalytics.date, date as string))
        .limit(1);

      if (existingSummary) {
        return res.json({
          success: true,
          message: 'Daily summary already exists',
          summary: existingSummary
        });
      }

      // Generate analytics for each notification type and channel combination
      const analyticsData = await db.select({
        notificationType: notifications.type,
        channel: deliveryLogs.channel,
        totalSent: count(deliveryLogs.id),
        totalDelivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
        totalOpened: sql<number>`COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)`,
        totalClicked: sql<number>`COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)`,
        totalBounced: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'bounced' THEN 1 END)`,
        totalFailed: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'failed' THEN 1 END)`,
        totalCost: sql<number>`SUM(${deliveryLogs.cost})`,
        avgDeliveryTime: sql<number>`AVG(${deliveryLogs.deliveryTime})`
      })
      .from(deliveryLogs)
      .innerJoin(notifications, eq(deliveryLogs.notificationId, notifications.id))
      .where(between(deliveryLogs.createdAt, targetDate, nextDay))
      .groupBy(notifications.type, deliveryLogs.channel);

      // Insert analytics summaries
      const summaries = [];
      for (const data of analyticsData) {
        const deliveryRate = data.totalSent > 0 ? (data.totalDelivered / data.totalSent * 100) : 0;
        const openRate = data.totalDelivered > 0 ? (data.totalOpened / data.totalDelivered * 100) : 0;
        const clickRate = data.totalOpened > 0 ? (data.totalClicked / data.totalOpened * 100) : 0;
        const bounceRate = data.totalSent > 0 ? (data.totalBounced / data.totalSent * 100) : 0;

        const summaryData: InsertNotificationAnalytics = {
          date: date as string,
          notificationType: data.notificationType,
          channel: data.channel,
          totalSent: data.totalSent,
          totalDelivered: data.totalDelivered,
          totalOpened: data.totalOpened,
          totalClicked: data.totalClicked,
          totalBounced: data.totalBounced,
          totalFailed: data.totalFailed,
          deliveryRate: deliveryRate.toString(),
          openRate: openRate.toString(),
          clickRate: clickRate.toString(),
          bounceRate: bounceRate.toString(),
          totalCost: data.totalCost?.toString() || '0',
          avgDeliveryTime: data.avgDeliveryTime || 0
        };

        const [summary] = await db.insert(notificationAnalytics)
          .values(summaryData)
          .returning();
        
        summaries.push(summary);
      }

      res.json({
        success: true,
        message: 'Daily analytics summary generated successfully',
        date,
        summariesGenerated: summaries.length,
        summaries
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate daily analytics summary',
        details: error.message
      });
    }
  }

  // Helper Methods

  private calculateDateRange(timeframe: string, startDate?: string, endDate?: string): { start: Date; end: Date } {
    const end = endDate ? new Date(endDate) : new Date();
    let start: Date;

    if (startDate) {
      start = new Date(startDate);
    } else {
      start = new Date(end);
      switch (timeframe) {
        case '1d':
          start.setDate(end.getDate() - 1);
          break;
        case '7d':
          start.setDate(end.getDate() - 7);
          break;
        case '30d':
          start.setDate(end.getDate() - 30);
          break;
        case '90d':
          start.setDate(end.getDate() - 90);
          break;
        default:
          start.setDate(end.getDate() - 7);
      }
    }

    return { start, end };
  }

  private async getTimeSeriesDeliveryData(conditions: any[], groupBy: string): Promise<any[]> {
    const timeFormat = groupBy === 'hour' ? 
      sql`TO_CHAR(${deliveryLogs.createdAt}, 'YYYY-MM-DD HH24:00:00')` :
      sql`DATE(${deliveryLogs.createdAt})`;

    return await db.select({
      period: timeFormat,
      sent: count(deliveryLogs.id),
      delivered: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`,
      failed: sql<number>`COUNT(CASE WHEN ${deliveryLogs.status} = 'failed' THEN 1 END)`,
      opened: sql<number>`COUNT(CASE WHEN ${deliveryLogs.openedAt} IS NOT NULL THEN 1 END)`,
      clicked: sql<number>`COUNT(CASE WHEN ${deliveryLogs.clickedAt} IS NOT NULL THEN 1 END)`,
      cost: sql<number>`SUM(${deliveryLogs.cost})`
    })
    .from(deliveryLogs)
    .where(and(...conditions))
    .groupBy(timeFormat)
    .orderBy(timeFormat);
  }

  private async getCostTrendsData(conditions: any[], groupBy: string): Promise<any[]> {
    const timeFormat = groupBy === 'hour' ? 
      sql`TO_CHAR(${deliveryLogs.createdAt}, 'YYYY-MM-DD HH24:00:00')` :
      sql`DATE(${deliveryLogs.createdAt})`;

    return await db.select({
      period: timeFormat,
      totalCost: sql<number>`SUM(${deliveryLogs.cost})`,
      messageCount: count(deliveryLogs.id),
      avgCost: sql<number>`AVG(${deliveryLogs.cost})`,
      costPerDelivery: sql<number>`SUM(${deliveryLogs.cost}) / COUNT(CASE WHEN ${deliveryLogs.status} = 'delivered' THEN 1 END)`
    })
    .from(deliveryLogs)
    .where(and(...conditions))
    .groupBy(timeFormat)
    .orderBy(timeFormat);
  }

  private async generateCostOptimizationRecommendations(channelCosts: any[], bangladeshProviders: any[]): Promise<any[]> {
    const recommendations = [];

    // Analyze channel efficiency
    if (channelCosts.length > 1) {
      const sortedByEfficiency = channelCosts.sort((a, b) => a.costEfficiency - b.costEfficiency);
      const mostEfficient = sortedByEfficiency[0];
      const leastEfficient = sortedByEfficiency[sortedByEfficiency.length - 1];

      if (leastEfficient.costEfficiency > mostEfficient.costEfficiency * 1.5) {
        recommendations.push({
          type: 'channel_optimization',
          priority: 'high',
          message: `Consider shifting more traffic from ${leastEfficient.channel} to ${mostEfficient.channel} for better cost efficiency`,
          potentialSaving: ((leastEfficient.costEfficiency - mostEfficient.costEfficiency) * leastEfficient.messageCount).toFixed(2)
        });
      }
    }

    // Analyze Bangladesh SMS provider efficiency
    if (bangladeshProviders.length > 1) {
      const bestProvider = bangladeshProviders.reduce((best, current) => 
        (current.avgCostPerSMS < best.avgCostPerSMS && current.deliveryRate > 95) ? current : best
      );

      recommendations.push({
        type: 'provider_optimization',
        priority: 'medium',
        message: `${bestProvider.provider} offers the best cost-performance ratio for SMS in Bangladesh`,
        details: `Cost: ${bestProvider.avgCostPerSMS} BDT, Delivery Rate: ${bestProvider.deliveryRate.toFixed(1)}%`
      });
    }

    return recommendations;
  }
}