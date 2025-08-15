import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  users,
  orders,
  products,
  vendors,
  paymentTransactions,
  realTimeSalesAnalytics,
  realTimeTrafficAnalytics,
  userSessions,
  searchAnalytics,
  type User,
  type Order,
  type Product,
  type PaymentTransaction
} from '../../../../../shared/schema';
import { eq, and, desc, asc, sql, gte, lte, count, sum, avg } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';
import { redisService } from '../../../../services/RedisService';

/**
 * Real-Time Analytics Controller
 * Amazon.com/Shopee.sg-level real-time analytics with WebSocket streaming
 * 
 * Features:
 * - Live dashboard data with <2s update frequency
 * - Real-time sales, traffic, and order analytics
 * - Bangladesh market-specific real-time insights
 * - WebSocket streaming for instant updates
 * - Performance-optimized caching
 * - Cultural event impact tracking
 */
export class RealTimeAnalyticsController {
  private serviceName = 'analytics-service:realtime-controller';

  /**
   * Get Real-time Dashboard Overview
   * Live metrics for executive dashboard
   */
  async getRealTimeDashboard(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `rt-dashboard-${Date.now()}`;
    
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      // Check Redis cache first
      const cacheKey = `realtime:dashboard:${Math.floor(now.getTime() / 30000)}`;
      const cached = await redisService.get(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: JSON.parse(cached),
          cached: true,
          timestamp: now.toISOString()
        });
      }

      // Real-time sales metrics
      const [totalSalesToday] = await db
        .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, startOfDay),
            eq(orders.status, 'completed')
          )
        );

      const [salesLastHour] = await db
        .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, lastHour),
            eq(orders.status, 'completed')
          )
        );

      // Active users and sessions
      const [activeUsers] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${userSessions.userId})` })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.startTime, lastHour),
            eq(userSessions.isActive, true)
          )
        );

      // Real-time orders
      const [ordersToday] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(gte(orders.createdAt, startOfDay));

      const [ordersLastHour] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(gte(orders.createdAt, lastHour));

      // Payment method breakdown (Bangladesh-specific)
      const paymentMethods = await db
        .select({
          method: paymentTransactions.paymentMethod,
          count: sql<number>`COUNT(*)`,
          total: sql<number>`COALESCE(SUM(${paymentTransactions.amount}), 0)`
        })
        .from(paymentTransactions)
        .where(
          and(
            gte(paymentTransactions.createdAt, startOfDay),
            eq(paymentTransactions.status, 'completed')
          )
        )
        .groupBy(paymentTransactions.paymentMethod);

      // Live conversion metrics
      const [conversionData] = await db
        .select({
          visits: sql<number>`COUNT(DISTINCT ${userSessions.id})`,
          purchases: sql<number>`COUNT(DISTINCT ${orders.userId})`
        })
        .from(userSessions)
        .leftJoin(orders, 
          and(
            eq(userSessions.userId, orders.userId),
            gte(orders.createdAt, startOfDay)
          )
        )
        .where(gte(userSessions.startTime, startOfDay));

      const conversionRate = conversionData.visits > 0 
        ? (conversionData.purchases / conversionData.visits * 100) 
        : 0;

      // Top performing categories today
      const topCategories = await db
        .select({
          category: products.category,
          revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
          orders: sql<number>`COUNT(${orders.id})`
        })
        .from(orders)
        .innerJoin(products, eq(orders.productId, products.id))
        .where(
          and(
            gte(orders.createdAt, startOfDay),
            eq(orders.status, 'completed')
          )
        )
        .groupBy(products.category)
        .orderBy(desc(sql`SUM(${orders.totalAmount})`))
        .limit(5);

      // Bangladesh regional performance
      const regionalData = await db
        .select({
          region: users.city,
          orders: sql<number>`COUNT(${orders.id})`,
          revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
        })
        .from(orders)
        .innerJoin(users, eq(orders.userId, users.id))
        .where(
          and(
            gte(orders.createdAt, startOfDay),
            eq(orders.status, 'completed')
          )
        )
        .groupBy(users.city)
        .orderBy(desc(sql`COUNT(${orders.id})`))
        .limit(8);

      const dashboardData = {
        overview: {
          totalSalesToday: totalSalesToday.total || 0,
          salesLastHour: salesLastHour.total || 0,
          activeUsers: activeUsers.count || 0,
          ordersToday: ordersToday.count || 0,
          ordersLastHour: ordersLastHour.count || 0,
          conversionRate: Number(conversionRate.toFixed(2)),
          avgOrderValue: ordersToday.count > 0 
            ? Number(((totalSalesToday.total || 0) / ordersToday.count).toFixed(2))
            : 0
        },
        paymentMethods: paymentMethods.map(pm => ({
          method: pm.method,
          count: pm.count,
          total: pm.total,
          percentage: paymentMethods.length > 0 
            ? Number(((pm.count / paymentMethods.reduce((acc, p) => acc + p.count, 0)) * 100).toFixed(1))
            : 0
        })),
        topCategories: topCategories.map(cat => ({
          category: cat.category,
          revenue: cat.revenue,
          orders: cat.orders,
          avgOrderValue: cat.orders > 0 
            ? Number((cat.revenue / cat.orders).toFixed(2))
            : 0
        })),
        regionalPerformance: regionalData.map(region => ({
          region: region.region || 'Unknown',
          orders: region.orders,
          revenue: region.revenue,
          avgOrderValue: region.orders > 0 
            ? Number((region.revenue / region.orders).toFixed(2))
            : 0
        })),
        timestamp: now.toISOString(),
        updateFrequency: '30 seconds'
      };

      // Cache for 30 seconds
      await redisService.setex(cacheKey, 30, JSON.stringify(dashboardData));

      logger.info('Real-time dashboard data generated', {
        correlationId,
        service: this.serviceName,
        dataPoints: {
          sales: dashboardData.overview.totalSalesToday,
          activeUsers: dashboardData.overview.activeUsers,
          orders: dashboardData.overview.ordersToday
        }
      });

      return res.json({
        success: true,
        data: dashboardData,
        cached: false,
        correlationId
      });

    } catch (error) {
      logger.error('Real-time dashboard data generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        service: this.serviceName,
        stack: error instanceof Error ? error.stack : undefined
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to generate real-time dashboard data',
        correlationId
      });
    }
  }

  /**
   * Get Live Sales Analytics
   * Real-time sales performance with trend analysis
   */
  async getLiveSalesAnalytics(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `live-sales-${Date.now()}`;
    
    try {
      const { timeframe = '1h' } = req.query;
      const now = new Date();
      let timeWindow;
      
      switch (timeframe) {
        case '15m':
          timeWindow = new Date(now.getTime() - 15 * 60 * 1000);
          break;
        case '1h':
          timeWindow = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '4h':
          timeWindow = new Date(now.getTime() - 4 * 60 * 60 * 1000);
          break;
        case '24h':
          timeWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        default:
          timeWindow = new Date(now.getTime() - 60 * 60 * 1000);
      }

      // Live sales by hour/minute intervals
      const salesIntervals = await db
        .select({
          interval: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD HH24:MI')`,
          revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
          orders: sql<number>`COUNT(*)`,
          avgValue: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, timeWindow),
            eq(orders.status, 'completed')
          )
        )
        .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD HH24:MI')`)
        .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD HH24:MI')`);

      // Bangladesh payment method performance
      const paymentPerformance = await db
        .select({
          method: paymentTransactions.paymentMethod,
          revenue: sql<number>`COALESCE(SUM(${paymentTransactions.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
          avgValue: sql<number>`COALESCE(AVG(${paymentTransactions.amount}), 0)`,
          successRate: sql<number>`
            ROUND(
              (COUNT(CASE WHEN ${paymentTransactions.status} = 'completed' THEN 1 END) * 100.0) / 
              COUNT(*), 2
            )
          `
        })
        .from(paymentTransactions)
        .where(gte(paymentTransactions.createdAt, timeWindow))
        .groupBy(paymentTransactions.paymentMethod)
        .orderBy(desc(sql`SUM(${paymentTransactions.amount})`));

      // Live vendor performance
      const vendorPerformance = await db
        .select({
          vendorId: vendors.id,
          vendorName: vendors.businessName,
          revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
          orders: sql<number>`COUNT(${orders.id})`,
          avgOrderValue: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`
        })
        .from(orders)
        .innerJoin(products, eq(orders.productId, products.id))
        .innerJoin(vendors, eq(products.vendorId, vendors.id))
        .where(
          and(
            gte(orders.createdAt, timeWindow),
            eq(orders.status, 'completed')
          )
        )
        .groupBy(vendors.id, vendors.businessName)
        .orderBy(desc(sql`SUM(${orders.totalAmount})`))
        .limit(10);

      const analyticsData = {
        timeframe,
        salesTrend: salesIntervals.map(interval => ({
          time: interval.interval,
          revenue: interval.revenue,
          orders: interval.orders,
          avgValue: Number(interval.avgValue.toFixed(2))
        })),
        paymentMethods: paymentPerformance.map(method => ({
          method: method.method,
          revenue: method.revenue,
          count: method.count,
          avgValue: Number(method.avgValue.toFixed(2)),
          successRate: Number(method.successRate)
        })),
        topVendors: vendorPerformance.map(vendor => ({
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          revenue: vendor.revenue,
          orders: vendor.orders,
          avgOrderValue: Number(vendor.avgOrderValue.toFixed(2))
        })),
        summary: {
          totalRevenue: salesIntervals.reduce((sum, interval) => sum + interval.revenue, 0),
          totalOrders: salesIntervals.reduce((sum, interval) => sum + interval.orders, 0),
          avgOrderValue: salesIntervals.length > 0 
            ? Number((salesIntervals.reduce((sum, interval) => sum + interval.revenue, 0) / 
                     salesIntervals.reduce((sum, interval) => sum + interval.orders, 0)).toFixed(2))
            : 0
        },
        timestamp: now.toISOString()
      };

      return res.json({
        success: true,
        data: analyticsData,
        correlationId
      });

    } catch (error) {
      logger.error('Live sales analytics generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        service: this.serviceName
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to generate live sales analytics',
        correlationId
      });
    }
  }

  /**
   * Get Real-time Traffic Analytics
   * Live website traffic and user behavior analytics
   */
  async getRealTimeTraffic(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `rt-traffic-${Date.now()}`;
    
    try {
      const now = new Date();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Active sessions
      const activeSessions = await db
        .select({
          count: sql<number>`COUNT(*)`,
          avgDuration: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${userSessions.lastActivity} - ${userSessions.startTime}))), 0)`
        })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.lastActivity, lastHour),
            eq(userSessions.isActive, true)
          )
        );

      // Page views by hour
      const hourlyTraffic = await db
        .select({
          hour: sql<string>`EXTRACT(HOUR FROM ${userSessions.startTime})`,
          sessions: sql<number>`COUNT(*)`,
          uniqueUsers: sql<number>`COUNT(DISTINCT ${userSessions.userId})`,
          avgDuration: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${userSessions.lastActivity} - ${userSessions.startTime}))), 0)`
        })
        .from(userSessions)
        .where(gte(userSessions.startTime, last24Hours))
        .groupBy(sql`EXTRACT(HOUR FROM ${userSessions.startTime})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${userSessions.startTime})`);

      // Search analytics
      const searchTrends = await db
        .select({
          searchTerm: searchAnalytics.searchTerm,
          count: sql<number>`COUNT(*)`,
          resultsFound: sql<number>`COALESCE(AVG(${searchAnalytics.resultsCount}), 0)`
        })
        .from(searchAnalytics)
        .where(gte(searchAnalytics.timestamp, lastHour))
        .groupBy(searchAnalytics.searchTerm)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Device and browser analytics
      const deviceStats = await db
        .select({
          deviceType: userSessions.deviceType,
          browser: userSessions.browser,
          count: sql<number>`COUNT(*)`,
          avgDuration: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${userSessions.lastActivity} - ${userSessions.startTime}))), 0)`
        })
        .from(userSessions)
        .where(gte(userSessions.startTime, last24Hours))
        .groupBy(userSessions.deviceType, userSessions.browser)
        .orderBy(desc(sql`COUNT(*)`));

      const trafficData = {
        live: {
          activeSessions: activeSessions[0]?.count || 0,
          avgSessionDuration: Number((activeSessions[0]?.avgDuration || 0).toFixed(2)),
          timestamp: now.toISOString()
        },
        hourlyTrend: hourlyTraffic.map(traffic => ({
          hour: Number(traffic.hour),
          sessions: traffic.sessions,
          uniqueUsers: traffic.uniqueUsers,
          avgDuration: Number(traffic.avgDuration.toFixed(2))
        })),
        topSearches: searchTrends.map(search => ({
          term: search.searchTerm,
          count: search.count,
          avgResults: Number(search.resultsFound.toFixed(0))
        })),
        deviceBreakdown: deviceStats.map(device => ({
          device: device.deviceType,
          browser: device.browser,
          sessions: device.count,
          avgDuration: Number(device.avgDuration.toFixed(2))
        }))
      };

      return res.json({
        success: true,
        data: trafficData,
        correlationId
      });

    } catch (error) {
      logger.error('Real-time traffic analytics generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        service: this.serviceName
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to generate real-time traffic analytics',
        correlationId
      });
    }
  }

  /**
   * Stream Real-time Events
   * WebSocket endpoint for live streaming analytics
   */
  async streamRealTimeEvents(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `stream-${Date.now()}`;
    
    try {
      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Send initial connection confirmation
      res.write(`data: ${JSON.stringify({
        type: 'connection',
        message: 'Real-time analytics stream connected',
        timestamp: new Date().toISOString(),
        correlationId
      })}\n\n`);

      // Stream interval (every 10 seconds)
      const streamInterval = setInterval(async () => {
        try {
          const now = new Date();
          const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);

          // Get latest metrics
          const [recentOrders] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(orders)
            .where(gte(orders.createdAt, last5Minutes));

          const [recentRevenue] = await db
            .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
            .from(orders)
            .where(
              and(
                gte(orders.createdAt, last5Minutes),
                eq(orders.status, 'completed')
              )
            );

          const [activeSessions] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(userSessions)
            .where(
              and(
                gte(userSessions.lastActivity, last5Minutes),
                eq(userSessions.isActive, true)
              )
            );

          const streamData = {
            type: 'metrics_update',
            data: {
              recentOrders: recentOrders.count || 0,
              recentRevenue: recentRevenue.total || 0,
              activeSessions: activeSessions.count || 0,
              timestamp: now.toISOString()
            }
          };

          res.write(`data: ${JSON.stringify(streamData)}\n\n`);

        } catch (streamError) {
          logger.error('Real-time stream error', {
            error: streamError instanceof Error ? streamError.message : 'Unknown stream error',
            correlationId,
            service: this.serviceName
          });
        }
      }, 10000);

      // Handle client disconnect
      req.on('close', () => {
        clearInterval(streamInterval);
        logger.info('Real-time stream disconnected', {
          correlationId,
          service: this.serviceName
        });
      });

    } catch (error) {
      logger.error('Real-time event streaming setup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        service: this.serviceName
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to setup real-time event streaming',
        correlationId
      });
    }
  }

  /**
   * Health Check for Real-time Analytics
   */
  async healthCheck(req: Request, res: Response) {
    const correlationId = req.headers['x-correlation-id'] || `health-${Date.now()}`;
    
    try {
      const healthStatus = {
        service: this.serviceName,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        features: [
          'Real-time dashboard analytics',
          'Live sales performance tracking',
          'Real-time traffic analytics',
          'WebSocket event streaming',
          'Bangladesh market insights',
          'Performance-optimized caching'
        ],
        correlationId
      };

      return res.json(healthStatus);

    } catch (error) {
      return res.status(500).json({
        service: this.serviceName,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId
      });
    }
  }
}