/**
 * useSearchState Hook - Centralized search state management
 * Extracted from AISearchBar for better state handling
 */

import { useReducer, useCallback, useMemo } from 'react';
import { searchReducer, initialSearchState, searchActions, searchSelectors } from '../state/searchReducer';
import type { SearchState, SearchAction } from '../components/AISearchBar/AISearchBar.types';

export const useSearchState = () => {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);

  // CRITICAL FIX: Memoized actions to prevent infinite render loops
  const actions = useMemo(() => ({
    setQuery: (query: string) => dispatch(searchActions.setQuery(query)),
    setSuggestions: (suggestions: SearchState['suggestions']) => dispatch(searchActions.setSuggestions(suggestions)),
    setSearchResults: (results: SearchState['searchResults']) => dispatch(searchActions.setSearchResults(results)),
    setConversationalResponse: (response: string) => dispatch(searchActions.setConversationalResponse(response)),
    setShowSuggestions: (show: boolean) => dispatch(searchActions.setShowSuggestions(show)),
    setIsLoading: (loading: boolean) => dispatch(searchActions.setIsLoading(loading)),
    setIsLoadingSuggestions: (loading: boolean) => dispatch(searchActions.setIsLoadingSuggestions(loading)),
    setIsListening: (listening: boolean) => dispatch(searchActions.setIsListening(listening)),
    setIsRecording: (recording: boolean) => dispatch(searchActions.setIsRecording(recording)),
    setIsProcessingImage: (processing: boolean) => dispatch(searchActions.setIsProcessingImage(processing)),
    setIsProcessingQR: (processing: boolean) => dispatch(searchActions.setIsProcessingQR(processing)),
    setUploadedImage: (image: SearchState['uploadedImage']) => dispatch(searchActions.setUploadedImage(image)),
    setImagePreview: (preview: string | null) => dispatch(searchActions.setImagePreview(preview)),
    setError: (error: string | null) => dispatch(searchActions.setError(error)),
    setSearchType: (searchType: SearchState['searchType']) => dispatch(searchActions.setSearchType(searchType)),
    setLanguage: (language: SearchState['language']) => dispatch(searchActions.setLanguage(language)),
    setShowResults: (show: boolean) => dispatch(searchActions.setShowResults(show)),
    setNavigationResults: (results: SearchState['navigationResults']) => dispatch(searchActions.setNavigationResults(results)),
    clearAll: () => dispatch(searchActions.clearAll()),
  }), [dispatch]);

  // Computed selectors for better performance
  const selectors = {
    getQuery: searchSelectors.getQuery(state),
    getSuggestions: searchSelectors.getSuggestions(state),
    getSearchResults: searchSelectors.getSearchResults(state),
    getProductSuggestions: searchSelectors.getProductSuggestions(state),
    getPageSuggestions: searchSelectors.getPageSuggestions(state),
    getIsLoading: searchSelectors.getIsLoading(state),
    getIsLoadingSuggestions: searchSelectors.getIsLoadingSuggestions(state),
    hasError: searchSelectors.hasError(state),
    getError: searchSelectors.getError(state),
    canSubmit: searchSelectors.canSubmit(state),
    shouldShowSuggestions: searchSelectors.shouldShowSuggestions(state),
  };

  return {
    state,
    dispatch,
    actions,
    selectors,
  };
};