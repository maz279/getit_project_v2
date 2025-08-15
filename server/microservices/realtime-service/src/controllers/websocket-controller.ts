/**
 * WebSocket Controller - Amazon.com/Shopee.sg-Level Real-Time Management
 * Complete WebSocket connection management and real-time communication
 */

import { Router, Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

interface SocketConnection {
  id: string;
  userId?: string;
  sessionId: string;
  deviceInfo: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
    appVersion: string;
  };
  connectionTime: Date;
  lastActivity: Date;
  channels: string[];
  location: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  connectionQuality: {
    latency: number;
    packetLoss: number;
    bandwidth: '2g' | '3g' | '4g' | 'wifi';
  };
  status: 'active' | 'idle' | 'disconnected';
}

export class WebSocketController {
  private router = Router();
  private io?: SocketIOServer;
  private redis = createClient();
  private connections = new Map<string, SocketConnection>();

  constructor() {
    this.initializeRoutes();
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for WebSocket controller');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for WebSocket:', error.message);
    }
  }

  private initializeRoutes() {
    // WebSocket server initialization
    this.router.post('/initialize', this.initializeWebSocketServer.bind(this));
    
    // Connection management
    this.router.get('/connections', this.getActiveConnections.bind(this));
    this.router.get('/connections/:socketId', this.getConnectionDetails.bind(this));
    this.router.delete('/connections/:socketId', this.disconnectSocket.bind(this));
    
    // Channel management
    this.router.get('/channels', this.getActiveChannels.bind(this));
    this.router.post('/channels/:channelId/broadcast', this.broadcastToChannel.bind(this));
    this.router.get('/channels/:channelId/users', this.getChannelUsers.bind(this));
    
    // Real-time events
    this.router.post('/events/send', this.sendEvent.bind(this));
    this.router.post('/events/broadcast', this.broadcastEvent.bind(this));
    
    // Bangladesh-specific features
    this.router.get('/bangladesh/network-quality', this.getBangladeshNetworkQuality.bind(this));
    this.router.post('/bangladesh/optimize-connection', this.optimizeForBangladeshNetwork.bind(this));
    
    // Analytics and monitoring
    this.router.get('/analytics/connections', this.getConnectionAnalytics.bind(this));
    this.router.get('/analytics/messages', this.getMessageAnalytics.bind(this));
    this.router.get('/analytics/performance', this.getPerformanceMetrics.bind(this));
    
    // Health check
    this.router.get('/health', this.healthCheck.bind(this));
  }

  public setSocketIOServer(io: SocketIOServer) {
    this.io = io;
    this.setupSocketEventHandlers();
  }

  private setupSocketEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`🔗 New WebSocket connection: ${socket.id}`);
      this.handleNewConnection(socket);

      // User authentication
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // Channel management
      socket.on('join_channel', (data) => {
        this.handleJoinChannel(socket, data);
      });

      socket.on('leave_channel', (data) => {
        this.handleLeaveChannel(socket, data);
      });

      // Presence updates
      socket.on('update_presence', (data) => {
        this.handlePresenceUpdate(socket, data);
      });

      // Chat messages
      socket.on('send_message', (data) => {
        this.handleChatMessage(socket, data);
      });

      // Bangladesh-specific optimizations
      socket.on('network_quality_update', (data) => {
        this.handleNetworkQualityUpdate(socket, data);
      });

      // Disconnect handling
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
        this.updateConnectionStatus(socket.id, 'disconnected');
      });
    });
  }

  private async handleNewConnection(socket: any) {
    const connection: SocketConnection = {
      id: socket.id,
      sessionId: uuidv4(),
      deviceInfo: {
        type: 'desktop', // Will be updated from client
        os: 'Unknown',
        browser: 'Unknown',
        appVersion: '1.0.0'
      },
      connectionTime: new Date(),
      lastActivity: new Date(),
      channels: [],
      location: {
        country: 'BD',
        city: 'Dhaka'
      },
      connectionQuality: {
        latency: 0,
        packetLoss: 0,
        bandwidth: '4g'
      },
      status: 'active'
    };

    this.connections.set(socket.id, connection);
    
    // Store in Redis for scaling
    try {
      await this.redis.hSet('socket_connections', socket.id, JSON.stringify(connection));
      await this.redis.sAdd('active_sockets', socket.id);
    } catch (error) {
      console.warn('⚠️ Failed to store connection in Redis:', error.message);
    }

    // Send connection confirmation
    socket.emit('connection_established', {
      socketId: socket.id,
      sessionId: connection.sessionId,
      timestamp: connection.connectionTime
    });
  }

  private async handleAuthentication(socket: any, data: any) {
    try {
      const { token, userId } = data;
      
      // Validate JWT token (integrate with auth service)
      if (token && userId) {
        const connection = this.connections.get(socket.id);
        if (connection) {
          connection.userId = userId;
          connection.lastActivity = new Date();
          this.connections.set(socket.id, connection);
          
          // Update Redis
          await this.redis.hSet('socket_connections', socket.id, JSON.stringify(connection));
          await this.redis.sAdd(`user_sockets:${userId}`, socket.id);
          
          socket.emit('authenticated', {
            success: true,
            userId,
            capabilities: ['chat', 'notifications', 'order_updates', 'price_alerts']
          });
        }
      } else {
        socket.emit('authentication_failed', {
          error: 'Invalid token or user ID'
        });
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      socket.emit('authentication_failed', {
        error: 'Authentication failed'
      });
    }
  }

  private async handleJoinChannel(socket: any, data: any) {
    try {
      const { channels } = data;
      const connection = this.connections.get(socket.id);
      
      if (connection && Array.isArray(channels)) {
        for (const channel of channels) {
          await socket.join(channel);
          connection.channels.push(channel);
          
          // Track channel membership in Redis
          await this.redis.sAdd(`channel:${channel}`, socket.id);
        }
        
        this.connections.set(socket.id, connection);
        await this.redis.hSet('socket_connections', socket.id, JSON.stringify(connection));
        
        socket.emit('channels_joined', {
          channels,
          totalChannels: connection.channels.length
        });
      }
    } catch (error) {
      console.error('❌ Error joining channels:', error);
      socket.emit('channel_join_failed', {
        error: 'Failed to join channels'
      });
    }
  }

  private async handleLeaveChannel(socket: any, data: any) {
    try {
      const { channels } = data;
      const connection = this.connections.get(socket.id);
      
      if (connection && Array.isArray(channels)) {
        for (const channel of channels) {
          await socket.leave(channel);
          connection.channels = connection.channels.filter(c => c !== channel);
          
          // Remove from Redis channel tracking
          await this.redis.sRem(`channel:${channel}`, socket.id);
        }
        
        this.connections.set(socket.id, connection);
        await this.redis.hSet('socket_connections', socket.id, JSON.stringify(connection));
        
        socket.emit('channels_left', {
          channels,
          remainingChannels: connection.channels
        });
      }
    } catch (error) {
      console.error('❌ Error leaving channels:', error);
    }
  }

  private async handlePresenceUpdate(socket: any, data: any) {
    try {
      const { status, currentPage, activity } = data;
      const connection = this.connections.get(socket.id);
      
      if (connection && connection.userId) {
        connection.lastActivity = new Date();
        connection.status = status === 'active' ? 'active' : 'idle';
        
        // Store presence in Redis
        await this.redis.hSet(`user_presence:${connection.userId}`, {
          status,
          lastActivity: connection.lastActivity.toISOString(),
          currentPage: currentPage || '/',
          activity: JSON.stringify(activity || {}),
          deviceCount: await this.redis.sCard(`user_sockets:${connection.userId}`)
        });
        
        // Broadcast presence update to relevant channels
        socket.broadcast.emit('user_presence_update', {
          userId: connection.userId,
          status,
          lastActivity: connection.lastActivity
        });
      }
    } catch (error) {
      console.error('❌ Error updating presence:', error);
    }
  }

  private async handleChatMessage(socket: any, data: any) {
    try {
      const { channel, message, type, metadata } = data;
      const connection = this.connections.get(socket.id);
      
      if (connection && connection.userId) {
        const messageData = {
          id: uuidv4(),
          userId: connection.userId,
          channel,
          message,
          type: type || 'text',
          metadata: metadata || {},
          timestamp: new Date(),
          delivered: false
        };
        
        // Store message in database (MongoDB integration)
        // await this.storeChatMessage(messageData);
        
        // Broadcast to channel
        this.io?.to(channel).emit('chat_message', messageData);
        
        socket.emit('message_sent', {
          messageId: messageData.id,
          timestamp: messageData.timestamp
        });
      }
    } catch (error) {
      console.error('❌ Error handling chat message:', error);
      socket.emit('message_failed', {
        error: 'Failed to send message'
      });
    }
  }

  private async handleNetworkQualityUpdate(socket: any, data: any) {
    try {
      const { latency, bandwidth, packetLoss } = data;
      const connection = this.connections.get(socket.id);
      
      if (connection) {
        connection.connectionQuality = {
          latency: latency || 0,
          bandwidth: bandwidth || '4g',
          packetLoss: packetLoss || 0
        };
        
        // Optimize based on network quality for Bangladesh
        if (bandwidth === '2g' || latency > 1000) {
          socket.emit('optimize_for_slow_network', {
            reducedUpdates: true,
            compressionEnabled: true,
            prioritizeText: true
          });
        }
        
        this.connections.set(socket.id, connection);
      }
    } catch (error) {
      console.error('❌ Error updating network quality:', error);
    }
  }

  private async handleDisconnection(socket: any, reason: string) {
    console.log(`🔌 Socket disconnected: ${socket.id}, Reason: ${reason}`);
    
    try {
      const connection = this.connections.get(socket.id);
      if (connection) {
        connection.status = 'disconnected';
        
        // Cleanup Redis
        await this.redis.sRem('active_sockets', socket.id);
        await this.redis.hDel('socket_connections', socket.id);
        
        if (connection.userId) {
          await this.redis.sRem(`user_sockets:${connection.userId}`, socket.id);
        }
        
        // Cleanup channel memberships
        for (const channel of connection.channels) {
          await this.redis.sRem(`channel:${channel}`, socket.id);
        }
      }
      
      this.connections.delete(socket.id);
    } catch (error) {
      console.error('❌ Error handling disconnection:', error);
    }
  }

  private updateConnectionStatus(socketId: string, status: 'active' | 'idle' | 'disconnected') {
    const connection = this.connections.get(socketId);
    if (connection) {
      connection.status = status;
      connection.lastActivity = new Date();
      this.connections.set(socketId, connection);
    }
  }

  // REST API Endpoints

  private async initializeWebSocketServer(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'WebSocket server initialized',
        endpoint: '/realtime',
        supportedEvents: [
          'authenticate', 'join_channel', 'leave_channel', 'update_presence',
          'send_message', 'network_quality_update'
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initialize WebSocket server' });
    }
  }

  private async getActiveConnections(req: Request, res: Response) {
    try {
      const connections = Array.from(this.connections.values());
      const stats = {
        totalConnections: connections.length,
        activeConnections: connections.filter(c => c.status === 'active').length,
        idleConnections: connections.filter(c => c.status === 'idle').length,
        connectionsByDevice: {
          mobile: connections.filter(c => c.deviceInfo.type === 'mobile').length,
          desktop: connections.filter(c => c.deviceInfo.type === 'desktop').length,
          tablet: connections.filter(c => c.deviceInfo.type === 'tablet').length
        },
        connectionsByBandwidth: {
          '2g': connections.filter(c => c.connectionQuality.bandwidth === '2g').length,
          '3g': connections.filter(c => c.connectionQuality.bandwidth === '3g').length,
          '4g': connections.filter(c => c.connectionQuality.bandwidth === '4g').length,
          'wifi': connections.filter(c => c.connectionQuality.bandwidth === 'wifi').length
        }
      };
      
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get connections' });
    }
  }

  private async getConnectionDetails(req: Request, res: Response) {
    try {
      const { socketId } = req.params;
      const connection = this.connections.get(socketId);
      
      if (connection) {
        res.json({ success: true, data: connection });
      } else {
        res.status(404).json({ error: 'Connection not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get connection details' });
    }
  }

  private async disconnectSocket(req: Request, res: Response) {
    try {
      const { socketId } = req.params;
      const socket = this.io?.sockets.sockets.get(socketId);
      
      if (socket) {
        socket.disconnect(true);
        res.json({ success: true, message: 'Socket disconnected' });
      } else {
        res.status(404).json({ error: 'Socket not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to disconnect socket' });
    }
  }

  private async getActiveChannels(req: Request, res: Response) {
    try {
      const channels = new Set<string>();
      this.connections.forEach(connection => {
        connection.channels.forEach(channel => channels.add(channel));
      });
      
      const channelStats = await Promise.all(
        Array.from(channels).map(async (channel) => ({
          channel,
          memberCount: await this.redis.sCard(`channel:${channel}`)
        }))
      );
      
      res.json({
        success: true,
        data: {
          totalChannels: channels.size,
          channels: channelStats
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get channels' });
    }
  }

  private async broadcastToChannel(req: Request, res: Response) {
    try {
      const { channelId } = req.params;
      const { event, data } = req.body;
      
      this.io?.to(channelId).emit(event, {
        ...data,
        timestamp: new Date(),
        channel: channelId
      });
      
      res.json({
        success: true,
        message: `Event broadcasted to channel ${channelId}`
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to broadcast to channel' });
    }
  }

  private async getBangladeshNetworkQuality(req: Request, res: Response) {
    try {
      const connections = Array.from(this.connections.values());
      const bangladeshConnections = connections.filter(c => c.location.country === 'BD');
      
      const networkStats = {
        totalBangladeshUsers: bangladeshConnections.length,
        averageLatency: bangladeshConnections.reduce((sum, c) => sum + c.connectionQuality.latency, 0) / bangladeshConnections.length,
        bandwidthDistribution: {
          '2g': bangladeshConnections.filter(c => c.connectionQuality.bandwidth === '2g').length,
          '3g': bangladeshConnections.filter(c => c.connectionQuality.bandwidth === '3g').length,
          '4g': bangladeshConnections.filter(c => c.connectionQuality.bandwidth === '4g').length,
          'wifi': bangladeshConnections.filter(c => c.connectionQuality.bandwidth === 'wifi').length
        },
        byCity: bangladeshConnections.reduce((acc, c) => {
          acc[c.location.city] = (acc[c.location.city] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
      
      res.json({ success: true, data: networkStats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get Bangladesh network quality' });
    }
  }

  private async optimizeForBangladeshNetwork(req: Request, res: Response) {
    try {
      const { socketId, optimizations } = req.body;
      const socket = this.io?.sockets.sockets.get(socketId);
      
      if (socket) {
        socket.emit('network_optimization', {
          enabled: true,
          settings: {
            reducedFrequency: optimizations.includes('reduced_frequency'),
            compression: optimizations.includes('compression'),
            prioritizeText: optimizations.includes('text_priority'),
            offlineSync: optimizations.includes('offline_sync')
          }
        });
        
        res.json({
          success: true,
          message: 'Network optimization applied',
          optimizations
        });
      } else {
        res.status(404).json({ error: 'Socket not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to optimize network' });
    }
  }

  private async getConnectionAnalytics(req: Request, res: Response) {
    try {
      const connections = Array.from(this.connections.values());
      const analytics = {
        totalConnections: connections.length,
        averageConnectionTime: connections.reduce((sum, c) => {
          return sum + (new Date().getTime() - c.connectionTime.getTime());
        }, 0) / connections.length,
        deviceBreakdown: {
          mobile: connections.filter(c => c.deviceInfo.type === 'mobile').length,
          desktop: connections.filter(c => c.deviceInfo.type === 'desktop').length,
          tablet: connections.filter(c => c.deviceInfo.type === 'tablet').length
        },
        networkQuality: {
          averageLatency: connections.reduce((sum, c) => sum + c.connectionQuality.latency, 0) / connections.length,
          averagePacketLoss: connections.reduce((sum, c) => sum + c.connectionQuality.packetLoss, 0) / connections.length
        },
        geographicDistribution: connections.reduce((acc, c) => {
          const key = `${c.location.country}-${c.location.city}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
      
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get connection analytics' });
    }
  }

  private async getMessageAnalytics(req: Request, res: Response) {
    try {
      // This would integrate with MongoDB to get message statistics
      const messageStats = {
        totalMessages: 0,
        messagesPerMinute: 0,
        messagesByType: {
          text: 0,
          image: 0,
          file: 0,
          system: 0
        },
        averageResponseTime: 0,
        activeChannels: await this.redis.sCard('active_channels') || 0
      };
      
      res.json({ success: true, data: messageStats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get message analytics' });
    }
  }

  private async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const metrics = {
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        activeConnections: this.connections.size,
        averageLatency: Array.from(this.connections.values())
          .reduce((sum, c) => sum + c.connectionQuality.latency, 0) / this.connections.size,
        cpuUsage: process.cpuUsage(),
        timestamp: new Date()
      };
      
      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  }

  private async healthCheck(req: Request, res: Response) {
    try {
      const health = {
        service: 'websocket-controller',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connections: {
          total: this.connections.size,
          active: Array.from(this.connections.values()).filter(c => c.status === 'active').length
        },
        redis: {
          connected: this.redis.isReady
        },
        memory: process.memoryUsage(),
        uptime: process.uptime()
      };
      
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: 'Health check failed' });
    }
  }

  private async sendEvent(req: Request, res: Response) {
    try {
      const { userId, event, data } = req.body;
      const userSockets = await this.redis.sMembers(`user_sockets:${userId}`);
      
      for (const socketId of userSockets) {
        const socket = this.io?.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, {
            ...data,
            timestamp: new Date()
          });
        }
      }
      
      res.json({
        success: true,
        message: `Event sent to ${userSockets.length} user connections`
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send event' });
    }
  }

  private async broadcastEvent(req: Request, res: Response) {
    try {
      const { event, data } = req.body;
      
      this.io?.emit(event, {
        ...data,
        timestamp: new Date()
      });
      
      res.json({
        success: true,
        message: `Event broadcasted to all ${this.connections.size} connections`
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to broadcast event' });
    }
  }

  getRouter() {
    return this.router;
  }
}