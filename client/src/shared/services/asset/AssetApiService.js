import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Asset Management Service API Integration
 * Amazon.com/Shopee.sg-level digital asset management functionality with complete backend synchronization
 */
export class AssetApiService {
  constructor() {
    this.baseUrl = '/api/v1/assets';
  }

  // ================================
  // ASSET MANAGEMENT
  // ================================

  /**
   * Get all assets
   */
  async getAssets(filters = {}) {
    const params = new URLSearchParams({
      type: filters.type || '', // 'image', 'video', 'audio', 'document', 'icon'
      category: filters.category || '',
      tags: filters.tags || '',
      search: filters.search || '',
      mimeType: filters.mimeType || '',
      sizeRange: filters.sizeRange || '',
      uploadedBy: filters.uploadedBy || '',
      sortBy: filters.sortBy || 'upload_date',
      sortOrder: filters.sortOrder || 'desc',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}?${params}`);
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId) {
    return await apiRequest(`${this.baseUrl}/${assetId}`);
  }

  /**
   * Upload asset
   */
  async uploadAsset(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return await apiRequest(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove content-type to let browser set it with boundary
    });
  }

  /**
   * Upload multiple assets
   */
  async uploadMultipleAssets(files, metadata = {}) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    formData.append('metadata', JSON.stringify(metadata));

    return await apiRequest(`${this.baseUrl}/upload-multiple`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }

  /**
   * Update asset metadata
   */
  async updateAssetMetadata(assetId, metadata) {
    return await apiRequest(`${this.baseUrl}/${assetId}/metadata`, {
      method: 'PUT',
      body: JSON.stringify(metadata)
    });
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId) {
    return await apiRequest(`${this.baseUrl}/${assetId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Bulk delete assets
   */
  async bulkDeleteAssets(assetIds) {
    return await apiRequest(`${this.baseUrl}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ assetIds })
    });
  }

  // ================================
  // IMAGE PROCESSING
  // ================================

  /**
   * Resize image
   */
  async resizeImage(assetId, dimensions) {
    return await apiRequest(`${this.baseUrl}/${assetId}/resize`, {
      method: 'POST',
      body: JSON.stringify(dimensions)
    });
  }

  /**
   * Crop image
   */
  async cropImage(assetId, cropData) {
    return await apiRequest(`${this.baseUrl}/${assetId}/crop`, {
      method: 'POST',
      body: JSON.stringify(cropData)
    });
  }

  /**
   * Generate thumbnails
   */
  async generateThumbnails(assetId, sizes = ['small', 'medium', 'large']) {
    return await apiRequest(`${this.baseUrl}/${assetId}/thumbnails`, {
      method: 'POST',
      body: JSON.stringify({ sizes })
    });
  }

  /**
   * Optimize image
   */
  async optimizeImage(assetId, optimizationSettings = {}) {
    return await apiRequest(`${this.baseUrl}/${assetId}/optimize`, {
      method: 'POST',
      body: JSON.stringify(optimizationSettings)
    });
  }

  /**
   * Convert image format
   */
  async convertImageFormat(assetId, targetFormat) {
    return await apiRequest(`${this.baseUrl}/${assetId}/convert`, {
      method: 'POST',
      body: JSON.stringify({ targetFormat })
    });
  }

  /**
   * Apply image filters
   */
  async applyImageFilters(assetId, filters) {
    return await apiRequest(`${this.baseUrl}/${assetId}/filters`, {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
  }

  // ================================
  // VIDEO PROCESSING
  // ================================

  /**
   * Generate video thumbnail
   */
  async generateVideoThumbnail(assetId, timestamp = 0) {
    return await apiRequest(`${this.baseUrl}/${assetId}/video-thumbnail`, {
      method: 'POST',
      body: JSON.stringify({ timestamp })
    });
  }

  /**
   * Compress video
   */
  async compressVideo(assetId, compressionSettings) {
    return await apiRequest(`${this.baseUrl}/${assetId}/compress`, {
      method: 'POST',
      body: JSON.stringify(compressionSettings)
    });
  }

  /**
   * Convert video format
   */
  async convertVideoFormat(assetId, targetFormat) {
    return await apiRequest(`${this.baseUrl}/${assetId}/convert-video`, {
      method: 'POST',
      body: JSON.stringify({ targetFormat })
    });
  }

  /**
   * Extract video frames
   */
  async extractVideoFrames(assetId, frameConfig) {
    return await apiRequest(`${this.baseUrl}/${assetId}/extract-frames`, {
      method: 'POST',
      body: JSON.stringify(frameConfig)
    });
  }

  // ================================
  // CDN MANAGEMENT
  // ================================

  /**
   * Get CDN URL for asset
   */
  async getCDNUrl(assetId, variant = 'original') {
    const params = new URLSearchParams({
      variant
    });

    return await apiRequest(`${this.baseUrl}/${assetId}/cdn-url?${params}`);
  }

  /**
   * Purge asset from CDN
   */
  async purgeFromCDN(assetId) {
    return await apiRequest(`${this.baseUrl}/${assetId}/purge-cdn`, {
      method: 'POST'
    });
  }

  /**
   * Get CDN analytics
   */
  async getCDNAnalytics(assetId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/${assetId}/cdn-analytics?${params}`);
  }

  /**
   * Configure CDN settings
   */
  async configureCDNSettings(assetId, settings) {
    return await apiRequest(`${this.baseUrl}/${assetId}/cdn-settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // ================================
  // ASSET COLLECTIONS
  // ================================

  /**
   * Get asset collections
   */
  async getCollections(filters = {}) {
    const params = new URLSearchParams({
      type: filters.type || '',
      owner: filters.owner || '',
      isPublic: filters.isPublic || '',
      sortBy: filters.sortBy || 'created_at'
    });

    return await apiRequest(`${this.baseUrl}/collections?${params}`);
  }

  /**
   * Create asset collection
   */
  async createCollection(collectionData) {
    return await apiRequest(`${this.baseUrl}/collections`, {
      method: 'POST',
      body: JSON.stringify(collectionData)
    });
  }

  /**
   * Get collection assets
   */
  async getCollectionAssets(collectionId, filters = {}) {
    const params = new URLSearchParams({
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/collections/${collectionId}/assets?${params}`);
  }

  /**
   * Add assets to collection
   */
  async addAssetsToCollection(collectionId, assetIds) {
    return await apiRequest(`${this.baseUrl}/collections/${collectionId}/assets`, {
      method: 'POST',
      body: JSON.stringify({ assetIds })
    });
  }

  /**
   * Remove assets from collection
   */
  async removeAssetsFromCollection(collectionId, assetIds) {
    return await apiRequest(`${this.baseUrl}/collections/${collectionId}/assets`, {
      method: 'DELETE',
      body: JSON.stringify({ assetIds })
    });
  }

  /**
   * Update collection
   */
  async updateCollection(collectionId, updateData) {
    return await apiRequest(`${this.baseUrl}/collections/${collectionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionId) {
    return await apiRequest(`${this.baseUrl}/collections/${collectionId}`, {
      method: 'DELETE'
    });
  }

  // ================================
  // SEARCH & TAGGING
  // ================================

  /**
   * Search assets
   */
  async searchAssets(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      type: filters.type || '',
      tags: filters.tags || '',
      category: filters.category || '',
      sortBy: filters.sortBy || 'relevance',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/search?${params}`);
  }

  /**
   * Get asset tags
   */
  async getAssetTags(assetId) {
    return await apiRequest(`${this.baseUrl}/${assetId}/tags`);
  }

  /**
   * Add tags to asset
   */
  async addTagsToAsset(assetId, tags) {
    return await apiRequest(`${this.baseUrl}/${assetId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags })
    });
  }

  /**
   * Remove tags from asset
   */
  async removeTagsFromAsset(assetId, tags) {
    return await apiRequest(`${this.baseUrl}/${assetId}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tags })
    });
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit = 50) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/tags/popular?${params}`);
  }

  /**
   * Get tag suggestions
   */
  async getTagSuggestions(query, limit = 10) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/tags/suggestions?${params}`);
  }

  // ================================
  // BANGLADESH-SPECIFIC ASSETS
  // ================================

  /**
   * Get Bangladesh cultural assets
   */
  async getBangladeshCulturalAssets(category = '') {
    const params = new URLSearchParams({
      category, // 'festival', 'cultural', 'national', 'religious'
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/cultural?${params}`);
  }

  /**
   * Get payment method icons
   */
  async getPaymentMethodIcons() {
    return await apiRequest(`${this.baseUrl}/bangladesh/payment-icons`);
  }

  /**
   * Get shipping partner logos
   */
  async getShippingPartnerLogos() {
    return await apiRequest(`${this.baseUrl}/bangladesh/shipping-logos`);
  }

  /**
   * Get Bangladesh flag variants
   */
  async getBangladeshFlagVariants() {
    return await apiRequest(`${this.baseUrl}/bangladesh/flag-variants`);
  }

  /**
   * Upload Bangladesh-specific asset
   */
  async uploadBangladeshAsset(file, culturalMetadata) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({ 
      ...culturalMetadata, 
      country: 'BD',
      cultural: true 
    }));

    return await apiRequest(`${this.baseUrl}/bangladesh/upload`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }

  // ================================
  // ASSET ANALYTICS
  // ================================

  /**
   * Get asset usage analytics
   */
  async getAssetUsageAnalytics(assetId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/${assetId}/usage-analytics?${params}`);
  }

  /**
   * Get storage analytics
   */
  async getStorageAnalytics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/storage?${params}`);
  }

  /**
   * Get popular assets
   */
  async getPopularAssets(period = '7d', limit = 20) {
    const params = new URLSearchParams({
      period,
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/analytics/popular?${params}`);
  }

  /**
   * Get asset performance metrics
   */
  async getAssetPerformanceMetrics(assetId) {
    return await apiRequest(`${this.baseUrl}/${assetId}/performance-metrics`);
  }

  // ================================
  // ACCESS CONTROL
  // ================================

  /**
   * Set asset permissions
   */
  async setAssetPermissions(assetId, permissions) {
    return await apiRequest(`${this.baseUrl}/${assetId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissions)
    });
  }

  /**
   * Get asset permissions
   */
  async getAssetPermissions(assetId) {
    return await apiRequest(`${this.baseUrl}/${assetId}/permissions`);
  }

  /**
   * Share asset
   */
  async shareAsset(assetId, shareData) {
    return await apiRequest(`${this.baseUrl}/${assetId}/share`, {
      method: 'POST',
      body: JSON.stringify(shareData)
    });
  }

  /**
   * Generate download link
   */
  async generateDownloadLink(assetId, expiresIn = '24h') {
    return await apiRequest(`${this.baseUrl}/${assetId}/download-link`, {
      method: 'POST',
      body: JSON.stringify({ expiresIn })
    });
  }

  // ================================
  // BACKUP & VERSIONING
  // ================================

  /**
   * Create asset version
   */
  async createAssetVersion(assetId, file, versionNotes = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('versionNotes', versionNotes);

    return await apiRequest(`${this.baseUrl}/${assetId}/versions`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }

  /**
   * Get asset versions
   */
  async getAssetVersions(assetId) {
    return await apiRequest(`${this.baseUrl}/${assetId}/versions`);
  }

  /**
   * Restore asset version
   */
  async restoreAssetVersion(assetId, versionId) {
    return await apiRequest(`${this.baseUrl}/${assetId}/versions/${versionId}/restore`, {
      method: 'POST'
    });
  }

  /**
   * Delete asset version
   */
  async deleteAssetVersion(assetId, versionId) {
    return await apiRequest(`${this.baseUrl}/${assetId}/versions/${versionId}`, {
      method: 'DELETE'
    });
  }

  // ================================
  // EXPORT & BACKUP
  // ================================

  /**
   * Export assets
   */
  async exportAssets(exportConfig) {
    return await apiRequest(`${this.baseUrl}/export`, {
      method: 'POST',
      body: JSON.stringify(exportConfig),
      responseType: 'blob'
    });
  }

  /**
   * Create backup
   */
  async createBackup(backupConfig) {
    return await apiRequest(`${this.baseUrl}/backup/create`, {
      method: 'POST',
      body: JSON.stringify(backupConfig)
    });
  }

  /**
   * Get backup history
   */
  async getBackupHistory(limit = 20) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/backup/history?${params}`);
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId) {
    return await apiRequest(`${this.baseUrl}/backup/${backupId}/restore`, {
      method: 'POST'
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get file type icon
   */
  getFileTypeIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📋';
    return '📁';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get asset category color
   */
  getCategoryColor(category) {
    const colors = {
      'product': '#3B82F6',
      'marketing': '#10B981',
      'brand': '#8B5CF6',
      'cultural': '#F59E0B',
      'icon': '#EF4444',
      'banner': '#06B6D4'
    };
    return colors[category.toLowerCase()] || '#6B7280';
  }

  /**
   * Validate file type
   */
  validateFileType(file, allowedTypes = []) {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.some(type => file.type.includes(type));
  }

  /**
   * Validate file size
   */
  validateFileSize(file, maxSizeInMB = 10) {
    return file.size <= maxSizeInMB * 1024 * 1024;
  }

  /**
   * Handle API errors with proper asset context
   */
  handleError(error, operation) {
    console.error(`Asset API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected asset error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Asset authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this asset operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested asset was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Asset conflict. Please refresh and try again.';
    } else if (error.status === 413) {
      errorResponse.error = 'File too large. Please reduce file size and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid asset data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many asset requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Asset server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const assetApiService = new AssetApiService();