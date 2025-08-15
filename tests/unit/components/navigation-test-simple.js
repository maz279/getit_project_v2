// Simple navigation test script
// Run this in browser console

console.log('=== SIMPLE NAVIGATION TEST ===');

// Test from homepage
console.log('1. Going to homepage...');
window.location.href = '/';

setTimeout(() => {
  console.log('2. Current location:', window.location.pathname);
  console.log('3. Looking for signup button...');
  
  const signupButtons = Array.from(document.querySelectorAll('button, a')).filter(btn => 
    btn.textContent?.toLowerCase().includes('sign up') || 
    btn.textContent?.toLowerCase().includes('সাইন আপ')
  );
  
  console.log('4. Found signup buttons:', signupButtons.length);
  
  if (signupButtons.length > 0) {
    console.log('5. Clicking first signup button...');
    signupButtons[0].click();
    
    setTimeout(() => {
      console.log('6. Final location:', window.location.pathname);
      if (window.location.pathname === '/signup') {
        console.log('✅ SUCCESS: Navigation worked!');
      } else {
        console.log('❌ FAILED: Still on ' + window.location.pathname);
      }
    }, 500);
  } else {
    console.log('❌ No signup buttons found');
  }
}, 1000);