/**
 * Connection Validator Middleware
 * Amazon.com/Shopee.sg-Level connection validation and security
 */

import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { realtimeRedisService } from '../services/redis-service';

export interface ConnectionInfo {
  userId?: string;
  userRole?: string;
  sessionId?: string;
  deviceInfo?: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
    version: string;
  };
  location?: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  permissions?: string[];
}

export class ConnectionValidator {
  private requiredOrigins: Set<string> = new Set([
    'https://getit.com.bd',
    'https://www.getit.com.bd',
    'https://vendor.getit.com.bd',
    'https://admin.getit.com.bd',
    'http://localhost:5000', // Development
    'http://localhost:3000'  // Development frontend
  ]);

  private blockedIPs: Set<string> = new Set();
  private suspiciousIPs: Map<string, { count: number; lastSeen: number }> = new Map();

  constructor() {
    this.setupCleanupInterval();
  }

  /**
   * Validate WebSocket connection
   */
  validateConnection() {
    return async (socket: Socket, next: (err?: Error) => void) => {
      try {
        // 1. Origin validation
        const originValid = await this.validateOrigin(socket);
        if (!originValid) {
          next(new Error('Invalid origin'));
          return;
        }

        // 2. IP validation
        const ipValid = await this.validateIP(socket);
        if (!ipValid) {
          next(new Error('IP address blocked'));
          return;
        }

        // 3. Authentication validation
        const authValid = await this.validateAuthentication(socket);
        if (!authValid) {
          next(new Error('Authentication failed'));
          return;
        }

        // 4. Device validation
        const deviceValid = await this.validateDevice(socket);
        if (!deviceValid) {
          next(new Error('Invalid device information'));
          return;
        }

        // 5. Rate limiting check
        const rateLimitValid = await this.validateRateLimit(socket);
        if (!rateLimitValid) {
          next(new Error('Connection rate limit exceeded'));
          return;
        }

        // 6. Geographic validation
        await this.validateGeography(socket);

        // 7. Store connection info
        await this.storeConnectionInfo(socket);

        console.log(`✅ Connection validated for ${this.getConnectionInfo(socket).userId || 'guest'}`);
        next();
      } catch (error) {
        console.error('Connection validation error:', error);
        next(new Error('Connection validation failed'));
      }
    };
  }

  /**
   * Validate origin
   */
  private async validateOrigin(socket: Socket): Promise<boolean> {
    const origin = socket.handshake.headers.origin;
    const referer = socket.handshake.headers.referer;

    // Allow connections without origin in development
    if (process.env.NODE_ENV === 'development' && !origin) {
      return true;
    }

    if (origin && this.requiredOrigins.has(origin)) {
      return true;
    }

    if (referer) {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (this.requiredOrigins.has(refererOrigin)) {
        return true;
      }
    }

    console.warn(`❌ Invalid origin: ${origin}, referer: ${referer}`);
    return false;
  }

  /**
   * Validate IP address
   */
  private async validateIP(socket: Socket): Promise<boolean> {
    const clientIP = socket.handshake.address;

    // Check if IP is blocked
    if (this.blockedIPs.has(clientIP)) {
      console.warn(`❌ Blocked IP attempted connection: ${clientIP}`);
      return false;
    }

    // Track suspicious activity
    const suspicious = this.suspiciousIPs.get(clientIP);
    if (suspicious) {
      suspicious.count++;
      suspicious.lastSeen = Date.now();

      // Block IP if too many suspicious activities
      if (suspicious.count > 10) {
        this.blockedIPs.add(clientIP);
        console.warn(`🚫 IP blocked due to suspicious activity: ${clientIP}`);
        return false;
      }
    } else {
      this.suspiciousIPs.set(clientIP, { count: 1, lastSeen: Date.now() });
    }

    return true;
  }

  /**
   * Validate authentication
   */
  private async validateAuthentication(socket: Socket): Promise<boolean> {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        // Allow guest connections for public features
        (socket as any).connectionInfo = {
          userId: null,
          userRole: 'guest',
          permissions: ['read_public']
        };
        return true;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Check if user session is valid (optional Redis check)
      const sessionValid = await this.validateSession(decoded.userId, decoded.sessionId);
      if (!sessionValid) {
        console.warn(`❌ Invalid session for user: ${decoded.userId}`);
        return false;
      }

      // Store user info in socket
      (socket as any).connectionInfo = {
        userId: decoded.userId,
        userRole: decoded.role || 'customer',
        sessionId: decoded.sessionId,
        permissions: decoded.permissions || this.getDefaultPermissions(decoded.role)
      };

      return true;
    } catch (error) {
      console.error('Authentication validation error:', error);
      return false;
    }
  }

  /**
   * Validate device information
   */
  private async validateDevice(socket: Socket): Promise<boolean> {
    try {
      const userAgent = socket.handshake.headers['user-agent'] || '';
      const deviceInfo = this.parseUserAgent(userAgent);

      // Store device info
      const connectionInfo = (socket as any).connectionInfo || {};
      connectionInfo.deviceInfo = deviceInfo;
      (socket as any).connectionInfo = connectionInfo;

      // Check for suspicious user agents
      if (this.isSuspiciousUserAgent(userAgent)) {
        console.warn(`⚠️ Suspicious user agent: ${userAgent}`);
        const clientIP = socket.handshake.address;
        const suspicious = this.suspiciousIPs.get(clientIP);
        if (suspicious) {
          suspicious.count += 2; // Increase suspicion score
        }
      }

      return true;
    } catch (error) {
      console.error('Device validation error:', error);
      return true; // Allow connection even if device validation fails
    }
  }

  /**
   * Validate rate limiting
   */
  private async validateRateLimit(socket: Socket): Promise<boolean> {
    try {
      const clientIP = socket.handshake.address;
      
      // Check connection rate limit per IP
      const result = await realtimeRedisService.checkRateLimit(
        clientIP, 
        'connection', 
        10, // Max 10 connections per minute per IP
        60  // 1 minute window
      );

      if (!result.allowed) {
        console.warn(`❌ Connection rate limit exceeded for IP: ${clientIP}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit validation error:', error);
      return true; // Allow connection if rate limiting fails
    }
  }

  /**
   * Validate geography (Bangladesh optimization)
   */
  private async validateGeography(socket: Socket): Promise<void> {
    try {
      // In production, you would use a GeoIP service
      // For now, we'll use headers or default to Bangladesh
      const acceptLanguage = socket.handshake.headers['accept-language'] || '';
      const timezone = socket.handshake.query.timezone as string || 'Asia/Dhaka';
      
      let location = {
        country: 'BD',
        city: 'Dhaka',
        coordinates: [90.4125, 23.8103] as [number, number]
      };

      // Try to detect location from headers
      if (acceptLanguage.includes('bn') || timezone.includes('Dhaka')) {
        location = {
          country: 'BD',
          city: 'Dhaka',
          coordinates: [90.4125, 23.8103]
        };
      }

      // Store location info
      const connectionInfo = (socket as any).connectionInfo || {};
      connectionInfo.location = location;
      (socket as any).connectionInfo = connectionInfo;

      // Update Bangladesh network quality if applicable
      if (location.country === 'BD') {
        const userId = connectionInfo.userId;
        if (userId) {
          const networkQuality = this.detectNetworkQuality(socket);
          await realtimeRedisService.updateBangladeshNetworkQuality(userId, networkQuality);
        }
      }
    } catch (error) {
      console.error('Geography validation error:', error);
      // Don't fail connection for geography errors
    }
  }

  /**
   * Store connection information
   */
  private async storeConnectionInfo(socket: Socket): Promise<void> {
    try {
      const connectionInfo = (socket as any).connectionInfo;
      
      if (connectionInfo.userId) {
        // Store connection in Redis
        await realtimeRedisService.addUserConnection(connectionInfo.userId, socket.id);
        
        // Update user presence
        await realtimeRedisService.updateUserPresence(connectionInfo.userId, {
          status: 'online',
          last_activity: Date.now(),
          current_page: '/',
          device_count: 1
        });
      }

      // Store connection metadata
      await realtimeRedisService.redis.setex(
        `CONNECTION_INFO:${socket.id}`, 
        3600, // 1 hour
        JSON.stringify({
          ...connectionInfo,
          connectedAt: Date.now(),
          ip: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent']
        })
      );
    } catch (error) {
      console.error('Error storing connection info:', error);
    }
  }

  /**
   * Validate session (check Redis for active sessions)
   */
  private async validateSession(userId: string, sessionId: string): Promise<boolean> {
    try {
      if (!sessionId) return true; // Allow connections without specific session validation
      
      // Check if session exists in Redis
      const sessionKey = `SESSION:${userId}:${sessionId}`;
      const sessionExists = await realtimeRedisService.redis.exists(sessionKey);
      
      return sessionExists === 1;
    } catch (error) {
      console.error('Session validation error:', error);
      return true; // Allow connection if session validation fails
    }
  }

  /**
   * Parse user agent string
   */
  private parseUserAgent(userAgent: string): any {
    // Simplified user agent parsing
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    let os = 'Unknown';
    let browser = 'Unknown';
    let version = 'Unknown';

    // Detect device type
    if (userAgent.match(/Mobile|Android|iPhone|iPad/i)) {
      deviceType = userAgent.match(/iPad/i) ? 'tablet' : 'mobile';
    }

    // Detect OS
    if (userAgent.match(/Windows/i)) os = 'Windows';
    else if (userAgent.match(/Mac/i)) os = 'macOS';
    else if (userAgent.match(/Linux/i)) os = 'Linux';
    else if (userAgent.match(/Android/i)) os = 'Android';
    else if (userAgent.match(/iPhone|iPad/i)) os = 'iOS';

    // Detect browser
    if (userAgent.match(/Chrome/i)) browser = 'Chrome';
    else if (userAgent.match(/Firefox/i)) browser = 'Firefox';
    else if (userAgent.match(/Safari/i)) browser = 'Safari';
    else if (userAgent.match(/Edge/i)) browser = 'Edge';

    return { type: deviceType, os, browser, version };
  }

  /**
   * Check for suspicious user agents
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /perl/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Detect network quality for Bangladesh optimization
   */
  private detectNetworkQuality(socket: Socket): any {
    // This would normally use advanced network detection
    // For now, we'll use simple heuristics
    const userAgent = socket.handshake.headers['user-agent'] || '';
    
    let bandwidth = '4g'; // Default assumption
    let carrier = 'unknown';

    // Simple detection based on user agent and other factors
    if (userAgent.match(/2G/i)) bandwidth = '2g';
    else if (userAgent.match(/3G/i)) bandwidth = '3g';
    else if (userAgent.match(/4G|LTE/i)) bandwidth = '4g';
    else if (userAgent.match(/WiFi/i)) bandwidth = 'wifi';

    return {
      bandwidth,
      latency: 100, // Default latency estimate
      packet_loss: 0.5, // Default packet loss estimate
      carrier
    };
  }

  /**
   * Get default permissions based on role
   */
  private getDefaultPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      'admin': ['*'],
      'vendor': ['manage_products', 'manage_orders', 'view_analytics', 'chat', 'notifications'],
      'customer': ['place_orders', 'view_products', 'chat', 'notifications'],
      'guest': ['read_public', 'view_products']
    };

    return permissions[role] || permissions['guest'];
  }

  /**
   * Get connection info from socket
   */
  getConnectionInfo(socket: Socket): ConnectionInfo {
    return (socket as any).connectionInfo || {};
  }

  /**
   * Block IP address
   */
  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    console.log(`🚫 IP blocked: ${ip}`);
  }

  /**
   * Unblock IP address
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
    console.log(`✅ IP unblocked: ${ip}`);
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): any {
    return {
      blocked_ips: this.blockedIPs.size,
      suspicious_ips: this.suspiciousIPs.size,
      allowed_origins: this.requiredOrigins.size
    };
  }

  /**
   * Setup cleanup interval for suspicious IPs
   */
  private setupCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      // Clean up old suspicious IP entries
      for (const [ip, data] of this.suspiciousIPs.entries()) {
        if (now - data.lastSeen > oneHour) {
          this.suspiciousIPs.delete(ip);
        }
      }
    }, 30 * 60 * 1000); // Run every 30 minutes
  }
}

export const connectionValidator = new ConnectionValidator();