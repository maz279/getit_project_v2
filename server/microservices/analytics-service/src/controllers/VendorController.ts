import { Request, Response } from 'express';
import { VendorAggregator } from '../aggregators/VendorAggregator';
import { logger } from '../../../../services/LoggingService';

/**
 * Vendor Controller - Amazon.com/Shopee.sg Level
 * Handles comprehensive vendor analytics and performance monitoring
 * Provides detailed vendor insights, rankings, and optimization recommendations
 */
export class VendorController {
  private vendorAggregator: VendorAggregator;

  constructor() {
    this.vendorAggregator = new VendorAggregator();
  }

  /**
   * Get comprehensive vendor performance overview
   */
  async getVendorPerformanceOverview(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        timeRange = '30d',
        includeComparison = true,
        includeBenchmarks = true 
      } = req.query;

      logger.info('Vendor performance overview requested', {
        vendorId,
        timeRange,
        requestId: req.headers['x-request-id']
      });

      const performanceData = await this.vendorAggregator.getComprehensiveVendorPerformance({
        vendorId: vendorId as string,
        timeRange: timeRange as string,
        includeComparison: includeComparison === 'true',
        includeBenchmarks: includeBenchmarks === 'true'
      });

      res.json({
        success: true,
        data: performanceData,
        metadata: {
          vendorId,
          timeRange,
          analysisDate: new Date().toISOString(),
          benchmarksIncluded: includeBenchmarks === 'true'
        }
      });

    } catch (error) {
      logger.error('Vendor performance overview error', { error, requestId: req.headers['x-request-id'] });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor performance overview'
      });
    }
  }

  /**
   * Get vendor rankings with detailed scoring
   */
  async getVendorRankings(req: Request, res: Response) {
    try {
      const { 
        category,
        sortBy = 'overall_score',
        limit = 100,
        includeMetrics = true 
      } = req.query;

      const rankingsData = await this.vendorAggregator.getVendorRankingsWithScoring({
        category: category as string,
        sortBy: sortBy as string,
        limit: parseInt(limit as string),
        includeMetrics: includeMetrics === 'true'
      });

      res.json({
        success: true,
        data: rankingsData,
        rankings: {
          criteria: sortBy,
          totalVendors: rankingsData.totalAnalyzed,
          category: category || 'all',
          lastUpdated: rankingsData.lastCalculated
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor rankings error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor rankings'
      });
    }
  }

  /**
   * Get vendor profitability analysis
   */
  async getVendorProfitabilityAnalysis(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        timeRange = '90d',
        includeProjections = true,
        breakdown = 'monthly' 
      } = req.query;

      const profitabilityData = await this.vendorAggregator.getVendorProfitabilityAnalysis({
        vendorId: vendorId as string,
        timeRange: timeRange as string,
        includeProjections: includeProjections === 'true',
        breakdown: breakdown as string
      });

      res.json({
        success: true,
        data: profitabilityData,
        insights: {
          marginTrends: profitabilityData.marginAnalysis,
          profitabilityScore: profitabilityData.profitabilityScore,
          improvementAreas: profitabilityData.optimizationSuggestions
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor profitability analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor profitability analysis'
      });
    }
  }

  /**
   * Get vendor customer satisfaction metrics
   */
  async getVendorCustomerSatisfaction(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        timeRange = '90d',
        includeReviewAnalysis = true,
        includeSentiment = true 
      } = req.query;

      const satisfactionData = await this.vendorAggregator.getCustomerSatisfactionMetrics({
        vendorId: vendorId as string,
        timeRange: timeRange as string,
        includeReviewAnalysis: includeReviewAnalysis === 'true',
        includeSentiment: includeSentiment === 'true'
      });

      res.json({
        success: true,
        data: satisfactionData,
        analysis: {
          averageRating: satisfactionData.averageRating,
          sentimentScore: satisfactionData.sentimentAnalysis,
          reviewTrends: satisfactionData.reviewTrends,
          actionableInsights: satisfactionData.improvementRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor customer satisfaction error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer satisfaction metrics'
      });
    }
  }

  /**
   * Get vendor operational efficiency metrics
   */
  async getVendorOperationalEfficiency(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        timeRange = '30d',
        includeLogistics = true,
        includeInventory = true 
      } = req.query;

      const efficiencyData = await this.vendorAggregator.getOperationalEfficiencyMetrics({
        vendorId: vendorId as string,
        timeRange: timeRange as string,
        includeLogistics: includeLogistics === 'true',
        includeInventory: includeInventory === 'true'
      });

      res.json({
        success: true,
        data: efficiencyData,
        efficiency: {
          overallScore: efficiencyData.efficiencyScore,
          orderProcessingTime: efficiencyData.processingMetrics,
          deliveryPerformance: efficiencyData.deliveryMetrics,
          inventoryTurnover: efficiencyData.inventoryMetrics
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor operational efficiency error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch operational efficiency metrics'
      });
    }
  }

  /**
   * Get vendor growth analysis with projections
   */
  async getVendorGrowthAnalysis(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        analysisType = 'comprehensive',
        forecastPeriod = '90d',
        includeSeasonality = true 
      } = req.query;

      const growthData = await this.vendorAggregator.getVendorGrowthAnalysis({
        vendorId: vendorId as string,
        analysisType: analysisType as string,
        forecastPeriod: forecastPeriod as string,
        includeSeasonality: includeSeasonality === 'true'
      });

      res.json({
        success: true,
        data: growthData,
        growth: {
          currentGrowthRate: growthData.growthMetrics.currentRate,
          projectedGrowth: growthData.projections,
          growthDrivers: growthData.growthFactors,
          seasonalImpact: growthData.seasonalAnalysis
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor growth analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor growth analysis'
      });
    }
  }

  /**
   * Get vendor portfolio analysis (products performance)
   */
  async getVendorPortfolioAnalysis(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        analysisDepth = 'detailed',
        includeRecommendations = true,
        timeRange = '90d' 
      } = req.query;

      const portfolioData = await this.vendorAggregator.getVendorPortfolioAnalysis({
        vendorId: vendorId as string,
        analysisDepth: analysisDepth as string,
        includeRecommendations: includeRecommendations === 'true',
        timeRange: timeRange as string
      });

      res.json({
        success: true,
        data: portfolioData,
        portfolio: {
          topPerformers: portfolioData.topProducts,
          underperformers: portfolioData.strugglingProducts,
          diversificationScore: portfolioData.diversificationMetrics,
          optimizationOpportunities: portfolioData.optimizationRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor portfolio analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor portfolio analysis'
      });
    }
  }

  /**
   * Get vendor competitiveness analysis
   */
  async getVendorCompetitivenessAnalysis(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        competitorScope = 'category',
        includeMarketPosition = true,
        timeRange = '180d' 
      } = req.query;

      const competitivenessData = await this.vendorAggregator.getCompetitivenessAnalysis({
        vendorId: vendorId as string,
        competitorScope: competitorScope as string,
        includeMarketPosition: includeMarketPosition === 'true',
        timeRange: timeRange as string
      });

      res.json({
        success: true,
        data: competitivenessData,
        competitiveness: {
          marketPosition: competitivenessData.marketPosition,
          competitiveAdvantages: competitivenessData.strengths,
          competitiveGaps: competitivenessData.weaknesses,
          strategicRecommendations: competitivenessData.strategies
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor competitiveness analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch competitiveness analysis'
      });
    }
  }

  /**
   * Get vendor risk assessment and scoring
   */
  async getVendorRiskAssessment(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        riskCategories = 'all',
        includeHistory = true,
        alertThreshold = 'medium' 
      } = req.query;

      const riskData = await this.vendorAggregator.getVendorRiskAssessment({
        vendorId: vendorId as string,
        riskCategories: riskCategories as string,
        includeHistory: includeHistory === 'true',
        alertThreshold: alertThreshold as string
      });

      res.json({
        success: true,
        data: riskData,
        risk: {
          overallRiskScore: riskData.overallScore,
          riskBreakdown: riskData.categoryRisks,
          riskTrends: riskData.riskTrends,
          mitigationRecommendations: riskData.mitigationStrategies
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor risk assessment error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor risk assessment'
      });
    }
  }

  /**
   * Get vendor compliance status and history
   */
  async getVendorComplianceStatus(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        complianceType = 'all',
        includeHistory = true,
        timeRange = '365d' 
      } = req.query;

      const complianceData = await this.vendorAggregator.getVendorCompliance({
        vendorId: vendorId as string,
        complianceType: complianceType as string,
        includeHistory: includeHistory === 'true',
        timeRange: timeRange as string
      });

      res.json({
        success: true,
        data: complianceData,
        compliance: {
          overallScore: complianceData.complianceScore,
          complianceBreakdown: complianceData.complianceDetails,
          violations: complianceData.violations,
          recommendations: complianceData.improvementPlan
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor compliance status error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor compliance status'
      });
    }
  }

  /**
   * Get bulk vendor comparison analysis
   */
  async getBulkVendorComparison(req: Request, res: Response) {
    try {
      const { vendorIds, metrics = 'comprehensive', format = 'detailed' } = req.body;

      if (!Array.isArray(vendorIds) || vendorIds.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'At least 2 vendor IDs must be provided for comparison'
        });
      }

      const comparisonData = await this.vendorAggregator.getBulkVendorComparison({
        vendorIds,
        metrics: metrics as string,
        format: format as string
      });

      res.json({
        success: true,
        data: comparisonData,
        comparison: {
          vendorsCompared: vendorIds.length,
          analysisType: metrics,
          topPerformer: comparisonData.topPerformer,
          keyDifferentiators: comparisonData.keyDifferentials
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Bulk vendor comparison error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to perform bulk vendor comparison'
      });
    }
  }

  /**
   * Get vendor performance alerts and notifications
   */
  async getVendorPerformanceAlerts(req: Request, res: Response) {
    try {
      const { 
        vendorId,
        alertTypes = 'all',
        severity = 'medium',
        limit = 50 
      } = req.query;

      const alertsData = await this.vendorAggregator.getVendorPerformanceAlerts({
        vendorId: vendorId as string,
        alertTypes: alertTypes as string,
        severity: severity as string,
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: alertsData,
        alerts: {
          totalAlerts: alertsData.length,
          criticalAlerts: alertsData.filter((alert: any) => alert.severity === 'critical').length,
          actionRequired: alertsData.filter((alert: any) => alert.requiresAction).length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Vendor performance alerts error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor performance alerts'
      });
    }
  }
}