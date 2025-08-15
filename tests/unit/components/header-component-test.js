// Header Component Test - Run this in browser console to debug
console.log('🔍 Header Component Test Starting...');

setTimeout(() => {
  console.log('📋 Testing Header Component Structure...');
  
  // Test 1: Find the header element
  const header = document.querySelector('header');
  console.log('Header found:', header !== null);
  
  if (header) {
    console.log('Header classes:', header.className);
    console.log('Header background:', getComputedStyle(header).background.substring(0, 100));
  }
  
  // Test 2: Find the logo container
  const logoContainer = document.querySelector('div[class*="flex-shrink-0"]');
  console.log('Logo container found:', logoContainer !== null);
  
  if (logoContainer) {
    console.log('Logo container HTML:', logoContainer.innerHTML);
  }
  
  // Test 3: Find the gradient G box
  const gradientBox = document.querySelector('div[class*="w-8"][class*="h-8"]');
  console.log('Gradient box found:', gradientBox !== null);
  
  if (gradientBox) {
    console.log('Gradient box text:', gradientBox.textContent);
    console.log('Gradient box visible:', gradientBox.getBoundingClientRect().width > 0);
  }
  
  // Test 4: Find the GetIt text
  const getItText = document.querySelector('h1[class*="text-2xl"]');
  console.log('GetIt text element found:', getItText !== null);
  
  if (getItText) {
    console.log('GetIt text content:', getItText.textContent);
    console.log('GetIt text classes:', getItText.className);
    console.log('GetIt text dimensions:', getItText.getBoundingClientRect());
    console.log('GetIt text color:', getComputedStyle(getItText).color);
    console.log('GetIt text background:', getComputedStyle(getItText).background);
  }
  
  // Test 5: Manual DOM search
  console.log('\n🔍 Manual DOM Search for "GetIt"...');
  const allElements = document.querySelectorAll('*');
  let foundCount = 0;
  
  allElements.forEach(el => {
    if (el.textContent && el.textContent.includes('GetIt')) {
      foundCount++;
      console.log(`Found GetIt in ${el.tagName}: "${el.textContent.trim()}"`);
      console.log(`  Classes: ${el.className}`);
      console.log(`  Visible: ${el.getBoundingClientRect().width > 0}`);
    }
  });
  
  console.log(`Total elements containing "GetIt": ${foundCount}`);
  
  console.log('\n✅ Header component test completed!');
}, 3000);