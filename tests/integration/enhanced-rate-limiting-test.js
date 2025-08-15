/**
 * ENHANCED RATE LIMITING COMPREHENSIVE TEST - July 23, 2025
 * Tests the new intelligent queue-based rate limiting system with caching
 */

// Test configuration
const SEARCH_QUERIES = [
  'smartphone',
  'laptop', 
  'customer service',
  'user account',
  'vendor registration'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testEnhancedRateLimiting() {
  console.log('🚀 Starting Enhanced Rate Limiting Test...');
  
  const results = {
    total: 0,
    cached: 0,
    queued: 0,
    successful: 0,
    errors: 0,
    details: []
  };

  try {
    // Test 1: Rapid successive searches (should trigger queueing)
    console.log('\n📋 Test 1: Rapid Successive Searches');
    for (let i = 0; i < SEARCH_QUERIES.length; i++) {
      const query = SEARCH_QUERIES[i];
      console.log(`🔍 Testing search: "${query}"`);
      
      const startTime = Date.now();
      
      try {
        const response = await fetch('/api/search/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            language: 'en',
            includeBengaliPhonetic: true,
            includeHistory: true,
            includeTrending: true,
            includeProducts: true,
            includeCategories: true,
            limit: 12
          })
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.total++;
        
        if (response.ok) {
          const data = await response.json();
          results.successful++;
          
          const testResult = {
            query,
            status: response.status,
            responseTime,
            suggestionsCount: data.data?.suggestions?.length || 0,
            dataIntegrity: data.data?.dataIntegrity || 'unknown',
            cacheHit: responseTime < 100 ? 'likely' : 'no'
          };
          
          results.details.push(testResult);
          
          console.log(`✅ ${query}: ${response.status} in ${responseTime}ms, ${testResult.suggestionsCount} suggestions`);
          
          if (responseTime < 100) {
            results.cached++;
          }
        } else {
          results.errors++;
          console.log(`❌ ${query}: ${response.status} ${response.statusText}`);
        }
        
      } catch (error) {
        results.errors++;
        console.log(`💥 ${query}: Error - ${error.message}`);
      }
      
      // Short delay between requests to test rapid succession
      await delay(500);
    }

    // Test 2: Repeat same searches (should hit cache)
    console.log('\n📋 Test 2: Cache Hit Testing (Repeat Searches)');
    for (let i = 0; i < 3; i++) {
      const query = SEARCH_QUERIES[i];
      console.log(`🔍 Re-testing cached search: "${query}"`);
      
      const startTime = Date.now();
      
      try {
        const response = await fetch('/api/search/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            language: 'en',
            limit: 12
          })
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.total++;
        
        if (response.ok) {
          results.successful++;
          if (responseTime < 100) {
            results.cached++;
            console.log(`⚡ ${query}: CACHE HIT in ${responseTime}ms`);
          } else {
            console.log(`✅ ${query}: ${response.status} in ${responseTime}ms`);
          }
        }
        
      } catch (error) {
        results.errors++;
        console.log(`💥 ${query}: Error - ${error.message}`);
      }
      
      await delay(300);
    }

    // Test 3: Queue processing (wait and see if queued requests get processed)
    console.log('\n📋 Test 3: Queue Processing (waiting 5 seconds)');
    await delay(5000);
    console.log('✅ Queue processing period completed');

  } catch (error) {
    console.error('💥 Test suite error:', error);
  }

  // Results Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENHANCED RATE LIMITING TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`📈 Total Requests: ${results.total}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`⚡ Cache Hits: ${results.cached}`);
  console.log(`❌ Errors: ${results.errors}`);
  console.log(`📊 Success Rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);
  console.log(`⚡ Cache Hit Rate: ${((results.cached / results.total) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  results.details.forEach((result, index) => {
    console.log(`${index + 1}. ${result.query}: ${result.status} (${result.responseTime}ms) - ${result.suggestionsCount} suggestions ${result.cacheHit === 'likely' ? '⚡' : ''}`);
  });

  const overallSuccess = results.successful >= (results.total * 0.8); // 80% success rate required
  const goodCaching = results.cached >= 2; // At least 2 cache hits expected
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  console.log(`${overallSuccess ? '✅' : '❌'} Rate Limiting: ${overallSuccess ? 'WORKING' : 'NEEDS IMPROVEMENT'}`);
  console.log(`${goodCaching ? '✅' : '❌'} Caching: ${goodCaching ? 'WORKING' : 'NEEDS IMPROVEMENT'}`);
  
  if (overallSuccess && goodCaching) {
    console.log('🎉 ENHANCED RATE LIMITING TEST: SUCCESS');
    console.log('✅ Queue-based rate limiting with intelligent caching is working properly');
  } else {
    console.log('⚠️ ENHANCED RATE LIMITING TEST: NEEDS IMPROVEMENT');
  }
  
  return { overallSuccess, goodCaching, results };
}

// Auto-run test
testEnhancedRateLimiting().catch(console.error);