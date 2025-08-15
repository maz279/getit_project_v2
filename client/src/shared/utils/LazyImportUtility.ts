/**
 * Lazy Import Utility for Bundle Optimization
 * Amazon.com/Shopee.sg Enterprise Standards
 * 
 * Converts static imports to dynamic imports for code splitting
 * Provides intelligent preloading and error handling
 */

import { ComponentType, lazy, Suspense, createElement } from 'react';

export interface LazyImportConfig {
  chunkName?: string;
  preload?: boolean;
  fallback?: ComponentType;
  timeout?: number;
  retries?: number;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export class LazyImportUtility {
  private static preloadedModules = new Set<string>();
  private static loadingPromises = new Map<string, Promise<any>>();
  
  /**
   * Create lazy imported component with advanced configuration
   */
  static createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    config: LazyImportConfig = {}
  ): ComponentType<any> {
    const {
      chunkName = 'lazy-chunk',
      preload = false,
      fallback: CustomFallback,
      timeout = 10000,
      retries = 3,
      onError,
      onSuccess
    } = config;

    // Preload if requested
    if (preload) {
      this.preloadModule(importFn, chunkName);
    }

    const LazyComponent = lazy(() => 
      this.importWithRetries(importFn, retries, timeout)
        .then(module => {
          onSuccess?.();
          return module;
        })
        .catch(error => {
          onError?.(error);
          throw error;
        })
    );

    return (props: any) => (
      <Suspense 
        fallback={
          CustomFallback ? 
            createElement(CustomFallback) : 
            this.getDefaultLoadingComponent()
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  /**
   * Import with retry logic and timeout
   */
  private static async importWithRetries<T>(
    importFn: () => Promise<T>,
    retries: number,
    timeout: number
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Import timeout')), timeout);
        });

        return await Promise.race([importFn(), timeoutPromise]);
      } catch (error) {
        lastError = error as Error;
        
        if (i === retries) {
          throw lastError;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    throw lastError!;
  }

  /**
   * Preload module for performance optimization
   */
  static preloadModule(
    importFn: () => Promise<any>,
    chunkName: string
  ): Promise<any> {
    if (this.preloadedModules.has(chunkName)) {
      return Promise.resolve();
    }

    if (!this.loadingPromises.has(chunkName)) {
      const promise = importFn()
        .then(module => {
          this.preloadedModules.add(chunkName);
          this.loadingPromises.delete(chunkName);
          return module;
        })
        .catch(error => {
          this.loadingPromises.delete(chunkName);
          throw error;
        });

      this.loadingPromises.set(chunkName, promise);
    }

    return this.loadingPromises.get(chunkName)!;
  }

  /**
   * Batch preload multiple modules
   */
  static batchPreload(
    modules: Array<{
      importFn: () => Promise<any>;
      chunkName: string;
      priority?: 'high' | 'medium' | 'low';
    }>
  ): Promise<any[]> {
    // Sort by priority
    const sortedModules = modules.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority || 'medium']) - (priorityOrder[b.priority || 'medium']);
    });

    return Promise.allSettled(
      sortedModules.map(({ importFn, chunkName }) => 
        this.preloadModule(importFn, chunkName)
      )
    ).then(results => {
      const successful = results.filter(r => r.status === 'fulfilled');
      console.log(`Preloaded ${successful.length}/${modules.length} modules`);
      return successful.map(r => (r as PromiseFulfilledResult<any>).value);
    });
  }

  /**
   * Get default loading component
   */
  private static getDefaultLoadingComponent() {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * Create route-based lazy components
   */
  static createLazyRoutes() {
    return {
      // Customer Domain Routes
      CustomerHome: this.createLazyComponent(
        () => import('@domains/customer/pages/Homepage'),
        { chunkName: 'customer-home', preload: true }
      ),
      ProductPage: this.createLazyComponent(
        () => import('@domains/customer/pages/ProductPage'),
        { chunkName: 'product-page', preload: false }
      ),
      CheckoutPage: this.createLazyComponent(
        () => import('@domains/customer/pages/CheckoutPage'),
        { chunkName: 'checkout-page', preload: false }
      ),
      OrderTracking: this.createLazyComponent(
        () => import('@domains/customer/pages/OrderTrackingPage'),
        { chunkName: 'order-tracking', preload: false }
      ),

      // Vendor Domain Routes
      VendorDashboard: this.createLazyComponent(
        () => import('@domains/vendor/pages/Dashboard'),
        { chunkName: 'vendor-dashboard', preload: false }
      ),
      VendorProducts: this.createLazyComponent(
        () => import('@domains/vendor/pages/ProductManagement'),
        { chunkName: 'vendor-products', preload: false }
      ),
      VendorOrders: this.createLazyComponent(
        () => import('@domains/vendor/pages/OrderManagement'),
        { chunkName: 'vendor-orders', preload: false }
      ),

      // Admin Domain Routes
      AdminDashboard: this.createLazyComponent(
        () => import('@domains/admin/pages/Dashboard'),
        { chunkName: 'admin-dashboard', preload: false }
      ),
      AdminUsers: this.createLazyComponent(
        () => import('@domains/admin/pages/UserManagement'),
        { chunkName: 'admin-users', preload: false }
      ),
      AdminAnalytics: this.createLazyComponent(
        () => import('@domains/admin/pages/Analytics'),
        { chunkName: 'admin-analytics', preload: false }
      ),

      // Heavy Components
      AISearchBar: this.createLazyComponent(
        () => import('@/features/search/components/AISearchBar'),
        { chunkName: 'ai-search-bar', preload: true }
      ),
      DataTable: this.createLazyComponent(
        () => import('@shared/components/tables/DataTable'),
        { chunkName: 'data-table', preload: false }
      ),
      RichTextEditor: this.createLazyComponent(
        () => import('@shared/components/editors/RichTextEditor'),
        { chunkName: 'rich-text-editor', preload: false }
      ),
      ImageGallery: this.createLazyComponent(
        () => import('@shared/components/media/ImageGallery'),
        { chunkName: 'image-gallery', preload: false }
      ),
      VideoPlayer: this.createLazyComponent(
        () => import('@shared/components/media/VideoPlayer'),
        { chunkName: 'video-player', preload: false }
      ),
      FileUploader: this.createLazyComponent(
        () => import('@shared/components/forms/FileUploader'),
        { chunkName: 'file-uploader', preload: false }
      )
    };
  }

  /**
   * Get preloading statistics
   */
  static getPreloadingStats() {
    return {
      preloadedModules: this.preloadedModules.size,
      currentlyLoading: this.loadingPromises.size,
      preloadedChunks: Array.from(this.preloadedModules)
    };
  }

  /**
   * Clear preloaded modules (for testing or memory management)
   */
  static clearPreloadedModules() {
    this.preloadedModules.clear();
    this.loadingPromises.clear();
  }
}

export default LazyImportUtility;