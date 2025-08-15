/**
 * Audit Logger Service
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Comprehensive request/response audit logging for compliance
 * Production-ready with data privacy and security features
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../../../db';
import { apiGatewayAuditLogs } from '../../../../shared/schema';
import { eq, desc, gte, and } from 'drizzle-orm';
import { GatewayConfig } from '../config/gateway.config';
import { AuthenticatedRequest } from '../middleware/authentication';
import winston from 'winston';
import crypto from 'crypto';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'audit-logger' }
});

export interface AuditLogEntry {
  id?: string;
  method: string;
  path: string;
  query?: string;
  headers: string;
  userAgent?: string;
  ipAddress: string;
  userId?: number;
  routeId?: string;
  requestBody?: string;
  responseStatus: number;
  responseTime: number;
  requestId: string;
  timestamp: Date;
  sessionId?: string;
  action?: string;
  resource?: string;
  outcome: 'success' | 'failure' | 'error';
  riskLevel: 'low' | 'medium' | 'high';
  bangladeshContext?: Record<string, any>;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface AuditSearchCriteria {
  userId?: number;
  ipAddress?: string;
  method?: string;
  path?: string;
  startDate?: Date;
  endDate?: Date;
  riskLevel?: string;
  outcome?: string;
  limit?: number;
}

export class AuditLogger {
  private config: GatewayConfig;
  private sensitiveFields = [
    'password', 'token', 'secret', 'key', 'authorization',
    'cookie', 'session', 'pin', 'otp', 'cvv', 'ssn'
  ];
  private piiFields = [
    'email', 'phone', 'mobile', 'nid', 'passport', 'address',
    'name', 'dob', 'birthdate', 'age'
  ];

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Audit logger initialized', {
        auditTrailEnabled: this.config.monitoring.logging.auditTrail,
        environment: this.config.server.environment
      });
    } catch (error) {
      logger.error('Failed to initialize audit logger', {
        error: error.message
      });
      throw error;
    }
  }

  middleware() {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!this.config.monitoring.logging.auditTrail) {
        return next();
      }

      const startTime = Date.now();
      const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
      
      // Capture original end method to log response
      const originalEnd = res.end;
      const originalSend = res.send;
      const originalJson = res.json;
      
      let responseBody: any = null;
      let responseLogged = false;

      // Override response methods to capture response data
      res.end = function(chunk?: any) {
        if (!responseLogged) {
          responseLogged = true;
          logAuditEntry();
        }
        return originalEnd.call(this, chunk);
      };

      res.send = function(body: any) {
        responseBody = body;
        return originalSend.call(this, body);
      };

      res.json = function(body: any) {
        responseBody = body;
        return originalJson.call(this, body);
      };

      const logAuditEntry = async () => {
        try {
          const responseTime = Date.now() - startTime;
          const auditEntry = await this.createAuditLogEntry(
            req, 
            res, 
            responseTime, 
            requestId, 
            responseBody
          );
          
          await this.logAuditEntry(auditEntry);
        } catch (error) {
          logger.error('Failed to log audit entry', {
            error: error.message,
            requestId,
            path: req.path
          });
        }
      };

      next();
    };
  }

  private async createAuditLogEntry(
    req: AuthenticatedRequest, 
    res: Response, 
    responseTime: number, 
    requestId: string,
    responseBody: any
  ): Promise<AuditLogEntry> {
    
    // Sanitize headers (remove sensitive information)
    const sanitizedHeaders = this.sanitizeHeaders(req.headers);
    
    // Classify data and determine risk level
    const dataClassification = this.classifyDataSensitivity(req, responseBody);
    const riskLevel = this.assessRiskLevel(req, res.statusCode, responseTime);
    
    // Determine outcome
    let outcome: 'success' | 'failure' | 'error';
    if (res.statusCode >= 200 && res.statusCode < 300) {
      outcome = 'success';
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      outcome = 'failure';
    } else {
      outcome = 'error';
    }

    // Extract action and resource from path
    const { action, resource } = this.extractActionAndResource(req);

    // Bangladesh-specific context
    const bangladeshContext = this.getBangladeshContext(req);

    return {
      method: req.method,
      path: req.path,
      query: this.sanitizeQuery(req.query),
      headers: JSON.stringify(sanitizedHeaders),
      userAgent: req.headers['user-agent'],
      ipAddress: this.getClientIP(req),
      userId: req.user?.id,
      requestBody: this.sanitizeRequestBody(req.body),
      responseStatus: res.statusCode,
      responseTime,
      requestId,
      timestamp: new Date(),
      sessionId: this.extractSessionId(req),
      action,
      resource,
      outcome,
      riskLevel,
      bangladeshContext,
      dataClassification
    };
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    this.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
      if (sanitized[field.toLowerCase()]) {
        sanitized[field.toLowerCase()] = '[REDACTED]';
      }
    });

    // Special handling for authorization header
    if (sanitized.authorization) {
      const authType = sanitized.authorization.split(' ')[0];
      sanitized.authorization = `${authType} [REDACTED]`;
    }

    return sanitized;
  }

  private sanitizeQuery(query: any): string {
    if (!query || typeof query !== 'object') {
      return JSON.stringify(query);
    }

    const sanitized = { ...query };
    
    // Remove sensitive query parameters
    this.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return JSON.stringify(sanitized);
  }

  private sanitizeRequestBody(body: any): string {
    if (!body) return '';
    
    if (typeof body === 'string') {
      return this.containsSensitiveData(body) ? '[REDACTED]' : body;
    }

    if (typeof body === 'object') {
      const sanitized = { ...body };
      
      // Remove sensitive fields
      this.sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });

      // Hash PII fields for compliance
      this.piiFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = this.hashPII(sanitized[field]);
        }
      });

      return JSON.stringify(sanitized);
    }

    return String(body);
  }

  private containsSensitiveData(data: string): boolean {
    const lowerData = data.toLowerCase();
    return this.sensitiveFields.some(field => lowerData.includes(field));
  }

  private hashPII(data: any): string {
    if (this.config.server.environment === 'development') {
      return '[PII-HASHED]';
    }
    
    return crypto.createHash('sha256')
      .update(String(data))
      .digest('hex')
      .substring(0, 16) + '...';
  }

  private classifyDataSensitivity(req: AuthenticatedRequest, responseBody: any): 'public' | 'internal' | 'confidential' | 'restricted' {
    // Payment-related endpoints
    if (req.path.includes('/payment') || req.path.includes('/billing')) {
      return 'restricted';
    }

    // User authentication and profile data
    if (req.path.includes('/auth') || req.path.includes('/profile') || req.path.includes('/users')) {
      return 'confidential';
    }

    // Admin or vendor endpoints
    if (req.path.includes('/admin') || req.path.includes('/vendor')) {
      return 'internal';
    }

    // Check if response contains PII
    if (responseBody && typeof responseBody === 'object') {
      const bodyStr = JSON.stringify(responseBody).toLowerCase();
      if (this.piiFields.some(field => bodyStr.includes(field))) {
        return 'confidential';
      }
    }

    return 'public';
  }

  private assessRiskLevel(req: AuthenticatedRequest, statusCode: number, responseTime: number): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // High risk for authentication failures
    if (req.path.includes('/auth') && statusCode >= 400) {
      riskScore += 3;
    }

    // High risk for admin access
    if (req.path.includes('/admin')) {
      riskScore += 2;
    }

    // Medium risk for payment operations
    if (req.path.includes('/payment')) {
      riskScore += 2;
    }

    // Risk for high response times (potential DoS)
    if (responseTime > 5000) {
      riskScore += 1;
    }

    // Risk for error responses
    if (statusCode >= 500) {
      riskScore += 1;
    }

    // Risk for suspicious IP patterns (this would be enhanced with IP intelligence)
    if (this.isSuspiciousIP(req)) {
      riskScore += 2;
    }

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  private extractActionAndResource(req: AuthenticatedRequest): { action: string; resource: string } {
    const path = req.path;
    const method = req.method.toLowerCase();
    
    // Extract resource from path (e.g., /api/v1/users -> users)
    const pathParts = path.split('/').filter(part => part && part !== 'api' && part !== 'v1');
    const resource = pathParts[0] || 'unknown';
    
    // Map HTTP methods to actions
    const actionMap: Record<string, string> = {
      'get': 'read',
      'post': 'create',
      'put': 'update',
      'patch': 'update',
      'delete': 'delete'
    };
    
    const action = actionMap[method] || method;
    
    return { action, resource };
  }

  private getBangladeshContext(req: AuthenticatedRequest): Record<string, any> {
    const context: Record<string, any> = {
      timezone: 'Asia/Dhaka'
    };

    // Detect mobile users (common in Bangladesh)
    const userAgent = req.headers['user-agent'] || '';
    context.isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

    // Detect payment method context
    if (req.path.includes('/payment') || req.body) {
      const bodyStr = JSON.stringify(req.body || {}).toLowerCase();
      if (bodyStr.includes('bkash')) context.paymentMethod = 'bkash';
      else if (bodyStr.includes('nagad')) context.paymentMethod = 'nagad';
      else if (bodyStr.includes('rocket')) context.paymentMethod = 'rocket';
    }

    // Language preference
    const acceptLanguage = req.headers['accept-language'] || '';
    context.prefersBengali = acceptLanguage.includes('bn');

    // Request source
    const referer = req.headers.referer;
    if (referer) {
      context.source = referer.includes('mobile') ? 'mobile-app' : 'web';
    }

    return context;
  }

  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return req.headers['x-real-ip'] as string || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.ip || 
           'unknown';
  }

  private extractSessionId(req: AuthenticatedRequest): string | undefined {
    // Try to extract session ID from various sources
    if (req.session && (req.session as any).id) {
      return (req.session as any).id;
    }
    
    // Try from cookies
    if (req.cookies && req.cookies.sessionId) {
      return req.cookies.sessionId;
    }
    
    // Try from headers
    const sessionHeader = req.headers['x-session-id'] as string;
    if (sessionHeader) {
      return sessionHeader;
    }
    
    return undefined;
  }

  private isSuspiciousIP(req: AuthenticatedRequest): boolean {
    const ip = this.getClientIP(req);
    
    // This would integrate with threat intelligence feeds
    // For now, basic checks
    if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.')) {
      return false;
    }
    
    // Check for known suspicious patterns
    // This would be enhanced with real threat intelligence
    return false;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async logAuditEntry(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(apiGatewayAuditLogs).values({
        method: entry.method,
        path: entry.path,
        query: entry.query,
        headers: entry.headers,
        userAgent: entry.userAgent,
        ipAddress: entry.ipAddress,
        userId: entry.userId,
        routeId: entry.routeId,
        responseStatus: entry.responseStatus,
        responseTime: entry.responseTime,
        timestamp: entry.timestamp
      });

      // Log high-risk entries separately
      if (entry.riskLevel === 'high') {
        logger.warn('High-risk audit entry', {
          requestId: entry.requestId,
          userId: entry.userId,
          ipAddress: entry.ipAddress,
          path: entry.path,
          method: entry.method,
          responseStatus: entry.responseStatus,
          riskLevel: entry.riskLevel,
          outcome: entry.outcome
        });
      }

    } catch (error) {
      logger.error('Failed to store audit log entry', {
        error: error.message,
        requestId: entry.requestId,
        path: entry.path
      });
    }
  }

  async searchAuditLogs(criteria: AuditSearchCriteria): Promise<any[]> {
    try {
      let query = db.select().from(apiGatewayAuditLogs);
      
      const conditions = [];
      
      if (criteria.userId) {
        conditions.push(eq(apiGatewayAuditLogs.userId, criteria.userId));
      }
      
      if (criteria.ipAddress) {
        conditions.push(eq(apiGatewayAuditLogs.ipAddress, criteria.ipAddress));
      }
      
      if (criteria.method) {
        conditions.push(eq(apiGatewayAuditLogs.method, criteria.method));
      }
      
      if (criteria.startDate) {
        conditions.push(gte(apiGatewayAuditLogs.timestamp, criteria.startDate));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const results = await query
        .orderBy(desc(apiGatewayAuditLogs.timestamp))
        .limit(criteria.limit || 100);

      return results;

    } catch (error) {
      logger.error('Failed to search audit logs', {
        error: error.message,
        criteria
      });
      return [];
    }
  }

  async getAuditStatistics(hours: number = 24): Promise<any> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const logs = await db.select()
        .from(apiGatewayAuditLogs)
        .where(gte(apiGatewayAuditLogs.timestamp, since));

      const stats = {
        totalRequests: logs.length,
        successfulRequests: logs.filter(log => log.responseStatus >= 200 && log.responseStatus < 300).length,
        failedRequests: logs.filter(log => log.responseStatus >= 400).length,
        uniqueUsers: new Set(logs.filter(log => log.userId).map(log => log.userId)).size,
        uniqueIPs: new Set(logs.map(log => log.ipAddress)).size,
        averageResponseTime: logs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / logs.length,
        topMethods: this.getTopItems(logs, 'method'),
        topPaths: this.getTopItems(logs, 'path'),
        topUserAgents: this.getTopItems(logs, 'userAgent'),
        hourlyDistribution: this.getHourlyDistribution(logs),
        bangladeshMetrics: this.getBangladeshAuditMetrics(logs)
      };

      return stats;

    } catch (error) {
      logger.error('Failed to get audit statistics', {
        error: error.message
      });
      return {};
    }
  }

  private getTopItems(logs: any[], field: string, limit: number = 10): any[] {
    const counts = logs.reduce((acc, log) => {
      const value = log[field] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([item, count]) => ({ item, count }));
  }

  private getHourlyDistribution(logs: any[]): any[] {
    const hourCounts = new Array(24).fill(0);
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour]++;
    });

    return hourCounts.map((count, hour) => ({ hour, count }));
  }

  private getBangladeshAuditMetrics(logs: any[]): any {
    const mobileRequests = logs.filter(log => {
      const userAgent = log.userAgent || '';
      return /mobile|android|iphone|ipad/i.test(userAgent);
    }).length;

    const paymentRequests = logs.filter(log => 
      log.path && (log.path.includes('/payment') || log.path.includes('/billing'))
    ).length;

    const bengaliRequests = logs.filter(log => {
      const headers = JSON.parse(log.headers || '{}');
      return headers['accept-language'] && headers['accept-language'].includes('bn');
    }).length;

    return {
      mobileRequests,
      mobilePercentage: Math.round((mobileRequests / logs.length) * 100),
      paymentRequests,
      bengaliRequests,
      festivalPeriod: this.isCurrentlyFestivalPeriod(),
      timezone: 'Asia/Dhaka',
      peakHours: this.getPeakHours(logs)
    };
  }

  private isCurrentlyFestivalPeriod(): boolean {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    const festivals = [
      { month: 4, startDay: 10, endDay: 15 }, // Pohela Boishakh
      { month: 8, startDay: 15, endDay: 20 }, // Eid
      { month: 10, startDay: 10, endDay: 15 }, // Durga Puja
      { month: 12, startDay: 15, endDay: 31 }  // Winter shopping
    ];
    
    return festivals.some(festival => 
      month === festival.month && day >= festival.startDay && day <= festival.endDay
    );
  }

  private getPeakHours(logs: any[]): number[] {
    const hourCounts = this.getHourlyDistribution(logs);
    const maxCount = Math.max(...hourCounts.map(h => h.count));
    const threshold = maxCount * 0.8; // 80% of peak traffic
    
    return hourCounts
      .filter(h => h.count >= threshold)
      .map(h => h.hour);
  }
}

export default AuditLogger;