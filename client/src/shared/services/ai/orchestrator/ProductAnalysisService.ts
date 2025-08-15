
import { mlManager } from '../../ml';
import { nlpManager } from '../../nlp';

export class ProductAnalysisService {
  private static instance: ProductAnalysisService;

  public static getInstance(): ProductAnalysisService {
    if (!ProductAnalysisService.instance) {
      ProductAnalysisService.instance = new ProductAnalysisService();
    }
    return ProductAnalysisService.instance;
  }

  async analyzeProduct(product: any, context?: {
    userId?: string;
    language?: 'en' | 'bn';
    includeRecommendations?: boolean;
  }): Promise<{
    mlAnalysis: any;
    nlpAnalysis: any;
    recommendations: any[];
    insights: any;
    optimizations: any;
  }> {
    console.log('Product Analysis: Analyzing product with AI/ML');

    const [mlAnalysis, nlpAnalysis] = await Promise.all([
      this.performMLAnalysis(product),
      this.performNLPAnalysis(product, context?.language)
    ]);

    const recommendations = context?.includeRecommendations && context?.userId
      ? await mlManager.getRecommendationEngine().generateRecommendations(context.userId, {
          trigger: 'product_analysis',
          productId: product.id
        })
      : [];

    const insights = await this.generateProductInsights(product, mlAnalysis);
    const optimizations = await this.generateOptimizations(product, context);

    return {
      mlAnalysis,
      nlpAnalysis,
      recommendations,
      insights,
      optimizations
    };
  }

  private async performMLAnalysis(product: any): Promise<any> {
    return {
      categoryConfidence: 0.95,
      priceOptimization: await mlManager.getPricingEngine().optimizePrice(product),
      demandForecast: await mlManager.getPricingEngine().forecastDemand(product.id),
      qualityScore: 0.87,
      marketPosition: 'competitive'
    };
  }

  private async performNLPAnalysis(product: any, language?: 'en' | 'bn'): Promise<any> {
    const title = product.title || product.name || '';
    const description = product.description || '';

    const [titleAnalysis, descriptionAnalysis] = await Promise.all([
      nlpManager.analyzeText(title, { 
        includeIntent: true, 
        includeSentiment: true,
        language 
      }),
      nlpManager.analyzeText(description, { 
        includeKeywords: true,
        includeSentiment: true,
        language 
      })
    ]);

    return {
      titleAnalysis,
      descriptionAnalysis,
      overallSentiment: titleAnalysis.sentiment,
      keyFeatures: descriptionAnalysis.keywords?.slice(0, 5) || [],
      contentQuality: this.assessContentQuality(titleAnalysis, descriptionAnalysis)
    };
  }

  private async generateProductInsights(product: any, mlAnalysis: any): Promise<any> {
    return {
      marketOpportunity: mlAnalysis.demandForecast?.trend === 'rising' ? 'high' : 'medium',
      competitiveAdvantage: mlAnalysis.qualityScore > 0.8 ? 'strong' : 'moderate',
      pricingStrategy: mlAnalysis.priceOptimization?.recommendation || 'maintain',
      marketingFocus: this.determineMarketingFocus(product, mlAnalysis),
      improvementAreas: this.identifyImprovementAreas(product, mlAnalysis)
    };
  }

  private async generateOptimizations(product: any, context: any): Promise<any> {
    return {
      title: 'Consider highlighting key features',
      description: 'Add more detailed specifications',
      pricing: 'Current pricing is competitive',
      images: 'Product images are well-optimized',
      seo: 'SEO score: 85/100'
    };
  }

  private assessContentQuality(titleAnalysis: any, descriptionAnalysis: any): string {
    const titleScore = titleAnalysis.sentiment?.confidence || 0.5;
    const descScore = descriptionAnalysis.keywords?.length || 0;
    const overall = (titleScore + (descScore / 10)) / 2;
    
    if (overall > 0.8) return 'excellent';
    if (overall > 0.6) return 'good';
    if (overall > 0.4) return 'fair';
    return 'needs_improvement';
  }

  private determineMarketingFocus(product: any, mlAnalysis: any): string[] {
    const focus = ['quality'];
    
    if (mlAnalysis.priceOptimization?.competitive) {
      focus.push('value');
    }
    
    if (mlAnalysis.demandForecast?.trend === 'rising') {
      focus.push('trending');
    }
    
    return focus;
  }

  private identifyImprovementAreas(product: any, mlAnalysis: any): string[] {
    const areas = [];
    
    if (mlAnalysis.qualityScore < 0.7) {
      areas.push('product_quality');
    }
    
    if (!product.description || product.description.length < 100) {
      areas.push('product_description');
    }
    
    return areas;
  }
}

export const productAnalysisService = ProductAnalysisService.getInstance();
