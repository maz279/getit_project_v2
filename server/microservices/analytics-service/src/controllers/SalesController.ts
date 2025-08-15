import { Request, Response } from 'express';
import { SalesAggregator } from '../aggregators/SalesAggregator';
import { logger } from '../../../../services/LoggingService';

/**
 * Sales Controller - Amazon.com/Shopee.sg Level
 * Handles comprehensive sales analytics and performance tracking
 * Provides detailed sales insights, forecasting, and revenue optimization
 */
export class SalesController {
  private salesAggregator: SalesAggregator;

  constructor() {
    this.salesAggregator = new SalesAggregator();
  }

  /**
   * Get comprehensive sales overview with key metrics
   */
  async getSalesOverview(req: Request, res: Response) {
    try {
      const { 
        timeRange = '30d', 
        vendorId, 
        categoryId,
        includeForecasting = true 
      } = req.query;

      logger.info('Sales overview requested', {
        timeRange,
        vendorId,
        categoryId,
        requestId: req.headers['x-request-id']
      });

      const salesData = await this.salesAggregator.getComprehensiveSalesOverview({
        timeRange: timeRange as string,
        vendorId: vendorId as string,
        categoryId: categoryId as string,
        includeForecasting: includeForecasting === 'true'
      });

      res.json({
        success: true,
        data: salesData,
        metadata: {
          timeRange,
          generatedAt: new Date().toISOString(),
          forecastingEnabled: includeForecasting === 'true'
        }
      });

    } catch (error) {
      logger.error('Sales overview error', { error, requestId: req.headers['x-request-id'] });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sales overview'
      });
    }
  }

  /**
   * Get detailed sales trends with predictive analytics
   */
  async getSalesTrends(req: Request, res: Response) {
    try {
      const { 
        period = 'daily',
        duration = '90d',
        breakdown = 'category',
        includePrediction = true 
      } = req.query;

      const trendsData = await this.salesAggregator.getSalesTrendsWithPrediction({
        period: period as string,
        duration: duration as string,
        breakdown: breakdown as string,
        includePrediction: includePrediction === 'true'
      });

      res.json({
        success: true,
        data: trendsData,
        analysis: {
          trendDirection: trendsData.trendDirection,
          confidenceScore: trendsData.confidenceScore,
          keyInsights: trendsData.insights
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Sales trends error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sales trends'
      });
    }
  }

  /**
   * Get revenue analytics with growth analysis
   */
  async getRevenueAnalytics(req: Request, res: Response) {
    try {
      const { 
        timeframe = 'quarterly',
        compareWithPrevious = true,
        includeBenchmarks = true 
      } = req.query;

      const revenueData = await this.salesAggregator.getAdvancedRevenueAnalytics({
        timeframe: timeframe as string,
        compareWithPrevious: compareWithPrevious === 'true',
        includeBenchmarks: includeBenchmarks === 'true'
      });

      res.json({
        success: true,
        data: revenueData,
        insights: {
          growthRate: revenueData.growthMetrics,
          seasonalPatterns: revenueData.seasonality,
          benchmarkComparison: revenueData.benchmarks
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Revenue analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch revenue analytics'
      });
    }
  }

  /**
   * Get top performing products with detailed metrics
   */
  async getTopPerformingProducts(req: Request, res: Response) {
    try {
      const { 
        limit = 50,
        sortBy = 'revenue',
        timeRange = '30d',
        includeVariants = false 
      } = req.query;

      const topProducts = await this.salesAggregator.getTopPerformingProducts({
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        timeRange: timeRange as string,
        includeVariants: includeVariants === 'true'
      });

      res.json({
        success: true,
        data: topProducts,
        metadata: {
          totalAnalyzed: topProducts.totalProductsAnalyzed,
          criteria: sortBy,
          timeRange
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Top products error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch top performing products'
      });
    }
  }

  /**
   * Get sales performance by geographic regions (Bangladesh-specific)
   */
  async getSalesByRegion(req: Request, res: Response) {
    try {
      const { 
        level = 'division', // division, district, upazila
        timeRange = '30d',
        includeHeatmap = true 
      } = req.query;

      const regionalData = await this.salesAggregator.getBangladeshRegionalSales({
        level: level as string,
        timeRange: timeRange as string,
        includeHeatmap: includeHeatmap === 'true'
      });

      res.json({
        success: true,
        data: regionalData,
        geography: {
          level,
          totalRegions: regionalData.regions.length,
          topPerformingRegion: regionalData.topRegion
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Regional sales error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch regional sales data'
      });
    }
  }

  /**
   * Get sales conversion funnel analysis
   */
  async getConversionFunnel(req: Request, res: Response) {
    try {
      const { 
        timeRange = '30d',
        breakdown = 'overall',
        includeOptimization = true 
      } = req.query;

      const funnelData = await this.salesAggregator.getConversionFunnelAnalysis({
        timeRange: timeRange as string,
        breakdown: breakdown as string,
        includeOptimization: includeOptimization === 'true'
      });

      res.json({
        success: true,
        data: funnelData,
        optimization: {
          suggestions: funnelData.optimizationSuggestions,
          potentialImpact: funnelData.potentialImpact,
          priorityAreas: funnelData.priorityAreas
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Conversion funnel error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch conversion funnel data'
      });
    }
  }

  /**
   * Get sales forecasting with multiple models
   */
  async getSalesForecasting(req: Request, res: Response) {
    try {
      const { 
        forecastPeriod = '90d',
        model = 'ensemble', // arima, linear, ensemble
        includeScenarios = true,
        confidence = 95 
      } = req.query;

      const forecastData = await this.salesAggregator.getAdvancedSalesForecasting({
        forecastPeriod: forecastPeriod as string,
        model: model as string,
        includeScenarios: includeScenarios === 'true',
        confidence: parseInt(confidence as string)
      });

      res.json({
        success: true,
        data: forecastData,
        modelInfo: {
          algorithm: model,
          confidence: `${confidence}%`,
          accuracy: forecastData.modelAccuracy,
          lastTrainingDate: forecastData.lastTrained
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Sales forecasting error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to generate sales forecast'
      });
    }
  }

  /**
   * Get festival impact analysis (Bangladesh-specific)
   */
  async getFestivalImpactAnalysis(req: Request, res: Response) {
    try {
      const { 
        festival = 'all',
        year = new Date().getFullYear(),
        compareYears = true 
      } = req.query;

      const festivalData = await this.salesAggregator.getFestivalSalesImpact({
        festival: festival as string,
        year: parseInt(year as string),
        compareYears: compareYears === 'true'
      });

      res.json({
        success: true,
        data: festivalData,
        culturalInsights: {
          festivalImpact: festivalData.impactScore,
          preparationPeriod: festivalData.preparationAnalysis,
          recommendations: festivalData.recommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Festival impact analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze festival impact'
      });
    }
  }

  /**
   * Get payment method performance analytics
   */
  async getPaymentMethodAnalytics(req: Request, res: Response) {
    try {
      const { 
        timeRange = '30d',
        includeSuccessRates = true,
        breakdown = 'method' 
      } = req.query;

      const paymentData = await this.salesAggregator.getPaymentMethodPerformance({
        timeRange: timeRange as string,
        includeSuccessRates: includeSuccessRates === 'true',
        breakdown: breakdown as string
      });

      res.json({
        success: true,
        data: paymentData,
        insights: {
          preferredMethod: paymentData.topMethod,
          mobileBankingShare: paymentData.mobileBankingPercentage,
          optimizationOpportunities: paymentData.optimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Payment method analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment method analytics'
      });
    }
  }

  /**
   * Get advanced cohort analysis for sales
   */
  async getSalesCohortAnalysis(req: Request, res: Response) {
    try {
      const { 
        cohortType = 'monthly',
        metric = 'revenue',
        periods = 12 
      } = req.query;

      const cohortData = await this.salesAggregator.getSalesCohortAnalysis({
        cohortType: cohortType as string,
        metric: metric as string,
        periods: parseInt(periods as string)
      });

      res.json({
        success: true,
        data: cohortData,
        analysis: {
          retentionPattern: cohortData.retentionPattern,
          lifeTimeValue: cohortData.cohortLTV,
          trendAnalysis: cohortData.trends
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Sales cohort analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to perform cohort analysis'
      });
    }
  }
}