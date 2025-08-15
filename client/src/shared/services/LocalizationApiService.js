import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Localization Service API Integration
 * Amazon.com/Shopee.sg-level internationalization functionality with complete backend synchronization
 */
export class LocalizationApiService {
  constructor() {
    this.baseUrl = '/api/v1/localization';
  }

  // ================================
  // LANGUAGE MANAGEMENT
  // ================================

  /**
   * Get supported languages
   */
  async getSupportedLanguages() {
    return await apiRequest(`${this.baseUrl}/languages`);
  }

  /**
   * Get language details
   */
  async getLanguageDetails(languageCode) {
    return await apiRequest(`${this.baseUrl}/languages/${languageCode}`);
  }

  /**
   * Add new language
   */
  async addLanguage(languageData) {
    return await apiRequest(`${this.baseUrl}/languages`, {
      method: 'POST',
      body: JSON.stringify(languageData)
    });
  }

  /**
   * Update language settings
   */
  async updateLanguageSettings(languageCode, settings) {
    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  /**
   * Toggle language availability
   */
  async toggleLanguageAvailability(languageCode, isActive) {
    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ isActive })
    });
  }

  // ================================
  // TRANSLATION MANAGEMENT
  // ================================

  /**
   * Get translations for language
   */
  async getTranslations(languageCode, filters = {}) {
    const params = new URLSearchParams({
      namespace: filters.namespace || '',
      key: filters.key || '',
      status: filters.status || '',
      page: filters.page || '1',
      limit: filters.limit || '100'
    });

    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/translations?${params}`);
  }

  /**
   * Get translation by key
   */
  async getTranslation(languageCode, translationKey, namespace = 'common') {
    const params = new URLSearchParams({
      namespace
    });

    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/translations/${translationKey}?${params}`);
  }

  /**
   * Add or update translation
   */
  async setTranslation(languageCode, translationKey, translationData) {
    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/translations/${translationKey}`, {
      method: 'PUT',
      body: JSON.stringify(translationData)
    });
  }

  /**
   * Delete translation
   */
  async deleteTranslation(languageCode, translationKey, namespace = 'common') {
    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/translations/${translationKey}`, {
      method: 'DELETE',
      body: JSON.stringify({ namespace })
    });
  }

  /**
   * Bulk update translations
   */
  async bulkUpdateTranslations(languageCode, translations) {
    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/translations/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ translations })
    });
  }

  /**
   * Get missing translations
   */
  async getMissingTranslations(languageCode, baseLanguage = 'en') {
    const params = new URLSearchParams({
      baseLanguage
    });

    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/missing-translations?${params}`);
  }

  // ================================
  // AUTO-TRANSLATION
  // ================================

  /**
   * Auto-translate content
   */
  async autoTranslateContent(sourceLanguage, targetLanguage, content, context = '') {
    return await apiRequest(`${this.baseUrl}/auto-translate`, {
      method: 'POST',
      body: JSON.stringify({
        sourceLanguage,
        targetLanguage,
        content,
        context
      })
    });
  }

  /**
   * Auto-translate missing keys
   */
  async autoTranslateMissingKeys(targetLanguage, sourceLanguage = 'en', provider = 'google') {
    return await apiRequest(`${this.baseUrl}/auto-translate/missing-keys`, {
      method: 'POST',
      body: JSON.stringify({
        targetLanguage,
        sourceLanguage,
        provider
      })
    });
  }

  /**
   * Get translation providers
   */
  async getTranslationProviders() {
    return await apiRequest(`${this.baseUrl}/translation-providers`);
  }

  /**
   * Configure translation provider
   */
  async configureTranslationProvider(provider, configuration) {
    return await apiRequest(`${this.baseUrl}/translation-providers/${provider}/configure`, {
      method: 'POST',
      body: JSON.stringify(configuration)
    });
  }

  // ================================
  // BANGLADESH LOCALIZATION
  // ================================

  /**
   * Get Bengali translations
   */
  async getBengaliTranslations(namespace = 'common') {
    const params = new URLSearchParams({
      namespace
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/bengali-translations?${params}`);
  }

  /**
   * Get cultural content
   */
  async getBangladeshCulturalContent(contentType = '') {
    const params = new URLSearchParams({
      type: contentType, // 'festivals', 'greetings', 'phrases', 'numbers'
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/cultural-content?${params}`);
  }

  /**
   * Get festival translations
   */
  async getFestivalTranslations(festival = '') {
    const params = new URLSearchParams({
      festival, // 'eid', 'pohela_boishakh', 'durga_puja', 'victory_day'
      language: 'bn'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/festival-translations?${params}`);
  }

  /**
   * Get prayer time translations
   */
  async getPrayerTimeTranslations() {
    return await apiRequest(`${this.baseUrl}/bangladesh/prayer-translations`);
  }

  /**
   * Get Bengali number formatting
   */
  async getBengaliNumberFormatting() {
    return await apiRequest(`${this.baseUrl}/bangladesh/number-formatting`);
  }

  /**
   * Get Bangladesh currency formatting
   */
  async getBangladeshCurrencyFormatting() {
    return await apiRequest(`${this.baseUrl}/bangladesh/currency-formatting`);
  }

  /**
   * Get regional translations
   */
  async getRegionalTranslations(division = '') {
    const params = new URLSearchParams({
      division, // 'dhaka', 'chittagong', 'sylhet', etc.
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/regional-translations?${params}`);
  }

  // ================================
  // LOCALE MANAGEMENT
  // ================================

  /**
   * Get locale settings
   */
  async getLocaleSettings(localeCode) {
    return await apiRequest(`${this.baseUrl}/locales/${localeCode}`);
  }

  /**
   * Update locale settings
   */
  async updateLocaleSettings(localeCode, settings) {
    return await apiRequest(`${this.baseUrl}/locales/${localeCode}`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  /**
   * Get date/time formatting
   */
  async getDateTimeFormatting(localeCode) {
    return await apiRequest(`${this.baseUrl}/locales/${localeCode}/datetime-formatting`);
  }

  /**
   * Get number formatting
   */
  async getNumberFormatting(localeCode) {
    return await apiRequest(`${this.baseUrl}/locales/${localeCode}/number-formatting`);
  }

  /**
   * Get currency formatting
   */
  async getCurrencyFormatting(localeCode, currencyCode = '') {
    const params = new URLSearchParams({
      currency: currencyCode
    });

    return await apiRequest(`${this.baseUrl}/locales/${localeCode}/currency-formatting?${params}`);
  }

  // ================================
  // MULTI-LANGUAGE CONTENT
  // ================================

  /**
   * Get multi-language content
   */
  async getMultiLanguageContent(contentId, languages = []) {
    const params = new URLSearchParams({
      languages: languages.join(',')
    });

    return await apiRequest(`${this.baseUrl}/content/${contentId}/multi-language?${params}`);
  }

  /**
   * Create multi-language content
   */
  async createMultiLanguageContent(contentData) {
    return await apiRequest(`${this.baseUrl}/content/multi-language`, {
      method: 'POST',
      body: JSON.stringify(contentData)
    });
  }

  /**
   * Update multi-language content
   */
  async updateMultiLanguageContent(contentId, languageCode, contentData) {
    return await apiRequest(`${this.baseUrl}/content/${contentId}/languages/${languageCode}`, {
      method: 'PUT',
      body: JSON.stringify(contentData)
    });
  }

  /**
   * Get content translation status
   */
  async getContentTranslationStatus(contentId) {
    return await apiRequest(`${this.baseUrl}/content/${contentId}/translation-status`);
  }

  // ================================
  // USER PREFERENCES
  // ================================

  /**
   * Get user language preferences
   */
  async getUserLanguagePreferences(userId) {
    return await apiRequest(`${this.baseUrl}/users/${userId}/preferences`);
  }

  /**
   * Update user language preferences
   */
  async updateUserLanguagePreferences(userId, preferences) {
    return await apiRequest(`${this.baseUrl}/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  }

  /**
   * Detect user language
   */
  async detectUserLanguage(userData) {
    return await apiRequest(`${this.baseUrl}/detect-language`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  /**
   * Get fallback language chain
   */
  async getFallbackLanguageChain(primaryLanguage) {
    const params = new URLSearchParams({
      primary: primaryLanguage
    });

    return await apiRequest(`${this.baseUrl}/fallback-chain?${params}`);
  }

  // ================================
  // TRANSLATION VALIDATION
  // ================================

  /**
   * Validate translation quality
   */
  async validateTranslationQuality(sourceText, translatedText, sourceLanguage, targetLanguage) {
    return await apiRequest(`${this.baseUrl}/validate-translation`, {
      method: 'POST',
      body: JSON.stringify({
        sourceText,
        translatedText,
        sourceLanguage,
        targetLanguage
      })
    });
  }

  /**
   * Get translation suggestions
   */
  async getTranslationSuggestions(text, sourceLanguage, targetLanguage, context = '') {
    return await apiRequest(`${this.baseUrl}/translation-suggestions`, {
      method: 'POST',
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
        context
      })
    });
  }

  /**
   * Report translation issue
   */
  async reportTranslationIssue(translationKey, languageCode, issueData) {
    return await apiRequest(`${this.baseUrl}/report-issue`, {
      method: 'POST',
      body: JSON.stringify({
        translationKey,
        languageCode,
        ...issueData
      })
    });
  }

  // ================================
  // EXPORT & IMPORT
  // ================================

  /**
   * Export translations
   */
  async exportTranslations(languageCode, format = 'json', namespace = '') {
    const params = new URLSearchParams({
      format, // 'json', 'csv', 'xliff', 'po'
      namespace
    });

    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Import translations
   */
  async importTranslations(languageCode, file, format = 'json', options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('options', JSON.stringify(options));

    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/import`, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  }

  /**
   * Get import/export history
   */
  async getImportExportHistory(languageCode = '', limit = 20) {
    const params = new URLSearchParams({
      language: languageCode,
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/import-export-history?${params}`);
  }

  // ================================
  // ANALYTICS & REPORTING
  // ================================

  /**
   * Get localization analytics
   */
  async getLocalizationAnalytics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics?${params}`);
  }

  /**
   * Get language usage statistics
   */
  async getLanguageUsageStatistics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/language-usage?${params}`);
  }

  /**
   * Get translation completion status
   */
  async getTranslationCompletionStatus() {
    return await apiRequest(`${this.baseUrl}/analytics/completion-status`);
  }

  /**
   * Get localization performance metrics
   */
  async getLocalizationPerformanceMetrics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/performance-metrics?${params}`);
  }

  // ================================
  // SEARCH & FILTERING
  // ================================

  /**
   * Search translations
   */
  async searchTranslations(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      language: filters.language || '',
      namespace: filters.namespace || '',
      status: filters.status || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/search/translations?${params}`);
  }

  /**
   * Find duplicate translations
   */
  async findDuplicateTranslations(languageCode) {
    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/duplicates`);
  }

  /**
   * Find unused translations
   */
  async findUnusedTranslations(languageCode) {
    return await apiRequest(`${this.baseUrl}/languages/${languageCode}/unused`);
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Subscribe to translation updates
   */
  subscribeToTranslationUpdates(languageCode, onUpdate) {
    const wsUrl = `ws://${window.location.host}/api/v1/localization/languages/${languageCode}/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return ws;
  }

  /**
   * Get real-time translation status
   */
  async getRealTimeTranslationStatus() {
    return await apiRequest(`${this.baseUrl}/real-time/status`);
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Format currency for locale
   */
  formatCurrency(amount, currencyCode, localeCode) {
    try {
      return new Intl.NumberFormat(localeCode, {
        style: 'currency',
        currency: currencyCode
      }).format(amount);
    } catch (error) {
      return `${currencyCode} ${amount}`;
    }
  }

  /**
   * Format number for locale
   */
  formatNumber(number, localeCode, options = {}) {
    try {
      return new Intl.NumberFormat(localeCode, options).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Format date for locale
   */
  formatDate(date, localeCode, options = {}) {
    try {
      return new Intl.DateTimeFormat(localeCode, options).format(new Date(date));
    } catch (error) {
      return new Date(date).toLocaleDateString();
    }
  }

  /**
   * Get text direction for language
   */
  getTextDirection(languageCode) {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
  }

  /**
   * Get language native name
   */
  getLanguageNativeName(languageCode) {
    const nativeNames = {
      'en': 'English',
      'bn': 'বাংলা',
      'hi': 'हिन्दी',
      'ar': 'العربية',
      'ur': 'اردو',
      'fr': 'Français',
      'es': 'Español',
      'de': 'Deutsch',
      'zh': '中文',
      'ja': '日本語'
    };
    return nativeNames[languageCode] || languageCode.toUpperCase();
  }

  /**
   * Interpolate translation variables
   */
  interpolateTranslation(translation, variables = {}) {
    let result = translation;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, variables[key]);
    });
    
    return result;
  }

  /**
   * Get completion percentage for language
   */
  calculateCompletionPercentage(translationData) {
    const total = translationData.totalKeys || 0;
    const translated = translationData.translatedKeys || 0;
    
    if (total === 0) return 0;
    return Math.round((translated / total) * 100);
  }

  /**
   * Handle API errors with proper localization context
   */
  handleError(error, operation) {
    console.error(`Localization API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected localization error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Localization authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this localization operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested translation or language was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Translation conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid translation data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many localization requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Localization server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const localizationApiService = new LocalizationApiService();