import { Request, Response } from 'express';
import { ProductAggregator } from '../aggregators/ProductAggregator';
import { logger } from '../../../../services/LoggingService';

/**
 * Product Controller - Amazon.com/Shopee.sg Level
 * Handles comprehensive product analytics and performance monitoring
 * Provides detailed product insights, inventory optimization, and recommendation analytics
 */
export class ProductController {
  private productAggregator: ProductAggregator;

  constructor() {
    this.productAggregator = new ProductAggregator();
  }

  /**
   * Get comprehensive product performance overview
   */
  async getProductPerformanceOverview(req: Request, res: Response) {
    try {
      const { 
        timeRange = '30d',
        categoryId,
        vendorId,
        includeForecasting = true,
        includeBenchmarks = true 
      } = req.query;

      logger.info('Product performance overview requested', {
        timeRange,
        categoryId,
        vendorId,
        requestId: req.headers['x-request-id']
      });

      const performanceData = await this.productAggregator.getComprehensiveProductPerformance({
        timeRange: timeRange as string,
        categoryId: categoryId as string,
        vendorId: vendorId as string,
        includeForecasting: includeForecasting === 'true',
        includeBenchmarks: includeBenchmarks === 'true'
      });

      res.json({
        success: true,
        data: performanceData,
        metadata: {
          timeRange,
          categoryFilter: categoryId || 'all',
          vendorFilter: vendorId || 'all',
          analysisDate: new Date().toISOString(),
          forecastingEnabled: includeForecasting === 'true'
        }
      });

    } catch (error) {
      logger.error('Product performance overview error', { error, requestId: req.headers['x-request-id'] });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product performance overview'
      });
    }
  }

  /**
   * Get detailed product sales analytics with trends
   */
  async getProductSalesAnalytics(req: Request, res: Response) {
    try {
      const { 
        productId,
        timeRange = '90d',
        includeComparison = true,
        granularity = 'daily' 
      } = req.query;

      const salesData = await this.productAggregator.getProductSalesAnalytics({
        productId: productId as string,
        timeRange: timeRange as string,
        includeComparison: includeComparison === 'true',
        granularity: granularity as string
      });

      res.json({
        success: true,
        data: salesData,
        analytics: {
          salesTrends: salesData.salesTrends,
          performanceScore: salesData.performanceMetrics,
          marketPosition: salesData.competitiveAnalysis,
          optimizationAreas: salesData.improvementOpportunities
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product sales analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product sales analytics'
      });
    }
  }

  /**
   * Get product inventory analytics and optimization
   */
  async getProductInventoryAnalytics(req: Request, res: Response) {
    try {
      const { 
        analysisType = 'comprehensive',
        timeRange = '60d',
        includeForecasting = true,
        alertsIncluded = true 
      } = req.query;

      const inventoryData = await this.productAggregator.getProductInventoryAnalytics({
        analysisType: analysisType as string,
        timeRange: timeRange as string,
        includeForecasting: includeForecasting === 'true',
        alertsIncluded: alertsIncluded === 'true'
      });

      res.json({
        success: true,
        data: inventoryData,
        inventory: {
          turnoverAnalysis: inventoryData.turnoverMetrics,
          stockLevels: inventoryData.stockAnalysis,
          demandForecasting: inventoryData.demandPredictions,
          optimizationRecommendations: inventoryData.inventoryOptimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product inventory analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch inventory analytics'
      });
    }
  }

  /**
   * Get product pricing analytics and optimization
   */
  async getProductPricingAnalytics(req: Request, res: Response) {
    try {
      const { 
        productId,
        includeCompetitive = true,
        priceElasticity = true,
        optimizationSuggestions = true 
      } = req.query;

      const pricingData = await this.productAggregator.getProductPricingAnalytics({
        productId: productId as string,
        includeCompetitive: includeCompetitive === 'true',
        priceElasticity: priceElasticity === 'true',
        optimizationSuggestions: optimizationSuggestions === 'true'
      });

      res.json({
        success: true,
        data: pricingData,
        pricing: {
          currentPricing: pricingData.currentPriceMetrics,
          elasticityAnalysis: pricingData.priceElasticity,
          competitivePosition: pricingData.competitivePricing,
          optimizationOpportunities: pricingData.pricingOptimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product pricing analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pricing analytics'
      });
    }
  }

  /**
   * Get product category performance analysis
   */
  async getProductCategoryAnalysis(req: Request, res: Response) {
    try {
      const { 
        categoryLevel = 'subcategory',
        timeRange = '90d',
        includeGrowthAnalysis = true,
        marketShareAnalysis = true 
      } = req.query;

      const categoryData = await this.productAggregator.getProductCategoryAnalysis({
        categoryLevel: categoryLevel as string,
        timeRange: timeRange as string,
        includeGrowthAnalysis: includeGrowthAnalysis === 'true',
        marketShareAnalysis: marketShareAnalysis === 'true'
      });

      res.json({
        success: true,
        data: categoryData,
        category: {
          performanceRankings: categoryData.categoryRankings,
          growthMetrics: categoryData.growthAnalysis,
          marketShare: categoryData.marketShareData,
          trendsAnalysis: categoryData.categoryTrends
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product category analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze product categories'
      });
    }
  }

  /**
   * Get product recommendation engine analytics
   */
  async getProductRecommendationAnalytics(req: Request, res: Response) {
    try {
      const { 
        productId,
        recommendationType = 'comprehensive',
        performanceMetrics = true,
        accuracyAnalysis = true 
      } = req.query;

      const recommendationData = await this.productAggregator.getRecommendationAnalytics({
        productId: productId as string,
        recommendationType: recommendationType as string,
        performanceMetrics: performanceMetrics === 'true',
        accuracyAnalysis: accuracyAnalysis === 'true'
      });

      res.json({
        success: true,
        data: recommendationData,
        recommendations: {
          algorithmPerformance: recommendationData.algorithmMetrics,
          conversionRates: recommendationData.conversionAnalysis,
          userEngagement: recommendationData.engagementMetrics,
          optimizationSuggestions: recommendationData.algorithmOptimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product recommendation analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recommendation analytics'
      });
    }
  }

  /**
   * Get product lifecycle analysis
   */
  async getProductLifecycleAnalysis(req: Request, res: Response) {
    try {
      const { 
        productId,
        lifecycleModel = 'advanced',
        predictiveAnalysis = true,
        stagingRecommendations = true 
      } = req.query;

      const lifecycleData = await this.productAggregator.getProductLifecycleAnalysis({
        productId: productId as string,
        lifecycleModel: lifecycleModel as string,
        predictiveAnalysis: predictiveAnalysis === 'true',
        stagingRecommendations: stagingRecommendations === 'true'
      });

      res.json({
        success: true,
        data: lifecycleData,
        lifecycle: {
          currentStage: lifecycleData.lifecycleStage,
          stageTransitions: lifecycleData.transitionHistory,
          performanceByStage: lifecycleData.stageMetrics,
          futureProjections: lifecycleData.lifecyclePredictions
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product lifecycle analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze product lifecycle'
      });
    }
  }

  /**
   * Get product customer sentiment analysis
   */
  async getProductSentimentAnalysis(req: Request, res: Response) {
    try {
      const { 
        productId,
        timeRange = '90d',
        includeReviews = true,
        sentimentTrends = true 
      } = req.query;

      const sentimentData = await this.productAggregator.getProductSentimentAnalysis({
        productId: productId as string,
        timeRange: timeRange as string,
        includeReviews: includeReviews === 'true',
        sentimentTrends: sentimentTrends === 'true'
      });

      res.json({
        success: true,
        data: sentimentData,
        sentiment: {
          overallSentiment: sentimentData.sentimentScore,
          sentimentTrends: sentimentData.sentimentHistory,
          reviewInsights: sentimentData.reviewAnalysis,
          improvementAreas: sentimentData.sentimentDrivers
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product sentiment analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze product sentiment'
      });
    }
  }

  /**
   * Get product competitive analysis
   */
  async getProductCompetitiveAnalysis(req: Request, res: Response) {
    try {
      const { 
        productId,
        competitorScope = 'category',
        analysisDepth = 'detailed',
        includeStrategies = true 
      } = req.query;

      const competitiveData = await this.productAggregator.getProductCompetitiveAnalysis({
        productId: productId as string,
        competitorScope: competitorScope as string,
        analysisDepth: analysisDepth as string,
        includeStrategies: includeStrategies === 'true'
      });

      res.json({
        success: true,
        data: competitiveData,
        competitive: {
          marketPosition: competitiveData.positionAnalysis,
          competitorComparison: competitiveData.competitorMetrics,
          competitiveAdvantages: competitiveData.strengthsWeaknesses,
          strategicRecommendations: competitiveData.competitiveStrategies
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product competitive analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to perform competitive analysis'
      });
    }
  }

  /**
   * Get product search and discovery analytics
   */
  async getProductSearchAnalytics(req: Request, res: Response) {
    try {
      const { 
        productId,
        timeRange = '30d',
        searchTerms = true,
        discoveryPaths = true 
      } = req.query;

      const searchData = await this.productAggregator.getProductSearchAnalytics({
        productId: productId as string,
        timeRange: timeRange as string,
        searchTerms: searchTerms === 'true',
        discoveryPaths: discoveryPaths === 'true'
      });

      res.json({
        success: true,
        data: searchData,
        search: {
          searchPerformance: searchData.searchMetrics,
          topSearchTerms: searchData.searchTermAnalysis,
          discoveryChannels: searchData.discoveryAnalysis,
          optimizationOpportunities: searchData.searchOptimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product search analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch search analytics'
      });
    }
  }

  /**
   * Get product cannibalization analysis
   */
  async getProductCannibalizationAnalysis(req: Request, res: Response) {
    try {
      const { 
        productId,
        analysisScope = 'vendor',
        timeRange = '180d',
        impactAssessment = true 
      } = req.query;

      const cannibalizationData = await this.productAggregator.getProductCannibalizationAnalysis({
        productId: productId as string,
        analysisScope: analysisScope as string,
        timeRange: timeRange as string,
        impactAssessment: impactAssessment === 'true'
      });

      res.json({
        success: true,
        data: cannibalizationData,
        cannibalization: {
          cannibalizationScore: cannibalizationData.cannibalizationMetrics,
          affectedProducts: cannibalizationData.impactedProducts,
          revenueImpact: cannibalizationData.revenueAnalysis,
          mitigationStrategies: cannibalizationData.mitigationRecommendations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product cannibalization analysis error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze product cannibalization'
      });
    }
  }

  /**
   * Get product bundle and cross-sell analytics
   */
  async getProductBundleAnalytics(req: Request, res: Response) {
    try {
      const { 
        productId,
        bundleType = 'cross-sell',
        performanceMetrics = true,
        optimizationSuggestions = true 
      } = req.query;

      const bundleData = await this.productAggregator.getProductBundleAnalytics({
        productId: productId as string,
        bundleType: bundleType as string,
        performanceMetrics: performanceMetrics === 'true',
        optimizationSuggestions: optimizationSuggestions === 'true'
      });

      res.json({
        success: true,
        data: bundleData,
        bundle: {
          bundlePerformance: bundleData.bundleMetrics,
          crossSellOpportunities: bundleData.crossSellAnalysis,
          upsellPotential: bundleData.upsellOpportunities,
          optimizationRecommendations: bundleData.bundleOptimizations
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Product bundle analytics error', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bundle analytics'
      });
    }
  }
}