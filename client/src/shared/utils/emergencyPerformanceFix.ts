/**
 * Emergency Performance Fix
 * Aggressive fixes for critical CLS and performance issues
 * 
 * @fileoverview Emergency performance optimization for immediate CLS reduction
 * @version 1.0.0
 * @author GetIt Platform Team
 */

interface EmergencyFixConfig {
  maxCLS: number;
  maxMemory: number;
  aggressiveMode: boolean;
  emergencyMode: boolean;
}

class EmergencyPerformanceFix {
  private config: EmergencyFixConfig = {
    maxCLS: 0.1,
    maxMemory: 90,
    aggressiveMode: true,
    emergencyMode: true
  };

  private isApplied = false;
  private observer: PerformanceObserver | null = null;

  /**
   * Apply emergency performance fixes immediately
   */
  applyEmergencyFixes(): void {
    if (this.isApplied) return;
    
    console.log('🚨 EMERGENCY PERFORMANCE FIXES ACTIVATED');
    
    // 1. Immediate CLS fixes
    this.emergencyCLSFix();
    
    // 2. Memory cleanup
    this.emergencyMemoryCleanup();
    
    // 3. Image stabilization
    this.emergencyImageStabilization();
    
    // 4. Layout containment
    this.emergencyLayoutContainment();
    
    // 5. Resource optimization
    this.emergencyResourceOptimization();
    
    this.isApplied = true;
    this.startEmergencyMonitoring();
  }

  /**
   * Emergency CLS fix - aggressive layout stabilization
   */
  private emergencyCLSFix(): void {
    const style = document.createElement('style');
    style.id = 'emergency-cls-fix';
    style.textContent = `
      /* EMERGENCY CLS FIXES */
      * {
        contain: layout style paint !important;
      }
      
      /* Force all images to have fixed dimensions */
      img {
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 16/9 !important;
        object-fit: cover !important;
        display: block !important;
        max-width: 100% !important;
      }
      
      /* Prevent any layout shifts */
      .card, .product-card, .grid-item {
        min-height: 300px !important;
        contain: layout style paint size !important;
        will-change: transform !important;
        transform: translateZ(0) !important;
      }
      
      /* Stabilize text containers */
      p, h1, h2, h3, h4, h5, h6, span, div {
        min-height: 1em !important;
      }
      
      /* Force grid stability */
      .grid {
        grid-template-rows: repeat(auto-fit, minmax(300px, 1fr)) !important;
      }
      
      /* Prevent button layout shifts */
      button, .btn {
        min-height: 40px !important;
        min-width: 100px !important;
      }
      
      /* Emergency animation disabling */
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    
    document.head.appendChild(style);
    console.log('🎯 Emergency CLS containment applied');
  }

  /**
   * Emergency memory cleanup
   */
  private emergencyMemoryCleanup(): void {
    // Force garbage collection
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    // Clear all intervals and timeouts
    const highestIntervalId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestIntervalId; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
    
    // Disconnect all observers
    if ('IntersectionObserver' in window) {
      (window as any).disconnectAllObservers?.();
    }
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    console.log('🧠 Emergency memory cleanup complete');
  }

  /**
   * Emergency image stabilization
   */
  private emergencyImageStabilization(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach((img, index) => {
      // Set fixed dimensions immediately
      const width = img.offsetWidth || 400;
      const height = img.offsetHeight || 300;
      
      // Create placeholder container
      const container = document.createElement('div');
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.backgroundColor = '#f3f4f6';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.color = '#9ca3af';
      container.style.fontSize = '14px';
      container.innerHTML = 'Loading...';
      
      // Replace image with container temporarily
      if (img.parentNode) {
        img.parentNode.insertBefore(container, img);
        img.style.position = 'absolute';
        img.style.opacity = '0';
        
        // When image loads, show it
        img.onload = () => {
          img.style.opacity = '1';
          img.style.transition = 'opacity 0.3s';
        };
        
        // Handle errors
        img.onerror = () => {
          container.innerHTML = 'Image failed';
          container.style.backgroundColor = '#fef2f2';
          container.style.color = '#dc2626';
        };
      }
    });
    
    console.log(`🖼️ Emergency image stabilization applied to ${images.length} images`);
  }

  /**
   * Emergency layout containment
   */
  private emergencyLayoutContainment(): void {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        // Apply containment
        element.style.contain = 'layout style paint';
        
        // Fix dimensions if they exist
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          element.style.minWidth = `${rect.width}px`;
          element.style.minHeight = `${rect.height}px`;
        }
      }
    });
    
    console.log('📦 Emergency layout containment applied');
  }

  /**
   * Emergency resource optimization
   */
  private emergencyResourceOptimization(): void {
    // Disable heavy animations
    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
    animatedElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.animation = 'none';
        el.style.transition = 'none';
      }
    });
    
    // Lazy load all images
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
    
    // Reduce image quality for performance
    const unsplashImages = document.querySelectorAll('img[src*="unsplash"]');
    unsplashImages.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.includes('q=')) {
        const url = new URL(src);
        url.searchParams.set('q', '60'); // Lower quality for performance
        url.searchParams.set('w', '400'); // Smaller width
        img.setAttribute('src', url.toString());
      }
    });
    
    console.log('⚡ Emergency resource optimization complete');
  }

  /**
   * Start emergency performance monitoring
   */
  private startEmergencyMonitoring(): void {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          const cls = (entry as any).value;
          if (cls > 0.01) { // Any layout shift
            console.warn('🚨 Layout shift detected after emergency fix:', cls);
            this.applyAdditionalFixes();
          }
        }
      }
    });

    this.observer.observe({ entryTypes: ['layout-shift'] });
    
    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        if (usage > this.config.maxMemory) {
          console.warn('🧠 High memory usage detected:', usage);
          this.emergencyMemoryCleanup();
        }
      }
    }, 3000);
  }

  /**
   * Apply additional fixes when issues persist
   */
  private applyAdditionalFixes(): void {
    // Force all elements to be stable
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.contain = 'size layout style paint';
        el.style.willChange = 'auto';
      }
    });
    
    console.log('🔧 Additional emergency fixes applied');
  }

  /**
   * Cleanup emergency fixes
   */
  cleanup(): void {
    const emergencyStyle = document.getElementById('emergency-cls-fix');
    if (emergencyStyle) {
      emergencyStyle.remove();
    }
    
    this.observer?.disconnect();
    this.isApplied = false;
  }
}

export default new EmergencyPerformanceFix();