/**
 * Performance Optimizer Utility
 * Fixes critical performance issues: CLS, Memory Usage, Loading Times
 * 
 * @fileoverview Complete performance optimization for Amazon.com/Shopee.sg standards
 * @version 2.0.0
 * @author GetIt Platform Team
 */

interface PerformanceThresholds {
  cls: number;
  memory: number;
  loadTime: number;
  cacheHitRate: number;
}

interface OptimizationRule {
  name: string;
  threshold: number;
  action: () => void;
}

class PerformanceOptimizer {
  private thresholds: PerformanceThresholds = {
    cls: 0.1,
    memory: 90,
    loadTime: 2500,
    cacheHitRate: 85
  };

  private imageCache = new Map<string, HTMLImageElement>();
  private observerInstances = new Set<IntersectionObserver>();
  private componentCleanups = new Set<() => void>();

  /**
   * Critical CLS optimization
   */
  optimizeCLS(): void {
    // 1. Reserve space for images
    this.reserveImageSpace();
    
    // 2. Preload critical images
    this.preloadCriticalImages();
    
    // 3. Stabilize layout
    this.stabilizeLayout();
    
    // 4. Optimize font loading
    this.optimizeFontLoading();
  }

  /**
   * Memory usage optimization
   */
  optimizeMemory(): void {
    // 1. Clean up observers
    this.cleanupObservers();
    
    // 2. Clear unused caches
    this.clearUnusedCaches();
    
    // 3. Force garbage collection
    this.forceGarbageCollection();
    
    // 4. Optimize component lifecycle
    this.optimizeComponentLifecycle();
  }

  /**
   * Reserve space for images to prevent layout shifts
   */
  private reserveImageSpace(): void {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        // Set explicit dimensions to prevent layout shifts
        if (!img.style.width && !img.style.height) {
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.aspectRatio = '16/9'; // Default aspect ratio
        }
      }
    });
  }

  /**
   * Preload critical images
   */
  private preloadCriticalImages(): void {
    const criticalImages = [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    ];

    criticalImages.forEach((src) => {
      if (!this.imageCache.has(src)) {
        const img = new Image();
        img.onload = () => {
          this.imageCache.set(src, img);
        };
        img.onerror = () => {
          console.warn(`Failed to preload image: ${src}`);
        };
        img.src = src;
      }
    });
  }

  /**
   * Stabilize layout
   */
  private stabilizeLayout(): void {
    // Add CSS to prevent layout shifts
    const style = document.createElement('style');
    style.textContent = `
      /* Prevent layout shifts */
      .performance-optimized {
        contain: layout style paint;
      }
      
      /* Stabilize image loading */
      img {
        display: block;
        max-width: 100%;
        height: auto;
      }
      
      /* Prevent text layout shifts */
      .text-container {
        min-height: 1.5em;
      }
      
      /* Stabilize card layouts */
      .card {
        min-height: 200px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Optimize font loading
   */
  private optimizeFontLoading(): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  /**
   * Clean up observers to prevent memory leaks
   */
  private cleanupObservers(): void {
    this.observerInstances.forEach((observer) => {
      observer.disconnect();
    });
    this.observerInstances.clear();
  }

  /**
   * Clear unused caches
   */
  private clearUnusedCaches(): void {
    // Clear old image cache entries
    if (this.imageCache.size > 50) {
      const entries = Array.from(this.imageCache.entries());
      entries.slice(0, 25).forEach(([key]) => {
        this.imageCache.delete(key);
      });
    }

    // Clear browser caches if available
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          if (cacheName.includes('old-') || cacheName.includes('temp-')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  }

  /**
   * Force garbage collection
   */
  private forceGarbageCollection(): void {
    // Trigger garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    // Manual cleanup
    this.componentCleanups.forEach((cleanup) => cleanup());
    this.componentCleanups.clear();
  }

  /**
   * Optimize component lifecycle
   */
  private optimizeComponentLifecycle(): void {
    // Add cleanup for React components
    if (typeof window !== 'undefined') {
      const originalSetTimeout = window.setTimeout;
      const originalSetInterval = window.setInterval;
      
      window.setTimeout = (callback, delay) => {
        const id = originalSetTimeout(callback, delay);
        this.componentCleanups.add(() => clearTimeout(id));
        return id;
      };
      
      window.setInterval = (callback, delay) => {
        const id = originalSetInterval(callback, delay);
        this.componentCleanups.add(() => clearInterval(id));
        return id;
      };
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): { cls: number; memory: number; loadTime: number } {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const cls = this.measureCLS();
    const memory = this.getMemoryUsage();
    const loadTime = navigation ? navigation.loadEventEnd - navigation.navigationStart : 0;

    return { cls, memory, loadTime };
  }

  /**
   * Measure CLS (Cumulative Layout Shift)
   */
  private measureCLS(): number {
    return new Promise((resolve) => {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 1000);
    }) as any;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    }
    return 0;
  }

  /**
   * Apply comprehensive optimizations
   */
  applyOptimizations(): void {
    console.log('🚀 Applying comprehensive performance optimizations...');
    
    // Critical optimizations
    this.optimizeCLS();
    this.optimizeMemory();
    
    // Monitor and auto-optimize
    this.setupAutoOptimization();
    
    console.log('✅ Performance optimizations applied successfully');
  }

  /**
   * Setup automatic optimization
   */
  private setupAutoOptimization(): void {
    setInterval(() => {
      const metrics = this.getCurrentMetrics();
      
      if (metrics.cls > this.thresholds.cls) {
        console.log('🎯 Auto-optimizing CLS...');
        this.optimizeCLS();
      }
      
      if (metrics.memory > this.thresholds.memory) {
        console.log('🧠 Auto-optimizing memory...');
        this.optimizeMemory();
      }
    }, 5000);
  }

  /**
   * Register cleanup function
   */
  registerCleanup(cleanup: () => void): void {
    this.componentCleanups.add(cleanup);
  }

  /**
   * Create optimized intersection observer
   */
  createOptimizedObserver(callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
    
    this.observerInstances.add(observer);
    return observer;
  }
}

export default new PerformanceOptimizer();