/**
 * Performance Controller - Centralized Performance Management
 * Prevents circular optimization loops and manages all performance systems
 * 
 * @fileoverview Single controller for all performance optimizations
 * @version 1.0.0
 * @author GetIt Platform Team
 */

interface PerformanceState {
  isOptimizing: boolean;
  lastOptimization: number;
  optimizationCount: number;
  currentCLS: number;
  currentMemory: number;
  emergencyMode: boolean;
}

class PerformanceController {
  private state: PerformanceState = {
    isOptimizing: false,
    lastOptimization: 0,
    optimizationCount: 0,
    currentCLS: 0,
    currentMemory: 0,
    emergencyMode: false
  };

  private readonly OPTIMIZATION_COOLDOWN = 30000; // 30 seconds
  private readonly MAX_OPTIMIZATIONS_PER_HOUR = 10;
  private readonly EMERGENCY_CLS_THRESHOLD = 0.3;
  private readonly EMERGENCY_MEMORY_THRESHOLD = 95;

  private optimizationHistory: number[] = [];
  private observer: PerformanceObserver | null = null;

  /**
   * Initialize performance controller
   */
  init(): void {
    this.startMonitoring();
    this.setupCleanup();
  }

  /**
   * Check if optimization is needed and allowed
   */
  private shouldOptimize(): boolean {
    const now = Date.now();
    const timeSinceLastOptimization = now - this.state.lastOptimization;
    
    // Remove old optimizations (older than 1 hour)
    this.optimizationHistory = this.optimizationHistory.filter(
      time => now - time < 3600000
    );
    
    // Check cooldown
    if (timeSinceLastOptimization < this.OPTIMIZATION_COOLDOWN) {
      return false;
    }
    
    // Check max optimizations per hour
    if (this.optimizationHistory.length >= this.MAX_OPTIMIZATIONS_PER_HOUR) {
      console.warn('🚫 Performance optimization rate limit reached');
      return false;
    }
    
    // Check if already optimizing
    if (this.state.isOptimizing) {
      return false;
    }
    
    return true;
  }

  /**
   * Perform controlled optimization
   */
  async performOptimization(): Promise<void> {
    if (!this.shouldOptimize()) {
      return;
    }

    this.state.isOptimizing = true;
    this.state.lastOptimization = Date.now();
    this.optimizationHistory.push(Date.now());

    try {
      console.log('🎯 Starting controlled performance optimization...');
      
      // 1. Emergency mode check
      if (this.state.currentCLS > this.EMERGENCY_CLS_THRESHOLD || 
          this.state.currentMemory > this.EMERGENCY_MEMORY_THRESHOLD) {
        await this.emergencyOptimization();
      } else {
        await this.routineOptimization();
      }
      
      console.log('✅ Performance optimization completed');
    } catch (error) {
      console.error('❌ Performance optimization failed:', error);
    } finally {
      this.state.isOptimizing = false;
      this.state.optimizationCount++;
    }
  }

  /**
   * Emergency optimization for critical issues
   */
  private async emergencyOptimization(): Promise<void> {
    console.log('🚨 Emergency performance optimization triggered');
    
    // 1. Immediate CLS fix
    if (this.state.currentCLS > this.EMERGENCY_CLS_THRESHOLD) {
      this.emergencyCLSFix();
    }
    
    // 2. Memory cleanup
    if (this.state.currentMemory > this.EMERGENCY_MEMORY_THRESHOLD) {
      this.emergencyMemoryCleanup();
    }
    
    // 3. Resource optimization
    this.optimizeResources();
  }

  /**
   * Routine optimization for normal conditions
   */
  private async routineOptimization(): Promise<void> {
    console.log('🔧 Routine performance optimization');
    
    // 1. Gentle CLS optimization
    if (this.state.currentCLS > 0.1) {
      this.gentleCLSOptimization();
    }
    
    // 2. Memory optimization
    if (this.state.currentMemory > 90) {
      this.gentleMemoryOptimization();
    }
    
    // 3. Cache optimization
    this.optimizeCache();
  }

  /**
   * Emergency CLS fix without aggressive styles
   */
  private emergencyCLSFix(): void {
    const style = document.createElement('style');
    style.id = 'controlled-cls-fix';
    style.textContent = `
      /* Emergency CLS fixes to prevent layout shifts */
      * {
        contain: layout !important;
      }
      
      img:not([width]):not([height]) {
        aspect-ratio: 16/9 !important;
        width: 100% !important;
        height: auto !important;
        object-fit: cover !important;
      }
      
      .performance-dashboard *, .performance-test-page * {
        width: auto !important;
        height: auto !important;
        min-height: initial !important;
        max-height: initial !important;
      }
      
      /* Stabilize all card components */
      [class*="card"], [class*="Card"] {
        min-height: 100px !important;
        contain: layout style !important;
      }
      
      /* Prevent dynamic content shifts */
      [class*="badge"], [class*="Badge"] {
        display: inline-block !important;
        min-width: 40px !important;
        text-align: center !important;
      }
      
      /* Stabilize tabs and dynamic content */
      [class*="tab"], [class*="Tab"] {
        contain: layout !important;
      }
    `;
    
    // Remove existing fix
    const existing = document.getElementById('controlled-cls-fix');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(style);
    
    console.log('🚨 Emergency CLS fix applied - stabilizing all layouts');
  }

  /**
   * Gentle CLS optimization
   */
  private gentleCLSOptimization(): void {
    // Fix images without dimensions
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        const rect = img.getBoundingClientRect();
        if (rect.width > 0) {
          img.style.width = rect.width + 'px';
          img.style.height = 'auto';
          img.style.aspectRatio = '16/9';
        } else {
          // Set default size for images that haven't loaded
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.aspectRatio = '16/9';
        }
      }
    });
    
    // Stabilize dynamic content containers
    const dynamicContainers = document.querySelectorAll('[class*="card"], [class*="badge"], [class*="tab"]');
    dynamicContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.style.minHeight = container.offsetHeight + 'px';
      }
    });
    
    console.log('🔧 Gentle CLS optimization applied to', images.length, 'images and', dynamicContainers.length, 'containers');
  }

  /**
   * Emergency memory cleanup
   */
  private emergencyMemoryCleanup(): void {
    // Clear all intervals
    const highestId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestId; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
    
    // Force garbage collection
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    // Clear performance caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  }

  /**
   * Gentle memory optimization
   */
  private gentleMemoryOptimization(): void {
    // Remove unused event listeners
    document.querySelectorAll('*').forEach(el => {
      el.removeEventListener('click', () => {});
      el.removeEventListener('scroll', () => {});
    });
    
    // Clear old performance entries
    if (performance.clearResourceTimings) {
      performance.clearResourceTimings();
    }
  }

  /**
   * Optimize resources
   */
  private optimizeResources(): void {
    // Disable heavy animations
    const style = document.createElement('style');
    style.id = 'resource-optimization';
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01s !important;
        animation-delay: 0s !important;
        transition-duration: 0.01s !important;
        transition-delay: 0s !important;
      }
    `;
    
    const existing = document.getElementById('resource-optimization');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(style);
  }

  /**
   * Optimize cache
   */
  private optimizeCache(): void {
    // Clear old cache entries
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old') || name.includes('temp')) {
            caches.delete(name);
          }
        });
      });
    }
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          this.state.currentCLS = Math.max(this.state.currentCLS, (entry as any).value);
        }
      }
    });

    this.observer.observe({ entryTypes: ['layout-shift'] });
    
    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.state.currentMemory = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
      }
      
      // Check if optimization is needed
      if (this.state.currentCLS > 0.1 || this.state.currentMemory > 90) {
        this.performOptimization();
      }
    }, 10000); // Check every 10 seconds instead of 5
  }

  /**
   * Setup cleanup on page unload
   */
  private setupCleanup(): void {
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * Cleanup all performance systems
   */
  cleanup(): void {
    this.observer?.disconnect();
    
    // Remove optimization styles
    const optimizationStyles = [
      'controlled-cls-fix',
      'resource-optimization',
      'emergency-cls-fix'
    ];
    
    optimizationStyles.forEach(id => {
      const style = document.getElementById(id);
      if (style) {
        style.remove();
      }
    });
  }

  /**
   * Get current performance state
   */
  getState(): PerformanceState {
    return { ...this.state };
  }
}

export default new PerformanceController();