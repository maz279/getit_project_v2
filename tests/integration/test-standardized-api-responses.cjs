/**
 * Test Standardized API Responses
 * Week 2 API Response Format Standardization Testing
 * Amazon.com/Shopee.sg-Level Response Consistency Validation
 */

const axios = require('axios');

class StandardizedAPIResponseTester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.testResults = [];
  }

  logTest(testName, success, result, error = null) {
    const testResult = {
      test: testName,
      success,
      result,
      timestamp: new Date().toISOString()
    };

    if (error) {
      testResult.error = error;
    }

    this.testResults.push(testResult);
    console.log(`${success ? '✅' : '❌'} ${testName}: ${success ? 'PASS' : 'FAIL'}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
  }

  async testHealthEndpoint() {
    try {
      const response = await axios.get(`${this.baseURL}/api/health`);
      
      // Check standardized response structure
      if (response.data.success === true && 
          response.data.data && 
          response.data.metadata) {
        
        // Check headers
        if (response.headers['x-request-id'] && 
            response.headers['x-api-version']) {
          this.logTest('Health Endpoint - Standardized Response', true, 
            `Status: ${response.status}, Success: ${response.data.success}, Processing Time: ${response.data.metadata.processingTime}ms`);
        } else {
          this.logTest('Health Endpoint - Standardized Response', false, 
            'Missing standardized headers');
        }
      } else {
        this.logTest('Health Endpoint - Standardized Response', false, 
          'Invalid response structure');
      }
    } catch (error) {
      this.logTest('Health Endpoint - Standardized Response', false, 
        'Request failed', error.message);
    }
  }

  async testTestEndpoint() {
    try {
      const response = await axios.get(`${this.baseURL}/api/test`);
      
      // Check standardized response structure
      if (response.data.success === true && 
          response.data.data && 
          response.data.metadata) {
        
        // Check headers
        if (response.headers['x-request-id'] && 
            response.headers['x-api-version']) {
          this.logTest('Test Endpoint - Standardized Response', true, 
            `Status: ${response.status}, Success: ${response.data.success}, Processing Time: ${response.data.metadata.processingTime}ms`);
        } else {
          this.logTest('Test Endpoint - Standardized Response', false, 
            'Missing standardized headers');
        }
      } else {
        this.logTest('Test Endpoint - Standardized Response', false, 
          'Invalid response structure');
      }
    } catch (error) {
      this.logTest('Test Endpoint - Standardized Response', false, 
        'Request failed', error.message);
    }
  }

  async testSearchEndpoint() {
    try {
      const response = await axios.get(`${this.baseURL}/api/search/products-enhanced?q=test`);
      
      // Check standardized response structure
      if (response.data.success === true && 
          response.data.data && 
          response.data.metadata) {
        
        // Check headers
        if (response.headers['x-request-id'] && 
            response.headers['x-api-version']) {
          this.logTest('Search Endpoint - Standardized Response', true, 
            `Status: ${response.status}, Success: ${response.data.success}, Processing Time: ${response.data.metadata.processingTime}ms`);
        } else {
          this.logTest('Search Endpoint - Standardized Response', false, 
            'Missing standardized headers');
        }
      } else {
        this.logTest('Search Endpoint - Standardized Response', false, 
          'Invalid response structure');
      }
    } catch (error) {
      this.logTest('Search Endpoint - Standardized Response', false, 
        'Request failed', error.message);
    }
  }

  async testRecommendationsEndpoint() {
    try {
      const response = await axios.get(`${this.baseURL}/api/recommendations/collaborative?userId=1&limit=5`);
      
      // Check standardized response structure
      if (response.data.success === true && 
          response.data.data && 
          response.data.metadata) {
        
        // Check headers
        if (response.headers['x-request-id'] && 
            response.headers['x-api-version']) {
          this.logTest('Recommendations Endpoint - Standardized Response', true, 
            `Status: ${response.status}, Success: ${response.data.success}, Processing Time: ${response.data.metadata.processingTime}ms`);
        } else {
          this.logTest('Recommendations Endpoint - Standardized Response', false, 
            'Missing standardized headers');
        }
      } else {
        this.logTest('Recommendations Endpoint - Standardized Response', false, 
          'Invalid response structure');
      }
    } catch (error) {
      this.logTest('Recommendations Endpoint - Standardized Response', false, 
        'Request failed', error.message);
    }
  }

  async testVoiceSearchEndpoint() {
    try {
      const response = await axios.post(`${this.baseURL}/api/products/voice-search`, {
        transcript: 'search for mobile phones'
      });
      
      // Check standardized response structure
      if (response.data.success === true && 
          response.data.data && 
          response.data.metadata) {
        
        // Check headers
        if (response.headers['x-request-id'] && 
            response.headers['x-api-version']) {
          this.logTest('Voice Search Endpoint - Standardized Response', true, 
            `Status: ${response.status}, Success: ${response.data.success}, Processing Time: ${response.data.metadata.processingTime}ms`);
        } else {
          this.logTest('Voice Search Endpoint - Standardized Response', false, 
            'Missing standardized headers');
        }
      } else {
        this.logTest('Voice Search Endpoint - Standardized Response', false, 
          'Invalid response structure');
      }
    } catch (error) {
      this.logTest('Voice Search Endpoint - Standardized Response', false, 
        'Request failed', error.message);
    }
  }

  async runAllTests() {
    console.log('\n🚀 STANDARDIZED API RESPONSE TESTING STARTED\n');
    
    await this.testHealthEndpoint();
    await this.testTestEndpoint();
    await this.testSearchEndpoint();
    await this.testRecommendationsEndpoint();
    await this.testVoiceSearchEndpoint();
    
    this.generateReport();
  }

  generateReport() {
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(t => t.success).length;
    const failedTests = totalTests - successfulTests;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);
    
    console.log('\n📊 STANDARDIZED API RESPONSE TEST REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Total Tests: ${totalTests}`);
    console.log(`✅ Successful Tests: ${successfulTests}`);
    console.log(`❌ Failed Tests: ${failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('═══════════════════════════════════════════════════════════');
    
    if (successRate >= 80) {
      console.log('🎉 EXCELLENT! Standardized API responses are working well.');
    } else if (successRate >= 60) {
      console.log('⚠️  GOOD! Some endpoints still need standardization.');
    } else {
      console.log('❌ NEEDS IMPROVEMENT! Most endpoints need standardization.');
    }
    
    console.log('\n🔧 DETAILED RESULTS:');
    this.testResults.forEach((test, index) => {
      console.log(`${index + 1}. ${test.test}: ${test.success ? 'PASS' : 'FAIL'}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });
  }
}

async function runStandardizedAPITests() {
  const tester = new StandardizedAPIResponseTester();
  await tester.runAllTests();
}

// Run the tests
runStandardizedAPITests().catch(console.error);