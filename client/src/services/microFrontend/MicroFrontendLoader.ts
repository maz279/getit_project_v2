/**
 * Micro-Frontend Loader Service
 * Phase 1 Week 1-2: Micro-Frontend Architecture Implementation
 */

interface MicroFrontendConfig {
  name: string;
  remoteEntry: string;
  exposedModule: string;
  fallbackComponent?: React.ComponentType;
}

interface LoadedMicroFrontend {
  component: React.ComponentType;
  scope: string;
  module: string;
}

class MicroFrontendLoader {
  private static instance: MicroFrontendLoader;
  private loadedMicroFrontends: Map<string, LoadedMicroFrontend> = new Map();
  private loadingPromises: Map<string, Promise<LoadedMicroFrontend>> = new Map();

  static getInstance(): MicroFrontendLoader {
    if (!MicroFrontendLoader.instance) {
      MicroFrontendLoader.instance = new MicroFrontendLoader();
    }
    return MicroFrontendLoader.instance;
  }

  async loadMicroFrontend(config: MicroFrontendConfig): Promise<LoadedMicroFrontend> {
    const key = `${config.name}:${config.exposedModule}`;
    
    // Return cached micro-frontend if already loaded
    if (this.loadedMicroFrontends.has(key)) {
      return this.loadedMicroFrontends.get(key)!;
    }

    // Return existing loading promise to prevent duplicate requests
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    // Start loading the micro-frontend
    const loadingPromise = this.loadRemoteModule(config);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const loadedMicroFrontend = await loadingPromise;
      this.loadedMicroFrontends.set(key, loadedMicroFrontend);
      this.loadingPromises.delete(key);
      return loadedMicroFrontend;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  private async loadRemoteModule(config: MicroFrontendConfig): Promise<LoadedMicroFrontend> {
    try {
      // Load the remote entry script
      await this.loadScript(config.remoteEntry);
      
      // Initialize the shared scope
      await this.initializeSharedScope();
      
      // Get the container
      const container = (window as any)[config.name];
      if (!container) {
        throw new Error(`Container ${config.name} not found`);
      }

      // Initialize the container
      await container.init((window as any).__webpack_share_scopes__.default);
      
      // Load the exposed module
      const factory = await container.get(config.exposedModule);
      const module = factory();
      
      return {
        component: module.default || module,
        scope: config.name,
        module: config.exposedModule,
      };
    } catch (error) {
      console.error(`Failed to load micro-frontend ${config.name}:`, error);
      
      // Return fallback component if available
      if (config.fallbackComponent) {
        return {
          component: config.fallbackComponent,
          scope: config.name,
          module: config.exposedModule,
        };
      }
      
      throw error;
    }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      
      document.head.appendChild(script);
    });
  }

  private async initializeSharedScope(): Promise<void> {
    if (!(window as any).__webpack_share_scopes__) {
      (window as any).__webpack_share_scopes__ = { default: {} };
    }
  }

  // Preload micro-frontends for better performance
  async preloadMicroFrontends(configs: MicroFrontendConfig[]): Promise<void> {
    const preloadPromises = configs.map(config => 
      this.loadMicroFrontend(config).catch(error => {
        console.warn(`Failed to preload micro-frontend ${config.name}:`, error);
      })
    );
    
    await Promise.allSettled(preloadPromises);
  }

  // Get all loaded micro-frontends
  getLoadedMicroFrontends(): Map<string, LoadedMicroFrontend> {
    return new Map(this.loadedMicroFrontends);
  }

  // Clear cache
  clearCache(): void {
    this.loadedMicroFrontends.clear();
    this.loadingPromises.clear();
  }
}

export default MicroFrontendLoader;
export type { MicroFrontendConfig, LoadedMicroFrontend };