const http = require('http');

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
          resolve({ status: res.statusCode, data: data.substring(0, 200) });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Amazon-Style API with HTTP module\n');
  
  try {
    // Test suggestions
    console.log('🔍 Testing: suggestions-enhanced?q=iphone');
    const result1 = await testAPI('/suggestions-enhanced', 'q=iphone&limit=3');
    console.log(`Status: ${result1.status}`);
    if (result1.data.success) {
      console.log(`✅ Found ${result1.data.data.length} suggestions`);
      result1.data.data.forEach((s, i) => 
        console.log(`   ${i+1}. "${s.text}" (${s.source}, importance: ${s.importance})`)
      );
    } else {
      console.log('Response:', JSON.stringify(result1.data, null, 2).substring(0, 300));
    }
    
    console.log('\n📊 Testing: suggestions-enhanced/stats');
    const result2 = await testAPI('/suggestions-enhanced/stats');
    console.log(`Status: ${result2.status}`);
    if (result2.data.success) {
      console.log(`✅ Index stats:`, result2.data.data);
    } else {
      console.log('Response:', JSON.stringify(result2.data, null, 2).substring(0, 300));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();