/**
 * COMPREHENSIVE SEARCH FUNCTIONALITY TEST
 * Testing AI-powered search features in browser
 * July 20, 2025 - Real AI Integration Test
 */

console.log('🚀 STARTING COMPREHENSIVE SEARCH FUNCTIONALITY TEST');

// Test 1: Basic Search Suggestions
async function testSearchSuggestions() {
  console.log('\n=== TEST 1: SEARCH SUGGESTIONS ===');
  
  const searchInput = document.querySelector('[placeholder*="Search"], input[type="text"]');
  if (!searchInput) {
    console.error('❌ Search input not found');
    return false;
  }
  
  console.log('✅ Search input found:', searchInput.className);
  
  // Test typing behavior
  searchInput.focus();
  searchInput.value = 'laptop gaming';
  
  // Trigger input event to simulate typing
  const inputEvent = new Event('input', { bubbles: true });
  searchInput.dispatchEvent(inputEvent);
  
  console.log('✅ Simulated typing "laptop gaming"');
  
  // Wait for suggestions to load
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check for suggestion dropdowns
  const suggestionContainers = document.querySelectorAll('[class*="suggestion"], [class*="dropdown"], [class*="result"]');
  console.log(`📊 Found ${suggestionContainers.length} suggestion containers`);
  
  suggestionContainers.forEach((container, index) => {
    console.log(`   Container ${index + 1}:`, container.className, `(${container.children.length} items)`);
  });
  
  return suggestionContainers.length > 0;
}

// Test 2: AI Search Features  
async function testAIFeatures() {
  console.log('\n=== TEST 2: AI SEARCH FEATURES ===');
  
  // Look for voice, image, AI, QR code buttons
  const voiceButton = document.querySelector('[class*="voice"], [aria-label*="voice"], [title*="voice"]');
  const imageButton = document.querySelector('[class*="image"], [aria-label*="image"], [title*="image"]');
  const aiButton = document.querySelector('[class*="ai"], [aria-label*="ai"], [title*="ai"]');
  const qrButton = document.querySelector('[class*="qr"], [aria-label*="qr"], [title*="qr"]');
  
  console.log('🎤 Voice Search Button:', voiceButton ? '✅ Found' : '❌ Missing');
  console.log('📷 Image Search Button:', imageButton ? '✅ Found' : '❌ Missing');
  console.log('🤖 AI Search Button:', aiButton ? '✅ Found' : '❌ Missing');
  console.log('📱 QR Code Button:', qrButton ? '✅ Found' : '❌ Missing');
  
  let foundFeatures = 0;
  if (voiceButton) foundFeatures++;
  if (imageButton) foundFeatures++;  
  if (aiButton) foundFeatures++;
  if (qrButton) foundFeatures++;
  
  console.log(`📊 AI Features Found: ${foundFeatures}/4`);
  return foundFeatures >= 3;
}

// Test 3: API Response Testing
async function testAPIResponses() {
  console.log('\n=== TEST 3: API RESPONSE TESTING ===');
  
  try {
    // Test suggestions endpoint
    const suggestionsResponse = await fetch('/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'smartphone latest', language: 'en', limit: 5 })
    });
    
    console.log('📡 Suggestions API Status:', suggestionsResponse.status);
    
    if (suggestionsResponse.ok) {
      const suggestionsData = await suggestionsResponse.json();
      console.log('✅ Suggestions Response:', suggestionsData.success ? 'SUCCESS' : 'FAILED');
      console.log('📊 Suggestions Count:', suggestionsData.data?.suggestions?.length || 0);
      
      if (suggestionsData.data?.suggestions?.[0]) {
        console.log('💡 First Suggestion:', suggestionsData.data.suggestions[0].text);
      }
    }
    
    // Test enhanced search endpoint
    const enhancedResponse = await fetch('/api/search/enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'gaming headphones', language: 'en' })
    });
    
    console.log('📡 Enhanced Search API Status:', enhancedResponse.status);
    
    if (enhancedResponse.ok) {
      const enhancedData = await enhancedResponse.json();
      console.log('✅ Enhanced Search Response:', enhancedData.success ? 'SUCCESS' : 'FAILED');
      console.log('📊 Results Count:', enhancedData.data?.results?.length || 0);
    }
    
    return suggestionsResponse.ok && enhancedResponse.ok;
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    return false;
  }
}

// Test 4: Real-time Search Performance
async function testSearchPerformance() {
  console.log('\n=== TEST 4: SEARCH PERFORMANCE TESTING ===');
  
  const queries = ['laptop', 'smartphone', 'headphones', 'gaming', 'books'];
  let totalTime = 0;
  let successCount = 0;
  
  for (const query of queries) {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/search/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language: 'en', limit: 3 })
      });
      
      const responseTime = Date.now() - startTime;
      totalTime += responseTime;
      
      if (response.ok) {
        successCount++;
        console.log(`⚡ "${query}": ${responseTime}ms - SUCCESS`);
      } else {
        console.log(`❌ "${query}": ${responseTime}ms - FAILED (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ "${query}": ERROR - ${error.message}`);
    }
  }
  
  const avgTime = totalTime / queries.length;
  console.log(`📊 Average Response Time: ${avgTime.toFixed(0)}ms`);
  console.log(`📊 Success Rate: ${successCount}/${queries.length} (${(successCount/queries.length*100).toFixed(0)}%)`);
  
  return avgTime < 5000 && successCount >= 4; // Under 5 seconds average, 80%+ success
}

// Run comprehensive test suite
async function runComprehensiveTest() {
  console.log('🔬 RUNNING COMPREHENSIVE SEARCH TEST SUITE');
  console.log('='.repeat(50));
  
  const results = {
    suggestions: await testSearchSuggestions(),
    aiFeatures: await testAIFeatures(), 
    apiResponses: await testAPIResponses(),
    performance: await testSearchPerformance()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 FINAL TEST RESULTS:');
  console.log('✅ Search Suggestions:', results.suggestions ? 'PASS' : 'FAIL');
  console.log('🤖 AI Features:', results.aiFeatures ? 'PASS' : 'FAIL');
  console.log('📡 API Responses:', results.apiResponses ? 'PASS' : 'FAIL');
  console.log('⚡ Performance:', results.performance ? 'PASS' : 'FAIL');
  
  const passCount = Object.values(results).filter(r => r).length;
  console.log(`\n🎯 OVERALL SCORE: ${passCount}/4 tests passed (${(passCount/4*100).toFixed(0)}%)`);
  
  if (passCount >= 3) {
    console.log('🚀 SEARCH FUNCTIONALITY: OPERATIONAL');
  } else if (passCount >= 2) {
    console.log('⚠️ SEARCH FUNCTIONALITY: PARTIALLY WORKING');
  } else {
    console.log('❌ SEARCH FUNCTIONALITY: NEEDS FIXES');
  }
  
  return results;
}

// Auto-run test when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runComprehensiveTest);
} else {
  runComprehensiveTest();
}

// Also expose for manual testing
window.testSearchFunctionality = runComprehensiveTest;
console.log('💡 To manually run test, type: testSearchFunctionality()');