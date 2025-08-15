/**
 * Feature Registry - Feature Metadata Management
 * Central registry for feature definitions and metadata
 */

import { logger } from '../utils/logger';

interface FeatureDefinition {
  name: string;
  type: 'numerical' | 'categorical' | 'text' | 'boolean' | 'embedding';
  description: string;
  source: string;
  transformations: string[];
  tags: string[];
  owner: string;
  version: string;
  bangladesh_specific: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  schema?: any;
  validation?: any;
  dependencies?: string[];
}

interface FeatureLineage {
  featureName: string;
  dependencies: string[];
  dependents: string[];
  transformationPath: string[];
}

export class FeatureRegistry {
  private features: Map<string, FeatureDefinition>;
  private lineage: Map<string, FeatureLineage>;
  private tags: Map<string, string[]>;
  private owners: Map<string, string[]>;

  constructor() {
    this.features = new Map();
    this.lineage = new Map();
    this.tags = new Map();
    this.owners = new Map();
    
    logger.info('📋 Feature Registry initialized');
  }

  /**
   * Register a feature definition
   */
  async registerFeature(feature: FeatureDefinition): Promise<void> {
    try {
      // Add timestamps
      const now = new Date();
      feature.createdAt = now;
      feature.updatedAt = now;
      
      // Validate feature definition
      this.validateFeatureDefinition(feature);
      
      // Store feature
      this.features.set(feature.name, feature);
      
      // Update tags index
      this.updateTagsIndex(feature);
      
      // Update owners index
      this.updateOwnersIndex(feature);
      
      // Update lineage
      this.updateLineage(feature);
      
      logger.debug('✅ Feature registered', {
        featureName: feature.name,
        type: feature.type,
        owner: feature.owner,
        bangladeshSpecific: feature.bangladesh_specific
      });
      
    } catch (error) {
      logger.error('❌ Error registering feature', { error });
      throw error;
    }
  }

  /**
   * Get feature definition
   */
  getFeature(name: string): FeatureDefinition | undefined {
    return this.features.get(name);
  }

  /**
   * Get all feature definitions
   */
  getFeatureDefinitions(): FeatureDefinition[] {
    return Array.from(this.features.values());
  }

  /**
   * Get features by type
   */
  getFeaturesByType(type: string): FeatureDefinition[] {
    return Array.from(this.features.values()).filter(f => f.type === type);
  }

  /**
   * Get features by owner
   */
  getFeaturesByOwner(owner: string): FeatureDefinition[] {
    return Array.from(this.features.values()).filter(f => f.owner === owner);
  }

  /**
   * Get features by tag
   */
  getFeaturesByTag(tag: string): FeatureDefinition[] {
    return Array.from(this.features.values()).filter(f => f.tags.includes(tag));
  }

  /**
   * Get Bangladesh-specific features
   */
  getBangladeshFeatures(): FeatureDefinition[] {
    return Array.from(this.features.values()).filter(f => f.bangladesh_specific);
  }

  /**
   * Search features by name or description
   */
  searchFeatures(query: string): FeatureDefinition[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.features.values()).filter(f => 
      f.name.toLowerCase().includes(lowercaseQuery) ||
      f.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Update feature definition
   */
  async updateFeature(name: string, updates: Partial<FeatureDefinition>): Promise<void> {
    try {
      const existingFeature = this.features.get(name);
      if (!existingFeature) {
        throw new Error(`Feature ${name} not found`);
      }

      // Create updated feature
      const updatedFeature: FeatureDefinition = {
        ...existingFeature,
        ...updates,
        updatedAt: new Date()
      };

      // Validate updated feature
      this.validateFeatureDefinition(updatedFeature);

      // Update feature
      this.features.set(name, updatedFeature);

      // Update indexes
      this.updateTagsIndex(updatedFeature);
      this.updateOwnersIndex(updatedFeature);
      this.updateLineage(updatedFeature);

      logger.debug('✅ Feature updated', {
        featureName: name,
        updates: Object.keys(updates)
      });

    } catch (error) {
      logger.error('❌ Error updating feature', { error });
      throw error;
    }
  }

  /**
   * Delete feature
   */
  async deleteFeature(name: string): Promise<void> {
    try {
      const feature = this.features.get(name);
      if (!feature) {
        throw new Error(`Feature ${name} not found`);
      }

      // Check for dependents
      const lineage = this.lineage.get(name);
      if (lineage && lineage.dependents.length > 0) {
        throw new Error(`Cannot delete feature ${name} as it has dependents: ${lineage.dependents.join(', ')}`);
      }

      // Remove from all indexes
      this.features.delete(name);
      this.lineage.delete(name);
      
      // Remove from tags index
      for (const tag of feature.tags) {
        const tagFeatures = this.tags.get(tag) || [];
        const index = tagFeatures.indexOf(name);
        if (index > -1) {
          tagFeatures.splice(index, 1);
          if (tagFeatures.length === 0) {
            this.tags.delete(tag);
          } else {
            this.tags.set(tag, tagFeatures);
          }
        }
      }

      // Remove from owners index
      const ownerFeatures = this.owners.get(feature.owner) || [];
      const ownerIndex = ownerFeatures.indexOf(name);
      if (ownerIndex > -1) {
        ownerFeatures.splice(ownerIndex, 1);
        if (ownerFeatures.length === 0) {
          this.owners.delete(feature.owner);
        } else {
          this.owners.set(feature.owner, ownerFeatures);
        }
      }

      logger.debug('✅ Feature deleted', { featureName: name });

    } catch (error) {
      logger.error('❌ Error deleting feature', { error });
      throw error;
    }
  }

  /**
   * Get feature lineage
   */
  getFeatureLineage(name: string): FeatureLineage | undefined {
    return this.lineage.get(name);
  }

  /**
   * Get all tags
   */
  getAllTags(): string[] {
    return Array.from(this.tags.keys());
  }

  /**
   * Get all owners
   */
  getAllOwners(): string[] {
    return Array.from(this.owners.keys());
  }

  /**
   * Get feature statistics
   */
  getFeatureStatistics(): any {
    const stats = {
      total: this.features.size,
      byType: {},
      byOwner: {},
      byTag: {},
      bangladeshSpecific: 0,
      withDependencies: 0,
      recentlyUpdated: 0
    };

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const feature of this.features.values()) {
      // Count by type
      stats.byType[feature.type] = (stats.byType[feature.type] || 0) + 1;
      
      // Count by owner
      stats.byOwner[feature.owner] = (stats.byOwner[feature.owner] || 0) + 1;
      
      // Count by tags
      for (const tag of feature.tags) {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      }
      
      // Count Bangladesh-specific
      if (feature.bangladesh_specific) {
        stats.bangladeshSpecific++;
      }
      
      // Count features with dependencies
      if (feature.dependencies && feature.dependencies.length > 0) {
        stats.withDependencies++;
      }
      
      // Count recently updated
      if (feature.updatedAt && feature.updatedAt > oneDayAgo) {
        stats.recentlyUpdated++;
      }
    }

    return stats;
  }

  /**
   * Validate feature definition
   */
  private validateFeatureDefinition(feature: FeatureDefinition): void {
    // Required fields
    if (!feature.name || !feature.type || !feature.description) {
      throw new Error('Feature name, type, and description are required');
    }

    // Valid types
    const validTypes = ['numerical', 'categorical', 'text', 'boolean', 'embedding'];
    if (!validTypes.includes(feature.type)) {
      throw new Error(`Invalid feature type: ${feature.type}`);
    }

    // Name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(feature.name)) {
      throw new Error('Feature name must start with a letter and contain only letters, numbers, and underscores');
    }

    // Version format
    if (feature.version && !/^\d+\.\d+$/.test(feature.version)) {
      throw new Error('Feature version must be in format X.Y');
    }

    // Bangladesh-specific validation
    if (feature.bangladesh_specific && !feature.tags.includes('bangladesh')) {
      feature.tags.push('bangladesh');
    }
  }

  /**
   * Update tags index
   */
  private updateTagsIndex(feature: FeatureDefinition): void {
    for (const tag of feature.tags) {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, []);
      }
      const tagFeatures = this.tags.get(tag)!;
      if (!tagFeatures.includes(feature.name)) {
        tagFeatures.push(feature.name);
      }
    }
  }

  /**
   * Update owners index
   */
  private updateOwnersIndex(feature: FeatureDefinition): void {
    if (!this.owners.has(feature.owner)) {
      this.owners.set(feature.owner, []);
    }
    const ownerFeatures = this.owners.get(feature.owner)!;
    if (!ownerFeatures.includes(feature.name)) {
      ownerFeatures.push(feature.name);
    }
  }

  /**
   * Update lineage
   */
  private updateLineage(feature: FeatureDefinition): void {
    const lineage: FeatureLineage = {
      featureName: feature.name,
      dependencies: feature.dependencies || [],
      dependents: [],
      transformationPath: feature.transformations || []
    };

    // Update dependencies
    for (const dep of lineage.dependencies) {
      const depLineage = this.lineage.get(dep);
      if (depLineage) {
        if (!depLineage.dependents.includes(feature.name)) {
          depLineage.dependents.push(feature.name);
        }
      }
    }

    this.lineage.set(feature.name, lineage);
  }

  /**
   * Get feature recommendations
   */
  getFeatureRecommendations(existingFeatures: string[]): string[] {
    const recommendations: string[] = [];
    const existingTags = new Set<string>();
    const existingTypes = new Set<string>();

    // Analyze existing features
    for (const featureName of existingFeatures) {
      const feature = this.features.get(featureName);
      if (feature) {
        feature.tags.forEach(tag => existingTags.add(tag));
        existingTypes.add(feature.type);
      }
    }

    // Find similar features
    for (const feature of this.features.values()) {
      if (existingFeatures.includes(feature.name)) continue;

      // Check if feature has similar tags
      const commonTags = feature.tags.filter(tag => existingTags.has(tag));
      if (commonTags.length > 0) {
        recommendations.push(feature.name);
      }
    }

    // Limit recommendations
    return recommendations.slice(0, 10);
  }

  /**
   * Export feature definitions
   */
  exportFeatures(format: 'json' | 'csv' = 'json'): any {
    const features = Array.from(this.features.values());
    
    if (format === 'json') {
      return {
        features: features,
        metadata: {
          total: features.length,
          exportedAt: new Date().toISOString(),
          registry: 'ml-service-feature-registry'
        }
      };
    }
    
    // CSV format
    const headers = ['name', 'type', 'description', 'owner', 'version', 'bangladesh_specific', 'tags', 'source'];
    const rows = features.map(f => [
      f.name,
      f.type,
      f.description,
      f.owner,
      f.version,
      f.bangladesh_specific,
      f.tags.join(';'),
      f.source
    ]);
    
    return {
      headers,
      rows
    };
  }

  /**
   * Import feature definitions
   */
  async importFeatures(data: any): Promise<void> {
    try {
      const features = Array.isArray(data) ? data : data.features;
      
      for (const featureData of features) {
        await this.registerFeature(featureData);
      }
      
      logger.info('✅ Features imported successfully', {
        count: features.length
      });
      
    } catch (error) {
      logger.error('❌ Error importing features', { error });
      throw error;
    }
  }
}