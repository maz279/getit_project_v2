/**
 * Service Registry
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Dynamic service discovery and registration with health monitoring
 * Production-ready with database persistence and load balancing
 */

import { db } from '../../../db';
import { 
  apiGatewayServices, 
  apiGatewayServiceDiscovery, 
  apiGatewayHealthChecks 
} from '../../../../shared/schema';
import { eq, and, sql, desc, gte } from 'drizzle-orm';
import { GatewayConfig } from '../config/gateway.config';
import { serviceRoutes } from '../config/routes.config';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'service-registry' }
});

export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  version: string;
  basePath: string;
  healthEndpoint: string;
  tags: string[];
  metadata: Record<string, any>;
  lastHeartbeat: Date;
  isHealthy: boolean;
  weight: number;
  priority: number;
}

export interface ServiceHealth {
  serviceId: string;
  isHealthy: boolean;
  responseTime: number;
  httpStatus: number;
  errorMessage?: string;
  checkedAt: Date;
}

export class ServiceRegistry {
  private config: GatewayConfig;
  private services: Map<string, ServiceInstance[]> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Load existing services from database
      await this.loadServicesFromDatabase();
      
      // Initialize default services from configuration
      await this.initializeDefaultServices();
      
      // Start health check monitoring
      if (this.config.services.discovery.enabled) {
        this.startHealthChecking();
      }

      logger.info('Service registry initialized', {
        serviceCount: this.services.size,
        healthCheckEnabled: this.config.services.discovery.enabled
      });

    } catch (error) {
      logger.error('Failed to initialize service registry', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  private async loadServicesFromDatabase(): Promise<void> {
    try {
      const dbServices = await db.select().from(apiGatewayServices)
        .where(eq(apiGatewayServices.isActive, true));

      for (const service of dbServices) {
        const instances = JSON.parse(service.instances as string || '[]');
        
        const serviceInstances: ServiceInstance[] = instances.map((instance: any) => ({
          id: service.id,
          name: service.serviceName || service.name,
          host: instance.host || service.host,
          port: instance.port || service.port,
          version: service.version || '1.0.0',
          basePath: service.basePath || '',
          healthEndpoint: service.healthEndpoint || '/health',
          tags: JSON.parse(service.tags as string || '[]'),
          metadata: JSON.parse(service.metadata as string || '{}'),
          lastHeartbeat: new Date(),
          isHealthy: true,
          weight: instance.weight || 1,
          priority: service.priority || 1
        }));

        if (serviceInstances.length > 0) {
          this.services.set(service.serviceName || service.name, serviceInstances);
        }
      }

      logger.info('Loaded services from database', {
        serviceCount: this.services.size,
        services: Array.from(this.services.keys())
      });

    } catch (error) {
      logger.error('Failed to load services from database', {
        error: error.message
      });
    }
  }

  private async initializeDefaultServices(): Promise<void> {
    try {
      // Register default services from configuration
      for (const [serviceName, routeConfig] of Object.entries(serviceRoutes)) {
        if (routeConfig.target && routeConfig.target !== 'internal') {
          const url = new URL(routeConfig.target);
          
          const serviceInstance: ServiceInstance = {
            id: `default-${serviceName}`,
            name: serviceName,
            host: url.hostname,
            port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
            version: '1.0.0',
            basePath: routeConfig.path,
            healthEndpoint: '/health',
            tags: ['default', 'microservice'],
            metadata: {
              authentication: routeConfig.authentication.required,
              rateLimit: routeConfig.rateLimit.enabled,
              caching: routeConfig.caching.enabled,
              bangladesh: routeConfig.bangladesh
            },
            lastHeartbeat: new Date(),
            isHealthy: true,
            weight: 1,
            priority: 1
          };

          await this.registerService(serviceInstance);
        }
      }

      logger.info('Default services initialized from configuration');

    } catch (error) {
      logger.error('Failed to initialize default services', {
        error: error.message
      });
    }
  }

  async registerService(service: ServiceInstance): Promise<void> {
    try {
      // Validate service information
      this.validateServiceInstance(service);

      // Check if service already exists in database
      const [existingService] = await db.select().from(apiGatewayServices)
        .where(eq(apiGatewayServices.serviceName, service.name));

      if (existingService) {
        // Update existing service
        await this.updateServiceInstances(existingService.id, service);
      } else {
        // Create new service entry
        await this.createNewService(service);
      }

      // Update in-memory registry
      const existingInstances = this.services.get(service.name) || [];
      const updatedInstances = [...existingInstances.filter(s => s.id !== service.id), service];
      this.services.set(service.name, updatedInstances);

      // Record service discovery
      await this.recordServiceDiscovery(service);

      logger.info('Service registered successfully', {
        serviceName: service.name,
        host: service.host,
        port: service.port,
        instanceId: service.id
      });

    } catch (error) {
      logger.error('Failed to register service', {
        serviceName: service.name,
        error: error.message
      });
      throw error;
    }
  }

  async deregisterService(serviceName: string, instanceId?: string): Promise<void> {
    try {
      if (instanceId) {
        // Remove specific instance
        const instances = this.services.get(serviceName) || [];
        const updatedInstances = instances.filter(s => s.id !== instanceId);
        
        if (updatedInstances.length > 0) {
          this.services.set(serviceName, updatedInstances);
        } else {
          this.services.delete(serviceName);
        }
      } else {
        // Remove entire service
        this.services.delete(serviceName);
        
        // Mark as inactive in database
        await db.update(apiGatewayServices)
          .set({ isActive: false })
          .where(eq(apiGatewayServices.serviceName, serviceName));
      }

      logger.info('Service deregistered', {
        serviceName,
        instanceId: instanceId || 'all'
      });

    } catch (error) {
      logger.error('Failed to deregister service', {
        serviceName,
        instanceId,
        error: error.message
      });
      throw error;
    }
  }

  async getHealthyInstance(serviceName: string): Promise<ServiceInstance | null> {
    const instances = this.services.get(serviceName);
    
    if (!instances || instances.length === 0) {
      logger.warn('No instances found for service', { serviceName });
      return null;
    }

    // Filter healthy instances
    const healthyInstances = instances.filter(instance => instance.isHealthy);
    
    if (healthyInstances.length === 0) {
      logger.warn('No healthy instances found for service', { serviceName });
      return null;
    }

    // Apply load balancing algorithm
    return this.selectInstance(healthyInstances);
  }

  private selectInstance(instances: ServiceInstance[]): ServiceInstance {
    const algorithm = this.config.services.loadBalancing.algorithm;

    switch (algorithm) {
      case 'round-robin':
        return this.roundRobinSelection(instances);
      
      case 'least-connections':
        return this.leastConnectionsSelection(instances);
      
      case 'weighted':
        return this.weightedSelection(instances);
      
      case 'ip-hash':
        return this.ipHashSelection(instances);
      
      default:
        return this.roundRobinSelection(instances);
    }
  }

  private roundRobinSelection(instances: ServiceInstance[]): ServiceInstance {
    // Simple round-robin implementation
    const now = Date.now();
    const index = Math.floor(now / 1000) % instances.length;
    return instances[index];
  }

  private leastConnectionsSelection(instances: ServiceInstance[]): ServiceInstance {
    // For now, return the first instance (would need connection tracking)
    return instances.reduce((prev, current) => 
      (prev.metadata.connections || 0) < (current.metadata.connections || 0) ? prev : current
    );
  }

  private weightedSelection(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const instance of instances) {
      random -= instance.weight;
      if (random <= 0) {
        return instance;
      }
    }
    
    return instances[0]; // Fallback
  }

  private ipHashSelection(instances: ServiceInstance[]): ServiceInstance {
    // Would need request context for IP hash
    // For now, return first instance
    return instances[0];
  }

  async updateServiceHealth(serviceName: string, instanceId: string, health: Partial<ServiceHealth>): Promise<void> {
    try {
      const instances = this.services.get(serviceName);
      if (!instances) return;

      // Update instance health status
      const instanceIndex = instances.findIndex(s => s.id === instanceId);
      if (instanceIndex >= 0) {
        instances[instanceIndex].isHealthy = health.isHealthy ?? instances[instanceIndex].isHealthy;
        instances[instanceIndex].lastHeartbeat = new Date();
      }

      // Record health check in database
      await db.insert(apiGatewayHealthChecks).values({
        serviceId: instanceId,
        isHealthy: health.isHealthy || false,
        responseTime: health.responseTime,
        httpStatus: health.httpStatus,
        errorMessage: health.errorMessage,
        checkedAt: new Date()
      });

    } catch (error) {
      logger.error('Failed to update service health', {
        serviceName,
        instanceId,
        error: error.message
      });
    }
  }

  async getAllServices(): Promise<Map<string, ServiceInstance[]>> {
    return new Map(this.services);
  }

  async getServiceStats(): Promise<any> {
    const stats = {
      totalServices: this.services.size,
      totalInstances: 0,
      healthyInstances: 0,
      unhealthyInstances: 0,
      serviceBreakdown: {} as Record<string, any>
    };

    for (const [serviceName, instances] of this.services) {
      const healthy = instances.filter(i => i.isHealthy).length;
      const unhealthy = instances.length - healthy;
      
      stats.totalInstances += instances.length;
      stats.healthyInstances += healthy;
      stats.unhealthyInstances += unhealthy;
      
      stats.serviceBreakdown[serviceName] = {
        total: instances.length,
        healthy,
        unhealthy,
        instances: instances.map(i => ({
          id: i.id,
          host: i.host,
          port: i.port,
          isHealthy: i.isHealthy,
          lastHeartbeat: i.lastHeartbeat
        }))
      };
    }

    return stats;
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.services.discovery.healthCheckInterval);

    logger.info('Health check monitoring started', {
      interval: this.config.services.discovery.healthCheckInterval
    });
  }

  private async performHealthChecks(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [serviceName, instances] of this.services) {
      for (const instance of instances) {
        promises.push(this.checkInstanceHealth(serviceName, instance));
      }
    }

    await Promise.allSettled(promises);
  }

  private async checkInstanceHealth(serviceName: string, instance: ServiceInstance): Promise<void> {
    try {
      const healthUrl = `http://${instance.host}:${instance.port}${instance.healthEndpoint}`;
      const startTime = Date.now();

      const response = await fetch(healthUrl, {
        method: 'GET',
        timeout: this.config.services.discovery.healthCheckTimeout,
        headers: {
          'User-Agent': 'GetIt-API-Gateway/2.0.0',
          'X-Health-Check': 'true'
        }
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;

      await this.updateServiceHealth(serviceName, instance.id, {
        isHealthy,
        responseTime,
        httpStatus: response.status,
        checkedAt: new Date()
      });

      if (!isHealthy) {
        logger.warn('Service health check failed', {
          serviceName,
          instanceId: instance.id,
          host: instance.host,
          port: instance.port,
          status: response.status,
          responseTime
        });
      }

    } catch (error) {
      await this.updateServiceHealth(serviceName, instance.id, {
        isHealthy: false,
        errorMessage: error.message,
        checkedAt: new Date()
      });

      logger.error('Health check error', {
        serviceName,
        instanceId: instance.id,
        error: error.message
      });
    }
  }

  private validateServiceInstance(service: ServiceInstance): void {
    if (!service.name || !service.host || !service.port) {
      throw new Error('Service name, host, and port are required');
    }

    if (service.port < 1 || service.port > 65535) {
      throw new Error('Invalid port number');
    }

    if (!service.id) {
      service.id = `${service.name}-${service.host}-${service.port}-${Date.now()}`;
    }
  }

  private async createNewService(service: ServiceInstance): Promise<void> {
    const instances = [{
      host: service.host,
      port: service.port,
      weight: service.weight
    }];

    await db.insert(apiGatewayServices).values({
      serviceName: service.name,
      serviceType: 'microservice',
      version: service.version,
      instances: JSON.stringify(instances),
      basePath: service.basePath,
      healthEndpoint: service.healthEndpoint,
      tags: JSON.stringify(service.tags),
      metadata: JSON.stringify(service.metadata),
      isActive: true
    });
  }

  private async updateServiceInstances(serviceId: string, newInstance: ServiceInstance): Promise<void> {
    const [existingService] = await db.select().from(apiGatewayServices)
      .where(eq(apiGatewayServices.id, serviceId));

    if (existingService) {
      const existingInstances = JSON.parse(existingService.instances as string || '[]');
      const updatedInstances = [
        ...existingInstances.filter((i: any) => 
          !(i.host === newInstance.host && i.port === newInstance.port)
        ),
        {
          host: newInstance.host,
          port: newInstance.port,
          weight: newInstance.weight
        }
      ];

      await db.update(apiGatewayServices)
        .set({ 
          instances: JSON.stringify(updatedInstances),
          updatedAt: new Date()
        })
        .where(eq(apiGatewayServices.id, serviceId));
    }
  }

  private async recordServiceDiscovery(service: ServiceInstance): Promise<void> {
    try {
      await db.insert(apiGatewayServiceDiscovery).values({
        serviceName: service.name,
        instanceId: service.id,
        host: service.host,
        port: service.port,
        tags: JSON.stringify(service.tags),
        metadata: JSON.stringify(service.metadata),
        lastHeartbeat: new Date(),
        registrationTime: new Date(),
        isActive: true
      });
    } catch (error) {
      logger.error('Failed to record service discovery', {
        serviceName: service.name,
        error: error.message
      });
    }
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    logger.info('Service registry shutdown complete');
  }
}

export default ServiceRegistry;