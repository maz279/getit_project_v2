/**
 * Amazon.com/Shopee.sg-Level Feature Store Service
 * Enterprise-grade feature management with online/offline stores
 */

import { logger } from '../utils/logger';
import { OnlineFeatureStore } from './OnlineFeatureStore';
import { OfflineFeatureStore } from './OfflineFeatureStore';
import { FeatureRegistry } from './FeatureRegistry';
import { FeaturePipeline } from './FeaturePipeline';

interface FeatureDefinition {
  name: string;
  type: 'numerical' | 'categorical' | 'text' | 'boolean' | 'embedding';
  description: string;
  source: string;
  transformations: string[];
  tags: string[];
  owner: string;
  version: string;
  bangladesh_specific: boolean;
}

interface FeatureValue {
  featureName: string;
  value: any;
  timestamp: Date;
  entityId: string;
  entityType: 'user' | 'product' | 'order' | 'vendor';
}

interface FeatureRequest {
  entityId: string;
  entityType: 'user' | 'product' | 'order' | 'vendor';
  featureNames: string[];
  timestamp?: Date;
}

interface FeatureResponse {
  entityId: string;
  entityType: string;
  features: { [key: string]: any };
  timestamp: Date;
  cacheHit: boolean;
  latency: number;
}

export class FeatureStoreService {
  private onlineStore: OnlineFeatureStore;
  private offlineStore: OfflineFeatureStore;
  private registry: FeatureRegistry;
  private pipeline: FeaturePipeline;
  private serviceHealth: any;

  constructor() {
    this.onlineStore = new OnlineFeatureStore();
    this.offlineStore = new OfflineFeatureStore();
    this.registry = new FeatureRegistry();
    this.pipeline = new FeaturePipeline();
    this.serviceHealth = {
      status: 'healthy',
      onlineStore: 'operational',
      offlineStore: 'operational',
      registry: 'operational',
      pipeline: 'operational',
      features: {
        total: 0,
        online: 0,
        offline: 0,
        bangladesh: 0
      },
      performance: {
        avgLatency: 0,
        cacheHitRate: 0,
        throughput: 0
      }
    };
    
    this.initializeFeatureStore();
  }

  private async initializeFeatureStore(): Promise<void> {
    try {
      logger.info('🏪 Initializing Feature Store Service');
      
      // Initialize core feature definitions
      await this.initializeCoreFeatures();
      
      // Initialize Bangladesh-specific features
      await this.initializeBangladeshFeatures();
      
      // Start feature pipeline
      await this.pipeline.start();
      
      logger.info('✅ Feature Store Service initialized successfully');
      this.serviceHealth.status = 'operational';
      
    } catch (error) {
      logger.error('❌ Error initializing Feature Store Service', { error });
      this.serviceHealth.status = 'error';
      throw error;
    }
  }

  private async initializeCoreFeatures(): Promise<void> {
    const coreFeatures: FeatureDefinition[] = [
      // User Features
      {
        name: 'user_age',
        type: 'numerical',
        description: 'User age in years',
        source: 'users_table',
        transformations: ['normalize'],
        tags: ['demographics', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'user_total_orders',
        type: 'numerical',
        description: 'Total number of orders by user',
        source: 'orders_table',
        transformations: ['count'],
        tags: ['behavior', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'user_avg_order_value',
        type: 'numerical',
        description: 'Average order value for user',
        source: 'orders_table',
        transformations: ['average'],
        tags: ['behavior', 'user', 'revenue'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'user_last_order_days',
        type: 'numerical',
        description: 'Days since last order',
        source: 'orders_table',
        transformations: ['date_diff'],
        tags: ['behavior', 'user', 'recency'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'user_preferred_categories',
        type: 'categorical',
        description: 'Top 3 preferred product categories',
        source: 'order_items_table',
        transformations: ['top_categories'],
        tags: ['behavior', 'user', 'preferences'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'user_session_duration_avg',
        type: 'numerical',
        description: 'Average session duration in minutes',
        source: 'user_behaviors_table',
        transformations: ['average'],
        tags: ['behavior', 'user', 'engagement'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'user_cart_abandonment_rate',
        type: 'numerical',
        description: 'Cart abandonment rate (0-1)',
        source: 'cart_items_table',
        transformations: ['rate_calculation'],
        tags: ['behavior', 'user', 'conversion'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'user_rating_avg',
        type: 'numerical',
        description: 'Average rating given by user',
        source: 'reviews_table',
        transformations: ['average'],
        tags: ['behavior', 'user', 'quality'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },

      // Product Features
      {
        name: 'product_price',
        type: 'numerical',
        description: 'Current product price',
        source: 'products_table',
        transformations: ['normalize'],
        tags: ['product', 'pricing'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_rating',
        type: 'numerical',
        description: 'Average product rating',
        source: 'reviews_table',
        transformations: ['average'],
        tags: ['product', 'quality'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_review_count',
        type: 'numerical',
        description: 'Total number of reviews',
        source: 'reviews_table',
        transformations: ['count'],
        tags: ['product', 'social_proof'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_sales_count',
        type: 'numerical',
        description: 'Total sales count',
        source: 'order_items_table',
        transformations: ['count'],
        tags: ['product', 'popularity'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_category',
        type: 'categorical',
        description: 'Product category',
        source: 'products_table',
        transformations: ['encode'],
        tags: ['product', 'category'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_brand',
        type: 'categorical',
        description: 'Product brand',
        source: 'products_table',
        transformations: ['encode'],
        tags: ['product', 'brand'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_discount_percentage',
        type: 'numerical',
        description: 'Current discount percentage',
        source: 'products_table',
        transformations: ['calculate_discount'],
        tags: ['product', 'pricing', 'promotion'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_view_count_7d',
        type: 'numerical',
        description: 'Product views in last 7 days',
        source: 'user_behaviors_table',
        transformations: ['count_7d'],
        tags: ['product', 'engagement', 'recent'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_inventory_level',
        type: 'numerical',
        description: 'Current inventory level',
        source: 'products_table',
        transformations: ['normalize'],
        tags: ['product', 'inventory'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'product_days_since_launch',
        type: 'numerical',
        description: 'Days since product launch',
        source: 'products_table',
        transformations: ['date_diff'],
        tags: ['product', 'lifecycle'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },

      // Context Features
      {
        name: 'hour_of_day',
        type: 'numerical',
        description: 'Hour of day (0-23)',
        source: 'realtime',
        transformations: ['extract_hour'],
        tags: ['context', 'time'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'day_of_week',
        type: 'categorical',
        description: 'Day of week',
        source: 'realtime',
        transformations: ['extract_day'],
        tags: ['context', 'time'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'device_type',
        type: 'categorical',
        description: 'Device type (mobile/desktop/tablet)',
        source: 'request_context',
        transformations: ['device_detection'],
        tags: ['context', 'device'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'session_page_views',
        type: 'numerical',
        description: 'Page views in current session',
        source: 'session_context',
        transformations: ['count'],
        tags: ['context', 'session'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      },
      {
        name: 'session_duration',
        type: 'numerical',
        description: 'Current session duration in minutes',
        source: 'session_context',
        transformations: ['duration'],
        tags: ['context', 'session'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: false
      }
    ];

    // Register all core features
    for (const feature of coreFeatures) {
      await this.registry.registerFeature(feature);
    }

    this.serviceHealth.features.total += coreFeatures.length;
    this.serviceHealth.features.online += coreFeatures.length;
    
    logger.info(`✅ Registered ${coreFeatures.length} core features`);
  }

  private async initializeBangladeshFeatures(): Promise<void> {
    const bangladeshFeatures: FeatureDefinition[] = [
      // Bangladesh Cultural Features
      {
        name: 'user_region_bangladesh',
        type: 'categorical',
        description: 'Bangladesh division (Dhaka, Chittagong, etc.)',
        source: 'users_table',
        transformations: ['region_mapping'],
        tags: ['geography', 'bangladesh', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'user_preferred_payment_method',
        type: 'categorical',
        description: 'Preferred payment method (bkash, nagad, rocket, etc.)',
        source: 'orders_table',
        transformations: ['most_frequent'],
        tags: ['payment', 'bangladesh', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'user_bengali_language_preference',
        type: 'boolean',
        description: 'User prefers Bengali language interface',
        source: 'users_table',
        transformations: ['boolean'],
        tags: ['language', 'bangladesh', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'user_festival_activity_score',
        type: 'numerical',
        description: 'Activity score during festivals (Eid, Pohela Boishakh)',
        source: 'user_behaviors_table',
        transformations: ['festival_scoring'],
        tags: ['culture', 'bangladesh', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'user_prayer_time_activity',
        type: 'categorical',
        description: 'Activity pattern around prayer times',
        source: 'user_behaviors_table',
        transformations: ['prayer_time_analysis'],
        tags: ['culture', 'bangladesh', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'user_cod_preference',
        type: 'numerical',
        description: 'Cash on delivery preference score (0-1)',
        source: 'orders_table',
        transformations: ['cod_preference'],
        tags: ['payment', 'bangladesh', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'user_mobile_banking_usage',
        type: 'numerical',
        description: 'Mobile banking usage score (0-1)',
        source: 'orders_table',
        transformations: ['mobile_banking_score'],
        tags: ['payment', 'bangladesh', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'user_rural_urban_classification',
        type: 'categorical',
        description: 'Rural/Urban classification based on location',
        source: 'users_table',
        transformations: ['rural_urban_classification'],
        tags: ['geography', 'bangladesh', 'user'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },

      // Bangladesh Product Features
      {
        name: 'product_local_brand',
        type: 'boolean',
        description: 'Whether product is from local Bangladesh brand',
        source: 'products_table',
        transformations: ['local_brand_detection'],
        tags: ['product', 'bangladesh', 'local'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'product_festival_relevance',
        type: 'numerical',
        description: 'Relevance score for current festival season',
        source: 'products_table',
        transformations: ['festival_relevance'],
        tags: ['product', 'bangladesh', 'festival'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'product_regional_popularity',
        type: 'numerical',
        description: 'Popularity score by Bangladesh region',
        source: 'order_items_table',
        transformations: ['regional_popularity'],
        tags: ['product', 'bangladesh', 'regional'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'product_bdt_price_tier',
        type: 'categorical',
        description: 'BDT price tier (budget/mid/premium)',
        source: 'products_table',
        transformations: ['bdt_price_tier'],
        tags: ['product', 'bangladesh', 'pricing'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'product_shipping_bangladesh',
        type: 'categorical',
        description: 'Shipping options within Bangladesh',
        source: 'products_table',
        transformations: ['shipping_options'],
        tags: ['product', 'bangladesh', 'shipping'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },

      // Bangladesh Context Features
      {
        name: 'current_bangladesh_festival',
        type: 'categorical',
        description: 'Current Bangladesh festival (if any)',
        source: 'realtime',
        transformations: ['festival_detection'],
        tags: ['context', 'bangladesh', 'festival'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'prayer_time_context',
        type: 'categorical',
        description: 'Current prayer time context',
        source: 'realtime',
        transformations: ['prayer_time_context'],
        tags: ['context', 'bangladesh', 'prayer'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'bangladesh_weather_context',
        type: 'categorical',
        description: 'Current weather context affecting shopping',
        source: 'weather_api',
        transformations: ['weather_context'],
        tags: ['context', 'bangladesh', 'weather'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'bangladesh_economic_indicator',
        type: 'numerical',
        description: 'Current economic indicator affecting purchasing',
        source: 'economic_data',
        transformations: ['economic_indicator'],
        tags: ['context', 'bangladesh', 'economic'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      },
      {
        name: 'ramadan_context',
        type: 'boolean',
        description: 'Whether currently in Ramadan period',
        source: 'realtime',
        transformations: ['ramadan_detection'],
        tags: ['context', 'bangladesh', 'ramadan'],
        owner: 'ml-team',
        version: '1.0',
        bangladesh_specific: true
      }
    ];

    // Register all Bangladesh features
    for (const feature of bangladeshFeatures) {
      await this.registry.registerFeature(feature);
    }

    this.serviceHealth.features.total += bangladeshFeatures.length;
    this.serviceHealth.features.bangladesh += bangladeshFeatures.length;
    
    logger.info(`✅ Registered ${bangladeshFeatures.length} Bangladesh-specific features`);
  }

  /**
   * Get features from online store (real-time)
   */
  async getOnlineFeatures(request: FeatureRequest): Promise<FeatureResponse> {
    const startTime = Date.now();
    
    try {
      logger.info('🔍 Getting online features', { 
        entityId: request.entityId,
        entityType: request.entityType,
        featureCount: request.featureNames.length
      });

      const features = await this.onlineStore.getFeatures(request);
      const latency = Date.now() - startTime;

      const response: FeatureResponse = {
        entityId: request.entityId,
        entityType: request.entityType,
        features: features,
        timestamp: new Date(),
        cacheHit: features._cacheHit || false,
        latency: latency
      };

      // Update performance metrics
      this.updatePerformanceMetrics(latency, response.cacheHit);

      logger.info('✅ Online features retrieved', {
        entityId: request.entityId,
        featureCount: Object.keys(features).length,
        latency: latency,
        cacheHit: response.cacheHit
      });

      return response;

    } catch (error) {
      logger.error('❌ Error getting online features', { error });
      throw error;
    }
  }

  /**
   * Get features from offline store (batch)
   */
  async getOfflineFeatures(request: FeatureRequest): Promise<FeatureResponse> {
    const startTime = Date.now();
    
    try {
      logger.info('📊 Getting offline features', {
        entityId: request.entityId,
        entityType: request.entityType,
        featureCount: request.featureNames.length
      });

      const features = await this.offlineStore.getFeatures(request);
      const latency = Date.now() - startTime;

      const response: FeatureResponse = {
        entityId: request.entityId,
        entityType: request.entityType,
        features: features,
        timestamp: new Date(),
        cacheHit: false,
        latency: latency
      };

      logger.info('✅ Offline features retrieved', {
        entityId: request.entityId,
        featureCount: Object.keys(features).length,
        latency: latency
      });

      return response;

    } catch (error) {
      logger.error('❌ Error getting offline features', { error });
      throw error;
    }
  }

  /**
   * Store features in both online and offline stores
   */
  async storeFeatures(values: FeatureValue[]): Promise<void> {
    try {
      logger.info('💾 Storing features', { featureCount: values.length });

      // Store in online store for real-time access
      await this.onlineStore.storeFeatures(values);
      
      // Store in offline store for batch processing
      await this.offlineStore.storeFeatures(values);

      logger.info('✅ Features stored successfully', { featureCount: values.length });

    } catch (error) {
      logger.error('❌ Error storing features', { error });
      throw error;
    }
  }

  /**
   * Register new feature definition
   */
  async registerFeature(feature: FeatureDefinition): Promise<void> {
    try {
      await this.registry.registerFeature(feature);
      
      if (feature.bangladesh_specific) {
        this.serviceHealth.features.bangladesh++;
      }
      
      this.serviceHealth.features.total++;
      
      logger.info('✅ Feature registered successfully', { featureName: feature.name });

    } catch (error) {
      logger.error('❌ Error registering feature', { error });
      throw error;
    }
  }

  /**
   * Get feature definitions
   */
  async getFeatureDefinitions(): Promise<FeatureDefinition[]> {
    return this.registry.getFeatureDefinitions();
  }

  /**
   * Get Bangladesh-specific features
   */
  async getBangladeshFeatures(): Promise<FeatureDefinition[]> {
    return this.registry.getBangladeshFeatures();
  }

  /**
   * Get service health
   */
  getServiceHealth(): any {
    return this.serviceHealth;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(latency: number, cacheHit: boolean): void {
    // Update average latency (simple moving average)
    this.serviceHealth.performance.avgLatency = 
      (this.serviceHealth.performance.avgLatency + latency) / 2;
    
    // Update cache hit rate
    if (cacheHit) {
      this.serviceHealth.performance.cacheHitRate = 
        Math.min(1, this.serviceHealth.performance.cacheHitRate + 0.1);
    } else {
      this.serviceHealth.performance.cacheHitRate = 
        Math.max(0, this.serviceHealth.performance.cacheHitRate - 0.05);
    }
    
    // Update throughput
    this.serviceHealth.performance.throughput++;
  }
}