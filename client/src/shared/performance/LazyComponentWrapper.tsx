/**
 * Lazy Component Wrapper for GetIt Platform
 * Implements dynamic component loading with performance optimization
 * 
 * @fileoverview Wrapper for lazy loading React components with fallback and error handling
 * @version 2.0.0
 * @author GetIt Platform Team
 */

import React, { Suspense, ErrorBoundary, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLazyComponent } from '@/shared/hooks/useLazyLoading';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

export interface LazyComponentWrapperProps<T = any> {
  importFn: () => Promise<{ default: React.ComponentType<T> }>;
  componentProps?: T;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  priority?: 'high' | 'medium' | 'low';
  retryable?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  skeleton?: React.ReactNode;
}

/**
 * Error boundary for lazy loaded components
 */
class LazyComponentErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error) => void;
    retryable?: boolean;
    onRetry?: () => void;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-red-700 mb-1">Component Error</h3>
              <p className="text-sm text-red-600 mb-3">
                Failed to load component: {this.state.error?.message}
              </p>
              {this.props.retryable && (
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    this.props.onRetry?.();
                  }}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Default loading skeleton
 */
const DefaultSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('animate-pulse', className)}>
    <CardContent className="p-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Default loading fallback
 */
const DefaultLoadingFallback: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={className}>
    <CardContent className="flex items-center justify-center p-6">
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
        <p className="text-sm text-gray-600">Loading component...</p>
      </div>
    </CardContent>
  </Card>
);

/**
 * Lazy component wrapper with intersection observer
 */
export const LazyComponentWrapper = <T extends Record<string, any> = any>({
  importFn,
  componentProps,
  fallback,
  errorFallback,
  className,
  threshold = 0.1,
  rootMargin = '50px 0px',
  priority = 'medium',
  retryable = true,
  onLoad,
  onError,
  skeleton
}: LazyComponentWrapperProps<T>): JSX.Element => {
  const [elementRef, lazyState] = useLazyComponent(importFn, {
    threshold,
    rootMargin,
    priority,
    triggerOnce: true,
    networkAdaptive: true
  });

  const [retryKey, setRetryKey] = useState(0);

  /**
   * Handle component load
   */
  useEffect(() => {
    if (lazyState.Component && !lazyState.isLoading) {
      onLoad?.();
    }
  }, [lazyState.Component, lazyState.isLoading, onLoad]);

  /**
   * Handle component error
   */
  useEffect(() => {
    if (lazyState.hasError) {
      onError?.(new Error('Failed to load lazy component'));
    }
  }, [lazyState.hasError, onError]);

  /**
   * Retry loading
   */
  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  // Show skeleton while waiting for visibility
  if (!lazyState.isVisible) {
    return (
      <div ref={elementRef} className={className}>
        {skeleton || <DefaultSkeleton className={className} />}
      </div>
    );
  }

  // Show loading state
  if (lazyState.isLoading) {
    return fallback ? (
      <div className={className}>{fallback}</div>
    ) : (
      <DefaultLoadingFallback className={className} />
    );
  }

  // Show error state
  if (lazyState.hasError || !lazyState.Component) {
    if (errorFallback) {
      return <div className={className}>{errorFallback}</div>;
    }

    return (
      <Card className={cn('border-red-200 bg-red-50', className)}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-700 mb-1">Failed to Load</h3>
            <p className="text-sm text-red-600 mb-3">
              Component could not be loaded
            </p>
            {retryable && (
              <Button onClick={handleRetry} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render loaded component
  const Component = lazyState.Component;
  
  return (
    <div className={className} key={retryKey}>
      <LazyComponentErrorBoundary
        fallback={errorFallback}
        onError={onError}
        retryable={retryable}
        onRetry={handleRetry}
      >
        <Suspense fallback={fallback || <DefaultLoadingFallback />}>
          <Component {...(componentProps || {})} />
        </Suspense>
      </LazyComponentErrorBoundary>
    </div>
  );
};

/**
 * HOC for creating lazy components
 */
export const withLazyLoading = <P extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  options: Omit<LazyComponentWrapperProps<P>, 'importFn' | 'componentProps'> = {}
) => {
  return (props: P) => (
    <LazyComponentWrapper
      importFn={importFn}
      componentProps={props}
      {...options}
    />
  );
};

/**
 * Lazy route component wrapper
 */
export const LazyRoute: React.FC<{
  importFn: () => Promise<{ default: React.ComponentType<any> }>;
  className?: string;
}> = ({ importFn, className }) => (
  <LazyComponentWrapper
    importFn={importFn}
    className={className}
    priority="high"
    threshold={0}
    fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-lg font-semibold mb-2">Loading Page...</h2>
          <p className="text-gray-600">Please wait while we load the content</p>
        </div>
      </div>
    }
    skeleton={
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    }
  />
);

export default LazyComponentWrapper;