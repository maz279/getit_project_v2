/**
 * Critical Routing Fix Test
 * Tests API endpoints directly bypassing frontend routing conflicts
 */

import http from 'http';

// Test with raw HTTP requests to bypass frontend routing
function makeAPIRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Node.js-Test'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            rawBody: body.substring(0, 200) + '...',
            isHTML: body.includes('<!DOCTYPE html>'),
            error: 'Not JSON response',
            success: false
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n🔧 CRITICAL ROUTING FIX TEST');
  console.log('=' .repeat(50));

  const tests = [
    {
      name: 'Health Check',
      test: () => makeAPIRequest('/node-libraries/health')
    },
    {
      name: 'Enhanced Search',
      test: () => makeAPIRequest('/node-libraries/enhanced-search', 'POST', {
        query: 'smartphone bangladesh'
      })
    },
    {
      name: 'Hybrid AI Search',
      test: () => makeAPIRequest('/hybrid-ai/search', 'POST', {
        query: 'test',
        type: 'search',
        urgency: 'normal'
      })
    }
  ];

  for (const { name, test } of tests) {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      const result = await test();
      
      if (result.success && result.data) {
        console.log(`✅ Success (${result.status})`);
        if (result.data.success !== undefined) {
          console.log(`   API Success: ${result.data.success}`);
        }
        if (result.data.data) {
          console.log(`   Has Data: Yes`);
        }
      } else if (result.isHTML) {
        console.log(`❌ Frontend Conflict (${result.status}) - Getting HTML instead of JSON`);
        console.log(`   Response: ${result.rawBody}`);
      } else {
        console.log(`❌ Failed (${result.status})`);
        console.log(`   Error: ${result.error || 'Unknown'}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
}

// Wait for server startup
setTimeout(runTests, 3000);