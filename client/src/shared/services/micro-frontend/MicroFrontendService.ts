/**
 * MicroFrontend Service
 * Amazon.com/Shopee.sg-Level Enterprise Module Federation Management
 * Complete micro-frontend lifecycle management with error handling and performance monitoring
 */

interface MicroFrontendConfig {
  name: string;
  url: string;
  scope: string;
  module: string;
  failback?: React.ComponentType;
  preload?: boolean;
  timeout?: number;
  retryAttempts?: number;
}

interface MicroFrontendError {
  name: string;
  error: Error;
  timestamp: Date;
  context?: Record<string, any>;
}

interface MicroFrontendHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  loadTime: number;
  errorRate: number;
  lastCheck: Date;
}

class MicroFrontendService {
  private static instance: MicroFrontendService;
  private loadedMicroFrontends: Map<string, any> = new Map();
  private errorLog: MicroFrontendError[] = [];
  private healthMetrics: Map<string, MicroFrontendHealth> = new Map();
  private preloadedModules: Set<string> = new Set();
  
  private constructor() {
    this.initializeService();
  }

  public static getInstance(): MicroFrontendService {
    if (!MicroFrontendService.instance) {
      MicroFrontendService.instance = new MicroFrontendService();
    }
    return MicroFrontendService.instance;
  }

  private initializeService(): void {
    // Initialize Module Federation health monitoring
    this.startHealthMonitoring();
    
    // Performance monitoring
    this.startPerformanceMonitoring();
    
    // Error tracking
    this.initializeErrorTracking();
  }

  /**
   * Load micro-frontend dynamically with error handling and retries
   */
  public async loadMicroFrontend(config: MicroFrontendConfig): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Check if already loaded
      if (this.loadedMicroFrontends.has(config.name)) {
        return this.loadedMicroFrontends.get(config.name);
      }

      // Preload if configured
      if (config.preload && !this.preloadedModules.has(config.name)) {
        await this.preloadMicroFrontend(config);
      }

      // Load the remote module
      const module = await this.loadRemoteModule(config);
      
      // Cache the loaded module
      this.loadedMicroFrontends.set(config.name, module);
      
      // Update health metrics
      this.updateHealthMetrics(config.name, {
        status: 'healthy',
        loadTime: Date.now() - startTime,
        errorRate: 0,
        lastCheck: new Date(),
      });

      return module;
    } catch (error) {
      this.handleLoadError(config, error);
      
      // Update health metrics
      this.updateHealthMetrics(config.name, {
        status: 'unhealthy',
        loadTime: Date.now() - startTime,
        errorRate: this.calculateErrorRate(config.name),
        lastCheck: new Date(),
      });

      // Return fallback component if available
      if (config.failback) {
        return config.failback;
      }
      
      throw error;
    }
  }

  /**
   * Preload micro-frontend for better performance
   */
  public async preloadMicroFrontend(config: MicroFrontendConfig): Promise<void> {
    try {
      const script = document.createElement('script');
      script.src = config.url;
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
      this.preloadedModules.add(config.name);
    } catch (error) {
      console.warn(`Failed to preload micro-frontend ${config.name}:`, error);
    }
  }

  /**
   * Load remote module with timeout and retry logic
   */
  private async loadRemoteModule(config: MicroFrontendConfig): Promise<any> {
    const maxRetries = config.retryAttempts || 3;
    const timeout = config.timeout || 10000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await Promise.race([
          this.fetchRemoteModule(config),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Module load timeout')), timeout)
          )
        ]);
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  /**
   * Fetch remote module using Module Federation
   */
  private async fetchRemoteModule(config: MicroFrontendConfig): Promise<any> {
    // @ts-ignore - Module Federation runtime
    const container = await window[config.scope];
    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get(config.module);
    return factory();
  }

  /**
   * Handle micro-frontend loading errors
   */
  private handleLoadError(config: MicroFrontendConfig, error: Error): void {
    const errorEntry: MicroFrontendError = {
      name: config.name,
      error,
      timestamp: new Date(),
      context: {
        url: config.url,
        scope: config.scope,
        module: config.module,
      },
    };
    
    this.errorLog.push(errorEntry);
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }
    
    console.error(`Failed to load micro-frontend ${config.name}:`, error);
  }

  /**
   * Get micro-frontend health status
   */
  public getHealthStatus(): MicroFrontendHealth[] {
    return Array.from(this.healthMetrics.values());
  }

  /**
   * Get error logs
   */
  public getErrorLogs(): MicroFrontendError[] {
    return [...this.errorLog];
  }

  /**
   * Update health metrics
   */
  private updateHealthMetrics(name: string, metrics: Partial<MicroFrontendHealth>): void {
    const existing = this.healthMetrics.get(name) || {
      name,
      status: 'healthy',
      loadTime: 0,
      errorRate: 0,
      lastCheck: new Date(),
    };
    
    this.healthMetrics.set(name, { ...existing, ...metrics });
  }

  /**
   * Calculate error rate for a micro-frontend
   */
  private calculateErrorRate(name: string): number {
    const recentErrors = this.errorLog.filter(
      error => error.name === name && 
      Date.now() - error.timestamp.getTime() < 60000 // Last minute
    );
    
    return Math.min(recentErrors.length / 10, 1); // Max 1.0
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.healthMetrics.forEach((metrics, name) => {
        const timeSinceLastCheck = Date.now() - metrics.lastCheck.getTime();
        
        // Mark as degraded if not checked recently
        if (timeSinceLastCheck > 300000) { // 5 minutes
          this.updateHealthMetrics(name, { status: 'degraded' });
        }
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor for performance issues
    if (typeof window !== 'undefined' && window.performance) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('remoteEntry.js')) {
            console.log('Micro-frontend load time:', entry.duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  /**
   * Initialize error tracking
   */
  private initializeErrorTracking(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (event.filename?.includes('remoteEntry.js')) {
          console.error('Micro-frontend runtime error:', event.error);
        }
      });
    }
  }

  /**
   * Get module federation configuration
   */
  public getModuleFederationConfig(): Record<string, MicroFrontendConfig> {
    return {
      'customer-app': {
        name: 'customer-app',
        url: 'http://localhost:3001/remoteEntry.js',
        scope: 'customerApp',
        module: './CustomerApp',
        preload: true,
        timeout: 10000,
        retryAttempts: 3,
      },
      'admin-app': {
        name: 'admin-app',
        url: 'http://localhost:3002/remoteEntry.js',
        scope: 'adminApp',
        module: './AdminApp',
        preload: false,
        timeout: 10000,
        retryAttempts: 3,
      },
      'vendor-app': {
        name: 'vendor-app',
        url: 'http://localhost:3003/remoteEntry.js',
        scope: 'vendorApp',
        module: './VendorApp',
        preload: false,
        timeout: 10000,
        retryAttempts: 3,
      },
      'mobile-app': {
        name: 'mobile-app',
        url: 'http://localhost:3004/remoteEntry.js',
        scope: 'mobileApp',
        module: './MobileApp',
        preload: true,
        timeout: 15000,
        retryAttempts: 5,
      },
      'analytics-app': {
        name: 'analytics-app',
        url: 'http://localhost:3005/remoteEntry.js',
        scope: 'analyticsApp',
        module: './AnalyticsApp',
        preload: false,
        timeout: 10000,
        retryAttempts: 3,
      },
    };
  }

  /**
   * Clear cache for a micro-frontend
   */
  public clearCache(name: string): void {
    this.loadedMicroFrontends.delete(name);
    this.preloadedModules.delete(name);
    this.healthMetrics.delete(name);
  }

  /**
   * Get loaded micro-frontends
   */
  public getLoadedMicroFrontends(): string[] {
    return Array.from(this.loadedMicroFrontends.keys());
  }
}

export default MicroFrontendService;