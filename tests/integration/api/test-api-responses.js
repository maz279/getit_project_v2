/**
 * Test API responses directly from the server to confirm JSON outputs
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testApiEndpoints() {
  console.log('Testing GetIt Support Service API Endpoints...\n');
  
  const tests = [
    {
      name: 'Support Service Health Check',
      method: 'GET',
      url: `${API_BASE}/api/v1/support/health`,
      expectedStatus: 200
    },
    {
      name: 'Support Service Info',
      method: 'GET',
      url: `${API_BASE}/api/v1/support/info`,
      expectedStatus: 200
    },
    {
      name: 'Video Call Creation',
      method: 'POST',
      url: `${API_BASE}/api/v1/support/video-calls`,
      body: {
        customerId: 'customer_123',
        agentId: 'agent_456',
        recordingEnabled: true
      },
      expectedStatus: 200
    },
    {
      name: 'Bangladesh Optimizations',
      method: 'GET',
      url: `${API_BASE}/api/v1/support/video-calls/bangladesh-optimizations`,
      expectedStatus: 200
    },
    {
      name: 'Video Call Stats',
      method: 'GET',
      url: `${API_BASE}/api/v1/support/video-calls/stats`,
      expectedStatus: 200
    },
    {
      name: 'Video Call Room Management',
      method: 'GET',
      url: `${API_BASE}/api/v1/support/video-calls/room/test-room/connection-details`,
      expectedStatus: 200
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📞 Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.status === test.expectedStatus) {
        const data = await response.json();
        console.log(`   ✅ Success: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        console.log(`   ❌ Failed: Expected ${test.expectedStatus}, got ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testApiEndpoints().catch(console.error);