/**
 * Amazon.com/Shopee.sg-Level Content-Based Recommendation Model
 * Advanced content-based filtering with TF-IDF, feature engineering, and Bangladesh cultural optimization
 */

import { logger } from '../../utils/logger';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subCategory: string;
  brand: string;
  price: number;
  features: Record<string, any>;
  tags: string[];
  bangladeshAttributes: {
    culturalRelevance: number;
    festivalAssociation: string[];
    regionalPopularity: Record<string, number>;
    localBrandStatus: boolean;
    languageContext: 'bangla' | 'english' | 'mixed';
    traditionalModern: 'traditional' | 'modern' | 'hybrid';
  };
}

interface User {
  id: string;
  preferences: Record<string, number>;
  demographics: Record<string, any>;
  viewHistory: string[];
  purchaseHistory: string[];
  bangladeshProfile: {
    region: string;
    culturalPreferences: string[];
    festivalBehavior: Record<string, number>;
    languagePreference: 'bangla' | 'english' | 'mixed';
    priceRange: { min: number; max: number };
  };
}

interface UserProfile {
  categoryPreferences: Map<string, number>;
  brandPreferences: Map<string, number>;
  featurePreferences: Map<string, number>;
  pricePreference: { min: number; max: number; optimal: number };
  textualFeatures: Map<string, number>; // TF-IDF features
  bangladeshCulturalProfile: {
    festivalPreferences: Map<string, number>;
    regionalPreferences: Map<string, number>;
    languagePreference: Map<string, number>;
    traditionalModernBalance: number; // -1 to 1 (traditional to modern)
  };
}

interface RecommendationResult {
  productId: string;
  score: number;
  confidence: number;
  reasons: string[];
  featureMatches: Record<string, number>;
  bangladeshContext: {
    culturalRelevance: number;
    festivalAlignment: number;
    regionalPreference: number;
    languageAlignment: number;
  };
}

export class ContentBasedModel {
  private productFeatures: Map<string, Map<string, number>> = new Map();
  private productTfIdf: Map<string, Map<string, number>> = new Map();
  private vocabulary: Set<string> = new Set();
  private documentFrequency: Map<string, number> = new Map();
  private bangladeshCulturalFeatures: Map<string, Record<string, number>> = new Map();
  
  private readonly maxFeatures = 10000;
  private readonly minTermFrequency = 2;
  private readonly bangladeshCulturalWeight = 0.3;
  private readonly maxRecommendations = 50;

  constructor() {
    logger.info('🤖 Content-Based Model initialized with Bangladesh optimization');
  }

  /**
   * Train the content-based model with product catalog
   */
  async trainModel(products: Product[]): Promise<void> {
    try {
      logger.info('🔧 Training Content-Based Model', { 
        productsCount: products.length
      });

      // Extract textual features and build vocabulary
      this.buildVocabulary(products);
      
      // Calculate TF-IDF features for products
      this.calculateTfIdf(products);
      
      // Extract numerical and categorical features
      this.extractProductFeatures(products);
      
      // Build Bangladesh cultural feature profiles
      this.buildBangladeshCulturalFeatures(products);

      logger.info('✅ Content-Based Model training completed successfully', {
        vocabularySize: this.vocabulary.size,
        productsFeatured: this.productFeatures.size
      });
    } catch (error) {
      logger.error('❌ Error training Content-Based Model', { error });
      throw error;
    }
  }

  /**
   * Build vocabulary from product descriptions and names
   */
  private buildVocabulary(products: Product[]): void {
    const termFrequency = new Map<string, number>();
    
    for (const product of products) {
      const text = this.preprocessText(`${product.name} ${product.description} ${product.tags.join(' ')}`);
      const words = text.split(/\s+/).filter(word => word.length > 2);
      
      for (const word of words) {
        termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
      }
    }
    
    // Filter vocabulary by minimum frequency
    for (const [term, frequency] of termFrequency) {
      if (frequency >= this.minTermFrequency && this.vocabulary.size < this.maxFeatures) {
        this.vocabulary.add(term);
        this.documentFrequency.set(term, 0);
      }
    }
    
    logger.info('📚 Vocabulary built', {
      totalTerms: termFrequency.size,
      filteredVocabulary: this.vocabulary.size
    });
  }

  /**
   * Preprocess text for feature extraction (with Bangladesh language support)
   */
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\u0980-\u09FF\w\s]/g, ' ') // Keep Bangla and English characters
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate TF-IDF features for all products
   */
  private calculateTfIdf(products: Product[]): void {
    const totalDocuments = products.length;
    
    // Calculate document frequency for each term
    for (const product of products) {
      const text = this.preprocessText(`${product.name} ${product.description} ${product.tags.join(' ')}`);
      const words = new Set(text.split(/\s+/).filter(word => this.vocabulary.has(word)));
      
      for (const word of words) {
        this.documentFrequency.set(word, (this.documentFrequency.get(word) || 0) + 1);
      }
    }
    
    // Calculate TF-IDF for each product
    for (const product of products) {
      const tfIdf = new Map<string, number>();
      const text = this.preprocessText(`${product.name} ${product.description} ${product.tags.join(' ')}`);
      const words = text.split(/\s+/).filter(word => this.vocabulary.has(word));
      
      // Calculate term frequency
      const termCount = new Map<string, number>();
      for (const word of words) {
        termCount.set(word, (termCount.get(word) || 0) + 1);
      }
      
      // Calculate TF-IDF for each term
      for (const [term, tf] of termCount) {
        const df = this.documentFrequency.get(term) || 1;
        const idf = Math.log(totalDocuments / df);
        const tfIdfScore = (tf / words.length) * idf;
        tfIdf.set(term, tfIdfScore);
      }
      
      this.productTfIdf.set(product.id, tfIdf);
    }
    
    logger.info('📊 TF-IDF calculated for all products');
  }

  /**
   * Extract numerical and categorical features from products
   */
  private extractProductFeatures(products: Product[]): void {
    for (const product of products) {
      const features = new Map<string, number>();
      
      // Category features (one-hot encoding)
      features.set(`category_${product.category}`, 1);
      features.set(`subcategory_${product.subCategory}`, 1);
      features.set(`brand_${product.brand}`, 1);
      
      // Price features (normalized)
      const priceFeatures = this.normalizePriceFeatures(product.price, products);
      for (const [key, value] of Object.entries(priceFeatures)) {
        features.set(key, value);
      }
      
      // Custom features
      for (const [key, value] of Object.entries(product.features)) {
        if (typeof value === 'number') {
          features.set(`feature_${key}`, value);
        } else if (typeof value === 'boolean') {
          features.set(`feature_${key}`, value ? 1 : 0);
        } else if (typeof value === 'string') {
          features.set(`feature_${key}_${value}`, 1);
        }
      }
      
      // Bangladesh-specific features
      features.set('cultural_relevance', product.bangladeshAttributes.culturalRelevance);
      features.set('local_brand', product.bangladeshAttributes.localBrandStatus ? 1 : 0);
      features.set(`language_${product.bangladeshAttributes.languageContext}`, 1);
      features.set(`style_${product.bangladeshAttributes.traditionalModern}`, 1);
      
      this.productFeatures.set(product.id, features);
    }
    
    logger.info('🔧 Product features extracted for all products');
  }

  /**
   * Normalize price features into different buckets
   */
  private normalizePriceFeatures(price: number, allProducts: Product[]): Record<string, number> {
    const prices = allProducts.map(p => p.price).sort((a, b) => a - b);
    const q1 = prices[Math.floor(prices.length * 0.25)];
    const median = prices[Math.floor(prices.length * 0.5)];
    const q3 = prices[Math.floor(prices.length * 0.75)];
    const max = prices[prices.length - 1];
    
    return {
      price_budget: price <= q1 ? 1 : 0,
      price_mid: price > q1 && price <= median ? 1 : 0,
      price_premium: price > median && price <= q3 ? 1 : 0,
      price_luxury: price > q3 ? 1 : 0,
      price_normalized: price / max
    };
  }

  /**
   * Build Bangladesh cultural feature profiles
   */
  private buildBangladeshCulturalFeatures(products: Product[]): void {
    for (const product of products) {
      const culturalFeatures: Record<string, number> = {};
      
      // Festival associations
      for (const festival of product.bangladeshAttributes.festivalAssociation) {
        culturalFeatures[`festival_${festival}`] = 1;
      }
      
      // Regional popularity
      for (const [region, popularity] of Object.entries(product.bangladeshAttributes.regionalPopularity)) {
        culturalFeatures[`region_${region}`] = popularity;
      }
      
      // Cultural attributes
      culturalFeatures.cultural_relevance = product.bangladeshAttributes.culturalRelevance;
      culturalFeatures.local_brand = product.bangladeshAttributes.localBrandStatus ? 1 : 0;
      
      this.bangladeshCulturalFeatures.set(product.id, culturalFeatures);
    }
    
    logger.info('🇧🇩 Bangladesh cultural features built');
  }

  /**
   * Build user profile from interaction history
   */
  buildUserProfile(user: User, products: Product[], interactions: Array<{productId: string, type: 'view' | 'purchase' | 'rating', value?: number}>): UserProfile {
    const profile: UserProfile = {
      categoryPreferences: new Map(),
      brandPreferences: new Map(),
      featurePreferences: new Map(),
      pricePreference: { min: 0, max: Infinity, optimal: 0 },
      textualFeatures: new Map(),
      bangladeshCulturalProfile: {
        festivalPreferences: new Map(),
        regionalPreferences: new Map(),
        languagePreference: new Map(),
        traditionalModernBalance: 0
      }
    };

    const interactedProducts = interactions
      .map(interaction => ({
        product: products.find(p => p.id === interaction.productId),
        weight: this.getInteractionWeight(interaction.type, interaction.value)
      }))
      .filter(item => item.product);

    if (interactedProducts.length === 0) {
      return this.getDefaultUserProfile(user);
    }

    // Build category preferences
    for (const { product, weight } of interactedProducts) {
      if (!product) continue;
      
      this.updatePreferenceMap(profile.categoryPreferences, product.category, weight);
      this.updatePreferenceMap(profile.brandPreferences, product.brand, weight);
      
      // Update textual features from product TF-IDF
      const productTfIdf = this.productTfIdf.get(product.id) || new Map();
      for (const [term, score] of productTfIdf) {
        this.updatePreferenceMap(profile.textualFeatures, term, score * weight);
      }
      
      // Update feature preferences
      const productFeatures = this.productFeatures.get(product.id) || new Map();
      for (const [feature, value] of productFeatures) {
        this.updatePreferenceMap(profile.featurePreferences, feature, value * weight);
      }
      
      // Update Bangladesh cultural preferences
      this.updateBangladeshCulturalProfile(profile, product, weight);
    }

    // Calculate price preferences
    const interactedPrices = interactedProducts
      .filter(item => item.product)
      .map(item => item.product!.price);
    
    if (interactedPrices.length > 0) {
      profile.pricePreference.min = Math.min(...interactedPrices) * 0.5;
      profile.pricePreference.max = Math.max(...interactedPrices) * 2;
      profile.pricePreference.optimal = interactedPrices.reduce((sum, price) => sum + price, 0) / interactedPrices.length;
    }

    this.normalizeProfile(profile);
    
    logger.info('👤 User profile built', {
      userId: user.id,
      categoryPreferences: profile.categoryPreferences.size,
      brandPreferences: profile.brandPreferences.size,
      textualFeatures: profile.textualFeatures.size
    });

    return profile;
  }

  /**
   * Get default user profile based on Bangladesh demographics
   */
  private getDefaultUserProfile(user: User): UserProfile {
    const profile: UserProfile = {
      categoryPreferences: new Map(),
      brandPreferences: new Map(),
      featurePreferences: new Map(),
      pricePreference: {
        min: user.bangladeshProfile.priceRange.min,
        max: user.bangladeshProfile.priceRange.max,
        optimal: (user.bangladeshProfile.priceRange.min + user.bangladeshProfile.priceRange.max) / 2
      },
      textualFeatures: new Map(),
      bangladeshCulturalProfile: {
        festivalPreferences: new Map(),
        regionalPreferences: new Map(),
        languagePreference: new Map(),
        traditionalModernBalance: 0
      }
    };

    // Set preferences based on user's Bangladesh profile
    profile.bangladeshCulturalProfile.languagePreference.set(user.bangladeshProfile.languagePreference, 1);
    profile.bangladeshCulturalProfile.regionalPreferences.set(user.bangladeshProfile.region, 1);
    
    for (const cultural of user.bangladeshProfile.culturalPreferences) {
      profile.bangladeshCulturalProfile.festivalPreferences.set(cultural, 0.5);
    }

    return profile;
  }

  /**
   * Get interaction weight based on type and value
   */
  private getInteractionWeight(type: 'view' | 'purchase' | 'rating', value?: number): number {
    switch (type) {
      case 'view':
        return 1;
      case 'purchase':
        return 5;
      case 'rating':
        return value ? value * 2 : 3;
      default:
        return 1;
    }
  }

  /**
   * Update preference map with weighted value
   */
  private updatePreferenceMap(map: Map<string, number>, key: string, weight: number): void {
    map.set(key, (map.get(key) || 0) + weight);
  }

  /**
   * Update Bangladesh cultural profile
   */
  private updateBangladeshCulturalProfile(profile: UserProfile, product: Product, weight: number): void {
    // Festival preferences
    for (const festival of product.bangladeshAttributes.festivalAssociation) {
      this.updatePreferenceMap(profile.bangladeshCulturalProfile.festivalPreferences, festival, weight);
    }
    
    // Regional preferences
    for (const [region, popularity] of Object.entries(product.bangladeshAttributes.regionalPopularity)) {
      this.updatePreferenceMap(profile.bangladeshCulturalProfile.regionalPreferences, region, popularity * weight);
    }
    
    // Language preference
    this.updatePreferenceMap(profile.bangladeshCulturalProfile.languagePreference, product.bangladeshAttributes.languageContext, weight);
    
    // Traditional/Modern balance
    const styleWeight = product.bangladeshAttributes.traditionalModern === 'traditional' ? -weight :
                       product.bangladeshAttributes.traditionalModern === 'modern' ? weight : 0;
    profile.bangladeshCulturalProfile.traditionalModernBalance += styleWeight;
  }

  /**
   * Normalize user profile preferences
   */
  private normalizeProfile(profile: UserProfile): void {
    this.normalizeMap(profile.categoryPreferences);
    this.normalizeMap(profile.brandPreferences);
    this.normalizeMap(profile.featurePreferences);
    this.normalizeMap(profile.textualFeatures);
    this.normalizeMap(profile.bangladeshCulturalProfile.festivalPreferences);
    this.normalizeMap(profile.bangladeshCulturalProfile.regionalPreferences);
    this.normalizeMap(profile.bangladeshCulturalProfile.languagePreference);
    
    // Normalize traditional/modern balance to -1 to 1 range
    profile.bangladeshCulturalProfile.traditionalModernBalance = Math.max(-1, Math.min(1, 
      profile.bangladeshCulturalProfile.traditionalModernBalance / 10));
  }

  /**
   * Normalize map values to sum to 1
   */
  private normalizeMap(map: Map<string, number>): void {
    const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0);
    if (total > 0) {
      for (const [key, value] of map) {
        map.set(key, value / total);
      }
    }
  }

  /**
   * Generate content-based recommendations
   */
  async generateRecommendations(
    userProfile: UserProfile,
    products: Product[],
    excludeProducts: Set<string> = new Set()
  ): Promise<RecommendationResult[]> {
    try {
      const recommendations: RecommendationResult[] = [];
      
      for (const product of products) {
        if (excludeProducts.has(product.id)) continue;
        
        const score = this.calculateProductScore(userProfile, product);
        const confidence = this.calculateConfidence(userProfile, product);
        const reasons = this.generateReasons(userProfile, product);
        const featureMatches = this.calculateFeatureMatches(userProfile, product);
        const bangladeshContext = this.calculateBangladeshContext(userProfile, product);
        
        if (score > 0.1) { // Minimum threshold
          recommendations.push({
            productId: product.id,
            score,
            confidence,
            reasons,
            featureMatches,
            bangladeshContext
          });
        }
      }
      
      // Sort by score and limit results
      recommendations.sort((a, b) => b.score - a.score);
      const topRecommendations = recommendations.slice(0, this.maxRecommendations);
      
      logger.info('🎯 Content-based recommendations generated', {
        totalEvaluated: products.length,
        finalCount: topRecommendations.length,
        topScore: topRecommendations[0]?.score || 0
      });
      
      return topRecommendations;
    } catch (error) {
      logger.error('❌ Error generating content-based recommendations', { error });
      throw error;
    }
  }

  /**
   * Calculate overall product score for user
   */
  private calculateProductScore(userProfile: UserProfile, product: Product): number {
    let score = 0;
    let weights = 0;
    
    // Category similarity
    const categoryScore = userProfile.categoryPreferences.get(product.category) || 0;
    score += categoryScore * 0.25;
    weights += 0.25;
    
    // Brand similarity
    const brandScore = userProfile.brandPreferences.get(product.brand) || 0;
    score += brandScore * 0.15;
    weights += 0.15;
    
    // Textual similarity (cosine similarity of TF-IDF vectors)
    const textualScore = this.calculateTextualSimilarity(userProfile, product);
    score += textualScore * 0.3;
    weights += 0.3;
    
    // Feature similarity
    const featureScore = this.calculateFeatureSimilarity(userProfile, product);
    score += featureScore * 0.2;
    weights += 0.2;
    
    // Bangladesh cultural similarity
    const culturalScore = this.calculateBangladeshCulturalSimilarity(userProfile, product);
    score += culturalScore * this.bangladeshCulturalWeight;
    weights += this.bangladeshCulturalWeight;
    
    return weights > 0 ? score / weights : 0;
  }

  /**
   * Calculate textual similarity using cosine similarity
   */
  private calculateTextualSimilarity(userProfile: UserProfile, product: Product): number {
    const productTfIdf = this.productTfIdf.get(product.id) || new Map();
    const userTextualFeatures = userProfile.textualFeatures;
    
    if (productTfIdf.size === 0 || userTextualFeatures.size === 0) return 0;
    
    let dotProduct = 0;
    let userNorm = 0;
    let productNorm = 0;
    
    // Calculate cosine similarity
    for (const [term, userWeight] of userTextualFeatures) {
      const productWeight = productTfIdf.get(term) || 0;
      dotProduct += userWeight * productWeight;
      userNorm += userWeight * userWeight;
    }
    
    for (const [, productWeight] of productTfIdf) {
      productNorm += productWeight * productWeight;
    }
    
    const denominator = Math.sqrt(userNorm) * Math.sqrt(productNorm);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  /**
   * Calculate feature similarity
   */
  private calculateFeatureSimilarity(userProfile: UserProfile, product: Product): number {
    const productFeatures = this.productFeatures.get(product.id) || new Map();
    const userFeaturePreferences = userProfile.featurePreferences;
    
    if (productFeatures.size === 0 || userFeaturePreferences.size === 0) return 0;
    
    let similarity = 0;
    let count = 0;
    
    for (const [feature, userPreference] of userFeaturePreferences) {
      const productValue = productFeatures.get(feature) || 0;
      if (productValue > 0) {
        similarity += userPreference * productValue;
        count++;
      }
    }
    
    return count > 0 ? similarity / count : 0;
  }

  /**
   * Calculate Bangladesh cultural similarity
   */
  private calculateBangladeshCulturalSimilarity(userProfile: UserProfile, product: Product): number {
    let similarity = 0;
    let weights = 0;
    
    // Festival alignment
    for (const festival of product.bangladeshAttributes.festivalAssociation) {
      const userPreference = userProfile.bangladeshCulturalProfile.festivalPreferences.get(festival) || 0;
      similarity += userPreference * 0.4;
      weights += 0.4;
    }
    
    // Language preference alignment
    const languageScore = userProfile.bangladeshCulturalProfile.languagePreference.get(product.bangladeshAttributes.languageContext) || 0;
    similarity += languageScore * 0.3;
    weights += 0.3;
    
    // Traditional/Modern alignment
    const productStyleScore = product.bangladeshAttributes.traditionalModern === 'traditional' ? -1 :
                             product.bangladeshAttributes.traditionalModern === 'modern' ? 1 : 0;
    const styleAlignment = 1 - Math.abs(userProfile.bangladeshCulturalProfile.traditionalModernBalance - productStyleScore) / 2;
    similarity += styleAlignment * 0.3;
    weights += 0.3;
    
    return weights > 0 ? similarity / weights : 0;
  }

  /**
   * Calculate recommendation confidence
   */
  private calculateConfidence(userProfile: UserProfile, product: Product): number {
    const interactionCount = Array.from(userProfile.categoryPreferences.values()).reduce((sum, val) => sum + val, 0);
    const dataRichness = Math.min(interactionCount / 10, 1); // Normalize to 0-1
    
    const featureOverlap = this.calculateFeatureOverlap(userProfile, product);
    
    return (dataRichness + featureOverlap) / 2;
  }

  /**
   * Calculate feature overlap between user profile and product
   */
  private calculateFeatureOverlap(userProfile: UserProfile, product: Product): number {
    const productFeatures = this.productFeatures.get(product.id) || new Map();
    const userFeatures = userProfile.featurePreferences;
    
    const commonFeatures = Array.from(userFeatures.keys()).filter(feature => productFeatures.has(feature));
    const totalFeatures = new Set([...userFeatures.keys(), ...productFeatures.keys()]).size;
    
    return totalFeatures > 0 ? commonFeatures.length / totalFeatures : 0;
  }

  /**
   * Generate explanation reasons for recommendation
   */
  private generateReasons(userProfile: UserProfile, product: Product): string[] {
    const reasons: string[] = [];
    
    // Category match
    const categoryPreference = userProfile.categoryPreferences.get(product.category) || 0;
    if (categoryPreference > 0.1) {
      reasons.push(`You frequently browse ${product.category} products`);
    }
    
    // Brand match
    const brandPreference = userProfile.brandPreferences.get(product.brand) || 0;
    if (brandPreference > 0.1) {
      reasons.push(`You've shown interest in ${product.brand} products`);
    }
    
    // Price match
    const priceInRange = product.price >= userProfile.pricePreference.min && 
                        product.price <= userProfile.pricePreference.max;
    if (priceInRange) {
      reasons.push(`Price matches your usual range`);
    }
    
    // Bangladesh cultural match
    for (const festival of product.bangladeshAttributes.festivalAssociation) {
      const festivalPreference = userProfile.bangladeshCulturalProfile.festivalPreferences.get(festival) || 0;
      if (festivalPreference > 0.1) {
        reasons.push(`Perfect for ${festival} celebration`);
      }
    }
    
    if (product.bangladeshAttributes.localBrandStatus) {
      reasons.push(`Made in Bangladesh - supporting local business`);
    }
    
    return reasons.slice(0, 3); // Limit to top 3 reasons
  }

  /**
   * Calculate feature matches for explanation
   */
  private calculateFeatureMatches(userProfile: UserProfile, product: Product): Record<string, number> {
    const matches: Record<string, number> = {};
    const productFeatures = this.productFeatures.get(product.id) || new Map();
    
    for (const [feature, userPreference] of userProfile.featurePreferences) {
      const productValue = productFeatures.get(feature) || 0;
      if (productValue > 0 && userPreference > 0.1) {
        matches[feature] = userPreference * productValue;
      }
    }
    
    return matches;
  }

  /**
   * Calculate Bangladesh-specific context
   */
  private calculateBangladeshContext(userProfile: UserProfile, product: Product): {
    culturalRelevance: number;
    festivalAlignment: number;
    regionalPreference: number;
    languageAlignment: number;
  } {
    const festivalAlignment = product.bangladeshAttributes.festivalAssociation
      .reduce((sum, festival) => sum + (userProfile.bangladeshCulturalProfile.festivalPreferences.get(festival) || 0), 0) / 
      Math.max(product.bangladeshAttributes.festivalAssociation.length, 1);
    
    const languageAlignment = userProfile.bangladeshCulturalProfile.languagePreference.get(product.bangladeshAttributes.languageContext) || 0;
    
    // Regional preference would need user's region info - approximating
    const regionalPreference = Object.values(product.bangladeshAttributes.regionalPopularity).reduce((sum, val) => sum + val, 0) / 
                              Math.max(Object.keys(product.bangladeshAttributes.regionalPopularity).length, 1);
    
    return {
      culturalRelevance: product.bangladeshAttributes.culturalRelevance,
      festivalAlignment,
      regionalPreference,
      languageAlignment
    };
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): Record<string, any> {
    return {
      vocabularySize: this.vocabulary.size,
      productsProcessed: this.productFeatures.size,
      avgTfIdfFeatures: Array.from(this.productTfIdf.values())
        .reduce((sum, features) => sum + features.size, 0) / this.productTfIdf.size,
      avgProductFeatures: Array.from(this.productFeatures.values())
        .reduce((sum, features) => sum + features.size, 0) / this.productFeatures.size,
      bangladeshCulturalFeatures: this.bangladeshCulturalFeatures.size,
      bangladeshCulturalWeight: this.bangladeshCulturalWeight
    };
  }
}