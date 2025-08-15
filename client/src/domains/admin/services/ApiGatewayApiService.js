/**
 * API Gateway Admin Service
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Complete API integration for API Gateway administration
 * Amazon.com/Shopee.sg-level gateway management
 */

class ApiGatewayApiService {
  constructor() {
    this.baseURL = '/api/v1/gateway';
  }

  // ================================
  // GATEWAY HEALTH AND STATUS
  // ================================

  async getGatewayHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get gateway health:', error);
      return { status: 'error', error: error.message };
    }
  }

  async getGatewayStatus() {
    try {
      const response = await fetch(`${this.baseURL}/status`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get gateway status:', error);
      return { status: 'error', error: error.message };
    }
  }

  async getGatewayMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/metrics`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get gateway metrics:', error);
      return { error: error.message };
    }
  }

  async getPrometheusMetrics() {
    try {
      const response = await fetch('/metrics');
      return await response.text();
    } catch (error) {
      console.error('Failed to get Prometheus metrics:', error);
      return '';
    }
  }

  // ================================
  // SERVICE MANAGEMENT
  // ================================

  async getRegisteredServices() {
    try {
      const response = await fetch(`${this.baseURL}/services`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get registered services:', error);
      return { success: false, error: error.message };
    }
  }

  async registerService(serviceData) {
    try {
      const response = await fetch(`${this.baseURL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to register service:', error);
      return { success: false, error: error.message };
    }
  }

  async updateService(serviceId, serviceData) {
    try {
      const response = await fetch(`${this.baseURL}/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update service:', error);
      return { success: false, error: error.message };
    }
  }

  async deregisterService(serviceId) {
    try {
      const response = await fetch(`${this.baseURL}/services/${serviceId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to deregister service:', error);
      return { success: false, error: error.message };
    }
  }

  async getServiceHealth(serviceName) {
    try {
      const response = await fetch(`${this.baseURL}/services/${serviceName}/health`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get service health:', error);
      return { isHealthy: false, error: error.message };
    }
  }

  async getServiceMetrics(serviceName) {
    try {
      const response = await fetch(`${this.baseURL}/services/${serviceName}/metrics`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get service metrics:', error);
      return { error: error.message };
    }
  }

  // ================================
  // ROUTE MANAGEMENT
  // ================================

  async getRoutes() {
    try {
      const response = await fetch(`${this.baseURL}/routes`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get routes:', error);
      return { success: false, error: error.message };
    }
  }

  async createRoute(routeData) {
    try {
      const response = await fetch(`${this.baseURL}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create route:', error);
      return { success: false, error: error.message };
    }
  }

  async updateRoute(routeId, routeData) {
    try {
      const response = await fetch(`${this.baseURL}/routes/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update route:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteRoute(routeId) {
    try {
      const response = await fetch(`${this.baseURL}/routes/${routeId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to delete route:', error);
      return { success: false, error: error.message };
    }
  }

  async testRoute(routeId, testData) {
    try {
      const response = await fetch(`${this.baseURL}/routes/${routeId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to test route:', error);
      return { success: false, error: error.message };
    }
  }

  // ================================
  // LOAD BALANCING
  // ================================

  async getLoadBalancerConfig() {
    try {
      const response = await fetch(`${this.baseURL}/load-balancer`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get load balancer config:', error);
      return { error: error.message };
    }
  }

  async updateLoadBalancerConfig(config) {
    try {
      const response = await fetch(`${this.baseURL}/load-balancer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update load balancer config:', error);
      return { success: false, error: error.message };
    }
  }

  async getLoadBalancerMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/load-balancer/metrics`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get load balancer metrics:', error);
      return { error: error.message };
    }
  }

  async getLoadBalancerHealth() {
    try {
      const response = await fetch(`${this.baseURL}/load-balancer/health`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get load balancer health:', error);
      return { isHealthy: false, error: error.message };
    }
  }

  // ================================
  // RATE LIMITING
  // ================================

  async getRateLimitConfig() {
    try {
      const response = await fetch(`${this.baseURL}/rate-limit`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get rate limit config:', error);
      return { error: error.message };
    }
  }

  async updateRateLimitConfig(config) {
    try {
      const response = await fetch(`${this.baseURL}/rate-limit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update rate limit config:', error);
      return { success: false, error: error.message };
    }
  }

  async getRateLimitStats() {
    try {
      const response = await fetch(`${this.baseURL}/rate-limit/stats`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get rate limit stats:', error);
      return { error: error.message };
    }
  }

  async getBlockedIPs() {
    try {
      const response = await fetch(`${this.baseURL}/rate-limit/blocked-ips`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get blocked IPs:', error);
      return { error: error.message };
    }
  }

  async unblockIP(ipAddress) {
    try {
      const response = await fetch(`${this.baseURL}/rate-limit/unblock/${encodeURIComponent(ipAddress)}`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to unblock IP:', error);
      return { success: false, error: error.message };
    }
  }

  // ================================
  // CIRCUIT BREAKERS
  // ================================

  async getCircuitBreakerStatus() {
    try {
      const response = await fetch(`${this.baseURL}/circuit-breakers`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get circuit breaker status:', error);
      return { error: error.message };
    }
  }

  async resetCircuitBreaker(serviceName) {
    try {
      const response = await fetch(`${this.baseURL}/circuit-breakers/${serviceName}/reset`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to reset circuit breaker:', error);
      return { success: false, error: error.message };
    }
  }

  async getCircuitBreakerMetrics(serviceName) {
    try {
      const response = await fetch(`${this.baseURL}/circuit-breakers/${serviceName}/metrics`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get circuit breaker metrics:', error);
      return { error: error.message };
    }
  }

  // ================================
  // SECURITY & MONITORING
  // ================================

  async getSecurityStatus() {
    try {
      const response = await fetch(`${this.baseURL}/security/status`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get security status:', error);
      return { error: error.message };
    }
  }

  async getSecurityLogs() {
    try {
      const response = await fetch(`${this.baseURL}/security/logs`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get security logs:', error);
      return { error: error.message };
    }
  }

  async getAuditLogs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.baseURL}/audit/logs?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return { error: error.message };
    }
  }

  async getAuditStatistics(hours = 24) {
    try {
      const response = await fetch(`${this.baseURL}/audit/statistics?hours=${hours}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get audit statistics:', error);
      return { error: error.message };
    }
  }

  // ================================
  // CONFIGURATION MANAGEMENT
  // ================================

  async getGatewayConfig() {
    try {
      const response = await fetch(`${this.baseURL}/config`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get gateway config:', error);
      return { error: error.message };
    }
  }

  async updateGatewayConfig(config) {
    try {
      const response = await fetch(`${this.baseURL}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update gateway config:', error);
      return { success: false, error: error.message };
    }
  }

  async exportConfiguration() {
    try {
      const response = await fetch(`${this.baseURL}/config/export`);
      return await response.json();
    } catch (error) {
      console.error('Failed to export configuration:', error);
      return { error: error.message };
    }
  }

  async importConfiguration(configData) {
    try {
      const response = await fetch(`${this.baseURL}/config/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return { success: false, error: error.message };
    }
  }

  // ================================
  // BANGLADESH-SPECIFIC FEATURES
  // ================================

  async getBangladeshMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/bangladesh/metrics`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get Bangladesh metrics:', error);
      return { error: error.message };
    }
  }

  async getFestivalTrafficAnalysis() {
    try {
      const response = await fetch(`${this.baseURL}/bangladesh/festival-traffic`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get festival traffic analysis:', error);
      return { error: error.message };
    }
  }

  async getMobileNetworkAnalysis() {
    try {
      const response = await fetch(`${this.baseURL}/bangladesh/mobile-analysis`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get mobile network analysis:', error);
      return { error: error.message };
    }
  }

  async getPaymentMethodAnalysis() {
    try {
      const response = await fetch(`${this.baseURL}/bangladesh/payment-analysis`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get payment method analysis:', error);
      return { error: error.message };
    }
  }

  // ================================
  // REAL-TIME MONITORING
  // ================================

  async getRealtimeMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/realtime/metrics`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get realtime metrics:', error);
      return { error: error.message };
    }
  }

  async getRealtimeTraffic() {
    try {
      const response = await fetch(`${this.baseURL}/realtime/traffic`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get realtime traffic:', error);
      return { error: error.message };
    }
  }

  async getRealtimeHealth() {
    try {
      const response = await fetch(`${this.baseURL}/realtime/health`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get realtime health:', error);
      return { error: error.message };
    }
  }

  // ================================
  // PERFORMANCE ANALYTICS
  // ================================

  async getPerformanceReport(timeRange = '24h') {
    try {
      const response = await fetch(`${this.baseURL}/performance/report?range=${timeRange}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get performance report:', error);
      return { error: error.message };
    }
  }

  async getLatencyAnalysis(serviceName = null) {
    try {
      const url = serviceName 
        ? `${this.baseURL}/performance/latency/${serviceName}`
        : `${this.baseURL}/performance/latency`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Failed to get latency analysis:', error);
      return { error: error.message };
    }
  }

  async getThroughputAnalysis() {
    try {
      const response = await fetch(`${this.baseURL}/performance/throughput`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get throughput analysis:', error);
      return { error: error.message };
    }
  }

  async getErrorAnalysis() {
    try {
      const response = await fetch(`${this.baseURL}/performance/errors`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get error analysis:', error);
      return { error: error.message };
    }
  }
}

// Export singleton instance
const apiGatewayApiService = new ApiGatewayApiService();
export default apiGatewayApiService;