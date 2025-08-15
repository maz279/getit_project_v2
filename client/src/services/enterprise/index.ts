/**
 * Phase 4: Enterprise Integration Services
 * Amazon.com/Shopee.sg Enterprise-Level Integration Services
 * 
 * This module provides access to all Phase 4 Enterprise Integration services
 * including micro-frontend architecture, state management, API integration,
 * performance monitoring, error tracking, and A/B testing capabilities.
 */

// Core Enterprise Services
export { default as MicroFrontendService } from './MicroFrontendService';
export { default as StateManagementService } from './StateManagementService';
export { default as APIIntegrationService } from './APIIntegrationService';
export { default as PerformanceMonitoringService } from './PerformanceMonitoringService';
export { default as ErrorTrackingService } from './ErrorTrackingService';
export { default as ABTestingService } from './ABTestingService';

// Service instances for immediate use
export const microFrontendService = MicroFrontendService.getInstance();
export const stateManagementService = StateManagementService.getInstance();
export const apiIntegrationService = APIIntegrationService.getInstance();
export const performanceMonitoringService = PerformanceMonitoringService.getInstance();
export const errorTrackingService = ErrorTrackingService.getInstance();
export const abTestingService = ABTestingService.getInstance();

// Phase 4 Enterprise Integration Service Collection
export const enterpriseServices = {
  microFrontend: microFrontendService,
  stateManagement: stateManagementService,
  apiIntegration: apiIntegrationService,
  performanceMonitoring: performanceMonitoringService,
  errorTracking: errorTrackingService,
  abTesting: abTestingService
};

// Service health check
export const checkEnterpriseServicesHealth = () => {
  return {
    microFrontend: microFrontendService.getHealthStatus(),
    stateManagement: stateManagementService.getHealthMetrics(),
    apiIntegration: apiIntegrationService.getHealthMetrics(),
    performanceMonitoring: performanceMonitoringService.getPerformanceReport(),
    errorTracking: errorTrackingService.getErrorReport(),
    abTesting: abTestingService.getExperimentReport()
  };
};

// Initialize all enterprise services
export const initializeEnterpriseServices = () => {
  // All services are initialized through their singletons
  console.log('✅ Phase 4 Enterprise Integration Services initialized');
  
  return {
    microFrontend: {
      service: 'MicroFrontendService',
      status: 'ready',
      microFrontends: microFrontendService.getAllMicroFrontends().size
    },
    stateManagement: {
      service: 'StateManagementService',
      status: 'ready',
      store: stateManagementService.getStore() ? 'configured' : 'not configured'
    },
    apiIntegration: {
      service: 'APIIntegrationService',
      status: 'ready',
      endpoints: 'configured'
    },
    performanceMonitoring: {
      service: 'PerformanceMonitoringService',
      status: 'ready',
      monitoring: 'active'
    },
    errorTracking: {
      service: 'ErrorTrackingService',
      status: 'ready',
      tracking: 'active'
    },
    abTesting: {
      service: 'ABTestingService',
      status: 'ready',
      experiments: abTestingService.getAllExperiments().length,
      featureFlags: abTestingService.getAllFeatureFlags().length
    }
  };
};

// Service capabilities summary
export const getEnterpriseCapabilities = () => {
  return {
    microFrontend: [
      'Independent deployable modules',
      'Cross-micro-frontend communication',
      'Fallback mechanisms',
      'Module federation support',
      'Dynamic loading'
    ],
    stateManagement: [
      'Redux Toolkit integration',
      'Persistent state',
      'Optimistic updates',
      'Time-travel debugging',
      'Micro-frontend synchronization'
    ],
    apiIntegration: [
      'GraphQL with Apollo Client',
      'REST API fallback',
      'Request/response caching',
      'Retry mechanisms',
      'Real-time subscriptions'
    ],
    performanceMonitoring: [
      'Core Web Vitals tracking',
      'Resource performance analysis',
      'User interaction monitoring',
      'Performance budgets',
      'Real-time metrics'
    ],
    errorTracking: [
      'Real-time error capture',
      'Error categorization',
      'Recovery mechanisms',
      'User context tracking',
      'External service integration'
    ],
    abTesting: [
      'Multi-variant testing',
      'Statistical significance',
      'User segmentation',
      'Feature flag management',
      'Real-time experimentation'
    ]
  };
};

// Export types for TypeScript support
export type EnterpriseServices = typeof enterpriseServices;
export type EnterpriseServiceHealth = ReturnType<typeof checkEnterpriseServicesHealth>;
export type EnterpriseCapabilities = ReturnType<typeof getEnterpriseCapabilities>;

// Default export for convenience
export default enterpriseServices;