/**
 * 🔧 DIRECT AI SEARCH TEST - Browser Console Test
 * Run this in browser console to test the fixed AI search
 */

console.log('🔧 TESTING FIXED AI SEARCH...');

async function testDirectAI() {
  const startTime = Date.now();
  
  try {
    console.log('📡 Making API call...');
    const response = await fetch('/api/search/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'phone',
        language: 'en',
        limit: 5
      })
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⏱️ Response Time: ${responseTime}ms`);
    
    if (response.ok) {
      const data = await response.json();
      const suggestions = data.data?.suggestions || [];
      
      console.log(`✅ SUCCESS! Received ${suggestions.length} suggestions in ${responseTime}ms`);
      console.log('🤖 AI Suggestions:');
      suggestions.forEach((s, i) => {
        console.log(`   ${i+1}. "${s.text}"`);
      });
      
      // Test frontend display
      const searchInput = document.querySelector('input[type="text"]');
      if (searchInput) {
        console.log('\n🧪 Testing frontend display...');
        searchInput.focus();
        searchInput.value = 'phone';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
          const dropdowns = document.querySelectorAll('[class*="suggestion"], [class*="dropdown"]');
          console.log(`🔍 Dropdown elements found: ${dropdowns.length}`);
          if (dropdowns.length > 0) {
            console.log('✅ Frontend suggestions should be visible now!');
          } else {
            console.log('❌ No dropdown elements found');
          }
        }, 1000);
      }
      
    } else {
      console.log(`❌ API Error: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testDirectAI();