/**
 * Performance Optimization Hook - Amazon.com Response Time Standards
 * Phase 3: Performance & Mobile Optimization Implementation
 * 
 * Target: <10ms P95 Response Time, Optimized Bundle Loading
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceConfig {
  enableMetrics: boolean;
  enableOptimization: boolean;
  targetResponseTime: number;
  bundleOptimization: boolean;
  imageOptimization: boolean;
  cacheOptimization: boolean;
  lazyLoading: boolean;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  tti: number; // Time to Interactive
  
  // Custom metrics
  renderTime: number;
  bundleLoadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  
  // Performance scores
  performanceScore: number;
  optimizationScore: number;
}

export interface OptimizationState {
  isOptimizing: boolean;
  optimizationsApplied: string[];
  performanceGain: number;
  lastOptimization: Date | null;
}

export interface ResourceHint {
  type: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch';
  href: string;
  as?: string;
  crossorigin?: boolean;
}

/**
 * Performance Optimization Hook
 * Provides comprehensive performance monitoring and optimization
 */
export function usePerformanceOptimization(config: Partial<PerformanceConfig> = {}) {
  const defaultConfig: PerformanceConfig = {
    enableMetrics: true,
    enableOptimization: true,
    targetResponseTime: 10,
    bundleOptimization: true,
    imageOptimization: true,
    cacheOptimization: true,
    lazyLoading: true,
    ...config
  };

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    tti: 0,
    renderTime: 0,
    bundleLoadTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    performanceScore: 0,
    optimizationScore: 0
  });

  const [optimizationState, setOptimizationState] = useState<OptimizationState>({
    isOptimizing: false,
    optimizationsApplied: [],
    performanceGain: 0,
    lastOptimization: null
  });

  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const metricsHistory = useRef<PerformanceMetrics[]>([]);
  const apiTimings = useRef<Map<string, number[]>>(new Map());
  const renderTimings = useRef<number[]>([]);

  /**
   * Core Web Vitals Measurement
   */
  const measureCoreWebVitals = useCallback(() => {
    if (!defaultConfig.enableMetrics) return;

    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          setMetrics(prev => {
            const updated = { ...prev };
            
            switch (entry.entryType) {
              case 'paint':
                if (entry.name === 'first-contentful-paint') {
                  updated.fcp = entry.startTime;
                }
                break;
                
              case 'largest-contentful-paint':
                updated.lcp = entry.startTime;
                break;
                
              case 'first-input':
                updated.fid = entry.processingStart - entry.startTime;
                break;
                
              case 'layout-shift':
                if (!(entry as any).hadRecentInput) {
                  updated.cls += (entry as any).value;
                }
                break;
                
              case 'navigation':
                const navEntry = entry as PerformanceNavigationTiming;
                updated.ttfb = navEntry.responseStart - navEntry.requestStart;
                updated.bundleLoadTime = navEntry.loadEventEnd - navEntry.navigationStart;
                break;
                
              case 'measure':
                if (entry.name.startsWith('render-')) {
                  renderTimings.current.push(entry.duration);
                  const avgRenderTime = renderTimings.current.reduce((a, b) => a + b, 0) / renderTimings.current.length;
                  updated.renderTime = avgRenderTime;
                  
                  // Keep only last 100 render timings
                  if (renderTimings.current.length > 100) {
                    renderTimings.current = renderTimings.current.slice(-50);
                  }
                }
                break;
            }
            
            // Calculate performance score
            updated.performanceScore = calculatePerformanceScore(updated);
            
            return updated;
          });
        });
      });

      try {
        performanceObserver.current.observe({
          entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation', 'measure']
        });
      } catch (error) {
        console.warn('Some performance metrics not available:', error);
      }
    }

    // TTI calculation using polyfill approach
    const calculateTTI = () => {
      if ('PerformanceLongTaskTiming' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            setMetrics(prev => ({
              ...prev,
              tti: lastEntry.startTime + lastEntry.duration
            }));
          }
        });

        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (error) {
          console.warn('Long task timing not available:', error);
        }
      }
    };

    calculateTTI();
  }, [defaultConfig.enableMetrics]);

  /**
   * Memory Usage Monitoring
   */
  const monitorMemoryUsage = useCallback(() => {
    if (!defaultConfig.enableMetrics) return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage
        }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, [defaultConfig.enableMetrics]);

  /**
   * API Response Time Tracking
   */
  const trackApiCall = useCallback((endpoint: string, startTime: number, endTime: number) => {
    const duration = endTime - startTime;
    
    if (!apiTimings.current.has(endpoint)) {
      apiTimings.current.set(endpoint, []);
    }
    
    const timings = apiTimings.current.get(endpoint)!;
    timings.push(duration);
    
    // Keep only last 50 timings per endpoint
    if (timings.length > 50) {
      apiTimings.current.set(endpoint, timings.slice(-25));
    }
    
    // Calculate average API response time
    const allTimings: number[] = [];
    apiTimings.current.forEach(times => allTimings.push(...times));
    const avgResponseTime = allTimings.reduce((a, b) => a + b, 0) / allTimings.length;
    
    setMetrics(prev => ({
      ...prev,
      apiResponseTime: avgResponseTime
    }));
  }, []);

  /**
   * Render Performance Measurement
   */
  const measureRender = useCallback((componentName: string, renderFunction: () => void) => {
    if (!defaultConfig.enableMetrics) return renderFunction();

    const startTime = performance.now();
    
    performance.mark(`render-${componentName}-start`);
    const result = renderFunction();
    performance.mark(`render-${componentName}-end`);
    
    performance.measure(
      `render-${componentName}`,
      `render-${componentName}-start`,
      `render-${componentName}-end`
    );
    
    return result;
  }, [defaultConfig.enableMetrics]);

  /**
   * Resource Hints Management
   */
  const addResourceHint = useCallback((hint: ResourceHint) => {
    const link = document.createElement('link');
    link.rel = hint.type;
    link.href = hint.href;
    
    if (hint.as) link.setAttribute('as', hint.as);
    if (hint.crossorigin) link.setAttribute('crossorigin', '');
    
    document.head.appendChild(link);
  }, []);

  const preloadCriticalResources = useCallback((resources: string[]) => {
    resources.forEach(resource => {
      addResourceHint({
        type: 'preload',
        href: resource,
        as: resource.endsWith('.css') ? 'style' : 'script'
      });
    });
  }, [addResourceHint]);

  const prefetchNextPageResources = useCallback((resources: string[]) => {
    resources.forEach(resource => {
      addResourceHint({
        type: 'prefetch',
        href: resource
      });
    });
  }, [addResourceHint]);

  /**
   * Bundle Optimization
   */
  const optimizeBundle = useCallback(async () => {
    if (!defaultConfig.bundleOptimization) return;

    setOptimizationState(prev => ({
      ...prev,
      isOptimizing: true
    }));

    const optimizations: string[] = [];

    try {
      // Dynamic import optimization
      if ('import' in window) {
        optimizations.push('Dynamic Imports Enabled');
      }

      // Code splitting detection
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const hasCodeSplitting = scripts.some(script => 
        (script as HTMLScriptElement).src.includes('chunk')
      );
      
      if (hasCodeSplitting) {
        optimizations.push('Code Splitting Active');
      }

      // Compression detection
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const encoding = response.headers.get('content-encoding');
      
      if (encoding?.includes('gzip') || encoding?.includes('br')) {
        optimizations.push('Compression Enabled');
      }

      setOptimizationState(prev => ({
        ...prev,
        optimizationsApplied: [...prev.optimizationsApplied, ...optimizations],
        lastOptimization: new Date()
      }));

    } catch (error) {
      console.warn('Bundle optimization check failed:', error);
    } finally {
      setOptimizationState(prev => ({
        ...prev,
        isOptimizing: false
      }));
    }
  }, [defaultConfig.bundleOptimization]);

  /**
   * Image Optimization
   */
  const optimizeImages = useCallback(() => {
    if (!defaultConfig.imageOptimization) return;

    const images = document.querySelectorAll('img');
    let optimizationCount = 0;

    images.forEach(img => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
        optimizationCount++;
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
        optimizationCount++;
      }

      // Optimize src for WebP support
      if ('WebP' in window && !img.src.includes('.webp')) {
        const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Test if WebP version exists
        const testImg = new Image();
        testImg.onload = () => {
          img.src = webpSrc;
          optimizationCount++;
        };
        testImg.src = webpSrc;
      }
    });

    if (optimizationCount > 0) {
      setOptimizationState(prev => ({
        ...prev,
        optimizationsApplied: [...prev.optimizationsApplied, `Image Optimization (${optimizationCount} images)`]
      }));
    }
  }, [defaultConfig.imageOptimization]);

  /**
   * Cache Optimization
   */
  const optimizeCache = useCallback(() => {
    if (!defaultConfig.cacheOptimization) return;

    // Service Worker cache optimization
    if ('serviceWorker' in navigator && 'caches' in window) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'OPTIMIZE_CACHE'
          });
        }
      });
    }

    // Local storage optimization
    try {
      const localStorage = window.localStorage;
      const storageUsage = new Blob(Object.values(localStorage)).size;
      const maxStorage = 10 * 1024 * 1024; // 10MB
      
      if (storageUsage > maxStorage * 0.8) {
        // Clear old cache entries
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith('cache_'));
        
        cacheKeys.sort().slice(0, Math.floor(cacheKeys.length / 2)).forEach(key => {
          localStorage.removeItem(key);
        });
        
        setOptimizationState(prev => ({
          ...prev,
          optimizationsApplied: [...prev.optimizationsApplied, 'Local Storage Cleanup']
        }));
      }
    } catch (error) {
      console.warn('Cache optimization failed:', error);
    }
  }, [defaultConfig.cacheOptimization]);

  /**
   * Performance Score Calculation
   */
  const calculatePerformanceScore = useCallback((currentMetrics: PerformanceMetrics): number => {
    const weights = {
      fcp: 0.15,
      lcp: 0.25,
      fid: 0.15,
      cls: 0.15,
      ttfb: 0.10,
      tti: 0.20
    };

    // Score each metric (0-100)
    const fcpScore = Math.max(0, 100 - (currentMetrics.fcp / 18)); // 1.8s target
    const lcpScore = Math.max(0, 100 - (currentMetrics.lcp / 25)); // 2.5s target
    const fidScore = Math.max(0, 100 - (currentMetrics.fid / 1)); // 100ms target
    const clsScore = Math.max(0, 100 - (currentMetrics.cls * 1000)); // 0.1 target
    const ttfbScore = Math.max(0, 100 - (currentMetrics.ttfb / 6)); // 600ms target
    const ttiScore = Math.max(0, 100 - (currentMetrics.tti / 38)); // 3.8s target

    const totalScore = 
      fcpScore * weights.fcp +
      lcpScore * weights.lcp +
      fidScore * weights.fid +
      clsScore * weights.cls +
      ttfbScore * weights.ttfb +
      ttiScore * weights.tti;

    return Math.round(totalScore);
  }, []);

  /**
   * Automatic Optimization
   */
  const runOptimizations = useCallback(async () => {
    if (!defaultConfig.enableOptimization || optimizationState.isOptimizing) return;

    setOptimizationState(prev => ({
      ...prev,
      isOptimizing: true,
      optimizationsApplied: []
    }));

    const beforeScore = metrics.performanceScore;

    try {
      await optimizeBundle();
      optimizeImages();
      optimizeCache();

      // Wait for metrics to update
      setTimeout(() => {
        setOptimizationState(prev => ({
          ...prev,
          isOptimizing: false,
          performanceGain: metrics.performanceScore - beforeScore,
          lastOptimization: new Date()
        }));
      }, 1000);

    } catch (error) {
      console.error('Optimization failed:', error);
      setOptimizationState(prev => ({
        ...prev,
        isOptimizing: false
      }));
    }
  }, [
    defaultConfig.enableOptimization,
    optimizationState.isOptimizing,
    metrics.performanceScore,
    optimizeBundle,
    optimizeImages,
    optimizeCache
  ]);

  /**
   * Performance Monitoring
   */
  const startPerformanceMonitoring = useCallback(() => {
    if (!defaultConfig.enableMetrics) return;

    // Store metrics history
    const storeMetrics = () => {
      metricsHistory.current.push({ ...metrics });
      
      // Keep only last 100 entries
      if (metricsHistory.current.length > 100) {
        metricsHistory.current = metricsHistory.current.slice(-50);
      }
    };

    const interval = setInterval(storeMetrics, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [defaultConfig.enableMetrics, metrics]);

  // Initialize performance monitoring
  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    measureCoreWebVitals();
    
    const memoryCleanup = monitorMemoryUsage();
    if (memoryCleanup) cleanupFunctions.push(memoryCleanup);

    const monitoringCleanup = startPerformanceMonitoring();
    if (monitoringCleanup) cleanupFunctions.push(monitoringCleanup);

    // Run initial optimizations
    setTimeout(runOptimizations, 1000);

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, [measureCoreWebVitals, monitorMemoryUsage, startPerformanceMonitoring, runOptimizations]);

  return {
    // Current metrics
    metrics,
    optimizationState,
    
    // Performance functions
    trackApiCall,
    measureRender,
    runOptimizations,
    
    // Resource management
    preloadCriticalResources,
    prefetchNextPageResources,
    addResourceHint,
    
    // Optimization functions
    optimizeBundle,
    optimizeImages,
    optimizeCache,
    
    // Computed values
    isPerformant: metrics.performanceScore >= 90,
    needsOptimization: metrics.performanceScore < 70,
    responseTimeStatus: metrics.apiResponseTime <= defaultConfig.targetResponseTime ? 'excellent' : 
                       metrics.apiResponseTime <= defaultConfig.targetResponseTime * 2 ? 'good' : 'poor',
    
    // Performance insights
    getPerformanceInsights: () => ({
      score: metrics.performanceScore,
      coreWebVitals: {
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls
      },
      optimizationsSuggested: metrics.performanceScore < 85 ? [
        'Enable code splitting',
        'Optimize images',
        'Implement lazy loading',
        'Add resource hints'
      ] : [],
      metricsHistory: metricsHistory.current.slice(-10)
    })
  };
}