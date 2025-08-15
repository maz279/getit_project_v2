/**
 * Phase 1 Critical Fix: Memory Leak Prevention Hook
 * Comprehensive cleanup management for search components
 * Created: July 21, 2025
 */

import { useRef, useEffect, useCallback } from 'react';

interface CleanupItem {
  type: 'timeout' | 'interval' | 'abortController' | 'eventListener' | 'speechRecognition';
  cleanup: () => void;
  description: string;
}

export const useSearchCleanup = () => {
  const cleanupItems = useRef<CleanupItem[]>([]);

  // Register timeout for cleanup
  const registerTimeout = useCallback((timeoutId: NodeJS.Timeout, description: string = 'timeout') => {
    cleanupItems.current.push({
      type: 'timeout',
      cleanup: () => clearTimeout(timeoutId),
      description
    });
    return timeoutId;
  }, []);

  // Register interval for cleanup
  const registerInterval = useCallback((intervalId: NodeJS.Timeout, description: string = 'interval') => {
    cleanupItems.current.push({
      type: 'interval',
      cleanup: () => clearInterval(intervalId),
      description
    });
    return intervalId;
  }, []);

  // Register AbortController for cleanup
  const registerAbortController = useCallback((controller: AbortController, description: string = 'abort controller') => {
    cleanupItems.current.push({
      type: 'abortController',
      cleanup: () => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      },
      description
    });
    return controller;
  }, []);

  // Register event listener for cleanup
  const registerEventListener = useCallback((
    target: EventTarget, 
    event: string, 
    handler: EventListener, 
    description: string = `${event} listener`
  ) => {
    cleanupItems.current.push({
      type: 'eventListener',
      cleanup: () => target.removeEventListener(event, handler),
      description
    });
    target.addEventListener(event, handler);
  }, []);

  // Register speech recognition for cleanup
  const registerSpeechRecognition = useCallback((
    recognition: SpeechRecognition, 
    description: string = 'speech recognition'
  ) => {
    cleanupItems.current.push({
      type: 'speechRecognition',
      cleanup: () => {
        try {
          recognition.stop();
        } catch (error) {
          console.warn('Error stopping speech recognition:', error);
        }
      },
      description
    });
    return recognition;
  }, []);

  // Create timeout with automatic cleanup
  const createTimeout = useCallback((callback: () => void, delay: number, description?: string) => {
    const timeoutId = setTimeout(callback, delay);
    return registerTimeout(timeoutId, description);
  }, [registerTimeout]);

  // Create interval with automatic cleanup
  const createInterval = useCallback((callback: () => void, delay: number, description?: string) => {
    const intervalId = setInterval(callback, delay);
    return registerInterval(intervalId, description);
  }, [registerInterval]);

  // Create AbortController with automatic cleanup
  const createAbortController = useCallback((description?: string) => {
    const controller = new AbortController();
    return registerAbortController(controller, description);
  }, [registerAbortController]);

  // Manual cleanup function
  const cleanup = useCallback(() => {
    cleanupItems.current.forEach((item, index) => {
      try {
        item.cleanup();
      } catch (error) {
        console.warn(`Cleanup error for ${item.description} (index ${index}):`, error);
      }
    });
    cleanupItems.current = [];
  }, []);

  // Get cleanup stats for debugging
  const getCleanupStats = useCallback(() => {
    const stats = {
      totalItems: cleanupItems.current.length,
      byType: {} as Record<string, number>
    };

    cleanupItems.current.forEach(item => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    });

    return stats;
  }, []);

  // Automatic cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Registration methods
    registerTimeout,
    registerInterval,
    registerAbortController,
    registerEventListener,
    registerSpeechRecognition,
    
    // Creation methods with auto-cleanup
    createTimeout,
    createInterval,
    createAbortController,
    
    // Manual cleanup
    cleanup,
    
    // Debug utilities
    getCleanupStats
  };
};

// Custom hook for fetch requests with automatic cleanup
export const useCleanupFetch = () => {
  const { createAbortController } = useSearchCleanup();

  const cleanupFetch = useCallback(async (
    url: string, 
    options: RequestInit = {},
    description?: string
  ): Promise<Response> => {
    const controller = createAbortController(description || `fetch ${url}`);
    
    const fetchOptions: RequestInit = {
      ...options,
      signal: controller.signal
    };

    try {
      const response = await fetch(url, fetchOptions);
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`Fetch aborted: ${url}`);
      }
      throw error;
    }
  }, [createAbortController]);

  return { cleanupFetch };
};

// Custom hook for timer-based operations
export const useCleanupTimer = () => {
  const { createTimeout, createInterval } = useSearchCleanup();

  const debounce = useCallback((
    callback: () => void, 
    delay: number, 
    description?: string
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = createTimeout(callback, delay, description || 'debounce timer');
    };
  }, [createTimeout]);

  const throttle = useCallback((
    callback: () => void, 
    delay: number, 
    description?: string
  ) => {
    let lastCall = 0;
    
    return () => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        callback();
      }
    };
  }, []);

  return { debounce, throttle };
};