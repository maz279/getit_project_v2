import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Configuration Service API Integration
 * Amazon.com/Shopee.sg-level configuration management functionality with complete backend synchronization
 */
export class ConfigApiService {
  constructor() {
    this.baseUrl = '/api/v1/config';
  }

  // ================================
  // CONFIGURATION MANAGEMENT
  // ================================

  /**
   * Get all configurations
   */
  async getAllConfigurations(filters = {}) {
    const params = new URLSearchParams({
      environment: filters.environment || '',
      category: filters.category || '',
      service: filters.service || '',
      includeSecrets: filters.includeSecrets || 'false',
      page: filters.page || '1',
      limit: filters.limit || '100'
    });

    return await apiRequest(`${this.baseUrl}/configurations?${params}`);
  }

  /**
   * Get configuration by key
   */
  async getConfiguration(key, environment = 'production') {
    const params = new URLSearchParams({
      environment
    });

    return await apiRequest(`${this.baseUrl}/configurations/${key}?${params}`);
  }

  /**
   * Set configuration value
   */
  async setConfiguration(key, value, metadata = {}) {
    return await apiRequest(`${this.baseUrl}/configurations/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, metadata })
    });
  }

  /**
   * Delete configuration
   */
  async deleteConfiguration(key, environment = 'production') {
    return await apiRequest(`${this.baseUrl}/configurations/${key}`, {
      method: 'DELETE',
      body: JSON.stringify({ environment })
    });
  }

  /**
   * Bulk update configurations
   */
  async bulkUpdateConfigurations(configurations) {
    return await apiRequest(`${this.baseUrl}/configurations/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ configurations })
    });
  }

  // ================================
  // ENVIRONMENT MANAGEMENT
  // ================================

  /**
   * Get environment configurations
   */
  async getEnvironmentConfigurations(environment) {
    return await apiRequest(`${this.baseUrl}/environments/${environment}/configurations`);
  }

  /**
   * Get available environments
   */
  async getEnvironments() {
    return await apiRequest(`${this.baseUrl}/environments`);
  }

  /**
   * Create new environment
   */
  async createEnvironment(environmentData) {
    return await apiRequest(`${this.baseUrl}/environments`, {
      method: 'POST',
      body: JSON.stringify(environmentData)
    });
  }

  /**
   * Copy configurations between environments
   */
  async copyConfigurationsBetweenEnvironments(fromEnv, toEnv, configKeys = []) {
    return await apiRequest(`${this.baseUrl}/environments/copy-configurations`, {
      method: 'POST',
      body: JSON.stringify({ fromEnvironment: fromEnv, toEnvironment: toEnv, configKeys })
    });
  }

  // ================================
  // SERVICE-SPECIFIC CONFIGURATIONS
  // ================================

  /**
   * Get service configurations
   */
  async getServiceConfigurations(serviceName, environment = 'production') {
    const params = new URLSearchParams({
      environment
    });

    return await apiRequest(`${this.baseUrl}/services/${serviceName}/configurations?${params}`);
  }

  /**
   * Update service configuration
   */
  async updateServiceConfiguration(serviceName, configData) {
    return await apiRequest(`${this.baseUrl}/services/${serviceName}/configurations`, {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
  }

  /**
   * Get available services
   */
  async getAvailableServices() {
    return await apiRequest(`${this.baseUrl}/services`);
  }

  /**
   * Restart service with new configuration
   */
  async restartServiceWithNewConfig(serviceName, environment = 'production') {
    return await apiRequest(`${this.baseUrl}/services/${serviceName}/restart`, {
      method: 'POST',
      body: JSON.stringify({ environment })
    });
  }

  // ================================
  // DATABASE CONFIGURATIONS
  // ================================

  /**
   * Get database configurations
   */
  async getDatabaseConfigurations(dbType = '') {
    const params = new URLSearchParams({
      type: dbType // 'postgresql', 'mongodb', 'redis', 'elasticsearch'
    });

    return await apiRequest(`${this.baseUrl}/database/configurations?${params}`);
  }

  /**
   * Update database configuration
   */
  async updateDatabaseConfiguration(dbType, configData) {
    return await apiRequest(`${this.baseUrl}/database/${dbType}/configuration`, {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection(dbType, connectionString) {
    return await apiRequest(`${this.baseUrl}/database/${dbType}/test-connection`, {
      method: 'POST',
      body: JSON.stringify({ connectionString })
    });
  }

  // ================================
  // PAYMENT GATEWAY CONFIGURATIONS
  // ================================

  /**
   * Get payment gateway configurations
   */
  async getPaymentGatewayConfigurations() {
    return await apiRequest(`${this.baseUrl}/payment-gateways/configurations`);
  }

  /**
   * Update payment gateway configuration
   */
  async updatePaymentGatewayConfiguration(gateway, configData) {
    return await apiRequest(`${this.baseUrl}/payment-gateways/${gateway}/configuration`, {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
  }

  /**
   * Test payment gateway connection
   */
  async testPaymentGatewayConnection(gateway, credentials) {
    return await apiRequest(`${this.baseUrl}/payment-gateways/${gateway}/test-connection`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  /**
   * Get Bangladesh payment method configurations
   */
  async getBangladeshPaymentConfigurations() {
    return await apiRequest(`${this.baseUrl}/payment-gateways/bangladesh/configurations`);
  }

  // ================================
  // SHIPPING CONFIGURATIONS
  // ================================

  /**
   * Get shipping configurations
   */
  async getShippingConfigurations() {
    return await apiRequest(`${this.baseUrl}/shipping/configurations`);
  }

  /**
   * Update shipping provider configuration
   */
  async updateShippingProviderConfiguration(provider, configData) {
    return await apiRequest(`${this.baseUrl}/shipping/${provider}/configuration`, {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
  }

  /**
   * Get Bangladesh shipping configurations
   */
  async getBangladeshShippingConfigurations() {
    return await apiRequest(`${this.baseUrl}/shipping/bangladesh/configurations`);
  }

  /**
   * Test shipping provider connection
   */
  async testShippingProviderConnection(provider, credentials) {
    return await apiRequest(`${this.baseUrl}/shipping/${provider}/test-connection`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // ================================
  // LOCALIZATION CONFIGURATIONS
  // ================================

  /**
   * Get localization configurations
   */
  async getLocalizationConfigurations() {
    return await apiRequest(`${this.baseUrl}/localization/configurations`);
  }

  /**
   * Update language configuration
   */
  async updateLanguageConfiguration(language, configData) {
    return await apiRequest(`${this.baseUrl}/localization/${language}/configuration`, {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages() {
    return await apiRequest(`${this.baseUrl}/localization/supported-languages`);
  }

  /**
   * Get Bangladesh localization settings
   */
  async getBangladeshLocalizationSettings() {
    return await apiRequest(`${this.baseUrl}/localization/bangladesh/settings`);
  }

  // ================================
  // FEATURE FLAGS
  // ================================

  /**
   * Get feature flags
   */
  async getFeatureFlags(environment = 'production') {
    const params = new URLSearchParams({
      environment
    });

    return await apiRequest(`${this.baseUrl}/feature-flags?${params}`);
  }

  /**
   * Update feature flag
   */
  async updateFeatureFlag(flagName, enabled, conditions = {}) {
    return await apiRequest(`${this.baseUrl}/feature-flags/${flagName}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled, conditions })
    });
  }

  /**
   * Create feature flag
   */
  async createFeatureFlag(flagData) {
    return await apiRequest(`${this.baseUrl}/feature-flags`, {
      method: 'POST',
      body: JSON.stringify(flagData)
    });
  }

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(flagName) {
    return await apiRequest(`${this.baseUrl}/feature-flags/${flagName}`, {
      method: 'DELETE'
    });
  }

  /**
   * Check feature flag for user
   */
  async checkFeatureFlag(flagName, userId, userAttributes = {}) {
    return await apiRequest(`${this.baseUrl}/feature-flags/${flagName}/check`, {
      method: 'POST',
      body: JSON.stringify({ userId, userAttributes })
    });
  }

  // ================================
  // API RATE LIMITING
  // ================================

  /**
   * Get rate limiting configurations
   */
  async getRateLimitConfigurations() {
    return await apiRequest(`${this.baseUrl}/rate-limiting/configurations`);
  }

  /**
   * Update rate limiting rules
   */
  async updateRateLimitingRules(rules) {
    return await apiRequest(`${this.baseUrl}/rate-limiting/rules`, {
      method: 'PUT',
      body: JSON.stringify({ rules })
    });
  }

  /**
   * Get API usage statistics
   */
  async getAPIUsageStatistics(period = '24h') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/rate-limiting/usage-statistics?${params}`);
  }

  // ================================
  // SECURITY CONFIGURATIONS
  // ================================

  /**
   * Get security configurations
   */
  async getSecurityConfigurations() {
    return await apiRequest(`${this.baseUrl}/security/configurations`);
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(securityData) {
    return await apiRequest(`${this.baseUrl}/security/settings`, {
      method: 'PUT',
      body: JSON.stringify(securityData)
    });
  }

  /**
   * Get encryption settings
   */
  async getEncryptionSettings() {
    return await apiRequest(`${this.baseUrl}/security/encryption/settings`);
  }

  /**
   * Update encryption configuration
   */
  async updateEncryptionConfiguration(encryptionData) {
    return await apiRequest(`${this.baseUrl}/security/encryption/configuration`, {
      method: 'PUT',
      body: JSON.stringify(encryptionData)
    });
  }

  // ================================
  // MONITORING CONFIGURATIONS
  // ================================

  /**
   * Get monitoring configurations
   */
  async getMonitoringConfigurations() {
    return await apiRequest(`${this.baseUrl}/monitoring/configurations`);
  }

  /**
   * Update logging configuration
   */
  async updateLoggingConfiguration(loggingData) {
    return await apiRequest(`${this.baseUrl}/monitoring/logging/configuration`, {
      method: 'PUT',
      body: JSON.stringify(loggingData)
    });
  }

  /**
   * Get metrics configuration
   */
  async getMetricsConfiguration() {
    return await apiRequest(`${this.baseUrl}/monitoring/metrics/configuration`);
  }

  /**
   * Update metrics configuration
   */
  async updateMetricsConfiguration(metricsData) {
    return await apiRequest(`${this.baseUrl}/monitoring/metrics/configuration`, {
      method: 'PUT',
      body: JSON.stringify(metricsData)
    });
  }

  // ================================
  // BACKUP & RECOVERY
  // ================================

  /**
   * Create configuration backup
   */
  async createConfigurationBackup(backupName, description = '') {
    return await apiRequest(`${this.baseUrl}/backup/create`, {
      method: 'POST',
      body: JSON.stringify({ name: backupName, description })
    });
  }

  /**
   * Get configuration backups
   */
  async getConfigurationBackups() {
    return await apiRequest(`${this.baseUrl}/backup/list`);
  }

  /**
   * Restore configuration from backup
   */
  async restoreConfigurationFromBackup(backupId, environment = 'production') {
    return await apiRequest(`${this.baseUrl}/backup/restore`, {
      method: 'POST',
      body: JSON.stringify({ backupId, environment })
    });
  }

  /**
   * Delete configuration backup
   */
  async deleteConfigurationBackup(backupId) {
    return await apiRequest(`${this.baseUrl}/backup/${backupId}`, {
      method: 'DELETE'
    });
  }

  // ================================
  // VALIDATION & TESTING
  // ================================

  /**
   * Validate configuration schema
   */
  async validateConfigurationSchema(configData) {
    return await apiRequest(`${this.baseUrl}/validation/schema`, {
      method: 'POST',
      body: JSON.stringify(configData)
    });
  }

  /**
   * Test configuration changes
   */
  async testConfigurationChanges(changes, environment = 'staging') {
    return await apiRequest(`${this.baseUrl}/validation/test-changes`, {
      method: 'POST',
      body: JSON.stringify({ changes, environment })
    });
  }

  /**
   * Validate Bangladesh compliance
   */
  async validateBangladeshCompliance(configData) {
    return await apiRequest(`${this.baseUrl}/validation/bangladesh-compliance`, {
      method: 'POST',
      body: JSON.stringify(configData)
    });
  }

  // ================================
  // AUDIT & HISTORY
  // ================================

  /**
   * Get configuration history
   */
  async getConfigurationHistory(key, limit = 50) {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/audit/configurations/${key}/history?${params}`);
  }

  /**
   * Get audit trail
   */
  async getAuditTrail(filters = {}) {
    const params = new URLSearchParams({
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      userId: filters.userId || '',
      action: filters.action || '',
      page: filters.page || '1',
      limit: filters.limit || '50'
    });

    return await apiRequest(`${this.baseUrl}/audit/trail?${params}`);
  }

  /**
   * Rollback configuration to previous version
   */
  async rollbackConfiguration(key, versionId, reason = '') {
    return await apiRequest(`${this.baseUrl}/configurations/${key}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ versionId, reason })
    });
  }

  // ================================
  // EXPORT & IMPORT
  // ================================

  /**
   * Export configurations
   */
  async exportConfigurations(filters = {}) {
    const params = new URLSearchParams({
      format: filters.format || 'json',
      environment: filters.environment || '',
      category: filters.category || '',
      includeSecrets: filters.includeSecrets || 'false'
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Import configurations
   */
  async importConfigurations(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    return await apiRequest(`${this.baseUrl}/import`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove content-type to let browser set it with boundary
    });
  }

  /**
   * Get import/export job status
   */
  async getJobStatus(jobId) {
    return await apiRequest(`${this.baseUrl}/jobs/${jobId}/status`);
  }

  // ================================
  // REAL-TIME MONITORING
  // ================================

  /**
   * Get real-time configuration metrics
   */
  async getRealTimeConfigurationMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  /**
   * Subscribe to configuration changes
   */
  subscribeToConfigurationChanges(onConfigChange, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/config/changes/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onConfigChange(data);
    };
    
    return ws;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Encrypt configuration value
   */
  async encryptValue(value) {
    return await apiRequest(`${this.baseUrl}/utils/encrypt`, {
      method: 'POST',
      body: JSON.stringify({ value })
    });
  }

  /**
   * Decrypt configuration value
   */
  async decryptValue(encryptedValue) {
    return await apiRequest(`${this.baseUrl}/utils/decrypt`, {
      method: 'POST',
      body: JSON.stringify({ encryptedValue })
    });
  }

  /**
   * Validate configuration value type
   */
  validateValueType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'json':
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return true;
    }
  }

  /**
   * Format configuration value for display
   */
  formatConfigurationValue(value, type) {
    if (value === null || value === undefined) {
      return 'Not set';
    }

    switch (type) {
      case 'secret':
        return '••••••••';
      case 'json':
        return JSON.stringify(value, null, 2);
      case 'boolean':
        return value ? 'Enabled' : 'Disabled';
      case 'currency':
        return new Intl.NumberFormat('en-BD', {
          style: 'currency',
          currency: 'BDT'
        }).format(value);
      default:
        return String(value);
    }
  }

  /**
   * Get configuration category color
   */
  getCategoryColor(category) {
    const colors = {
      'database': '#3B82F6',
      'payment': '#10B981',
      'shipping': '#F59E0B',
      'security': '#EF4444',
      'monitoring': '#8B5CF6',
      'localization': '#06B6D4',
      'feature-flags': '#F97316',
      'api': '#84CC16'
    };
    return colors[category.toLowerCase()] || '#6B7280';
  }

  /**
   * Handle API errors with proper configuration context
   */
  handleError(error, operation) {
    console.error(`Configuration API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected configuration error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Configuration authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this configuration operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested configuration was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Configuration conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid configuration data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many configuration requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Configuration server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const configApiService = new ConfigApiService();