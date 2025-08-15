/**
 * 🔧 FINAL AI SEARCH DEBUG TEST
 * Testing the complete pipeline after all optimizations
 */

console.log('🔧 FINAL AI SEARCH TEST STARTING...');

async function testAISearch() {
  console.log('\n🧪 Testing AI Search API with optimizations...');
  
  const testQuery = 'laptop';
  const startTime = Date.now();
  
  try {
    const response = await fetch('/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: testQuery,
        language: 'en',
        limit: 5
      })
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⏱️ Total Response Time: ${responseTime}ms`);
    
    if (response.ok) {
      const data = await response.json();
      const suggestions = data.data?.suggestions || [];
      
      console.log(`✅ SUCCESS: Received ${suggestions.length} AI suggestions in ${responseTime}ms`);
      console.log('🤖 AI Suggestions:');
      
      suggestions.forEach((suggestion, i) => {
        console.log(`   ${i+1}. "${suggestion.text}" (type: ${suggestion.type})`);
      });
      
      // Test frontend integration
      console.log('\n🧪 Testing Frontend Integration...');
      
      // Try to find search input
      const searchInput = document.querySelector('input[type="text"]');
      if (searchInput) {
        console.log('✅ Search input found - triggering search...');
        
        // Focus and type
        searchInput.focus();
        searchInput.value = testQuery;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Check for dropdown after short delay
        setTimeout(() => {
          const dropdowns = document.querySelectorAll('[class*="dropdown"], [class*="suggestion"], [class*="result"]');
          console.log(`🔍 Found ${dropdowns.length} potential dropdown elements`);
          
          if (dropdowns.length > 0) {
            console.log('✅ Frontend dropdown elements detected');
            dropdowns.forEach((dropdown, i) => {
              console.log(`   Dropdown ${i+1}: ${dropdown.className}`);
            });
          } else {
            console.log('❌ No dropdown elements found in DOM');
          }
        }, 2000);
        
      } else {
        console.log('❌ Search input not found');
      }
      
    } else {
      console.log(`❌ API Error: ${response.status} - ${response.statusText}`);
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

// Run the test
testAISearch();