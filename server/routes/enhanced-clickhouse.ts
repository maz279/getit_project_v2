/**
 * Enhanced ClickHouse Analytics API Routes
 * Phase 4 Week 13-14: Advanced Analytics Pipeline
 * 
 * Comprehensive API endpoints for:
 * - Real-time data ingestion
 * - Stream processing management
 * - Batch processing operations
 * - Query optimization
 * - Data retention management
 * 
 * Investment: $50,000 Enhanced Analytics Pipeline
 */

import { Router } from 'express';
import { EnhancedClickHouseService } from '../services/analytics/EnhancedClickHouseService';

const router = Router();
const enhancedClickHouseService = new EnhancedClickHouseService();

// ====================
// HEALTH & STATUS ENDPOINTS
// ====================

/**
 * GET /api/v1/enhanced-clickhouse/health
 * Get service health status
 */
router.get('/health', async (req, res) => {
  try {
    const health = await enhancedClickHouseService.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/enhanced-clickhouse/metrics
 * Get analytics metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await enhancedClickHouseService.getAnalyticsMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ====================
// DATA INGESTION ENDPOINTS
// ====================

/**
 * POST /api/v1/enhanced-clickhouse/ingest
 * Ingest real-time event data
 */
router.post('/ingest', async (req, res) => {
  try {
    const { topic, event } = req.body;
    
    if (!topic || !event) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: topic, event'
      });
    }
    
    const result = await enhancedClickHouseService.ingestRealTimeEvent(topic, event);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/enhanced-clickhouse/ingest/batch
 * Ingest batch of events
 */
router.post('/ingest/batch', async (req, res) => {
  try {
    const { topic, events } = req.body;
    
    if (!topic || !Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: topic (string), events (array)'
      });
    }
    
    const results = await Promise.all(
      events.map(event => enhancedClickHouseService.ingestRealTimeEvent(topic, event))
    );
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.status(201).json({
      success: true,
      batchResults: {
        total: events.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/enhanced-clickhouse/dead-letter-queue
 * Get dead letter queue events
 */
router.get('/dead-letter-queue', async (req, res) => {
  try {
    const result = await enhancedClickHouseService.getDeadLetterQueue();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ====================
// BATCH PROCESSING ENDPOINTS
// ====================

/**
 * POST /api/v1/enhanced-clickhouse/batch/hourly
 * Process hourly batch
 */
router.post('/batch/hourly', async (req, res) => {
  try {
    const result = await enhancedClickHouseService.processHourlyBatch();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/enhanced-clickhouse/batch/daily
 * Process daily aggregations
 */
router.post('/batch/daily', async (req, res) => {
  try {
    const result = await enhancedClickHouseService.processDailyAggregations();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/v1/enhanced-clickhouse/batch/weekly
 * Process weekly business intelligence reports
 */
router.post('/batch/weekly', async (req, res) => {
  try {
    const result = await enhancedClickHouseService.processWeeklyReports();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ====================
// QUERY OPTIMIZATION ENDPOINTS
// ====================

/**
 * POST /api/v1/enhanced-clickhouse/query/optimize
 * Optimize and execute query
 */
router.post('/query/optimize', async (req, res) => {
  try {
    const { query, parameters } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: query'
      });
    }
    
    const result = await enhancedClickHouseService.optimizeQuery(query, parameters);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ====================
// DATA RETENTION ENDPOINTS
// ====================

/**
 * POST /api/v1/enhanced-clickhouse/retention/enforce
 * Enforce data retention policies
 */
router.post('/retention/enforce', async (req, res) => {
  try {
    const result = await enhancedClickHouseService.enforceDataRetentionPolicies();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ====================
// TESTING ENDPOINTS
// ====================

/**
 * POST /api/v1/enhanced-clickhouse/test/generate-events
 * Generate test events for validation
 */
router.post('/test/generate-events', async (req, res) => {
  try {
    const { count = 100, eventType = 'user-event' } = req.body;
    
    const events = [];
    for (let i = 0; i < count; i++) {
      const event = {
        id: `test-event-${Date.now()}-${i}`,
        eventType,
        sourceSystem: 'test-system',
        timestamp: new Date(),
        data: {
          userId: `user-${i}`,
          action: 'test-action',
          metadata: {
            testIndex: i,
            testBatch: 'phase-4-week-13-14'
          }
        }
      };
      
      const result = await enhancedClickHouseService.ingestRealTimeEvent('test-events', event);
      events.push({
        event: event.id,
        success: result.success
      });
    }
    
    res.json({
      success: true,
      eventsGenerated: count,
      eventType,
      results: events,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/enhanced-clickhouse/test/system-status
 * Get comprehensive system status for testing
 */
router.get('/test/system-status', async (req, res) => {
  try {
    const health = await enhancedClickHouseService.getHealth();
    const metrics = await enhancedClickHouseService.getAnalyticsMetrics();
    const deadLetterQueue = await enhancedClickHouseService.getDeadLetterQueue();
    
    res.json({
      success: true,
      systemStatus: {
        health: health.status,
        services: health.services,
        metrics: metrics.metrics,
        deadLetterQueueSize: deadLetterQueue.totalCount
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;