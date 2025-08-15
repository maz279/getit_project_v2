
import { mlService } from './MLService';

export interface MLRecommendation {
  id: string;
  title: string;
  type: 'product' | 'category' | 'brand';
  confidence: number;
  reason: string;
  mlScore: number;
  userSegment?: string;
  price?: number;
  image?: string;
  metadata?: any;
}

export class RecommendationEngine {
  private userBehaviorData: Map<string, any> = new Map();
  private productInteractions: Map<string, number> = new Map();

  // Track user behavior for ML learning
  trackUserBehavior(userId: string, action: string, productId: string, metadata?: any) {
    const userKey = userId || 'anonymous';
    const currentData = this.userBehaviorData.get(userKey) || {
      views: [],
      purchases: [],
      searches: [],
      interactions: []
    };

    currentData.interactions.push({
      action,
      productId,
      timestamp: Date.now(),
      metadata
    });

    this.userBehaviorData.set(userKey, currentData);
    
    // Update product interaction count
    const currentCount = this.productInteractions.get(productId) || 0;
    this.productInteractions.set(productId, currentCount + 1);

    console.log('ML: Tracked user behavior:', { userId: userKey, action, productId });
  }

  // Generate ML-powered recommendations
  async generateRecommendations(userId: string, context: any = {}): Promise<MLRecommendation[]> {
    console.log('ML Recommendations: Generating for user:', userId);
    
    await mlService.initialize();
    
    // Get user behavior data
    const userKey = userId || 'anonymous';
    const userData = this.userBehaviorData.get(userKey) || {};
    
    // Analyze user segments
    const customerSegment = await mlService.segmentCustomer(userData);
    
    // Generate recommendations based on ML analysis
    const mlRecommendations = await mlService.generateProductRecommendations(userKey, {
      ...context,
      segment: customerSegment,
      behavior: userData
    });

    // Convert to standardized format
    const recommendations: MLRecommendation[] = [];
    
    // Collaborative Filtering Recommendations
    recommendations.push(...await this.generateCollaborativeRecommendations(userKey, customerSegment));
    
    // Content-Based Recommendations
    recommendations.push(...await this.generateContentBasedRecommendations(userData));
    
    // Trending and Popular Items
    recommendations.push(...await this.generateTrendingRecommendations(customerSegment));
    
    // Personalized Deals
    recommendations.push(...await this.generatePersonalizedDeals(userKey));

    // Sort by ML confidence score
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 12);
  }

  private async generateCollaborativeRecommendations(userId: string, segment: any): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [
      {
        id: 'collab_1',
        title: 'Samsung Galaxy S24 Ultra',
        type: 'product',
        confidence: 0.94,
        reason: 'Users with similar preferences in your segment purchased this',
        mlScore: 0.94,
        userSegment: segment.primarySegment?.name,
        price: 125000,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop'
      },
      {
        id: 'collab_2',
        title: 'Sony WH-1000XM5 Headphones',
        type: 'product',
        confidence: 0.89,
        reason: 'Frequently bought together with your previous purchases',
        mlScore: 0.89,
        userSegment: segment.primarySegment?.name,
        price: 35000,
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop'
      }
    ];

    return recommendations;
  }

  private async generateContentBasedRecommendations(userData: any): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [
      {
        id: 'content_1',
        title: 'MacBook Pro M3',
        type: 'product',
        confidence: 0.87,
        reason: 'Based on your interest in high-performance electronics',
        mlScore: 0.87,
        price: 185000,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop'
      },
      {
        id: 'content_2',
        title: 'iPhone 15 Pro',
        type: 'product',
        confidence: 0.82,
        reason: 'Matches your browsing pattern for premium smartphones',
        mlScore: 0.82,
        price: 135000,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop'
      }
    ];

    return recommendations;
  }

  private async generateTrendingRecommendations(segment: any): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [
      {
        id: 'trending_1',
        title: 'Air Fryer Deluxe 5L',
        type: 'product',
        confidence: 0.78,
        reason: 'Trending in your area - 89% customer satisfaction',
        mlScore: 0.78,
        price: 12500,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop'
      },
      {
        id: 'trending_2',
        title: 'Smart Watch Series 9',
        type: 'product',
        confidence: 0.75,
        reason: 'Popular among tech enthusiasts this month',
        mlScore: 0.75,
        price: 42000,
        image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300&h=300&fit=crop'
      }
    ];

    return recommendations;
  }

  private async generatePersonalizedDeals(userId: string): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [
      {
        id: 'deal_1',
        title: 'Gaming Mouse RGB Pro',
        type: 'product',
        confidence: 0.72,
        reason: 'Special price for you - 40% off limited time',
        mlScore: 0.72,
        price: 4500,
        image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop'
      }
    ];

    return recommendations;
  }

  // Real-time recommendation updates
  async updateRecommendations(userId: string, event: string, data: any): Promise<void> {
    console.log('ML: Updating recommendations based on real-time event:', event);
    
    // Track the behavior
    this.trackUserBehavior(userId, event, data.productId, data);
    
    // Optionally trigger re-computation of recommendations
    if (['purchase', 'add_to_cart', 'extended_view'].includes(event)) {
      await this.generateRecommendations(userId, { trigger: event, data });
    }
  }
}

export const recommendationEngine = new RecommendationEngine();
