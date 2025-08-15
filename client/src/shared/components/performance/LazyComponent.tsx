// Lazy loading component wrapper for Phase 3 Performance Enhancement
import React, { Suspense, lazy } from 'react';
import { useLazyLoad } from '../../hooks/useLazyLoad';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  loadingText?: string;
  errorFallback?: React.ReactNode;
}

// Loading skeleton component
const LoadingSkeleton: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-700 rounded-md h-4 w-3/4 mb-2"></div>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-md h-4 w-1/2 mb-2"></div>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-md h-4 w-2/3"></div>
    <div className="text-xs text-gray-500 mt-2">{text}</div>
  </div>
);

// Error boundary for lazy components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">Failed to load component</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback,
  className = '',
  loadingText = 'Loading component...',
  errorFallback
}) => {
  const { elementRef, hasLoaded } = useLazyLoad({
    rootMargin: '100px',
    threshold: 0.1,
    once: true
  });

  const defaultFallback = fallback || <LoadingSkeleton text={loadingText} />;

  return (
    <div ref={elementRef} className={className}>
      {hasLoaded ? (
        <LazyErrorBoundary fallback={errorFallback}>
          <Suspense fallback={defaultFallback}>
            {children}
          </Suspense>
        </LazyErrorBoundary>
      ) : (
        defaultFallback
      )}
    </div>
  );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    loadingText?: string;
  }
) => {
  const LazyWrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <LazyComponent
      fallback={options?.fallback}
      loadingText={options?.loadingText}
    >
      <Component {...props} ref={ref} />
    </LazyComponent>
  ));

  LazyWrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  
  return LazyWrappedComponent;
};

export default LazyComponent;