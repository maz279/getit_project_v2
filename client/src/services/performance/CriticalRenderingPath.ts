/**
 * Phase 1.2: Critical Rendering Path Optimization
 * Target: FCP 3000ms → 1000ms (67% improvement)
 */

import { useEffect } from 'react';

// Critical CSS extraction and inlining
export const getCriticalCSS = () => {
  return `
    /* Critical CSS - Above the fold styles */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
    }
    
    /* Critical header styles */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      z-index: 1000;
      display: flex;
      align-items: center;
      padding: 0 20px;
    }
    
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
    }
    
    /* Critical navigation styles */
    .nav {
      display: flex;
      gap: 20px;
      margin-left: auto;
    }
    
    .nav a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
    }
    
    /* Critical main content styles */
    .main {
      margin-top: 60px;
      min-height: 100vh;
    }
    
    /* Critical button styles */
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.2s;
    }
    
    .btn:hover {
      background: #0056b3;
    }
    
    /* Critical loading styles */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      font-size: 18px;
      color: #666;
    }
    
    /* Critical responsive styles */
    @media (max-width: 768px) {
      .header {
        padding: 0 15px;
      }
      
      .nav {
        display: none;
      }
      
      .btn {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  `;
};

// Inline critical CSS in document head
export const inlineCriticalCSS = () => {
  const style = document.createElement('style');
  style.textContent = getCriticalCSS();
  document.head.appendChild(style);
};

// Resource hints implementation
export const addResourceHints = () => {
  const head = document.head;
  
  // Preload critical resources
  const criticalResources = [
    { href: '/fonts/main.woff2', as: 'font', type: 'font/woff2' },
    { href: '/api/v1/config', as: 'fetch' },
    { href: '/images/hero-bg.webp', as: 'image' },
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.as === 'font') link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });
  
  // Prefetch non-critical resources
  const prefetchResources = [
    '/api/v1/user/profile',
    '/api/v1/products/trending',
    '/images/product-placeholder.webp',
    '/js/analytics.js',
  ];
  
  prefetchResources.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    head.appendChild(link);
  });
  
  // DNS prefetch for external domains
  const dnsPreconnect = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.analytics.com',
    'https://cdn.payment.com',
  ];
  
  dnsPreconnect.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    head.appendChild(link);
  });
};

// Font loading optimization
export const optimizeFontLoading = () => {
  const fontFaces = [
    {
      family: 'Inter',
      src: "url('/fonts/inter-regular.woff2') format('woff2')",
      weight: '400',
      display: 'swap'
    },
    {
      family: 'Inter',
      src: "url('/fonts/inter-medium.woff2') format('woff2')",
      weight: '500',
      display: 'swap'
    },
    {
      family: 'Inter',
      src: "url('/fonts/inter-bold.woff2') format('woff2')",
      weight: '700',
      display: 'swap'
    }
  ];
  
  const style = document.createElement('style');
  style.textContent = fontFaces.map(font => `
    @font-face {
      font-family: '${font.family}';
      src: ${font.src};
      font-weight: ${font.weight};
      font-display: ${font.display};
    }
  `).join('\n');
  
  document.head.appendChild(style);
};

// Eliminate render-blocking resources
export const eliminateRenderBlocking = () => {
  // Move non-critical CSS to end of body
  const nonCriticalCSS = [
    '/css/components.css',
    '/css/utilities.css',
    '/css/animations.css',
  ];
  
  nonCriticalCSS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.body.appendChild(link);
  });
  
  // Load non-critical JavaScript asynchronously
  const nonCriticalJS = [
    '/js/analytics.js',
    '/js/chat.js',
    '/js/features.js',
  ];
  
  nonCriticalJS.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  });
};

// Progressive enhancement hook
export const useProgressiveEnhancement = () => {
  useEffect(() => {
    // Check if JavaScript is enabled
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
    
    // Progressive enhancement for features
    if ('IntersectionObserver' in window) {
      document.documentElement.classList.add('intersection-observer');
    }
    
    if ('serviceWorker' in navigator) {
      document.documentElement.classList.add('service-worker');
    }
    
    if ('requestIdleCallback' in window) {
      document.documentElement.classList.add('idle-callback');
    }
    
    // Feature detection for modern image formats
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };
    
    if (supportsWebP()) {
      document.documentElement.classList.add('webp');
    }
    
    // Connection speed detection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType) {
        document.documentElement.classList.add(`connection-${connection.effectiveType}`);
      }
    }
  }, []);
};

// Critical path performance monitoring
export const monitorCriticalPath = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      processing: navigation.domComplete - navigation.responseEnd,
      load: navigation.loadEventEnd - navigation.navigationStart,
    };
    
    // Log performance metrics
    console.log('Critical Path Metrics:', metrics);
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'critical_path',
        value: metrics.load
      });
    }
    
    return metrics;
  }
  
  return null;
};

// Initialize critical rendering path optimizations
export const initializeCriticalPath = () => {
  // Inline critical CSS immediately
  inlineCriticalCSS();
  
  // Add resource hints
  addResourceHints();
  
  // Optimize font loading
  optimizeFontLoading();
  
  // Eliminate render-blocking resources
  eliminateRenderBlocking();
  
  // Monitor performance
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', monitorCriticalPath);
  } else {
    monitorCriticalPath();
  }
};

export default {
  getCriticalCSS,
  inlineCriticalCSS,
  addResourceHints,
  optimizeFontLoading,
  eliminateRenderBlocking,
  useProgressiveEnhancement,
  monitorCriticalPath,
  initializeCriticalPath
};