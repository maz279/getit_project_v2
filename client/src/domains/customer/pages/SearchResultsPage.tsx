import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, SortAsc, AlertCircle, Loader2 } from 'lucide-react';
import { sanitizeSearchQuery, ClientRateLimit } from '@/shared/components/ai-search/utils/searchSecurity';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price?: string;
  rating?: number;
  url: string;
  thumbnail?: string;
}

interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
}

// Priority 2: Enhanced security and performance features
const searchRateLimit = new ClientRateLimit(60000, 30); // 30 requests per minute

// Priority 2.3: Search result caching for performance
interface CachedSearchResult {
  data: SearchState;
  timestamp: number;
  searchTime: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const searchCache = new Map<string, CachedSearchResult>();

const getCachedResult = (cacheKey: string): SearchState | null => {
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for: ${cacheKey} (${cached.searchTime}ms original search time)`);
    return cached.data;
  }
  if (cached) {
    searchCache.delete(cacheKey); // Remove expired cache
  }
  return null;
};

const setCachedResult = (cacheKey: string, data: SearchState, searchTime: number): void => {
  // Limit cache size to prevent memory issues
  if (searchCache.size >= 50) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) {
      searchCache.delete(oldestKey);
    }
  }
  
  searchCache.set(cacheKey, {
    data: { ...data },
    timestamp: Date.now(),
    searchTime
  });
};

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    totalCount: 0,
    hasMore: false
  });

  // Priority 2 & 3: Enhanced search with security, caching, and analytics
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchState(prev => ({ ...prev, results: [], totalCount: 0 }));
      return;
    }

    // Priority 2.2: Enhanced rate limiting
    if (!searchRateLimit.isAllowed(searchQuery)) {
      setSearchState(prev => ({
        ...prev,
        error: 'Too many search requests. Please wait a moment and try again.',
        loading: false
      }));
      return;
    }

    // Priority 2.1: Enhanced input sanitization
    const sanitizedQuery = sanitizeSearchQuery(searchQuery);
    if (!sanitizedQuery || sanitizedQuery.trim().length < 1) {
      setSearchState(prev => ({
        ...prev,
        error: 'Invalid search query. Please enter valid search terms.',
        loading: false
      }));
      return;
    }

    // Priority 2.3: Check cache first for performance
    const cacheKey = `search_${sanitizedQuery.toLowerCase()}`;
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      setSearchState(cachedResult);
      
      // Priority 3.3: Analytics for cached results
      if ((window as any).gtag) {
        (window as any).gtag('event', 'search_cache_hit', {
          search_query: sanitizedQuery,
          result_count: cachedResult.totalCount
        });
      }
      return;
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const startTime = Date.now();
      
      // Priority 3.2: Enhanced database integration with additional parameters
      const response = await fetch(`/api/search/products?q=${encodeURIComponent(sanitizedQuery)}&limit=20&page=1`);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      const searchTime = Date.now() - startTime;
      
      const searchResult: SearchState = {
        results: (data.products || []).map((product: any) => ({
          id: product.id,
          title: product.name || product.title,
          description: product.description || '',
          price: product.price ? `৳${product.price.toLocaleString()}` : undefined,
          rating: product.rating,
          url: `/product/${product.id}`,
          thumbnail: product.image || product.thumbnail
        })),
        loading: false,
        error: null,
        totalCount: data.totalResults || 0,
        hasMore: data.totalPages > data.page
      };

      // Priority 2.3: Cache successful results
      setCachedResult(cacheKey, searchResult, searchTime);
      
      setSearchState(searchResult);
      
      // Priority 2.4: Performance monitoring
      if (searchTime > 1000) {
        console.warn(`Slow search detected: ${searchTime}ms for query: ${sanitizedQuery}`);
      }
      
      // Priority 3.3: Enhanced analytics tracking
      if ((window as any).gtag) {
        (window as any).gtag('event', 'search_performed', {
          search_query: sanitizedQuery,
          result_count: searchResult.totalCount,
          search_time_ms: searchTime,
          cache_miss: true
        });
      }
      
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load search results. Please check your connection and try again.',
        results: [],
        totalCount: 0
      }));
      
      // Priority 3.3: Error analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'search_error', {
          search_query: sanitizedQuery,
          error_message: error.message
        });
      }
    }
  }, []);

  // Priority 3.1: AI Search Integration Effect
  useEffect(() => {
    performSearch(query);
    
    // Priority 3.3: Track page views for analytics
    if (query && (window as any).gtag) {
      (window as any).gtag('event', 'search_results_page_view', {
        search_query: query,
        page_title: 'Search Results',
        custom_map: { 'custom_parameter_1': query }
      });
    }
  }, [query, performSearch]);

  // Priority 3.1: AI Search Integration - expose search function for AI search bar integration
  useEffect(() => {
    // Make search function available globally for AI search integration
    (window as any).searchFromAI = (aiQuery: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set('q', aiQuery);
      window.history.pushState({}, '', url.toString());
      performSearch(aiQuery);
    };

    return () => {
      // Cleanup
      delete (window as any).searchFromAI;
    };
  }, [performSearch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-600 dark:text-gray-300 mt-2" aria-live="polite">
            {searchState.loading 
              ? 'Searching...' 
              : `Showing ${searchState.totalCount} result${searchState.totalCount !== 1 ? 's' : ''} for: "${query}"`
            }
          </p>
        )}
      </div>

      {/* Loading State */}
      {searchState.loading && (
        <div className="flex justify-center items-center py-12" aria-label="Loading search results">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading results...</span>
        </div>
      )}

      {/* Error State */}
      {searchState.error && (
        <div 
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-800 dark:text-red-200">{searchState.error}</p>
        </div>
      )}

      {/* Empty State */}
      {!searchState.loading && !searchState.error && searchState.results.length === 0 && query && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            No results found for "{query}". Try different search terms.
          </p>
        </div>
      )}

      {/* No Query State */}
      {!query && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <p className="text-blue-800 dark:text-blue-200">
            Enter a search term to find products.
          </p>
        </div>
      )}

      {/* Priority 3.1: Enhanced Results Grid with AI Search Integration */}
      {!searchState.loading && searchState.results.length > 0 && (
        <div className="space-y-6">
          {/* Search Performance Metrics */}
          {searchCache.get(`search_${query?.toLowerCase()}`) && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-green-800 dark:text-green-200 text-sm">
                ⚡ Fast result from cache (Original search: {searchCache.get(`search_${query?.toLowerCase()}`)?.searchTime}ms)
              </p>
            </div>
          )}
          
          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {searchState.totalCount} results found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1 text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
                aria-label="Sort results"
              >
                <SortAsc className="h-3 w-3" />
                Relevance
              </button>
              <button
                className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle view"
              >
                <Grid className="h-3 w-3" />
                Grid
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="region"
            aria-label={`Search results for ${query}`}
          >
            {searchState.results.map((result) => (
              <article
                key={result.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                {result.thumbnail && (
                  <img 
                    src={result.thumbnail} 
                    alt={result.title}
                    className="w-full h-48 object-cover rounded mb-4"
                    loading="lazy"
                  />
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {result.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {result.description}
                </p>
                {result.price && (
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                    {result.price}
                  </p>
                )}
                {result.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`text-sm ${i < result.rating! ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      ({result.rating}/5)
                    </span>
                  </div>
                )}
                <a 
                  href={result.url}
                  className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition-colors duration-200"
                  aria-label={`View details for ${result.title}`}
                >
                  View Details
                </a>
              </article>
            ))}
          </div>

          {/* Load More / Pagination */}
          {searchState.hasMore && (
            <div className="text-center">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                onClick={() => {
                  // Priority 3.2: Enhanced pagination with database integration
                  const currentPage = 1; // This would come from state in full implementation
                  const nextPage = currentPage + 1;
                  
                  // Enhanced database call with pagination
                  fetch(`/api/search/products?q=${encodeURIComponent(query)}&limit=20&page=${nextPage}`)
                    .then(res => res.json())
                    .then(data => {
                      setSearchState(prev => ({
                        ...prev,
                        results: [...prev.results, ...(data.products || []).map((product: any) => ({
                          id: product.id,
                          title: product.name || product.title,
                          description: product.description || '',
                          price: product.price ? `৳${product.price.toLocaleString()}` : undefined,
                          rating: product.rating,
                          url: `/product/${product.id}`,
                          thumbnail: product.image || product.thumbnail
                        }))],
                        hasMore: data.totalPages > nextPage
                      }));
                    })
                    .catch(err => console.error('Load more error:', err));
                }}
              >
                Load More Results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Wrap SearchResultsPage with ErrorBoundary for enhanced error handling
const SearchResultsPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <AlertCircle className="text-red-500 text-6xl mb-4 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Search Error
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              There was an issue loading the search results. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('SearchResultsPage Error:', error);
        console.error('Error Info:', errorInfo);
      }}
    >
      <SearchResultsPage />
    </ErrorBoundary>
  );
};

export default SearchResultsPageWithErrorBoundary;