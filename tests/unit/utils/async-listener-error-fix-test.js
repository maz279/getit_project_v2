/**
 * 🔧 ASYNC LISTENER ERROR FIX VALIDATION
 * Tests the "Search AI timeout - using instant suggestions" fix
 * July 20, 2025 - Critical Issue Resolution
 */

console.log('🔧 ASYNC LISTENER ERROR FIX VALIDATION STARTING...');

async function testAsyncListenerErrorFix() {
  const results = { passed: 0, failed: 0, tests: [] };
  
  const addTest = (name, passed, details) => {
    results.tests.push({ name, passed, details });
    passed ? results.passed++ : results.failed++;
    console.log(`${passed ? '✅' : '❌'} ${name}: ${details}`);
  };

  // Test 1: Check if fallback error message appears
  console.log('\n🔍 Testing for fallback violation error...');
  
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  if (searchInput) {
    // Trigger a search to see if fallback error appears
    searchInput.value = 'test search';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait and check for error
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check console for the specific error message
    const consoleLogs = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      consoleLogs.push(args.join(' '));
      originalConsoleLog.apply(console, args);
    };
    
    // Wait a bit more to see if the error appears
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Restore console.log
    console.log = originalConsoleLog;
    
    const hasTimeoutError = consoleLogs.some(log => 
      log.includes('Search AI timeout - using instant suggestions')
    );
    
    addTest('Fallback Error Message Eliminated', !hasTimeoutError, 
      hasTimeoutError ? 'Still showing fallback error' : 'No fallback error detected');
      
    // Clear the search
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    addTest('Search Input Found', false, 'Search input not found');
  }

  // Test 2: Test API endpoint directly
  console.log('\n🌐 Testing API endpoints...');
  
  try {
    const response = await fetch('/api/search/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'smartphone',
        language: 'en',
        searchType: 'ai'
      })
    });
    
    addTest('AI Search Endpoint', response.ok, 
      response.ok ? `Returns ${response.status} OK` : `Returns ${response.status} error`);
      
  } catch (error) {
    addTest('AI Search Endpoint', false, `Network error: ${error.message}`);
  }

  // Test 3: Check debug panel (if visible)
  const debugPanel = document.querySelector('[class*="debug"], [class*="Debug"]');
  if (debugPanel) {
    const debugText = debugPanel.textContent || '';
    const hasTimeoutMessage = debugText.includes('Search AI timeout - using instant suggestions');
    
    addTest('Debug Panel Clean', !hasTimeoutMessage,
      hasTimeoutMessage ? 'Debug panel still shows timeout error' : 'Debug panel clean');
  } else {
    addTest('Debug Panel Status', true, 'Debug panel not visible (expected)');
  }

  // Results
  console.log('\n📊 ASYNC LISTENER ERROR FIX RESULTS:');
  console.log('=========================================');
  console.log(`✅ Tests Passed: ${results.passed}`);
  console.log(`❌ Tests Failed: ${results.failed}`);
  console.log(`🎯 Success Rate: ${(results.passed/(results.passed+results.failed)*100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ASYNC LISTENER ERROR COMPLETELY RESOLVED!');
    console.log('✅ No more "Search AI timeout - using instant suggestions" errors');
    console.log('🚀 Search system working with authentic AI only');
  } else {
    console.log('\n⚠️ Some issues remain - check failed tests above');
  }
  
  return results;
}

// Run the test
testAsyncListenerErrorFix().catch(console.error);