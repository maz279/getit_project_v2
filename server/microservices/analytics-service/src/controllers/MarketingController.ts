import { Request, Response } from 'express';
import { MarketingAggregator } from '../aggregators/MarketingAggregator';
import { logger } from '../../../../services/LoggingService';

/**
 * Marketing Controller - Amazon.com/Shopee.sg Level
 * Handles comprehensive marketing analytics and campaign performance monitoring
 * Provides detailed campaign insights, ROI analysis, and optimization recommendations
 */
export class MarketingController {
  private marketingAggregator: MarketingAggregator;

  constructor() {
    this.marketingAggregator = new MarketingAggregator();
  }

  /**
   * Get comprehensive marketing overview with key metrics
   */
  async getMarketingOverview(req: Request, res: Response) {
    try {
      const { 
        timeRange = '30d',
        campaignType = 'all',
        includeROI = true,
        includeForecast = true 
      } = req.query;

      logger.info('Marketing overview requested', {
        timeRange,
        campaignType,
        requestId: req.headers['x-request-id']
      });

      const marketingData = await this.marketingAggregator.getComprehensiveMarketingOverview({
        timeRange: timeRange as string,
        campaignType: campaignType as string,
        includeROI: includeROI === 'true',
        includeForecast: includeForecast === 'true'
      });

      res.json({
        success: true,
        data: marketingData,
        metadata: {
          timeRange,
          campaignType,
          analysisDate: new Date().toISOString(),
          forecastEnabled: includeForecast === 'true'
        }
      });

    } catch (error) {
      logger.error('Marketing overview error', { error, requestId: req.headers['x-request-id'] });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch marketing overview'
      });
    }
  }

  /**
   * Get detailed campaign performance analysis
   */
  async getCampaignPerformanceAnalysis(req: Request, res: Response) {
    try {
      const { 
        campaignId,
        includeConversion = true,
        includeAttribution = true,
        granularity = 'daily' 
      } = req.query;

      const campaignData = await this.marketingAggregator.getCampaignPerformanceAnalysis({
        campaignId: campaignId as string,
        includeConversion: includeConversion === 'true',
        includeAttribution: includeAttribution === 'true',
        granularity: granularity as string
      });

      res.json({
        success: true,
        data: campaignData,
        performance: {
          campaignMetrics: campaignData.performanceMetrics,
          conversionFunnel: campaignData.conversionAnalysis,
          attributionModel: campaignData.attributionData,
          optimizationRecommendations: campaignData.optimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Campaign performance analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze campaign performance'
      });
    }
  }

  /**
   * Get marketing ROI and attribution analysis
   */
  async getMarketingROIAnalysis(req: Request, res: Response) {
    try {
      const { 
        timeRange = '90d',
        attributionModel = 'last_click',
        includeLifetimeValue = true,
        channelBreakdown = true 
      } = req.query;

      const roiData = await this.marketingAggregator.getMarketingROIAnalysis({
        timeRange: timeRange as string,
        attributionModel: attributionModel as string,
        includeLifetimeValue: includeLifetimeValue === 'true',
        channelBreakdown: channelBreakdown === 'true'
      });

      res.json({
        success: true,
        data: roiData,
        roi: {
          overallROI: roiData.totalROI,
          channelROI: roiData.channelPerformance,
          lifetimeValue: roiData.customerLTV,
          attributionInsights: roiData.attributionAnalysis
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Marketing ROI analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze marketing ROI'
      });
    }
  }

  /**
   * Get customer acquisition cost analysis
   */
  async getCustomerAcquisitionCostAnalysis(req: Request, res: Response) {
    try {
      const { 
        timeRange = '90d',
        channelComparison = true,
        qualityScoring = true,
        trendAnalysis = true 
      } = req.query;

      const cacData = await this.marketingAggregator.getCustomerAcquisitionCostAnalysis({
        timeRange: timeRange as string,
        channelComparison: channelComparison === 'true',
        qualityScoring: qualityScoring === 'true',
        trendAnalysis: trendAnalysis === 'true'
      });

      res.json({
        success: true,
        data: cacData,
        acquisition: {
          averageCAC: cacData.overallCAC,
          channelCAC: cacData.channelBreakdown,
          qualityMetrics: cacData.customerQuality,
          optimizationOpportunities: cacData.cacOptimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer acquisition cost analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze customer acquisition cost'
      });
    }
  }

  /**
   * Get marketing channel performance analysis
   */
  async getChannelPerformanceAnalysis(req: Request, res: Response) {
    try {
      const { 
        timeRange = '60d',
        includeAttribution = true,
        crossChannelAnalysis = true,
        optimizationSuggestions = true 
      } = req.query;

      const channelData = await this.marketingAggregator.getChannelPerformanceAnalysis({
        timeRange: timeRange as string,
        includeAttribution: includeAttribution === 'true',
        crossChannelAnalysis: crossChannelAnalysis === 'true',
        optimizationSuggestions: optimizationSuggestions === 'true'
      });

      res.json({
        success: true,
        data: channelData,
        channels: {
          topPerformingChannels: channelData.topChannels,
          channelSynergy: channelData.crossChannelEffects,
          budgetAllocation: channelData.budgetOptimization,
          performanceTrends: channelData.channelTrends
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Channel performance analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze channel performance'
      });
    }
  }

  /**
   * Get content marketing analytics
   */
  async getContentMarketingAnalytics(req: Request, res: Response) {
    try {
      const { 
        contentType = 'all',
        timeRange = '90d',
        engagementMetrics = true,
        conversionTracking = true 
      } = req.query;

      const contentData = await this.marketingAggregator.getContentMarketingAnalytics({
        contentType: contentType as string,
        timeRange: timeRange as string,
        engagementMetrics: engagementMetrics === 'true',
        conversionTracking: conversionTracking === 'true'
      });

      res.json({
        success: true,
        data: contentData,
        content: {
          topPerformingContent: contentData.topContent,
          engagementAnalysis: contentData.engagementMetrics,
          conversionImpact: contentData.conversionAnalysis,
          contentOptimizations: contentData.contentRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Content marketing analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze content marketing'
      });
    }
  }

  /**
   * Get email marketing performance analysis
   */
  async getEmailMarketingAnalysis(req: Request, res: Response) {
    try {
      const { 
        timeRange = '90d',
        segmentAnalysis = true,
        campaignComparison = true,
        automationMetrics = true 
      } = req.query;

      const emailData = await this.marketingAggregator.getEmailMarketingAnalysis({
        timeRange: timeRange as string,
        segmentAnalysis: segmentAnalysis === 'true',
        campaignComparison: campaignComparison === 'true',
        automationMetrics: automationMetrics === 'true'
      });

      res.json({
        success: true,
        data: emailData,
        email: {
          campaignPerformance: emailData.campaignMetrics,
          segmentInsights: emailData.segmentAnalysis,
          automationEffectiveness: emailData.automationPerformance,
          deliverabilityMetrics: emailData.deliverabilityAnalysis
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Email marketing analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze email marketing'
      });
    }
  }

  /**
   * Get social media marketing analytics
   */
  async getSocialMediaAnalytics(req: Request, res: Response) {
    try {
      const { 
        platform = 'all',
        timeRange = '30d',
        engagementAnalysis = true,
        influencerMetrics = true 
      } = req.query;

      const socialData = await this.marketingAggregator.getSocialMediaAnalytics({
        platform: platform as string,
        timeRange: timeRange as string,
        engagementAnalysis: engagementAnalysis === 'true',
        influencerMetrics: influencerMetrics === 'true'
      });

      res.json({
        success: true,
        data: socialData,
        social: {
          platformPerformance: socialData.platformMetrics,
          engagementInsights: socialData.engagementAnalysis,
          influencerImpact: socialData.influencerPerformance,
          contentStrategy: socialData.contentRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Social media analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze social media marketing'
      });
    }
  }

  /**
   * Get marketing automation analytics
   */
  async getMarketingAutomationAnalytics(req: Request, res: Response) {
    try {
      const { 
        automationType = 'all',
        timeRange = '90d',
        performanceMetrics = true,
        optimizationSuggestions = true 
      } = req.query;

      const automationData = await this.marketingAggregator.getMarketingAutomationAnalytics({
        automationType: automationType as string,
        timeRange: timeRange as string,
        performanceMetrics: performanceMetrics === 'true',
        optimizationSuggestions: optimizationSuggestions === 'true'
      });

      res.json({
        success: true,
        data: automationData,
        automation: {
          workflowPerformance: automationData.workflowMetrics,
          triggerEffectiveness: automationData.triggerAnalysis,
          personalizationImpact: automationData.personalizationMetrics,
          automationOptimizations: automationData.optimizationRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Marketing automation analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze marketing automation'
      });
    }
  }

  /**
   * Get marketing budget allocation and optimization
   */
  async getMarketingBudgetOptimization(req: Request, res: Response) {
    try {
      const { 
        timeRange = '90d',
        allocationModel = 'roi_based',
        includeForecasting = true,
        scenarioAnalysis = true 
      } = req.query;

      const budgetData = await this.marketingAggregator.getMarketingBudgetOptimization({
        timeRange: timeRange as string,
        allocationModel: allocationModel as string,
        includeForecasting: includeForecasting === 'true',
        scenarioAnalysis: scenarioAnalysis === 'true'
      });

      res.json({
        success: true,
        data: budgetData,
        budget: {
          currentAllocation: budgetData.currentBudgetDistribution,
          optimizedAllocation: budgetData.recommendedAllocation,
          expectedImpact: budgetData.projectedResults,
          budgetScenarios: budgetData.scenarioAnalysis
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Marketing budget optimization error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to optimize marketing budget'
      });
    }
  }

  /**
   * Get marketing attribution modeling analysis
   */
  async getAttributionModelingAnalysis(req: Request, res: Response) {
    try {
      const { 
        modelType = 'data_driven',
        timeRange = '180d',
        touchpointAnalysis = true,
        modelComparison = true 
      } = req.query;

      const attributionData = await this.marketingAggregator.getAttributionModelingAnalysis({
        modelType: modelType as string,
        timeRange: timeRange as string,
        touchpointAnalysis: touchpointAnalysis === 'true',
        modelComparison: modelComparison === 'true'
      });

      res.json({
        success: true,
        data: attributionData,
        attribution: {
          primaryModel: attributionData.selectedModel,
          touchpointContribution: attributionData.touchpointAnalysis,
          modelComparison: attributionData.modelPerformance,
          attributionInsights: attributionData.attributionRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Attribution modeling analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze attribution modeling'
      });
    }
  }

  /**
   * Get Bangladesh-specific marketing insights
   */
  async getBangladeshMarketingInsights(req: Request, res: Response) {
    try {
      const { 
        timeRange = '90d',
        includeFestivals = true,
        regionalAnalysis = true,
        culturalFactors = true 
      } = req.query;

      const bangladeshData = await this.marketingAggregator.getBangladeshMarketingInsights({
        timeRange: timeRange as string,
        includeFestivals: includeFestivals === 'true',
        regionalAnalysis: regionalAnalysis === 'true',
        culturalFactors: culturalFactors === 'true'
      });

      res.json({
        success: true,
        data: bangladeshData,
        bangladesh: {
          festivalImpact: bangladeshData.festivalAnalysis,
          regionalPreferences: bangladeshData.regionalInsights,
          culturalAdaptations: bangladeshData.culturalRecommendations,
          marketOpportunities: bangladeshData.marketingOpportunities
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Bangladesh marketing insights error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Bangladesh marketing insights'
      });
    }
  }

  /**
   * Get marketing cohort analysis
   */
  async getMarketingCohortAnalysis(req: Request, res: Response) {
    try {
      const { 
        cohortType = 'acquisition',
        metric = 'revenue',
        periods = 12,
        channelBreakdown = true 
      } = req.query;

      const cohortData = await this.marketingAggregator.getMarketingCohortAnalysis({
        cohortType: cohortType as string,
        metric: metric as string,
        periods: parseInt(periods as string),
        channelBreakdown: channelBreakdown === 'true'
      });

      res.json({
        success: true,
        data: cohortData,
        cohort: {
          cohortMetrics: cohortData.cohortAnalysis,
          retentionPatterns: cohortData.retentionTrends,
          channelComparison: cohortData.channelCohorts,
          cohortInsights: cohortData.cohortRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Marketing cohort analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to perform marketing cohort analysis'
      });
    }
  }
}