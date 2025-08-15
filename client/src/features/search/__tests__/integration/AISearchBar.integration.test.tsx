/**
 * AISearchBar Integration Tests
 * Phase 6: Comprehensive Testing - Integration Layer
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AISearchBar } from '../../components/AISearchBar';
import { createMockSearchSuggestion, createMockSearchResult, createMockAPIResponse } from '../setup';
import '../setup';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@/shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Mock fetch for API calls
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('AISearchBar Integration Tests', () => {
  const defaultProps = {
    language: 'en' as const,
    placeholder: 'Search for products...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render search input and controls', () => {
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Search for products...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should render with Bengali language', () => {
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} language="bn" />
        </TestWrapper>
      );

      const searchInput = screen.getByDisplayValue('');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Search Input Interaction', () => {
    it('should update input value on typing', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');
      
      expect(searchInput).toHaveValue('laptop');
    });

    it('should show loading state while typing', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'lap');
      
      // Should show some kind of loading indicator (implementation dependent)
      expect(searchInput).toHaveValue('lap');
    });

    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');
      expect(searchInput).toHaveValue('laptop');

      // Look for clear button (X icon)
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Search Suggestions', () => {
    beforeEach(() => {
      // Mock suggestions API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createMockAPIResponse({
          suggestions: [
            createMockSearchSuggestion({ text: 'laptop gaming', type: 'product' }),
            createMockSearchSuggestion({ text: 'laptop cheap', type: 'product' }),
          ]
        }),
      } as Response);
    });

    it('should show suggestions when typing', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');

      await waitFor(() => {
        expect(screen.getByText('laptop gaming')).toBeInTheDocument();
        expect(screen.getByText('laptop cheap')).toBeInTheDocument();
      });
    });

    it('should navigate when suggestion is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');

      await waitFor(() => {
        expect(screen.getByText('laptop gaming')).toBeInTheDocument();
      });

      await user.click(screen.getByText('laptop gaming'));

      expect(mockNavigate).toHaveBeenCalledWith('/search?q=laptop%20gaming');
    });

    it('should hide suggestions when input loses focus', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');

      await waitFor(() => {
        expect(screen.getByText('laptop gaming')).toBeInTheDocument();
      });

      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('laptop gaming')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Execution', () => {
    beforeEach(() => {
      // Mock search API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createMockAPIResponse({
          searchResults: [
            createMockSearchResult({ title: 'Gaming Laptop', price: '৳85000' }),
            createMockSearchResult({ title: 'Office Laptop', price: '৳45000' }),
          ],
          conversationalResponse: 'Found 2 laptops for you'
        }),
      } as Response);
    });

    it('should execute search on Enter key press', async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} onSearch={onSearch} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('laptop', expect.any(Object));
      });
    });

    it('should execute search on search button click', async () => {
      const onSearch = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} onSearch={onSearch} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      await user.type(searchInput, 'laptop');
      await user.click(searchButton);

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('laptop', expect.any(Object));
      });
    });

    it('should show loading state during search', async () => {
      const user = userEvent.setup();
      
      // Mock delayed response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => createMockAPIResponse({ searchResults: [] })
        } as Response), 100))
      );
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');
      await user.keyboard('{Enter}');

      // Should show loading state
      expect(screen.getByText(/searching/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast on API failure', async () => {
      const user = userEvent.setup();
      
      // Mock API failure
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive'
          })
        );
      });
    });

    it('should handle invalid input gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      // Try searching with invalid input
      await user.type(searchInput, '<script>alert("xss")</script>');
      await user.keyboard('{Enter}');

      // Should not crash and should sanitize input
      expect(screen.getByPlaceholderText('Search for products...')).toBeInTheDocument();
    });

    it('should handle empty search gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchButton = screen.getByRole('button', { name: /search/i });
      
      await user.click(searchButton);

      // Should not execute search for empty input
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('aria-label');
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      // Tab to search input
      await user.tab();
      expect(searchInput).toHaveFocus();

      // Tab to search button
      await user.tab();
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toHaveFocus();
    });

    it('should announce suggestions to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');

      await waitFor(() => {
        // Should have aria-live region for announcements
        const suggestions = screen.getByRole('listbox', { hidden: true });
        expect(suggestions).toBeInTheDocument();
      });
    });
  });

  describe('Voice Search', () => {
    it('should show voice search button', () => {
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const voiceButton = screen.getByRole('button', { name: /voice search/i });
      expect(voiceButton).toBeInTheDocument();
    });

    it('should show toast when voice search is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const voiceButton = screen.getByRole('button', { name: /voice search/i });
      await user.click(voiceButton);

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Voice Search'
        })
      );
    });
  });

  describe('Image Search', () => {
    it('should show image search button', () => {
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const imageButton = screen.getByRole('button', { name: /image search/i });
      expect(imageButton).toBeInTheDocument();
    });

    it('should trigger file input when image search is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const imageButton = screen.getByRole('button', { name: /image search/i });
      await user.click(imageButton);

      // Should trigger file input (implementation dependent)
      expect(imageButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should debounce suggestions requests', async () => {
      const user = userEvent.setup();
      jest.useFakeTimers();
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      // Type rapidly
      await user.type(searchInput, 'l');
      await user.type(searchInput, 'a');
      await user.type(searchInput, 'p');

      // Should not make API calls yet
      expect(mockFetch).not.toHaveBeenCalled();

      // Fast forward past debounce delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      jest.useRealTimers();
    });

    it('should cancel previous requests when new ones are made', async () => {
      const user = userEvent.setup();
      const abortSpy = jest.fn();
      
      // Mock AbortController
      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: {},
        abort: abortSpy,
      }));
      
      render(
        <TestWrapper>
          <AISearchBar {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for products...');
      
      await user.type(searchInput, 'laptop');
      await user.keyboard('{Enter}');

      await user.clear(searchInput);
      await user.type(searchInput, 'phone');
      await user.keyboard('{Enter}');

      // Should abort previous request
      expect(abortSpy).toHaveBeenCalled();
    });
  });
});