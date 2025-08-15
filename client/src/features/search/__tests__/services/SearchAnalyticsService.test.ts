/**
 * SearchAnalyticsService Unit Tests
 * Phase 6: Comprehensive Testing - Service Layer
 */

import { SearchAnalyticsService } from '../../services/analytics/SearchAnalyticsService';
import '../setup';

describe('SearchAnalyticsService', () => {
  let analyticsService: SearchAnalyticsService;

  beforeEach(() => {
    // Get fresh instance for each test
    analyticsService = SearchAnalyticsService.getInstance();
    
    // Reset console methods to spy on them
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    // Clean up analytics service
    analyticsService.destroy();
    jest.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SearchAnalyticsService.getInstance();
      const instance2 = SearchAnalyticsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('trackSearchEvent', () => {
    it('should track successful search events', () => {
      const query = 'laptop';
      const responseTime = 150;
      const resultsCount = 25;

      analyticsService.trackSearchEvent(
        query,
        'text',
        responseTime,
        resultsCount,
        true
      );

      const metrics = analyticsService.getSessionMetrics();
      expect(metrics.totalSearches).toBe(1);
      expect(metrics.successRate).toBe(1);
      expect(metrics.averageResponseTime).toBe(responseTime);
    });

    it('should track failed search events', () => {
      analyticsService.trackSearchEvent(
        'failed query',
        'text',
        500,
        0,
        false,
        'network_error'
      );

      const metrics = analyticsService.getSessionMetrics();
      expect(metrics.totalSearches).toBe(1);
      expect(metrics.successRate).toBe(0);
    });

    it('should calculate correct averages with multiple searches', () => {
      // Track multiple searches
      analyticsService.trackSearchEvent('query1', 'text', 100, 10, true);
      analyticsService.trackSearchEvent('query2', 'text', 200, 15, true);
      analyticsService.trackSearchEvent('query3', 'text', 150, 0, false);

      const metrics = analyticsService.getSessionMetrics();
      expect(metrics.totalSearches).toBe(3);
      expect(metrics.averageResponseTime).toBe(150); // (100+200+150)/3
      expect(metrics.successRate).toBe(2/3);
    });
  });

  describe('trackSuggestionEvent', () => {
    it('should track suggestion interactions', () => {
      const suggestionData = {
        query: 'laptop',
        suggestionText: 'laptop gaming',
        suggestionType: 'product',
        position: 0,
        language: 'en' as const,
      };

      analyticsService.trackSuggestionEvent(
        suggestionData.query,
        suggestionData.suggestionText,
        suggestionData.suggestionType,
        suggestionData.position,
        suggestionData.language
      );

      expect(console.log).toHaveBeenCalledWith(
        '[ANALYTICS] Suggestion clicked:',
        expect.objectContaining({
          type: 'suggestion_click',
          query: suggestionData.query,
          suggestionText: suggestionData.suggestionText,
          position: suggestionData.position,
        })
      );
    });
  });

  describe('generateBusinessIntelligence', () => {
    it('should classify purchase intent correctly', () => {
      const intelligence = analyticsService.generateBusinessIntelligence(
        'buy laptop price in Bangladesh',
        'en'
      );

      expect(intelligence.searchIntent).toBe('purchase');
      expect(intelligence.complexity).toBe('complex');
      expect(intelligence.conversionProbability).toBeGreaterThan(0.5);
    });

    it('should classify comparison intent correctly', () => {
      const intelligence = analyticsService.generateBusinessIntelligence(
        'iPhone vs Samsung comparison',
        'en'
      );

      expect(intelligence.searchIntent).toBe('comparison');
      expect(intelligence.conversionProbability).toBeGreaterThan(0.4);
    });

    it('should classify support intent correctly', () => {
      const intelligence = analyticsService.generateBusinessIntelligence(
        'how to fix my phone',
        'en'
      );

      expect(intelligence.searchIntent).toBe('support');
      expect(intelligence.conversionProbability).toBeLessThan(0.5);
    });

    it('should detect Bengali cultural context', () => {
      const intelligence = analyticsService.generateBusinessIntelligence(
        'মোবাইল ফোন ঢাকায়',
        'bn'
      );

      expect(intelligence.culturalContext).toContain('bengali_language');
      expect(intelligence.culturalContext).toContain('bangladesh_context');
    });

    it('should identify market segments correctly', () => {
      const budgetIntelligence = analyticsService.generateBusinessIntelligence(
        'cheap budget phone',
        'en'
      );
      expect(budgetIntelligence.marketSegment).toBe('budget');

      const premiumIntelligence = analyticsService.generateBusinessIntelligence(
        'premium luxury smartphone',
        'en'
      );
      expect(premiumIntelligence.marketSegment).toBe('premium');

      const gamingIntelligence = analyticsService.generateBusinessIntelligence(
        'gaming laptop for esports',
        'en'
      );
      expect(gamingIntelligence.marketSegment).toBe('gaming');
    });
  });

  describe('getSessionMetrics', () => {
    it('should return correct session metrics', () => {
      // Track some events
      analyticsService.trackSearchEvent('query1', 'text', 100, 10, true);
      analyticsService.trackSearchEvent('query2', 'voice', 200, 5, false);

      const metrics = analyticsService.getSessionMetrics();

      expect(metrics).toMatchObject({
        sessionId: expect.any(String),
        totalSearches: 2,
        averageResponseTime: 150,
        successRate: 0.5,
        recentMetrics: expect.any(Array),
      });

      expect(metrics.recentMetrics).toHaveLength(2);
    });

    it('should handle empty metrics correctly', () => {
      const metrics = analyticsService.getSessionMetrics();

      expect(metrics.totalSearches).toBe(0);
      expect(metrics.averageResponseTime).toBeNaN(); // No searches yet
      expect(metrics.successRate).toBeNaN(); // No searches yet
    });
  });

  describe('Performance Analysis', () => {
    it('should detect critical performance issues', () => {
      const criticalResponseTime = 3000; // 3 seconds
      
      analyticsService.trackSearchEvent(
        'slow query',
        'text',
        criticalResponseTime,
        10,
        true
      );

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[ANALYTICS] Critical performance detected:')
      );
    });

    it('should not warn for normal performance', () => {
      analyticsService.trackSearchEvent(
        'fast query',
        'text',
        100, // Normal response time
        10,
        true
      );

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('Session Storage Integration', () => {
    it('should store metrics in session storage', () => {
      analyticsService.trackSearchEvent('test', 'text', 100, 10, true);

      const storedMetrics = JSON.parse(
        window.sessionStorage.getItem('searchMetrics') || '[]'
      );

      expect(storedMetrics).toHaveLength(1);
      expect(storedMetrics[0]).toMatchObject({
        responseTime: 100,
        success: true,
        resultsCount: 10,
      });
    });

    it('should limit stored metrics to 100 entries', () => {
      // Add 150 metrics
      for (let i = 0; i < 150; i++) {
        analyticsService.trackSearchEvent(`query${i}`, 'text', 100, 10, true);
      }

      const storedMetrics = JSON.parse(
        window.sessionStorage.getItem('searchMetrics') || '[]'
      );

      expect(storedMetrics).toHaveLength(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid search types gracefully', () => {
      expect(() => {
        analyticsService.trackSearchEvent(
          'test',
          'invalid' as any,
          100,
          10,
          true
        );
      }).not.toThrow();
    });

    it('should handle negative response times', () => {
      expect(() => {
        analyticsService.trackSearchEvent('test', 'text', -100, 10, true);
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should flush events on destroy', () => {
      analyticsService.trackSearchEvent('test', 'text', 100, 10, true);
      
      const consoleSpy = jest.spyOn(console, 'log');
      analyticsService.destroy();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ANALYTICS] Flushing events:')
      );
    });
  });
});