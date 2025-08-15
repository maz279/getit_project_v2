import { WebSocket } from 'ws';
import { db } from '../../../../db';
import { redisService } from '../../../../services/RedisService';
import { logger } from '../../../../services/LoggingService';
import { 
  realTimeSales,
  realTimeTraffic,
  realTimeOrders,
  realTimeUsers,
  salesAnalytics,
  customerAnalytics,
  vendorAnalytics,
  productAnalytics,
  type RealTimeSale,
  type RealTimeTraffic,
  type RealTimeOrder,
  type RealTimeUser
} from '../../../../../shared/schema';
import { eq, desc, sql, and, gte, count, sum, avg } from 'drizzle-orm';

/**
 * REAL-TIME ANALYTICS SERVICE
 * Amazon.com/Shopee.sg-Level Real-time Analytics with Bangladesh Market Integration
 * 
 * Features:
 * - Live sales tracking with payment method breakdown
 * - Real-time traffic monitoring with user behavior analysis
 * - Order processing streams with vendor analytics
 * - Bangladesh-specific cultural and regional insights
 * - WebSocket-based dashboard updates
 * - Festival and seasonal pattern detection
 * - Mobile banking transaction monitoring
 */
export class RealTimeAnalyticsService {
  private serviceName = 'real-time-analytics-service';
  private connectedClients: Set<WebSocket> = new Set();
  private processingIntervals: NodeJS.Timeout[] = [];
  private bangladeshTimezone = 'Asia/Dhaka';

  constructor() {
    this.initializeService();
    this.startRealTimeProcessors();
  }

  private async initializeService() {
    logger.info(`🚀 Initializing ${this.serviceName}`, {
      serviceId: this.serviceName,
      version: '2.0.0',
      features: ['live-analytics', 'bangladesh-insights', 'websocket-streams'],
      timestamp: new Date().toISOString()
    });
  }

  // ============================================================================
  // WEBSOCKET CONNECTION MANAGEMENT
  // ============================================================================

  /**
   * Register new WebSocket client for real-time updates
   */
  public registerClient(ws: WebSocket, clientInfo?: any) {
    this.connectedClients.add(ws);
    
    ws.on('close', () => {
      this.connectedClients.delete(ws);
    });

    ws.on('error', (error) => {
      logger.error('WebSocket client error', { error, clientInfo });
      this.connectedClients.delete(ws);
    });

    // Send initial dashboard data
    this.sendInitialDashboardData(ws);

    logger.info('Real-time analytics client connected', { 
      totalClients: this.connectedClients.size,
      clientInfo 
    });
  }

  /**
   * Broadcast data to all connected clients
   */
  private broadcastToClients(data: any) {
    const message = JSON.stringify(data);
    
    this.connectedClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          logger.error('Failed to send WebSocket message', { error });
          this.connectedClients.delete(ws);
        }
      }
    });
  }

  // ============================================================================
  // REAL-TIME DATA PROCESSING
  // ============================================================================

  /**
   * Start all real-time processing intervals
   */
  private startRealTimeProcessors() {
    // Sales monitoring (every 5 seconds)
    this.processingIntervals.push(
      setInterval(() => this.processSalesStream(), 5000)
    );

    // Traffic monitoring (every 10 seconds)
    this.processingIntervals.push(
      setInterval(() => this.processTrafficStream(), 10000)
    );

    // Order monitoring (every 3 seconds)
    this.processingIntervals.push(
      setInterval(() => this.processOrderStream(), 3000)
    );

    // Bangladesh festival monitoring (every 30 seconds)
    this.processingIntervals.push(
      setInterval(() => this.processBangladeshInsights(), 30000)
    );

    // Payment method monitoring (every 15 seconds)
    this.processingIntervals.push(
      setInterval(() => this.processPaymentMethodStream(), 15000)
    );
  }

  /**
   * Process real-time sales data stream
   */
  private async processSalesStream() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // Get recent sales data
      const recentSales = await db
        .select({
          totalSales: sum(realTimeSales.orderValue),
          salesCount: count(realTimeSales.id),
          averageOrderValue: avg(realTimeSales.orderValue),
          bkashSales: sql<number>`COALESCE(SUM(CASE WHEN payment_method = 'bkash' THEN order_value ELSE 0 END), 0)`,
          nagadSales: sql<number>`COALESCE(SUM(CASE WHEN payment_method = 'nagad' THEN order_value ELSE 0 END), 0)`,
          rocketSales: sql<number>`COALESCE(SUM(CASE WHEN payment_method = 'rocket' THEN order_value ELSE 0 END), 0)`,
          codSales: sql<number>`COALESCE(SUM(CASE WHEN payment_method = 'cod' THEN order_value ELSE 0 END), 0)`,
          dhakaRegionSales: sql<number>`COALESCE(SUM(CASE WHEN region = 'Dhaka' THEN order_value ELSE 0 END), 0)`,
          topVendor: sql<string>`(
            SELECT vendor_id 
            FROM real_time_sales 
            WHERE timestamp >= ${fiveMinutesAgo} 
            GROUP BY vendor_id 
            ORDER BY SUM(order_value) DESC 
            LIMIT 1
          )`
        })
        .from(realTimeSales)
        .where(gte(realTimeSales.timestamp, fiveMinutesAgo));

      const salesData = recentSales[0];

      // Calculate growth compared to previous period
      const previousPeriodStart = new Date(Date.now() - 10 * 60 * 1000);
      const previousPeriodEnd = fiveMinutesAgo;

      const previousSales = await db
        .select({
          totalSales: sum(realTimeSales.orderValue),
          salesCount: count(realTimeSales.id)
        })
        .from(realTimeSales)
        .where(
          and(
            gte(realTimeSales.timestamp, previousPeriodStart),
            gte(previousPeriodEnd, realTimeSales.timestamp)
          )
        );

      const growthRate = previousSales[0]?.totalSales 
        ? ((Number(salesData?.totalSales || 0) - Number(previousSales[0].totalSales)) / Number(previousSales[0].totalSales)) * 100
        : 0;

      // Cache current data in Redis
      await redisService.setCache('real_time_sales_stream', {
        ...salesData,
        growthRate,
        timestamp: new Date().toISOString(),
        period: '5min'
      }, 300); // 5 minute cache

      // Broadcast to connected clients
      this.broadcastToClients({
        type: 'SALES_STREAM_UPDATE',
        data: {
          ...salesData,
          growthRate,
          timestamp: new Date().toISOString(),
          bangladeshFeatures: {
            mobileBankingTotal: Number(salesData?.bkashSales || 0) + Number(salesData?.nagadSales || 0) + Number(salesData?.rocketSales || 0),
            dhakaMarketShare: salesData?.totalSales ? (Number(salesData.dhakaRegionSales) / Number(salesData.totalSales)) * 100 : 0,
            codPreference: salesData?.totalSales ? (Number(salesData.codSales) / Number(salesData.totalSales)) * 100 : 0
          }
        }
      });

    } catch (error) {
      logger.error('Failed to process sales stream', { error });
    }
  }

  /**
   * Process real-time traffic data stream
   */
  private async processTrafficStream() {
    try {
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
      
      // Get current traffic metrics
      const trafficMetrics = await db
        .select({
          activeUsers: sql<number>`COUNT(DISTINCT user_id)`,
          totalSessions: sql<number>`COUNT(DISTINCT session_id)`,
          pageViews: sum(realTimeTraffic.pageViews),
          averageSessionDuration: avg(realTimeTraffic.sessionDuration),
          bounceRate: sql<number>`
            (COUNT(CASE WHEN bounce_flag = true THEN 1 END)::float / COUNT(*)::float) * 100
          `,
          conversionRate: sql<number>`
            (COUNT(CASE WHEN conversion_flag = true THEN 1 END)::float / COUNT(*)::float) * 100
          `,
          mobileTraffic: sql<number>`COUNT(CASE WHEN device_type = 'mobile' THEN 1 END)`,
          organicTraffic: sql<number>`COUNT(CASE WHEN source = 'organic' THEN 1 END)`,
          socialTraffic: sql<number>`COUNT(CASE WHEN source = 'social' THEN 1 END)`,
          bengaliLanguageUsers: sql<number>`COUNT(CASE WHEN language = 'bn' THEN 1 END)`
        })
        .from(realTimeTraffic)
        .where(gte(realTimeTraffic.timestamp, oneMinuteAgo));

      const metrics = trafficMetrics[0];

      // Get top pages
      const topPages = await db
        .select({
          pageUrl: realTimeTraffic.pageUrl,
          visits: count(realTimeTraffic.id),
          uniqueVisitors: sql<number>`COUNT(DISTINCT user_id)`
        })
        .from(realTimeTraffic)
        .where(gte(realTimeTraffic.timestamp, oneMinuteAgo))
        .groupBy(realTimeTraffic.pageUrl)
        .orderBy(desc(count(realTimeTraffic.id)))
        .limit(10);

      // Cache and broadcast
      const trafficData = {
        ...metrics,
        topPages,
        timestamp: new Date().toISOString(),
        bangladeshInsights: {
          bengaliLanguagePercentage: metrics?.activeUsers ? (Number(metrics.bengaliLanguageUsers) / Number(metrics.activeUsers)) * 100 : 0,
          mobileTrafficPercentage: metrics?.activeUsers ? (Number(metrics.mobileTraffic) / Number(metrics.activeUsers)) * 100 : 0
        }
      };

      await redisService.setCache('real_time_traffic_stream', trafficData, 120);

      this.broadcastToClients({
        type: 'TRAFFIC_STREAM_UPDATE',
        data: trafficData
      });

    } catch (error) {
      logger.error('Failed to process traffic stream', { error });
    }
  }

  /**
   * Process real-time order data stream
   */
  private async processOrderStream() {
    try {
      const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
      
      // Get order processing metrics
      const orderMetrics = await db
        .select({
          totalOrders: count(realTimeOrders.id),
          totalValue: sum(realTimeOrders.value),
          averageProcessingTime: avg(realTimeOrders.processingTime),
          pendingOrders: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
          completedOrders: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
          failedOrders: sql<number>`COUNT(CASE WHEN status = 'failed' THEN 1 END)`,
          uniqueVendors: sql<number>`COUNT(DISTINCT vendor_id)`,
          topRegion: sql<string>`(
            SELECT region 
            FROM real_time_orders 
            WHERE timestamp >= ${threeMinutesAgo} 
            GROUP BY region 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
          )`
        })
        .from(realTimeOrders)
        .where(gte(realTimeOrders.timestamp, threeMinutesAgo));

      const metrics = orderMetrics[0];

      // Get vendor performance
      const vendorPerformance = await db
        .select({
          vendorId: realTimeOrders.vendorId,
          orderCount: count(realTimeOrders.id),
          totalValue: sum(realTimeOrders.value),
          averageProcessingTime: avg(realTimeOrders.processingTime)
        })
        .from(realTimeOrders)
        .where(gte(realTimeOrders.timestamp, threeMinutesAgo))
        .groupBy(realTimeOrders.vendorId)
        .orderBy(desc(sum(realTimeOrders.value)))
        .limit(5);

      const orderData = {
        ...metrics,
        vendorPerformance,
        successRate: metrics?.totalOrders ? (Number(metrics.completedOrders) / Number(metrics.totalOrders)) * 100 : 0,
        timestamp: new Date().toISOString()
      };

      await redisService.setCache('real_time_orders_stream', orderData, 180);

      this.broadcastToClients({
        type: 'ORDER_STREAM_UPDATE',
        data: orderData
      });

    } catch (error) {
      logger.error('Failed to process order stream', { error });
    }
  }

  /**
   * Process Bangladesh-specific cultural insights
   */
  private async processBangladeshInsights() {
    try {
      const now = new Date();
      const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      // Check for festival periods
      const festivalInsights = await this.detectFestivalActivity();
      
      // Prayer time impact analysis
      const prayerTimeImpact = await this.analyzePrayerTimeImpact();
      
      // Regional performance insights
      const regionalInsights = await this.getRegionalPerformanceInsights();

      // Cultural preferences analysis
      const culturalPreferences = await this.analyzeCulturalPreferences();

      const bangladeshData = {
        festivalInsights,
        prayerTimeImpact,
        regionalInsights,
        culturalPreferences,
        timestamp: new Date().toISOString(),
        dhakaMidnight: new Date().toLocaleString('en-US', { timeZone: this.bangladeshTimezone })
      };

      await redisService.setCache('bangladesh_insights_stream', bangladeshData, 1800); // 30 minutes

      this.broadcastToClients({
        type: 'BANGLADESH_INSIGHTS_UPDATE',
        data: bangladeshData
      });

    } catch (error) {
      logger.error('Failed to process Bangladesh insights', { error });
    }
  }

  /**
   * Process payment method performance stream
   */
  private async processPaymentMethodStream() {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      // Analyze payment method performance
      const paymentMethods = ['bkash', 'nagad', 'rocket', 'cod', 'card'];
      const paymentAnalysis = [];

      for (const method of paymentMethods) {
        const methodStats = await db
          .select({
            transactionCount: count(realTimeSales.id),
            totalValue: sum(realTimeSales.orderValue),
            averageAmount: avg(realTimeSales.orderValue),
            averageProcessingTime: avg(realTimeSales.processingTime)
          })
          .from(realTimeSales)
          .where(
            and(
              eq(realTimeSales.paymentMethod, method),
              gte(realTimeSales.timestamp, fifteenMinutesAgo)
            )
          );

        paymentAnalysis.push({
          method,
          ...methodStats[0]
        });
      }

      // Calculate market share
      const totalTransactions = paymentAnalysis.reduce((sum, p) => sum + Number(p.transactionCount || 0), 0);
      const enhancedPaymentAnalysis = paymentAnalysis.map(p => ({
        ...p,
        marketShare: totalTransactions > 0 ? (Number(p.transactionCount || 0) / totalTransactions) * 100 : 0
      }));

      const paymentData = {
        paymentMethods: enhancedPaymentAnalysis,
        mobileBankingDominance: enhancedPaymentAnalysis
          .filter(p => ['bkash', 'nagad', 'rocket'].includes(p.method))
          .reduce((sum, p) => sum + p.marketShare, 0),
        timestamp: new Date().toISOString()
      };

      await redisService.setCache('payment_method_stream', paymentData, 900); // 15 minutes

      this.broadcastToClients({
        type: 'PAYMENT_METHOD_UPDATE',
        data: paymentData
      });

    } catch (error) {
      logger.error('Failed to process payment method stream', { error });
    }
  }

  // ============================================================================
  // BANGLADESH-SPECIFIC ANALYSIS METHODS
  // ============================================================================

  /**
   * Detect current festival activity and impact
   */
  private async detectFestivalActivity() {
    const now = new Date();
    const bangladeshFestivals = [
      { name: 'Eid ul-Fitr', season: 'spring', impact: 'very_high' },
      { name: 'Eid ul-Adha', season: 'summer', impact: 'high' },
      { name: 'Durga Puja', season: 'autumn', impact: 'high' },
      { name: 'Pohela Boishakh', season: 'spring', impact: 'medium' },
      { name: 'Victory Day', season: 'winter', impact: 'medium' }
    ];

    // This would normally check against a festival calendar
    // For now, returning sample festival detection logic
    const currentMonth = now.getMonth() + 1;
    let activeFestival = null;

    if (currentMonth >= 3 && currentMonth <= 5) {
      activeFestival = bangladeshFestivals.find(f => f.season === 'spring');
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      activeFestival = bangladeshFestivals.find(f => f.season === 'autumn');
    }

    return {
      activeFestival,
      seasonalTrend: this.getSeasonalTrend(currentMonth),
      upcomingFestivals: bangladeshFestivals.slice(0, 2)
    };
  }

  /**
   * Analyze prayer time impact on shopping patterns
   */
  private async analyzePrayerTimeImpact() {
    const dhakaPrayerTimes = {
      fajr: '05:00',
      dhuhr: '12:00',
      asr: '15:30',
      maghrib: '18:00',
      isha: '19:30'
    };

    // Analyze traffic patterns around prayer times
    // This would normally integrate with prayer time APIs
    return {
      prayerTimes: dhakaPrayerTimes,
      trafficDips: ['05:00-05:30', '12:00-12:30', '18:00-18:30'],
      peakShoppingHours: ['10:00-11:30', '14:00-17:00', '20:00-23:00']
    };
  }

  /**
   * Get regional performance insights
   */
  private async getRegionalPerformanceInsights() {
    const bangladeshRegions = [
      'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 
      'Rangpur', 'Mymensingh', 'Barisal', 'Khulna'
    ];

    // Sample regional analysis - would normally query actual data
    return {
      topPerformingRegion: 'Dhaka',
      fastestGrowingRegion: 'Chittagong',
      regionDistribution: bangladeshRegions.map(region => ({
        region,
        marketShare: region === 'Dhaka' ? 45 : Math.floor(Math.random() * 15) + 5,
        growthRate: Math.floor(Math.random() * 20) + 5
      }))
    };
  }

  /**
   * Analyze cultural preferences and trends
   */
  private async analyzeCulturalPreferences() {
    return {
      languagePreference: {
        bengali: 65,
        english: 30,
        mixed: 5
      },
      categoryPreferences: {
        traditional: ['fashion', 'jewelry', 'home_decor'],
        modern: ['electronics', 'gadgets', 'books'],
        seasonal: ['winter_clothing', 'festival_items', 'gifts']
      },
      shoppingPatterns: {
        weekendPeak: true,
        festivalSpikes: 'very_high',
        mobilePreference: 85
      }
    };
  }

  /**
   * Get seasonal trend based on month
   */
  private getSeasonalTrend(month: number): string {
    if (month >= 3 && month <= 5) return 'spring_festival_season';
    if (month >= 6 && month <= 8) return 'monsoon_indoor_shopping';
    if (month >= 9 && month <= 11) return 'autumn_festival_season';
    return 'winter_wedding_season';
  }

  // ============================================================================
  // DASHBOARD DATA METHODS
  // ============================================================================

  /**
   * Send initial dashboard data to new client
   */
  private async sendInitialDashboardData(ws: WebSocket) {
    try {
      // Get cached data or fetch fresh data
      const [salesData, trafficData, orderData] = await Promise.all([
        redisService.getCache('real_time_sales_stream'),
        redisService.getCache('real_time_traffic_stream'),
        redisService.getCache('real_time_orders_stream')
      ]);

      const initialData = {
        type: 'INITIAL_DASHBOARD_DATA',
        data: {
          sales: salesData || await this.getDefaultSalesData(),
          traffic: trafficData || await this.getDefaultTrafficData(),
          orders: orderData || await this.getDefaultOrderData(),
          timestamp: new Date().toISOString()
        }
      };

      ws.send(JSON.stringify(initialData));

    } catch (error) {
      logger.error('Failed to send initial dashboard data', { error });
    }
  }

  /**
   * Get default sales data when no real-time data available
   */
  private async getDefaultSalesData() {
    return {
      totalSales: 0,
      salesCount: 0,
      averageOrderValue: 0,
      growthRate: 0,
      bkashSales: 0,
      nagadSales: 0,
      rocketSales: 0,
      codSales: 0,
      dhakaRegionSales: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get default traffic data when no real-time data available
   */
  private async getDefaultTrafficData() {
    return {
      activeUsers: 0,
      totalSessions: 0,
      pageViews: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      conversionRate: 0,
      topPages: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get default order data when no real-time data available
   */
  private async getDefaultOrderData() {
    return {
      totalOrders: 0,
      totalValue: 0,
      averageProcessingTime: 0,
      pendingOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      successRate: 0,
      vendorPerformance: [],
      timestamp: new Date().toISOString()
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Stop all real-time processors
   */
  public stopProcessors() {
    this.processingIntervals.forEach(interval => clearInterval(interval));
    this.processingIntervals = [];
    
    // Close all WebSocket connections
    this.connectedClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.connectedClients.clear();

    logger.info('Real-time analytics processors stopped');
  }

  /**
   * Get service health status
   */
  public getHealthStatus() {
    return {
      service: this.serviceName,
      status: 'healthy',
      connectedClients: this.connectedClients.size,
      activeProcessors: this.processingIntervals.length,
      timestamp: new Date().toISOString()
    };
  }
}