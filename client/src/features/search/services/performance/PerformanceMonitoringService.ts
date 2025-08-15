/**
 * Performance Monitoring Service - Phase 5 Service Layer Implementation
 * Real-time performance tracking and optimization for search components
 */

import { PERFORMANCE_THRESHOLDS, CACHE_CONFIG } from '../../constants/searchConstants';

export interface PerformanceMetrics {
  searchCount: number;
  cacheHits: number;
  totalSearchTime: number;
  averageResponseTime: number;
  errorCount: number;
  memoryUsage: number;
  componentRenderTime: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  metrics: PerformanceMetrics;
  alerts: string[];
  uptime: number;
  activeRequests: number;
}

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetrics;
  private startTime: number;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private alerts: string[] = [];

  private constructor() {
    this.metrics = {
      searchCount: 0,
      cacheHits: 0,
      totalSearchTime: 0,
      averageResponseTime: 0,
      errorCount: 0,
      memoryUsage: 0,
      componentRenderTime: 0,
    };
    this.startTime = Date.now();
    this.startHealthMonitoring();
  }

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  // Track search performance
  public trackSearchPerformance(
    operationType: 'search' | 'suggestions' | 'cache' | 'render',
    startTime: number,
    success: boolean = true
  ): void {
    // Fix: Use performance.now() instead of Date.now() for proper timing
    const duration = performance.now() - startTime;
    
    switch (operationType) {
      case 'search':
        this.metrics.searchCount++;
        this.metrics.totalSearchTime += duration;
        this.metrics.averageResponseTime = this.metrics.totalSearchTime / this.metrics.searchCount;
        break;
        
      case 'cache':
        if (success) {
          this.metrics.cacheHits++;
        }
        break;
        
      case 'render':
        this.metrics.componentRenderTime = duration;
        break;
    }
    
    if (!success) {
      this.metrics.errorCount++;
    }
    
    // Check for performance alerts
    this.checkPerformanceAlerts(operationType, duration);
    
    // Update memory usage
    this.updateMemoryUsage();
  }

  // Performance monitoring for React components
  public measureComponentPerformance<T>(
    componentName: string,
    operation: () => T
  ): T {
    const startTime = performance.now();
    
    try {
      const result = operation();
      const duration = performance.now() - startTime;
      
      // Only log performance in development mode
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[PERFORMANCE] ${componentName}: ${duration.toFixed(2)}ms`);
      }
      
      if (duration > PERFORMANCE_THRESHOLDS.SLOW_RESPONSE) {
        this.addAlert(`Slow component performance: ${componentName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      this.trackSearchPerformance('render', startTime, false);
      throw error;
    }
  }

  // Async operation performance tracking
  public async measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      console.log(`[PERFORMANCE] ${operationName}: ${duration.toFixed(2)}ms`);
      
      this.trackSearchPerformance('search', startTime, true);
      
      return result;
    } catch (error) {
      this.trackSearchPerformance('search', startTime, false);
      throw error;
    }
  }

  // Cache performance tracking
  public trackCachePerformance(
    operation: 'hit' | 'miss' | 'set' | 'evict',
    key: string,
    size?: number
  ): void {
    const startTime = performance.now();
    
    switch (operation) {
      case 'hit':
        this.trackSearchPerformance('cache', startTime, true);
        break;
      case 'miss':
        this.trackSearchPerformance('cache', startTime, false);
        break;
      case 'set':
        if (size && size > CACHE_CONFIG.MAX_SIZE * 0.8) {
          this.addAlert(`Cache approaching size limit: ${size}/${CACHE_CONFIG.MAX_SIZE}`);
        }
        break;
      case 'evict':
        console.log(`[PERFORMANCE] Cache eviction for key: ${key}`);
        break;
    }
  }

  // Health status calculation
  public getHealthStatus(): HealthStatus {
    const score = this.calculateHealthScore();
    const status: 'healthy' | 'degraded' | 'unhealthy' = 
      score > 0.8 ? 'healthy' : score > 0.5 ? 'degraded' : 'unhealthy';

    return {
      status,
      score,
      metrics: { ...this.metrics },
      alerts: [...this.alerts],
      uptime: Date.now() - this.startTime,
      activeRequests: 0, // Would be populated by RequestManager
    };
  }

  // Performance optimization recommendations
  public getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Cache performance
    const cacheHitRate = this.metrics.searchCount > 0 
      ? this.metrics.cacheHits / this.metrics.searchCount 
      : 0;
      
    if (cacheHitRate < 0.6) {
      recommendations.push('Consider increasing cache TTL or improving cache key strategy');
    }
    
    // Response time
    if (this.metrics.averageResponseTime > PERFORMANCE_THRESHOLDS.NORMAL_RESPONSE) {
      recommendations.push('Optimize API calls and database queries');
    }
    
    // Error rate
    const errorRate = this.metrics.searchCount > 0 
      ? this.metrics.errorCount / this.metrics.searchCount 
      : 0;
      
    if (errorRate > 0.05) {
      recommendations.push('Investigate and fix error sources');
    }
    
    // Memory usage
    if (this.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Consider memory optimization and garbage collection');
    }
    
    return recommendations;
  }

  // Performance dashboard data
  public getDashboardData() {
    const healthStatus = this.getHealthStatus();
    const recommendations = this.getOptimizationRecommendations();
    
    return {
      ...healthStatus,
      recommendations,
      cacheHitRate: this.metrics.searchCount > 0 
        ? (this.metrics.cacheHits / this.metrics.searchCount * 100).toFixed(1)
        : '0',
      errorRate: this.metrics.searchCount > 0 
        ? (this.metrics.errorCount / this.metrics.searchCount * 100).toFixed(1)
        : '0',
      averageResponseTime: this.metrics.averageResponseTime.toFixed(0),
      totalSearches: this.metrics.searchCount,
    };
  }

  private calculateHealthScore(): number {
    // If no activity yet, consider system healthy (waiting for usage)
    if (this.metrics.searchCount === 0) {
      return 1.0;
    }
    
    let score = 1.0;
    
    // Error rate impact
    const errorRate = this.metrics.errorCount / this.metrics.searchCount;
    if (errorRate > 0.1) score -= 0.3;
    else if (errorRate > 0.05) score -= 0.1;
    
    // Response time impact (only if we have response times)
    if (this.metrics.averageResponseTime > 0) {
      if (this.metrics.averageResponseTime > PERFORMANCE_THRESHOLDS.CRITICAL_RESPONSE) score -= 0.4;
      else if (this.metrics.averageResponseTime > PERFORMANCE_THRESHOLDS.SLOW_RESPONSE) score -= 0.2;
      else if (this.metrics.averageResponseTime > PERFORMANCE_THRESHOLDS.NORMAL_RESPONSE) score -= 0.1;
    }
    
    // Cache performance impact (only penalize if significant search volume)
    if (this.metrics.searchCount > 10) {
      const cacheHitRate = this.metrics.cacheHits / this.metrics.searchCount;
      if (cacheHitRate < 0.4) score -= 0.2;
      else if (cacheHitRate < 0.6) score -= 0.1;
    }
    
    // Memory usage impact
    if (this.metrics.memoryUsage > 100 * 1024 * 1024) score -= 0.2; // 100MB
    else if (this.metrics.memoryUsage > 50 * 1024 * 1024) score -= 0.1; // 50MB
    
    return Math.max(0, Math.min(1, score));
  }

  private checkPerformanceAlerts(operationType: string, duration: number): void {
    if (duration > PERFORMANCE_THRESHOLDS.CRITICAL_RESPONSE) {
      this.addAlert(`Critical performance: ${operationType} took ${duration.toFixed(0)}ms`);
    } else if (duration > PERFORMANCE_THRESHOLDS.SLOW_RESPONSE) {
      this.addAlert(`Slow performance: ${operationType} took ${duration.toFixed(0)}ms`);
    }
  }

  private addAlert(message: string): void {
    const timestamp = new Date().toISOString();
    const alert = `[${timestamp}] ${message}`;
    
    this.alerts.unshift(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
    
    console.warn(`[PERFORMANCE ALERT] ${message}`);
  }

  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      const health = this.getHealthStatus();
      
      // Only log if there has been actual activity to avoid false positives
      if (this.metrics.searchCount > 0) {
        if (health.status === 'unhealthy') {
          console.error('[HEALTH CHECK] System is unhealthy:', health);
        } else if (health.status === 'degraded') {
          // Use debug logging for degraded status unless in development
          if (process.env.NODE_ENV === 'development') {
            console.debug('[HEALTH CHECK] System performance is degraded:', health);
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  // Cleanup method
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Reset metrics (for testing or after deployments)
  public resetMetrics(): void {
    this.metrics = {
      searchCount: 0,
      cacheHits: 0,
      totalSearchTime: 0,
      averageResponseTime: 0,
      errorCount: 0,
      memoryUsage: 0,
      componentRenderTime: 0,
    };
    this.alerts = [];
    this.startTime = Date.now();
  }
}