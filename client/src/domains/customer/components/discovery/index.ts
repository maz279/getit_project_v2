/**
 * Customer Discovery Module Index
 * Consolidates all product discovery components (New Arrivals, Bestsellers, Categories)
 */

export { default as ProductDiscoveryEngine } from './ProductDiscoveryEngine';

// Re-export specific discovery components
export * from './CategoryBrowser';
export * from './ProductRecommendations';
export * from './TrendingProducts';