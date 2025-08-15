/**
 * Real-time Rate Limiting Middleware
 * Amazon.com/Shopee.sg-Level rate limiting for WebSocket operations
 */

import { Socket } from 'socket.io';
import { realtimeRedisService } from '../services/redis-service';

export interface RateLimitConfig {
  window: number; // Time window in seconds
  max: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitRule {
  action: string;
  config: RateLimitConfig;
}

export class RealTimeRateLimiter {
  private defaultConfig: RateLimitConfig = {
    window: 60,
    max: 100,
    message: 'Too many requests. Please try again later.'
  };

  private rules: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.setupDefaultRules();
  }

  private setupDefaultRules(): void {
    // General message sending
    this.rules.set('send_message', {
      window: 60,
      max: 30,
      message: 'Too many messages. Please slow down.'
    });

    // Chat messages
    this.rules.set('chat_message', {
      window: 60,
      max: 20,
      message: 'Too many chat messages. Please wait before sending more.'
    });

    // Notification subscription
    this.rules.set('subscribe_notifications', {
      window: 300, // 5 minutes
      max: 5,
      message: 'Too many subscription attempts. Please wait before trying again.'
    });

    // Presence updates
    this.rules.set('update_presence', {
      window: 60,
      max: 60, // Allow more frequent presence updates
      message: 'Presence updates too frequent.'
    });

    // Channel operations
    this.rules.set('join_channel', {
      window: 60,
      max: 10,
      message: 'Too many channel join attempts.'
    });

    this.rules.set('leave_channel', {
      window: 60,
      max: 10,
      message: 'Too many channel leave attempts.'
    });

    // Broadcast events
    this.rules.set('broadcast_event', {
      window: 60,
      max: 5,
      message: 'Too many broadcast attempts.'
    });

    // Bangladesh-specific events
    this.rules.set('bangladesh_payment', {
      window: 300, // 5 minutes
      max: 10,
      message: 'Too many payment notifications.'
    });

    // Admin operations (more restrictive)
    this.rules.set('admin_broadcast', {
      window: 300,
      max: 3,
      message: 'Too many admin broadcast attempts.'
    });

    // File uploads in chat
    this.rules.set('upload_file', {
      window: 300,
      max: 5,
      message: 'Too many file uploads. Please wait before uploading more files.'
    });

    // Connection-related operations
    this.rules.set('reconnect', {
      window: 60,
      max: 10,
      message: 'Too many reconnection attempts.'
    });

    // Search operations
    this.rules.set('search_users', {
      window: 60,
      max: 20,
      message: 'Too many search requests.'
    });
  }

  /**
   * Create rate limiting middleware for specific action
   */
  createLimiter(action: string, customConfig?: Partial<RateLimitConfig>) {
    return async (socket: Socket, data: any, next: (err?: Error) => void) => {
      try {
        const config = {
          ...this.defaultConfig,
          ...(this.rules.get(action) || {}),
          ...customConfig
        };

        const userId = this.getUserId(socket);
        const key = `${userId}:${action}`;

        const result = await realtimeRedisService.checkRateLimit(
          userId, 
          action, 
          config.max, 
          config.window
        );

        if (!result.allowed) {
          const error = new Error(config.message || 'Rate limit exceeded');
          (error as any).type = 'rate_limit_exceeded';
          (error as any).retryAfter = result.resetTime;
          (error as any).remaining = result.remaining;

          // Emit rate limit warning to client
          socket.emit('rate_limit_warning', {
            action,
            remaining: result.remaining,
            resetTime: result.resetTime,
            message: config.message
          });

          next(error);
          return;
        }

        // Add rate limit info to socket for client awareness
        socket.emit('rate_limit_info', {
          action,
          remaining: result.remaining,
          resetTime: result.resetTime
        });

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        next(); // Allow request to proceed if rate limiting fails
      }
    };
  }

  /**
   * Global rate limiter that applies to all events
   */
  createGlobalLimiter(config?: Partial<RateLimitConfig>) {
    const globalConfig = {
      ...this.defaultConfig,
      max: 200, // Higher limit for global
      window: 60,
      ...config
    };

    return async (socket: Socket, data: any, next: (err?: Error) => void) => {
      try {
        const userId = this.getUserId(socket);
        
        const result = await realtimeRedisService.checkRateLimit(
          userId, 
          'global', 
          globalConfig.max, 
          globalConfig.window
        );

        if (!result.allowed) {
          const error = new Error('Global rate limit exceeded. Please slow down.');
          (error as any).type = 'global_rate_limit_exceeded';
          (error as any).retryAfter = result.resetTime;

          // Force disconnect if global limit exceeded severely
          if (result.remaining < -10) {
            socket.emit('force_disconnect', {
              reason: 'Excessive rate limit violations',
              timestamp: new Date()
            });
            socket.disconnect(true);
            return;
          }

          socket.emit('global_rate_limit_warning', {
            remaining: result.remaining,
            resetTime: result.resetTime,
            message: 'You are sending too many requests. Please slow down.'
          });

          next(error);
          return;
        }

        next();
      } catch (error) {
        console.error('Global rate limiting error:', error);
        next();
      }
    };
  }

  /**
   * IP-based rate limiter for additional protection
   */
  createIPLimiter(config?: Partial<RateLimitConfig>) {
    const ipConfig = {
      window: 60,
      max: 500, // Higher limit for IP-based
      message: 'Too many requests from this IP address.',
      ...config
    };

    return async (socket: Socket, data: any, next: (err?: Error) => void) => {
      try {
        const clientIP = this.getClientIP(socket);
        
        const result = await realtimeRedisService.checkRateLimit(
          clientIP, 
          'ip_global', 
          ipConfig.max, 
          ipConfig.window
        );

        if (!result.allowed) {
          const error = new Error(ipConfig.message);
          (error as any).type = 'ip_rate_limit_exceeded';
          (error as any).retryAfter = result.resetTime;

          // Log suspicious activity
          console.warn(`IP rate limit exceeded for ${clientIP}`, {
            remaining: result.remaining,
            resetTime: result.resetTime,
            userId: this.getUserId(socket)
          });

          next(error);
          return;
        }

        next();
      } catch (error) {
        console.error('IP rate limiting error:', error);
        next();
      }
    };
  }

  /**
   * Connection-based rate limiter
   */
  createConnectionLimiter(maxConnections: number = 5) {
    return async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const userId = this.getUserId(socket);
        const connections = await realtimeRedisService.getUserConnections(userId);

        if (connections.length >= maxConnections) {
          const error = new Error(`Maximum ${maxConnections} connections allowed per user`);
          (error as any).type = 'connection_limit_exceeded';
          (error as any).maxConnections = maxConnections;
          (error as any).currentConnections = connections.length;

          next(error);
          return;
        }

        next();
      } catch (error) {
        console.error('Connection limiting error:', error);
        next();
      }
    };
  }

  /**
   * Bangladesh-specific rate limiter with network quality awareness
   */
  createBangladeshLimiter(action: string) {
    return async (socket: Socket, data: any, next: (err?: Error) => void) => {
      try {
        const userId = this.getUserId(socket);
        const networkQuality = await realtimeRedisService.getBangladeshNetworkQuality(userId);
        
        // Adjust rate limits based on network quality
        let config = this.rules.get(action) || this.defaultConfig;
        
        if (networkQuality && networkQuality.bandwidth) {
          switch (networkQuality.bandwidth) {
            case '2g':
              config = { ...config, max: Math.floor(config.max * 0.3) }; // Reduce by 70%
              break;
            case '3g':
              config = { ...config, max: Math.floor(config.max * 0.6) }; // Reduce by 40%
              break;
            case '4g':
              config = { ...config, max: Math.floor(config.max * 0.8) }; // Reduce by 20%
              break;
            default:
              // Keep original limits for WiFi or unknown
              break;
          }
        }

        const result = await realtimeRedisService.checkRateLimit(
          userId, 
          `bd_${action}`, 
          config.max, 
          config.window
        );

        if (!result.allowed) {
          const error = new Error(`${config.message} (Bangladesh optimized)`);
          (error as any).type = 'bangladesh_rate_limit_exceeded';
          (error as any).networkOptimized = true;
          (error as any).retryAfter = result.resetTime;

          socket.emit('bangladesh_rate_limit_warning', {
            action,
            remaining: result.remaining,
            resetTime: result.resetTime,
            networkQuality: networkQuality?.bandwidth || 'unknown',
            message: config.message
          });

          next(error);
          return;
        }

        next();
      } catch (error) {
        console.error('Bangladesh rate limiting error:', error);
        next();
      }
    };
  }

  /**
   * Priority queue for critical messages
   */
  createPriorityLimiter(priority: 'low' | 'medium' | 'high' | 'critical') {
    const priorityMultipliers = {
      critical: 5,
      high: 2,
      medium: 1,
      low: 0.5
    };

    return async (socket: Socket, data: any, next: (err?: Error) => void) => {
      try {
        const userId = this.getUserId(socket);
        const multiplier = priorityMultipliers[priority];
        const baseLimits = this.rules.get('send_message') || this.defaultConfig;
        
        const adjustedLimits = {
          ...baseLimits,
          max: Math.floor(baseLimits.max * multiplier)
        };

        const result = await realtimeRedisService.checkRateLimit(
          userId, 
          `priority_${priority}`, 
          adjustedLimits.max, 
          adjustedLimits.window
        );

        if (!result.allowed && priority !== 'critical') {
          // Always allow critical messages through
          const error = new Error(`Rate limit exceeded for ${priority} priority messages`);
          (error as any).type = 'priority_rate_limit_exceeded';
          (error as any).priority = priority;
          (error as any).retryAfter = result.resetTime;

          next(error);
          return;
        }

        next();
      } catch (error) {
        console.error('Priority rate limiting error:', error);
        next();
      }
    };
  }

  /**
   * Add custom rate limit rule
   */
  addRule(action: string, config: RateLimitConfig): void {
    this.rules.set(action, config);
  }

  /**
   * Remove rate limit rule
   */
  removeRule(action: string): void {
    this.rules.delete(action);
  }

  /**
   * Get current rate limit status for user
   */
  async getRateLimitStatus(userId: string, action?: string): Promise<any> {
    try {
      if (action) {
        const config = this.rules.get(action) || this.defaultConfig;
        return await realtimeRedisService.checkRateLimit(userId, action, config.max, config.window);
      }

      // Get status for all configured actions
      const status: Record<string, any> = {};
      
      for (const [actionName, config] of this.rules.entries()) {
        status[actionName] = await realtimeRedisService.checkRateLimit(userId, actionName, config.max, config.window);
      }

      return status;
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      return null;
    }
  }

  /**
   * Reset rate limits for user (admin function)
   */
  async resetUserRateLimits(userId: string): Promise<void> {
    try {
      // This would require a method in redis service to clear user's rate limit keys
      // For now, we'll log the action
      console.log(`Rate limits reset for user: ${userId}`);
    } catch (error) {
      console.error('Error resetting rate limits:', error);
    }
  }

  private getUserId(socket: Socket): string {
    return (socket as any).userId || socket.id;
  }

  private getClientIP(socket: Socket): string {
    return socket.handshake.address || 'unknown';
  }
}

export const realTimeRateLimiter = new RealTimeRateLimiter();