#!/usr/bin/env node

// Phase 3: Performance Optimization Test Suite
// Comprehensive validation of performance enhancements

const API_BASE = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : 'http://localhost:5000';

console.log('🧪 PHASE 3: PERFORMANCE OPTIMIZATION TEST SUITE');
console.log('==================================================');
console.log('Testing advanced performance features and optimizations...\n');

let testResults = {
  performanceOptimization: { passed: 0, total: 4 },
  advancedCaching: { passed: 0, total: 3 },
  batchProcessing: { passed: 0, total: 3 },
  metricsMonitoring: { passed: 0, total: 3 }
};

// Utility function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      timeout: 10000,
      ...options
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { raw: text, status: response.status };
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
      data: null
    };
  }
}

// Test 1: Performance Optimization Validation
console.log('⚡ PERFORMANCE OPTIMIZATION VALIDATION');
console.log('=====================================');

async function testOptimizedConversation() {
  console.log('   Testing optimized conversation endpoint...');
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What are the best smartphones available in Bangladesh?',
      conversationHistory: [],
      options: { urgent: false, maxTokens: 300 }
    })
  });
  
  if (response.ok && response.data?.success) {
    console.log('   ✅ Optimized Conversation: Active', `(${response.status})`);
    console.log(`   📊 Response Time: ${response.data.responseTime}ms`);
    console.log(`   📈 Cache Hit: ${response.data.cacheHit ? 'Yes' : 'No'}`);
    console.log(`   🔧 Optimization Level: ${response.data.metadata?.optimizationLevel || 'standard'}`);
    testResults.performanceOptimization.passed++;
  } else {
    console.log('   ❌ Optimized Conversation: Failed', `(${response.status})`);
  }
}

async function testUrgentProcessing() {
  console.log('   Testing urgent request processing...');
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Quick response needed: laptop recommendations',
      options: { urgent: true, maxTokens: 200, timeout: 5000 }
    })
  });
  
  if (response.ok && response.data?.success) {
    const isUrgent = response.data.responseTime < 3000; // Under 3 seconds for urgent
    console.log('   ✅ Urgent Processing:', isUrgent ? 'Fast' : 'Standard', `(${response.data.responseTime}ms)`);
    if (isUrgent) testResults.performanceOptimization.passed++;
  } else {
    console.log('   ❌ Urgent Processing: Failed', `(${response.status})`);
  }
}

async function testPerformanceMetrics() {
  console.log('   Testing performance metrics endpoint...');
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/performance-metrics`);
  
  if (response.ok && response.data?.success) {
    const metrics = response.data.data;
    console.log('   ✅ Performance Metrics: Available', `(${response.status})`);
    console.log(`   📊 Total Requests: ${metrics.totalRequests}`);
    console.log(`   📈 Cache Hit Rate: ${metrics.cacheHitRate}%`);
    console.log(`   ⚡ Performance Score: ${metrics.performanceScore}`);
    testResults.performanceOptimization.passed++;
  } else {
    console.log('   ❌ Performance Metrics: Failed', `(${response.status})`);
  }
}

async function testPerformanceHealth() {
  console.log('   Testing performance health monitoring...');
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/performance-health`);
  
  if (response.ok && response.data?.success) {
    const health = response.data.data;
    console.log('   ✅ Performance Health: Available', `(${response.status})`);
    console.log(`   🏥 Status: ${health.status}`);
    console.log(`   📊 Performance Score: ${health.performanceScore}`);
    console.log(`   ⚡ Target Achievement: ${health.targetAchievement ? 'Yes' : 'No'}`);
    testResults.performanceOptimization.passed++;
  } else {
    console.log('   ❌ Performance Health: Failed', `(${response.status})`);
  }
}

testResults.performanceOptimization.total = 4;

// Test 2: Advanced Caching Validation
console.log('\n📋 ADVANCED CACHING VALIDATION');
console.log('==============================');

async function testCacheEfficiency() {
  console.log('   Testing cache efficiency with repeated requests...');
  
  // First request - should miss cache
  const firstResponse = await makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'cache test: best rice brands in Bangladesh',
      options: { maxTokens: 200 }
    })
  });
  
  if (!firstResponse.ok) {
    console.log('   ❌ Cache Test: First request failed');
    return;
  }
  
  // Wait a moment then repeat - should hit cache
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const secondResponse = await makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'cache test: best rice brands in Bangladesh',
      options: { maxTokens: 200 }
    })
  });
  
  if (secondResponse.ok && secondResponse.data?.cacheHit) {
    console.log('   ✅ Cache Efficiency: Working', `(Cache hit on repeat)`);
    console.log(`   📈 Performance Gain: ${secondResponse.data.optimization?.performanceGain || 0}ms`);
    testResults.advancedCaching.passed++;
  } else {
    console.log('   ⚠️ Cache Efficiency: No cache hit detected');
  }
}

async function testCacheManagement() {
  console.log('   Testing cache management endpoint...');
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/cache-management`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'stats' })
  });
  
  if (response.ok && response.data?.success) {
    console.log('   ✅ Cache Management: Available', `(${response.status})`);
    console.log(`   📊 Cache Size: ${response.data.data.cacheSize} entries`);
    console.log(`   📈 Cache Hit Rate: ${response.data.data.cacheHitRate}%`);
    testResults.advancedCaching.passed++;
  } else {
    console.log('   ❌ Cache Management: Failed', `(${response.status})`);
  }
}

async function testCompressionSavings() {
  console.log('   Testing response compression optimization...');
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Please provide a detailed explanation of Bangladesh ecommerce market trends, consumer behavior, payment methods, logistics challenges, mobile commerce adoption, and future growth prospects for the next five years including specific statistics and market data',
      options: { maxTokens: 500 }
    })
  });
  
  if (response.ok && response.data?.success) {
    const compressed = response.data.optimization?.compressed;
    console.log('   ✅ Compression Test: Completed', compressed ? '(Compressed)' : '(Standard)');
    console.log(`   📊 Response Length: ${response.data.response?.length || 0} chars`);
    if (response.data.response?.length > 1000) testResults.advancedCaching.passed++;
  } else {
    console.log('   ❌ Compression Test: Failed', `(${response.status})`);
  }
}

testResults.advancedCaching.total = 3;

// Test 3: Batch Processing Validation
console.log('\n🔗 BATCH PROCESSING VALIDATION');
console.log('==============================');

async function testBatchConversation() {
  console.log('   Testing batch conversation processing...');
  const batchRequests = [
    { message: 'Best mobile phones under 20k BDT?', maxTokens: 150 },
    { message: 'Popular clothing brands in Dhaka?', maxTokens: 150 },
    { message: 'Traditional food delivery options?', maxTokens: 150 }
  ];
  
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/batch-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: batchRequests })
  });
  
  if (response.ok && response.data?.success) {
    console.log('   ✅ Batch Processing: Available', `(${response.status})`);
    console.log(`   📊 Batch Size: ${response.data.batchSize}`);
    console.log(`   ✅ Successful: ${response.data.successful}/${response.data.batchSize}`);
    console.log(`   ⚡ Average Response Time: ${response.data.averageResponseTime}ms`);
    testResults.batchProcessing.passed++;
  } else {
    console.log('   ❌ Batch Processing: Failed', `(${response.status})`);
  }
}

async function testBatchEfficiency() {
  console.log('   Testing batch processing efficiency...');
  
  // Single requests timing
  const singleStart = Date.now();
  const singlePromises = [
    makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test query 1', options: { maxTokens: 100 } })
    }),
    makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test query 2', options: { maxTokens: 100 } })
    })
  ];
  
  await Promise.all(singlePromises);
  const singleTime = Date.now() - singleStart;
  
  // Batch request timing
  const batchStart = Date.now();
  const batchResponse = await makeRequest(`${API_BASE}/api/phase3-performance/batch-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { message: 'test query 1', maxTokens: 100 },
        { message: 'test query 2', maxTokens: 100 }
      ]
    })
  });
  const batchTime = Date.now() - batchStart;
  
  if (batchResponse.ok) {
    const efficiency = ((singleTime - batchTime) / singleTime) * 100;
    console.log('   ✅ Batch Efficiency: Measured');
    console.log(`   📊 Single Requests: ${singleTime}ms`);
    console.log(`   📊 Batch Request: ${batchTime}ms`);
    console.log(`   📈 Efficiency Gain: ${Math.max(0, efficiency).toFixed(1)}%`);
    if (efficiency > 0) testResults.batchProcessing.passed++;
  } else {
    console.log('   ❌ Batch Efficiency: Failed to measure');
  }
}

async function testBatchSizeValidation() {
  console.log('   Testing batch size limits...');
  
  // Test with oversized batch (should fail)
  const oversizedRequests = Array(15).fill({ message: 'test', maxTokens: 50 });
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/batch-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: oversizedRequests })
  });
  
  if (response.status === 400 && response.data?.error?.includes('exceeded')) {
    console.log('   ✅ Batch Size Validation: Working', '(Correctly rejected oversized batch)');
    testResults.batchProcessing.passed++;
  } else {
    console.log('   ❌ Batch Size Validation: Failed', `(${response.status})`);
  }
}

testResults.batchProcessing.total = 3;

// Test 4: Metrics and Monitoring Validation
console.log('\n📊 METRICS & MONITORING VALIDATION');
console.log('===================================');

async function testMetricsAccuracy() {
  console.log('   Testing metrics accuracy and tracking...');
  
  // Get initial metrics
  const initialResponse = await makeRequest(`${API_BASE}/api/phase3-performance/performance-metrics`);
  if (!initialResponse.ok) {
    console.log('   ❌ Metrics Accuracy: Failed to get initial metrics');
    return;
  }
  
  const initialMetrics = initialResponse.data.data;
  
  // Make a few requests
  await makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'metrics test 1', options: { maxTokens: 100 } })
  });
  
  await makeRequest(`${API_BASE}/api/phase3-performance/optimized-conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'metrics test 2', options: { maxTokens: 100 } })
  });
  
  // Get updated metrics
  const updatedResponse = await makeRequest(`${API_BASE}/api/phase3-performance/performance-metrics`);
  if (updatedResponse.ok) {
    const updatedMetrics = updatedResponse.data.data;
    const requestsIncreased = updatedMetrics.totalRequests > initialMetrics.totalRequests;
    
    console.log('   ✅ Metrics Accuracy:', requestsIncreased ? 'Tracking' : 'Static');
    console.log(`   📊 Requests Tracked: ${updatedMetrics.totalRequests} (was ${initialMetrics.totalRequests})`);
    if (requestsIncreased) testResults.metricsMonitoring.passed++;
  } else {
    console.log('   ❌ Metrics Accuracy: Failed to get updated metrics');
  }
}

async function testMonitoringAlerts() {
  console.log('   Testing performance monitoring thresholds...');
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/performance-health`);
  
  if (response.ok && response.data?.success) {
    const health = response.data.data;
    const hasThresholds = typeof health.performanceScore === 'number' && 
                         typeof health.averageResponseTime === 'number';
    
    console.log('   ✅ Monitoring Alerts: Available', `(${response.status})`);
    console.log(`   🏥 Health Status: ${health.status}`);
    console.log(`   📊 Performance Score: ${health.performanceScore}/100`);
    console.log(`   ⚡ Target Achievement: ${health.targetAchievement ? 'Met' : 'Pending'}`);
    
    if (hasThresholds) testResults.metricsMonitoring.passed++;
  } else {
    console.log('   ❌ Monitoring Alerts: Failed', `(${response.status})`);
  }
}

async function testOptimizationConfig() {
  console.log('   Testing optimization configuration...');
  const response = await makeRequest(`${API_BASE}/api/phase3-performance/optimization-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        targetResponseTime: 400,
        cacheEnabled: true,
        batchingEnabled: true
      }
    })
  });
  
  if (response.ok && response.data?.success) {
    console.log('   ✅ Optimization Config: Available', `(${response.status})`);
    console.log(`   🔧 Config Updated: ${response.data.message}`);
    testResults.metricsMonitoring.passed++;
  } else {
    console.log('   ❌ Optimization Config: Failed', `(${response.status})`);
  }
}

testResults.metricsMonitoring.total = 3;

// Run all tests
async function runAllTests() {
  try {
    await testOptimizedConversation();
    await testUrgentProcessing();
    await testPerformanceMetrics();
    await testPerformanceHealth();
    
    await testCacheEfficiency();
    await testCacheManagement();
    await testCompressionSavings();
    
    await testBatchConversation();
    await testBatchEfficiency();
    await testBatchSizeValidation();
    
    await testMetricsAccuracy();
    await testMonitoringAlerts();
    await testOptimizationConfig();
    
  } catch (error) {
    console.error('Test execution error:', error);
  }
  
  // Calculate final results
  const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
  const totalTests = Object.values(testResults).reduce((sum, category) => sum + category.total, 0);
  const overallScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  
  console.log('\n\n============================================================');
  console.log('PHASE 3 IMPLEMENTATION ASSESSMENT');
  console.log('============================================================');
  console.log(`📊 Overall Score: ${totalPassed}/${totalTests} tests passed (${overallScore}%)\n`);
  
  for (const [category, results] of Object.entries(testResults)) {
    const categoryScore = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;
    const status = categoryScore >= 80 ? '✅' : categoryScore >= 60 ? '⚠️' : '❌';
    const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${categoryName}: ${results.passed}/${results.total} (${categoryScore}%)`);
  }
  
  console.log('\n============================================================');
  if (overallScore >= 85) {
    console.log('🎉 PHASE 3 IMPLEMENTATION SUCCESS');
    console.log('✅ Performance optimization meets production standards');
    console.log('🚀 Ready for Phase 3 production deployment');
  } else if (overallScore >= 70) {
    console.log('⚠️  PHASE 3 NEEDS OPTIMIZATION');
    console.log('📊 Core functionality working but needs refinement');
    console.log('🔧 Address failing tests before production deployment');
  } else {
    console.log('❌ PHASE 3 REQUIRES MAJOR IMPROVEMENTS');
    console.log('🚨 Significant issues detected');
    console.log('🔧 Comprehensive debugging and fixes needed');
  }
  
  console.log('\n📋 Phase 3 Implementation Summary:');
  console.log('   • Advanced performance optimization with intelligent caching');
  console.log('   • Batch processing for high-throughput scenarios');
  console.log('   • Comprehensive metrics and health monitoring');
  console.log('   • Optimization configuration and tuning capabilities');
  
  console.log('\n🎯 Next Steps:');
  if (overallScore >= 85) {
    console.log('   • Deploy to staging environment for final validation');
    console.log('   • Monitor performance optimization effectiveness');
    console.log('   • Begin Phase 4 enterprise features implementation');
  } else {
    console.log('   • Fix failing performance optimization tests');
    console.log('   • Optimize caching and batch processing systems');
    console.log('   • Enhance monitoring and alerting capabilities');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 3 PERFORMANCE OPTIMIZATION TEST COMPLETE');
  console.log('============================================================');
}

// Execute tests
runAllTests().catch(console.error);