/**
 * Emergency Layout Stabilizer
 * Immediate CLS fixes for performance dashboard
 * 
 * @fileoverview Emergency stabilization for critical layout shifts
 * @version 1.0.0
 * @author GetIt Platform Team
 */

class EmergencyStabilizer {
  private isActive = false;
  private originalStyles = new Map<Element, string>();

  /**
   * Apply immediate stabilization
   */
  stabilize(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🚨 Emergency stabilizer activated');
    
    // 1. Stop all animations immediately
    this.stopAnimations();
    
    // 2. Fix all images immediately
    this.fixImages();
    
    // 3. Stabilize dynamic content
    this.stabilizeDynamicContent();
    
    // 4. Apply global containment
    this.applyGlobalContainment();
  }

  /**
   * Stop all animations and transitions
   */
  private stopAnimations(): void {
    const style = document.createElement('style');
    style.id = 'emergency-stop-animations';
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Fix all images to prevent layout shifts
   */
  private fixImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        const rect = img.getBoundingClientRect();
        
        // Store original styles
        this.originalStyles.set(img, img.style.cssText);
        
        // Apply fixed dimensions
        if (rect.width > 0 && rect.height > 0) {
          img.style.width = rect.width + 'px';
          img.style.height = rect.height + 'px';
        } else {
          img.style.width = '100%';
          img.style.height = '200px';
        }
        
        img.style.objectFit = 'cover';
        img.style.aspectRatio = 'auto';
      }
    });
  }

  /**
   * Stabilize dynamic content that causes shifts
   */
  private stabilizeDynamicContent(): void {
    // Fix badges and dynamic text
    const badges = document.querySelectorAll('[class*="badge"], [class*="Badge"]');
    badges.forEach(badge => {
      if (badge instanceof HTMLElement) {
        this.originalStyles.set(badge, badge.style.cssText);
        badge.style.minWidth = '60px';
        badge.style.textAlign = 'center';
        badge.style.display = 'inline-block';
      }
    });

    // Fix cards
    const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
    cards.forEach(card => {
      if (card instanceof HTMLElement) {
        this.originalStyles.set(card, card.style.cssText);
        card.style.minHeight = card.offsetHeight + 'px';
        card.style.contain = 'layout';
      }
    });

    // Fix tabs
    const tabs = document.querySelectorAll('[class*="tab"], [class*="Tab"]');
    tabs.forEach(tab => {
      if (tab instanceof HTMLElement) {
        this.originalStyles.set(tab, tab.style.cssText);
        tab.style.contain = 'layout';
      }
    });
  }

  /**
   * Apply global layout containment
   */
  private applyGlobalContainment(): void {
    const style = document.createElement('style');
    style.id = 'emergency-global-containment';
    style.textContent = `
      /* Global containment to prevent layout shifts */
      .performance-dashboard,
      .performance-test-page,
      [data-testid="performance-dashboard"] {
        contain: layout style paint !important;
        overflow: hidden !important;
      }
      
      /* Stabilize all dynamic content */
      * {
        box-sizing: border-box !important;
      }
      
      /* Prevent text wrapping changes */
      [class*="text-"] {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      
      /* Fixed dimensions for performance metrics */
      [class*="metric"] {
        min-width: 100px !important;
        min-height: 40px !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Deactivate stabilizer and restore original styles
   */
  deactivate(): void {
    if (!this.isActive) return;
    
    // Remove emergency styles
    const emergencyStyles = [
      'emergency-stop-animations',
      'emergency-global-containment'
    ];
    
    emergencyStyles.forEach(id => {
      const style = document.getElementById(id);
      if (style) {
        style.remove();
      }
    });

    // Restore original styles
    this.originalStyles.forEach((originalStyle, element) => {
      if (element instanceof HTMLElement) {
        element.style.cssText = originalStyle;
      }
    });
    
    this.originalStyles.clear();
    this.isActive = false;
    
    console.log('✅ Emergency stabilizer deactivated');
  }

  /**
   * Check if stabilizer is active
   */
  isActivated(): boolean {
    return this.isActive;
  }
}

export default new EmergencyStabilizer();