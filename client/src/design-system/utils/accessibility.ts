/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliance utilities and helpers
 */

// ARIA attributes helpers
export const ariaAttributes = {
  // Common ARIA attributes
  label: (label: string) => ({ 'aria-label': label }),
  labelledby: (id: string) => ({ 'aria-labelledby': id }),
  describedby: (id: string) => ({ 'aria-describedby': id }),
  expanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
  selected: (selected: boolean) => ({ 'aria-selected': selected }),
  checked: (checked: boolean) => ({ 'aria-checked': checked }),
  disabled: (disabled: boolean) => ({ 'aria-disabled': disabled }),
  hidden: (hidden: boolean) => ({ 'aria-hidden': hidden }),
  live: (live: 'polite' | 'assertive' | 'off') => ({ 'aria-live': live }),
  role: (role: string) => ({ role }),
  
  // Form-specific ARIA attributes
  invalid: (invalid: boolean) => ({ 'aria-invalid': invalid }),
  required: (required: boolean) => ({ 'aria-required': required }),
  readonly: (readonly: boolean) => ({ 'aria-readonly': readonly }),
  
  // Interactive element attributes
  pressed: (pressed: boolean) => ({ 'aria-pressed': pressed }),
  current: (current: string) => ({ 'aria-current': current }),
  
  // Navigation attributes
  controls: (id: string) => ({ 'aria-controls': id }),
  owns: (id: string) => ({ 'aria-owns': id }),
  
  // Composite attributes
  hasPopup: (hasPopup: boolean | string) => ({ 'aria-haspopup': hasPopup }),
  orientation: (orientation: 'horizontal' | 'vertical') => ({ 'aria-orientation': orientation }),
  
  // Level and position attributes
  level: (level: number) => ({ 'aria-level': level }),
  posinset: (pos: number) => ({ 'aria-posinset': pos }),
  setsize: (size: number) => ({ 'aria-setsize': size })
};

// Screen reader utilities
export const screenReader = {
  // Screen reader only text
  srOnly: 'sr-only',
  
  // Screen reader only text that becomes visible on focus
  srOnlyFocusable: 'sr-only focus:not-sr-only',
  
  // Helper for screen reader announcements
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
};

// Focus management utilities
export const focusManagement = {
  // Focus trap for modals and dialogs
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
      
      if (e.key === 'Escape') {
        // Close modal/dialog
        element.dispatchEvent(new CustomEvent('close'));
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  },
  
  // Focus management for skip links
  skipTo: (targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  },
  
  // Focus visible utilities
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Arrow key navigation for lists and menus
  arrowKeyNavigation: (container: HTMLElement) => {
    const items = container.querySelectorAll('[role="menuitem"], [role="option"], [tabindex="0"]');
    let currentIndex = 0;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          currentIndex = (currentIndex + 1) % items.length;
          (items[currentIndex] as HTMLElement).focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          currentIndex = (currentIndex - 1 + items.length) % items.length;
          (items[currentIndex] as HTMLElement).focus();
          break;
        case 'Home':
          e.preventDefault();
          currentIndex = 0;
          (items[currentIndex] as HTMLElement).focus();
          break;
        case 'End':
          e.preventDefault();
          currentIndex = items.length - 1;
          (items[currentIndex] as HTMLElement).focus();
          break;
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
  
  // Common keyboard shortcuts
  shortcuts: {
    escape: 'Escape',
    enter: 'Enter',
    space: ' ',
    tab: 'Tab',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight',
    home: 'Home',
    end: 'End',
    pageUp: 'PageUp',
    pageDown: 'PageDown'
  }
};

// Color contrast utilities
export const colorContrast = {
  // WCAG AA contrast ratios
  normalText: 4.5,
  largeText: 3,
  
  // Check contrast ratio (simplified)
  checkContrast: (foreground: string, background: string) => {
    // This is a simplified implementation
    // In production, use a proper color contrast library
    console.warn('Use a proper color contrast library for production');
    return true;
  }
};

// Cultural accessibility for Bangladesh
export const culturalAccessibility = {
  // Bengali language support
  bengali: {
    direction: 'ltr',
    fontFamily: 'Kalpurush, Akaash, "Bangla MN", "Noto Sans Bengali", sans-serif',
    fontSize: '1.1em' // Slightly larger for better readability
  },
  
  // Islamic considerations
  islamic: {
    colors: {
      respectful: ['#50c878', '#ffd700', '#000080'], // Emerald, Gold, Navy
      avoid: ['#ff0000'] // Pure red in some contexts
    },
    calendar: 'hijri',
    prayerTimes: true
  },
  
  // Bangladesh-specific considerations
  bangladesh: {
    colors: {
      national: ['#006a4e', '#f42a41', '#ffb300'], // Green, Red, Golden
      cultural: ['#50c878', '#ffd700']
    },
    mobileFirst: true, // Most users on mobile
    dataConservation: true, // Limited data plans
    offlineSupport: true // Intermittent connectivity
  }
};

// Accessibility utilities export
export const accessibilityUtils = {
  ariaAttributes,
  screenReader,
  focusManagement,
  keyboardNavigation,
  colorContrast,
  culturalAccessibility
};

export default accessibilityUtils;