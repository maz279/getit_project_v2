/**
 * Phase 2: Infinite Scroll Component
 * Amazon.com/Shopee.sg-Level Infinite Scrolling
 * Optimized for Bangladesh mobile users
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Loader2, ArrowUp, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: () => Promise<void>;
  hasNextPage?: boolean;
  isLoading?: boolean;
  threshold?: number;
  scrollContainer?: HTMLElement | null;
  showBackToTop?: boolean;
  showScrollIndicator?: boolean;
  className?: string;
}

function InfiniteScroll<T>({
  items,
  renderItem,
  onLoadMore,
  hasNextPage = true,
  isLoading = false,
  threshold = 100,
  scrollContainer,
  showBackToTop = true,
  showScrollIndicator = true,
  className,
}: InfiniteScrollProps<T>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingTriggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll position for back to top and progress
  const handleScroll = useCallback(() => {
    const container = scrollContainer || containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    // Calculate scroll progress
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(Math.min(progress, 100));
    
    // Show/hide back to top button
    setShowBackToTopButton(scrollTop > 300);
  }, [scrollContainer]);

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainer || containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, scrollContainer]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || isLoading) return;

    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasNextPage, isLoading, onLoadMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadingTriggerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`,
      }
    );

    observerRef.current.observe(loadingTriggerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isLoadingMore, isLoading, loadMore, threshold]);

  // Scroll to top
  const scrollToTop = () => {
    const container = scrollContainer || containerRef.current;
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // Loading indicator
  const LoadingIndicator = () => (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Loading more items...</p>
          <p className="text-xs text-muted-foreground">
            Optimized for Bangladesh mobile networks
          </p>
        </div>
      </div>
    </div>
  );

  // End of list indicator
  const EndOfListIndicator = () => (
    <div className="text-center py-8">
      <div className="space-y-3">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">You've reached the end!</p>
          <p className="text-xs text-muted-foreground">
            {items.length} items loaded
          </p>
        </div>
      </div>
    </div>
  );

  // Scroll progress indicator
  const ScrollProgressIndicator = () => {
    if (!showScrollIndicator) return null;

    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        <div
          className="h-1 bg-primary transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    );
  };

  // Back to top button
  const BackToTopButton = () => {
    if (!showBackToTop || !showBackToTopButton) return null;

    return (
      <button
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'w-12 h-12 rounded-full bg-primary text-primary-foreground',
          'shadow-lg hover:shadow-xl transition-all duration-200',
          'flex items-center justify-center',
          'active:scale-95'
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
    >
      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator />

      {/* Items Grid */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading Trigger */}
      {hasNextPage && (
        <div
          ref={loadingTriggerRef}
          className="py-4"
        >
          {(isLoadingMore || isLoading) ? (
            <LoadingIndicator />
          ) : (
            <div className="text-center py-4">
              <Badge variant="outline">
                Scroll down for more items
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* End of List */}
      {!hasNextPage && items.length > 0 && (
        <EndOfListIndicator />
      )}

      {/* Back to Top Button */}
      <BackToTopButton />

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 z-50">
          <Card className="w-56">
            <CardContent className="p-3 text-xs space-y-2">
              <div className="font-medium">Infinite Scroll Debug</div>
              <div className="space-y-1">
                <div>Items: {items.length}</div>
                <div>Has More: {hasNextPage ? 'Yes' : 'No'}</div>
                <div>Loading: {isLoadingMore ? 'Yes' : 'No'}</div>
                <div>Scroll: {Math.round(scrollProgress)}%</div>
                <div>Threshold: {threshold}px</div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Mobile-optimized infinite scroll
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default InfiniteScroll;