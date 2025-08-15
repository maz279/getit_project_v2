// Comprehensive Logo Rendering Test
// This will identify which components are actually rendering the logo

console.log('🔍 LOGO RENDERING TEST - Finding actual rendering source');

setTimeout(() => {
  console.log('\n=== STEP 1: Find all logo text elements ===');
  
  // Find all elements containing logo text
  const allElements = document.querySelectorAll('*');
  const logoElements = [];
  
  allElements.forEach(el => {
    const text = el.textContent?.trim();
    if (text && (text.includes('GetIt') || text.includes('etIt') || text.includes('GETIT'))) {
      // Only leaf nodes (no children with text)
      if (el.children.length === 0 || !Array.from(el.children).some(child => child.textContent?.trim())) {
        logoElements.push({
          element: el,
          text: text,
          tag: el.tagName,
          classes: el.className,
          id: el.id,
          parent: el.parentElement?.tagName,
          parentClasses: el.parentElement?.className,
          computedStyles: {
            display: getComputedStyle(el).display,
            visibility: getComputedStyle(el).visibility,
            opacity: getComputedStyle(el).opacity,
            position: getComputedStyle(el).position,
            zIndex: getComputedStyle(el).zIndex
          },
          boundingRect: el.getBoundingClientRect()
        });
      }
    }
  });
  
  console.log(`Found ${logoElements.length} logo text elements:`);
  logoElements.forEach((item, index) => {
    console.log(`\n[${index}] ${item.tag} - "${item.text}"`);
    console.log(`  Classes: ${item.classes}`);
    console.log(`  Parent: ${item.parent}.${item.parentClasses}`);
    console.log(`  Visible: ${item.computedStyles.visibility}, Display: ${item.computedStyles.display}`);
    console.log(`  Position: ${item.boundingRect.top}, ${item.boundingRect.left}, ${item.boundingRect.width}x${item.boundingRect.height}`);
  });
  
  console.log('\n=== STEP 2: Check header structure ===');
  
  const headers = document.querySelectorAll('header');
  console.log(`Found ${headers.length} header elements:`);
  
  headers.forEach((header, index) => {
    console.log(`\nHeader [${index}]:`);
    console.log(`  Classes: ${header.className}`);
    console.log(`  Children: ${header.children.length}`);
    console.log(`  Text content: "${header.textContent?.substring(0, 200)}..."`);
    
    // Find logos within this header
    const headerLogos = header.querySelectorAll('*');
    const headerLogoTexts = [];
    headerLogos.forEach(el => {
      const text = el.textContent?.trim();
      if (text && (text.includes('GetIt') || text.includes('etIt') || text.includes('GETIT')) && el.children.length === 0) {
        headerLogoTexts.push({
          tag: el.tagName,
          text: text,
          classes: el.className
        });
      }
    });
    
    console.log(`  Logo texts in header: ${headerLogoTexts.length}`);
    headerLogoTexts.forEach((logo, i) => {
      console.log(`    [${i}] ${logo.tag}.${logo.classes} - "${logo.text}"`);
    });
  });
  
  console.log('\n=== STEP 3: Check React component rendering ===');
  
  // Try to find React components
  const reactComponents = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
  console.log(`Found ${reactComponents.length} React components`);
  
  // Check for specific component patterns
  const logoContainers = document.querySelectorAll('div[class*="w-8"], div[class*="w-6"], div[class*="w-10"]');
  console.log(`Found ${logoContainers.length} potential logo containers:`);
  
  logoContainers.forEach((container, index) => {
    const hasGradient = container.className.includes('gradient');
    const hasG = container.textContent?.includes('G');
    const nextSibling = container.nextElementSibling;
    const nextSiblingText = nextSibling?.textContent?.trim();
    
    if (hasGradient && hasG) {
      console.log(`\n[${index}] Potential logo container:`);
      console.log(`  Classes: ${container.className}`);
      console.log(`  Text: "${container.textContent?.trim()}"`);
      console.log(`  Next sibling: ${nextSibling?.tagName}.${nextSibling?.className}`);
      console.log(`  Next sibling text: "${nextSiblingText}"`);
      console.log(`  Visible: ${getComputedStyle(container).visibility}`);
      console.log(`  Display: ${getComputedStyle(container).display}`);
    }
  });
  
  console.log('\n=== STEP 4: Check for multiple rendering sources ===');
  
  // Look for all possible logo text sources
  const textSources = [
    'GetIt', 'etIt', 'GETIT', 'গেটইট'
  ];
  
  textSources.forEach(source => {
    const elements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent?.includes(source) && el.children.length === 0
    );
    
    if (elements.length > 0) {
      console.log(`\n"${source}" found in ${elements.length} elements:`);
      elements.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         getComputedStyle(el).visibility !== 'hidden' && 
                         getComputedStyle(el).display !== 'none';
        console.log(`  [${i}] ${el.tagName}.${el.className} - Visible: ${isVisible}`);
      });
    }
  });
  
  console.log('\n=== STEP 5: Check current URL and routing ===');
  console.log(`Current URL: ${window.location.href}`);
  console.log(`Current pathname: ${window.location.pathname}`);
  
  // Check if we're on the right page
  const isHomepage = window.location.pathname === '/' || window.location.pathname === '/customer/homepage';
  console.log(`Is homepage: ${isHomepage}`);
  
  console.log('\n=== TEST COMPLETE ===');
  
}, 2000);