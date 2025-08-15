/**
 * useDebounce Hook Unit Tests
 * Phase 6: Comprehensive Testing - Debounce Logic
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';
import { setupMockTimers } from '../setup';

describe('useDebounce', () => {
  let cleanupTimers: () => void;

  beforeEach(() => {
    cleanupTimers = setupMockTimers();
  });

  afterEach(() => {
    cleanupTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed', delay: 300 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast forward time by less than delay
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast forward past the delay
    act(() => {
      jest.advanceTimersByTime(150); // Total: 350ms
    });

    // Value should now be updated
    expect(result.current).toBe('changed');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // First change
    rerender({ value: 'change1', delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Second change before first timer completes
    rerender({ value: 'change2', delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Third change before second timer completes
    rerender({ value: 'final', delay: 300 });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast forward past delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should get the final value, not intermediate ones
    expect(result.current).toBe('final');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    rerender({ value: 'changed', delay: 100 });

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(60); // Total: 110ms
    });
    expect(result.current).toBe('changed');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'changed', delay: 0 });

    // With zero delay, should update on next tick
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe('changed');
  });

  it('should handle dynamic delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'changed', delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Change delay while timer is running
    rerender({ value: 'changed', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(300); // Total: 400ms from original change
    });

    // Should still be initial because delay was extended
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(200); // Total: 600ms
    });

    // Now should be updated
    expect(result.current).toBe('changed');
  });

  it('should work with different data types', () => {
    // Test with numbers
    const { result: numberResult, rerender: rerenderNumber } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );

    rerenderNumber({ value: 42, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(numberResult.current).toBe(42);

    // Test with objects
    const { result: objectResult, rerender: rerenderObject } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: { count: 0 }, delay: 300 } }
    );

    const newObject = { count: 1 };
    rerenderObject({ value: newObject, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(objectResult.current).toBe(newObject);

    // Test with arrays
    const { result: arrayResult, rerender: rerenderArray } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: [], delay: 300 } }
    );

    const newArray = [1, 2, 3];
    rerenderArray({ value: newArray, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(arrayResult.current).toBe(newArray);
  });

  it('should cleanup timer on unmount', () => {
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'changed', delay: 300 });

    // Unmount before timer completes
    unmount();

    // Timer should be cleaned up (no errors or memory leaks)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // No assertions needed - just ensuring no errors occur
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null, delay: 300 } }
    );

    expect(result.current).toBe(null);

    rerender({ value: undefined, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(undefined);

    rerender({ value: 'actual value', delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('actual value');
  });

  it('should handle very long delays', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 10000 } }
    );

    rerender({ value: 'changed', delay: 10000 });

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current).toBe('changed');
  });

  it('should be stable across re-renders with same values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'stable', delay: 300 } }
    );

    const firstResult = result.current;

    // Re-render with same values
    rerender({ value: 'stable', delay: 300 });

    expect(result.current).toBe(firstResult);
    expect(result.current).toBe('stable');
  });
});