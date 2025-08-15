/**
 * Phase4ProductionRoutes - Production Deployment API Endpoints
 * Enterprise-grade production endpoints for monitoring, analytics, and management
 */

import { Request, Response } from 'express';

export class Phase4ProductionRoutes {
  constructor(
    private healthMonitor: any,
    private analyticsService: any,
    private configManager: any,
    private resilienceManager: any
  ) {}

  /**
   * Health Monitoring Endpoints
   */
  async healthShallow(req: Request, res: Response): Promise<void> {
    try {
      const healthResult = await this.healthMonitor.performShallowHealthCheck();
      const statusCode = healthResult.status === 'healthy' ? 200 : 
                        healthResult.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json({
        success: true,
        data: healthResult,
        metadata: {
          timestamp: Date.now(),
          type: 'shallow_health_check',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        details: error.message
      });
    }
  }

  async healthDeep(req: Request, res: Response): Promise<void> {
    try {
      const healthResult = await this.healthMonitor.performDeepHealthCheck();
      const statusCode = healthResult.status === 'healthy' ? 200 : 
                        healthResult.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json({
        success: true,
        data: healthResult,
        metadata: {
          timestamp: Date.now(),
          type: 'deep_health_check',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Deep health check failed',
        details: error.message
      });
    }
  }

  async healthLive(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: { status: 'alive', timestamp: Date.now() },
      metadata: { type: 'liveness_probe' }
    });
  }

  async healthReady(req: Request, res: Response): Promise<void> {
    try {
      const healthResult = await this.healthMonitor.performShallowHealthCheck();
      const isReady = healthResult.status !== 'critical';
      
      res.status(isReady ? 200 : 503).json({
        success: isReady,
        data: { status: isReady ? 'ready' : 'not_ready', health: healthResult },
        metadata: { type: 'readiness_probe' }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        data: { status: 'not_ready' },
        error: error.message
      });
    }
  }

  async healthDependencies(req: Request, res: Response): Promise<void> {
    try {
      const dependencyHealth = await this.healthMonitor.performDependencyHealthCheck();
      
      res.status(200).json({
        success: true,
        data: dependencyHealth,
        metadata: {
          timestamp: Date.now(),
          type: 'dependency_health_check',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Dependency health check failed',
        details: error.message
      });
    }
  }

  async healthMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = this.healthMonitor.getHealthMetrics();
      
      res.status(200).json({
        success: true,
        data: metrics,
        metadata: {
          timestamp: Date.now(),
          type: 'health_metrics',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get health metrics',
        details: error.message
      });
    }
  }

  /**
   * Analytics Endpoints
   */
  async analyticsPerformance(req: Request, res: Response): Promise<void> {
    try {
      const performanceMetrics = this.analyticsService.getPerformanceMetrics();
      
      res.status(200).json({
        success: true,
        data: performanceMetrics,
        metadata: {
          timestamp: Date.now(),
          type: 'performance_analytics',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get performance analytics',
        details: error.message
      });
    }
  }

  async analyticsSearch(req: Request, res: Response): Promise<void> {
    try {
      const searchAnalytics = this.analyticsService.getSearchAnalytics();
      
      res.status(200).json({
        success: true,
        data: searchAnalytics,
        metadata: {
          timestamp: Date.now(),
          type: 'search_analytics',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get search analytics',
        details: error.message
      });
    }
  }

  async analyticsErrors(req: Request, res: Response): Promise<void> {
    try {
      const errorAnalysis = this.analyticsService.getErrorAnalysis();
      
      res.status(200).json({
        success: true,
        data: errorAnalysis,
        metadata: {
          timestamp: Date.now(),
          type: 'error_analytics',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get error analytics',
        details: error.message
      });
    }
  }

  async analyticsExport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, eventTypes, format } = req.query;
      
      const exportData = this.analyticsService.exportAnalyticsData({
        startDate: startDate ? parseInt(startDate as string) : undefined,
        endDate: endDate ? parseInt(endDate as string) : undefined,
        eventTypes: eventTypes ? (eventTypes as string).split(',') : undefined,
        format: format as 'json' | 'csv' || 'json'
      });
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
        res.send(exportData);
      } else {
        res.status(200).json({
          success: true,
          data: exportData,
          metadata: {
            timestamp: Date.now(),
            type: 'analytics_export',
            service: 'unified-ai-search-service-v5.0'
          }
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics data',
        details: error.message
      });
    }
  }

  /**
   * Configuration Management Endpoints
   */
  async configCurrent(req: Request, res: Response): Promise<void> {
    try {
      const currentConfig = this.configManager.getCurrentConfig();
      
      res.status(200).json({
        success: true,
        data: currentConfig,
        metadata: {
          timestamp: Date.now(),
          type: 'current_configuration',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get current configuration',
        details: error.message
      });
    }
  }

  async configUpdate(req: Request, res: Response): Promise<void> {
    try {
      const result = this.configManager.updateConfiguration(req.body);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: { message: 'Configuration updated successfully' },
          metadata: {
            timestamp: Date.now(),
            type: 'configuration_update',
            service: 'unified-ai-search-service-v5.0'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Configuration update failed',
          details: result.errors
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update configuration',
        details: error.message
      });
    }
  }

  async configFeatures(req: Request, res: Response): Promise<void> {
    try {
      const config = this.configManager.getCurrentConfig();
      
      res.status(200).json({
        success: true,
        data: { features: config.features },
        metadata: {
          timestamp: Date.now(),
          type: 'feature_flags',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get feature flags',
        details: error.message
      });
    }
  }

  async configToggleFeature(req: Request, res: Response): Promise<void> {
    try {
      const { featureName, enabled } = req.body;
      const result = this.configManager.toggleFeature(featureName, enabled);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: { message: `Feature '${featureName}' toggled successfully` },
          metadata: {
            timestamp: Date.now(),
            type: 'feature_toggle',
            service: 'unified-ai-search-service-v5.0'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Feature toggle failed',
          details: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to toggle feature',
        details: error.message
      });
    }
  }

  async configHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const history = this.configManager.getConfigurationHistory(limit);
      
      res.status(200).json({
        success: true,
        data: { history },
        metadata: {
          timestamp: Date.now(),
          type: 'configuration_history',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get configuration history',
        details: error.message
      });
    }
  }

  /**
   * Resilience Management Endpoints
   */
  async resilienceStatus(req: Request, res: Response): Promise<void> {
    try {
      const circuitBreakerStatus = this.resilienceManager.getCircuitBreakerStatus();
      
      res.status(200).json({
        success: true,
        data: { circuitBreakers: circuitBreakerStatus },
        metadata: {
          timestamp: Date.now(),
          type: 'resilience_status',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get resilience status',
        details: error.message
      });
    }
  }

  /**
   * Production Dashboard Endpoint
   */
  async productionDashboard(req: Request, res: Response): Promise<void> {
    try {
      const [healthMetrics, performanceMetrics, searchAnalytics, errorAnalysis, circuitBreakerStatus] = await Promise.all([
        this.healthMonitor.getHealthMetrics(),
        this.analyticsService.getPerformanceMetrics(),
        this.analyticsService.getSearchAnalytics(),
        this.analyticsService.getErrorAnalysis(),
        this.resilienceManager.getCircuitBreakerStatus()
      ]);

      const dashboardData = {
        timestamp: Date.now(),
        service: {
          name: 'unified-ai-search-service',
          version: '5.0.0-phase4',
          status: healthMetrics.lastHealthCheck.status,
          uptime: process.uptime()
        },
        health: healthMetrics,
        performance: performanceMetrics,
        search: searchAnalytics,
        errors: errorAnalysis,
        resilience: { circuitBreakers: circuitBreakerStatus },
        system: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          env: process.env.NODE_ENV || 'development'
        }
      };

      res.status(200).json({
        success: true,
        data: dashboardData,
        metadata: {
          timestamp: Date.now(),
          type: 'production_dashboard',
          service: 'unified-ai-search-service-v5.0'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get production dashboard data',
        details: error.message
      });
    }
  }
}