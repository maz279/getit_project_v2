/**
 * Amazon.com/Shopee.sg-Level ML API Service
 * Complete frontend-backend synchronization for all ML capabilities
 */

interface MLModel {
  id: string;
  name: string;
  type: string;
  version: string;
  accuracy: number;
  status: 'active' | 'training' | 'inactive';
  lastTrained: string;
  predictions: number;
  bangladeshOptimized: boolean;
}

interface RecommendationRequest {
  userId: string;
  productFilters?: {
    category?: string;
    priceRange?: { min: number; max: number; };
    brands?: string[];
  };
  excludeProducts?: string[];
  maxResults?: number;
}

interface RecommendationResult {
  productId: string;
  productName: string;
  score: number;
  confidence: number;
  reason: string;
  bangladeshContext: {
    culturalRelevance: number;
    festivalAlignment: number;
    regionalPreference: number;
  };
}

interface FraudAnalysisRequest {
  transactionId: string;
  userId?: string;
  amount?: number;
  paymentMethod?: string;
  location?: { lat: number; lng: number; };
}

interface FraudDetectionResult {
  transactionId: string;
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasons: string[];
  bangladeshContext: {
    paymentMethodRisk: number;
    locationRisk: number;
    timeContextRisk: number;
    culturalRisk: number;
  };
  recommendations: string[];
}

interface PriceOptimizationRequest {
  productId: string;
  currentPrice?: number;
  targetMargin?: number;
  competitorPrices?: number[];
  seasonalFactors?: boolean;
}

interface PriceOptimizationResult {
  productId: string;
  currentPrice: number;
  suggestedPrice: number;
  priceChange: number;
  confidence: number;
  reason: string;
  expectedRevenue: number;
  competitorAnalysis: {
    averagePrice: number;
    pricePosition: 'below' | 'competitive' | 'above';
  };
}

interface MLMetrics {
  totalModels: number;
  activeModels: number;
  totalPredictions: number;
  averageAccuracy: number;
  bangladeshOptimizedModels: number;
  realTimePredictions: number;
  performanceMetrics: {
    recommendationAccuracy: number;
    fraudDetectionAccuracy: number;
    priceOptimizationROI: number;
    bangladeshCulturalAccuracy: number;
  };
}

interface SentimentAnalysisRequest {
  text: string;
  language?: 'bengali' | 'english' | 'mixed';
  context?: 'product_review' | 'customer_feedback' | 'vendor_communication';
}

interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number; // -1 to 1
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
  bangladeshContext: {
    culturalSentiment: number;
    languageConfidence: number;
    contextRelevance: number;
  };
}

interface CustomerSegmentationRequest {
  userId?: string;
  segmentType?: 'behavioral' | 'demographic' | 'value_based' | 'cultural';
  includePersonalization?: boolean;
}

interface CustomerSegmentationResult {
  userId: string;
  segments: Array<{
    type: string;
    name: string;
    confidence: number;
    characteristics: string[];
    recommendedActions: string[];
  }>;
  bangladeshProfile: {
    region: string;
    culturalSegment: string;
    economicSegment: string;
    paymentPreference: string;
  };
}

export class MLAPIService {
  private readonly baseUrl = '/api/v1/ml';
  private static instance: MLAPIService;
  
  private constructor() {}

  public static getInstance(): MLAPIService {
    if (!MLAPIService.instance) {
      MLAPIService.instance = new MLAPIService();
    }
    return MLAPIService.instance;
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data || result,
      };
    } catch (error) {
      console.error('ML API Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ===================
  // MODEL MANAGEMENT
  // ===================

  /**
   * Get all ML models with their status and performance
   */
  async getMLModels(): Promise<{ success: boolean; data?: MLModel[]; error?: string }> {
    return this.makeRequest<MLModel[]>('/models');
  }

  /**
   * Get ML metrics and performance overview
   */
  async getMLMetrics(): Promise<{ success: boolean; data?: MLMetrics; error?: string }> {
    return this.makeRequest<MLMetrics>('/metrics');
  }

  /**
   * Get detailed model information
   */
  async getModelDetails(modelId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/models/${modelId}`);
  }

  /**
   * Trigger model retraining
   */
  async retrainModel(modelId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/models/${modelId}/retrain`, {
      method: 'POST',
    });
  }

  // ===================
  // RECOMMENDATION ENGINE
  // ===================

  /**
   * Generate personalized product recommendations
   */
  async generateRecommendations(
    request: RecommendationRequest
  ): Promise<{ success: boolean; data?: RecommendationResult[]; error?: string }> {
    return this.makeRequest<RecommendationResult[]>('/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get sample recommendations for demonstration
   */
  async getSampleRecommendations(): Promise<{ success: boolean; data?: RecommendationResult[]; error?: string }> {
    // Sample data for demonstration - in production this would call actual API
    const sampleData: RecommendationResult[] = [
      {
        productId: 'prod_001',
        productName: 'Traditional Bangladeshi Kurta',
        score: 0.95,
        confidence: 0.89,
        reason: 'High cultural relevance and user preference match',
        bangladeshContext: {
          culturalRelevance: 0.98,
          festivalAlignment: 0.85,
          regionalPreference: 0.92
        }
      },
      {
        productId: 'prod_002',
        productName: 'Samsung Galaxy Smartphone',
        score: 0.87,
        confidence: 0.76,
        reason: 'Similar users with tech preferences purchased this',
        bangladeshContext: {
          culturalRelevance: 0.65,
          festivalAlignment: 0.23,
          regionalPreference: 0.78
        }
      },
      {
        productId: 'prod_003',
        productName: 'Bengali Cookbook Collection',
        score: 0.82,
        confidence: 0.84,
        reason: 'Content-based match with cultural preferences',
        bangladeshContext: {
          culturalRelevance: 0.96,
          festivalAlignment: 0.67,
          regionalPreference: 0.88
        }
      }
    ];

    return {
      success: true,
      data: sampleData
    };
  }

  /**
   * Get trending recommendations
   */
  async getTrendingRecommendations(): Promise<{ success: boolean; data?: RecommendationResult[]; error?: string }> {
    return this.makeRequest<RecommendationResult[]>('/recommendations/trending');
  }

  /**
   * Get festival-specific recommendations
   */
  async getFestivalRecommendations(festival: string): Promise<{ success: boolean; data?: RecommendationResult[]; error?: string }> {
    return this.makeRequest<RecommendationResult[]>(`/recommendations/festival/${festival}`);
  }

  // ===================
  // FRAUD DETECTION
  // ===================

  /**
   * Analyze transaction for fraud
   */
  async analyzeFraud(
    request: FraudAnalysisRequest
  ): Promise<{ success: boolean; data?: FraudDetectionResult; error?: string }> {
    return this.makeRequest<FraudDetectionResult>('/fraud-detection/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get sample fraud detection results
   */
  async getSampleFraudResults(): Promise<{ success: boolean; data?: FraudDetectionResult[]; error?: string }> {
    // Sample data for demonstration
    const sampleData: FraudDetectionResult[] = [
      {
        transactionId: 'txn_001',
        fraudScore: 0.85,
        riskLevel: 'high',
        confidence: 0.92,
        reasons: [
          'Transaction amount significantly higher than user pattern',
          'Unusual time of transaction (2:30 AM)',
          'IP location doesn\'t match shipping address'
        ],
        bangladeshContext: {
          paymentMethodRisk: 0.3,
          locationRisk: 0.8,
          timeContextRisk: 0.9,
          culturalRisk: 0.1
        },
        recommendations: [
          'Hold transaction for manual review',
          'Require additional authentication',
          'Verify shipping address'
        ]
      },
      {
        transactionId: 'txn_002',
        fraudScore: 0.25,
        riskLevel: 'low',
        confidence: 0.87,
        reasons: [
          'Normal user behavior pattern',
          'Transaction during typical hours',
          'Consistent payment method'
        ],
        bangladeshContext: {
          paymentMethodRisk: 0.1,
          locationRisk: 0.2,
          timeContextRisk: 0.1,
          culturalRisk: 0.0
        },
        recommendations: [
          'Process normally',
          'Log for pattern analysis'
        ]
      }
    ];

    return {
      success: true,
      data: sampleData
    };
  }

  /**
   * Get fraud detection statistics
   */
  async getFraudStatistics(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/fraud-detection/statistics');
  }

  // ===================
  // PRICE OPTIMIZATION
  // ===================

  /**
   * Optimize product price
   */
  async optimizePrice(
    request: PriceOptimizationRequest
  ): Promise<{ success: boolean; data?: PriceOptimizationResult; error?: string }> {
    return this.makeRequest<PriceOptimizationResult>('/price-optimization/optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get sample price optimization results
   */
  async getSamplePriceOptimizations(): Promise<{ success: boolean; data?: PriceOptimizationResult[]; error?: string }> {
    // Sample data for demonstration
    const sampleData: PriceOptimizationResult[] = [
      {
        productId: 'prod_001',
        currentPrice: 2500,
        suggestedPrice: 2750,
        priceChange: 10.0,
        confidence: 0.88,
        reason: 'Demand increase detected, competitors pricing higher',
        expectedRevenue: 15000,
        competitorAnalysis: {
          averagePrice: 2800,
          pricePosition: 'below'
        }
      },
      {
        productId: 'prod_002',
        currentPrice: 15000,
        suggestedPrice: 13500,
        priceChange: -10.0,
        confidence: 0.75,
        reason: 'Price sensitivity high in this segment, reduce for volume',
        expectedRevenue: 27000,
        competitorAnalysis: {
          averagePrice: 14200,
          pricePosition: 'above'
        }
      }
    ];

    return {
      success: true,
      data: sampleData
    };
  }

  /**
   * Get pricing analytics
   */
  async getPricingAnalytics(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/price-optimization/analytics');
  }

  // ===================
  // SENTIMENT ANALYSIS
  // ===================

  /**
   * Analyze text sentiment
   */
  async analyzeSentiment(
    request: SentimentAnalysisRequest
  ): Promise<{ success: boolean; data?: SentimentAnalysisResult; error?: string }> {
    return this.makeRequest<SentimentAnalysisResult>('/sentiment-analysis/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get sentiment trends
   */
  async getSentimentTrends(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/sentiment-analysis/trends');
  }

  // ===================
  // CUSTOMER SEGMENTATION
  // ===================

  /**
   * Segment customers
   */
  async segmentCustomers(
    request: CustomerSegmentationRequest
  ): Promise<{ success: boolean; data?: CustomerSegmentationResult; error?: string }> {
    return this.makeRequest<CustomerSegmentationResult>('/customer-segmentation/segment', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get segmentation analytics
   */
  async getSegmentationAnalytics(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/customer-segmentation/analytics');
  }

  // ===================
  // DEMAND FORECASTING
  // ===================

  /**
   * Forecast product demand
   */
  async forecastDemand(productId: string, timeframe: number): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/demand-forecasting/forecast/${productId}?timeframe=${timeframe}`);
  }

  /**
   * Get demand forecasting analytics
   */
  async getDemandAnalytics(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/demand-forecasting/analytics');
  }

  // ===================
  // SEARCH OPTIMIZATION
  // ===================

  /**
   * Optimize search results
   */
  async optimizeSearch(query: string, userId?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/search-optimization/optimize', {
      method: 'POST',
      body: JSON.stringify({ query, userId }),
    });
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/search-optimization/analytics');
  }

  // ===================
  // BANGLADESH SPECIFIC
  // ===================

  /**
   * Get Bangladesh cultural insights
   */
  async getBangladeshInsights(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/bangladesh/insights');
  }

  /**
   * Get festival impact analysis
   */
  async getFestivalImpact(festival: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/bangladesh/festival-impact/${festival}`);
  }

  /**
   * Get regional preferences
   */
  async getRegionalPreferences(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/bangladesh/regional-preferences');
  }

  /**
   * Get payment method insights
   */
  async getPaymentMethodInsights(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/bangladesh/payment-insights');
  }

  // ===================
  // REAL-TIME MONITORING
  // ===================

  /**
   * Create WebSocket connection for real-time ML monitoring
   */
  createRealTimeConnection(): WebSocket {
    const wsUrl = `ws://${window.location.host}/api/v1/ml/realtime`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('ML Real-time connection established');
    };
    
    ws.onerror = (error) => {
      console.error('ML Real-time connection error:', error);
    };
    
    return ws;
  }

  /**
   * Get real-time ML statistics
   */
  async getRealTimeStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/realtime/stats');
  }

  // ===================
  // TRAINING & EVALUATION
  // ===================

  /**
   * Start model training
   */
  async startTraining(modelType: string, config: any): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/training/start', {
      method: 'POST',
      body: JSON.stringify({ modelType, config }),
    });
  }

  /**
   * Get training status
   */
  async getTrainingStatus(jobId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/training/status/${jobId}`);
  }

  /**
   * Evaluate model performance
   */
  async evaluateModel(modelId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/evaluation/${modelId}`);
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(experimentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/experiments/${experimentId}/results`);
  }

  // ===================
  // HEALTH & DIAGNOSTICS
  // ===================

  /**
   * Get ML service health
   */
  async getServiceHealth(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/health');
  }

  /**
   * Run ML diagnostics
   */
  async runDiagnostics(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/diagnostics');
  }

  /**
   * Get system performance metrics
   */
  async getPerformanceMetrics(): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest('/performance');
  }
}

// Export singleton instance
export const mlApiService = MLAPIService.getInstance();