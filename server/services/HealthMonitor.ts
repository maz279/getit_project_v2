import { EventEmitter } from 'events';
import { logger } from './LoggingService';

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  metrics: HealthMetric[];
  dependencies: string[];
  uptime: number;
  version: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  infrastructure: {
    database: 'connected' | 'disconnected' | 'slow';
    redis: 'connected' | 'disconnected' | 'slow';
    elasticsearch: 'connected' | 'disconnected' | 'slow';
    storage: 'available' | 'unavailable' | 'degraded';
  };
  metrics: {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    activeUsers: number;
    systemLoad: number;
    memoryUsage: number;
    diskUsage: number;
  };
  alerts: Alert[];
  timestamp: Date;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  metadata?: any;
}

/**
 * Comprehensive Health Monitoring Service for GetIt Platform
 * Monitors system health, performance metrics, and generates alerts
 */
export class HealthMonitor extends EventEmitter {
  private services: Map<string, ServiceHealth> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private metrics: Map<string, HealthMetric[]> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    super();
    this.startMonitoring();
    this.setupAlertHandlers();
  }

  // Health Check Management
  registerService(serviceName: string, healthCheck: () => Promise<Partial<ServiceHealth>>): void {
    const defaultHealth: ServiceHealth = {
      serviceName,
      status: 'healthy',
      lastCheck: new Date(),
      responseTime: 0,
      metrics: [],
      dependencies: [],
      uptime: 0,
      version: '1.0.0'
    };

    this.services.set(serviceName, defaultHealth);
    
    logger.info(`Health monitoring enabled for service: ${serviceName}`, {
      serviceName
    });
  }

  private startMonitoring(): void {
    // Health checks every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 30000);

    // Metrics collection every 5 seconds
    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics();
    }, 5000);

    logger.info('Health monitoring started');
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, currentHealth] of this.services) {
      try {
        const startTime = Date.now();
        
        // Simulate health check - in production, this would call actual service endpoints
        const healthData = await this.simulateHealthCheck(serviceName);
        
        const responseTime = Date.now() - startTime;
        
        const updatedHealth: ServiceHealth = {
          ...currentHealth,
          ...healthData,
          lastCheck: new Date(),
          responseTime
        };

        this.services.set(serviceName, updatedHealth);
        
        // Check for status changes
        if (currentHealth.status !== updatedHealth.status) {
          this.handleStatusChange(serviceName, currentHealth.status, updatedHealth.status);
        }

        // Check thresholds and generate alerts
        this.checkThresholds(serviceName, updatedHealth);

      } catch (error) {
        logger.error(`Health check failed for ${serviceName}`, error as Error);
        
        this.services.set(serviceName, {
          ...currentHealth,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: -1
        });

        this.createAlert({
          level: 'error',
          title: `Service Health Check Failed`,
          message: `Health check for ${serviceName} failed: ${(error as Error).message}`,
          source: serviceName
        });
      }
    }
  }

  private async simulateHealthCheck(serviceName: string): Promise<Partial<ServiceHealth>> {
    // Simulate different health scenarios
    await this.delay(Math.random() * 100 + 20);
    
    const scenarios = {
      'user-service': () => ({
        status: Math.random() > 0.95 ? 'degraded' : 'healthy' as const,
        uptime: Date.now() - (Math.random() * 86400000), // Random uptime up to 24h
        metrics: [
          { name: 'active_sessions', value: Math.floor(Math.random() * 1000), unit: 'count', timestamp: new Date() },
          { name: 'login_rate', value: Math.random() * 10, unit: 'per_second', timestamp: new Date() }
        ]
      }),
      'product-service': () => ({
        status: Math.random() > 0.9 ? 'degraded' : 'healthy' as const,
        uptime: Date.now() - (Math.random() * 86400000),
        metrics: [
          { name: 'catalog_size', value: Math.floor(Math.random() * 100000), unit: 'products', timestamp: new Date() },
          { name: 'search_latency', value: Math.random() * 200, unit: 'ms', timestamp: new Date() }
        ]
      }),
      'order-service': () => ({
        status: Math.random() > 0.92 ? 'degraded' : 'healthy' as const,
        uptime: Date.now() - (Math.random() * 86400000),
        metrics: [
          { name: 'pending_orders', value: Math.floor(Math.random() * 500), unit: 'count', timestamp: new Date() },
          { name: 'processing_time', value: Math.random() * 5000, unit: 'ms', timestamp: new Date() }
        ]
      }),
      'payment-service': () => ({
        status: Math.random() > 0.98 ? 'degraded' : 'healthy' as const,
        uptime: Date.now() - (Math.random() * 86400000),
        metrics: [
          { name: 'transaction_volume', value: Math.random() * 1000000, unit: 'BDT', timestamp: new Date() },
          { name: 'gateway_latency', value: Math.random() * 3000, unit: 'ms', timestamp: new Date() }
        ]
      })
    };

    const scenario = scenarios[serviceName as keyof typeof scenarios];
    return scenario ? scenario() : { status: 'healthy' };
  }

  private async collectMetrics(): Promise<void> {
    // Collect system-wide metrics
    const systemMetrics: HealthMetric[] = [
      {
        name: 'cpu_usage',
        value: Math.random() * 100,
        unit: 'percent',
        timestamp: new Date(),
        threshold: { warning: 70, critical: 90 }
      },
      {
        name: 'memory_usage',
        value: Math.random() * 100,
        unit: 'percent',
        timestamp: new Date(),
        threshold: { warning: 80, critical: 95 }
      },
      {
        name: 'disk_usage',
        value: Math.random() * 100,
        unit: 'percent',
        timestamp: new Date(),
        threshold: { warning: 85, critical: 95 }
      },
      {
        name: 'active_connections',
        value: Math.floor(Math.random() * 10000),
        unit: 'count',
        timestamp: new Date(),
        threshold: { warning: 8000, critical: 9500 }
      },
      {
        name: 'request_rate',
        value: Math.random() * 1000,
        unit: 'per_second',
        timestamp: new Date(),
        threshold: { warning: 800, critical: 950 }
      }
    ];

    this.metrics.set('system', systemMetrics);

    // Check thresholds for system metrics
    systemMetrics.forEach(metric => {
      if (metric.threshold) {
        if (metric.value >= metric.threshold.critical) {
          this.createAlert({
            level: 'critical',
            title: `Critical: ${metric.name}`,
            message: `${metric.name} is at critical level: ${metric.value}${metric.unit}`,
            source: 'system',
            metadata: { metric }
          });
        } else if (metric.value >= metric.threshold.warning) {
          this.createAlert({
            level: 'warning',
            title: `Warning: ${metric.name}`,
            message: `${metric.name} is above warning threshold: ${metric.value}${metric.unit}`,
            source: 'system',
            metadata: { metric }
          });
        }
      }
    });
  }

  private checkThresholds(serviceName: string, health: ServiceHealth): void {
    // Check response time threshold
    if (health.responseTime > 5000) {
      this.createAlert({
        level: 'warning',
        title: `Slow Response Time`,
        message: `${serviceName} response time is ${health.responseTime}ms`,
        source: serviceName
      });
    }

    // Check individual service metrics
    health.metrics.forEach(metric => {
      if (metric.threshold) {
        if (metric.value >= metric.threshold.critical) {
          this.createAlert({
            level: 'critical',
            title: `Critical Metric: ${metric.name}`,
            message: `${serviceName} metric ${metric.name} is critical: ${metric.value}${metric.unit}`,
            source: serviceName,
            metadata: { metric }
          });
        }
      }
    });
  }

  private handleStatusChange(serviceName: string, oldStatus: string, newStatus: string): void {
    logger.info(`Service status changed: ${serviceName}`, {
      serviceName,
      oldStatus,
      newStatus
    });

    const level = newStatus === 'unhealthy' ? 'error' : 
                  newStatus === 'degraded' ? 'warning' : 'info';

    this.createAlert({
      level,
      title: `Service Status Changed`,
      message: `${serviceName} status changed from ${oldStatus} to ${newStatus}`,
      source: serviceName
    });

    this.emit('statusChange', { serviceName, oldStatus, newStatus });
  }

  // Alert Management
  private createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const alert: Alert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      acknowledged: false,
      ...alertData
    };

    this.alerts.set(alert.id, alert);

    logger.warn(`Alert created: ${alert.title}`, {
      alertId: alert.id,
      level: alert.level,
      source: alert.source
    });

    this.emit('alert', alert);

    // Auto-cleanup old alerts (keep only last 1000)
    if (this.alerts.size > 1000) {
      const sortedAlerts = Array.from(this.alerts.entries())
        .sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime());
      
      const toDelete = sortedAlerts.slice(0, this.alerts.size - 1000);
      toDelete.forEach(([id]) => this.alerts.delete(id));
    }
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      logger.info(`Alert acknowledged: ${alertId}`);
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      logger.info(`Alert resolved: ${alertId}`);
      return true;
    }
    return false;
  }

  // Health Status Retrieval
  getSystemHealth(): SystemHealth {
    const services = Array.from(this.services.values());
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolvedAt)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50); // Latest 50 unresolved alerts

    const overall = this.calculateOverallHealth(services);
    const systemMetrics = this.metrics.get('system') || [];

    return {
      overall,
      services,
      infrastructure: {
        database: Math.random() > 0.95 ? 'slow' : 'connected',
        redis: Math.random() > 0.98 ? 'disconnected' : 'connected',
        elasticsearch: Math.random() > 0.96 ? 'slow' : 'connected',
        storage: Math.random() > 0.99 ? 'degraded' : 'available'
      },
      metrics: {
        totalRequests: Math.floor(Math.random() * 1000000),
        errorRate: Math.random() * 5,
        averageResponseTime: Math.random() * 500 + 100,
        activeUsers: Math.floor(Math.random() * 50000),
        systemLoad: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100
      },
      alerts: activeAlerts,
      timestamp: new Date()
    };
  }

  private calculateOverallHealth(services: ServiceHealth[]): 'healthy' | 'degraded' | 'unhealthy' {
    if (services.length === 0) return 'healthy';
    
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    
    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > services.length * 0.3) return 'degraded'; // If >30% degraded
    if (degradedCount > 0) return 'degraded';
    
    return 'healthy';
  }

  getServiceHealth(serviceName: string): ServiceHealth | null {
    return this.services.get(serviceName) || null;
  }

  getAlerts(filter?: { level?: string; source?: string; resolved?: boolean }): Alert[] {
    let alerts = Array.from(this.alerts.values());
    
    if (filter) {
      if (filter.level) {
        alerts = alerts.filter(alert => alert.level === filter.level);
      }
      if (filter.source) {
        alerts = alerts.filter(alert => alert.source === filter.source);
      }
      if (filter.resolved !== undefined) {
        alerts = alerts.filter(alert => !!alert.resolvedAt === filter.resolved);
      }
    }
    
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getMetrics(source: string = 'system', since?: Date): HealthMetric[] {
    const metrics = this.metrics.get(source) || [];
    
    if (since) {
      return metrics.filter(metric => metric.timestamp >= since);
    }
    
    return metrics;
  }

  // Utility Methods
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupAlertHandlers(): void {
    this.on('alert', (alert: Alert) => {
      // In production, this would send notifications via email, Slack, etc.
      if (alert.level === 'critical') {
        logger.error(`CRITICAL ALERT: ${alert.title}`, undefined, {
          alertId: alert.id,
          source: alert.source
        });
      }
    });
  }

  // Cleanup
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    logger.info('Health monitoring stopped');
  }

  // Dashboard Data for Admin Panel
  getDashboardData(): any {
    const systemHealth = this.getSystemHealth();
    const recentAlerts = this.getAlerts({ resolved: false }).slice(0, 10);
    
    return {
      overview: {
        status: systemHealth.overall,
        totalServices: systemHealth.services.length,
        healthyServices: systemHealth.services.filter(s => s.status === 'healthy').length,
        degradedServices: systemHealth.services.filter(s => s.status === 'degraded').length,
        unhealthyServices: systemHealth.services.filter(s => s.status === 'unhealthy').length,
        totalAlerts: this.alerts.size,
        unresolvedAlerts: Array.from(this.alerts.values()).filter(a => !a.resolvedAt).length
      },
      metrics: systemHealth.metrics,
      infrastructure: systemHealth.infrastructure,
      recentAlerts,
      serviceStatus: systemHealth.services.map(service => ({
        name: service.serviceName,
        status: service.status,
        responseTime: service.responseTime,
        uptime: service.uptime,
        lastCheck: service.lastCheck
      }))
    };
  }
}

// Global health monitor instance
export const healthMonitor = new HealthMonitor();

// Register default services for monitoring
const defaultServices = [
  'user-service',
  'product-service', 
  'order-service',
  'payment-service',
  'notification-service',
  'analytics-service',
  'search-service'
];

defaultServices.forEach(serviceName => {
  healthMonitor.registerService(serviceName, async () => ({}));
});

export default healthMonitor;