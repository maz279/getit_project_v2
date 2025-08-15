/**
 * Test Amazon-Style Suggestions API
 * Quick test script to verify the enhanced suggestion service
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAmazonSuggestions() {
  console.log('🧪 Testing Amazon-Style Enhanced Suggestions API\n');
  
  const testQueries = [
    'iphone',
    'shampoo',
    'laptop under',
    'nike',
    'samsung',
    'hair',
    'ph'
  ];
  
  for (const query of testQueries) {
    try {
      console.log(`🔍 Testing: "${query}"`);
      const response = await fetch(`${API_BASE}/suggestions-enhanced?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Found ${data.data.length} suggestions in ${data.metadata.responseTime}ms:`);
        data.data.forEach((suggestion, i) => {
          console.log(`   ${i+1}. "${suggestion.text}" (${suggestion.source}, ${suggestion.type}, importance: ${suggestion.importance})`);
        });
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Request failed for "${query}":`, error.message);
    }
  }
  
  // Test stats endpoint
  try {
    console.log('📊 Testing Stats Endpoint:');
    const response = await fetch(`${API_BASE}/suggestions-enhanced/stats`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Index Statistics:');
      console.log(`   Total suggestions: ${data.data.total}`);
      console.log(`   Catalog suggestions: ${data.data.catalog}`);
      console.log(`   Query suggestions: ${data.data.query}`);
      console.log(`   Products: ${data.data.products}`);
      console.log(`   Categories: ${data.data.categories}`);
      console.log(`   Brands: ${data.data.brands}`);
    }
  } catch (error) {
    console.error('❌ Stats request failed:', error.message);
  }
}

// Run tests
testAmazonSuggestions().catch(console.error);