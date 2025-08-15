/**
 * PHASE 2: SEARCH STATE SLICE
 * Advanced search state management with caching and optimization
 * Investment: $25,000 | Week 1: Foundation
 * Date: July 26, 2025
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Search result interfaces
export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: 'product' | 'page' | 'menu' | 'faq' | 'external';
  readonly relevanceScore: number;
  readonly thumbnail?: string;
  readonly url?: string;
  readonly price?: string;
  readonly rating?: number;
  readonly badge?: string;
  readonly category?: string;
  readonly vendor?: string;
  readonly isNavigationItem?: boolean;
}

export interface SearchSuggestion {
  readonly id: string;
  readonly text: string;
  readonly type: 'product' | 'category' | 'brand' | 'intent' | 'history' | 'trending' | 'phonetic' | 'page';
  readonly frequency?: number;
  readonly relevance?: number;
  readonly count?: number;
  readonly bengaliPhonetic?: string;
  readonly navigationItem?: any;
}

export interface SearchFilters {
  readonly category: string[];
  readonly priceRange: {
    min?: number;
    max?: number;
  };
  readonly rating: number;
  readonly vendor: string[];
  readonly inStock: boolean;
  readonly freeShipping: boolean;
  readonly sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
  readonly location?: string;
}

export interface SearchHistory {
  readonly query: string;
  readonly timestamp: number;
  readonly resultCount: number;
  readonly filters?: SearchFilters;
  readonly language: 'en' | 'bn';
}

export interface SearchCache {
  readonly [key: string]: {
    results: SearchResult[];
    suggestions: SearchSuggestion[];
    timestamp: number;
    ttl: number;
    hitCount: number;
  };
}

export interface AISearchResponse {
  readonly conversationalResponse: string;
  readonly confidence: number;
  readonly responseType: 'informational' | 'advisory' | 'transactional' | 'conversational';
  readonly sources: string[];
  readonly followUpQuestions: string[];
}

interface SearchState {
  // Current search
  query: string;
  language: 'en' | 'bn';
  isSearching: boolean;
  
  // Search results
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
  
  // AI search
  aiResponse: AISearchResponse | null;
  showConversationalResponse: boolean;
  isAISearching: boolean;
  
  // Filters and sorting
  filters: SearchFilters;
  activeFilters: number;
  
  // Search history
  history: SearchHistory[];
  maxHistorySize: number;
  
  // Search cache
  cache: SearchCache;
  cacheHitRate: number;
  
  // Search modes
  searchMode: 'unified' | 'products' | 'pages' | 'ai' | 'visual' | 'voice';
  multiModalEnabled: boolean;
  
  // Performance metrics
  lastSearchTime: number;
  averageSearchTime: number;
  searchCount: number;
  
  // UI state
  showSuggestions: boolean;
  showFilters: boolean;
  activeSection: 'all' | 'products' | 'pages' | 'ai' | 'insights' | 'recommendations';
  
  // Error handling
  error: string | null;
  networkError: boolean;
}

// Initial state
const initialState: SearchState = {
  query: '',
  language: 'en',
  isSearching: false,
  
  results: [],
  suggestions: [],
  totalResults: 0,
  currentPage: 1,
  itemsPerPage: 24,
  
  aiResponse: null,
  showConversationalResponse: false,
  isAISearching: false,
  
  filters: {
    category: [],
    priceRange: {},
    rating: 0,
    vendor: [],
    inStock: false,
    freeShipping: false,
    sortBy: 'relevance',
  },
  activeFilters: 0,
  
  history: [],
  maxHistorySize: 50,
  
  cache: {},
  cacheHitRate: 0,
  
  searchMode: 'unified',
  multiModalEnabled: true,
  
  lastSearchTime: 0,
  averageSearchTime: 0,
  searchCount: 0,
  
  showSuggestions: false,
  showFilters: false,
  activeSection: 'all',
  
  error: null,
  networkError: false,
};

// Async thunks
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async ({ 
    query, 
    filters, 
    page, 
    language 
  }: {
    query: string;
    filters: SearchFilters;
    page: number;
    language: 'en' | 'bn';
  }, { rejectWithValue, getState }) => {
    try {
      const startTime = performance.now();
      
      // Check cache first
      const state = getState() as { search: SearchState };
      const cacheKey = `${query}-${JSON.stringify(filters)}-${page}-${language}`;
      const cached = state.search.cache[cacheKey];
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return {
          results: cached.results,
          suggestions: cached.suggestions,
          fromCache: true,
          searchTime: performance.now() - startTime,
        };
      }
      
      // Perform actual search
      const searchParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: state.search.itemsPerPage.toString(),
        lang: language,
        ...filters,
        category: filters.category.join(','),
        vendor: filters.vendor.join(','),
      });
      
      const response = await fetch(`/api/search/unified?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        results: data.results || [],
        suggestions: data.suggestions || [],
        totalResults: data.totalResults || 0,
        fromCache: false,
        searchTime: performance.now() - startTime,
        cacheKey,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Search failed');
    }
  }
);

export const performAISearch = createAsyncThunk(
  'search/performAISearch',
  async ({ 
    query, 
    language 
  }: {
    query: string;
    language: 'en' | 'bn';
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/conversational-ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query, language }),
      });
      
      if (!response.ok) {
        throw new Error(`AI search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        conversationalResponse: data.response || data.text || '',
        confidence: data.confidence || 0.9,
        responseType: data.responseType || 'informational',
        sources: data.sources || [],
        followUpQuestions: data.followUpQuestions || [],
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'AI search failed');
    }
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  'search/fetchSuggestions',
  async ({ 
    query, 
    language 
  }: {
    query: string;
    language: 'en' | 'bn';
  }, { rejectWithValue }) => {
    try {
      if (query.length < 2) {
        return [];
      }
      
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&lang=${language}`);
      
      if (!response.ok) {
        throw new Error(`Suggestions failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Suggestions failed');
    }
  }
);

// Cache management helper
const updateCache = (
  cache: SearchCache,
  cacheKey: string,
  results: SearchResult[],
  suggestions: SearchSuggestion[]
): SearchCache => {
  const newCache = { ...cache };
  
  // Add new entry
  newCache[cacheKey] = {
    results,
    suggestions,
    timestamp: Date.now(),
    ttl: 5 * 60 * 1000, // 5 minutes
    hitCount: 0,
  };
  
  // Cleanup old entries (keep max 50 entries)
  const entries = Object.entries(newCache);
  if (entries.length > 50) {
    const sortedEntries = entries.sort(([, a], [, b]) => b.timestamp - a.timestamp);
    const toKeep = sortedEntries.slice(0, 50);
    return Object.fromEntries(toKeep);
  }
  
  return newCache;
};

// Calculate cache hit rate
const calculateCacheHitRate = (cache: SearchCache): number => {
  const entries = Object.values(cache);
  if (entries.length === 0) return 0;
  
  const totalHits = entries.reduce((sum, entry) => sum + entry.hitCount, 0);
  const totalEntries = entries.length;
  
  return totalEntries > 0 ? (totalHits / totalEntries) * 100 : 0;
};

// Slice definition
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Query management
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      
      // Clear suggestions if query is empty
      if (!action.payload.trim()) {
        state.suggestions = [];
        state.showSuggestions = false;
      }
    },
    
    setLanguage: (state, action: PayloadAction<'en' | 'bn'>) => {
      state.language = action.payload;
    },
    
    // Search mode management
    setSearchMode: (state, action: PayloadAction<SearchState['searchMode']>) => {
      state.searchMode = action.payload;
    },
    
    setActiveSection: (state, action: PayloadAction<SearchState['activeSection']>) => {
      state.activeSection = action.payload;
    },
    
    // Filter management
    updateFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      
      // Count active filters
      state.activeFilters = 
        state.filters.category.length +
        (state.filters.priceRange.min !== undefined || state.filters.priceRange.max !== undefined ? 1 : 0) +
        (state.filters.rating > 0 ? 1 : 0) +
        state.filters.vendor.length +
        (state.filters.inStock ? 1 : 0) +
        (state.filters.freeShipping ? 1 : 0);
      
      // Reset to first page when filters change
      state.currentPage = 1;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.activeFilters = 0;
      state.currentPage = 1;
    },
    
    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    
    // UI state
    setShowSuggestions: (state, action: PayloadAction<boolean>) => {
      state.showSuggestions = action.payload;
    },
    
    setShowFilters: (state, action: PayloadAction<boolean>) => {
      state.showFilters = action.payload;
    },
    
    setShowConversationalResponse: (state, action: PayloadAction<boolean>) => {
      state.showConversationalResponse = action.payload;
    },
    
    // History management
    addToHistory: (state, action: PayloadAction<Omit<SearchHistory, 'timestamp'>>) => {
      const historyEntry: SearchHistory = {
        ...action.payload,
        timestamp: Date.now(),
      };
      
      // Remove duplicate if exists
      state.history = state.history.filter(entry => entry.query !== historyEntry.query);
      
      // Add to beginning
      state.history.unshift(historyEntry);
      
      // Limit history size
      if (state.history.length > state.maxHistorySize) {
        state.history = state.history.slice(0, state.maxHistorySize);
      }
    },
    
    clearHistory: (state) => {
      state.history = [];
    },
    
    removeFromHistory: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(entry => entry.query !== action.payload);
    },
    
    // Cache management
    clearCache: (state) => {
      state.cache = {};
      state.cacheHitRate = 0;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.networkError = false;
    },
    
    // Reset search state
    resetSearch: (state) => {
      state.query = '';
      state.results = [];
      state.suggestions = [];
      state.aiResponse = null;
      state.showConversationalResponse = false;
      state.totalResults = 0;
      state.currentPage = 1;
      state.error = null;
      state.activeSection = 'all';
    },
  },
  
  extraReducers: (builder) => {
    // Perform search
    builder
      .addCase(performSearch.pending, (state) => {
        state.isSearching = true;
        state.error = null;
        state.networkError = false;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.isSearching = false;
        state.results = action.payload.results;
        state.suggestions = action.payload.suggestions || [];
        state.totalResults = action.payload.totalResults || action.payload.results.length;
        
        // Update performance metrics
        state.lastSearchTime = action.payload.searchTime;
        state.searchCount += 1;
        state.averageSearchTime = 
          (state.averageSearchTime * (state.searchCount - 1) + action.payload.searchTime) / state.searchCount;
        
        // Update cache if not from cache
        if (!action.payload.fromCache && action.payload.cacheKey) {
          state.cache = updateCache(state.cache, action.payload.cacheKey, action.payload.results, action.payload.suggestions);
        } else if (action.payload.fromCache && action.payload.cacheKey) {
          // Update hit count for cached entry
          if (state.cache[action.payload.cacheKey]) {
            state.cache[action.payload.cacheKey].hitCount += 1;
          }
        }
        
        // Update cache hit rate
        state.cacheHitRate = calculateCacheHitRate(state.cache);
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
        state.networkError = true;
      });
    
    // AI search
    builder
      .addCase(performAISearch.pending, (state) => {
        state.isAISearching = true;
        state.error = null;
      })
      .addCase(performAISearch.fulfilled, (state, action) => {
        state.isAISearching = false;
        state.aiResponse = action.payload;
        state.showConversationalResponse = true;
      })
      .addCase(performAISearch.rejected, (state, action) => {
        state.isAISearching = false;
        state.error = action.payload as string;
      });
    
    // Fetch suggestions
    builder
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
        state.showSuggestions = action.payload.length > 0;
      })
      .addCase(fetchSearchSuggestions.rejected, (state, action) => {
        state.suggestions = [];
        state.showSuggestions = false;
        // Don't set error for suggestions failure - not critical
      });
  },
});

// Export actions
export const {
  setQuery,
  setLanguage,
  setSearchMode,
  setActiveSection,
  updateFilters,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  setShowSuggestions,
  setShowFilters,
  setShowConversationalResponse,
  addToHistory,
  clearHistory,
  removeFromHistory,
  clearCache,
  clearError,
  resetSearch,
} = searchSlice.actions;

// Export slice reducer
export default searchSlice;