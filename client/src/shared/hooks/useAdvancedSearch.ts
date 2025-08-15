// Advanced search integration hook for Phase 4 Features & Integrations
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface SearchFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  brand?: string;
  rating?: number;
  location?: string;
  sortBy?: 'relevance' | 'price' | 'rating' | 'date';
}

interface AdvancedSearchState {
  query: string;
  filters: SearchFilters;
  results: any[];
  suggestions: any[];
  isLoading: boolean;
  hasMore: boolean;
  totalResults: number;
  searchHistory: string[];
  recentSearches: string[];
}

interface SearchAnalytics {
  searchId: string;
  timestamp: number;
  duration: number;
  resultCount: number;
  filterApplied: boolean;
  userEngagement: boolean;
}

export const useAdvancedSearch = () => {
  const [state, setState] = useState<AdvancedSearchState>({
    query: '',
    filters: {},
    results: [],
    suggestions: [],
    isLoading: false,
    hasMore: false,
    totalResults: 0,
    searchHistory: [],
    recentSearches: []
  });

  const [analytics, setAnalytics] = useState<SearchAnalytics[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const debouncedQuery = useDebounce(state.query, 300);
  const searchStartTime = useRef<number>(0);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    const savedRecent = localStorage.getItem('recentSearches');
    
    if (savedHistory) {
      setState(prev => ({ ...prev, searchHistory: JSON.parse(savedHistory) }));
    }
    if (savedRecent) {
      setState(prev => ({ ...prev, recentSearches: JSON.parse(savedRecent) }));
    }
  }, []);

  // Advanced search with filters
  const performAdvancedSearch = useCallback(async (
    query: string,
    filters: SearchFilters = {},
    options: { append?: boolean; page?: number } = {}
  ) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, results: [], suggestions: [], totalResults: 0 }));
      return;
    }

    searchStartTime.current = performance.now();
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      results: options.append ? prev.results : []
    }));

    try {
      // Build search parameters
      const searchParams = new URLSearchParams({
        q: query,
        page: (options.page || 1).toString(),
        limit: '20'
      });

      // Add filters to search params
      if (filters.category) searchParams.set('category', filters.category);
      if (filters.priceRange) {
        searchParams.set('minPrice', filters.priceRange.min.toString());
        searchParams.set('maxPrice', filters.priceRange.max.toString());
      }
      if (filters.brand) searchParams.set('brand', filters.brand);
      if (filters.rating) searchParams.set('minRating', filters.rating.toString());
      if (filters.location) searchParams.set('location', filters.location);
      if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);

      // Perform search
      const [searchResponse, suggestionsResponse] = await Promise.all([
        fetch(`/api/search/products?${searchParams}`),
        fetch(`/api/search/suggestions-enhanced?q=${encodeURIComponent(query)}&limit=8`)
      ]);

      const searchData = await searchResponse.json();
      const suggestionsData = await suggestionsResponse.json();

      const duration = performance.now() - searchStartTime.current;

      // Update results
      setState(prev => ({
        ...prev,
        results: options.append 
          ? [...prev.results, ...(searchData.data?.products || [])]
          : searchData.data?.products || [],
        suggestions: suggestionsData.data || [],
        totalResults: searchData.data?.total || 0,
        hasMore: searchData.data?.hasMore || false,
        isLoading: false
      }));

      // Track analytics
      const analyticsData: SearchAnalytics = {
        searchId,
        timestamp: Date.now(),
        duration,
        resultCount: searchData.data?.products?.length || 0,
        filterApplied: Object.keys(filters).length > 0,
        userEngagement: false
      };

      setAnalytics(prev => [...prev.slice(-49), analyticsData]);

      // Update search history
      if (!state.searchHistory.includes(query)) {
        const newHistory = [query, ...state.searchHistory.slice(0, 19)];
        setState(prev => ({ ...prev, searchHistory: newHistory }));
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }

    } catch (error) {
      console.error('Advanced search error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.searchHistory]);

  // Auto-search on query/filter changes
  useEffect(() => {
    if (debouncedQuery) {
      performAdvancedSearch(debouncedQuery, state.filters);
    }
  }, [debouncedQuery, state.filters, performAdvancedSearch]);

  // Search suggestions with caching
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    try {
      const response = await fetch(
        `/api/search/suggestions-enhanced?q=${encodeURIComponent(query)}&limit=6`
      );
      const data = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        suggestions: data.data || [] 
      }));
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      suggestions: [],
      totalResults: 0,
      hasMore: false
    }));
  }, []);

  // Apply filters
  const applyFilters = useCallback((newFilters: SearchFilters) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...newFilters } }));
  }, []);

  // Load more results
  const loadMore = useCallback(() => {
    if (!state.hasMore || state.isLoading) return;
    
    const currentPage = Math.floor(state.results.length / 20) + 1;
    performAdvancedSearch(state.query, state.filters, { append: true, page: currentPage });
  }, [state.hasMore, state.isLoading, state.results.length, state.query, state.filters, performAdvancedSearch]);

  // Set query
  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
  }, []);

  // Track user engagement
  const trackEngagement = useCallback((searchId: string) => {
    setAnalytics(prev => 
      prev.map(item => 
        item.searchId === searchId 
          ? { ...item, userEngagement: true }
          : item
      )
    );
  }, []);

  // Get search performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const recentAnalytics = analytics.slice(-10);
    const avgDuration = recentAnalytics.reduce((sum, item) => sum + item.duration, 0) / recentAnalytics.length || 0;
    const engagementRate = recentAnalytics.filter(item => item.userEngagement).length / recentAnalytics.length || 0;
    
    return {
      averageSearchTime: avgDuration,
      engagementRate,
      totalSearches: analytics.length,
      recentSearches: recentAnalytics.length
    };
  }, [analytics]);

  return {
    // State
    ...state,
    analytics,
    
    // Actions
    setQuery,
    performAdvancedSearch,
    getSuggestions,
    clearSearch,
    applyFilters,
    loadMore,
    trackEngagement,
    
    // Utilities
    getPerformanceMetrics,
    debouncedQuery
  };
};

export default useAdvancedSearch;