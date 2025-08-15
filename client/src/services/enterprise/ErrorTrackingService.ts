/**
 * Phase 4 Task 4.5: Error Tracking Service
 * Amazon.com/Shopee.sg Enterprise-Level Error Tracking & Monitoring
 * 
 * Features:
 * - Real-time error capture and reporting
 * - Error categorization and severity levels
 * - User context and session tracking
 * - Performance impact analysis
 * - Error recovery and fallback mechanisms
 * - Integration with external error tracking services
 */

interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  type: 'javascript' | 'network' | 'security' | 'performance' | 'user' | 'api';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  context: Record<string, any>;
  recoverable: boolean;
  resolved: boolean;
  occurrences: number;
  fingerprint: string;
}

interface ErrorPattern {
  fingerprint: string;
  message: string;
  type: string;
  severity: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  affectedUsers: Set<string>;
  urls: Set<string>;
  resolved: boolean;
}

interface ErrorRecoveryStrategy {
  errorType: string;
  recovery: () => Promise<boolean>;
  fallback: () => void;
  maxRetries: number;
}

class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private errors: ErrorInfo[] = [];
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map();
  private sessionId: string;
  private isInitialized = false;
  private sentryEnabled = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorTracking();
    this.setupRecoveryStrategies();
    this.initializeSentry();
  }

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Initialize error tracking
   */
  private initializeErrorTracking(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        type: 'javascript',
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        },
        recoverable: true
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        type: 'javascript',
        severity: 'high',
        context: {
          reason: event.reason,
          promise: event.promise
        },
        recoverable: false
      });
    });

    // Network error handler
    this.setupNetworkErrorTracking();

    // Performance error handler
    this.setupPerformanceErrorTracking();

    // Security error handler
    this.setupSecurityErrorTracking();

    this.isInitialized = true;
  }

  /**
   * Setup network error tracking
   */
  private setupNetworkErrorTracking(): void {
    // Intercept fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.handleError({
            message: `Network Error: ${response.status} ${response.statusText}`,
            type: 'network',
            severity: response.status >= 500 ? 'high' : 'medium',
            context: {
              url: args[0],
              status: response.status,
              statusText: response.statusText,
              method: args[1]?.method || 'GET'
            },
            recoverable: true
          });
        }
        
        return response;
      } catch (error) {
        this.handleError({
          message: `Network Error: ${error.message}`,
          stack: error.stack,
          type: 'network',
          severity: 'high',
          context: {
            url: args[0],
            method: args[1]?.method || 'GET',
            error
          },
          recoverable: true
        });
        throw error;
      }
    };

    // Intercept XMLHttpRequest errors
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      this.addEventListener('error', (event) => {
        ErrorTrackingService.getInstance().handleError({
          message: 'XMLHttpRequest Error',
          type: 'network',
          severity: 'medium',
          context: {
            method: args[0],
            url: args[1],
            status: this.status,
            statusText: this.statusText
          },
          recoverable: true
        });
      });
      
      return originalXHROpen.apply(this, args);
    };
  }

  /**
   * Setup performance error tracking
   */
  private setupPerformanceErrorTracking(): void {
    // Long task detection
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.handleError({
                message: `Long Task Detected: ${entry.duration}ms`,
                type: 'performance',
                severity: entry.duration > 100 ? 'high' : 'medium',
                context: {
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name
                },
                recoverable: false
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task observer not supported');
      }
    }

    // Memory pressure detection
    if ((performance as any).memory) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (usageRatio > 0.9) {
          this.handleError({
            message: `High Memory Usage: ${Math.round(usageRatio * 100)}%`,
            type: 'performance',
            severity: 'high',
            context: {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
              usageRatio
            },
            recoverable: false
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Setup security error tracking
   */
  private setupSecurityErrorTracking(): void {
    // CSP violation handler
    document.addEventListener('securitypolicyviolation', (event) => {
      this.handleError({
        message: `CSP Violation: ${event.violatedDirective}`,
        type: 'security',
        severity: 'high',
        context: {
          violatedDirective: event.violatedDirective,
          blockedURI: event.blockedURI,
          documentURI: event.documentURI,
          effectiveDirective: event.effectiveDirective,
          originalPolicy: event.originalPolicy
        },
        recoverable: false
      });
    });

    // Mixed content detection
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(this, tagName);
      
      if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'img') {
        const originalSetSrc = element.setAttribute;
        element.setAttribute = function(name, value) {
          if (name === 'src' && window.location.protocol === 'https:' && value.startsWith('http:')) {
            ErrorTrackingService.getInstance().handleError({
              message: `Mixed Content Warning: ${tagName} with HTTP src on HTTPS page`,
              type: 'security',
              severity: 'medium',
              context: {
                tagName,
                src: value,
                currentProtocol: window.location.protocol
              },
              recoverable: true
            });
          }
          return originalSetSrc.call(this, name, value);
        };
      }
      
      return element;
    };
  }

  /**
   * Setup recovery strategies
   */
  private setupRecoveryStrategies(): void {
    // Network error recovery
    this.recoveryStrategies.set('network', {
      errorType: 'network',
      recovery: async () => {
        // Retry with exponential backoff
        await this.delay(1000);
        return navigator.onLine;
      },
      fallback: () => {
        // Show offline message
        this.showOfflineMessage();
      },
      maxRetries: 3
    });

    // JavaScript error recovery
    this.recoveryStrategies.set('javascript', {
      errorType: 'javascript',
      recovery: async () => {
        // Try to reload the component or page
        return false; // Most JS errors are not recoverable
      },
      fallback: () => {
        // Show error boundary fallback
        this.showErrorFallback();
      },
      maxRetries: 0
    });

    // API error recovery
    this.recoveryStrategies.set('api', {
      errorType: 'api',
      recovery: async () => {
        // Check if service is back online
        try {
          const response = await fetch('/api/health');
          return response.ok;
        } catch {
          return false;
        }
      },
      fallback: () => {
        // Use cached data or show degraded experience
        this.useCachedData();
      },
      maxRetries: 3
    });
  }

  /**
   * Initialize Sentry
   */
  private initializeSentry(): void {
    if (process.env.REACT_APP_SENTRY_DSN) {
      try {
        // In a real implementation, you would import and configure Sentry here
        // import * as Sentry from '@sentry/react';
        // Sentry.init({
        //   dsn: process.env.REACT_APP_SENTRY_DSN,
        //   environment: process.env.NODE_ENV,
        //   integrations: [new Sentry.BrowserTracing()],
        //   tracesSampleRate: 1.0,
        // });
        
        this.sentryEnabled = true;
      } catch (error) {
        console.warn('Failed to initialize Sentry:', error);
      }
    }
  }

  /**
   * Handle error
   */
  private handleError(errorData: Partial<ErrorInfo>): void {
    const error: ErrorInfo = {
      id: this.generateErrorId(),
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      type: errorData.type || 'javascript',
      severity: errorData.severity || 'medium',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      sessionId: this.sessionId,
      context: errorData.context || {},
      recoverable: errorData.recoverable !== false,
      resolved: false,
      occurrences: 1,
      fingerprint: this.generateFingerprint(errorData)
    };

    // Add to errors array
    this.errors.push(error);

    // Update error patterns
    this.updateErrorPattern(error);

    // Send to external services
    this.sendToExternalServices(error);

    // Attempt recovery if possible
    if (error.recoverable) {
      this.attemptRecovery(error);
    }

    // Log error
    this.logError(error);

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors.shift();
    }
  }

  /**
   * Update error pattern
   */
  private updateErrorPattern(error: ErrorInfo): void {
    const existing = this.errorPatterns.get(error.fingerprint);
    
    if (existing) {
      existing.count++;
      existing.lastSeen = error.timestamp;
      existing.affectedUsers.add(error.userId || 'anonymous');
      existing.urls.add(error.url);
    } else {
      this.errorPatterns.set(error.fingerprint, {
        fingerprint: error.fingerprint,
        message: error.message,
        type: error.type,
        severity: error.severity,
        count: 1,
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
        affectedUsers: new Set([error.userId || 'anonymous']),
        urls: new Set([error.url]),
        resolved: false
      });
    }
  }

  /**
   * Send to external services
   */
  private sendToExternalServices(error: ErrorInfo): void {
    if (this.sentryEnabled) {
      // Send to Sentry
      // Sentry.captureException(new Error(error.message), {
      //   contexts: {
      //     error: {
      //       id: error.id,
      //       type: error.type,
      //       severity: error.severity,
      //       context: error.context
      //     }
      //   },
      //   user: {
      //     id: error.userId,
      //     session: error.sessionId
      //   }
      // });
    }

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: error.severity === 'critical',
        error_type: error.type,
        error_id: error.id
      });
    }

    // Send to custom endpoint
    this.sendToCustomEndpoint(error);
  }

  /**
   * Send to custom endpoint
   */
  private async sendToCustomEndpoint(error: ErrorInfo): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          error: {
            id: error.id,
            message: error.message,
            stack: error.stack,
            type: error.type,
            severity: error.severity,
            timestamp: error.timestamp,
            url: error.url,
            userAgent: error.userAgent,
            userId: error.userId,
            sessionId: error.sessionId,
            context: error.context,
            fingerprint: error.fingerprint
          }
        })
      });
    } catch (sendError) {
      console.warn('Failed to send error to custom endpoint:', sendError);
    }
  }

  /**
   * Attempt recovery
   */
  private async attemptRecovery(error: ErrorInfo): Promise<void> {
    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) return;

    let retryCount = 0;
    while (retryCount < strategy.maxRetries) {
      try {
        const recovered = await strategy.recovery();
        if (recovered) {
          this.markErrorAsResolved(error.fingerprint);
          return;
        }
      } catch (recoveryError) {
        console.warn('Recovery attempt failed:', recoveryError);
      }
      
      retryCount++;
      await this.delay(Math.pow(2, retryCount) * 1000);
    }

    // If recovery failed, use fallback
    strategy.fallback();
  }

  /**
   * Mark error as resolved
   */
  private markErrorAsResolved(fingerprint: string): void {
    const pattern = this.errorPatterns.get(fingerprint);
    if (pattern) {
      pattern.resolved = true;
    }

    // Mark all instances of this error as resolved
    this.errors.forEach(error => {
      if (error.fingerprint === fingerprint) {
        error.resolved = true;
      }
    });
  }

  /**
   * Log error
   */
  private logError(error: ErrorInfo): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.type.toUpperCase()}] ${error.message}`;
    
    if (logLevel === 'error') {
      console.error(logMessage, error);
    } else if (logLevel === 'warn') {
      console.warn(logMessage, error);
    } else {
      console.log(logMessage, error);
    }
  }

  /**
   * Get log level
   */
  private getLogLevel(severity: string): string {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate fingerprint
   */
  private generateFingerprint(errorData: Partial<ErrorInfo>): string {
    const key = `${errorData.type}_${errorData.message}_${errorData.stack?.split('\n')[0] || ''}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user ID
   */
  private getUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Show offline message
   */
  private showOfflineMessage(): void {
    // Implementation would show offline UI
    console.log('Showing offline message');
  }

  /**
   * Show error fallback
   */
  private showErrorFallback(): void {
    // Implementation would show error boundary fallback
    console.log('Showing error fallback');
  }

  /**
   * Use cached data
   */
  private useCachedData(): void {
    // Implementation would use cached data
    console.log('Using cached data');
  }

  /**
   * Capture manual error
   */
  captureError(error: Error, context?: Record<string, any>): void {
    this.handleError({
      message: error.message,
      stack: error.stack,
      type: 'user',
      severity: 'medium',
      context: context || {},
      recoverable: false
    });
  }

  /**
   * Capture message
   */
  captureMessage(message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', context?: Record<string, any>): void {
    this.handleError({
      message,
      type: 'user',
      severity,
      context: context || {},
      recoverable: false
    });
  }

  /**
   * Set user context
   */
  setUserContext(userId: string, userData?: Record<string, any>): void {
    localStorage.setItem('userId', userId);
    
    if (this.sentryEnabled) {
      // Sentry.setUser({
      //   id: userId,
      //   ...userData
      // });
    }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, any>): void {
    if (this.sentryEnabled) {
      // Sentry.addBreadcrumb({
      //   message,
      //   category,
      //   level,
      //   data
      // });
    }
  }

  /**
   * Get error report
   */
  getErrorReport(): any {
    const now = Date.now();
    const lastHour = now - 3600000;
    const last24Hours = now - 86400000;
    
    const recentErrors = this.errors.filter(e => e.timestamp > lastHour);
    const dailyErrors = this.errors.filter(e => e.timestamp > last24Hours);
    
    return {
      summary: {
        totalErrors: this.errors.length,
        recentErrors: recentErrors.length,
        dailyErrors: dailyErrors.length,
        uniqueErrors: this.errorPatterns.size,
        resolvedErrors: Array.from(this.errorPatterns.values()).filter(p => p.resolved).length,
        criticalErrors: this.errors.filter(e => e.severity === 'critical').length
      },
      errorsByType: this.getErrorsByType(),
      errorsBySeverity: this.getErrorsBySeverity(),
      topErrors: this.getTopErrors(),
      affectedUsers: this.getAffectedUsers(),
      errorTrends: this.getErrorTrends(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Get errors by type
   */
  private getErrorsByType(): Record<string, number> {
    const byType: Record<string, number> = {};
    
    this.errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
    });
    
    return byType;
  }

  /**
   * Get errors by severity
   */
  private getErrorsBySeverity(): Record<string, number> {
    const bySeverity: Record<string, number> = {};
    
    this.errors.forEach(error => {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });
    
    return bySeverity;
  }

  /**
   * Get top errors
   */
  private getTopErrors(): ErrorPattern[] {
    return Array.from(this.errorPatterns.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get affected users
   */
  private getAffectedUsers(): number {
    const users = new Set<string>();
    this.errors.forEach(error => {
      if (error.userId) users.add(error.userId);
    });
    return users.size;
  }

  /**
   * Get error trends
   */
  private getErrorTrends(): any[] {
    const trends: any[] = [];
    const now = Date.now();
    
    for (let i = 23; i >= 0; i--) {
      const hour = now - (i * 3600000);
      const hourStart = hour - 3600000;
      
      const errorsInHour = this.errors.filter(e => 
        e.timestamp >= hourStart && e.timestamp < hour
      ).length;
      
      trends.push({
        hour: new Date(hour).toISOString(),
        errors: errorsInHour
      });
    }
    
    return trends;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Check for high error rates
    const recentErrors = this.errors.filter(e => e.timestamp > Date.now() - 3600000);
    if (recentErrors.length > 10) {
      recommendations.push('High error rate detected in the last hour. Consider investigating recent deployments.');
    }
    
    // Check for critical errors
    const criticalErrors = this.errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      recommendations.push(`${criticalErrors.length} critical errors detected. These should be addressed immediately.`);
    }
    
    // Check for unresolved patterns
    const unresolvedPatterns = Array.from(this.errorPatterns.values()).filter(p => !p.resolved);
    if (unresolvedPatterns.length > 5) {
      recommendations.push('Multiple unresolved error patterns detected. Consider implementing error recovery strategies.');
    }
    
    return recommendations;
  }

  /**
   * Get real-time errors
   */
  getRealTimeErrors(): ErrorInfo[] {
    return this.errors.slice(-10);
  }

  /**
   * Clear resolved errors
   */
  clearResolvedErrors(): void {
    this.errors = this.errors.filter(e => !e.resolved);
    
    for (const [fingerprint, pattern] of this.errorPatterns) {
      if (pattern.resolved) {
        this.errorPatterns.delete(fingerprint);
      }
    }
  }

  /**
   * Export errors
   */
  exportErrors(): string {
    return JSON.stringify({
      errors: this.errors,
      patterns: Array.from(this.errorPatterns.values()),
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Destroy error tracking
   */
  destroy(): void {
    this.errors = [];
    this.errorPatterns.clear();
    this.recoveryStrategies.clear();
    this.isInitialized = false;
  }
}

export default ErrorTrackingService;