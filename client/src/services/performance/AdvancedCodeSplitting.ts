/**
 * Phase 1.1: Advanced Code Splitting & Bundle Optimization
 * Route-based and Component-based Code Splitting Implementation
 * Target: Bundle Size 2048KB → 500KB (75% reduction)
 */

import { lazy, ComponentType } from 'react';

// Route-based code splitting
export const HomePage = lazy(() => import('../domains/customer/pages/HomePage'));
export const ProductPage = lazy(() => import('../domains/customer/pages/ProductPage'));
export const CheckoutPage = lazy(() => import('../domains/customer/pages/CheckoutPage'));
export const CartPage = lazy(() => import('../domains/customer/pages/CartPage'));
export const ProfilePage = lazy(() => import('../domains/customer/pages/ProfilePage'));
export const OrdersPage = lazy(() => import('../domains/customer/pages/OrdersPage'));

// Admin pages - lazy loaded
export const AdminDashboard = lazy(() => import('../domains/admin/pages/AdminDashboard'));
export const AdminProducts = lazy(() => import('../domains/admin/pages/AdminProducts'));
export const AdminOrders = lazy(() => import('../domains/admin/pages/AdminOrders'));
export const AdminUsers = lazy(() => import('../domains/admin/pages/AdminUsers'));

// Vendor pages - lazy loaded
export const VendorDashboard = lazy(() => import('../domains/vendor/pages/VendorDashboard'));
export const VendorProducts = lazy(() => import('../domains/vendor/pages/VendorProducts'));
export const VendorOrders = lazy(() => import('../domains/vendor/pages/VendorOrders'));

// Component-based code splitting for heavy components
export const ProductRecommendations = lazy(() => import('../shared/components/ProductRecommendations'));
export const AdvancedSearch = lazy(() => import('../shared/components/AdvancedSearch'));
export const ProductComparison = lazy(() => import('../shared/components/ProductComparison'));
export const ShoppingCart = lazy(() => import('../shared/components/ShoppingCart'));
export const PaymentComponent = lazy(() => import('../shared/components/PaymentComponent'));

// Feature-based code splitting
export const ChatSupport = lazy(() => import('../shared/components/ChatSupport'));
export const VideoCall = lazy(() => import('../shared/components/VideoCall'));
export const ARViewer = lazy(() => import('../shared/components/ARViewer'));
export const VirtualTryOn = lazy(() => import('../shared/components/VirtualTryOn'));

// Analytics and tracking components
export const AnalyticsDashboard = lazy(() => import('../shared/components/AnalyticsDashboard'));
export const ReportingModule = lazy(() => import('../shared/components/ReportingModule'));

// Advanced lazy loading with retry mechanism
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackComponent?: ComponentType
) => {
  const LazyComponent = lazy(async () => {
    try {
      return await importFunc();
    } catch (error) {
      console.error('Failed to load component:', error);
      
      // Retry mechanism with exponential backoff
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const module = await importFunc();
            resolve(module);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            if (fallbackComponent) {
              resolve({ default: fallbackComponent });
            } else {
              throw retryError;
            }
          }
        }, 1000); // 1 second delay
      });
    }
  });

  return LazyComponent;
};

// Preload strategy for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const componentImport = importFunc();
  return componentImport;
};

// Critical path preloading
export const preloadCriticalComponents = () => {
  // Preload homepage and product page as they're most frequently accessed
  preloadComponent(() => import('../domains/customer/pages/HomePage'));
  preloadComponent(() => import('../domains/customer/pages/ProductPage'));
  
  // Preload checkout for better conversion
  preloadComponent(() => import('../domains/customer/pages/CheckoutPage'));
};

// Bundle splitting configuration
export const getBundleSplitConfig = () => ({
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        maxSize: 200000,
      },
      common: {
        minChunks: 2,
        name: 'common',
        chunks: 'all',
        maxSize: 150000,
      },
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        chunks: 'all',
        priority: 20,
      },
      ui: {
        test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
        name: 'ui',
        chunks: 'all',
        priority: 15,
      }
    }
  }
});

// Tree shaking optimization
export const getTreeShakingConfig = () => ({
  usedExports: true,
  sideEffects: false,
  optimization: {
    minimize: true,
    providedExports: true,
    usedExports: true,
    sideEffects: false,
  }
});

// Dynamic imports for non-critical features
export const loadFeatureModule = async (featureName: string) => {
  switch (featureName) {
    case 'analytics':
      return await import('../features/analytics');
    case 'chat':
      return await import('../features/chat');
    case 'video':
      return await import('../features/video');
    case 'ar':
      return await import('../features/ar');
    default:
      throw new Error(`Unknown feature: ${featureName}`);
  }
};

// Bundle analysis utilities
export const getBundleAnalysis = () => ({
  analyze: process.env.ANALYZE_BUNDLE === 'true',
  generateStatsFile: true,
  analyzerMode: 'static',
  reportFilename: 'bundle-analysis.html',
  openAnalyzer: false,
});

export default {
  preloadCriticalComponents,
  createLazyComponent,
  preloadComponent,
  getBundleSplitConfig,
  getTreeShakingConfig,
  loadFeatureModule,
  getBundleAnalysis
};