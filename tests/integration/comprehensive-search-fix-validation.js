/**
 * 🔧 COMPREHENSIVE SEARCH FRONTEND-BACKEND DEBUG VALIDATION
 * This script tests the entire pipeline from frontend to backend
 * July 20, 2025 - Frontend Display Bug Investigation
 */

console.log('🔧 COMPREHENSIVE SEARCH DEBUG STARTING...');

async function validateSearchPipeline() {
  const results = { passed: 0, failed: 0, tests: [] };
  
  const addTest = (name, passed, details) => {
    results.tests.push({ name, passed, details });
    passed ? results.passed++ : results.failed++;
    console.log(`${passed ? '✅' : '❌'} ${name}: ${details}`);
  };

  // Test 1: Backend API Direct Call
  console.log('\n🧪 TEST 1: Backend API Direct Call');
  try {
    const response = await fetch('/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'laptop',
        language: 'en',
        limit: 5
      })
    });

    if (response.ok) {
      const data = await response.json();
      const suggestions = data.data?.suggestions || [];
      addTest('Backend API Response', suggestions.length > 0, 
        `Backend returned ${suggestions.length} suggestions`);
      
      // Log first few suggestions for verification
      suggestions.slice(0, 3).forEach((s, i) => {
        console.log(`   💡 AI Suggestion ${i+1}: "${s.text}"`);
      });
    } else {
      addTest('Backend API Response', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    addTest('Backend API Response', false, `Error: ${error.message}`);
  }

  // Test 2: Frontend Search Component State
  console.log('\n🧪 TEST 2: Frontend Search Component State');
  
  // Check if search input exists
  const searchInput = document.querySelector('input[type="text"]');
  addTest('Search Input Element', !!searchInput, 
    searchInput ? 'Search input found' : 'Search input missing');

  // Test 3: Trigger Search and Check Dropdown
  console.log('\n🧪 TEST 3: Frontend Search Trigger Test');
  
  if (searchInput) {
    // Focus on input
    searchInput.focus();
    
    // Simulate typing
    searchInput.value = 'test';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Wait for suggestions
    setTimeout(() => {
      const suggestionsDropdown = document.querySelector('[class*="suggestion"], [class*="dropdown"], [class*="result"]');
      addTest('Suggestions Dropdown Appears', !!suggestionsDropdown, 
        suggestionsDropdown ? 'Dropdown found after typing' : 'No dropdown visible');
        
      // Check for AI suggestions in DOM
      const suggestionItems = document.querySelectorAll('[class*="suggestion"] li, [class*="dropdown"] li, [data-suggestion]');
      addTest('Suggestion Items in DOM', suggestionItems.length > 0, 
        `Found ${suggestionItems.length} suggestion items in DOM`);
        
      if (suggestionItems.length > 0) {
        suggestionItems.forEach((item, i) => {
          console.log(`   📝 DOM Suggestion ${i+1}: "${item.textContent?.trim()}"`);
        });
      }
    }, 2000);
  }

  // Test 4: Check Console for Errors
  console.log('\n🧪 TEST 4: Browser Console Error Check');
  
  // Check for JavaScript errors that might prevent suggestions from showing
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError(...args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    addTest('JavaScript Errors', errors.length === 0, 
      errors.length === 0 ? 'No JavaScript errors' : `${errors.length} errors found`);
    
    if (errors.length > 0) {
      console.log('   🐛 JavaScript Errors Found:');
      errors.forEach((error, i) => console.log(`      ${i+1}. ${error}`));
    }
  }, 3000);

  // Test 5: Network Tab Check
  console.log('\n🧪 TEST 5: Network Requests Verification');
  
  // Monitor network requests
  const originalFetch = window.fetch;
  let apiCalls = [];
  
  window.fetch = async (...args) => {
    const url = args[0];
    if (typeof url === 'string' && url.includes('/api/search/')) {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        apiCalls.push({
          url,
          status: response.status,
          time: endTime - startTime,
          success: response.ok
        });
        return response;
      } catch (error) {
        apiCalls.push({
          url,
          error: error.message,
          success: false
        });
        throw error;
      }
    }
    return originalFetch(...args);
  };
  
  setTimeout(() => {
    window.fetch = originalFetch;
    addTest('API Calls Made', apiCalls.length > 0, 
      `${apiCalls.length} API calls intercepted`);
    
    apiCalls.forEach((call, i) => {
      console.log(`   🌐 API Call ${i+1}: ${call.url} - ${call.success ? `${call.status} (${call.time}ms)` : `Error: ${call.error}`}`);
    });
  }, 4000);

  // Final Results
  setTimeout(() => {
    console.log('\n📊 COMPREHENSIVE SEARCH DEBUG RESULTS:');
    console.log('=====================================');
    console.log(`✅ Tests Passed: ${results.passed}`);
    console.log(`❌ Tests Failed: ${results.failed}`);
    console.log(`📊 Total Tests: ${results.tests.length}`);
    console.log(`🎯 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
      console.log('\n🔧 DEBUGGING RECOMMENDATIONS:');
      console.log('1. Check if AI suggestions are reaching the frontend');
      console.log('2. Verify dropdown positioning and visibility');
      console.log('3. Check for JavaScript errors blocking UI updates');
      console.log('4. Ensure API responses are properly parsed');
      console.log('5. Verify React state updates are triggering re-renders');
    } else {
      console.log('\n🎉 ALL TESTS PASSED - SEARCH SHOULD BE WORKING!');
    }
  }, 5000);

  return results;
}

// Auto-run the comprehensive test
validateSearchPipeline().catch(console.error);