/**
 * Static Fallback Mode - Ultimate CLS Prevention
 * Completely freezes dynamic content when CLS exceeds critical thresholds
 * 
 * @fileoverview Emergency static mode to prevent catastrophic layout shifts
 * @version 1.0.0
 * @author GetIt Platform Team
 */

class StaticFallbackMode {
  private isActive = false;
  private frozenContent = new Map<Element, string>();
  private readonly CRITICAL_CLS_THRESHOLD = 0.5;

  /**
   * Activate static fallback mode immediately
   */
  activate(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🛑 STATIC FALLBACK MODE ACTIVATED - Freezing all dynamic content');
    
    // 1. Stop all animations and transitions immediately
    this.stopAllAnimations();
    
    // 2. Freeze all dynamic content
    this.freezeAllContent();
    
    // 3. Apply maximum layout containment
    this.applyMaximumContainment();
    
    // 4. Disable all auto-refresh mechanisms
    this.disableAutoRefresh();
  }

  /**
   * Stop all animations and transitions globally
   */
  private stopAllAnimations(): void {
    const style = document.createElement('style');
    style.id = 'static-fallback-no-animations';
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition: none !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        transform: none !important;
      }
      
      .animate-spin,
      .animate-pulse,
      .animate-bounce {
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Freeze all dynamic content with fixed dimensions
   */
  private freezeAllContent(): void {
    // Freeze all text content
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element instanceof HTMLElement) {
        const rect = element.getBoundingClientRect();
        
        if (rect.width > 0 && rect.height > 0) {
          this.frozenContent.set(element, element.style.cssText);
          
          // Apply fixed dimensions
          element.style.width = rect.width + 'px';
          element.style.height = rect.height + 'px';
          element.style.minWidth = rect.width + 'px';
          element.style.minHeight = rect.height + 'px';
          element.style.maxWidth = rect.width + 'px';
          element.style.maxHeight = rect.height + 'px';
          
          // Prevent content overflow
          element.style.overflow = 'hidden';
          element.style.textOverflow = 'ellipsis';
          element.style.whiteSpace = 'nowrap';
        }
      }
    });

    // Freeze all images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        const rect = img.getBoundingClientRect();
        img.style.width = rect.width + 'px';
        img.style.height = rect.height + 'px';
        img.style.objectFit = 'cover';
      }
    });
  }

  /**
   * Apply maximum layout containment
   */
  private applyMaximumContainment(): void {
    const style = document.createElement('style');
    style.id = 'static-fallback-containment';
    style.textContent = `
      /* Maximum containment for all elements */
      * {
        contain: layout style paint size !important;
        box-sizing: border-box !important;
      }
      
      /* Prevent any layout changes */
      body, html {
        overflow: hidden !important;
        height: 100vh !important;
        width: 100vw !important;
      }
      
      /* Freeze the performance dashboard */
      .performance-dashboard,
      .performance-test-page,
      [data-testid="performance-dashboard"] {
        position: fixed !important;
        contain: strict !important;
        overflow: hidden !important;
      }
      
      /* Prevent text changes */
      [class*="text-"],
      span,
      p,
      div {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      
      /* Freeze all progress indicators */
      [class*="progress"],
      [class*="Progress"] {
        animation: none !important;
        transition: none !important;
      }
      
      /* Disable hover effects */
      *:hover {
        transform: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Disable all auto-refresh mechanisms
   */
  private disableAutoRefresh(): void {
    // Clear all intervals
    const maxIntervalId = setTimeout(() => {}, 0);
    for (let i = 1; i <= maxIntervalId; i++) {
      clearInterval(i);
      clearTimeout(i);
    }

    // Override setTimeout and setInterval to prevent new timers
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    
    window.setTimeout = function() {
      console.log('🛑 setTimeout blocked in static fallback mode');
      return 0;
    };
    
    window.setInterval = function() {
      console.log('🛑 setInterval blocked in static fallback mode');
      return 0;
    };
  }

  /**
   * Check if static fallback mode should be activated
   */
  shouldActivate(cls: number): boolean {
    return cls > this.CRITICAL_CLS_THRESHOLD;
  }

  /**
   * Check if static fallback mode is active
   */
  isActivated(): boolean {
    return this.isActive;
  }

  /**
   * Deactivate static fallback mode (use with extreme caution)
   */
  deactivate(): void {
    console.log('⚠️ Deactivating static fallback mode - CLS monitoring will resume');
    
    // Remove static fallback styles
    const staticStyles = [
      'static-fallback-no-animations',
      'static-fallback-containment'
    ];
    
    staticStyles.forEach(id => {
      const style = document.getElementById(id);
      if (style) {
        style.remove();
      }
    });

    // Restore original styles
    this.frozenContent.forEach((originalStyle, element) => {
      if (element instanceof HTMLElement) {
        element.style.cssText = originalStyle;
      }
    });
    
    this.frozenContent.clear();
    this.isActive = false;
  }
}

export default new StaticFallbackMode();