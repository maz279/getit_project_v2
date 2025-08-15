/**
 * QUICK SYSTEM CHECK - Final Validation
 * Rapid assessment of all services
 */

console.log('🔍 QUICK SYSTEM CHECK...\n');

const tests = [
  {
    name: 'Advanced DeepSeek',
    endpoint: '/multi-dimensional-suggestions',
    method: 'POST',
    body: { query: 'smartphone', language: 'en', userLocation: 'dhaka' },
    check: (data) => data.success && data.data.length > 0
  },
  {
    name: 'System Status',
    endpoint: '/system-status',
    method: 'GET',
    check: (data) => data.success && data.data.services
  },
  {
    name: 'Integration Test',
    endpoint: '/integration-test',
    method: 'GET',
    check: (data) => data.data.passedCount >= 4
  },
  {
    name: 'Redis Cache',
    endpoint: '/cache-stats',
    method: 'GET',
    check: (data) => data.success && data.data.health.status === 'healthy'
  },
  {
    name: 'Analytics',
    endpoint: '/comprehensive-analytics',
    method: 'GET',
    check: (data) => data.success && data.data.search
  }
];

async function runQuickCheck() {
  let passed = 0;
  const total = tests.length;

  for (const test of tests) {
    try {
      const url = `http://localhost:5000/api/advanced-ai${test.endpoint}`;
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (test.check(data)) {
        console.log(`✅ ${test.name}: PASS`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAIL`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
    }
  }
  
  const successRate = ((passed / total) * 100).toFixed(1);
  console.log(`\n📊 Results: ${passed}/${total} (${successRate}%)`);
  
  if (successRate >= 80) {
    console.log('🎯 VERDICT: SYSTEM OPERATIONAL');
  } else {
    console.log('⚠️ VERDICT: NEEDS ATTENTION');
  }
}

runQuickCheck();