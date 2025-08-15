/**
 * Test Enhanced Amazon-Style Suggestions with 10+ Results
 * Verify shampoo queries return at least 10 diverse suggestions
 */

const testQueries = [
  { query: 'shampoo', expected: 10 },
  { query: 'sham', expected: 8 },
  { query: 'hair', expected: 6 }
];

async function testEnhancedSuggestions() {
  console.log('🧪 Testing Enhanced Suggestion System (10+ Results)\n');
  
  for (const { query, expected } of testQueries) {
    try {
      console.log(`🔍 Testing: "${query}" (expecting at least ${expected} suggestions)`);
      
      const response = await fetch(`http://localhost:5000/api/suggestions-enhanced?q=${query}&limit=15`);
      
      if (!response.ok) {
        console.log(`❌ HTTP Error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const count = data.data.length;
        const status = count >= expected ? '✅' : '⚠️';
        
        console.log(`${status} Found ${count} suggestions (${data.metadata.responseTime}ms):`);
        
        data.data.forEach((suggestion, i) => {
          const type = suggestion.type ? `[${suggestion.type}]` : '';
          const source = suggestion.source ? `(${suggestion.source})` : '';
          console.log(`   ${i+1}. "${suggestion.text}" ${type} ${source}`);
        });
        
        if (count >= expected) {
          console.log(`🎉 SUCCESS: Query "${query}" returned ${count} suggestions (≥${expected})\n`);
        } else {
          console.log(`⚠️  WARNING: Query "${query}" only returned ${count} suggestions (<${expected})\n`);
        }
      } else {
        console.log(`❌ Error: ${data.error || 'Invalid response'}\n`);
      }
      
    } catch (error) {
      console.error(`❌ Request failed for "${query}":`, error.message);
    }
  }
  
  // Test recently viewed products functionality
  console.log('🔍 Testing Recently Viewed Products API:');
  try {
    // Test tracking a product view
    const trackResponse = await fetch('http://localhost:5000/api/suggestions-enhanced/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'test_user_123', product_id: 9 })
    });
    
    if (trackResponse.ok) {
      console.log('✅ Product view tracking: SUCCESS');
      
      // Test getting recently viewed
      const recentResponse = await fetch('http://localhost:5000/api/suggestions-enhanced/recently-viewed?user_id=test_user_123');
      const recentData = await recentResponse.json();
      
      if (recentData.success) {
        console.log(`✅ Recently viewed retrieval: SUCCESS (${recentData.count} products)`);
        recentData.data.forEach(product => {
          console.log(`   - ${product.name} (${product.brand})`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Recently viewed test failed:', error.message);
  }
  
  console.log('\n🎯 Enhanced suggestion system test complete!');
}

// Run the test
testEnhancedSuggestions().catch(console.error);