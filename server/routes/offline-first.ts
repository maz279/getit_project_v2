/**
 * Phase 5 Week 17-18: Enhanced Mobile PWA with Offline-First Architecture API Routes
 * Amazon.com/Shopee.sg-Level Offline-First Implementation with Bangladesh Network Resilience
 * 
 * API Endpoints:
 * - GET /api/v1/offline-first/health - Service health check
 * - GET /api/v1/offline-first/data/overview - Offline data overview
 * - GET /api/v1/offline-first/conflicts - Sync conflicts management
 * - GET /api/v1/offline-first/network/quality - Network quality monitoring
 * - GET /api/v1/offline-first/storage - Offline storage status
 * - GET /api/v1/offline-first/ux - Offline UX status
 * - POST /api/v1/offline-first/sync - Perform data synchronization
 * - POST /api/v1/offline-first/conflicts/resolve - Resolve sync conflicts
 * - POST /api/v1/offline-first/actions/queue - Add offline action to queue
 * - GET /api/v1/offline-first/dashboard - Comprehensive offline-first dashboard
 * - GET /api/v1/offline-first/test/system-status - System status for testing
 * - POST /api/v1/offline-first/test/generate-data - Generate test data
 * 
 * @fileoverview Offline-First API Routes for mobile PWA excellence
 * @author GetIt Platform Team
 * @version 5.17.0
 */

import { Router } from 'express';
import { OfflineFirstService } from '../services/offline/OfflineFirstService';

const router = Router();
const offlineFirstService = new OfflineFirstService();

/**
 * GET /api/v1/offline-first/health
 * Service health check
 */
router.get('/health', async (req, res) => {
  try {
    const result = await offlineFirstService.getHealth();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Health check failed'
    });
  }
});

/**
 * GET /api/v1/offline-first/data/overview
 * Offline data overview
 */
router.get('/data/overview', async (req, res) => {
  try {
    const result = await offlineFirstService.getOfflineDataOverview();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get offline data overview'
    });
  }
});

/**
 * GET /api/v1/offline-first/conflicts
 * Get sync conflicts
 */
router.get('/conflicts', async (req, res) => {
  try {
    const result = await offlineFirstService.getSyncConflicts();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sync conflicts'
    });
  }
});

/**
 * GET /api/v1/offline-first/network/quality
 * Network quality monitoring
 */
router.get('/network/quality', async (req, res) => {
  try {
    const result = await offlineFirstService.getNetworkQuality();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get network quality'
    });
  }
});

/**
 * GET /api/v1/offline-first/storage
 * Offline storage status
 */
router.get('/storage', async (req, res) => {
  try {
    const result = await offlineFirstService.getOfflineStorage();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get offline storage status'
    });
  }
});

/**
 * GET /api/v1/offline-first/ux
 * Offline UX status
 */
router.get('/ux', async (req, res) => {
  try {
    const result = await offlineFirstService.getOfflineUX();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get offline UX status'
    });
  }
});

/**
 * POST /api/v1/offline-first/sync
 * Perform data synchronization
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await offlineFirstService.performDataSync();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform data synchronization'
    });
  }
});

/**
 * POST /api/v1/offline-first/conflicts/resolve
 * Resolve sync conflicts
 */
router.post('/conflicts/resolve', async (req, res) => {
  try {
    const { conflictId, resolution } = req.body;
    
    if (!conflictId || !resolution) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: conflictId, resolution'
      });
    }
    
    if (!['server_wins', 'client_wins', 'merge'].includes(resolution)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resolution strategy'
      });
    }
    
    const result = await offlineFirstService.resolveSyncConflict(conflictId, resolution);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resolve sync conflict'
    });
  }
});

/**
 * POST /api/v1/offline-first/actions/queue
 * Add offline action to queue
 */
router.post('/actions/queue', async (req, res) => {
  try {
    const { type, endpoint, data, priority = 'medium', maxRetries = 3 } = req.body;
    
    if (!type || !endpoint || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, endpoint, data'
      });
    }
    
    if (!['create', 'update', 'delete', 'payment', 'order'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action type'
      });
    }
    
    if (!['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority level'
      });
    }
    
    const result = await offlineFirstService.addOfflineAction({
      type,
      endpoint,
      data,
      priority,
      maxRetries
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add offline action'
    });
  }
});

/**
 * GET /api/v1/offline-first/dashboard
 * Comprehensive offline-first dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const result = await offlineFirstService.getOfflineFirstDashboard();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get offline-first dashboard'
    });
  }
});

/**
 * GET /api/v1/offline-first/test/system-status
 * System status for testing
 */
router.get('/test/system-status', async (req, res) => {
  try {
    const result = await offlineFirstService.getSystemStatus();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get system status'
    });
  }
});

/**
 * POST /api/v1/offline-first/test/generate-data
 * Generate test data for validation
 */
router.post('/test/generate-data', async (req, res) => {
  try {
    const { dataType, count = 3 } = req.body;
    
    if (!dataType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: dataType'
      });
    }
    
    if (!['offline_data', 'sync_conflicts', 'queued_actions'].includes(dataType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data type'
      });
    }
    
    if (count < 1 || count > 10) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 10'
      });
    }
    
    const result = await offlineFirstService.generateTestData(dataType, count);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate test data'
    });
  }
});

export default router;