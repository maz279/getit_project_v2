/**
 * Phase 2: Lazy Load Wrapper Component
 * Amazon.com/Shopee.sg-Level Intelligent Lazy Loading
 */

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Loader2, Eye, Zap, Target } from 'lucide-react';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  enablePreloading?: boolean;
  showLoadingInsights?: boolean;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  enablePreloading = true,
  showLoadingInsights = false,
  priority = 'medium',
  className = '',
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const loadStartTime = useRef<number | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          loadStartTime.current = Date.now();
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Preloading logic
  useEffect(() => {
    if (!enablePreloading) return;

    const preloadTimer = setTimeout(() => {
      if (priority === 'high') {
        setIsIntersecting(true);
        loadStartTime.current = Date.now();
      }
    }, priority === 'high' ? 0 : priority === 'medium' ? 1000 : 2000);

    return () => clearTimeout(preloadTimer);
  }, [enablePreloading, priority]);

  // Handle loading completion
  useEffect(() => {
    if (isIntersecting && !isLoaded) {
      const loadTimer = setTimeout(() => {
        setIsLoaded(true);
        if (loadStartTime.current) {
          setLoadTime(Date.now() - loadStartTime.current);
        }
      }, 100); // Simulate loading time

      return () => clearTimeout(loadTimer);
    }
  }, [isIntersecting, isLoaded]);

  // Priority-based loading delay
  const getLoadingDelay = (priority: string): number => {
    switch (priority) {
      case 'high': return 0;
      case 'medium': return 100;
      case 'low': return 200;
      default: return 100;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // Loading fallback component
  const LoadingFallback = () => (
    <Card className={`w-full ${className}`}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Loading content...</p>
            {showLoadingInsights && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant={getPriorityColor(priority)}>
                  {priority} priority
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Optimizing for {priority === 'high' ? 'immediate' : priority === 'medium' ? 'fast' : 'efficient'} loading
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Performance insights component
  const PerformanceInsights = () => {
    if (!showLoadingInsights || !loadTime) return null;

    const isOptimal = loadTime < 200;
    const isGood = loadTime < 500;

    return (
      <div className="absolute top-2 right-2 z-10">
        <Card className="w-64">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Load Performance</span>
              <Badge variant={isOptimal ? 'default' : isGood ? 'secondary' : 'destructive'}>
                {isOptimal ? 'Optimal' : isGood ? 'Good' : 'Slow'}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Load Time</span>
                <span className="font-medium">{loadTime}ms</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Priority</span>
                <span className="font-medium capitalize">{priority}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Strategy</span>
                <span className="font-medium">
                  {isIntersecting ? 'Viewport-based' : 'Pre-loading'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>Intersection: {threshold * 100}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Error boundary
  const ErrorFallback = ({ error }: { error: Error }) => (
    <Card className={`w-full ${className}`}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-red-500">
            <Target className="h-6 w-6" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-red-600">Loading Error</p>
            <p className="text-xs text-muted-foreground">
              Failed to load content. Please try again.
            </p>
            {showLoadingInsights && (
              <div className="text-xs text-muted-foreground">
                Error: {error.message}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div ref={elementRef} className={`relative ${className}`}>
      {error ? (
        <ErrorFallback error={error} />
      ) : !isIntersecting ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Preparing content...</p>
              {showLoadingInsights && (
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={getPriorityColor(priority)}>
                    {priority} priority
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Threshold: {threshold * 100}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Suspense fallback={fallback || <LoadingFallback />}>
          <div className="relative">
            {children}
            <PerformanceInsights />
          </div>
        </Suspense>
      )}
    </div>
  );
};

export default LazyLoadWrapper;