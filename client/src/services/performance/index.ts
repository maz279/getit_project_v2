/**
 * Performance Services Index
 * Phase 2 Week 5-6: Performance Optimization
 * Amazon.com/Shopee.sg Enterprise Standards
 */

export { default as PerformanceBudgetService } from './PerformanceBudgetService';

// Performance service exports
export const performanceServices = {
  PerformanceBudgetService
};

// Performance utilities
export const performanceUtils = {
  // Core Web Vitals measurement
  measureCoreWebVitals: async () => {
    const performanceService = (await import('./PerformanceBudgetService')).default.getInstance();
    return performanceService.generatePerformanceReport();
  },

  // Bundle size measurement
  measureBundleSize: async () => {
    const performanceService = (await import('./PerformanceBudgetService')).default.getInstance();
    return performanceService.measureBundleSize();
  },

  // TTI measurement
  measureTTI: async () => {
    const performanceService = (await import('./PerformanceBudgetService')).default.getInstance();
    return performanceService.measureTTI();
  }
};

// Performance configuration
export const performanceConfig = {
  budgets: {
    fcp: 1000, // 1s
    lcp: 2500, // 2.5s
    tti: 3000, // 3s
    cls: 0.1,  // 0.1
    bundleSize: 500, // 500KB
    requests: 50 // 50 requests
  },
  
  thresholds: {
    good: 80,
    needsImprovement: 60,
    poor: 0
  }
};

// Performance monitoring initialization
export const initializePerformanceMonitoring = () => {
  const performanceService = (PerformanceBudgetService as any).getInstance();
  
  // Start monitoring
  console.log('Performance monitoring initialized');
  
  return {
    service: performanceService,
    getBudget: () => performanceService.getBudget(),
    getMetrics: () => performanceService.getMetrics(),
    getViolations: () => performanceService.getViolations(),
    getComplianceScore: () => performanceService.getComplianceScore()
  };
};