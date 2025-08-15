import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { db } from '../../../../db';
import { redisService } from '../../../../services/RedisService';
import { logger } from '../../../../services/LoggingService';
import { 
  orders,
  products,
  users,
  userSessions,
  paymentTransactions,
  realTimeSalesAnalytics,
  realTimeTrafficAnalytics,
  type Order,
  type Product,
  type User,
  type PaymentTransaction
} from '../../../../../shared/schema';
import { eq, desc, sql, and, gte, count, sum, avg } from 'drizzle-orm';

interface WebSocketClient {
  ws: WebSocket;
  id: string;
  userId?: string;
  role?: string;
  subscribedChannels: Set<string>;
  lastActivity: Date;
  metadata?: any;
}

interface AnalyticsEvent {
  type: string;
  channel: string;
  data: any;
  timestamp: Date;
  source?: string;
}

interface RealTimeMetrics {
  currentVisitors: number;
  activeSessions: number;
  liveOrders: number;
  revenueToday: number;
  topProducts: any[];
  trafficSources: any[];
  conversionRate: number;
  averageOrderValue: number;
}

/**
 * WEBSOCKET ANALYTICS STREAMER
 * Amazon.com/Shopee.sg-Level Real-Time Analytics Streaming Infrastructure
 * 
 * Features:
 * - Real-time metrics streaming via WebSocket
 * - Multi-channel subscription system
 * - Bangladesh market-specific analytics
 * - Scalable client management
 * - Auto-reconnection and failover
 * - Performance monitoring
 * - Cultural event impact tracking
 */
export class WebSocketAnalyticsStreamer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private processingIntervals: NodeJS.Timeout[] = [];
  private serviceName = 'websocket-analytics-streamer';
  private bangladeshTimezone = 'Asia/Dhaka';

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/v1/analytics/realtime/stream'
    });
    
    this.initializeService();
    this.setupWebSocketHandlers();
    this.startRealTimeProcessors();
  }

  private async initializeService() {
    logger.info(`🚀 Initializing ${this.serviceName}`, {
      serviceId: this.serviceName,
      version: '2.0.0',
      features: ['real-time-streaming', 'bangladesh-analytics', 'multi-channel'],
      timestamp: new Date().toISOString()
    });

    // Initialize default channels
    this.initializeChannels();
  }

  private initializeChannels() {
    const defaultChannels = [
      'dashboard',
      'sales',
      'orders',
      'traffic',
      'products',
      'users',
      'payments',
      'vendor-analytics',
      'bangladesh-insights',
      'admin-overview'
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel, new Set());
    });

    logger.info('Analytics channels initialized', {
      channels: defaultChannels,
      totalChannels: this.channels.size
    });
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws, request) => {
      const clientId = this.generateClientId();
      const client: WebSocketClient = {
        ws,
        id: clientId,
        subscribedChannels: new Set(),
        lastActivity: new Date(),
        metadata: {
          ip: request.socket.remoteAddress,
          userAgent: request.headers['user-agent'],
          connectedAt: new Date().toISOString()
        }
      };

      this.clients.set(clientId, client);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        availableChannels: Array.from(this.channels.keys()),
        timestamp: new Date().toISOString()
      });

      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(clientId, data);
        } catch (error) {
          logger.error('Error parsing WebSocket message', { error, clientId });
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.handleClientDisconnect(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket client error', { error, clientId });
        this.handleClientDisconnect(clientId);
      });

      logger.info('New analytics client connected', {
        clientId,
        totalClients: this.clients.size,
        ip: request.socket.remoteAddress
      });
    });

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error', { error });
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleClientMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = new Date();

    switch (message.type) {
      case 'subscribe':
        this.handleSubscription(clientId, message.channel, message.filters);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(clientId, message.channel);
        break;
      case 'authenticate':
        this.handleAuthentication(clientId, message.token);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        logger.warn('Unknown message type', { type: message.type, clientId });
    }
  }

  private handleSubscription(clientId: string, channel: string, filters?: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.channels.has(channel)) {
      this.sendToClient(clientId, {
        type: 'error',
        message: `Channel '${channel}' does not exist`,
        availableChannels: Array.from(this.channels.keys())
      });
      return;
    }

    // Add client to channel
    this.channels.get(channel)!.add(clientId);
    client.subscribedChannels.add(channel);

    // Send initial data for the channel
    this.sendInitialChannelData(clientId, channel);

    this.sendToClient(clientId, {
      type: 'subscribed',
      channel,
      filters,
      timestamp: new Date().toISOString()
    });

    logger.info('Client subscribed to channel', { clientId, channel });
  }

  private handleUnsubscription(clientId: string, channel: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    this.channels.get(channel)?.delete(clientId);
    client.subscribedChannels.delete(channel);

    this.sendToClient(clientId, {
      type: 'unsubscribed',
      channel,
      timestamp: new Date().toISOString()
    });

    logger.info('Client unsubscribed from channel', { clientId, channel });
  }

  private handleAuthentication(clientId: string, token: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // TODO: Implement JWT token validation
    // For now, we'll simulate authentication
    client.userId = 'user_123';
    client.role = 'admin';

    this.sendToClient(clientId, {
      type: 'authenticated',
      userId: client.userId,
      role: client.role,
      timestamp: new Date().toISOString()
    });

    logger.info('Client authenticated', { clientId, userId: client.userId, role: client.role });
  }

  private handleClientDisconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove client from all channels
    client.subscribedChannels.forEach(channel => {
      this.channels.get(channel)?.delete(clientId);
    });

    this.clients.delete(clientId);

    logger.info('Client disconnected', {
      clientId,
      connectedChannels: Array.from(client.subscribedChannels),
      totalClients: this.clients.size
    });
  }

  private sendToClient(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(data));
    } catch (error) {
      logger.error('Error sending message to client', { error, clientId });
      this.handleClientDisconnect(clientId);
    }
  }

  private broadcastToChannel(channel: string, data: any) {
    const clientIds = this.channels.get(channel);
    if (!clientIds) return;

    const message = JSON.stringify({
      channel,
      timestamp: new Date().toISOString(),
      ...data
    });

    clientIds.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(message);
        } catch (error) {
          logger.error('Error broadcasting to client', { error, clientId });
          this.handleClientDisconnect(clientId);
        }
      }
    });
  }

  private async sendInitialChannelData(clientId: string, channel: string) {
    try {
      let initialData: any = {};

      switch (channel) {
        case 'dashboard':
          initialData = await this.getDashboardData();
          break;
        case 'sales':
          initialData = await this.getSalesData();
          break;
        case 'orders':
          initialData = await this.getOrdersData();
          break;
        case 'traffic':
          initialData = await this.getTrafficData();
          break;
        case 'products':
          initialData = await this.getProductsData();
          break;
        case 'bangladesh-insights':
          initialData = await this.getBangladeshInsights();
          break;
        default:
          initialData = { message: 'No initial data available' };
      }

      this.sendToClient(clientId, {
        type: 'initial-data',
        channel,
        data: initialData
      });
    } catch (error) {
      logger.error('Error sending initial channel data', { error, clientId, channel });
    }
  }

  private startRealTimeProcessors() {
    // Dashboard metrics processor (every 5 seconds)
    const dashboardProcessor = setInterval(async () => {
      try {
        const dashboardData = await this.getDashboardData();
        this.broadcastToChannel('dashboard', {
          type: 'dashboard-update',
          data: dashboardData
        });
      } catch (error) {
        logger.error('Error in dashboard processor', { error });
      }
    }, 5000);

    // Sales metrics processor (every 10 seconds)
    const salesProcessor = setInterval(async () => {
      try {
        const salesData = await this.getSalesData();
        this.broadcastToChannel('sales', {
          type: 'sales-update',
          data: salesData
        });
      } catch (error) {
        logger.error('Error in sales processor', { error });
      }
    }, 10000);

    // Orders processor (every 3 seconds)
    const ordersProcessor = setInterval(async () => {
      try {
        const ordersData = await this.getOrdersData();
        this.broadcastToChannel('orders', {
          type: 'orders-update',
          data: ordersData
        });
      } catch (error) {
        logger.error('Error in orders processor', { error });
      }
    }, 3000);

    // Bangladesh insights processor (every 30 seconds)
    const bangladeshProcessor = setInterval(async () => {
      try {
        const bangladeshData = await this.getBangladeshInsights();
        this.broadcastToChannel('bangladesh-insights', {
          type: 'bangladesh-update',
          data: bangladeshData
        });
      } catch (error) {
        logger.error('Error in Bangladesh processor', { error });
      }
    }, 30000);

    this.processingIntervals.push(dashboardProcessor, salesProcessor, ordersProcessor, bangladeshProcessor);

    logger.info('Real-time processors started', {
      processors: ['dashboard', 'sales', 'orders', 'bangladesh'],
      intervals: ['5s', '10s', '3s', '30s']
    });
  }

  // ============================================================================
  // DATA FETCHING METHODS
  // ============================================================================

  private async getDashboardData(): Promise<RealTimeMetrics> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      // Get real-time metrics
      const [activeUsers] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${userSessions.userId})` })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.startTime, lastHour),
            eq(userSessions.isActive, true)
          )
        );

      const [activeSessions] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.startTime, lastHour),
            eq(userSessions.isActive, true)
          )
        );

      const [liveOrders] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(gte(orders.createdAt, lastHour));

      const [revenueToday] = await db
        .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, last24Hours),
            eq(orders.status, 'completed')
          )
        );

      // Get top products
      const topProducts = await db
        .select({
          id: products.id,
          name: products.title,
          sales: sql<number>`COUNT(${orders.id})`,
          revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`
        })
        .from(products)
        .leftJoin(orders, eq(products.id, orders.productId))
        .where(gte(orders.createdAt, last24Hours))
        .groupBy(products.id, products.title)
        .orderBy(desc(sql<number>`COUNT(${orders.id})`))
        .limit(5);

      return {
        currentVisitors: activeUsers.count || 0,
        activeSessions: activeSessions.count || 0,
        liveOrders: liveOrders.count || 0,
        revenueToday: revenueToday.total || 0,
        topProducts,
        trafficSources: [], // TODO: Implement traffic sources
        conversionRate: 0, // TODO: Calculate conversion rate
        averageOrderValue: 0 // TODO: Calculate AOV
      };
    } catch (error) {
      logger.error('Error fetching dashboard data', { error });
      return {
        currentVisitors: 0,
        activeSessions: 0,
        liveOrders: 0,
        revenueToday: 0,
        topProducts: [],
        trafficSources: [],
        conversionRate: 0,
        averageOrderValue: 0
      };
    }
  }

  private async getSalesData(): Promise<any> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      const [totalSales] = await db
        .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, last24Hours),
            eq(orders.status, 'completed')
          )
        );

      const [totalOrders] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(gte(orders.createdAt, last24Hours));

      return {
        totalSales: totalSales.total || 0,
        totalOrders: totalOrders.count || 0,
        timestamp: now.toISOString()
      };
    } catch (error) {
      logger.error('Error fetching sales data', { error });
      return {
        totalSales: 0,
        totalOrders: 0,
        timestamp: now.toISOString()
      };
    }
  }

  private async getOrdersData(): Promise<any> {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      const recentOrders = await db
        .select({
          id: orders.id,
          status: orders.status,
          totalAmount: orders.totalAmount,
          createdAt: orders.createdAt
        })
        .from(orders)
        .where(gte(orders.createdAt, lastHour))
        .orderBy(desc(orders.createdAt))
        .limit(10);

      return {
        recentOrders,
        timestamp: now.toISOString()
      };
    } catch (error) {
      logger.error('Error fetching orders data', { error });
      return {
        recentOrders: [],
        timestamp: now.toISOString()
      };
    }
  }

  private async getTrafficData(): Promise<any> {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      const [activeUsers] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${userSessions.userId})` })
        .from(userSessions)
        .where(
          and(
            gte(userSessions.startTime, lastHour),
            eq(userSessions.isActive, true)
          )
        );

      return {
        activeUsers: activeUsers.count || 0,
        timestamp: now.toISOString()
      };
    } catch (error) {
      logger.error('Error fetching traffic data', { error });
      return {
        activeUsers: 0,
        timestamp: now.toISOString()
      };
    }
  }

  private async getProductsData(): Promise<any> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      const [totalProducts] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(products);

      return {
        totalProducts: totalProducts.count || 0,
        timestamp: now.toISOString()
      };
    } catch (error) {
      logger.error('Error fetching products data', { error });
      return {
        totalProducts: 0,
        timestamp: now.toISOString()
      };
    }
  }

  private async getBangladeshInsights(): Promise<any> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      // Get payment method breakdown
      const paymentMethods = await db
        .select({
          method: paymentTransactions.paymentMethod,
          count: sql<number>`COUNT(*)`,
          amount: sql<number>`COALESCE(SUM(${paymentTransactions.amount}), 0)`
        })
        .from(paymentTransactions)
        .where(gte(paymentTransactions.createdAt, today))
        .groupBy(paymentTransactions.paymentMethod);

      // Check for cultural events (simplified)
      const currentDate = now.toLocaleDateString('en-BD');
      const culturalEvents = this.getCulturalEvents(currentDate);

      return {
        paymentMethods,
        culturalEvents,
        timestamp: now.toISOString()
      };
    } catch (error) {
      logger.error('Error fetching Bangladesh insights', { error });
      return {
        paymentMethods: [],
        culturalEvents: [],
        timestamp: now.toISOString()
      };
    }
  }

  private getCulturalEvents(date: string): any[] {
    // Simplified cultural events - in production, this would be more sophisticated
    const events = [];
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();

    if (month === 2 && day === 21) {
      events.push({ name: 'International Mother Language Day', impact: 'high' });
    }
    if (month === 3 && day === 26) {
      events.push({ name: 'Independence Day', impact: 'high' });
    }
    if (month === 12 && day === 16) {
      events.push({ name: 'Victory Day', impact: 'high' });
    }

    return events;
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  public broadcastEvent(event: AnalyticsEvent) {
    this.broadcastToChannel(event.channel, {
      type: 'event',
      data: event
    });
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getChannelSubscribers(channel: string): number {
    return this.channels.get(channel)?.size || 0;
  }

  public getSystemStats(): any {
    return {
      connectedClients: this.clients.size,
      totalChannels: this.channels.size,
      channelSubscribers: Array.from(this.channels.entries()).map(([channel, clients]) => ({
        channel,
        subscribers: clients.size
      })),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  public cleanup() {
    // Clear intervals
    this.processingIntervals.forEach(interval => clearInterval(interval));
    this.processingIntervals = [];

    // Close all WebSocket connections
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    });

    // Clear data structures
    this.clients.clear();
    this.channels.clear();

    logger.info('WebSocket Analytics Streamer cleaned up');
  }
}