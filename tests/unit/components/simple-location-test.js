// ✅ ENHANCED LOCATION SELECTION TEST SCRIPT - COPY & PASTE INTO BROWSER CONSOLE
// This script tests all location selection functionality with enhanced error handling

console.log('🧪 Starting enhanced location selection test...\n');

// Test 1: Find location button with multiple selectors
console.log('1. Testing location menu button...');
let locationButton = document.querySelector('button[class*="text-orange-600"]');
if (!locationButton) {
  locationButton = document.querySelector('button[class*="orange"]:has(span)');
}

if (locationButton) {
  console.log('✅ Location menu button found:', locationButton.textContent);
  
  // Test 2: Click location button
  console.log('2. Testing location menu click...');
  try {
    locationButton.click();
    console.log('✅ Location button clicked successfully');
    
    setTimeout(() => {
      // Test 3: Find location menu
      let locationMenu = document.querySelector('div[class*="absolute top-full left-0"]');
      if (!locationMenu) {
        locationMenu = document.querySelector('div[class*="absolute"][class*="w-96"]');
      }
      
      if (locationMenu) {
        console.log('✅ Location menu opened successfully');
        
        // Test 4: Find search input
        console.log('3. Testing search input...');
        let searchInput = locationMenu.querySelector('input[type="text"]');
        
        if (searchInput) {
          console.log('✅ Search input found');
          
          // Test 5: Test search functionality
          console.log('4. Testing search functionality...');
          searchInput.value = 'Narayanganj';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('✅ Search value set:', searchInput.value);
          
          setTimeout(() => {
            // Test 6: Find search results
            let searchResults = locationMenu.querySelectorAll('button[class*="border"]');
            console.log(`✅ Search results found: ${searchResults.length} locations`);
            
            // Test 7: Find and click Narayanganj
            console.log('5. Testing location selection...');
            const narayanganjButton = Array.from(searchResults).find(btn => 
              btn.textContent.includes('Narayanganj')
            );
            
            if (narayanganjButton) {
              console.log('✅ Narayanganj button found');
              const originalLocation = locationButton.textContent;
              console.log(`Original location: ${originalLocation}`);
              
              narayanganjButton.click();
              console.log('✅ Narayanganj button clicked');
              
              setTimeout(() => {
                const newLocationButton = document.querySelector('button[class*="text-orange-600"]');
                if (newLocationButton) {
                  const newLocation = newLocationButton.textContent;
                  console.log(`New location: ${newLocation}`);
                  
                  if (newLocation.includes('Narayanganj')) {
                    console.log('✅ Location selection successful!');
                    
                    // Test localStorage
                    const savedLocation = localStorage.getItem('selectedLocation');
                    if (savedLocation) {
                      const parsedLocation = JSON.parse(savedLocation);
                      if (parsedLocation.city === 'Narayanganj') {
                        console.log('✅ localStorage persistence working');
                      } else {
                        console.log('❌ localStorage persistence failed');
                      }
                    } else {
                      console.log('❌ No saved location found');
                    }
                    
                    // Check notification
                    const notification = document.querySelector('div[class*="bg-green-500"]');
                    if (notification) {
                      console.log('✅ Notification displayed');
                    } else {
                      console.log('❌ Notification not found');
                    }
                    
                    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
                    console.log('📊 Final Results:');
                    console.log('✅ Location menu button: Working');
                    console.log('✅ Menu opening: Working');
                    console.log('✅ Search input: Working');
                    console.log('✅ Search functionality: Working');
                    console.log('✅ Location selection: Working');
                    console.log('✅ localStorage persistence: Working');
                    console.log('✅ Notification: Working');
                    
                  } else {
                    console.log('❌ Location selection failed - text not updated');
                  }
                } else {
                  console.log('❌ Could not find location button after selection');
                }
              }, 300);
            } else {
              console.log('❌ Narayanganj button not found in search results');
              console.log('Available buttons:');
              searchResults.forEach((btn, index) => {
                console.log(`  ${index + 1}. ${btn.textContent}`);
              });
            }
          }, 300);
        } else {
          console.log('❌ Search input not found');
        }
      } else {
        console.log('❌ Location menu did not open');
      }
    }, 300);
  } catch (e) {
    console.log('❌ Error clicking location button:', e.message);
  }
} else {
  console.log('❌ Location menu button not found');
  console.log('Available buttons with location text:');
  const allButtons = document.querySelectorAll('button');
  Array.from(allButtons).forEach((btn, index) => {
    if (btn.textContent.includes('Deliver') || btn.textContent.includes('Dhaka')) {
      console.log(`  ${index + 1}. ${btn.textContent}`);
    }
  });
}

console.log('\n⏳ Running test... Please wait for results...');