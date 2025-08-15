import { Request, Response } from 'express';
import { CustomerAggregator } from '../aggregators/CustomerAggregator';
import { logger } from '../../../../services/LoggingService';

/**
 * Customer Controller - Amazon.com/Shopee.sg Level
 * Handles comprehensive customer analytics and behavior analysis
 * Provides detailed customer insights, segmentation, and lifecycle management
 */
export class CustomerController {
  private customerAggregator: CustomerAggregator;

  constructor() {
    this.customerAggregator = new CustomerAggregator();
  }

  /**
   * Get comprehensive customer overview with key metrics
   */
  async getCustomerOverview(req: Request, res: Response) {
    try {
      const { 
        timeRange = '30d',
        segmentType = 'all',
        includeProjections = true,
        includeBehavior = true 
      } = req.query;

      logger.info('Customer overview requested', {
        timeRange,
        segmentType,
        requestId: req.headers['x-request-id']
      });

      const customerData = await this.customerAggregator.getComprehensiveCustomerOverview({
        timeRange: timeRange as string,
        segmentType: segmentType as string,
        includeProjections: includeProjections === 'true',
        includeBehavior: includeBehavior === 'true'
      });

      res.json({
        success: true,
        data: customerData,
        metadata: {
          timeRange,
          segmentType,
          analysisDate: new Date().toISOString(),
          projectionsIncluded: includeProjections === 'true'
        }
      });

    } catch (error) {
      logger.error('Customer overview error', { error, requestId: req.headers['x-request-id'] });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer overview'
      });
    }
  }

  /**
   * Get advanced customer segmentation analysis
   */
  async getCustomerSegmentation(req: Request, res: Response) {
    try {
      const { 
        method = 'rfm', // rfm, behavioral, demographic, lifecycle
        includePersonas = true,
        timeRange = '90d',
        minSegmentSize = 100 
      } = req.query;

      const segmentationData = await this.customerAggregator.getAdvancedCustomerSegmentation({
        method: method as string,
        includePersonas: includePersonas === 'true',
        timeRange: timeRange as string,
        minSegmentSize: parseInt(minSegmentSize as string)
      });

      res.json({
        success: true,
        data: segmentationData,
        segmentation: {
          method,
          totalSegments: segmentationData.segments.length,
          largestSegment: segmentationData.largestSegment,
          insights: segmentationData.segmentInsights
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer segmentation error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to perform customer segmentation'
      });
    }
  }

  /**
   * Get customer lifecycle analysis with stage transitions
   */
  async getCustomerLifecycleAnalysis(req: Request, res: Response) {
    try {
      const { 
        includeTransitions = true,
        timeRange = '180d',
        cohortAnalysis = true,
        predictionModel = 'advanced' 
      } = req.query;

      const lifecycleData = await this.customerAggregator.getCustomerLifecycleAnalysis({
        includeTransitions: includeTransitions === 'true',
        timeRange: timeRange as string,
        cohortAnalysis: cohortAnalysis === 'true',
        predictionModel: predictionModel as string
      });

      res.json({
        success: true,
        data: lifecycleData,
        lifecycle: {
          stageDistribution: lifecycleData.stageBreakdown,
          avgLifecycleValue: lifecycleData.averageLifetimeValue,
          churnPrediction: lifecycleData.churnAnalysis,
          retentionStrategies: lifecycleData.retentionRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer lifecycle analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to perform lifecycle analysis'
      });
    }
  }

  /**
   * Get customer behavior analysis with patterns
   */
  async getCustomerBehaviorAnalysis(req: Request, res: Response) {
    try {
      const { 
        analysisType = 'comprehensive',
        timeRange = '60d',
        includeAnomalies = true,
        deviceBreakdown = true 
      } = req.query;

      const behaviorData = await this.customerAggregator.getCustomerBehaviorAnalysis({
        analysisType: analysisType as string,
        timeRange: timeRange as string,
        includeAnomalies: includeAnomalies === 'true',
        deviceBreakdown: deviceBreakdown === 'true'
      });

      res.json({
        success: true,
        data: behaviorData,
        behavior: {
          primaryPatterns: behaviorData.behaviorPatterns,
          sessionAnalysis: behaviorData.sessionMetrics,
          pathAnalysis: behaviorData.customerJourney,
          anomalies: behaviorData.anomalyDetection
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer behavior analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze customer behavior'
      });
    }
  }

  /**
   * Get customer lifetime value analysis and predictions
   */
  async getCustomerLifetimeValue(req: Request, res: Response) {
    try {
      const { 
        customerId,
        calculationMethod = 'predictive',
        forecastPeriod = '365d',
        includeFactors = true 
      } = req.query;

      const clvData = await this.customerAggregator.getCustomerLifetimeValueAnalysis({
        customerId: customerId as string,
        calculationMethod: calculationMethod as string,
        forecastPeriod: forecastPeriod as string,
        includeFactors: includeFactors === 'true'
      });

      res.json({
        success: true,
        data: clvData,
        clv: {
          currentValue: clvData.currentCLV,
          predictedValue: clvData.predictedCLV,
          valueDrivers: clvData.valueFactors,
          optimizationOpportunities: clvData.optimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer lifetime value error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to calculate customer lifetime value'
      });
    }
  }

  /**
   * Get customer acquisition analysis
   */
  async getCustomerAcquisitionAnalysis(req: Request, res: Response) {
    try {
      const { 
        timeRange = '90d',
        channelBreakdown = true,
        costAnalysis = true,
        qualityScoring = true 
      } = req.query;

      const acquisitionData = await this.customerAggregator.getCustomerAcquisitionAnalysis({
        timeRange: timeRange as string,
        channelBreakdown: channelBreakdown === 'true',
        costAnalysis: costAnalysis === 'true',
        qualityScoring: qualityScoring === 'true'
      });

      res.json({
        success: true,
        data: acquisitionData,
        acquisition: {
          topChannels: acquisitionData.topAcquisitionChannels,
          costPerAcquisition: acquisitionData.costMetrics,
          qualityScores: acquisitionData.customerQuality,
          optimizationRecommendations: acquisitionData.channelOptimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer acquisition analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze customer acquisition'
      });
    }
  }

  /**
   * Get customer retention analysis with churn prediction
   */
  async getCustomerRetentionAnalysis(req: Request, res: Response) {
    try {
      const { 
        analysisDepth = 'detailed',
        predictionHorizon = '90d',
        includeInterventions = true,
        riskScoring = true 
      } = req.query;

      const retentionData = await this.customerAggregator.getCustomerRetentionAnalysis({
        analysisDepth: analysisDepth as string,
        predictionHorizon: predictionHorizon as string,
        includeInterventions: includeInterventions === 'true',
        riskScoring: riskScoring === 'true'
      });

      res.json({
        success: true,
        data: retentionData,
        retention: {
          retentionRate: retentionData.overallRetentionRate,
          churnPredictions: retentionData.churnPredictions,
          riskSegments: retentionData.riskAnalysis,
          interventionStrategies: retentionData.retentionStrategies
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer retention analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze customer retention'
      });
    }
  }

  /**
   * Get customer satisfaction and sentiment analysis
   */
  async getCustomerSatisfactionAnalysis(req: Request, res: Response) {
    try {
      const { 
        timeRange = '90d',
        includeReviews = true,
        sentimentAnalysis = true,
        npsCalculation = true 
      } = req.query;

      const satisfactionData = await this.customerAggregator.getCustomerSatisfactionAnalysis({
        timeRange: timeRange as string,
        includeReviews: includeReviews === 'true',
        sentimentAnalysis: sentimentAnalysis === 'true',
        npsCalculation: npsCalculation === 'true'
      });

      res.json({
        success: true,
        data: satisfactionData,
        satisfaction: {
          overallScore: satisfactionData.satisfactionScore,
          npsScore: satisfactionData.netPromoterScore,
          sentimentTrends: satisfactionData.sentimentAnalysis,
          improvementAreas: satisfactionData.satisfactionDrivers
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer satisfaction analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze customer satisfaction'
      });
    }
  }

  /**
   * Get customer geographic distribution and regional insights
   */
  async getCustomerGeographicAnalysis(req: Request, res: Response) {
    try {
      const { 
        level = 'division', // division, district, upazila
        includeHeatmap = true,
        demographicOverlay = true,
        timeRange = '180d' 
      } = req.query;

      const geographicData = await this.customerAggregator.getCustomerGeographicAnalysis({
        level: level as string,
        includeHeatmap: includeHeatmap === 'true',
        demographicOverlay: demographicOverlay === 'true',
        timeRange: timeRange as string
      });

      res.json({
        success: true,
        data: geographicData,
        geography: {
          distributionLevel: level,
          topRegions: geographicData.topPerformingRegions,
          growthOpportunities: geographicData.expansionOpportunities,
          regionalInsights: geographicData.regionalCharacteristics
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer geographic analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze customer geography'
      });
    }
  }

  /**
   * Get customer cohort analysis with detailed retention metrics
   */
  async getCustomerCohortAnalysis(req: Request, res: Response) {
    try {
      const { 
        cohortType = 'monthly',
        metric = 'retention',
        periods = 12,
        includeRevenue = true 
      } = req.query;

      const cohortData = await this.customerAggregator.getCustomerCohortAnalysis({
        cohortType: cohortType as string,
        metric: metric as string,
        periods: parseInt(periods as string),
        includeRevenue: includeRevenue === 'true'
      });

      res.json({
        success: true,
        data: cohortData,
        cohort: {
          analysisType: cohortType,
          metric,
          periodsAnalyzed: periods,
          keyInsights: cohortData.cohortInsights,
          retentionPattern: cohortData.retentionPattern
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer cohort analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to perform cohort analysis'
      });
    }
  }

  /**
   * Get customer purchase behavior and preferences
   */
  async getCustomerPurchaseBehavior(req: Request, res: Response) {
    try {
      const { 
        customerId,
        analysisType = 'comprehensive',
        timeRange = '365d',
        includePredictions = true 
      } = req.query;

      const purchaseData = await this.customerAggregator.getCustomerPurchaseBehavior({
        customerId: customerId as string,
        analysisType: analysisType as string,
        timeRange: timeRange as string,
        includePredictions: includePredictions === 'true'
      });

      res.json({
        success: true,
        data: purchaseData,
        behavior: {
          purchasePatterns: purchaseData.purchasePatterns,
          preferences: purchaseData.productPreferences,
          seasonality: purchaseData.seasonalTrends,
          nextPurchasePrediction: purchaseData.nextPurchaseModel
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer purchase behavior error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze purchase behavior'
      });
    }
  }

  /**
   * Get customer cross-sell and upsell opportunities
   */
  async getCustomerCrossSellOpportunities(req: Request, res: Response) {
    try {
      const { 
        customerId,
        opportunityType = 'both', // cross-sell, upsell, both
        confidenceThreshold = 0.7,
        limit = 20 
      } = req.query;

      const crossSellData = await this.customerAggregator.getCrossSellOpportunities({
        customerId: customerId as string,
        opportunityType: opportunityType as string,
        confidenceThreshold: parseFloat(confidenceThreshold as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: crossSellData,
        opportunities: {
          highConfidenceOpportunities: crossSellData.highConfidenceRecommendations,
          revenueProjection: crossSellData.revenueImpact,
          implementationStrategy: crossSellData.actionPlan
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Customer cross-sell opportunities error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to identify cross-sell opportunities'
      });
    }
  }
}