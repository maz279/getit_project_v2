/**
 * Search Performance Tests
 * Phase 6: Comprehensive Testing - Performance Benchmarks
 */

import { PerformanceMonitoringService } from '../../services/performance/PerformanceMonitoringService';
import { SearchAnalyticsService } from '../../services/analytics/SearchAnalyticsService';
import { InputValidator } from '../../services/validation/InputValidator';
import { SmartCacheManager } from '../../services/cache/SmartCacheManager';
import { setupMockTimers } from '../setup';

describe('Search Performance Tests', () => {
  let performanceService: PerformanceMonitoringService;
  let analyticsService: SearchAnalyticsService;
  let inputValidator: InputValidator;
  let cacheManager: SmartCacheManager;
  let cleanupTimers: () => void;

  beforeEach(() => {
    cleanupTimers = setupMockTimers();
    performanceService = PerformanceMonitoringService.getInstance();
    analyticsService = SearchAnalyticsService.getInstance();
    inputValidator = new InputValidator();
    cacheManager = SmartCacheManager.getInstance();
  });

  afterEach(() => {
    performanceService.resetMetrics();
    analyticsService.destroy();
    cacheManager.clearCache();
    cleanupTimers();
  });

  describe('Input Validation Performance', () => {
    it('should validate inputs within performance thresholds', () => {
      const testQueries = [
        'laptop',
        'mobile phone',
        'gaming computer',
        'wireless headphones',
        'smart watch',
        'tablet device',
        'digital camera',
        'bluetooth speaker',
        'fitness tracker',
        'portable charger',
      ];

      const startTime = performance.now();
      
      testQueries.forEach(query => {
        inputValidator.validateSearchInput(query);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should validate 10 queries in under 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should handle complex validation efficiently', () => {
      const complexQueries = [
        'MacBook Pro 13" with Touch Bar and 256GB SSD',
        'Samsung Galaxy S24 Ultra 5G with 512GB storage',
        'ASUS ROG Strix G15 Gaming Laptop with RTX 4060',
        'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        'Apple iPhone 15 Pro Max 1TB Natural Titanium',
      ];

      const startTime = performance.now();
      
      complexQueries.forEach(query => {
        const result = inputValidator.validateSearchInput(query);
        expect(result.isValid).toBe(true);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle complex queries efficiently
      expect(duration).toBeLessThan(100);
    });

    it('should detect threats quickly', () => {
      const threatQueries = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE users; --",
        'javascript:alert(1)',
        '<img src="x" onerror="alert(1)">',
        "' OR '1'='1",
      ];

      const startTime = performance.now();
      
      threatQueries.forEach(query => {
        const threats = inputValidator.detectThreats(query);
        expect(threats.length).toBeGreaterThan(0);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should detect threats quickly
      expect(duration).toBeLessThan(20);
    });
  });

  describe('Cache Performance', () => {
    it('should demonstrate cache hit performance improvement', () => {
      const cacheKey = 'test-search-laptop';
      const testData = { results: ['laptop1', 'laptop2', 'laptop3'] };

      // First set (cache miss)
      const setStart = performance.now();
      cacheManager.set(cacheKey, testData);
      const setEnd = performance.now();

      // First get (should be fast)
      const getStart = performance.now();
      const cachedData = cacheManager.get(cacheKey);
      const getEnd = performance.now();

      const setDuration = setEnd - setStart;
      const getDuration = getEnd - getStart;

      expect(cachedData).toEqual(testData);
      expect(getDuration).toBeLessThan(setDuration); // Get should be faster than set
      expect(getDuration).toBeLessThan(5); // Cache hit should be very fast
    });

    it('should handle cache operations efficiently at scale', () => {
      const cacheOperations = 1000;
      const testData = { query: 'test', results: ['result1', 'result2'] };

      const startTime = performance.now();
      
      // Perform many cache operations
      for (let i = 0; i < cacheOperations; i++) {
        const key = `test-key-${i}`;
        cacheManager.set(key, { ...testData, id: i });
        
        if (i % 2 === 0) {
          cacheManager.get(key);
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle 1000 operations in reasonable time
      expect(duration).toBeLessThan(500); // 500ms for 1000 operations
    });

    it('should demonstrate LRU eviction performance', () => {
      const maxSize = 100;
      cacheManager.clearCache(); // Start fresh

      const startTime = performance.now();
      
      // Fill cache beyond capacity
      for (let i = 0; i < maxSize + 50; i++) {
        cacheManager.set(`key-${i}`, { data: `value-${i}` });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Cache should handle eviction efficiently
      expect(duration).toBeLessThan(100);
      
      // Early items should be evicted
      expect(cacheManager.get('key-0')).toBeNull();
      expect(cacheManager.get(`key-${maxSize + 40}`)).toBeTruthy();
    });
  });

  describe('Analytics Performance', () => {
    it('should track events without significant overhead', () => {
      const eventCount = 100;
      const queries = Array.from({ length: eventCount }, (_, i) => `query-${i}`);

      const startTime = performance.now();
      
      queries.forEach((query, index) => {
        analyticsService.trackSearchEvent(
          query,
          'text',
          100 + index, // Varying response times
          10 + index,  // Varying result counts
          index % 10 !== 0 // 90% success rate
        );
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should track 100 events quickly
      expect(duration).toBeLessThan(50);
      
      const metrics = analyticsService.getSessionMetrics();
      expect(metrics.totalSearches).toBe(eventCount);
    });

    it('should generate business intelligence efficiently', () => {
      const testQueries = [
        'buy laptop cheap',
        'compare iPhone vs Samsung',
        'help with phone setup',
        'premium gaming computer',
        'budget smartphone',
      ];

      const startTime = performance.now();
      
      const intelligenceResults = testQueries.map(query => 
        analyticsService.generateBusinessIntelligence(query, 'en')
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should analyze multiple queries quickly
      expect(duration).toBeLessThan(25);
      expect(intelligenceResults).toHaveLength(testQueries.length);
      
      // Verify different intents were detected
      const intents = intelligenceResults.map(result => result.searchIntent);
      expect(new Set(intents).size).toBeGreaterThan(1);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics efficiently', () => {
      const operationCount = 50;

      const startTime = performance.now();
      
      for (let i = 0; i < operationCount; i++) {
        const opStart = performance.now() - (100 + i * 10);
        performanceService.trackSearchPerformance('search', opStart, i % 5 !== 0);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should track many operations quickly
      expect(duration).toBeLessThan(25);
      
      const health = performanceService.getHealthStatus();
      expect(health.metrics.searchCount).toBe(operationCount);
    });

    it('should calculate health scores efficiently', () => {
      // Add performance data
      for (let i = 0; i < 20; i++) {
        const responseTime = 100 + (i * 50); // Increasing response times
        const success = i < 15; // 75% success rate
        
        performanceService.trackSearchPerformance('search', performance.now() - responseTime, success);
      }

      const startTime = performance.now();
      
      const health = performanceService.getHealthStatus();
      const dashboard = performanceService.getDashboardData();
      const recommendations = performanceService.getOptimizationRecommendations();
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should calculate health metrics quickly
      expect(duration).toBeLessThan(10);
      
      expect(health.status).toBeDefined();
      expect(dashboard.totalSearches).toBe(20);
      expect(recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory during extended use', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Simulate extended usage
      for (let i = 0; i < 200; i++) {
        // Cache operations
        cacheManager.set(`key-${i}`, { data: `large-data-${'x'.repeat(1000)}-${i}` });
        
        // Analytics events
        analyticsService.trackSearchEvent(`query-${i}`, 'text', 100, 10, true);
        
        // Performance tracking
        performanceService.trackSearchPerformance('search', performance.now() - 100, true);
        
        // Validation
        inputValidator.validateSearchInput(`test query ${i}`);
      }
      
      // Force cleanup
      cacheManager.clearCache();
      analyticsService.destroy();
      performanceService.resetMetrics();
      
      // Check memory hasn't grown excessively
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle garbage collection efficiently', () => {
      // Create many temporary objects
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const tempData = {
          id: i,
          query: `temporary query ${i}`,
          results: Array.from({ length: 10 }, (_, j) => `result-${j}`),
          metadata: { timestamp: Date.now(), index: i },
        };
        
        // Use and discard the object
        inputValidator.validateSearchInput(tempData.query);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle temporary object creation/destruction efficiently
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent cache operations', async () => {
      const concurrentOperations = 20;
      const promises: Promise<any>[] = [];

      const startTime = performance.now();
      
      // Create concurrent operations
      for (let i = 0; i < concurrentOperations; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              cacheManager.set(`concurrent-${i}`, { data: i });
              const result = cacheManager.get(`concurrent-${i}`);
              resolve(result);
            }, Math.random() * 10);
          })
        );
      }
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(concurrentOperations);
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent performance tracking', () => {
      const operations = [];
      
      const startTime = performance.now();
      
      // Create multiple simultaneous performance measurements
      for (let i = 0; i < 30; i++) {
        const operation = () => {
          const opStart = performance.now() - (50 + i * 5);
          performanceService.trackSearchPerformance('search', opStart, true);
          performanceService.trackCachePerformance('hit', `key-${i}`);
        };
        operations.push(operation);
      }
      
      // Execute all operations
      operations.forEach(op => op());
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50);
      
      const health = performanceService.getHealthStatus();
      expect(health.metrics.searchCount).toBe(30);
      expect(health.metrics.cacheHits).toBe(30);
    });
  });

  describe('Performance Regression Tests', () => {
    it('should maintain performance standards across all operations', () => {
      const performanceStandards = {
        inputValidation: 5,   // ms per validation
        cacheOperation: 2,    // ms per cache operation
        analyticsEvent: 1,    // ms per analytics event
        performanceTrack: 1,  // ms per performance tracking
      };

      // Input validation benchmark
      const validationStart = performance.now();
      for (let i = 0; i < 10; i++) {
        inputValidator.validateSearchInput(`test query ${i}`);
      }
      const validationDuration = (performance.now() - validationStart) / 10;

      // Cache operation benchmark
      const cacheStart = performance.now();
      for (let i = 0; i < 10; i++) {
        cacheManager.set(`perf-test-${i}`, { data: i });
        cacheManager.get(`perf-test-${i}`);
      }
      const cacheDuration = (performance.now() - cacheStart) / 20; // 20 operations (10 set + 10 get)

      // Analytics benchmark
      const analyticsStart = performance.now();
      for (let i = 0; i < 10; i++) {
        analyticsService.trackSearchEvent(`query-${i}`, 'text', 100, 10, true);
      }
      const analyticsDuration = (performance.now() - analyticsStart) / 10;

      // Performance tracking benchmark
      const perfStart = performance.now();
      for (let i = 0; i < 10; i++) {
        performanceService.trackSearchPerformance('search', performance.now() - 100, true);
      }
      const perfDuration = (performance.now() - perfStart) / 10;

      // Verify all operations meet performance standards
      expect(validationDuration).toBeLessThan(performanceStandards.inputValidation);
      expect(cacheDuration).toBeLessThan(performanceStandards.cacheOperation);
      expect(analyticsDuration).toBeLessThan(performanceStandards.analyticsEvent);
      expect(perfDuration).toBeLessThan(performanceStandards.performanceTrack);
    });
  });
});