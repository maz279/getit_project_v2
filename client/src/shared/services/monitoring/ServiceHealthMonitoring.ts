/**
 * Phase 2: Service Layer Standardization
 * Service Health Monitoring Implementation
 * Investment: $7,000 | Week 3-4
 */

// Health status types
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: HealthStatus;
  timestamp: number;
}

interface ServiceHealth {
  serviceName: string;
  status: HealthStatus;
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastCheck: number;
  metrics: HealthMetric[];
  dependencies: DependencyHealth[];
  alerts: Alert[];
}

interface DependencyHealth {
  name: string;
  status: HealthStatus;
  responseTime?: number;
  lastCheck: number;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
  service: string;
}

interface HealthCheckConfig {
  interval: number; // milliseconds
  timeout: number;
  retryAttempts: number;
  thresholds: {
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
}

/**
 * Comprehensive service health monitoring system
 */
export class ServiceHealthMonitor {
  private services = new Map<string, ServiceHealth>();
  private healthChecks = new Map<string, () => Promise<Partial<ServiceHealth>>>();
  private config: HealthCheckConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alerts: Alert[] = [];
  private subscribers = new Set<(health: ServiceHealth[]) => void>();

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = {
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      retryAttempts: 3,
      thresholds: {
        responseTime: 1000, // 1 second
        errorRate: 0.05, // 5%
        uptime: 0.99 // 99%
      },
      ...config
    };

    this.startMonitoring();
  }

  /**
   * Register a service for health monitoring
   */
  registerService(
    serviceName: string,
    healthCheckFn: () => Promise<Partial<ServiceHealth>>
  ): void {
    this.healthChecks.set(serviceName, healthCheckFn);
    
    // Initialize service health record
    this.services.set(serviceName, {
      serviceName,
      status: HealthStatus.UNKNOWN,
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
      lastCheck: Date.now(),
      metrics: [],
      dependencies: [],
      alerts: []
    });
  }

  /**
   * Unregister a service
   */
  unregisterService(serviceName: string): void {
    this.healthChecks.delete(serviceName);
    this.services.delete(serviceName);
  }

  /**
   * Get health status for a specific service
   */
  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.services.get(serviceName);
  }

  /**
   * Get health status for all services
   */
  getAllServicesHealth(): ServiceHealth[] {
    return Array.from(this.services.values());
  }

  /**
   * Get system-wide health summary
   */
  getSystemHealth(): {
    overallStatus: HealthStatus;
    healthyServices: number;
    degradedServices: number;
    unhealthyServices: number;
    totalServices: number;
    criticalAlerts: number;
    summary: string;
  } {
    const services = this.getAllServicesHealth();
    const healthy = services.filter(s => s.status === HealthStatus.HEALTHY).length;
    const degraded = services.filter(s => s.status === HealthStatus.DEGRADED).length;
    const unhealthy = services.filter(s => s.status === HealthStatus.UNHEALTHY).length;
    const criticalAlerts = this.alerts.filter(a => a.level === 'critical' && !a.acknowledged).length;

    let overallStatus: HealthStatus;
    if (unhealthy > 0 || criticalAlerts > 0) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else if (degraded > 0) {
      overallStatus = HealthStatus.DEGRADED;
    } else if (healthy === services.length && services.length > 0) {
      overallStatus = HealthStatus.HEALTHY;
    } else {
      overallStatus = HealthStatus.UNKNOWN;
    }

    let summary = `${healthy}/${services.length} services healthy`;
    if (degraded > 0) summary += `, ${degraded} degraded`;
    if (unhealthy > 0) summary += `, ${unhealthy} unhealthy`;
    if (criticalAlerts > 0) summary += `, ${criticalAlerts} critical alerts`;

    return {
      overallStatus,
      healthyServices: healthy,
      degradedServices: degraded,
      unhealthyServices: unhealthy,
      totalServices: services.length,
      criticalAlerts,
      summary
    };
  }

  /**
   * Subscribe to health updates
   */
  subscribe(callback: (health: ServiceHealth[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Start monitoring loop
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.interval);

    // Initial health check
    this.performHealthChecks();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Perform health checks for all registered services
   */
  private async performHealthChecks(): Promise<void> {
    const checkPromises = Array.from(this.healthChecks.entries()).map(
      async ([serviceName, healthCheckFn]) => {
        try {
          const startTime = performance.now();
          const healthUpdate = await Promise.race([
            healthCheckFn(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Health check timeout')), this.config.timeout)
            )
          ]);
          const responseTime = performance.now() - startTime;

          // Update service health
          const existingHealth = this.services.get(serviceName);
          if (existingHealth) {
            const updatedHealth: ServiceHealth = {
              ...existingHealth,
              ...healthUpdate,
              responseTime,
              lastCheck: Date.now(),
              status: this.determineHealthStatus(serviceName, responseTime, healthUpdate)
            };

            this.services.set(serviceName, updatedHealth);
            this.checkForAlerts(updatedHealth);
          }
        } catch (error) {
          // Handle failed health check
          const existingHealth = this.services.get(serviceName);
          if (existingHealth) {
            const failedHealth: ServiceHealth = {
              ...existingHealth,
              status: HealthStatus.UNHEALTHY,
              lastCheck: Date.now(),
              responseTime: this.config.timeout
            };

            this.services.set(serviceName, failedHealth);
            this.createAlert('error', `Health check failed for ${serviceName}: ${error.message}`, serviceName);
          }
        }
      }
    );

    await Promise.allSettled(checkPromises);
    
    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Determine health status based on metrics
   */
  private determineHealthStatus(
    serviceName: string,
    responseTime: number,
    healthUpdate: Partial<ServiceHealth>
  ): HealthStatus {
    const { thresholds } = this.config;
    
    // Check response time
    if (responseTime > thresholds.responseTime * 2) {
      return HealthStatus.UNHEALTHY;
    } else if (responseTime > thresholds.responseTime) {
      return HealthStatus.DEGRADED;
    }

    // Check error rate
    if (healthUpdate.errorRate !== undefined) {
      if (healthUpdate.errorRate > thresholds.errorRate * 2) {
        return HealthStatus.UNHEALTHY;
      } else if (healthUpdate.errorRate > thresholds.errorRate) {
        return HealthStatus.DEGRADED;
      }
    }

    // Check uptime
    if (healthUpdate.uptime !== undefined && healthUpdate.uptime < thresholds.uptime) {
      return HealthStatus.DEGRADED;
    }

    // Check dependencies
    const dependencies = healthUpdate.dependencies || [];
    const unhealthyDeps = dependencies.filter(dep => dep.status === HealthStatus.UNHEALTHY);
    if (unhealthyDeps.length > 0) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  /**
   * Check for alert conditions and create alerts
   */
  private checkForAlerts(health: ServiceHealth): void {
    const { thresholds } = this.config;

    // High response time alert
    if (health.responseTime > thresholds.responseTime * 3) {
      this.createAlert(
        'critical',
        `${health.serviceName} response time is critically high: ${health.responseTime.toFixed(2)}ms`,
        health.serviceName
      );
    } else if (health.responseTime > thresholds.responseTime * 2) {
      this.createAlert(
        'warning',
        `${health.serviceName} response time is high: ${health.responseTime.toFixed(2)}ms`,
        health.serviceName
      );
    }

    // High error rate alert
    if (health.errorRate > thresholds.errorRate * 3) {
      this.createAlert(
        'critical',
        `${health.serviceName} error rate is critically high: ${(health.errorRate * 100).toFixed(2)}%`,
        health.serviceName
      );
    } else if (health.errorRate > thresholds.errorRate * 2) {
      this.createAlert(
        'warning',
        `${health.serviceName} error rate is high: ${(health.errorRate * 100).toFixed(2)}%`,
        health.serviceName
      );
    }

    // Service status alerts
    if (health.status === HealthStatus.UNHEALTHY) {
      this.createAlert(
        'critical',
        `${health.serviceName} is unhealthy`,
        health.serviceName
      );
    } else if (health.status === HealthStatus.DEGRADED) {
      this.createAlert(
        'warning',
        `${health.serviceName} is degraded`,
        health.serviceName
      );
    }
  }

  /**
   * Create a new alert
   */
  private createAlert(
    level: Alert['level'],
    message: string,
    service: string
  ): void {
    // Check if similar alert already exists (avoid spam)
    const existingAlert = this.alerts.find(
      alert => alert.message === message && alert.service === service && !alert.acknowledged
    );

    if (!existingAlert) {
      const alert: Alert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        level,
        message,
        timestamp: Date.now(),
        acknowledged: false,
        service
      };

      this.alerts.push(alert);

      // Keep only the last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }
    }
  }

  /**
   * Get all alerts
   */
  getAlerts(acknowledged = false): Alert[] {
    return this.alerts.filter(alert => alert.acknowledged === acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge: number = 86400000): void { // 24 hours default
    const cutoff = Date.now() - maxAge;
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Notify all subscribers of health updates
   */
  private notifySubscribers(): void {
    const healthData = this.getAllServicesHealth();
    this.subscribers.forEach(callback => {
      try {
        callback(healthData);
      } catch (error) {
        console.error('Error notifying health subscriber:', error);
      }
    });
  }

  /**
   * Get health monitoring statistics
   */
  getMonitoringStats(): {
    registeredServices: number;
    totalChecks: number;
    averageResponseTime: number;
    systemUptime: number;
    alertsGenerated: number;
  } {
    const services = this.getAllServicesHealth();
    const totalResponseTime = services.reduce((sum, service) => sum + service.responseTime, 0);
    const averageResponseTime = services.length > 0 ? totalResponseTime / services.length : 0;

    return {
      registeredServices: services.length,
      totalChecks: services.reduce((sum, service) => sum + 1, 0), // Simplified
      averageResponseTime,
      systemUptime: this.calculateSystemUptime(),
      alertsGenerated: this.alerts.length
    };
  }

  /**
   * Calculate system uptime percentage
   */
  private calculateSystemUptime(): number {
    const services = this.getAllServicesHealth();
    if (services.length === 0) return 100;

    const totalUptime = services.reduce((sum, service) => sum + (service.uptime || 100), 0);
    return totalUptime / services.length;
  }

  /**
   * Export health data for external monitoring systems
   */
  exportHealthData(): {
    timestamp: number;
    systemHealth: ReturnType<ServiceHealthMonitor['getSystemHealth']>;
    services: ServiceHealth[];
    alerts: Alert[];
    stats: ReturnType<ServiceHealthMonitor['getMonitoringStats']>;
  } {
    return {
      timestamp: Date.now(),
      systemHealth: this.getSystemHealth(),
      services: this.getAllServicesHealth(),
      alerts: this.getAlerts(),
      stats: this.getMonitoringStats()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.services.clear();
    this.healthChecks.clear();
    this.alerts = [];
    this.subscribers.clear();
  }
}