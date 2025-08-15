/**
 * ML Service API Integration
 * Amazon.com/Shopee.sg-Level Machine Learning Frontend Service
 * Complete integration with ML microservice backend
 */

const API_BASE_URL = '/api/v1/ml';

class MLApiService {
  // **Price Optimization APIs**
  
  async optimizePrice(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/price-optimization/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error optimizing price:', error);
      throw error;
    }
  }

  async batchOptimizePrice(products) {
    try {
      const response = await fetch(`${API_BASE_URL}/price-optimization/batch-optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in batch price optimization:', error);
      throw error;
    }
  }

  async applyDynamicPricing(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/price-optimization/dynamic-pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error applying dynamic pricing:', error);
      throw error;
    }
  }

  async optimizeFestivalPricing(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/price-optimization/festival-pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error optimizing festival pricing:', error);
      throw error;
    }
  }

  async optimizeRegionalPricing(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/price-optimization/regional-pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error optimizing regional pricing:', error);
      throw error;
    }
  }

  async getPricingPerformance(productId, timeframe = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/price-optimization/performance?productId=${productId}&timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting pricing performance:', error);
      throw error;
    }
  }

  // **Sentiment Analysis APIs**
  
  async analyzeSentiment(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/sentiment-analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error);
      throw error;
    }
  }

  async batchAnalyzeSentiment(texts) {
    try {
      const response = await fetch(`${API_BASE_URL}/sentiment-analysis/batch-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in batch sentiment analysis:', error);
      throw error;
    }
  }

  async getProductSentimentTrends(productId, timeframe = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/sentiment-analysis/product-trends?productId=${productId}&timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting sentiment trends:', error);
      throw error;
    }
  }

  async getVendorSentimentAnalysis(vendorId, timeframe = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/sentiment-analysis/vendor-analysis?vendorId=${vendorId}&timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting vendor sentiment:', error);
      throw error;
    }
  }

  // **Demand Forecasting APIs**
  
  async forecastDemand(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/demand-forecasting/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error forecasting demand:', error);
      throw error;
    }
  }

  async batchForecastDemand(products) {
    try {
      const response = await fetch(`${API_BASE_URL}/demand-forecasting/batch-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in batch demand forecasting:', error);
      throw error;
    }
  }

  async getDemandTrends(productId, timeframe = '90d') {
    try {
      const response = await fetch(`${API_BASE_URL}/demand-forecasting/trends?productId=${productId}&timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting demand trends:', error);
      throw error;
    }
  }

  async getFestivalDemandImpact(festival, category) {
    try {
      const response = await fetch(`${API_BASE_URL}/demand-forecasting/festival-impact?festival=${festival}&category=${category}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting festival demand impact:', error);
      throw error;
    }
  }

  // **Customer Segmentation APIs**
  
  async segmentCustomers(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/customer-segmentation/segment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error segmenting customers:', error);
      throw error;
    }
  }

  async getCustomerProfile(customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/customer-segmentation/profile/${customerId}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting customer profile:', error);
      throw error;
    }
  }

  async getBangladeshSegmentInsights() {
    try {
      const response = await fetch(`${API_BASE_URL}/customer-segmentation/bangladesh-insights`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting Bangladesh segment insights:', error);
      throw error;
    }
  }

  async getSegmentAnalytics(segmentId, timeframe = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/customer-segmentation/analytics?segmentId=${segmentId}&timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting segment analytics:', error);
      throw error;
    }
  }

  // **Product Recommendation APIs**
  
  async getRecommendations(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting recommendations:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(userId, count = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/personalized?userId=${userId}&count=${count}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting personalized recommendations:', error);
      throw error;
    }
  }

  async getBangladeshTrendingProducts(region = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/bangladesh-trending?region=${region}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting trending products:', error);
      throw error;
    }
  }

  async getCulturalRecommendations(userId, culturalContext) {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/cultural`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, culturalContext })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting cultural recommendations:', error);
      throw error;
    }
  }

  // **Search Optimization APIs**
  
  async optimizeSearch(query, context) {
    try {
      const response = await fetch(`${API_BASE_URL}/search-optimization/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, context })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error optimizing search:', error);
      throw error;
    }
  }

  async getSearchSuggestions(query, language = 'en') {
    try {
      const response = await fetch(`${API_BASE_URL}/search-optimization/suggestions?query=${encodeURIComponent(query)}&language=${language}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting search suggestions:', error);
      throw error;
    }
  }

  async getBangladeshSearchTrends(timeframe = '7d') {
    try {
      const response = await fetch(`${API_BASE_URL}/search-optimization/bangladesh-trends?timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting search trends:', error);
      throw error;
    }
  }

  async getCulturalSearchOptimization(query, cultural_context) {
    try {
      const response = await fetch(`${API_BASE_URL}/search-optimization/cultural`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, cultural_context })
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting cultural search optimization:', error);
      throw error;
    }
  }

  // **Advanced Analytics APIs**
  
  async getMLPerformanceMetrics(service, timeframe = '24h') {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/performance?service=${service}&timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting ML performance metrics:', error);
      throw error;
    }
  }

  async getModelAccuracyMetrics(modelType, timeframe = '7d') {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/accuracy?modelType=${modelType}&timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting model accuracy metrics:', error);
      throw error;
    }
  }

  async getBangladeshMLInsights(timeframe = '30d') {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/bangladesh-insights?timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting Bangladesh ML insights:', error);
      throw error;
    }
  }

  // **Health & Status APIs**
  
  async getServiceHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting service health:', error);
      throw error;
    }
  }

  async getServiceMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting service metrics:', error);
      throw error;
    }
  }
}

export default new MLApiService();