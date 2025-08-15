/**
 * Search State Management - Centralized reducer pattern
 * Extracted from AISearchBar for better state management
 */

import type { SearchState, SearchAction } from '../components/AISearchBar/AISearchBar.types';

// Initial state
export const initialSearchState: SearchState = {
  query: '',
  suggestions: [],
  searchResults: [],
  conversationalResponse: '',
  showSuggestions: false,
  isLoading: false,
  isLoadingSuggestions: false,
  isListening: false,
  isRecording: false,
  isProcessingImage: false,
  isProcessingQR: false,
  uploadedImage: null,
  imagePreview: null,
  lastError: null,
  searchType: 'text',
  language: 'en',
  showResults: false,
  navigationResults: [],
};

// Reducer function - centralized state management
export const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
      
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
      
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
      
    case 'SET_CONVERSATIONAL_RESPONSE':
      return { ...state, conversationalResponse: action.payload };
      
    case 'SET_SHOW_SUGGESTIONS':
      return { ...state, showSuggestions: action.payload };
      
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_IS_LOADING_SUGGESTIONS':
      return { ...state, isLoadingSuggestions: action.payload };
      
    case 'SET_IS_LISTENING':
      return { ...state, isListening: action.payload };
      
    case 'SET_IS_RECORDING':
      return { ...state, isRecording: action.payload };
      
    case 'SET_IS_PROCESSING_IMAGE':
      return { ...state, isProcessingImage: action.payload };
      
    case 'SET_IS_PROCESSING_QR':
      return { ...state, isProcessingQR: action.payload };
      
    case 'SET_UPLOADED_IMAGE':
      return { ...state, uploadedImage: action.payload };
      
    case 'SET_IMAGE_PREVIEW':
      return { ...state, imagePreview: action.payload };
      
    case 'SET_ERROR':
      return { ...state, lastError: action.payload };
      
    case 'SET_SEARCH_TYPE':
      return { ...state, searchType: action.payload };
      
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
      
    case 'SET_SHOW_RESULTS':
      return { ...state, showResults: action.payload };
      
    case 'SET_NAVIGATION_RESULTS':
      return { ...state, navigationResults: action.payload };
      
    case 'CLEAR_ALL':
      return {
        ...initialSearchState,
        language: state.language, // Preserve language setting
      };
      
    default:
      return state;
  }
};

// Action creators for better type safety and reusability
export const searchActions = {
  setQuery: (query: string): SearchAction => ({ type: 'SET_QUERY', payload: query }),
  setSuggestions: (suggestions: SearchState['suggestions']): SearchAction => 
    ({ type: 'SET_SUGGESTIONS', payload: suggestions }),
  setSearchResults: (results: SearchState['searchResults']): SearchAction => 
    ({ type: 'SET_SEARCH_RESULTS', payload: results }),
  setConversationalResponse: (response: string): SearchAction => 
    ({ type: 'SET_CONVERSATIONAL_RESPONSE', payload: response }),
  setShowSuggestions: (show: boolean): SearchAction => 
    ({ type: 'SET_SHOW_SUGGESTIONS', payload: show }),
  setIsLoading: (loading: boolean): SearchAction => 
    ({ type: 'SET_IS_LOADING', payload: loading }),
  setIsLoadingSuggestions: (loading: boolean): SearchAction => 
    ({ type: 'SET_IS_LOADING_SUGGESTIONS', payload: loading }),
  setIsListening: (listening: boolean): SearchAction => 
    ({ type: 'SET_IS_LISTENING', payload: listening }),
  setIsRecording: (recording: boolean): SearchAction => 
    ({ type: 'SET_IS_RECORDING', payload: recording }),
  setIsProcessingImage: (processing: boolean): SearchAction => 
    ({ type: 'SET_IS_PROCESSING_IMAGE', payload: processing }),
  setIsProcessingQR: (processing: boolean): SearchAction => 
    ({ type: 'SET_IS_PROCESSING_QR', payload: processing }),
  setUploadedImage: (image: SearchState['uploadedImage']): SearchAction => 
    ({ type: 'SET_UPLOADED_IMAGE', payload: image }),
  setImagePreview: (preview: string | null): SearchAction => 
    ({ type: 'SET_IMAGE_PREVIEW', payload: preview }),
  setError: (error: string | null): SearchAction => 
    ({ type: 'SET_ERROR', payload: error }),
  setSearchType: (searchType: SearchState['searchType']): SearchAction => 
    ({ type: 'SET_SEARCH_TYPE', payload: searchType }),
  setLanguage: (language: SearchState['language']): SearchAction => 
    ({ type: 'SET_LANGUAGE', payload: language }),
  setShowResults: (show: boolean): SearchAction => 
    ({ type: 'SET_SHOW_RESULTS', payload: show }),
  setNavigationResults: (results: SearchState['navigationResults']): SearchAction => 
    ({ type: 'SET_NAVIGATION_RESULTS', payload: results }),
  clearAll: (): SearchAction => ({ type: 'CLEAR_ALL' }),
};

// Selectors for better state access
export const searchSelectors = {
  getQuery: (state: SearchState) => state.query,
  getSuggestions: (state: SearchState) => state.suggestions,
  getSearchResults: (state: SearchState) => state.searchResults,
  getProductSuggestions: (state: SearchState) => 
    state.suggestions.filter(s => s.type !== 'page'),
  getPageSuggestions: (state: SearchState) => 
    state.suggestions.filter(s => s.type === 'page'),
  getIsLoading: (state: SearchState) => state.isLoading,
  getIsLoadingSuggestions: (state: SearchState) => state.isLoadingSuggestions,
  hasError: (state: SearchState) => !!state.lastError,
  getError: (state: SearchState) => state.lastError,
  canSubmit: (state: SearchState) => 
    state.query.trim().length > 0 && !state.isLoading,
  shouldShowSuggestions: (state: SearchState) => 
    state.showSuggestions && state.suggestions.length > 0 && !state.isLoading,
};