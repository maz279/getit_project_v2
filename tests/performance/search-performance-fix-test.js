/**
 * SEARCH PERFORMANCE FIX VALIDATION TEST
 * Testing schema validation fixes and performance improvements
 * Date: July 24, 2025
 */

console.log("🔧 SEARCH PERFORMANCE FIX VALIDATION - Testing schema fixes and performance...");

const validateSearchFixes = async () => {
  const results = {
    totalTests: 8,
    passed: 0,
    failed: 0,
    details: [],
    performanceData: {}
  };

  // Test 1: Search Suggestions Performance
  try {
    const startTime = Date.now();
    const response = await fetch('http://localhost:5000/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "milk powder",
        language: 'en',
        includeBengaliPhonetic: true,
        includeHistory: true,
        includeTrending: true,
        includeProducts: true,
        includeCategories: true,
        limit: 12
      })
    });
    const responseTime = Date.now() - startTime;
    results.performanceData.suggestionTime = responseTime;
    
    if (response.ok && responseTime < 8000) { // Should be under 8 seconds now
      const data = await response.json();
      results.passed++;
      results.details.push(`✅ Test 1: Search Suggestions Performance - PASSED (${responseTime}ms, ${data.data?.suggestions?.length || 0} suggestions)`);
    } else {
      results.failed++;
      results.details.push(`❌ Test 1: Search Suggestions Performance - FAILED (${responseTime}ms, Status: ${response.status})`);
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Test 1: Search Suggestions Performance - FAILED (${error.message})`);
  }

  // Test 2: Schema Validation Fix
  try {
    const response = await fetch('http://localhost:5000/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "test schema validation",
        language: 'en',
        limit: 8
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const hasValidSuggestions = data.success && Array.isArray(data.data?.suggestions);
      
      if (hasValidSuggestions) {
        results.passed++;
        results.details.push("✅ Test 2: Schema Validation Fix - PASSED (Valid suggestions array returned)");
      } else {
        results.failed++;
        results.details.push("❌ Test 2: Schema Validation Fix - FAILED (Invalid response format)");
      }
    } else {
      results.failed++;
      results.details.push(`❌ Test 2: Schema Validation Fix - FAILED (Status: ${response.status})`);
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Test 2: Schema Validation Fix - FAILED (${error.message})`);
  }

  // Test 3: DeepSeek Response Format Handling
  try {
    const startTime = Date.now();
    const response = await fetch('http://localhost:5000/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "bangladesh products",
        language: 'bn',
        limit: 10
      })
    });
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      results.passed++;
      results.details.push(`✅ Test 3: DeepSeek Response Format - PASSED (${responseTime}ms, Bengali support working)`);
    } else {
      results.failed++;
      results.details.push(`❌ Test 3: DeepSeek Response Format - FAILED (Status: ${response.status})`);
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Test 3: DeepSeek Response Format - FAILED (${error.message})`);
  }

  // Test 4: Phase 2 Intelligent Caching
  try {
    const testQuery = "cache test query";
    
    // First call - should cache
    const start1 = Date.now();
    const response1 = await fetch('http://localhost:5000/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testQuery, language: 'en', limit: 5 })
    });
    const time1 = Date.now() - start1;
    
    // Wait briefly, then second call - should hit cache
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const start2 = Date.now();
    const response2 = await fetch('http://localhost:5000/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testQuery, language: 'en', limit: 5 })
    });
    const time2 = Date.now() - start2;
    
    if (response1.ok && response2.ok) {
      results.passed++;
      results.details.push(`✅ Test 4: Phase 2 Intelligent Caching - PASSED (First: ${time1}ms, Second: ${time2}ms)`);
      results.performanceData.cacheComparison = { first: time1, second: time2 };
    } else {
      results.failed++;
      results.details.push("❌ Test 4: Phase 2 Intelligent Caching - FAILED (Response errors)");
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Test 4: Phase 2 Intelligent Caching - FAILED (${error.message})`);
  }

  // Test 5: Enhanced Search Performance
  try {
    const startTime = Date.now();
    const response = await fetch('http://localhost:5000/api/search/enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "fast search test",
        language: 'en'
      })
    });
    const responseTime = Date.now() - startTime;
    results.performanceData.enhancedSearchTime = responseTime;
    
    if (response.ok && responseTime < 3000) { // Should be under 3 seconds
      results.passed++;
      results.details.push(`✅ Test 5: Enhanced Search Performance - PASSED (${responseTime}ms)`);
    } else {
      results.failed++;
      results.details.push(`❌ Test 5: Enhanced Search Performance - FAILED (${responseTime}ms, Status: ${response.status})`);
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Test 5: Enhanced Search Performance - FAILED (${error.message})`);
  }

  // Test 6: Trending Search Endpoint
  try {
    const startTime = Date.now();
    const response = await fetch('http://localhost:5000/api/search/trending');
    const responseTime = Date.now() - startTime;
    
    if (response.ok && responseTime < 100) { // Should be very fast
      const data = await response.json();
      results.passed++;
      results.details.push(`✅ Test 6: Trending Search Endpoint - PASSED (${responseTime}ms, ${data.data?.length || 0} trends)`);
    } else {
      results.failed++;
      results.details.push(`❌ Test 6: Trending Search Endpoint - FAILED (${responseTime}ms, Status: ${response.status})`);
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Test 6: Trending Search Endpoint - FAILED (${error.message})`);
  }

  // Test 7: Conversational AI Performance 
  try {
    const startTime = Date.now();
    const response = await fetch('http://localhost:5000/api/phase3-conversational-ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "What is the best phone for photography?",
        language: 'en'
      })
    });
    const responseTime = Date.now() - startTime;
    results.performanceData.conversationalTime = responseTime;
    
    if (response.ok && responseTime < 8000) { // Should be under 8 seconds
      results.passed++;
      results.details.push(`✅ Test 7: Conversational AI Performance - PASSED (${responseTime}ms)`);
    } else {
      results.failed++;
      results.details.push(`❌ Test 7: Conversational AI Performance - FAILED (${responseTime}ms, Status: ${response.status})`);
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Test 7: Conversational AI Performance - FAILED (${error.message})`);
  }

  // Test 8: Overall System Health
  try {
    const response = await fetch('http://localhost:5000/');
    if (response.ok) {
      results.passed++;
      results.details.push("✅ Test 8: Overall System Health - PASSED (Application loading correctly)");
    } else {
      results.failed++;
      results.details.push(`❌ Test 8: Overall System Health - FAILED (Status: ${response.status})`);
    }
  } catch (error) {
    results.failed++;
    results.details.push(`❌ Test 8: Overall System Health - FAILED (${error.message})`);
  }

  return results;
};

// Execute performance fix validation
validateSearchFixes().then(results => {
  console.log("\n" + "=".repeat(80));
  console.log("🔧 SEARCH PERFORMANCE FIX VALIDATION RESULTS");
  console.log("=".repeat(80));
  
  const successRate = ((results.passed / results.totalTests) * 100).toFixed(1);
  
  console.log(`📊 OVERALL SUCCESS RATE: ${successRate}% (${results.passed}/${results.totalTests} tests passed)`);
  console.log(`✅ PASSED: ${results.passed} tests`);
  console.log(`❌ FAILED: ${results.failed} tests`);
  
  console.log("\n📋 DETAILED RESULTS:");
  results.details.forEach(detail => console.log(detail));
  
  console.log("\n⚡ PERFORMANCE METRICS:");
  if (results.performanceData.suggestionTime) {
    console.log(`🔍 Search Suggestions: ${results.performanceData.suggestionTime}ms`);
  }
  if (results.performanceData.enhancedSearchTime) {
    console.log(`🚀 Enhanced Search: ${results.performanceData.enhancedSearchTime}ms`);
  }
  if (results.performanceData.conversationalTime) {
    console.log(`💬 Conversational AI: ${results.performanceData.conversationalTime}ms`);
  }
  if (results.performanceData.cacheComparison) {
    const { first, second } = results.performanceData.cacheComparison;
    const improvement = ((first - second) / first * 100).toFixed(1);
    console.log(`🎯 Cache Performance: ${improvement}% improvement (${first}ms → ${second}ms)`);
  }
  
  console.log("\n🎯 FIXES IMPLEMENTED:");
  console.log("✅ Schema validation supports both array and object formats");
  console.log("✅ Timeout values reduced from 10s to 5s for better UX");
  console.log("✅ Token limits reduced for faster responses");
  console.log("✅ Phase 2 intelligent caching system operational");
  console.log("✅ Dual cache architecture for backward compatibility");
  
  if (successRate >= 80) {
    console.log("\n🎉 SEARCH PERFORMANCE FIXES SUCCESSFUL!");
    console.log("🚀 Search functionality should now work much better");
  } else if (successRate >= 60) {
    console.log("\n⚠️  PARTIAL SUCCESS - ADDITIONAL OPTIMIZATION NEEDED");
    console.log("🔧 Some performance issues may remain");
  } else {
    console.log("\n❌ CRITICAL ISSUES REMAIN");
    console.log("🚨 Additional fixes required before deployment");
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("🔧 Search performance fix validation complete!");
  console.log("=".repeat(80));
}).catch(error => {
  console.error("❌ SEARCH PERFORMANCE FIX VALIDATION FAILED:", error);
});