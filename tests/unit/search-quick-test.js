/**
 * QUICK SEARCH PERFORMANCE TEST
 * Testing if recent schema fixes improved performance
 */

console.log("⚡ QUICK SEARCH PERFORMANCE TEST - Testing recent fixes...");

const quickTest = async () => {
  const tests = [];

  // Test 1: Basic search speed
  try {
    const start = Date.now();
    const response = await fetch('http://localhost:5000/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "smartphone", language: 'en', limit: 5 })
    });
    const time = Date.now() - start;
    
    if (response.ok) {
      const data = await response.json();
      tests.push({
        name: "Basic Search Speed",
        status: time < 8000 ? "✅ PASSED" : "❌ SLOW",
        time: time + "ms",
        suggestions: data.data?.suggestions?.length || 0
      });
    } else {
      tests.push({
        name: "Basic Search Speed", 
        status: "❌ FAILED",
        time: time + "ms",
        error: "HTTP " + response.status
      });
    }
  } catch (error) {
    tests.push({
      name: "Basic Search Speed",
      status: "❌ ERROR", 
      error: error.message
    });
  }

  // Test 2: Enhanced search comparison
  try {
    const start = Date.now();
    const response = await fetch('http://localhost:5000/api/search/enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "smartphone", language: 'en' })
    });
    const time = Date.now() - start;
    
    if (response.ok) {
      tests.push({
        name: "Enhanced Search",
        status: time < 2000 ? "✅ FAST" : "⚠️ ACCEPTABLE",
        time: time + "ms"
      });
    }
  } catch (error) {
    tests.push({
      name: "Enhanced Search",
      status: "❌ ERROR",
      error: error.message
    });
  }

  // Test 3: System responsiveness
  try {
    const start = Date.now();
    const response = await fetch('http://localhost:5000/api/search/trending');
    const time = Date.now() - start;
    
    tests.push({
      name: "System Responsiveness",
      status: time < 100 ? "✅ EXCELLENT" : "⚠️ ACCEPTABLE",
      time: time + "ms"
    });
  } catch (error) {
    tests.push({
      name: "System Responsiveness",
      status: "❌ ERROR",
      error: error.message
    });
  }

  return tests;
};

// Execute test
quickTest().then(tests => {
  console.log("\n" + "=".repeat(60));
  console.log("⚡ QUICK SEARCH PERFORMANCE RESULTS");
  console.log("=".repeat(60));
  
  tests.forEach(test => {
    console.log(`${test.status} ${test.name}: ${test.time || ''} ${test.error ? '(' + test.error + ')' : ''}`);
    if (test.suggestions) {
      console.log(`   → ${test.suggestions} suggestions returned`);
    }
  });
  
  const allPassed = tests.every(test => test.status.includes("✅") || test.status.includes("FAST") || test.status.includes("EXCELLENT"));
  
  console.log("\n📊 SUMMARY:");
  if (allPassed) {
    console.log("🎉 ALL TESTS PERFORMING WELL - Ready for Phase 3!");
  } else {
    console.log("⚠️ Some performance issues remain - Need additional optimization");
  }
  
  console.log("=".repeat(60));
}).catch(error => {
  console.error("❌ QUICK TEST FAILED:", error);
});