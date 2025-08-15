// Test Amazon-style API with proper ES modules
import http from 'http';

function testAPI(path, query = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}${query ? `?${query}` : ''}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data.substring(0, 200), raw: true });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Amazon-Style API Integration\n');
  
  try {
    // Test Amazon-style suggestions
    console.log('🔍 Testing Amazon-style suggestions API');
    const result1 = await testAPI('/suggestions-enhanced', 'q=iphone&limit=5&location=BD');
    console.log(`Status: ${result1.status}`);
    
    if (result1.data.success) {
      console.log(`✅ Found ${result1.data.data.length} Amazon-style suggestions:`);
      result1.data.data.slice(0, 3).forEach((s, i) => 
        console.log(`   ${i+1}. "${s.text}" (${s.source}, score: ${s.importance})`)
      );
      console.log(`📊 Performance: ${result1.data.metadata.processingTime}ms`);
    } else {
      console.log('❌ Failed:', result1.data.error || 'Unknown error');
      if (result1.raw) console.log('Raw response:', result1.data);
    }
    
    // Test old vs new API comparison
    console.log('\n📈 Testing old suggestions API for comparison');
    const result2 = await testAPI('/search/suggestions', 'q=iphone&lang=en');
    console.log(`Status: ${result2.status}`);
    
    if (result2.data.success && result2.data.data) {
      console.log(`✅ Old API: ${result2.data.data.length} suggestions`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();