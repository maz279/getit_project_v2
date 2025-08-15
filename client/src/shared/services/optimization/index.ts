/**
 * Optimization Services Index
 * Centralized export for all optimization services
 * Amazon.com/Shopee.sg Enterprise Standards
 */

export { default as BundleSizeOptimizer } from './BundleSizeOptimizer';
export { default as LazyLoadingService } from './LazyLoadingService';
export { default as ComponentConsolidationService } from './ComponentConsolidationService';
export { default as PerformanceMonitoringService } from './PerformanceMonitoringService';
export { default as ArchitecturalOptimizationService } from './ArchitecturalOptimizationService';

// Re-export utility
export { default as LazyImportUtility } from '../../utils/LazyImportUtility';

// Type exports for external usage
export type { LazyLoadingOptions, LazyComponentMetrics } from './LazyLoadingService';
export type { LazyImportConfig } from '../../utils/LazyImportUtility';

/**
 * Quick access to optimization services
 */
export const OptimizationServices = {
  bundleOptimizer: () => BundleSizeOptimizer.getInstance(),
  lazyLoading: () => LazyLoadingService.getInstance(),
  componentConsolidation: () => ComponentConsolidationService.getInstance(),
  performanceMonitoring: () => PerformanceMonitoringService.getInstance(),
  architecturalOptimization: () => ArchitecturalOptimizationService.getInstance(),
} as const;

/**
 * Initialize all optimization services
 */
export const initializeOptimizationServices = async (): Promise<void> => {
  console.log('🚀 Initializing enterprise optimization services...');
  
  // Initialize services in dependency order
  const services = OptimizationServices;
  
  // Start performance monitoring first
  await services.performanceMonitoring().collectPerformanceMetrics();
  
  // Initialize architectural optimization (coordinates all others)
  const architecturalService = services.architecturalOptimization();
  
  console.log('✅ All optimization services initialized');
  
  // Return optimization status
  const metrics = architecturalService.getOptimizationMetrics();
  console.log(`📊 Current bundle size: ${metrics.bundleSize}KB`);
  console.log(`🎯 Target achievement: ${metrics.targetAchievement.toFixed(1)}%`);
};

/**
 * Quick optimization analysis
 */
export const runOptimizationAnalysis = async (): Promise<{
  currentStatus: any;
  recommendations: string[];
  estimatedSavings: number;
}> => {
  const architecturalService = ArchitecturalOptimizationService.getInstance();
  
  const metrics = architecturalService.getOptimizationMetrics();
  const recommendations = architecturalService.getOptimizationRecommendations();
  const estimatedSavings = 7250 - metrics.totalSavings; // Remaining potential
  
  return {
    currentStatus: metrics,
    recommendations,
    estimatedSavings
  };
};

/**
 * Execute complete optimization strategy
 */
export const executeCompleteOptimization = async (): Promise<void> => {
  const architecturalService = ArchitecturalOptimizationService.getInstance();
  await architecturalService.executeOptimization();
};