// Logo Debug Test Script - Run this in browser console
console.log('🔍 Logo Debug Test Starting...');

// Force refresh to clear any caching
console.log('🔄 Forcing refresh to clear cache...');
setTimeout(() => {
  console.log('🔍 Testing Logo Visibility...');
  
  // Test 1: Find all gradient elements
  const gradientElements = document.querySelectorAll('[class*="bg-gradient"]');
  console.log(`✅ Found ${gradientElements.length} gradient elements`);
  
  gradientElements.forEach((el, i) => {
    console.log(`  [${i}] ${el.tagName} - Classes: ${el.className}`);
    console.log(`      Text: "${el.textContent?.trim()}"`);
    console.log(`      Computed styles:`, {
      display: getComputedStyle(el).display,
      visibility: getComputedStyle(el).visibility,
      opacity: getComputedStyle(el).opacity,
      background: getComputedStyle(el).background.substring(0, 100)
    });
  });
  
  // Test 2: Find the specific logo elements
  const logoContainer = document.querySelector('div[class*="w-8"][class*="h-8"][class*="bg-gradient"]');
  console.log('🎯 Logo container found:', logoContainer !== null);
  
  if (logoContainer) {
    console.log('✅ Logo container details:', {
      className: logoContainer.className,
      textContent: logoContainer.textContent,
      innerHTML: logoContainer.innerHTML,
      parentElement: logoContainer.parentElement?.tagName,
      parentClass: logoContainer.parentElement?.className
    });
  }
  
  // Test 3: Find "etIt" text
  const etItElement = document.querySelector('h1[class*="text-2xl"] + h1, h1[class*="text-2xl"]:contains("etIt")');
  console.log('🎯 "etIt" element found:', etItElement !== null);
  
  if (etItElement) {
    console.log('✅ "etIt" element details:', {
      className: etItElement.className,
      textContent: etItElement.textContent,
      innerHTML: etItElement.innerHTML
    });
  }
  
  // Test 4: Manual search for GetIt/etIt text
  const allTextElements = document.querySelectorAll('*');
  const logoTextElements = [];
  
  allTextElements.forEach(el => {
    if (el.textContent?.includes('etIt') || el.textContent?.includes('GetIt')) {
      logoTextElements.push({
        element: el,
        text: el.textContent?.trim(),
        tag: el.tagName,
        className: el.className
      });
    }
  });
  
  console.log(`🔍 Found ${logoTextElements.length} elements containing logo text:`);
  logoTextElements.forEach((item, i) => {
    console.log(`  [${i}] ${item.tag}.${item.className}: "${item.text}"`);
  });
  
  // Test 5: Check if header is rendering at all
  const headers = document.querySelectorAll('header');
  console.log(`🔍 Found ${headers.length} header elements`);
  
  headers.forEach((header, i) => {
    console.log(`  Header [${i}]:`, {
      className: header.className,
      textContent: header.textContent?.substring(0, 200) + '...',
      childrenCount: header.children.length
    });
  });
  
  // Test 6: Check current URL
  console.log('🔍 Current page info:', {
    url: window.location.href,
    pathname: window.location.pathname,
    hash: window.location.hash
  });
  
  console.log('✅ Logo debug test completed!');
}, 1000);