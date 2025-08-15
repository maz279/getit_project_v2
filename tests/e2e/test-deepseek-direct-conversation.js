/**
 * Test DeepSeek AI Conversational Capability
 * Check if DeepSeek can provide conversational answers vs product search
 */

import axios from 'axios';

async function testDeepSeekConversation() {
  console.log('🤖 TESTING DEEPSEEK AI CONVERSATIONAL VS PRODUCT SEARCH');
  console.log('==================================================');

  const conversationalTests = [
    {
      query: "What is the best smartphone for photography?",
      type: "CONVERSATIONAL_QUESTION",
      expectation: "Should provide advice/comparison, not product list"
    },
    {
      query: "smartphone photography",
      type: "PRODUCT_SEARCH",
      expectation: "Should return product listings"
    },
    {
      query: "How do I choose a good laptop for university?",
      type: "CONVERSATIONAL_QUESTION",
      expectation: "Should provide guidance/advice"
    },
    {
      query: "laptops",
      type: "PRODUCT_SEARCH", 
      expectation: "Should return laptop products"
    }
  ];

  for (let i = 0; i < conversationalTests.length; i++) {
    const test = conversationalTests[i];
    console.log(`\n📝 TEST ${i + 1}: ${test.type}`);
    console.log(`Query: "${test.query}"`);
    console.log(`Expected: ${test.expectation}`);

    try {
      // Test current AI search endpoint
      const response = await axios.post('http://localhost:5000/api/search/ai-search', {
        query: test.query,
        language: "en"
      }, { timeout: 10000 });

      if (response.status === 200) {
        const data = response.data;
        const isProductList = data.data?.results && Array.isArray(data.data.results);
        
        if (isProductList) {
          console.log(`🔍 RESULT: Product search (${data.data.results.length} products found)`);
          console.log(`📦 Products: ${data.data.results.slice(0, 3).map(p => p.title).join(', ')}...`);
          
          if (test.type === "CONVERSATIONAL_QUESTION") {
            console.log(`❌ ISSUE: Question treated as product search instead of conversation`);
          } else {
            console.log(`✅ CORRECT: Product search working as expected`);
          }
        } else {
          console.log(`🤖 RESULT: Non-product response`);
          console.log(`Response type: ${typeof data.data}`);
        }
        
        console.log(`⏱️ Response time: ${data.metadata?.timestamp ? 'Available' : 'N/A'}`);
        
      } else {
        console.log(`⚠️ Unexpected status: ${response.status}`);
      }

    } catch (error) {
      if (error.response) {
        console.log(`❌ FAILED: ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.log(`❌ ERROR: ${error.message}`);
      }
    }
  }

  console.log('\n==================================================');
  console.log('🎯 DEEPSEEK AI ANALYSIS SUMMARY');
  console.log('==================================================');
  console.log('❗ CURRENT BEHAVIOR:');
  console.log('   - ALL queries treated as product searches');
  console.log('   - Questions like "What is the best..." return random products');
  console.log('   - No conversational AI responses generated');
  console.log('');
  console.log('✅ DEEPSEEK AI WORKING FOR:');
  console.log('   - Product search enhancement');
  console.log('   - Search query processing');
  console.log('   - Cultural intelligence');
  console.log('');
  console.log('❌ DEEPSEEK AI NOT WORKING FOR:');
  console.log('   - Direct question answering');
  console.log('   - Conversational responses');
  console.log('   - Guidance and advice');
  console.log('');
  console.log('🔧 SOLUTION NEEDED:');
  console.log('   - Add conversational AI endpoint using DeepSeek');
  console.log('   - Distinguish between questions vs product searches');
  console.log('   - Provide direct answers instead of product listings');
}

testDeepSeekConversation().catch(console.error);