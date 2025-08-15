
import { useState, useCallback, useEffect } from 'react';
import { aiOrchestrator } from '@/shared/services/ai/AIOrchestrator';
import { realTimeInsights } from '@/shared/services/ai/RealTimeInsights';
import { advancedPersonalizationEngine } from '@/shared/services/ai/AdvancedPersonalizationEngine';

interface AdvancedAIState {
  insights: any;
  recommendations: any[];
  personalization: any;
  realTimeData: any;
  isProcessing: boolean;
  error: string | null;
}

export const useAdvancedAI = (userId?: string) => {
  const [state, setState] = useState<AdvancedAIState>({
    insights: null,
    recommendations: [],
    personalization: null,
    realTimeData: null,
    isProcessing: false,
    error: null
  });

  // Initialize AI services
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await aiOrchestrator.initialize();
        console.log('Advanced AI initialized successfully');
      } catch (error) {
        console.error('Advanced AI initialization failed:', error);
        setState(prev => ({ ...prev, error: 'Failed to initialize AI services' }));
      }
    };

    initializeAI();
  }, []);

  // Get personalized insights
  const getPersonalizedInsights = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      const [insights, recommendations, personalization] = await Promise.all([
        realTimeInsights.generateBusinessInsights(),
        advancedPersonalizationEngine.getPersonalizedRecommendations(userId),
        advancedPersonalizationEngine.getProfile(userId)
      ]);

      setState(prev => ({
        ...prev,
        insights,
        recommendations: recommendations.products,
        personalization,
        isProcessing: false
      }));
    } catch (error) {
      console.error('Failed to get personalized insights:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load personalized insights',
        isProcessing: false 
      }));
    }
  }, [userId]);

  // Process user action for real-time learning
  const processUserAction = useCallback(async (action: {
    type: string;
    productId?: string;
    category?: string;
    data?: any;
  }) => {
    if (!userId) return;

    try {
      // Update personalization profile - convert type to action
      await advancedPersonalizationEngine.createOrUpdateProfile(userId, {
        action: action.type,
        productId: action.productId,
        category: action.category,
        metadata: action.data
      });

      // Process real-time event
      await realTimeInsights.processRealTimeEvent({
        type: action.type,
        userId,
        data: action.data || {},
        timestamp: Date.now()
      });

      // Get updated recommendations
      const updatedRecommendations = await advancedPersonalizationEngine
        .getPersonalizedRecommendations(userId);

      setState(prev => ({
        ...prev,
        recommendations: updatedRecommendations.products,
        personalization: advancedPersonalizationEngine.getProfile(userId)
      }));
    } catch (error) {
      console.error('Failed to process user action:', error);
    }
  }, [userId]);

  // Analyze product with advanced AI
  const analyzeProduct = useCallback(async (product: any, context?: any) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const analysis = await aiOrchestrator.analyzeProduct(product, {
        userId,
        includeRecommendations: true,
        ...context
      });

      setState(prev => ({ ...prev, isProcessing: false }));
      return analysis;
    } catch (error) {
      console.error('Product analysis failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Product analysis failed',
        isProcessing: false 
      }));
      return null;
    }
  }, [userId]);

  // Perform intelligent search
  const performIntelligentSearch = useCallback(async (query: string, context?: any) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const searchResult = await aiOrchestrator.performIntelligentSearch(query, {
        userId,
        ...context
      });

      setState(prev => ({ ...prev, isProcessing: false }));
      return searchResult;
    } catch (error) {
      console.error('Intelligent search failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Search failed',
        isProcessing: false 
      }));
      return null;
    }
  }, [userId]);

  // Process conversation
  const processConversation = useCallback(async (message: string, context?: any) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const conversationResult = await aiOrchestrator.processConversation(message, {
        userId,
        ...context
      });

      setState(prev => ({ ...prev, isProcessing: false }));
      return conversationResult;
    } catch (error) {
      console.error('Conversation processing failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Conversation processing failed',
        isProcessing: false 
      }));
      return null;
    }
  }, [userId]);

  // Get real-time insights
  const getRealTimeInsights = useCallback(async () => {
    try {
      const insights = await realTimeInsights.getLatestInsights();
      const alerts = await realTimeInsights.getActiveAlerts();
      const patterns = await realTimeInsights.getPatternSummary();

      setState(prev => ({
        ...prev,
        realTimeData: { insights, alerts, patterns }
      }));

      return { insights, alerts, patterns };
    } catch (error) {
      console.error('Failed to get real-time insights:', error);
      return null;
    }
  }, []);

  // Get AI performance metrics
  const getPerformanceMetrics = useCallback(() => {
    try {
      return aiOrchestrator.getPerformanceMetrics();
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return null;
    }
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    getPersonalizedInsights,
    processUserAction,
    analyzeProduct,
    performIntelligentSearch,
    processConversation,
    getRealTimeInsights,
    getPerformanceMetrics,
    
    // Utilities
    clearError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }));
    }, [])
  };
};
