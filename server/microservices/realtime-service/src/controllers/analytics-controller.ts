/**
 * Real-Time Analytics Controller - Amazon.com/Shopee.sg-Level Analytics
 * 
 * Comprehensive real-time analytics and business intelligence for chat systems
 * Features: Live dashboards, KPI streaming, performance metrics, capacity planning
 */

import { Router, Request, Response } from 'express';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  tags: Record<string, string>;
  aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count';
}

interface RealtimeKPI {
  activeConnections: number;
  messagesPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  customerSatisfaction: number;
  agentUtilization: number;
  queueLength: number;
  resolutionRate: number;
}

interface ConversationAnalytics {
  conversationId: string;
  participants: string[];
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  averageResponseTime: number;
  sentimentScore: number;
  satisfactionRating?: number;
  resolution: 'resolved' | 'escalated' | 'abandoned' | 'ongoing';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
}

interface PerformanceMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  activeWebSocketConnections: number;
  messagesProcessed: number;
  errorCount: number;
  averageLatency: number;
  throughput: number;
  queueDepth: number;
}

export class AnalyticsController extends EventEmitter {
  private router = Router();
  private redis = createClient();
  private metrics = new Map<string, AnalyticsMetric>();
  private liveKPIs: RealtimeKPI = {
    activeConnections: 0,
    messagesPerSecond: 0,
    averageResponseTime: 0,
    errorRate: 0,
    customerSatisfaction: 0,
    agentUtilization: 0,
    queueLength: 0,
    resolutionRate: 0
  };

  constructor() {
    super();
    this.initializeRoutes();
    this.initializeRedis();
    this.startMetricsCollection();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for Analytics controller');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for Analytics:', error.message);
    }
  }

  private initializeRoutes() {
    // Real-time dashboard APIs
    this.router.get('/dashboard/live', this.getLiveDashboard.bind(this));
    this.router.get('/dashboard/kpis', this.getRealtimeKPIs.bind(this));
    this.router.get('/dashboard/stream', this.streamDashboardData.bind(this));
    
    // Performance metrics
    this.router.get('/metrics/performance', this.getPerformanceMetrics.bind(this));
    this.router.get('/metrics/websocket', this.getWebSocketMetrics.bind(this));
    this.router.get('/metrics/chat', this.getChatMetrics.bind(this));
    this.router.get('/metrics/custom', this.getCustomMetrics.bind(this));
    
    // Conversation analytics
    this.router.get('/conversations/analytics', this.getConversationAnalytics.bind(this));
    this.router.get('/conversations/sentiment', this.getSentimentAnalysis.bind(this));
    this.router.get('/conversations/satisfaction', this.getSatisfactionMetrics.bind(this));
    this.router.get('/conversations/resolution', this.getResolutionMetrics.bind(this));
    
    // Agent performance
    this.router.get('/agents/performance', this.getAgentPerformance.bind(this));
    this.router.get('/agents/utilization', this.getAgentUtilization.bind(this));
    this.router.get('/agents/satisfaction', this.getAgentSatisfaction.bind(this));
    
    // Capacity planning
    this.router.get('/capacity/forecast', this.getCapacityForecast.bind(this));
    this.router.get('/capacity/trends', this.getCapacityTrends.bind(this));
    this.router.get('/capacity/alerts', this.getCapacityAlerts.bind(this));
    
    // Business intelligence
    this.router.get('/intelligence/trends', this.getBusinessTrends.bind(this));
    this.router.get('/intelligence/patterns', this.getUsagePatterns.bind(this));
    this.router.get('/intelligence/insights', this.getBusinessInsights.bind(this));
    this.router.get('/intelligence/recommendations', this.getRecommendations.bind(this));
    
    // Bangladesh market analytics
    this.router.get('/bangladesh/market-trends', this.getBangladeshMarketTrends.bind(this));
    this.router.get('/bangladesh/cultural-insights', this.getCulturalInsights.bind(this));
    this.router.get('/bangladesh/language-analysis', this.getLanguageAnalysis.bind(this));
    this.router.get('/bangladesh/mobile-analytics', this.getMobileAnalytics.bind(this));
    
    // Alerting system
    this.router.post('/alerts/create', this.createAlert.bind(this));
    this.router.get('/alerts/active', this.getActiveAlerts.bind(this));
    this.router.put('/alerts/:alertId/acknowledge', this.acknowledgeAlert.bind(this));
    this.router.delete('/alerts/:alertId', this.deleteAlert.bind(this));
    
    // Export and reporting
    this.router.get('/reports/generate', this.generateReport.bind(this));
    this.router.get('/reports/export', this.exportData.bind(this));
    this.router.get('/reports/schedule', this.scheduleReport.bind(this));
    
    // Health check
    this.router.get('/health', this.healthCheck.bind(this));
  }

  private startMetricsCollection() {
    // Collect metrics every 5 seconds
    setInterval(() => {
      this.collectRealtimeMetrics();
    }, 5000);

    // Update KPIs every 1 second for real-time dashboard
    setInterval(() => {
      this.updateRealtimeKPIs();
    }, 1000);
  }

  private async collectRealtimeMetrics() {
    try {
      const timestamp = new Date();
      
      // Collect WebSocket metrics
      const wsConnections = await this.redis.sCard('active_websocket_connections');
      const messagesProcessed = await this.redis.get('messages_processed_counter') || '0';
      const errorCount = await this.redis.get('error_count') || '0';
      
      // Collect chat metrics
      const activeChatRooms = await this.redis.sCard('active_chat_rooms');
      const queueLength = await this.redis.lLen('support_queue');
      
      const performanceMetrics: PerformanceMetrics = {
        timestamp,
        cpuUsage: process.cpuUsage().user / 1000000, // Convert to percentage
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
        activeWebSocketConnections: wsConnections,
        messagesProcessed: parseInt(messagesProcessed),
        errorCount: parseInt(errorCount),
        averageLatency: await this.calculateAverageLatency(),
        throughput: await this.calculateThroughput(),
        queueDepth: queueLength
      };

      // Store metrics in Redis with TTL
      await this.redis.setEx(
        `performance_metrics:${timestamp.getTime()}`,
        3600, // 1 hour TTL
        JSON.stringify(performanceMetrics)
      );

      // Update real-time metrics
      this.emit('metrics_updated', performanceMetrics);
    } catch (error) {
      console.error('❌ Error collecting metrics:', error);
    }
  }

  private async updateRealtimeKPIs() {
    try {
      const activeConnections = await this.redis.sCard('active_websocket_connections');
      const messagesPerSecond = await this.calculateMessagesPerSecond();
      const averageResponseTime = await this.calculateAverageResponseTime();
      const errorRate = await this.calculateErrorRate();
      const customerSatisfaction = await this.calculateCustomerSatisfaction();
      const agentUtilization = await this.calculateAgentUtilization();
      const queueLength = await this.redis.lLen('support_queue');
      const resolutionRate = await this.calculateResolutionRate();

      this.liveKPIs = {
        activeConnections,
        messagesPerSecond,
        averageResponseTime,
        errorRate,
        customerSatisfaction,
        agentUtilization,
        queueLength,
        resolutionRate
      };

      // Store in Redis for other services to access
      await this.redis.setEx('live_kpis', 60, JSON.stringify(this.liveKPIs));
      
      // Emit for real-time subscribers
      this.emit('kpis_updated', this.liveKPIs);
    } catch (error) {
      console.error('❌ Error updating KPIs:', error);
    }
  }

  private async getLiveDashboard(req: Request, res: Response) {
    try {
      const { timeRange = '1h' } = req.query;
      
      const dashboardData = {
        timestamp: new Date(),
        kpis: this.liveKPIs,
        performanceMetrics: await this.getRecentPerformanceMetrics(timeRange as string),
        conversationMetrics: await this.getRecentConversationMetrics(timeRange as string),
        agentMetrics: await this.getRecentAgentMetrics(timeRange as string),
        alerts: await this.getActiveAlertsData(),
        trends: await this.getBusinessTrendsData(timeRange as string),
        bangladeshInsights: await this.getBangladeshInsightsData(timeRange as string)
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('❌ Error getting live dashboard:', error);
      res.status(500).json({ error: 'Failed to get live dashboard' });
    }
  }

  private async getRealtimeKPIs(req: Request, res: Response) {
    try {
      const { format = 'json' } = req.query;
      
      const kpiData = {
        timestamp: new Date(),
        kpis: this.liveKPIs,
        trends: await this.getKPITrends(),
        comparisons: await this.getKPIComparisons(),
        benchmarks: await this.getKPIBenchmarks()
      };

      if (format === 'stream') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const sendKPIs = () => {
          res.write(`data: ${JSON.stringify(kpiData)}\n\n`);
        };
        
        sendKPIs();
        const interval = setInterval(sendKPIs, 5000); // Send every 5 seconds
        
        req.on('close', () => {
          clearInterval(interval);
        });
      } else {
        res.json({
          success: true,
          data: kpiData
        });
      }
    } catch (error) {
      console.error('❌ Error getting realtime KPIs:', error);
      res.status(500).json({ error: 'Failed to get realtime KPIs' });
    }
  }

  private async streamDashboardData(req: Request, res: Response) {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      const sendDashboardUpdate = () => {
        const data = {
          timestamp: new Date(),
          kpis: this.liveKPIs,
          activeConnections: this.liveKPIs.activeConnections,
          messagesPerSecond: this.liveKPIs.messagesPerSecond,
          errorRate: this.liveKPIs.errorRate,
          customerSatisfaction: this.liveKPIs.customerSatisfaction
        };
        
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Send initial data
      sendDashboardUpdate();
      
      // Set up interval for updates
      const interval = setInterval(sendDashboardUpdate, 2000); // Every 2 seconds
      
      // Listen for metrics updates
      this.on('kpis_updated', (kpis) => {
        res.write(`data: ${JSON.stringify({ 
          timestamp: new Date(), 
          kpis,
          event: 'kpis_updated'
        })}\n\n`);
      });
      
      this.on('metrics_updated', (metrics) => {
        res.write(`data: ${JSON.stringify({ 
          timestamp: new Date(), 
          metrics,
          event: 'metrics_updated'
        })}\n\n`);
      });

      req.on('close', () => {
        clearInterval(interval);
        this.removeAllListeners('kpis_updated');
        this.removeAllListeners('metrics_updated');
      });
    } catch (error) {
      console.error('❌ Error streaming dashboard data:', error);
      res.status(500).json({ error: 'Failed to stream dashboard data' });
    }
  }

  private async getConversationAnalytics(req: Request, res: Response) {
    try {
      const { 
        startDate, 
        endDate, 
        category,
        priority,
        resolution,
        agentId,
        page = 1,
        limit = 50
      } = req.query;

      const analytics = await this.getConversationAnalyticsData({
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
        category: category as string,
        priority: priority as string,
        resolution: resolution as string,
        agentId: agentId as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('❌ Error getting conversation analytics:', error);
      res.status(500).json({ error: 'Failed to get conversation analytics' });
    }
  }

  private async getBangladeshMarketTrends(req: Request, res: Response) {
    try {
      const { timeRange = '7d' } = req.query;
      
      const trends = {
        timestamp: new Date(),
        timeRange,
        languageUsage: await this.getLanguageUsageStats(),
        deviceTypes: await this.getDeviceTypeStats(),
        networkQuality: await this.getNetworkQualityStats(),
        peakHours: await this.getPeakHoursAnalysis(),
        festivalImpact: await this.getFestivalImpactAnalysis(),
        mobileOptimization: await this.getMobileOptimizationStats(),
        customerBehavior: await this.getCustomerBehaviorPatterns(),
        supportTopics: await this.getSupportTopicsAnalysis()
      };

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('❌ Error getting Bangladesh market trends:', error);
      res.status(500).json({ error: 'Failed to get Bangladesh market trends' });
    }
  }

  // Helper methods for calculations
  private async calculateAverageLatency(): Promise<number> {
    try {
      const latencies = await this.redis.lRange('latency_measurements', 0, 99);
      if (latencies.length === 0) return 0;
      
      const sum = latencies.reduce((acc, latency) => acc + parseInt(latency), 0);
      return sum / latencies.length;
    } catch (error) {
      return 0;
    }
  }

  private async calculateThroughput(): Promise<number> {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const messages = await this.redis.zCount('message_timestamps', oneMinuteAgo, now);
      return messages;
    } catch (error) {
      return 0;
    }
  }

  private async calculateMessagesPerSecond(): Promise<number> {
    try {
      const now = Date.now();
      const oneSecondAgo = now - 1000;
      const messages = await this.redis.zCount('message_timestamps', oneSecondAgo, now);
      return messages;
    } catch (error) {
      return 0;
    }
  }

  private async calculateAverageResponseTime(): Promise<number> {
    try {
      const responseTimes = await this.redis.lRange('response_times', 0, 99);
      if (responseTimes.length === 0) return 0;
      
      const sum = responseTimes.reduce((acc, time) => acc + parseInt(time), 0);
      return sum / responseTimes.length;
    } catch (error) {
      return 0;
    }
  }

  private async calculateErrorRate(): Promise<number> {
    try {
      const totalRequests = await this.redis.get('total_requests') || '0';
      const errorCount = await this.redis.get('error_count') || '0';
      
      const total = parseInt(totalRequests);
      const errors = parseInt(errorCount);
      
      return total > 0 ? (errors / total) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  private async calculateCustomerSatisfaction(): Promise<number> {
    try {
      const ratings = await this.redis.lRange('satisfaction_ratings', 0, 999);
      if (ratings.length === 0) return 0;
      
      const sum = ratings.reduce((acc, rating) => acc + parseInt(rating), 0);
      return sum / ratings.length;
    } catch (error) {
      return 0;
    }
  }

  private async calculateAgentUtilization(): Promise<number> {
    try {
      const totalAgents = await this.redis.sCard('active_agents');
      const busyAgents = await this.redis.sCard('busy_agents');
      
      return totalAgents > 0 ? (busyAgents / totalAgents) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  private async calculateResolutionRate(): Promise<number> {
    try {
      const totalTickets = await this.redis.sCard('total_tickets');
      const resolvedTickets = await this.redis.sCard('resolved_tickets');
      
      return totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  private async healthCheck(req: Request, res: Response) {
    try {
      const health = {
        service: 'realtime-analytics-controller',
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0',
        uptime: process.uptime(),
        redis: this.redis.isReady ? 'connected' : 'disconnected',
        metrics: {
          metricsCollected: this.metrics.size,
          activeConnections: this.liveKPIs.activeConnections,
          messagesPerSecond: this.liveKPIs.messagesPerSecond,
          errorRate: this.liveKPIs.errorRate
        },
        features: [
          'live-dashboard',
          'realtime-kpis',
          'performance-metrics',
          'conversation-analytics',
          'business-intelligence',
          'bangladesh-insights',
          'capacity-planning',
          'alert-system'
        ]
      };

      res.json(health);
    } catch (error) {
      console.error('❌ Analytics health check failed:', error);
      res.status(500).json({ 
        service: 'realtime-analytics-controller', 
        status: 'unhealthy',
        error: error.message 
      });
    }
  }

  // Additional helper methods (placeholder implementations)
  private async getRecentPerformanceMetrics(timeRange: string): Promise<any> {
    // Implementation for getting recent performance metrics
    return {};
  }

  private async getRecentConversationMetrics(timeRange: string): Promise<any> {
    // Implementation for getting recent conversation metrics
    return {};
  }

  private async getRecentAgentMetrics(timeRange: string): Promise<any> {
    // Implementation for getting recent agent metrics
    return {};
  }

  private async getActiveAlertsData(): Promise<any> {
    // Implementation for getting active alerts
    return [];
  }

  private async getBusinessTrendsData(timeRange: string): Promise<any> {
    // Implementation for getting business trends
    return {};
  }

  private async getBangladeshInsightsData(timeRange: string): Promise<any> {
    // Implementation for getting Bangladesh insights
    return {};
  }

  private async getKPITrends(): Promise<any> {
    // Implementation for KPI trends
    return {};
  }

  private async getKPIComparisons(): Promise<any> {
    // Implementation for KPI comparisons
    return {};
  }

  private async getKPIBenchmarks(): Promise<any> {
    // Implementation for KPI benchmarks
    return {};
  }

  private async getConversationAnalyticsData(params: any): Promise<any> {
    // Implementation for conversation analytics
    return {};
  }

  private async getLanguageUsageStats(): Promise<any> {
    // Implementation for language usage statistics
    return {};
  }

  private async getDeviceTypeStats(): Promise<any> {
    // Implementation for device type statistics
    return {};
  }

  private async getNetworkQualityStats(): Promise<any> {
    // Implementation for network quality statistics
    return {};
  }

  private async getPeakHoursAnalysis(): Promise<any> {
    // Implementation for peak hours analysis
    return {};
  }

  private async getFestivalImpactAnalysis(): Promise<any> {
    // Implementation for festival impact analysis
    return {};
  }

  private async getMobileOptimizationStats(): Promise<any> {
    // Implementation for mobile optimization statistics
    return {};
  }

  private async getCustomerBehaviorPatterns(): Promise<any> {
    // Implementation for customer behavior patterns
    return {};
  }

  private async getSupportTopicsAnalysis(): Promise<any> {
    // Implementation for support topics analysis
    return {};
  }

  public getRouter() {
    return this.router;
  }
}