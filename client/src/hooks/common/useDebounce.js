import { useState, useEffect } from 'react';

// useDebounce - Debounce Hook for GetIt Bangladesh
// Amazon.com/Shopee.sg-Level Input Debouncing for Search and Performance

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;