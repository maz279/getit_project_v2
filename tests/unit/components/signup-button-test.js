// SIGNUP BUTTON TESTING SCRIPT
// Run this in browser console to test signup button functionality

console.log('🔍 SIGNUP BUTTON TEST STARTING...');

// Test 1: Check if signup button exists
const signupButtons = document.querySelectorAll('button, a');
const signupElements = Array.from(signupButtons).filter(btn => 
  btn.textContent?.toLowerCase().includes('sign up') || 
  btn.textContent?.toLowerCase().includes('সাইন আপ')
);

console.log(`Found ${signupElements.length} signup button(s):`, signupElements);

// Test 2: Check if buttons have click handlers
signupElements.forEach((btn, index) => {
  console.log(`Button ${index + 1}:`, {
    element: btn,
    textContent: btn.textContent,
    href: btn.href,
    onclick: btn.onclick,
    hasEventListeners: btn.hasAttribute('onclick') || btn.onclick !== null
  });
});

// Test 3: Try clicking the first signup button
if (signupElements.length > 0) {
  console.log('🚀 Attempting to click first signup button...');
  signupElements[0].click();
} else {
  console.log('❌ No signup buttons found!');
}

// Test 4: Check current route
console.log('Current URL:', window.location.href);
console.log('Current pathname:', window.location.pathname);

// Test 5: Check for React Router
console.log('React Router context available:', !!window.history.pushState);