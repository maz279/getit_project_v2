/**
 * useSearchState Hook Unit Tests
 * Phase 6: Comprehensive Testing - Custom Hooks
 */

import { renderHook, act } from '@testing-library/react';
import { useSearchState } from '../../hooks/useSearchState';
import '../setup';

describe('useSearchState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSearchState());

    expect(result.current.state).toMatchObject({
      query: '',
      suggestions: [],
      searchResults: [],
      isLoading: false,
      isLoadingSuggestions: false,
      showSuggestions: false,
      showResults: false,
      error: null,
      searchType: 'text',
      conversationalResponse: '',
      navigationResults: [],
      uploadedImage: null,
    });
  });

  it('should update query correctly', () => {
    const { result } = renderHook(() => useSearchState());

    act(() => {
      result.current.actions.setQuery('laptop');
    });

    expect(result.current.state.query).toBe('laptop');
  });

  it('should set suggestions correctly', () => {
    const { result } = renderHook(() => useSearchState());
    const suggestions = [
      { id: '1', text: 'laptop gaming', type: 'product' as const, frequency: 10 },
      { id: '2', text: 'laptop cheap', type: 'product' as const, frequency: 5 },
    ];

    act(() => {
      result.current.actions.setSuggestions(suggestions);
    });

    expect(result.current.state.suggestions).toEqual(suggestions);
  });

  it('should toggle loading states', () => {
    const { result } = renderHook(() => useSearchState());

    act(() => {
      result.current.actions.setIsLoading(true);
    });

    expect(result.current.state.isLoading).toBe(true);

    act(() => {
      result.current.actions.setIsLoadingSuggestions(true);
    });

    expect(result.current.state.isLoadingSuggestions).toBe(true);
  });

  it('should set and clear errors', () => {
    const { result } = renderHook(() => useSearchState());

    act(() => {
      result.current.actions.setError('Test error');
    });

    expect(result.current.state.error).toBe('Test error');

    act(() => {
      result.current.actions.setError(null);
    });

    expect(result.current.state.error).toBeNull();
  });

  it('should handle search results', () => {
    const { result } = renderHook(() => useSearchState());
    const searchResults = [
      { id: '1', title: 'Test Product', description: 'Test', price: '৳1000' },
    ];

    act(() => {
      result.current.actions.setSearchResults(searchResults);
    });

    expect(result.current.state.searchResults).toEqual(searchResults);
  });

  it('should clear all state', () => {
    const { result } = renderHook(() => useSearchState());

    // Set some state first
    act(() => {
      result.current.actions.setQuery('test');
      result.current.actions.setError('error');
      result.current.actions.setIsLoading(true);
    });

    // Clear all
    act(() => {
      result.current.actions.clearAll();
    });

    expect(result.current.state.query).toBe('');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.suggestions).toEqual([]);
    expect(result.current.state.searchResults).toEqual([]);
  });

  describe('selectors', () => {
    it('should determine if can submit', () => {
      const { result } = renderHook(() => useSearchState());

      // Should not be able to submit with empty query
      expect(result.current.selectors.canSubmit).toBe(false);

      // Should be able to submit with query and not loading
      act(() => {
        result.current.actions.setQuery('test');
      });

      expect(result.current.selectors.canSubmit).toBe(true);

      // Should not be able to submit while loading
      act(() => {
        result.current.actions.setIsLoading(true);
      });

      expect(result.current.selectors.canSubmit).toBe(false);
    });

    it('should determine if should show suggestions', () => {
      const { result } = renderHook(() => useSearchState());

      // Should not show suggestions initially
      expect(result.current.selectors.shouldShowSuggestions).toBe(false);

      // Should show suggestions when enabled and has suggestions
      act(() => {
        result.current.actions.setShowSuggestions(true);
        result.current.actions.setSuggestions([
          { id: '1', text: 'test', type: 'product', frequency: 1 },
        ]);
      });

      expect(result.current.selectors.shouldShowSuggestions).toBe(true);

      // Should not show suggestions if disabled
      act(() => {
        result.current.actions.setShowSuggestions(false);
      });

      expect(result.current.selectors.shouldShowSuggestions).toBe(false);
    });

    it('should check if has content', () => {
      const { result } = renderHook(() => useSearchState());

      // Should not have content initially
      expect(result.current.selectors.hasContent).toBe(false);

      // Should have content with search results
      act(() => {
        result.current.actions.setSearchResults([
          { id: '1', title: 'Test', description: 'Test', price: '৳100' },
        ]);
      });

      expect(result.current.selectors.hasContent).toBe(true);

      // Should have content with conversational response
      act(() => {
        result.current.actions.setSearchResults([]);
        result.current.actions.setConversationalResponse('AI response');
      });

      expect(result.current.selectors.hasContent).toBe(true);
    });

    it('should check for errors', () => {
      const { result } = renderHook(() => useSearchState());

      expect(result.current.selectors.hasError).toBe(false);
      expect(result.current.selectors.getError).toBe('');

      act(() => {
        result.current.actions.setError('Test error');
      });

      expect(result.current.selectors.hasError).toBe(true);
      expect(result.current.selectors.getError).toBe('Test error');
    });
  });

  describe('complex state interactions', () => {
    it('should handle multiple state updates correctly', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.actions.setQuery('laptop');
        result.current.actions.setIsLoadingSuggestions(true);
        result.current.actions.setSuggestions([
          { id: '1', text: 'laptop gaming', type: 'product', frequency: 10 },
        ]);
        result.current.actions.setShowSuggestions(true);
      });

      expect(result.current.state).toMatchObject({
        query: 'laptop',
        isLoadingSuggestions: true,
        suggestions: expect.arrayContaining([
          expect.objectContaining({ text: 'laptop gaming' }),
        ]),
        showSuggestions: true,
      });
    });

    it('should maintain state consistency during search flow', () => {
      const { result } = renderHook(() => useSearchState());

      // Start search
      act(() => {
        result.current.actions.setQuery('test query');
        result.current.actions.setIsLoading(true);
        result.current.actions.setSearchType('text');
      });

      expect(result.current.state.isLoading).toBe(true);
      expect(result.current.state.searchType).toBe('text');

      // Complete search
      act(() => {
        result.current.actions.setSearchResults([
          { id: '1', title: 'Result', description: 'Test', price: '৳100' },
        ]);
        result.current.actions.setConversationalResponse('AI response');
        result.current.actions.setIsLoading(false);
        result.current.actions.setShowResults(true);
      });

      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.showResults).toBe(true);
      expect(result.current.state.searchResults).toHaveLength(1);
      expect(result.current.state.conversationalResponse).toBe('AI response');
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined values gracefully', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.actions.setQuery(null as any);
        result.current.actions.setSuggestions(null as any);
        result.current.actions.setSearchResults(undefined as any);
      });

      // Should handle gracefully without crashing
      expect(result.current.state.query).toBeDefined();
      expect(result.current.state.suggestions).toBeDefined();
      expect(result.current.state.searchResults).toBeDefined();
    });

    it('should handle empty arrays and strings', () => {
      const { result } = renderHook(() => useSearchState());

      act(() => {
        result.current.actions.setQuery('');
        result.current.actions.setSuggestions([]);
        result.current.actions.setSearchResults([]);
        result.current.actions.setConversationalResponse('');
      });

      expect(result.current.selectors.canSubmit).toBe(false);
      expect(result.current.selectors.hasContent).toBe(false);
      expect(result.current.selectors.shouldShowSuggestions).toBe(false);
    });
  });
});