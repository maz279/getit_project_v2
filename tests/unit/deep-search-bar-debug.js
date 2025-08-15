// COMPREHENSIVE SEARCH BAR DEBUGGING SCRIPT
// Test all search functionality step by step

console.log('🔍 TESTING SEARCH BAR FUNCTIONALITY...');

// Test 1: Check if search input exists and is working
const searchInput = document.querySelector('input[placeholder*="Search"]') || 
                   document.querySelector('input[type="text"]') || 
                   document.querySelector('input[placeholder*="search"]');

if (searchInput) {
  console.log('✅ Search input found:', searchInput);
  
  // Test typing functionality
  searchInput.focus();
  searchInput.value = 'test search';
  
  // Trigger input event
  const inputEvent = new Event('input', { bubbles: true });
  searchInput.dispatchEvent(inputEvent);
  
  console.log('✅ Typed "test search" in input');
  
  // Check for suggestions dropdown after delay
  setTimeout(() => {
    const suggestionsDropdown = document.querySelector('[class*="suggestion"]') || 
                               document.querySelector('[class*="dropdown"]') ||
                               document.querySelector('[class*="result"]');
    
    if (suggestionsDropdown) {
      console.log('✅ Suggestions dropdown found:', suggestionsDropdown);
      console.log('✅ Dropdown content:', suggestionsDropdown.textContent);
    } else {
      console.log('❌ No suggestions dropdown found');
      console.log('Available elements:', document.querySelectorAll('div').length);
    }
  }, 1000);
  
} else {
  console.log('❌ Search input not found');
  console.log('Available inputs:', document.querySelectorAll('input'));
}

// Test 2: Check for search form submission
const searchForm = document.querySelector('form') || searchInput?.closest('form');
if (searchForm) {
  console.log('✅ Search form found:', searchForm);
} else {
  console.log('❌ No search form found');
}

// Test 3: Check for search results area
const resultsArea = document.querySelector('[class*="result"]') || 
                   document.querySelector('[class*="search-result"]') ||
                   document.querySelector('[id*="result"]');

if (resultsArea) {
  console.log('✅ Results area found:', resultsArea);
} else {
  console.log('❌ No results area found');
}

// Test 4: Check console for errors
console.log('🔍 Check browser console for any JavaScript errors');
console.log('🔍 Current page URL:', window.location.href);
console.log('🔍 Test completed');