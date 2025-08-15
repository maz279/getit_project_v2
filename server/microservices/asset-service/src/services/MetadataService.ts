/**
 * MetadataService - Amazon.com/Shopee.sg-Level Asset Metadata Management
 * 
 * Enterprise metadata management providing:
 * - Comprehensive asset metadata storage and retrieval
 * - Advanced search and filtering capabilities
 * - Version control and history tracking
 * - Bangladesh cultural metadata support
 * - AI-powered metadata extraction and tagging
 * - Compliance and audit trail management
 */

import { AssetMetadata, AssetCategory, AssetStatus } from '../controllers/AssetController';

export interface AssetSearchFilters {
  category?: AssetCategory;
  subcategory?: string;
  tags?: string[];
  search?: string;
  status?: AssetStatus;
  createdBy?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  size?: {
    min?: number;
    max?: number;
  };
  dimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  bangladesh?: {
    region?: string;
    culturalContext?: string;
    language?: string;
  };
}

export interface SearchPagination {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SearchResult {
  assets: AssetMetadata[];
  total: number;
  facets?: {
    categories: Record<string, number>;
    tags: Record<string, number>;
    creators: Record<string, number>;
    bangladeshRegions: Record<string, number>;
  };
}

export interface AssetVersion {
  id: string;
  assetId: string;
  version: number;
  fileName: string;
  filePath: string;
  cdnUrl?: string;
  fileSize: number;
  metadata: Record<string, any>;
  changeDescription?: string;
  createdBy: string;
  createdAt: Date;
}

export interface AssetTag {
  id: string;
  name: string;
  category: 'general' | 'technical' | 'cultural' | 'business';
  color?: string;
  description?: string;
  usageCount: number;
  createdAt: Date;
}

export interface AssetRelation {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  relationType: 'derivative' | 'replacement' | 'variant' | 'translation' | 'optimization';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class MetadataService {
  private assetMetadata = new Map<string, AssetMetadata>();
  private assetVersions = new Map<string, AssetVersion[]>();
  private assetTags = new Map<string, AssetTag>();
  private assetRelations = new Map<string, AssetRelation[]>();
  private searchIndex = new Map<string, string[]>(); // Simple in-memory search index

  constructor() {
    this.initializeMetadataService();
    this.buildSearchIndex();
  }

  /**
   * Save asset metadata with validation and indexing
   */
  public async saveAssetMetadata(metadata: AssetMetadata): Promise<AssetMetadata> {
    try {
      // Validate metadata
      await this.validateAssetMetadata(metadata);

      // Extract and process tags
      const processedTags = await this.processAssetTags(metadata.tags);
      metadata.tags = processedTags;

      // Generate automatic tags using AI/ML
      const autoTags = await this.generateAutomaticTags(metadata);
      metadata.tags = [...new Set([...metadata.tags, ...autoTags])];

      // Extract technical metadata
      const technicalMetadata = await this.extractTechnicalMetadata(metadata);
      metadata.metadata = { ...metadata.metadata, ...technicalMetadata };

      // Process Bangladesh cultural metadata
      if (metadata.metadata?.bangladesh) {
        metadata.metadata.bangladesh = await this.processBangladeshMetadata(metadata.metadata.bangladesh);
      }

      // Store metadata
      this.assetMetadata.set(metadata.id, metadata);

      // Create version record
      await this.createVersionRecord(metadata);

      // Update search index
      await this.updateSearchIndex(metadata);

      // Track metadata changes for analytics
      await this.trackMetadataChange('create', metadata);

      return metadata;

    } catch (error) {
      console.error('Metadata save error:', error);
      throw new Error(`Failed to save asset metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset metadata by ID with version history
   */
  public async getAssetMetadata(assetId: string, includeVersions = false): Promise<AssetMetadata | null> {
    try {
      const metadata = this.assetMetadata.get(assetId);
      if (!metadata) {
        return null;
      }

      // Include version history if requested
      if (includeVersions) {
        const versions = this.assetVersions.get(assetId) || [];
        (metadata as any).versions = versions;
      }

      // Include related assets
      const relations = this.assetRelations.get(assetId) || [];
      (metadata as any).relations = relations;

      return metadata;

    } catch (error) {
      console.error('Metadata retrieval error:', error);
      throw new Error(`Failed to get asset metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update asset metadata with change tracking
   */
  public async updateAssetMetadata(assetId: string, updates: Partial<AssetMetadata>): Promise<AssetMetadata> {
    try {
      const existingMetadata = this.assetMetadata.get(assetId);
      if (!existingMetadata) {
        throw new Error('Asset metadata not found');
      }

      // Create version record before updating
      await this.createVersionRecord(existingMetadata);

      // Apply updates
      const updatedMetadata: AssetMetadata = {
        ...existingMetadata,
        ...updates,
        id: assetId, // Ensure ID doesn't change
        updatedAt: new Date()
      };

      // Process updated tags
      if (updates.tags) {
        updatedMetadata.tags = await this.processAssetTags(updates.tags);
      }

      // Validate updated metadata
      await this.validateAssetMetadata(updatedMetadata);

      // Store updated metadata
      this.assetMetadata.set(assetId, updatedMetadata);

      // Update search index
      await this.updateSearchIndex(updatedMetadata);

      // Track metadata changes for analytics
      await this.trackMetadataChange('update', updatedMetadata, Object.keys(updates));

      return updatedMetadata;

    } catch (error) {
      console.error('Metadata update error:', error);
      throw new Error(`Failed to update asset metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete asset metadata with cleanup
   */
  public async deleteAssetMetadata(assetId: string): Promise<void> {
    try {
      const metadata = this.assetMetadata.get(assetId);
      if (!metadata) {
        throw new Error('Asset metadata not found');
      }

      // Create final version record
      await this.createVersionRecord(metadata, 'Asset deleted');

      // Remove from main storage
      this.assetMetadata.delete(assetId);

      // Clean up search index
      await this.removeFromSearchIndex(assetId);

      // Update tag usage counts
      await this.updateTagUsageCounts(metadata.tags, -1);

      // Track deletion
      await this.trackMetadataChange('delete', metadata);

    } catch (error) {
      console.error('Metadata deletion error:', error);
      throw new Error(`Failed to delete asset metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search assets with advanced filtering and faceting
   */
  public async getAssetsByCategory(
    filters: AssetSearchFilters, 
    pagination: SearchPagination
  ): Promise<SearchResult> {
    try {
      let results = Array.from(this.assetMetadata.values());

      // Apply filters
      results = await this.applySearchFilters(results, filters);

      // Calculate total before pagination
      const total = results.length;

      // Calculate facets
      const facets = await this.calculateFacets(results);

      // Apply sorting
      results = await this.applySorting(results, pagination.sortBy, pagination.sortOrder);

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      results = results.slice(startIndex, endIndex);

      return {
        assets: results,
        total,
        facets
      };

    } catch (error) {
      console.error('Asset search error:', error);
      throw new Error(`Failed to search assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get asset version history
   */
  public async getAssetVersionHistory(assetId: string): Promise<AssetVersion[]> {
    try {
      const versions = this.assetVersions.get(assetId) || [];
      return versions.sort((a, b) => b.version - a.version);

    } catch (error) {
      console.error('Version history error:', error);
      throw new Error(`Failed to get version history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create asset relation (derivative, replacement, etc.)
   */
  public async createAssetRelation(relation: Omit<AssetRelation, 'id' | 'createdAt'>): Promise<AssetRelation> {
    try {
      const newRelation: AssetRelation = {
        ...relation,
        id: this.generateId(),
        createdAt: new Date()
      };

      // Validate that both assets exist
      if (!this.assetMetadata.has(relation.sourceAssetId) || !this.assetMetadata.has(relation.targetAssetId)) {
        throw new Error('Source or target asset does not exist');
      }

      // Store relation
      if (!this.assetRelations.has(relation.sourceAssetId)) {
        this.assetRelations.set(relation.sourceAssetId, []);
      }
      this.assetRelations.get(relation.sourceAssetId)!.push(newRelation);

      return newRelation;

    } catch (error) {
      console.error('Asset relation creation error:', error);
      throw new Error(`Failed to create asset relation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all available tags with usage statistics
   */
  public async getAllTags(): Promise<AssetTag[]> {
    try {
      return Array.from(this.assetTags.values()).sort((a, b) => b.usageCount - a.usageCount);

    } catch (error) {
      console.error('Tags retrieval error:', error);
      throw new Error(`Failed to get tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get metadata statistics and insights
   */
  public async getMetadataStatistics(): Promise<{
    totalAssets: number;
    assetsByCategory: Record<string, number>;
    assetsByStatus: Record<string, number>;
    tagUsage: Array<{ tag: string; count: number }>;
    bangladeshInsights: {
      regionalDistribution: Record<string, number>;
      culturalContent: Record<string, number>;
      languageDistribution: Record<string, number>;
    };
    sizeDistribution: {
      small: number; // < 1MB
      medium: number; // 1MB - 10MB
      large: number; // 10MB - 100MB
      xlarge: number; // > 100MB
    };
  }> {
    try {
      const allAssets = Array.from(this.assetMetadata.values());
      const totalAssets = allAssets.length;

      // Category distribution
      const assetsByCategory: Record<string, number> = {};
      allAssets.forEach(asset => {
        assetsByCategory[asset.category] = (assetsByCategory[asset.category] || 0) + 1;
      });

      // Status distribution
      const assetsByStatus: Record<string, number> = {};
      allAssets.forEach(asset => {
        assetsByStatus[asset.status] = (assetsByStatus[asset.status] || 0) + 1;
      });

      // Tag usage
      const tagUsage = Array.from(this.assetTags.values())
        .map(tag => ({ tag: tag.name, count: tag.usageCount }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      // Bangladesh insights
      const bangladeshAssets = allAssets.filter(asset => asset.metadata?.bangladesh);
      const regionalDistribution: Record<string, number> = {};
      const culturalContent: Record<string, number> = {};
      const languageDistribution: Record<string, number> = {};

      bangladeshAssets.forEach(asset => {
        const bangladesh = asset.metadata?.bangladesh;
        if (bangladesh?.region) {
          regionalDistribution[bangladesh.region] = (regionalDistribution[bangladesh.region] || 0) + 1;
        }
        if (bangladesh?.culturalContext) {
          culturalContent[bangladesh.culturalContext] = (culturalContent[bangladesh.culturalContext] || 0) + 1;
        }
        if (bangladesh?.language) {
          languageDistribution[bangladesh.language] = (languageDistribution[bangladesh.language] || 0) + 1;
        }
      });

      // Size distribution
      const sizeDistribution = {
        small: allAssets.filter(asset => asset.fileSize < 1024 * 1024).length,
        medium: allAssets.filter(asset => asset.fileSize >= 1024 * 1024 && asset.fileSize < 10 * 1024 * 1024).length,
        large: allAssets.filter(asset => asset.fileSize >= 10 * 1024 * 1024 && asset.fileSize < 100 * 1024 * 1024).length,
        xlarge: allAssets.filter(asset => asset.fileSize >= 100 * 1024 * 1024).length
      };

      return {
        totalAssets,
        assetsByCategory,
        assetsByStatus,
        tagUsage,
        bangladeshInsights: {
          regionalDistribution,
          culturalContent,
          languageDistribution
        },
        sizeDistribution
      };

    } catch (error) {
      console.error('Statistics calculation error:', error);
      throw new Error(`Failed to calculate statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private implementation methods

  private initializeMetadataService(): void {
    // Initialize default tags
    this.initializeDefaultTags();
    console.log('Asset Metadata Service initialized');
  }

  private initializeDefaultTags(): void {
    const defaultTags: Omit<AssetTag, 'id' | 'usageCount' | 'createdAt'>[] = [
      { name: 'product-image', category: 'business', color: '#3498db', description: 'Product catalog images' },
      { name: 'banner', category: 'business', color: '#e74c3c', description: 'Marketing banners and promotional images' },
      { name: 'logo', category: 'business', color: '#9b59b6', description: 'Brand logos and identity assets' },
      { name: 'icon', category: 'technical', color: '#f39c12', description: 'UI icons and symbols' },
      { name: 'high-quality', category: 'technical', color: '#27ae60', description: 'High resolution assets' },
      { name: 'optimized', category: 'technical', color: '#16a085', description: 'Size-optimized assets' },
      { name: 'eid', category: 'cultural', color: '#00b894', description: 'Eid festival content' },
      { name: 'pohela-boishakh', category: 'cultural', color: '#e17055', description: 'Bengali New Year content' },
      { name: 'victory-day', category: 'cultural', color: '#00b894', description: 'Victory Day celebration content' },
      { name: 'independence-day', category: 'cultural', color: '#fd79a8', description: 'Independence Day content' },
      { name: 'mobile-optimized', category: 'technical', color: '#6c5ce7', description: 'Mobile device optimized' },
      { name: 'bangladesh', category: 'cultural', color: '#00b894', description: 'Bangladesh-specific content' }
    ];

    defaultTags.forEach(tagData => {
      const tag: AssetTag = {
        ...tagData,
        id: this.generateId(),
        usageCount: 0,
        createdAt: new Date()
      };
      this.assetTags.set(tag.id, tag);
    });
  }

  private async validateAssetMetadata(metadata: AssetMetadata): Promise<void> {
    // Validate required fields
    if (!metadata.id || !metadata.originalName || !metadata.fileName || !metadata.mimeType) {
      throw new Error('Missing required metadata fields');
    }

    // Validate file size
    if (metadata.fileSize < 0) {
      throw new Error('Invalid file size');
    }

    // Validate category
    const validCategories: AssetCategory[] = [
      'product-images', 'marketing-banners', 'brand-assets', 'cultural-content',
      'payment-icons', 'shipping-logos', 'documents', 'videos', 'audio'
    ];
    if (!validCategories.includes(metadata.category)) {
      throw new Error(`Invalid category: ${metadata.category}`);
    }

    // Validate status
    const validStatuses: AssetStatus[] = ['uploading', 'processing', 'active', 'archived', 'deleted'];
    if (!validStatuses.includes(metadata.status)) {
      throw new Error(`Invalid status: ${metadata.status}`);
    }
  }

  private async processAssetTags(tags: string[]): Promise<string[]> {
    const processedTags: string[] = [];

    for (const tagName of tags) {
      // Clean and normalize tag name
      const cleanTag = tagName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      // Find or create tag
      let existingTag = Array.from(this.assetTags.values()).find(t => t.name === cleanTag);
      if (!existingTag) {
        existingTag = {
          id: this.generateId(),
          name: cleanTag,
          category: 'general',
          usageCount: 0,
          createdAt: new Date()
        };
        this.assetTags.set(existingTag.id, existingTag);
      }

      // Increment usage count
      existingTag.usageCount++;
      processedTags.push(cleanTag);
    }

    return processedTags;
  }

  private async generateAutomaticTags(metadata: AssetMetadata): Promise<string[]> {
    const autoTags: string[] = [];

    // Generate tags based on file type
    if (metadata.mimeType.startsWith('image/')) {
      autoTags.push('image');
      
      // Size-based tags
      if (metadata.fileSize > 10 * 1024 * 1024) {
        autoTags.push('large-file');
      } else if (metadata.fileSize < 100 * 1024) {
        autoTags.push('small-file');
      }

      // Dimension-based tags
      if (metadata.width && metadata.height) {
        if (metadata.width > 2000 || metadata.height > 2000) {
          autoTags.push('high-resolution');
        }
        
        const aspectRatio = metadata.width / metadata.height;
        if (Math.abs(aspectRatio - 1) < 0.1) {
          autoTags.push('square');
        } else if (aspectRatio > 1.5) {
          autoTags.push('landscape');
        } else if (aspectRatio < 0.7) {
          autoTags.push('portrait');
        }
      }
    } else if (metadata.mimeType.startsWith('video/')) {
      autoTags.push('video');
    } else if (metadata.mimeType.startsWith('audio/')) {
      autoTags.push('audio');
    }

    // Category-based tags
    autoTags.push(metadata.category);

    // Bangladesh-specific auto-tags
    if (metadata.metadata?.bangladesh) {
      autoTags.push('bangladesh');
      if (metadata.metadata.bangladesh.region) {
        autoTags.push(`region-${metadata.metadata.bangladesh.region}`);
      }
      if (metadata.metadata.bangladesh.culturalContext) {
        autoTags.push(metadata.metadata.bangladesh.culturalContext);
      }
    }

    return autoTags;
  }

  private async extractTechnicalMetadata(metadata: AssetMetadata): Promise<Record<string, any>> {
    const technicalMetadata: Record<string, any> = {};

    // Extract format-specific metadata
    if (metadata.mimeType.startsWith('image/')) {
      technicalMetadata.format = metadata.mimeType.split('/')[1];
      technicalMetadata.hasTransparency = metadata.mimeType === 'image/png' || metadata.mimeType === 'image/gif';
      
      if (metadata.width && metadata.height) {
        technicalMetadata.aspectRatio = Math.round((metadata.width / metadata.height) * 100) / 100;
        technicalMetadata.megapixels = Math.round((metadata.width * metadata.height) / 1000000 * 100) / 100;
      }
    }

    // Calculate compression ratio if optimized
    if (metadata.metadata?.optimization) {
      technicalMetadata.compressionApplied = true;
      technicalMetadata.quality = metadata.metadata.optimization.quality || 85;
    }

    // Add upload metadata
    technicalMetadata.uploadTimestamp = metadata.createdAt.toISOString();
    technicalMetadata.version = metadata.version;

    return technicalMetadata;
  }

  private async processBangladeshMetadata(bangladeshData: any): Promise<Record<string, any>> {
    const processed = { ...bangladeshData };

    // Validate and normalize region
    const validRegions = ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal', 'rangpur', 'mymensingh'];
    if (processed.region && !validRegions.includes(processed.region)) {
      processed.region = 'dhaka'; // Default
    }

    // Validate cultural context
    const validContexts = ['eid', 'pohela-boishakh', 'victory-day', 'independence-day', 'durga-puja'];
    if (processed.culturalContext && !validContexts.includes(processed.culturalContext)) {
      delete processed.culturalContext;
    }

    // Validate language
    const validLanguages = ['bengali', 'english', 'both'];
    if (processed.language && !validLanguages.includes(processed.language)) {
      processed.language = 'both'; // Default
    }

    return processed;
  }

  private async createVersionRecord(metadata: AssetMetadata, changeDescription?: string): Promise<void> {
    const version: AssetVersion = {
      id: this.generateId(),
      assetId: metadata.id,
      version: metadata.version,
      fileName: metadata.fileName,
      filePath: metadata.filePath,
      cdnUrl: metadata.cdnUrl,
      fileSize: metadata.fileSize,
      metadata: { ...metadata.metadata },
      changeDescription,
      createdBy: metadata.createdBy,
      createdAt: new Date()
    };

    if (!this.assetVersions.has(metadata.id)) {
      this.assetVersions.set(metadata.id, []);
    }
    this.assetVersions.get(metadata.id)!.push(version);

    // Keep only last 10 versions per asset
    const versions = this.assetVersions.get(metadata.id)!;
    if (versions.length > 10) {
      this.assetVersions.set(metadata.id, versions.slice(-10));
    }
  }

  private buildSearchIndex(): void {
    // Build search index for fast text search
    this.assetMetadata.forEach((metadata, assetId) => {
      const searchTerms = this.extractSearchTerms(metadata);
      this.searchIndex.set(assetId, searchTerms);
    });
  }

  private async updateSearchIndex(metadata: AssetMetadata): Promise<void> {
    const searchTerms = this.extractSearchTerms(metadata);
    this.searchIndex.set(metadata.id, searchTerms);
  }

  private async removeFromSearchIndex(assetId: string): Promise<void> {
    this.searchIndex.delete(assetId);
  }

  private extractSearchTerms(metadata: AssetMetadata): string[] {
    const terms: string[] = [];
    
    // Add basic metadata
    terms.push(metadata.originalName.toLowerCase());
    terms.push(metadata.fileName.toLowerCase());
    terms.push(metadata.category);
    if (metadata.subcategory) {
      terms.push(metadata.subcategory.toLowerCase());
    }
    
    // Add tags
    terms.push(...metadata.tags);
    
    // Add Bangladesh-specific terms
    if (metadata.metadata?.bangladesh) {
      if (metadata.metadata.bangladesh.region) {
        terms.push(metadata.metadata.bangladesh.region);
      }
      if (metadata.metadata.bangladesh.culturalContext) {
        terms.push(metadata.metadata.bangladesh.culturalContext);
      }
    }

    return terms;
  }

  private async applySearchFilters(assets: AssetMetadata[], filters: AssetSearchFilters): Promise<AssetMetadata[]> {
    let filtered = [...assets];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(asset => asset.category === filters.category);
    }

    // Subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter(asset => asset.subcategory === filters.subcategory);
    }

    // Tags filter (AND logic)
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(asset => 
        filters.tags!.every(tag => asset.tags.includes(tag))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(asset => asset.status === filters.status);
    }

    // Creator filter
    if (filters.createdBy) {
      filtered = filtered.filter(asset => asset.createdBy === filters.createdBy);
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(asset => 
        asset.createdAt >= filters.dateRange!.from && 
        asset.createdAt <= filters.dateRange!.to
      );
    }

    // Size filter
    if (filters.size) {
      filtered = filtered.filter(asset => {
        if (filters.size!.min && asset.fileSize < filters.size!.min) return false;
        if (filters.size!.max && asset.fileSize > filters.size!.max) return false;
        return true;
      });
    }

    // Dimensions filter
    if (filters.dimensions && (filters.dimensions.minWidth || filters.dimensions.maxWidth || filters.dimensions.minHeight || filters.dimensions.maxHeight)) {
      filtered = filtered.filter(asset => {
        if (!asset.width || !asset.height) return false;
        if (filters.dimensions!.minWidth && asset.width < filters.dimensions!.minWidth) return false;
        if (filters.dimensions!.maxWidth && asset.width > filters.dimensions!.maxWidth) return false;
        if (filters.dimensions!.minHeight && asset.height < filters.dimensions!.minHeight) return false;
        if (filters.dimensions!.maxHeight && asset.height > filters.dimensions!.maxHeight) return false;
        return true;
      });
    }

    // Bangladesh filters
    if (filters.bangladesh) {
      filtered = filtered.filter(asset => {
        const bangladesh = asset.metadata?.bangladesh;
        if (!bangladesh) return false;
        
        if (filters.bangladesh!.region && bangladesh.region !== filters.bangladesh!.region) return false;
        if (filters.bangladesh!.culturalContext && bangladesh.culturalContext !== filters.bangladesh!.culturalContext) return false;
        if (filters.bangladesh!.language && bangladesh.language !== filters.bangladesh!.language) return false;
        
        return true;
      });
    }

    // Text search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(asset => {
        const searchTerms = this.searchIndex.get(asset.id) || [];
        return searchTerms.some(term => term.includes(searchLower));
      });
    }

    return filtered;
  }

  private async applySorting(assets: AssetMetadata[], sortBy: string, sortOrder: 'asc' | 'desc'): Promise<AssetMetadata[]> {
    const sorted = [...assets];
    
    sorted.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'createdAt':
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
          break;
        case 'updatedAt':
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
          break;
        case 'fileSize':
          valueA = a.fileSize;
          valueB = b.fileSize;
          break;
        case 'originalName':
          valueA = a.originalName.toLowerCase();
          valueB = b.originalName.toLowerCase();
          break;
        default:
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
      }
      
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  private async calculateFacets(assets: AssetMetadata[]): Promise<SearchResult['facets']> {
    const facets = {
      categories: {} as Record<string, number>,
      tags: {} as Record<string, number>,
      creators: {} as Record<string, number>,
      bangladeshRegions: {} as Record<string, number>
    };

    assets.forEach(asset => {
      // Categories
      facets.categories[asset.category] = (facets.categories[asset.category] || 0) + 1;

      // Tags
      asset.tags.forEach(tag => {
        facets.tags[tag] = (facets.tags[tag] || 0) + 1;
      });

      // Creators
      facets.creators[asset.createdBy] = (facets.creators[asset.createdBy] || 0) + 1;

      // Bangladesh regions
      if (asset.metadata?.bangladesh?.region) {
        const region = asset.metadata.bangladesh.region;
        facets.bangladeshRegions[region] = (facets.bangladeshRegions[region] || 0) + 1;
      }
    });

    return facets;
  }

  private async updateTagUsageCounts(tags: string[], delta: number): Promise<void> {
    tags.forEach(tagName => {
      const tag = Array.from(this.assetTags.values()).find(t => t.name === tagName);
      if (tag) {
        tag.usageCount = Math.max(0, tag.usageCount + delta);
      }
    });
  }

  private async trackMetadataChange(action: 'create' | 'update' | 'delete', metadata: AssetMetadata, changes?: string[]): Promise<void> {
    // Track metadata changes for analytics and audit
    // In production, this would integrate with the analytics service
    console.log(`Metadata ${action} for asset ${metadata.id}`, changes ? { changes } : {});
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}