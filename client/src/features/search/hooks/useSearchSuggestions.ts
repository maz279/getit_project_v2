/**
 * useSearchSuggestions Hook - Handle search suggestions logic
 * Extracted from AISearchBar for better separation of concerns
 * FORENSIC ANALYSIS FIXES APPLIED - Production Ready Implementation
 */

import { useCallback, useRef, useMemo, useEffect } from 'react';
import { SearchApi } from '../services/api/searchApi';
import { SmartCacheManager } from '../services/cache/SmartCacheManager';
import { RequestManager } from '../services/request/RequestManager';
import { SEARCH_CONFIG } from '../constants/searchConstants';
import type { SearchSuggestion } from '../components/AISearchBar/AISearchBar.types';

// Configuration constants extracted from hardcoded values
const SUGGESTION_LIMITS = {
  PRODUCTS: 8,
  PAGES: 3,
  MIN_TEXT_LENGTH: 2,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  SLOW_REQUEST_THRESHOLD: 1000, // 1 second
} as const;

// Type definitions for API responses (replacing 'any' types)
interface SuggestionApiItem {
  text: string;
  type?: string;
  frequency?: number;
  relevance?: number;
}

interface SuggestionApiResponse {
  success: boolean;
  data?: SuggestionApiItem[];
}

interface NavigationItem {
  id: string | number;
  title: string;
  [key: string]: any;
}

interface NavigationApiResponse {
  success: boolean;
  data?: {
    navigationResults?: (NavigationItem | { item: NavigationItem })[];
  };
}

// Performance monitoring utility
const performanceMonitor = {
  start: () => performance.now(),
  end: (startTime: number, operation: string, threshold = SUGGESTION_LIMITS.SLOW_REQUEST_THRESHOLD) => {
    const duration = performance.now() - startTime;
    if (duration > threshold) {
      console.warn(`Slow operation [${operation}]: ${duration.toFixed(2)}ms`);
    }
    return duration;
  },
};

export const useSearchSuggestions = (language: string = 'en') => {
  // FORENSIC FIX: Proper lazy initialization to prevent memory leaks AND hooks order issues
  const cacheRef = useRef<SmartCacheManager<SearchSuggestion[]> | null>(null);
  const requestManagerRef = useRef<RequestManager | null>(null);
  const latestRequestIdRef = useRef<number>(0);

  // FORENSIC FIX: Lazy initialization using useEffect to avoid hooks order issues
  useEffect(() => {
    if (!cacheRef.current) {
      cacheRef.current = new SmartCacheManager<SearchSuggestion[]>();
    }
    if (!requestManagerRef.current) {
      requestManagerRef.current = new RequestManager();
    }
  }, []);

  // FORENSIC FIX: Automatic cleanup on unmount
  useEffect(() => {
    return () => {
      cacheRef.current?.destroy();
      requestManagerRef.current?.destroy();
    };
  }, []);

  // FORENSIC FIX: Robust cache key generation with language and proper hashing
  const generateCacheKey = useCallback((query: string, lang: string): string => {
    const normalizedQuery = query.toLowerCase().trim();
    const hash = normalizedQuery.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return `suggestions-${lang}-${normalizedQuery}-${Math.abs(hash)}`;
  }, []);

  // FORENSIC FIX: API response validation
  const validateSuggestionResponse = (response: unknown): response is SuggestionApiResponse => {
    return (
      typeof response === 'object' &&
      response !== null &&
      'success' in response &&
      typeof (response as any).success === 'boolean'
    );
  };

  const validateNavigationResponse = (response: unknown): response is NavigationApiResponse => {
    return (
      typeof response === 'object' &&
      response !== null &&
      'success' in response &&
      typeof (response as any).success === 'boolean'
    );
  };

  // FORENSIC FIX: Normalize navigation items for consistent structure
  const normalizeNavigationItem = (navResult: any): NavigationItem | null => {
    const item = navResult?.item || navResult;
    
    if (!item || typeof item !== 'object') {
      console.warn('Invalid navigation item:', navResult);
      return null;
    }
    
    const id = item.id ?? item.ID ?? item._id;
    const title = item.title ?? item.name ?? item.label;
    
    if (!id || !title) {
      console.warn('Navigation item missing required fields:', item);
      return null;
    }
    
    return {
      ...item,
      id: String(id),
      title: String(title).trim(),
    };
  };

  // FORENSIC FIX: Optimized deduplication using Map for O(1) lookups
  const deduplicateByText = useCallback((suggestions: SearchSuggestion[]): SearchSuggestion[] => {
    const uniqueMap = new Map<string, SearchSuggestion>();
    
    suggestions.forEach(suggestion => {
      const key = suggestion.text.toLowerCase().trim();
      
      // Keep suggestion with higher relevance/frequency if duplicate found
      const existing = uniqueMap.get(key);
      if (!existing || 
          (suggestion.frequency || 0) > (existing.frequency || 0) ||
          (suggestion.relevance || 0) > (existing.relevance || 0)) {
        uniqueMap.set(key, suggestion);
      }
    });
    
    return Array.from(uniqueMap.values());
  }, []);

  // FORENSIC FIX: Array mutation fixed - create new array instead of mutating
  const rankSuggestionsByRelevance = useCallback((suggestions: SearchSuggestion[]): SearchSuggestion[] => {
    return [...suggestions].sort((a, b) => {
      // Priority: frequency > relevance > alphabetical
      const aScore = (a.frequency || 0) * 10 + (a.relevance || 0);
      const bScore = (b.frequency || 0) * 10 + (b.relevance || 0);
      
      if (aScore !== bScore) {
        return bScore - aScore; // Higher score first
      }
      
      // If scores are equal, sort alphabetically
      return a.text.localeCompare(b.text, language);
    });
  }, [language]);

  // Memoized suggestion filters with extracted configuration constants
  const filterSuggestions = useMemo(() => ({
    products: (suggestions: SearchSuggestion[]) => {
      const productSuggestions = suggestions.filter(s => s.type !== 'page');
      const deduplicated = deduplicateByText(productSuggestions);
      return rankSuggestionsByRelevance(deduplicated).slice(0, SUGGESTION_LIMITS.PRODUCTS);
    },
    pages: (suggestions: SearchSuggestion[]) => {
      const pageSuggestions = suggestions.filter(s => s.type === 'page');
      const deduplicated = deduplicateByText(pageSuggestions);
      return deduplicated.slice(0, SUGGESTION_LIMITS.PAGES);
    },
    byType: (suggestions: SearchSuggestion[], type: SearchSuggestion['type']) =>
      deduplicateByText(suggestions.filter(s => s.type === type)),
  }), [deduplicateByText, rankSuggestionsByRelevance]);

  const loadSuggestions = useCallback(async (
    query: string,
    onSuccess: (suggestions: SearchSuggestion[], navigationResults?: any[]) => void,
    onError: (error: string) => void,
    onLoading: (loading: boolean) => void
  ) => {
    const startTime = performanceMonitor.start();
    
    // Validate input
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      onSuccess([]);
      return;
    }

    // FORENSIC FIX: SSR safety check for window access
    if (typeof window !== 'undefined' && window.location.pathname === '/search') {
      onSuccess([]);
      return;
    }

    // FORENSIC FIX: Race condition protection with request versioning
    const requestId = Date.now();
    latestRequestIdRef.current = requestId;

    // FORENSIC FIX: Robust cache key with language and proper hashing
    const cacheKey = generateCacheKey(trimmedQuery, language);
    const cachedSuggestions = cacheRef.current?.get(cacheKey);
    
    if (cachedSuggestions) {
      const duration = performanceMonitor.end(startTime, 'cache-hit');
      console.debug(`Cache hit for query: "${trimmedQuery}" (${duration.toFixed(2)}ms)`);
      onSuccess(cachedSuggestions);
      return;
    }

    onLoading(true);

    try {
      const abortController = requestManagerRef.current?.createRequest('suggestions');
      
      if (!abortController) {
        throw new Error('Failed to create request controller');
      }

      const [suggestionsResponse, navigationResponse] = await Promise.all([
        SearchApi.getAmazonStyleSuggestions(trimmedQuery, {
          location: 'BD',
          userHistory: [],
          limit: 10
        }, abortController.signal),
        SearchApi.getNavigationResults(trimmedQuery, language, abortController.signal),
      ]);

      // FORENSIC FIX: Check if this is still the latest request
      if (requestId !== latestRequestIdRef.current) {
        console.debug('Discarding outdated response for query:', trimmedQuery);
        return;
      }

      const allSuggestions: SearchSuggestion[] = [];
      const suggestionTextSet = new Set<string>(); // Track unique texts

      // FORENSIC FIX: Type-safe processing with validation
      if (validateSuggestionResponse(suggestionsResponse) && 
          suggestionsResponse.success && 
          Array.isArray(suggestionsResponse.data)) {
        
        const mappedSuggestions = suggestionsResponse.data
          .filter(item => item && typeof item.text === 'string')
          .map((item: SuggestionApiItem, index: number) => {
            const trimmedText = item.text.trim();
            const uniqueId = `product-${trimmedText.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`;
            
            return {
              id: uniqueId,
              text: trimmedText,
              type: (item.type || 'product') as SearchSuggestion['type'],
              frequency: Number(item.frequency) || 0,
              relevance: Number(item.relevance) || 0.5,
            };
          })
          .filter((suggestion) => {
            const textKey = suggestion.text.toLowerCase();
            
            // Enhanced validation with configuration constant
            if (suggestion.text.length < SUGGESTION_LIMITS.MIN_TEXT_LENGTH || 
                suggestionTextSet.has(textKey)) {
              return false;
            }
            
            suggestionTextSet.add(textKey);
            return true;
          });
        
        allSuggestions.push(...mappedSuggestions);
      }

      // FORENSIC FIX: Enhanced navigation processing with validation
      if (validateNavigationResponse(navigationResponse) && 
          navigationResponse.success && 
          Array.isArray(navigationResponse.data?.navigationResults)) {
        
        const navSuggestions = navigationResponse.data.navigationResults
          .map(normalizeNavigationItem)
          .filter((item): item is NavigationItem => item !== null)
          .map((navItem, index) => {
            const displayText = navItem.title.trim();
            const uniqueId = `nav-${navItem.id || `index-${index}`}`;
            
            return {
              id: uniqueId,
              text: displayText,
              type: 'page' as const,
              frequency: 0,
              relevance: 0.8, // Pages get high relevance for navigation
              navigationItem: navItem,
            };
          })
          .filter((suggestion) => {
            const textKey = suggestion.text.toLowerCase();
            
            if (suggestion.text.length < SUGGESTION_LIMITS.MIN_TEXT_LENGTH || 
                suggestionTextSet.has(textKey)) {
              return false;
            }
            
            suggestionTextSet.add(textKey);
            return true;
          });
        
        allSuggestions.push(...navSuggestions);
      }

      // FORENSIC FIX: Cache with TTL
      cacheRef.current?.set(cacheKey, allSuggestions, SUGGESTION_LIMITS.CACHE_TTL);
      
      const duration = performanceMonitor.end(startTime, 'suggestions-load');
      console.debug(`Loaded ${allSuggestions.length} suggestions in ${duration.toFixed(2)}ms`);
      
      onSuccess(allSuggestions, navigationResponse.data?.navigationResults);
      onLoading(false);

    } catch (error) {
      // FORENSIC FIX: Only handle error for the latest request with enhanced context
      if (requestId === latestRequestIdRef.current) {
        if (error instanceof Error && error.name !== 'AbortError') {
          const errorContext = {
            query: trimmedQuery,
            language,
            timestamp: new Date().toISOString(),
            errorType: error.name,
            message: error.message,
          };
          
          console.error('Search suggestions failed:', errorContext);
          
          const userMessage = `Failed to load suggestions for "${trimmedQuery}": ${error.message}`;
          onError(userMessage);
        }
        onLoading(false);
      }
    }
  }, [language, generateCacheKey, normalizeNavigationItem]);

  const clearCache = useCallback(() => {
    cacheRef.current?.clear();
    console.debug('Search suggestions cache cleared');
  }, []);

  const getCacheStats = useCallback(() => {
    return cacheRef.current?.getStats() || { hits: 0, misses: 0, size: 0 };
  }, []);

  const cancelRequests = useCallback(() => {
    requestManagerRef.current?.cancelAllRequests();
    console.debug('All search suggestion requests cancelled');
  }, []);

  // FORENSIC FIX: Enhanced cleanup function with null checks
  const cleanup = useCallback(() => {
    requestManagerRef.current?.destroy();
    cacheRef.current?.destroy();
    console.debug('Search suggestions cleanup completed');
  }, []);

  return {
    loadSuggestions,
    filterSuggestions,
    clearCache,
    getCacheStats,
    cancelRequests,
    cleanup,
  };
};