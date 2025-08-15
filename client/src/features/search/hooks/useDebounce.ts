/**
 * useDebounce Hook - Debounce values for performance optimization
 * Extracted from AISearchBar for reusability
 */

import { useState, useEffect } from 'react';

export const useDebounce = <T extends unknown>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};