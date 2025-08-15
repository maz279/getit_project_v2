/**
 * Metrics Middleware
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Request/response metrics collection middleware
 * Integrates with MetricsCollector for comprehensive monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { MetricsCollector } from '../services/MetricsCollector';
import { AuthenticatedRequest } from './authentication';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'metrics-middleware' }
});

export const metricsMiddleware = (metricsCollector: MetricsCollector) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}`;
    
    // Extract service name from path
    const serviceName = extractServiceName(req.path);
    
    // Record request start
    metricsCollector.recordRequest(serviceName);
    
    // Track request metadata
    const requestMetadata = {
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      ip: getClientIP(req),
      userId: req.user?.id,
      startTime,
      requestId
    };

    // Override response methods to capture metrics
    const originalEnd = res.end;
    const originalSend = res.send;
    const originalJson = res.json;
    
    let metricsRecorded = false;

    const recordMetrics = () => {
      if (metricsRecorded) return;
      metricsRecorded = true;

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Record response metrics
      metricsCollector.recordResponse(serviceName, res.statusCode, responseTime);
      
      // Log detailed metrics for analysis
      if (shouldLogDetailedMetrics(req, res, responseTime)) {
        logger.info('Request metrics', {
          ...requestMetadata,
          responseTime,
          statusCode: res.statusCode,
          serviceName,
          bangladeshMetrics: getBangladeshMetrics(req, res, responseTime)
        });
      }
    };

    // Override response methods
    res.end = function(chunk?: any) {
      recordMetrics();
      return originalEnd.call(this, chunk);
    };

    res.send = function(body: any) {
      recordMetrics();
      return originalSend.call(this, body);
    };

    res.json = function(body: any) {
      recordMetrics();
      return originalJson.call(this, body);
    };

    // Handle request timeout
    const timeout = setTimeout(() => {
      if (!metricsRecorded) {
        metricsCollector.recordError(serviceName, 'timeout');
        logger.warn('Request timeout', {
          ...requestMetadata,
          timeout: Date.now() - startTime
        });
      }
    }, 30000); // 30 second timeout

    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Helper functions

function extractServiceName(path: string): string {
  // Extract service name from API path
  // e.g., /api/v1/users/123 -> users
  const pathParts = path.split('/').filter(part => part);
  
  if (pathParts.length >= 3 && pathParts[0] === 'api' && pathParts[1] === 'v1') {
    return pathParts[2];
  }
  
  if (pathParts.length >= 2 && pathParts[0] === 'api') {
    return pathParts[1];
  }
  
  return pathParts[0] || 'unknown';
}

function getClientIP(req: Request): string {
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

function shouldLogDetailedMetrics(req: Request, res: Response, responseTime: number): boolean {
  // Log detailed metrics for:
  // 1. Slow requests (>2 seconds)
  // 2. Error responses (5xx)
  // 3. Client errors on sensitive endpoints (4xx on auth, payment)
  // 4. High-value operations
  
  if (responseTime > 2000) return true;
  if (res.statusCode >= 500) return true;
  
  if (res.statusCode >= 400 && res.statusCode < 500) {
    const sensitiveEndpoints = ['/auth', '/payment', '/admin', '/vendor'];
    if (sensitiveEndpoints.some(endpoint => req.path.includes(endpoint))) {
      return true;
    }
  }
  
  // Log payment and admin operations
  if (req.path.includes('/payment') || req.path.includes('/admin')) {
    return true;
  }
  
  return false;
}

function getBangladeshMetrics(req: AuthenticatedRequest, res: Response, responseTime: number): any {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  
  return {
    isMobile: /mobile|android|iphone|ipad/i.test(userAgent),
    prefersBengali: acceptLanguage.includes('bn'),
    timezone: 'Asia/Dhaka',
    responseTime,
    statusCode: res.statusCode,
    isSuccess: res.statusCode >= 200 && res.statusCode < 300,
    isError: res.statusCode >= 400,
    paymentMethod: extractPaymentMethod(req),
    requestSource: extractRequestSource(req),
    festivalPeriod: isCurrentlyFestivalPeriod()
  };
}

function extractPaymentMethod(req: AuthenticatedRequest): string | null {
  if (!req.body) return null;
  
  const bodyStr = JSON.stringify(req.body).toLowerCase();
  
  if (bodyStr.includes('bkash')) return 'bkash';
  if (bodyStr.includes('nagad')) return 'nagad';
  if (bodyStr.includes('rocket')) return 'rocket';
  if (bodyStr.includes('cod')) return 'cod';
  if (bodyStr.includes('card')) return 'card';
  
  return null;
}

function extractRequestSource(req: Request): string {
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers.referer || '';
  
  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    return 'mobile';
  }
  
  if (referer.includes('admin')) return 'admin';
  if (referer.includes('vendor')) return 'vendor';
  
  return 'web';
}

function isCurrentlyFestivalPeriod(): boolean {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Major Bangladesh festivals
  const festivals = [
    { month: 4, startDay: 10, endDay: 15 }, // Pohela Boishakh
    { month: 8, startDay: 15, endDay: 20 }, // Eid (approximate)
    { month: 10, startDay: 10, endDay: 15 }, // Durga Puja
    { month: 12, startDay: 15, endDay: 31 }  // Winter shopping season
  ];
  
  return festivals.some(festival => 
    month === festival.month && day >= festival.startDay && day <= festival.endDay
  );
}

export default metricsMiddleware;