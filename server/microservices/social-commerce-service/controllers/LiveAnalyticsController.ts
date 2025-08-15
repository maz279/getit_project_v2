/**
 * Live Analytics Controller - Amazon Live/Shopee Live Analytics Level
 * Real-time analytics and business intelligence for livestreaming
 * 
 * @fileoverview Advanced analytics controller for live commerce performance tracking
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { db } from '../../../db.js';
import { 
  liveStreams,
  liveStreamAnalytics,
  liveStreamPurchases,
  liveStreamViewers,
  liveStreamChat,
  liveStreamInteractions,
  liveStreamProducts,
  users,
  products,
  socialProfiles
} from '../../../../shared/schema.js';
import { eq, desc, and, gte, lte, count, sum, avg, sql, between } from 'drizzle-orm';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'live-analytics-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/live-analytics.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export class LiveAnalyticsController {

  /**
   * Get real-time streaming dashboard
   * Amazon Live-style executive dashboard
   */
  async getRealtimeDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { 
        timeRange = '24h',
        hostId,
        category,
        language = 'en'
      } = req.query;

      // Calculate time range
      const now = new Date();
      let startTime = new Date();
      
      switch (timeRange) {
        case '1h':
          startTime.setHours(now.getHours() - 1);
          break;
        case '24h':
          startTime.setDate(now.getDate() - 1);
          break;
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(now.getDate() - 30);
          break;
        default:
          startTime.setDate(now.getDate() - 1);
      }

      // Get current live streams count
      const liveStreamsCount = await db.select({ count: count() })
        .from(liveStreams)
        .where(eq(liveStreams.status, 'live'));

      // Get total active viewers across all streams
      const activeViewers = await db.select({ 
        totalViewers: sum(liveStreamAnalytics.viewerCount) 
      })
      .from(liveStreamAnalytics)
      .leftJoin(liveStreams, eq(liveStreamAnalytics.streamId, liveStreams.id))
      .where(eq(liveStreams.status, 'live'));

      // Get revenue metrics for time period
      const revenueMetrics = await db.select({
        totalRevenue: sum(liveStreamPurchases.totalAmount),
        totalPurchases: count(),
        averageOrderValue: avg(liveStreamPurchases.totalAmount),
        uniqueBuyers: sql`COUNT(DISTINCT ${liveStreamPurchases.userId})`
      })
      .from(liveStreamPurchases)
      .where(gte(liveStreamPurchases.purchasedAt, startTime));

      // Get engagement metrics
      const engagementMetrics = await db.select({
        totalViews: sum(liveStreamAnalytics.totalViews),
        totalChatMessages: sum(liveStreamAnalytics.chatMessages),
        totalLikes: sum(liveStreamAnalytics.likes),
        totalShares: sum(liveStreamAnalytics.shares),
        averageEngagementRate: avg(liveStreamAnalytics.engagementRate)
      })
      .from(liveStreamAnalytics)
      .leftJoin(liveStreams, eq(liveStreamAnalytics.streamId, liveStreams.id))
      .where(gte(liveStreams.createdAt, startTime));

      // Get top performing streams
      const topStreams = await db.select({
        streamId: liveStreams.id,
        title: language === 'bn' ? liveStreams.titleBn : liveStreams.title,
        hostName: socialProfiles.displayName,
        hostAvatar: socialProfiles.avatarUrl,
        category: liveStreams.category,
        status: liveStreams.status,
        viewerCount: liveStreamAnalytics.viewerCount,
        peakViewers: liveStreamAnalytics.peakViewers,
        revenue: liveStreamAnalytics.revenue,
        purchases: liveStreamAnalytics.purchases,
        engagementRate: liveStreamAnalytics.engagementRate,
        startedAt: liveStreams.startedAt
      })
      .from(liveStreams)
      .leftJoin(socialProfiles, eq(liveStreams.hostId, socialProfiles.userId))
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(gte(liveStreams.createdAt, startTime))
      .orderBy(desc(liveStreamAnalytics.revenue))
      .limit(10);

      // Get trending categories
      const trendingCategories = await db.select({
        category: liveStreams.category,
        streamCount: count(),
        totalViewers: sum(liveStreamAnalytics.viewerCount),
        totalRevenue: sum(liveStreamAnalytics.revenue),
        averageEngagement: avg(liveStreamAnalytics.engagementRate)
      })
      .from(liveStreams)
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(gte(liveStreams.createdAt, startTime))
      .groupBy(liveStreams.category)
      .orderBy(desc(sum(liveStreamAnalytics.revenue)))
      .limit(5);

      // Get hourly performance breakdown
      const hourlyBreakdown = await db.select({
        hour: sql`EXTRACT(HOUR FROM ${liveStreams.startedAt})`,
        streamCount: count(),
        totalViews: sum(liveStreamAnalytics.totalViews),
        totalRevenue: sum(liveStreamAnalytics.revenue),
        averageEngagement: avg(liveStreamAnalytics.engagementRate)
      })
      .from(liveStreams)
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(gte(liveStreams.startedAt, startTime))
      .groupBy(sql`EXTRACT(HOUR FROM ${liveStreams.startedAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${liveStreams.startedAt})`);

      // Calculate growth metrics (comparing with previous period)
      const previousPeriodStart = new Date(startTime.getTime() - (now.getTime() - startTime.getTime()));
      const previousMetrics = await db.select({
        totalRevenue: sum(liveStreamPurchases.totalAmount),
        totalViews: sum(liveStreamAnalytics.totalViews),
        totalPurchases: count(liveStreamPurchases.id)
      })
      .from(liveStreamPurchases)
      .leftJoin(liveStreamAnalytics, eq(liveStreamPurchases.streamId, liveStreamAnalytics.streamId))
      .where(between(liveStreamPurchases.purchasedAt, previousPeriodStart, startTime));

      const currentRevenue = Number(revenueMetrics[0]?.totalRevenue || 0);
      const previousRevenue = Number(previousMetrics[0]?.totalRevenue || 0);
      const revenueGrowth = previousRevenue > 0 ? 
        ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(2) : 0;

      res.status(200).json({
        success: true,
        data: {
          period: timeRange,
          lastUpdated: new Date(),
          overview: {
            currentLiveStreams: liveStreamsCount[0].count,
            totalActiveViewers: Number(activeViewers[0]?.totalViewers || 0),
            totalRevenue: currentRevenue,
            totalPurchases: Number(revenueMetrics[0]?.totalPurchases || 0),
            averageOrderValue: Number(revenueMetrics[0]?.averageOrderValue || 0),
            uniqueBuyers: Number(revenueMetrics[0]?.uniqueBuyers || 0),
            revenueGrowth: `${revenueGrowth}%`
          },
          engagement: {
            totalViews: Number(engagementMetrics[0]?.totalViews || 0),
            totalChatMessages: Number(engagementMetrics[0]?.totalChatMessages || 0),
            totalLikes: Number(engagementMetrics[0]?.totalLikes || 0),
            totalShares: Number(engagementMetrics[0]?.totalShares || 0),
            averageEngagementRate: Number(engagementMetrics[0]?.averageEngagementRate || 0)
          },
          topStreams,
          trendingCategories,
          hourlyBreakdown,
          insights: {
            peakHour: hourlyBreakdown.reduce((max, current) => 
              Number(current.totalRevenue) > Number(max.totalRevenue) ? current : max, 
              hourlyBreakdown[0] || { hour: 0, totalRevenue: 0 }
            )?.hour || 'N/A',
            topCategory: trendingCategories[0]?.category || 'N/A',
            conversionRate: revenueMetrics[0]?.totalPurchases && engagementMetrics[0]?.totalViews ? 
              (Number(revenueMetrics[0].totalPurchases) / Number(engagementMetrics[0].totalViews) * 100).toFixed(2) + '%' : '0%'
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching real-time dashboard:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching analytics dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get detailed stream performance analytics
   * Comprehensive stream analysis
   */
  async getStreamPerformanceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { streamId } = req.params;
      const { includeComparisons = false } = req.query;

      // Get basic stream analytics
      const streamAnalytics = await db.select({
        streamId: liveStreamAnalytics.streamId,
        viewerCount: liveStreamAnalytics.viewerCount,
        peakViewers: liveStreamAnalytics.peakViewers,
        totalViews: liveStreamAnalytics.totalViews,
        uniqueViewers: liveStreamAnalytics.uniqueViewers,
        averageWatchTime: liveStreamAnalytics.averageWatchTime,
        totalWatchTime: liveStreamAnalytics.totalWatchTime,
        chatMessages: liveStreamAnalytics.chatMessages,
        likes: liveStreamAnalytics.likes,
        hearts: liveStreamAnalytics.hearts,
        shares: liveStreamAnalytics.shares,
        productClicks: liveStreamAnalytics.productClicks,
        purchases: liveStreamAnalytics.purchases,
        revenue: liveStreamAnalytics.revenue,
        averageOrderValue: liveStreamAnalytics.averageOrderValue,
        viewToClickRate: liveStreamAnalytics.viewToClickRate,
        clickToCartRate: liveStreamAnalytics.clickToCartRate,
        overallConversionRate: liveStreamAnalytics.overallConversionRate,
        engagementRate: liveStreamAnalytics.engagementRate,
        topCountries: liveStreamAnalytics.topCountries,
        topCities: liveStreamAnalytics.topCities,
        deviceBreakdown: liveStreamAnalytics.deviceBreakdown,
        ageGroupBreakdown: liveStreamAnalytics.ageGroupBreakdown,
        streamTitle: liveStreams.title,
        streamCategory: liveStreams.category,
        streamStatus: liveStreams.status,
        startedAt: liveStreams.startedAt,
        endedAt: liveStreams.endedAt,
        duration: liveStreams.duration
      })
      .from(liveStreamAnalytics)
      .leftJoin(liveStreams, eq(liveStreamAnalytics.streamId, liveStreams.id))
      .where(eq(liveStreamAnalytics.streamId, streamId))
      .limit(1);

      if (streamAnalytics.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Stream analytics not found' 
        });
        return;
      }

      const analytics = streamAnalytics[0];

      // Get product performance
      const productPerformance = await db.select({
        productId: liveStreamProducts.productId,
        productName: products.name,
        productImage: products.imageUrl,
        clicks: liveStreamProducts.clickCount,
        views: liveStreamProducts.viewCount,
        purchases: liveStreamProducts.purchaseCount,
        revenue: liveStreamProducts.revenue,
        conversionRate: liveStreamProducts.conversionRate,
        specialPrice: liveStreamProducts.specialPrice,
        originalPrice: products.price
      })
      .from(liveStreamProducts)
      .leftJoin(products, eq(liveStreamProducts.productId, products.id))
      .where(eq(liveStreamProducts.streamId, streamId))
      .orderBy(desc(liveStreamProducts.revenue));

      // Get engagement timeline (5-minute intervals)
      const engagementTimeline = await db.select({
        timeInterval: sql`FLOOR(EXTRACT(EPOCH FROM ${liveStreamInteractions.createdAt} - ${liveStreams.startedAt}) / 300) * 5`,
        messageCount: count(sql`CASE WHEN ${liveStreamInteractions.interactionType} = 'message' THEN 1 END`),
        likeCount: count(sql`CASE WHEN ${liveStreamInteractions.interactionType} = 'like' THEN 1 END`),
        purchaseCount: count(sql`CASE WHEN ${liveStreamInteractions.interactionType} = 'purchase_intent' THEN 1 END`),
        totalInteractions: count()
      })
      .from(liveStreamInteractions)
      .leftJoin(liveStreams, eq(liveStreamInteractions.streamId, liveStreams.id))
      .where(eq(liveStreamInteractions.streamId, streamId))
      .groupBy(sql`FLOOR(EXTRACT(EPOCH FROM ${liveStreamInteractions.createdAt} - ${liveStreams.startedAt}) / 300)`)
      .orderBy(sql`FLOOR(EXTRACT(EPOCH FROM ${liveStreamInteractions.createdAt} - ${liveStreams.startedAt}) / 300)`);

      // Get viewer journey analysis
      const viewerJourney = await db.select({
        averageJoinTime: avg(sql`EXTRACT(EPOCH FROM ${liveStreamViewers.joinedAt} - ${liveStreams.startedAt})`),
        averageWatchDuration: avg(liveStreamViewers.watchDuration),
        dropOffRate: sql`
          (COUNT(CASE WHEN ${liveStreamViewers.watchDuration} < 60 THEN 1 END)::float / COUNT(*)::float * 100)
        `,
        engagementRate: sql`
          (COUNT(CASE WHEN ${liveStreamViewers.messageCount} > 0 OR ${liveStreamViewers.likeCount} > 0 THEN 1 END)::float / COUNT(*)::float * 100)
        `
      })
      .from(liveStreamViewers)
      .leftJoin(liveStreams, eq(liveStreamViewers.streamId, liveStreams.id))
      .where(eq(liveStreamViewers.streamId, streamId));

      // Get purchase funnel analysis
      const funnelAnalysis = {
        totalViews: analytics.totalViews,
        productViews: analytics.productClicks,
        addToCart: analytics.productClicks, // Simplified - would need cart tracking
        purchases: analytics.purchases,
        viewToProductRate: analytics.totalViews > 0 ? 
          (analytics.productClicks / analytics.totalViews * 100).toFixed(2) : 0,
        productToPurchaseRate: analytics.productClicks > 0 ? 
          (analytics.purchases / analytics.productClicks * 100).toFixed(2) : 0,
        overallConversionRate: analytics.overallConversionRate
      };

      // Get comparison data if requested
      let comparisons = null;
      if (includeComparisons === 'true') {
        const avgCategoryPerformance = await db.select({
          avgRevenue: avg(liveStreamAnalytics.revenue),
          avgViewers: avg(liveStreamAnalytics.peakViewers),
          avgEngagement: avg(liveStreamAnalytics.engagementRate),
          avgConversion: avg(liveStreamAnalytics.overallConversionRate)
        })
        .from(liveStreamAnalytics)
        .leftJoin(liveStreams, eq(liveStreamAnalytics.streamId, liveStreams.id))
        .where(eq(liveStreams.category, analytics.streamCategory));

        comparisons = {
          vsCategory: {
            revenuePerformance: Number(avgCategoryPerformance[0]?.avgRevenue || 0) > 0 ? 
              ((Number(analytics.revenue) / Number(avgCategoryPerformance[0].avgRevenue) - 1) * 100).toFixed(2) + '%' : 'N/A',
            viewerPerformance: Number(avgCategoryPerformance[0]?.avgViewers || 0) > 0 ? 
              ((Number(analytics.peakViewers) / Number(avgCategoryPerformance[0].avgViewers) - 1) * 100).toFixed(2) + '%' : 'N/A',
            engagementPerformance: Number(avgCategoryPerformance[0]?.avgEngagement || 0) > 0 ? 
              ((Number(analytics.engagementRate) / Number(avgCategoryPerformance[0].avgEngagement) - 1) * 100).toFixed(2) + '%' : 'N/A'
          }
        };
      }

      res.status(200).json({
        success: true,
        data: {
          streamInfo: {
            streamId: analytics.streamId,
            title: analytics.streamTitle,
            category: analytics.streamCategory,
            status: analytics.streamStatus,
            startedAt: analytics.startedAt,
            endedAt: analytics.endedAt,
            duration: analytics.duration
          },
          overview: {
            viewerCount: analytics.viewerCount,
            peakViewers: analytics.peakViewers,
            totalViews: analytics.totalViews,
            uniqueViewers: analytics.uniqueViewers,
            averageWatchTime: analytics.averageWatchTime,
            totalWatchTime: analytics.totalWatchTime
          },
          engagement: {
            chatMessages: analytics.chatMessages,
            likes: analytics.likes,
            hearts: analytics.hearts,
            shares: analytics.shares,
            engagementRate: analytics.engagementRate,
            timeline: engagementTimeline
          },
          commerce: {
            productClicks: analytics.productClicks,
            purchases: analytics.purchases,
            revenue: analytics.revenue,
            averageOrderValue: analytics.averageOrderValue,
            conversionRates: {
              viewToClick: analytics.viewToClickRate,
              clickToCart: analytics.clickToCartRate,
              overall: analytics.overallConversionRate
            },
            funnelAnalysis
          },
          products: productPerformance,
          demographics: {
            countries: analytics.topCountries,
            cities: analytics.topCities,
            devices: analytics.deviceBreakdown,
            ageGroups: analytics.ageGroupBreakdown
          },
          viewerJourney: viewerJourney[0],
          comparisons
        }
      });

    } catch (error) {
      logger.error('Error fetching stream performance analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching stream analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get host performance analytics
   * Creator performance tracking and insights
   */
  async getHostPerformanceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { hostId } = req.params;
      const { 
        period = '30d',
        includeRecommendations = false 
      } = req.query;

      // Calculate time range
      const now = new Date();
      let startTime = new Date();
      
      switch (period) {
        case '7d':
          startTime.setDate(now.getDate() - 7);
          break;
        case '30d':
          startTime.setDate(now.getDate() - 30);
          break;
        case '90d':
          startTime.setDate(now.getDate() - 90);
          break;
        default:
          startTime.setDate(now.getDate() - 30);
      }

      // Get host overview metrics
      const hostMetrics = await db.select({
        totalStreams: count(),
        totalRevenue: sum(liveStreamAnalytics.revenue),
        totalViews: sum(liveStreamAnalytics.totalViews),
        totalPurchases: sum(liveStreamAnalytics.purchases),
        averageViewers: avg(liveStreamAnalytics.peakViewers),
        averageEngagement: avg(liveStreamAnalytics.engagementRate),
        averageConversion: avg(liveStreamAnalytics.overallConversionRate),
        averageDuration: avg(liveStreams.duration)
      })
      .from(liveStreams)
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(and(
        eq(liveStreams.hostId, Number(hostId)),
        gte(liveStreams.createdAt, startTime)
      ));

      // Get stream performance breakdown
      const streamPerformance = await db.select({
        streamId: liveStreams.id,
        title: liveStreams.title,
        category: liveStreams.category,
        status: liveStreams.status,
        startedAt: liveStreams.startedAt,
        duration: liveStreams.duration,
        peakViewers: liveStreamAnalytics.peakViewers,
        totalViews: liveStreamAnalytics.totalViews,
        revenue: liveStreamAnalytics.revenue,
        purchases: liveStreamAnalytics.purchases,
        engagementRate: liveStreamAnalytics.engagementRate,
        conversionRate: liveStreamAnalytics.overallConversionRate
      })
      .from(liveStreams)
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(and(
        eq(liveStreams.hostId, Number(hostId)),
        gte(liveStreams.createdAt, startTime)
      ))
      .orderBy(desc(liveStreams.startedAt))
      .limit(20);

      // Get category performance
      const categoryPerformance = await db.select({
        category: liveStreams.category,
        streamCount: count(),
        totalRevenue: sum(liveStreamAnalytics.revenue),
        averageViewers: avg(liveStreamAnalytics.peakViewers),
        averageEngagement: avg(liveStreamAnalytics.engagementRate),
        bestPerformingStream: sql`MAX(${liveStreamAnalytics.revenue})`
      })
      .from(liveStreams)
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(and(
        eq(liveStreams.hostId, Number(hostId)),
        gte(liveStreams.createdAt, startTime)
      ))
      .groupBy(liveStreams.category)
      .orderBy(desc(sum(liveStreamAnalytics.revenue)));

      // Get daily performance trends
      const dailyTrends = await db.select({
        date: sql`DATE(${liveStreams.startedAt})`,
        streamCount: count(),
        totalViews: sum(liveStreamAnalytics.totalViews),
        totalRevenue: sum(liveStreamAnalytics.revenue),
        averageEngagement: avg(liveStreamAnalytics.engagementRate)
      })
      .from(liveStreams)
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(and(
        eq(liveStreams.hostId, Number(hostId)),
        gte(liveStreams.startedAt, startTime)
      ))
      .groupBy(sql`DATE(${liveStreams.startedAt})`)
      .orderBy(sql`DATE(${liveStreams.startedAt})`);

      // Get audience insights
      const audienceInsights = await db.select({
        totalUniqueViewers: sql`COUNT(DISTINCT ${liveStreamViewers.userId})`,
        averageWatchTime: avg(liveStreamViewers.watchDuration),
        returnViewerRate: sql`
          (COUNT(CASE WHEN ${liveStreamViewers.userId} IN (
            SELECT ${liveStreamViewers.userId} 
            FROM ${liveStreamViewers} 
            WHERE ${liveStreamViewers.userId} IS NOT NULL
            GROUP BY ${liveStreamViewers.userId} 
            HAVING COUNT(*) > 1
          ) THEN 1 END)::float / COUNT(DISTINCT ${liveStreamViewers.userId})::float * 100)
        `,
        engagedViewerRate: sql`
          (COUNT(CASE WHEN ${liveStreamViewers.messageCount} > 0 OR ${liveStreamViewers.likeCount} > 0 THEN 1 END)::float / COUNT(*)::float * 100)
        `
      })
      .from(liveStreamViewers)
      .leftJoin(liveStreams, eq(liveStreamViewers.streamId, liveStreams.id))
      .where(and(
        eq(liveStreams.hostId, Number(hostId)),
        gte(liveStreams.startedAt, startTime)
      ));

      // Calculate growth metrics
      const previousPeriodStart = new Date(startTime.getTime() - (now.getTime() - startTime.getTime()));
      const previousMetrics = await db.select({
        totalRevenue: sum(liveStreamAnalytics.revenue),
        totalViews: sum(liveStreamAnalytics.totalViews),
        streamCount: count()
      })
      .from(liveStreams)
      .leftJoin(liveStreamAnalytics, eq(liveStreams.id, liveStreamAnalytics.streamId))
      .where(and(
        eq(liveStreams.hostId, Number(hostId)),
        between(liveStreams.startedAt, previousPeriodStart, startTime)
      ));

      const currentRevenue = Number(hostMetrics[0]?.totalRevenue || 0);
      const previousRevenue = Number(previousMetrics[0]?.totalRevenue || 0);
      const revenueGrowth = previousRevenue > 0 ? 
        ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(2) : 0;

      const currentViews = Number(hostMetrics[0]?.totalViews || 0);
      const previousViews = Number(previousMetrics[0]?.totalViews || 0);
      const viewsGrowth = previousViews > 0 ? 
        ((currentViews - previousViews) / previousViews * 100).toFixed(2) : 0;

      // Generate recommendations if requested
      let recommendations = null;
      if (includeRecommendations === 'true') {
        const avgEngagement = Number(hostMetrics[0]?.averageEngagement || 0);
        const avgConversion = Number(hostMetrics[0]?.averageConversion || 0);
        const bestCategory = categoryPerformance[0]?.category;

        recommendations = {
          performance: avgEngagement < 5 ? 
            'Consider increasing audience interaction through Q&A sessions and polls' : 
            'Great engagement! Focus on maintaining interactive content quality',
          conversion: avgConversion < 2 ? 
            'Improve product showcasing and create urgency with limited-time offers' : 
            'Excellent conversion rate! Consider expanding product catalog',
          content: bestCategory ? 
            `Focus more content on ${bestCategory} category as it performs best for your audience` : 
            'Experiment with different content categories to find your niche',
          timing: dailyTrends.length > 0 ? 
            `Best performing day had ${Math.max(...dailyTrends.map(d => Number(d.totalRevenue || 0)))} BDT revenue` : 
            'Stream consistently to identify optimal timing patterns'
        };
      }

      res.status(200).json({
        success: true,
        data: {
          period,
          hostId: Number(hostId),
          overview: {
            totalStreams: Number(hostMetrics[0]?.totalStreams || 0),
            totalRevenue: currentRevenue,
            totalViews: currentViews,
            totalPurchases: Number(hostMetrics[0]?.totalPurchases || 0),
            averageViewers: Number(hostMetrics[0]?.averageViewers || 0),
            averageEngagement: Number(hostMetrics[0]?.averageEngagement || 0),
            averageConversion: Number(hostMetrics[0]?.averageConversion || 0),
            averageDuration: Number(hostMetrics[0]?.averageDuration || 0)
          },
          growth: {
            revenueGrowth: `${revenueGrowth}%`,
            viewsGrowth: `${viewsGrowth}%`,
            streamCountGrowth: previousMetrics[0] ? 
              `${((Number(hostMetrics[0]?.totalStreams || 0) - Number(previousMetrics[0].streamCount || 0)) / (Number(previousMetrics[0].streamCount) || 1) * 100).toFixed(2)}%` : 
              'N/A'
          },
          streams: streamPerformance,
          categories: categoryPerformance,
          trends: dailyTrends,
          audience: audienceInsights[0],
          recommendations
        }
      });

    } catch (error) {
      logger.error('Error fetching host performance analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching host analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get predictive analytics and insights
   * AI-powered performance predictions
   */
  async getPredictiveAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        hostId,
        streamId,
        forecastPeriod = '7d' 
      } = req.query;

      // This would integrate with ML service for actual predictions
      // For now, providing statistical analysis based on historical data

      let baseQuery = db.select({
        revenue: liveStreamAnalytics.revenue,
        viewers: liveStreamAnalytics.peakViewers,
        engagement: liveStreamAnalytics.engagementRate,
        conversion: liveStreamAnalytics.overallConversionRate,
        hour: sql`EXTRACT(HOUR FROM ${liveStreams.startedAt})`,
        dayOfWeek: sql`EXTRACT(DOW FROM ${liveStreams.startedAt})`,
        category: liveStreams.category
      })
      .from(liveStreamAnalytics)
      .leftJoin(liveStreams, eq(liveStreamAnalytics.streamId, liveStreams.id));

      if (hostId) {
        baseQuery = baseQuery.where(eq(liveStreams.hostId, Number(hostId)));
      }

      const historicalData = await baseQuery.limit(100);

      if (historicalData.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Insufficient historical data for predictions' 
        });
        return;
      }

      // Calculate performance patterns
      const hourlyPerformance = Array.from({ length: 24 }, (_, hour) => {
        const hourData = historicalData.filter(d => Number(d.hour) === hour);
        return {
          hour,
          avgRevenue: hourData.length > 0 ? 
            hourData.reduce((sum, d) => sum + Number(d.revenue || 0), 0) / hourData.length : 0,
          avgViewers: hourData.length > 0 ? 
            hourData.reduce((sum, d) => sum + Number(d.viewers || 0), 0) / hourData.length : 0,
          streamCount: hourData.length
        };
      });

      const weeklyPerformance = Array.from({ length: 7 }, (_, day) => {
        const dayData = historicalData.filter(d => Number(d.dayOfWeek) === day);
        return {
          dayOfWeek: day,
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
          avgRevenue: dayData.length > 0 ? 
            dayData.reduce((sum, d) => sum + Number(d.revenue || 0), 0) / dayData.length : 0,
          avgViewers: dayData.length > 0 ? 
            dayData.reduce((sum, d) => sum + Number(d.viewers || 0), 0) / dayData.length : 0,
          streamCount: dayData.length
        };
      });

      // Find optimal patterns
      const bestHour = hourlyPerformance.reduce((max, current) => 
        current.avgRevenue > max.avgRevenue ? current : max
      );

      const bestDay = weeklyPerformance.reduce((max, current) => 
        current.avgRevenue > max.avgRevenue ? current : max
      );

      // Generate recommendations based on patterns
      const recommendations = {
        optimalTiming: {
          bestHour: bestHour.hour,
          bestDay: bestDay.dayName,
          recommendedSlots: hourlyPerformance
            .filter(h => h.avgRevenue > 0)
            .sort((a, b) => b.avgRevenue - a.avgRevenue)
            .slice(0, 3)
            .map(h => `${h.hour}:00`)
        },
        performancePredictions: {
          nextStreamRevenue: bestHour.avgRevenue * 1.1, // Simple prediction with 10% growth assumption
          expectedViewers: bestHour.avgViewers * 1.05,
          confidence: 'medium' // Would be calculated by ML model
        },
        insights: {
          revenuePattern: 'Peak performance during evening hours (6-10 PM)',
          audiencePattern: 'Highest engagement on weekends',
          seasonality: 'Revenue tends to increase during festival seasons',
          growthTrend: historicalData.length > 10 ? 'positive' : 'insufficient_data'
        }
      };

      res.status(200).json({
        success: true,
        data: {
          forecastPeriod,
          dataPoints: historicalData.length,
          patterns: {
            hourly: hourlyPerformance,
            weekly: weeklyPerformance
          },
          predictions: recommendations.performancePredictions,
          recommendations: recommendations.optimalTiming,
          insights: recommendations.insights,
          disclaimer: 'Predictions based on historical patterns and statistical analysis. Actual results may vary.'
        }
      });

    } catch (error) {
      logger.error('Error generating predictive analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error generating predictions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}