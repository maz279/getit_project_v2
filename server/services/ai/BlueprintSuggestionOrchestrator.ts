/**
 * Blueprint Suggestion Orchestrator
 * Connects all existing blueprint components following the original architecture
 * Uses existing services: IntelligentSearch, VisualSearch, BangladeshExpertise, etc.
 */

import { SuggestRequest, SuggestHit, SuggestResponse } from '../../../shared/contracts/suggest';
import { IntelligentSearchService } from './IntelligentSearchService';
import BangladeshExpertiseService from './BangladeshExpertiseService';
import { GroqAIService } from './GroqAIService';
import { AmazonStyleSuggestionService } from './AmazonStyleSuggestionService';

export class BlueprintSuggestionOrchestrator {
  private static instance: BlueprintSuggestionOrchestrator;
  
  // Existing blueprint services
  private intelligentSearch: IntelligentSearchService;
  private bangladeshExpertise: BangladeshExpertiseService;
  private groqAI: GroqAIService;
  private amazonSuggestions: AmazonStyleSuggestionService;

  private constructor() {
    this.intelligentSearch = IntelligentSearchService.getInstance();
    this.bangladeshExpertise = BangladeshExpertiseService.getInstance();
    this.groqAI = GroqAIService.getInstance();
    this.amazonSuggestions = AmazonStyleSuggestionService.getInstance();
  }

  public static getInstance(): BlueprintSuggestionOrchestrator {
    if (!BlueprintSuggestionOrchestrator.instance) {
      BlueprintSuggestionOrchestrator.instance = new BlueprintSuggestionOrchestrator();
    }
    return BlueprintSuggestionOrchestrator.instance;
  }

  /**
   * Main blueprint orchestrator - connects all existing multi-source services
   */
  public async getSuggestions(req: SuggestRequest): Promise<SuggestResponse> {
    const startTime = Date.now();
    const sourceTimings: Record<string, number> = {};
    const sources: string[] = [];

    console.log(`🎯 BLUEPRINT: Orchestrating multi-source suggestions for "${req.q}"`);

    // Execute all suggestion sources in parallel using existing services
    const promises = [
      this.getCatalogSuggestions(req).then(result => ({ source: 'catalog', result, timing: Date.now() - startTime })),
      this.getQueryLogSuggestions(req).then(result => ({ source: 'querylog', result, timing: Date.now() - startTime })),
      this.getImageSuggestions(req).then(result => ({ source: 'image', result, timing: Date.now() - startTime })),
      this.getQRSuggestions(req).then(result => ({ source: 'qr', result, timing: Date.now() - startTime })),
      this.getMLSuggestions(req).then(result => ({ source: 'mlgen', result, timing: Date.now() - startTime })),
      this.getNavigationSuggestions(req).then(result => ({ source: 'navigation', result, timing: Date.now() - startTime }))
    ];

    const buckets = await Promise.allSettled(promises);
    const results: SuggestHit[] = [];

    // Process results from all sources
    buckets.forEach(bucket => {
      if (bucket.status === 'fulfilled') {
        const { source, result, timing } = bucket.value;
        sourceTimings[source] = timing;
        sources.push(source);
        results.push(...result);
        console.log(`✅ BLUEPRINT: ${source} source returned ${result.length} suggestions`);
      } else {
        console.warn(`❌ BLUEPRINT: Source failed:`, bucket.reason);
      }
    });

    // Apply blueprint hybrid ranking and deduplication
    const rankedResults = this.applyBlueprintRanking(results, req);
    const totalTime = Date.now() - startTime;

    console.log(`🎯 BLUEPRINT: Completed in ${totalTime}ms with ${rankedResults.length} suggestions from ${sources.length} sources`);

    return {
      success: true,
      data: rankedResults.slice(0, req.context.limit || 10),
      metadata: {
        query: req.q,
        sources,
        totalTime,
        sourceTimings,
        count: rankedResults.length
      }
    };
  }

  /**
   * Catalog suggestions using existing Amazon-style service + IntelligentSearch
   */
  private async getCatalogSuggestions(req: SuggestRequest): Promise<SuggestHit[]> {
    if (!req.q || req.q.length < 2) return [];

    try {
      // Use existing Amazon-style suggestions
      const amazonSuggestions = await this.amazonSuggestions.getSuggestions(req.q, {
        location: req.context.geo || 'BD',
        vendorId: req.context.vendorId ? parseInt(req.context.vendorId) : undefined,
        limit: 5
      });

      // Use existing IntelligentSearch service
      const intelligentSuggestions = await this.intelligentSearch.generateIntelligentSuggestions(req.q, {
        userId: req.context.userId,
        language: req.context.language || 'en',
        previousSearches: [],
        location: req.context.geo
      });

      const results: SuggestHit[] = [];

      // Convert Amazon suggestions
      amazonSuggestions.forEach(s => {
        results.push({
          text: s.text,
          source: 'catalog' as const,
          score: s.importance || 70,
          type: s.type as any || 'product',
          metadata: {
            productIds: s.metadata?.productIds || [],
            category: s.metadata?.category,
            brand: s.metadata?.brand
          }
        });
      });

      // Convert intelligent suggestions
      intelligentSuggestions.forEach(s => {
        results.push({
          text: s.text,
          source: 'catalog' as const,
          score: s.relevanceScore * 100,
          type: s.type as any,
          metadata: {
            frequency: s.frequency,
            originalSource: s.source
          }
        });
      });

      return results;
    } catch (error) {
      console.error('Catalog suggestions error:', error);
      return [];
    }
  }

  /**
   * Query log suggestions using Bangladesh expertise
   */
  private async getQueryLogSuggestions(req: SuggestRequest): Promise<SuggestHit[]> {
    if (!req.q || req.q.length < 2) return [];

    try {
      // Use existing Bangladesh expertise for trending queries
      const expertise = await this.bangladeshExpertise.getBangladeshExpertise({
        query: req.q,
        expertiseType: 'cultural',
        context: {
          location: req.context.geo,
          timeframe: 'current'
        }
      });

      const results: SuggestHit[] = [];

      if (expertise.success && expertise.data) {
        // Generate trending query suggestions based on cultural context
        const culturalSuggestions = [
          `${req.q} price in Bangladesh`,
          `${req.q} best brands`,
          `${req.q} reviews`,
          `${req.q} buy online`,
          `${req.q} deals today`
        ];

        culturalSuggestions.forEach((text, index) => {
          results.push({
            text,
            source: 'querylog' as const,
            score: 90 - (index * 5),
            type: 'trending',
            metadata: {
              confidence: 0.85,
              cultural: true
            }
          });
        });
      }

      return results.slice(0, 3);
    } catch (error) {
      console.error('Query log suggestions error:', error);
      return [];
    }
  }

  /**
   * Image-based suggestions (placeholder for existing VisualSearchController)
   */
  private async getImageSuggestions(req: SuggestRequest): Promise<SuggestHit[]> {
    if (!req.context.imagePayload) return [];

    try {
      // Simulate existing visual search service integration
      const mockLabels = ['laptop computer', 'technology device', 'electronics'];
      
      return mockLabels.map((label, index) => ({
        text: label,
        source: 'image' as const,
        score: 90 - (index * 10),
        type: 'product',
        metadata: {
          confidence: 0.9 - (index * 0.1),
          imageAnalysis: true
        }
      }));
    } catch (error) {
      console.error('Image suggestions error:', error);
      return [];
    }
  }

  /**
   * QR code suggestions (placeholder for existing QR services)
   */
  private async getQRSuggestions(req: SuggestRequest): Promise<SuggestHit[]> {
    if (!req.context.qrPayload) return [];

    try {
      // Simulate existing QR search integration
      return [{
        text: req.context.qrPayload,
        source: 'qr' as const,
        score: 100,
        type: 'product',
        metadata: {
          qrType: 'product',
          confidence: 1.0
        }
      }];
    } catch (error) {
      console.error('QR suggestions error:', error);
      return [];
    }
  }

  /**
   * ML-generated suggestions using existing Grok AI service
   */
  private async getMLSuggestions(req: SuggestRequest): Promise<SuggestHit[]> {
    if (!req.q || req.q.length < 3) return [];

    try {
      const prompt = `Generate 3 smart search completions for "${req.q}" in Bangladesh marketplace. Focus on:
      - Product completions
      - Price-related queries  
      - Local brand preferences
      
      Return only the completion texts, no JSON format.`;

      const response = await this.groqAI.generateResponse(prompt, {
        maxTokens: 150,
        temperature: 0.7
      });

      // Parse response into suggestions
      const lines = response.split('\n').filter(line => line.trim().length > 0);
      
      return lines.slice(0, 3).map((text, index) => ({
        text: text.replace(/^\d+\.\s*/, '').trim(),
        source: 'mlgen' as const,
        score: 80 - (index * 5),
        type: 'completion',
        metadata: {
          confidence: 0.8 - (index * 0.1),
          mlGenerated: true
        }
      }));
    } catch (error) {
      console.error('ML suggestions error:', error);
      return [];
    }
  }

  /**
   * Navigation suggestions
   */
  private async getNavigationSuggestions(req: SuggestRequest): Promise<SuggestHit[]> {
    if (!req.q || req.q.length < 2) return [];

    const navigationItems = [
      { text: 'Help Center', keywords: ['help', 'support', 'faq'] },
      { text: 'My Account', keywords: ['account', 'profile', 'settings'] },
      { text: 'Orders', keywords: ['order', 'purchase', 'buy'] },
      { text: 'Cart', keywords: ['cart', 'basket', 'checkout'] },
      { text: 'Categories', keywords: ['category', 'browse', 'shop'] }
    ];

    const matches = navigationItems.filter(item => 
      item.keywords.some(keyword => 
        keyword.includes(req.q.toLowerCase()) || 
        req.q.toLowerCase().includes(keyword)
      )
    );

    return matches.slice(0, 2).map(item => ({
      text: item.text,
      source: 'navigation' as const,
      score: 75,
      type: 'navigation',
      metadata: {
        confidence: 0.8
      }
    }));
  }

  /**
   * Blueprint hybrid ranking algorithm
   */
  private applyBlueprintRanking(results: SuggestHit[], req: SuggestRequest): SuggestHit[] {
    // Remove duplicates
    const unique = this.deduplicateResults(results);

    // Apply blueprint scoring
    return unique
      .map(hit => ({
        ...hit,
        score: this.calculateBlueprintScore(hit, req)
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Deduplication with text similarity
   */
  private deduplicateResults(results: SuggestHit[]): SuggestHit[] {
    const seen = new Set<string>();
    return results.filter(hit => {
      const key = hit.text.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Blueprint hybrid scoring
   */
  private calculateBlueprintScore(hit: SuggestHit, req: SuggestRequest): number {
    let score = hit.score;

    // Source priority boost (following blueprint architecture)
    const sourceBoosts = {
      'catalog': 1.0,    // Base catalog suggestions
      'querylog': 1.2,   // Trending queries boost
      'image': 1.5,      // Visual search premium
      'qr': 2.0,         // QR code highest priority
      'mlgen': 1.1,      // AI-generated slight boost
      'navigation': 0.8  // Navigation lower priority
    };
    score *= sourceBoosts[hit.source] || 1.0;

    // Type priority boost
    const typeBoosts = {
      'product': 1.0,
      'trending': 1.3,
      'completion': 1.1,
      'category': 0.9,
      'navigation': 0.7
    };
    score *= typeBoosts[hit.type] || 1.0;

    // Query relevance boost
    const queryLower = req.q.toLowerCase();
    const textLower = hit.text.toLowerCase();
    
    if (textLower.startsWith(queryLower)) {
      score *= 1.5; // Prefix match
    } else if (textLower.includes(queryLower)) {
      score *= 1.2; // Contains match
    }

    // Confidence boost
    if (hit.metadata?.confidence) {
      score *= hit.metadata.confidence;
    }

    return Math.round(score * 100) / 100;
  }
}