/**
 * WebSocket Service - Core WebSocket Infrastructure
 * Amazon.com/Shopee.sg-Level real-time service infrastructure
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { EventEmitter } from 'events';

export interface WebSocketConfig {
  cors: {
    origin: string[];
    methods: string[];
    credentials: boolean;
  };
  transports: string[];
  pingTimeout: number;
  pingInterval: number;
  maxHttpBufferSize: number;
  allowEIO3: boolean;
}

export interface ConnectionInfo {
  socketId: string;
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  connectedAt: Date;
  lastActivity: Date;
  channels: string[];
  authenticated: boolean;
  deviceInfo: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
  location: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  networkQuality: {
    latency: number;
    bandwidth: '2g' | '3g' | '4g' | 'wifi';
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
}

export class WebSocketService extends EventEmitter {
  private io?: SocketIOServer;
  private redis = createClient();
  private redisSubscriber = createClient();
  private connections = new Map<string, ConnectionInfo>();
  private readonly config: WebSocketConfig;

  constructor() {
    super();
    this.config = {
      cors: {
        origin: ['http://localhost:3000', 'https://getit.com.bd'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: true
    };
    
    this.initializeRedis();
    this.setupEventHandlers();
  }

  private async initializeRedis() {
    try {
      await Promise.all([
        this.redis.connect(),
        this.redisSubscriber.connect()
      ]);
      console.log('✅ Redis connected for WebSocket service');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for WebSocket service:', error.message);
    }
  }

  private setupEventHandlers() {
    // Handle Redis pub/sub for cross-server communication
    this.redisSubscriber.subscribe('realtime_events', (message) => {
      this.handleRedisMessage(message);
    });

    this.redisSubscriber.subscribe('broadcast_events', (message) => {
      this.handleBroadcastMessage(message);
    });
  }

  public initialize(server: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(server, this.config);

    // Setup Redis adapter for horizontal scaling
    if (this.redis.isReady) {
      const pubClient = createClient();
      const subClient = createClient();
      
      Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        this.io!.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Socket.IO Redis adapter initialized');
      });
    }

    this.setupSocketHandlers();
    return this.io;
  }

  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    this.io.engine.on('connection_error', (err) => {
      console.error('❌ Socket.IO connection error:', err);
    });
  }

  private async handleConnection(socket: Socket) {
    const connectionInfo: ConnectionInfo = {
      socketId: socket.id,
      sessionId: socket.handshake.sessionID || socket.id,
      ipAddress: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent'] || '',
      connectedAt: new Date(),
      lastActivity: new Date(),
      channels: [],
      authenticated: false,
      deviceInfo: this.parseDeviceInfo(socket.handshake.headers['user-agent'] || ''),
      location: await this.getLocationFromIP(socket.handshake.address),
      networkQuality: {
        latency: 0,
        bandwidth: '4g',
        quality: 'good'
      }
    };

    this.connections.set(socket.id, connectionInfo);
    
    // Store in Redis for scaling
    await this.storeConnectionInRedis(connectionInfo);

    console.log(`🔗 New WebSocket connection: ${socket.id} from ${connectionInfo.location.city}, ${connectionInfo.location.country}`);

    // Setup socket event handlers
    this.setupSocketEvents(socket, connectionInfo);

    // Send connection acknowledgment
    socket.emit('connection_established', {
      socketId: socket.id,
      timestamp: connectionInfo.connectedAt,
      serverInfo: {
        version: '1.0.0',
        features: ['chat', 'notifications', 'real-time-updates', 'presence'],
        bangladesh_optimized: true
      }
    });

    // Emit connection event
    this.emit('user_connected', { socket, connectionInfo });
  }

  private setupSocketEvents(socket: Socket, connectionInfo: ConnectionInfo) {
    // Authentication
    socket.on('authenticate', async (data) => {
      await this.handleAuthentication(socket, connectionInfo, data);
    });

    // Channel management
    socket.on('join_channel', async (data) => {
      await this.handleJoinChannel(socket, connectionInfo, data);
    });

    socket.on('leave_channel', async (data) => {
      await this.handleLeaveChannel(socket, connectionInfo, data);
    });

    // Presence updates
    socket.on('update_presence', async (data) => {
      await this.handlePresenceUpdate(socket, connectionInfo, data);
    });

    // Real-time messaging
    socket.on('send_message', async (data) => {
      await this.handleMessage(socket, connectionInfo, data);
    });

    // Network quality updates
    socket.on('network_quality', async (data) => {
      await this.handleNetworkQuality(socket, connectionInfo, data);
    });

    // Bangladesh-specific optimizations
    socket.on('request_optimization', async (data) => {
      await this.handleOptimizationRequest(socket, connectionInfo, data);
    });

    // Activity tracking
    socket.on('activity', () => {
      this.updateLastActivity(socket.id);
    });

    // Ping/Pong for latency measurement
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback(Date.now());
      }
    });

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, connectionInfo, reason);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
      this.emit('socket_error', { socket, connectionInfo, error });
    });
  }

  private async handleAuthentication(socket: Socket, connectionInfo: ConnectionInfo, data: any) {
    try {
      const { token, userId, deviceInfo } = data;

      // Validate JWT token (integrate with auth service)
      const isValid = await this.validateToken(token);
      
      if (isValid && userId) {
        connectionInfo.userId = userId;
        connectionInfo.authenticated = true;
        connectionInfo.deviceInfo = { ...connectionInfo.deviceInfo, ...deviceInfo };
        
        // Update in memory and Redis
        this.connections.set(socket.id, connectionInfo);
        await this.storeConnectionInRedis(connectionInfo);
        
        // Add to user's socket list
        await this.redis.sAdd(`user_sockets:${userId}`, socket.id);
        await this.redis.hSet(`socket_user_map`, socket.id, userId);

        socket.emit('authenticated', {
          success: true,
          userId,
          features: this.getUserFeatures(userId),
          bangladeshFeatures: {
            banglaSupport: true,
            mobileOptimized: true,
            offlineSync: true
          }
        });

        // Join user-specific channel
        await socket.join(`user:${userId}`);
        connectionInfo.channels.push(`user:${userId}`);

        this.emit('user_authenticated', { socket, connectionInfo });
      } else {
        socket.emit('authentication_failed', {
          error: 'Invalid token or credentials'
        });
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      socket.emit('authentication_failed', {
        error: 'Authentication failed'
      });
    }
  }

  private async handleJoinChannel(socket: Socket, connectionInfo: ConnectionInfo, data: any) {
    try {
      const { channels, permissions } = data;

      if (!Array.isArray(channels)) {
        socket.emit('channel_error', { error: 'Channels must be an array' });
        return;
      }

      const joinedChannels = [];
      
      for (const channel of channels) {
        // Validate channel access
        const hasAccess = await this.validateChannelAccess(connectionInfo.userId, channel, permissions);
        
        if (hasAccess) {
          await socket.join(channel);
          connectionInfo.channels.push(channel);
          joinedChannels.push(channel);

          // Track channel membership
          await this.redis.sAdd(`channel:${channel}`, socket.id);
          await this.redis.hSet(`channel_info:${channel}`, 'lastActivity', Date.now().toString());
        }
      }

      // Update connection info
      this.connections.set(socket.id, connectionInfo);
      await this.storeConnectionInRedis(connectionInfo);

      socket.emit('channels_joined', {
        success: true,
        joinedChannels,
        totalChannels: connectionInfo.channels.length
      });

      this.emit('channels_joined', { socket, connectionInfo, channels: joinedChannels });
    } catch (error) {
      console.error('❌ Error joining channels:', error);
      socket.emit('channel_error', { error: 'Failed to join channels' });
    }
  }

  private async handleLeaveChannel(socket: Socket, connectionInfo: ConnectionInfo, data: any) {
    try {
      const { channels } = data;

      const leftChannels = [];
      
      for (const channel of channels) {
        await socket.leave(channel);
        connectionInfo.channels = connectionInfo.channels.filter(c => c !== channel);
        leftChannels.push(channel);

        // Remove from channel tracking
        await this.redis.sRem(`channel:${channel}`, socket.id);
      }

      this.connections.set(socket.id, connectionInfo);
      await this.storeConnectionInRedis(connectionInfo);

      socket.emit('channels_left', {
        success: true,
        leftChannels,
        remainingChannels: connectionInfo.channels
      });
    } catch (error) {
      console.error('❌ Error leaving channels:', error);
    }
  }

  private async handlePresenceUpdate(socket: Socket, connectionInfo: ConnectionInfo, data: any) {
    try {
      const { status, activity, location } = data;

      // Update presence in Redis
      if (connectionInfo.userId) {
        await this.redis.hSet(`user_presence:${connectionInfo.userId}`, {
          status: status || 'online',
          lastActivity: Date.now().toString(),
          socketId: socket.id,
          activity: JSON.stringify(activity || {}),
          location: JSON.stringify(location || connectionInfo.location)
        });

        // Broadcast presence update
        socket.broadcast.emit('presence_update', {
          userId: connectionInfo.userId,
          status,
          lastActivity: Date.now(),
          activity
        });
      }
    } catch (error) {
      console.error('❌ Error updating presence:', error);
    }
  }

  private async handleMessage(socket: Socket, connectionInfo: ConnectionInfo, data: any) {
    try {
      const { channel, message, type, metadata } = data;

      if (!connectionInfo.authenticated) {
        socket.emit('message_error', { error: 'Authentication required' });
        return;
      }

      const messageData = {
        id: this.generateMessageId(),
        channel,
        senderId: connectionInfo.userId,
        message,
        type: type || 'text',
        metadata: metadata || {},
        timestamp: Date.now(),
        socketId: socket.id
      };

      // Store message if needed
      if (this.shouldStoreMessage(channel)) {
        await this.storeMessage(messageData);
      }

      // Broadcast to channel
      this.io!.to(channel).emit('message', messageData);

      socket.emit('message_sent', {
        messageId: messageData.id,
        timestamp: messageData.timestamp
      });

      this.emit('message_sent', { socket, connectionInfo, message: messageData });
    } catch (error) {
      console.error('❌ Error handling message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  }

  private async handleNetworkQuality(socket: Socket, connectionInfo: ConnectionInfo, data: any) {
    try {
      const { latency, bandwidth, packetLoss } = data;

      connectionInfo.networkQuality = {
        latency: latency || 0,
        bandwidth: bandwidth || '4g',
        quality: this.calculateNetworkQuality(latency, bandwidth, packetLoss)
      };

      // Optimize for Bangladesh network conditions
      if (connectionInfo.location.country === 'BD' && (bandwidth === '2g' || latency > 1000)) {
        socket.emit('network_optimization', {
          enabled: true,
          settings: {
            reducedUpdates: true,
            compression: true,
            prioritizeText: true,
            batchUpdates: true
          }
        });
      }

      this.connections.set(socket.id, connectionInfo);
    } catch (error) {
      console.error('❌ Error handling network quality:', error);
    }
  }

  private async handleOptimizationRequest(socket: Socket, connectionInfo: ConnectionInfo, data: any) {
    try {
      const { type, settings } = data;

      // Bangladesh-specific optimizations
      if (type === 'bangladesh_mobile') {
        socket.emit('optimization_applied', {
          type: 'bangladesh_mobile',
          settings: {
            reducedFrequency: true,
            textPriority: true,
            imageCompression: true,
            banglaFont: true,
            offlineSync: true
          }
        });
      }

      this.emit('optimization_requested', { socket, connectionInfo, type, settings });
    } catch (error) {
      console.error('❌ Error handling optimization request:', error);
    }
  }

  private async handleDisconnection(socket: Socket, connectionInfo: ConnectionInfo, reason: string) {
    console.log(`🔌 Socket disconnected: ${socket.id}, Reason: ${reason}`);

    try {
      // Cleanup Redis data
      await this.cleanupConnectionData(socket.id, connectionInfo);

      // Remove from memory
      this.connections.delete(socket.id);

      // Broadcast user offline if authenticated
      if (connectionInfo.authenticated && connectionInfo.userId) {
        const remainingSockets = await this.redis.sCard(`user_sockets:${connectionInfo.userId}`);
        if (remainingSockets === 0) {
          socket.broadcast.emit('user_offline', {
            userId: connectionInfo.userId,
            timestamp: Date.now()
          });
        }
      }

      this.emit('user_disconnected', { socket, connectionInfo, reason });
    } catch (error) {
      console.error('❌ Error handling disconnection:', error);
    }
  }

  // Public API methods

  public async sendToUser(userId: string, event: string, data: any) {
    const userSockets = await this.redis.sMembers(`user_sockets:${userId}`);
    
    for (const socketId of userSockets) {
      const socket = this.io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    }
  }

  public async broadcastToChannel(channel: string, event: string, data: any) {
    this.io?.to(channel).emit(event, data);
  }

  public async broadcast(event: string, data: any) {
    this.io?.emit(event, data);
  }

  public getConnectionStats() {
    return {
      totalConnections: this.connections.size,
      authenticatedConnections: Array.from(this.connections.values()).filter(c => c.authenticated).length,
      channelStats: this.getChannelStats(),
      networkQualityStats: this.getNetworkQualityStats()
    };
  }

  // Helper methods

  private updateLastActivity(socketId: string) {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.lastActivity = new Date();
      this.connections.set(socketId, connection);
    }
  }

  private parseDeviceInfo(userAgent: string) {
    // Parse user agent to extract device info
    return {
      type: this.detectDeviceType(userAgent),
      os: this.detectOS(userAgent),
      browser: this.detectBrowser(userAgent)
    } as const;
  }

  private detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent)) {
      return /iPad|Tablet/i.test(userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  private detectOS(userAgent: string): string {
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac/i.test(userAgent)) return 'macOS';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iOS|iPhone|iPad/i.test(userAgent)) return 'iOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    return 'Unknown';
  }

  private detectBrowser(userAgent: string): string {
    if (/Chrome/i.test(userAgent)) return 'Chrome';
    if (/Firefox/i.test(userAgent)) return 'Firefox';
    if (/Safari/i.test(userAgent)) return 'Safari';
    if (/Edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }

  private async getLocationFromIP(ip: string) {
    // In production, integrate with IP geolocation service
    return {
      country: 'BD',
      city: 'Dhaka',
      coordinates: [90.4125, 23.8103] as [number, number]
    };
  }

  private async validateToken(token: string): Promise<boolean> {
    // Integrate with auth service to validate JWT token
    return true; // Placeholder
  }

  private getUserFeatures(userId: string) {
    return ['chat', 'notifications', 'real-time-updates', 'presence', 'voice-calls'];
  }

  private async validateChannelAccess(userId: string | undefined, channel: string, permissions: any): Promise<boolean> {
    // Implement channel access validation logic
    return true; // Placeholder
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldStoreMessage(channel: string): boolean {
    // Define which channels need message persistence
    return channel.startsWith('chat:') || channel.startsWith('support:');
  }

  private async storeMessage(messageData: any) {
    // Store message in database for persistence
    await this.redis.lPush(`messages:${messageData.channel}`, JSON.stringify(messageData));
  }

  private calculateNetworkQuality(latency: number, bandwidth: string, packetLoss: number): 'poor' | 'fair' | 'good' | 'excellent' {
    if (latency > 1000 || bandwidth === '2g' || packetLoss > 5) return 'poor';
    if (latency > 500 || bandwidth === '3g' || packetLoss > 2) return 'fair';
    if (latency > 100 || bandwidth === '4g' || packetLoss > 0.5) return 'good';
    return 'excellent';
  }

  private async storeConnectionInRedis(connectionInfo: ConnectionInfo) {
    try {
      await this.redis.hSet(`connection:${connectionInfo.socketId}`, {
        data: JSON.stringify(connectionInfo)
      });
      await this.redis.sAdd('active_connections', connectionInfo.socketId);
    } catch (error) {
      console.warn('⚠️ Failed to store connection in Redis:', error.message);
    }
  }

  private async cleanupConnectionData(socketId: string, connectionInfo: ConnectionInfo) {
    try {
      // Remove from active connections
      await this.redis.sRem('active_connections', socketId);
      await this.redis.hDel('connection', socketId);

      // Remove from user sockets if authenticated
      if (connectionInfo.userId) {
        await this.redis.sRem(`user_sockets:${connectionInfo.userId}`, socketId);
        await this.redis.hDel('socket_user_map', socketId);
      }

      // Remove from channels
      for (const channel of connectionInfo.channels) {
        await this.redis.sRem(`channel:${channel}`, socketId);
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup connection data:', error.message);
    }
  }

  private getChannelStats() {
    const channelCounts: Record<string, number> = {};
    this.connections.forEach(connection => {
      connection.channels.forEach(channel => {
        channelCounts[channel] = (channelCounts[channel] || 0) + 1;
      });
    });
    return channelCounts;
  }

  private getNetworkQualityStats() {
    const qualityStats = { poor: 0, fair: 0, good: 0, excellent: 0 };
    this.connections.forEach(connection => {
      qualityStats[connection.networkQuality.quality]++;
    });
    return qualityStats;
  }

  private async handleRedisMessage(message: string) {
    try {
      const event = JSON.parse(message);
      this.io?.emit(event.type, event.data);
    } catch (error) {
      console.error('❌ Error handling Redis message:', error);
    }
  }

  private async handleBroadcastMessage(message: string) {
    try {
      const event = JSON.parse(message);
      this.io?.emit('broadcast', event);
    } catch (error) {
      console.error('❌ Error handling broadcast message:', error);
    }
  }

  public getIO(): SocketIOServer | undefined {
    return this.io;
  }
}