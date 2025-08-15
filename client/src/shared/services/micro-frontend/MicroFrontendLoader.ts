/**
 * Micro Frontend Loader Service - Amazon.com/Shopee.sg Standards
 * Module Federation Implementation
 * Phase 1: Micro-Frontend Architecture
 */

interface MicroFrontendConfig {
  name: string;
  url: string;
  scope: string;
  module: string;
  failureMessage: string;
  timeout: number;
  retryAttempts: number;
  preload: boolean;
}

interface LoadedMicroFrontend {
  name: string;
  component: React.ComponentType<any>;
  status: 'loading' | 'loaded' | 'error';
  lastLoaded: Date;
  loadTime: number;
}

class MicroFrontendLoader {
  private microFrontends: Map<string, LoadedMicroFrontend> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  private defaultConfig: Partial<MicroFrontendConfig> = {
    timeout: 10000,
    retryAttempts: 3,
    preload: false
  };

  /**
   * Register a micro-frontend
   */
  registerMicroFrontend(config: MicroFrontendConfig): void {
    const fullConfig = { ...this.defaultConfig, ...config };
    
    if (fullConfig.preload) {
      this.preloadMicroFrontend(fullConfig);
    }
  }

  /**
   * Load a micro-frontend dynamically
   */
  async loadMicroFrontend(name: string, config: MicroFrontendConfig): Promise<React.ComponentType<any>> {
    const existingMicroFrontend = this.microFrontends.get(name);
    
    if (existingMicroFrontend?.status === 'loaded') {
      return existingMicroFrontend.component;
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    const loadPromise = this.loadMicroFrontendInternal(name, config);
    this.loadingPromises.set(name, loadPromise);

    try {
      const component = await loadPromise;
      this.loadingPromises.delete(name);
      return component;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }

  /**
   * Internal method to load micro-frontend
   */
  private async loadMicroFrontendInternal(name: string, config: MicroFrontendConfig): Promise<React.ComponentType<any>> {
    const startTime = Date.now();
    
    try {
      this.updateMicroFrontendStatus(name, 'loading');
      
      // Simulate Module Federation loading
      const component = await this.simulateModuleFederationLoad(config);
      
      const loadTime = Date.now() - startTime;
      const loadedMicroFrontend: LoadedMicroFrontend = {
        name,
        component,
        status: 'loaded',
        lastLoaded: new Date(),
        loadTime
      };
      
      this.microFrontends.set(name, loadedMicroFrontend);
      return component;
      
    } catch (error) {
      this.updateMicroFrontendStatus(name, 'error');
      throw new Error(`Failed to load micro-frontend ${name}: ${error.message}`);
    }
  }

  /**
   * Simulate Module Federation loading
   */
  private async simulateModuleFederationLoad(config: MicroFrontendConfig): Promise<React.ComponentType<any>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return a lazy-loaded component
    return React.lazy(() => 
      import(`@/micro-frontends/${config.name}`).catch(() => {
        // Fallback component
        return Promise.resolve({
          default: () => React.createElement('div', { 
            className: 'p-8 text-center text-gray-500' 
          }, config.failureMessage)
        });
      })
    );
  }

  /**
   * Preload micro-frontend
   */
  private async preloadMicroFrontend(config: MicroFrontendConfig): Promise<void> {
    try {
      await this.loadMicroFrontend(config.name, config);
    } catch (error) {
      console.warn(`Failed to preload micro-frontend ${config.name}:`, error);
    }
  }

  /**
   * Update micro-frontend status
   */
  private updateMicroFrontendStatus(name: string, status: 'loading' | 'loaded' | 'error'): void {
    const existing = this.microFrontends.get(name);
    if (existing) {
      existing.status = status;
      this.microFrontends.set(name, existing);
    } else {
      this.microFrontends.set(name, {
        name,
        component: null as any,
        status,
        lastLoaded: new Date(),
        loadTime: 0
      });
    }
  }

  /**
   * Get loaded micro-frontends
   */
  getLoadedMicroFrontends(): LoadedMicroFrontend[] {
    return Array.from(this.microFrontends.values());
  }

  /**
   * Get micro-frontend status
   */
  getMicroFrontendStatus(name: string): 'loading' | 'loaded' | 'error' | 'not-found' {
    const microFrontend = this.microFrontends.get(name);
    return microFrontend?.status || 'not-found';
  }

  /**
   * Clear cache for a specific micro-frontend
   */
  clearMicroFrontendCache(name: string): void {
    this.microFrontends.delete(name);
    this.loadingPromises.delete(name);
  }

  /**
   * Clear all micro-frontend cache
   */
  clearAllCache(): void {
    this.microFrontends.clear();
    this.loadingPromises.clear();
  }
}

export default new MicroFrontendLoader();
export type { MicroFrontendConfig, LoadedMicroFrontend };