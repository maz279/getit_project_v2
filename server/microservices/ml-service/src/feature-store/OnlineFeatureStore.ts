/**
 * Online Feature Store - Real-time Feature Serving
 * <50ms latency feature retrieval with intelligent caching
 */

import { logger } from '../utils/logger';

interface FeatureRequest {
  entityId: string;
  entityType: 'user' | 'product' | 'order' | 'vendor';
  featureNames: string[];
  timestamp?: Date;
}

interface FeatureValue {
  featureName: string;
  value: any;
  timestamp: Date;
  entityId: string;
  entityType: string;
}

interface CacheEntry {
  features: { [key: string]: any };
  timestamp: Date;
  ttl: number;
}

export class OnlineFeatureStore {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number = 300000; // 5 minutes
  private performanceMetrics: {
    cacheHits: number;
    cacheMisses: number;
    avgLatency: number;
    totalRequests: number;
  };

  constructor() {
    this.cache = new Map();
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      avgLatency: 0,
      totalRequests: 0
    };
    
    // Start cache cleanup interval
    setInterval(() => this.cleanupExpiredEntries(), 60000); // Every minute
    
    logger.info('🚀 Online Feature Store initialized');
  }

  /**
   * Get features with <50ms latency
   */
  async getFeatures(request: FeatureRequest): Promise<{ [key: string]: any }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);
    
    try {
      // Check cache first
      const cachedFeatures = this.getCachedFeatures(cacheKey);
      if (cachedFeatures) {
        this.performanceMetrics.cacheHits++;
        this.performanceMetrics.totalRequests++;
        
        const latency = Date.now() - startTime;
        this.updateLatencyMetrics(latency);
        
        logger.debug('✅ Cache hit for features', {
          entityId: request.entityId,
          entityType: request.entityType,
          latency: latency
        });
        
        return { ...cachedFeatures, _cacheHit: true };
      }

      // Cache miss - compute features
      this.performanceMetrics.cacheMisses++;
      this.performanceMetrics.totalRequests++;
      
      const features = await this.computeFeatures(request);
      
      // Cache the computed features
      this.cacheFeatures(cacheKey, features);
      
      const latency = Date.now() - startTime;
      this.updateLatencyMetrics(latency);
      
      logger.debug('✅ Features computed and cached', {
        entityId: request.entityId,
        entityType: request.entityType,
        featureCount: Object.keys(features).length,
        latency: latency
      });
      
      return { ...features, _cacheHit: false };
      
    } catch (error) {
      logger.error('❌ Error getting features from online store', { error });
      throw error;
    }
  }

  /**
   * Store features in online store
   */
  async storeFeatures(values: FeatureValue[]): Promise<void> {
    try {
      const groupedFeatures = this.groupFeaturesByEntity(values);
      
      for (const [entityKey, entityFeatures] of groupedFeatures) {
        const features: { [key: string]: any } = {};
        
        for (const feature of entityFeatures) {
          features[feature.featureName] = feature.value;
        }
        
        this.cacheFeatures(entityKey, features);
      }
      
      logger.debug('✅ Features stored in online store', {
        featureCount: values.length,
        entityCount: groupedFeatures.size
      });
      
    } catch (error) {
      logger.error('❌ Error storing features in online store', { error });
      throw error;
    }
  }

  /**
   * Compute features for an entity
   */
  private async computeFeatures(request: FeatureRequest): Promise<{ [key: string]: any }> {
    const features: { [key: string]: any } = {};
    
    // Simulate feature computation based on entity type
    switch (request.entityType) {
      case 'user':
        return await this.computeUserFeatures(request);
      case 'product':
        return await this.computeProductFeatures(request);
      case 'order':
        return await this.computeOrderFeatures(request);
      case 'vendor':
        return await this.computeVendorFeatures(request);
      default:
        return features;
    }
  }

  /**
   * Compute user features
   */
  private async computeUserFeatures(request: FeatureRequest): Promise<{ [key: string]: any }> {
    const features: { [key: string]: any } = {};
    
    // Simulate user feature computation
    const mockUserData = {
      age: 28,
      totalOrders: 15,
      avgOrderValue: 2500,
      lastOrderDays: 5,
      preferredCategories: ['Electronics', 'Fashion', 'Home'],
      sessionDurationAvg: 12.5,
      cartAbandonmentRate: 0.3,
      ratingAvg: 4.2,
      region: 'Dhaka',
      preferredPaymentMethod: 'bkash',
      bengaliLanguagePreference: true,
      festivalActivityScore: 0.8,
      prayerTimeActivity: 'moderate',
      codPreference: 0.4,
      mobileBankingUsage: 0.9,
      ruralUrbanClassification: 'urban'
    };
    
    for (const featureName of request.featureNames) {
      switch (featureName) {
        case 'user_age':
          features[featureName] = mockUserData.age;
          break;
        case 'user_total_orders':
          features[featureName] = mockUserData.totalOrders;
          break;
        case 'user_avg_order_value':
          features[featureName] = mockUserData.avgOrderValue;
          break;
        case 'user_last_order_days':
          features[featureName] = mockUserData.lastOrderDays;
          break;
        case 'user_preferred_categories':
          features[featureName] = mockUserData.preferredCategories;
          break;
        case 'user_session_duration_avg':
          features[featureName] = mockUserData.sessionDurationAvg;
          break;
        case 'user_cart_abandonment_rate':
          features[featureName] = mockUserData.cartAbandonmentRate;
          break;
        case 'user_rating_avg':
          features[featureName] = mockUserData.ratingAvg;
          break;
        case 'user_region_bangladesh':
          features[featureName] = mockUserData.region;
          break;
        case 'user_preferred_payment_method':
          features[featureName] = mockUserData.preferredPaymentMethod;
          break;
        case 'user_bengali_language_preference':
          features[featureName] = mockUserData.bengaliLanguagePreference;
          break;
        case 'user_festival_activity_score':
          features[featureName] = mockUserData.festivalActivityScore;
          break;
        case 'user_prayer_time_activity':
          features[featureName] = mockUserData.prayerTimeActivity;
          break;
        case 'user_cod_preference':
          features[featureName] = mockUserData.codPreference;
          break;
        case 'user_mobile_banking_usage':
          features[featureName] = mockUserData.mobileBankingUsage;
          break;
        case 'user_rural_urban_classification':
          features[featureName] = mockUserData.ruralUrbanClassification;
          break;
        default:
          features[featureName] = null;
      }
    }
    
    return features;
  }

  /**
   * Compute product features
   */
  private async computeProductFeatures(request: FeatureRequest): Promise<{ [key: string]: any }> {
    const features: { [key: string]: any } = {};
    
    // Simulate product feature computation
    const mockProductData = {
      price: 1500,
      rating: 4.5,
      reviewCount: 342,
      salesCount: 1250,
      category: 'Electronics',
      brand: 'Samsung',
      discountPercentage: 15,
      viewCount7d: 2500,
      inventoryLevel: 45,
      daysSinceLaunch: 180,
      localBrand: false,
      festivalRelevance: 0.7,
      regionalPopularity: 0.8,
      bdtPriceTier: 'mid',
      shippingBangladesh: 'nationwide'
    };
    
    for (const featureName of request.featureNames) {
      switch (featureName) {
        case 'product_price':
          features[featureName] = mockProductData.price;
          break;
        case 'product_rating':
          features[featureName] = mockProductData.rating;
          break;
        case 'product_review_count':
          features[featureName] = mockProductData.reviewCount;
          break;
        case 'product_sales_count':
          features[featureName] = mockProductData.salesCount;
          break;
        case 'product_category':
          features[featureName] = mockProductData.category;
          break;
        case 'product_brand':
          features[featureName] = mockProductData.brand;
          break;
        case 'product_discount_percentage':
          features[featureName] = mockProductData.discountPercentage;
          break;
        case 'product_view_count_7d':
          features[featureName] = mockProductData.viewCount7d;
          break;
        case 'product_inventory_level':
          features[featureName] = mockProductData.inventoryLevel;
          break;
        case 'product_days_since_launch':
          features[featureName] = mockProductData.daysSinceLaunch;
          break;
        case 'product_local_brand':
          features[featureName] = mockProductData.localBrand;
          break;
        case 'product_festival_relevance':
          features[featureName] = mockProductData.festivalRelevance;
          break;
        case 'product_regional_popularity':
          features[featureName] = mockProductData.regionalPopularity;
          break;
        case 'product_bdt_price_tier':
          features[featureName] = mockProductData.bdtPriceTier;
          break;
        case 'product_shipping_bangladesh':
          features[featureName] = mockProductData.shippingBangladesh;
          break;
        default:
          features[featureName] = null;
      }
    }
    
    return features;
  }

  /**
   * Compute order features
   */
  private async computeOrderFeatures(request: FeatureRequest): Promise<{ [key: string]: any }> {
    const features: { [key: string]: any } = {};
    
    // Add context features
    const now = new Date();
    features['hour_of_day'] = now.getHours();
    features['day_of_week'] = now.getDay();
    features['current_bangladesh_festival'] = this.getCurrentBangladeshFestival();
    features['prayer_time_context'] = this.getPrayerTimeContext();
    features['bangladesh_weather_context'] = 'hot';
    features['bangladesh_economic_indicator'] = 0.75;
    features['ramadan_context'] = this.isRamadan();
    
    return features;
  }

  /**
   * Compute vendor features
   */
  private async computeVendorFeatures(request: FeatureRequest): Promise<{ [key: string]: any }> {
    const features: { [key: string]: any } = {};
    
    // Simulate vendor feature computation
    for (const featureName of request.featureNames) {
      features[featureName] = Math.random(); // Placeholder
    }
    
    return features;
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: FeatureRequest): string {
    const featuresKey = request.featureNames.sort().join(',');
    return `${request.entityType}:${request.entityId}:${featuresKey}`;
  }

  /**
   * Get cached features
   */
  private getCachedFeatures(cacheKey: string): { [key: string]: any } | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.features;
  }

  /**
   * Cache features
   */
  private cacheFeatures(cacheKey: string, features: { [key: string]: any }): void {
    const entry: CacheEntry = {
      features: features,
      timestamp: new Date(),
      ttl: this.defaultTTL
    };
    
    this.cache.set(cacheKey, entry);
  }

  /**
   * Group features by entity
   */
  private groupFeaturesByEntity(values: FeatureValue[]): Map<string, FeatureValue[]> {
    const grouped = new Map<string, FeatureValue[]>();
    
    for (const value of values) {
      const entityKey = `${value.entityType}:${value.entityId}`;
      if (!grouped.has(entityKey)) {
        grouped.set(entityKey, []);
      }
      grouped.get(entityKey)!.push(value);
    }
    
    return grouped;
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.debug(`🧹 Cleaned ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(latency: number): void {
    this.performanceMetrics.avgLatency = 
      (this.performanceMetrics.avgLatency + latency) / 2;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): any {
    return {
      ...this.performanceMetrics,
      cacheHitRate: this.performanceMetrics.cacheHits / 
                   (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses),
      cacheSize: this.cache.size
    };
  }

  /**
   * Bangladesh-specific context methods
   */
  private getCurrentBangladeshFestival(): string | null {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // Simplified festival detection
    if (month === 4 && day === 14) return 'Pohela Boishakh';
    if (month === 3 && day === 26) return 'Independence Day';
    if (month === 12 && day === 16) return 'Victory Day';
    
    return null;
  }

  private getPrayerTimeContext(): string {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 6) return 'Fajr';
    if (hour >= 12 && hour < 13) return 'Dhuhr';
    if (hour >= 15 && hour < 16) return 'Asr';
    if (hour >= 18 && hour < 19) return 'Maghrib';
    if (hour >= 20 && hour < 21) return 'Isha';
    
    return 'None';
  }

  private isRamadan(): boolean {
    // Simplified Ramadan detection - in real implementation, use proper Islamic calendar
    const now = new Date();
    const month = now.getMonth() + 1;
    return month === 4; // Approximate for 2025
  }
}