/**
 * Advanced Lazy Loading Hook for GetIt Platform
 * Implements intersection observer with performance optimization
 * 
 * @fileoverview Comprehensive lazy loading with Bangladesh network optimization
 * @version 2.0.0
 * @author GetIt Platform Team
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface LazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  fallbackDelay?: number;
  networkAdaptive?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface LazyLoadingState {
  isVisible: boolean;
  hasTriggered: boolean;
  entry?: IntersectionObserverEntry;
  loadTime?: number;
}

/**
 * Advanced lazy loading hook with intersection observer
 */
export const useLazyLoading = (
  options: LazyLoadingOptions = {}
): [React.RefObject<HTMLElement>, LazyLoadingState] => {
  const {
    threshold = 0.1,
    rootMargin = '50px 0px',
    triggerOnce = true,
    fallbackDelay = 2000,
    networkAdaptive = true,
    priority = 'medium'
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartTime = useRef<number>(0);

  const [state, setState] = useState<LazyLoadingState>({
    isVisible: false,
    hasTriggered: false
  });

  /**
   * Get adaptive root margin based on network conditions
   */
  const getAdaptiveRootMargin = useCallback((): string => {
    if (!networkAdaptive || typeof navigator === 'undefined') {
      return rootMargin;
    }

    const connection = (navigator as any).connection;
    if (!connection) return rootMargin;

    // Adjust preload distance based on connection quality
    switch (connection.effectiveType) {
      case '2g':
        return '20px 0px'; // Closer to viewport for slower connections
      case '3g':
        return '35px 0px';
      case '4g':
        return '75px 0px'; // Further from viewport for faster connections
      default:
        return rootMargin;
    }
  }, [rootMargin, networkAdaptive]);

  /**
   * Get adaptive threshold based on priority and network
   */
  const getAdaptiveThreshold = useCallback((): number => {
    if (!networkAdaptive) return threshold;

    // Adjust threshold based on priority and network conditions
    const connection = (navigator as any).connection;
    const isSlowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === '3g';

    if (priority === 'high') {
      return isSlowNetwork ? 0.05 : 0.1; // Load earlier for high priority
    } else if (priority === 'low') {
      return isSlowNetwork ? 0.2 : 0.15; // Load later for low priority
    }

    return threshold; // Medium priority uses default
  }, [threshold, networkAdaptive, priority]);

  /**
   * Handle intersection observer callback
   */
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && !state.hasTriggered) {
      const loadTime = performance.now() - loadStartTime.current;
      
      setState(prevState => ({
        ...prevState,
        isVisible: true,
        hasTriggered: true,
        entry,
        loadTime
      }));

      // Clear fallback timeout
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }

      // Disconnect observer if triggerOnce is true
      if (triggerOnce && observerRef.current) {
        observerRef.current.disconnect();
      }

      console.log(`📊 Lazy load triggered: ${loadTime.toFixed(2)}ms after setup`);
    }
  }, [state.hasTriggered, triggerOnce]);

  /**
   * Setup intersection observer
   */
  useEffect(() => {
    const element = elementRef.current;
    if (!element || state.hasTriggered) return;

    loadStartTime.current = performance.now();

    // Check if intersection observer is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, using fallback');
      
      // Fallback for unsupported browsers
      fallbackTimeoutRef.current = setTimeout(() => {
        setState(prevState => ({
          ...prevState,
          isVisible: true,
          hasTriggered: true,
          loadTime: fallbackDelay
        }));
      }, fallbackDelay);

      return;
    }

    // Create intersection observer
    const adaptiveRootMargin = getAdaptiveRootMargin();
    const adaptiveThreshold = getAdaptiveThreshold();

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: adaptiveThreshold,
      rootMargin: adaptiveRootMargin
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, [handleIntersection, getAdaptiveRootMargin, getAdaptiveThreshold, state.hasTriggered]);

  return [elementRef, state];
};

/**
 * Lazy loading hook for images with preloading
 */
export const useLazyImage = (
  src: string,
  options: LazyLoadingOptions = {}
): [React.RefObject<HTMLImageElement>, LazyLoadingState & { imageSrc?: string; isLoaded: boolean; hasError: boolean }] => {
  const [elementRef, lazyState] = useLazyLoading(options);
  const [imageState, setImageState] = useState({
    isLoaded: false,
    hasError: false,
    imageSrc: undefined as string | undefined
  });

  /**
   * Preload image when element becomes visible
   */
  useEffect(() => {
    if (!lazyState.isVisible || imageState.isLoaded || imageState.hasError) return;

    const img = new Image();
    
    img.onload = () => {
      setImageState({
        isLoaded: true,
        hasError: false,
        imageSrc: src
      });
    };

    img.onerror = () => {
      setImageState({
        isLoaded: false,
        hasError: true,
        imageSrc: undefined
      });
    };

    img.src = src;

  }, [lazyState.isVisible, src, imageState.isLoaded, imageState.hasError]);

  return [elementRef as React.RefObject<HTMLImageElement>, { ...lazyState, ...imageState }];
};

/**
 * Lazy loading hook for components with dynamic import
 */
export const useLazyComponent = <T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options: LazyLoadingOptions = {}
): [React.RefObject<HTMLElement>, LazyLoadingState & { Component?: React.ComponentType<T>; isLoading: boolean; hasError: boolean }] => {
  const [elementRef, lazyState] = useLazyLoading(options);
  const [componentState, setComponentState] = useState({
    Component: undefined as React.ComponentType<T> | undefined,
    isLoading: false,
    hasError: false
  });

  /**
   * Load component when element becomes visible
   */
  useEffect(() => {
    if (!lazyState.isVisible || componentState.Component || componentState.isLoading) return;

    setComponentState(prev => ({ ...prev, isLoading: true }));

    importFn()
      .then(module => {
        setComponentState({
          Component: module.default,
          isLoading: false,
          hasError: false
        });
      })
      .catch(error => {
        console.error('Failed to load lazy component:', error);
        setComponentState({
          Component: undefined,
          isLoading: false,
          hasError: true
        });
      });

  }, [lazyState.isVisible, importFn, componentState.Component, componentState.isLoading]);

  return [elementRef, { ...lazyState, ...componentState }];
};

/**
 * Batch lazy loading hook for multiple elements
 */
export const useBatchLazyLoading = (
  count: number,
  options: LazyLoadingOptions = {}
): Array<[React.RefObject<HTMLElement>, LazyLoadingState]> => {
  const refs = useRef<Array<[React.RefObject<HTMLElement>, LazyLoadingState]>>([]);

  // Initialize refs array if not already done
  if (refs.current.length !== count) {
    refs.current = Array.from({ length: count }, () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useLazyLoading(options);
    });
  }

  return refs.current;
};

/**
 * Network-adaptive lazy loading hook
 */
export const useNetworkAdaptiveLazyLoading = (
  options: LazyLoadingOptions = {}
): [React.RefObject<HTMLElement>, LazyLoadingState & { networkType: string; dataMode: 'normal' | 'saver' }] => {
  const [elementRef, lazyState] = useLazyLoading({
    ...options,
    networkAdaptive: true
  });

  const [networkInfo, setNetworkInfo] = useState({
    networkType: 'unknown',
    dataMode: 'normal' as 'normal' | 'saver'
  });

  /**
   * Monitor network changes
   */
  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        setNetworkInfo({
          networkType: connection.effectiveType || 'unknown',
          dataMode: connection.saveData ? 'saver' : 'normal'
        });
      }
    };

    updateNetworkInfo();

    // Listen for network changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  return [elementRef, { ...lazyState, ...networkInfo }];
};

export default useLazyLoading;