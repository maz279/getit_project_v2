/**
 * PHASE 3 WEEK 9-10 EVENT SOURCING COMPREHENSIVE TEST SUITE
 * Complete validation of Enhanced Event Sourcing with Schema Versioning
 * 
 * Tests:
 * 1. ✅ Event Store Operations (store, retrieve, filter events)
 * 2. ✅ Schema Registry Operations (register, validate, evolve schemas)
 * 3. ✅ Event Replay Operations (start, track, validate replays)
 * 4. ✅ Snapshots Operations (create, retrieve snapshots)
 * 5. ✅ Metrics and Health Monitoring
 * 6. ✅ Schema Evolution and Migration
 * 7. ✅ Event Validation and Consistency
 * 8. ✅ Performance and Optimization
 * 9. ✅ Error Handling and Edge Cases
 * 10. ✅ Integration and End-to-End Tests
 * 
 * @version 1.0.0
 * @author GetIt Platform Team
 * @since 2025-07-15
 */

import axios from 'axios';

// Test configuration
const BASE_URL = 'http://localhost:5000';
const API_PREFIX = '/api/v1/event-sourcing';

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  testGroups: {},
  startTime: Date.now()
};

// Test helper functions
function createTestResult(testName, groupName, success, details = null, error = null) {
  testResults.total++;
  
  if (!testResults.testGroups[groupName]) {
    testResults.testGroups[groupName] = { passed: 0, failed: 0, tests: [] };
  }
  
  const result = {
    name: testName,
    success,
    details,
    error: error?.message || error,
    timestamp: new Date().toISOString()
  };
  
  testResults.testGroups[groupName].tests.push(result);
  
  if (success) {
    testResults.passed++;
    testResults.testGroups[groupName].passed++;
    console.log(`✅ ${testName}`);
    if (details) console.log(`   ${details}`.gray);
  } else {
    testResults.failed++;
    testResults.testGroups[groupName].failed++;
    console.log(`❌ ${testName}`);
    if (error) console.log(`   Error: ${error}`);
  }
}

// HTTP client helper
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${API_PREFIX}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 0 
    };
  }
}

// Test data generators
function generateTestEvent(eventType = 'UserCreated', domain = 'user', overrides = {}) {
  return {
    aggregateId: `test-aggregate-${Date.now()}`,
    aggregateType: 'TestAggregate',
    eventType,
    eventDomain: domain,
    eventVersion: '1.0.0',
    eventData: {
      userId: 123,
      username: 'testuser',
      email: 'test@example.com',
      timestamp: new Date().toISOString(),
      ...overrides
    },
    eventMetadata: {
      source: 'test-suite',
      testRun: true,
      correlationId: `test-correlation-${Date.now()}`
    },
    eventSchemaVersion: '1.0.0',
    userId: 1,
    ...overrides
  };
}

function generateTestSchema(name, version = '1.0.0') {
  return {
    schemaName: name,
    schemaVersion: version,
    schemaDefinition: {
      type: 'object',
      properties: {
        aggregateId: { type: 'string' },
        aggregateType: { type: 'string' },
        eventData: {
          type: 'object',
          properties: {
            userId: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' }
          }
        }
      },
      required: ['aggregateId', 'aggregateType', 'eventData'],
      version
    },
    documentation: `Test schema for ${name}`,
    validationRules: {
      strict: true,
      allowAdditional: false
    }
  };
}

// Test Suite Functions
async function testEventStoreOperations() {
  console.log('\n🧪 Testing Event Store Operations');
  
  // Test 1: Store a single event
  const testEvent = generateTestEvent('UserCreated', 'user');
  const storeResult = await makeRequest('POST', '/events', testEvent);
  
  createTestResult(
    'Store single event',
    'Event Store',
    storeResult.success && storeResult.data.success,
    storeResult.success ? `Event stored with ID: ${storeResult.data.data.id}` : null,
    storeResult.error
  );
  
  let storedEventId = null;
  if (storeResult.success && storeResult.data.data) {
    storedEventId = storeResult.data.data.id;
  }
  
  // Test 2: Store multiple events
  const multipleEvents = [
    generateTestEvent('UserCreated', 'user'),
    generateTestEvent('UserUpdated', 'user'),
    generateTestEvent('OrderCreated', 'order'),
    generateTestEvent('ProductCreated', 'product')
  ];
  
  const multipleStoreResults = await Promise.all(
    multipleEvents.map(event => makeRequest('POST', '/events', event))
  );
  
  const allMultipleSuccessful = multipleStoreResults.every(result => result.success);
  createTestResult(
    'Store multiple events',
    'Event Store',
    allMultipleSuccessful,
    allMultipleSuccessful ? `Stored ${multipleEvents.length} events successfully` : null,
    allMultipleSuccessful ? null : 'Some events failed to store'
  );
  
  // Test 3: Retrieve events without filters
  const allEventsResult = await makeRequest('GET', '/events');
  createTestResult(
    'Retrieve all events',
    'Event Store',
    allEventsResult.success && allEventsResult.data.success,
    allEventsResult.success ? `Retrieved ${allEventsResult.data.data.length} events` : null,
    allEventsResult.error
  );
  
  // Test 4: Retrieve events with filters
  const filteredResult = await makeRequest('GET', '/events?eventDomain=user&limit=10');
  createTestResult(
    'Retrieve events with filters',
    'Event Store',
    filteredResult.success && filteredResult.data.success,
    filteredResult.success ? `Retrieved ${filteredResult.data.data.length} user events` : null,
    filteredResult.error
  );
  
  // Test 5: Retrieve events with pagination
  const paginatedResult = await makeRequest('GET', '/events?limit=5&offset=0');
  createTestResult(
    'Retrieve events with pagination',
    'Event Store',
    paginatedResult.success && paginatedResult.data.success,
    paginatedResult.success ? `Retrieved ${paginatedResult.data.data.length} events with pagination` : null,
    paginatedResult.error
  );
  
  // Test 6: Retrieve events with date range
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const dateRangeResult = await makeRequest('GET', `/events?fromTimestamp=${yesterday}&toTimestamp=${tomorrow}`);
  createTestResult(
    'Retrieve events with date range',
    'Event Store',
    dateRangeResult.success && dateRangeResult.data.success,
    dateRangeResult.success ? `Retrieved ${dateRangeResult.data.data.length} events in date range` : null,
    dateRangeResult.error
  );
  
  // Test 7: Get event metrics
  const metricsResult = await makeRequest('GET', '/events/metrics');
  createTestResult(
    'Get event sourcing metrics',
    'Event Store',
    metricsResult.success && metricsResult.data.success,
    metricsResult.success ? `Total events: ${metricsResult.data.data.totalEvents}` : null,
    metricsResult.error
  );
  
  // Test 8: Test event validation (invalid event)
  const invalidEvent = {
    ...generateTestEvent('UserCreated', 'user'),
    aggregateId: '', // Invalid: empty aggregateId
    eventData: null // Invalid: null eventData
  };
  
  const invalidResult = await makeRequest('POST', '/events', invalidEvent);
  createTestResult(
    'Reject invalid event',
    'Event Store',
    !invalidResult.success, // Should fail
    !invalidResult.success ? 'Invalid event correctly rejected' : null,
    invalidResult.success ? 'Invalid event was incorrectly accepted' : null
  );
  
  return storedEventId;
}

async function testSchemaRegistryOperations() {
  console.log('\n🧪 Testing Schema Registry Operations');
  
  // Test 1: Register a new schema
  const testSchema = generateTestSchema('test_UserCreated', '1.0.0');
  const registerResult = await makeRequest('POST', '/schemas', testSchema);
  
  createTestResult(
    'Register new schema',
    'Schema Registry',
    registerResult.success && registerResult.data.success,
    registerResult.success ? `Schema registered: ${testSchema.schemaName}` : null,
    registerResult.error
  );
  
  // Test 2: Retrieve registered schema
  const retrieveResult = await makeRequest('GET', `/schemas/${testSchema.schemaName}`);
  createTestResult(
    'Retrieve registered schema',
    'Schema Registry',
    retrieveResult.success && retrieveResult.data.success,
    retrieveResult.success ? `Retrieved schema: ${retrieveResult.data.data.schemaName}` : null,
    retrieveResult.error
  );
  
  // Test 3: Validate data against schema
  const validationData = {
    data: {
      aggregateId: 'test-123',
      aggregateType: 'TestAggregate',
      eventData: {
        userId: 123,
        username: 'testuser',
        email: 'test@example.com'
      }
    }
  };
  
  const validationResult = await makeRequest('POST', `/schemas/${testSchema.schemaName}/validate`, validationData);
  createTestResult(
    'Validate data against schema',
    'Schema Registry',
    validationResult.success && validationResult.data.success,
    validationResult.success ? `Validation result: ${validationResult.data.data.isValid}` : null,
    validationResult.error
  );
  
  // Test 4: Get schema versions
  const versionsResult = await makeRequest('GET', `/schemas/${testSchema.schemaName}/versions`);
  createTestResult(
    'Get schema versions',
    'Schema Registry',
    versionsResult.success && versionsResult.data.success,
    versionsResult.success ? `Found ${versionsResult.data.data.length} versions` : null,
    versionsResult.error
  );
  
  // Test 5: Evolve schema
  const evolutionData = {
    newVersion: '1.1.0',
    newDefinition: {
      ...testSchema.schemaDefinition,
      properties: {
        ...testSchema.schemaDefinition.properties,
        eventData: {
          ...testSchema.schemaDefinition.properties.eventData,
          properties: {
            ...testSchema.schemaDefinition.properties.eventData.properties,
            newField: { type: 'string' }
          }
        }
      },
      version: '1.1.0'
    },
    migrationScript: 'ALTER TABLE events ADD COLUMN new_field VARCHAR(255);'
  };
  
  const evolveResult = await makeRequest('POST', `/schemas/${testSchema.schemaName}/evolve`, evolutionData);
  createTestResult(
    'Evolve schema version',
    'Schema Registry',
    evolveResult.success && evolveResult.data.success,
    evolveResult.success ? `Evolution plan created for ${evolveResult.data.data.targetVersion}` : null,
    evolveResult.error
  );
  
  // Test 6: Deprecate schema
  const deprecateData = {
    version: '1.0.0',
    reason: 'Replaced by version 1.1.0'
  };
  
  const deprecateResult = await makeRequest('PATCH', `/schemas/${testSchema.schemaName}/deprecate`, deprecateData);
  createTestResult(
    'Deprecate schema version',
    'Schema Registry',
    deprecateResult.success && deprecateResult.data.success,
    deprecateResult.success ? 'Schema deprecated successfully' : null,
    deprecateResult.error
  );
  
  // Test 7: Get schema metrics
  const schemaMetricsResult = await makeRequest('GET', '/schemas/metrics');
  createTestResult(
    'Get schema registry metrics',
    'Schema Registry',
    schemaMetricsResult.success && schemaMetricsResult.data.success,
    schemaMetricsResult.success ? `Total schemas: ${schemaMetricsResult.data.data.totalSchemas}` : null,
    schemaMetricsResult.error
  );
  
  // Test 8: Test schema validation (invalid schema)
  const invalidSchema = {
    schemaName: 'invalid_schema',
    schemaVersion: 'invalid-version', // Invalid semantic version
    schemaDefinition: {
      type: 'invalid_type' // Invalid type
    }
  };
  
  const invalidSchemaResult = await makeRequest('POST', '/schemas', invalidSchema);
  createTestResult(
    'Reject invalid schema',
    'Schema Registry',
    !invalidSchemaResult.success, // Should fail
    !invalidSchemaResult.success ? 'Invalid schema correctly rejected' : null,
    invalidSchemaResult.success ? 'Invalid schema was incorrectly accepted' : null
  );
  
  return testSchema.schemaName;
}

async function testEventReplayOperations() {
  console.log('\n🧪 Testing Event Replay Operations');
  
  // Test 1: Start event replay
  const replayOptions = {
    eventDomain: 'user',
    fromTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    toTimestamp: new Date().toISOString(),
    parallelWorkers: 2,
    batchSize: 10,
    priority: 5,
    dryRun: false
  };
  
  const replayResult = await makeRequest('POST', '/replay', replayOptions);
  createTestResult(
    'Start event replay',
    'Event Replay',
    replayResult.success && replayResult.data.success,
    replayResult.success ? `Replay job started: ${replayResult.data.data.id}` : null,
    replayResult.error
  );
  
  let replayJobId = null;
  if (replayResult.success && replayResult.data.data) {
    replayJobId = replayResult.data.data.id;
  }
  
  // Test 2: Get replay progress
  if (replayJobId) {
    // Wait a moment for replay to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const progressResult = await makeRequest('GET', `/replay/${replayJobId}/progress`);
    createTestResult(
      'Get replay progress',
      'Event Replay',
      progressResult.success && progressResult.data.success,
      progressResult.success ? `Progress: ${progressResult.data.data.progressPercentage}%` : null,
      progressResult.error
    );
  }
  
  // Test 3: Point-in-time replay
  const pointInTimeData = {
    aggregateId: 'test-aggregate-123',
    aggregateType: 'TestAggregate',
    targetTimestamp: new Date().toISOString(),
    options: {
      useSnapshots: true,
      includeMetadata: true
    }
  };
  
  const pointInTimeResult = await makeRequest('POST', '/replay/point-in-time', pointInTimeData);
  createTestResult(
    'Point-in-time replay',
    'Event Replay',
    pointInTimeResult.success && pointInTimeResult.data.success,
    pointInTimeResult.success ? `Aggregate state reconstructed at ${pointInTimeData.targetTimestamp}` : null,
    pointInTimeResult.error
  );
  
  // Test 4: Get replay result (if job completed)
  if (replayJobId) {
    // Wait for replay to potentially complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const resultResult = await makeRequest('GET', `/replay/${replayJobId}/result`);
    createTestResult(
      'Get replay result',
      'Event Replay',
      resultResult.success, // May not be completed yet
      resultResult.success ? `Replay result retrieved` : 'Replay may still be in progress',
      resultResult.error
    );
  }
  
  // Test 5: Validate replay
  if (replayJobId) {
    const validateResult = await makeRequest('POST', `/replay/${replayJobId}/validate`);
    createTestResult(
      'Validate replay results',
      'Event Replay',
      validateResult.success && validateResult.data.success,
      validateResult.success ? `Validation completed with integrity score: ${validateResult.data.data.integrityScore}` : null,
      validateResult.error
    );
  }
  
  // Test 6: Cancel replay (test with a new job)
  const cancelReplayOptions = {
    eventDomain: 'order',
    fromTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    toTimestamp: new Date().toISOString(),
    parallelWorkers: 1,
    batchSize: 5,
    dryRun: true
  };
  
  const cancelReplayResult = await makeRequest('POST', '/replay', cancelReplayOptions);
  if (cancelReplayResult.success && cancelReplayResult.data.data) {
    const cancelJobId = cancelReplayResult.data.data.id;
    
    // Wait a moment and then cancel
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cancelResult = await makeRequest('DELETE', `/replay/${cancelJobId}`);
    createTestResult(
      'Cancel replay job',
      'Event Replay',
      cancelResult.success && cancelResult.data.success,
      cancelResult.success ? `Replay job cancelled: ${cancelJobId}` : null,
      cancelResult.error
    );
  }
  
  // Test 7: Test invalid replay options
  const invalidReplayOptions = {
    eventDomain: 'user',
    fromTimestamp: new Date().toISOString(),
    toTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Invalid: from > to
    parallelWorkers: 50 // Invalid: too many workers
  };
  
  const invalidReplayResult = await makeRequest('POST', '/replay', invalidReplayOptions);
  createTestResult(
    'Reject invalid replay options',
    'Event Replay',
    !invalidReplayResult.success, // Should fail
    !invalidReplayResult.success ? 'Invalid replay options correctly rejected' : null,
    invalidReplayResult.success ? 'Invalid replay options were incorrectly accepted' : null
  );
  
  return replayJobId;
}

async function testSnapshotOperations() {
  console.log('\n🧪 Testing Snapshot Operations');
  
  // Test 1: Create snapshot
  const snapshotConfig = {
    aggregateId: 'test-aggregate-123',
    aggregateType: 'TestAggregate',
    compressionType: 'gzip',
    includeMetadata: true,
    retentionDays: 30
  };
  
  const snapshotResult = await makeRequest('POST', '/snapshots', snapshotConfig);
  createTestResult(
    'Create snapshot',
    'Snapshots',
    snapshotResult.success && snapshotResult.data.success,
    snapshotResult.success ? `Snapshot created: ${snapshotResult.data.data.id}` : null,
    snapshotResult.error
  );
  
  // Test 2: Create snapshot with different compression
  const brotliSnapshotConfig = {
    ...snapshotConfig,
    aggregateId: 'test-aggregate-456',
    compressionType: 'brotli'
  };
  
  const brotliSnapshotResult = await makeRequest('POST', '/snapshots', brotliSnapshotConfig);
  createTestResult(
    'Create snapshot with Brotli compression',
    'Snapshots',
    brotliSnapshotResult.success && brotliSnapshotResult.data.success,
    brotliSnapshotResult.success ? `Brotli compressed snapshot created` : null,
    brotliSnapshotResult.error
  );
  
  // Test 3: Create snapshot without compression
  const noCompressionConfig = {
    ...snapshotConfig,
    aggregateId: 'test-aggregate-789',
    compressionType: 'none'
  };
  
  const noCompressionResult = await makeRequest('POST', '/snapshots', noCompressionConfig);
  createTestResult(
    'Create snapshot without compression',
    'Snapshots',
    noCompressionResult.success && noCompressionResult.data.success,
    noCompressionResult.success ? `Uncompressed snapshot created` : null,
    noCompressionResult.error
  );
  
  // Test 4: Test invalid snapshot config
  const invalidSnapshotConfig = {
    aggregateId: '', // Invalid: empty aggregateId
    aggregateType: '', // Invalid: empty aggregateType
    compressionType: 'invalid' // Invalid: unsupported compression type
  };
  
  const invalidSnapshotResult = await makeRequest('POST', '/snapshots', invalidSnapshotConfig);
  createTestResult(
    'Reject invalid snapshot config',
    'Snapshots',
    !invalidSnapshotResult.success, // Should fail
    !invalidSnapshotResult.success ? 'Invalid snapshot config correctly rejected' : null,
    invalidSnapshotResult.success ? 'Invalid snapshot config was incorrectly accepted' : null
  );
}

async function testHealthAndSystemOperations() {
  console.log('\n🧪 Testing Health and System Operations');
  
  // Test 1: Health check
  const healthResult = await makeRequest('GET', '/health');
  createTestResult(
    'System health check',
    'Health & System',
    healthResult.success && healthResult.data.success,
    healthResult.success ? `Status: ${healthResult.data.data.status}` : null,
    healthResult.error
  );
  
  // Test 2: Generate test events
  const generateTestData = {
    count: 5,
    eventType: 'UserCreated',
    domain: 'user'
  };
  
  const generateResult = await makeRequest('POST', '/test/generate-events', generateTestData);
  createTestResult(
    'Generate test events',
    'Health & System',
    generateResult.success && generateResult.data.success,
    generateResult.success ? `Generated ${generateResult.data.data.count} test events` : null,
    generateResult.error
  );
}

async function testErrorHandlingAndEdgeCases() {
  console.log('\n🧪 Testing Error Handling and Edge Cases');
  
  // Test 1: Invalid endpoint
  const invalidEndpointResult = await makeRequest('GET', '/invalid-endpoint');
  createTestResult(
    'Handle invalid endpoint',
    'Error Handling',
    !invalidEndpointResult.success, // Should fail
    !invalidEndpointResult.success ? 'Invalid endpoint correctly handled' : null,
    invalidEndpointResult.success ? 'Invalid endpoint was incorrectly handled' : null
  );
  
  // Test 2: Invalid JSON payload
  const invalidJsonResult = await makeRequest('POST', '/events', 'invalid-json');
  createTestResult(
    'Handle invalid JSON',
    'Error Handling',
    !invalidJsonResult.success, // Should fail
    !invalidJsonResult.success ? 'Invalid JSON correctly rejected' : null,
    invalidJsonResult.success ? 'Invalid JSON was incorrectly accepted' : null
  );
  
  // Test 3: Missing required fields
  const missingFieldsEvent = {
    eventType: 'UserCreated',
    eventDomain: 'user'
    // Missing aggregateId, aggregateType, eventData
  };
  
  const missingFieldsResult = await makeRequest('POST', '/events', missingFieldsEvent);
  createTestResult(
    'Handle missing required fields',
    'Error Handling',
    !missingFieldsResult.success, // Should fail
    !missingFieldsResult.success ? 'Missing required fields correctly rejected' : null,
    missingFieldsResult.success ? 'Missing required fields were incorrectly accepted' : null
  );
  
  // Test 4: Invalid event type
  const invalidEventTypeEvent = {
    ...generateTestEvent('InvalidEventType', 'user'),
    eventType: 'InvalidEventType'
  };
  
  const invalidEventTypeResult = await makeRequest('POST', '/events', invalidEventTypeEvent);
  createTestResult(
    'Handle invalid event type',
    'Error Handling',
    !invalidEventTypeResult.success, // Should fail
    !invalidEventTypeResult.success ? 'Invalid event type correctly rejected' : null,
    invalidEventTypeResult.success ? 'Invalid event type was incorrectly accepted' : null
  );
  
  // Test 5: Invalid domain
  const invalidDomainEvent = {
    ...generateTestEvent('UserCreated', 'invalid_domain'),
    eventDomain: 'invalid_domain'
  };
  
  const invalidDomainResult = await makeRequest('POST', '/events', invalidDomainEvent);
  createTestResult(
    'Handle invalid domain',
    'Error Handling',
    !invalidDomainResult.success, // Should fail
    !invalidDomainResult.success ? 'Invalid domain correctly rejected' : null,
    invalidDomainResult.success ? 'Invalid domain was incorrectly accepted' : null
  );
  
  // Test 6: Very large event data
  const largeEventData = {
    ...generateTestEvent('UserCreated', 'user'),
    eventData: {
      ...generateTestEvent('UserCreated', 'user').eventData,
      largeField: 'x'.repeat(100000) // 100KB of data
    }
  };
  
  const largeEventResult = await makeRequest('POST', '/events', largeEventData);
  createTestResult(
    'Handle large event data',
    'Error Handling',
    largeEventResult.success && largeEventResult.data.success,
    largeEventResult.success ? 'Large event data handled correctly' : null,
    largeEventResult.error
  );
}

async function testPerformanceAndOptimization() {
  console.log('\n🧪 Testing Performance and Optimization');
  
  // Test 1: Batch event storage performance
  const batchEvents = Array.from({ length: 20 }, (_, i) => 
    generateTestEvent('UserCreated', 'user', { sequenceId: i })
  );
  
  const batchStartTime = Date.now();
  const batchPromises = batchEvents.map(event => makeRequest('POST', '/events', event));
  const batchResults = await Promise.all(batchPromises);
  const batchDuration = Date.now() - batchStartTime;
  
  const batchSuccessCount = batchResults.filter(result => result.success).length;
  createTestResult(
    'Batch event storage performance',
    'Performance',
    batchSuccessCount === batchEvents.length,
    `Stored ${batchSuccessCount}/${batchEvents.length} events in ${batchDuration}ms`,
    batchSuccessCount !== batchEvents.length ? 'Some batch events failed' : null
  );
  
  // Test 2: Concurrent event retrieval
  const concurrentStartTime = Date.now();
  const concurrentPromises = Array.from({ length: 10 }, () => 
    makeRequest('GET', '/events?limit=10')
  );
  const concurrentResults = await Promise.all(concurrentPromises);
  const concurrentDuration = Date.now() - concurrentStartTime;
  
  const concurrentSuccessCount = concurrentResults.filter(result => result.success).length;
  createTestResult(
    'Concurrent event retrieval',
    'Performance',
    concurrentSuccessCount === 10,
    `${concurrentSuccessCount}/10 concurrent requests completed in ${concurrentDuration}ms`,
    concurrentSuccessCount !== 10 ? 'Some concurrent requests failed' : null
  );
  
  // Test 3: Large result set pagination
  const largeResultStartTime = Date.now();
  const largeResultPromises = Array.from({ length: 5 }, (_, i) => 
    makeRequest('GET', `/events?limit=50&offset=${i * 50}`)
  );
  const largeResultResults = await Promise.all(largeResultPromises);
  const largeResultDuration = Date.now() - largeResultStartTime;
  
  const largeResultSuccessCount = largeResultResults.filter(result => result.success).length;
  createTestResult(
    'Large result set pagination',
    'Performance',
    largeResultSuccessCount === 5,
    `${largeResultSuccessCount}/5 paginated requests completed in ${largeResultDuration}ms`,
    largeResultSuccessCount !== 5 ? 'Some paginated requests failed' : null
  );
  
  // Test 4: Schema validation performance
  const schemaValidationStartTime = Date.now();
  const schemaValidationPromises = Array.from({ length: 10 }, () => 
    makeRequest('POST', '/schemas/user_UserCreated/validate', {
      data: {
        aggregateId: 'test-123',
        aggregateType: 'TestAggregate',
        eventData: {
          userId: 123,
          username: 'testuser',
          email: 'test@example.com'
        }
      }
    })
  );
  const schemaValidationResults = await Promise.all(schemaValidationPromises);
  const schemaValidationDuration = Date.now() - schemaValidationStartTime;
  
  const schemaValidationSuccessCount = schemaValidationResults.filter(result => result.success).length;
  createTestResult(
    'Schema validation performance',
    'Performance',
    schemaValidationSuccessCount === 10,
    `${schemaValidationSuccessCount}/10 schema validations completed in ${schemaValidationDuration}ms`,
    schemaValidationSuccessCount !== 10 ? 'Some schema validations failed' : null
  );
}

async function testIntegrationAndEndToEnd() {
  console.log('\n🧪 Testing Integration and End-to-End Scenarios');
  
  // Test 1: Complete event lifecycle
  const lifecycleEvent = generateTestEvent('UserCreated', 'user');
  
  // Store event
  const storeResult = await makeRequest('POST', '/events', lifecycleEvent);
  const eventStored = storeResult.success && storeResult.data.success;
  
  // Retrieve event
  const retrieveResult = await makeRequest('GET', `/events?aggregateId=${lifecycleEvent.aggregateId}`);
  const eventRetrieved = retrieveResult.success && retrieveResult.data.success && retrieveResult.data.data.length > 0;
  
  // Create snapshot
  const snapshotResult = await makeRequest('POST', '/snapshots', {
    aggregateId: lifecycleEvent.aggregateId,
    aggregateType: lifecycleEvent.aggregateType,
    compressionType: 'gzip'
  });
  const snapshotCreated = snapshotResult.success && snapshotResult.data.success;
  
  createTestResult(
    'Complete event lifecycle',
    'Integration',
    eventStored && eventRetrieved && snapshotCreated,
    `Event stored, retrieved, and snapshot created successfully`,
    !(eventStored && eventRetrieved && snapshotCreated) ? 'Some lifecycle steps failed' : null
  );
  
  // Test 2: Schema evolution workflow
  const evolutionSchema = generateTestSchema('evolution_test', '1.0.0');
  
  // Register schema
  const registerResult = await makeRequest('POST', '/schemas', evolutionSchema);
  const schemaRegistered = registerResult.success && registerResult.data.success;
  
  // Evolve schema
  const evolveResult = await makeRequest('POST', `/schemas/${evolutionSchema.schemaName}/evolve`, {
    newVersion: '2.0.0',
    newDefinition: {
      ...evolutionSchema.schemaDefinition,
      version: '2.0.0',
      properties: {
        ...evolutionSchema.schemaDefinition.properties,
        newField: { type: 'string' }
      }
    }
  });
  const schemaEvolved = evolveResult.success && evolveResult.data.success;
  
  createTestResult(
    'Schema evolution workflow',
    'Integration',
    schemaRegistered && schemaEvolved,
    `Schema registered and evolved successfully`,
    !(schemaRegistered && schemaEvolved) ? 'Schema evolution workflow failed' : null
  );
  
  // Test 3: Event replay with validation
  const replayResult = await makeRequest('POST', '/replay', {
    eventDomain: 'user',
    fromTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    toTimestamp: new Date().toISOString(),
    parallelWorkers: 1,
    batchSize: 5,
    dryRun: true
  });
  
  let replayValidated = false;
  if (replayResult.success && replayResult.data.data) {
    const replayJobId = replayResult.data.data.id;
    
    // Wait for replay to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Validate replay
    const validateResult = await makeRequest('POST', `/replay/${replayJobId}/validate`);
    replayValidated = validateResult.success && validateResult.data.success;
  }
  
  createTestResult(
    'Event replay with validation',
    'Integration',
    replayResult.success && replayValidated,
    `Event replay started and validated successfully`,
    !(replayResult.success && replayValidated) ? 'Event replay or validation failed' : null
  );
  
  // Test 4: Cross-domain event processing
  const crossDomainEvents = [
    generateTestEvent('UserCreated', 'user'),
    generateTestEvent('OrderCreated', 'order'),
    generateTestEvent('ProductCreated', 'product'),
    generateTestEvent('PaymentInitiated', 'payment')
  ];
  
  const crossDomainResults = await Promise.all(
    crossDomainEvents.map(event => makeRequest('POST', '/events', event))
  );
  
  const crossDomainSuccessCount = crossDomainResults.filter(result => result.success).length;
  createTestResult(
    'Cross-domain event processing',
    'Integration',
    crossDomainSuccessCount === crossDomainEvents.length,
    `${crossDomainSuccessCount}/${crossDomainEvents.length} cross-domain events processed`,
    crossDomainSuccessCount !== crossDomainEvents.length ? 'Some cross-domain events failed' : null
  );
  
  // Test 5: System metrics consistency
  const finalMetricsResult = await makeRequest('GET', '/events/metrics');
  const schemaMetricsResult = await makeRequest('GET', '/schemas/metrics');
  
  const metricsConsistent = finalMetricsResult.success && schemaMetricsResult.success;
  createTestResult(
    'System metrics consistency',
    'Integration',
    metricsConsistent,
    `Event metrics and schema metrics retrieved consistently`,
    !metricsConsistent ? 'Metrics retrieval failed' : null
  );
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 PHASE 3 WEEK 9-10 EVENT SOURCING COMPREHENSIVE TEST SUITE'.rainbow);
  console.log('=' .repeat(80).gray);
  console.log(`Started at: ${new Date().toISOString()}`.gray);
  console.log(`Testing against: ${BASE_URL}${API_PREFIX}`.gray);
  console.log('=' .repeat(80).gray);
  
  try {
    // Run all test suites
    await testEventStoreOperations();
    await testSchemaRegistryOperations();
    await testEventReplayOperations();
    await testSnapshotOperations();
    await testHealthAndSystemOperations();
    await testErrorHandlingAndEdgeCases();
    await testPerformanceAndOptimization();
    await testIntegrationAndEndToEnd();
    
    // Print final results
    console.log('\n📊 TEST RESULTS SUMMARY'.rainbow);
    console.log('=' .repeat(80).gray);
    
    const duration = Date.now() - testResults.startTime;
    const successRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(1) : 0;
    
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Duration: ${duration}ms`.gray);
    
    // Print results by group
    console.log('\n📋 RESULTS BY GROUP:');
    Object.entries(testResults.testGroups).forEach(([group, results]) => {
      const groupRate = results.passed + results.failed > 0 ? 
        (results.passed / (results.passed + results.failed) * 100).toFixed(1) : 0;
      
      console.log(`${group}: ${results.passed}/${results.passed + results.failed} (${groupRate}%)`);
      
      // Show failed tests
      const failedTests = results.tests.filter(test => !test.success);
      if (failedTests.length > 0) {
        failedTests.forEach(test => {
          console.log(`  ❌ ${test.name}: ${test.error}`);
        });
      }
    });
    
    // Overall status
    console.log('\n🎯 OVERALL STATUS:'.rainbow);
    if (testResults.failed === 0) {
      console.log('✅ ALL TESTS PASSED! Phase 3 Week 9-10 Event Sourcing implementation is working correctly.');
    } else {
      console.log(`❌ ${testResults.failed} tests failed. Phase 3 Week 9-10 Event Sourcing needs attention.`);
    }
    
    console.log('\n🎉 PHASE 3 WEEK 9-10 EVENT SOURCING TESTING COMPLETE'.rainbow);
    console.log('=' .repeat(80).gray);
    
  } catch (error) {
    console.error('\n💥 TEST RUNNER ERROR:');
    console.error(error.message);
    console.error('\nTest execution was interrupted.');
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(console.error);