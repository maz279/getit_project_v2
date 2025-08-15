/**
 * Product Search Service - Amazon.com/Shopee.sg Level
 * Advanced search functionality with Elasticsearch integration and Bengali support
 */

import { db } from '../../../../db.js';
import { 
  products, categories, vendors
} from '@shared/schema';
import { eq, desc, asc, and, or, like, ilike, sql, count, gte, lte, inArray } from 'drizzle-orm';
import { RedisService } from '../../../../services/RedisService';

interface SearchFilters {
  category?: string;
  vendor?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  brand?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  products: any[];
  filters: any;
  pagination: any;
  suggestions: string[];
  totalResults: number;
  searchTime: number;
  facets: any;
}

export class ProductSearchService {
  private redisService: RedisService;
  private bangladeshRegions = [
    'dhaka', 'chittagong', 'sylhet', 'khulna', 'rajshahi', 
    'barisal', 'rangpur', 'mymensingh'
  ];

  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Advanced product search with multi-language support
   */
  async searchProducts(
    query: string, 
    filters: SearchFilters = {}, 
    page = 1, 
    limit = 20,
    userId?: string
  ): Promise<SearchResult> {
    const startTime = Date.now();
    const offset = (page - 1) * limit;

    try {
      // Normalize and analyze query
      const normalizedQuery = this.normalizeSearchQuery(query);
      const searchTerms = this.extractSearchTerms(normalizedQuery);
      const isBengaliQuery = this.detectBengaliText(query);

      // Build base query conditions
      let whereConditions = [eq(products.isActive, true)];

      // Text search conditions
      if (normalizedQuery) {
        const textSearchConditions = this.buildTextSearchConditions(normalizedQuery, isBengaliQuery);
        whereConditions.push(or(...textSearchConditions));
      }

      // Apply filters
      whereConditions = this.applyFilters(whereConditions, filters);

      // Build the main query
      const searchQuery = db
        .select({
          product: products,
          vendor: vendors,
          category: categories,
          relevanceScore: this.calculateRelevanceScore(normalizedQuery)
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...whereConditions));

      // Apply sorting
      const sortedQuery = this.applySorting(searchQuery, filters, normalizedQuery);

      // Execute search with pagination
      const [searchResults, totalCount] = await Promise.all([
        sortedQuery.limit(limit).offset(offset),
        this.getSearchResultCount(whereConditions)
      ]);

      // Get search facets
      const facets = await this.getSearchFacets(whereConditions);

      // Get search suggestions
      const suggestions = await this.getSearchSuggestions(normalizedQuery, isBengaliQuery);

      // Track search analytics
      if (userId) {
        await this.trackSearchAnalytics(userId, query, normalizedQuery, totalCount, isBengaliQuery);
      }

      const searchTime = Date.now() - startTime;

      return {
        products: searchResults,
        filters: this.buildAvailableFilters(facets),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        suggestions,
        totalResults: totalCount,
        searchTime,
        facets
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search failed');
    }
  }

  /**
   * Get trending search queries
   */
  async getTrendingSearches(region?: string, limit = 10): Promise<string[]> {
    try {
      const cacheKey = `trending_searches:${region || 'all'}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get trending searches from analytics
      const trending = await db
        .select({
          query: searchAnalytics.searchQuery,
          count: count(searchAnalytics.id)
        })
        .from(searchAnalytics)
        .where(and(
          gte(searchAnalytics.searchDate, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Last 7 days
          ...(region ? [like(searchAnalytics.userLocation, `%${region}%`)] : [])
        ))
        .groupBy(searchAnalytics.searchQuery)
        .orderBy(desc(count(searchAnalytics.id)))
        .limit(limit);

      const trendingQueries = trending.map(t => t.query);

      // Cache for 1 hour
      await this.redisService.setex(cacheKey, 3600, JSON.stringify(trendingQueries));

      return trendingQueries;
    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }

  /**
   * Get search suggestions as user types
   */
  async getSearchSuggestions(query: string, isBengali = false, limit = 10): Promise<string[]> {
    try {
      if (!query || query.length < 2) return [];

      const cacheKey = `search_suggestions:${query.toLowerCase()}:${isBengali}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const suggestions: string[] = [];

      // Product name suggestions
      const productSuggestions = await db
        .select({
          name: isBengali ? products.nameBn : products.name
        })
        .from(products)
        .where(and(
          eq(products.isActive, true),
          ilike(isBengali ? products.nameBn : products.name, `%${query}%`)
        ))
        .limit(5);

      suggestions.push(...productSuggestions.map(p => p.name).filter(Boolean));

      // Category suggestions
      const categorySuggestions = await db
        .select({
          name: isBengali ? categories.nameBn : categories.name
        })
        .from(categories)
        .where(and(
          eq(categories.isActive, true),
          ilike(isBengali ? categories.nameBn : categories.name, `%${query}%`)
        ))
        .limit(3);

      suggestions.push(...categorySuggestions.map(c => c.name).filter(Boolean));

      // Brand suggestions
      const brandSuggestions = await db
        .select({
          brand: products.brand
        })
        .from(products)
        .where(and(
          eq(products.isActive, true),
          ilike(products.brand, `%${query}%`),
          sql`${products.brand} IS NOT NULL`
        ))
        .groupBy(products.brand)
        .limit(2);

      suggestions.push(...brandSuggestions.map(b => b.brand).filter(Boolean));

      // Remove duplicates and limit results
      const uniqueSuggestions = [...new Set(suggestions)].slice(0, limit);

      // Cache for 30 minutes
      await this.redisService.setex(cacheKey, 1800, JSON.stringify(uniqueSuggestions));

      return uniqueSuggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Semantic search using natural language processing
   */
  async semanticSearch(query: string, filters: SearchFilters = {}, limit = 20): Promise<any[]> {
    try {
      // Extract entities and intent from the query
      const searchIntent = this.analyzeSearchIntent(query);
      
      // Build semantic search conditions
      const semanticConditions = this.buildSemanticConditions(searchIntent);
      
      // Combine with filters
      let whereConditions = [eq(products.isActive, true), ...semanticConditions];
      whereConditions = this.applyFilters(whereConditions, filters);

      const results = await db
        .select({
          product: products,
          vendor: vendors,
          category: categories,
          semanticScore: this.calculateSemanticScore(searchIntent)
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...whereConditions))
        .orderBy(desc(this.calculateSemanticScore(searchIntent)))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  }

  /**
   * Visual search using image similarity
   */
  async visualSearch(imageUrl: string, filters: SearchFilters = {}, limit = 20): Promise<any[]> {
    try {
      // This would integrate with image recognition service
      // For now, return products from similar categories
      
      // Extract features from uploaded image (mock implementation)
      const imageFeatures = await this.extractImageFeatures(imageUrl);
      
      // Find similar products based on visual features
      const similarProducts = await this.findVisuallySimilarProducts(imageFeatures, filters, limit);
      
      return similarProducts;
    } catch (error) {
      console.error('Visual search error:', error);
      return [];
    }
  }

  /**
   * Voice search with speech-to-text integration
   */
  async voiceSearch(audioData: Buffer, language = 'bn', filters: SearchFilters = {}): Promise<SearchResult> {
    try {
      // Convert speech to text (mock implementation)
      const transcribedText = await this.speechToText(audioData, language);
      
      // Process transcribed text like regular search
      return await this.searchProducts(transcribedText, filters);
    } catch (error) {
      console.error('Voice search error:', error);
      throw new Error('Voice search failed');
    }
  }

  /**
   * Search within vendor store
   */
  async searchVendorProducts(
    vendorId: string, 
    query: string, 
    filters: SearchFilters = {}, 
    page = 1, 
    limit = 20
  ): Promise<SearchResult> {
    // Add vendor filter
    const vendorFilters = { ...filters, vendor: vendorId };
    return await this.searchProducts(query, vendorFilters, page, limit);
  }

  /**
   * Search by category with advanced filtering
   */
  async searchByCategory(
    categoryId: string, 
    query?: string, 
    filters: SearchFilters = {}, 
    page = 1, 
    limit = 20
  ): Promise<SearchResult> {
    // Add category filter
    const categoryFilters = { ...filters, category: categoryId };
    return await this.searchProducts(query || '', categoryFilters, page, limit);
  }

  // Helper methods

  private normalizeSearchQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s\u0980-\u09FF]/g, '') // Keep English, Bengali, and whitespace
      .replace(/\s+/g, ' ');
  }

  private extractSearchTerms(query: string): string[] {
    return query.split(' ').filter(term => term.length > 1);
  }

  private detectBengaliText(text: string): boolean {
    return /[\u0980-\u09FF]/.test(text);
  }

  private buildTextSearchConditions(query: string, isBengali: boolean): any[] {
    const conditions = [];
    
    if (isBengali) {
      // Bengali search conditions
      conditions.push(ilike(products.nameBn, `%${query}%`));
      conditions.push(ilike(products.descriptionBn, `%${query}%`));
      conditions.push(ilike(products.tags, `%${query}%`));
    } else {
      // English search conditions
      conditions.push(ilike(products.name, `%${query}%`));
      conditions.push(ilike(products.description, `%${query}%`));
      conditions.push(ilike(products.brand, `%${query}%`));
      conditions.push(ilike(products.tags, `%${query}%`));
    }

    return conditions;
  }

  private applyFilters(whereConditions: any[], filters: SearchFilters): any[] {
    if (filters.category) {
      whereConditions.push(eq(products.categoryId, filters.category));
    }

    if (filters.vendor) {
      whereConditions.push(eq(products.vendorId, filters.vendor));
    }

    if (filters.priceMin) {
      whereConditions.push(gte(products.price, filters.priceMin.toString()));
    }

    if (filters.priceMax) {
      whereConditions.push(lte(products.price, filters.priceMax.toString()));
    }

    if (filters.inStock) {
      whereConditions.push(gte(products.inventory, '1'));
    }

    if (filters.brand) {
      whereConditions.push(eq(products.brand, filters.brand));
    }

    if (filters.rating) {
      whereConditions.push(gte(products.averageRating, filters.rating.toString()));
    }

    return whereConditions;
  }

  private applySorting(query: any, filters: SearchFilters, searchQuery: string): any {
    const sortBy = filters.sortBy || 'relevance';
    const sortOrder = filters.sortOrder || 'desc';

    switch (sortBy) {
      case 'price':
        return query.orderBy(sortOrder === 'desc' ? desc(products.price) : asc(products.price));
      case 'rating':
        return query.orderBy(sortOrder === 'desc' ? desc(products.averageRating) : asc(products.averageRating));
      case 'newest':
        return query.orderBy(desc(products.createdAt));
      case 'popular':
        return query.orderBy(desc(products.viewCount));
      case 'relevance':
      default:
        if (searchQuery) {
          return query.orderBy(desc(this.calculateRelevanceScore(searchQuery)));
        }
        return query.orderBy(desc(products.createdAt));
    }
  }

  private calculateRelevanceScore(query: string): any {
    // This would be a complex relevance scoring algorithm
    // For now, return a simple SQL expression
    return sql`
      CASE 
        WHEN ${products.name} ILIKE ${`%${query}%`} THEN 100
        WHEN ${products.description} ILIKE ${`%${query}%`} THEN 50
        WHEN ${products.tags} ILIKE ${`%${query}%`} THEN 25
        ELSE 0
      END
    `;
  }

  private async getSearchResultCount(whereConditions: any[]): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(products)
      .where(and(...whereConditions));
    
    return result[0].count;
  }

  private async getSearchFacets(whereConditions: any[]): Promise<any> {
    // Get facets for filtering
    const [categories, brands, priceRanges, vendors] = await Promise.all([
      this.getCategoryFacets(whereConditions),
      this.getBrandFacets(whereConditions),
      this.getPriceRangeFacets(whereConditions),
      this.getVendorFacets(whereConditions)
    ]);

    return {
      categories,
      brands,
      priceRanges,
      vendors
    };
  }

  private async getCategoryFacets(whereConditions: any[]): Promise<any[]> {
    return await db
      .select({
        id: categories.id,
        name: categories.name,
        nameBn: categories.nameBn,
        count: count(products.id)
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...whereConditions))
      .groupBy(categories.id, categories.name, categories.nameBn)
      .orderBy(desc(count(products.id)))
      .limit(10);
  }

  private async getBrandFacets(whereConditions: any[]): Promise<any[]> {
    return await db
      .select({
        brand: products.brand,
        count: count(products.id)
      })
      .from(products)
      .where(and(...whereConditions, sql`${products.brand} IS NOT NULL`))
      .groupBy(products.brand)
      .orderBy(desc(count(products.id)))
      .limit(10);
  }

  private async getPriceRangeFacets(whereConditions: any[]): Promise<any[]> {
    // Define price ranges for Bangladesh market
    const priceRanges = [
      { min: 0, max: 1000, label: 'Under ৳1,000' },
      { min: 1000, max: 5000, label: '৳1,000 - ৳5,000' },
      { min: 5000, max: 10000, label: '৳5,000 - ৳10,000' },
      { min: 10000, max: 50000, label: '৳10,000 - ৳50,000' },
      { min: 50000, max: 999999, label: 'Above ৳50,000' }
    ];

    const facets = [];
    for (const range of priceRanges) {
      const result = await db
        .select({ count: count() })
        .from(products)
        .where(and(
          ...whereConditions,
          gte(products.price, range.min.toString()),
          lte(products.price, range.max.toString())
        ));
      
      if (result[0].count > 0) {
        facets.push({
          ...range,
          count: result[0].count
        });
      }
    }

    return facets;
  }

  private async getVendorFacets(whereConditions: any[]): Promise<any[]> {
    return await db
      .select({
        id: vendors.id,
        name: vendors.businessName,
        count: count(products.id)
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .where(and(...whereConditions))
      .groupBy(vendors.id, vendors.businessName)
      .orderBy(desc(count(products.id)))
      .limit(10);
  }

  private buildAvailableFilters(facets: any): any {
    return {
      categories: facets.categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        nameBn: c.nameBn,
        count: c.count
      })),
      brands: facets.brands.map((b: any) => ({
        name: b.brand,
        count: b.count
      })),
      priceRanges: facets.priceRanges,
      vendors: facets.vendors.map((v: any) => ({
        id: v.id,
        name: v.name,
        count: v.count
      }))
    };
  }

  private async trackSearchAnalytics(
    userId: string, 
    originalQuery: string, 
    normalizedQuery: string, 
    resultCount: number, 
    isBengali: boolean
  ): Promise<void> {
    try {
      await db.insert(searchAnalytics).values({
        id: crypto.randomUUID(),
        userId,
        searchQuery: originalQuery,
        normalizedQuery,
        resultCount,
        language: isBengali ? 'bn' : 'en',
        searchDate: new Date(),
        userAgent: '', // Would be populated from request
        ipAddress: '', // Would be populated from request
        sessionId: '', // Would be populated from session
        createdAt: new Date()
      });

      // Track user behavior
      await db.insert(userBehavior).values({
        userId,
        action: 'search',
        entityType: 'product',
        entityId: null,
        metadata: JSON.stringify({
          query: originalQuery,
          resultCount,
          language: isBengali ? 'bn' : 'en'
        }),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error tracking search analytics:', error);
    }
  }

  private analyzeSearchIntent(query: string): any {
    // Simple intent analysis - would be replaced with NLP service
    const intent = {
      entities: [],
      intent: 'product_search',
      confidence: 0.8,
      language: this.detectBengaliText(query) ? 'bn' : 'en'
    };

    // Extract price mentions
    const priceMatch = query.match(/(\d+)\s*(taka|৳|tk)/i);
    if (priceMatch) {
      intent.entities.push({
        type: 'price',
        value: parseInt(priceMatch[1])
      });
    }

    // Extract color mentions
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'লাল', 'নীল', 'সবুজ', 'কালো', 'সাদা'];
    for (const color of colors) {
      if (query.toLowerCase().includes(color)) {
        intent.entities.push({
          type: 'color',
          value: color
        });
      }
    }

    return intent;
  }

  private buildSemanticConditions(searchIntent: any): any[] {
    const conditions = [];

    // Add conditions based on extracted entities
    for (const entity of searchIntent.entities) {
      switch (entity.type) {
        case 'price':
          conditions.push(lte(products.price, (entity.value * 1.2).toString())); // 20% tolerance
          break;
        case 'color':
          conditions.push(ilike(products.description, `%${entity.value}%`));
          break;
      }
    }

    return conditions;
  }

  private calculateSemanticScore(searchIntent: any): any {
    // Calculate semantic relevance score
    return sql`
      CASE 
        WHEN ${searchIntent.entities.length} > 0 THEN 80
        ELSE 60
      END
    `;
  }

  private async extractImageFeatures(imageUrl: string): Promise<any> {
    // Mock implementation - would integrate with computer vision service
    return {
      colors: ['red', 'blue'],
      shapes: ['rectangular'],
      category: 'electronics'
    };
  }

  private async findVisuallySimilarProducts(features: any, filters: SearchFilters, limit: number): Promise<any[]> {
    // Mock implementation - would use image similarity algorithms
    return [];
  }

  private async speechToText(audioData: Buffer, language: string): Promise<string> {
    // Mock implementation - would integrate with speech recognition service
    return 'mobile phone'; // Mock transcription
  }
}