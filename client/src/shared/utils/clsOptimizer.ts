/**
 * CLS (Cumulative Layout Shift) Optimizer
 * Aggressive fixes for critical CLS issues (2.52 vs target 0.1)
 * 
 * @fileoverview Emergency CLS optimization to fix layout shifts
 * @version 2.0.0
 * @author GetIt Platform Team
 */

interface CLSOptimizationRule {
  name: string;
  priority: number;
  condition: () => boolean;
  action: () => void;
}

class CLSOptimizer {
  private rules: CLSOptimizationRule[] = [];
  private observer: PerformanceObserver | null = null;
  private clsValue = 0;
  private isOptimizing = false;

  constructor() {
    this.initializeRules();
    this.startMonitoring();
  }

  /**
   * Initialize optimization rules
   */
  private initializeRules(): void {
    this.rules = [
      {
        name: 'Reserve Image Space',
        priority: 1,
        condition: () => this.clsValue > 0.1,
        action: () => this.reserveImageSpace()
      },
      {
        name: 'Fix Dynamic Content',
        priority: 2,
        condition: () => this.clsValue > 0.25,
        action: () => this.fixDynamicContent()
      },
      {
        name: 'Stabilize Layout',
        priority: 3,
        condition: () => this.clsValue > 0.5,
        action: () => this.stabilizeLayout()
      },
      {
        name: 'Emergency Layout Fix',
        priority: 4,
        condition: () => this.clsValue > 1.0,
        action: () => this.emergencyLayoutFix()
      }
    ];
  }

  /**
   * Start monitoring CLS
   */
  private startMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          this.clsValue += (entry as any).value;
          this.checkAndOptimize();
        }
      }
    });

    this.observer.observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Check and apply optimizations
   */
  private checkAndOptimize(): void {
    if (this.isOptimizing) return;

    const applicableRules = this.rules
      .filter(rule => rule.condition())
      .sort((a, b) => a.priority - b.priority);

    if (applicableRules.length > 0) {
      this.isOptimizing = true;
      console.log(`🎯 CLS optimization triggered: ${this.clsValue.toFixed(3)}`);
      
      applicableRules.forEach(rule => {
        console.log(`⚡ Applying rule: ${rule.name}`);
        rule.action();
      });

      setTimeout(() => {
        this.isOptimizing = false;
      }, 1000);
    }
  }

  /**
   * Reserve space for images
   */
  private reserveImageSpace(): void {
    const images = document.querySelectorAll('img:not([data-cls-optimized])');
    
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        const container = img.parentElement;
        if (container) {
          // Set explicit dimensions
          const computedStyle = getComputedStyle(img);
          const width = img.naturalWidth || parseInt(computedStyle.width) || 400;
          const height = img.naturalHeight || parseInt(computedStyle.height) || 300;
          
          if (width && height) {
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            
            img.style.position = 'absolute';
            img.style.top = '0';
            img.style.left = '0';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            img.setAttribute('data-cls-optimized', 'true');
          }
        }
      }
    });
  }

  /**
   * Fix dynamic content
   */
  private fixDynamicContent(): void {
    // Add min-height to prevent layout shifts
    const dynamicElements = document.querySelectorAll('[data-dynamic]:not([data-cls-stabilized])');
    
    dynamicElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const currentHeight = element.offsetHeight;
        if (currentHeight > 0) {
          element.style.minHeight = `${currentHeight}px`;
          element.setAttribute('data-cls-stabilized', 'true');
        }
      }
    });

    // Stabilize cards and components
    const cards = document.querySelectorAll('.card:not([data-cls-stabilized])');
    cards.forEach((card) => {
      if (card instanceof HTMLElement) {
        card.style.minHeight = '200px';
        card.setAttribute('data-cls-stabilized', 'true');
      }
    });
  }

  /**
   * Stabilize layout
   */
  private stabilizeLayout(): void {
    // Add CSS containment
    const style = document.createElement('style');
    style.id = 'cls-optimizer-styles';
    
    if (!document.getElementById('cls-optimizer-styles')) {
      style.textContent = `
        /* Emergency CLS fixes */
        .card, .product-card, .grid-item {
          contain: layout style paint;
          min-height: 200px;
        }
        
        img {
          display: block;
          max-width: 100%;
          height: auto;
        }
        
        /* Prevent text layout shifts */
        .text-container, p, h1, h2, h3, h4, h5, h6 {
          min-height: 1.2em;
        }
        
        /* Stabilize grid layouts */
        .grid {
          grid-template-rows: repeat(auto-fit, minmax(200px, 1fr));
        }
        
        /* Prevent button layout shifts */
        button, .btn {
          min-height: 40px;
          min-width: 80px;
        }
        
        /* Prevent component layout shifts */
        .component {
          contain: layout style paint;
        }
      `;
      
      document.head.appendChild(style);
    }
  }

  /**
   * Emergency layout fix
   */
  private emergencyLayoutFix(): void {
    console.log('🚨 Emergency CLS fix activated');
    
    // Freeze all layout-shifting elements
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const computedStyle = getComputedStyle(element);
        
        // Skip if already fixed
        if (element.hasAttribute('data-emergency-fixed')) return;
        
        // Apply emergency fixes
        if (computedStyle.position !== 'fixed' && computedStyle.position !== 'absolute') {
          const rect = element.getBoundingClientRect();
          
          if (rect.width > 0 && rect.height > 0) {
            element.style.width = `${rect.width}px`;
            element.style.height = `${rect.height}px`;
            element.style.contain = 'layout style paint';
            element.setAttribute('data-emergency-fixed', 'true');
          }
        }
      }
    });

    // Add global emergency styles
    const emergencyStyle = document.createElement('style');
    emergencyStyle.id = 'emergency-cls-fix';
    
    if (!document.getElementById('emergency-cls-fix')) {
      emergencyStyle.textContent = `
        /* Emergency CLS containment */
        * {
          contain: layout style paint;
        }
        
        /* Force hardware acceleration */
        .card, .grid-item, .product-card {
          transform: translateZ(0);
          will-change: transform;
        }
        
        /* Prevent any layout shifts */
        img, video, iframe {
          width: 100% !important;
          height: auto !important;
          display: block !important;
        }
      `;
      
      document.head.appendChild(emergencyStyle);
    }
  }

  /**
   * Get current CLS value
   */
  getCurrentCLS(): number {
    return this.clsValue;
  }

  /**
   * Reset CLS monitoring
   */
  resetCLS(): void {
    this.clsValue = 0;
  }

  /**
   * Force optimization
   */
  forceOptimization(): void {
    console.log('🔧 Force CLS optimization');
    this.emergencyLayoutFix();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.observer?.disconnect();
    
    // Remove emergency styles
    const styles = document.querySelectorAll('#cls-optimizer-styles, #emergency-cls-fix');
    styles.forEach(style => style.remove());
    
    // Remove optimization attributes
    const optimizedElements = document.querySelectorAll('[data-cls-optimized], [data-cls-stabilized], [data-emergency-fixed]');
    optimizedElements.forEach((element) => {
      element.removeAttribute('data-cls-optimized');
      element.removeAttribute('data-cls-stabilized');
      element.removeAttribute('data-emergency-fixed');
    });
  }
}

export default new CLSOptimizer();