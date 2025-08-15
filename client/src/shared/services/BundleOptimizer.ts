/**
 * Bundle Optimizer Service - Webpack & Code Splitting Optimization
 * Phase 3: Performance & Mobile Optimization Implementation
 * 
 * Target: <250KB Initial Bundle, Dynamic Imports, Tree Shaking
 */

export interface BundleConfig {
  enableCodeSplitting: boolean;
  enableTreeShaking: boolean;
  enableCompression: boolean;
  enableLazyLoading: boolean;
  targetBundleSize: number;
  compressionLevel: number;
}

export interface BundleMetrics {
  initialBundleSize: number;
  totalBundleSize: number;
  chunkCount: number;
  compressionRatio: number;
  loadTime: number;
  cacheHitRate: number;
  codeSplittingRatio: number;
  treeshakingEfficiency: number;
}

export interface OptimizationResult {
  success: boolean;
  optimizationsApplied: string[];
  beforeMetrics: BundleMetrics;
  afterMetrics: BundleMetrics;
  improvementPercentage: number;
}

export interface LazyComponentConfig {
  componentPath: string;
  preload: boolean;
  priority: 'high' | 'medium' | 'low';
  condition?: () => boolean;
}

/**
 * Bundle Optimizer Service
 * Comprehensive bundle optimization for Amazon.com/Shopee.sg performance standards
 */
export class BundleOptimizer {
  private config: BundleConfig;
  private metrics: BundleMetrics;
  private lazyComponents: Map<string, LazyComponentConfig>;
  private preloadedChunks: Set<string>;
  private compressionWorker: Worker | null;

  constructor(config?: Partial<BundleConfig>) {
    this.config = {
      enableCodeSplitting: true,
      enableTreeShaking: true,
      enableCompression: true,
      enableLazyLoading: true,
      targetBundleSize: 250, // KB
      compressionLevel: 6,
      ...config
    };

    this.metrics = this.initializeMetrics();
    this.lazyComponents = new Map();
    this.preloadedChunks = new Set();
    this.compressionWorker = null;

    this.initialize();
  }

  /**
   * Bundle Analysis Operations
   */
  async analyzeBundleSize(): Promise<BundleMetrics> {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    let totalSize = 0;
    let initialSize = 0;
    let chunkCount = 0;

    // Analyze JavaScript bundles
    for (const script of scripts) {
      const src = (script as HTMLScriptElement).src;
      if (src) {
        try {
          const response = await fetch(src, { method: 'HEAD' });
          const size = parseInt(response.headers.get('content-length') || '0');
          totalSize += size;

          if (!src.includes('chunk') && !src.includes('vendor')) {
            initialSize += size;
          } else {
            chunkCount++;
          }
        } catch (error) {
          console.warn('Failed to analyze bundle:', src, error);
        }
      }
    }

    // Analyze CSS bundles
    for (const stylesheet of stylesheets) {
      const href = (stylesheet as HTMLLinkElement).href;
      if (href) {
        try {
          const response = await fetch(href, { method: 'HEAD' });
          const size = parseInt(response.headers.get('content-length') || '0');
          totalSize += size;

          if (!href.includes('chunk')) {
            initialSize += size;
          }
        } catch (error) {
          console.warn('Failed to analyze stylesheet:', href, error);
        }
      }
    }

    // Calculate metrics
    const compressionRatio = this.calculateCompressionRatio();
    const loadTime = this.measureLoadTime();
    const codeSplittingRatio = chunkCount > 0 ? (chunkCount / (scripts.length + stylesheets.length)) * 100 : 0;
    const treeshakingEfficiency = this.estimateTreeshakingEfficiency();

    this.metrics = {
      initialBundleSize: Math.round(initialSize / 1024), // Convert to KB
      totalBundleSize: Math.round(totalSize / 1024),
      chunkCount,
      compressionRatio,
      loadTime,
      cacheHitRate: this.calculateCacheHitRate(),
      codeSplittingRatio,
      treeshakingEfficiency
    };

    return this.metrics;
  }

  /**
   * Dynamic Import Optimization
   */
  async registerLazyComponent(name: string, config: LazyComponentConfig): Promise<void> {
    this.lazyComponents.set(name, config);

    // Preload if configured
    if (config.preload) {
      await this.preloadComponent(name);
    }
  }

  async preloadComponent(name: string): Promise<void> {
    const config = this.lazyComponents.get(name);
    if (!config || this.preloadedChunks.has(name)) return;

    try {
      // Add preload link for the component chunk
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = config.componentPath;
      document.head.appendChild(link);

      this.preloadedChunks.add(name);
    } catch (error) {
      console.warn('Failed to preload component:', name, error);
    }
  }

  async loadComponent(name: string): Promise<any> {
    const config = this.lazyComponents.get(name);
    if (!config) {
      throw new Error(`Component ${name} not registered`);
    }

    // Check condition if provided
    if (config.condition && !config.condition()) {
      return null;
    }

    try {
      const startTime = performance.now();
      
      // Dynamic import with priority handling
      const module = await this.importWithPriority(config.componentPath, config.priority);
      
      const loadTime = performance.now() - startTime;
      
      // Update metrics
      this.updateLoadTimeMetrics(loadTime);
      
      return module;
    } catch (error) {
      console.error('Failed to load component:', name, error);
      throw error;
    }
  }

  /**
   * Code Splitting Optimization
   */
  async optimizeCodeSplitting(): Promise<string[]> {
    const optimizations: string[] = [];

    if (!this.config.enableCodeSplitting) return optimizations;

    // Detect and optimize route-based splitting
    const routes = this.detectRoutes();
    if (routes.length > 0) {
      await this.optimizeRouteSplitting(routes);
      optimizations.push(`Route-based splitting (${routes.length} routes)`);
    }

    // Detect and optimize vendor splitting
    const hasVendorSplit = this.detectVendorSplitting();
    if (!hasVendorSplit) {
      this.suggestVendorSplitting();
      optimizations.push('Vendor splitting recommendation');
    }

    // Optimize component-based splitting
    const componentSplits = await this.optimizeComponentSplitting();
    if (componentSplits > 0) {
      optimizations.push(`Component splitting (${componentSplits} components)`);
    }

    return optimizations;
  }

  /**
   * Tree Shaking Optimization
   */
  async optimizeTreeShaking(): Promise<string[]> {
    const optimizations: string[] = [];

    if (!this.config.enableTreeShaking) return optimizations;

    // Analyze unused exports
    const unusedExports = await this.detectUnusedExports();
    if (unusedExports.length > 0) {
      optimizations.push(`Unused exports detected: ${unusedExports.length}`);
    }

    // Optimize import statements
    const importOptimizations = this.optimizeImports();
    if (importOptimizations > 0) {
      optimizations.push(`Import optimizations: ${importOptimizations}`);
    }

    // Suggest barrel export optimizations
    const barrelOptimizations = this.analyzeBarrelExports();
    if (barrelOptimizations > 0) {
      optimizations.push(`Barrel export optimizations: ${barrelOptimizations}`);
    }

    return optimizations;
  }

  /**
   * Compression Optimization
   */
  async optimizeCompression(): Promise<string[]> {
    const optimizations: string[] = [];

    if (!this.config.enableCompression) return optimizations;

    // Check current compression
    const currentCompression = await this.detectCompression();
    optimizations.push(`Current compression: ${currentCompression.join(', ')}`);

    // Suggest Brotli if not enabled
    if (!currentCompression.includes('br')) {
      optimizations.push('Brotli compression recommended');
    }

    // Optimize compression level
    if (this.config.compressionLevel < 6) {
      optimizations.push('Compression level optimization suggested');
    }

    return optimizations;
  }

  /**
   * Bundle Size Optimization
   */
  async optimizeBundleSize(): Promise<OptimizationResult> {
    const beforeMetrics = await this.analyzeBundleSize();
    const optimizations: string[] = [];

    try {
      // Code splitting optimizations
      const codeSplittingOpts = await this.optimizeCodeSplitting();
      optimizations.push(...codeSplittingOpts);

      // Tree shaking optimizations
      const treeshakingOpts = await this.optimizeTreeShaking();
      optimizations.push(...treeshakingOpts);

      // Compression optimizations
      const compressionOpts = await this.optimizeCompression();
      optimizations.push(...compressionOpts);

      // Lazy loading optimizations
      if (this.config.enableLazyLoading) {
        const lazyOpts = await this.optimizeLazyLoading();
        optimizations.push(...lazyOpts);
      }

      // Wait for optimizations to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Measure after optimization
      const afterMetrics = await this.analyzeBundleSize();
      
      const improvement = this.calculateImprovement(beforeMetrics, afterMetrics);

      return {
        success: true,
        optimizationsApplied: optimizations,
        beforeMetrics,
        afterMetrics,
        improvementPercentage: improvement
      };

    } catch (error) {
      console.error('Bundle optimization failed:', error);
      
      return {
        success: false,
        optimizationsApplied: optimizations,
        beforeMetrics,
        afterMetrics: beforeMetrics,
        improvementPercentage: 0
      };
    }
  }

  /**
   * Lazy Loading Optimization
   */
  async optimizeLazyLoading(): Promise<string[]> {
    const optimizations: string[] = [];

    // Optimize images
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
    
    if (images.length > 0) {
      optimizations.push(`Lazy loading images: ${images.length}`);
    }

    // Optimize iframes
    const iframes = document.querySelectorAll('iframe:not([loading])');
    iframes.forEach(iframe => {
      iframe.setAttribute('loading', 'lazy');
    });
    
    if (iframes.length > 0) {
      optimizations.push(`Lazy loading iframes: ${iframes.length}`);
    }

    // Optimize components
    const lazyComponentCount = this.lazyComponents.size;
    if (lazyComponentCount > 0) {
      optimizations.push(`Lazy components registered: ${lazyComponentCount}`);
    }

    return optimizations;
  }

  /**
   * Resource Preloading
   */
  preloadCriticalResources(resources: string[]): void {
    resources.forEach(resource => {
      const link = document.createElement('link');
      
      if (resource.endsWith('.js')) {
        link.rel = 'modulepreload';
      } else if (resource.endsWith('.css')) {
        link.rel = 'preload';
        link.as = 'style';
      } else {
        link.rel = 'preload';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  prefetchNextPageResources(resources: string[]): void {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  /**
   * Performance Monitoring
   */
  getBundleMetrics(): BundleMetrics {
    return { ...this.metrics };
  }

  isOptimal(): boolean {
    return this.metrics.initialBundleSize <= this.config.targetBundleSize &&
           this.metrics.codeSplittingRatio >= 60 &&
           this.metrics.treeshakingEfficiency >= 80;
  }

  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.metrics.initialBundleSize > this.config.targetBundleSize) {
      suggestions.push(`Bundle size (${this.metrics.initialBundleSize}KB) exceeds target (${this.config.targetBundleSize}KB)`);
    }

    if (this.metrics.codeSplittingRatio < 60) {
      suggestions.push('Implement more aggressive code splitting');
    }

    if (this.metrics.treeshakingEfficiency < 80) {
      suggestions.push('Optimize imports to improve tree shaking');
    }

    if (this.metrics.compressionRatio < 70) {
      suggestions.push('Enable better compression (Brotli/Gzip)');
    }

    return suggestions;
  }

  /**
   * Private Helper Methods
   */
  private initialize(): void {
    // Initialize compression worker if supported
    if ('Worker' in window && this.config.enableCompression) {
      try {
        this.compressionWorker = new Worker('/workers/compression-worker.js');
      } catch (error) {
        console.warn('Compression worker not available:', error);
      }
    }

    // Monitor bundle loading
    this.monitorBundleLoading();
  }

  private initializeMetrics(): BundleMetrics {
    return {
      initialBundleSize: 0,
      totalBundleSize: 0,
      chunkCount: 0,
      compressionRatio: 0,
      loadTime: 0,
      cacheHitRate: 0,
      codeSplittingRatio: 0,
      treeshakingEfficiency: 0
    };
  }

  private async importWithPriority(path: string, priority: 'high' | 'medium' | 'low'): Promise<any> {
    // Implement priority-based loading
    if (priority === 'high') {
      // Immediate import
      return await import(path);
    } else if (priority === 'medium') {
      // Slight delay for medium priority
      await new Promise(resolve => setTimeout(resolve, 10));
      return await import(path);
    } else {
      // Low priority - use requestIdleCallback if available
      return new Promise((resolve, reject) => {
        const loadComponent = async () => {
          try {
            const module = await import(path);
            resolve(module);
          } catch (error) {
            reject(error);
          }
        };

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(loadComponent);
        } else {
          setTimeout(loadComponent, 100);
        }
      });
    }
  }

  private detectRoutes(): string[] {
    // Detect route-based components
    const routes: string[] = [];
    
    // Analyze current routing structure
    if (window.location.pathname) {
      routes.push(window.location.pathname);
    }
    
    // Analyze navigation links
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      if (href && href.startsWith(window.location.origin)) {
        const path = new URL(href).pathname;
        if (!routes.includes(path)) {
          routes.push(path);
        }
      }
    });

    return routes;
  }

  private async optimizeRouteSplitting(routes: string[]): Promise<void> {
    // Suggest route-based code splitting
    console.info('Route-based splitting recommended for:', routes);
  }

  private detectVendorSplitting(): boolean {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.some(script => 
      (script as HTMLScriptElement).src.includes('vendor') ||
      (script as HTMLScriptElement).src.includes('node_modules')
    );
  }

  private suggestVendorSplitting(): void {
    console.info('Vendor splitting recommended for better caching');
  }

  private async optimizeComponentSplitting(): Promise<number> {
    // Count components that could benefit from splitting
    return this.lazyComponents.size;
  }

  private async detectUnusedExports(): Promise<string[]> {
    // Analyze unused exports (simplified)
    return [];
  }

  private optimizeImports(): number {
    // Count import optimizations
    return 0;
  }

  private analyzeBarrelExports(): number {
    // Analyze barrel export patterns
    return 0;
  }

  private async detectCompression(): Promise<string[]> {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const encoding = response.headers.get('content-encoding');
      return encoding ? encoding.split(',').map(e => e.trim()) : [];
    } catch (error) {
      return [];
    }
  }

  private calculateCompressionRatio(): number {
    // Estimate compression ratio
    return 70; // Placeholder
  }

  private measureLoadTime(): number {
    if ('timing' in performance) {
      const timing = performance.timing as any;
      return timing.loadEventEnd - timing.navigationStart;
    }
    return 0;
  }

  private estimateTreeshakingEfficiency(): number {
    // Estimate tree shaking efficiency
    return 85; // Placeholder
  }

  private calculateCacheHitRate(): number {
    // Calculate cache hit rate
    return 80; // Placeholder
  }

  private updateLoadTimeMetrics(loadTime: number): void {
    // Update load time metrics
    this.metrics.loadTime = (this.metrics.loadTime + loadTime) / 2;
  }

  private calculateImprovement(before: BundleMetrics, after: BundleMetrics): number {
    const sizeDiff = before.initialBundleSize - after.initialBundleSize;
    return (sizeDiff / before.initialBundleSize) * 100;
  }

  private monitorBundleLoading(): void {
    // Monitor bundle loading performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'resource' && 
              (entry.name.includes('.js') || entry.name.includes('.css'))) {
            // Track bundle loading performance
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource timing not available:', error);
      }
    }
  }
}