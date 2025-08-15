/**
 * Lazy Import Utility - Bundle Size Optimization
 * Dynamic imports with error boundaries for code splitting
 * Target: Reduce bundle from 7750KB to 500KB
 */

import { lazy, ComponentType } from 'react';

interface LazyImportOptions {
  fallback?: ComponentType;
  retryAttempts?: number;
  retryDelay?: number;
  preload?: boolean;
}

interface LazyComponentInfo {
  component: ComponentType<any>;
  preloadPromise?: Promise<any>;
  isLoaded: boolean;
  loadTime?: number;
}

class LazyImportManager {
  private loadedComponents: Map<string, LazyComponentInfo> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  /**
   * Create lazy component with enhanced error handling
   */
  createLazyComponent<T = any>(
    importFn: () => Promise<{ default: ComponentType<T> }>,
    options: LazyImportOptions = {}
  ): ComponentType<T> {
    const {
      fallback = this.createFallbackComponent(),
      retryAttempts = 3,
      retryDelay = 1000,
      preload = false
    } = options;

    const enhancedImportFn = this.createRetryWrapper(importFn, retryAttempts, retryDelay);
    const lazyComponent = lazy(enhancedImportFn);

    if (preload) {
      this.preloadComponent(enhancedImportFn);
    }

    return lazyComponent;
  }

  /**
   * Create retry wrapper for failed imports
   */
  private createRetryWrapper<T>(
    importFn: () => Promise<{ default: ComponentType<T> }>,
    maxAttempts: number,
    delay: number
  ) {
    return async (): Promise<{ default: ComponentType<T> }> => {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const startTime = Date.now();
          const result = await importFn();
          const loadTime = Date.now() - startTime;
          
          console.log(`Component loaded in ${loadTime}ms (attempt ${attempt})`);
          return result;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Import attempt ${attempt} failed:`, error);
          
          if (attempt < maxAttempts) {
            await this.sleep(delay * attempt); // Exponential backoff
          }
        }
      }
      
      throw lastError;
    };
  }

  /**
   * Preload component for better performance
   */
  private async preloadComponent(importFn: () => Promise<any>): Promise<void> {
    try {
      await importFn();
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }

  /**
   * Create fallback component
   */
  private createFallbackComponent(): ComponentType {
    return () => (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading component...</p>
        </div>
      </div>
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch preload multiple components
   */
  async batchPreload(importFunctions: Array<() => Promise<any>>): Promise<void> {
    const preloadPromises = importFunctions.map(fn => this.preloadComponent(fn));
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Get loading statistics
   */
  getLoadingStats(): {
    totalComponents: number;
    loadedComponents: number;
    averageLoadTime: number;
  } {
    const loadedComponents = Array.from(this.loadedComponents.values());
    const loadedCount = loadedComponents.filter(c => c.isLoaded).length;
    const totalLoadTime = loadedComponents.reduce((sum, c) => sum + (c.loadTime || 0), 0);
    
    return {
      totalComponents: this.loadedComponents.size,
      loadedComponents: loadedCount,
      averageLoadTime: loadedCount > 0 ? totalLoadTime / loadedCount : 0
    };
  }
}

export const lazyImportManager = new LazyImportManager();

// Convenience function for creating lazy components
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options?: LazyImportOptions
): ComponentType<T> {
  return lazyImportManager.createLazyComponent(importFn, options);
}

// Route-based lazy loading
export const lazyRoutes = {
  CustomerApp: createLazyComponent(
    () => import('@/micro-frontends/CustomerApp'),
    { preload: true }
  ),
  AdminApp: createLazyComponent(
    () => import('@/micro-frontends/AdminApp'),
    { preload: false }
  ),
  VendorApp: createLazyComponent(
    () => import('@/micro-frontends/VendorApp'),
    { preload: false }
  )
};

// Component-based lazy loading
export const lazyComponents = {
  Homepage: createLazyComponent(
    () => import('@/domains/customer/pages/Homepage'),
    { preload: true }
  ),
  ProductGrid: createLazyComponent(
    () => import('@/shared/components/ProductGrid'),
    { preload: false }
  ),
  AdvancedSearch: createLazyComponent(
    () => import('@/shared/components/AdvancedSearch'),
    { preload: false }
  )
};

export type { LazyImportOptions, LazyComponentInfo };