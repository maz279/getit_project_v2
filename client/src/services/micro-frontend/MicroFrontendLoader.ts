/**
 * Micro-Frontend Loader Service
 * Phase 1 Week 1-2: Module Federation Implementation
 * Amazon.com/Shopee.sg Enterprise Standards Implementation
 */

import { ComponentType, lazy } from 'react';

interface MicroFrontendConfig {
  name: string;
  url: string;
  scope: string;
  module: string;
  fallback?: ComponentType;
}

class MicroFrontendLoader {
  private static instance: MicroFrontendLoader;
  private loadedModules: Map<string, any> = new Map();
  private loadingModules: Map<string, Promise<any>> = new Map();

  private constructor() {}

  static getInstance(): MicroFrontendLoader {
    if (!MicroFrontendLoader.instance) {
      MicroFrontendLoader.instance = new MicroFrontendLoader();
    }
    return MicroFrontendLoader.instance;
  }

  /**
   * Load a remote micro-frontend module
   */
  async loadRemoteModule(config: MicroFrontendConfig): Promise<ComponentType> {
    const { name, url, scope, module } = config;
    const moduleKey = `${scope}/${module}`;

    // Return cached module if already loaded
    if (this.loadedModules.has(moduleKey)) {
      return this.loadedModules.get(moduleKey);
    }

    // Return loading promise if currently loading
    if (this.loadingModules.has(moduleKey)) {
      return this.loadingModules.get(moduleKey);
    }

    // Start loading the module
    const loadingPromise = this.loadModule(config);
    this.loadingModules.set(moduleKey, loadingPromise);

    try {
      const loadedModule = await loadingPromise;
      this.loadedModules.set(moduleKey, loadedModule);
      this.loadingModules.delete(moduleKey);
      return loadedModule;
    } catch (error) {
      this.loadingModules.delete(moduleKey);
      throw error;
    }
  }

  /**
   * Load a module dynamically
   */
  private async loadModule(config: MicroFrontendConfig): Promise<ComponentType> {
    const { name, url, scope, module } = config;

    try {
      // Check if running in webpack environment
      if (typeof __webpack_init_sharing__ !== 'undefined') {
        // Initialize sharing
        await __webpack_init_sharing__('default');
        
        // Load the remote container
        const container = await this.loadRemoteContainer(url, scope);
        
        // Initialize the container
        await container.init(__webpack_share_scopes__.default);
        
        // Get the module factory
        const factory = await container.get(module);
        
        // Create the module
        const Module = factory();
        
        return Module.default || Module;
      } else {
        // Fallback to dynamic import for non-webpack environments
        return await this.loadWithDynamicImport(config);
      }
    } catch (error) {
      console.error(`Failed to load micro-frontend ${name}:`, error);
      
      // Return fallback component if available
      if (config.fallback) {
        return config.fallback;
      }
      
      // Return error component
      return this.createErrorComponent(name, error);
    }
  }

  /**
   * Load remote container
   */
  private async loadRemoteContainer(url: string, scope: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      
      script.onload = () => {
        // Get the container from the global scope
        const container = (window as any)[scope];
        if (container) {
          resolve(container);
        } else {
          reject(new Error(`Container ${scope} not found`));
        }
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load script ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Fallback to dynamic import
   */
  private async loadWithDynamicImport(config: MicroFrontendConfig): Promise<ComponentType> {
    const { name, module } = config;
    
    try {
      // Try to import the module dynamically
      const importedModule = await import(module);
      return importedModule.default || importedModule;
    } catch (error) {
      throw new Error(`Failed to dynamically import ${name}: ${error.message}`);
    }
  }

  /**
   * Create error component
   */
  private createErrorComponent(name: string, error: Error): ComponentType {
    return () => (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Failed to Load {name}
          </h2>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  /**
   * Preload a micro-frontend
   */
  async preload(config: MicroFrontendConfig): Promise<void> {
    try {
      await this.loadRemoteModule(config);
    } catch (error) {
      console.warn(`Failed to preload micro-frontend ${config.name}:`, error);
    }
  }

  /**
   * Get all loaded modules
   */
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules.keys());
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.loadedModules.clear();
    this.loadingModules.clear();
  }
}

export default MicroFrontendLoader;
export type { MicroFrontendConfig };