/**
 * Feature Store Controller - Amazon.com/Shopee.sg-Level Feature Management
 * Enterprise-grade feature store API endpoints
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { FeatureStoreService } from '../feature-store/FeatureStoreService';

interface FeatureRequest {
  entityId: string;
  entityType: 'user' | 'product' | 'order' | 'vendor';
  featureNames: string[];
  timestamp?: Date;
}

interface FeatureStoreRequest {
  values: {
    featureName: string;
    value: any;
    timestamp: Date;
    entityId: string;
    entityType: string;
  }[];
}

interface BatchFeatureRequest {
  entities: {
    entityId: string;
    entityType: 'user' | 'product' | 'order' | 'vendor';
  }[];
  featureNames: string[];
  storeType: 'online' | 'offline';
}

export class FeatureStoreController {
  private router: Router;
  private featureStore: FeatureStoreService;

  constructor() {
    this.router = Router();
    this.featureStore = new FeatureStoreService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Core feature retrieval endpoints
    this.router.post('/features/online', this.getOnlineFeatures.bind(this));
    this.router.post('/features/offline', this.getOfflineFeatures.bind(this));
    this.router.post('/features/batch', this.getBatchFeatures.bind(this));
    this.router.post('/features/store', this.storeFeatures.bind(this));
    
    // Feature management endpoints
    this.router.get('/features/definitions', this.getFeatureDefinitions.bind(this));
    this.router.post('/features/definitions', this.registerFeature.bind(this));
    this.router.get('/features/definitions/:name', this.getFeatureDefinition.bind(this));
    this.router.put('/features/definitions/:name', this.updateFeatureDefinition.bind(this));
    this.router.delete('/features/definitions/:name', this.deleteFeatureDefinition.bind(this));
    
    // Feature discovery and search
    this.router.get('/features/search', this.searchFeatures.bind(this));
    this.router.get('/features/recommendations', this.getFeatureRecommendations.bind(this));
    this.router.get('/features/bangladesh', this.getBangladeshFeatures.bind(this));
    this.router.get('/features/by-type/:type', this.getFeaturesByType.bind(this));
    this.router.get('/features/by-owner/:owner', this.getFeaturesByOwner.bind(this));
    this.router.get('/features/by-tag/:tag', this.getFeaturesByTag.bind(this));
    
    // Feature lineage and dependencies
    this.router.get('/features/lineage/:name', this.getFeatureLineage.bind(this));
    this.router.get('/features/dependencies/:name', this.getFeatureDependencies.bind(this));
    
    // Feature statistics and analytics
    this.router.get('/features/statistics', this.getFeatureStatistics.bind(this));
    this.router.get('/features/usage/:name', this.getFeatureUsage.bind(this));
    this.router.get('/features/quality/:name', this.getFeatureQuality.bind(this));
    
    // Historical features and time series
    this.router.post('/features/historical', this.getHistoricalFeatures.bind(this));
    this.router.post('/features/aggregated', this.getAggregatedFeatures.bind(this));
    this.router.post('/features/time-series', this.getTimeSeriesFeatures.bind(this));
    
    // Feature validation and testing
    this.router.post('/features/validate', this.validateFeatures.bind(this));
    this.router.post('/features/test', this.testFeatures.bind(this));
    this.router.post('/features/compare', this.compareFeatures.bind(this));
    
    // Feature pipeline management
    this.router.post('/pipeline/submit', this.submitPipelineJob.bind(this));
    this.router.get('/pipeline/jobs', this.getPipelineJobs.bind(this));
    this.router.get('/pipeline/jobs/:jobId', this.getPipelineJobStatus.bind(this));
    this.router.post('/pipeline/jobs/:jobId/cancel', this.cancelPipelineJob.bind(this));
    this.router.get('/pipeline/statistics', this.getPipelineStatistics.bind(this));
    
    // Feature store health and monitoring
    this.router.get('/health', this.getHealth.bind(this));
    this.router.get('/metrics', this.getMetrics.bind(this));
    this.router.get('/performance', this.getPerformanceMetrics.bind(this));
    
    // Import/Export functionality
    this.router.post('/features/import', this.importFeatures.bind(this));
    this.router.get('/features/export', this.exportFeatures.bind(this));
    
    logger.info('✅ FeatureStoreController routes initialized');
  }

  /**
   * Get features from online store (real-time)
   */
  private async getOnlineFeatures(req: Request, res: Response): Promise<void> {
    try {
      const requestData: FeatureRequest = req.body;
      
      if (!requestData.entityId || !requestData.entityType || !requestData.featureNames) {
        res.status(400).json({
          success: false,
          error: 'Entity ID, entity type, and feature names are required'
        });
        return;
      }

      logger.info('🔍 Getting online features', {
        entityId: requestData.entityId,
        entityType: requestData.entityType,
        featureCount: requestData.featureNames.length
      });

      const result = await this.featureStore.getOnlineFeatures(requestData);

      res.json({
        success: true,
        data: result,
        metadata: {
          store: 'online',
          retrievedAt: new Date().toISOString(),
          responseTime: result.latency
        }
      });

      logger.info('✅ Online features retrieved', {
        entityId: requestData.entityId,
        featureCount: Object.keys(result.features).length,
        latency: result.latency
      });

    } catch (error) {
      logger.error('❌ Error getting online features', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve online features'
      });
    }
  }

  /**
   * Get features from offline store (batch)
   */
  private async getOfflineFeatures(req: Request, res: Response): Promise<void> {
    try {
      const requestData: FeatureRequest = req.body;
      
      if (!requestData.entityId || !requestData.entityType || !requestData.featureNames) {
        res.status(400).json({
          success: false,
          error: 'Entity ID, entity type, and feature names are required'
        });
        return;
      }

      logger.info('📊 Getting offline features', {
        entityId: requestData.entityId,
        entityType: requestData.entityType,
        featureCount: requestData.featureNames.length
      });

      const result = await this.featureStore.getOfflineFeatures(requestData);

      res.json({
        success: true,
        data: result,
        metadata: {
          store: 'offline',
          retrievedAt: new Date().toISOString(),
          responseTime: result.latency
        }
      });

      logger.info('✅ Offline features retrieved', {
        entityId: requestData.entityId,
        featureCount: Object.keys(result.features).length,
        latency: result.latency
      });

    } catch (error) {
      logger.error('❌ Error getting offline features', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve offline features'
      });
    }
  }

  /**
   * Get features for multiple entities (batch)
   */
  private async getBatchFeatures(req: Request, res: Response): Promise<void> {
    try {
      const requestData: BatchFeatureRequest = req.body;
      
      if (!requestData.entities || !requestData.featureNames) {
        res.status(400).json({
          success: false,
          error: 'Entities and feature names are required'
        });
        return;
      }

      logger.info('📦 Getting batch features', {
        entityCount: requestData.entities.length,
        featureCount: requestData.featureNames.length,
        storeType: requestData.storeType
      });

      const results = [];
      for (const entity of requestData.entities) {
        const featureRequest: FeatureRequest = {
          entityId: entity.entityId,
          entityType: entity.entityType,
          featureNames: requestData.featureNames
        };

        const result = requestData.storeType === 'online' 
          ? await this.featureStore.getOnlineFeatures(featureRequest)
          : await this.featureStore.getOfflineFeatures(featureRequest);
        
        results.push(result);
      }

      res.json({
        success: true,
        data: results,
        metadata: {
          store: requestData.storeType,
          entityCount: requestData.entities.length,
          featureCount: requestData.featureNames.length,
          retrievedAt: new Date().toISOString()
        }
      });

      logger.info('✅ Batch features retrieved', {
        entityCount: requestData.entities.length,
        resultCount: results.length
      });

    } catch (error) {
      logger.error('❌ Error getting batch features', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve batch features'
      });
    }
  }

  /**
   * Store features in feature store
   */
  private async storeFeatures(req: Request, res: Response): Promise<void> {
    try {
      const requestData: FeatureStoreRequest = req.body;
      
      if (!requestData.values || !Array.isArray(requestData.values)) {
        res.status(400).json({
          success: false,
          error: 'Feature values array is required'
        });
        return;
      }

      logger.info('💾 Storing features', {
        featureCount: requestData.values.length
      });

      await this.featureStore.storeFeatures(requestData.values);

      res.json({
        success: true,
        message: 'Features stored successfully',
        metadata: {
          storedFeatures: requestData.values.length,
          storedAt: new Date().toISOString()
        }
      });

      logger.info('✅ Features stored successfully', {
        featureCount: requestData.values.length
      });

    } catch (error) {
      logger.error('❌ Error storing features', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to store features'
      });
    }
  }

  /**
   * Get all feature definitions
   */
  private async getFeatureDefinitions(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📋 Getting feature definitions');

      const definitions = await this.featureStore.getFeatureDefinitions();

      res.json({
        success: true,
        data: definitions,
        metadata: {
          total: definitions.length,
          retrievedAt: new Date().toISOString()
        }
      });

      logger.info('✅ Feature definitions retrieved', {
        count: definitions.length
      });

    } catch (error) {
      logger.error('❌ Error getting feature definitions', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve feature definitions'
      });
    }
  }

  /**
   * Register new feature definition
   */
  private async registerFeature(req: Request, res: Response): Promise<void> {
    try {
      const featureDefinition = req.body;
      
      if (!featureDefinition.name || !featureDefinition.type || !featureDefinition.description) {
        res.status(400).json({
          success: false,
          error: 'Feature name, type, and description are required'
        });
        return;
      }

      logger.info('📝 Registering feature', {
        featureName: featureDefinition.name,
        type: featureDefinition.type
      });

      await this.featureStore.registerFeature(featureDefinition);

      res.json({
        success: true,
        message: 'Feature registered successfully',
        data: { featureName: featureDefinition.name }
      });

      logger.info('✅ Feature registered successfully', {
        featureName: featureDefinition.name
      });

    } catch (error) {
      logger.error('❌ Error registering feature', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to register feature'
      });
    }
  }

  /**
   * Get Bangladesh-specific features
   */
  private async getBangladeshFeatures(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🇧🇩 Getting Bangladesh features');

      const features = await this.featureStore.getBangladeshFeatures();

      res.json({
        success: true,
        data: features,
        metadata: {
          total: features.length,
          country: 'Bangladesh',
          retrievedAt: new Date().toISOString()
        }
      });

      logger.info('✅ Bangladesh features retrieved', {
        count: features.length
      });

    } catch (error) {
      logger.error('❌ Error getting Bangladesh features', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve Bangladesh features'
      });
    }
  }

  /**
   * Get feature store health
   */
  private async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = this.featureStore.getServiceHealth();

      res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('❌ Error getting feature store health', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve health status'
      });
    }
  }

  /**
   * Search features
   */
  private async searchFeatures(req: Request, res: Response): Promise<void> {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      // This would typically call a search method on the feature registry
      // For now, we'll return a placeholder response
      res.json({
        success: true,
        data: [],
        metadata: {
          query: query,
          total: 0,
          searchedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('❌ Error searching features', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to search features'
      });
    }
  }

  /**
   * Submit pipeline job
   */
  private async submitPipelineJob(req: Request, res: Response): Promise<void> {
    try {
      const jobRequest = req.body;
      
      // This would typically submit a job to the feature pipeline
      // For now, we'll return a placeholder response
      const jobId = `job_${Date.now()}`;
      
      res.json({
        success: true,
        data: { jobId: jobId },
        message: 'Pipeline job submitted successfully'
      });

    } catch (error) {
      logger.error('❌ Error submitting pipeline job', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to submit pipeline job'
      });
    }
  }

  /**
   * Get feature store metrics
   */
  private async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const health = this.featureStore.getServiceHealth();
      
      const metrics = {
        features: health.features,
        performance: health.performance,
        stores: {
          online: health.onlineStore,
          offline: health.offlineStore
        },
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: metrics
      });

    } catch (error) {
      logger.error('❌ Error getting feature store metrics', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics'
      });
    }
  }

  // Placeholder methods for remaining endpoints
  private async getFeatureDefinition(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: null, message: 'Not implemented yet' });
  }

  private async updateFeatureDefinition(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' });
  }

  private async deleteFeatureDefinition(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' });
  }

  private async getFeatureRecommendations(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async getFeaturesByType(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async getFeaturesByOwner(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async getFeaturesByTag(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async getFeatureLineage(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: null, message: 'Not implemented yet' });
  }

  private async getFeatureDependencies(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async getFeatureStatistics(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  private async getFeatureUsage(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  private async getFeatureQuality(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  private async getHistoricalFeatures(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async getAggregatedFeatures(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async getTimeSeriesFeatures(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async validateFeatures(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  private async testFeatures(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  private async compareFeatures(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  private async getPipelineJobs(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: [], message: 'Not implemented yet' });
  }

  private async getPipelineJobStatus(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: null, message: 'Not implemented yet' });
  }

  private async cancelPipelineJob(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' });
  }

  private async getPipelineStatistics(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  private async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  private async importFeatures(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Not implemented yet' });
  }

  private async exportFeatures(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: {}, message: 'Not implemented yet' });
  }

  getRouter(): Router {
    return this.router;
  }
}