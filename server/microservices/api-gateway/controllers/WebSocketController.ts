/**
 * WebSocket Gateway Controller
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Amazon.com/Shopee.sg-level WebSocket API management with real-time communication,
 * connection management, and comprehensive monitoring capabilities
 */

import { Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { db } from '../../../db';
import { 
  apiGatewayWebSocketConnections, 
  apiGatewayWebSocketEvents,
  apiGatewayWebSocketChannels 
} from '../../../../shared/schema';
import { eq, and, sql, desc, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'websocket-controller' }
});

export interface WebSocketConnection {
  id: string;
  socketId: string;
  userId: string;
  userType: 'customer' | 'vendor' | 'admin';
  channels: string[];
  ipAddress: string;
  userAgent: string;
  connectedAt: Date;
  lastActivity: Date;
  metadata: Record<string, any>;
}

export interface WebSocketEvent {
  id: string;
  connectionId: string;
  type: string;
  channel: string;
  data: any;
  timestamp: Date;
  processed: boolean;
  error?: string;
}

export interface WebSocketChannel {
  name: string;
  description: string;
  type: 'public' | 'private' | 'presence';
  maxConnections?: number;
  authRequired: boolean;
  permissions: string[];
  metadata: Record<string, any>;
}

export class WebSocketController {
  private io: SocketIOServer | null = null;
  private redisClient: Redis | null = null;
  private connections: Map<string, WebSocketConnection> = new Map();
  private channels: Map<string, WebSocketChannel> = new Map();
  private eventQueue: WebSocketEvent[] = [];

  constructor() {
    this.initializeRedis();
    this.loadChannelsFromDatabase();
  }

  private async initializeRedis(): Promise<void> {
    // Redis disabled to prevent connection errors
    logger.info('WebSocket Redis client disabled - using fallback mode');
    this.redisClient = null;
  }

  private async loadChannelsFromDatabase(): Promise<void> {
    try {
      const dbChannels = await db.select().from(apiGatewayWebSocketChannels);
      
      for (const channel of dbChannels) {
        this.channels.set(channel.name, {
          name: channel.name,
          description: channel.description || '',
          type: channel.type as 'public' | 'private' | 'presence',
          maxConnections: channel.maxConnections || undefined,
          authRequired: channel.authRequired || false,
          permissions: JSON.parse(channel.permissions as string || '[]'),
          metadata: JSON.parse(channel.metadata as string || '{}')
        });
      }

      logger.info('WebSocket channels loaded from database', {
        channelCount: this.channels.size
      });
    } catch (error) {
      logger.error('Failed to load WebSocket channels', { error: error.message });
    }
  }

  // Initialize WebSocket server
  async initializeWebSocketServer(io: SocketIOServer): Promise<void> {
    try {
      this.io = io;

      // Setup Redis adapter for clustering if available
      if (this.redisClient) {
        const pubClient = this.redisClient;
        const subClient = pubClient.duplicate();
        io.adapter(createAdapter(pubClient, subClient));
        logger.info('WebSocket Redis adapter initialized');
      }

      // Connection handling
      io.on('connection', (socket) => {
        this.handleConnection(socket);
      });

      // Initialize default channels
      await this.initializeDefaultChannels();

      logger.info('WebSocket server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WebSocket server', { error: error.message });
      throw error;
    }
  }

  private async handleConnection(socket: any): Promise<void> {
    try {
      // Authenticate connection
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      let user = null;

      if (token) {
        try {
          user = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        } catch (error) {
          logger.warn('Invalid WebSocket authentication token', { socketId: socket.id });
        }
      }

      // Create connection record
      const connection: WebSocketConnection = {
        id: uuidv4(),
        socketId: socket.id,
        userId: user?.id || 'anonymous',
        userType: user?.role || 'customer',
        channels: [],
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'] || '',
        connectedAt: new Date(),
        lastActivity: new Date(),
        metadata: {
          ...socket.handshake.query,
          authenticated: !!user
        }
      };

      // Store connection
      this.connections.set(socket.id, connection);
      await this.saveConnectionToDatabase(connection);

      // Join default channels based on user type
      await this.joinDefaultChannels(socket, connection);

      // Setup event handlers
      this.setupSocketEventHandlers(socket, connection);

      // Send welcome message
      socket.emit('connected', {
        connectionId: connection.id,
        userId: connection.userId,
        channels: connection.channels,
        timestamp: new Date().toISOString()
      });

      logger.info('WebSocket connection established', {
        connectionId: connection.id,
        userId: connection.userId,
        userType: connection.userType,
        socketId: socket.id
      });

    } catch (error) {
      logger.error('Failed to handle WebSocket connection', { 
        error: error.message,
        socketId: socket.id 
      });
      socket.disconnect();
    }
  }

  private async setupSocketEventHandlers(socket: any, connection: WebSocketConnection): Promise<void> {
    // Join channel
    socket.on('join-channel', async (data: { channel: string; password?: string }) => {
      try {
        await this.joinChannel(socket, connection, data.channel, data.password);
      } catch (error) {
        socket.emit('error', { message: error.message, event: 'join-channel' });
      }
    });

    // Leave channel
    socket.on('leave-channel', async (data: { channel: string }) => {
      try {
        await this.leaveChannel(socket, connection, data.channel);
      } catch (error) {
        socket.emit('error', { message: error.message, event: 'leave-channel' });
      }
    });

    // Send message
    socket.on('message', async (data: { channel: string; message: any; type?: string }) => {
      try {
        await this.handleMessage(socket, connection, data);
      } catch (error) {
        socket.emit('error', { message: error.message, event: 'message' });
      }
    });

    // Subscribe to real-time updates
    socket.on('subscribe', async (data: { topics: string[] }) => {
      try {
        await this.handleSubscription(socket, connection, data.topics);
      } catch (error) {
        socket.emit('error', { message: error.message, event: 'subscribe' });
      }
    });

    // Unsubscribe from updates
    socket.on('unsubscribe', async (data: { topics: string[] }) => {
      try {
        await this.handleUnsubscription(socket, connection, data.topics);
      } catch (error) {
        socket.emit('error', { message: error.message, event: 'unsubscribe' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async (reason: string) => {
      await this.handleDisconnection(socket, connection, reason);
    });

    // Update last activity
    socket.use(async (packet, next) => {
      connection.lastActivity = new Date();
      this.connections.set(socket.id, connection);
      next();
    });
  }

  private async joinDefaultChannels(socket: any, connection: WebSocketConnection): Promise<void> {
    const defaultChannels = ['general', 'notifications'];
    
    if (connection.userType === 'vendor') {
      defaultChannels.push('vendor-updates');
    } else if (connection.userType === 'admin') {
      defaultChannels.push('admin-alerts');
    }

    for (const channelName of defaultChannels) {
      try {
        await this.joinChannel(socket, connection, channelName);
      } catch (error) {
        logger.warn('Failed to join default channel', { 
          channel: channelName, 
          connectionId: connection.id 
        });
      }
    }
  }

  private async joinChannel(socket: any, connection: WebSocketConnection, channelName: string, password?: string): Promise<void> {
    const channel = this.channels.get(channelName);
    
    if (!channel) {
      throw new Error(`Channel '${channelName}' does not exist`);
    }

    // Check authentication requirements
    if (channel.authRequired && connection.userId === 'anonymous') {
      throw new Error(`Authentication required for channel '${channelName}'`);
    }

    // Check permissions
    if (channel.permissions.length > 0) {
      // TODO: Implement permission checking based on user roles
    }

    // Check connection limit
    if (channel.maxConnections) {
      const currentConnections = await this.getChannelConnectionCount(channelName);
      if (currentConnections >= channel.maxConnections) {
        throw new Error(`Channel '${channelName}' is at maximum capacity`);
      }
    }

    // Join the socket room
    await socket.join(channelName);
    
    // Update connection record
    if (!connection.channels.includes(channelName)) {
      connection.channels.push(channelName);
      this.connections.set(socket.id, connection);
      await this.updateConnectionInDatabase(connection);
    }

    // Log event
    await this.logWebSocketEvent({
      id: uuidv4(),
      connectionId: connection.id,
      type: 'channel-join',
      channel: channelName,
      data: { userId: connection.userId },
      timestamp: new Date(),
      processed: true
    });

    // Notify user
    socket.emit('channel-joined', { channel: channelName, timestamp: new Date().toISOString() });

    // Notify channel (if presence channel)
    if (channel.type === 'presence') {
      socket.to(channelName).emit('user-joined', {
        userId: connection.userId,
        userType: connection.userType,
        channel: channelName,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('User joined WebSocket channel', {
      connectionId: connection.id,
      userId: connection.userId,
      channel: channelName
    });
  }

  private async leaveChannel(socket: any, connection: WebSocketConnection, channelName: string): Promise<void> {
    // Leave the socket room
    await socket.leave(channelName);
    
    // Update connection record
    connection.channels = connection.channels.filter(ch => ch !== channelName);
    this.connections.set(socket.id, connection);
    await this.updateConnectionInDatabase(connection);

    // Log event
    await this.logWebSocketEvent({
      id: uuidv4(),
      connectionId: connection.id,
      type: 'channel-leave',
      channel: channelName,
      data: { userId: connection.userId },
      timestamp: new Date(),
      processed: true
    });

    // Notify user
    socket.emit('channel-left', { channel: channelName, timestamp: new Date().toISOString() });

    // Notify channel (if presence channel)
    const channel = this.channels.get(channelName);
    if (channel?.type === 'presence') {
      socket.to(channelName).emit('user-left', {
        userId: connection.userId,
        userType: connection.userType,
        channel: channelName,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('User left WebSocket channel', {
      connectionId: connection.id,
      userId: connection.userId,
      channel: channelName
    });
  }

  private async handleMessage(socket: any, connection: WebSocketConnection, data: any): Promise<void> {
    const { channel, message, type = 'message' } = data;

    // Validate channel membership
    if (!connection.channels.includes(channel)) {
      throw new Error(`Not a member of channel '${channel}'`);
    }

    // Create message event
    const messageEvent = {
      id: uuidv4(),
      connectionId: connection.id,
      type: 'message',
      channel,
      data: {
        type,
        message,
        userId: connection.userId,
        userType: connection.userType,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      processed: false
    };

    // Process message based on type
    if (type === 'chat') {
      // Broadcast to channel
      socket.to(channel).emit('message', messageEvent.data);
    } else if (type === 'notification') {
      // Send targeted notifications
      await this.sendNotification(channel, messageEvent.data);
    } else if (type === 'system') {
      // System messages (admin only)
      if (connection.userType === 'admin') {
        this.io?.to(channel).emit('system-message', messageEvent.data);
      }
    }

    // Log event
    await this.logWebSocketEvent(messageEvent);

    logger.info('WebSocket message processed', {
      connectionId: connection.id,
      channel,
      type,
      messageId: messageEvent.id
    });
  }

  private async handleSubscription(socket: any, connection: WebSocketConnection, topics: string[]): Promise<void> {
    for (const topic of topics) {
      // Join topic-specific rooms
      await socket.join(`topic:${topic}`);
      
      logger.info('User subscribed to topic', {
        connectionId: connection.id,
        userId: connection.userId,
        topic
      });
    }

    socket.emit('subscribed', { topics, timestamp: new Date().toISOString() });
  }

  private async handleUnsubscription(socket: any, connection: WebSocketConnection, topics: string[]): Promise<void> {
    for (const topic of topics) {
      // Leave topic-specific rooms
      await socket.leave(`topic:${topic}`);
      
      logger.info('User unsubscribed from topic', {
        connectionId: connection.id,
        userId: connection.userId,
        topic
      });
    }

    socket.emit('unsubscribed', { topics, timestamp: new Date().toISOString() });
  }

  private async handleDisconnection(socket: any, connection: WebSocketConnection, reason: string): Promise<void> {
    // Update connection record
    this.connections.delete(socket.id);
    await this.removeConnectionFromDatabase(connection.id);

    // Log disconnection event
    await this.logWebSocketEvent({
      id: uuidv4(),
      connectionId: connection.id,
      type: 'disconnect',
      channel: 'system',
      data: { reason, userId: connection.userId },
      timestamp: new Date(),
      processed: true
    });

    // Notify presence channels
    for (const channelName of connection.channels) {
      const channel = this.channels.get(channelName);
      if (channel?.type === 'presence') {
        socket.to(channelName).emit('user-disconnected', {
          userId: connection.userId,
          userType: connection.userType,
          channel: channelName,
          reason,
          timestamp: new Date().toISOString()
        });
      }
    }

    logger.info('WebSocket connection closed', {
      connectionId: connection.id,
      userId: connection.userId,
      reason
    });
  }

  // REST API Endpoints
  async getConnections(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50, status = 'all' } = req.query;
      
      const connections = Array.from(this.connections.values());
      const filteredConnections = status === 'all' ? connections : 
        connections.filter(conn => this.isConnectionActive(conn));

      const startIndex = (Number(page) - 1) * Number(limit);
      const paginatedConnections = filteredConnections.slice(startIndex, startIndex + Number(limit));

      res.json({
        success: true,
        data: {
          connections: paginatedConnections,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: filteredConnections.length,
            pages: Math.ceil(filteredConnections.length / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get WebSocket connections', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getConnectionMetrics(req: Request, res: Response): Promise<void> {
    try {
      const totalConnections = this.connections.size;
      const activeConnections = Array.from(this.connections.values())
        .filter(conn => this.isConnectionActive(conn)).length;
      
      const channelStats = new Map<string, number>();
      this.connections.forEach(conn => {
        conn.channels.forEach(channel => {
          channelStats.set(channel, (channelStats.get(channel) || 0) + 1);
        });
      });

      const userTypeStats = new Map<string, number>();
      this.connections.forEach(conn => {
        userTypeStats.set(conn.userType, (userTypeStats.get(conn.userType) || 0) + 1);
      });

      res.json({
        success: true,
        data: {
          totalConnections,
          activeConnections,
          inactiveConnections: totalConnections - activeConnections,
          channelStats: Object.fromEntries(channelStats),
          userTypeStats: Object.fromEntries(userTypeStats),
          channels: Array.from(this.channels.values()),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get connection metrics', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async broadcastMessage(req: Request, res: Response): Promise<void> {
    try {
      const { channel, message, type = 'broadcast' } = req.body;

      if (!channel || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Channel and message are required' 
        });
      }

      // Broadcast to channel
      this.io?.to(channel).emit('broadcast', {
        type,
        message,
        channel,
        timestamp: new Date().toISOString(),
        sender: 'system'
      });

      // Log broadcast event
      await this.logWebSocketEvent({
        id: uuidv4(),
        connectionId: 'system',
        type: 'broadcast',
        channel,
        data: { message, type },
        timestamp: new Date(),
        processed: true
      });

      res.json({
        success: true,
        data: {
          channel,
          message,
          type,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to broadcast message', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createChannel(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, type = 'public', maxConnections, authRequired = false, permissions = [] } = req.body;

      if (!name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Channel name is required' 
        });
      }

      if (this.channels.has(name)) {
        return res.status(409).json({ 
          success: false, 
          error: 'Channel already exists' 
        });
      }

      const channel: WebSocketChannel = {
        name,
        description: description || '',
        type,
        maxConnections,
        authRequired,
        permissions,
        metadata: {}
      };

      // Save to database
      await db.insert(apiGatewayWebSocketChannels).values({
        id: uuidv4(),
        name,
        description: description || null,
        type,
        maxConnections: maxConnections || null,
        authRequired,
        permissions: JSON.stringify(permissions),
        metadata: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Add to memory
      this.channels.set(name, channel);

      res.json({
        success: true,
        data: channel
      });
    } catch (error) {
      logger.error('Failed to create WebSocket channel', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getChannels(req: Request, res: Response): Promise<void> {
    try {
      const channels = Array.from(this.channels.values());
      
      // Add connection counts
      const channelsWithStats = await Promise.all(channels.map(async (channel) => ({
        ...channel,
        connectionCount: await this.getChannelConnectionCount(channel.name)
      })));

      res.json({
        success: true,
        data: channelsWithStats
      });
    } catch (error) {
      logger.error('Failed to get WebSocket channels', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getWebSocketEvents(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 100, type, channel } = req.query;
      
      let query = db.select().from(apiGatewayWebSocketEvents);
      
      if (type) {
        query = query.where(eq(apiGatewayWebSocketEvents.type, type as string));
      }
      
      if (channel) {
        query = query.where(eq(apiGatewayWebSocketEvents.channel, channel as string));
      }

      const events = await query
        .orderBy(desc(apiGatewayWebSocketEvents.timestamp))
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit));

      res.json({
        success: true,
        data: {
          events,
          pagination: {
            page: Number(page),
            limit: Number(limit)
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get WebSocket events', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Helper methods
  private isConnectionActive(connection: WebSocketConnection): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return connection.lastActivity > fiveMinutesAgo;
  }

  private async getChannelConnectionCount(channelName: string): Promise<number> {
    let count = 0;
    this.connections.forEach(conn => {
      if (conn.channels.includes(channelName)) {
        count++;
      }
    });
    return count;
  }

  private async saveConnectionToDatabase(connection: WebSocketConnection): Promise<void> {
    try {
      await db.insert(apiGatewayWebSocketConnections).values({
        id: connection.id,
        socketId: connection.socketId,
        userId: connection.userId,
        userType: connection.userType,
        channels: JSON.stringify(connection.channels),
        ipAddress: connection.ipAddress,
        userAgent: connection.userAgent,
        connectedAt: connection.connectedAt,
        lastActivity: connection.lastActivity,
        metadata: JSON.stringify(connection.metadata),
        isActive: true
      });
    } catch (error) {
      logger.error('Failed to save connection to database', { error: error.message });
    }
  }

  private async updateConnectionInDatabase(connection: WebSocketConnection): Promise<void> {
    try {
      await db
        .update(apiGatewayWebSocketConnections)
        .set({
          channels: JSON.stringify(connection.channels),
          lastActivity: connection.lastActivity,
          metadata: JSON.stringify(connection.metadata)
        })
        .where(eq(apiGatewayWebSocketConnections.id, connection.id));
    } catch (error) {
      logger.error('Failed to update connection in database', { error: error.message });
    }
  }

  private async removeConnectionFromDatabase(connectionId: string): Promise<void> {
    try {
      await db
        .update(apiGatewayWebSocketConnections)
        .set({ isActive: false })
        .where(eq(apiGatewayWebSocketConnections.id, connectionId));
    } catch (error) {
      logger.error('Failed to remove connection from database', { error: error.message });
    }
  }

  private async logWebSocketEvent(event: WebSocketEvent): Promise<void> {
    try {
      await db.insert(apiGatewayWebSocketEvents).values({
        id: event.id,
        connectionId: event.connectionId,
        type: event.type,
        channel: event.channel,
        data: JSON.stringify(event.data),
        timestamp: event.timestamp,
        processed: event.processed,
        error: event.error || null
      });

      // Also add to in-memory queue for real-time processing
      this.eventQueue.push(event);
      
      // Keep queue size manageable
      if (this.eventQueue.length > 1000) {
        this.eventQueue = this.eventQueue.slice(-500);
      }
    } catch (error) {
      logger.error('Failed to log WebSocket event', { error: error.message });
    }
  }

  private async sendNotification(channel: string, data: any): Promise<void> {
    // Send notification to specific channel
    this.io?.to(channel).emit('notification', data);
    
    // Also send to topic subscribers if applicable
    if (data.topic) {
      this.io?.to(`topic:${data.topic}`).emit('notification', data);
    }
  }

  private async initializeDefaultChannels(): Promise<void> {
    const defaultChannels = [
      {
        name: 'general',
        description: 'General chat channel',
        type: 'public' as const,
        authRequired: false,
        permissions: []
      },
      {
        name: 'notifications',
        description: 'System notifications',
        type: 'public' as const,
        authRequired: false,
        permissions: []
      },
      {
        name: 'vendor-updates',
        description: 'Vendor-specific updates',
        type: 'private' as const,
        authRequired: true,
        permissions: ['vendor']
      },
      {
        name: 'admin-alerts',
        description: 'Administrative alerts',
        type: 'private' as const,
        authRequired: true,
        permissions: ['admin']
      },
      {
        name: 'order-updates',
        description: 'Real-time order updates',
        type: 'presence' as const,
        authRequired: true,
        permissions: ['customer', 'vendor', 'admin']
      }
    ];

    for (const channelData of defaultChannels) {
      if (!this.channels.has(channelData.name)) {
        try {
          // Check if exists in database
          const existing = await db.select()
            .from(apiGatewayWebSocketChannels)
            .where(eq(apiGatewayWebSocketChannels.name, channelData.name))
            .limit(1);

          if (existing.length === 0) {
            // Create in database
            await db.insert(apiGatewayWebSocketChannels).values({
              id: uuidv4(),
              name: channelData.name,
              description: channelData.description,
              type: channelData.type,
              authRequired: channelData.authRequired,
              permissions: JSON.stringify(channelData.permissions),
              metadata: JSON.stringify({}),
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }

          // Add to memory
          this.channels.set(channelData.name, {
            ...channelData,
            metadata: {}
          });
        } catch (error) {
          logger.warn('Failed to initialize default channel', { 
            channel: channelData.name, 
            error: error.message 
          });
        }
      }
    }
  }
}

export const webSocketController = new WebSocketController();