/**
 * Socket Authentication Middleware
 * Amazon.com/Shopee.sg-Level WebSocket authentication and authorization
 */

import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  permissions?: string[];
  sessionId?: string;
  authenticated?: boolean;
}

interface JWTPayload {
  userId: string;
  role: string;
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

class SocketAuthenticationMiddleware {
  private redis = createClient();
  private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected for Socket Auth middleware');
    } catch (error) {
      console.warn('⚠️ Redis connection failed for Socket Auth:', error.message);
    }
  }

  // Main authentication middleware
  public authenticate = async (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void) => {
    try {
      const token = this.extractToken(socket);
      
      if (!token) {
        // Allow connection but mark as unauthenticated
        socket.authenticated = false;
        return next();
      }

      const payload = await this.verifyToken(token);
      if (!payload) {
        socket.authenticated = false;
        return next();
      }

      // Check if session is still valid
      const isSessionValid = await this.validateSession(payload.sessionId, payload.userId);
      if (!isSessionValid) {
        socket.authenticated = false;
        return next();
      }

      // Set user information on socket
      socket.userId = payload.userId;
      socket.userRole = payload.role;
      socket.permissions = payload.permissions;
      socket.sessionId = payload.sessionId;
      socket.authenticated = true;

      // Store socket authentication in Redis
      await this.storeSocketAuth(socket.id, payload.userId, payload.sessionId);

      console.log(`✅ Socket authenticated: ${socket.id} -> User: ${payload.userId}`);
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error);
      socket.authenticated = false;
      next();
    }
  };

  // Channel access authorization
  public authorizeChannelAccess = (requiredPermissions: string[] = []) => {
    return async (socket: AuthenticatedSocket, channelName: string, next: (err?: Error) => void) => {
      try {
        if (!socket.authenticated || !socket.userId) {
          return next(new Error('Authentication required for channel access'));
        }

        // Check channel-specific permissions
        const hasAccess = await this.checkChannelAccess(
          socket.userId,
          channelName,
          socket.permissions || [],
          requiredPermissions
        );

        if (!hasAccess) {
          return next(new Error('Insufficient permissions for channel access'));
        }

        // Log channel access
        await this.logChannelAccess(socket.userId, channelName, socket.id);
        
        next();
      } catch (error) {
        console.error('❌ Channel authorization error:', error);
        next(new Error('Channel authorization failed'));
      }
    };
  };

  // Rate limiting middleware
  public rateLimitByUser = (maxRequestsPerMinute: number = 60) => {
    return async (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void) => {
      try {
        const identifier = socket.userId || socket.handshake.address;
        const key = `rate_limit:${identifier}`;
        
        const current = await this.redis.incr(key);
        
        if (current === 1) {
          await this.redis.expire(key, 60); // 1 minute window
        }
        
        if (current > maxRequestsPerMinute) {
          return next(new Error('Rate limit exceeded'));
        }
        
        next();
      } catch (error) {
        console.error('❌ Rate limiting error:', error);
        next();
      }
    };
  };

  // Admin authentication middleware
  public requireAdmin = (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void) => {
    if (!socket.authenticated || socket.userRole !== 'admin') {
      return next(new Error('Admin access required'));
    }
    next();
  };

  // Vendor authentication middleware
  public requireVendor = (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void) => {
    if (!socket.authenticated || !['vendor', 'admin'].includes(socket.userRole || '')) {
      return next(new Error('Vendor access required'));
    }
    next();
  };

  // Bangladesh-specific authentication
  public requireBangladeshUser = async (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void) => {
    try {
      if (!socket.authenticated || !socket.userId) {
        return next(new Error('Authentication required'));
      }

      const userLocation = await this.getUserLocation(socket.userId);
      if (userLocation?.country !== 'BD') {
        return next(new Error('Bangladesh users only'));
      }

      next();
    } catch (error) {
      console.error('❌ Bangladesh user check error:', error);
      next(new Error('Location verification failed'));
    }
  };

  // Helper methods

  private extractToken(socket: Socket): string | null {
    // Try to get token from auth header
    const authHeader = socket.handshake.auth?.token;
    if (authHeader) {
      return authHeader;
    }

    // Try to get token from query parameters
    const queryToken = socket.handshake.query?.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }

    // Try to get token from headers
    const headerToken = socket.handshake.headers.authorization;
    if (headerToken && headerToken.startsWith('Bearer ')) {
      return headerToken.substring(7);
    }

    return null;
  }

  private async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JWTPayload;
      
      // Check if token is not expired
      if (payload.exp < Date.now() / 1000) {
        return null;
      }

      return payload;
    } catch (error) {
      console.warn('⚠️ Token verification failed:', error.message);
      return null;
    }
  }

  private async validateSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const storedSession = await this.redis.hGet(`user_session:${userId}`, 'sessionId');
      return storedSession === sessionId;
    } catch (error) {
      console.warn('⚠️ Session validation failed:', error.message);
      return false;
    }
  }

  private async storeSocketAuth(socketId: string, userId: string, sessionId: string) {
    try {
      await Promise.all([
        this.redis.hSet(`socket_auth:${socketId}`, {
          userId,
          sessionId,
          authenticatedAt: Date.now().toString()
        }),
        this.redis.sAdd(`user_sockets:${userId}`, socketId),
        this.redis.expire(`socket_auth:${socketId}`, 3600) // 1 hour
      ]);
    } catch (error) {
      console.warn('⚠️ Failed to store socket auth:', error.message);
    }
  }

  private async checkChannelAccess(
    userId: string,
    channelName: string,
    userPermissions: string[],
    requiredPermissions: string[]
  ): Promise<boolean> {
    try {
      // System channels require authentication
      if (channelName.startsWith('system:') || channelName.startsWith('admin:')) {
        return userPermissions.includes('admin') || userPermissions.includes('system_access');
      }

      // User-specific channels
      if (channelName.startsWith('user:')) {
        const channelUserId = channelName.split(':')[1];
        return channelUserId === userId || userPermissions.includes('admin');
      }

      // Vendor channels
      if (channelName.startsWith('vendor:')) {
        const vendorId = channelName.split(':')[1];
        return await this.isUserVendor(userId, vendorId) || userPermissions.includes('admin');
      }

      // Order channels
      if (channelName.startsWith('order:')) {
        const orderId = channelName.split(':')[1];
        return await this.isUserInvolvedInOrder(userId, orderId);
      }

      // Chat channels
      if (channelName.startsWith('chat:')) {
        const chatId = channelName.split(':')[1];
        return await this.isUserInChat(userId, chatId);
      }

      // Public channels (products, categories, etc.)
      if (channelName.startsWith('product:') || channelName.startsWith('category:')) {
        return true; // Public access
      }

      // Check required permissions
      if (requiredPermissions.length > 0) {
        return requiredPermissions.some(permission => userPermissions.includes(permission));
      }

      // Default: allow access
      return true;
    } catch (error) {
      console.error('❌ Channel access check error:', error);
      return false;
    }
  }

  private async isUserVendor(userId: string, vendorId: string): Promise<boolean> {
    try {
      const vendorInfo = await this.redis.hGet(`vendor_info:${vendorId}`, 'userId');
      return vendorInfo === userId;
    } catch (error) {
      return false;
    }
  }

  private async isUserInvolvedInOrder(userId: string, orderId: string): Promise<boolean> {
    try {
      const orderInfo = await this.redis.hGetAll(`order_info:${orderId}`);
      return orderInfo.customerId === userId || orderInfo.vendorId === userId;
    } catch (error) {
      return false;
    }
  }

  private async isUserInChat(userId: string, chatId: string): Promise<boolean> {
    try {
      const isParticipant = await this.redis.sIsMember(`chat_participants:${chatId}`, userId);
      return isParticipant;
    } catch (error) {
      return false;
    }
  }

  private async getUserLocation(userId: string): Promise<{ country: string; city: string } | null> {
    try {
      const locationData = await this.redis.hGetAll(`user_location:${userId}`);
      if (locationData.country) {
        return {
          country: locationData.country,
          city: locationData.city || 'Unknown'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async logChannelAccess(userId: string, channelName: string, socketId: string) {
    try {
      const logEntry = {
        userId,
        channelName,
        socketId,
        timestamp: Date.now(),
        action: 'join'
      };
      
      await this.redis.lPush('channel_access_log', JSON.stringify(logEntry));
      
      // Keep only last 1000 entries
      await this.redis.lTrim('channel_access_log', 0, 999);
    } catch (error) {
      console.warn('⚠️ Failed to log channel access:', error.message);
    }
  }

  // Public utility methods

  public async getSocketUser(socketId: string): Promise<string | null> {
    try {
      const authData = await this.redis.hGet(`socket_auth:${socketId}`, 'userId');
      return authData;
    } catch (error) {
      return null;
    }
  }

  public async getUserSockets(userId: string): Promise<string[]> {
    try {
      return await this.redis.sMembers(`user_sockets:${userId}`);
    } catch (error) {
      return [];
    }
  }

  public async cleanupSocketAuth(socketId: string) {
    try {
      const userId = await this.getSocketUser(socketId);
      
      await Promise.all([
        this.redis.del(`socket_auth:${socketId}`),
        userId ? this.redis.sRem(`user_sockets:${userId}`, socketId) : Promise.resolve()
      ]);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup socket auth:', error.message);
    }
  }

  // Authentication statistics
  public async getAuthStats() {
    try {
      const totalSockets = await this.redis.sCard('active_sockets');
      const authenticatedSockets = await this.redis.keys('socket_auth:*');
      
      return {
        totalSockets,
        authenticatedSockets: authenticatedSockets.length,
        authenticationRate: totalSockets > 0 ? (authenticatedSockets.length / totalSockets) * 100 : 0
      };
    } catch (error) {
      return {
        totalSockets: 0,
        authenticatedSockets: 0,
        authenticationRate: 0
      };
    }
  }
}

export const socketAuth = new SocketAuthenticationMiddleware();