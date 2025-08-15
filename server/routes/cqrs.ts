/**
 * Enhanced CQRS API Routes
 * 
 * Implements Phase 3 Week 11-12: Enhanced CQRS with Eventual Consistency
 * Provides comprehensive API endpoints for CQRS operations
 * 
 * @author GetIt Platform Team
 * @version 1.0.0
 * @since 2025-07-15
 */

import { Router } from 'express';
import { enhancedCQRSService } from '../services/cqrs/EnhancedCQRSService';

const router = Router();

// ====================
// HEALTH & STATUS ROUTES
// ====================

/**
 * GET /health
 * Get CQRS service health status
 */
router.get('/health', async (req, res) => {
  try {
    const health = await enhancedCQRSService.getHealth();
    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// ====================
// PROJECTION MANAGEMENT ROUTES
// ====================

/**
 * GET /projections
 * Get all CQRS projections
 */
router.get('/projections', async (req, res) => {
  try {
    const projections = await enhancedCQRSService.getAllProjections();
    res.status(200).json(projections);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * POST /projections
 * Create a new CQRS projection
 */
router.post('/projections', async (req, res) => {
  try {
    const {
      name,
      type = 'read_model',
      aggregateType,
      initialData = {},
      consistencyStrategy = { strategy: 'eventual' }
    } = req.body;

    if (!name || !aggregateType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, aggregateType',
        timestamp: new Date()
      });
    }

    const result = await enhancedCQRSService.createProjection(
      name,
      type,
      aggregateType,
      initialData,
      consistencyStrategy
    );

    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * PUT /projections/:name
 * Update a CQRS projection
 */
router.put('/projections/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const {
      newData,
      eventId,
      consistencyStrategy
    } = req.body;

    if (!newData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: newData',
        timestamp: new Date()
      });
    }

    const result = await enhancedCQRSService.updateProjection(
      name,
      newData,
      eventId,
      consistencyStrategy
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * GET /projections/:name
 * Get a specific CQRS projection
 */
router.get('/projections/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const projection = await enhancedCQRSService.getProjectionByName(name);

    if (!projection) {
      return res.status(404).json({
        success: false,
        error: `Projection '${name}' not found`,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: projection,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// ====================
// CONFLICT RESOLUTION ROUTES
// ====================

/**
 * POST /conflicts/detect
 * Detect and resolve conflicts
 */
router.post('/conflicts/detect', async (req, res) => {
  try {
    const {
      aggregateId,
      aggregateType,
      conflictingEvents
    } = req.body;

    if (!aggregateId || !aggregateType || !conflictingEvents) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: aggregateId, aggregateType, conflictingEvents',
        timestamp: new Date()
      });
    }

    const result = await enhancedCQRSService.detectAndResolveConflicts(
      aggregateId,
      aggregateType,
      conflictingEvents
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// ====================
// PROJECTION REBUILD ROUTES
// ====================

/**
 * POST /projections/:name/rebuild
 * Rebuild a CQRS projection
 */
router.post('/projections/:name/rebuild', async (req, res) => {
  try {
    const { name } = req.params;
    const {
      type = 'incremental',
      batchSize = 100,
      parallelWorkers = 1,
      fromEventId,
      fromTimestamp,
      toEventId,
      toTimestamp
    } = req.body;

    const options = {
      type,
      batchSize,
      parallelWorkers,
      fromEventId,
      fromTimestamp: fromTimestamp ? new Date(fromTimestamp) : undefined,
      toEventId,
      toTimestamp: toTimestamp ? new Date(toTimestamp) : undefined
    };

    const result = await enhancedCQRSService.rebuildProjection(name, options);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// ====================
// HEALTH MONITORING ROUTES
// ====================

/**
 * GET /projections/health/metrics
 * Get projection health metrics
 */
router.get('/projections/health/metrics', async (req, res) => {
  try {
    const { projectionId } = req.query;
    
    const result = await enhancedCQRSService.getProjectionHealthMetrics(
      projectionId as string
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * GET /projections/:name/health
 * Get specific projection health
 */
router.get('/projections/:name/health', async (req, res) => {
  try {
    const { name } = req.params;
    
    const projection = await enhancedCQRSService.getProjectionByName(name);
    if (!projection) {
      return res.status(404).json({
        success: false,
        error: `Projection '${name}' not found`,
        timestamp: new Date()
      });
    }

    const healthMetrics = await enhancedCQRSService.getProjectionHealthMetrics(projection.id);

    res.status(200).json({
      success: true,
      data: {
        projection: {
          id: projection.id,
          name: projection.projectionName,
          status: projection.projectionStatus,
          lagSeconds: projection.lagSeconds,
          errorCount: projection.errorCount,
          lastError: projection.lastError,
          lastUpdate: projection.lastEventTimestamp
        },
        healthHistory: healthMetrics.data || []
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// ====================
// CONSISTENCY STRATEGY ROUTES
// ====================

/**
 * POST /consistency/strong
 * Apply strong consistency strategy
 */
router.post('/consistency/strong', async (req, res) => {
  try {
    const {
      projectionName,
      data,
      timeout = 5000,
      retryAttempts = 3
    } = req.body;

    if (!projectionName || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectionName, data',
        timestamp: new Date()
      });
    }

    const result = await enhancedCQRSService.updateProjection(
      projectionName,
      data,
      undefined,
      { strategy: 'strong', timeout, retryAttempts }
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * POST /consistency/eventual
 * Apply eventual consistency strategy
 */
router.post('/consistency/eventual', async (req, res) => {
  try {
    const {
      projectionName,
      data,
      checkInterval = 1000
    } = req.body;

    if (!projectionName || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectionName, data',
        timestamp: new Date()
      });
    }

    const result = await enhancedCQRSService.updateProjection(
      projectionName,
      data,
      undefined,
      { strategy: 'eventual', checkInterval }
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * POST /consistency/causal
 * Apply causal consistency strategy
 */
router.post('/consistency/causal', async (req, res) => {
  try {
    const {
      projectionName,
      data,
      timeout = 3000
    } = req.body;

    if (!projectionName || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectionName, data',
        timestamp: new Date()
      });
    }

    const result = await enhancedCQRSService.updateProjection(
      projectionName,
      data,
      undefined,
      { strategy: 'causal', timeout }
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * POST /consistency/session
 * Apply session consistency strategy
 */
router.post('/consistency/session', async (req, res) => {
  try {
    const {
      projectionName,
      data,
      sessionId,
      timeout = 2000
    } = req.body;

    if (!projectionName || !data || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectionName, data, sessionId',
        timestamp: new Date()
      });
    }

    // Add sessionId to data for session consistency
    const dataWithSession = { ...data, sessionId };

    const result = await enhancedCQRSService.updateProjection(
      projectionName,
      dataWithSession,
      undefined,
      { strategy: 'session', timeout }
    );

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

// ====================
// TESTING & UTILITIES ROUTES
// ====================

/**
 * POST /test/generate-projections
 * Generate test projections for testing
 */
router.post('/test/generate-projections', async (req, res) => {
  try {
    const {
      count = 5,
      projectionType = 'read_model',
      aggregateType = 'test'
    } = req.body;

    const results = [];
    
    for (let i = 0; i < count; i++) {
      const result = await enhancedCQRSService.createProjection(
        `test-projection-${Date.now()}-${i}`,
        projectionType,
        aggregateType,
        { testData: `Test data ${i}`, timestamp: new Date() }
      );
      results.push(result);
    }

    res.status(200).json({
      success: true,
      data: results,
      message: `Generated ${count} test projections`,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * POST /test/generate-conflicts
 * Generate test conflicts for testing
 */
router.post('/test/generate-conflicts', async (req, res) => {
  try {
    const {
      count = 3,
      aggregateType = 'test'
    } = req.body;

    const results = [];
    
    for (let i = 0; i < count; i++) {
      const conflictingEvents = [
        {
          id: `event-${Date.now()}-${i}-1`,
          eventType: 'TestEvent',
          eventData: { value: `conflict-${i}-1` },
          timestamp: new Date()
        },
        {
          id: `event-${Date.now()}-${i}-2`,
          eventType: 'TestEvent',
          eventData: { value: `conflict-${i}-2` },
          timestamp: new Date()
        }
      ];

      const result = await enhancedCQRSService.detectAndResolveConflicts(
        `test-aggregate-${i}`,
        aggregateType,
        conflictingEvents
      );
      results.push(result);
    }

    res.status(200).json({
      success: true,
      data: results,
      message: `Generated ${count} test conflicts`,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

export default router;