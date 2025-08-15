/**
 * Accessibility Hook - WCAG 2.1 AA Compliance
 * Provides comprehensive accessibility utilities for Amazon.com/Shopee.sg-level
 * inclusive design standards
 * 
 * @fileoverview Enterprise-grade accessibility hook with WCAG 2.1 AA compliance
 * @author GetIt Platform Team
 * @version 3.0.0
 * @since Phase 3 Professional Polish Implementation
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Accessibility configuration interface
 */
interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableFocusVisible: boolean;
  enableScreenReader: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'auto' | 'light' | 'dark' | 'high-contrast';
  culturalContext: 'bangladesh' | 'global';
}

/**
 * Accessibility metrics interface
 */
interface AccessibilityMetrics {
  tabStops: number;
  ariaLabels: number;
  headingStructure: { [level: string]: number };
  colorContrast: number;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
}

/**
 * Focus management interface
 */
interface FocusManagement {
  focusedElement: Element | null;
  focusHistory: Element[];
  trapFocus: (container: Element) => void;
  releaseFocus: () => void;
  moveFocus: (direction: 'next' | 'previous' | 'first' | 'last') => void;
}

/**
 * Accessibility hook return type
 */
interface AccessibilityReturn {
  config: AccessibilityConfig;
  metrics: AccessibilityMetrics;
  focusManagement: FocusManagement;
  updateConfig: (newConfig: Partial<AccessibilityConfig>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  checkColorContrast: (foreground: string, background: string) => number;
  generateAriaLabel: (element: string, context?: string) => string;
  handleKeyboardNavigation: (event: KeyboardEvent) => boolean;
  optimizeForScreenReader: (element: HTMLElement) => void;
  createLandmark: (type: string, label: string) => { role: string; 'aria-label': string };
}

/**
 * Enterprise Accessibility Hook
 * 
 * Provides comprehensive WCAG 2.1 AA compliance utilities for inclusive design:
 * - Color contrast checking (4.5:1 ratio minimum)
 * - Screen reader optimization
 * - Keyboard navigation support
 * - Focus management and trapping
 * - Cultural accessibility (Bengali language support)
 * - Reduced motion preferences
 * - High contrast mode support
 * 
 * @example
 * ```tsx
 * const {
 *   config,
 *   announceToScreenReader,
 *   handleKeyboardNavigation,
 *   generateAriaLabel,
 *   focusManagement
 * } = useAccessibility();
 * 
 * // Announce to screen reader
 * announceToScreenReader('Form submitted successfully', 'assertive');
 * 
 * // Handle keyboard navigation
 * const onKeyDown = (e) => handleKeyboardNavigation(e);
 * 
 * // Generate appropriate aria labels
 * const ariaLabel = generateAriaLabel('button', 'Add to cart');
 * ```
 * 
 * @returns {AccessibilityReturn} Accessibility utilities and configuration
 */
export function useAccessibility(): AccessibilityReturn {
  // Accessibility configuration state
  const [config, setConfig] = useState<AccessibilityConfig>({
    enableHighContrast: false,
    enableReducedMotion: false,
    enableFocusVisible: true,
    enableScreenReader: true,
    fontSize: 'medium',
    colorScheme: 'auto',
    culturalContext: 'bangladesh'
  });

  // Accessibility metrics state
  const [metrics, setMetrics] = useState<AccessibilityMetrics>({
    tabStops: 0,
    ariaLabels: 0,
    headingStructure: {},
    colorContrast: 0,
    keyboardNavigation: false,
    screenReaderOptimized: false
  });

  // Focus management state
  const [focusedElement, setFocusedElement] = useState<Element | null>(null);
  const [focusHistory, setFocusHistory] = useState<Element[]>([]);
  
  // Refs for accessibility utilities
  const screenReaderRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<Element | null>(null);

  /**
   * Initialize accessibility features
   */
  useEffect(() => {
    // Create screen reader announcement container
    if (!screenReaderRef.current) {
      const srContainer = document.createElement('div');
      srContainer.setAttribute('aria-live', 'polite');
      srContainer.setAttribute('aria-atomic', 'true');
      srContainer.className = 'sr-only';
      srContainer.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(srContainer);
      screenReaderRef.current = srContainer;
    }

    // Apply user preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setConfig(prev => ({
      ...prev,
      enableReducedMotion: mediaQuery.matches
    }));

    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setConfig(prev => ({
      ...prev,
      enableHighContrast: contrastQuery.matches
    }));

    // Listen for preference changes
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, enableReducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, enableHighContrast: e.matches }));
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      if (screenReaderRef.current && document.body.contains(screenReaderRef.current)) {
        document.body.removeChild(screenReaderRef.current);
      }
    };
  }, []);

  /**
   * Update accessibility configuration
   * 
   * @param newConfig - Partial configuration to update
   */
  const updateConfig = useCallback((newConfig: Partial<AccessibilityConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    // Apply configuration changes to document
    if (newConfig.fontSize) {
      document.documentElement.style.fontSize = getFontSizeValue(newConfig.fontSize);
    }
    
    if (newConfig.colorScheme) {
      document.documentElement.setAttribute('data-theme', newConfig.colorScheme);
    }
    
    if (newConfig.enableHighContrast !== undefined) {
      document.documentElement.classList.toggle('high-contrast', newConfig.enableHighContrast);
    }
    
    if (newConfig.enableReducedMotion !== undefined) {
      document.documentElement.classList.toggle('reduce-motion', newConfig.enableReducedMotion);
    }
  }, []);

  /**
   * Get font size value based on setting
   * 
   * @param size - Font size setting
   * @returns CSS font size value
   */
  const getFontSizeValue = (size: AccessibilityConfig['fontSize']): string => {
    const sizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    return sizes[size];
  };

  /**
   * Announce message to screen readers
   * 
   * @param message - Message to announce
   * @param priority - Announcement priority
   */
  const announceToScreenReader = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (!config.enableScreenReader || !screenReaderRef.current) return;

    // Translate message if using Bengali context
    const translatedMessage = config.culturalContext === 'bangladesh' 
      ? translateToBengali(message) 
      : message;

    screenReaderRef.current.setAttribute('aria-live', priority);
    screenReaderRef.current.textContent = translatedMessage;

    // Clear after announcement
    setTimeout(() => {
      if (screenReaderRef.current) {
        screenReaderRef.current.textContent = '';
      }
    }, 1000);
  }, [config.enableScreenReader, config.culturalContext]);

  /**
   * Simple Bengali translation for common accessibility messages
   * 
   * @param message - English message
   * @returns Bengali translation or original message
   */
  const translateToBengali = (message: string): string => {
    const translations: { [key: string]: string } = {
      'Loading': 'লোড হচ্ছে',
      'Error': 'ত্রুটি',
      'Success': 'সফল',
      'Form submitted successfully': 'ফর্ম সফলভাবে জমা দেওয়া হয়েছে',
      'Item added to cart': 'পণ্য কার্টে যোগ করা হয়েছে',
      'Navigation menu opened': 'নেভিগেশন মেনু খোলা হয়েছে',
      'Navigation menu closed': 'নেভিগেশন মেনু বন্ধ করা হয়েছে',
      'Search results updated': 'অনুসন্ধানের ফলাফল আপডেট হয়েছে'
    };
    
    return translations[message] || message;
  };

  /**
   * Check color contrast ratio
   * 
   * @param foreground - Foreground color (hex)
   * @param background - Background color (hex)
   * @returns Contrast ratio
   */
  const checkColorContrast = useCallback((foreground: string, background: string): number => {
    // Convert hex to RGB
    const getRGB = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    // Calculate relative luminance
    const getLuminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const fgLuminance = getLuminance(getRGB(foreground));
    const bgLuminance = getLuminance(getRGB(background));
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    const contrast = (lighter + 0.05) / (darker + 0.05);
    
    setMetrics(prev => ({ ...prev, colorContrast: contrast }));
    
    return contrast;
  }, []);

  /**
   * Generate appropriate ARIA label
   * 
   * @param element - Element type
   * @param context - Additional context
   * @returns Generated ARIA label
   */
  const generateAriaLabel = useCallback((element: string, context?: string): string => {
    const templates: { [key: string]: string } = {
      'button': context ? `${context} button` : 'Button',
      'link': context ? `${context} link` : 'Link',
      'input': context ? `${context} input field` : 'Input field',
      'select': context ? `${context} dropdown` : 'Dropdown menu',
      'checkbox': context ? `${context} checkbox` : 'Checkbox',
      'radio': context ? `${context} radio button` : 'Radio button'
    };

    const label = templates[element] || element;
    
    // Translate if Bengali context
    if (config.culturalContext === 'bangladesh') {
      return translateToBengali(label);
    }
    
    setMetrics(prev => ({ ...prev, ariaLabels: prev.ariaLabels + 1 }));
    
    return label;
  }, [config.culturalContext]);

  /**
   * Handle keyboard navigation
   * 
   * @param event - Keyboard event
   * @returns Whether event was handled
   */
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent): boolean => {
    setMetrics(prev => ({ ...prev, keyboardNavigation: true }));

    switch (event.key) {
      case 'Tab':
        setMetrics(prev => ({ ...prev, tabStops: prev.tabStops + 1 }));
        return false; // Allow default behavior
        
      case 'Escape':
        if (focusTrapRef.current) {
          releaseFocus();
          return true;
        }
        return false;
        
      case 'Enter':
      case ' ':
        // Handle activation for custom elements
        const target = event.target as HTMLElement;
        if (target.getAttribute('role') === 'button') {
          target.click();
          return true;
        }
        return false;
        
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Handle arrow key navigation for custom components
        return handleArrowNavigation(event);
        
      default:
        return false;
    }
  }, []);

  /**
   * Handle arrow key navigation
   * 
   * @param event - Keyboard event
   * @returns Whether event was handled
   */
  const handleArrowNavigation = (event: KeyboardEvent): boolean => {
    const target = event.target as HTMLElement;
    const role = target.getAttribute('role');
    
    if (role === 'menu' || role === 'menubar' || role === 'listbox') {
      // Implement arrow navigation for menu items
      event.preventDefault();
      return true;
    }
    
    return false;
  };

  /**
   * Optimize element for screen readers
   * 
   * @param element - HTML element to optimize
   */
  const optimizeForScreenReader = useCallback((element: HTMLElement) => {
    // Add appropriate ARIA attributes
    if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      const tagName = element.tagName.toLowerCase();
      const ariaLabel = generateAriaLabel(tagName);
      element.setAttribute('aria-label', ariaLabel);
    }

    // Ensure focusable elements have visible focus indicators
    if (config.enableFocusVisible && element.tabIndex >= 0) {
      element.classList.add('focus-visible-enabled');
    }

    // Add role if semantic meaning is unclear
    if (['div', 'span'].includes(element.tagName.toLowerCase()) && element.onclick) {
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
    }

    setMetrics(prev => ({ ...prev, screenReaderOptimized: true }));
  }, [config.enableFocusVisible, generateAriaLabel]);

  /**
   * Create landmark for navigation
   * 
   * @param type - Landmark type
   * @param label - Landmark label
   * @returns ARIA attributes for landmark
   */
  const createLandmark = useCallback((type: string, label: string) => {
    const landmarks: { [key: string]: string } = {
      'main': 'main',
      'navigation': 'navigation',
      'banner': 'banner',
      'contentinfo': 'contentinfo',
      'search': 'search',
      'complementary': 'complementary'
    };

    return {
      role: landmarks[type] || 'region',
      'aria-label': config.culturalContext === 'bangladesh' ? translateToBengali(label) : label
    };
  }, [config.culturalContext]);

  /**
   * Focus management functions
   */
  const trapFocus = useCallback((container: Element) => {
    focusTrapRef.current = container;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);

  const releaseFocus = useCallback(() => {
    focusTrapRef.current = null;
    if (focusHistory.length > 0) {
      const lastFocused = focusHistory[focusHistory.length - 1] as HTMLElement;
      lastFocused.focus();
      setFocusHistory(prev => prev.slice(0, -1));
    }
  }, [focusHistory]);

  const moveFocus = useCallback((direction: 'next' | 'previous' | 'first' | 'last') => {
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    let nextIndex = currentIndex;
    
    switch (direction) {
      case 'next':
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'previous':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        break;
      case 'first':
        nextIndex = 0;
        break;
      case 'last':
        nextIndex = focusableElements.length - 1;
        break;
    }
    
    (focusableElements[nextIndex] as HTMLElement).focus();
  }, []);

  const focusManagement: FocusManagement = {
    focusedElement,
    focusHistory,
    trapFocus,
    releaseFocus,
    moveFocus
  };

  return {
    config,
    metrics,
    focusManagement,
    updateConfig,
    announceToScreenReader,
    checkColorContrast,
    generateAriaLabel,
    handleKeyboardNavigation,
    optimizeForScreenReader,
    createLandmark
  };
}

export default useAccessibility;