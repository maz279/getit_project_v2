/**
 * AISearchBar - Refactored Modular Implementation
 * Transformed from 2345-line monolithic component to clean, maintainable architecture
 * Using extracted services, hooks, and utilities for better separation of concerns
 */

import React, { useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Search, Mic, Camera, Brain, QrCode, Loader2, X, Navigation } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Import our modular architecture
import { useDebounce } from '../../hooks/useDebounce';
import { useSearchState } from '../../hooks/useSearchState';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import { SearchApi } from '../../services/api/searchApi';
import { InputValidator } from '../../services/validation/InputValidator';
import { RequestManager } from '../../services/request/RequestManager';
import { SearchAnalyticsService } from '../../services/analytics/SearchAnalyticsService';
import { PerformanceMonitoringService } from '../../services/performance/PerformanceMonitoringService';
import { SEARCH_CONFIG, API_ENDPOINTS, SUPPORTED_LANGUAGES } from '../../constants/searchConstants';
import type { AISearchBarProps, SearchSuggestion, SearchResult } from './AISearchBar.types';

// Import the existing UnifiedSearchResults component
import UnifiedSearchResults from '@/shared/components/ai-search/UnifiedSearchResults';

export const AISearchBar = memo<AISearchBarProps>(({
  onSearch,
  onSearchWithResults,
  onSearchLoading,
  placeholder = 'Search products, categories, or ask questions...',
  language = 'en',
  className = '',
  disabled = false,
}) => {
  // === HOOKS AND STATE ===
  const { state, actions, selectors } = useSearchState();
  const { loadSuggestions, filterSuggestions, cancelRequests, cleanup } = useSearchSuggestions(language);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // === REFS ===
  const inputRef = useRef<HTMLInputElement>(null);
  const requestManagerRef = useRef<RequestManager>(new RequestManager());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // === PHASE 5: SERVICE LAYER INTEGRATION ===
  const analyticsServiceRef = useRef<SearchAnalyticsService>(SearchAnalyticsService.getInstance());
  const performanceServiceRef = useRef<PerformanceMonitoringService>(PerformanceMonitoringService.getInstance());
  
  // === DEBOUNCED VALUES ===
  const debouncedQuery = useDebounce(state.query, SEARCH_CONFIG.DEBOUNCE_DELAY);
  
  // === MEMOIZED COMPUTED VALUES ===
  const productSuggestions = useMemo(() => 
    filterSuggestions.products(state.suggestions), 
    [state.suggestions, filterSuggestions]
  );
  
  const pageSuggestions = useMemo(() => 
    filterSuggestions.pages(state.suggestions), 
    [state.suggestions, filterSuggestions]
  );

  // === SUGGESTION LOADING EFFECT (FIXED: Minimal dependencies to prevent infinite loop) ===
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      loadSuggestions(
        debouncedQuery,
        (suggestions, navigationResults) => {
          actions.setSuggestions(suggestions);
          actions.setShowSuggestions(true);
          if (navigationResults) {
            actions.setNavigationResults(navigationResults);
          }
        },
        (error) => {
          actions.setError(error);
          toast({ title: 'Error', description: error, variant: 'destructive' });
        },
        (loading) => {
          actions.setIsLoadingSuggestions(loading);
        }
      );
    } else {
      actions.setSuggestions([]);
      actions.setShowSuggestions(false);
    }
  }, [debouncedQuery]); // CRITICAL FIX: Only debouncedQuery dependency to prevent infinite loop

  // === EVENT HANDLERS ===
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate for input typing (allow empty input, only check security)
    const validation = InputValidator.validate(value, false);
    
    // Only block dangerous security content during typing, allow all other input
    if (!validation.isValid && validation.risks.some(risk => 
      risk.includes('dangerous content') || risk.includes('injection')
    )) {
      actions.setError(validation.risks[0]);
      return;
    }
    
    actions.setQuery(validation.sanitizedInput);
    actions.setError(null);
  }, [actions]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    const startTime = performance.now();
    
    // Track suggestion interaction
    analyticsServiceRef.current.trackSuggestionEvent(
      state.query,
      suggestion.text,
      suggestion.type,
      state.suggestions.indexOf(suggestion),
      language
    );
    
    if (suggestion.type === 'page' && suggestion.navigationItem) {
      // Navigate to page suggestions
      navigate(suggestion.navigationItem.route);
    } else {
      // Navigate to search results for product suggestions
      navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
    }
    
    // Track performance
    performanceServiceRef.current.trackSearchPerformance('search', startTime, true);
    
    // Clear suggestions and close dropdown
    actions.setSuggestions([]);
    actions.setShowSuggestions(false);
    inputRef.current?.blur();
  }, [navigate, actions, state.query, state.suggestions, language]);

  const performSearch = useCallback(async (searchQuery: string, searchType: string = 'text') => {
    if (!searchQuery.trim()) return;

    const startTime = performance.now();
    actions.setIsLoading(true);
    actions.setSearchType(searchType as any);
    onSearchLoading?.(true);

    try {
      const abortController = requestManagerRef.current.createRequest('search');
      
      // Use performance monitoring for the search operation
      const response = await performanceServiceRef.current.measureAsyncOperation(
        `search-${searchType}`,
        () => SearchApi.performSearch(searchQuery, searchType, language, abortController.signal)
      );

      if (response.success && response.data) {
        const { searchResults, conversationalResponse } = response.data;
        const responseTime = performance.now() - startTime;
        
        // Track successful search analytics
        analyticsServiceRef.current.trackSearchEvent(
          searchQuery,
          searchType as any,
          responseTime,
          searchResults?.length || 0,
          true
        );
        
        actions.setSearchResults(searchResults || []);
        actions.setConversationalResponse(conversationalResponse || '');
        actions.setShowResults(true);
        
        // Call parent callbacks
        onSearch?.(searchQuery, {
          searchResults,
          conversationalResponse,
          navigationResults: state.navigationResults,
        });
        onSearchWithResults?.(searchQuery, searchResults || []);
      } else {
        const errorMessage = response.error || 'Search failed';
        const responseTime = performance.now() - startTime;
        
        // Track failed search analytics
        analyticsServiceRef.current.trackSearchEvent(
          searchQuery,
          searchType as any,
          responseTime,
          0,
          false,
          'search_api_error'
        );
        
        actions.setError(errorMessage);
        toast({ title: 'Search Error', description: errorMessage, variant: 'destructive' });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        const responseTime = performance.now() - startTime;
        const errorMessage = 'Search request failed';
        
        // Track error analytics
        analyticsServiceRef.current.trackSearchEvent(
          searchQuery,
          searchType as any,
          responseTime,
          0,
          false,
          error.name
        );
        
        actions.setError(errorMessage);
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      }
    } finally {
      actions.setIsLoading(false);
      onSearchLoading?.(false);
    }
  }, [actions, language, onSearch, onSearchWithResults, onSearchLoading, state.navigationResults, toast]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate for search submission (enforce minimum length)
    const searchValidation = InputValidator.validate(state.query, true);
    if (!searchValidation.isValid) {
      actions.setError(searchValidation.risks[0]);
      toast({ 
        title: 'Search Error', 
        description: searchValidation.risks[0], 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!selectors.canSubmit) return;
    
    // Close suggestions dropdown and perform search
    actions.setShowSuggestions(false);
    performSearch(state.query.trim());
  }, [selectors.canSubmit, state.query, performSearch, actions]);

  const handleClear = useCallback(() => {
    actions.clearAll();
    inputRef.current?.focus();
  }, [actions]);

  const handleVoiceSearch = useCallback(() => {
    // Voice search implementation would go here
    // For now, just show a placeholder toast
    toast({ title: 'Voice Search', description: 'Voice search functionality will be implemented in Phase 5' });
  }, [toast]);

  const handleImageSearch = useCallback(() => {
    // Image search implementation would go here
    fileInputRef.current?.click();
  }, []);

  const handleQRSearch = useCallback(() => {
    // QR search implementation would go here
    toast({ title: 'QR Search', description: 'QR code search functionality will be implemented in Phase 5' });
  }, [toast]);

  // === CLEANUP ===
  useEffect(() => {
    return () => {
      cleanup();
      requestManagerRef.current.destroy();
      // Services are singletons, so we don't destroy them here
    };
  }, [cleanup]);

  // === PHASE 5: PERFORMANCE MONITORING INTEGRATION ===
  const componentPerformanceTracker = useCallback(<T,>(operation: () => T, operationName: string): T => {
    return performanceServiceRef.current.measureComponentPerformance(
      `AISearchBar-${operationName}`,
      operation
    );
  }, []);

  // === RENDER ===
  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors shadow-lg">
          {/* Search Icon */}
          <Search className="w-5 h-5 text-gray-400 ml-4" />
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={state.query}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled || state.isLoading}
            className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Loading Indicator */}
          {state.isLoadingSuggestions && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin mr-2" />
          )}
          
          {/* Clear Button */}
          {state.query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="mr-2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1 mr-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Voice search"
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImageSearch}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Image search"
            >
              <Camera className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleQRSearch}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="QR code search"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search Button */}
          <Button
            type="submit"
            disabled={!selectors.canSubmit}
            className="mr-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
          >
            {state.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            actions.setUploadedImage(file);
            // Image processing logic would go here
          }
        }}
      />

      {/* Enhanced Intelligent Suggestions Dropdown */}
      {selectors.shouldShowSuggestions && (productSuggestions.length > 0 || pageSuggestions.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-[200] shadow-xl border-0 bg-white dark:bg-gray-800">
          <CardContent className="p-0">
            {/* Product Suggestions Section */}
            {productSuggestions.length > 0 && (
              <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                {productSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-3 transition-all duration-150 border-l-2 border-transparent hover:border-blue-500"
                  >
                    <Search className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-900 dark:text-white font-medium flex-1">
                      {suggestion.text}
                    </span>
                    {suggestion.frequency && suggestion.frequency > 0 && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        Popular
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Page Suggestions Section */}
            {pageSuggestions.length > 0 && (
              <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                {pageSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center space-x-3 transition-all duration-150 border-l-2 border-transparent hover:border-green-500"
                  >
                    <Navigation className="w-4 h-4 text-green-500" />
                    <span className="text-gray-900 dark:text-white font-medium flex-1">
                      {suggestion.text}
                    </span>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                      Navigate
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {selectors.hasError && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{selectors.getError}</p>
        </div>
      )}

      {/* Search Results */}
      {state.showResults && (
        <div className="mt-6">
          <UnifiedSearchResults
            query={state.query}
            searchResults={state.searchResults}
            conversationalResponse={state.conversationalResponse}
            language={language}
            showConversationalResponse={true}
            showNavigationResults={true}
            navigationResults={state.navigationResults}
            showResults={true}
            onClose={() => actions.setShowResults(false)}
            onNavigateToPage={(url: string) => navigate(url)}
          />
        </div>
      )}
    </div>
  );
});

AISearchBar.displayName = 'AISearchBar';