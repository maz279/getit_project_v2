/**
 * API Gateway Service Integration
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Complete frontend integration for Amazon.com/Shopee.sg-level API Gateway management
 * with real-time monitoring, service discovery, and comprehensive analytics
 */

import { apiRequest } from '@/lib/queryClient';

// Types for API Gateway data structures
export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'warning';
  responseTime: number;
  lastHeartbeat: string;
  version: string;
  load: number;
  metadata?: Record<string, any>;
  tags?: string[];
  weight?: number;
  priority?: number;
}

export interface GatewayMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
  activeConnections: number;
  bandwidth: number;
  cacheHitRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export interface TrafficData {
  timestamp: string;
  requests: number;
  errors: number;
  responseTime: number;
  bandwidth: number;
  successRate: number;
  protocols: {
    http: number;
    websocket: number;
    graphql: number;
    grpc: number;
  };
}

export interface SecurityMetrics {
  blockedRequests: number;
  rateLimitHits: number;
  authFailures: number;
  suspiciousActivity: number;
  ddosAttempts: number;
  wafBlocks: number;
  geoBlocks: number;
  ipBlocks: number;
  securityEvents: SecurityEvent[];
}

export interface SecurityEvent {
  id: string;
  type: 'ddos' | 'auth_failure' | 'rate_limit' | 'waf_block' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  sourceIp: string;
  timestamp: string;
  action: string;
  resolved: boolean;
}

export interface RouteConfiguration {
  id: string;
  path: string;
  target: string;
  methods: string[];
  authentication: {
    required: boolean;
    roles?: string[];
    permissions?: string[];
    skipPaths?: string[];
  };
  rateLimit: {
    enabled: boolean;
    tier?: string;
    requests?: number;
    window?: number;
  };
  caching: {
    enabled: boolean;
    ttl?: number;
    key?: string;
    vary?: string[];
  };
  timeout: number;
  retries: number;
  circuitBreaker: boolean;
  monitoring: {
    metrics: boolean;
    logging: boolean;
    tracing: boolean;
  };
  bangladesh: {
    mobileOptimized: boolean;
    localizedResponse: boolean;
    currencyConversion: boolean;
    timezoneAdjustment: boolean;
  };
}

export interface ProtocolStatus {
  name: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error';
  requestsPerMinute: number;
  successRate: number;
  averageLatency: number;
  endpoints: number;
  lastActivity: string;
  configuration: Record<string, any>;
}

export interface DeveloperPortalData {
  apiDocumentation: {
    total: number;
    published: number;
    draft: number;
    deprecated: number;
  };
  sdkDownloads: {
    javascript: number;
    python: number;
    java: number;
    php: number;
  };
  developerMetrics: {
    registeredDevelopers: number;
    activeApiKeys: number;
    monthlyApiCalls: number;
    topConsumers: { name: string; calls: number }[];
  };
}

export interface A_BTestConfiguration {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  variants: {
    name: string;
    trafficPercentage: number;
    endpoint: string;
    configuration: Record<string, any>;
  }[];
  metrics: {
    totalRequests: number;
    conversionRate: number;
    errorRate: number;
    averageResponseTime: number;
  };
  startDate: string;
  endDate?: string;
}

export interface BangladeshMetrics {
  mobileTraffic: number;
  popularPaymentMethods: {
    name: string;
    percentage: number;
    color: string;
    volume: number;
    growth: number;
  }[];
  regionalDistribution: {
    region: string;
    requests: number;
    percentage: number;
    growth: number;
  }[];
  festivalImpact: {
    event: string;
    traffic: number;
    date: string;
    expectedIncrease: number;
  }[];
  prayerTimeAdjustments: number;
  culturalOptimizations: {
    bengaliLanguageRequests: number;
    timezone: string;
    currency: string;
    localizedContent: number;
  };
  networkProviders: {
    grameenphone: number;
    banglalink: number;
    robi: number;
    teletalk: number;
  };
}

/**
 * API Gateway Service Class
 * Comprehensive service for managing enterprise API gateway features
 */
export class ApiGatewayService {
  private baseUrl = '/api/v1/gateway';

  // Service Discovery & Management
  async getServiceInstances(): Promise<ServiceInstance[]> {
    return apiRequest(`${this.baseUrl}/services`);
  }

  async getServiceInstance(serviceId: string): Promise<ServiceInstance> {
    return apiRequest(`${this.baseUrl}/services/${serviceId}`);
  }

  async registerService(service: Partial<ServiceInstance>): Promise<ServiceInstance> {
    return apiRequest(`${this.baseUrl}/services`, {
      method: 'POST',
      body: JSON.stringify(service)
    });
  }

  async updateService(serviceId: string, updates: Partial<ServiceInstance>): Promise<ServiceInstance> {
    return apiRequest(`${this.baseUrl}/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deregisterService(serviceId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/services/${serviceId}`, {
      method: 'DELETE'
    });
  }

  async performHealthCheck(serviceId: string): Promise<{ healthy: boolean; responseTime: number; details: any }> {
    return apiRequest(`${this.baseUrl}/services/${serviceId}/health`);
  }

  // Gateway Metrics & Monitoring
  async getGatewayMetrics(timeRange: string = '24h'): Promise<GatewayMetrics> {
    return apiRequest(`${this.baseUrl}/metrics?timeRange=${timeRange}`);
  }

  async getTrafficData(timeRange: string = '24h', granularity: string = '1h'): Promise<TrafficData[]> {
    return apiRequest(`${this.baseUrl}/traffic?timeRange=${timeRange}&granularity=${granularity}`);
  }

  async getRealTimeMetrics(): Promise<GatewayMetrics> {
    return apiRequest(`${this.baseUrl}/metrics/realtime`);
  }

  async getServiceMetrics(serviceId: string, timeRange: string = '24h'): Promise<any> {
    return apiRequest(`${this.baseUrl}/services/${serviceId}/metrics?timeRange=${timeRange}`);
  }

  // Security & Monitoring
  async getSecurityMetrics(timeRange: string = '24h'): Promise<SecurityMetrics> {
    return apiRequest(`${this.baseUrl}/security/metrics?timeRange=${timeRange}`);
  }

  async getSecurityEvents(limit: number = 50, severity?: string): Promise<SecurityEvent[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (severity) params.append('severity', severity);
    return apiRequest(`${this.baseUrl}/security/events?${params}`);
  }

  async blockIpAddress(ipAddress: string, reason: string, duration?: number): Promise<void> {
    return apiRequest(`${this.baseUrl}/security/block-ip`, {
      method: 'POST',
      body: JSON.stringify({ ipAddress, reason, duration })
    });
  }

  async unblockIpAddress(ipAddress: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/security/unblock-ip`, {
      method: 'POST',
      body: JSON.stringify({ ipAddress })
    });
  }

  // Route Configuration Management
  async getRouteConfigurations(): Promise<RouteConfiguration[]> {
    return apiRequest(`${this.baseUrl}/routes`);
  }

  async getRouteConfiguration(routeId: string): Promise<RouteConfiguration> {
    return apiRequest(`${this.baseUrl}/routes/${routeId}`);
  }

  async createRoute(route: Partial<RouteConfiguration>): Promise<RouteConfiguration> {
    return apiRequest(`${this.baseUrl}/routes`, {
      method: 'POST',
      body: JSON.stringify(route)
    });
  }

  async updateRoute(routeId: string, updates: Partial<RouteConfiguration>): Promise<RouteConfiguration> {
    return apiRequest(`${this.baseUrl}/routes/${routeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteRoute(routeId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/routes/${routeId}`, {
      method: 'DELETE'
    });
  }

  async testRoute(routeId: string, testRequest: any): Promise<any> {
    return apiRequest(`${this.baseUrl}/routes/${routeId}/test`, {
      method: 'POST',
      body: JSON.stringify(testRequest)
    });
  }

  // Protocol Management
  async getProtocolStatus(): Promise<ProtocolStatus[]> {
    return apiRequest(`${this.baseUrl}/protocols`);
  }

  async enableProtocol(protocolName: string, configuration?: Record<string, any>): Promise<ProtocolStatus> {
    return apiRequest(`${this.baseUrl}/protocols/${protocolName}/enable`, {
      method: 'POST',
      body: JSON.stringify({ configuration })
    });
  }

  async disableProtocol(protocolName: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/protocols/${protocolName}/disable`, {
      method: 'POST'
    });
  }

  async updateProtocolConfiguration(protocolName: string, configuration: Record<string, any>): Promise<ProtocolStatus> {
    return apiRequest(`${this.baseUrl}/protocols/${protocolName}/configure`, {
      method: 'PUT',
      body: JSON.stringify({ configuration })
    });
  }

  // WebSocket Management
  async getWebSocketConnections(): Promise<any[]> {
    return apiRequest(`${this.baseUrl}/websocket/connections`);
  }

  async getWebSocketMetrics(): Promise<any> {
    return apiRequest(`${this.baseUrl}/websocket/metrics`);
  }

  async broadcastMessage(channel: string, message: any): Promise<void> {
    return apiRequest(`${this.baseUrl}/websocket/broadcast`, {
      method: 'POST',
      body: JSON.stringify({ channel, message })
    });
  }

  // GraphQL Management
  async getGraphQLSchema(): Promise<string> {
    return apiRequest(`${this.baseUrl}/graphql/schema`);
  }

  async updateGraphQLSchema(schema: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/graphql/schema`, {
      method: 'PUT',
      body: JSON.stringify({ schema })
    });
  }

  async getGraphQLMetrics(): Promise<any> {
    return apiRequest(`${this.baseUrl}/graphql/metrics`);
  }

  // Developer Portal
  async getDeveloperPortalData(): Promise<DeveloperPortalData> {
    return apiRequest(`${this.baseUrl}/developer-portal/stats`);
  }

  async generateApiDocumentation(serviceId: string): Promise<string> {
    return apiRequest(`${this.baseUrl}/developer-portal/docs/${serviceId}/generate`, {
      method: 'POST'
    });
  }

  async generateSDK(serviceId: string, language: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/developer-portal/sdk/${serviceId}/${language}`, {
      method: 'POST'
    });
    return response.blob();
  }

  // A/B Testing
  async getA_BTests(): Promise<A_BTestConfiguration[]> {
    return apiRequest(`${this.baseUrl}/ab-testing`);
  }

  async createA_BTest(test: Partial<A_BTestConfiguration>): Promise<A_BTestConfiguration> {
    return apiRequest(`${this.baseUrl}/ab-testing`, {
      method: 'POST',
      body: JSON.stringify(test)
    });
  }

  async updateA_BTest(testId: string, updates: Partial<A_BTestConfiguration>): Promise<A_BTestConfiguration> {
    return apiRequest(`${this.baseUrl}/ab-testing/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async startA_BTest(testId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/ab-testing/${testId}/start`, {
      method: 'POST'
    });
  }

  async stopA_BTest(testId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/ab-testing/${testId}/stop`, {
      method: 'POST'
    });
  }

  async getA_BTestMetrics(testId: string): Promise<any> {
    return apiRequest(`${this.baseUrl}/ab-testing/${testId}/metrics`);
  }

  // Bangladesh-specific Features
  async getBangladeshMetrics(timeRange: string = '24h'): Promise<BangladeshMetrics> {
    return apiRequest(`${this.baseUrl}/bangladesh/metrics?timeRange=${timeRange}`);
  }

  async updateBangladeshConfiguration(config: any): Promise<void> {
    return apiRequest(`${this.baseUrl}/bangladesh/configuration`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  async getPaymentMethodMetrics(): Promise<any> {
    return apiRequest(`${this.baseUrl}/bangladesh/payment-methods`);
  }

  async getFestivalCalendar(): Promise<any> {
    return apiRequest(`${this.baseUrl}/bangladesh/festivals`);
  }

  async updatePrayerTimeSettings(settings: any): Promise<void> {
    return apiRequest(`${this.baseUrl}/bangladesh/prayer-times`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Cache Management
  async getCacheMetrics(): Promise<any> {
    return apiRequest(`${this.baseUrl}/cache/metrics`);
  }

  async clearCache(key?: string): Promise<void> {
    const url = key ? `${this.baseUrl}/cache/clear/${key}` : `${this.baseUrl}/cache/clear`;
    return apiRequest(url, { method: 'DELETE' });
  }

  async getCacheConfiguration(): Promise<any> {
    return apiRequest(`${this.baseUrl}/cache/configuration`);
  }

  async updateCacheConfiguration(config: any): Promise<void> {
    return apiRequest(`${this.baseUrl}/cache/configuration`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  // Rate Limiting Management
  async getRateLimitingConfiguration(): Promise<any> {
    return apiRequest(`${this.baseUrl}/rate-limiting/configuration`);
  }

  async updateRateLimitingConfiguration(config: any): Promise<void> {
    return apiRequest(`${this.baseUrl}/rate-limiting/configuration`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  async getRateLimitingMetrics(): Promise<any> {
    return apiRequest(`${this.baseUrl}/rate-limiting/metrics`);
  }

  async resetRateLimit(identifier: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/rate-limiting/reset`, {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  }

  // Load Balancer Management
  async getLoadBalancerConfiguration(): Promise<any> {
    return apiRequest(`${this.baseUrl}/load-balancer/configuration`);
  }

  async updateLoadBalancerConfiguration(config: any): Promise<void> {
    return apiRequest(`${this.baseUrl}/load-balancer/configuration`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  async getLoadBalancerMetrics(): Promise<any> {
    return apiRequest(`${this.baseUrl}/load-balancer/metrics`);
  }

  // API Analytics & Business Intelligence
  async getApiAnalytics(timeRange: string = '24h'): Promise<any> {
    return apiRequest(`${this.baseUrl}/analytics?timeRange=${timeRange}`);
  }

  async getTopApiEndpoints(limit: number = 10): Promise<any> {
    return apiRequest(`${this.baseUrl}/analytics/top-endpoints?limit=${limit}`);
  }

  async getApiUsageByConsumer(timeRange: string = '24h'): Promise<any> {
    return apiRequest(`${this.baseUrl}/analytics/usage-by-consumer?timeRange=${timeRange}`);
  }

  async getRevenueMetrics(timeRange: string = '30d'): Promise<any> {
    return apiRequest(`${this.baseUrl}/analytics/revenue?timeRange=${timeRange}`);
  }

  async exportAnalyticsReport(format: 'csv' | 'pdf' | 'excel', timeRange: string = '30d'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/analytics/export?format=${format}&timeRange=${timeRange}`);
    return response.blob();
  }

  // Gateway Configuration Management
  async getGatewayConfiguration(): Promise<any> {
    return apiRequest(`${this.baseUrl}/configuration`);
  }

  async updateGatewayConfiguration(config: any): Promise<void> {
    return apiRequest(`${this.baseUrl}/configuration`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  async restartGateway(): Promise<void> {
    return apiRequest(`${this.baseUrl}/restart`, {
      method: 'POST'
    });
  }

  async getGatewayHealth(): Promise<any> {
    return apiRequest(`${this.baseUrl}/health`);
  }

  // Backup & Recovery
  async createConfigurationBackup(): Promise<string> {
    return apiRequest(`${this.baseUrl}/backup/create`, {
      method: 'POST'
    });
  }

  async restoreConfigurationBackup(backupId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/backup/restore/${backupId}`, {
      method: 'POST'
    });
  }

  async getConfigurationBackups(): Promise<any[]> {
    return apiRequest(`${this.baseUrl}/backup/list`);
  }

  async deleteConfigurationBackup(backupId: string): Promise<void> {
    return apiRequest(`${this.baseUrl}/backup/${backupId}`, {
      method: 'DELETE'
    });
  }
}

// Export singleton instance
export const apiGatewayService = new ApiGatewayService();

// Helper functions for data formatting and utilities
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'unhealthy': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  switch (status) {
    case 'healthy': return 'default';
    case 'warning': return 'secondary';
    case 'unhealthy': return 'destructive';
    default: return 'outline';
  }
};