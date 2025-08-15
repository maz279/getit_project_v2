/**
 * API Gateway Entry Point
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Production-ready API Gateway service initialization
 */

import { ApiGatewayService } from './ApiGatewayService';
import { Express } from 'express';

export { ApiGatewayService };
export default ApiGatewayService;

// Export middleware and services for external use
export { authMiddleware } from './middleware/authentication';
export { rateLimitMiddleware } from './middleware/rateLimit';
export { circuitBreakerMiddleware } from './middleware/circuitBreaker';
export { securityMiddleware } from './middleware/security';
export { compressionMiddleware } from './middleware/compression';
export { cachingMiddleware } from './middleware/caching';
export { metricsMiddleware } from './middleware/metrics';

export { ServiceRegistry } from './services/ServiceRegistry';
export { HealthChecker } from './services/HealthChecker';
export { MetricsCollector } from './services/MetricsCollector';
export { AuditLogger } from './services/AuditLogger';

export { getGatewayConfig } from './config/gateway.config';
export { serviceRoutes } from './config/routes.config';

// Initialize API Gateway for external use
export const initializeApiGateway = (app: Express): ApiGatewayService => {
  const apiGateway = new ApiGatewayService(app);
  
  // Register the API Gateway routes with the Express app
  apiGateway.registerRoutes(app);
  
  return apiGateway;
};