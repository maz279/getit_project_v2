import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Content Management Service API Integration
 * Amazon.com/Shopee.sg-level content management functionality with complete backend synchronization
 */
export class ContentApiService {
  constructor() {
    this.baseUrl = '/api/v1/content';
  }

  // ================================
  // CONTENT MANAGEMENT
  // ================================

  /**
   * Get all content items
   */
  async getAllContent(filters = {}) {
    const params = new URLSearchParams({
      type: filters.type || '', // 'page', 'blog', 'product', 'category', 'media'
      status: filters.status || '', // 'draft', 'published', 'archived'
      category: filters.category || '',
      language: filters.language || '',
      search: filters.search || '',
      sortBy: filters.sortBy || 'updated_at',
      sortOrder: filters.sortOrder || 'desc',
      page: filters.page || '1',
      limit: filters.limit || '20',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}?${params}`);
  }

  /**
   * Get content item by ID
   */
  async getContent(contentId) {
    return await apiRequest(`${this.baseUrl}/${contentId}`);
  }

  /**
   * Create new content
   */
  async createContent(contentData) {
    return await apiRequest(`${this.baseUrl}`, {
      method: 'POST',
      body: JSON.stringify(contentData)
    });
  }

  /**
   * Update existing content
   */
  async updateContent(contentId, updateData) {
    return await apiRequest(`${this.baseUrl}/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Delete content
   */
  async deleteContent(contentId) {
    return await apiRequest(`${this.baseUrl}/${contentId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Publish content
   */
  async publishContent(contentId, publishSettings = {}) {
    return await apiRequest(`${this.baseUrl}/${contentId}/publish`, {
      method: 'POST',
      body: JSON.stringify(publishSettings)
    });
  }

  /**
   * Unpublish content
   */
  async unpublishContent(contentId, reason = '') {
    return await apiRequest(`${this.baseUrl}/${contentId}/unpublish`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // ================================
  // MEDIA MANAGEMENT
  // ================================

  /**
   * Upload media file
   */
  async uploadMedia(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return await apiRequest(`${this.baseUrl}/media/upload`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove content-type to let browser set it with boundary
    });
  }

  /**
   * Get media library
   */
  async getMediaLibrary(filters = {}) {
    const params = new URLSearchParams({
      type: filters.type || '', // 'image', 'video', 'audio', 'document'
      category: filters.category || '',
      search: filters.search || '',
      sortBy: filters.sortBy || 'upload_date',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/media?${params}`);
  }

  /**
   * Get media item details
   */
  async getMediaItem(mediaId) {
    return await apiRequest(`${this.baseUrl}/media/${mediaId}`);
  }

  /**
   * Update media metadata
   */
  async updateMediaMetadata(mediaId, metadata) {
    return await apiRequest(`${this.baseUrl}/media/${mediaId}/metadata`, {
      method: 'PUT',
      body: JSON.stringify(metadata)
    });
  }

  /**
   * Delete media item
   */
  async deleteMediaItem(mediaId) {
    return await apiRequest(`${this.baseUrl}/media/${mediaId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Optimize media for web
   */
  async optimizeMedia(mediaId, optimizationSettings) {
    return await apiRequest(`${this.baseUrl}/media/${mediaId}/optimize`, {
      method: 'POST',
      body: JSON.stringify(optimizationSettings)
    });
  }

  /**
   * Generate media thumbnails
   */
  async generateThumbnails(mediaId, sizes = ['small', 'medium', 'large']) {
    return await apiRequest(`${this.baseUrl}/media/${mediaId}/thumbnails`, {
      method: 'POST',
      body: JSON.stringify({ sizes })
    });
  }

  // ================================
  // TEMPLATE MANAGEMENT
  // ================================

  /**
   * Get content templates
   */
  async getTemplates(type = '') {
    const params = new URLSearchParams({
      type // 'email', 'page', 'product', 'category'
    });

    return await apiRequest(`${this.baseUrl}/templates?${params}`);
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId) {
    return await apiRequest(`${this.baseUrl}/templates/${templateId}`);
  }

  /**
   * Create new template
   */
  async createTemplate(templateData) {
    return await apiRequest(`${this.baseUrl}/templates`, {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, updateData) {
    return await apiRequest(`${this.baseUrl}/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId) {
    return await apiRequest(`${this.baseUrl}/templates/${templateId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(templateId, newName) {
    return await apiRequest(`${this.baseUrl}/templates/${templateId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name: newName })
    });
  }

  // ================================
  // MULTILINGUAL CONTENT
  // ================================

  /**
   * Get content translations
   */
  async getContentTranslations(contentId) {
    return await apiRequest(`${this.baseUrl}/${contentId}/translations`);
  }

  /**
   * Create content translation
   */
  async createTranslation(contentId, translationData) {
    return await apiRequest(`${this.baseUrl}/${contentId}/translations`, {
      method: 'POST',
      body: JSON.stringify(translationData)
    });
  }

  /**
   * Update content translation
   */
  async updateTranslation(contentId, language, translationData) {
    return await apiRequest(`${this.baseUrl}/${contentId}/translations/${language}`, {
      method: 'PUT',
      body: JSON.stringify(translationData)
    });
  }

  /**
   * Delete content translation
   */
  async deleteTranslation(contentId, language) {
    return await apiRequest(`${this.baseUrl}/${contentId}/translations/${language}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages() {
    return await apiRequest(`${this.baseUrl}/languages`);
  }

  /**
   * Auto-translate content
   */
  async autoTranslateContent(contentId, targetLanguages, translationService = 'google') {
    return await apiRequest(`${this.baseUrl}/${contentId}/auto-translate`, {
      method: 'POST',
      body: JSON.stringify({ targetLanguages, translationService })
    });
  }

  // ================================
  // SEO OPTIMIZATION
  // ================================

  /**
   * Get SEO analysis for content
   */
  async getSEOAnalysis(contentId) {
    return await apiRequest(`${this.baseUrl}/${contentId}/seo-analysis`);
  }

  /**
   * Update SEO metadata
   */
  async updateSEOMetadata(contentId, seoData) {
    return await apiRequest(`${this.baseUrl}/${contentId}/seo`, {
      method: 'PUT',
      body: JSON.stringify(seoData)
    });
  }

  /**
   * Generate SEO-friendly URL slug
   */
  async generateSlug(title, contentType = 'page') {
    return await apiRequest(`${this.baseUrl}/seo/generate-slug`, {
      method: 'POST',
      body: JSON.stringify({ title, contentType })
    });
  }

  /**
   * Check SEO keyword density
   */
  async checkKeywordDensity(contentId, keywords) {
    return await apiRequest(`${this.baseUrl}/${contentId}/seo/keyword-density`, {
      method: 'POST',
      body: JSON.stringify({ keywords })
    });
  }

  /**
   * Get SEO recommendations
   */
  async getSEORecommendations(contentId) {
    return await apiRequest(`${this.baseUrl}/${contentId}/seo/recommendations`);
  }

  // ================================
  // CONTENT WORKFLOW
  // ================================

  /**
   * Get content workflows
   */
  async getWorkflows() {
    return await apiRequest(`${this.baseUrl}/workflows`);
  }

  /**
   * Create content workflow
   */
  async createWorkflow(workflowData) {
    return await apiRequest(`${this.baseUrl}/workflows`, {
      method: 'POST',
      body: JSON.stringify(workflowData)
    });
  }

  /**
   * Submit content for approval
   */
  async submitForApproval(contentId, approvers = [], message = '') {
    return await apiRequest(`${this.baseUrl}/${contentId}/submit-approval`, {
      method: 'POST',
      body: JSON.stringify({ approvers, message })
    });
  }

  /**
   * Approve content
   */
  async approveContent(contentId, comments = '') {
    return await apiRequest(`${this.baseUrl}/${contentId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments })
    });
  }

  /**
   * Reject content
   */
  async rejectContent(contentId, reason, suggestions = '') {
    return await apiRequest(`${this.baseUrl}/${contentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, suggestions })
    });
  }

  /**
   * Get content approval history
   */
  async getApprovalHistory(contentId) {
    return await apiRequest(`${this.baseUrl}/${contentId}/approval-history`);
  }

  // ================================
  // CONTENT VERSIONING
  // ================================

  /**
   * Get content versions
   */
  async getContentVersions(contentId) {
    return await apiRequest(`${this.baseUrl}/${contentId}/versions`);
  }

  /**
   * Create content version
   */
  async createContentVersion(contentId, versionData) {
    return await apiRequest(`${this.baseUrl}/${contentId}/versions`, {
      method: 'POST',
      body: JSON.stringify(versionData)
    });
  }

  /**
   * Restore content version
   */
  async restoreContentVersion(contentId, versionId, reason = '') {
    return await apiRequest(`${this.baseUrl}/${contentId}/versions/${versionId}/restore`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Compare content versions
   */
  async compareVersions(contentId, version1, version2) {
    return await apiRequest(`${this.baseUrl}/${contentId}/versions/compare`, {
      method: 'POST',
      body: JSON.stringify({ version1, version2 })
    });
  }

  // ================================
  // BANGLADESH-SPECIFIC CONTENT
  // ================================

  /**
   * Get Bangladesh cultural content templates
   */
  async getBangladeshCulturalTemplates(occasion = '') {
    const params = new URLSearchParams({
      occasion, // 'eid', 'pohela_boishakh', 'victory_day', 'independence_day'
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/cultural-templates?${params}`);
  }

  /**
   * Create festival-specific content
   */
  async createFestivalContent(festival, contentData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/festivals/${festival}/content`, {
      method: 'POST',
      body: JSON.stringify({ ...contentData, country: 'BD' })
    });
  }

  /**
   * Get Bengali content guidelines
   */
  async getBengaliContentGuidelines() {
    return await apiRequest(`${this.baseUrl}/bangladesh/bengali-guidelines`);
  }

  /**
   * Validate Bengali content
   */
  async validateBengaliContent(content) {
    return await apiRequest(`${this.baseUrl}/bangladesh/validate-bengali`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  /**
   * Get regional content preferences
   */
  async getRegionalContentPreferences(division) {
    const params = new URLSearchParams({
      division,
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/regional-preferences?${params}`);
  }

  // ================================
  // CONTENT ANALYTICS
  // ================================

  /**
   * Get content analytics dashboard
   */
  async getContentAnalytics(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      contentType: filters.contentType || '',
      language: filters.language || '',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/analytics/dashboard?${params}`);
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(contentId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/${contentId}/performance?${params}`);
  }

  /**
   * Get trending content
   */
  async getTrendingContent(timeframe = '7d', contentType = '') {
    const params = new URLSearchParams({
      timeframe,
      contentType
    });

    return await apiRequest(`${this.baseUrl}/analytics/trending?${params}`);
  }

  /**
   * Get content engagement metrics
   */
  async getEngagementMetrics(contentId, metrics = ['views', 'shares', 'time_spent']) {
    return await apiRequest(`${this.baseUrl}/${contentId}/engagement`, {
      method: 'POST',
      body: JSON.stringify({ metrics })
    });
  }

  // ================================
  // SEARCH & DISCOVERY
  // ================================

  /**
   * Search content
   */
  async searchContent(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      type: filters.type || '',
      status: filters.status || '',
      language: filters.language || '',
      sortBy: filters.sortBy || 'relevance',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/search?${params}`);
  }

  /**
   * Get content suggestions
   */
  async getContentSuggestions(query, limit = 10) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/suggestions?${params}`);
  }

  /**
   * Get related content
   */
  async getRelatedContent(contentId, limit = 5) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/${contentId}/related?${params}`);
  }

  // ================================
  // CONTENT SCHEDULING
  // ================================

  /**
   * Schedule content publication
   */
  async scheduleContentPublication(contentId, publishDate, timezone = 'Asia/Dhaka') {
    return await apiRequest(`${this.baseUrl}/${contentId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ publishDate, timezone })
    });
  }

  /**
   * Get scheduled content
   */
  async getScheduledContent(filters = {}) {
    const params = new URLSearchParams({
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      status: filters.status || 'scheduled',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/scheduled?${params}`);
  }

  /**
   * Cancel scheduled publication
   */
  async cancelScheduledPublication(contentId, reason = '') {
    return await apiRequest(`${this.baseUrl}/${contentId}/cancel-schedule`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // ================================
  // BULK OPERATIONS
  // ================================

  /**
   * Bulk update content
   */
  async bulkUpdateContent(contentIds, updateData) {
    return await apiRequest(`${this.baseUrl}/bulk/update`, {
      method: 'POST',
      body: JSON.stringify({ contentIds, updateData })
    });
  }

  /**
   * Bulk publish content
   */
  async bulkPublishContent(contentIds) {
    return await apiRequest(`${this.baseUrl}/bulk/publish`, {
      method: 'POST',
      body: JSON.stringify({ contentIds })
    });
  }

  /**
   * Bulk delete content
   */
  async bulkDeleteContent(contentIds) {
    return await apiRequest(`${this.baseUrl}/bulk/delete`, {
      method: 'POST',
      body: JSON.stringify({ contentIds })
    });
  }

  /**
   * Export content data
   */
  async exportContentData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'content', 'media', 'analytics', 'seo'
      format: filters.format || 'csv',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Get real-time content metrics
   */
  async getRealTimeContentMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  /**
   * Subscribe to content updates
   */
  subscribeToContentUpdates(onUpdate, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/content/updates/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return ws;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get content status color
   */
  getStatusColor(status) {
    const colors = {
      'draft': '#6B7280',
      'published': '#10B981',
      'scheduled': '#3B82F6',
      'archived': '#F59E0B',
      'pending_approval': '#8B5CF6',
      'rejected': '#EF4444'
    };
    return colors[status.toLowerCase()] || '#6B7280';
  }

  /**
   * Format content type
   */
  formatContentType(type) {
    const types = {
      'page': 'Page',
      'blog': 'Blog Post',
      'product': 'Product Content',
      'category': 'Category Content',
      'email': 'Email Template',
      'media': 'Media File'
    };
    return types[type] || type;
  }

  /**
   * Calculate reading time
   */
  calculateReadingTime(content, wordsPerMinute = 200) {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes === 1 ? '1 minute read' : `${minutes} minutes read`;
  }

  /**
   * Generate excerpt from content
   */
  generateExcerpt(content, maxLength = 150) {
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (textContent.length <= maxLength) return textContent;
    
    const words = textContent.substring(0, maxLength).split(' ');
    words.pop(); // Remove last potentially incomplete word
    return words.join(' ') + '...';
  }

  /**
   * Validate content structure
   */
  validateContentStructure(content, requiredFields = []) {
    const missing = [];
    
    requiredFields.forEach(field => {
      if (!content[field] || (typeof content[field] === 'string' && content[field].trim() === '')) {
        missing.push(field);
      }
    });
    
    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  }

  /**
   * Handle API errors with proper content context
   */
  handleError(error, operation) {
    console.error(`Content API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected content error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Content authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this content operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested content was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Content conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid content data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many content requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Content server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const contentApiService = new ContentApiService();