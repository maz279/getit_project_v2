/**
 * useA11y Hook
 * Amazon.com/Shopee.sg-Level Accessibility Hook
 * React hook for accessibility features and WCAG 2.1 AA compliance
 */

import { useState, useEffect, useCallback } from 'react';
import AccessibilityService from '../services/core/AccessibilityService';

interface UseA11yReturn {
  announce: (message: string) => void;
  focusElement: (selector: string) => void;
  restoreFocus: () => void;
  report: {
    score: number;
    violations: any[];
    compliance: {
      wcag21aa: number;
      section508: number;
      amazonStandards: number;
    };
    recommendations: string[];
  };
  violations: any[];
  clearViolations: () => void;
  updateOptions: (options: any) => void;
  isReducedMotion: boolean;
  prefersHighContrast: boolean;
}

export const useA11y = (): UseA11yReturn => {
  const accessibilityService = AccessibilityService.getInstance();
  const [report, setReport] = useState(accessibilityService.getReport());
  const [violations, setViolations] = useState(accessibilityService.getViolations());
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(reducedMotionQuery.matches);

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(highContrastQuery.matches);

    const handleHighContrastChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Update report and violations periodically
    const interval = setInterval(() => {
      setReport(accessibilityService.getReport());
      setViolations(accessibilityService.getViolations());
    }, 5000);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      clearInterval(interval);
    };
  }, []);

  const announce = useCallback((message: string) => {
    accessibilityService.announce(message);
  }, []);

  const focusElement = useCallback((selector: string) => {
    accessibilityService.focusElement(selector);
  }, []);

  const restoreFocus = useCallback(() => {
    accessibilityService.restoreFocus();
  }, []);

  const clearViolations = useCallback(() => {
    accessibilityService.clearViolations();
    setViolations([]);
  }, []);

  const updateOptions = useCallback((options: any) => {
    accessibilityService.updateOptions(options);
    setReport(accessibilityService.getReport());
  }, []);

  return {
    announce,
    focusElement,
    restoreFocus,
    report,
    violations,
    clearViolations,
    updateOptions,
    isReducedMotion,
    prefersHighContrast
  };
};

export default useA11y;