/**
 * FINAL SYSTEM VALIDATION - Quick Performance Test
 * All Services Integration Verification
 * July 20, 2025
 */

console.log('🚀 FINAL SYSTEM VALIDATION STARTING...\n');

const BASE_URL = 'http://localhost:5000/api/advanced-ai';

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
  }
  
  return data;
}

async function runFinalValidation() {
  const testResults = { total: 0, passed: 0, failed: 0 };
  
  // Test 1: Multi-dimensional suggestions
  try {
    testResults.total++;
    const response = await makeRequest('/multi-dimensional-suggestions', 'POST', {
      query: 'smartphone',
      language: 'en',
      userLocation: 'dhaka'
    });
    
    if (response.success && response.data.length > 0) {
      testResults.passed++;
      console.log('✅ Advanced DeepSeek Service: OPERATIONAL');
    } else {
      testResults.failed++;
      console.log('❌ Advanced DeepSeek Service: FAILED');
    }
  } catch (error) {
    testResults.failed++;
    console.log('❌ Advanced DeepSeek Service: ERROR -', error.message);
  }
  
  // Test 2: System Status
  try {
    testResults.total++;
    const response = await makeRequest('/system-status');
    
    if (response.success && response.data.overallStatus === 'all_systems_operational') {
      testResults.passed++;
      console.log('✅ System Status: ALL_SYSTEMS_OPERATIONAL');
    } else {
      testResults.failed++;
      console.log('⚠️ System Status:', response.data.overallStatus);
    }
  } catch (error) {
    testResults.failed++;
    console.log('❌ System Status: ERROR -', error.message);
  }
  
  // Test 3: Integration Test
  try {
    testResults.total++;
    const response = await makeRequest('/integration-test');
    
    if (response.success) {
      testResults.passed++;
      console.log(`✅ Integration Test: ${response.data.passedCount}/6 services passed`);
    } else {
      testResults.failed++;
      console.log('❌ Integration Test: FAILED');
    }
  } catch (error) {
    testResults.failed++;
    console.log('❌ Integration Test: ERROR -', error.message);
  }
  
  // Test 4: Cultural Analysis
  try {
    testResults.total++;
    const response = await makeRequest('/cultural-analysis', 'POST', {
      query: 'eid collection',
      language: 'bn',
      userLocation: 'dhaka'
    });
    
    if (response.success && response.data.culturalContext) {
      testResults.passed++;
      console.log('✅ Cultural Intelligence: OPERATIONAL');
    } else {
      testResults.failed++;
      console.log('❌ Cultural Intelligence: FAILED');
    }
  } catch (error) {
    testResults.failed++;
    console.log('❌ Cultural Intelligence: ERROR -', error.message);
  }
  
  // Test 5: Cache Performance
  try {
    testResults.total++;
    const response = await makeRequest('/cache-stats');
    
    if (response.success && response.data.health.status === 'healthy') {
      testResults.passed++;
      console.log('✅ Redis Cache: OPERATIONAL');
    } else {
      testResults.failed++;
      console.log('❌ Redis Cache: FAILED');
    }
  } catch (error) {
    testResults.failed++;
    console.log('❌ Redis Cache: ERROR -', error.message);
  }
  
  // Test 6: Analytics
  try {
    testResults.total++;
    const response = await makeRequest('/comprehensive-analytics?timeframe=24h');
    
    if (response.success && response.data.search) {
      testResults.passed++;
      console.log('✅ Comprehensive Analytics: OPERATIONAL');
    } else {
      testResults.failed++;
      console.log('❌ Comprehensive Analytics: FAILED');
    }
  } catch (error) {
    testResults.failed++;
    console.log('❌ Comprehensive Analytics: ERROR -', error.message);
  }
  
  // Final Results
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(50));
  console.log('🏆 FINAL SYSTEM VALIDATION COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${successRate}%`);
  
  if (successRate >= 100) {
    console.log('\n🎯 VERDICT: 100% SUCCESS - ALL SYSTEMS OPERATIONAL');
    console.log('🚀 Ready for production deployment');
  } else if (successRate >= 80) {
    console.log('\n🟡 VERDICT: MOSTLY OPERATIONAL - MINOR ISSUES');
    console.log('⚠️ Review failed tests');
  } else {
    console.log('\n🔴 VERDICT: CRITICAL ISSUES DETECTED');
    console.log('❌ System requires attention');
  }
  console.log('='.repeat(50));
}

// Run the final validation
runFinalValidation().catch(error => {
  console.error('💥 FATAL ERROR:', error);
  process.exit(1);
});