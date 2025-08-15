
import { nlpService } from './NLPService';

export class ContentAnalyzer {
  // Analyze product descriptions
  async analyzeProductContent(product: {
    title: string;
    description: string;
    reviews?: string[];
    category?: string;
  }): Promise<{
    sentiment: any;
    keywords: any;
    readabilityScore: number;
    suggestedTags: string[];
    contentQuality: 'high' | 'medium' | 'low';
    improvements: string[];
  }> {
    console.log('Content Analyzer: Analyzing product content');
    
    await nlpService.initialize();
    
    const fullContent = `${product.title} ${product.description}`;
    
    const [sentiment, keywords] = await Promise.all([
      nlpService.analyzeSentiment(fullContent, { detailed: true }),
      nlpService.extractKeywords(fullContent, { maxKeywords: 8 })
    ]);
    
    const readabilityScore = this.calculateReadability(product.description);
    const suggestedTags = this.generateTags(keywords.keywords, product.category);
    const contentQuality = this.assessContentQuality(product.description, sentiment, readabilityScore);
    const improvements = this.suggestImprovements(product, contentQuality, readabilityScore);
    
    return {
      sentiment,
      keywords,
      readabilityScore,
      suggestedTags,
      contentQuality,
      improvements
    };
  }

  // Analyze customer reviews
  async analyzeReviews(reviews: string[]): Promise<{
    overallSentiment: any;
    aspectSentiments: Array<{
      aspect: string;
      sentiment: string;
      mentions: number;
    }>;
    commonIssues: string[];
    positiveHighlights: string[];
    reviewSummary: string;
  }> {
    console.log('Content Analyzer: Analyzing customer reviews');
    
    if (!reviews || reviews.length === 0) {
      return {
        overallSentiment: { sentiment: 'neutral', confidence: 0 },
        aspectSentiments: [],
        commonIssues: [],
        positiveHighlights: [],
        reviewSummary: 'No reviews available'
      };
    }
    
    const allReviews = reviews.join(' ');
    
    const [overallSentiment, summary] = await Promise.all([
      nlpService.analyzeSentiment(allReviews, { detailed: true }),
      nlpService.summarizeText(allReviews, { maxLength: 150 })
    ]);
    
    const aspectSentiments = this.analyzeAspectSentiments(reviews);
    const commonIssues = this.extractCommonIssues(reviews);
    const positiveHighlights = this.extractPositiveHighlights(reviews);
    
    return {
      overallSentiment,
      aspectSentiments,
      commonIssues,
      positiveHighlights,
      reviewSummary: summary.summary
    };
  }

  // Generate SEO-optimized content
  async generateSEOContent(product: {
    title: string;
    category: string;
    features: string[];
    targetKeywords: string[];
  }): Promise<{
    optimizedTitle: string;
    metaDescription: string;
    productDescription: string;
    keywordDensity: { [key: string]: number };
    seoScore: number;
  }> {
    console.log('Content Analyzer: Generating SEO content');
    
    const optimizedTitle = this.optimizeTitle(product.title, product.targetKeywords);
    const metaDescription = this.generateMetaDescription(product);
    const productDescription = this.generateProductDescription(product);
    
    const keywordDensity = this.calculateKeywordDensity(
      productDescription, 
      product.targetKeywords
    );
    
    const seoScore = this.calculateSEOScore(optimizedTitle, metaDescription, productDescription, keywordDensity);
    
    return {
      optimizedTitle,
      metaDescription,
      productDescription,
      keywordDensity,
      seoScore
    };
  }

  private calculateReadability(text: string): number {
    // Simple readability score based on sentence and word length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Higher score for easier readability (inverse relationship)
    const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence * 2) - (avgCharsPerWord * 3));
    
    return Math.min(100, Math.max(0, readabilityScore));
  }

  private generateTags(keywords: any[], category?: string): string[] {
    const tags = keywords.slice(0, 5).map(k => k.word);
    if (category) tags.unshift(category.toLowerCase());
    return [...new Set(tags)];
  }

  private assessContentQuality(description: string, sentiment: any, readabilityScore: number): 'high' | 'medium' | 'low' {
    const wordCount = description.split(/\s+/).length;
    
    if (wordCount >= 50 && sentiment.confidence > 0.7 && readabilityScore > 60) {
      return 'high';
    } else if (wordCount >= 20 && readabilityScore > 40) {
      return 'medium';
    }
    return 'low';
  }

  private suggestImprovements(product: any, quality: string, readabilityScore: number): string[] {
    const improvements = [];
    
    if (product.description.split(/\s+/).length < 30) {
      improvements.push('Add more detailed product description');
    }
    
    if (readabilityScore < 50) {
      improvements.push('Simplify language for better readability');
    }
    
    if (!product.description.includes(product.category)) {
      improvements.push('Include category-specific keywords');
    }
    
    if (quality === 'low') {
      improvements.push('Enhance content with more features and benefits');
    }
    
    return improvements;
  }

  private analyzeAspectSentiments(reviews: string[]): Array<{
    aspect: string;
    sentiment: string;
    mentions: number;
  }> {
    const aspects = ['quality', 'price', 'delivery', 'service', 'design'];
    
    return aspects.map(aspect => {
      const mentions = reviews.filter(review => 
        review.toLowerCase().includes(aspect)
      ).length;
      
      const sentiment = mentions > 0 ? 'positive' : 'neutral'; // Simplified
      
      return { aspect, sentiment, mentions };
    }).filter(a => a.mentions > 0);
  }

  private extractCommonIssues(reviews: string[]): string[] {
    const issueKeywords = ['problem', 'issue', 'broken', 'defective', 'poor', 'bad'];
    const issues = [];
    
    for (const review of reviews) {
      for (const keyword of issueKeywords) {
        if (review.toLowerCase().includes(keyword)) {
          issues.push(`Issue mentioned: ${keyword}`);
          break;
        }
      }
    }
    
    return [...new Set(issues)].slice(0, 3);
  }

  private extractPositiveHighlights(reviews: string[]): string[] {
    const positiveKeywords = ['excellent', 'great', 'amazing', 'perfect', 'love'];
    const highlights = [];
    
    for (const review of reviews) {
      for (const keyword of positiveKeywords) {
        if (review.toLowerCase().includes(keyword)) {
          highlights.push(`Praised for: ${keyword} quality`);
          break;
        }
      }
    }
    
    return [...new Set(highlights)].slice(0, 3);
  }

  private optimizeTitle(title: string, keywords: string[]): string {
    let optimizedTitle = title;
    
    // Add primary keyword if not present
    if (keywords.length > 0 && !title.toLowerCase().includes(keywords[0].toLowerCase())) {
      optimizedTitle = `${keywords[0]} - ${title}`;
    }
    
    // Ensure title length is SEO-friendly (50-60 characters)
    if (optimizedTitle.length > 60) {
      optimizedTitle = optimizedTitle.substring(0, 57) + '...';
    }
    
    return optimizedTitle;
  }

  private generateMetaDescription(product: any): string {
    const features = product.features?.slice(0, 3).join(', ') || 'high-quality features';
    return `Shop ${product.title} in ${product.category}. Features: ${features}. Best prices and fast delivery guaranteed.`;
  }

  private generateProductDescription(product: any): string {
    const features = product.features?.join(', ') || 'premium features';
    return `Discover the perfect ${product.title} for your needs. This ${product.category} item offers ${features} with exceptional quality and value. Perfect for customers seeking reliable and stylish products.`;
  }

  private calculateKeywordDensity(content: string, keywords: string[]): { [key: string]: number } {
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    const density: { [key: string]: number } = {};
    
    keywords.forEach(keyword => {
      const count = words.filter(word => word.includes(keyword.toLowerCase())).length;
      density[keyword] = (count / totalWords) * 100;
    });
    
    return density;
  }

  private calculateSEOScore(title: string, meta: string, content: string, density: { [key: string]: number }): number {
    let score = 0;
    
    // Title length (50-60 chars is optimal)
    if (title.length >= 50 && title.length <= 60) score += 20;
    else if (title.length >= 40 && title.length <= 70) score += 15;
    else score += 10;
    
    // Meta description length (150-160 chars is optimal)
    if (meta.length >= 150 && meta.length <= 160) score += 20;
    else if (meta.length >= 120 && meta.length <= 180) score += 15;
    else score += 10;
    
    // Content length (minimum 100 words)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 100) score += 20;
    else if (wordCount >= 50) score += 15;
    else score += 10;
    
    // Keyword density (1-3% is optimal)
    const avgDensity = Object.values(density).reduce((sum, d) => sum + d, 0) / Object.keys(density).length;
    if (avgDensity >= 1 && avgDensity <= 3) score += 20;
    else if (avgDensity >= 0.5 && avgDensity <= 5) score += 15;
    else score += 10;
    
    // Readability bonus
    score += 20; // Simplified
    
    return Math.min(100, score);
  }
}

export const contentAnalyzer = new ContentAnalyzer();
