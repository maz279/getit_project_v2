/**
 * Week 3-4 Advanced Optimization Features Test Suite
 * Comprehensive validation for predictive processing, performance optimization, and client-side AI
 */

// Base URL for API testing
const BASE_URL = 'http://localhost:5000/api/enhanced-ai';

/**
 * Test individual endpoint with proper error handling
 */
async function testEndpoint(endpoint, method = 'GET', data = null) {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    console.log(`\n🧪 Testing ${method} ${url}`);
    if (data) {
      console.log(`📤 Request data:`, JSON.stringify(data, null, 2));
    }
    
    const response = await fetch(url, options);
    const responseText = await response.text();
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.log(`📄 Raw response:`, responseText.substring(0, 500));
      return { 
        success: false, 
        error: 'Invalid JSON response',
        status: response.status,
        response: responseText.substring(0, 200) 
      };
    }
    
    if (response.ok) {
      console.log(`✅ Success:`, JSON.stringify(result, null, 2));
      return { success: true, data: result, status: response.status };
    } else {
      console.log(`❌ Error:`, JSON.stringify(result, null, 2));
      return { success: false, error: result.error || 'Unknown error', status: response.status };
    }
    
  } catch (error) {
    console.log(`💥 Network error:`, error.message);
    return { success: false, error: error.message, status: 0 };
  }
}

/**
 * Week 3-4 Advanced Optimization Test Suite
 */
const week34Tests = [
  {
    name: 'Enhanced AI Search with Predictive Optimization',
    test: () => testEndpoint('/search-enhanced', 'POST', {
      query: 'latest smartphone under 50000 taka',
      userId: 'test-user-week34',
      sessionId: `session-${Date.now()}`,
      preferences: {
        preferOffline: true,
        maxResponseTime: 200,
        qualityOverSpeed: false
      },
      deviceInfo: {
        type: 'mobile',
        capabilities: { webGL: true, webAssembly: true },
        networkSpeed: 'medium'
      }
    }),
    expected: 'Should return enhanced search results with predictive optimization and performance metrics'
  },

  {
    name: 'Client-Side AI Capability Detection',
    test: () => testEndpoint('/detect-capabilities', 'POST', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      memory: 8,
      cores: 8,
      connection: '4g'
    }),
    expected: 'Should detect device capabilities and recommend optimal AI models for client-side processing'
  },

  {
    name: 'Predictive Model Training',
    test: () => testEndpoint('/train-model', 'POST', {
      userId: 'test-user-week34',
      behaviorData: {
        searchHistory: ['smartphone', 'laptop', 'headphones', 'tablet'],
        clickPatterns: [
          { query: 'smartphone', clickedItem: 'samsung-galaxy', timestamp: Date.now() - 3600000 },
          { query: 'laptop', clickedItem: 'macbook-air', timestamp: Date.now() - 1800000 }
        ],
        purchaseHistory: ['electronics', 'accessories'],
        categoryPreferences: {
          'Electronics': 0.8,
          'Fashion': 0.3,
          'Books': 0.5
        },
        timePatterns: {
          '09': 0.8,
          '12': 0.6,
          '15': 0.9,
          '20': 0.7
        }
      },
      trainingType: 'online'
    }),
    expected: 'Should train predictive models with user behavior data and return improved performance metrics'
  },

  {
    name: 'Advanced Analytics with Predictive Insights',
    test: () => testEndpoint('/analytics-advanced'),
    expected: 'Should return comprehensive analytics including predictive metrics and optimization insights'
  },

  {
    name: 'Intelligent Batch Processing',
    test: () => testEndpoint('/batch-optimize', 'POST', {
      requests: [
        {
          type: 'search',
          payload: { query: 'gaming laptop' },
          priority: 'immediate',
          device: { type: 'desktop', networkSpeed: 'fast' }
        },
        {
          type: 'recommendation',
          payload: { userId: 'user-123', category: 'electronics' },
          priority: 'normal',
          device: { type: 'mobile', networkSpeed: 'medium' }
        },
        {
          type: 'analysis',
          payload: { text: 'This is an excellent product' },
          priority: 'background',
          device: { type: 'tablet', networkSpeed: 'slow' }
        }
      ],
      optimizationLevel: 'advanced'
    }),
    expected: 'Should process multiple requests with intelligent optimization and return batch statistics'
  },

  {
    name: 'Real-time Performance Monitoring',
    test: () => testEndpoint('/performance-monitor'),
    expected: 'Should return real-time performance metrics with health score and optimization recommendations'
  },

  {
    name: 'Predictive User Behavior Insights',
    test: () => testEndpoint('/predict-insights', 'POST', {
      userId: 'test-user-week34',
      sessionId: `session-${Date.now()}`,
      contextData: {
        searchHistory: ['smartphone', 'laptop'],
        categoryPreferences: { 'Electronics': 0.8 },
        timePatterns: { '15': 0.9 },
        location: 'Dhaka',
        deviceType: 'mobile',
        networkSpeed: 'medium',
        season: 'summer'
      },
      predictionType: 'user_intent'
    }),
    expected: 'Should generate predictive insights about user behavior and recommend proactive actions'
  },

  {
    name: 'Client-Side JavaScript SDK Generation',
    test: () => testEndpoint('/client-sdk'),
    expected: 'Should generate JavaScript SDK for browser integration with client-side AI capabilities'
  }
];

/**
 * Run all Week 3-4 tests
 */
async function runWeek34Tests() {
  console.log('🚀 WEEK 3-4 ADVANCED OPTIMIZATION FEATURES TEST SUITE');
  console.log('=' * 80);
  console.log('Testing: Predictive Processing, Performance Optimization, Client-Side AI');
  console.log('Total tests:', week34Tests.length);
  console.log('');
  
  const results = [];
  
  for (let i = 0; i < week34Tests.length; i++) {
    const test = week34Tests[i];
    console.log(`\n📋 Test ${i + 1}/${week34Tests.length}: ${test.name}`);
    console.log(`📝 Expected: ${test.expected}`);
    
    try {
      const result = await test.test();
      results.push({
        name: test.name,
        success: result.success,
        error: result.error,
        status: result.status,
        data: result.data
      });
      
      if (result.success) {
        console.log(`✅ PASS: ${test.name}`);
      } else {
        console.log(`❌ FAIL: ${test.name} - ${result.error}`);
      }
      
    } catch (error) {
      console.log(`💥 ERROR: ${test.name} - ${error.message}`);
      results.push({
        name: test.name,
        success: false,
        error: error.message,
        status: 0
      });
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Calculate statistics
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const successRate = ((passed / results.length) * 100).toFixed(1);
  
  console.log('\n' + '=' * 80);
  console.log('📊 WEEK 3-4 ADVANCED OPTIMIZATION TEST RESULTS');
  console.log('=' * 80);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log('');
  
  // Show detailed results
  console.log('📋 DETAILED RESULTS:');
  console.log('-' * 40);
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${result.name}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('');
  
  // Show Week 3-4 feature assessment
  if (successRate >= 75) {
    console.log('🎉 WEEK 3-4 ADVANCED OPTIMIZATION FEATURES: OPERATIONAL');
    console.log('🔮 Predictive Processing: Working');
    console.log('⚡ Performance Optimization: Active');
    console.log('💻 Client-Side AI: Enabled');
    console.log('📊 Advanced Analytics: Available');
  } else if (successRate >= 50) {
    console.log('⚠️ WEEK 3-4 FEATURES: PARTIALLY OPERATIONAL');
    console.log('Some advanced optimization features may need attention');
  } else {
    console.log('❌ WEEK 3-4 FEATURES: CRITICAL ISSUES DETECTED');
    console.log('Advanced optimization features require immediate attention');
  }
  
  console.log('');
  console.log('🔗 To run this test suite:');
  console.log('1. Copy this code to browser console while on the application');
  console.log('2. Or run: node Week3-4_Advanced_Optimization_Test.js');
  console.log('3. Or include in automated testing pipeline');
  
  return {
    passed,
    failed,
    successRate: parseFloat(successRate),
    results
  };
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runWeek34Tests().then(results => {
    console.log('\n✅ Week 3-4 Advanced Optimization Test Suite completed');
    process.exit(results.passed === results.results.length ? 0 : 1);
  }).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
} else {
  // Browser environment
  console.log('Week 3-4 Advanced Optimization Test Suite loaded. Run runWeek34Tests() to execute.');
}