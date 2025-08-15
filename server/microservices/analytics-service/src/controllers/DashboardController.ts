import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { logger } from '../../../../services/LoggingService';

/**
 * Dashboard Controller - Amazon.com/Shopee.sg Level
 * Handles all dashboard-related analytics operations
 * Provides comprehensive business intelligence for executives and managers
 */
export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * Get comprehensive dashboard overview with real-time metrics
   */
  async getDashboardOverview(req: Request, res: Response) {
    try {
      const { timeRange = '7d', userRole = 'admin' } = req.query;
      
      logger.info('Dashboard overview requested', {
        timeRange,
        userRole,
        requestId: req.headers['x-request-id']
      });

      const dashboardData = await this.dashboardService.getComprehensiveDashboard(
        timeRange as string,
        userRole as string
      );

      res.json({
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });

    } catch (error) {
      logger.error('Dashboard overview error', { error, requestId: req.headers['x-request-id'] });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard overview',
        requestId: req.headers['x-request-id']
      });
    }
  }

  /**
   * Get real-time performance metrics for live dashboard
   */
  async getRealTimeMetrics(req: Request, res: Response) {
    try {
      const realTimeData = await this.dashboardService.getRealTimePerformance();

      res.json({
        success: true,
        data: realTimeData,
        timestamp: new Date().toISOString(),
        isRealTime: true
      });

    } catch (error) {
      logger.error('Real-time metrics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch real-time metrics'
      });
    }
  }

  /**
   * Get executive-level KPI dashboard
   */
  async getExecutiveDashboard(req: Request, res: Response) {
    try {
      const { period = 'monthly' } = req.query;
      
      const executiveData = await this.dashboardService.getExecutiveKPIs(period as string);

      res.json({
        success: true,
        data: executiveData,
        period,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Executive dashboard error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch executive dashboard'
      });
    }
  }

  /**
   * Get customizable widget data for dashboard personalization
   */
  async getWidgetData(req: Request, res: Response) {
    try {
      const { widgetIds } = req.body;
      
      if (!Array.isArray(widgetIds)) {
        return res.status(400).json({
          success: false,
          error: 'Widget IDs must be provided as an array'
        });
      }

      const widgetData = await this.dashboardService.getMultipleWidgets(widgetIds);

      res.json({
        success: true,
        data: widgetData,
        count: widgetIds.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Widget data error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch widget data'
      });
    }
  }

  /**
   * Get business health score and recommendations
   */
  async getBusinessHealth(req: Request, res: Response) {
    try {
      const healthScore = await this.dashboardService.calculateBusinessHealth();

      res.json({
        success: true,
        data: healthScore,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Business health calculation error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to calculate business health'
      });
    }
  }

  /**
   * Get Bangladesh-specific market insights
   */
  async getBangladeshInsights(req: Request, res: Response) {
    try {
      const { includeRegional = true, includeFestival = true } = req.query;
      
      const insights = await this.dashboardService.getBangladeshMarketInsights({
        includeRegional: includeRegional === 'true',
        includeFestival: includeFestival === 'true'
      });

      res.json({
        success: true,
        data: insights,
        timestamp: new Date().toISOString(),
        market: 'bangladesh'
      });

    } catch (error) {
      logger.error('Bangladesh insights error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Bangladesh market insights'
      });
    }
  }

  /**
   * Get performance benchmarks against industry standards
   */
  async getPerformanceBenchmarks(req: Request, res: Response) {
    try {
      const benchmarks = await this.dashboardService.getIndustryBenchmarks();

      res.json({
        success: true,
        data: benchmarks,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Performance benchmarks error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch performance benchmarks'
      });
    }
  }

  /**
   * Get alerts and notifications for critical issues
   */
  async getDashboardAlerts(req: Request, res: Response) {
    try {
      const { severity = 'all', limit = 50 } = req.query;
      
      const alerts = await this.dashboardService.getSystemAlerts(
        severity as string,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: alerts,
        count: alerts.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Dashboard alerts error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard alerts'
      });
    }
  }
}