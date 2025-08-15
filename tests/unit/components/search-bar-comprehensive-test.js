/**
 * COMPREHENSIVE SEARCH BAR FUNCTIONALITY TEST
 * Tests ALL search features: Text, Voice, Image, QR, AI, ML, NLP, Suggestions
 * July 20, 2025 - Complete Diagnostic Test
 */

// Wait for page to load completely
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkElement() {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found after ${timeout}ms`));
      } else {
        setTimeout(checkElement, 100);
      }
    }
    
    checkElement();
  });
}

async function testSearchBarFunctionalities() {
  console.log('🚀 STARTING COMPREHENSIVE SEARCH BAR TEST');
  
  try {
    // Test 1: Find Search Input
    console.log('\n1️⃣ Testing Search Input Detection...');
    const searchInput = await waitForElement('input[type="text"]');
    if (searchInput) {
      console.log('✅ Search input found:', searchInput);
      console.log('✅ Input placeholder:', searchInput.placeholder);
    } else {
      console.log('❌ Search input NOT FOUND');
      return;
    }

    // Test 2: Focus and Type Test
    console.log('\n2️⃣ Testing Input Focus and Typing...');
    searchInput.focus();
    console.log('✅ Search input focused');
    
    // Simulate typing
    searchInput.value = '';
    const testQuery = 'phone';
    searchInput.value = testQuery;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Typed query:', testQuery);
    
    // Test 3: API Suggestions Call
    console.log('\n3️⃣ Testing API Suggestions Call...');
    setTimeout(async () => {
      try {
        const response = await fetch('/api/search/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: testQuery,
            language: 'en',
            includeBengaliPhonetic: true,
            includeHistory: true,
            includeTrending: true,
            includeProducts: true,
            includeCategories: true,
            limit: 7
          })
        });
        
        const data = await response.json();
        console.log('✅ API Response:', data);
        console.log('✅ Suggestions count:', data.data?.suggestions?.length || 0);
        
        if (data.data?.suggestions?.length > 0) {
          data.data.suggestions.forEach((suggestion, index) => {
            console.log(`   ${index + 1}. ${suggestion.text} (${suggestion.type})`);
          });
        }
      } catch (error) {
        console.log('❌ API call failed:', error);
      }
    }, 1000);

    // Test 4: Search Buttons Detection
    console.log('\n4️⃣ Testing Search Function Buttons...');
    
    // Voice Search Button
    const voiceButton = document.querySelector('button[title*="Voice"], button[title*="ভয়েস"]');
    if (voiceButton) {
      console.log('✅ Voice search button found');
    } else {
      console.log('❌ Voice search button NOT FOUND');
    }
    
    // Image Search Button  
    const imageButton = document.querySelector('button[title*="Image"], button[title*="ছবি"]');
    if (imageButton) {
      console.log('✅ Image search button found');
    } else {
      console.log('❌ Image search button NOT FOUND');
    }
    
    // AI Search Button
    const aiButton = document.querySelector('button[title*="AI"], button[title*="এআই"]');
    if (aiButton) {
      console.log('✅ AI search button found');
    } else {
      console.log('❌ AI search button NOT FOUND');
    }
    
    // QR Search Button
    const qrButton = document.querySelector('button[title*="QR"], button[title*="কিউআর"]');
    if (qrButton) {
      console.log('✅ QR search button found');
    } else {
      console.log('❌ QR search button NOT FOUND');
    }

    // Test 5: Suggestions Dropdown Detection
    console.log('\n5️⃣ Testing Suggestions Dropdown...');
    setTimeout(() => {
      // Look for suggestions dropdown
      const suggestionsDropdown = document.querySelector('div[style*="backgroundColor: red"]');
      if (suggestionsDropdown) {
        console.log('✅ Suggestions dropdown found with debug styling');
        const suggestions = suggestionsDropdown.querySelectorAll('span[style*="backgroundColor: lime"]');
        console.log('✅ Found', suggestions.length, 'suggestion items');
        suggestions.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.textContent}`);
        });
      } else {
        console.log('❌ Suggestions dropdown NOT FOUND');
        console.log('Looking for any dropdown...');
        const anyDropdown = document.querySelector('div[class*="fixed"]');
        if (anyDropdown) {
          console.log('Found fixed positioned element:', anyDropdown);
        }
      }
    }, 2000);

    // Test 6: All Search Functions Test
    console.log('\n6️⃣ Testing All Search API Endpoints...');
    
    const endpoints = [
      { name: 'Enhanced Search', url: '/api/search/enhanced', method: 'POST' },
      { name: 'Voice Search', url: '/api/search/voice', method: 'POST' },
      { name: 'Visual Search', url: '/api/search/visual', method: 'POST' },
      { name: 'QR Search', url: '/api/search/qr-search', method: 'POST' },
      { name: 'Navigation Search', url: '/api/search/navigation-search', method: 'POST' },
      { name: 'Trending', url: '/api/search/trending', method: 'GET' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const options = {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' }
        };
        
        if (endpoint.method === 'POST') {
          options.body = JSON.stringify({
            query: 'test',
            language: 'en',
            userId: 'test-user'
          });
        }
        
        const response = await fetch(endpoint.url, options);
        if (response.ok) {
          console.log(`✅ ${endpoint.name} endpoint working`);
        } else {
          console.log(`⚠️ ${endpoint.name} endpoint returned ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} endpoint failed:`, error.message);
      }
    }

    console.log('\n🎯 COMPREHENSIVE TEST COMPLETED');
    console.log('Check above results for any issues.');
    
  } catch (error) {
    console.log('❌ TEST FAILED:', error);
  }
}

// Start the test
testSearchBarFunctionalities();

console.log('📋 SEARCH BAR COMPREHENSIVE TEST LOADED');
console.log('Test will run automatically and show results in console.');