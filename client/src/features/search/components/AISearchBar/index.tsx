/**
 * AISearchBar Main Export
 * Simplified entry point for the refactored modular AISearchBar
 */

export { AISearchBar } from './AISearchBar';
export { AISearchBar as default } from './AISearchBar';
export type { AISearchBarProps } from './AISearchBar.types';

// Re-export commonly used types for convenience
export type {
  SearchSuggestion,
  SearchResult,
  SearchType,
  Language,
  SearchState,
  SearchAction,
} from './AISearchBar.types';