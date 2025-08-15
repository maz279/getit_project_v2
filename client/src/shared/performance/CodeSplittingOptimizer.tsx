/**
 * Phase 2: Performance Optimization
 * Code Splitting for Search Functionality
 * Investment: $8,000 | Week 3-4
 */

import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Performance monitoring for code splitting
interface LoadingPerformance {
  componentName: string;
  loadTime: number;
  cacheHit: boolean;
  bundleSize?: number;
  timestamp: number;
}

interface ChunkInfo {
  name: string;
  size: number;
  loadTime: number;
  error?: string;
}

/**
 * Enhanced lazy loading with performance tracking
 */
export function createOptimizedLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  preloadStrategy: 'idle' | 'hover' | 'viewport' | 'manual' = 'idle'
): LazyExoticComponent<T> {
  const startTime = performance.now();
  let isPreloaded = false;

  // Wrap import function with performance tracking
  const trackedImportFn = async () => {
    const loadStartTime = performance.now();
    
    try {
      const module = await importFn();
      const loadTime = performance.now() - loadStartTime;
      
      // Track loading performance
      const performanceData: LoadingPerformance = {
        componentName,
        loadTime,
        cacheHit: isPreloaded,
        timestamp: Date.now()
      };
      
      // Send to analytics
      trackChunkLoad(performanceData);
      
      return module;
    } catch (error) {
      // Track loading failures
      trackChunkError(componentName, error as Error);
      throw error;
    }
  };

  const LazyComponent = lazy(trackedImportFn);

  // Implement preloading strategies
  const preload = () => {
    if (!isPreloaded) {
      isPreloaded = true;
      trackedImportFn().catch(() => {
        // Silently fail preload attempts
      });
    }
  };

  // Add preload method to the component
  (LazyComponent as any).preload = preload;

  // Auto-preload based on strategy
  switch (preloadStrategy) {
    case 'idle':
      if ('requestIdleCallback' in window) {
        requestIdleCallback(preload);
      } else {
        setTimeout(preload, 100);
      }
      break;
    case 'hover':
      // Will be handled by hover listeners
      break;
    case 'viewport':
      // Will be handled by intersection observers
      break;
    case 'manual':
      // No auto-preloading
      break;
  }

  return LazyComponent;
}

/**
 * Search-specific lazy components with optimized loading
 * Updated to use existing components and create placeholders for missing ones
 */
export const LazySearchComponents = {
  // Core search functionality - Using existing AISearchBar
  AISearchBar: createOptimizedLazyComponent(
    () => import('@/features/search/components/AISearchBar'),
    'AISearchBar',
    'hover'
  ),
  
  // Placeholder components for future implementation
  SearchResultsGrid: createOptimizedLazyComponent(
    () => Promise.resolve({ default: () => <div>Search Results Loading...</div> }),
    'SearchResultsGrid',
    'idle'
  ),
  
  SearchFilters: createOptimizedLazyComponent(
    () => Promise.resolve({ default: () => <div>Search Filters Loading...</div> }),
    'SearchFilters',
    'hover'
  ),

  // AI-powered features - Using minimal components
  AISearchSuggestions: createOptimizedLazyComponent(
    () => Promise.resolve({ default: () => <div>AI Suggestions Loading...</div> }),
    'AISearchSuggestions',
    'idle'
  ),

  VoiceSearchInterface: createOptimizedLazyComponent(
    () => Promise.resolve({ default: () => <div>Voice Search Loading...</div> }),
    'VoiceSearchInterface',
    'manual'
  ),

  VisualSearchUploader: createOptimizedLazyComponent(
    () => Promise.resolve({ default: () => <div>Visual Search Loading...</div> }),
    'VisualSearchUploader',
    'manual'
  ),

  // Analytics and monitoring
  SearchAnalyticsDashboard: createOptimizedLazyComponent(
    () => Promise.resolve({ default: () => <div>Analytics Loading...</div> }),
    'SearchAnalyticsDashboard',
    'manual'
  )
};

/**
 * Optimized loading wrapper with error boundaries and performance tracking
 */
interface OptimizedLoadingWrapperProps {
  children: React.ReactNode;
  componentName: string;
  fallback?: React.ReactNode;
  minLoadingTime?: number;
}

export const OptimizedLoadingWrapper: React.FC<OptimizedLoadingWrapperProps> = ({
  children,
  componentName,
  fallback,
  minLoadingTime = 200
}) => {
  const [showMinLoader, setShowMinLoader] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowMinLoader(false);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime]);

  const LoadingFallback = fallback || (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading {componentName}...</span>
    </div>
  );

  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <h3 className="text-red-800 font-medium">Failed to load {componentName}</h3>
      <p className="text-red-600 text-sm mt-1">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={(error) => trackComponentError(componentName, error)}>
      <Suspense fallback={showMinLoader ? LoadingFallback : null}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Progressive loading container for search features
 */
interface ProgressiveSearchLoaderProps {
  priority: 'critical' | 'high' | 'normal' | 'low';
  children: React.ReactNode;
  onLoad?: () => void;
}

export const ProgressiveSearchLoader: React.FC<ProgressiveSearchLoaderProps> = ({
  priority,
  children,
  onLoad
}) => {
  const [shouldLoad, setShouldLoad] = React.useState(priority === 'critical');
  
  React.useEffect(() => {
    if (shouldLoad) return;

    const delay = {
      critical: 0,
      high: 100,
      normal: 500,
      low: 2000
    }[priority];

    const timer = setTimeout(() => {
      setShouldLoad(true);
      onLoad?.();
    }, delay);

    return () => clearTimeout(timer);
  }, [priority, shouldLoad, onLoad]);

  if (!shouldLoad) {
    return (
      <div className="flex items-center justify-center p-4 opacity-50">
        <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Bundle analyzer for tracking chunk sizes and performance
 */
class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private chunkData = new Map<string, ChunkInfo>();
  private performanceData: LoadingPerformance[] = [];

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  trackChunkLoad(data: LoadingPerformance): void {
    this.performanceData.push(data);
    
    // Keep only last 100 entries
    if (this.performanceData.length > 100) {
      this.performanceData = this.performanceData.slice(-100);
    }

    // Update chunk info
    this.chunkData.set(data.componentName, {
      name: data.componentName,
      size: data.bundleSize || 0,
      loadTime: data.loadTime
    });
  }

  trackChunkError(componentName: string, error: Error): void {
    const existingChunk = this.chunkData.get(componentName);
    this.chunkData.set(componentName, {
      ...existingChunk,
      name: componentName,
      size: existingChunk?.size || 0,
      loadTime: existingChunk?.loadTime || 0,
      error: error.message
    });
  }

  getPerformanceReport(): {
    totalChunks: number;
    averageLoadTime: number;
    slowestChunk: string;
    fastestChunk: string;
    errorRate: number;
    recommendations: string[];
  } {
    const chunks = Array.from(this.chunkData.values());
    const validChunks = chunks.filter(chunk => !chunk.error && chunk.loadTime > 0);
    
    if (validChunks.length === 0) {
      return {
        totalChunks: 0,
        averageLoadTime: 0,
        slowestChunk: '',
        fastestChunk: '',
        errorRate: 0,
        recommendations: ['No performance data available']
      };
    }

    const totalLoadTime = validChunks.reduce((sum, chunk) => sum + chunk.loadTime, 0);
    const averageLoadTime = totalLoadTime / validChunks.length;
    
    const sortedByLoadTime = validChunks.sort((a, b) => b.loadTime - a.loadTime);
    const slowestChunk = sortedByLoadTime[0]?.name || '';
    const fastestChunk = sortedByLoadTime[sortedByLoadTime.length - 1]?.name || '';
    
    const errorRate = chunks.filter(chunk => chunk.error).length / chunks.length;

    const recommendations: string[] = [];
    
    if (averageLoadTime > 1000) {
      recommendations.push('Consider optimizing chunk sizes - average load time is high');
    }
    
    if (errorRate > 0.1) {
      recommendations.push('High error rate detected - check network connectivity and chunk availability');
    }
    
    const slowChunks = validChunks.filter(chunk => chunk.loadTime > averageLoadTime * 2);
    if (slowChunks.length > 0) {
      recommendations.push(`Consider preloading slow chunks: ${slowChunks.map(c => c.name).join(', ')}`);
    }

    return {
      totalChunks: chunks.length,
      averageLoadTime,
      slowestChunk,
      fastestChunk,
      errorRate,
      recommendations
    };
  }

  getChunkInfo(componentName: string): ChunkInfo | undefined {
    return this.chunkData.get(componentName);
  }

  getAllChunks(): ChunkInfo[] {
    return Array.from(this.chunkData.values());
  }

  clearData(): void {
    this.chunkData.clear();
    this.performanceData = [];
  }
}

// Global functions for tracking
export const trackChunkLoad = (data: LoadingPerformance): void => {
  BundleAnalyzer.getInstance().trackChunkLoad(data);
};

export const trackChunkError = (componentName: string, error: Error): void => {
  BundleAnalyzer.getInstance().trackChunkError(componentName, error);
};

export const trackComponentError = (componentName: string, error: Error): void => {
  console.error(`Component error in ${componentName}:`, error);
  
  // Send to error reporting service
  fetch('/api/errors/component', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      componentName,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: Date.now(),
      url: window.location.href
    })
  }).catch(() => {
    // Silently fail if error reporting is unavailable
  });
};

export const getBundleAnalyzer = (): BundleAnalyzer => {
  return BundleAnalyzer.getInstance();
};

/**
 * Hook for preloading components on hover
 */
export const useHoverPreload = (lazyComponent: any) => {
  const handleMouseEnter = React.useCallback(() => {
    if (lazyComponent.preload) {
      lazyComponent.preload();
    }
  }, [lazyComponent]);

  return { onMouseEnter: handleMouseEnter };
};

/**
 * Hook for preloading components when they enter viewport
 */
export const useViewportPreload = (lazyComponent: any) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hasPreloaded, setHasPreloaded] = React.useState(false);

  React.useEffect(() => {
    if (hasPreloaded || !ref.current || !lazyComponent.preload) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lazyComponent.preload();
          setHasPreloaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [lazyComponent, hasPreloaded]);

  return ref;
};