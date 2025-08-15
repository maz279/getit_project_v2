import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive API Gateway Service API Integration
 * Amazon.com/Shopee.sg-level gateway management functionality with complete backend synchronization
 */
export class ApiGatewayApiService {
  constructor() {
    this.baseUrl = '/api/v1/gateway';
  }

  // ================================
  // GATEWAY HEALTH & STATUS
  // ================================

  /**
   * Get gateway health status
   */
  async getGatewayHealth() {
    return await apiRequest(`${this.baseUrl}/health`);
  }

  /**
   * Get gateway metrics
   */
  async getGatewayMetrics(period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/metrics?${params}`);
  }

  /**
   * Get real-time gateway status
   */
  async getRealTimeStatus() {
    return await apiRequest(`${this.baseUrl}/status/real-time`);
  }

  // ================================
  // SERVICE MANAGEMENT
  // ================================

  /**
   * Get all registered services
   */
  async getServices(filters = {}) {
    const params = new URLSearchParams({
      isActive: filters.isActive || '',
      name: filters.name || '',
      version: filters.version || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/services?${params}`);
  }

  /**
   * Get service details
   */
  async getService(serviceId) {
    return await apiRequest(`${this.baseUrl}/services/${serviceId}`);
  }

  /**
   * Register new service
   */
  async registerService(serviceData) {
    return await apiRequest(`${this.baseUrl}/services`, {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  /**
   * Update service configuration
   */
  async updateService(serviceId, updateData) {
    return await apiRequest(`${this.baseUrl}/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Deregister service
   */
  async deregisterService(serviceId) {
    return await apiRequest(`${this.baseUrl}/services/${serviceId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get service health status
   */
  async getServiceHealth(serviceId) {
    return await apiRequest(`${this.baseUrl}/services/${serviceId}/health`);
  }

  /**
   * Get service instances
   */
  async getServiceInstances(serviceName) {
    return await apiRequest(`${this.baseUrl}/services/${serviceName}/instances`);
  }

  /**
   * Scale service instances
   */
  async scaleService(serviceName, instanceCount) {
    return await apiRequest(`${this.baseUrl}/services/${serviceName}/scale`, {
      method: 'POST',
      body: JSON.stringify({ instanceCount })
    });
  }

  // ================================
  // ROUTE MANAGEMENT
  // ================================

  /**
   * Get all routes
   */
  async getRoutes(filters = {}) {
    const params = new URLSearchParams({
      method: filters.method || '',
      path: filters.path || '',
      serviceId: filters.serviceId || '',
      requiresAuth: filters.requiresAuth || '',
      isActive: filters.isActive || '',
      page: filters.page || '1',
      limit: filters.limit || '50'
    });

    return await apiRequest(`${this.baseUrl}/routes?${params}`);
  }

  /**
   * Get route details
   */
  async getRoute(routeId) {
    return await apiRequest(`${this.baseUrl}/routes/${routeId}`);
  }

  /**
   * Create new route
   */
  async createRoute(routeData) {
    return await apiRequest(`${this.baseUrl}/routes`, {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
  }

  /**
   * Update route configuration
   */
  async updateRoute(routeId, updateData) {
    return await apiRequest(`${this.baseUrl}/routes/${routeId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Delete route
   */
  async deleteRoute(routeId) {
    return await apiRequest(`${this.baseUrl}/routes/${routeId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Test route configuration
   */
  async testRoute(routeConfig) {
    return await apiRequest(`${this.baseUrl}/routes/test`, {
      method: 'POST',
      body: JSON.stringify(routeConfig)
    });
  }

  /**
   * Get route metrics
   */
  async getRouteMetrics(routeId, period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/routes/${routeId}/metrics?${params}`);
  }

  // ================================
  // LOAD BALANCING
  // ================================

  /**
   * Get load balancer configuration
   */
  async getLoadBalancerConfig(serviceId) {
    return await apiRequest(`${this.baseUrl}/load-balancer/${serviceId}`);
  }

  /**
   * Update load balancer settings
   */
  async updateLoadBalancer(serviceId, config) {
    return await apiRequest(`${this.baseUrl}/load-balancer/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  /**
   * Get load balancer metrics
   */
  async getLoadBalancerMetrics(serviceId, period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/load-balancer/${serviceId}/metrics?${params}`);
  }

  /**
   * Get load balancer health
   */
  async getLoadBalancerHealth() {
    return await apiRequest(`${this.baseUrl}/load-balancer/health`);
  }

  // ================================
  // RATE LIMITING
  // ================================

  /**
   * Get rate limiting configuration
   */
  async getRateLimitConfig() {
    return await apiRequest(`${this.baseUrl}/rate-limits/config`);
  }

  /**
   * Update rate limiting rules
   */
  async updateRateLimitRules(rules) {
    return await apiRequest(`${this.baseUrl}/rate-limits/rules`, {
      method: 'PUT',
      body: JSON.stringify(rules)
    });
  }

  /**
   * Get rate limit status for identifier
   */
  async getRateLimitStatus(identifier, identifierType = 'ip') {
    const params = new URLSearchParams({
      identifier,
      identifierType
    });

    return await apiRequest(`${this.baseUrl}/rate-limits/status?${params}`);
  }

  /**
   * Reset rate limit for identifier
   */
  async resetRateLimit(identifier, identifierType = 'ip') {
    return await apiRequest(`${this.baseUrl}/rate-limits/reset`, {
      method: 'POST',
      body: JSON.stringify({ identifier, identifierType })
    });
  }

  /**
   * Get rate limiting analytics
   */
  async getRateLimitAnalytics(period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/rate-limits/analytics?${params}`);
  }

  /**
   * Block/unblock identifier
   */
  async toggleBlockStatus(identifier, identifierType, isBlocked) {
    return await apiRequest(`${this.baseUrl}/rate-limits/block`, {
      method: 'POST',
      body: JSON.stringify({ identifier, identifierType, isBlocked })
    });
  }

  // ================================
  // CIRCUIT BREAKER
  // ================================

  /**
   * Get circuit breaker status
   */
  async getCircuitBreakerStatus(serviceId) {
    return await apiRequest(`${this.baseUrl}/circuit-breaker/${serviceId}/status`);
  }

  /**
   * Get all circuit breakers
   */
  async getAllCircuitBreakers() {
    return await apiRequest(`${this.baseUrl}/circuit-breaker/all`);
  }

  /**
   * Update circuit breaker configuration
   */
  async updateCircuitBreakerConfig(serviceId, config) {
    return await apiRequest(`${this.baseUrl}/circuit-breaker/${serviceId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  /**
   * Reset circuit breaker
   */
  async resetCircuitBreaker(serviceId) {
    return await apiRequest(`${this.baseUrl}/circuit-breaker/${serviceId}/reset`, {
      method: 'POST'
    });
  }

  /**
   * Get circuit breaker metrics
   */
  async getCircuitBreakerMetrics(serviceId, period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/circuit-breaker/${serviceId}/metrics?${params}`);
  }

  // ================================
  // SECURITY & AUTHENTICATION
  // ================================

  /**
   * Get authentication configuration
   */
  async getAuthConfig() {
    return await apiRequest(`${this.baseUrl}/auth/config`);
  }

  /**
   * Update authentication settings
   */
  async updateAuthConfig(config) {
    return await apiRequest(`${this.baseUrl}/auth/config`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  /**
   * Validate JWT token
   */
  async validateToken(token) {
    return await apiRequest(`${this.baseUrl}/auth/validate`, {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  /**
   * Get security headers configuration
   */
  async getSecurityHeadersConfig() {
    return await apiRequest(`${this.baseUrl}/security/headers`);
  }

  /**
   * Update security headers
   */
  async updateSecurityHeaders(headers) {
    return await apiRequest(`${this.baseUrl}/security/headers`, {
      method: 'PUT',
      body: JSON.stringify(headers)
    });
  }

  // ================================
  // CONFIGURATION MANAGEMENT
  // ================================

  /**
   * Get gateway configuration
   */
  async getGatewayConfig() {
    return await apiRequest(`${this.baseUrl}/config`);
  }

  /**
   * Update gateway configuration
   */
  async updateGatewayConfig(config) {
    return await apiRequest(`${this.baseUrl}/config`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  /**
   * Get environment configurations
   */
  async getEnvironmentConfigs(environment = 'all') {
    const params = new URLSearchParams({
      environment
    });

    return await apiRequest(`${this.baseUrl}/config/environment?${params}`);
  }

  /**
   * Update environment configuration
   */
  async updateEnvironmentConfig(environment, config) {
    return await apiRequest(`${this.baseUrl}/config/environment/${environment}`, {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  /**
   * Export gateway configuration
   */
  async exportConfig(format = 'json') {
    const params = new URLSearchParams({
      format
    });

    return await apiRequest(`${this.baseUrl}/config/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Import gateway configuration
   */
  async importConfig(configFile) {
    const formData = new FormData();
    formData.append('config', configFile);

    return await apiRequest(`${this.baseUrl}/config/import`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }

  // ================================
  // MONITORING & ANALYTICS
  // ================================

  /**
   * Get comprehensive analytics
   */
  async getAnalytics(period = '24h', filters = {}) {
    const params = new URLSearchParams({
      period,
      serviceId: filters.serviceId || '',
      routeId: filters.routeId || '',
      status: filters.status || ''
    });

    return await apiRequest(`${this.baseUrl}/analytics?${params}`);
  }

  /**
   * Get traffic analytics
   */
  async getTrafficAnalytics(period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/traffic?${params}`);
  }

  /**
   * Get error analytics
   */
  async getErrorAnalytics(period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/errors?${params}`);
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/performance?${params}`);
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters = {}) {
    const params = new URLSearchParams({
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      userId: filters.userId || '',
      method: filters.method || '',
      path: filters.path || '',
      status: filters.status || '',
      page: filters.page || '1',
      limit: filters.limit || '50'
    });

    return await apiRequest(`${this.baseUrl}/audit-logs?${params}`);
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(exportConfig) {
    return await apiRequest(`${this.baseUrl}/analytics/export`, {
      method: 'POST',
      body: JSON.stringify(exportConfig),
      responseType: 'blob'
    });
  }

  // ================================
  // SERVICE DISCOVERY
  // ================================

  /**
   * Get service discovery registry
   */
  async getServiceDiscovery() {
    return await apiRequest(`${this.baseUrl}/discovery`);
  }

  /**
   * Register service instance
   */
  async registerServiceInstance(instanceData) {
    return await apiRequest(`${this.baseUrl}/discovery/register`, {
      method: 'POST',
      body: JSON.stringify(instanceData)
    });
  }

  /**
   * Deregister service instance
   */
  async deregisterServiceInstance(instanceId) {
    return await apiRequest(`${this.baseUrl}/discovery/deregister/${instanceId}`, {
      method: 'POST'
    });
  }

  /**
   * Send heartbeat
   */
  async sendHeartbeat(instanceId) {
    return await apiRequest(`${this.baseUrl}/discovery/heartbeat/${instanceId}`, {
      method: 'POST'
    });
  }

  /**
   * Get service endpoints
   */
  async getServiceEndpoints(serviceName) {
    return await apiRequest(`${this.baseUrl}/discovery/endpoints/${serviceName}`);
  }

  // ================================
  // BANGLADESH-SPECIFIC FEATURES
  // ================================

  /**
   * Get Bangladesh gateway configuration
   */
  async getBangladeshConfig() {
    return await apiRequest(`${this.baseUrl}/bangladesh/config`);
  }

  /**
   * Update Bangladesh-specific settings
   */
  async updateBangladeshSettings(settings) {
    return await apiRequest(`${this.baseUrl}/bangladesh/settings`, {
      method: 'PUT',
      body: JSON.stringify({ ...settings, country: 'BD' })
    });
  }

  /**
   * Get Bangladesh compliance status
   */
  async getBangladeshCompliance() {
    return await apiRequest(`${this.baseUrl}/bangladesh/compliance`);
  }

  /**
   * Get regional performance
   */
  async getRegionalPerformance(division = '') {
    const params = new URLSearchParams({
      division,
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/regional-performance?${params}`);
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Subscribe to real-time gateway events
   */
  subscribeToGatewayEvents(onEvent, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/gateway/events/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };
    
    return ws;
  }

  /**
   * Subscribe to service health updates
   */
  subscribeToServiceHealth(onUpdate) {
    const wsUrl = `ws://${window.location.host}/api/v1/gateway/health/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return ws;
  }

  /**
   * Subscribe to real-time metrics
   */
  subscribeToRealTimeMetrics(onMetrics) {
    const wsUrl = `ws://${window.location.host}/api/v1/gateway/metrics/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMetrics(data);
    };
    
    return ws;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get gateway status color
   */
  getGatewayStatusColor(status) {
    const colors = {
      'healthy': '#10B981',
      'degraded': '#F59E0B',
      'unhealthy': '#EF4444',
      'maintenance': '#6B7280'
    };
    return colors[status.toLowerCase()] || '#6B7280';
  }

  /**
   * Format response time
   */
  formatResponseTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate(successful, total) {
    if (total === 0) return 0;
    return Math.round((successful / total) * 100);
  }

  /**
   * Format throughput
   */
  formatThroughput(requestsPerSecond) {
    if (requestsPerSecond < 1000) return `${requestsPerSecond} req/s`;
    return `${(requestsPerSecond / 1000).toFixed(1)}K req/s`;
  }

  /**
   * Get circuit breaker state color
   */
  getCircuitBreakerColor(state) {
    const colors = {
      'CLOSED': '#10B981',
      'HALF_OPEN': '#F59E0B',
      'OPEN': '#EF4444'
    };
    return colors[state] || '#6B7280';
  }

  /**
   * Handle API errors with proper gateway context
   */
  handleError(error, operation) {
    console.error(`API Gateway API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected gateway error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Gateway authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this gateway operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested gateway resource was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Gateway configuration conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid gateway configuration. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many gateway requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Gateway server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const apiGatewayApiService = new ApiGatewayApiService();