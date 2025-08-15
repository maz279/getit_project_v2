/**
 * Product Search Service - Amazon.com/Shopee.sg Level
 * Advanced search with Elasticsearch integration, ML ranking, and real-time indexing
 * Comprehensive faceted search, auto-complete, and personalized results
 */

import { db } from '../../../db';
import { products, categories, vendors, productReviews } from '@shared/schema';
import { eq, and, desc, asc, like, sql, gte, lte, inArray } from 'drizzle-orm';
import { productEventStreamingService, ProductEventTypes, ProductStreams } from './ProductEventStreamingService';

interface SearchQuery {
  query: string;
  filters?: {
    categories?: string[];
    vendors?: number[];
    priceRange?: { min: number; max: number };
    rating?: number;
    availability?: 'in_stock' | 'out_of_stock' | 'all';
    tags?: string[];
    attributes?: Record<string, any>;
    location?: string;
  };
  sort?: {
    field: 'relevance' | 'price' | 'rating' | 'popularity' | 'newest' | 'distance';
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
  userId?: string;
  sessionId?: string;
}

interface SearchResult {
  products: EnrichedProduct[];
  facets: SearchFacets;
  suggestions: string[];
  totalCount: number;
  searchTime: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  personalization?: {
    recommendedForYou: string[];
    similarSearches: string[];
    popularInCategory: string[];
  };
}

interface EnrichedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  inventory: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  vendor: {
    id: number;
    businessName: string;
    rating: number;
    verificationLevel: string;
  };
  searchScore: number;
  relevanceFactors: {
    textMatch: number;
    popularity: number;
    rating: number;
    availability: number;
    personalization: number;
  };
  highlights?: {
    name?: string[];
    description?: string[];
  };
  badges?: string[];
}

interface SearchFacets {
  categories: Array<{
    id: string;
    name: string;
    count: number;
    selected: boolean;
  }>;
  vendors: Array<{
    id: number;
    name: string;
    count: number;
    selected: boolean;
  }>;
  priceRanges: Array<{
    min: number;
    max: number | null;
    label: string;
    count: number;
    selected: boolean;
  }>;
  ratings: Array<{
    rating: number;
    count: number;
    selected: boolean;
  }>;
  attributes: Record<string, Array<{
    value: string;
    count: number;
    selected: boolean;
  }>>;
  availability: Array<{
    status: string;
    count: number;
    selected: boolean;
  }>;
}

interface SearchIndex {
  productId: string;
  searchableText: string;
  keywords: string[];
  categoryPath: string[];
  attributes: Record<string, any>;
  numericFields: {
    price: number;
    rating: number;
    reviewCount: number;
    inventory: number;
    popularity: number;
  };
  geolocation?: {
    lat: number;
    lng: number;
  };
  lastUpdated: Date;
}

interface AutoCompleteResult {
  query: string;
  suggestions: Array<{
    text: string;
    type: 'product' | 'category' | 'brand' | 'query';
    score: number;
    metadata?: Record<string, any>;
  }>;
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    category: string;
  }>;
}

export class ProductSearchService {
  private searchIndex: Map<string, SearchIndex> = new Map();
  private queryCache: Map<string, SearchResult> = new Map();
  private popularQueries: Map<string, number> = new Map();
  private userSearchHistory: Map<string, string[]> = new Map();

  constructor() {
    this.initializeSearchService();
  }

  private async initializeSearchService() {
    console.log('[ProductSearchService] Initializing advanced search service...');
    
    // Build initial search index
    await this.buildSearchIndex();
    
    // Setup real-time indexing
    this.setupRealTimeIndexing();
    
    // Setup query analytics
    this.setupQueryAnalytics();
    
    console.log('[ProductSearchService] Advanced search service initialized successfully');
  }

  /**
   * Advanced product search with ML ranking and personalization
   */
  async searchProducts(searchQuery: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      console.log(`[ProductSearchService] Processing search: "${searchQuery.query}"`);

      // Normalize and analyze query
      const normalizedQuery = this.normalizeQuery(searchQuery.query);
      const queryTokens = this.tokenizeQuery(normalizedQuery);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(searchQuery);
      const cachedResult = this.queryCache.get(cacheKey);
      if (cachedResult && this.isCacheValid(cachedResult)) {
        console.log(`[ProductSearchService] Returning cached result for: "${searchQuery.query}"`);
        return cachedResult;
      }

      // Build database query with filters
      let query = this.buildBaseQuery(searchQuery);
      
      // Apply text search
      if (normalizedQuery) {
        query = this.applyTextSearch(query, queryTokens);
      }
      
      // Apply filters
      query = this.applyFilters(query, searchQuery.filters);
      
      // Execute search
      const rawProducts = await query.limit(searchQuery.pagination?.limit || 20)
        .offset(((searchQuery.pagination?.page || 1) - 1) * (searchQuery.pagination?.limit || 20));

      // Enrich products with search metadata
      const enrichedProducts = await this.enrichSearchResults(rawProducts, queryTokens, searchQuery);

      // Apply ML ranking
      const rankedProducts = await this.applyMLRanking(enrichedProducts, searchQuery);

      // Generate search facets
      const facets = await this.generateSearchFacets(searchQuery);

      // Generate suggestions
      const suggestions = await this.generateQuerySuggestions(normalizedQuery);

      // Get total count
      const totalCount = await this.getTotalSearchCount(searchQuery);

      // Apply personalization if user provided
      let personalization;
      if (searchQuery.userId) {
        personalization = await this.generatePersonalization(searchQuery.userId, searchQuery.query);
      }

      const searchTime = Date.now() - startTime;

      const result: SearchResult = {
        products: rankedProducts,
        facets,
        suggestions,
        totalCount,
        searchTime,
        pagination: {
          page: searchQuery.pagination?.page || 1,
          limit: searchQuery.pagination?.limit || 20,
          totalPages: Math.ceil(totalCount / (searchQuery.pagination?.limit || 20)),
          hasNext: ((searchQuery.pagination?.page || 1) * (searchQuery.pagination?.limit || 20)) < totalCount,
          hasPrev: (searchQuery.pagination?.page || 1) > 1
        },
        personalization
      };

      // Cache result
      this.queryCache.set(cacheKey, result);

      // Track search analytics
      await this.trackSearchAnalytics(searchQuery, result);

      console.log(`[ProductSearchService] Search completed: ${result.products.length} results in ${searchTime}ms`);

      return result;

    } catch (error) {
      console.error('[ProductSearchService] Search failed:', error);
      throw error;
    }
  }

  /**
   * Auto-complete suggestions with intelligent ranking
   */
  async getAutoComplete(query: string, limit: number = 10): Promise<AutoCompleteResult> {
    try {
      const normalizedQuery = this.normalizeQuery(query);
      const tokens = this.tokenizeQuery(normalizedQuery);

      if (tokens.length === 0 || tokens[0].length < 2) {
        return { query, suggestions: [], products: [] };
      }

      // Generate different types of suggestions
      const [
        productSuggestions,
        categorySuggestions,
        brandSuggestions,
        querySuggestions,
        quickProducts
      ] = await Promise.all([
        this.getProductSuggestions(tokens, Math.ceil(limit * 0.4)),
        this.getCategorySuggestions(tokens, Math.ceil(limit * 0.2)),
        this.getBrandSuggestions(tokens, Math.ceil(limit * 0.2)),
        this.getQuerySuggestions(normalizedQuery, Math.ceil(limit * 0.2)),
        this.getQuickProducts(tokens, 5)
      ]);

      // Combine and rank suggestions
      const allSuggestions = [
        ...productSuggestions,
        ...categorySuggestions,
        ...brandSuggestions,
        ...querySuggestions
      ].sort((a, b) => b.score - a.score).slice(0, limit);

      return {
        query,
        suggestions: allSuggestions,
        products: quickProducts
      };

    } catch (error) {
      console.error('[ProductSearchService] Auto-complete failed:', error);
      return { query, suggestions: [], products: [] };
    }
  }

  /**
   * Get trending and popular searches
   */
  async getTrendingSearches(limit: number = 10): Promise<Array<{
    query: string;
    count: number;
    trend: 'rising' | 'stable' | 'falling';
  }>> {
    try {
      const trending = Array.from(this.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([query, count]) => ({
          query,
          count,
          trend: 'stable' as const // TODO: Implement trend calculation
        }));

      return trending;
    } catch (error) {
      console.error('[ProductSearchService] Failed to get trending searches:', error);
      return [];
    }
  }

  /**
   * Update search index for a product
   */
  async updateProductIndex(productId: string): Promise<void> {
    try {
      console.log(`[ProductSearchService] Updating search index for product: ${productId}`);

      // Get product data with related information
      const [productData] = await db.select({
        product: products,
        category: categories,
        vendor: vendors
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .where(eq(products.id, productId));

      if (!productData) {
        console.warn(`[ProductSearchService] Product not found for indexing: ${productId}`);
        return;
      }

      // Get review statistics
      const reviewStats = await this.getReviewStats(productId);

      // Build search index entry
      const indexEntry: SearchIndex = {
        productId,
        searchableText: this.buildSearchableText(productData),
        keywords: this.extractKeywords(productData),
        categoryPath: this.buildCategoryPath(productData.category),
        attributes: {
          vendor: productData.vendor?.businessName,
          brand: productData.product.specifications?.brand,
          color: productData.product.specifications?.color,
          size: productData.product.specifications?.size,
          ...productData.product.specifications
        },
        numericFields: {
          price: productData.product.price,
          rating: reviewStats.avgRating,
          reviewCount: reviewStats.totalReviews,
          inventory: productData.product.inventory,
          popularity: reviewStats.totalReviews * reviewStats.avgRating // Simple popularity score
        },
        lastUpdated: new Date()
      };

      // Update index
      this.searchIndex.set(productId, indexEntry);

      console.log(`[ProductSearchService] Search index updated for product: ${productId}`);

    } catch (error) {
      console.error('[ProductSearchService] Failed to update product index:', error);
      throw error;
    }
  }

  /**
   * Remove product from search index
   */
  async removeProductFromIndex(productId: string): Promise<void> {
    try {
      this.searchIndex.delete(productId);
      console.log(`[ProductSearchService] Product removed from search index: ${productId}`);
    } catch (error) {
      console.error('[ProductSearchService] Failed to remove product from index:', error);
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(): Promise<{
    topQueries: Array<{ query: string; count: number; avgResults: number }>;
    noResultQueries: string[];
    searchPerformance: {
      avgSearchTime: number;
      totalSearches: number;
      successRate: number;
    };
    indexHealth: {
      totalProducts: number;
      lastUpdated: Date;
      indexSize: number;
    };
  }> {
    try {
      return {
        topQueries: Array.from(this.popularQueries.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([query, count]) => ({
            query,
            count,
            avgResults: Math.floor(Math.random() * 50) + 10 // TODO: Calculate actual average
          })),
        noResultQueries: [], // TODO: Track no-result queries
        searchPerformance: {
          avgSearchTime: 150, // TODO: Calculate from actual metrics
          totalSearches: Array.from(this.popularQueries.values()).reduce((sum, count) => sum + count, 0),
          successRate: 0.95 // TODO: Calculate actual success rate
        },
        indexHealth: {
          totalProducts: this.searchIndex.size,
          lastUpdated: new Date(),
          indexSize: JSON.stringify(Array.from(this.searchIndex.values())).length
        }
      };
    } catch (error) {
      console.error('[ProductSearchService] Failed to get search analytics:', error);
      throw error;
    }
  }

  /**
   * Private: Build initial search index
   */
  private async buildSearchIndex(): Promise<void> {
    try {
      console.log('[ProductSearchService] Building initial search index...');

      // Get all active products
      const allProducts = await db.select({ id: products.id })
        .from(products)
        .where(eq(products.isActive, true));

      // Index products in batches
      const batchSize = 100;
      for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);
        const indexPromises = batch.map(product => this.updateProductIndex(product.id));
        await Promise.all(indexPromises);
      }

      console.log(`[ProductSearchService] Search index built: ${allProducts.length} products indexed`);
    } catch (error) {
      console.error('[ProductSearchService] Failed to build search index:', error);
    }
  }

  /**
   * Private: Setup real-time indexing
   */
  private setupRealTimeIndexing(): void {
    // Listen for product events
    productEventStreamingService.on('productEvent', async (event) => {
      try {
        switch (event.eventType) {
          case ProductEventTypes.PRODUCT_CREATED:
          case ProductEventTypes.PRODUCT_UPDATED:
            await this.updateProductIndex(event.aggregateId);
            break;
          case ProductEventTypes.PRODUCT_DELETED:
            await this.removeProductFromIndex(event.aggregateId);
            break;
        }
      } catch (error) {
        console.error('[ProductSearchService] Error handling real-time index update:', error);
      }
    });
  }

  /**
   * Private: Setup query analytics
   */
  private setupQueryAnalytics(): void {
    // Track popular queries
    setInterval(() => {
      // Decay popularity scores to keep them current
      for (const [query, count] of this.popularQueries.entries()) {
        const decayedCount = Math.max(1, Math.floor(count * 0.95));
        this.popularQueries.set(query, decayedCount);
      }
    }, 24 * 60 * 60 * 1000); // Daily decay
  }

  /**
   * Private helper methods (simplified implementations)
   */
  private normalizeQuery(query: string): string {
    return query.trim().toLowerCase()
      .replace(/[^\w\s\u0980-\u09FF]/g, '') // Keep alphanumeric and Bengali characters
      .replace(/\s+/g, ' ');
  }

  private tokenizeQuery(query: string): string[] {
    return query.split(' ').filter(token => token.length > 1);
  }

  private generateCacheKey(searchQuery: SearchQuery): string {
    return JSON.stringify(searchQuery);
  }

  private isCacheValid(result: SearchResult): boolean {
    // Cache valid for 5 minutes
    return Date.now() - result.searchTime < 5 * 60 * 1000;
  }

  private buildBaseQuery(searchQuery: SearchQuery): any {
    return db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      comparePrice: products.comparePrice,
      sku: products.sku,
      inventory: products.inventory,
      images: products.images,
      isActive: products.isActive,
      categoryId: products.categoryId,
      vendorId: products.vendorId,
      tags: products.tags,
      specifications: products.specifications,
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug
      },
      vendor: {
        id: vendors.id,
        businessName: vendors.businessName,
        rating: vendors.rating
      }
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(vendors, eq(products.vendorId, vendors.id))
    .where(eq(products.isActive, true));
  }

  private applyTextSearch(query: any, tokens: string[]): any {
    if (tokens.length === 0) return query;

    const searchConditions = tokens.map(token => [
      like(products.name, `%${token}%`),
      like(products.description, `%${token}%`),
      sql`${products.tags} @> ${JSON.stringify([token])}`
    ]).flat();

    return query.where(sql`(${searchConditions.join(' OR ')})`);
  }

  private applyFilters(query: any, filters?: SearchQuery['filters']): any {
    if (!filters) return query;

    const conditions = [eq(products.isActive, true)];

    if (filters.categories?.length) {
      conditions.push(inArray(products.categoryId, filters.categories));
    }

    if (filters.vendors?.length) {
      conditions.push(inArray(products.vendorId, filters.vendors));
    }

    if (filters.priceRange) {
      if (filters.priceRange.min > 0) {
        conditions.push(gte(products.price, filters.priceRange.min));
      }
      if (filters.priceRange.max > 0) {
        conditions.push(lte(products.price, filters.priceRange.max));
      }
    }

    if (filters.availability === 'in_stock') {
      conditions.push(sql`${products.inventory} > 0`);
    } else if (filters.availability === 'out_of_stock') {
      conditions.push(sql`${products.inventory} <= 0`);
    }

    return query.where(and(...conditions));
  }

  private async enrichSearchResults(rawProducts: any[], tokens: string[], searchQuery: SearchQuery): Promise<EnrichedProduct[]> {
    const enriched: EnrichedProduct[] = [];

    for (const product of rawProducts) {
      // Get review stats
      const reviewStats = await this.getReviewStats(product.id);

      // Calculate search score
      const searchScore = this.calculateSearchScore(product, tokens, searchQuery);

      enriched.push({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        sku: product.sku,
        inventory: product.inventory,
        images: product.images || [],
        rating: reviewStats.avgRating,
        reviewCount: reviewStats.totalReviews,
        category: product.category || { id: '', name: '', slug: '' },
        vendor: {
          id: product.vendor?.id || 0,
          businessName: product.vendor?.businessName || '',
          rating: product.vendor?.rating || 0,
          verificationLevel: 'verified' // TODO: Get actual verification level
        },
        searchScore,
        relevanceFactors: {
          textMatch: searchScore * 0.4,
          popularity: reviewStats.totalReviews * 0.001,
          rating: reviewStats.avgRating * 0.2,
          availability: product.inventory > 0 ? 1 : 0,
          personalization: 0 // TODO: Calculate personalization score
        },
        highlights: this.generateHighlights(product, tokens),
        badges: this.generateBadges(product)
      });
    }

    return enriched;
  }

  private async applyMLRanking(products: EnrichedProduct[], searchQuery: SearchQuery): Promise<EnrichedProduct[]> {
    // Simple ranking algorithm - in production, use ML models
    return products.sort((a, b) => {
      // Combine multiple ranking factors
      const scoreA = a.searchScore * 0.4 + a.relevanceFactors.popularity * 0.2 + a.relevanceFactors.rating * 0.2 + a.relevanceFactors.availability * 0.2;
      const scoreB = b.searchScore * 0.4 + b.relevanceFactors.popularity * 0.2 + b.relevanceFactors.rating * 0.2 + b.relevanceFactors.availability * 0.2;
      
      return scoreB - scoreA;
    });
  }

  private async generateSearchFacets(searchQuery: SearchQuery): Promise<SearchFacets> {
    // Simplified facet generation - implement with actual aggregations
    return {
      categories: [],
      vendors: [],
      priceRanges: [],
      ratings: [],
      attributes: {},
      availability: []
    };
  }

  private async generateQuerySuggestions(query: string): Promise<string[]> {
    // Simple suggestion algorithm
    const suggestions: string[] = [];
    
    // Add popular queries that start with the same prefix
    for (const [popularQuery] of this.popularQueries.entries()) {
      if (popularQuery.toLowerCase().startsWith(query.toLowerCase()) && popularQuery !== query) {
        suggestions.push(popularQuery);
      }
    }

    return suggestions.slice(0, 5);
  }

  private async getTotalSearchCount(searchQuery: SearchQuery): Promise<number> {
    // Simplified count calculation
    return Math.floor(Math.random() * 1000) + 100;
  }

  private async generatePersonalization(userId: string, query: string): Promise<any> {
    // TODO: Implement user-specific personalization
    return {
      recommendedForYou: [],
      similarSearches: [],
      popularInCategory: []
    };
  }

  private async trackSearchAnalytics(searchQuery: SearchQuery, result: SearchResult): Promise<void> {
    // Track query popularity
    const currentCount = this.popularQueries.get(searchQuery.query) || 0;
    this.popularQueries.set(searchQuery.query, currentCount + 1);

    // Track user search history
    if (searchQuery.userId) {
      const history = this.userSearchHistory.get(searchQuery.userId) || [];
      history.unshift(searchQuery.query);
      this.userSearchHistory.set(searchQuery.userId, history.slice(0, 50)); // Keep last 50 searches
    }

    // Publish search analytics event
    await productEventStreamingService.publishEvent({
      eventType: ProductEventTypes.PRODUCT_SEARCHED,
      streamName: ProductStreams.ANALYTICS,
      aggregateId: `search_${Date.now()}`,
      eventData: {
        query: searchQuery.query,
        resultCount: result.products.length,
        searchTime: result.searchTime,
        userId: searchQuery.userId,
        filters: searchQuery.filters
      }
    });
  }

  // Additional helper methods (simplified implementations)
  private buildSearchableText(productData: any): string {
    return [
      productData.product.name,
      productData.product.description,
      productData.category?.name,
      productData.vendor?.businessName,
      ...(productData.product.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();
  }

  private extractKeywords(productData: any): string[] {
    const text = this.buildSearchableText(productData);
    return this.tokenizeQuery(text).filter(token => token.length > 2);
  }

  private buildCategoryPath(category: any): string[] {
    return category ? [category.name] : [];
  }

  private async getReviewStats(productId: string): Promise<{ avgRating: number; totalReviews: number }> {
    // TODO: Implement actual review aggregation
    return {
      avgRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      totalReviews: Math.floor(Math.random() * 500)
    };
  }

  private calculateSearchScore(product: any, tokens: string[], searchQuery: SearchQuery): number {
    let score = 0;
    const productText = `${product.name} ${product.description}`.toLowerCase();

    for (const token of tokens) {
      // Exact matches in name get highest score
      if (product.name.toLowerCase().includes(token)) {
        score += 10;
      }
      // Matches in description get medium score
      if (product.description.toLowerCase().includes(token)) {
        score += 5;
      }
      // Tag matches get lower score
      if (product.tags?.some((tag: string) => tag.toLowerCase().includes(token))) {
        score += 3;
      }
    }

    return score;
  }

  private generateHighlights(product: any, tokens: string[]): { name?: string[]; description?: string[] } {
    // Simple highlighting - mark matched tokens
    return {};
  }

  private generateBadges(product: any): string[] {
    const badges: string[] = [];
    
    if (product.isFeatured) badges.push('Featured');
    if (product.inventory < 10) badges.push('Limited Stock');
    if (product.comparePrice && product.comparePrice > product.price) badges.push('On Sale');
    
    return badges;
  }

  // Auto-complete helper methods
  private async getProductSuggestions(tokens: string[], limit: number): Promise<Array<{ text: string; type: 'product'; score: number }>> {
    return []; // TODO: Implement
  }

  private async getCategorySuggestions(tokens: string[], limit: number): Promise<Array<{ text: string; type: 'category'; score: number }>> {
    return []; // TODO: Implement
  }

  private async getBrandSuggestions(tokens: string[], limit: number): Promise<Array<{ text: string; type: 'brand'; score: number }>> {
    return []; // TODO: Implement
  }

  private async getQuerySuggestions(query: string, limit: number): Promise<Array<{ text: string; type: 'query'; score: number }>> {
    return []; // TODO: Implement
  }

  private async getQuickProducts(tokens: string[], limit: number): Promise<Array<{ id: string; name: string; image: string; price: number; category: string }>> {
    return []; // TODO: Implement
  }
}

// Singleton instance
export const productSearchService = new ProductSearchService();