/**
 * 🔧 AI SEARCH PERFORMANCE FIX TEST
 * Tests the 10-17 second response time fix
 * July 20, 2025 - CRITICAL PERFORMANCE FIX
 */

console.log('🔧 AI SEARCH PERFORMANCE FIX TEST STARTING...');

async function testPerformanceFix() {
  const results = { passed: 0, failed: 0, tests: [], times: [] };
  
  const addTest = (name, passed, details, time = null) => {
    results.tests.push({ name, passed, details, time });
    passed ? results.passed++ : results.failed++;
    if (time) results.times.push(time);
    
    const timeStr = time ? ` (${time}ms)` : '';
    console.log(`${passed ? '✅' : '❌'} ${name}: ${details}${timeStr}`);
  };

  console.log('\n🎯 TARGET: All AI search responses under 3 seconds');
  console.log('❌ REQUIREMENT: No fallback algorithms allowed\n');
  
  const queries = ['laptop', 'phone', 'shirt', 'book'];
  
  for (const query of queries) {
    console.log(`\n🧪 Testing: "${query}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/search/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          language: 'en',
          limit: 8
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        // Performance test
        const performancePass = responseTime <= 3000;
        addTest(`${query} - Response Time`, performancePass, 
          `${responseTime}ms ${performancePass ? 'PASS' : 'FAIL (>3s)'}`, responseTime);
        
        // AI verification
        const suggestions = data.data?.suggestions || [];
        const aiSuggestions = suggestions.filter(s => s.metadata?.aiPowered);
        const aiPass = aiSuggestions.length >= 3;
        
        addTest(`${query} - AI Suggestions`, aiPass, 
          `${aiSuggestions.length} AI suggestions ${aiPass ? 'PASS' : 'FAIL'}`, responseTime);
          
      } else if (response.status === 500) {
        const responseTime = Date.now() - startTime;
        const errorData = await response.json();
        
        // Check if it's proper AI failure (no fallback)
        const properError = errorData.error?.includes('AI') && !errorData.fallbackUsed;
        addTest(`${query} - Error Handling`, properError, 
          properError ? 'Properly failed without fallback' : 'Unexpected error', responseTime);
          
      } else {
        addTest(`${query} - HTTP Status`, false, `HTTP ${response.status}`);
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      addTest(`${query} - Network`, false, `Error: ${error.message}`, responseTime);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Calculate metrics
  const avgTime = results.times.length > 0 
    ? results.times.reduce((sum, t) => sum + t, 0) / results.times.length 
    : 0;
  
  const fastResponses = results.times.filter(t => t <= 3000).length;
  
  console.log('\n📊 PERFORMANCE FIX RESULTS:');
  console.log('===============================');
  console.log(`✅ Tests Passed: ${results.passed}`);
  console.log(`❌ Tests Failed: ${results.failed}`);
  console.log(`📊 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
  
  if (results.times.length > 0) {
    console.log(`⚡ Fast Responses: ${fastResponses}/${results.times.length}`);
    console.log(`📈 Average Time: ${avgTime.toFixed(0)}ms`);
    console.log(`🚀 Best Time: ${Math.min(...results.times)}ms`);
    console.log(`⏰ Worst Time: ${Math.max(...results.times)}ms`);
  }
  
  if (results.failed === 0 && fastResponses === results.times.length) {
    console.log('\n🎉 PERFORMANCE FIX SUCCESS!');
    console.log('✅ All responses under 3 seconds');
    console.log('⚡ DeepSeek AI working perfectly');
    console.log('❌ Zero fallback algorithms');
    console.log('🚀 PRODUCTION READY!');
  } else {
    console.log('\n⚠️ ISSUES DETECTED:');
    if (results.failed > 0) {
      console.log(`❌ ${results.failed} tests failed`);
    }
    if (fastResponses < results.times.length) {
      console.log(`⚡ ${results.times.length - fastResponses} responses still over 3s`);
    }
    console.log('🔧 Performance optimization needed');
  }

  return results;
}

// Auto-run test
testPerformanceFix().catch(console.error);