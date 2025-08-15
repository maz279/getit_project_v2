import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useLoading - Advanced Loading State Management Hook
 * Amazon.com/Shopee.sg-Level Loading System with Bangladesh Integration
 */
export const useLoading = (initialKey = 'default') => {
  const { trackUserActivity } = useAuth();
  const [loadingStates, setLoadingStates] = useState({});
  const loadingTimeouts = useRef({});
  const loadingStartTimes = useRef({});
  const loadingMetrics = useRef({
    totalLoadingTime: 0,
    loadingCount: 0,
    averageLoadingTime: 0,
    longestLoadingTime: 0,
    shortestLoadingTime: Infinity,
    loadingHistory: []
  });

  // Global loading state for entire application
  const [globalLoading, setGlobalLoading] = useState(false);

  // Track loading interaction
  const trackLoadingInteraction = useCallback((action, key, duration = null) => {
    trackUserActivity(`loading_${action}`, null, {
      loadingKey: key,
      duration,
      globalLoading,
      activeLoadingStates: Object.keys(loadingStates).filter(k => loadingStates[k]),
      timestamp: new Date().toISOString()
    });
  }, [trackUserActivity, globalLoading, loadingStates]);

  // Set loading state for specific key
  const setLoading = useCallback((key, isLoading, options = {}) => {
    const {
      timeout = null,
      message = '',
      showSpinner = true,
      showOverlay = false,
      blockInteraction = false,
      minDuration = 0, // Minimum duration to show loading
      onTimeout = null,
      priority = 'normal' // low, normal, high, critical
    } = options;

    if (isLoading) {
      // Start loading
      loadingStartTimes.current[key] = performance.now();
      
      setLoadingStates(prev => ({
        ...prev,
        [key]: {
          loading: true,
          message,
          showSpinner,
          showOverlay,
          blockInteraction,
          priority,
          startTime: new Date(),
          timeout: timeout
        }
      }));

      // Set timeout if specified
      if (timeout) {
        loadingTimeouts.current[key] = setTimeout(() => {
          setLoadingStates(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              loading: false,
              timedOut: true
            }
          }));
          
          if (onTimeout) {
            onTimeout();
          }
          
          trackLoadingInteraction('timeout', key, timeout);
        }, timeout);
      }

      trackLoadingInteraction('start', key);
    } else {
      // Stop loading
      const startTime = loadingStartTimes.current[key];
      if (startTime) {
        const duration = performance.now() - startTime;
        
        // Ensure minimum duration if specified
        const actualMinDuration = minDuration || 0;
        const remainingTime = actualMinDuration - duration;
        
        const finishLoading = () => {
          setLoadingStates(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
          });

          // Update metrics
          loadingMetrics.current.totalLoadingTime += duration;
          loadingMetrics.current.loadingCount += 1;
          loadingMetrics.current.averageLoadingTime = 
            loadingMetrics.current.totalLoadingTime / loadingMetrics.current.loadingCount;
          loadingMetrics.current.longestLoadingTime = 
            Math.max(loadingMetrics.current.longestLoadingTime, duration);
          loadingMetrics.current.shortestLoadingTime = 
            Math.min(loadingMetrics.current.shortestLoadingTime, duration);
          
          // Add to history (keep last 20 entries)
          loadingMetrics.current.loadingHistory = [
            ...loadingMetrics.current.loadingHistory.slice(-19),
            {
              key,
              duration,
              timestamp: new Date(),
              message: loadingStates[key]?.message || ''
            }
          ];

          delete loadingStartTimes.current[key];
          trackLoadingInteraction('end', key, duration);
        };

        if (remainingTime > 0) {
          setTimeout(finishLoading, remainingTime);
        } else {
          finishLoading();
        }
      }

      // Clear timeout if exists
      if (loadingTimeouts.current[key]) {
        clearTimeout(loadingTimeouts.current[key]);
        delete loadingTimeouts.current[key];
      }
    }
  }, [trackLoadingInteraction, loadingStates]);

  // Quick access methods for common loading states
  const setGlobalLoadingState = useCallback((isLoading, message = 'Loading...') => {
    setGlobalLoading(isLoading);
    setLoading('global', isLoading, { 
      message, 
      showOverlay: true, 
      blockInteraction: true,
      priority: 'critical'
    });
  }, [setLoading]);

  const setPageLoading = useCallback((isLoading, message = 'Loading page...') => {
    setLoading('page', isLoading, { 
      message, 
      showOverlay: true,
      priority: 'high'
    });
  }, [setLoading]);

  const setComponentLoading = useCallback((component, isLoading, message = '') => {
    setLoading(`component_${component}`, isLoading, { 
      message: message || `Loading ${component}...`,
      priority: 'normal'
    });
  }, [setLoading]);

  const setDataLoading = useCallback((dataType, isLoading, message = '') => {
    setLoading(`data_${dataType}`, isLoading, { 
      message: message || `Loading ${dataType}...`,
      priority: 'normal'
    });
  }, [setLoading]);

  const setFormLoading = useCallback((formName, isLoading, message = '') => {
    setLoading(`form_${formName}`, isLoading, { 
      message: message || `Processing ${formName}...`,
      blockInteraction: true,
      priority: 'high'
    });
  }, [setLoading]);

  // Bangladesh-specific loading states
  const setBkashLoading = useCallback((isLoading) => {
    setLoading('bkash_payment', isLoading, { 
      message: isLoading ? 'বিকাশ পেমেন্ট প্রসেসিং...' : '',
      showSpinner: true,
      priority: 'critical'
    });
  }, [setLoading]);

  const setNagadLoading = useCallback((isLoading) => {
    setLoading('nagad_payment', isLoading, { 
      message: isLoading ? 'নগদ পেমেন্ট প্রসেসিং...' : '',
      showSpinner: true,
      priority: 'critical'
    });
  }, [setLoading]);

  const setRocketLoading = useCallback((isLoading) => {
    setLoading('rocket_payment', isLoading, { 
      message: isLoading ? 'রকেট পেমেন্ট প্রসেসিং...' : '',
      showSpinner: true,
      priority: 'critical'
    });
  }, [setLoading]);

  const setPathaoLoading = useCallback((isLoading) => {
    setLoading('pathao_shipping', isLoading, { 
      message: isLoading ? 'পাঠাও শিপিং রেট গণনা...' : '',
      priority: 'normal'
    });
  }, [setLoading]);

  // Check if specific key is loading
  const isLoading = useCallback((key) => {
    return !!loadingStates[key]?.loading;
  }, [loadingStates]);

  // Check if any loading is active
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(state => state.loading);
  }, [loadingStates]);

  // Get loading message for specific key
  const getLoadingMessage = useCallback((key) => {
    return loadingStates[key]?.message || '';
  }, [loadingStates]);

  // Get all active loading states
  const getActiveLoadingStates = useCallback(() => {
    return Object.entries(loadingStates)
      .filter(([_, state]) => state.loading)
      .map(([key, state]) => ({ key, ...state }));
  }, [loadingStates]);

  // Clear all loading states
  const clearAllLoading = useCallback(() => {
    Object.keys(loadingStates).forEach(key => {
      if (loadingTimeouts.current[key]) {
        clearTimeout(loadingTimeouts.current[key]);
        delete loadingTimeouts.current[key];
      }
    });
    
    setLoadingStates({});
    setGlobalLoading(false);
    loadingStartTimes.current = {};
    
    trackLoadingInteraction('clear_all', 'all');
  }, [loadingStates, trackLoadingInteraction]);

  // Clear specific loading states by pattern
  const clearLoadingByPattern = useCallback((pattern) => {
    const keysToRemove = Object.keys(loadingStates).filter(key => 
      key.includes(pattern) || key.match(new RegExp(pattern))
    );
    
    keysToRemove.forEach(key => {
      setLoading(key, false);
    });
  }, [loadingStates, setLoading]);

  // Loading state with automatic management
  const withLoading = useCallback(async (key, asyncFunction, options = {}) => {
    try {
      setLoading(key, true, options);
      const result = await asyncFunction();
      setLoading(key, false);
      return result;
    } catch (error) {
      setLoading(key, false);
      throw error;
    }
  }, [setLoading]);

  // Get loading statistics
  const getLoadingStats = useCallback(() => {
    return {
      ...loadingMetrics.current,
      currentActiveStates: Object.keys(loadingStates).filter(key => loadingStates[key]?.loading).length,
      isGlobalLoading: globalLoading
    };
  }, [loadingStates, globalLoading]);

  // Get loading state priority
  const getHighestPriority = useCallback(() => {
    const priorities = { low: 1, normal: 2, high: 3, critical: 4 };
    let highest = 0;
    let highestKey = null;
    
    Object.entries(loadingStates).forEach(([key, state]) => {
      if (state.loading) {
        const priority = priorities[state.priority] || 2;
        if (priority > highest) {
          highest = priority;
          highestKey = key;
        }
      }
    });
    
    return { priority: Object.keys(priorities)[highest - 1] || 'normal', key: highestKey };
  }, [loadingStates]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(loadingTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Monitor for long-running loading states
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      Object.entries(loadingStartTimes.current).forEach(([key, startTime]) => {
        const duration = now - startTime;
        
        // Alert for loading states longer than 30 seconds
        if (duration > 30000) {
          console.warn(`Long-running loading state detected: ${key} (${Math.round(duration/1000)}s)`);
          trackLoadingInteraction('long_running', key, duration);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [trackLoadingInteraction]);

  return {
    // Core loading methods
    setLoading,
    isLoading,
    isAnyLoading,
    getLoadingMessage,
    getActiveLoadingStates,
    clearAllLoading,
    clearLoadingByPattern,
    withLoading,

    // Quick access methods
    setGlobalLoadingState,
    setPageLoading,
    setComponentLoading,
    setDataLoading,
    setFormLoading,

    // Bangladesh-specific methods
    setBkashLoading,
    setNagadLoading,
    setRocketLoading,
    setPathaoLoading,

    // State information
    globalLoading,
    loadingStates,
    loadingStats: getLoadingStats(),
    highestPriority: getHighestPriority(),

    // Utility methods
    hasBlockingLoading: Object.values(loadingStates).some(state => state.loading && state.blockInteraction),
    hasOverlayLoading: Object.values(loadingStates).some(state => state.loading && state.showOverlay),
    hasCriticalLoading: Object.values(loadingStates).some(state => state.loading && state.priority === 'critical'),

    // Quick state checks
    isGlobalLoading: globalLoading,
    isPageLoading: isLoading('page'),
    isBkashLoading: isLoading('bkash_payment'),
    isNagadLoading: isLoading('nagad_payment'),
    isRocketLoading: isLoading('rocket_payment'),
    isPathaoLoading: isLoading('pathao_shipping'),

    // Advanced features
    loadingHistory: loadingMetrics.current.loadingHistory,
    averageLoadingTime: loadingMetrics.current.averageLoadingTime,
    totalLoadingCount: loadingMetrics.current.loadingCount,
    
    // Helper methods for components
    getLoadingSpinner: (key) => loadingStates[key]?.showSpinner || false,
    getLoadingOverlay: (key) => loadingStates[key]?.showOverlay || false,
    shouldBlockInteraction: (key) => loadingStates[key]?.blockInteraction || false,
    
    // Bangladesh localization helpers
    getBengaliMessage: (key) => {
      const state = loadingStates[key];
      if (!state) return '';
      
      // Common Bengali loading messages
      const bengaliMessages = {
        'Loading...': 'লোড হচ্ছে...',
        'Please wait...': 'অনুগ্রহ করে অপেক্ষা করুন...',
        'Processing...': 'প্রসেসিং হচ্ছে...',
        'Saving...': 'সেভ হচ্ছে...',
        'Updating...': 'আপডেট হচ্ছে...',
        'Loading products...': 'পণ্য লোড হচ্ছে...',
        'Loading orders...': 'অর্ডার লোড হচ্ছে...'
      };
      
      return bengaliMessages[state.message] || state.message;
    }
  };
};

export default useLoading;