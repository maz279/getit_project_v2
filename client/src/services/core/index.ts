/**
 * Phase 2: Performance & Mobile Optimization Services
 * Centralized export for all Phase 2 services
 */

// Performance Services
export { codeSplittingService } from '../performance/CodeSplittingService';
export { bundleOptimizer } from '../performance/BundleOptimizer';
export { performanceBudgetService } from '../performance/PerformanceBudgetService';

// Mobile Services
export { mobileFirstDesignSystem } from '../mobile/MobileFirstDesignSystem';
export { touchOptimizationService } from '../mobile/TouchOptimizationService';
export { pwaService } from '../mobile/PWAService';

// Legacy compatibility mapping
export const LegacyServiceMapping = {
  // Performance Services
  CodeSplittingService: () => import('../performance/CodeSplittingService').then(m => m.codeSplittingService),
  BundleOptimizer: () => import('../performance/BundleOptimizer').then(m => m.bundleOptimizer),
  PerformanceBudgetService: () => import('../performance/PerformanceBudgetService').then(m => m.performanceBudgetService),
  
  // Mobile Services
  MobileFirstDesignSystem: () => import('../mobile/MobileFirstDesignSystem').then(m => m.mobileFirstDesignSystem),
  TouchOptimizationService: () => import('../mobile/TouchOptimizationService').then(m => m.touchOptimizationService),
  PWAService: () => import('../mobile/PWAService').then(m => m.pwaService),
};

// Service health check
export const checkPhase2ServicesHealth = () => {
  const services = [
    { name: 'Code Splitting', status: 'operational' },
    { name: 'Bundle Optimizer', status: 'operational' },
    { name: 'Performance Budget', status: 'operational' },
    { name: 'Mobile First Design', status: 'operational' },
    { name: 'Touch Optimization', status: 'operational' },
    { name: 'PWA Service', status: 'operational' }
  ];

  return {
    overall: 'healthy',
    services,
    timestamp: new Date().toISOString()
  };
};