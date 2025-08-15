/**
 * Service Database Separation API Routes - Phase 1 Week 2
 * RESTful API endpoints for managing service database separation
 * 
 * @fileoverview API routes for service database separation management
 * @author GetIt Platform Team
 * @version 1.0.0
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { serviceDatabaseManager } from '../services/database/ServiceDatabaseManager';
import { DatabaseSeparationOrchestrator } from '../services/database/DatabaseSeparationOrchestrator';

const router = express.Router();

// Initialize Database Separation Orchestrator
const separationOrchestrator = new DatabaseSeparationOrchestrator(serviceDatabaseManager);

// ================================
// SERVICE DATABASE HEALTH ENDPOINTS
// ================================

/**
 * GET /api/v1/service-database/health
 * Get health status of all service databases
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await serviceDatabaseManager.healthCheck();
    
    res.json({
      success: true,
      data: {
        health: healthStatus,
        timestamp: new Date().toISOString()
      },
      message: 'Service database health check completed'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/service-database/health/:serviceName
 * Get health status of specific service database
 */
router.get('/health/:serviceName', async (req, res) => {
  try {
    const { serviceName } = req.params;
    const healthStatus = await serviceDatabaseManager.healthCheck(serviceName);
    
    res.json({
      success: true,
      data: {
        health: healthStatus,
        service: serviceName,
        timestamp: new Date().toISOString()
      },
      message: `Health check completed for ${serviceName}`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// SERVICE DATABASE SEPARATION ENDPOINTS
// ================================

/**
 * POST /api/v1/service-database/separation/plan
 * Create separation plan for service databases
 */
router.post('/separation/plan', async (req, res) => {
  try {
    const { services, options } = req.body;
    
    const separationPlan = await separationOrchestrator.createSeparationPlan(
      services || ['user-service', 'product-service', 'order-service', 'analytics-service', 'notification-service'],
      options || {}
    );
    
    res.json({
      success: true,
      data: {
        plan: separationPlan,
        timestamp: new Date().toISOString()
      },
      message: 'Service database separation plan created successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/service-database/separation/execute
 * Execute service database separation
 */
router.post('/separation/execute', async (req, res) => {
  try {
    const { planId, dryRun } = req.body;
    
    const separationResult = await separationOrchestrator.executeSeparation(
      planId,
      dryRun || false
    );
    
    res.json({
      success: true,
      data: {
        result: separationResult,
        timestamp: new Date().toISOString()
      },
      message: dryRun ? 'Dry run completed successfully' : 'Service database separation executed successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/service-database/separation/status
 * Get status of ongoing separation processes
 */
router.get('/separation/status', async (req, res) => {
  try {
    const status = await separationOrchestrator.getSeparationStatus();
    
    res.json({
      success: true,
      data: {
        status,
        timestamp: new Date().toISOString()
      },
      message: 'Separation status retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/service-database/separation/status/:planId
 * Get status of specific separation plan
 */
router.get('/separation/status/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const status = await separationOrchestrator.getSeparationStatus(planId);
    
    res.json({
      success: true,
      data: {
        status,
        planId,
        timestamp: new Date().toISOString()
      },
      message: `Separation status for plan ${planId} retrieved successfully`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// DISTRIBUTED TRANSACTION ENDPOINTS
// ================================

/**
 * POST /api/v1/service-database/transaction/begin
 * Begin distributed transaction using saga pattern
 */
router.post('/transaction/begin', async (req, res) => {
  try {
    const transactionId = uuidv4();
    const saga = await serviceDatabaseManager.beginSagaTransaction(transactionId);
    
    res.json({
      success: true,
      data: {
        transactionId,
        timestamp: new Date().toISOString()
      },
      message: 'Distributed transaction started successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/service-database/transaction/commit
 * Commit distributed transaction
 */
router.post('/transaction/commit', async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const committed = await serviceDatabaseManager.commitSagaTransaction(transactionId);
    
    res.json({
      success: true,
      data: {
        transactionId,
        committed,
        timestamp: new Date().toISOString()
      },
      message: 'Distributed transaction committed successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/service-database/transaction/rollback
 * Rollback distributed transaction
 */
router.post('/transaction/rollback', async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const rolledBack = await serviceDatabaseManager.rollbackSagaTransaction(transactionId);
    
    res.json({
      success: true,
      data: {
        transactionId,
        rolledBack,
        timestamp: new Date().toISOString()
      },
      message: 'Distributed transaction rolled back successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// PERFORMANCE MONITORING ENDPOINTS
// ================================

/**
 * GET /api/v1/service-database/performance/metrics
 * Get performance metrics for all service databases
 */
router.get('/performance/metrics', async (req, res) => {
  try {
    const metrics = await serviceDatabaseManager.getPerformanceMetrics();
    
    res.json({
      success: true,
      data: {
        metrics,
        timestamp: new Date().toISOString()
      },
      message: 'Performance metrics retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/service-database/performance/analysis
 * Get performance analysis and recommendations
 */
router.get('/performance/analysis', async (req, res) => {
  try {
    const analysis = await separationOrchestrator.getPerformanceAnalysis();
    
    res.json({
      success: true,
      data: {
        analysis,
        timestamp: new Date().toISOString()
      },
      message: 'Performance analysis completed successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// SCHEMA MANAGEMENT ENDPOINTS
// ================================

/**
 * GET /api/v1/service-database/schema/differences
 * Get schema differences between services
 */
router.get('/schema/differences', async (req, res) => {
  try {
    const differences = await separationOrchestrator.analyzeSchemaDifferences();
    
    res.json({
      success: true,
      data: {
        differences,
        timestamp: new Date().toISOString()
      },
      message: 'Schema differences analysis completed successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/service-database/schema/migrate
 * Execute schema migration for specific service
 */
router.post('/schema/migrate', async (req, res) => {
  try {
    const { serviceName, migrationSql, dryRun } = req.body;
    
    if (!serviceName || !migrationSql) {
      return res.status(400).json({
        success: false,
        error: 'Service name and migration SQL are required',
        timestamp: new Date().toISOString()
      });
    }
    
    if (dryRun) {
      // Validate migration SQL without executing
      const validation = await separationOrchestrator.validateMigrationSql(serviceName, migrationSql);
      
      res.json({
        success: true,
        data: {
          validation,
          dryRun: true,
          timestamp: new Date().toISOString()
        },
        message: 'Migration SQL validation completed successfully'
      });
    } else {
      await serviceDatabaseManager.executeMigration(serviceName, migrationSql);
      
      res.json({
        success: true,
        data: {
          serviceName,
          migrationExecuted: true,
          timestamp: new Date().toISOString()
        },
        message: `Schema migration executed successfully for ${serviceName}`
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ================================
// DASHBOARD ENDPOINTS
// ================================

/**
 * GET /api/v1/service-database/dashboard
 * Get comprehensive dashboard data for service databases
 */
router.get('/dashboard', async (req, res) => {
  try {
    const dashboardData = await separationOrchestrator.getDashboardData();
    
    res.json({
      success: true,
      data: {
        dashboard: dashboardData,
        timestamp: new Date().toISOString()
      },
      message: 'Dashboard data retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/service-database/dashboard/realtime
 * Get real-time dashboard data for service databases
 */
router.get('/dashboard/realtime', async (req, res) => {
  try {
    const realtimeData = await separationOrchestrator.getRealtimeDashboardData();
    
    res.json({
      success: true,
      data: {
        realtime: realtimeData,
        timestamp: new Date().toISOString()
      },
      message: 'Real-time dashboard data retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;