/**
 * Service Registry - Service Discovery Pattern
 * Phase 2: Service Consolidation Implementation
 * 
 * Central registry for all consolidated services
 */

import { BaseService, ServiceHealth } from '../base/BaseService';
import { ServiceLogger } from '../utils/ServiceLogger';
import { ErrorHandler } from '../utils/ErrorHandler';

export interface ServiceRegistration {
  id: string;
  name: string;
  version: string;
  type: ServiceType;
  instance: any;
  endpoints: ServiceEndpoint[];
  health: ServiceHealth;
  metadata: ServiceMetadata;
  registeredAt: Date;
  lastHeartbeat: Date;
}

export type ServiceType = 
  | 'core'
  | 'advanced'
  | 'infrastructure'
  | 'bangladesh';

export interface ServiceEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description: string;
  parameters?: EndpointParameter[];
  response?: EndpointResponse;
}

export interface EndpointParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface EndpointResponse {
  type: string;
  description: string;
  schema?: any;
}

export interface ServiceMetadata {
  tags: string[];
  dependencies: string[];
  capabilities: string[];
  configuration: { [key: string]: any };
}

export interface ServiceQuery {
  name?: string;
  type?: ServiceType;
  tags?: string[];
  healthy?: boolean;
}

/**
 * Service Registry
 * Central service discovery and management
 */
export class ServiceRegistry extends BaseService {
  private services: Map<string, ServiceRegistration>;
  private logger: ServiceLogger;
  private errorHandler: ErrorHandler;
  private healthCheckInterval: NodeJS.Timeout | null;

  constructor() {
    super('ServiceRegistry');
    this.services = new Map();
    this.logger = new ServiceLogger('ServiceRegistry');
    this.errorHandler = new ErrorHandler('ServiceRegistry');
    this.healthCheckInterval = null;

    this.startHealthChecking();
  }

  /**
   * Service Registration
   */
  async registerService(
    service: any,
    metadata: Partial<ServiceMetadata> = {}
  ): Promise<string> {
    return await this.executeOperation(async () => {
      const serviceId = this.generateServiceId();
      const serviceName = service.constructor.name;

      this.logger.info('Registering service', { serviceId, serviceName });

      const registration: ServiceRegistration = {
        id: serviceId,
        name: serviceName,
        version: service.config?.version || '1.0.0',
        type: this.determineServiceType(serviceName),
        instance: service,
        endpoints: await this.extractEndpoints(service),
        health: await this.getServiceHealth(service),
        metadata: {
          tags: [],
          dependencies: [],
          capabilities: [],
          configuration: {},
          ...metadata
        },
        registeredAt: new Date(),
        lastHeartbeat: new Date()
      };

      this.services.set(serviceId, registration);

      this.logger.info('Service registered successfully', {
        serviceId,
        serviceName,
        type: registration.type,
        endpoints: registration.endpoints.length
      });

      return serviceId;
    }, 'registerService');
  }

  async unregisterService(serviceId: string): Promise<boolean> {
    return await this.executeOperation(async () => {
      this.logger.info('Unregistering service', { serviceId });

      const registration = this.services.get(serviceId);
      if (!registration) {
        throw new Error('Service not found');
      }

      // Shutdown service if it has shutdown method
      if (registration.instance.shutdown) {
        await registration.instance.shutdown();
      }

      this.services.delete(serviceId);

      this.logger.info('Service unregistered successfully', {
        serviceId,
        serviceName: registration.name
      });

      return true;
    }, 'unregisterService');
  }

  /**
   * Service Discovery
   */
  async findService(serviceName: string): Promise<ServiceRegistration | null> {
    return await this.executeOperation(async () => {
      this.logger.info('Finding service', { serviceName });

      for (const registration of this.services.values()) {
        if (registration.name === serviceName && this.isServiceHealthy(registration)) {
          return registration;
        }
      }

      return null;
    }, 'findService');
  }

  async findServices(query: ServiceQuery): Promise<ServiceRegistration[]> {
    return await this.executeOperation(async () => {
      this.logger.info('Finding services', { query });

      const results: ServiceRegistration[] = [];

      for (const registration of this.services.values()) {
        if (this.matchesQuery(registration, query)) {
          results.push(registration);
        }
      }

      return results;
    }, 'findServices');
  }

  async getServiceInstance<T>(serviceName: string): Promise<T | null> {
    return await this.executeOperation(async () => {
      const registration = await this.findService(serviceName);
      return registration ? registration.instance : null;
    }, 'getServiceInstance');
  }

  async getAllServices(): Promise<ServiceRegistration[]> {
    return await this.executeOperation(async () => {
      return Array.from(this.services.values());
    }, 'getAllServices');
  }

  /**
   * Service Health Management
   */
  async updateServiceHealth(serviceId: string): Promise<ServiceHealth | null> {
    return await this.executeOperation(async () => {
      const registration = this.services.get(serviceId);
      if (!registration) {
        return null;
      }

      const health = await this.getServiceHealth(registration.instance);
      registration.health = health;
      registration.lastHeartbeat = new Date();

      return health;
    }, 'updateServiceHealth');
  }

  async getServiceHealth(serviceId: string): Promise<ServiceHealth | null> {
    return await this.executeOperation(async () => {
      const registration = this.services.get(serviceId);
      return registration ? registration.health : null;
    }, 'getServiceHealth');
  }

  async getRegistryHealth(): Promise<{
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    services: { [key: string]: ServiceHealth };
  }> {
    return await this.executeOperation(async () => {
      const allServices = Array.from(this.services.values());
      const healthyServices = allServices.filter(s => this.isServiceHealthy(s));
      const unhealthyServices = allServices.filter(s => !this.isServiceHealthy(s));

      const services: { [key: string]: ServiceHealth } = {};
      allServices.forEach(service => {
        services[service.name] = service.health;
      });

      return {
        totalServices: allServices.length,
        healthyServices: healthyServices.length,
        unhealthyServices: unhealthyServices.length,
        services
      };
    }, 'getRegistryHealth');
  }

  /**
   * Service Routing
   */
  async routeRequest(serviceName: string, operation: string, ...args: any[]): Promise<any> {
    return await this.executeOperation(async () => {
      const registration = await this.findService(serviceName);
      if (!registration) {
        throw new Error(`Service ${serviceName} not found`);
      }

      if (!this.isServiceHealthy(registration)) {
        throw new Error(`Service ${serviceName} is not healthy`);
      }

      const serviceInstance = registration.instance;
      if (typeof serviceInstance[operation] !== 'function') {
        throw new Error(`Operation ${operation} not found on service ${serviceName}`);
      }

      this.logger.info('Routing request to service', {
        serviceName,
        operation,
        serviceId: registration.id
      });

      return await serviceInstance[operation](...args);
    }, 'routeRequest');
  }

  /**
   * Service Metrics and Analytics
   */
  async getServiceMetrics(): Promise<{
    totalServices: number;
    servicesByType: { [key in ServiceType]: number };
    averageUptime: number;
    totalEndpoints: number;
    healthDistribution: { [key: string]: number };
  }> {
    return await this.executeOperation(async () => {
      const allServices = Array.from(this.services.values());

      const servicesByType: { [key in ServiceType]: number } = {
        core: 0,
        advanced: 0,
        infrastructure: 0,
        bangladesh: 0
      };

      let totalUptime = 0;
      let totalEndpoints = 0;
      const healthDistribution: { [key: string]: number } = {
        healthy: 0,
        degraded: 0,
        unhealthy: 0
      };

      allServices.forEach(service => {
        servicesByType[service.type]++;
        totalUptime += service.health.uptime;
        totalEndpoints += service.endpoints.length;
        healthDistribution[service.health.status]++;
      });

      const averageUptime = allServices.length > 0 ? totalUptime / allServices.length : 0;

      return {
        totalServices: allServices.length,
        servicesByType,
        averageUptime,
        totalEndpoints,
        healthDistribution
      };
    }, 'getServiceMetrics');
  }

  /**
   * Private Helper Methods
   */
  private startHealthChecking(): void {
    // Check service health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        for (const [serviceId] of this.services) {
          await this.updateServiceHealth(serviceId);
        }
      } catch (error) {
        this.logger.error('Health check failed', { error });
      }
    }, 30000);
  }

  private generateServiceId(): string {
    return `svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineServiceType(serviceName: string): ServiceType {
    const coreServices = [
      'UserManagementService',
      'VendorManagementService', 
      'ProductCatalogService',
      'OrderManagementService',
      'PaymentProcessingService',
      'ShippingLogisticsService',
      'ReviewRatingService',
      'CartWishlistService'
    ];

    const advancedServices = [
      'SearchDiscoveryService',
      'AIPersonalizationService',
      'AnalyticsIntelligenceService',
      'NotificationService',
      'MarketingPromotionService',
      'SocialCommerceService',
      'FinanceAccountingService',
      'FraudSecurityService'
    ];

    const infrastructureServices = [
      'CacheRedisService',
      'DatabaseService',
      'FileStorageService',
      'RealtimeService',
      'ConfigurationService',
      'UnifiedApiClient',
      'ServiceRegistry'
    ];

    const bangladeshServices = [
      'BangladeshPaymentService',
      'BangladeshShippingService',
      'BangladeshComplianceService',
      'BangladeshLocalizationService'
    ];

    if (coreServices.includes(serviceName)) return 'core';
    if (advancedServices.includes(serviceName)) return 'advanced';
    if (infrastructureServices.includes(serviceName)) return 'infrastructure';
    if (bangladeshServices.includes(serviceName)) return 'bangladesh';

    return 'core'; // Default
  }

  private async extractEndpoints(service: any): Promise<ServiceEndpoint[]> {
    const endpoints: ServiceEndpoint[] = [];

    // Extract public methods as endpoints
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(service))
      .filter(name => typeof service[name] === 'function')
      .filter(name => !name.startsWith('_') && name !== 'constructor');

    methods.forEach(method => {
      endpoints.push({
        path: `/${this.camelToKebab(method)}`,
        method: this.inferHttpMethod(method),
        description: `${method} operation`,
        parameters: [],
        response: {
          type: 'object',
          description: `Response from ${method} operation`
        }
      });
    });

    return endpoints;
  }

  private async getServiceHealth(service: any): Promise<ServiceHealth> {
    try {
      if (service.getHealthStatus) {
        return await service.getHealthStatus();
      }

      // Default health status
      return {
        service: service.constructor.name,
        status: 'healthy',
        uptime: Date.now() - (service.startTime?.getTime() || Date.now()),
        lastCheck: new Date(),
        dependencies: []
      };
    } catch (error) {
      return {
        service: service.constructor.name,
        status: 'unhealthy',
        uptime: 0,
        lastCheck: new Date(),
        dependencies: []
      };
    }
  }

  private isServiceHealthy(registration: ServiceRegistration): boolean {
    return registration.health.status === 'healthy';
  }

  private matchesQuery(registration: ServiceRegistration, query: ServiceQuery): boolean {
    if (query.name && registration.name !== query.name) {
      return false;
    }

    if (query.type && registration.type !== query.type) {
      return false;
    }

    if (query.healthy !== undefined && this.isServiceHealthy(registration) !== query.healthy) {
      return false;
    }

    if (query.tags && query.tags.length > 0) {
      const hasAllTags = query.tags.every(tag => registration.metadata.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    return true;
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private inferHttpMethod(methodName: string): 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' {
    if (methodName.startsWith('get') || methodName.startsWith('find') || methodName.startsWith('search')) {
      return 'GET';
    }
    if (methodName.startsWith('create') || methodName.startsWith('add') || methodName.startsWith('process')) {
      return 'POST';
    }
    if (methodName.startsWith('update') || methodName.startsWith('edit')) {
      return 'PATCH';
    }
    if (methodName.startsWith('delete') || methodName.startsWith('remove')) {
      return 'DELETE';
    }
    return 'POST'; // Default
  }

  /**
   * Cleanup
   */
  async shutdown(): Promise<void> {
    this.logger.info('Service Registry shutting down');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Unregister all services
    const serviceIds = Array.from(this.services.keys());
    for (const serviceId of serviceIds) {
      await this.unregisterService(serviceId);
    }

    await super.shutdown();
  }
}