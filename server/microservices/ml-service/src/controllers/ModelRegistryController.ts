/**
 * Model Registry Controller - Amazon SageMaker Unified Studio/Shopee-Level Model Management
 * Enterprise-grade model versioning, deployment tracking, and lifecycle management API
 */

import { Router, Request, Response } from 'express';
import { ModelRegistry } from '../model-registry/ModelRegistry';
import { logger } from '../utils/logger';

export class ModelRegistryController {
  private router: Router;
  private modelRegistry: ModelRegistry;

  constructor() {
    this.router = Router();
    this.modelRegistry = new ModelRegistry();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Core model management routes
    this.router.get('/models', this.getAllModels.bind(this));
    this.router.get('/models/:modelId', this.getModel.bind(this));
    this.router.post('/models', this.registerModel.bind(this));
    this.router.put('/models/:modelId', this.updateModel.bind(this));
    this.router.delete('/models/:modelId', this.archiveModel.bind(this));

    // Model version management
    this.router.get('/models/:modelId/versions', this.getModelVersions.bind(this));
    this.router.get('/models/:modelId/versions/:version', this.getModelVersion.bind(this));
    this.router.post('/models/:modelId/versions', this.addModelVersion.bind(this));
    this.router.get('/models/:modelId/versions/latest', this.getLatestVersion.bind(this));

    // Model deployment and lifecycle
    this.router.post('/models/:modelId/promote', this.promoteToProduction.bind(this));
    this.router.post('/models/:modelId/archive', this.archiveModelEndpoint.bind(this));
    this.router.get('/models/:modelId/deployment-history', this.getDeploymentHistory.bind(this));
    this.router.get('/models/:modelId/lineage', this.getModelLineage.bind(this));

    // Model discovery and search
    this.router.get('/search', this.searchModels.bind(this));
    this.router.get('/frameworks/:framework', this.getModelsByFramework.bind(this));
    this.router.get('/tasks/:task', this.getModelsByTask.bind(this));
    this.router.get('/production', this.getProductionModels.bind(this));

    // Model comparison and analysis
    this.router.post('/compare', this.compareModels.bind(this));
    this.router.get('/models/:modelId/compare/:comparisonModelId', this.compareModelsById.bind(this));
    this.router.get('/models/:modelId/performance', this.getModelPerformance.bind(this));

    // Bangladesh-specific features
    this.router.get('/bangladesh', this.getBangladeshModels.bind(this));
    this.router.get('/models/:modelId/bangladesh-compliance', this.validateBangladeshCompliance.bind(this));
    this.router.get('/bangladesh/stats', this.getBangladeshStats.bind(this));

    // Analytics and reporting
    this.router.get('/statistics', this.getStatistics.bind(this));
    this.router.get('/health', this.getHealth.bind(this));
    this.router.get('/export', this.exportRegistry.bind(this));
    this.router.get('/metrics', this.getMetrics.bind(this));

    // Model governance
    this.router.get('/models/:modelId/approvals', this.getModelApprovals.bind(this));
    this.router.post('/models/:modelId/approvals', this.approveModel.bind(this));
    this.router.get('/governance/compliance', this.getComplianceReport.bind(this));
  }

  /**
   * Get all models
   */
  private async getAllModels(req: Request, res: Response): Promise<void> {
    try {
      const { status, framework, task, bangladeshOptimized } = req.query;
      let models = this.modelRegistry.getAllModels();

      // Apply filters
      if (status) {
        models = models.filter(model => model.status === status);
      }
      if (framework) {
        models = models.filter(model => model.framework === framework);
      }
      if (task) {
        models = models.filter(model => model.task === task);
      }
      if (bangladeshOptimized === 'true') {
        models = models.filter(model => model.bangladeshOptimized);
      }

      res.json({
        success: true,
        data: {
          models,
          totalCount: models.length,
          filters: { status, framework, task, bangladeshOptimized }
        }
      });
    } catch (error) {
      logger.error('Error fetching models', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch models'
      });
    }
  }

  /**
   * Get specific model
   */
  private async getModel(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const model = this.modelRegistry.getModel(modelId);

      if (!model) {
        res.status(404).json({
          success: false,
          error: 'Model not found'
        });
        return;
      }

      const versions = this.modelRegistry.getModelVersions(modelId);
      const latestVersion = this.modelRegistry.getLatestVersion(modelId);

      res.json({
        success: true,
        data: {
          model,
          versions: versions.length,
          latestVersion: latestVersion?.version || null,
          deploymentHistory: this.modelRegistry.getDeploymentHistory(modelId)
        }
      });
    } catch (error) {
      logger.error('Error fetching model', { error, modelId: req.params.modelId });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch model'
      });
    }
  }

  /**
   * Register new model
   */
  private async registerModel(req: Request, res: Response): Promise<void> {
    try {
      const modelData = req.body;
      
      // Validate required fields
      const requiredFields = ['id', 'name', 'framework', 'task', 'accuracy'];
      for (const field of requiredFields) {
        if (!modelData[field]) {
          res.status(400).json({
            success: false,
            error: `Missing required field: ${field}`
          });
          return;
        }
      }

      // Set defaults
      modelData.version = modelData.version || '1.0.0';
      modelData.createdAt = new Date();
      modelData.updatedAt = new Date();
      modelData.status = modelData.status || 'development';
      modelData.bangladeshOptimized = modelData.bangladeshOptimized || false;
      modelData.culturalFeatures = modelData.culturalFeatures || [];
      modelData.tags = modelData.tags || [];

      this.modelRegistry.registerModel(modelData);

      res.status(201).json({
        success: true,
        data: {
          modelId: modelData.id,
          message: 'Model registered successfully'
        }
      });
    } catch (error) {
      logger.error('Error registering model', { error, modelData: req.body });
      res.status(500).json({
        success: false,
        error: 'Failed to register model'
      });
    }
  }

  /**
   * Get model versions
   */
  private async getModelVersions(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const versions = this.modelRegistry.getModelVersions(modelId);

      res.json({
        success: true,
        data: {
          modelId,
          versions,
          totalVersions: versions.length
        }
      });
    } catch (error) {
      logger.error('Error fetching model versions', { error, modelId: req.params.modelId });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch model versions'
      });
    }
  }

  /**
   * Add model version
   */
  private async addModelVersion(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const versionData = req.body;

      // Validate model exists
      const model = this.modelRegistry.getModel(modelId);
      if (!model) {
        res.status(404).json({
          success: false,
          error: 'Model not found'
        });
        return;
      }

      // Validate required version fields
      const requiredFields = ['version', 'artifacts', 'metrics'];
      for (const field of requiredFields) {
        if (!versionData[field]) {
          res.status(400).json({
            success: false,
            error: `Missing required field: ${field}`
          });
          return;
        }
      }

      versionData.modelId = modelId;
      this.modelRegistry.addVersion(modelId, versionData);

      res.status(201).json({
        success: true,
        data: {
          modelId,
          version: versionData.version,
          message: 'Model version added successfully'
        }
      });
    } catch (error) {
      logger.error('Error adding model version', { error, modelId: req.params.modelId });
      res.status(500).json({
        success: false,
        error: 'Failed to add model version'
      });
    }
  }

  /**
   * Search models
   */
  private async searchModels(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query parameter "q" is required'
        });
        return;
      }

      const results = this.modelRegistry.searchModels(q);

      res.json({
        success: true,
        data: {
          query: q,
          results,
          totalResults: results.length
        }
      });
    } catch (error) {
      logger.error('Error searching models', { error, query: req.query.q });
      res.status(500).json({
        success: false,
        error: 'Failed to search models'
      });
    }
  }

  /**
   * Get models by framework
   */
  private async getModelsByFramework(req: Request, res: Response): Promise<void> {
    try {
      const { framework } = req.params;
      const models = this.modelRegistry.getModelsByFramework(framework);

      res.json({
        success: true,
        data: {
          framework,
          models,
          totalCount: models.length
        }
      });
    } catch (error) {
      logger.error('Error fetching models by framework', { error, framework: req.params.framework });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch models by framework'
      });
    }
  }

  /**
   * Get models by task
   */
  private async getModelsByTask(req: Request, res: Response): Promise<void> {
    try {
      const { task } = req.params;
      const models = this.modelRegistry.getModelsByTask(task);

      res.json({
        success: true,
        data: {
          task,
          models,
          totalCount: models.length
        }
      });
    } catch (error) {
      logger.error('Error fetching models by task', { error, task: req.params.task });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch models by task'
      });
    }
  }

  /**
   * Get production models
   */
  private async getProductionModels(req: Request, res: Response): Promise<void> {
    try {
      const models = this.modelRegistry.getProductionModels();

      res.json({
        success: true,
        data: {
          models,
          totalCount: models.length,
          status: 'production'
        }
      });
    } catch (error) {
      logger.error('Error fetching production models', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch production models'
      });
    }
  }

  /**
   * Compare models
   */
  private async compareModels(req: Request, res: Response): Promise<void> {
    try {
      const { modelA, modelB } = req.body;

      if (!modelA || !modelB) {
        res.status(400).json({
          success: false,
          error: 'Both modelA and modelB are required'
        });
        return;
      }

      const comparison = this.modelRegistry.compareModels(modelA, modelB);

      if (!comparison) {
        res.status(404).json({
          success: false,
          error: 'One or both models not found'
        });
        return;
      }

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      logger.error('Error comparing models', { error, models: req.body });
      res.status(500).json({
        success: false,
        error: 'Failed to compare models'
      });
    }
  }

  /**
   * Compare models by ID
   */
  private async compareModelsById(req: Request, res: Response): Promise<void> {
    try {
      const { modelId, comparisonModelId } = req.params;
      const comparison = this.modelRegistry.compareModels(modelId, comparisonModelId);

      if (!comparison) {
        res.status(404).json({
          success: false,
          error: 'One or both models not found'
        });
        return;
      }

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      logger.error('Error comparing models by ID', { error, modelId: req.params.modelId });
      res.status(500).json({
        success: false,
        error: 'Failed to compare models'
      });
    }
  }

  /**
   * Promote model to production
   */
  private async promoteToProduction(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const { version } = req.body;

      const success = this.modelRegistry.promoteToProduction(modelId, version || 'latest');

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Model not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          modelId,
          version,
          status: 'production',
          message: 'Model promoted to production successfully'
        }
      });
    } catch (error) {
      logger.error('Error promoting model to production', { error, modelId: req.params.modelId });
      res.status(500).json({
        success: false,
        error: 'Failed to promote model to production'
      });
    }
  }

  /**
   * Archive model endpoint
   */
  private async archiveModelEndpoint(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const success = this.modelRegistry.archiveModel(modelId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Model not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          modelId,
          status: 'archived',
          message: 'Model archived successfully'
        }
      });
    } catch (error) {
      logger.error('Error archiving model', { error, modelId: req.params.modelId });
      res.status(500).json({
        success: false,
        error: 'Failed to archive model'
      });
    }
  }

  /**
   * Get Bangladesh models
   */
  private async getBangladeshModels(req: Request, res: Response): Promise<void> {
    try {
      const models = this.modelRegistry.getBangladeshModels();

      res.json({
        success: true,
        data: {
          models,
          totalCount: models.length,
          bangladeshOptimized: true
        }
      });
    } catch (error) {
      logger.error('Error fetching Bangladesh models', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Bangladesh models'
      });
    }
  }

  /**
   * Validate Bangladesh compliance
   */
  private async validateBangladeshCompliance(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const compliance = this.modelRegistry.validateBangladeshCompliance(modelId);

      if (!compliance) {
        res.status(404).json({
          success: false,
          error: 'Model not found'
        });
        return;
      }

      res.json({
        success: true,
        data: compliance
      });
    } catch (error) {
      logger.error('Error validating Bangladesh compliance', { error, modelId: req.params.modelId });
      res.status(500).json({
        success: false,
        error: 'Failed to validate Bangladesh compliance'
      });
    }
  }

  /**
   * Get statistics
   */
  private async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = this.modelRegistry.getStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error fetching statistics', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }

  /**
   * Get health
   */
  private async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = this.modelRegistry.getHealth();

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      logger.error('Error fetching health', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch health'
      });
    }
  }

  /**
   * Export registry
   */
  private async exportRegistry(req: Request, res: Response): Promise<void> {
    try {
      const export_data = this.modelRegistry.exportRegistry();

      res.json({
        success: true,
        data: export_data
      });
    } catch (error) {
      logger.error('Error exporting registry', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to export registry'
      });
    }
  }

  /**
   * Get metrics
   */
  private async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = this.modelRegistry.getStatistics();

      res.json({
        success: true,
        data: {
          ...metrics,
          timestamp: new Date().toISOString(),
          metricsType: 'model-registry'
        }
      });
    } catch (error) {
      logger.error('Error fetching metrics', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch metrics'
      });
    }
  }

  /**
   * Get model approvals (placeholder)
   */
  private async getModelApprovals(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      
      res.json({
        success: true,
        data: {
          modelId,
          approvals: {
            technical: true,
            business: false,
            security: true,
            compliance: true,
            bangladeshCompliance: true
          },
          pendingApprovals: ['business'],
          approvalHistory: []
        }
      });
    } catch (error) {
      logger.error('Error fetching model approvals', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch model approvals'
      });
    }
  }

  /**
   * Approve model (placeholder)
   */
  private async approveModel(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const { approvalType, approved } = req.body;

      res.json({
        success: true,
        data: {
          modelId,
          approvalType,
          approved,
          approvedBy: 'current-user',
          approvedAt: new Date().toISOString(),
          message: `Model ${approved ? 'approved' : 'rejected'} for ${approvalType}`
        }
      });
    } catch (error) {
      logger.error('Error approving model', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to approve model'
      });
    }
  }

  /**
   * Get compliance report (placeholder)
   */
  private async getComplianceReport(req: Request, res: Response): Promise<void> {
    try {
      const statistics = this.modelRegistry.getStatistics();
      
      res.json({
        success: true,
        data: {
          totalModels: statistics.totalModels,
          compliantModels: statistics.bangladeshOptimization?.total || 0,
          complianceRate: statistics.bangladeshOptimization?.percentage || 0,
          pendingReviews: 2,
          criticalIssues: 0,
          recommendations: [
            'Increase Bangladesh optimization coverage',
            'Add Bengali language support to more models',
            'Implement cultural feature validation'
          ]
        }
      });
    } catch (error) {
      logger.error('Error fetching compliance report', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch compliance report'
      });
    }
  }

  /**
   * Get model lineage
   */
  private async getModelLineage(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const lineage = this.modelRegistry.getModelLineage(modelId);

      res.json({
        success: true,
        data: lineage
      });
    } catch (error) {
      logger.error('Error fetching model lineage', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch model lineage'
      });
    }
  }

  /**
   * Get deployment history
   */
  private async getDeploymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const history = this.modelRegistry.getDeploymentHistory(modelId);

      res.json({
        success: true,
        data: {
          modelId,
          deploymentHistory: history,
          totalDeployments: history.length
        }
      });
    } catch (error) {
      logger.error('Error fetching deployment history', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch deployment history'
      });
    }
  }

  /**
   * Get model performance
   */
  private async getModelPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const model = this.modelRegistry.getModel(modelId);

      if (!model) {
        res.status(404).json({
          success: false,
          error: 'Model not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          modelId,
          performance: model.performance,
          accuracy: model.accuracy,
          bangladeshOptimized: model.bangladeshOptimized,
          culturalFeatures: model.culturalFeatures
        }
      });
    } catch (error) {
      logger.error('Error fetching model performance', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch model performance'
      });
    }
  }

  /**
   * Get latest version
   */
  private async getLatestVersion(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const latestVersion = this.modelRegistry.getLatestVersion(modelId);

      if (!latestVersion) {
        res.status(404).json({
          success: false,
          error: 'No versions found for this model'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          modelId,
          latestVersion
        }
      });
    } catch (error) {
      logger.error('Error fetching latest version', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch latest version'
      });
    }
  }

  /**
   * Get model version
   */
  private async getModelVersion(req: Request, res: Response): Promise<void> {
    try {
      const { modelId, version } = req.params;
      const versions = this.modelRegistry.getModelVersions(modelId);
      const specificVersion = versions.find(v => v.version === version);

      if (!specificVersion) {
        res.status(404).json({
          success: false,
          error: 'Version not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          modelId,
          version: specificVersion
        }
      });
    } catch (error) {
      logger.error('Error fetching model version', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch model version'
      });
    }
  }

  /**
   * Update model
   */
  private async updateModel(req: Request, res: Response): Promise<void> {
    try {
      const { modelId } = req.params;
      const updateData = req.body;

      const model = this.modelRegistry.getModel(modelId);
      if (!model) {
        res.status(404).json({
          success: false,
          error: 'Model not found'
        });
        return;
      }

      // Update allowed fields
      const allowedFields = ['name', 'description', 'tags', 'status', 'bangladeshOptimized', 'culturalFeatures'];
      const updatedModel = { ...model };
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updatedModel[field] = updateData[field];
        }
      });

      updatedModel.updatedAt = new Date();
      
      // Re-register the updated model
      this.modelRegistry.registerModel(updatedModel);

      res.json({
        success: true,
        data: {
          modelId,
          message: 'Model updated successfully',
          updatedFields: Object.keys(updateData)
        }
      });
    } catch (error) {
      logger.error('Error updating model', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to update model'
      });
    }
  }

  /**
   * Get Bangladesh stats
   */
  private async getBangladeshStats(req: Request, res: Response): Promise<void> {
    try {
      const statistics = this.modelRegistry.getStatistics();
      const bangladeshStats = statistics.bangladeshOptimization || {};

      res.json({
        success: true,
        data: {
          ...bangladeshStats,
          culturalFeatureUsage: bangladeshStats.culturalFeatures || {},
          recommendations: [
            'Increase Bengali language support coverage',
            'Add more cultural festival features',
            'Implement regional optimization patterns'
          ]
        }
      });
    } catch (error) {
      logger.error('Error fetching Bangladesh stats', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Bangladesh stats'
      });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}