import { Request, Response } from 'express';
import { storage } from '../../../../storage';
import { loggingService } from '../../../../services/LoggingService';
import { 
  popularSearches, 
  searchQueries,
  searchUserBehavior,
  InsertPopularSearch
} from '@shared/schema';
import { db } from '../../../../db';
import { and, eq, desc, asc, like, ilike, gte, lte, sql, count } from 'drizzle-orm';

/**
 * Enterprise-grade Autocomplete Controller for Amazon.com/Shopee.sg-level search suggestions
 * Handles intelligent search suggestions, typo correction, and multi-language autocomplete
 * Integrated with user behavior, trending searches, and Bangladesh cultural context
 */
export class AutocompleteController {
  private logger: typeof loggingService;

  constructor() {
    this.logger = loggingService;
  }

  /**
   * Real-time search suggestions with intelligent ranking
   * Multi-language support with Bengali/English mixed suggestions
   */
  async getSearchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const {
        q: query,
        language = 'auto', // auto, en, bn, mixed
        limit = 10,
        includeCategories = true,
        includeProducts = true,
        includeTrending = true,
        includePersonalized = false,
        userId,
        location,
        typoCorrection = true,
        contextualSuggestions = true
      } = req.query;

      if (!query || typeof query !== 'string' || query.length < 1) {
        res.json({
          success: true,
          suggestions: [],
          metadata: {
            query: '',
            language: 'auto',
            totalSuggestions: 0
          }
        });
        return;
      }

      // Detect language if auto
      const detectedLanguage = language === 'auto' ? this.detectLanguage(query) : language;

      // Get suggestions from multiple sources
      const [
        popularSuggestions,
        productSuggestions,
        categorySuggestions,
        trendingSuggestions,
        personalizedSuggestions,
        correctedSuggestions
      ] = await Promise.all([
        this.getPopularSuggestions(query, detectedLanguage as string, Math.ceil(parseInt(limit as string) * 0.4)),
        includeProducts === 'true' ? this.getProductSuggestions(query, detectedLanguage as string, Math.ceil(parseInt(limit as string) * 0.3)) : [],
        includeCategories === 'true' ? this.getCategorySuggestions(query, detectedLanguage as string, Math.ceil(parseInt(limit as string) * 0.2)) : [],
        includeTrending === 'true' ? this.getTrendingSuggestions(query, detectedLanguage as string, location as string, Math.ceil(parseInt(limit as string) * 0.3)) : [],
        includePersonalized === 'true' && userId ? this.getPersonalizedSuggestions(query, userId as string, detectedLanguage as string, Math.ceil(parseInt(limit as string) * 0.3)) : [],
        typoCorrection === 'true' ? this.getTypoCorrectionSuggestions(query, detectedLanguage as string) : []
      ]);

      // Combine and rank suggestions
      const combinedSuggestions = await this.combineAndRankSuggestions({
        query,
        language: detectedLanguage as string,
        popular: popularSuggestions,
        products: productSuggestions,
        categories: categorySuggestions,
        trending: trendingSuggestions,
        personalized: personalizedSuggestions,
        corrected: correctedSuggestions,
        limit: parseInt(limit as string)
      });

      // Add contextual suggestions if requested
      if (contextualSuggestions === 'true') {
        combinedSuggestions.contextual = await this.getContextualSuggestions(query, detectedLanguage as string, location as string);
      }

      // Track suggestion display for analytics
      await this.trackSuggestionDisplay(query, combinedSuggestions.suggestions, userId as string, detectedLanguage as string);

      res.json({
        success: true,
        query,
        language: detectedLanguage,
        suggestions: combinedSuggestions.suggestions,
        contextual: combinedSuggestions.contextual || null,
        metadata: {
          totalSuggestions: combinedSuggestions.suggestions.length,
          sources: combinedSuggestions.sources,
          hasTypoCorrection: correctedSuggestions.length > 0,
          responseTime: combinedSuggestions.responseTime
        }
      });

    } catch (error) {
      this.logger.logError('Error in search suggestions', error as Error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        suggestions: []
      });
    }
  }

  /**
   * Bengali (Bangla) autocomplete with phonetic support
   * Handles Bengali script, phonetic conversion, and cultural context
   */
  async getBanglaAutocomplete(req: Request, res: Response): Promise<void> {
    try {
      const {
        q: query,
        inputMethod = 'phonetic', // phonetic, direct, mixed
        includePhoneticConversion = true,
        includeCulturalTerms = true,
        includePopularPhrases = true,
        region, // dhaka, chittagong, sylhet, etc.
        limit = 15
      } = req.query;

      if (!query || typeof query !== 'string') {
        res.json({
          success: true,
          suggestions: [],
          metadata: { query: '', inputMethod, totalSuggestions: 0 }
        });
        return;
      }

      // Handle phonetic conversion if needed
      let processedQuery = query;
      let phoneticSuggestions = [];

      if (includePhoneticConversion === 'true' && inputMethod === 'phonetic') {
        const phoneticResults = await this.processPhoneticInput(query);
        processedQuery = phoneticResults.converted;
        phoneticSuggestions = phoneticResults.suggestions;
      }

      // Get Bengali-specific suggestions
      const [
        banglaSuggestions,
        culturalSuggestions,
        popularPhrases,
        regionalSuggestions
      ] = await Promise.all([
        this.getBengaliSuggestions(processedQuery, parseInt(limit as string)),
        includeCulturalTerms === 'true' ? this.getCulturalTermSuggestions(processedQuery, region as string) : [],
        includePopularPhrases === 'true' ? this.getPopularBengaliPhrases(processedQuery) : [],
        region ? this.getRegionalSuggestions(processedQuery, region as string) : []
      ]);

      // Combine Bengali suggestions with ranking
      const combinedSuggestions = await this.combineBengaliSuggestions({
        query: processedQuery,
        original: query,
        phonetic: phoneticSuggestions,
        bangla: banglaSuggestions,
        cultural: culturalSuggestions,
        phrases: popularPhrases,
        regional: regionalSuggestions,
        limit: parseInt(limit as string)
      });

      // Add language metadata
      const metadata = {
        query,
        processedQuery,
        inputMethod,
        language: 'bengali',
        totalSuggestions: combinedSuggestions.length,
        hasPhoneticConversion: phoneticSuggestions.length > 0,
        region: region || 'all_bangladesh'
      };

      res.json({
        success: true,
        suggestions: combinedSuggestions,
        phonetic: phoneticSuggestions.length > 0 ? {
          original: query,
          converted: processedQuery,
          alternatives: phoneticSuggestions
        } : null,
        cultural: {
          culturalTerms: culturalSuggestions.slice(0, 5),
          popularPhrases: popularPhrases.slice(0, 5),
          regionalContext: region ? this.getRegionalContext(region as string) : null
        },
        metadata
      });

    } catch (error) {
      this.logger.logError('Error in Bangla autocomplete', error as Error);
      res.status(500).json({
        success: false,
        error: 'অভ্যন্তরীণ সার্ভার ত্রুটি', // Internal server error in Bengali
        message: 'Internal server error',
        suggestions: []
      });
    }
  }

  /**
   * Product name suggestions with inventory awareness
   * Real-time product matching with availability and pricing
   */
  async getProductSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const {
        q: query,
        category,
        priceRange,
        inStockOnly = true,
        includeBrand = true,
        includeVariants = false,
        sortBy = 'popularity', // popularity, price, rating, name
        limit = 20
      } = req.query;

      if (!query || typeof query !== 'string') {
        res.json({
          success: true,
          products: [],
          metadata: { query: '', totalProducts: 0 }
        });
        return;
      }

      // Get product suggestions with filters
      const productSuggestions = await this.getAdvancedProductSuggestions({
        query,
        category: category as string,
        priceRange: priceRange as string,
        inStockOnly: inStockOnly === 'true',
        includeBrand: includeBrand === 'true',
        includeVariants: includeVariants === 'true',
        sortBy: sortBy as string,
        limit: parseInt(limit as string)
      });

      // Add brand suggestions if requested
      let brandSuggestions = [];
      if (includeBrand === 'true') {
        brandSuggestions = await this.getBrandSuggestions(query, parseInt(limit as string) / 4);
      }

      // Calculate suggestion scores
      const scoredSuggestions = await this.scoreProductSuggestions(productSuggestions, query);

      res.json({
        success: true,
        query,
        products: scoredSuggestions,
        brands: brandSuggestions,
        metadata: {
          totalProducts: scoredSuggestions.length,
          totalBrands: brandSuggestions.length,
          filters: {
            category: category || null,
            priceRange: priceRange || null,
            inStockOnly: inStockOnly === 'true'
          },
          sorting: sortBy
        }
      });

    } catch (error) {
      this.logger.logError('Error in product suggestions', error as Error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        products: []
      });
    }
  }

  /**
   * Popular search suggestions based on trending queries
   * Real-time trending analysis with cultural and regional context
   */
  async getPopularSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const {
        q: query,
        timeframe = '24h', // 1h, 24h, 7d, 30d
        region,
        language = 'all',
        category,
        includeGrowthRate = true,
        includeCulturalContext = true,
        limit = 15
      } = req.query;

      if (!query || typeof query !== 'string') {
        res.json({
          success: true,
          suggestions: [],
          metadata: { query: '', totalSuggestions: 0 }
        });
        return;
      }

      // Get popular suggestions with filters
      const popularSuggestions = await this.getFilteredPopularSuggestions({
        query,
        timeframe: timeframe as string,
        region: region as string,
        language: language as string,
        category: category as string,
        limit: parseInt(limit as string)
      });

      // Add growth rate information if requested
      if (includeGrowthRate === 'true') {
        await this.addGrowthRateData(popularSuggestions);
      }

      // Add cultural context for Bangladesh market
      let culturalContext = null;
      if (includeCulturalContext === 'true') {
        culturalContext = await this.addCulturalContextToSuggestions(popularSuggestions, region as string);
      }

      // Calculate suggestion metadata
      const metadata = {
        query,
        timeframe,
        region: region || 'all_bangladesh',
        language,
        totalSuggestions: popularSuggestions.length,
        hasGrowthData: includeGrowthRate === 'true',
        hasCulturalContext: includeCulturalContext === 'true'
      };

      res.json({
        success: true,
        suggestions: popularSuggestions,
        cultural: culturalContext,
        trending: {
          fastRising: popularSuggestions.filter(s => s.growthRate > 50).slice(0, 5),
          steady: popularSuggestions.filter(s => s.growthRate >= 0 && s.growthRate <= 50).slice(0, 5),
          seasonal: popularSuggestions.filter(s => s.seasonal).slice(0, 3)
        },
        metadata
      });

    } catch (error) {
      this.logger.logError('Error in popular suggestions', error as Error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        suggestions: []
      });
    }
  }

  // Private helper methods for suggestion generation

  private detectLanguage(query: string): string {
    // Detect if query contains Bengali characters
    const bengaliRegex = /[\u0980-\u09FF]/;
    const englishRegex = /[a-zA-Z]/;
    
    const hasBengali = bengaliRegex.test(query);
    const hasEnglish = englishRegex.test(query);
    
    if (hasBengali && hasEnglish) return 'mixed';
    if (hasBengali) return 'bn';
    if (hasEnglish) return 'en';
    
    return 'auto';
  }

  private async getPopularSuggestions(query: string, language: string, limit: number) {
    // Get popular searches from database
    const popularQueries = await db
      .select()
      .from(popularSearches)
      .where(
        and(
          ilike(popularSearches.queryText, `%${query}%`),
          language !== 'auto' ? eq(popularSearches.language, language) : undefined
        )
      )
      .orderBy(desc(popularSearches.searchCount))
      .limit(limit);

    return popularQueries.map(item => ({
      text: item.queryText,
      type: 'popular',
      score: this.calculatePopularityScore(item.searchCount || 0, item.trendingScore || 0),
      searchCount: item.searchCount,
      language: item.language,
      category: item.category
    }));
  }

  private async getProductSuggestions(query: string, language: string, limit: number) {
    // Get product suggestions from storage
    const products = await storage.searchProducts(query);
    
    return products.slice(0, limit).map(product => ({
      text: product.name,
      type: 'product',
      score: this.calculateProductScore(product),
      productId: product.id,
      price: product.price,
      imageUrl: product.imageUrl,
      inStock: (product.inventory || 0) > 0,
      category: product.categoryId
    }));
  }

  private async getCategorySuggestions(query: string, language: string, limit: number) {
    // Get category suggestions
    const categories = await storage.getCategories();
    
    const matchingCategories = categories.filter(category => {
      const nameMatch = category.name.toLowerCase().includes(query.toLowerCase());
      const bnNameMatch = category.nameBn?.toLowerCase().includes(query.toLowerCase());
      return nameMatch || (language === 'bn' && bnNameMatch);
    });

    return matchingCategories.slice(0, limit).map(category => ({
      text: language === 'bn' && category.nameBn ? category.nameBn : category.name,
      type: 'category',
      score: 0.7,
      categoryId: category.id,
      productCount: Math.floor(Math.random() * 1000), // Would be real count in production
      language: language === 'bn' && category.nameBn ? 'bn' : 'en'
    }));
  }

  private async getTrendingSuggestions(query: string, language: string, location: string, limit: number) {
    // Get trending suggestions based on recent search behavior
    const timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    const trendingQueries = await db
      .select({
        queryText: searchQueries.queryText,
        count: count(),
      })
      .from(searchQueries)
      .where(
        and(
          gte(searchQueries.searchTime, timeRange),
          ilike(searchQueries.queryText, `%${query}%`),
          language !== 'auto' ? eq(searchQueries.language, language) : undefined
        )
      )
      .groupBy(searchQueries.queryText)
      .orderBy(desc(count()))
      .limit(limit);

    return trendingQueries.map(item => ({
      text: item.queryText,
      type: 'trending',
      score: 0.8,
      trendingCount: item.count,
      timeframe: '24h',
      isRising: true
    }));
  }

  private async getPersonalizedSuggestions(query: string, userId: string, language: string, limit: number) {
    // Get personalized suggestions based on user search history
    const userQueries = await db
      .select()
      .from(searchQueries)
      .where(
        and(
          eq(sql`${searchQueries.userId}::text`, userId),
          ilike(searchQueries.queryText, `%${query}%`)
        )
      )
      .orderBy(desc(searchQueries.searchTime))
      .limit(limit);

    return userQueries.map(item => ({
      text: item.queryText,
      type: 'personalized',
      score: 0.9,
      lastSearched: item.searchTime,
      language: item.language,
      personalRelevance: 'high'
    }));
  }

  private async getTypoCorrectionSuggestions(query: string, language: string) {
    // Simple typo correction implementation
    // In production, this would use advanced spell checking algorithms
    const corrections = [];
    
    // Common typo patterns
    const typoPatterns = {
      'smartphone': ['smart phone', 'smatrphone', 'smartphone'],
      'laptop': ['leptop', 'laptap', 'labtop'],
      'শাড়ি': ['saree', 'shari', 'sharee']
    };

    Object.entries(typoPatterns).forEach(([correct, typos]) => {
      typos.forEach(typo => {
        if (this.calculateLevenshteinDistance(query.toLowerCase(), typo.toLowerCase()) <= 2) {
          corrections.push({
            text: correct,
            type: 'correction',
            score: 0.6,
            original: query,
            corrected: correct,
            confidence: 0.8
          });
        }
      });
    });

    return corrections;
  }

  private async combineAndRankSuggestions(params: any) {
    const startTime = Date.now();
    const { query, language, popular, products, categories, trending, personalized, corrected, limit } = params;
    
    // Combine all suggestions
    const allSuggestions = [
      ...popular,
      ...products,
      ...categories,
      ...trending,
      ...personalized,
      ...corrected
    ];

    // Remove duplicates based on text
    const uniqueSuggestions = allSuggestions.reduce((acc: any[], current) => {
      const exists = acc.find(item => item.text.toLowerCase() === current.text.toLowerCase());
      if (!exists) {
        acc.push(current);
      } else {
        // Merge scores for duplicates
        exists.score = Math.max(exists.score, current.score);
        exists.sources = exists.sources ? [...exists.sources, current.type] : [exists.type, current.type];
      }
      return acc;
    }, []);

    // Apply final ranking with query relevance
    const rankedSuggestions = uniqueSuggestions.map(suggestion => ({
      ...suggestion,
      relevanceScore: this.calculateRelevanceScore(suggestion.text, query),
      finalScore: (suggestion.score * 0.7) + (this.calculateRelevanceScore(suggestion.text, query) * 0.3)
    }));

    // Sort by final score and limit results
    rankedSuggestions.sort((a, b) => b.finalScore - a.finalScore);
    const limitedSuggestions = rankedSuggestions.slice(0, limit);

    const responseTime = Date.now() - startTime;

    return {
      suggestions: limitedSuggestions,
      sources: {
        popular: popular.length,
        products: products.length,
        categories: categories.length,
        trending: trending.length,
        personalized: personalized.length,
        corrected: corrected.length
      },
      responseTime
    };
  }

  private async getContextualSuggestions(query: string, language: string, location: string) {
    // Contextual suggestions based on location, time, and cultural events
    const contextual = {
      location: location ? await this.getLocationBasedSuggestions(query, location) : [],
      seasonal: await this.getSeasonalSuggestions(query),
      cultural: await this.getCulturalSuggestions(query),
      timeOfDay: await this.getTimeOfDaySuggestions(query)
    };

    return contextual;
  }

  private async processPhoneticInput(query: string) {
    // Phonetic conversion for Bengali input
    const phoneticMap = {
      'ami': 'আমি',
      'tumi': 'তুমি',
      'bhalo': 'ভালো',
      'kemon': 'কেমন',
      'sharee': 'শাড়ি',
      'panjabi': 'পাঞ্জাবি'
    };

    const converted = phoneticMap[query.toLowerCase()] || query;
    const suggestions = Object.entries(phoneticMap)
      .filter(([phonetic]) => phonetic.includes(query.toLowerCase()))
      .map(([phonetic, bengali]) => ({
        phonetic,
        bengali,
        score: this.calculatePhoneticScore(query, phonetic)
      }));

    return {
      converted,
      suggestions
    };
  }

  private async getBengaliSuggestions(query: string, limit: number) {
    // Bengali-specific suggestions
    const bengaliTerms = [
      'শাড়ি', 'পাঞ্জাবি', 'লুঙ্গি', 'কুর্তা', 'ফতুয়া',
      'ইলিশ', 'ভাত', 'ডাল', 'তরকারি',
      'মোবাইল', 'ল্যাপটপ', 'কম্পিউটার'
    ];

    return bengaliTerms
      .filter(term => term.includes(query) || query.includes(term))
      .slice(0, limit)
      .map(term => ({
        text: term,
        type: 'bengali',
        score: 0.8,
        language: 'bn',
        category: this.detectBengaliCategory(term)
      }));
  }

  private async getCulturalTermSuggestions(query: string, region: string) {
    // Cultural and traditional terms relevant to Bangladesh
    const culturalTerms = {
      'eid': ['ইদের পোশাক', 'ইদের কেক', 'ইদের গিফট'],
      'pohela': ['পহেলা বৈশাখের পোশাক', 'বাংলা নববর্ষ'],
      'winter': ['শীতের পোশাক', 'চাদর', 'কম্বল'],
      'festival': ['উৎসবের পোশাক', 'পার্টি ড্রেস']
    };

    const matches = [];
    Object.entries(culturalTerms).forEach(([key, terms]) => {
      if (query.toLowerCase().includes(key)) {
        terms.forEach(term => {
          matches.push({
            text: term,
            type: 'cultural',
            score: 0.85,
            culturalContext: key,
            region: region || 'bangladesh'
          });
        });
      }
    });

    return matches;
  }

  private async getPopularBengaliPhrases(query: string) {
    // Popular Bengali phrases and expressions
    const phrases = [
      'ভালো দাম', 'কম দামে', 'সেরা মান', 'দ্রুত ডেলিভারি',
      'ফ্রি শিপিং', 'ছাড়ে কিনুন', 'অফার প্রাইস'
    ];

    return phrases
      .filter(phrase => phrase.includes(query) || this.calculateSimilarity(phrase, query) > 0.3)
      .map(phrase => ({
        text: phrase,
        type: 'phrase',
        score: 0.7,
        language: 'bn',
        usage: 'common'
      }));
  }

  private async getRegionalSuggestions(query: string, region: string) {
    // Regional suggestions based on Bangladesh divisions
    const regionalTerms = {
      'dhaka': ['ঢাকার পোশাক', 'ঢাকাই জামদানি', 'পুরান ঢাকা'],
      'chittagong': ['চট্টগ্রামের শুটকি', 'চিটাগাং স্টাইল'],
      'sylhet': ['সিলেটি চা', 'সিলেটের মিষ্টি'],
      'rajshahi': ['রাজশাহীর সিল্ক', 'রাজশাহীর আম']
    };

    const terms = regionalTerms[region] || [];
    return terms
      .filter(term => term.includes(query) || this.calculateSimilarity(term, query) > 0.2)
      .map(term => ({
        text: term,
        type: 'regional',
        score: 0.75,
        region,
        specialty: true
      }));
  }

  private async combineBengaliSuggestions(params: any) {
    const { query, bangla, cultural, phrases, regional, limit } = params;
    
    const allSuggestions = [
      ...bangla,
      ...cultural,
      ...phrases,
      ...regional
    ];

    // Remove duplicates and rank by relevance
    const uniqueSuggestions = allSuggestions.reduce((acc: any[], current) => {
      const exists = acc.find(item => item.text === current.text);
      if (!exists) {
        acc.push({
          ...current,
          relevance: this.calculateBengaliRelevance(current.text, query)
        });
      }
      return acc;
    }, []);

    uniqueSuggestions.sort((a, b) => b.relevance - a.relevance);
    return uniqueSuggestions.slice(0, limit);
  }

  private getRegionalContext(region: string) {
    const contexts = {
      'dhaka': {
        specialties: ['জামদানি', 'ঢাকাই মসলিন', 'পুরান ঢাকার খাবার'],
        language: 'standard_bengali',
        culturalEvents: ['ঢাকা আর্ট সামিট', 'একুশে বইমেলা']
      },
      'chittagong': {
        specialties: ['শুটকি', 'সামুদ্রিক মাছ', 'পাহাড়ি ফল'],
        language: 'chittagonian',
        culturalEvents: ['চট্টগ্রাম লোকসংস্কৃতি']
      },
      'sylhet': {
        specialties: ['চা', 'সিলেটি মিষ্টি', 'হাওর অঞ্চলের মাছ'],
        language: 'sylheti',
        culturalEvents: ['সিলেট উৎসব']
      }
    };

    return contexts[region] || contexts['dhaka'];
  }

  private async getAdvancedProductSuggestions(params: any) {
    const { query, category, priceRange, inStockOnly, sortBy, limit } = params;
    
    // Get products with advanced filtering
    let products = await storage.searchProducts(query);
    
    // Apply filters
    if (category) {
      products = products.filter(p => p.categoryId === category);
    }
    
    if (inStockOnly) {
      products = products.filter(p => (p.inventory || 0) > 0);
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      products = products.filter(p => {
        const price = parseFloat(p.price);
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    products = this.sortProducts(products, sortBy);
    
    return products.slice(0, limit);
  }

  private async getBrandSuggestions(query: string, limit: number) {
    // Get brand suggestions
    const products = await storage.getProducts(200);
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    
    const matchingBrands = brands
      .filter(brand => brand.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);

    return matchingBrands.map(brand => ({
      text: brand,
      type: 'brand',
      score: 0.6,
      productCount: products.filter(p => p.brand === brand).length
    }));
  }

  private async scoreProductSuggestions(products: any[], query: string) {
    return products.map(product => ({
      ...product,
      suggestionScore: this.calculateProductSuggestionScore(product, query),
      relevance: this.calculateRelevanceScore(product.name, query)
    }));
  }

  private async getFilteredPopularSuggestions(params: any) {
    const { query, timeframe, region, language, category, limit } = params;
    
    // Calculate time range
    const timeRange = this.calculateTimeRange(timeframe);
    
    // Query popular searches with filters
    const popularQueries = await db
      .select()
      .from(popularSearches)
      .where(
        and(
          ilike(popularSearches.queryText, `%${query}%`),
          gte(popularSearches.lastSearchedAt, timeRange.start),
          language !== 'all' ? eq(popularSearches.language, language) : undefined,
          region ? eq(popularSearches.region, region) : undefined,
          category ? eq(popularSearches.category, category) : undefined
        )
      )
      .orderBy(desc(popularSearches.trendingScore))
      .limit(limit);

    return popularQueries.map(item => ({
      text: item.queryText,
      type: 'popular',
      score: this.calculatePopularityScore(item.searchCount || 0, item.trendingScore || 0),
      searchCount: item.searchCount,
      trendingScore: item.trendingScore,
      category: item.category,
      region: item.region,
      language: item.language,
      lastSearched: item.lastSearchedAt
    }));
  }

  private async addGrowthRateData(suggestions: any[]) {
    // Add growth rate calculation to suggestions
    suggestions.forEach(suggestion => {
      suggestion.growthRate = Math.random() * 100; // Simulated growth rate
      suggestion.trending = suggestion.growthRate > 30;
      suggestion.seasonal = this.isSeasonalQuery(suggestion.text);
    });
  }

  private async addCulturalContextToSuggestions(suggestions: any[], region: string) {
    return {
      currentFestival: await this.getCurrentFestival(),
      culturalRelevance: suggestions.filter(s => this.isCulturalQuery(s.text)),
      regionalPreferences: region ? this.getRegionalPreferences(region) : null,
      languageContext: {
        bengali: suggestions.filter(s => s.language === 'bn').length,
        english: suggestions.filter(s => s.language === 'en').length,
        mixed: suggestions.filter(s => s.language === 'mixed').length
      }
    };
  }

  // Utility methods for scoring and calculation

  private calculatePopularityScore(searchCount: number, trendingScore: number): number {
    const normalizedSearchCount = Math.min(searchCount / 10000, 1);
    const normalizedTrendingScore = Math.min((trendingScore || 0) / 100, 1);
    return (normalizedSearchCount * 0.6) + (normalizedTrendingScore * 0.4);
  }

  private calculateProductScore(product: any): number {
    const ratingScore = (product.rating || 0) / 5;
    const inventoryScore = (product.inventory || 0) > 0 ? 1 : 0;
    const popularityScore = Math.min((product.salesCount || 0) / 1000, 1);
    
    return (ratingScore * 0.4) + (inventoryScore * 0.3) + (popularityScore * 0.3);
  }

  private calculateRelevanceScore(text: string, query: string): number {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (textLower === queryLower) return 1.0;
    if (textLower.startsWith(queryLower)) return 0.9;
    if (textLower.includes(queryLower)) return 0.7;
    
    // Calculate similarity based on common words
    const textWords = textLower.split(' ');
    const queryWords = queryLower.split(' ');
    const commonWords = textWords.filter(word => queryWords.includes(word));
    
    return commonWords.length / Math.max(textWords.length, queryWords.length);
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculatePhoneticScore(query: string, phonetic: string): number {
    const distance = this.calculateLevenshteinDistance(query.toLowerCase(), phonetic.toLowerCase());
    const maxLength = Math.max(query.length, phonetic.length);
    return 1 - (distance / maxLength);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const distance = this.calculateLevenshteinDistance(text1.toLowerCase(), text2.toLowerCase());
    const maxLength = Math.max(text1.length, text2.length);
    return 1 - (distance / maxLength);
  }

  private calculateBengaliRelevance(text: string, query: string): number {
    // Bengali-specific relevance calculation
    const baseRelevance = this.calculateRelevanceScore(text, query);
    
    // Boost score for exact Bengali character matches
    const bengaliMatch = this.hasBengaliMatch(text, query);
    const boostFactor = bengaliMatch ? 1.2 : 1.0;
    
    return Math.min(baseRelevance * boostFactor, 1.0);
  }

  private hasBengaliMatch(text: string, query: string): boolean {
    const bengaliRegex = /[\u0980-\u09FF]/g;
    const textBengali = text.match(bengaliRegex) || [];
    const queryBengali = query.match(bengaliRegex) || [];
    
    return queryBengali.some(char => textBengali.includes(char));
  }

  private detectBengaliCategory(term: string): string {
    const categories = {
      'clothing': ['শাড়ি', 'পাঞ্জাবি', 'লুঙ্গি', 'কুর্তা'],
      'food': ['ইলিশ', 'ভাত', 'ডাল', 'তরকারি'],
      'electronics': ['মোবাইল', 'ল্যাপটপ', 'কম্পিউটার']
    };

    for (const [category, terms] of Object.entries(categories)) {
      if (terms.includes(term)) {
        return category;
      }
    }

    return 'general';
  }

  private sortProducts(products: any[], sortBy: string) {
    switch (sortBy) {
      case 'popularity':
        return products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
      case 'price':
        return products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'rating':
        return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'name':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return products;
    }
  }

  private calculateProductSuggestionScore(product: any, query: string): number {
    const nameRelevance = this.calculateRelevanceScore(product.name, query);
    const popularityScore = Math.min((product.salesCount || 0) / 1000, 1);
    const ratingScore = (product.rating || 0) / 5;
    const stockScore = (product.inventory || 0) > 0 ? 1 : 0.3;
    
    return (nameRelevance * 0.4) + (popularityScore * 0.3) + (ratingScore * 0.2) + (stockScore * 0.1);
  }

  private calculateTimeRange(timeframe: string) {
    const now = new Date();
    const ranges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };

    return {
      start: ranges[timeframe as keyof typeof ranges] || ranges['24h'],
      end: now
    };
  }

  private isSeasonalQuery(query: string): boolean {
    const seasonalTerms = ['winter', 'summer', 'eid', 'pohela', 'festival', 'শীত', 'গ্রীষ্ম', 'ইদ'];
    return seasonalTerms.some(term => query.toLowerCase().includes(term.toLowerCase()));
  }

  private isCulturalQuery(query: string): boolean {
    const culturalTerms = ['saree', 'panjabi', 'eid', 'pohela', 'durga', 'শাড়ি', 'পাঞ্জাবি', 'ইদ'];
    return culturalTerms.some(term => query.toLowerCase().includes(term.toLowerCase()));
  }

  private async getCurrentFestival() {
    // Determine current Bangladesh festival
    const now = new Date();
    const month = now.getMonth() + 1;
    
    if (month >= 3 && month <= 5) return 'pohela_boishakh';
    if (month >= 6 && month <= 8) return 'eid_season';
    if (month >= 9 && month <= 11) return 'durga_puja_season';
    return 'general_season';
  }

  private getRegionalPreferences(region: string) {
    const preferences = {
      'dhaka': ['fashion', 'electronics', 'books'],
      'chittagong': ['seafood', 'business', 'port_goods'],
      'sylhet': ['tea', 'traditional_crafts', 'diaspora_products']
    };

    return preferences[region] || ['general'];
  }

  private async getLocationBasedSuggestions(query: string, location: string) {
    // Location-based contextual suggestions
    return [
      { text: `${query} in ${location}`, type: 'location', score: 0.6 },
      { text: `${query} near me`, type: 'proximity', score: 0.7 }
    ];
  }

  private async getSeasonalSuggestions(query: string) {
    // Seasonal contextual suggestions
    const season = this.getCurrentSeason();
    return [
      { text: `${query} ${season}`, type: 'seasonal', score: 0.5 },
      { text: `${season} ${query}`, type: 'seasonal', score: 0.5 }
    ];
  }

  private async getCulturalSuggestions(query: string) {
    // Cultural contextual suggestions
    const festival = await this.getCurrentFestival();
    return [
      { text: `${query} ${festival}`, type: 'cultural', score: 0.6 },
      { text: `${festival} ${query}`, type: 'cultural', score: 0.6 }
    ];
  }

  private async getTimeOfDaySuggestions(query: string) {
    // Time-based contextual suggestions
    const hour = new Date().getHours();
    const timeContext = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    
    return [
      { text: `${query} ${timeContext}`, type: 'time', score: 0.4 }
    ];
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 9) return 'monsoon';
    if (month >= 10 && month <= 11) return 'autumn';
    return 'winter';
  }

  private async trackSuggestionDisplay(query: string, suggestions: any[], userId: string, language: string) {
    // Track suggestion display for analytics
    try {
      if (suggestions.length > 0) {
        this.logger.logUserActivity('search', 'suggestions_displayed', {
          query,
          language,
          suggestionCount: suggestions.length,
          userId: userId || 'anonymous',
          topSuggestions: suggestions.slice(0, 3).map(s => s.text)
        });
      }
    } catch (error) {
      // Silent fail for analytics tracking
      console.warn('Failed to track suggestion display:', error);
    }
  }
}