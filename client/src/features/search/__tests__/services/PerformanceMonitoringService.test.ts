/**
 * PerformanceMonitoringService Unit Tests
 * Phase 6: Comprehensive Testing - Performance Layer
 */

import { PerformanceMonitoringService } from '../../services/performance/PerformanceMonitoringService';
import { setupMockTimers } from '../setup';

describe('PerformanceMonitoringService', () => {
  let performanceService: PerformanceMonitoringService;
  let cleanupTimers: () => void;

  beforeEach(() => {
    cleanupTimers = setupMockTimers();
    performanceService = PerformanceMonitoringService.getInstance();
    
    // Reset console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    performanceService.destroy();
    cleanupTimers();
    jest.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PerformanceMonitoringService.getInstance();
      const instance2 = PerformanceMonitoringService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('trackSearchPerformance', () => {
    it('should track search operations correctly', () => {
      const startTime = performance.now() as number;
      const mockStartTime = startTime - 150; // 150ms ago

      performanceService.trackSearchPerformance('search', mockStartTime, true);

      const health = performanceService.getHealthStatus();
      expect(health.metrics.searchCount).toBe(1);
      expect(health.metrics.averageResponseTime).toBe(150);
      expect(health.metrics.errorCount).toBe(0);
    });

    it('should track cache hits correctly', () => {
      const startTime = performance.now() as number;

      performanceService.trackSearchPerformance('cache', startTime, true);
      performanceService.trackSearchPerformance('cache', startTime, false);

      const health = performanceService.getHealthStatus();
      expect(health.metrics.cacheHits).toBe(1);
    });

    it('should track errors correctly', () => {
      const startTime = performance.now() as number;

      performanceService.trackSearchPerformance('search', startTime, false);

      const health = performanceService.getHealthStatus();
      expect(health.metrics.errorCount).toBe(1);
      expect(health.metrics.searchCount).toBe(1);
    });

    it('should update average response time correctly', () => {
      const baseTime = performance.now() as number;
      
      // First search: 100ms
      performanceService.trackSearchPerformance('search', baseTime - 100, true);
      // Second search: 200ms
      performanceService.trackSearchPerformance('search', baseTime - 200, true);

      const health = performanceService.getHealthStatus();
      expect(health.metrics.averageResponseTime).toBe(150); // (100+200)/2
    });
  });

  describe('measureComponentPerformance', () => {
    it('should measure and log component performance', () => {
      const result = performanceService.measureComponentPerformance(
        'TestComponent',
        () => 'test result'
      );

      expect(result).toBe('test result');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[PERFORMANCE\] TestComponent: \d+\.\d+ms/)
      );
    });

    it('should add alerts for slow components', () => {
      // Mock slow operation
      (performance.now as jest.Mock)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(2000); // 2 seconds

      performanceService.measureComponentPerformance(
        'SlowComponent',
        () => 'result'
      );

      const health = performanceService.getHealthStatus();
      expect(health.alerts.length).toBeGreaterThan(0);
      expect(health.alerts[0]).toContain('Slow component performance');
    });

    it('should handle component errors', () => {
      const error = new Error('Component error');

      expect(() => {
        performanceService.measureComponentPerformance(
          'ErrorComponent',
          () => { throw error; }
        );
      }).toThrow(error);

      const health = performanceService.getHealthStatus();
      expect(health.metrics.errorCount).toBe(1);
    });
  });

  describe('measureAsyncOperation', () => {
    it('should measure async operations', async () => {
      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'async result';
      };

      const result = await performanceService.measureAsyncOperation(
        'AsyncTest',
        asyncOperation
      );

      expect(result).toBe('async result');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[PERFORMANCE\] AsyncTest: \d+\.\d+ms/)
      );
    });

    it('should handle async operation errors', async () => {
      const asyncError = async () => {
        throw new Error('Async error');
      };

      await expect(
        performanceService.measureAsyncOperation('AsyncError', asyncError)
      ).rejects.toThrow('Async error');

      const health = performanceService.getHealthStatus();
      expect(health.metrics.errorCount).toBe(1);
    });
  });

  describe('trackCachePerformance', () => {
    it('should track cache hits and misses', () => {
      performanceService.trackCachePerformance('hit', 'test-key');
      performanceService.trackCachePerformance('miss', 'other-key');

      const health = performanceService.getHealthStatus();
      expect(health.metrics.cacheHits).toBe(1);
    });

    it('should alert on cache size approaching limits', () => {
      const largeSize = 900; // 90% of assumed 1000 limit

      performanceService.trackCachePerformance('set', 'large-key', largeSize);

      const health = performanceService.getHealthStatus();
      expect(health.alerts.length).toBeGreaterThan(0);
      expect(health.alerts[0]).toContain('Cache approaching size limit');
    });

    it('should log cache evictions', () => {
      performanceService.trackCachePerformance('evict', 'evicted-key');

      expect(console.log).toHaveBeenCalledWith(
        '[PERFORMANCE] Cache eviction for key: evicted-key'
      );
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status for good metrics', () => {
      // Add some good performance metrics
      const startTime = performance.now() as number;
      performanceService.trackSearchPerformance('search', startTime - 100, true);
      performanceService.trackSearchPerformance('cache', startTime, true);

      const health = performanceService.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.score).toBeGreaterThan(0.8);
    });

    it('should return degraded status for moderate issues', () => {
      // Add moderate performance issues
      const startTime = performance.now() as number;
      performanceService.trackSearchPerformance('search', startTime - 1500, true); // Slow
      performanceService.trackSearchPerformance('search', startTime - 100, false); // Error

      const health = performanceService.getHealthStatus();

      expect(health.status).toBe('degraded');
      expect(health.score).toBeLessThan(0.8);
      expect(health.score).toBeGreaterThan(0.5);
    });

    it('should return unhealthy status for severe issues', () => {
      // Add severe performance issues
      const startTime = performance.now() as number;
      for (let i = 0; i < 5; i++) {
        performanceService.trackSearchPerformance('search', startTime - 3000, false); // Critical + errors
      }

      const health = performanceService.getHealthStatus();

      expect(health.status).toBe('unhealthy');
      expect(health.score).toBeLessThan(0.5);
    });
  });

  describe('getOptimizationRecommendations', () => {
    it('should recommend cache improvements for low hit rate', () => {
      // Create low cache hit rate scenario
      performanceService.trackSearchPerformance('search', performance.now() - 100, true);
      performanceService.trackSearchPerformance('cache', performance.now(), false); // Miss

      const recommendations = performanceService.getOptimizationRecommendations();

      expect(recommendations).toContain(
        expect.stringContaining('cache TTL')
      );
    });

    it('should recommend API optimization for slow responses', () => {
      // Create slow response scenario
      const startTime = performance.now() as number;
      performanceService.trackSearchPerformance('search', startTime - 2000, true);

      const recommendations = performanceService.getOptimizationRecommendations();

      expect(recommendations).toContain(
        expect.stringContaining('Optimize API calls')
      );
    });

    it('should recommend error investigation for high error rate', () => {
      // Create high error rate scenario
      const startTime = performance.now() as number;
      for (let i = 0; i < 10; i++) {
        performanceService.trackSearchPerformance('search', startTime, i % 2 === 0);
      }

      const recommendations = performanceService.getOptimizationRecommendations();

      expect(recommendations).toContain(
        expect.stringContaining('Investigate and fix error sources')
      );
    });
  });

  describe('getDashboardData', () => {
    it('should return formatted dashboard data', () => {
      // Add some performance data
      const startTime = performance.now() as number;
      performanceService.trackSearchPerformance('search', startTime - 150, true);
      performanceService.trackSearchPerformance('cache', startTime, true);

      const dashboard = performanceService.getDashboardData();

      expect(dashboard).toMatchObject({
        status: expect.any(String),
        score: expect.any(Number),
        recommendations: expect.any(Array),
        cacheHitRate: expect.any(String),
        errorRate: expect.any(String),
        averageResponseTime: expect.any(String),
        totalSearches: expect.any(Number),
      });

      expect(dashboard.cacheHitRate).toMatch(/^\d+\.\d$/); // Format: "100.0"
      expect(dashboard.errorRate).toMatch(/^\d+\.\d$/);
    });
  });

  describe('Health Monitoring', () => {
    it('should start health monitoring on initialization', () => {
      // Fast forward 35 seconds to trigger health check
      jest.advanceTimersByTime(35000);

      // Should have logged health status
      expect(console.warn).toHaveBeenCalledWith(
        '[HEALTH CHECK] System performance is degraded:',
        expect.any(Object)
      );
    });

    it('should log errors for unhealthy status', () => {
      // Create unhealthy conditions
      const startTime = performance.now() as number;
      for (let i = 0; i < 10; i++) {
        performanceService.trackSearchPerformance('search', startTime - 3000, false);
      }

      // Trigger health check
      jest.advanceTimersByTime(35000);

      expect(console.error).toHaveBeenCalledWith(
        '[HEALTH CHECK] System is unhealthy:',
        expect.any(Object)
      );
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics to initial state', () => {
      // Add some data
      const startTime = performance.now() as number;
      performanceService.trackSearchPerformance('search', startTime - 100, true);

      // Reset
      performanceService.resetMetrics();

      const health = performanceService.getHealthStatus();
      expect(health.metrics.searchCount).toBe(0);
      expect(health.metrics.cacheHits).toBe(0);
      expect(health.alerts).toHaveLength(0);
    });
  });

  describe('Memory Management', () => {
    it('should update memory usage when available', () => {
      // Mock performance.memory
      (performance as any).memory = {
        usedJSHeapSize: 25 * 1024 * 1024, // 25MB
      };

      const startTime = performance.now() as number;
      performanceService.trackSearchPerformance('search', startTime, true);

      const health = performanceService.getHealthStatus();
      expect(health.metrics.memoryUsage).toBe(25 * 1024 * 1024);
    });
  });
});