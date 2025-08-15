/**
 * Mobile Services Index
 * Phase 2 Week 5-6: Mobile Optimization
 * Amazon.com/Shopee.sg Enterprise Standards
 */

export { default as MobileFirstDesignService } from './MobileFirstDesignService';
export { default as TouchOptimizationService } from './TouchOptimizationService';

// Mobile service exports
export const mobileServices = {
  MobileFirstDesignService,
  TouchOptimizationService
};

// Mobile utilities
export const mobileUtils = {
  // Mobile detection
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Touch support detection
  isTouchSupported: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Device capabilities
  getDeviceCapabilities: () => {
    const mobileService = (MobileFirstDesignService as any).getInstance();
    return mobileService.getDeviceCapabilities();
  },

  // Touch target validation
  validateTouchTargets: () => {
    const mobileService = (MobileFirstDesignService as any).getInstance();
    return mobileService.validateTouchTargets();
  },

  // Touch optimization
  optimizeTouchTargets: () => {
    const touchService = (TouchOptimizationService as any).getInstance();
    return touchService.optimizeTouchTargets();
  }
};

// Mobile configuration
export const mobileConfig = {
  breakpoints: {
    mobile: { minWidth: 0, maxWidth: 767 },
    tablet: { minWidth: 768, maxWidth: 1023 },
    desktop: { minWidth: 1024, maxWidth: 1279 },
    largeDesktop: { minWidth: 1280 }
  },
  
  touchTargets: {
    minimumSize: 44, // 44px minimum touch target size
    recommendedSize: 48, // 48px recommended for mobile
    spacing: 8 // 8px minimum spacing between targets
  },
  
  gestures: {
    tapThreshold: 300, // ms
    swipeThreshold: 50, // pixels
    longPressDelay: 500, // ms
    doubleTapDelay: 300 // ms
  }
};

// Mobile optimization initialization
export const initializeMobileOptimization = () => {
  const mobileService = (MobileFirstDesignService as any).getInstance();
  const touchService = (TouchOptimizationService as any).getInstance();
  
  // Apply mobile optimizations
  mobileService.applyMobileOptimizations();
  touchService.optimizeTouchTargets();
  
  console.log('Mobile optimization initialized');
  
  return {
    mobileService,
    touchService,
    getBreakpoints: () => mobileService.getBreakpoints(),
    getCurrentBreakpoint: () => mobileService.getCurrentBreakpoint(),
    getDeviceCapabilities: () => mobileService.getDeviceCapabilities(),
    getTouchMetrics: () => touchService.getMetrics(),
    getTouchCompliance: () => mobileService.getTouchTargetCompliance()
  };
};