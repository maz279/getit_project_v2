/**
 * Service Logger - Centralized Logging
 * Phase 2: Service Consolidation Implementation
 */

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  context?: any;
  requestId?: string;
}

export class ServiceLogger {
  private serviceName: string;
  private logLevel: string;

  constructor(serviceName: string, logLevel: string = 'info') {
    this.serviceName = serviceName;
    this.logLevel = logLevel;
  }

  info(message: string, context?: any, requestId?: string): void {
    this.log('info', message, context, requestId);
  }

  warn(message: string, context?: any, requestId?: string): void {
    this.log('warn', message, context, requestId);
  }

  error(message: string, context?: any, requestId?: string): void {
    this.log('error', message, context, requestId);
  }

  debug(message: string, context?: any, requestId?: string): void {
    this.log('debug', message, context, requestId);
  }

  private log(level: LogEntry['level'], message: string, context?: any, requestId?: string): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      service: this.serviceName,
      message,
      context,
      requestId
    };

    // Console output for development
    console.log(JSON.stringify(entry, null, 2));
  }
}