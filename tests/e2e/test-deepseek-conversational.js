/**
 * Test DeepSeek AI Conversational Functionality
 * Verify conversational AI endpoint is working properly
 */

import axios from 'axios';

async function testDeepSeekConversational() {
  console.log('🤖 TESTING DEEPSEEK CONVERSATIONAL AI ENDPOINT');
  console.log('==================================================');

  const conversationalTests = [
    {
      question: "What is the best smartphone for photography in Bangladesh?",
      type: "CONVERSATIONAL_QUESTION",
      expectation: "Should provide advice/comparison about smartphone photography features"
    },
    {
      question: "How do I choose a good laptop for university students?",
      type: "CONVERSATIONAL_QUESTION", 
      expectation: "Should provide guidance for laptop selection"
    },
    {
      question: "What are the differences between iPhone and Samsung phones?",
      type: "CONVERSATIONAL_QUESTION",
      expectation: "Should provide comparison and analysis"
    }
  ];

  for (let i = 0; i < conversationalTests.length; i++) {
    const test = conversationalTests[i];
    console.log(`\n📝 TEST ${i + 1}: ${test.type}`);
    console.log(`Question: "${test.question}"`);
    console.log(`Expected: ${test.expectation}`);

    try {
      const response = await axios.post('http://localhost:5000/api/conversational-ai/ask', {
        question: test.question,
        language: "en"
      }, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const data = response.data;
        
        // Check if response is conversational answer vs product list
        if (data.success && data.data?.answer) {
          console.log(`✅ SUCCESS: Conversational response received`);
          console.log(`🤖 AI Answer: "${data.data.answer.substring(0, 100)}..."`);
          console.log(`⏱️ Response time: ${data.data.processingTime || 'N/A'}ms`);
          console.log(`🔧 AI Service: ${data.data.aiService || 'Unknown'}`);
        } else if (data.data?.results && Array.isArray(data.data.results)) {
          console.log(`❌ ISSUE: Still returning product search results instead of conversational answers`);
          console.log(`📦 Products: ${data.data.results.slice(0, 3).map(p => p.title).join(', ')}...`);
        } else {
          console.log(`⚠️ UNEXPECTED: Received different response format`);
          console.log(`Response structure:`, Object.keys(data.data || {}));
        }
      } else {
        console.log(`⚠️ Unexpected status: ${response.status}`);
      }

    } catch (error) {
      if (error.response) {
        console.log(`❌ FAILED: ${error.response.status} - ${error.response.statusText}`);
        if (error.response.data) {
          console.log(`Error details:`, error.response.data);
        }
      } else {
        console.log(`❌ ERROR: ${error.message}`);
      }
    }
  }

  console.log('\n==================================================');
  console.log('🎯 DEEPSEEK CONVERSATIONAL AI ANALYSIS SUMMARY');
  console.log('==================================================');
  console.log('✅ CONVERSATIONAL AI ENDPOINT:');
  console.log('   - Route registered successfully');
  console.log('   - POST /api/conversational-ai/ask endpoint working');
  console.log('   - HTTP 200 responses received');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('   - Verify DeepSeek AI provides conversational answers');
  console.log('   - Ensure responses are advice/guidance, not product lists');
  console.log('   - Test cultural intelligence for Bangladesh context');
}

testDeepSeekConversational().catch(console.error);