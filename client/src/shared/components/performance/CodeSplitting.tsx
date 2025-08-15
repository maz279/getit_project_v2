// Code splitting utilities for Phase 3 Performance Enhancement
import { lazy, ComponentType } from 'react';

// Generic lazy loader with error handling
export const lazyWithRetry = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retryCount = 3
) => {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (n: number) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (n > 1) {
              // Wait before retry
              setTimeout(() => attempt(n - 1), 1000);
            } else {
              reject(error);
            }
          });
      };
      attempt(retryCount);
    });
  });
};

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  return importFunc();
};

// Route-based code splitting
export const createAsyncRoute = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    preload?: boolean;
    retryCount?: number;
  }
) => {
  const LazyComponent = lazyWithRetry(importFunc, options?.retryCount);
  
  if (options?.preload) {
    // Preload the component
    preloadComponent(importFunc);
  }
  
  return LazyComponent;
};

// Bundle analysis utilities
export const bundleAnalytics = {
  trackChunkLoad: (chunkName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    console.log(`Chunk "${chunkName}" loaded in ${loadTime.toFixed(2)}ms`);
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics implementation would go here
    }
    
    return loadTime;
  },
  
  measureComponentSize: (componentName: string) => {
    // This would integrate with bundle analyzer tools
    console.log(`Measuring component size: ${componentName}`);
  }
};

// Lazy loaded components for common UI elements
export const LazyDropdownMenus = lazyWithRetry(
  () => import('../ui/DropdownMenus'),
  2
);

export const LazyModals = lazyWithRetry(
  () => import('../ui/Modals'),
  2
);

export const LazyCharts = lazyWithRetry(
  () => import('../ui/Charts'),
  2
);

export const LazyDataTables = lazyWithRetry(
  () => import('../ui/DataTables'),
  2
);

export default {
  lazyWithRetry,
  preloadComponent,
  createAsyncRoute,
  bundleAnalytics
};