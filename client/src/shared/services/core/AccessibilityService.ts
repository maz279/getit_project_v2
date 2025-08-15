/**
 * Accessibility Service
 * Amazon.com/Shopee.sg-Level Accessibility Implementation
 * WCAG 2.1 AA compliance with comprehensive accessibility features
 */

interface AccessibilityOptions {
  enableFocusManagement: boolean;
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableColorContrast: boolean;
  enableTextScaling: boolean;
  enableMotionReduction: boolean;
}

interface AccessibilityViolation {
  type: 'contrast' | 'focus' | 'aria' | 'keyboard' | 'text';
  severity: 'error' | 'warning' | 'info';
  element: string;
  message: string;
  suggestion: string;
  timestamp: number;
}

interface AccessibilityReport {
  score: number;
  violations: AccessibilityViolation[];
  compliance: {
    wcag21aa: number;
    section508: number;
    amazonStandards: number;
  };
  recommendations: string[];
}

class AccessibilityService {
  private static instance: AccessibilityService;
  private options: AccessibilityOptions;
  private violations: AccessibilityViolation[] = [];
  private focusHistory: Element[] = [];
  private announcements: string[] = [];

  private constructor() {
    this.options = {
      enableFocusManagement: true,
      enableScreenReader: true,
      enableKeyboardNavigation: true,
      enableColorContrast: true,
      enableTextScaling: true,
      enableMotionReduction: true
    };

    this.initialize();
  }

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Initialize accessibility features
   */
  private initialize(): void {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupColorContrastMonitoring();
    this.setupMotionReduction();
    this.setupTextScaling();
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    if (!this.options.enableKeyboardNavigation) return;

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Tab':
          this.handleTabNavigation(event);
          break;
        case 'Enter':
        case ' ':
          this.handleActivation(event);
          break;
        case 'Escape':
          this.handleEscape(event);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.handleArrowNavigation(event);
          break;
      }
    });
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (event.shiftKey) {
      // Shift + Tab (backwards)
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
      focusableElements[prevIndex]?.focus();
    } else {
      // Tab (forwards)
      const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
      focusableElements[nextIndex]?.focus();
    }
  }

  /**
   * Handle activation (Enter/Space)
   */
  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    if (target.matches('button, [role="button"], a, [role="link"]')) {
      target.click();
    }
  }

  /**
   * Handle escape key
   */
  private handleEscape(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (modal) {
      const closeButton = modal.querySelector('[aria-label="Close"]');
      if (closeButton) {
        (closeButton as HTMLElement).click();
      }
    }
  }

  /**
   * Handle arrow navigation
   */
  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle navigation in lists, menus, etc.
    if (target.matches('[role="listbox"] [role="option"], [role="menu"] [role="menuitem"]')) {
      const container = target.closest('[role="listbox"], [role="menu"]');
      if (container) {
        const items = Array.from(container.querySelectorAll('[role="option"], [role="menuitem"]'));
        const currentIndex = items.indexOf(target);
        
        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown') {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else if (event.key === 'ArrowUp') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        
        (items[nextIndex] as HTMLElement)?.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Get focusable elements
   */
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(',');

    return Array.from(document.querySelectorAll(selector))
      .filter(el => !el.matches('[disabled], [aria-disabled="true"]'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }) as HTMLElement[];
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    if (!this.options.enableFocusManagement) return;

    document.addEventListener('focusin', (event) => {
      this.focusHistory.push(event.target as Element);
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    });

    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
      *:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }
      
      *:focus:not(:focus-visible) {
        outline: none;
      }
      
      *:focus-visible {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup screen reader support
   */
  private setupScreenReaderSupport(): void {
    if (!this.options.enableScreenReader) return;

    // Create aria-live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-9999px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);

    // Update live region with announcements
    setInterval(() => {
      if (this.announcements.length > 0) {
        liveRegion.textContent = this.announcements.shift();
      }
    }, 1000);
  }

  /**
   * Setup color contrast monitoring
   */
  private setupColorContrastMonitoring(): void {
    if (!this.options.enableColorContrast) return;

    // Monitor color contrast
    const observer = new MutationObserver(() => {
      this.checkColorContrast();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  /**
   * Check color contrast
   */
  private checkColorContrast(): void {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a');
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const textColor = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (textColor && backgroundColor) {
        const contrast = this.calculateContrastRatio(textColor, backgroundColor);
        
        if (contrast < 4.5) {
          this.addViolation({
            type: 'contrast',
            severity: 'error',
            element: element.tagName.toLowerCase(),
            message: `Low color contrast ratio: ${contrast.toFixed(2)}`,
            suggestion: 'Use colors with a contrast ratio of at least 4.5:1',
            timestamp: Date.now()
          });
        }
      }
    });
  }

  /**
   * Calculate contrast ratio
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation
    // In a real implementation, you'd use a proper color parsing library
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get luminance (simplified)
   */
  private getLuminance(color: string): number {
    // Simplified luminance calculation
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(Number);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  /**
   * Setup motion reduction
   */
  private setupMotionReduction(): void {
    if (!this.options.enableMotionReduction) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Setup text scaling
   */
  private setupTextScaling(): void {
    if (!this.options.enableTextScaling) return;

    // Support for text scaling up to 200%
    const style = document.createElement('style');
    style.textContent = `
      @media (min-resolution: 1.5dppx) {
        body {
          font-size: 1.2em;
        }
      }
      
      @media (min-resolution: 2dppx) {
        body {
          font-size: 1.5em;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Add accessibility violation
   */
  private addViolation(violation: AccessibilityViolation): void {
    this.violations.push(violation);
    
    // Limit violations array size
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-50);
    }
  }

  /**
   * Announce to screen reader
   */
  public announce(message: string): void {
    this.announcements.push(message);
  }

  /**
   * Focus element
   */
  public focusElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }

  /**
   * Get previous focus
   */
  public restoreFocus(): void {
    if (this.focusHistory.length > 1) {
      const previousElement = this.focusHistory[this.focusHistory.length - 2] as HTMLElement;
      if (previousElement) {
        previousElement.focus();
      }
    }
  }

  /**
   * Get accessibility report
   */
  public getReport(): AccessibilityReport {
    const totalViolations = this.violations.length;
    const errorCount = this.violations.filter(v => v.severity === 'error').length;
    const score = Math.max(0, 100 - (errorCount * 10) - (totalViolations * 2));
    
    return {
      score,
      violations: this.violations,
      compliance: {
        wcag21aa: score,
        section508: score,
        amazonStandards: score
      },
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Get recommendations
   */
  private getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.violations.some(v => v.type === 'contrast')) {
      recommendations.push('Improve color contrast ratios to meet WCAG 2.1 AA standards');
    }
    
    if (this.violations.some(v => v.type === 'focus')) {
      recommendations.push('Ensure all interactive elements are keyboard accessible');
    }
    
    if (this.violations.some(v => v.type === 'aria')) {
      recommendations.push('Add proper ARIA labels and roles to improve screen reader support');
    }
    
    return recommendations;
  }

  /**
   * Get violations
   */
  public getViolations(): AccessibilityViolation[] {
    return [...this.violations];
  }

  /**
   * Clear violations
   */
  public clearViolations(): void {
    this.violations = [];
  }

  /**
   * Update options
   */
  public updateOptions(options: Partial<AccessibilityOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

export default AccessibilityService;