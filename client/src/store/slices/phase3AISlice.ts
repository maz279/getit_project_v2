/**
 * PHASE 3: AI INTELLIGENCE REDUX SLICE
 * State management for multi-model AI orchestration and cultural intelligence
 * Investment: $35,000 | Redux Integration
 * Date: July 26, 2025
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types and Interfaces
interface AIModel {
  name: 'grok' | 'deepseek' | 'openai';
  status: 'active' | 'inactive' | 'error';
  latency: number;
  costPerToken: number;
  strengths: string[];
  currentLoad: number;
}

interface QueryContext {
  query: string;
  userId?: string;
  location?: string;
  language: 'bengali' | 'english';
  queryType: 'product_search' | 'cultural_context' | 'technical_support' | 'conversational' | 'recommendation';
  complexity: 'simple' | 'medium' | 'complex';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface AIResponse {
  response: string;
  model: string;
  confidence: number;
  processingTime: number;
  tokenCount: number;
  cost: number;
  metadata: {
    culturalRelevance: number;
    technicalAccuracy: number;
    userPersonalization: number;
  };
}

interface BangladeshDistrict {
  name: string;
  division: string;
  population: number;
  economicProfile: 'urban' | 'semi-urban' | 'rural';
  primaryLanguages: string[];
  culturalSpecialties: string[];
  localBrands: string[];
  preferredPaymentMethods: string[];
  averageIncome: 'low' | 'medium' | 'high';
  connectivity: 'excellent' | 'good' | 'moderate' | 'limited';
}

interface ConversationState {
  conversationId: string;
  userId: string;
  startTime: number;
  lastActivity: number;
  turnCount: number;
  language: 'bengali' | 'english' | 'mixed';
  currentTopic: string;
  userSentiment: 'positive' | 'neutral' | 'negative' | 'confused';
  aiPersonality: 'helpful' | 'friendly' | 'professional' | 'casual';
}

interface FollowUpQuestion {
  question: string;
  questionInBengali: string;
  intent: string;
  priority: 'high' | 'medium' | 'low';
  type: 'clarification' | 'exploration' | 'recommendation' | 'action';
}

interface CulturalIntelligence {
  currentSeason: string;
  upcomingFestivals: Array<{
    name: string;
    nameInBengali: string;
    type: string;
    discountExpectations: number;
  }>;
  totalDistricts: number;
  activeUserProfiles: number;
}

interface PerformanceMetrics {
  totalRequests: number;
  averageResponseTime: number;
  totalCost: number;
  modelsActive: number;
  culturalRelevance: number;
  technicalAccuracy: number;
  personalization: number;
}

// State Interface
interface Phase3AIState {
  // AI Orchestration
  aiModels: Record<string, AIModel>;
  currentQuery: QueryContext | null;
  queryHistory: QueryContext[];
  aiResponse: AIResponse | null;
  modelSelection: {
    selectedModel: string;
    reasoning: string;
  } | null;
  
  // Cultural Intelligence
  districts: BangladeshDistrict[];
  selectedDistrict: string | null;
  culturalIntelligence: CulturalIntelligence | null;
  culturalRecommendations: {
    recommendations: string[];
    culturalNotes: string[];
    seasonalAdvice: string[];
    festivalAlerts: string[];
  } | null;
  
  // Conversational AI
  activeConversations: Record<string, ConversationState>;
  currentConversationId: string | null;
  conversationStats: {
    totalConversations: number;
    activeConversations: number;
    averageTurns: number;
    languageDistribution: Record<string, number>;
  } | null;
  followUpQuestions: FollowUpQuestion[];
  
  // Performance and Analytics
  performanceMetrics: PerformanceMetrics | null;
  
  // UI State
  loading: {
    intelligentQuery: boolean;
    culturalData: boolean;
    conversation: boolean;
    performance: boolean;
  };
  error: {
    intelligentQuery: string | null;
    culturalData: string | null;
    conversation: string | null;
    performance: string | null;
  };
  
  // Settings
  preferences: {
    defaultLanguage: 'bengali' | 'english';
    defaultModel: 'grok' | 'deepseek' | 'openai' | 'auto';
    culturalSensitivity: 'high' | 'medium' | 'low';
    responseLength: 'brief' | 'detailed' | 'conversational';
    enableFollowUps: boolean;
  };
}

// Initial State
const initialState: Phase3AIState = {
  aiModels: {},
  currentQuery: null,
  queryHistory: [],
  aiResponse: null,
  modelSelection: null,
  
  districts: [],
  selectedDistrict: null,
  culturalIntelligence: null,
  culturalRecommendations: null,
  
  activeConversations: {},
  currentConversationId: null,
  conversationStats: null,
  followUpQuestions: [],
  
  performanceMetrics: null,
  
  loading: {
    intelligentQuery: false,
    culturalData: false,
    conversation: false,
    performance: false,
  },
  error: {
    intelligentQuery: null,
    culturalData: null,
    conversation: null,
    performance: null,
  },
  
  preferences: {
    defaultLanguage: 'english',
    defaultModel: 'auto',
    culturalSensitivity: 'high',
    responseLength: 'conversational',
    enableFollowUps: true,
  },
};

// Async Thunks
export const processIntelligentQuery = createAsyncThunk(
  'phase3AI/processIntelligentQuery',
  async (queryContext: QueryContext, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/phase3-ai/intelligent-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryContext),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to process query');
      }
      
      const data = await response.json();
      return { queryContext, response: data.data };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchCulturalIntelligence = createAsyncThunk(
  'phase3AI/fetchCulturalIntelligence',
  async (_, { rejectWithValue }) => {
    try {
      const [districtsResponse, seasonalResponse] = await Promise.all([
        fetch('/api/phase3-ai/cultural/districts'),
        fetch('/api/phase3-ai/cultural/seasonal-context'),
      ]);
      
      if (!districtsResponse.ok || !seasonalResponse.ok) {
        throw new Error('Failed to fetch cultural intelligence');
      }
      
      const [districts, seasonal] = await Promise.all([
        districtsResponse.json(),
        seasonalResponse.json(),
      ]);
      
      return {
        districts: districts.data.districts,
        culturalIntelligence: seasonal.data.culturalIntelligence,
        seasonalContext: seasonal.data.currentSeason,
        upcomingFestivals: seasonal.data.upcomingFestivals,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch cultural intelligence');
    }
  }
);

export const generateCulturalRecommendations = createAsyncThunk(
  'phase3AI/generateCulturalRecommendations',
  async (params: { district: string; userId?: string; queryContext: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/phase3-ai/cultural/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to generate recommendations');
      }
      
      const data = await response.json();
      return data.data.recommendations;
    } catch (error) {
      return rejectWithValue('Failed to generate cultural recommendations');
    }
  }
);

export const startConversation = createAsyncThunk(
  'phase3AI/startConversation',
  async (params: { userId: string; initialMessage: string; preferences?: any }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/phase3-ai/conversation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to start conversation');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Failed to start conversation');
    }
  }
);

export const continueConversation = createAsyncThunk(
  'phase3AI/continueConversation',
  async (params: { conversationId: string; userInput: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/phase3-ai/conversation/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to continue conversation');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Failed to continue conversation');
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'phase3AI/fetchPerformanceMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/phase3-ai/orchestrator/performance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch performance metrics');
    }
  }
);

export const fetchConversationStats = createAsyncThunk(
  'phase3AI/fetchConversationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/phase3-ai/conversation/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversation stats');
      }
      
      const data = await response.json();
      return data.data.stats;
    } catch (error) {
      return rejectWithValue('Failed to fetch conversation stats');
    }
  }
);

// Phase 3 AI Slice
const phase3AISlice = createSlice({
  name: 'phase3AI',
  initialState,
  reducers: {
    // Query Management
    setCurrentQuery: (state, action: PayloadAction<QueryContext>) => {
      state.currentQuery = action.payload;
      state.queryHistory.push(action.payload);
      // Keep only last 50 queries
      if (state.queryHistory.length > 50) {
        state.queryHistory = state.queryHistory.slice(-50);
      }
    },
    
    clearCurrentQuery: (state) => {
      state.currentQuery = null;
      state.aiResponse = null;
      state.modelSelection = null;
    },
    
    // Cultural Intelligence
    setSelectedDistrict: (state, action: PayloadAction<string>) => {
      state.selectedDistrict = action.payload;
    },
    
    clearCulturalRecommendations: (state) => {
      state.culturalRecommendations = null;
    },
    
    // Conversational AI
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
    
    clearCurrentConversation: (state) => {
      state.currentConversationId = null;
      state.followUpQuestions = [];
    },
    
    addFollowUpQuestion: (state, action: PayloadAction<FollowUpQuestion>) => {
      state.followUpQuestions.push(action.payload);
      // Keep only last 5 follow-up questions
      if (state.followUpQuestions.length > 5) {
        state.followUpQuestions = state.followUpQuestions.slice(-5);
      }
    },
    
    clearFollowUpQuestions: (state) => {
      state.followUpQuestions = [];
    },
    
    // Preferences
    updatePreferences: (state, action: PayloadAction<Partial<typeof initialState.preferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    // Error Management
    clearError: (state, action: PayloadAction<keyof typeof initialState.error>) => {
      state.error[action.payload] = null;
    },
    
    clearAllErrors: (state) => {
      state.error = {
        intelligentQuery: null,
        culturalData: null,
        conversation: null,
        performance: null,
      };
    },
    
    // Performance Tracking
    trackModelUsage: (state, action: PayloadAction<{ model: string; responseTime: number; cost: number }>) => {
      const { model, responseTime, cost } = action.payload;
      if (state.aiModels[model]) {
        state.aiModels[model].latency = responseTime;
        state.aiModels[model].currentLoad += 1;
      }
    },
  },
  
  extraReducers: (builder) => {
    // Intelligent Query
    builder
      .addCase(processIntelligentQuery.pending, (state) => {
        state.loading.intelligentQuery = true;
        state.error.intelligentQuery = null;
      })
      .addCase(processIntelligentQuery.fulfilled, (state, action) => {
        state.loading.intelligentQuery = false;
        state.aiResponse = action.payload.response;
        state.modelSelection = action.payload.response.routing;
        // Track model usage
        if (action.payload.response.model) {
          const model = action.payload.response.model;
          if (state.aiModels[model]) {
            state.aiModels[model].currentLoad += 1;
            state.aiModels[model].latency = action.payload.response.processingTime;
          }
        }
      })
      .addCase(processIntelligentQuery.rejected, (state, action) => {
        state.loading.intelligentQuery = false;
        state.error.intelligentQuery = action.payload as string;
      });
    
    // Cultural Intelligence
    builder
      .addCase(fetchCulturalIntelligence.pending, (state) => {
        state.loading.culturalData = true;
        state.error.culturalData = null;
      })
      .addCase(fetchCulturalIntelligence.fulfilled, (state, action) => {
        state.loading.culturalData = false;
        state.districts = action.payload.districts;
        state.culturalIntelligence = action.payload.culturalIntelligence;
      })
      .addCase(fetchCulturalIntelligence.rejected, (state, action) => {
        state.loading.culturalData = false;
        state.error.culturalData = action.payload as string;
      });
    
    // Cultural Recommendations
    builder
      .addCase(generateCulturalRecommendations.fulfilled, (state, action) => {
        state.culturalRecommendations = action.payload;
      });
    
    // Conversation Management
    builder
      .addCase(startConversation.pending, (state) => {
        state.loading.conversation = true;
        state.error.conversation = null;
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.loading.conversation = false;
        const { conversationId, conversationState } = action.payload;
        state.currentConversationId = conversationId;
        state.activeConversations[conversationId] = conversationState;
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.loading.conversation = false;
        state.error.conversation = action.payload as string;
      });
    
    builder
      .addCase(continueConversation.pending, (state) => {
        state.loading.conversation = true;
      })
      .addCase(continueConversation.fulfilled, (state, action) => {
        state.loading.conversation = false;
        const { conversationState, followUpQuestions } = action.payload;
        if (state.currentConversationId) {
          state.activeConversations[state.currentConversationId] = conversationState;
        }
        state.followUpQuestions = followUpQuestions || [];
      })
      .addCase(continueConversation.rejected, (state, action) => {
        state.loading.conversation = false;
        state.error.conversation = action.payload as string;
      });
    
    // Performance Metrics
    builder
      .addCase(fetchPerformanceMetrics.pending, (state) => {
        state.loading.performance = true;
        state.error.performance = null;
      })
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.loading.performance = false;
        state.performanceMetrics = action.payload.summary;
      })
      .addCase(fetchPerformanceMetrics.rejected, (state, action) => {
        state.loading.performance = false;
        state.error.performance = action.payload as string;
      });
    
    // Conversation Stats
    builder
      .addCase(fetchConversationStats.fulfilled, (state, action) => {
        state.conversationStats = action.payload;
      });
  },
});

// Export actions
export const {
  setCurrentQuery,
  clearCurrentQuery,
  setSelectedDistrict,
  clearCulturalRecommendations,
  setCurrentConversation,
  clearCurrentConversation,
  addFollowUpQuestion,
  clearFollowUpQuestions,
  updatePreferences,
  clearError,
  clearAllErrors,
  trackModelUsage,
} = phase3AISlice.actions;

// Selectors
export const selectCurrentQuery = (state: { phase3AI: Phase3AIState }) => state.phase3AI.currentQuery;
export const selectAIResponse = (state: { phase3AI: Phase3AIState }) => state.phase3AI.aiResponse;
export const selectModelSelection = (state: { phase3AI: Phase3AIState }) => state.phase3AI.modelSelection;
export const selectDistricts = (state: { phase3AI: Phase3AIState }) => state.phase3AI.districts;
export const selectSelectedDistrict = (state: { phase3AI: Phase3AIState }) => state.phase3AI.selectedDistrict;
export const selectCulturalIntelligence = (state: { phase3AI: Phase3AIState }) => state.phase3AI.culturalIntelligence;
export const selectCulturalRecommendations = (state: { phase3AI: Phase3AIState }) => state.phase3AI.culturalRecommendations;
export const selectActiveConversations = (state: { phase3AI: Phase3AIState }) => state.phase3AI.activeConversations;
export const selectCurrentConversationId = (state: { phase3AI: Phase3AIState }) => state.phase3AI.currentConversationId;
export const selectFollowUpQuestions = (state: { phase3AI: Phase3AIState }) => state.phase3AI.followUpQuestions;
export const selectPerformanceMetrics = (state: { phase3AI: Phase3AIState }) => state.phase3AI.performanceMetrics;
export const selectConversationStats = (state: { phase3AI: Phase3AIState }) => state.phase3AI.conversationStats;
export const selectPhase3Loading = (state: { phase3AI: Phase3AIState }) => state.phase3AI.loading;
export const selectPhase3Errors = (state: { phase3AI: Phase3AIState }) => state.phase3AI.error;
export const selectPreferences = (state: { phase3AI: Phase3AIState }) => state.phase3AI.preferences;

// Export reducer
export default phase3AISlice.reducer;