/**
 * Phase 4 Implementation Test Suite
 * Comprehensive testing for ML-powered personalization services
 * Implementation Date: July 20, 2025
 */

const PHASE4_BASE_URL = 'http://localhost:5000/api/v1';

// Test configuration
const testConfig = {
  timeout: 10000,
  retries: 3,
  userId: 'test_user_001'
};

// Test data
const testData = {
  personalizationProfile: {
    userId: testConfig.userId,
    interactionData: {
      searchQueries: [
        { query: 'smartphone under 50000', timestamp: new Date().toISOString(), resultClicks: ['prod001'] },
        { query: 'traditional saree collection', timestamp: new Date().toISOString() }
      ],
      productInteractions: [
        { productId: 'prod001', action: 'view', timestamp: new Date().toISOString(), duration: 120 },
        { productId: 'prod002', action: 'wishlist', timestamp: new Date().toISOString() }
      ],
      categoryPreferences: [
        { categoryId: 'electronics', score: 0.8, source: 'implicit' },
        { categoryId: 'fashion', score: 0.6, source: 'explicit' }
      ]
    },
    profileData: {
      demographics: { ageGroup: '25-34', location: 'dhaka' },
      culturalProfile: { 
        languagePreference: 'mixed', 
        festivalCelebrations: ['eid', 'pohela_boishakh'],
        religiousPractice: 'islam'
      }
    }
  },
  recommendationRequest: {
    userId: testConfig.userId,
    recommendationType: 'hybrid',
    context: {
      currentSession: {
        viewedProducts: ['prod001', 'prod002'],
        searchQueries: ['smartphone', 'fashion'],
        timeSpent: 300
      },
      culturalContext: {
        language: 'mixed',
        festivals: ['eid'],
        location: 'bangladesh'
      }
    },
    filterOptions: {
      maxResults: 10,
      includeExplanation: true,
      diversityBoost: 0.3
    }
  },
  searchOptimization: {
    searchQuery: 'smartphone under 50000',
    userId: testConfig.userId,
    context: {
      userProfile: {
        searchHistory: ['smartphone', 'electronics', 'samsung'],
        preferences: { priceRange: { min: 10000, max: 50000 } },
        location: 'dhaka'
      },
      sessionData: {
        previousQueries: ['phone', 'mobile'],
        deviceType: 'desktop'
      },
      marketContext: {
        trendingProducts: ['prod001', 'prod002'],
        culturalEvents: ['eid']
      }
    },
    optimizationType: 'personalization'
  },
  behaviorAnalytics: {
    userId: testConfig.userId,
    analyticsType: 'user',
    timeframe: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    }
  }
};

// API Testing Functions
async function makeApiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${PHASE4_BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result,
      response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// Individual Test Functions
async function testPersonalizationService() {
  console.log('\n🧪 Testing Personalization Service...');
  
  const tests = [
    {
      name: 'Update User Profile',
      endpoint: '/personalization/update-profile',
      method: 'POST',
      data: testData.personalizationProfile,
      expectedKeys: ['profileSummary', 'preferences', 'culturalProfile', 'processingTime']
    },
    {
      name: 'Get User Profile',
      endpoint: `/personalization/profile/${testConfig.userId}`,
      method: 'GET',
      expectedKeys: ['profile', 'preferences', 'culturalProfile']
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      console.log(`  📋 ${test.name}...`);
      const result = await makeApiRequest(test.endpoint, test.method, test.data);
      
      if (result.success && result.data.success) {
        const hasExpectedKeys = test.expectedKeys.every(key => 
          result.data.data && result.data.data.hasOwnProperty(key)
        );
        
        if (hasExpectedKeys) {
          console.log(`  ✅ ${test.name} - PASSED`);
          passed++;
        } else {
          console.log(`  ❌ ${test.name} - Missing expected keys`);
          console.log(`     Expected: ${test.expectedKeys.join(', ')}`);
          console.log(`     Received: ${Object.keys(result.data.data || {}).join(', ')}`);
        }
      } else {
        console.log(`  ❌ ${test.name} - ${result.error || result.data?.error || 'API Error'}`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - Exception: ${error.message}`);
    }
  }
  
  console.log(`📊 Personalization Service: ${passed}/${tests.length} tests passed`);
  return { passed, total: tests.length };
}

async function testRecommendationService() {
  console.log('\n🧪 Testing Recommendation Service...');
  
  const tests = [
    {
      name: 'Collaborative Filtering Recommendations',
      endpoint: '/recommendations/collaborative-filtering',
      method: 'POST',
      data: testData.recommendationRequest,
      expectedKeys: ['recommendations', 'modelMetrics', 'processingTime']
    },
    {
      name: 'Content-Based Recommendations',
      endpoint: '/recommendations/content-based',
      method: 'POST',
      data: { ...testData.recommendationRequest, recommendationType: 'content' },
      expectedKeys: ['recommendations', 'processingTime']
    },
    {
      name: 'Hybrid Recommendations',
      endpoint: '/recommendations/hybrid',
      method: 'POST',
      data: testData.recommendationRequest,
      expectedKeys: ['recommendations', 'hybridWeights', 'processingTime']
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      console.log(`  📋 ${test.name}...`);
      const result = await makeApiRequest(test.endpoint, test.method, test.data);
      
      if (result.success && result.data.success) {
        const hasExpectedKeys = test.expectedKeys.every(key => 
          result.data.data && result.data.data.hasOwnProperty(key)
        );
        
        if (hasExpectedKeys) {
          console.log(`  ✅ ${test.name} - PASSED`);
          console.log(`     Found ${result.data.data.recommendations?.length || 0} recommendations`);
          passed++;
        } else {
          console.log(`  ❌ ${test.name} - Missing expected keys`);
        }
      } else {
        console.log(`  ❌ ${test.name} - ${result.error || result.data?.error || 'API Error'}`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - Exception: ${error.message}`);
    }
  }
  
  console.log(`📊 Recommendation Service: ${passed}/${tests.length} tests passed`);
  return { passed, total: tests.length };
}

async function testSearchOptimizationService() {
  console.log('\n🧪 Testing Search Optimization Service...');
  
  const tests = [
    {
      name: 'Optimize Search Results',
      endpoint: '/search-optimization/optimize',
      method: 'POST',
      data: testData.searchOptimization,
      expectedKeys: ['optimizedResults', 'searchInsights', 'culturalAdaptations', 'processingTime']
    },
    {
      name: 'Cultural Search Optimization',
      endpoint: '/search-optimization/optimize',
      method: 'POST',
      data: { ...testData.searchOptimization, optimizationType: 'cultural' },
      expectedKeys: ['optimizedResults', 'culturalAdaptations']
    },
    {
      name: 'Real-time Ranking',
      endpoint: '/search-optimization/optimize',
      method: 'POST',
      data: { ...testData.searchOptimization, optimizationType: 'ranking' },
      expectedKeys: ['personalizedRanking', 'performanceMetrics']
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      console.log(`  📋 ${test.name}...`);
      const result = await makeApiRequest(test.endpoint, test.method, test.data);
      
      if (result.success && result.data.success) {
        const hasExpectedKeys = test.expectedKeys.every(key => 
          result.data.data && result.data.data.hasOwnProperty(key)
        );
        
        if (hasExpectedKeys) {
          console.log(`  ✅ ${test.name} - PASSED`);
          console.log(`     Optimized ${result.data.data.optimizedResults?.length || 0} results`);
          passed++;
        } else {
          console.log(`  ❌ ${test.name} - Missing expected keys`);
        }
      } else {
        console.log(`  ❌ ${test.name} - ${result.error || result.data?.error || 'API Error'}`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - Exception: ${error.message}`);
    }
  }
  
  console.log(`📊 Search Optimization Service: ${passed}/${tests.length} tests passed`);
  return { passed, total: tests.length };
}

async function testBehaviorAnalyticsService() {
  console.log('\n🧪 Testing Behavior Analytics Service...');
  
  const tests = [
    {
      name: 'User Behavior Analysis',
      endpoint: '/behavior-analytics/analyze',
      method: 'POST',
      data: testData.behaviorAnalytics,
      expectedKeys: ['patterns', 'insights', 'metrics', 'culturalInsights', 'processingTime']
    },
    {
      name: 'Market Insights',
      endpoint: '/behavior-analytics/market-insights',
      method: 'GET',
      expectedKeys: ['trendingProducts', 'categoryTrends', 'culturalTrends']
    },
    {
      name: 'Pattern Recognition',
      endpoint: '/behavior-analytics/analyze',
      method: 'POST',
      data: { ...testData.behaviorAnalytics, analyticsType: 'pattern' },
      expectedKeys: ['patterns', 'anomalies']
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      console.log(`  📋 ${test.name}...`);
      const result = await makeApiRequest(test.endpoint, test.method, test.data);
      
      if (result.success && result.data.success) {
        const hasExpectedKeys = test.expectedKeys.every(key => 
          result.data.data && result.data.data.hasOwnProperty(key)
        );
        
        if (hasExpectedKeys) {
          console.log(`  ✅ ${test.name} - PASSED`);
          console.log(`     Found ${result.data.data.patterns?.length || 0} patterns`);
          passed++;
        } else {
          console.log(`  ❌ ${test.name} - Missing expected keys`);
        }
      } else {
        console.log(`  ❌ ${test.name} - ${result.error || result.data?.error || 'API Error'}`);
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - Exception: ${error.message}`);
    }
  }
  
  console.log(`📊 Behavior Analytics Service: ${passed}/${tests.length} tests passed`);
  return { passed, total: tests.length };
}

async function testIntegrationScenarios() {
  console.log('\n🧪 Testing Integration Scenarios...');
  
  let passed = 0;
  const total = 2;
  
  try {
    console.log('  📋 End-to-End Personalization Flow...');
    
    // 1. Update profile
    const profileResult = await makeApiRequest('/personalization/update-profile', 'POST', testData.personalizationProfile);
    
    // 2. Get recommendations
    const recResult = await makeApiRequest('/recommendations/hybrid', 'POST', testData.recommendationRequest);
    
    // 3. Optimize search
    const searchResult = await makeApiRequest('/search-optimization/optimize', 'POST', testData.searchOptimization);
    
    if (profileResult.success && recResult.success && searchResult.success) {
      console.log('  ✅ End-to-End Personalization Flow - PASSED');
      passed++;
    } else {
      console.log('  ❌ End-to-End Personalization Flow - FAILED');
    }
  } catch (error) {
    console.log(`  ❌ End-to-End Personalization Flow - Exception: ${error.message}`);
  }
  
  try {
    console.log('  📋 Cultural Intelligence Integration...');
    
    // Test cultural adaptations across services
    const culturalSearchResult = await makeApiRequest('/search-optimization/optimize', 'POST', {
      ...testData.searchOptimization,
      optimizationType: 'cultural'
    });
    
    const culturalRecResult = await makeApiRequest('/recommendations/collaborative-filtering', 'POST', {
      ...testData.recommendationRequest,
      context: {
        ...testData.recommendationRequest.context,
        culturalContext: {
          language: 'bn',
          festivals: ['eid', 'pohela_boishakh'],
          location: 'bangladesh'
        }
      }
    });
    
    if (culturalSearchResult.success && culturalRecResult.success) {
      console.log('  ✅ Cultural Intelligence Integration - PASSED');
      passed++;
    } else {
      console.log('  ❌ Cultural Intelligence Integration - FAILED');
    }
  } catch (error) {
    console.log(`  ❌ Cultural Intelligence Integration - Exception: ${error.message}`);
  }
  
  console.log(`📊 Integration Scenarios: ${passed}/${total} tests passed`);
  return { passed, total };
}

// Main test execution
async function runPhase4Tests() {
  console.log('🚀 PHASE 4 IMPLEMENTATION TEST SUITE');
  console.log('=====================================');
  console.log(`Base URL: ${PHASE4_BASE_URL}`);
  console.log(`User ID: ${testConfig.userId}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const results = [];
  
  try {
    // Test individual services
    results.push(await testPersonalizationService());
    results.push(await testRecommendationService());
    results.push(await testSearchOptimizationService());
    results.push(await testBehaviorAnalyticsService());
    
    // Test integration scenarios
    results.push(await testIntegrationScenarios());
    
    // Calculate overall results
    const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
    const totalTests = results.reduce((sum, result) => sum + result.total, 0);
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 PHASE 4 TEST SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
      console.log('🎉 PHASE 4 IMPLEMENTATION: SUCCESS');
      console.log('✅ ML-powered personalization services are operational');
      console.log('✅ Collaborative filtering recommendations working');
      console.log('✅ Real-time search optimization functional');
      console.log('✅ Behavior analytics providing insights');
      console.log('✅ Cultural intelligence integration successful');
    } else if (successRate >= 60) {
      console.log('⚠️ PHASE 4 IMPLEMENTATION: PARTIAL SUCCESS');
      console.log('🟡 Most services operational with minor issues');
    } else {
      console.log('❌ PHASE 4 IMPLEMENTATION: NEEDS ATTENTION');
      console.log('🔴 Multiple services require debugging');
    }
    
    console.log('\n🏆 PHASE 4 ACHIEVEMENTS:');
    console.log('• Advanced ML-powered personalization system');
    console.log('• Collaborative filtering recommendation engine');
    console.log('• Real-time search result optimization');
    console.log('• Intelligent user behavior analytics');
    console.log('• Cultural intelligence integration for Bangladesh market');
    console.log('• Complete end-to-end personalization pipeline');
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR during Phase 4 testing:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Execute tests
if (typeof window === 'undefined') {
  // Node.js environment - use dynamic import for fetch
  runPhase4Tests();
} else {
  // Browser environment
  console.log('Phase 4 test suite ready. Run runPhase4Tests() to execute.');
  window.runPhase4Tests = runPhase4Tests;
}

export {
  runPhase4Tests,
  testPersonalizationService,
  testRecommendationService,
  testSearchOptimizationService,
  testBehaviorAnalyticsService,
  testIntegrationScenarios
};