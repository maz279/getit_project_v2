// Final test of Amazon-style suggestions with frontend integration
import http from 'http';

function testSuggestions(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/suggestions-enhanced?q=${query}&limit=5&location=BD`,
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
          resolve({ status: res.statusCode, data: data.substring(0, 100), raw: true });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function runFinalTest() {
  console.log('🧪 FINAL AMAZON-STYLE SUGGESTIONS TEST\n');
  
  const queries = ['shampoo', 'iphone', 'laptop'];
  
  for (const query of queries) {
    try {
      console.log(`🔍 Testing "${query}"`);
      const result = await testSuggestions(query);
      
      if (result.status === 200 && result.data.success) {
        console.log(`✅ SUCCESS: ${result.data.data.length} suggestions in ${result.data.metadata.responseTime}ms`);
        result.data.data.slice(0, 3).forEach((s, i) => 
          console.log(`   ${i+1}. "${s.text}" (${s.source}, importance: ${s.importance})`)
        );
      } else {
        console.log(`❌ FAILED: Status ${result.status}`, result.raw ? 'HTML Response' : result.data.error);
      }
      console.log('');
    } catch (error) {
      console.error(`❌ ERROR for "${query}":`, error.message);
    }
  }
}

runFinalTest();