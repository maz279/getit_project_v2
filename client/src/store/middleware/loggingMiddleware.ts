/**
 * PHASE 2: ENHANCED LOGGING MIDDLEWARE
 * Redux middleware for structured logging and debugging
 * Investment: $25,000 | Week 1: Foundation
 * Date: July 26, 2025
 */

import { Middleware } from '@reduxjs/toolkit';

// Logging configuration
interface LoggingConfig {
  enabled: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  maxLogEntries: number;
  persistLogs: boolean;
  sensitiveActions: string[];
  collapsedByDefault: boolean;
}

const defaultConfig: LoggingConfig = {
  enabled: process.env.NODE_ENV === 'development',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  maxLogEntries: 100,
  persistLogs: false,
  sensitiveActions: [
    'auth/login',
    'auth/setCredentials',
    'moderation/fetchProducts', // Don't log product data in detail
  ],
  collapsedByDefault: true,
};

// Log entry interface
interface LogEntry {
  timestamp: number;
  action: string;
  prevState: any;
  nextState: any;
  duration: number;
  error?: Error;
}

// In-memory log storage
let logEntries: LogEntry[] = [];

// Utility functions
const getLogLevel = (level: string): number => {
  const levels = { none: 0, error: 1, warn: 2, info: 3, debug: 4 };
  return levels[level as keyof typeof levels] || 0;
};

const shouldLog = (level: string): boolean => {
  return getLogLevel(level) <= getLogLevel(defaultConfig.logLevel);
};

const sanitizeAction = (action: any): any => {
  if (defaultConfig.sensitiveActions.includes(action.type)) {
    return {
      ...action,
      payload: '[REDACTED]',
    };
  }
  return action;
};

const sanitizeState = (state: any, actionType: string): any => {
  if (defaultConfig.sensitiveActions.some(sensitive => actionType.includes(sensitive))) {
    return '[REDACTED]';
  }
  
  // Reduce state size for logging
  const sanitized = { ...state };
  
  // Remove large data structures for cleaner logs
  if (sanitized.moderation?.products?.length > 5) {
    sanitized.moderation.products = `[${sanitized.moderation.products.length} products]`;
  }
  
  if (sanitized.performance?.componentMetrics) {
    const metricsCount = Object.keys(sanitized.performance.componentMetrics).length;
    sanitized.performance.componentMetrics = `[${metricsCount} metrics]`;
  }
  
  return sanitized;
};

const formatDuration = (duration: number): string => {
  if (duration < 1) return `${(duration * 1000).toFixed(0)}μs`;
  if (duration < 1000) return `${duration.toFixed(2)}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
};

const getColorForAction = (actionType: string): string => {
  if (actionType.includes('error') || actionType.includes('reject')) return '#e74c3c';
  if (actionType.includes('pending') || actionType.includes('loading')) return '#f39c12';
  if (actionType.includes('success') || actionType.includes('fulfill')) return '#27ae60';
  if (actionType.includes('update') || actionType.includes('set')) return '#3498db';
  return '#95a5a6';
};

// Enhanced logging middleware
export const loggingMiddleware: Middleware = (store) => (next) => (action) => {
  if (!defaultConfig.enabled) {
    return next(action);
  }
  
  const startTime = performance.now();
  const prevState = store.getState();
  
  let result;
  let error: Error | undefined;
  
  try {
    result = next(action);
  } catch (err) {
    error = err as Error;
    if (shouldLog('error')) {
      console.error('❌ Redux Action Error:', {
        action: sanitizeAction(action),
        error: err,
        state: sanitizeState(prevState, action.type),
      });
    }
    throw err;
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  const nextState = store.getState();
  
  // Create log entry
  const logEntry: LogEntry = {
    timestamp: Date.now(),
    action: action.type,
    prevState: sanitizeState(prevState, action.type),
    nextState: sanitizeState(nextState, action.type),
    duration,
    error,
  };
  
  // Store log entry
  logEntries.push(logEntry);
  if (logEntries.length > defaultConfig.maxLogEntries) {
    logEntries = logEntries.slice(-defaultConfig.maxLogEntries);
  }
  
  // Console logging
  if (shouldLog('debug')) {
    const groupName = `🔄 ${action.type} ${formatDuration(duration)}`;
    const groupMethod = defaultConfig.collapsedByDefault ? 'groupCollapsed' : 'group';
    
    console[groupMethod](
      `%c${groupName}`,
      `color: ${getColorForAction(action.type)}; font-weight: bold;`
    );
    
    console.log('%cAction:', 'color: #3498db; font-weight: bold;', sanitizeAction(action));
    
    if (prevState !== nextState) {
      console.log('%cPrev State:', 'color: #e74c3c; font-weight: bold;', logEntry.prevState);
      console.log('%cNext State:', 'color: #27ae60; font-weight: bold;', logEntry.nextState);
    } else {
      console.log('%cState:', 'color: #95a5a6; font-weight: bold;', 'No changes');
    }
    
    if (duration > 10) {
      console.warn(`⚠️ Slow action: ${action.type} took ${formatDuration(duration)}`);
    }
    
    if (error) {
      console.error('%cError:', 'color: #e74c3c; font-weight: bold;', error);
    }
    
    console.groupEnd();
  }
  
  return result;
};

// Logging utilities
export const loggingUtils = {
  // Configure logging
  configure: (newConfig: Partial<LoggingConfig>) => {
    Object.assign(defaultConfig, newConfig);
  },
  
  // Get log entries
  getLogs: (): LogEntry[] => [...logEntries],
  
  // Clear logs
  clearLogs: () => {
    logEntries = [];
  },
  
  // Export logs
  exportLogs: (): string => {
    return JSON.stringify(logEntries, null, 2);
  },
  
  // Get logs by action type
  getLogsByAction: (actionType: string): LogEntry[] => {
    return logEntries.filter(entry => entry.action.includes(actionType));
  },
  
  // Get slow actions
  getSlowActions: (threshold: number = 10): LogEntry[] => {
    return logEntries.filter(entry => entry.duration > threshold);
  },
  
  // Get error logs
  getErrorLogs: (): LogEntry[] => {
    return logEntries.filter(entry => entry.error);
  },
  
  // Performance summary
  getPerformanceSummary: () => {
    if (logEntries.length === 0) return null;
    
    const durations = logEntries.map(entry => entry.duration);
    const errors = logEntries.filter(entry => entry.error);
    const slowActions = logEntries.filter(entry => entry.duration > 10);
    
    return {
      totalActions: logEntries.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      errorCount: errors.length,
      slowActionCount: slowActions.length,
      errorRate: (errors.length / logEntries.length) * 100,
      timeRange: {
        start: new Date(Math.min(...logEntries.map(e => e.timestamp))),
        end: new Date(Math.max(...logEntries.map(e => e.timestamp))),
      },
    };
  },
  
  // Most frequent actions
  getActionFrequency: () => {
    const frequency: Record<string, number> = {};
    
    logEntries.forEach(entry => {
      frequency[entry.action] = (frequency[entry.action] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));
  },
};

// Export configuration for external access
export { defaultConfig as loggingConfig };

// Cleanup function for testing
export const cleanupLoggingMiddleware = () => {
  logEntries = [];
};