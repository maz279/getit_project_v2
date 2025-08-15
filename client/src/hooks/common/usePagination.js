import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * usePagination - Advanced Pagination Management Hook
 * Amazon.com/Shopee.sg-Level Pagination System with Bangladesh Integration
 */
export const usePagination = (initialConfig = {}) => {
  const { trackUserActivity } = useAuth();
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    isLoading: false,
    error: null,
    
    // Configuration
    config: {
      pageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
      maxVisiblePages: 5,
      showFirstLast: true,
      showPrevNext: true,
      showPageNumbers: true,
      showPageSizeSelector: true,
      showTotalCount: true,
      showCurrentRange: true,
      enableKeyboardNavigation: true,
      autoScrollToTop: true,
      persistState: false, // Save state in localStorage
      storageKey: 'pagination_state',
      ...initialConfig
    },
    
    // Data management
    items: [],
    selectedItems: [],
    itemsPerPageOptions: [10, 20, 50, 100],
    
    // Bangladesh-specific settings
    bangladeshSettings: {
      bengaliNumbers: false,
      localDateFormat: true,
      enableRTL: false
    },
    
    // Advanced features
    virtualScrolling: false,
    infiniteScroll: false,
    lazyLoading: false,
    prefetchNext: false,
    
    // Performance tracking
    loadTimes: [],
    averageLoadTime: 0,
    lastLoadTime: null
  });

  // Initialize from localStorage if persistence is enabled
  useEffect(() => {
    if (paginationState.config.persistState) {
      const savedState = localStorage.getItem(paginationState.config.storageKey);
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setPaginationState(prev => ({
            ...prev,
            currentPage: parsedState.currentPage || 1,
            pageSize: parsedState.pageSize || prev.config.pageSize
          }));
        } catch (error) {
          console.error('Failed to load pagination state:', error);
        }
      }
    }
  }, [paginationState.config.persistState, paginationState.config.storageKey]);

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (paginationState.config.persistState) {
      const stateToSave = {
        currentPage: paginationState.currentPage,
        pageSize: paginationState.pageSize,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(paginationState.config.storageKey, JSON.stringify(stateToSave));
    }
  }, [paginationState.config.persistState, paginationState.config.storageKey, paginationState.currentPage, paginationState.pageSize]);

  // Track pagination interaction
  const trackPaginationInteraction = useCallback((action, data = {}) => {
    trackUserActivity(`pagination_${action}`, null, {
      currentPage: paginationState.currentPage,
      pageSize: paginationState.pageSize,
      totalItems: paginationState.totalItems,
      timestamp: new Date().toISOString(),
      ...data
    });
  }, [trackUserActivity, paginationState.currentPage, paginationState.pageSize, paginationState.totalItems]);

  // Go to specific page
  const goToPage = useCallback((page) => {
    if (page < 1 || page > paginationState.totalPages || page === paginationState.currentPage) {
      return false;
    }

    const startTime = performance.now();

    setPaginationState(prev => ({
      ...prev,
      currentPage: page,
      isLoading: true,
      error: null,
      hasPreviousPage: page > 1,
      hasNextPage: page < prev.totalPages
    }));

    // Auto scroll to top if enabled
    if (paginationState.config.autoScrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Track page change
    trackPaginationInteraction('page_changed', { 
      from: paginationState.currentPage, 
      to: page 
    });

    // Save state
    saveState();

    // Record load time
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    setPaginationState(prev => ({
      ...prev,
      isLoading: false,
      loadTimes: [...prev.loadTimes.slice(-9), loadTime], // Keep last 10 load times
      averageLoadTime: [...prev.loadTimes.slice(-9), loadTime].reduce((a, b) => a + b, 0) / Math.min(prev.loadTimes.length + 1, 10),
      lastLoadTime: new Date()
    }));

    return true;
  }, [paginationState.currentPage, paginationState.totalPages, paginationState.config.autoScrollToTop, trackPaginationInteraction, saveState]);

  // Go to next page
  const nextPage = useCallback(() => {
    return goToPage(paginationState.currentPage + 1);
  }, [paginationState.currentPage, goToPage]);

  // Go to previous page
  const previousPage = useCallback(() => {
    return goToPage(paginationState.currentPage - 1);
  }, [paginationState.currentPage, goToPage]);

  // Go to first page
  const firstPage = useCallback(() => {
    return goToPage(1);
  }, [goToPage]);

  // Go to last page
  const lastPage = useCallback(() => {
    return goToPage(paginationState.totalPages);
  }, [paginationState.totalPages, goToPage]);

  // Change page size
  const changePageSize = useCallback((newSize) => {
    if (!paginationState.config.pageSizeOptions.includes(newSize)) {
      return false;
    }

    // Calculate what the new current page should be to maintain position
    const currentItemIndex = (paginationState.currentPage - 1) * paginationState.pageSize;
    const newCurrentPage = Math.floor(currentItemIndex / newSize) + 1;

    setPaginationState(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: newCurrentPage,
      totalPages: Math.ceil(prev.totalItems / newSize),
      hasNextPage: newCurrentPage < Math.ceil(prev.totalItems / newSize),
      hasPreviousPage: newCurrentPage > 1
    }));

    // Track page size change
    trackPaginationInteraction('page_size_changed', { 
      from: paginationState.pageSize, 
      to: newSize 
    });

    // Save state
    saveState();

    return true;
  }, [paginationState.config.pageSizeOptions, paginationState.currentPage, paginationState.pageSize, trackPaginationInteraction, saveState]);

  // Set total items (usually called when data is loaded)
  const setTotalItems = useCallback((total) => {
    const newTotalPages = Math.ceil(total / paginationState.pageSize);
    
    setPaginationState(prev => ({
      ...prev,
      totalItems: total,
      totalPages: newTotalPages,
      hasNextPage: prev.currentPage < newTotalPages,
      hasPreviousPage: prev.currentPage > 1
    }));
  }, [paginationState.pageSize]);

  // Set loading state
  const setLoading = useCallback((loading) => {
    setPaginationState(prev => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  // Set error state
  const setError = useCallback((error) => {
    setPaginationState(prev => ({
      ...prev,
      error,
      isLoading: false
    }));
  }, []);

  // Reset pagination
  const reset = useCallback(() => {
    setPaginationState(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      isLoading: false,
      error: null,
      items: [],
      selectedItems: []
    }));

    // Clear saved state
    if (paginationState.config.persistState) {
      localStorage.removeItem(paginationState.config.storageKey);
    }
  }, [paginationState.config.persistState, paginationState.config.storageKey]);

  // Handle keyboard navigation
  const handleKeyPress = useCallback((event) => {
    if (!paginationState.config.enableKeyboardNavigation) return;

    switch (event.key) {
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          previousPage();
        }
        break;
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          nextPage();
        }
        break;
      case 'Home':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          firstPage();
        }
        break;
      case 'End':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          lastPage();
        }
        break;
    }
  }, [paginationState.config.enableKeyboardNavigation, previousPage, nextPage, firstPage, lastPage]);

  // Set up keyboard listeners
  useEffect(() => {
    if (paginationState.config.enableKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [paginationState.config.enableKeyboardNavigation, handleKeyPress]);

  // Generate page numbers for display
  const getVisiblePages = useCallback(() => {
    const { maxVisiblePages } = paginationState.config;
    const { currentPage, totalPages } = paginationState;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [paginationState.config.maxVisiblePages, paginationState.currentPage, paginationState.totalPages]);

  // Get current page data slice
  const getCurrentPageData = useCallback((data) => {
    if (!Array.isArray(data)) return [];
    
    const startIndex = (paginationState.currentPage - 1) * paginationState.pageSize;
    const endIndex = startIndex + paginationState.pageSize;
    
    return data.slice(startIndex, endIndex);
  }, [paginationState.currentPage, paginationState.pageSize]);

  // Format numbers for Bangladesh localization
  const formatNumber = useCallback((number) => {
    if (paginationState.bangladeshSettings.bengaliNumbers) {
      const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return number.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
    }
    return number.toLocaleString();
  }, [paginationState.bangladeshSettings.bengaliNumbers]);

  // Computed values
  const startItem = useMemo(() => {
    return paginationState.totalItems > 0 ? (paginationState.currentPage - 1) * paginationState.pageSize + 1 : 0;
  }, [paginationState.currentPage, paginationState.pageSize, paginationState.totalItems]);

  const endItem = useMemo(() => {
    return Math.min(paginationState.currentPage * paginationState.pageSize, paginationState.totalItems);
  }, [paginationState.currentPage, paginationState.pageSize, paginationState.totalItems]);

  const progress = useMemo(() => {
    return paginationState.totalPages > 0 ? (paginationState.currentPage / paginationState.totalPages) * 100 : 0;
  }, [paginationState.currentPage, paginationState.totalPages]);

  const canGoNext = useMemo(() => {
    return paginationState.hasNextPage && !paginationState.isLoading;
  }, [paginationState.hasNextPage, paginationState.isLoading]);

  const canGoPrevious = useMemo(() => {
    return paginationState.hasPreviousPage && !paginationState.isLoading;
  }, [paginationState.hasPreviousPage, paginationState.isLoading]);

  return {
    // State
    currentPage: paginationState.currentPage,
    pageSize: paginationState.pageSize,
    totalItems: paginationState.totalItems,
    totalPages: paginationState.totalPages,
    hasNextPage: paginationState.hasNextPage,
    hasPreviousPage: paginationState.hasPreviousPage,
    isLoading: paginationState.isLoading,
    error: paginationState.error,
    config: paginationState.config,
    
    // Navigation methods
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changePageSize,
    
    // Data management
    setTotalItems,
    setLoading,
    setError,
    reset,
    getCurrentPageData,
    
    // Utility methods
    getVisiblePages,
    formatNumber,
    
    // Computed values
    startItem,
    endItem,
    progress,
    canGoNext,
    canGoPrevious,
    isEmpty: paginationState.totalItems === 0,
    isSinglePage: paginationState.totalPages <= 1,
    isFirstPage: paginationState.currentPage === 1,
    isLastPage: paginationState.currentPage === paginationState.totalPages,
    
    // Display helpers
    visiblePages: getVisiblePages(),
    showFirstLast: paginationState.config.showFirstLast && paginationState.totalPages > paginationState.config.maxVisiblePages,
    showPrevNext: paginationState.config.showPrevNext,
    showPageNumbers: paginationState.config.showPageNumbers,
    showPageSizeSelector: paginationState.config.showPageSizeSelector,
    showTotalCount: paginationState.config.showTotalCount,
    showCurrentRange: paginationState.config.showCurrentRange,
    
    // Performance metrics
    averageLoadTime: paginationState.averageLoadTime,
    lastLoadTime: paginationState.lastLoadTime,
    
    // Bangladesh-specific features
    bengaliNumbers: paginationState.bangladeshSettings.bengaliNumbers,
    localDateFormat: paginationState.bangladeshSettings.localDateFormat,
    enableRTL: paginationState.bangladeshSettings.enableRTL,
    
    // Quick access methods
    jumpToStart: firstPage,
    jumpToEnd: lastPage,
    refreshCurrentPage: () => goToPage(paginationState.currentPage),
    
    // Advanced features
    enableInfiniteScroll: () => setPaginationState(prev => ({ ...prev, infiniteScroll: true })),
    enableVirtualScrolling: () => setPaginationState(prev => ({ ...prev, virtualScrolling: true })),
    enableLazyLoading: () => setPaginationState(prev => ({ ...prev, lazyLoading: true })),
    
    // State information
    isValid: paginationState.currentPage > 0 && paginationState.currentPage <= paginationState.totalPages,
    hasData: paginationState.totalItems > 0,
    needsPagination: paginationState.totalItems > paginationState.pageSize
  };
};

export default usePagination;