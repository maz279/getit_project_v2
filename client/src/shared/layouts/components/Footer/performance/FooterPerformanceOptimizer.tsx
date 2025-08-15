import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';

// Lazy-loaded footer components for performance optimization
const LazyFooterMainSection = lazy(() => import('../footer/FooterMainSection').then(module => ({ default: module.FooterMainSection })));
const LazyFooterSecondarySection = lazy(() => import('../footer/FooterSecondarySection').then(module => ({ default: module.FooterSecondarySection })));
const LazyFooterLegalSection = lazy(() => import('../footer/FooterLegalSection').then(module => ({ default: module.FooterLegalSection })));
const LazyFooterTechnologySection = lazy(() => import('../footer/FooterTechnologySection').then(module => ({ default: module.FooterTechnologySection })));
const LazyFooterConnectSection = lazy(() => import('../footer/FooterConnectSection').then(module => ({ default: module.FooterConnectSection })));
const LazyFooterCopyright = lazy(() => import('../footer/FooterCopyright').then(module => ({ default: module.FooterCopyright })));

interface FooterPerformanceOptimizerProps {
  enableLazyLoading?: boolean;
  enableAnimations?: boolean;
  enableProgressiveLoading?: boolean;
}

// Performance optimization skeleton
const FooterSkeleton: React.FC = () => (
  <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, linkIndex) => (
                  <div key={linkIndex} className="h-3 bg-gray-700 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-6">
          <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
);

// Intersection Observer hook for progressive loading
const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

// Performance metrics tracker
const useFooterPerformance = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderCount: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    const updateMetrics = () => {
      const loadTime = performance.now() - startTime;
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      setMetrics(prev => ({
        ...prev,
        loadTime,
        memoryUsage,
        renderCount: prev.renderCount + 1
      }));
    };

    updateMetrics();
  }, []);

  return metrics;
};

export const FooterPerformanceOptimizer: React.FC<FooterPerformanceOptimizerProps> = ({
  enableLazyLoading = true,
  enableAnimations = true,
  enableProgressiveLoading = true
}) => {
  const footerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(footerRef);
  const metrics = useFooterPerformance();
  
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  // Progressive loading logic
  useEffect(() => {
    if (!enableProgressiveLoading || !isVisible) return;

    const timers = [
      setTimeout(() => setLoadedSections(prev => new Set([...prev, 'main'])), 0),
      setTimeout(() => setLoadedSections(prev => new Set([...prev, 'secondary'])), 100),
      setTimeout(() => setLoadedSections(prev => new Set([...prev, 'legal'])), 200),
      setTimeout(() => setLoadedSections(prev => new Set([...prev, 'technology'])), 300),
      setTimeout(() => setLoadedSections(prev => new Set([...prev, 'connect'])), 400),
      setTimeout(() => setLoadedSections(prev => new Set([...prev, 'copyright'])), 500)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [isVisible, enableProgressiveLoading]);

  // Animation classes
  const getAnimationClass = (sectionName: string, index: number) => {
    if (!enableAnimations) return '';
    if (!loadedSections.has(sectionName)) return 'opacity-0 translate-y-4';
    return `opacity-100 translate-y-0 transition-all duration-500 ease-out ${
      enableProgressiveLoading ? `delay-${index * 100}` : ''
    }`;
  };

  // Render optimized footer sections
  const renderFooterSection = (sectionName: string, Component: React.LazyExoticComponent<React.ComponentType<any>>, index: number) => {
    if (enableProgressiveLoading && !loadedSections.has(sectionName)) {
      return null;
    }

    if (enableLazyLoading) {
      return (
        <Suspense key={sectionName} fallback={<div className="h-32 bg-gray-800 animate-pulse rounded"></div>}>
          <div className={getAnimationClass(sectionName, index)}>
            <Component />
          </div>
        </Suspense>
      );
    }

    return (
      <div key={sectionName} className={getAnimationClass(sectionName, index)}>
        <Component />
      </div>
    );
  };

  // Performance monitoring in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Footer Performance Metrics:', {
      ...metrics,
      sectionsLoaded: loadedSections.size,
      lazyLoadingEnabled: enableLazyLoading,
      animationsEnabled: enableAnimations
    });
  }

  return (
    <div ref={footerRef} className="footer-performance-optimized">
      {isVisible || !enableProgressiveLoading ? (
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main footer content with performance optimizations */}
            {renderFooterSection('main', LazyFooterMainSection, 0)}
            {renderFooterSection('secondary', LazyFooterSecondarySection, 1)}
            {renderFooterSection('legal', LazyFooterLegalSection, 2)}
            {renderFooterSection('technology', LazyFooterTechnologySection, 3)}
            {renderFooterSection('connect', LazyFooterConnectSection, 4)}
            {renderFooterSection('copyright', LazyFooterCopyright, 5)}
          </div>
        </div>
      ) : (
        <FooterSkeleton />
      )}
    </div>
  );
};

export default FooterPerformanceOptimizer;