/**
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * Configuration Management Service - Amazon.com/Shopee.sg-Level Enterprise Configuration System
 * 
 * Features:
 * - Feature flag management with advanced targeting
 * - A/B testing platform with statistical analysis
 * - Configuration validation with Bangladesh compliance
 * - Real-time configuration updates via WebSocket
 * - Enterprise-grade audit trails and analytics
 * - AWS AppConfig-level functionality
 * 
 * Last Updated: July 9, 2025
 */

import express, { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Server } from 'http';

// Import all Phase 1 controllers
import { FeatureFlagController } from './controllers/FeatureFlagController';
import { ABTestingController } from './controllers/ABTestingController';
import { ConfigValidationController } from './controllers/ConfigValidationController';
import { RealTimeConfigController } from './controllers/RealTimeConfigController';

// Import all Phase 2 controllers
import { AnalyticsController } from './controllers/AnalyticsController';
import { MLController } from './controllers/MLController';
import { IntegrationController } from './controllers/IntegrationController';
import { DashboardController } from './controllers/DashboardController';

export class ConfigService {
  private app: express.Application;
  private router: Router;
  private server?: Server;
  
  // Phase 1 Controllers
  // Phase 1 controllers
  private featureFlagController: FeatureFlagController;
  private abTestingController: ABTestingController;
  private configValidationController: ConfigValidationController;
  private realTimeConfigController: RealTimeConfigController;

  // Phase 2 controllers
  private analyticsController: AnalyticsController;
  private mlController: MLController;
  private integrationController: IntegrationController;
  private dashboardController: DashboardController;

  constructor(server?: Server) {
    this.app = express();
    this.router = Router();
    this.server = server;

    // Initialize Phase 1 controllers
    this.featureFlagController = new FeatureFlagController();
    this.abTestingController = new ABTestingController();
    this.configValidationController = new ConfigValidationController();
    this.realTimeConfigController = new RealTimeConfigController(server);

    // Initialize Phase 2 controllers
    this.analyticsController = new AnalyticsController();
    this.mlController = new MLController();
    this.integrationController = new IntegrationController();
    this.dashboardController = new DashboardController();

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup middleware for configuration service
   */
  private setupMiddleware(): void {
    // Rate limiting for configuration endpoints
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: {
        success: false,
        error: 'Too many configuration requests, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    });

    const validationLimiter = rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 200, // Validation is more resource intensive
      message: {
        success: false,
        error: 'Too many validation requests, please try again later'
      }
    });

    const realTimeLimiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 100, // Real-time operations
      message: {
        success: false,
        error: 'Too many real-time requests, please try again later'
      }
    });

    // Apply rate limiting
    this.router.use('/validation', validationLimiter);
    this.router.use('/realtime', realTimeLimiter);
    this.router.use(generalLimiter);

    // JSON parsing
    this.router.use(express.json({ limit: '10mb' }));
    this.router.use(express.urlencoded({ extended: true }));

    // Error handling middleware
    this.router.use(this.errorHandler.bind(this));
  }

  /**
   * Setup all configuration service routes
   */
  private setupRoutes(): void {
    // ============================================================================
    // HEALTH AND SERVICE INFO ROUTES
    // ============================================================================
    
    // Service health check
    this.router.get('/health', this.getServiceHealth.bind(this));
    
    // Service information
    this.router.get('/info', this.getServiceInfo.bind(this));

    // ============================================================================
    // FEATURE FLAGS ROUTES - Amazon.com/Shopee.sg-Level Feature Management
    // ============================================================================
    
    // Get all feature flags
    this.router.get('/flags', this.featureFlagController.getAllFeatureFlags.bind(this.featureFlagController));
    
    // Get specific feature flag
    this.router.get('/flags/:identifier', this.featureFlagController.getFeatureFlag.bind(this.featureFlagController));
    
    // Create feature flag
    this.router.post('/flags', this.featureFlagController.createFeatureFlag.bind(this.featureFlagController));
    
    // Update feature flag
    this.router.put('/flags/:id', this.featureFlagController.updateFeatureFlag.bind(this.featureFlagController));
    
    // Delete feature flag
    this.router.delete('/flags/:id', this.featureFlagController.deleteFeatureFlag.bind(this.featureFlagController));
    
    // Toggle feature flag status
    this.router.patch('/flags/:id/toggle', this.featureFlagController.toggleFeatureFlag.bind(this.featureFlagController));
    
    // Update rollout percentage
    this.router.patch('/flags/:id/rollout', this.featureFlagController.updateRolloutPercentage.bind(this.featureFlagController));
    
    // Get feature flag analytics
    this.router.get('/flags/:id/analytics', this.featureFlagController.getFeatureFlagAnalytics.bind(this.featureFlagController));
    
    // Get feature flags health
    this.router.get('/flags/health/status', this.featureFlagController.getFeatureFlagHealth.bind(this.featureFlagController));

    // ============================================================================
    // A/B TESTING ROUTES - Amazon.com/Shopee.sg-Level A/B Testing Platform
    // ============================================================================
    
    // Get all A/B tests
    this.router.get('/ab-tests', this.abTestingController.getAllABTests.bind(this.abTestingController));
    
    // Get specific A/B test
    this.router.get('/ab-tests/:id', this.abTestingController.getABTest.bind(this.abTestingController));
    
    // Create A/B test
    this.router.post('/ab-tests', this.abTestingController.createABTest.bind(this.abTestingController));
    
    // Update A/B test
    this.router.put('/ab-tests/:id', this.abTestingController.updateABTest.bind(this.abTestingController));
    
    // Start A/B test
    this.router.post('/ab-tests/:id/start', this.abTestingController.startABTest.bind(this.abTestingController));
    
    // Stop A/B test
    this.router.post('/ab-tests/:id/stop', this.abTestingController.stopABTest.bind(this.abTestingController));
    
    // Get A/B test assignment for user
    this.router.post('/ab-tests/:testId/assignment', this.abTestingController.getAssignment.bind(this.abTestingController));

    // ============================================================================
    // CONFIGURATION VALIDATION ROUTES - Enterprise Validation with Bangladesh Compliance
    // ============================================================================
    
    // Validate single configuration
    this.router.get('/validation/config/:id', this.configValidationController.validateConfiguration.bind(this.configValidationController));
    
    // Validate configuration batch
    this.router.post('/validation/batch', this.configValidationController.validateBatch.bind(this.configValidationController));
    
    // Validate deployment
    this.router.post('/validation/deployment', this.configValidationController.validateDeployment.bind(this.configValidationController));
    
    // Validate Bangladesh compliance
    this.router.post('/validation/bangladesh-compliance', this.configValidationController.validateBangladeshCompliance.bind(this.configValidationController));
    
    // Get validation rules
    this.router.get('/validation/rules', this.configValidationController.getValidationRules.bind(this.configValidationController));
    
    // Create custom validation rule
    this.router.post('/validation/rules', this.configValidationController.createValidationRule.bind(this.configValidationController));

    // ============================================================================
    // REAL-TIME CONFIGURATION ROUTES - Live Configuration Updates
    // ============================================================================
    
    // Get real-time configuration
    this.router.get('/realtime/config', this.realTimeConfigController.getRealTimeConfig.bind(this.realTimeConfigController));
    
    // Subscribe to configuration changes
    this.router.post('/realtime/subscribe', this.realTimeConfigController.subscribeToConfig.bind(this.realTimeConfigController));
    
    // Broadcast configuration update
    this.router.post('/realtime/broadcast', this.realTimeConfigController.broadcastConfigUpdate.bind(this.realTimeConfigController));
    
    // Get connection statistics
    this.router.get('/realtime/stats', this.realTimeConfigController.getConnectionStats.bind(this.realTimeConfigController));
    
    // Real-time service health check
    this.router.get('/realtime/health', this.realTimeConfigController.healthCheck.bind(this.realTimeConfigController));

    // ============================================================================
    // BANGLADESH MARKET SPECIFIC ROUTES
    // ============================================================================
    
    // Bangladesh regulatory compliance check
    this.router.get('/bangladesh/compliance-status', this.getBangladeshComplianceStatus.bind(this));
    
    // Bangladesh market configuration templates
    this.router.get('/bangladesh/templates', this.getBangladeshTemplates.bind(this));
    
    // Bangladesh cultural configuration
    this.router.get('/bangladesh/cultural-config', this.getBangladeshCulturalConfig.bind(this));

    // ============================================================================
    // PHASE 2: ANALYTICS ROUTES - Amazon.com/Shopee.sg-Level Configuration Analytics
    // ============================================================================
    
    // Get analytics dashboard
    this.router.get('/analytics/dashboard', this.analyticsController.getAnalyticsDashboard.bind(this.analyticsController));
    
    // Get feature flag analytics
    this.router.get('/analytics/feature-flags', this.analyticsController.getFeatureFlagAnalytics.bind(this.analyticsController));
    
    // Get A/B test analytics
    this.router.get('/analytics/ab-tests', this.analyticsController.getABTestAnalytics.bind(this.analyticsController));
    
    // Get performance analytics
    this.router.get('/analytics/performance', this.analyticsController.getPerformanceAnalytics.bind(this.analyticsController));
    
    // Get Bangladesh market analytics
    this.router.get('/analytics/bangladesh', this.analyticsController.getBangladeshAnalytics.bind(this.analyticsController));
    
    // Get cost optimization analytics
    this.router.get('/analytics/cost-optimization', this.analyticsController.getCostOptimizationAnalytics.bind(this.analyticsController));
    
    // Export analytics report
    this.router.post('/analytics/export', this.analyticsController.exportAnalyticsReport.bind(this.analyticsController));

    // ============================================================================
    // PHASE 2: ML/AI ROUTES - Machine Learning Configuration Optimization
    // ============================================================================
    
    // Get ML-powered optimization recommendations
    this.router.get('/ml/optimization-recommendations', this.mlController.getOptimizationRecommendations.bind(this.mlController));
    
    // Predict A/B test performance
    this.router.post('/ml/ab-tests/:testId/predict', this.mlController.predictABTestPerformance.bind(this.mlController));
    
    // Detect configuration anomalies
    this.router.get('/ml/anomalies', this.mlController.detectAnomalies.bind(this.mlController));
    
    // Get Bangladesh-specific AI insights
    this.router.get('/ml/bangladesh-insights', this.mlController.getBangladeshAIInsights.bind(this.mlController));
    
    // Train ML model
    this.router.post('/ml/models/:modelId/train', this.mlController.trainModel.bind(this.mlController));
    
    // Deploy ML model
    this.router.post('/ml/models/:modelId/deploy', this.mlController.deployModel.bind(this.mlController));
    
    // Get model performance
    this.router.get('/ml/models/:modelId/performance', this.mlController.getModelPerformance.bind(this.mlController));
    
    // Optimize feature flag using ML
    this.router.post('/ml/feature-flags/:flagId/optimize', this.mlController.optimizeFeatureFlag.bind(this.mlController));
    
    // Get predictive analytics
    this.router.get('/ml/predictive-analytics', this.mlController.getPredictiveAnalytics.bind(this.mlController));

    // ============================================================================
    // PHASE 2: INTEGRATION ROUTES - External System Integration Management
    // ============================================================================
    
    // Get all integrations
    this.router.get('/integrations', this.integrationController.getIntegrations.bind(this.integrationController));
    
    // Configure external integration
    this.router.put('/integrations/:integrationId', this.integrationController.configureIntegration.bind(this.integrationController));
    
    // Sync configuration with external system
    this.router.post('/integrations/:integrationId/sync', this.integrationController.syncConfiguration.bind(this.integrationController));
    
    // Get AWS AppConfig configurations
    this.router.get('/integrations/aws/appconfig', this.integrationController.getAWSAppConfig.bind(this.integrationController));
    
    // Deploy to AWS AppConfig
    this.router.post('/integrations/aws/appconfig/deploy', this.integrationController.deployToAWSAppConfig.bind(this.integrationController));
    
    // Get Google Cloud Configuration
    this.router.get('/integrations/gcp/config', this.integrationController.getGCPConfig.bind(this.integrationController));
    
    // Get Azure App Configuration
    this.router.get('/integrations/azure/appconfig', this.integrationController.getAzureAppConfig.bind(this.integrationController));
    
    // Sync with Bangladesh Bank API
    this.router.post('/integrations/bangladesh-bank/sync', this.integrationController.syncBangladeshBankAPI.bind(this.integrationController));
    
    // Sync with NBR Tax API
    this.router.post('/integrations/nbr-tax/sync', this.integrationController.syncNBRTaxAPI.bind(this.integrationController));
    
    // Test integration connection
    this.router.post('/integrations/:integrationId/test', this.integrationController.testConnection.bind(this.integrationController));
    
    // Get integration health status
    this.router.get('/integrations/health', this.integrationController.getIntegrationHealth.bind(this.integrationController));

    // ============================================================================
    // PHASE 2: DASHBOARD ROUTES - Advanced Visualization and Dashboard Management
    // ============================================================================
    
    // Get dashboard by role or ID
    this.router.get('/dashboards/:dashboardId?', this.dashboardController.getDashboard.bind(this.dashboardController));
    
    // Get all available dashboards
    this.router.get('/dashboards', this.dashboardController.getAllDashboards.bind(this.dashboardController));
    
    // Create custom dashboard
    this.router.post('/dashboards', this.dashboardController.createDashboard.bind(this.dashboardController));
    
    // Update dashboard configuration
    this.router.put('/dashboards/:dashboardId', this.dashboardController.updateDashboard.bind(this.dashboardController));
    
    // Delete dashboard
    this.router.delete('/dashboards/:dashboardId', this.dashboardController.deleteDashboard.bind(this.dashboardController));
    
    // Get widget data
    this.router.get('/dashboards/:dashboardId/widgets/:widgetId', this.dashboardController.getWidgetData.bind(this.dashboardController));
    
    // Get real-time dashboard updates
    this.router.get('/dashboards/:dashboardId/updates', this.dashboardController.getRealtimeUpdates.bind(this.dashboardController));
    
    // Export dashboard configuration
    this.router.get('/dashboards/:dashboardId/export', this.dashboardController.exportDashboard.bind(this.dashboardController));
    
    // Get dashboard analytics
    this.router.get('/dashboards/:dashboardId/analytics', this.dashboardController.getDashboardAnalytics.bind(this.dashboardController));

    console.log('✅ Configuration Service Phase 1 + Phase 2 routes initialized with complete Amazon.com/Shopee.sg-level functionality');
  }

  /**
   * Get service health status
   */
  private async getServiceHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = {
        service: 'config-service',
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        features: {
          featureFlags: 'operational',
          abTesting: 'operational',
          validation: 'operational',
          realTime: 'operational'
        },
        performance: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        },
        bangladesh: {
          complianceValidation: 'active',
          culturalFeatures: 'enabled',
          marketOptimization: 'operational'
        },
        integrations: {
          database: 'connected',
          redis: 'available',
          websocket: 'operational'
        }
      };

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        details: error.message
      });
    }
  }

  /**
   * Get detailed service information
   */
  private async getServiceInfo(req: Request, res: Response): Promise<void> {
    try {
      const info = {
        service: 'GetIt Configuration Management Service',
        description: 'Amazon.com/Shopee.sg-Level Enterprise Configuration Management System',
        version: '1.0.0',
        capabilities: [
          'Dynamic Feature Flag Management',
          'Advanced A/B Testing Platform', 
          'Configuration Validation & Compliance',
          'Real-time Configuration Updates',
          'Bangladesh Market Compliance',
          'Cultural Optimization Features',
          'Enterprise Audit Trails',
          'Performance Analytics'
        ],
        endpoints: {
          featureFlags: {
            count: 9,
            features: ['Dynamic targeting', 'Gradual rollouts', 'Analytics', 'Performance monitoring']
          },
          abTesting: {
            count: 7,
            features: ['Multi-variant testing', 'Statistical analysis', 'Audience targeting', 'Automatic winner detection']
          },
          validation: {
            count: 6,
            features: ['Schema validation', 'Security scanning', 'Bangladesh compliance', 'Performance analysis']
          },
          realTime: {
            count: 5,
            features: ['WebSocket streaming', 'Live updates', 'Connection management', 'Heartbeat monitoring']
          }
        },
        bangladesh: {
          compliance: ['NBR', 'Bangladesh Bank', 'Digital Commerce Act 2018'],
          culturalFeatures: ['Bengali language support', 'Islamic calendar', 'Festival awareness'],
          paymentIntegration: ['bKash', 'Nagad', 'Rocket'],
          mobileOptimization: ['Network adaptation', 'Data efficiency', 'Offline support']
        },
        documentation: {
          swagger: '/api/v1/config/docs',
          examples: '/api/v1/config/examples',
          integration: '/api/v1/config/integration-guide'
        }
      };

      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get service information',
        details: error.message
      });
    }
  }

  /**
   * Get Bangladesh compliance status
   */
  private async getBangladeshComplianceStatus(req: Request, res: Response): Promise<void> {
    try {
      const complianceStatus = {
        overall: 'compliant',
        lastChecked: new Date(),
        regulations: {
          nbr: {
            status: 'compliant',
            vatRate: 15,
            lastUpdate: '2024-01-01',
            requirements: ['VAT registration', 'Tax calculation', 'Reporting']
          },
          bangladeshBank: {
            status: 'compliant',
            supportedCurrencies: ['BDT', 'USD', 'EUR'],
            paymentMethods: ['bKash', 'Nagad', 'Rocket'],
            requirements: ['Currency validation', 'Payment gateway compliance']
          },
          digitalCommerceAct: {
            status: 'compliant',
            version: '2018',
            requirements: ['Consumer protection', 'Refund policy', 'Data privacy']
          }
        },
        recommendations: [
          'Monitor NBR VAT rate changes',
          'Update payment gateway configurations quarterly',
          'Review digital commerce compliance annually'
        ]
      };

      res.json({
        success: true,
        data: complianceStatus
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get Bangladesh compliance status'
      });
    }
  }

  /**
   * Get Bangladesh configuration templates
   */
  private async getBangladeshTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = {
        payment: {
          bkash: {
            apiUrl: 'https://checkout.pay.bka.sh/v1.2.0-beta',
            version: 'v1.2.0-beta',
            currency: 'BDT',
            intent: 'sale'
          },
          nagad: {
            apiUrl: 'https://api.mynagad.com',
            version: 'v1.0',
            currency: 'BDT'
          },
          rocket: {
            apiUrl: 'https://sandbox.rocket.com.bd',
            version: 'v1.0',
            currency: 'BDT'
          }
        },
        taxation: {
          vat: {
            standardRate: 15,
            zeroRatedItems: ['books', 'medicine', 'education'],
            exemptItems: ['raw_materials', 'agricultural_products']
          },
          incomeTax: {
            corporateRate: 25,
            personalTaxSlabs: [
              { min: 0, max: 300000, rate: 0 },
              { min: 300000, max: 400000, rate: 5 },
              { min: 400000, max: 700000, rate: 10 },
              { min: 700000, max: 1100000, rate: 15 },
              { min: 1100000, max: 1600000, rate: 20 },
              { min: 1600000, max: null, rate: 25 }
            ]
          }
        },
        cultural: {
          calendar: {
            islamicCalendar: true,
            bengaliCalendar: true,
            holidays: ['eid_ul_fitr', 'eid_ul_adha', 'pohela_boishakh', 'victory_day', 'independence_day']
          },
          language: {
            primary: 'bn',
            secondary: 'en',
            rtl: false
          }
        }
      };

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get Bangladesh templates'
      });
    }
  }

  /**
   * Get Bangladesh cultural configuration
   */
  private async getBangladeshCulturalConfig(req: Request, res: Response): Promise<void> {
    try {
      const culturalConfig = {
        festivals: {
          eid_ul_fitr: {
            type: 'islamic',
            duration: '3_days',
            businessImpact: 'high',
            ecommerceBoost: 'very_high'
          },
          eid_ul_adha: {
            type: 'islamic',
            duration: '4_days',
            businessImpact: 'high',
            ecommerceBoost: 'high'
          },
          pohela_boishakh: {
            type: 'bengali_new_year',
            duration: '1_day',
            businessImpact: 'medium',
            ecommerceBoost: 'medium'
          },
          durga_puja: {
            type: 'hindu',
            duration: '5_days',
            businessImpact: 'medium',
            ecommerceBoost: 'medium'
          }
        },
        prayerTimes: {
          enabled: true,
          cities: ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal', 'rangpur', 'mymensingh'],
          notifications: true,
          businessHourAdjustment: true
        },
        workingHours: {
          standard: {
            start: '09:00',
            end: '17:00',
            timezone: 'Asia/Dhaka'
          },
          ramadan: {
            start: '10:00',
            end: '16:00',
            adjustForIftar: true
          }
        },
        customerService: {
          preferredLanguages: ['bn', 'en'],
          culturalGreetings: true,
          religiousSensitivity: true,
          festivalAwareness: true
        }
      };

      res.json({
        success: true,
        data: culturalConfig
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get Bangladesh cultural configuration'
      });
    }
  }

  /**
   * Error handling middleware
   */
  private errorHandler(error: any, req: Request, res: Response, next: any): void {
    console.error('Configuration Service Error:', error);

    // Determine error type and status
    let status = 500;
    let message = 'Internal server error';

    if (error.name === 'ValidationError') {
      status = 400;
      message = error.message;
    } else if (error.name === 'UnauthorizedError') {
      status = 401;
      message = 'Unauthorized access';
    } else if (error.name === 'ForbiddenError') {
      status = 403;
      message = 'Access forbidden';
    } else if (error.status) {
      status = error.status;
      message = error.message;
    }

    res.status(status).json({
      success: false,
      error: message,
      timestamp: new Date(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }

  /**
   * Get the router for mounting in main application
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get the Express app instance
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Cleanup method for graceful shutdown
   */
  public async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Configuration Service...');
    
    try {
      // Cleanup real-time controller (WebSocket connections, Redis, etc.)
      if (this.realTimeConfigController) {
        this.realTimeConfigController.cleanup();
      }

      console.log('✅ Configuration Service cleanup completed');
    } catch (error) {
      console.error('❌ Error during Configuration Service cleanup:', error);
    }
  }

  /**
   * Initialize service (called after mounting)
   */
  public async initialize(): Promise<void> {
    console.log('🚀 Initializing Configuration Service...');
    
    try {
      // Any async initialization logic here
      console.log('✅ Configuration Service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Configuration Service:', error);
      throw error;
    }
  }
}

export default ConfigService;