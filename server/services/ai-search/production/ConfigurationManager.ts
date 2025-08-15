/**
 * ConfigurationManager - Phase 4 Production Configuration Management
 * Runtime configuration updates and feature flags management
 */

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  conditions?: Record<string, any>;
  rolloutPercent?: number;
}

interface ConfigurationSchema {
  search: {
    maxResults: number;
    cacheTimeout: number;
    enableMLEnhancement: boolean;
    enableCulturalIntelligence: boolean;
  };
  performance: {
    maxCacheSize: number;
    requestTimeout: number;
    parallelProcessing: boolean;
  };
  security: {
    enableRateLimit: boolean;
    maxRequestsPerMinute: number;
    enableXSSProtection: boolean;
  };
  features: FeatureFlag[];
}

export class ConfigurationManager {
  private config: ConfigurationSchema;
  private configHistory: Array<{ timestamp: number; config: ConfigurationSchema; version: string }> = [];

  constructor() {
    this.config = this.getDefaultConfiguration();
    this.recordConfigChange('initial', this.config);
    console.log('⚙️ ConfigurationManager initialized with runtime configuration management');
  }

  /**
   * Get Current Configuration
   */
  getCurrentConfig(): ConfigurationSchema {
    return { ...this.config };
  }

  /**
   * Update Configuration
   */
  updateConfiguration(updates: Partial<ConfigurationSchema>): { success: boolean; errors?: string[] } {
    try {
      const validationResult = this.validateConfiguration(updates);
      if (!validationResult.valid) {
        return { success: false, errors: validationResult.errors };
      }

      const previousConfig = { ...this.config };
      this.config = { ...this.config, ...updates };
      
      this.recordConfigChange('update', this.config);
      console.log('⚙️ Configuration updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('💥 Configuration update failed:', error);
      return { success: false, errors: [error.message] };
    }
  }

  /**
   * Feature Flag Management
   */
  isFeatureEnabled(featureName: string, context: Record<string, any> = {}): boolean {
    const feature = this.config.features.find(f => f.name === featureName);
    if (!feature) return false;
    if (!feature.enabled) return false;

    // Check rollout percentage
    if (feature.rolloutPercent !== undefined) {
      const hash = this.hashString(context.userId || context.sessionId || 'anonymous');
      const rolloutHash = hash % 100;
      if (rolloutHash >= feature.rolloutPercent) return false;
    }

    // Check conditions
    if (feature.conditions) {
      return this.evaluateConditions(feature.conditions, context);
    }

    return true;
  }

  /**
   * Toggle Feature Flag
   */
  toggleFeature(featureName: string, enabled?: boolean): { success: boolean; error?: string } {
    const featureIndex = this.config.features.findIndex(f => f.name === featureName);
    if (featureIndex === -1) {
      return { success: false, error: `Feature '${featureName}' not found` };
    }

    const currentValue = this.config.features[featureIndex].enabled;
    this.config.features[featureIndex].enabled = enabled !== undefined ? enabled : !currentValue;
    
    this.recordConfigChange('feature-toggle', this.config);
    console.log(`🎛️ Feature '${featureName}' ${this.config.features[featureIndex].enabled ? 'enabled' : 'disabled'}`);
    
    return { success: true };
  }

  /**
   * Get Configuration History
   */
  getConfigurationHistory(limit: number = 50): Array<{ timestamp: number; version: string; changes?: string }> {
    return this.configHistory.slice(-limit).map(entry => ({
      timestamp: entry.timestamp,
      version: entry.version,
      changes: this.summarizeChanges(entry.config)
    }));
  }

  /**
   * Rollback Configuration
   */
  rollbackConfiguration(version: string): { success: boolean; error?: string } {
    const historyEntry = this.configHistory.find(entry => entry.version === version);
    if (!historyEntry) {
      return { success: false, error: `Configuration version '${version}' not found` };
    }

    this.config = { ...historyEntry.config };
    this.recordConfigChange('rollback', this.config);
    console.log(`⏪ Configuration rolled back to version '${version}'`);
    
    return { success: true };
  }

  /**
   * Private Methods
   */
  private getDefaultConfiguration(): ConfigurationSchema {
    return {
      search: {
        maxResults: 20,
        cacheTimeout: 300000, // 5 minutes
        enableMLEnhancement: true,
        enableCulturalIntelligence: true
      },
      performance: {
        maxCacheSize: 1000,
        requestTimeout: 30000, // 30 seconds
        parallelProcessing: true
      },
      security: {
        enableRateLimit: true,
        maxRequestsPerMinute: 100,
        enableXSSProtection: true
      },
      features: [
        {
          name: 'advanced-caching',
          enabled: true,
          description: 'Enable LRU caching with TTL management',
          rolloutPercent: 100
        },
        {
          name: 'parallel-processing',
          enabled: true,
          description: 'Enable parallel NLP and ML processing',
          rolloutPercent: 100
        },
        {
          name: 'cultural-intelligence',
          enabled: true,
          description: 'Enable Bangladesh cultural context analysis',
          rolloutPercent: 100
        },
        {
          name: 'experimental-ai',
          enabled: false,
          description: 'Enable experimental AI features',
          rolloutPercent: 10
        }
      ]
    };
  }

  private validateConfiguration(config: Partial<ConfigurationSchema>): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (config.search) {
      if (config.search.maxResults && (config.search.maxResults < 1 || config.search.maxResults > 100)) {
        errors.push('maxResults must be between 1 and 100');
      }
      if (config.search.cacheTimeout && config.search.cacheTimeout < 1000) {
        errors.push('cacheTimeout must be at least 1000ms');
      }
    }

    if (config.performance) {
      if (config.performance.maxCacheSize && config.performance.maxCacheSize < 10) {
        errors.push('maxCacheSize must be at least 10');
      }
      if (config.performance.requestTimeout && config.performance.requestTimeout < 1000) {
        errors.push('requestTimeout must be at least 1000ms');
      }
    }

    if (config.security) {
      if (config.security.maxRequestsPerMinute && config.security.maxRequestsPerMinute < 1) {
        errors.push('maxRequestsPerMinute must be at least 1');
      }
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  private recordConfigChange(changeType: string, config: ConfigurationSchema): void {
    const version = `v${Date.now()}-${changeType}`;
    this.configHistory.push({
      timestamp: Date.now(),
      config: JSON.parse(JSON.stringify(config)),
      version
    });

    // Keep only last 100 entries
    if (this.configHistory.length > 100) {
      this.configHistory = this.configHistory.slice(-100);
    }
  }

  private evaluateConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    for (const [key, expectedValue] of Object.entries(conditions)) {
      if (context[key] !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private summarizeChanges(config: ConfigurationSchema): string {
    const activeFeatures = config.features.filter(f => f.enabled).length;
    return `${activeFeatures} features enabled, timeout: ${config.performance.requestTimeout}ms, cache: ${config.performance.maxCacheSize}`;
  }

  destroy(): void {
    console.log('⚙️ ConfigurationManager destroyed');
  }
}