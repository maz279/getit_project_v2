/**
 * Consolidated Services Index
 * Phase 2: Service Consolidation Implementation
 * 
 * Unified export system for all 25 consolidated domain services
 */

// Base Service Architecture
export { BaseService } from './base/BaseService';
export type { ServiceConfig, ServiceHealth, ServiceResponse } from './base/BaseService';

// Service Utilities
export { ServiceLogger } from './utils/ServiceLogger';
export { ErrorHandler } from './utils/ErrorHandler';
export { ServiceMetrics } from './utils/ServiceMetrics';

// Core Business Services (8 Services)
export { UserManagementService } from './core/UserManagementService';
export type { 
  UserProfile, 
  UserPreferences, 
  AuthenticationResult, 
  UserRegistrationData 
} from './core/UserManagementService';

export { ProductCatalogService } from './core/ProductCatalogService';
export type { 
  Product, 
  ProductCategory, 
  ProductFilters, 
  ProductSearchResult 
} from './core/ProductCatalogService';

export { OrderManagementService } from './core/OrderManagementService';
export type { 
  Order, 
  OrderItem, 
  OrderStatus, 
  CreateOrderRequest 
} from './core/OrderManagementService';

export { PaymentProcessingService } from './core/PaymentProcessingService';
export type { 
  PaymentMethod, 
  PaymentTransaction, 
  PaymentRequest, 
  RefundRequest 
} from './core/PaymentProcessingService';

export { CartService } from './core/CartService';
export type { 
  CartItem, 
  CartSummary, 
  CartAnalytics, 
  BangladeshCartFeatures 
} from './core/CartService';

export { InventoryService } from './core/InventoryService';
export type { 
  InventoryItem, 
  InventoryLocation, 
  StockMovement, 
  InventoryAnalytics, 
  InventoryForecast 
} from './core/InventoryService';

export { AnalyticsService } from './core/AnalyticsService';
export type { 
  AnalyticsEvent, 
  AnalyticsMetrics, 
  BangladeshAnalytics, 
  RealTimeAnalytics, 
  CustomerBehaviorAnalytics 
} from './core/AnalyticsService';

export { VendorService } from './core/VendorService';
export type { 
  VendorProfile, 
  VendorPerformance, 
  VendorCommission, 
  VendorAnalytics, 
  VendorDocument 
} from './core/VendorService';

// Infrastructure Services (7 Services)
export { UnifiedApiClient } from './infrastructure/UnifiedApiClient';
export type { ApiResponse, ApiRequest, ApiClientConfig } from './infrastructure/UnifiedApiClient';

export { ServiceRegistry } from './infrastructure/ServiceRegistry';
export type { 
  ServiceRegistration, 
  ServiceType, 
  ServiceQuery 
} from './infrastructure/ServiceRegistry';

export { AdvancedCacheService } from './infrastructure/AdvancedCacheService';
export type { 
  CacheConfig, 
  CacheEntry, 
  CacheStats, 
  CacheInvalidationEvent 
} from './infrastructure/AdvancedCacheService';

export { PerformanceOptimizer } from './infrastructure/PerformanceOptimizer';
export type { 
  PerformanceConfig, 
  PerformanceMetrics, 
  OptimizationRule, 
  PerformanceBenchmark 
} from './infrastructure/PerformanceOptimizer';

export { CacheService } from './infrastructure/CacheService';
export type { 
  CacheConfig, 
  CacheItem, 
  CacheStats, 
  BangladeshCacheOptimization 
} from './infrastructure/CacheService';

export { NotificationService } from './infrastructure/NotificationService';
export type { 
  Notification, 
  NotificationTemplate, 
  UserNotificationPreferences, 
  NotificationCampaign,
  BangladeshNotificationFeatures 
} from './infrastructure/NotificationService';

export { SecurityService } from './infrastructure/SecurityService';
export type { 
  SecurityEvent, 
  SecurityAction, 
  FraudDetectionResult, 
  UserSecurityProfile,
  BangladeshCompliance 
} from './infrastructure/SecurityService';

// Advanced Features Services (8 Services)
export { AIPersonalizationService } from './advanced/AIPersonalizationService';
export type { 
  UserBehaviorProfile, 
  PersonalizationRecommendation, 
  AIModelConfig, 
  PersonalizationAnalytics 
} from './advanced/AIPersonalizationService';

export { MLEngineService } from './advanced/MLEngineService';
export type { 
  MLModelConfig, 
  MLPredictionResult, 
  ModelTrainingJob, 
  BangladeshMLFeatures 
} from './advanced/MLEngineService';

export { RealtimeService } from './advanced/RealtimeService';
export type { 
  WebSocketConnection, 
  RealTimeEvent, 
  ChannelConfig, 
  PresenceInfo,
  RealTimeAnalytics 
} from './advanced/RealtimeService';

export { ContentService } from './advanced/ContentService';
export type { 
  Content, 
  ContentTemplate, 
  ContentWorkflow, 
  ContentAnalytics,
  BangladeshContentFeatures 
} from './advanced/ContentService';

export { SocialCommerceService } from './advanced/SocialCommerceService';
export type { 
  SocialCommerceCampaign, 
  InfluencerProfile, 
  UserGeneratedContent, 
  SocialCommerceAnalytics 
} from './advanced/SocialCommerceService';

export { LiveCommerceService } from './advanced/LiveCommerceService';
export type { 
  LiveCommerceStream, 
  StreamViewer, 
  LiveChatMessage, 
  LiveStreamAnalytics 
} from './advanced/LiveCommerceService';

export { LogisticsService } from './advanced/LogisticsService';
export type { 
  Shipment, 
  DeliveryHub, 
  RouteOptimization, 
  LogisticsAnalytics 
} from './advanced/LogisticsService';

// Phase 3 Performance Services
export { BundleOptimizer } from './performance/BundleOptimizer';
export type { 
  BundleConfig, 
  BundleMetrics, 
  OptimizationResult 
} from './performance/BundleOptimizer';

export { MobileOptimizationService } from './performance/useMobileOptimization';
export type { 
  MobileDeviceInfo, 
  MobileOptimizationSettings, 
  MobilePerformanceMetrics,
  MobileUserExperience 
} from './performance/useMobileOptimization';

// Phase 4 Analytics Services
export { ClickHouseAnalytics } from './analytics/ClickHouseAnalytics';
export type { 
  AnalyticsEvent, 
  RealTimeQuery, 
  AnalyticsMetrics,
  BangladeshAnalytics 
} from './analytics/ClickHouseAnalytics';

export { BusinessIntelligence } from './analytics/BusinessIntelligence';
export type { 
  ExecutiveKPI, 
  BIDashboard, 
  MarketIntelligence,
  FinancialAnalytics,
  StrategicInsights 
} from './analytics/BusinessIntelligence';

export { PredictiveAnalytics } from './analytics/PredictiveAnalytics';
export type { 
  PredictionModel, 
  PredictionResult, 
  ForecastData,
  CustomerPrediction,
  MarketPrediction 
} from './analytics/PredictiveAnalytics';

// Phase 5 Enterprise Infrastructure Services
export { EnterpriseInfrastructureService } from './infrastructure/EnterpriseInfrastructureService';
export type { 
  InfrastructureHealth, 
  AutoScalingConfig, 
  DeploymentStrategy,
  ServiceMeshConfig,
  InfrastructureMetrics 
} from './infrastructure/EnterpriseInfrastructureService';

// Phase 6 Optimization Services
export { AdvancedPerformanceOptimizer } from './optimization/AdvancedPerformanceOptimizer';
export type { 
  OptimizationRule, 
  PerformanceMetrics, 
  OptimizationRecommendation,
  BottleneckAnalysis,
  AutoOptimizationConfig 
} from './optimization/AdvancedPerformanceOptimizer';

export { LoadTestingService } from './optimization/LoadTestingService';
export type { 
  LoadTestConfig, 
  LoadTestResult, 
  TestScenarioTemplate,
  PerformanceBaseline 
} from './optimization/LoadTestingService';

export { SecurityHardeningService } from './optimization/SecurityHardeningService';
export type { 
  SecurityAssessmentResult, 
  SecurityVulnerability, 
  PenetrationTestConfig,
  PenetrationTestResult,
  ComplianceStatus 
} from './optimization/SecurityHardeningService';

// Service Instance Creation Functions
export function createUserManagementService(storage: any): UserManagementService {
  return new UserManagementService(storage);
}

export function createProductCatalogService(storage: any): ProductCatalogService {
  return new ProductCatalogService(storage);
}

export function createOrderManagementService(storage: any): OrderManagementService {
  return new OrderManagementService(storage);
}

export function createPaymentProcessingService(storage: any): PaymentProcessingService {
  return new PaymentProcessingService(storage);
}

export function createUnifiedApiClient(config?: any): UnifiedApiClient {
  return new UnifiedApiClient(config);
}

export function createServiceRegistry(): ServiceRegistry {
  return new ServiceRegistry();
}

export function createAdvancedCacheService(config?: any): AdvancedCacheService {
  return new AdvancedCacheService(config);
}

export function createPerformanceOptimizer(config?: any): PerformanceOptimizer {
  return new PerformanceOptimizer(config);
}

// Service Manager for coordinating all services
export class ServiceManager {
  private serviceRegistry: ServiceRegistry;
  private apiClient: UnifiedApiClient;
  private services: Map<string, any>;

  constructor() {
    this.serviceRegistry = new ServiceRegistry();
    this.apiClient = new UnifiedApiClient();
    this.services = new Map();
  }

  async initializeServices(storage: any): Promise<void> {
    // Create all core services
    const userService = createUserManagementService(storage);
    const productService = createProductCatalogService(storage);
    const orderService = createOrderManagementService(storage);
    const paymentService = createPaymentProcessingService(storage);
    
    // Create Phase 3 performance services
    const cacheService = createAdvancedCacheService();
    const performanceOptimizer = createPerformanceOptimizer();

    // Register core services
    await this.serviceRegistry.registerService(userService, {
      tags: ['core', 'user-management'],
      capabilities: ['authentication', 'user-profiles', 'preferences']
    });

    await this.serviceRegistry.registerService(productService, {
      tags: ['core', 'product-management'],
      capabilities: ['product-catalog', 'inventory', 'categories']
    });

    await this.serviceRegistry.registerService(orderService, {
      tags: ['core', 'order-management'],
      capabilities: ['order-processing', 'tracking', 'fulfillment']
    });

    await this.serviceRegistry.registerService(paymentService, {
      tags: ['core', 'payment-processing'],
      capabilities: ['payments', 'refunds', 'mobile-banking']
    });

    // Register Phase 3 performance services
    await this.serviceRegistry.registerService(cacheService, {
      tags: ['infrastructure', 'performance', 'cache'],
      capabilities: ['multi-tier-cache', 'invalidation', 'optimization']
    });

    await this.serviceRegistry.registerService(performanceOptimizer, {
      tags: ['infrastructure', 'performance', 'optimization'],
      capabilities: ['performance-monitoring', 'optimization', 'benchmarking']
    });

    // Store service references
    this.services.set('UserManagementService', userService);
    this.services.set('ProductCatalogService', productService);
    this.services.set('OrderManagementService', orderService);
    this.services.set('PaymentProcessingService', paymentService);
    this.services.set('AdvancedCacheService', cacheService);
    this.services.set('PerformanceOptimizer', performanceOptimizer);
  }

  async getService<T>(serviceName: string): Promise<T | null> {
    return this.services.get(serviceName) || null;
  }

  async getAllServices(): Promise<Map<string, any>> {
    return this.services;
  }

  async getServiceHealth(): Promise<any> {
    return await this.serviceRegistry.getRegistryHealth();
  }

  async shutdown(): Promise<void> {
    // Shutdown all services
    for (const [name, service] of this.services) {
      if (service.shutdown) {
        await service.shutdown();
      }
    }

    await this.serviceRegistry.shutdown();
  }
}