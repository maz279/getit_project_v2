/**
 * SearchServicePhase4 - Phase 4 Production Search Service with Enterprise Features
 * Complete production deployment service with health monitoring, analytics, and resilience
 */

import express from 'express';
import { UnifiedAISearchService } from '../../services/ai-search/UnifiedAISearchService.js';
import { HealthMonitorService } from '../../services/ai-search/production/HealthMonitorService.js';
import { ProductionAnalyticsService } from '../../services/ai-search/production/ProductionAnalyticsService.js';
import { ConfigurationManager } from '../../services/ai-search/production/ConfigurationManager.js';
import { Phase4ProductionRoutes } from './Phase4ProductionRoutes.js';

export class SearchServicePhase4 {
  private app: express.Application;
  private unifiedAISearchService: UnifiedAISearchService;
  private healthMonitor: HealthMonitorService;
  private analyticsService: ProductionAnalyticsService;
  private configManager: ConfigurationManager;
  private productionRoutes: Phase4ProductionRoutes;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.initializeServices();
    this.setupRoutes();
    console.log('🚀 SearchServicePhase4 initialized with production deployment features');
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Add correlation ID middleware
    this.app.use((req, res, next) => {
      const correlationId = req.headers['x-correlation-id'] || this.generateCorrelationId();
      req.correlationId = correlationId as string;
      res.setHeader('x-correlation-id', correlationId);
      next();
    });

    // Request logging middleware
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        if (this.analyticsService) {
          this.analyticsService.trackPerformance({
            operation: `${req.method} ${req.path}`,
            duration: responseTime,
            success: res.statusCode < 400,
            correlationId: req.correlationId,
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              userAgent: req.headers['user-agent'],
              ip: req.ip
            }
          });
        }
      });
      
      next();
    });
  }

  private initializeServices(): void {
    // Initialize Phase 4 production services
    this.healthMonitor = new HealthMonitorService();
    this.analyticsService = new ProductionAnalyticsService();
    this.configManager = new ConfigurationManager();
    
    // Initialize main search service (if not already initialized)
    if (!this.unifiedAISearchService) {
      this.unifiedAISearchService = UnifiedAISearchService.getInstance();
    }

    // Initialize production routes
    this.productionRoutes = new Phase4ProductionRoutes(
      this.healthMonitor,
      this.analyticsService,
      this.configManager,
      null // ResilienceManager placeholder
    );

    console.log('✅ All Phase 4 production services initialized successfully');
  }

  private setupRoutes(): void {
    // Health Monitoring Routes (using relative paths)
    this.app.get('/health/shallow', 
      this.productionRoutes.healthShallow.bind(this.productionRoutes));
    this.app.get('/health/deep', 
      this.productionRoutes.healthDeep.bind(this.productionRoutes));
    this.app.get('/health/live', 
      this.productionRoutes.healthLive.bind(this.productionRoutes));
    this.app.get('/health/ready', 
      this.productionRoutes.healthReady.bind(this.productionRoutes));
    this.app.get('/health/dependencies', 
      this.productionRoutes.healthDependencies.bind(this.productionRoutes));
    this.app.get('/health/metrics', 
      this.productionRoutes.healthMetrics.bind(this.productionRoutes));

    // Analytics Routes (using relative paths)
    this.app.get('/analytics/performance', 
      this.productionRoutes.analyticsPerformance.bind(this.productionRoutes));
    this.app.get('/analytics/search', 
      this.productionRoutes.analyticsSearch.bind(this.productionRoutes));
    this.app.get('/analytics/errors', 
      this.productionRoutes.analyticsErrors.bind(this.productionRoutes));
    this.app.get('/analytics/export', 
      this.productionRoutes.analyticsExport.bind(this.productionRoutes));

    // Configuration Management Routes (using relative paths)
    this.app.get('/config/current', 
      this.productionRoutes.configCurrent.bind(this.productionRoutes));
    this.app.post('/config/update', 
      this.productionRoutes.configUpdate.bind(this.productionRoutes));
    this.app.get('/config/features', 
      this.productionRoutes.configFeatures.bind(this.productionRoutes));
    this.app.post('/config/features/toggle', 
      this.productionRoutes.configToggleFeature.bind(this.productionRoutes));
    this.app.get('/config/history', 
      this.productionRoutes.configHistory.bind(this.productionRoutes));

    // Production Dashboard (using relative paths)
    this.app.get('/dashboard/production', 
      this.productionRoutes.productionDashboard.bind(this.productionRoutes));

    // Enhanced AI Search with Analytics Integration (using relative path)
    this.app.post('/ai-search', async (req, res) => {
      const startTime = Date.now();
      const correlationId = req.correlationId;
      
      try {
        // Check feature flags
        const enableAdvancedFeatures = this.configManager.isFeatureEnabled('advanced-caching', {
          userId: req.body.userId,
          sessionId: req.body.sessionId
        });

        // Perform the search
        const searchResult = await this.unifiedAISearchService.performUnifiedSearch(
          req.body.query, 
          req.body.context || {}
        );

        const responseTime = Date.now() - startTime;

        // Track search analytics
        this.analyticsService.trackSearch({
          query: req.body.query,
          language: req.body.context?.language || 'en',
          userId: req.body.userId,
          sessionId: req.body.sessionId,
          responseTime,
          resultCount: searchResult.data?.results?.length || 0,
          cacheHit: searchResult.metadata?.cacheHit || false,
          searchQuality: searchResult.metadata?.searchScore || 0,
          correlationId,
          userAgent: req.headers['user-agent'] as string,
          ip: req.ip
        });

        // Add Phase 4 metadata
        searchResult.metadata = {
          ...searchResult.metadata,
          correlationId,
          phase: 'phase4-production',
          service: 'unified-ai-search-service-v5.0',
          featuresEnabled: {
            advancedCaching: enableAdvancedFeatures,
            healthMonitoring: true,
            analyticsTracking: true
          }
        };

        res.status(200).json(searchResult);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        // Track error analytics
        this.analyticsService.trackError({
          type: 'search_error',
          message: error.message,
          stack: error.stack,
          correlationId,
          context: {
            query: req.body.query,
            responseTime,
            userAgent: req.headers['user-agent'],
            ip: req.ip
          },
          severity: 'high',
          userId: req.body.userId,
          sessionId: req.body.sessionId
        });

        res.status(500).json({
          success: false,
          error: 'Search operation failed',
          details: error.message,
          metadata: {
            correlationId,
            responseTime,
            service: 'unified-ai-search-service-v5.0',
            timestamp: Date.now()
          }
        });
      }
    });

    // Legacy health endpoint for backward compatibility
    this.app.get('/api/v1/search/health', async (req, res) => {
      try {
        const healthResult = await this.healthMonitor.performShallowHealthCheck();
        res.status(200).json({
          service: 'unified-ai-search-service-v5.0',
          status: healthResult.status,
          version: '5.0.0-phase4',
          phase: 'production-deployment',
          features: ['health-monitoring', 'analytics', 'configuration-management'],
          timestamp: Date.now(),
          uptime: process.uptime(),
          details: healthResult
        });
      } catch (error) {
        res.status(500).json({
          service: 'unified-ai-search-service-v5.0',
          status: 'unhealthy',
          error: error.message,
          timestamp: Date.now()
        });
      }
    });

    console.log('🛣️ All Phase 4 production routes configured successfully');
  }

  /**
   * Get Express App Instance
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Get Production Services for External Access
   */
  getProductionServices() {
    return {
      healthMonitor: this.healthMonitor,
      analyticsService: this.analyticsService,
      configManager: this.configManager,
      unifiedAISearchService: this.unifiedAISearchService
    };
  }

  /**
   * Manual Health Check Trigger
   */
  async triggerHealthCheck(type: 'shallow' | 'deep' | 'dependency' = 'shallow') {
    return await this.healthMonitor.triggerManualHealthCheck(type);
  }

  /**
   * Export Production Analytics
   */
  exportAnalytics(options: any = {}) {
    return this.analyticsService.exportAnalyticsData(options);
  }

  /**
   * Update Configuration
   */
  updateConfiguration(config: any) {
    return this.configManager.updateConfiguration(config);
  }

  /**
   * Generate Correlation ID
   */
  private generateCorrelationId(): string {
    return `phase4_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Graceful Shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down SearchServicePhase4...');
    
    try {
      if (this.healthMonitor) {
        this.healthMonitor.destroy();
      }
      if (this.analyticsService) {
        this.analyticsService.destroy();
      }
      if (this.configManager) {
        this.configManager.destroy();
      }
      
      console.log('✅ SearchServicePhase4 shutdown completed');
    } catch (error) {
      console.error('💥 Error during shutdown:', error);
    }
  }
}

// Global instance for use across the application
let searchServicePhase4Instance: SearchServicePhase4;

export function getSearchServicePhase4(): SearchServicePhase4 {
  if (!searchServicePhase4Instance) {
    searchServicePhase4Instance = new SearchServicePhase4();
  }
  return searchServicePhase4Instance;
}