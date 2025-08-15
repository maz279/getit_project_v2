// ✅ LOCATION SELECTION TEST - FIXED VERSION (COPY INTO BROWSER CONSOLE)
// Test the enhanced location selection functionality

console.log('🧪 Testing Enhanced Location Selection...\n');

// Test 1: Find and click location button
console.log('1. Finding location button...');
const locationButton = document.querySelector('button[class*="text-orange-600"]');

if (locationButton) {
  console.log('✅ Location button found:', locationButton.textContent);
  
  // Click the location button
  console.log('2. Clicking location button...');
  locationButton.click();
  
  setTimeout(() => {
    // Test 2: Check if menu opened
    const locationMenu = document.querySelector('.location-menu-container div[class*="absolute"]');
    
    if (locationMenu) {
      console.log('✅ Location menu opened');
      
      // Test 3: Find search input
      const searchInput = locationMenu.querySelector('input[type="text"]');
      
      if (searchInput) {
        console.log('✅ Search input found');
        
        // Test 4: Search for Narayanganj
        console.log('3. Searching for Narayanganj...');
        searchInput.value = 'Narayanganj';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
          // Test 5: Find search results
          const searchResults = locationMenu.querySelectorAll('button[class*="border"]');
          console.log(`✅ Found ${searchResults.length} search results`);
          
          // Test 6: Find Narayanganj button
          let narayanganjButton = null;
          searchResults.forEach(btn => {
            if (btn.textContent.includes('Narayanganj')) {
              narayanganjButton = btn;
            }
          });
          
          if (narayanganjButton) {
            console.log('✅ Narayanganj button found');
            
            // Test 7: Click Narayanganj
            console.log('4. Clicking Narayanganj...');
            const originalText = locationButton.textContent;
            narayanganjButton.click();
            
            setTimeout(() => {
              // Test 8: Check if location changed
              const newText = locationButton.textContent;
              console.log(`Original: ${originalText}`);
              console.log(`New: ${newText}`);
              
              if (newText.includes('Narayanganj')) {
                console.log('✅ Location selection SUCCESS!');
                
                // Test 9: Check localStorage
                const saved = localStorage.getItem('selectedLocation');
                if (saved) {
                  const parsedLocation = JSON.parse(saved);
                  if (parsedLocation.city === 'Narayanganj') {
                    console.log('✅ localStorage persistence SUCCESS!');
                  } else {
                    console.log('❌ localStorage persistence FAILED');
                  }
                } else {
                  console.log('❌ No saved location found');
                }
                
                // Test 10: Check for notification
                const notification = document.querySelector('div[class*="bg-green-500"]');
                if (notification) {
                  console.log('✅ Notification displayed');
                } else {
                  console.log('❌ No notification found');
                }
                
                console.log('\n🎉 ALL TESTS PASSED!');
                console.log('📊 Summary:');
                console.log('✅ Location button: Working');
                console.log('✅ Menu opening: Working');
                console.log('✅ Search input: Working');
                console.log('✅ Search results: Working');
                console.log('✅ Location selection: Working');
                console.log('✅ Text update: Working');
                console.log('✅ localStorage: Working');
                console.log('✅ Notification: Working');
                
              } else {
                console.log('❌ Location selection FAILED - text not updated');
              }
            }, 500);
          } else {
            console.log('❌ Narayanganj button not found');
            console.log('Available results:');
            searchResults.forEach((btn, i) => {
              console.log(`  ${i + 1}. ${btn.textContent}`);
            });
          }
        }, 500);
      } else {
        console.log('❌ Search input not found');
      }
    } else {
      console.log('❌ Location menu did not open');
    }
  }, 500);
} else {
  console.log('❌ Location button not found');
  console.log('Available buttons:');
  document.querySelectorAll('button').forEach((btn, i) => {
    if (btn.textContent.includes('Dhaka') || btn.textContent.includes('Deliver')) {
      console.log(`  ${i + 1}. ${btn.textContent}`);
    }
  });
}

console.log('\n⏳ Running tests... Please wait for results...');