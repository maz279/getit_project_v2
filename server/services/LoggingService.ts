import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

export interface LogContext {
  requestId?: string;
  userId?: string;
  serviceId?: string;
  sessionId?: string;
  timestamp?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  action?: string;
  orderId?: string;
  paymentId?: string;
  event?: string;
  component?: string;
  metric?: string;
  eventName?: string;
  category?: string;
  serviceName?: string;
  workflowName?: string;
  alertId?: string;
  eventType?: string;
  basePath?: string;
  [key: string]: any; // Allow additional properties
}

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context: LogContext;
  metadata?: any;
  stack?: string;
}

/**
 * Distributed Logging Service for microservices architecture
 * Provides centralized logging with structured data and correlation IDs
 */
export class DistributedLogger {
  private logger: winston.Logger;
  private serviceName: string;

  constructor(serviceName: string = 'GetIt-Platform') {
    this.serviceName = serviceName;
    this.setupLogger();
  }

  private setupLogger() {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        try {
          return JSON.stringify({
            timestamp,
            level,
            service: this.serviceName,
            message,
            ...meta
          });
        } catch (error) {
          return JSON.stringify({
            timestamp,
            level,
            service: this.serviceName,
            message: String(message),
            error: 'Failed to serialize log data'
          });
        }
      })
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: {
        service: this.serviceName,
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File transport for application logs
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        
        // Combined log file
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 10
        })
      ],
      exitOnError: false
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({ filename: 'logs/exceptions.log' })
    );

    // Handle unhandled promise rejections
    this.logger.rejections.handle(
      new winston.transports.File({ filename: 'logs/rejections.log' })
    );
  }

  private createLogEntry(level: string, message: string, context: LogContext = {}, metadata?: any): LogEntry {
    return {
      level: level as any,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        serviceId: this.serviceName
      },
      metadata
    };
  }

  // Core logging methods
  info(message: string, context: LogContext = {}, metadata?: any) {
    const entry = this.createLogEntry('info', message, context, metadata);
    this.logger.info(entry.message, entry.context, entry.metadata);
  }

  warn(message: string, context: LogContext = {}, metadata?: any) {
    const entry = this.createLogEntry('warn', message, context, metadata);
    this.logger.warn(entry.message, entry.context, entry.metadata);
  }

  error(message: string, error?: Error, context: LogContext = {}, metadata?: any) {
    const entry = this.createLogEntry('error', message, context, metadata);
    if (error) {
      entry.stack = error.stack;
      entry.metadata = { ...entry.metadata, errorName: error.name, errorMessage: error.message };
    }
    this.logger.error(entry.message, entry.context, entry.metadata, entry.stack);
  }

  debug(message: string, context: LogContext = {}, metadata?: any) {
    const entry = this.createLogEntry('debug', message, context, metadata);
    this.logger.debug(entry.message, entry.context, entry.metadata);
  }

  // Business logic specific logging methods
  logUserAction(action: string, userId: string, details?: any, context: LogContext = {}) {
    this.info(`User action: ${action}`, {
      ...context,
      userId,
      action
    }, details);
  }

  logApiRequest(req: Request, res: Response, responseTime: number) {
    const context: LogContext = {
      requestId: req.headers['x-request-id'] as string || this.generateRequestId(),
      userId: (req as any).user?.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 400) {
      this.warn(`API request failed: ${req.method} ${req.path}`, context);
    } else {
      this.info(`API request: ${req.method} ${req.path}`, context);
    }
  }

  logOrderEvent(orderId: string, event: string, userId?: string, details?: any) {
    this.info(`Order event: ${event}`, {
      orderId,
      userId,
      event
    }, details);
  }

  logPaymentEvent(paymentId: string, event: string, amount?: number, gateway?: string, details?: any) {
    this.info(`Payment event: ${event}`, {
      paymentId,
      event,
      gateway
    }, { amount, ...details });
  }

  logSecurityEvent(event: string, userId?: string, ip?: string, details?: any) {
    this.warn(`Security event: ${event}`, {
      userId,
      ip,
      event,
      severity: 'security'
    }, details);
  }

  logSystemHealth(component: string, status: 'healthy' | 'unhealthy', metrics?: any) {
    const level = status === 'healthy' ? 'info' : 'warn';
    this[level](`System health: ${component} is ${status}`, {
      component,
      status
    }, metrics);
  }

  logPerformanceMetric(metric: string, value: number, unit: string, context: LogContext = {}) {
    this.info(`Performance metric: ${metric}`, {
      ...context,
      metric,
      unit
    }, { value });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Middleware for automatic request logging
  createRequestLoggerMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
      
      // Add request ID to request object
      (req as any).requestId = requestId;
      res.setHeader('X-Request-ID', requestId);

      // Log request start
      this.debug(`Request started: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(...args: any[]) {
        const responseTime = Date.now() - startTime;
        
        // Log the completed request
        logger.logApiRequest(req, res, responseTime);
        
        // Call original end method
        originalEnd.apply(this, args);
      };

      next();
    };
  }

  // Error handling middleware
  createErrorLoggerMiddleware() {
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      const context: LogContext = {
        requestId: (req as any).requestId,
        userId: (req as any).user?.id,
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };

      this.error(`Unhandled error in ${req.method} ${req.path}`, error, context);
      next(error);
    };
  }

  // Query all logs (for admin dashboard)
  async queryLogs(filters: {
    level?: string;
    service?: string;
    userId?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  } = {}) {
    // In production, this would query from a centralized log store like ELK stack
    // For now, returning mock data structure
    return {
      logs: [],
      total: 0,
      filters
    };
  }

  // Health check
  healthCheck() {
    return {
      status: 'healthy',
      service: this.serviceName,
      logLevel: this.logger.level,
      timestamp: new Date().toISOString()
    };
  }
}

// Global logger instance
export const logger = new DistributedLogger('GetIt-Platform');

// Export class alias for backwards compatibility
export const LoggingService = DistributedLogger;

// Export default instance for easy use
export const loggingService = logger;

// Export middleware functions for easy use
export const requestLogger = logger.createRequestLoggerMiddleware();
export const errorLogger = logger.createErrorLoggerMiddleware();

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  static endTimer(label: string, context: LogContext = {}): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn(`Timer not found: ${label}`, context);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);
    
    logger.logPerformanceMetric(label, duration, 'ms', context);
    return duration;
  }

  static measureAsync<T>(label: string, fn: () => Promise<T>, context: LogContext = {}): Promise<T> {
    this.startTimer(label);
    return fn().finally(() => {
      this.endTimer(label, context);
    });
  }

  static measure<T>(label: string, fn: () => T, context: LogContext = {}): T {
    this.startTimer(label);
    try {
      return fn();
    } finally {
      this.endTimer(label, context);
    }
  }
}

// Application event emitter for cross-service communication
export class EventLogger {
  static logEvent(eventName: string, data: any, context: LogContext = {}) {
    logger.info(`Event: ${eventName}`, {
      ...context,
      eventName
    }, data);
  }

  static logUserEvent(userId: string, action: string, data?: any) {
    this.logEvent('user_action', data, {
      userId,
      action
    });
  }

  static logBusinessEvent(category: string, action: string, data?: any) {
    this.logEvent('business_event', data, {
      category,
      action
    });
  }

  static logSystemEvent(component: string, action: string, data?: any) {
    this.logEvent('system_event', data, {
      component,
      action
    });
  }
}

// Singleton instance for EventLogger (legacy support)
const eventLoggingService = new DistributedLogger();