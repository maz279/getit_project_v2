/**
 * Search Analytics Service - Phase 5 Service Layer Implementation
 * Comprehensive analytics and monitoring for search functionality
 */

import { ANALYTICS_CONFIG, PERFORMANCE_THRESHOLDS } from '../../constants/searchConstants';
import type { SearchAnalytics, BusinessIntelligence, SearchType, Language } from '../../components/AISearchBar/AISearchBar.types';

export class SearchAnalyticsService {
  private static instance: SearchAnalyticsService;
  private eventQueue: SearchAnalytics[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private deploymentId: string;

  private constructor() {
    this.sessionId = crypto.randomUUID();
    this.deploymentId = `deployment-${Date.now()}`;
    this.startFlushTimer();
  }

  public static getInstance(): SearchAnalyticsService {
    if (!SearchAnalyticsService.instance) {
      SearchAnalyticsService.instance = new SearchAnalyticsService();
    }
    return SearchAnalyticsService.instance;
  }

  // Track search events with comprehensive metadata
  public trackSearchEvent(
    searchQuery: string,
    searchType: SearchType,
    responseTime: number,
    resultsCount: number,
    success: boolean,
    errorCode?: string
  ): void {
    if (!ANALYTICS_CONFIG.TRACK_SEARCHES) return;

    const analytics: SearchAnalytics = {
      searchQuery,
      searchType,
      timestamp: Date.now(),
      responseTime,
      resultsCount,
      suggestionsCount: 0, // Will be updated if applicable
      language: 'en', // Default, should be passed from component
      success,
      errorCode,
    };

    this.addToQueue(analytics);
    this.analyzePerformance(analytics);
  }

  // Track suggestion interactions
  public trackSuggestionEvent(
    query: string,
    suggestionText: string,
    suggestionType: string,
    position: number,
    language: Language
  ): void {
    if (!ANALYTICS_CONFIG.TRACK_SUGGESTIONS) return;

    const event = {
      type: 'suggestion_click',
      query,
      suggestionText,
      suggestionType,
      position,
      language,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ANALYTICS] Suggestion clicked:', event);
    }
    this.sendEvent(event);
  }

  // Business intelligence analysis
  public generateBusinessIntelligence(
    searchQuery: string,
    language: Language,
    userContext?: any
  ): BusinessIntelligence {
    const searchIntent = this.classifySearchIntent(searchQuery);
    const complexity = this.assessComplexity(searchQuery);
    const culturalContext = this.analyzeCulturalContext(searchQuery, language);
    const marketSegment = this.determineMarketSegment(searchQuery, userContext);
    const conversionProbability = this.calculateConversionProbability(
      searchQuery,
      searchIntent,
      complexity
    );

    return {
      searchIntent,
      complexity,
      language,
      culturalContext,
      marketSegment,
      conversionProbability,
    };
  }

  // Performance analysis
  private analyzePerformance(analytics: SearchAnalytics): void {
    const performanceCategory = this.categorizePerformance(analytics.responseTime);
    
    if (performanceCategory === 'critical') {
      console.warn('[ANALYTICS] Critical performance detected:', {
        query: analytics.searchQuery,
        responseTime: analytics.responseTime,
        threshold: PERFORMANCE_THRESHOLDS.CRITICAL_RESPONSE,
      });
    }

    // Track performance metrics
    this.updatePerformanceMetrics(analytics);
  }

  private categorizePerformance(responseTime: number): 'fast' | 'normal' | 'slow' | 'critical' {
    if (responseTime < PERFORMANCE_THRESHOLDS.FAST_RESPONSE) return 'fast';
    if (responseTime < PERFORMANCE_THRESHOLDS.NORMAL_RESPONSE) return 'normal';
    if (responseTime < PERFORMANCE_THRESHOLDS.SLOW_RESPONSE) return 'slow';
    return 'critical';
  }

  private classifySearchIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Product search patterns
    if (lowerQuery.includes('buy') || lowerQuery.includes('price') || lowerQuery.includes('৳')) {
      return 'purchase';
    }
    
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
      return 'comparison';
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('support') || lowerQuery.includes('how')) {
      return 'support';
    }
    
    if (lowerQuery.includes('navigate') || lowerQuery.includes('page') || lowerQuery.includes('menu')) {
      return 'navigation';
    }
    
    // Default to product search
    return 'product';
  }

  private assessComplexity(query: string): 'simple' | 'complex' {
    const wordCount = query.trim().split(/\s+/).length;
    const hasSpecialChars = /[<>(){}[\]"']/.test(query);
    const hasBengali = /[\u0980-\u09FF]/.test(query);
    
    return (wordCount > 3 || hasSpecialChars || hasBengali) ? 'complex' : 'simple';
  }

  private analyzeCulturalContext(query: string, language: Language): string[] {
    const context: string[] = [];
    
    if (language === 'bn') {
      context.push('bengali_language');
    }
    
    // Bangladesh-specific terms
    const bangladeshTerms = ['dhaka', 'chittagong', 'sylhet', 'bkash', 'nagad', 'taka', '৳'];
    if (bangladeshTerms.some(term => query.toLowerCase().includes(term))) {
      context.push('bangladesh_context');
    }
    
    // Festival/seasonal context
    const festivals = ['eid', 'durga', 'pohela', 'valentine'];
    if (festivals.some(festival => query.toLowerCase().includes(festival))) {
      context.push('seasonal_context');
    }
    
    return context;
  }

  private determineMarketSegment(query: string, userContext?: any): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('cheap') || lowerQuery.includes('budget') || lowerQuery.includes('low price')) {
      return 'budget';
    }
    
    if (lowerQuery.includes('premium') || lowerQuery.includes('luxury') || lowerQuery.includes('high end')) {
      return 'premium';
    }
    
    if (lowerQuery.includes('office') || lowerQuery.includes('business') || lowerQuery.includes('enterprise')) {
      return 'business';
    }
    
    if (lowerQuery.includes('gaming') || lowerQuery.includes('game') || lowerQuery.includes('esports')) {
      return 'gaming';
    }
    
    return 'general';
  }

  private calculateConversionProbability(
    query: string,
    intent: string,
    complexity: 'simple' | 'complex'
  ): number {
    let probability = 0.5; // Base probability
    
    // Intent-based adjustments
    switch (intent) {
      case 'purchase':
        probability += 0.3;
        break;
      case 'comparison':
        probability += 0.2;
        break;
      case 'product':
        probability += 0.1;
        break;
      case 'support':
        probability -= 0.1;
        break;
      case 'navigation':
        probability -= 0.2;
        break;
    }
    
    // Complexity adjustments
    if (complexity === 'simple') {
      probability += 0.1;
    } else {
      probability -= 0.05;
    }
    
    // Ensure probability stays within bounds
    return Math.max(0, Math.min(1, probability));
  }

  private addToQueue(analytics: SearchAnalytics): void {
    this.eventQueue.push(analytics);
    
    if (this.eventQueue.length >= ANALYTICS_CONFIG.BATCH_SIZE) {
      this.flushEvents();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, ANALYTICS_CONFIG.FLUSH_INTERVAL);
  }

  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    // In production, this would send to analytics service
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ANALYTICS] Flushing events:', events.length, 'events');
    }
    
    // Mock analytics payload
    const payload = {
      sessionId: this.sessionId,
      deploymentId: this.deploymentId,
      timestamp: Date.now(),
      events,
      summary: this.generateEventSummary(events),
    };
    
    this.sendBatch(payload);
  }

  private generateEventSummary(events: SearchAnalytics[]) {
    const totalSearches = events.length;
    const successfulSearches = events.filter(e => e.success).length;
    const averageResponseTime = events.reduce((sum, e) => sum + e.responseTime, 0) / totalSearches;
    const uniqueQueries = new Set(events.map(e => e.searchQuery)).size;
    
    return {
      totalSearches,
      successfulSearches,
      successRate: successfulSearches / totalSearches,
      averageResponseTime,
      uniqueQueries,
      searchTypes: this.groupBy(events, 'searchType'),
      languages: this.groupBy(events, 'language'),
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private updatePerformanceMetrics(analytics: SearchAnalytics): void {
    // Update performance tracking
    const metrics = {
      timestamp: analytics.timestamp,
      responseTime: analytics.responseTime,
      success: analytics.success,
      resultsCount: analytics.resultsCount,
    };
    
    // Store in session storage for dashboard
    const existingMetrics = JSON.parse(sessionStorage.getItem('searchMetrics') || '[]');
    existingMetrics.push(metrics);
    
    // Keep only last 100 metrics
    if (existingMetrics.length > 100) {
      existingMetrics.splice(0, existingMetrics.length - 100);
    }
    
    sessionStorage.setItem('searchMetrics', JSON.stringify(existingMetrics));
  }

  private sendEvent(event: any): void {
    // In production, send to analytics service
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ANALYTICS] Event tracked:', event);
    }
  }

  private sendBatch(payload: any): void {
    // In production, send batch to analytics service
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ANALYTICS] Batch sent:', payload.summary);
    }
  }

  // Public API for getting analytics data
  public getSessionMetrics() {
    const metrics = JSON.parse(sessionStorage.getItem('searchMetrics') || '[]');
    return {
      sessionId: this.sessionId,
      totalSearches: metrics.length,
      averageResponseTime: metrics.reduce((sum: number, m: any) => sum + m.responseTime, 0) / metrics.length,
      successRate: metrics.filter((m: any) => m.success).length / metrics.length,
      recentMetrics: metrics.slice(-10), // Last 10 searches
    };
  }

  // Cleanup method
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flushEvents(); // Send any remaining events
  }
}