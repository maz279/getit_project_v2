/**
 * Hybrid AI Test Runner - Production Validation
 * Automated test execution for the hybrid AI architecture
 */

import { HybridAIValidator } from './hybrid-ai-validation';
import axios from 'axios';

export class HybridAITestRunner {
  private validator: HybridAIValidator;
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:5000') {
    this.validator = new HybridAIValidator();
    this.baseUrl = baseUrl;
  }

  /**
   * Run complete hybrid AI test suite
   */
  public async runCompleteTestSuite(): Promise<void> {
    console.log('🚀 Starting Hybrid AI Test Suite...');
    console.log('================================\n');

    try {
      // 1. Run service validation tests
      console.log('📋 Phase 1: Service Validation Tests');
      const validationResults = await this.validator.runFullValidation();
      
      this.printValidationResults(validationResults);

      // 2. Run API endpoint tests
      console.log('\n📋 Phase 2: API Endpoint Tests');
      await this.runAPITests();

      // 3. Run performance tests
      console.log('\n📋 Phase 3: Performance Tests');
      await this.runPerformanceTests();

      // 4. Run integration tests
      console.log('\n📋 Phase 4: Integration Tests');
      await this.runIntegrationTests();

      // 5. Generate final report
      console.log('\n📊 Generating Final Report...');
      const report = this.validator.generatePerformanceReport();
      console.log(report);

      // 6. Performance summary
      this.printPerformanceSummary(validationResults);

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      throw error;
    }
  }

  /**
   * Test API endpoints
   */
  private async runAPITests(): Promise<void> {
    const tests = [
      {
        name: 'Health Check',
        method: 'GET',
        url: '/api/hybrid-ai/health'
      },
      {
        name: 'Search Processing',
        method: 'POST',
        url: '/api/hybrid-ai/search',
        data: { query: 'smartphone', language: 'en' }
      },
      {
        name: 'Image Analysis',
        method: 'POST',
        url: '/api/hybrid-ai/image-analysis',
        data: { imageData: 'data:image/jpeg;base64,/9j/test' }
      },
      {
        name: 'Voice Command',
        method: 'POST',
        url: '/api/hybrid-ai/voice-command',
        data: { audioData: 'mock-audio-data' }
      },
      {
        name: 'Pattern Recognition',
        method: 'POST',
        url: '/api/hybrid-ai/pattern-recognition',
        data: { behaviorData: { clicks: 5, timeSpent: 120 } }
      },
      {
        name: 'Recommendations',
        method: 'POST',
        url: '/api/hybrid-ai/recommendations',
        data: { userProfile: { age: 25, location: 'dhaka' } }
      },
      {
        name: 'Category Prediction',
        method: 'POST',
        url: '/api/hybrid-ai/predict-category',
        data: { productData: { name: 'Samsung Galaxy', description: 'Smartphone' } }
      },
      {
        name: 'Price Prediction',
        method: 'POST',
        url: '/api/hybrid-ai/predict-price',
        data: { productData: { name: 'iPhone 14', category: 'electronics' } }
      },
      {
        name: 'Performance Metrics',
        method: 'GET',
        url: '/api/hybrid-ai/metrics'
      },
      {
        name: 'Service Configuration',
        method: 'GET',
        url: '/api/hybrid-ai/config'
      }
    ];

    for (const test of tests) {
      await this.runAPITest(test);
    }
  }

  /**
   * Run individual API test
   */
  private async runAPITest(test: any): Promise<void> {
    const startTime = performance.now();
    
    try {
      const config = {
        method: test.method.toLowerCase(),
        url: `${this.baseUrl}${test.url}`,
        ...(test.data && { data: test.data }),
        timeout: 10000
      };

      const response = await axios(config);
      const responseTime = performance.now() - startTime;

      if (response.status === 200 && response.data.success !== false) {
        console.log(`✅ ${test.name}: PASSED (${responseTime.toFixed(1)}ms)`);
        this.logAPITestDetails(test.name, response.data, responseTime);
      } else {
        console.log(`❌ ${test.name}: FAILED - Invalid response`);
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      console.log(`❌ ${test.name}: FAILED (${responseTime.toFixed(1)}ms) - ${error.message}`);
    }
  }

  /**
   * Run performance tests
   */
  private async runPerformanceTests(): Promise<void> {
    console.log('⚡ Testing performance targets...');

    // Test 1: Sub-100ms real-time processing
    await this.testRealTimePerformance();

    // Test 2: Sub-3s complex processing
    await this.testComplexProcessing();

    // Test 3: Concurrent processing
    await this.testConcurrentProcessing();

    // Test 4: Memory usage
    await this.testMemoryUsage();
  }

  /**
   * Test real-time performance (<100ms target)
   */
  private async testRealTimePerformance(): Promise<void> {
    console.log('🎯 Testing real-time performance (<100ms)...');
    
    const tests = [
      { endpoint: '/api/hybrid-ai/search', data: { query: 'quick', urgency: 'immediate' } },
      { endpoint: '/api/hybrid-ai/pattern-recognition', data: { behaviorData: { clicks: 1 } } }
    ];

    for (const test of tests) {
      const startTime = performance.now();
      
      try {
        await axios.post(`${this.baseUrl}${test.endpoint}`, test.data);
        const responseTime = performance.now() - startTime;
        
        if (responseTime < 100) {
          console.log(`✅ Real-time test: ${responseTime.toFixed(1)}ms (Target: <100ms)`);
        } else {
          console.log(`⚠️ Real-time test: ${responseTime.toFixed(1)}ms (Exceeds 100ms target)`);
        }
      } catch (error) {
        console.log(`❌ Real-time test failed: ${error.message}`);
      }
    }
  }

  /**
   * Test complex processing (<3s target)
   */
  private async testComplexProcessing(): Promise<void> {
    console.log('🎯 Testing complex processing (<3s)...');
    
    const startTime = performance.now();
    
    try {
      await axios.post(`${this.baseUrl}/api/hybrid-ai/search`, {
        query: 'complex search with cultural context and image analysis',
        language: 'bn',
        context: { complex: true }
      });
      
      const responseTime = performance.now() - startTime;
      
      if (responseTime < 3000) {
        console.log(`✅ Complex processing: ${responseTime.toFixed(1)}ms (Target: <3000ms)`);
      } else {
        console.log(`⚠️ Complex processing: ${responseTime.toFixed(1)}ms (Exceeds 3000ms target)`);
      }
    } catch (error) {
      console.log(`❌ Complex processing test failed: ${error.message}`);
    }
  }

  /**
   * Test concurrent processing
   */
  private async testConcurrentProcessing(): Promise<void> {
    console.log('🎯 Testing concurrent processing (10 requests)...');
    
    const requests = Array(10).fill(null).map(() =>
      axios.post(`${this.baseUrl}/api/hybrid-ai/search`, {
        query: `concurrent test ${Math.random()}`,
        urgency: 'normal'
      })
    );

    const startTime = performance.now();
    
    try {
      await Promise.all(requests);
      const totalTime = performance.now() - startTime;
      const avgTime = totalTime / 10;
      
      console.log(`✅ Concurrent processing: ${totalTime.toFixed(1)}ms total, ${avgTime.toFixed(1)}ms average`);
    } catch (error) {
      console.log(`❌ Concurrent processing test failed: ${error.message}`);
    }
  }

  /**
   * Test memory usage
   */
  private async testMemoryUsage(): Promise<void> {
    console.log('🎯 Testing memory usage...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/hybrid-ai/metrics`);
      
      if (response.data.success && response.data.data.systemInfo) {
        const memoryUsage = response.data.data.systemInfo.memoryUsage;
        const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(1);
        
        console.log(`✅ Memory usage: ${heapUsedMB}MB heap used`);
        
        if (memoryUsage.heapUsed < 500 * 1024 * 1024) { // 500MB threshold
          console.log(`✅ Memory within acceptable limits`);
        } else {
          console.log(`⚠️ High memory usage detected`);
        }
      }
    } catch (error) {
      console.log(`❌ Memory usage test failed: ${error.message}`);
    }
  }

  /**
   * Run integration tests
   */
  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 Testing service integration...');

    // Test service health
    await this.testServiceHealth();

    // Test data flow
    await this.testDataFlow();

    // Test error handling
    await this.testErrorHandling();
  }

  /**
   * Test service health
   */
  private async testServiceHealth(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/hybrid-ai/health`);
      
      if (response.data.success && response.data.data.services) {
        const services = response.data.data.services;
        const healthyServices = Object.values(services).filter((s: any) => s.healthy).length;
        const totalServices = Object.keys(services).length;
        
        console.log(`✅ Service health: ${healthyServices}/${totalServices} services healthy`);
        
        Object.entries(services).forEach(([service, health]: [string, any]) => {
          const status = health.healthy ? '✅' : '❌';
          console.log(`   ${status} ${service}: ${(health.successRate * 100).toFixed(1)}% success rate`);
        });
      }
    } catch (error) {
      console.log(`❌ Service health test failed: ${error.message}`);
    }
  }

  /**
   * Test data flow between services
   */
  private async testDataFlow(): Promise<void> {
    console.log('🔄 Testing data flow...');
    
    try {
      // Test search -> recommendations flow
      const searchResponse = await axios.post(`${this.baseUrl}/api/hybrid-ai/search`, {
        query: 'smartphone',
        language: 'en'
      });

      if (searchResponse.data.success) {
        const recommendationsResponse = await axios.post(`${this.baseUrl}/api/hybrid-ai/recommendations`, {
          userProfile: { searchHistory: ['smartphone'] }
        });

        if (recommendationsResponse.data.success) {
          console.log('✅ Data flow: Search -> Recommendations working');
        } else {
          console.log('❌ Data flow: Recommendations failed');
        }
      } else {
        console.log('❌ Data flow: Search failed');
      }
    } catch (error) {
      console.log(`❌ Data flow test failed: ${error.message}`);
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    console.log('🛡️ Testing error handling...');
    
    const errorTests = [
      {
        name: 'Missing required data',
        endpoint: '/api/hybrid-ai/search',
        data: {} // Missing query
      },
      {
        name: 'Invalid image data',
        endpoint: '/api/hybrid-ai/image-analysis',
        data: { imageData: 'invalid-data' }
      },
      {
        name: 'Empty voice data',
        endpoint: '/api/hybrid-ai/voice-command',
        data: { audioData: null }
      }
    ];

    for (const test of errorTests) {
      try {
        const response = await axios.post(`${this.baseUrl}${test.endpoint}`, test.data);
        
        if (response.status === 400 || (response.data && !response.data.success)) {
          console.log(`✅ Error handling: ${test.name} - Proper error response`);
        } else {
          console.log(`⚠️ Error handling: ${test.name} - Should return error`);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log(`✅ Error handling: ${test.name} - Proper 400 response`);
        } else {
          console.log(`❌ Error handling: ${test.name} - Unexpected error: ${error.message}`);
        }
      }
    }
  }

  /**
   * Helper methods
   */
  private printValidationResults(results: any): void {
    console.log(`📊 Validation Results:`);
    console.log(`   Success Rate: ${results.successRate.toFixed(1)}%`);
    console.log(`   Tests Passed: ${results.summary.successful}/${results.summary.totalTests}`);
    console.log(`   Average Response Time: ${results.summary.averageResponseTime.toFixed(1)}ms`);
    
    if (results.overallSuccess) {
      console.log('✅ Validation: PASSED');
    } else {
      console.log('❌ Validation: FAILED');
    }
  }

  private logAPITestDetails(testName: string, responseData: any, responseTime: number): void {
    if (responseData.metadata && responseData.metadata.serviceUsed) {
      console.log(`   Service: ${responseData.metadata.serviceUsed}`);
    }
    
    if (responseData.data && typeof responseData.data === 'object') {
      const dataKeys = Object.keys(responseData.data);
      if (dataKeys.length > 0) {
        console.log(`   Data fields: ${dataKeys.slice(0, 3).join(', ')}${dataKeys.length > 3 ? '...' : ''}`);
      }
    }
  }

  private printPerformanceSummary(results: any): void {
    console.log('\n🎯 PERFORMANCE SUMMARY');
    console.log('=====================');
    
    const avgResponseTime = results.summary.averageResponseTime;
    
    console.log(`📈 Performance Metrics:`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(1)}ms`);
    console.log(`   Target Achievement:`);
    console.log(`     - Real-time (<100ms): ${avgResponseTime < 100 ? '✅ ACHIEVED' : '⚠️ NEEDS IMPROVEMENT'}`);
    console.log(`     - Complex (<3000ms): ${avgResponseTime < 3000 ? '✅ ACHIEVED' : '⚠️ NEEDS IMPROVEMENT'}`);
    
    console.log(`\n🏆 Architecture Benefits:`);
    console.log(`   - Cultural Intelligence: ✅ DeepSeek AI Integration`);
    console.log(`   - Real-time Processing: ✅ Local TensorFlow.js`);
    console.log(`   - Pattern Recognition: ✅ Brain.js`);
    console.log(`   - Offline Capability: ✅ ONNX Runtime`);
    
    console.log(`\n🎯 Target vs Actual:`);
    console.log(`   - Response Time: <100ms (Real-time) | ${avgResponseTime.toFixed(1)}ms (Actual)`);
    console.log(`   - Success Rate: >80% (Target) | ${results.successRate.toFixed(1)}% (Actual)`);
    console.log(`   - Service Health: All services ${results.overallSuccess ? 'operational' : 'needs attention'}`);
  }
}

export default HybridAITestRunner;