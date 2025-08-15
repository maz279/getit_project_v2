/**
 * Event Sourcing API Routes - Phase 3 Week 9-10
 * Complete API endpoints for enhanced event sourcing with schema versioning
 * 
 * @version 1.0.0
 * @author GetIt Platform Team
 * @since 2025-07-15
 */

import express from 'express';
import { EnhancedEventSourcingService } from '../services/event-sourcing/EnhancedEventSourcingService';
import { SchemaRegistryService } from '../services/event-sourcing/SchemaRegistryService';
import { EventReplayService } from '../services/event-sourcing/EventReplayService';
import { z } from 'zod';

const router = express.Router();

// Initialize services
const eventSourcingService = new EnhancedEventSourcingService();
const schemaRegistryService = new SchemaRegistryService();
const eventReplayService = new EventReplayService();

// Validation schemas
const storeEventSchema = z.object({
  aggregateId: z.string().min(1),
  aggregateType: z.string().min(1),
  eventType: z.enum(['UserCreated', 'UserUpdated', 'UserDeleted', 'UserVerified', 'UserLoggedIn', 'UserLoggedOut',
    'OrderCreated', 'OrderPaid', 'OrderShipped', 'OrderDelivered', 'OrderCancelled', 'OrderReturned',
    'ProductCreated', 'ProductUpdated', 'ProductDeleted', 'InventoryChanged', 'ProductPriceChanged',
    'PaymentInitiated', 'PaymentCompleted', 'PaymentFailed', 'PaymentRefunded', 'PaymentCancelled',
    'VendorCreated', 'VendorUpdated', 'VendorVerified', 'VendorSuspended',
    'SystemMaintenance', 'SystemUpgrade', 'SystemAlert']),
  eventDomain: z.enum(['user', 'order', 'product', 'payment', 'vendor', 'system']),
  eventVersion: z.string().default('1.0.0'),
  eventData: z.object({}).passthrough(),
  eventMetadata: z.object({}).passthrough().optional(),
  eventSchemaVersion: z.string().default('1.0.0'),
  userId: z.number().optional(),
  correlationId: z.string().optional(),
  causationId: z.string().optional()
});

const registerSchemaSchema = z.object({
  schemaName: z.string().min(1),
  schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be valid semantic version'),
  schemaDefinition: z.object({
    type: z.string(),
    properties: z.object({}).passthrough(),
    required: z.array(z.string()).optional(),
    additionalProperties: z.boolean().optional(),
    version: z.string()
  }),
  documentation: z.string().optional(),
  validationRules: z.object({}).passthrough().optional(),
  migrationScript: z.string().optional()
});

const replayOptionsSchema = z.object({
  aggregateId: z.string().optional(),
  aggregateType: z.string().optional(),
  eventDomain: z.enum(['user', 'order', 'product', 'payment', 'vendor', 'system']).optional(),
  eventTypes: z.array(z.string()).optional(),
  fromTimestamp: z.string().transform(str => new Date(str)),
  toTimestamp: z.string().transform(str => new Date(str)),
  parallelWorkers: z.number().min(1).max(8).optional(),
  batchSize: z.number().min(1).max(1000).optional(),
  priority: z.number().min(1).max(10).optional(),
  useSnapshots: z.boolean().optional(),
  validationMode: z.enum(['strict', 'lenient', 'none']).optional(),
  dryRun: z.boolean().optional(),
  includeMetadata: z.boolean().optional(),
  maxRetries: z.number().min(0).max(10).optional(),
  retryDelay: z.number().min(100).optional()
});

const snapshotConfigSchema = z.object({
  aggregateId: z.string().min(1),
  aggregateType: z.string().min(1),
  compressionType: z.enum(['none', 'gzip', 'brotli']).optional(),
  includeMetadata: z.boolean().optional(),
  retentionDays: z.number().min(1).optional()
});

/**
 * ===========================================
 * EVENT STORE ENDPOINTS
 * ===========================================
 */

/**
 * POST /api/v1/event-sourcing/events
 * Store a new event in the event store
 */
router.post('/events', async (req, res) => {
  try {
    const eventData = storeEventSchema.parse(req.body);
    const storedEvent = await eventSourcingService.storeEvent(eventData);
    
    res.status(201).json({
      success: true,
      message: 'Event stored successfully',
      data: storedEvent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error storing event:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to store event',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/event-sourcing/events
 * Retrieve events with filtering and pagination
 */
router.get('/events', async (req, res) => {
  try {
    const filters = {
      aggregateId: req.query.aggregateId as string,
      aggregateType: req.query.aggregateType as string,
      eventDomain: req.query.eventDomain as string,
      eventType: req.query.eventType as string,
      fromTimestamp: req.query.fromTimestamp ? new Date(req.query.fromTimestamp as string) : undefined,
      toTimestamp: req.query.toTimestamp ? new Date(req.query.toTimestamp as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      orderBy: req.query.orderBy as 'timestamp' | 'sequenceNumber' || 'timestamp',
      orderDirection: req.query.orderDirection as 'asc' | 'desc' || 'desc'
    };

    const events = await eventSourcingService.getEvents(filters);
    
    res.json({
      success: true,
      message: 'Events retrieved successfully',
      data: events,
      count: events.length,
      filters: filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to retrieve events',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/event-sourcing/events/metrics
 * Get comprehensive event sourcing metrics
 */
router.get('/events/metrics', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as '24h' | '7d' | '30d' || '24h';
    const metrics = await eventSourcingService.getEventSourcingMetrics(timeRange);
    
    res.json({
      success: true,
      message: 'Event sourcing metrics retrieved successfully',
      data: metrics,
      timeRange,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * ===========================================
 * SNAPSHOT ENDPOINTS
 * ===========================================
 */

/**
 * POST /api/v1/event-sourcing/snapshots
 * Create a snapshot for an aggregate
 */
router.post('/snapshots', async (req, res) => {
  try {
    const config = snapshotConfigSchema.parse(req.body);
    const snapshot = await eventSourcingService.createSnapshot(config);
    
    res.status(201).json({
      success: true,
      message: 'Snapshot created successfully',
      data: snapshot,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create snapshot',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * ===========================================
 * SCHEMA REGISTRY ENDPOINTS
 * ===========================================
 */

/**
 * POST /api/v1/event-sourcing/schemas
 * Register a new schema in the schema registry
 */
router.post('/schemas', async (req, res) => {
  try {
    const schemaData = registerSchemaSchema.parse(req.body);
    const registeredSchema = await schemaRegistryService.registerSchema({
      ...schemaData,
      createdBy: 1 // System user
    });
    
    res.status(201).json({
      success: true,
      message: 'Schema registered successfully',
      data: registeredSchema,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error registering schema:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to register schema',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/event-sourcing/schemas/:schemaName
 * Get schema by name (latest version or specific version)
 */
router.get('/schemas/:schemaName', async (req, res) => {
  try {
    const { schemaName } = req.params;
    const version = req.query.version as string;
    
    const schema = await schemaRegistryService.getSchema(schemaName, version);
    
    if (!schema) {
      return res.status(404).json({
        success: false,
        message: 'Schema not found',
        schemaName,
        version,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Schema retrieved successfully',
      data: schema,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving schema:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve schema',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/event-sourcing/schemas/:schemaName/validate
 * Validate data against a schema
 */
router.post('/schemas/:schemaName/validate', async (req, res) => {
  try {
    const { schemaName } = req.params;
    const { data, schemaVersion } = req.body;
    
    const validationResult = await schemaRegistryService.validateDataAgainstSchema(
      schemaName, 
      data, 
      schemaVersion
    );
    
    res.json({
      success: true,
      message: 'Schema validation completed',
      data: validationResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error validating schema:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to validate schema',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/event-sourcing/schemas/:schemaName/versions
 * Get all versions of a schema
 */
router.get('/schemas/:schemaName/versions', async (req, res) => {
  try {
    const { schemaName } = req.params;
    const versions = await schemaRegistryService.getSchemaVersions(schemaName);
    
    res.json({
      success: true,
      message: 'Schema versions retrieved successfully',
      data: versions,
      count: versions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving schema versions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve schema versions',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/event-sourcing/schemas/:schemaName/evolve
 * Evolve schema to new version
 */
router.post('/schemas/:schemaName/evolve', async (req, res) => {
  try {
    const { schemaName } = req.params;
    const { newVersion, newDefinition, migrationScript } = req.body;
    
    const evolutionPlan = await schemaRegistryService.evolveSchema(
      schemaName,
      newVersion,
      newDefinition,
      migrationScript
    );
    
    res.json({
      success: true,
      message: 'Schema evolution plan created',
      data: evolutionPlan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error evolving schema:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to evolve schema',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * PATCH /api/v1/event-sourcing/schemas/:schemaName/deprecate
 * Deprecate a schema version
 */
router.patch('/schemas/:schemaName/deprecate', async (req, res) => {
  try {
    const { schemaName } = req.params;
    const { version, reason } = req.body;
    
    await schemaRegistryService.deprecateSchema(schemaName, version, reason);
    
    res.json({
      success: true,
      message: 'Schema deprecated successfully',
      schemaName,
      version,
      reason,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deprecating schema:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to deprecate schema',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/event-sourcing/schemas/metrics
 * Get schema registry metrics
 */
router.get('/schemas/metrics', async (req, res) => {
  try {
    const metrics = await schemaRegistryService.getSchemaRegistryMetrics();
    
    res.json({
      success: true,
      message: 'Schema registry metrics retrieved successfully',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving schema metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve schema metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * ===========================================
 * EVENT REPLAY ENDPOINTS
 * ===========================================
 */

/**
 * POST /api/v1/event-sourcing/replay
 * Start an event replay job
 */
router.post('/replay', async (req, res) => {
  try {
    const options = replayOptionsSchema.parse(req.body);
    const replayJob = await eventReplayService.startReplay(options);
    
    res.status(201).json({
      success: true,
      message: 'Event replay job started',
      data: replayJob,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting replay:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to start replay',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/event-sourcing/replay/:jobId/progress
 * Get replay job progress
 */
router.get('/replay/:jobId/progress', async (req, res) => {
  try {
    const { jobId } = req.params;
    const progress = await eventReplayService.getReplayProgress(jobId);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Replay job not found',
        jobId,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Replay progress retrieved successfully',
      data: progress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving replay progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve replay progress',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/event-sourcing/replay/:jobId/result
 * Get replay job result
 */
router.get('/replay/:jobId/result', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await eventReplayService.getReplayResult(jobId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Replay result not found or job not completed',
        jobId,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Replay result retrieved successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error retrieving replay result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve replay result',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * DELETE /api/v1/event-sourcing/replay/:jobId
 * Cancel a replay job
 */
router.delete('/replay/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const cancelled = await eventReplayService.cancelReplay(jobId);
    
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: 'Replay job not found or cannot be cancelled',
        jobId,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Replay job cancelled successfully',
      jobId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cancelling replay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel replay',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/event-sourcing/replay/point-in-time
 * Replay events to a specific point in time
 */
router.post('/replay/point-in-time', async (req, res) => {
  try {
    const { aggregateId, aggregateType, targetTimestamp, options } = req.body;
    
    const aggregateState = await eventReplayService.replayToPointInTime(
      aggregateId,
      aggregateType,
      new Date(targetTimestamp),
      options
    );
    
    res.json({
      success: true,
      message: 'Point-in-time replay completed successfully',
      data: aggregateState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in point-in-time replay:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to perform point-in-time replay',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/event-sourcing/replay/:jobId/validate
 * Validate replay results
 */
router.post('/replay/:jobId/validate', async (req, res) => {
  try {
    const { jobId } = req.params;
    const validation = await eventReplayService.validateReplay(jobId);
    
    res.json({
      success: true,
      message: 'Replay validation completed',
      data: validation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error validating replay:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to validate replay',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * ===========================================
 * HEALTH AND STATUS ENDPOINTS
 * ===========================================
 */

/**
 * GET /api/v1/event-sourcing/health
 * Get event sourcing system health
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      services: {
        eventSourcing: 'operational',
        schemaRegistry: 'operational',
        eventReplay: 'operational'
      },
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Event sourcing system is healthy',
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * ===========================================
 * DEVELOPMENT AND TESTING ENDPOINTS
 * ===========================================
 */

/**
 * POST /api/v1/event-sourcing/test/generate-events
 * Generate test events for development and testing
 */
router.post('/test/generate-events', async (req, res) => {
  try {
    const { count = 10, eventType = 'UserCreated', domain = 'user' } = req.body;
    
    const generatedEvents = [];
    for (let i = 0; i < count; i++) {
      const testEvent = {
        aggregateId: `test-aggregate-${i}`,
        aggregateType: 'TestAggregate',
        eventType: eventType as any,
        eventDomain: domain as any,
        eventVersion: '1.0.0',
        eventData: {
          testId: i,
          testData: `Test data ${i}`,
          timestamp: new Date().toISOString()
        },
        eventMetadata: {
          source: 'test-generator',
          testRun: true
        },
        eventSchemaVersion: '1.0.0',
        userId: 1
      };
      
      const storedEvent = await eventSourcingService.storeEvent(testEvent);
      generatedEvents.push(storedEvent);
    }
    
    res.json({
      success: true,
      message: `Generated ${count} test events`,
      data: {
        count: generatedEvents.length,
        events: generatedEvents
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating test events:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to generate test events',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;