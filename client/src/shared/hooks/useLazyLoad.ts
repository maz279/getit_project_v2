// Advanced lazy loading hook for Phase 3 Performance Optimization
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    rootMargin = '50px',
    threshold = 0.1,
    once = true
  } = options;

  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && !hasLoaded) {
          setHasLoaded(true);
          if (once) {
            cleanup();
          }
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observerRef.current.observe(element);

    return cleanup;
  }, [rootMargin, threshold, once, hasLoaded, cleanup]);

  return {
    elementRef,
    isIntersecting,
    hasLoaded: once ? hasLoaded : isIntersecting
  };
};

// Performance monitoring hook
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    componentMountTime: 0,
    lastUpdate: Date.now()
  });

  const startTime = useRef<number>(0);

  const startMeasure = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endMeasure = useCallback((operation: 'render' | 'mount') => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;

    setMetrics(prev => ({
      ...prev,
      [operation === 'render' ? 'renderTime' : 'componentMountTime']: duration,
      lastUpdate: Date.now()
    }));

    return duration;
  }, []);

  return {
    metrics,
    startMeasure,
    endMeasure
  };
};