/**
 * Infrastructure API Routes
 * Phase 5 Enterprise Infrastructure endpoints
 */

import { Router } from 'express';
import { EnterpriseInfrastructureService } from '../services/infrastructure/EnterpriseInfrastructureService';

const router = Router();

// Create enterprise infrastructure service instance
const infrastructureService = new EnterpriseInfrastructureService({
  name: 'EnterpriseInfrastructure',
  version: '5.0.0'
});

/**
 * GET /api/v1/infrastructure/health
 * Get infrastructure health status
 */
router.get('/health', async (req, res) => {
  try {
    const result = await infrastructureService.getInfrastructureHealth();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'INFRASTRUCTURE_HEALTH_ERROR',
      message: 'Failed to get infrastructure health'
    });
  }
});

/**
 * GET /api/v1/infrastructure/metrics
 * Get infrastructure metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const result = await infrastructureService.getInfrastructureMetrics();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'INFRASTRUCTURE_METRICS_ERROR',
      message: 'Failed to get infrastructure metrics'
    });
  }
});

/**
 * POST /api/v1/infrastructure/auto-scaling
 * Configure auto-scaling
 */
router.post('/auto-scaling', async (req, res) => {
  try {
    const config = req.body;
    const result = await infrastructureService.configureAutoScaling(config);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'AUTO_SCALING_CONFIG_ERROR',
      message: 'Failed to configure auto-scaling'
    });
  }
});

/**
 * POST /api/v1/infrastructure/deploy
 * Deploy with strategy
 */
router.post('/deploy', async (req, res) => {
  try {
    const { service, image, strategy } = req.body;
    const result = await infrastructureService.deployWithStrategy(service, image, strategy);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'DEPLOYMENT_ERROR',
      message: 'Failed to deploy with strategy'
    });
  }
});

/**
 * POST /api/v1/infrastructure/service-mesh
 * Configure service mesh
 */
router.post('/service-mesh', async (req, res) => {
  try {
    const config = req.body;
    const result = await infrastructureService.configureServiceMesh(config);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVICE_MESH_CONFIG_ERROR',
      message: 'Failed to configure service mesh'
    });
  }
});

/**
 * POST /api/v1/infrastructure/disaster-recovery
 * Setup disaster recovery
 */
router.post('/disaster-recovery', async (req, res) => {
  try {
    const config = req.body;
    const result = await infrastructureService.setupDisasterRecovery(config);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'DISASTER_RECOVERY_SETUP_ERROR',
      message: 'Failed to setup disaster recovery'
    });
  }
});

/**
 * POST /api/v1/infrastructure/monitoring
 * Setup monitoring stack
 */
router.post('/monitoring', async (req, res) => {
  try {
    const result = await infrastructureService.setupMonitoring();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'MONITORING_SETUP_ERROR',
      message: 'Failed to setup monitoring'
    });
  }
});

export default router;