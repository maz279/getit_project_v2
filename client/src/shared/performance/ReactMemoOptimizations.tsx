/**
 * Phase 2: Performance Optimization
 * React.memo Optimization Patterns
 * Investment: $8,000 | Week 3-4
 */

import React, { memo, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { isEqual } from 'lodash';

// Custom comparison functions for React.memo
const shallowEqual = (prevProps: any, nextProps: any): boolean => {
  const keys1 = Object.keys(prevProps);
  const keys2 = Object.keys(nextProps);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (let key of keys1) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  
  return true;
};

const deepEqual = (prevProps: any, nextProps: any): boolean => {
  return isEqual(prevProps, nextProps);
};

const searchPropsEqual = (prevProps: any, nextProps: any): boolean => {
  // Custom equality for search components - ignore function references if they're stable
  if (prevProps.query !== nextProps.query) return false;
  if (prevProps.filters !== nextProps.filters) return false;
  if (prevProps.results?.length !== nextProps.results?.length) return false;
  
  // Compare result IDs instead of full objects
  if (prevProps.results && nextProps.results) {
    const prevIds = prevProps.results.map((r: any) => r.id).join(',');
    const nextIds = nextProps.results.map((r: any) => r.id).join(',');
    return prevIds === nextIds;
  }
  
  return true;
};

/**
 * Optimized search result item component
 */
interface SearchResultItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
  };
  onSelect: (id: string) => void;
  onAddToCart: (id: string) => void;
  isSelected?: boolean;
  index: number;
}

const SearchResultItemBase: React.FC<SearchResultItemProps> = ({
  item,
  onSelect,
  onAddToCart,
  isSelected = false,
  index
}) => {
  // Stable callback references
  const handleSelect = useCallback(() => {
    onSelect(item.id);
  }, [onSelect, item.id]);

  const handleAddToCart = useCallback(() => {
    onAddToCart(item.id);
  }, [onAddToCart, item.id]);

  // Memoized expensive operations
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(item.price);
  }, [item.price]);

  const truncatedDescription = useMemo(() => {
    return item.description.length > 100 
      ? item.description.substring(0, 100) + '...' 
      : item.description;
  }, [item.description]);

  return (
    <div 
      className={`border rounded-lg p-4 transition-all duration-200 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={handleSelect}
    >
      {item.imageUrl && (
        <img 
          src={item.imageUrl} 
          alt={item.title}
          className="w-full h-48 object-cover rounded mb-3"
          loading={index > 5 ? 'lazy' : 'eager'} // Lazy load items below fold
        />
      )}
      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
      <p className="text-gray-600 text-sm mb-3">{truncatedDescription}</p>
      <div className="flex justify-between items-center">
        <span className="font-bold text-green-600">{formattedPrice}</span>
        <button
          onClick={handleAddToCart}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
      <span className="text-xs text-gray-500 mt-2 block">{item.category}</span>
    </div>
  );
};

export const SearchResultItem = memo(SearchResultItemBase, searchPropsEqual);

/**
 * Optimized search filters component
 */
interface SearchFiltersProps {
  filters: {
    category?: string;
    priceRange?: [number, number];
    rating?: number;
    inStock?: boolean;
  };
  categories: string[];
  onFiltersChange: (filters: any) => void;
  isLoading?: boolean;
}

const SearchFiltersBase: React.FC<SearchFiltersProps> = ({
  filters,
  categories,
  onFiltersChange,
  isLoading = false
}) => {
  // Stable callback with useCallback
  const handleFilterChange = useCallback((key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  // Memoized options rendering
  const categoryOptions = useMemo(() => (
    categories.map(category => (
      <option key={category} value={category}>{category}</option>
    ))
  ), [categories]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categoryOptions}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Price Range: ৳{filters.priceRange?.[0] || 0} - ৳{filters.priceRange?.[1] || 10000}
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          value={filters.priceRange?.[1] || 10000}
          onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
          className="w-full"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="mr-2"
          />
          In Stock Only
        </label>
      </div>
    </div>
  );
};

export const SearchFilters = memo(SearchFiltersBase, shallowEqual);

/**
 * Optimized search suggestions dropdown
 */
interface SearchSuggestionsProps {
  suggestions: Array<{
    id: string;
    text: string;
    type: 'query' | 'product' | 'category';
  }>;
  onSelect: (suggestion: any) => void;
  isVisible: boolean;
  maxItems?: number;
}

const SearchSuggestionsBase: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  isVisible,
  maxItems = 8
}) => {
  // Memoize limited suggestions
  const limitedSuggestions = useMemo(() => {
    return suggestions.slice(0, maxItems);
  }, [suggestions, maxItems]);

  // Stable callbacks for each suggestion
  const suggestionCallbacks = useMemo(() => {
    return limitedSuggestions.reduce((acc, suggestion) => {
      acc[suggestion.id] = () => onSelect(suggestion);
      return acc;
    }, {} as Record<string, () => void>);
  }, [limitedSuggestions, onSelect]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-64 overflow-y-auto">
      {limitedSuggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={suggestionCallbacks[suggestion.id]}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
        >
          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${
            suggestion.type === 'product' ? 'bg-blue-500' :
            suggestion.type === 'category' ? 'bg-green-500' : 'bg-gray-500'
          }`}></span>
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};

export const SearchSuggestions = memo(SearchSuggestionsBase, deepEqual);

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current++;
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    // Log performance metrics
    if (renderTime > 16) { // > 1 frame at 60fps
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms (${renderCount.current} renders)`);
    }
    
    startTime.current = endTime;
  });

  return {
    renderCount: renderCount.current,
    logPerformance: () => {
      console.log(`${componentName}: ${renderCount.current} renders`);
    }
  };
};

/**
 * Optimized list virtualization for large datasets
 */
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualizedList<T extends { id: string }>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  
  // Memoized visible range calculation
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Memoized visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => 
            renderItem(item, visibleRange.startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Higher-order component for automatic memoization
 */
export function withMemoization<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  compareProps?: (prevProps: P, nextProps: P) => boolean
) {
  const MemoizedComponent = memo(Component, compareProps);
  MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name})`;
  return MemoizedComponent;
}

/**
 * Hook for stable callback references
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

/**
 * Hook for memoized expensive computations
 */
export const useExpensiveComputation = <T>(
  computeFn: () => T,
  deps: React.DependencyList,
  options: { debounce?: number } = {}
): T => {
  const [debouncedDeps, setDebouncedDeps] = useState(deps);
  
  useEffect(() => {
    if (options.debounce) {
      const timer = setTimeout(() => {
        setDebouncedDeps(deps);
      }, options.debounce);
      return () => clearTimeout(timer);
    } else {
      setDebouncedDeps(deps);
    }
  }, deps);
  
  return useMemo(computeFn, debouncedDeps);
};

/**
 * Performance testing utilities
 */
export const PerformanceProfiler: React.FC<{
  children: React.ReactNode;
  name: string;
  logThreshold?: number;
}> = ({ children, name, logThreshold = 16 }) => {
  const startTime = useRef<number>();
  
  const onRender = useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number
  ) => {
    if (actualDuration > logThreshold) {
      console.log(`🐌 ${name} ${phase}: ${actualDuration.toFixed(2)}ms`);
    }
  }, [name, logThreshold]);

  return (
    <React.Profiler id={name} onRender={onRender}>
      {children}
    </React.Profiler>
  );
};