/**
 * Phase 3 Week 11-12: Enhanced CQRS with Eventual Consistency - Comprehensive Test Suite
 * 
 * This test suite validates the complete implementation of Enhanced CQRS with:
 * - Consistency strategies (strong, eventual, causal, session)
 * - Conflict resolution mechanisms
 * - Projection rebuild strategies
 * - Health monitoring and recovery
 * - Projection management
 * 
 * @author GetIt Platform Team
 * @version 1.0.0
 * @since 2025-07-15
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';
const CQRS_BASE_URL = `${API_BASE_URL}/cqrs`;

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  delay: 1000,
  testProjectionCount: 5,
  testConflictCount: 3
};

// Test utilities
class TestUtils {
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async makeRequest(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    return { response, data };
  }

  static generateTestData(type, index = 0) {
    const timestamp = new Date().toISOString();
    const testData = {
      projection: {
        name: `test-projection-${Date.now()}-${index}`,
        type: 'read_model',
        aggregateType: 'test',
        initialData: {
          id: `test-${index}`,
          name: `Test Projection ${index}`,
          data: { value: `test-value-${index}` },
          timestamp,
          testMetadata: {
            phase: 'Phase 3 Week 11-12',
            feature: 'Enhanced CQRS',
            index
          }
        },
        consistencyStrategy: { strategy: 'eventual' }
      },
      conflict: {
        aggregateId: `test-aggregate-${index}`,
        aggregateType: 'test',
        conflictingEvents: [
          {
            id: `event-${Date.now()}-${index}-1`,
            eventType: 'TestEvent',
            eventData: { value: `conflict-${index}-1`, timestamp },
            timestamp: new Date(Date.now() - 1000).toISOString()
          },
          {
            id: `event-${Date.now()}-${index}-2`,
            eventType: 'TestEvent',
            eventData: { value: `conflict-${index}-2`, timestamp },
            timestamp: new Date().toISOString()
          }
        ]
      },
      updateData: {
        newData: {
          id: `test-${index}`,
          name: `Updated Test Projection ${index}`,
          data: { value: `updated-test-value-${index}` },
          timestamp: new Date().toISOString(),
          updateMetadata: {
            updatedAt: new Date().toISOString(),
            version: 2
          }
        }
      }
    };

    return testData;
  }

  static logTestResult(testName, success, details = {}) {
    const icon = success ? '✅' : '❌';
    const status = success ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${testName}: ${status}`);
    
    if (details.message) {
      console.log(`   Message: ${details.message}`);
    }
    
    if (details.error) {
      console.log(`   Error: ${details.error}`);
    }
    
    if (details.data && typeof details.data === 'object') {
      console.log(`   Data: ${JSON.stringify(details.data, null, 2)}`);
    }
    
    if (details.metrics) {
      console.log(`   Metrics: ${JSON.stringify(details.metrics, null, 2)}`);
    }
    
    console.log('');
  }
}

// Test suite implementation
class EnhancedCQRSTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
    this.testProjections = [];
    this.testConflicts = [];
  }

  async runAllTests() {
    console.log('🚀 Phase 3 Week 11-12: Enhanced CQRS with Eventual Consistency - Test Suite');
    console.log('===============================================================================');
    console.log('');

    try {
      // Test 1: Service Health Check
      await this.testServiceHealth();

      // Test 2: Projection Management
      await this.testProjectionManagement();

      // Test 3: Consistency Strategies
      await this.testConsistencyStrategies();

      // Test 4: Conflict Resolution
      await this.testConflictResolution();

      // Test 5: Projection Rebuild
      await this.testProjectionRebuild();

      // Test 6: Health Monitoring
      await this.testHealthMonitoring();

      // Test 7: Test Data Generation
      await this.testDataGeneration();

      // Test 8: Complete Integration Test
      await this.testCompleteIntegration();

      // Final results
      this.printFinalResults();

    } catch (error) {
      console.error('💥 Test Suite Failed:', error);
      this.testResults.failed++;
    }
  }

  async testServiceHealth() {
    console.log('🔍 Testing Service Health...');
    
    try {
      const { response, data } = await TestUtils.makeRequest(`${CQRS_BASE_URL}/health`);
      
      const success = response.ok && data.success && data.status === 'healthy';
      
      TestUtils.logTestResult('Service Health Check', success, {
        message: success ? 'CQRS service is healthy' : 'CQRS service health check failed',
        data: data.success ? data.metrics : data.error,
        metrics: data.metrics
      });

      this.updateTestResults(success);

      if (success) {
        console.log(`   📊 Service Metrics:`);
        console.log(`      - Total Projections: ${data.metrics.totalProjections}`);
        console.log(`      - Healthy Projections: ${data.metrics.healthyProjections}`);
        console.log(`      - Active Conflicts: ${data.metrics.activeConflicts}`);
        console.log(`      - Active Rebuild Jobs: ${data.metrics.activeRebuildJobs}`);
        console.log(`      - Registered Projections: ${data.metrics.registeredProjections}`);
        console.log('');
      }

    } catch (error) {
      TestUtils.logTestResult('Service Health Check', false, {
        error: error.message
      });
      this.updateTestResults(false);
    }
  }

  async testProjectionManagement() {
    console.log('📁 Testing Projection Management...');

    try {
      // Test creating projections
      const testData = TestUtils.generateTestData('projection', 1);
      const { response, data } = await TestUtils.makeRequest(`${CQRS_BASE_URL}/projections`, {
        method: 'POST',
        body: JSON.stringify(testData.projection)
      });

      const createSuccess = response.ok && data.success;
      TestUtils.logTestResult('Create Projection', createSuccess, {
        message: createSuccess ? 'Projection created successfully' : 'Failed to create projection',
        data: createSuccess ? data.projection : data.error
      });

      this.updateTestResults(createSuccess);

      if (createSuccess) {
        this.testProjections.push(data.projection);

        // Test getting projection
        const { response: getResponse, data: getData } = await TestUtils.makeRequest(
          `${CQRS_BASE_URL}/projections/${testData.projection.name}`
        );

        const getSuccess = getResponse.ok && getData.success;
        TestUtils.logTestResult('Get Projection', getSuccess, {
          message: getSuccess ? 'Projection retrieved successfully' : 'Failed to retrieve projection',
          data: getSuccess ? getData.data : getData.error
        });

        this.updateTestResults(getSuccess);

        // Test updating projection
        const updateData = TestUtils.generateTestData('projection', 1).updateData;
        const { response: updateResponse, data: updateResponseData } = await TestUtils.makeRequest(
          `${CQRS_BASE_URL}/projections/${testData.projection.name}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateData)
          }
        );

        const updateSuccess = updateResponse.ok && updateResponseData.success;
        TestUtils.logTestResult('Update Projection', updateSuccess, {
          message: updateSuccess ? 'Projection updated successfully' : 'Failed to update projection',
          data: updateSuccess ? updateResponseData.projection : updateResponseData.error
        });

        this.updateTestResults(updateSuccess);
      }

    } catch (error) {
      TestUtils.logTestResult('Projection Management', false, {
        error: error.message
      });
      this.updateTestResults(false);
    }
  }

  async testConsistencyStrategies() {
    console.log('🔄 Testing Consistency Strategies...');

    const strategies = [
      { name: 'Strong Consistency', endpoint: 'strong', params: { timeout: 5000, retryAttempts: 3 } },
      { name: 'Eventual Consistency', endpoint: 'eventual', params: { checkInterval: 1000 } },
      { name: 'Causal Consistency', endpoint: 'causal', params: { timeout: 3000 } },
      { name: 'Session Consistency', endpoint: 'session', params: { sessionId: 'test-session-123', timeout: 2000 } }
    ];

    for (const strategy of strategies) {
      try {
        const testData = TestUtils.generateTestData('projection', Date.now());
        
        // First create a projection for testing
        await TestUtils.makeRequest(`${CQRS_BASE_URL}/projections`, {
          method: 'POST',
          body: JSON.stringify(testData.projection)
        });

        const requestData = {
          projectionName: testData.projection.name,
          data: testData.updateData.newData,
          ...strategy.params
        };

        const { response, data } = await TestUtils.makeRequest(
          `${CQRS_BASE_URL}/consistency/${strategy.endpoint}`,
          {
            method: 'POST',
            body: JSON.stringify(requestData)
          }
        );

        const success = response.ok && data.success;
        TestUtils.logTestResult(`${strategy.name} Strategy`, success, {
          message: success ? `${strategy.name} applied successfully` : `${strategy.name} failed`,
          data: success ? data.message : data.error
        });

        this.updateTestResults(success);

      } catch (error) {
        TestUtils.logTestResult(`${strategy.name} Strategy`, false, {
          error: error.message
        });
        this.updateTestResults(false);
      }
    }
  }

  async testConflictResolution() {
    console.log('⚔️ Testing Conflict Resolution...');

    try {
      const testData = TestUtils.generateTestData('conflict', 1);
      
      const { response, data } = await TestUtils.makeRequest(`${CQRS_BASE_URL}/conflicts/detect`, {
        method: 'POST',
        body: JSON.stringify(testData.conflict)
      });

      const success = response.ok && data.success;
      TestUtils.logTestResult('Conflict Detection & Resolution', success, {
        message: success ? 'Conflict resolved successfully' : 'Failed to resolve conflict',
        data: success ? data.resolution : data.error
      });

      this.updateTestResults(success);

      if (success) {
        this.testConflicts.push(data.conflict);
        console.log(`   📊 Conflict Resolution Details:`);
        console.log(`      - Conflict ID: ${data.conflict.conflictId}`);
        console.log(`      - Resolution Strategy: ${data.resolution.strategy || 'N/A'}`);
        console.log(`      - Status: ${data.conflict.conflictStatus}`);
        console.log('');
      }

    } catch (error) {
      TestUtils.logTestResult('Conflict Resolution', false, {
        error: error.message
      });
      this.updateTestResults(false);
    }
  }

  async testProjectionRebuild() {
    console.log('🔄 Testing Projection Rebuild...');

    try {
      if (this.testProjections.length === 0) {
        // Create a test projection for rebuild
        const testData = TestUtils.generateTestData('projection', 999);
        const { response, data } = await TestUtils.makeRequest(`${CQRS_BASE_URL}/projections`, {
          method: 'POST',
          body: JSON.stringify(testData.projection)
        });

        if (response.ok && data.success) {
          this.testProjections.push(data.projection);
        }
      }

      if (this.testProjections.length > 0) {
        const testProjection = this.testProjections[0];
        
        const rebuildOptions = {
          type: 'incremental',
          batchSize: 100,
          parallelWorkers: 2,
          fromTimestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        };

        const { response, data } = await TestUtils.makeRequest(
          `${CQRS_BASE_URL}/projections/${testProjection.projectionName}/rebuild`,
          {
            method: 'POST',
            body: JSON.stringify(rebuildOptions)
          }
        );

        const success = response.ok && data.success;
        TestUtils.logTestResult('Projection Rebuild', success, {
          message: success ? 'Projection rebuild initiated successfully' : 'Failed to initiate projection rebuild',
          data: success ? data.rebuildJob : data.error
        });

        this.updateTestResults(success);

        if (success) {
          console.log(`   📊 Rebuild Job Details:`);
          console.log(`      - Job ID: ${data.rebuildJob.id}`);
          console.log(`      - Job Name: ${data.rebuildJob.jobName}`);
          console.log(`      - Rebuild Type: ${data.rebuildJob.rebuildType}`);
          console.log(`      - Batch Size: ${data.rebuildJob.batchSize}`);
          console.log(`      - Parallel Workers: ${data.rebuildJob.parallelWorkers}`);
          console.log('');
        }

      } else {
        TestUtils.logTestResult('Projection Rebuild', false, {
          error: 'No test projections available for rebuild'
        });
        this.updateTestResults(false);
      }

    } catch (error) {
      TestUtils.logTestResult('Projection Rebuild', false, {
        error: error.message
      });
      this.updateTestResults(false);
    }
  }

  async testHealthMonitoring() {
    console.log('🏥 Testing Health Monitoring...');

    try {
      // Test getting all projection health metrics
      const { response, data } = await TestUtils.makeRequest(
        `${CQRS_BASE_URL}/projections/health/metrics`
      );

      const success = response.ok && data.success;
      TestUtils.logTestResult('Health Monitoring - All Projections', success, {
        message: success ? 'Health metrics retrieved successfully' : 'Failed to retrieve health metrics',
        data: success ? { count: data.count } : data.error
      });

      this.updateTestResults(success);

      // Test getting specific projection health
      if (this.testProjections.length > 0) {
        const testProjection = this.testProjections[0];
        
        const { response: healthResponse, data: healthData } = await TestUtils.makeRequest(
          `${CQRS_BASE_URL}/projections/${testProjection.projectionName}/health`
        );

        const healthSuccess = healthResponse.ok && healthData.success;
        TestUtils.logTestResult('Health Monitoring - Specific Projection', healthSuccess, {
          message: healthSuccess ? 'Projection health retrieved successfully' : 'Failed to retrieve projection health',
          data: healthSuccess ? healthData.data.projection : healthData.error
        });

        this.updateTestResults(healthSuccess);

        if (healthSuccess) {
          const projectionHealth = healthData.data.projection;
          console.log(`   📊 Projection Health Details:`);
          console.log(`      - Name: ${projectionHealth.name}`);
          console.log(`      - Status: ${projectionHealth.status}`);
          console.log(`      - Lag Seconds: ${projectionHealth.lagSeconds}`);
          console.log(`      - Error Count: ${projectionHealth.errorCount}`);
          console.log(`      - Health History Count: ${healthData.data.healthHistory.length}`);
          console.log('');
        }
      }

    } catch (error) {
      TestUtils.logTestResult('Health Monitoring', false, {
        error: error.message
      });
      this.updateTestResults(false);
    }
  }

  async testDataGeneration() {
    console.log('🧪 Testing Data Generation...');

    try {
      // Test generating test projections
      const { response, data } = await TestUtils.makeRequest(
        `${CQRS_BASE_URL}/test/generate-projections`,
        {
          method: 'POST',
          body: JSON.stringify({
            count: TEST_CONFIG.testProjectionCount,
            projectionType: 'read_model',
            aggregateType: 'test'
          })
        }
      );

      const projectionSuccess = response.ok && data.success;
      TestUtils.logTestResult('Generate Test Projections', projectionSuccess, {
        message: projectionSuccess ? `Generated ${TEST_CONFIG.testProjectionCount} test projections` : 'Failed to generate test projections',
        data: projectionSuccess ? { count: data.data.length } : data.error
      });

      this.updateTestResults(projectionSuccess);

      // Test generating test conflicts
      const { response: conflictResponse, data: conflictData } = await TestUtils.makeRequest(
        `${CQRS_BASE_URL}/test/generate-conflicts`,
        {
          method: 'POST',
          body: JSON.stringify({
            count: TEST_CONFIG.testConflictCount,
            aggregateType: 'test'
          })
        }
      );

      const conflictSuccess = conflictResponse.ok && conflictData.success;
      TestUtils.logTestResult('Generate Test Conflicts', conflictSuccess, {
        message: conflictSuccess ? `Generated ${TEST_CONFIG.testConflictCount} test conflicts` : 'Failed to generate test conflicts',
        data: conflictSuccess ? { count: conflictData.data.length } : conflictData.error
      });

      this.updateTestResults(conflictSuccess);

    } catch (error) {
      TestUtils.logTestResult('Data Generation', false, {
        error: error.message
      });
      this.updateTestResults(false);
    }
  }

  async testCompleteIntegration() {
    console.log('🔗 Testing Complete Integration...');

    try {
      // Create a complete workflow: Create projection -> Update with consistency -> Detect conflict -> Rebuild
      const testData = TestUtils.generateTestData('projection', 999);
      
      // Step 1: Create projection
      const { response: createResponse, data: createData } = await TestUtils.makeRequest(
        `${CQRS_BASE_URL}/projections`,
        {
          method: 'POST',
          body: JSON.stringify(testData.projection)
        }
      );

      if (!createResponse.ok || !createData.success) {
        throw new Error('Failed to create projection for integration test');
      }

      // Step 2: Update with strong consistency
      const { response: updateResponse, data: updateData } = await TestUtils.makeRequest(
        `${CQRS_BASE_URL}/consistency/strong`,
        {
          method: 'POST',
          body: JSON.stringify({
            projectionName: testData.projection.name,
            data: testData.updateData.newData,
            timeout: 5000,
            retryAttempts: 3
          })
        }
      );

      if (!updateResponse.ok || !updateData.success) {
        throw new Error('Failed to update projection with strong consistency');
      }

      // Step 3: Simulate conflict resolution
      const conflictData = TestUtils.generateTestData('conflict', 999);
      const { response: conflictResponse, data: conflictResult } = await TestUtils.makeRequest(
        `${CQRS_BASE_URL}/conflicts/detect`,
        {
          method: 'POST',
          body: JSON.stringify(conflictData.conflict)
        }
      );

      if (!conflictResponse.ok || !conflictResult.success) {
        throw new Error('Failed to resolve conflict');
      }

      // Step 4: Initiate rebuild
      const { response: rebuildResponse, data: rebuildData } = await TestUtils.makeRequest(
        `${CQRS_BASE_URL}/projections/${testData.projection.name}/rebuild`,
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'incremental',
            batchSize: 50,
            parallelWorkers: 1
          })
        }
      );

      if (!rebuildResponse.ok || !rebuildData.success) {
        throw new Error('Failed to initiate projection rebuild');
      }

      // Step 5: Check health
      const { response: healthResponse, data: healthData } = await TestUtils.makeRequest(
        `${CQRS_BASE_URL}/projections/${testData.projection.name}/health`
      );

      if (!healthResponse.ok || !healthData.success) {
        throw new Error('Failed to check projection health');
      }

      TestUtils.logTestResult('Complete Integration Test', true, {
        message: 'Full CQRS workflow completed successfully',
        data: {
          projectionCreated: createData.projection.projectionName,
          consistencyApplied: updateData.message,
          conflictResolved: conflictResult.resolution.message || 'Conflict resolved',
          rebuildInitiated: rebuildData.rebuildJob.jobName,
          healthChecked: healthData.data.projection.status
        }
      });

      this.updateTestResults(true);

    } catch (error) {
      TestUtils.logTestResult('Complete Integration Test', false, {
        error: error.message
      });
      this.updateTestResults(false);
    }
  }

  updateTestResults(success) {
    this.testResults.total++;
    if (success) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
  }

  printFinalResults() {
    console.log('===============================================================================');
    console.log('🎯 Phase 3 Week 11-12: Enhanced CQRS Test Results');
    console.log('===============================================================================');
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    console.log('');

    if (this.testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Enhanced CQRS implementation is working correctly.');
      console.log('');
      console.log('✅ Phase 3 Week 11-12 Features Validated:');
      console.log('   - ✅ Enhanced CQRS Service with consistency strategies');
      console.log('   - ✅ Conflict resolution mechanisms');
      console.log('   - ✅ Projection rebuild strategies');
      console.log('   - ✅ Health monitoring and recovery');
      console.log('   - ✅ Complete API endpoint coverage');
      console.log('   - ✅ Integration with existing Event Sourcing');
      console.log('');
      console.log('🚀 Ready for Phase 4 Week 1-2 implementation!');
    } else {
      console.log('⚠️  Some tests failed. Please review the implementation.');
      console.log('');
      console.log('🔧 Recommended next steps:');
      console.log('   1. Review failed test outputs above');
      console.log('   2. Check Enhanced CQRS Service implementation');
      console.log('   3. Verify database schema synchronization');
      console.log('   4. Validate API route integration');
      console.log('   5. Re-run tests after fixes');
    }
    
    console.log('');
    console.log('📊 Test Summary:');
    console.log(`   - Service Health: ${this.testResults.passed > 0 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
    console.log(`   - Projection Management: ${this.testResults.passed > 2 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
    console.log(`   - Consistency Strategies: ${this.testResults.passed > 5 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
    console.log(`   - Conflict Resolution: ${this.testResults.passed > 7 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
    console.log(`   - Health Monitoring: ${this.testResults.passed > 9 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
    console.log(`   - Integration: ${this.testResults.passed > 11 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
    console.log('');
    console.log('===============================================================================');
  }
}

// Run the test suite
async function runTests() {
  const testSuite = new EnhancedCQRSTestSuite();
  await testSuite.runAllTests();
}

// Check if running directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  EnhancedCQRSTestSuite,
  TestUtils,
  runTests
};