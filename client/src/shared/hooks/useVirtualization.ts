// Virtualization hook for Phase 3 Performance Enhancement
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  scrollOffset?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

export const useVirtualization = <T>(
  items: T[],
  options: VirtualizationOptions
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    scrollOffset = 0
  } = options;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleItemCount, items.length);
    
    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Generate virtual items
  const virtualItems = useMemo((): VirtualItem[] => {
    const result: VirtualItem[] = [];
    
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      result.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        size: itemHeight
      });
    }
    
    return result;
  }, [visibleRange.start, visibleRange.end, itemHeight]);

  // Total height calculation
  const totalHeight = items.length * itemHeight;

  // Scroll handler
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
  }, []);

  // Scroll to index
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current) return;
    
    let scrollTo = index * itemHeight;
    
    if (align === 'center') {
      scrollTo = scrollTo - containerHeight / 2 + itemHeight / 2;
    } else if (align === 'end') {
      scrollTo = scrollTo - containerHeight + itemHeight;
    }
    
    containerRef.current.scrollTop = Math.max(0, Math.min(scrollTo, totalHeight - containerHeight));
  }, [itemHeight, containerHeight, totalHeight]);

  // Get visible items data
  const visibleItems = useMemo(() => {
    return virtualItems.map(virtualItem => ({
      ...virtualItem,
      data: items[virtualItem.index]
    }));
  }, [virtualItems, items]);

  return {
    containerRef,
    virtualItems,
    visibleItems,
    totalHeight,
    scrollToIndex,
    handleScroll,
    scrollTop,
    visibleRange
  };
};

// Hook for infinite scrolling with virtualization
export const useInfiniteVirtualization = <T>(
  items: T[],
  options: VirtualizationOptions & {
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<T[]>;
    hasNextPage: boolean;
    isLoading: boolean;
    threshold?: number;
  }
) => {
  const virtualization = useVirtualization(items, options);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const {
    loadMoreItems,
    hasNextPage,
    isLoading,
    threshold = 5
  } = options;

  // Check if we need to load more items
  useEffect(() => {
    const { visibleRange } = virtualization;
    const shouldLoadMore = 
      hasNextPage &&
      !isLoading &&
      !isLoadingMore &&
      visibleRange.end >= items.length - threshold;

    if (shouldLoadMore) {
      setIsLoadingMore(true);
      loadMoreItems(items.length, items.length + 20)
        .then(() => setIsLoadingMore(false))
        .catch(() => setIsLoadingMore(false));
    }
  }, [virtualization.visibleRange, hasNextPage, isLoading, isLoadingMore, items.length, threshold, loadMoreItems]);

  return {
    ...virtualization,
    isLoadingMore
  };
};

export default { useVirtualization, useInfiniteVirtualization };