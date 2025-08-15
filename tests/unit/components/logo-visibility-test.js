// Logo Visibility Test - Run in browser console to debug text visibility
console.log('🔍 Logo Visibility Test Starting...');

setTimeout(() => {
  console.log('🔍 Checking logo text visibility...');
  
  // Find all elements containing "GetIt"
  const allElements = document.querySelectorAll('*');
  const getItElements = [];
  
  allElements.forEach(el => {
    if (el.textContent && el.textContent.includes('GetIt')) {
      getItElements.push({
        element: el,
        tag: el.tagName,
        className: el.className,
        textContent: el.textContent.trim(),
        computedStyle: {
          display: getComputedStyle(el).display,
          visibility: getComputedStyle(el).visibility,
          opacity: getComputedStyle(el).opacity,
          color: getComputedStyle(el).color,
          fontSize: getComputedStyle(el).fontSize,
          fontWeight: getComputedStyle(el).fontWeight,
          position: getComputedStyle(el).position,
          zIndex: getComputedStyle(el).zIndex,
          overflow: getComputedStyle(el).overflow,
          whiteSpace: getComputedStyle(el).whiteSpace,
          width: getComputedStyle(el).width,
          height: getComputedStyle(el).height,
          backgroundColor: getComputedStyle(el).backgroundColor,
          border: getComputedStyle(el).border
        },
        boundingRect: el.getBoundingClientRect()
      });
    }
  });
  
  console.log(`Found ${getItElements.length} elements containing "GetIt"`);
  
  getItElements.forEach((item, index) => {
    console.log(`\n--- Element ${index + 1} ---`);
    console.log(`Tag: ${item.tag}`);
    console.log(`Class: ${item.className}`);
    console.log(`Text: "${item.textContent}"`);
    console.log(`Bounding Rect:`, item.boundingRect);
    console.log(`Computed Style:`, item.computedStyle);
    
    // Check if element is actually visible
    const rect = item.boundingRect;
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     item.computedStyle.display !== 'none' && 
                     item.computedStyle.visibility !== 'hidden' && 
                     item.computedStyle.opacity !== '0';
    
    console.log(`Is Visible: ${isVisible}`);
    
    if (!isVisible) {
      console.log('⚠️ Element is not visible! Possible issues:');
      if (rect.width === 0 || rect.height === 0) console.log('  - Element has zero dimensions');
      if (item.computedStyle.display === 'none') console.log('  - Element display is none');
      if (item.computedStyle.visibility === 'hidden') console.log('  - Element visibility is hidden');
      if (item.computedStyle.opacity === '0') console.log('  - Element opacity is 0');
    }
  });
  
  // Check for gradient boxes
  const gradientBoxes = document.querySelectorAll('[class*="bg-gradient"]');
  console.log(`\n🎨 Found ${gradientBoxes.length} gradient boxes`);
  
  gradientBoxes.forEach((box, index) => {
    const rect = box.getBoundingClientRect();
    console.log(`\nGradient Box ${index + 1}:`);
    console.log(`  Text: "${box.textContent?.trim()}"`);
    console.log(`  Class: ${box.className}`);
    console.log(`  Dimensions: ${rect.width}x${rect.height}`);
    console.log(`  Position: ${rect.left}, ${rect.top}`);
    console.log(`  Background: ${getComputedStyle(box).background.substring(0, 100)}`);
  });
  
  console.log('\n✅ Logo visibility test completed!');
}, 2000);