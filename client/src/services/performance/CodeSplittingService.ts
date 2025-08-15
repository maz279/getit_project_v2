/**
 * Advanced Code Splitting Service
 * Phase 2 Week 5-6: Performance & Mobile Optimization
 * Route-based, component-based, and feature-based code splitting
 */

interface CodeSplittingConfig {
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  preloadOnHover: boolean;
  preloadOnVisible: boolean;
  chunkNamePrefix: string;
}

interface LoadedComponent {
  component: React.ComponentType<any>;
  chunkName: string;
  loadTime: number;
}

interface SplitComponentOptions {
  chunkName?: string;
  retry?: boolean;
  preload?: boolean;
  fallback?: React.ComponentType;
}

class CodeSplittingService {
  private static instance: CodeSplittingService;
  private config: CodeSplittingConfig;
  private loadedComponents: Map<string, LoadedComponent> = new Map();
  private preloadQueue: Set<string> = new Set();
  private retryAttempts: Map<string, number> = new Map();

  constructor(config: Partial<CodeSplittingConfig> = {}) {
    this.config = {
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      preloadOnHover: true,
      preloadOnVisible: true,
      chunkNamePrefix: 'chunk_',
      ...config,
    };
  }

  static getInstance(config?: Partial<CodeSplittingConfig>): CodeSplittingService {
    if (!CodeSplittingService.instance) {
      CodeSplittingService.instance = new CodeSplittingService(config);
    }
    return CodeSplittingService.instance;
  }

  /**
   * Create a lazy-loaded component with retry mechanism
   */
  createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: SplitComponentOptions = {}
  ): React.LazyExoticComponent<T> {
    const { chunkName, retry = true, preload = false } = options;
    
    const wrappedImport = async (): Promise<{ default: T }> => {
      const startTime = performance.now();
      
      try {
        const result = await this.loadWithRetry(importFn, chunkName);
        const loadTime = performance.now() - startTime;
        
        if (chunkName) {
          this.loadedComponents.set(chunkName, {
            component: result.default,
            chunkName,
            loadTime,
          });
        }
        
        // Track performance metrics
        this.trackLoadPerformance(chunkName, loadTime);
        
        return result;
      } catch (error) {
        console.error(`Failed to load component ${chunkName}:`, error);
        
        // Return fallback if available
        if (options.fallback) {
          return { default: options.fallback as T };
        }
        
        throw error;
      }
    };

    const LazyComponent = React.lazy(wrappedImport);
    
    // Preload if requested
    if (preload) {
      this.preloadComponent(importFn, chunkName);
    }
    
    return LazyComponent;
  }

  /**
   * Load component with exponential backoff retry
   */
  private async loadWithRetry<T>(
    importFn: () => Promise<{ default: T }>,
    chunkName?: string
  ): Promise<{ default: T }> {
    const key = chunkName || importFn.toString();
    let attempts = this.retryAttempts.get(key) || 0;
    
    while (attempts < this.config.maxRetries) {
      try {
        const result = await importFn();
        this.retryAttempts.delete(key);
        return result;
      } catch (error) {
        attempts++;
        this.retryAttempts.set(key, attempts);
        
        if (attempts >= this.config.maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`Failed to load component after ${this.config.maxRetries} attempts`);
  }

  /**
   * Preload component for better performance
   */
  async preloadComponent<T>(
    importFn: () => Promise<{ default: T }>,
    chunkName?: string
  ): Promise<void> {
    const key = chunkName || importFn.toString();
    
    if (this.preloadQueue.has(key) || this.loadedComponents.has(key)) {
      return;
    }
    
    this.preloadQueue.add(key);
    
    try {
      await importFn();
      console.log(`Preloaded component: ${chunkName}`);
    } catch (error) {
      console.warn(`Failed to preload component ${chunkName}:`, error);
    } finally {
      this.preloadQueue.delete(key);
    }
  }

  /**
   * Preload components on hover (for better UX)
   */
  enableHoverPreload(element: HTMLElement, importFn: () => Promise<any>, chunkName?: string): void {
    if (!this.config.preloadOnHover) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        this.preloadComponent(importFn, chunkName);
      }, 100); // Small delay to avoid unnecessary preloads
    };
    
    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  /**
   * Preload components when they become visible
   */
  enableVisibilityPreload(
    element: HTMLElement,
    importFn: () => Promise<any>,
    chunkName?: string
  ): IntersectionObserver | null {
    if (!this.config.preloadOnVisible || !window.IntersectionObserver) {
      return null;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.preloadComponent(importFn, chunkName);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(element);
    return observer;
  }

  /**
   * Get route-based code splitting configuration
   */
  getRouteBasedSplitting() {
    return {
      // Customer routes
      CustomerHomePage: this.createLazyComponent(
        () => import('@/domains/customer/pages/HomePage'),
        { chunkName: 'customer_home' }
      ),
      CustomerProductPage: this.createLazyComponent(
        () => import('@/domains/customer/pages/ProductPage'),
        { chunkName: 'customer_product' }
      ),
      CustomerCheckoutPage: this.createLazyComponent(
        () => import('@/domains/customer/pages/CheckoutPage'),
        { chunkName: 'customer_checkout' }
      ),
      
      // Admin routes
      AdminDashboard: this.createLazyComponent(
        () => import('@/domains/admin/pages/Dashboard'),
        { chunkName: 'admin_dashboard' }
      ),
      AdminUsersPage: this.createLazyComponent(
        () => import('@/domains/admin/pages/UsersPage'),
        { chunkName: 'admin_users' }
      ),
      
      // Vendor routes
      VendorDashboard: this.createLazyComponent(
        () => import('@/domains/vendor/pages/Dashboard'),
        { chunkName: 'vendor_dashboard' }
      ),
      VendorProductsPage: this.createLazyComponent(
        () => import('@/domains/vendor/pages/ProductsPage'),
        { chunkName: 'vendor_products' }
      ),
    };
  }

  /**
   * Get feature-based code splitting configuration
   */
  getFeatureBasedSplitting() {
    return {
      // AI Features
      AIRecommendations: this.createLazyComponent(
        () => import('@/features/ai/RecommendationsComponent'),
        { chunkName: 'ai_recommendations' }
      ),
      AISearchAssistant: this.createLazyComponent(
        () => import('@/features/ai/SearchAssistantComponent'),
        { chunkName: 'ai_search' }
      ),
      
      // Payment Features
      PaymentProcessor: this.createLazyComponent(
        () => import('@/features/payment/PaymentProcessorComponent'),
        { chunkName: 'payment_processor' }
      ),
      MobileBanking: this.createLazyComponent(
        () => import('@/features/payment/MobileBankingComponent'),
        { chunkName: 'mobile_banking' }
      ),
      
      // Analytics Features
      AnalyticsDashboard: this.createLazyComponent(
        () => import('@/features/analytics/AnalyticsDashboardComponent'),
        { chunkName: 'analytics_dashboard' }
      ),
      
      // Social Features
      SocialCommerce: this.createLazyComponent(
        () => import('@/features/social/SocialCommerceComponent'),
        { chunkName: 'social_commerce' }
      ),
      LiveStreaming: this.createLazyComponent(
        () => import('@/features/social/LiveStreamingComponent'),
        { chunkName: 'live_streaming' }
      ),
    };
  }

  /**
   * Track component load performance
   */
  private trackLoadPerformance(chunkName: string | undefined, loadTime: number): void {
    if (!chunkName) return;
    
    // Send performance metrics to analytics
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'code_splitting',
        chunkName,
        loadTime,
        timestamp: Date.now(),
      }),
    }).catch(console.error);
    
    // Log performance warning if load time is too high
    if (loadTime > 1000) {
      console.warn(`Slow chunk load: ${chunkName} took ${loadTime}ms`);
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const metrics = Array.from(this.loadedComponents.entries()).map(([chunkName, data]) => ({
      chunkName,
      loadTime: data.loadTime,
      status: 'loaded',
    }));
    
    return {
      totalChunks: metrics.length,
      averageLoadTime: metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length || 0,
      slowChunks: metrics.filter(m => m.loadTime > 1000),
      preloadQueue: Array.from(this.preloadQueue),
      metrics,
    };
  }

  /**
   * Clear performance cache
   */
  clearCache(): void {
    this.loadedComponents.clear();
    this.preloadQueue.clear();
    this.retryAttempts.clear();
  }
}

export default CodeSplittingService;
export type { CodeSplittingConfig, LoadedComponent, SplitComponentOptions };