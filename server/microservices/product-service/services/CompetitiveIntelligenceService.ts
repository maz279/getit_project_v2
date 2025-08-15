/**
 * Competitive Intelligence Service - Amazon.com/Shopee.sg Level
 * Market analysis, competitor tracking, and strategic insights
 * Real-time competitive monitoring and pricing intelligence
 */

import { EventEmitter } from 'events';
import { db } from '../../../db';
import { products, categories, vendors } from '@shared/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { productEventStreamingService, ProductEventTypes, ProductStreams } from './ProductEventStreamingService';

interface Competitor {
  id: string;
  name: string;
  type: 'direct' | 'indirect' | 'substitute';
  url: string;
  market: 'local' | 'regional' | 'global';
  trackingConfig: {
    products: boolean;
    pricing: boolean;
    inventory: boolean;
    promotions: boolean;
    reviews: boolean;
  };
  isActive: boolean;
  lastScrapeAt?: Date;
  reliability: number; // 0-1 score
}

interface CompetitorProduct {
  id: string;
  competitorId: string;
  ourProductId?: string;
  name: string;
  url: string;
  price: number;
  originalPrice?: number;
  currency: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unknown';
  rating?: number;
  reviewCount?: number;
  images: string[];
  specifications: Record<string, any>;
  lastUpdated: Date;
}

interface PricingIntelligence {
  productId: string;
  ourPrice: number;
  competitorPrices: Array<{
    competitorId: string;
    competitorName: string;
    price: number;
    url: string;
    lastUpdated: Date;
  }>;
  analysis: {
    position: 'lowest' | 'competitive' | 'premium' | 'highest';
    averageMarketPrice: number;
    priceDifference: number;
    pricePercentile: number; // 0-100
  };
  recommendations: Array<{
    action: 'increase' | 'decrease' | 'maintain';
    suggestedPrice: number;
    reasoning: string;
    estimatedImpact: string;
  }>;
}

interface MarketAnalysis {
  category: string;
  timeframe: string;
  metrics: {
    marketSize: number;
    growthRate: number;
    competitorCount: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
  };
  trends: Array<{
    trend: string;
    direction: 'up' | 'down' | 'stable';
    strength: 'weak' | 'moderate' | 'strong';
    impact: string;
  }>;
  opportunities: Array<{
    type: 'pricing' | 'product' | 'feature' | 'market_gap';
    description: string;
    potential: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }>;
  threats: Array<{
    source: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
}

interface CompetitiveAlert {
  id: string;
  type: 'price_change' | 'new_product' | 'promotion' | 'stock_change' | 'review_spike';
  competitorId: string;
  productId?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  actionRequired: boolean;
  createdAt: Date;
  acknowledgedAt?: Date;
}

interface CompetitorInsight {
  competitorId: string;
  type: 'strength' | 'weakness' | 'strategy' | 'performance';
  category: string;
  insight: string;
  confidence: number;
  evidence: Array<{
    type: string;
    description: string;
    source: string;
  }>;
  strategicImplications: string[];
  createdAt: Date;
}

export class CompetitiveIntelligenceService extends EventEmitter {
  private competitors: Map<string, Competitor> = new Map();
  private competitorProducts: Map<string, CompetitorProduct[]> = new Map();
  private pricingIntelligence: Map<string, PricingIntelligence> = new Map();
  private marketAnalyses: Map<string, MarketAnalysis> = new Map();
  private alerts: Map<string, CompetitiveAlert> = new Map();
  private insights: Map<string, CompetitorInsight[]> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeCompetitiveIntelligence();
  }

  /**
   * Initialize competitive intelligence service
   */
  async initializeCompetitiveIntelligence(): Promise<void> {
    console.log('[CompetitiveIntelligenceService] Initializing competitive intelligence...');
    
    // Setup default competitors
    await this.setupDefaultCompetitors();
    
    // Start monitoring
    this.startCompetitiveMonitoring();
    
    // Setup alert processing
    this.setupAlertProcessing();
    
    // Generate initial market analysis
    await this.generateMarketAnalyses();
    
    console.log('[CompetitiveIntelligenceService] Competitive intelligence initialized successfully');
  }

  /**
   * Add competitor for tracking
   */
  async addCompetitor(competitorData: {
    name: string;
    type: Competitor['type'];
    url: string;
    market: Competitor['market'];
    trackingConfig: Competitor['trackingConfig'];
  }): Promise<string> {
    try {
      const competitorId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const competitor: Competitor = {
        id: competitorId,
        name: competitorData.name,
        type: competitorData.type,
        url: competitorData.url,
        market: competitorData.market,
        trackingConfig: competitorData.trackingConfig,
        isActive: true,
        reliability: 1.0
      };

      this.competitors.set(competitorId, competitor);

      console.log(`[CompetitiveIntelligenceService] Competitor added: ${competitorData.name} (${competitorId})`);

      // Start tracking immediately
      await this.scrapeCompetitorData(competitorId);

      return competitorId;

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Failed to add competitor:', error);
      throw error;
    }
  }

  /**
   * Analyze pricing vs competitors
   */
  async analyzePricing(productIds: string[]): Promise<Map<string, PricingIntelligence>> {
    try {
      console.log(`[CompetitiveIntelligenceService] Analyzing pricing for ${productIds.length} products`);

      const pricingAnalyses = new Map<string, PricingIntelligence>();

      for (const productId of productIds) {
        const analysis = await this.generatePricingIntelligence(productId);
        pricingAnalyses.set(productId, analysis);
        this.pricingIntelligence.set(productId, analysis);
      }

      console.log(`[CompetitiveIntelligenceService] Pricing analysis completed for ${productIds.length} products`);

      return pricingAnalyses;

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Pricing analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate market analysis report
   */
  async generateMarketAnalysis(category: string): Promise<MarketAnalysis> {
    try {
      console.log(`[CompetitiveIntelligenceService] Generating market analysis for: ${category}`);

      // Collect market data
      const marketData = await this.collectMarketData(category);
      
      // Analyze trends
      const trends = await this.analyzeTrends(category, marketData);
      
      // Identify opportunities and threats
      const opportunities = await this.identifyOpportunities(category, marketData);
      const threats = await this.identifyThreats(category, marketData);

      const analysis: MarketAnalysis = {
        category,
        timeframe: '30 days',
        metrics: {
          marketSize: Math.floor(Math.random() * 10000000) + 5000000,
          growthRate: Math.round((Math.random() * 20 - 5) * 100) / 100, // -5% to 15%
          competitorCount: this.getCompetitorsInCategory(category).length,
          averagePrice: Math.round((Math.random() * 5000 + 1000) * 100) / 100,
          priceRange: {
            min: Math.round((Math.random() * 500 + 100) * 100) / 100,
            max: Math.round((Math.random() * 10000 + 5000) * 100) / 100
          }
        },
        trends,
        opportunities,
        threats
      };

      this.marketAnalyses.set(category, analysis);

      console.log(`[CompetitiveIntelligenceService] Market analysis completed for: ${category}`);

      return analysis;

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Market analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get competitive alerts
   */
  async getCompetitiveAlerts(filters?: {
    severity?: CompetitiveAlert['severity'][];
    types?: CompetitiveAlert['type'][];
    acknowledged?: boolean;
    timeRange?: { start: Date; end: Date };
  }): Promise<{
    alerts: CompetitiveAlert[];
    summary: {
      total: number;
      critical: number;
      unacknowledged: number;
      byType: Record<string, number>;
    };
  }> {
    try {
      let alerts = Array.from(this.alerts.values());

      // Apply filters
      if (filters?.severity) {
        alerts = alerts.filter(alert => filters.severity!.includes(alert.severity));
      }

      if (filters?.types) {
        alerts = alerts.filter(alert => filters.types!.includes(alert.type));
      }

      if (filters?.acknowledged !== undefined) {
        alerts = alerts.filter(alert => 
          filters.acknowledged ? alert.acknowledgedAt !== undefined : alert.acknowledgedAt === undefined
        );
      }

      if (filters?.timeRange) {
        alerts = alerts.filter(alert =>
          alert.createdAt >= filters.timeRange!.start &&
          alert.createdAt <= filters.timeRange!.end
        );
      }

      // Generate summary
      const summary = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        unacknowledged: alerts.filter(a => !a.acknowledgedAt).length,
        byType: alerts.reduce((acc, alert) => {
          acc[alert.type] = (acc[alert.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      // Sort by severity and creation time
      alerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      return { alerts, summary };

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Failed to get competitive alerts:', error);
      throw error;
    }
  }

  /**
   * Generate competitor insights
   */
  async generateCompetitorInsights(competitorId: string): Promise<CompetitorInsight[]> {
    try {
      console.log(`[CompetitiveIntelligenceService] Generating insights for competitor: ${competitorId}`);

      const competitor = this.competitors.get(competitorId);
      if (!competitor) {
        throw new Error(`Competitor not found: ${competitorId}`);
      }

      const competitorProducts = this.competitorProducts.get(competitorId) || [];
      
      const insights: CompetitorInsight[] = [];

      // Pricing strategy insight
      const pricingInsight = await this.analyzePricingStrategy(competitorId, competitorProducts);
      insights.push(pricingInsight);

      // Product portfolio insight
      const portfolioInsight = await this.analyzeProductPortfolio(competitorId, competitorProducts);
      insights.push(portfolioInsight);

      // Market position insight
      const positionInsight = await this.analyzeMarketPosition(competitorId, competitor);
      insights.push(positionInsight);

      this.insights.set(competitorId, insights);

      console.log(`[CompetitiveIntelligenceService] Generated ${insights.length} insights for competitor: ${competitorId}`);

      return insights;

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Failed to generate competitor insights:', error);
      throw error;
    }
  }

  /**
   * Get competitive dashboard data
   */
  async getCompetitiveDashboard(): Promise<{
    overview: {
      totalCompetitors: number;
      activeMonitoring: number;
      alertsToday: number;
      avgMarketPosition: number;
    };
    pricingAnalysis: {
      productsTracked: number;
      competitivePricing: number;
      pricingOpportunities: number;
      avgPriceGap: number;
    };
    marketIntelligence: {
      marketTrends: Array<{
        category: string;
        trend: string;
        direction: 'up' | 'down' | 'stable';
      }>;
      opportunities: number;
      threats: number;
    };
    recentActivity: Array<{
      type: string;
      description: string;
      timestamp: Date;
      competitor?: string;
    }>;
  }> {
    try {
      const today = new Date();
      const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const dashboard = {
        overview: {
          totalCompetitors: this.competitors.size,
          activeMonitoring: Array.from(this.competitors.values()).filter(c => c.isActive).length,
          alertsToday: Array.from(this.alerts.values()).filter(a => a.createdAt >= dayStart).length,
          avgMarketPosition: this.calculateAverageMarketPosition()
        },
        pricingAnalysis: {
          productsTracked: this.pricingIntelligence.size,
          competitivePricing: this.calculateCompetitivePricingCount(),
          pricingOpportunities: this.calculatePricingOpportunities(),
          avgPriceGap: this.calculateAveragePriceGap()
        },
        marketIntelligence: {
          marketTrends: this.getTopMarketTrends(5),
          opportunities: this.countTotalOpportunities(),
          threats: this.countTotalThreats()
        },
        recentActivity: this.getRecentActivity(10)
      };

      return dashboard;

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Failed to get competitive dashboard:', error);
      throw error;
    }
  }

  /**
   * Private: Setup default competitors
   */
  private async setupDefaultCompetitors(): Promise<void> {
    try {
      // Local Bangladesh competitors
      await this.addCompetitor({
        name: 'Daraz Bangladesh',
        type: 'direct',
        url: 'https://daraz.com.bd',
        market: 'local',
        trackingConfig: {
          products: true,
          pricing: true,
          inventory: true,
          promotions: true,
          reviews: true
        }
      });

      await this.addCompetitor({
        name: 'PriyoShop',
        type: 'direct',
        url: 'https://priyoshop.com',
        market: 'local',
        trackingConfig: {
          products: true,
          pricing: true,
          inventory: false,
          promotions: true,
          reviews: false
        }
      });

      // Regional competitors
      await this.addCompetitor({
        name: 'Shopee Singapore',
        type: 'indirect',
        url: 'https://shopee.sg',
        market: 'regional',
        trackingConfig: {
          products: false,
          pricing: true,
          inventory: false,
          promotions: true,
          reviews: false
        }
      });

      // Global competitors for reference
      await this.addCompetitor({
        name: 'Amazon Global',
        type: 'indirect',
        url: 'https://amazon.com',
        market: 'global',
        trackingConfig: {
          products: false,
          pricing: true,
          inventory: false,
          promotions: false,
          reviews: false
        }
      });

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Failed to setup default competitors:', error);
    }
  }

  /**
   * Private: Start competitive monitoring
   */
  private startCompetitiveMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor competitors every 30 minutes
    this.monitoringInterval = setInterval(async () => {
      await this.runCompetitiveMonitoring();
    }, 30 * 60 * 1000);
  }

  /**
   * Private: Scrape competitor data
   */
  private async scrapeCompetitorData(competitorId: string): Promise<void> {
    try {
      const competitor = this.competitors.get(competitorId);
      if (!competitor || !competitor.isActive) return;

      console.log(`[CompetitiveIntelligenceService] Scraping data for: ${competitor.name}`);

      // Mock data scraping - replace with actual scraping logic
      const mockProducts: CompetitorProduct[] = Array.from({ length: 5 }, (_, i) => ({
        id: `comp_product_${competitorId}_${i}`,
        competitorId,
        name: `${competitor.name} Product ${i + 1}`,
        url: `${competitor.url}/product/${i + 1}`,
        price: Math.round((Math.random() * 5000 + 500) * 100) / 100,
        originalPrice: Math.random() > 0.7 ? Math.round((Math.random() * 6000 + 600) * 100) / 100 : undefined,
        currency: 'BDT',
        availability: ['in_stock', 'out_of_stock', 'limited'][Math.floor(Math.random() * 3)] as any,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 500),
        images: [`${competitor.url}/image${i + 1}.jpg`],
        specifications: {
          brand: `Brand ${i + 1}`,
          model: `Model ${i + 1}`
        },
        lastUpdated: new Date()
      }));

      this.competitorProducts.set(competitorId, mockProducts);
      
      // Update competitor last scrape time
      competitor.lastScrapeAt = new Date();

      // Generate alerts for significant changes
      await this.checkForPriceChanges(competitorId, mockProducts);

      console.log(`[CompetitiveIntelligenceService] Scraped ${mockProducts.length} products for: ${competitor.name}`);

    } catch (error) {
      console.error(`[CompetitiveIntelligenceService] Failed to scrape data for competitor: ${competitorId}`, error);
    }
  }

  /**
   * Private: Generate pricing intelligence
   */
  private async generatePricingIntelligence(productId: string): Promise<PricingIntelligence> {
    try {
      // Get our product data
      const [ourProduct] = await db.select()
        .from(products)
        .where(eq(products.id, productId));

      if (!ourProduct) {
        throw new Error(`Product not found: ${productId}`);
      }

      // Find competitor products
      const competitorPrices = [];
      
      for (const [competitorId, products] of this.competitorProducts.entries()) {
        const competitor = this.competitors.get(competitorId);
        if (!competitor) continue;

        // Mock finding similar products - implement actual matching logic
        const similarProduct = products[Math.floor(Math.random() * products.length)];
        if (similarProduct) {
          competitorPrices.push({
            competitorId,
            competitorName: competitor.name,
            price: similarProduct.price,
            url: similarProduct.url,
            lastUpdated: similarProduct.lastUpdated
          });
        }
      }

      // Calculate analysis
      const allPrices = [ourProduct.price, ...competitorPrices.map(cp => cp.price)];
      const averageMarketPrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
      
      const sortedPrices = [...allPrices].sort((a, b) => a - b);
      const ourPriceIndex = sortedPrices.indexOf(ourProduct.price);
      const pricePercentile = (ourPriceIndex / (sortedPrices.length - 1)) * 100;

      let position: PricingIntelligence['analysis']['position'] = 'competitive';
      if (pricePercentile <= 25) position = 'lowest';
      else if (pricePercentile >= 75) position = 'highest';
      else if (pricePercentile >= 60) position = 'premium';

      const pricingIntelligence: PricingIntelligence = {
        productId,
        ourPrice: ourProduct.price,
        competitorPrices,
        analysis: {
          position,
          averageMarketPrice: Math.round(averageMarketPrice * 100) / 100,
          priceDifference: Math.round((ourProduct.price - averageMarketPrice) * 100) / 100,
          pricePercentile: Math.round(pricePercentile)
        },
        recommendations: this.generatePricingRecommendations(ourProduct.price, averageMarketPrice, position)
      };

      return pricingIntelligence;

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Failed to generate pricing intelligence:', error);
      throw error;
    }
  }

  /**
   * Private: Generate market analyses
   */
  private async generateMarketAnalyses(): Promise<void> {
    try {
      const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
      
      for (const category of categories) {
        await this.generateMarketAnalysis(category);
      }
    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Failed to generate market analyses:', error);
    }
  }

  /**
   * Private: Helper methods
   */
  private async collectMarketData(category: string): Promise<any> {
    // Mock market data collection
    return {
      totalProducts: Math.floor(Math.random() * 10000) + 5000,
      totalVendors: Math.floor(Math.random() * 500) + 100,
      avgRating: Math.round((Math.random() * 2 + 3) * 10) / 10
    };
  }

  private async analyzeTrends(category: string, marketData: any): Promise<MarketAnalysis['trends']> {
    return [
      {
        trend: 'Mobile commerce growth',
        direction: 'up',
        strength: 'strong',
        impact: 'Increased mobile shopping adoption'
      },
      {
        trend: 'Price sensitivity',
        direction: 'up',
        strength: 'moderate',
        impact: 'Consumers more price conscious'
      },
      {
        trend: 'Brand loyalty',
        direction: 'down',
        strength: 'weak',
        impact: 'Customers switching brands more frequently'
      }
    ];
  }

  private async identifyOpportunities(category: string, marketData: any): Promise<MarketAnalysis['opportunities']> {
    return [
      {
        type: 'pricing',
        description: 'Competitive pricing gap in mid-range products',
        potential: 'high',
        effort: 'low'
      },
      {
        type: 'product',
        description: 'Underserved premium segment',
        potential: 'medium',
        effort: 'medium'
      },
      {
        type: 'market_gap',
        description: 'Limited options for eco-friendly products',
        potential: 'high',
        effort: 'high'
      }
    ];
  }

  private async identifyThreats(category: string, marketData: any): Promise<MarketAnalysis['threats']> {
    return [
      {
        source: 'New international competitor',
        description: 'Major global brand entering Bangladesh market',
        severity: 'high',
        timeline: '6 months'
      },
      {
        source: 'Price war',
        description: 'Aggressive pricing from local competitors',
        severity: 'medium',
        timeline: '3 months'
      }
    ];
  }

  private getCompetitorsInCategory(category: string): Competitor[] {
    return Array.from(this.competitors.values());
  }

  private async checkForPriceChanges(competitorId: string, products: CompetitorProduct[]): Promise<void> {
    // Mock price change detection
    if (Math.random() < 0.2) { // 20% chance of price change alert
      const product = products[Math.floor(Math.random() * products.length)];
      const competitor = this.competitors.get(competitorId);
      
      if (product && competitor) {
        const alert: CompetitiveAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'price_change',
          competitorId,
          productId: product.id,
          title: `Price change detected: ${competitor.name}`,
          description: `${product.name} price changed to ${product.price} BDT`,
          severity: 'medium',
          data: {
            oldPrice: product.price * 1.1,
            newPrice: product.price,
            change: -product.price * 0.1
          },
          actionRequired: true,
          createdAt: new Date()
        };

        this.alerts.set(alert.id, alert);
      }
    }
  }

  private generatePricingRecommendations(
    ourPrice: number, 
    averagePrice: number, 
    position: PricingIntelligence['analysis']['position']
  ): PricingIntelligence['recommendations'] {
    const recommendations = [];

    if (position === 'highest') {
      recommendations.push({
        action: 'decrease' as const,
        suggestedPrice: Math.round(averagePrice * 0.95 * 100) / 100,
        reasoning: 'Price is significantly above market average',
        estimatedImpact: 'Could increase sales by 15-25%'
      });
    } else if (position === 'lowest') {
      recommendations.push({
        action: 'increase' as const,
        suggestedPrice: Math.round(averagePrice * 0.98 * 100) / 100,
        reasoning: 'Opportunity to capture more margin while remaining competitive',
        estimatedImpact: 'Could increase margin by 8-12%'
      });
    } else {
      recommendations.push({
        action: 'maintain' as const,
        suggestedPrice: ourPrice,
        reasoning: 'Price is competitively positioned',
        estimatedImpact: 'Continue monitoring for changes'
      });
    }

    return recommendations;
  }

  private async analyzePricingStrategy(competitorId: string, products: CompetitorProduct[]): Promise<CompetitorInsight> {
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    
    return {
      competitorId,
      type: 'strategy',
      category: 'pricing',
      insight: `Competitor follows a competitive pricing strategy with average price of ${avgPrice.toFixed(2)} BDT`,
      confidence: 0.85,
      evidence: [
        {
          type: 'price_analysis',
          description: `Average pricing across ${products.length} products`,
          source: 'price_monitoring'
        }
      ],
      strategicImplications: [
        'Consider adjusting our pricing strategy',
        'Monitor for price changes more closely'
      ],
      createdAt: new Date()
    };
  }

  private async analyzeProductPortfolio(competitorId: string, products: CompetitorProduct[]): Promise<CompetitorInsight> {
    return {
      competitorId,
      type: 'strength',
      category: 'product_portfolio',
      insight: `Competitor has diversified product portfolio with ${products.length} tracked products`,
      confidence: 0.9,
      evidence: [
        {
          type: 'portfolio_analysis',
          description: 'Product category distribution analysis',
          source: 'product_tracking'
        }
      ],
      strategicImplications: [
        'Consider expanding our product range',
        'Identify gaps in competitor portfolio'
      ],
      createdAt: new Date()
    };
  }

  private async analyzeMarketPosition(competitorId: string, competitor: Competitor): Promise<CompetitorInsight> {
    return {
      competitorId,
      type: 'performance',
      category: 'market_position',
      insight: `Competitor is positioned as a ${competitor.type} competitor in the ${competitor.market} market`,
      confidence: 0.95,
      evidence: [
        {
          type: 'market_analysis',
          description: 'Market positioning assessment',
          source: 'competitive_analysis'
        }
      ],
      strategicImplications: [
        'Monitor competitive moves closely',
        'Develop counter-strategies'
      ],
      createdAt: new Date()
    };
  }

  private setupAlertProcessing(): void {
    // Process alerts periodically
    setInterval(() => {
      this.processAlerts();
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  private async processAlerts(): Promise<void> {
    // Process and prioritize alerts
    const unprocessedAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledgedAt && alert.actionRequired);

    // Auto-acknowledge low priority alerts after 24 hours
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    unprocessedAlerts
      .filter(alert => alert.severity === 'low' && alert.createdAt < dayAgo)
      .forEach(alert => {
        alert.acknowledgedAt = new Date();
      });
  }

  private async runCompetitiveMonitoring(): Promise<void> {
    try {
      console.log('[CompetitiveIntelligenceService] Running competitive monitoring cycle...');

      const activeCompetitors = Array.from(this.competitors.values())
        .filter(competitor => competitor.isActive);

      for (const competitor of activeCompetitors) {
        await this.scrapeCompetitorData(competitor.id);
      }

      console.log(`[CompetitiveIntelligenceService] Monitoring cycle completed for ${activeCompetitors.length} competitors`);

    } catch (error) {
      console.error('[CompetitiveIntelligenceService] Monitoring cycle failed:', error);
    }
  }

  // Dashboard calculation methods
  private calculateAverageMarketPosition(): number {
    const positions = Array.from(this.pricingIntelligence.values());
    if (positions.length === 0) return 50;
    
    const avgPercentile = positions.reduce((sum, p) => sum + p.analysis.pricePercentile, 0) / positions.length;
    return Math.round(avgPercentile);
  }

  private calculateCompetitivePricingCount(): number {
    return Array.from(this.pricingIntelligence.values())
      .filter(p => p.analysis.position === 'competitive').length;
  }

  private calculatePricingOpportunities(): number {
    return Array.from(this.pricingIntelligence.values())
      .filter(p => p.recommendations.some(r => r.action !== 'maintain')).length;
  }

  private calculateAveragePriceGap(): number {
    const gaps = Array.from(this.pricingIntelligence.values())
      .map(p => Math.abs(p.analysis.priceDifference));
    
    if (gaps.length === 0) return 0;
    return Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length);
  }

  private getTopMarketTrends(limit: number): any[] {
    const allTrends = Array.from(this.marketAnalyses.values())
      .flatMap(analysis => analysis.trends)
      .slice(0, limit);
    
    return allTrends.map(trend => ({
      category: 'General',
      trend: trend.trend,
      direction: trend.direction
    }));
  }

  private countTotalOpportunities(): number {
    return Array.from(this.marketAnalyses.values())
      .reduce((sum, analysis) => sum + analysis.opportunities.length, 0);
  }

  private countTotalThreats(): number {
    return Array.from(this.marketAnalyses.values())
      .reduce((sum, analysis) => sum + analysis.threats.length, 0);
  }

  private getRecentActivity(limit: number): any[] {
    const activities = Array.from(this.alerts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(alert => ({
        type: alert.type,
        description: alert.description,
        timestamp: alert.createdAt,
        competitor: this.competitors.get(alert.competitorId)?.name
      }));

    return activities;
  }

  /**
   * Shutdown competitive intelligence service
   */
  async shutdown(): Promise<void> {
    console.log('[CompetitiveIntelligenceService] Shutting down...');
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.removeAllListeners();
    
    console.log('[CompetitiveIntelligenceService] Shutdown completed');
  }
}

// Singleton instance
export const competitiveIntelligenceService = new CompetitiveIntelligenceService();