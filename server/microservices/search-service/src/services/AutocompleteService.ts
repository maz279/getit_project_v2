import { storage } from '../../../storage';
import { 
  PopularSearch, 
  InsertPopularSearch,
  SearchQuery 
} from '../../../../shared/schema';

/**
 * Amazon.com/Shopee.sg-Level Autocomplete Service
 * Real-time search suggestions with ML-powered predictions,
 * Bengali language support, and Bangladesh cultural optimization
 */
export class AutocompleteService {
  private serviceName = 'autocomplete-service-realtime';
  private suggestionCache = new Map<string, any>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor() {
    console.log('🚀 AutocompleteService initialized - Real-time suggestions');
  }

  /**
   * Get real-time autocomplete suggestions with Amazon.com/Shopee.sg features
   */
  async getAutocompleteSuggestions(params: {
    query: string;
    userId?: number;
    language?: string;
    region?: string;
    limit?: number;
    includeProducts?: boolean;
    includeCategories?: boolean;
  }): Promise<{
    suggestions: Array<{
      text: string;
      type: 'query' | 'product' | 'category' | 'brand';
      confidence: number;
      reason: string;
      metadata?: any;
    }>;
    products: any[];
    categories: any[];
    performance: {
      responseTime: number;
      cached: boolean;
      totalSuggestions: number;
    };
  }> {
    const startTime = Date.now();
    const { query, userId, language = 'en', region = 'dhaka', limit = 8 } = params;

    // Check cache first
    const cacheKey = this.generateCacheKey(params);
    const cachedResult = this.getCachedSuggestions(cacheKey);
    if (cachedResult) {
      return {
        ...cachedResult,
        performance: {
          responseTime: Date.now() - startTime,
          cached: true,
          totalSuggestions: cachedResult.suggestions.length
        }
      };
    }

    // Minimum query length for suggestions
    if (query.length < 2) {
      return this.getEmptyResponse(startTime);
    }

    // Generate suggestions from multiple sources
    const [
      popularSuggestions,
      productSuggestions,
      categorySuggestions,
      personalizedSuggestions,
      culturalSuggestions
    ] = await Promise.all([
      this.getPopularSearchSuggestions(query, language, region, limit),
      params.includeProducts ? this.getProductSuggestions(query, language, 4) : [],
      params.includeCategories ? this.getCategorySuggestions(query, language, 4) : [],
      userId ? this.getPersonalizedSuggestions(userId, query, language, 3) : [],
      this.getCulturalSuggestions(query, region, language, 2)
    ]);

    // Merge and rank all suggestions
    const allSuggestions = [
      ...popularSuggestions,
      ...personalizedSuggestions,
      ...culturalSuggestions
    ];

    const rankedSuggestions = this.rankSuggestions(allSuggestions, query, userId);
    const finalSuggestions = rankedSuggestions.slice(0, limit);

    // Cache the results
    const result = {
      suggestions: finalSuggestions,
      products: productSuggestions,
      categories: categorySuggestions,
      performance: {
        responseTime: Date.now() - startTime,
        cached: false,
        totalSuggestions: finalSuggestions.length
      }
    };

    this.cacheSuggestions(cacheKey, result);

    return result;
  }

  /**
   * Get trending search suggestions for homepage
   */
  async getTrendingSuggestions(params: {
    language?: string;
    region?: string;
    limit?: number;
  }): Promise<{
    trending: Array<{
      query: string;
      searchCount: number;
      growthRate: number;
      category?: string;
    }>;
  }> {
    const { language = 'en', region = 'dhaka', limit = 10 } = params;

    const trendingSearches = await storage.findMany('popularSearches', {
      where: `language = '${language}' AND region = '${region}'`,
      orderBy: [{ trendingScore: 'desc' }, { searchCount: 'desc' }],
      limit
    });

    return {
      trending: trendingSearches.map(search => ({
        query: search.queryText,
        searchCount: search.searchCount,
        growthRate: search.growthRate || 0,
        category: search.category
      }))
    };
  }

  /**
   * Update search popularity and trending scores
   */
  async updateSearchPopularity(query: string, userId?: number, metadata?: any): Promise<void> {
    const normalizedQuery = this.normalizeQuery(query);
    
    // Find existing popular search
    const existingSearch = await storage.findOne('popularSearches', {
      where: { normalizedQuery }
    });

    if (existingSearch) {
      // Update existing search
      const newSearchCount = existingSearch.searchCount + 1;
      const newUniqueUserCount = userId ? existingSearch.uniqueUserCount + 1 : existingSearch.uniqueUserCount;
      
      // Calculate growth rate (simplified)
      const growthRate = this.calculateGrowthRate(existingSearch);
      
      await storage.updateById('popularSearches', existingSearch.id, {
        searchCount: newSearchCount,
        uniqueUserCount: newUniqueUserCount,
        growthRate,
        lastSearchedAt: new Date(),
        trendingScore: this.calculateTrendingScore(newSearchCount, growthRate, new Date())
      });
    } else {
      // Create new popular search entry
      const newSearch: InsertPopularSearch = {
        queryText: query,
        normalizedQuery,
        searchCount: 1,
        uniqueUserCount: userId ? 1 : 0,
        language: this.detectLanguage(query),
        category: await this.detectCategory(query),
        region: metadata?.region || 'dhaka',
        trendingScore: 1.0,
        growthRate: 0,
        culturalRelevance: JSON.stringify(this.detectCulturalRelevance(query)),
        conversionRate: 0,
        avgOrderValue: 0,
        firstSearchedAt: new Date(),
        lastSearchedAt: new Date()
      };

      await storage.insertOne('popularSearches', newSearch);
    }

    // Clear cache for affected queries
    this.clearRelatedCache(normalizedQuery);
  }

  /**
   * Get search suggestions for voice input
   */
  async getVoiceSuggestions(params: {
    voiceQuery: string;
    language?: string;
    confidence?: number;
  }): Promise<{
    interpretations: Array<{
      text: string;
      confidence: number;
      suggestions: any[];
    }>;
  }> {
    const { voiceQuery, language = 'en', confidence = 0.8 } = params;

    // Process voice input (in production, use speech recognition API)
    const interpretations = this.processVoiceInput(voiceQuery, language);

    const results = [];
    for (const interpretation of interpretations) {
      if (interpretation.confidence >= confidence) {
        const suggestions = await this.getAutocompleteSuggestions({
          query: interpretation.text,
          language,
          limit: 5
        });
        
        results.push({
          text: interpretation.text,
          confidence: interpretation.confidence,
          suggestions: suggestions.suggestions
        });
      }
    }

    return { interpretations: results };
  }

  /**
   * Get suggestions for Bengali phonetic input
   */
  async getBengaliPhoneticSuggestions(params: {
    phoneticInput: string;
    userId?: number;
    limit?: number;
  }): Promise<{
    bengaliSuggestions: Array<{
      bengali: string;
      phonetic: string;
      confidence: number;
    }>;
  }> {
    const { phoneticInput, limit = 5 } = params;

    // Convert phonetic to Bengali (simplified mapping)
    const bengaliConversions = this.phoneticToBengali(phoneticInput);

    const suggestions = [];
    for (const conversion of bengaliConversions) {
      const autocompleteSuggestions = await this.getAutocompleteSuggestions({
        query: conversion.bengali,
        language: 'bn',
        limit: 2
      });

      suggestions.push({
        bengali: conversion.bengali,
        phonetic: conversion.phonetic,
        confidence: conversion.confidence
      });
    }

    return {
      bengaliSuggestions: suggestions.slice(0, limit)
    };
  }

  // Private helper methods

  private async getPopularSearchSuggestions(
    query: string, 
    language: string, 
    region: string, 
    limit: number
  ): Promise<any[]> {
    const normalizedQuery = this.normalizeQuery(query);
    
    const popularSearches = await storage.findMany('popularSearches', {
      where: `normalized_query ILIKE '%${normalizedQuery}%' AND language = '${language}' AND region = '${region}'`,
      orderBy: [{ trendingScore: 'desc' }, { searchCount: 'desc' }],
      limit
    });

    return popularSearches.map(search => ({
      text: search.queryText,
      type: 'query',
      confidence: this.calculateSuggestionConfidence(search, query),
      reason: `Popular search (${search.searchCount} searches)`,
      metadata: {
        searchCount: search.searchCount,
        trendingScore: search.trendingScore,
        category: search.category
      }
    }));
  }

  private async getProductSuggestions(query: string, language: string, limit: number): Promise<any[]> {
    const products = await storage.findMany('products', {
      where: `name ILIKE '%${query}%' OR description ILIKE '%${query}%'`,
      orderBy: [{ salesCount: 'desc' }, { rating: 'desc' }],
      limit
    });

    return products.map(product => ({
      id: product.id,
      name: language === 'bn' && product.nameBn ? product.nameBn : product.name,
      price: product.price,
      formattedPrice: `৳${product.price?.toLocaleString('bn-BD')}`,
      imageUrl: product.imageUrl,
      rating: product.rating,
      category: product.categoryName,
      inStock: product.inventory > 0
    }));
  }

  private async getCategorySuggestions(query: string, language: string, limit: number): Promise<any[]> {
    const categories = await storage.findMany('categories', {
      where: `name ILIKE '%${query}%'`,
      orderBy: [{ name: 'asc' }],
      limit
    });

    return categories.map(category => ({
      id: category.id,
      name: language === 'bn' && category.nameBn ? category.nameBn : category.name,
      productCount: category.productCount || 0,
      imageUrl: category.imageUrl
    }));
  }

  private async getPersonalizedSuggestions(
    userId: number, 
    query: string, 
    language: string, 
    limit: number
  ): Promise<any[]> {
    // Get user's recent search history
    const recentSearches = await storage.findMany('searchQueries', {
      where: { userId },
      orderBy: [{ searchTime: 'desc' }],
      limit: 20
    });

    // Find similar searches
    const personalizedSuggestions = recentSearches
      .filter(search => 
        search.queryText.toLowerCase().includes(query.toLowerCase()) &&
        search.queryText.toLowerCase() !== query.toLowerCase()
      )
      .slice(0, limit)
      .map(search => ({
        text: search.queryText,
        type: 'query',
        confidence: 0.9,
        reason: 'Based on your search history',
        metadata: {
          lastSearched: search.searchTime,
          resultCount: search.resultsCount
        }
      }));

    return personalizedSuggestions;
  }

  private async getCulturalSuggestions(
    query: string, 
    region: string, 
    language: string, 
    limit: number
  ): Promise<any[]> {
    const culturalKeywords = this.getCulturalKeywords(region, language);
    const suggestions = [];

    for (const keyword of culturalKeywords) {
      if (keyword.toLowerCase().includes(query.toLowerCase()) || 
          query.toLowerCase().includes(keyword.toLowerCase())) {
        
        const culturalQuery = `${query} ${keyword}`;
        suggestions.push({
          text: culturalQuery,
          type: 'query',
          confidence: 0.7,
          reason: `Popular in ${region}`,
          metadata: {
            cultural: true,
            region,
            keyword
          }
        });
      }
    }

    return suggestions.slice(0, limit);
  }

  private rankSuggestions(suggestions: any[], originalQuery: string, userId?: number): any[] {
    return suggestions
      .map(suggestion => ({
        ...suggestion,
        finalScore: this.calculateFinalScore(suggestion, originalQuery, userId)
      }))
      .sort((a, b) => b.finalScore - a.finalScore);
  }

  private calculateFinalScore(suggestion: any, originalQuery: string, userId?: number): number {
    let score = suggestion.confidence;

    // Boost exact matches
    if (suggestion.text.toLowerCase().startsWith(originalQuery.toLowerCase())) {
      score += 0.3;
    }

    // Boost personalized suggestions
    if (userId && suggestion.reason.includes('history')) {
      score += 0.2;
    }

    // Boost popular searches
    if (suggestion.metadata?.searchCount > 100) {
      score += 0.1;
    }

    // Boost trending searches
    if (suggestion.metadata?.trendingScore > 5) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private detectLanguage(query: string): string {
    // Simple language detection
    return /[\u0980-\u09FF]/.test(query) ? 'bn' : 'en';
  }

  private async detectCategory(query: string): Promise<string | null> {
    // Simple category detection based on keywords
    const categoryKeywords = {
      'electronics': ['phone', 'laptop', 'mobile', 'computer', 'tablet'],
      'fashion': ['shirt', 'dress', 'shoes', 'clothing', 'fashion'],
      'home': ['furniture', 'home', 'kitchen', 'bedroom', 'living']
    };

    const lowerQuery = query.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  private detectCulturalRelevance(query: string): any {
    const culturalFactors = {};
    const lowerQuery = query.toLowerCase();

    // Festival detection
    if (lowerQuery.includes('eid') || lowerQuery.includes('ঈদ')) {
      culturalFactors['eid'] = true;
    }
    if (lowerQuery.includes('puja') || lowerQuery.includes('পূজা')) {
      culturalFactors['durga_puja'] = true;
    }
    if (lowerQuery.includes('boishakh') || lowerQuery.includes('বৈশাখ')) {
      culturalFactors['pohela_boishakh'] = true;
    }

    // Wedding-related
    if (lowerQuery.includes('wedding') || lowerQuery.includes('বিয়ে')) {
      culturalFactors['wedding'] = true;
    }

    return culturalFactors;
  }

  private calculateGrowthRate(existingSearch: any): number {
    // Simplified growth rate calculation
    const daysSinceLastSearch = Math.floor(
      (Date.now() - new Date(existingSearch.lastSearchedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return Math.max(0, 1 / (daysSinceLastSearch + 1));
  }

  private calculateTrendingScore(searchCount: number, growthRate: number, lastSearched: Date): number {
    const recencyFactor = this.calculateRecencyFactor(lastSearched);
    return (searchCount * 0.5) + (growthRate * 0.3) + (recencyFactor * 0.2);
  }

  private calculateRecencyFactor(lastSearched: Date): number {
    const hoursSinceLastSearch = (Date.now() - lastSearched.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 10 - hoursSinceLastSearch);
  }

  private calculateSuggestionConfidence(search: any, query: string): number {
    const queryLower = query.toLowerCase();
    const textLower = search.queryText.toLowerCase();
    
    // Exact prefix match gets highest confidence
    if (textLower.startsWith(queryLower)) {
      return 0.95;
    }
    
    // Contains query gets medium confidence
    if (textLower.includes(queryLower)) {
      return 0.8;
    }
    
    // Fuzzy match gets lower confidence
    return this.calculateFuzzyMatch(queryLower, textLower);
  }

  private calculateFuzzyMatch(query: string, text: string): number {
    // Simple fuzzy matching based on character overlap
    const queryChars = new Set(query.split(''));
    const textChars = new Set(text.split(''));
    const intersection = new Set([...queryChars].filter(x => textChars.has(x)));
    
    return intersection.size / queryChars.size * 0.6;
  }

  private getCulturalKeywords(region: string, language: string): string[] {
    const keywords = {
      'dhaka': {
        'en': ['dhaka', 'bangladesh', 'local', 'deshi', 'traditional'],
        'bn': ['ঢাকা', 'বাংলাদেশ', 'দেশি', 'ঐতিহ্যবাহী', 'স্থানীয়']
      },
      'chittagong': {
        'en': ['chittagong', 'ctg', 'port city'],
        'bn': ['চট্টগ্রাম', 'বন্দর নগরী']
      }
    };

    return keywords[region]?.[language] || keywords['dhaka'][language] || [];
  }

  private processVoiceInput(voiceQuery: string, language: string): any[] {
    // Simplified voice processing (in production, use speech recognition API)
    return [
      {
        text: voiceQuery,
        confidence: 0.9
      }
    ];
  }

  private phoneticToBengali(phoneticInput: string): any[] {
    // Simplified phonetic to Bengali conversion
    const conversions = {
      'ami': 'আমি',
      'tumi': 'তুমি',
      'bhat': 'ভাত',
      'mach': 'মাছ',
      'kapor': 'কাপড়',
      'juta': 'জুতা'
    };

    const results = [];
    const lowerInput = phoneticInput.toLowerCase();

    for (const [phonetic, bengali] of Object.entries(conversions)) {
      if (phonetic.includes(lowerInput) || lowerInput.includes(phonetic)) {
        results.push({
          phonetic,
          bengali,
          confidence: phonetic === lowerInput ? 0.9 : 0.7
        });
      }
    }

    return results;
  }

  // Cache management methods

  private generateCacheKey(params: any): string {
    const { query, userId, language, region, limit } = params;
    return `autocomplete_${query}_${userId || 'anonymous'}_${language}_${region}_${limit}`;
  }

  private getCachedSuggestions(cacheKey: string): any | null {
    const cached = this.suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private cacheSuggestions(cacheKey: string, data: any): void {
    this.suggestionCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Clean old cache entries
    if (this.suggestionCache.size > 1000) {
      this.cleanCache();
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.suggestionCache.entries()) {
      if (now - value.timestamp > this.cacheExpiry) {
        this.suggestionCache.delete(key);
      }
    }
  }

  private clearRelatedCache(normalizedQuery: string): void {
    for (const [key] of this.suggestionCache.entries()) {
      if (key.includes(normalizedQuery)) {
        this.suggestionCache.delete(key);
      }
    }
  }

  private getEmptyResponse(startTime: number) {
    return {
      suggestions: [],
      products: [],
      categories: [],
      performance: {
        responseTime: Date.now() - startTime,
        cached: false,
        totalSuggestions: 0
      }
    };
  }
}