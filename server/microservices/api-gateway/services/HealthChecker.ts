/**
 * Health Checker Service
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Comprehensive health monitoring for all microservices
 * Production-ready with intelligent health assessment and alerting
 */

import { db } from '../../../db';
import { 
  apiGatewayServices, 
  apiGatewayHealthChecks,
  apiGatewayServiceDiscovery 
} from '../../../../shared/schema';
import { eq, desc, gte, count, avg } from 'drizzle-orm';
import { GatewayConfig } from '../config/gateway.config';
import { serviceRoutes } from '../config/routes.config';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'health-checker' }
});

export interface HealthCheckResult {
  serviceId: string;
  serviceName: string;
  isHealthy: boolean;
  responseTime: number;
  httpStatus: number;
  errorMessage?: string;
  checkedAt: Date;
  endpoint: string;
  metadata: Record<string, any>;
}

export interface ServiceHealthSummary {
  serviceName: string;
  totalChecks: number;
  healthyChecks: number;
  unhealthyChecks: number;
  averageResponseTime: number;
  uptime: number;
  lastCheck: Date;
  status: 'healthy' | 'degraded' | 'unhealthy';
}

export interface HealthCheckAlert {
  serviceName: string;
  alertType: 'service_down' | 'high_latency' | 'high_error_rate' | 'recovered';
  message: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export class HealthChecker {
  private config: GatewayConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: Array<(alert: HealthCheckAlert) => void> = [];
  private lastAlerts: Map<string, Date> = new Map();

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing health checker', {
        interval: this.config.services.discovery.healthCheckInterval,
        timeout: this.config.services.discovery.healthCheckTimeout,
        enabled: this.config.services.discovery.enabled
      });

      // Perform initial health check for all services
      await this.checkAllServices();

      logger.info('Health checker initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize health checker', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async checkAllServices(): Promise<HealthCheckResult[]> {
    try {
      const services = await this.getRegisteredServices();
      const healthCheckPromises = services.map(service => 
        this.checkServiceHealth(service).catch(error => ({
          serviceId: service.id,
          serviceName: service.name,
          isHealthy: false,
          responseTime: 0,
          httpStatus: 0,
          errorMessage: error.message,
          checkedAt: new Date(),
          endpoint: service.healthEndpoint,
          metadata: { error: 'health_check_failed' }
        }) as HealthCheckResult)
      );

      const results = await Promise.all(healthCheckPromises);
      
      // Process results and generate alerts
      await this.processHealthCheckResults(results);
      
      // Store results in database
      await this.storeHealthCheckResults(results);

      logger.info('Health check completed', {
        totalServices: results.length,
        healthyServices: results.filter(r => r.isHealthy).length,
        unhealthyServices: results.filter(r => !r.isHealthy).length
      });

      return results;

    } catch (error) {
      logger.error('Error during health check', {
        error: error.message
      });
      return [];
    }
  }

  async checkServiceHealth(service: any): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let result: HealthCheckResult;

    try {
      // Determine health endpoint URL
      const healthUrl = this.buildHealthEndpoint(service);
      
      // Perform health check with timeout
      const response = await this.performHealthRequest(healthUrl);
      const responseTime = Date.now() - startTime;

      // Analyze response
      const isHealthy = this.analyzeHealthResponse(response);
      
      result = {
        serviceId: service.id,
        serviceName: service.name,
        isHealthy,
        responseTime,
        httpStatus: response.status,
        checkedAt: new Date(),
        endpoint: healthUrl,
        metadata: {
          userAgent: 'GetIt-API-Gateway-Health-Checker/2.0.0',
          timeout: this.config.services.discovery.healthCheckTimeout,
          expectedStatus: [200, 201, 204]
        }
      };

      // Additional checks for specific services
      if (isHealthy && response.data) {
        result.metadata.serviceVersion = response.data.version;
        result.metadata.serviceStatus = response.data.status;
        result.metadata.uptime = response.data.uptime;
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      result = {
        serviceId: service.id,
        serviceName: service.name,
        isHealthy: false,
        responseTime,
        httpStatus: 0,
        errorMessage: error.message,
        checkedAt: new Date(),
        endpoint: this.buildHealthEndpoint(service),
        metadata: {
          errorType: error.name || 'unknown',
          timeout: responseTime >= this.config.services.discovery.healthCheckTimeout
        }
      };
    }

    return result;
  }

  private async getRegisteredServices(): Promise<any[]> {
    try {
      // Get services from database
      const dbServices = await db.select().from(apiGatewayServices)
        .where(eq(apiGatewayServices.isActive, true));

      // Get services from configuration
      const configServices = Object.entries(serviceRoutes)
        .filter(([_, config]) => config.target && config.target !== 'internal')
        .map(([name, config]) => {
          const url = new URL(config.target!);
          return {
            id: `config-${name}`,
            name,
            host: url.hostname,
            port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
            healthEndpoint: '/health',
            version: '1.0.0',
            isActive: true
          };
        });

      // Combine and deduplicate
      const allServices = [...dbServices, ...configServices];
      const uniqueServices = allServices.reduce((acc, service) => {
        const key = service.name || service.serviceName;
        if (!acc.find(s => (s.name || s.serviceName) === key)) {
          acc.push(service);
        }
        return acc;
      }, [] as any[]);

      return uniqueServices;

    } catch (error) {
      logger.error('Failed to get registered services', {
        error: error.message
      });
      return [];
    }
  }

  private buildHealthEndpoint(service: any): string {
    const protocol = service.port === 443 ? 'https' : 'http';
    const host = service.host;
    const port = service.port && service.port !== 80 && service.port !== 443 ? `:${service.port}` : '';
    const healthPath = service.healthEndpoint || '/health';
    
    return `${protocol}://${host}${port}${healthPath}`;
  }

  private async performHealthRequest(url: string): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, this.config.services.discovery.healthCheckTimeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'GetIt-API-Gateway-Health-Checker/2.0.0',
          'Accept': 'application/json',
          'X-Health-Check': 'true'
        },
        signal: controller.signal
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      clearTimeout(timeout);

      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data
      };

    } catch (error) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        throw new Error('Health check timeout');
      }
      
      throw error;
    }
  }

  private analyzeHealthResponse(response: any): boolean {
    // Check HTTP status
    if (response.status < 200 || response.status >= 300) {
      return false;
    }

    // Check response data if available
    if (response.data && typeof response.data === 'object') {
      // Standard health check response format
      if (response.data.status && response.data.status !== 'healthy' && response.data.status !== 'ok') {
        return false;
      }

      // Check for specific error indicators
      if (response.data.error || response.data.errors) {
        return false;
      }

      // Check database connectivity if reported
      if (response.data.database && response.data.database.status === 'down') {
        return false;
      }
    }

    return true;
  }

  private async processHealthCheckResults(results: HealthCheckResult[]): Promise<void> {
    for (const result of results) {
      await this.checkForAlerts(result);
    }
  }

  private async checkForAlerts(result: HealthCheckResult): Promise<void> {
    const serviceName = result.serviceName;
    const lastAlert = this.lastAlerts.get(serviceName);
    const alertCooldown = 5 * 60 * 1000; // 5 minutes

    // Skip if we've alerted recently
    if (lastAlert && Date.now() - lastAlert.getTime() < alertCooldown) {
      return;
    }

    // Get recent health history for this service
    const recentChecks = await this.getRecentHealthChecks(serviceName, 10);
    
    if (recentChecks.length < 3) {
      return; // Not enough data for alerting
    }

    const healthyCount = recentChecks.filter(check => check.isHealthy).length;
    const averageResponseTime = recentChecks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / recentChecks.length;

    // Service down alert
    if (!result.isHealthy && healthyCount === 0) {
      await this.sendAlert({
        serviceName,
        alertType: 'service_down',
        message: `Service ${serviceName} is down. All recent health checks failed.`,
        timestamp: new Date(),
        metadata: {
          consecutiveFailures: recentChecks.length,
          lastError: result.errorMessage,
          httpStatus: result.httpStatus
        }
      });
    }

    // High latency alert
    if (result.isHealthy && averageResponseTime > this.config.monitoring.alerts.latencyThreshold) {
      await this.sendAlert({
        serviceName,
        alertType: 'high_latency',
        message: `Service ${serviceName} is experiencing high latency. Average response time: ${Math.round(averageResponseTime)}ms`,
        timestamp: new Date(),
        metadata: {
          averageResponseTime: Math.round(averageResponseTime),
          threshold: this.config.monitoring.alerts.latencyThreshold,
          recentChecks: recentChecks.length
        }
      });
    }

    // Recovery alert
    if (result.isHealthy && lastAlert && healthyCount > 0) {
      await this.sendAlert({
        serviceName,
        alertType: 'recovered',
        message: `Service ${serviceName} has recovered and is now healthy.`,
        timestamp: new Date(),
        metadata: {
          downtime: Date.now() - lastAlert.getTime(),
          responseTime: result.responseTime
        }
      });
    }
  }

  private async sendAlert(alert: HealthCheckAlert): Promise<void> {
    this.lastAlerts.set(alert.serviceName, alert.timestamp);

    // Call registered alert callbacks
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (error) {
        logger.error('Error in alert callback', {
          error: error.message,
          alertType: alert.alertType,
          serviceName: alert.serviceName
        });
      }
    }

    // Log the alert
    logger.warn('Health check alert', {
      serviceName: alert.serviceName,
      alertType: alert.alertType,
      message: alert.message,
      metadata: alert.metadata
    });

    // Send to external alerting systems if configured
    await this.sendExternalAlert(alert);
  }

  private async sendExternalAlert(alert: HealthCheckAlert): Promise<void> {
    const webhooks = this.config.monitoring.alerts.webhooks;
    
    for (const webhook of webhooks) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GetIt-API-Gateway-Alerts/2.0.0'
          },
          body: JSON.stringify({
            ...alert,
            source: 'GetIt-API-Gateway',
            environment: this.config.server.environment
          })
        });
      } catch (error) {
        logger.error('Failed to send external alert', {
          webhook,
          error: error.message,
          alertType: alert.alertType
        });
      }
    }
  }

  private async storeHealthCheckResults(results: HealthCheckResult[]): Promise<void> {
    try {
      const healthChecks = results.map(result => ({
        serviceId: result.serviceId,
        isHealthy: result.isHealthy,
        responseTime: result.responseTime,
        httpStatus: result.httpStatus,
        errorMessage: result.errorMessage,
        checkedAt: result.checkedAt
      }));

      // Batch insert health check results
      if (healthChecks.length > 0) {
        await db.insert(apiGatewayHealthChecks).values(healthChecks);
      }

    } catch (error) {
      logger.error('Failed to store health check results', {
        error: error.message,
        resultCount: results.length
      });
    }
  }

  async getRecentHealthChecks(serviceName: string, limit: number = 50): Promise<any[]> {
    try {
      const checks = await db.select()
        .from(apiGatewayHealthChecks)
        .leftJoin(apiGatewayServices, eq(apiGatewayHealthChecks.serviceId, apiGatewayServices.id))
        .where(eq(apiGatewayServices.serviceName, serviceName))
        .orderBy(desc(apiGatewayHealthChecks.checkedAt))
        .limit(limit);

      return checks.map(check => check.api_gateway_health_checks);

    } catch (error) {
      logger.error('Failed to get recent health checks', {
        serviceName,
        error: error.message
      });
      return [];
    }
  }

  async getServiceHealthSummary(serviceName: string, hours: number = 24): Promise<ServiceHealthSummary | null> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const checks = await db.select()
        .from(apiGatewayHealthChecks)
        .leftJoin(apiGatewayServices, eq(apiGatewayHealthChecks.serviceId, apiGatewayServices.id))
        .where(
          eq(apiGatewayServices.serviceName, serviceName),
          gte(apiGatewayHealthChecks.checkedAt, since)
        )
        .orderBy(desc(apiGatewayHealthChecks.checkedAt));

      if (checks.length === 0) {
        return null;
      }

      const healthChecks = checks.map(check => check.api_gateway_health_checks);
      const healthyChecks = healthChecks.filter(check => check.isHealthy).length;
      const totalChecks = healthChecks.length;
      const averageResponseTime = healthChecks
        .filter(check => check.responseTime)
        .reduce((sum, check) => sum + check.responseTime!, 0) / totalChecks;

      const uptime = (healthyChecks / totalChecks) * 100;
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (uptime >= 95) status = 'healthy';
      else if (uptime >= 80) status = 'degraded';
      else status = 'unhealthy';

      return {
        serviceName,
        totalChecks,
        healthyChecks,
        unhealthyChecks: totalChecks - healthyChecks,
        averageResponseTime: Math.round(averageResponseTime),
        uptime: Math.round(uptime * 100) / 100,
        lastCheck: healthChecks[0].checkedAt,
        status
      };

    } catch (error) {
      logger.error('Failed to get service health summary', {
        serviceName,
        error: error.message
      });
      return null;
    }
  }

  async getAllServiceHealthSummaries(hours: number = 24): Promise<ServiceHealthSummary[]> {
    try {
      const services = await this.getRegisteredServices();
      const summaryPromises = services.map(service => 
        this.getServiceHealthSummary(service.name || service.serviceName, hours)
      );

      const summaries = await Promise.all(summaryPromises);
      return summaries.filter(summary => summary !== null) as ServiceHealthSummary[];

    } catch (error) {
      logger.error('Failed to get all service health summaries', {
        error: error.message
      });
      return [];
    }
  }

  onAlert(callback: (alert: HealthCheckAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  async recordFailure(serviceName: string): Promise<void> {
    // This method is called by circuit breaker to record failures
    // We'll store this information for health trending
    try {
      const [service] = await db.select().from(apiGatewayServices)
        .where(eq(apiGatewayServices.serviceName, serviceName))
        .limit(1);

      if (service) {
        await db.insert(apiGatewayHealthChecks).values({
          serviceId: service.id,
          isHealthy: false,
          responseTime: 0,
          httpStatus: 0,
          errorMessage: 'Circuit breaker failure recorded',
          checkedAt: new Date()
        });
      }
    } catch (error) {
      logger.error('Failed to record failure', {
        serviceName,
        error: error.message
      });
    }
  }

  async getFailureCount(serviceName: string, minutes: number = 5): Promise<number> {
    try {
      const since = new Date(Date.now() - minutes * 60 * 1000);
      
      const [result] = await db.select({ count: count() })
        .from(apiGatewayHealthChecks)
        .leftJoin(apiGatewayServices, eq(apiGatewayHealthChecks.serviceId, apiGatewayServices.id))
        .where(
          eq(apiGatewayServices.serviceName, serviceName),
          eq(apiGatewayHealthChecks.isHealthy, false),
          gte(apiGatewayHealthChecks.checkedAt, since)
        );

      return result?.count || 0;

    } catch (error) {
      logger.error('Failed to get failure count', {
        serviceName,
        error: error.message
      });
      return 0;
    }
  }

  async stop(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    logger.info('Health checker stopped');
  }
}

export default HealthChecker;