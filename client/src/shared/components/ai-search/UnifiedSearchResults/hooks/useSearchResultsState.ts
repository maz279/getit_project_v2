/**
 * PHASE 2: SEARCH STATE MANAGEMENT HOOK
 * Centralized state management for search components
 * Date: July 26, 2025
 */

/**
 * PHASE 3: ENHANCED SEARCH STATE MANAGEMENT HOOK
 * Type-safe centralized state management with comprehensive metrics
 * Date: July 26, 2025
 */

import { useState, useCallback } from 'react';
import { SearchState, SearchMetrics, Recommendation, UseSearchStateReturn } from '../types/searchTypes';

export const useSearchState = (): UseSearchStateReturn => {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [groqRecommendations, setGroqRecommendations] = useState<Recommendation[]>([]); // ✅ PHASE 3: Fixed 'any[]' type violation
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [metrics, setMetrics] = useState<SearchMetrics | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  // ✅ PHASE 3: Type-safe callback functions with proper error handling
  const updateMetrics = useCallback((newMetrics: Partial<SearchMetrics>) => {
    setMetrics(prevMetrics => prevMetrics ? { ...prevMetrics, ...newMetrics } : newMetrics as SearchMetrics);
    setLastUpdated(new Date());
  }, []);

  const handleError = useCallback((error: string) => {
    setHasError(true);
    setErrorMessage(error);
    setIsLoading(false);
    setLastUpdated(new Date());
  }, []);

  const clearError = useCallback(() => {
    setHasError(false);
    setErrorMessage(undefined);
  }, []);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setErrorMessage(undefined);
    setMetrics(undefined);
    setGroqRecommendations([]);
    setLoadingRecommendations(false);
    setLastUpdated(new Date());
  }, []);

  // ✅ PHASE 3: Enhanced SearchState with comprehensive type safety
  const searchState: SearchState = {
    activeSection: activeSection as 'all' | 'ai' | 'products' | 'pages' | 'insights' | 'recommendations',
    isLoading,
    hasError,
    groqRecommendations,
    loadingRecommendations,
    metrics,
    errorMessage,
    lastUpdated,
  };

  return {
    searchState,
    setActiveSection,
    setIsLoading,
    setGroqRecommendations,
    setLoadingRecommendations,
    updateMetrics,
    handleError,
    clearError,
    resetState,
  };
};