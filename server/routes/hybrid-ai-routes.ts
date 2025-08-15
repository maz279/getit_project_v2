/**
 * Hybrid AI Routes - Production API Integration
 * Routes for the comprehensive hybrid AI architecture
 */

import express from 'express';
import { HybridAIOrchestrator } from '../services/ai/HybridAIOrchestrator';

const router = express.Router();
const aiOrchestrator = HybridAIOrchestrator.getInstance();

/**
 * Health check for hybrid AI system
 */
router.get('/health', async (req, res) => {
  try {
    const health = aiOrchestrator.getServiceHealth();
    const metrics = aiOrchestrator.getMetrics();
    
    res.json({
      success: true,
      data: {
        status: 'operational',
        services: health,
        metrics: Object.fromEntries(metrics),
        timestamp: new Date().toISOString()
      },
      metadata: {
        responseTime: Date.now(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Intelligent search processing
 */
router.post('/search', async (req, res) => {
  try {
    const { query, language = 'en', context, urgency = 'normal' } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
        data: null
      });
    }

    const result = await aiOrchestrator.processSearchQuery(query, {
      language,
      context,
      urgency,
      requiresCulturalIntelligence: language === 'bn',
      maxResponseTime: 3000
    });

    res.json({
      success: result.success,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Image analysis endpoint
 */
router.post('/image-analysis', async (req, res) => {
  try {
    const { imageData, analysisType = 'classification' } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required',
        data: null
      });
    }

    const result = await aiOrchestrator.processImageAnalysis(imageData, {
      urgency: 'immediate',
      requiresRealTimeProcessing: true,
      context: { analysisType }
    });

    res.json({
      success: result.success,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Voice command processing
 */
router.post('/voice-command', async (req, res) => {
  try {
    const { audioData, language = 'en' } = req.body;
    
    if (!audioData) {
      return res.status(400).json({
        success: false,
        error: 'Audio data is required',
        data: null
      });
    }

    const result = await aiOrchestrator.processVoiceCommand(audioData, {
      language,
      urgency: 'immediate',
      requiresRealTimeProcessing: true
    });

    res.json({
      success: result.success,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Pattern recognition for user behavior
 */
router.post('/pattern-recognition', async (req, res) => {
  try {
    const { behaviorData, userId } = req.body;
    
    const result = await aiOrchestrator.processRequest({
      query: 'pattern_analysis',
      type: 'pattern',
      context: behaviorData,
      urgency: 'normal',
      userProfile: { userId }
    });

    res.json({
      success: result.success,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Personalized recommendations
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { userProfile, context, limit = 10 } = req.body;
    
    const result = await aiOrchestrator.processRequest({
      query: 'generate_recommendations',
      type: 'recommendation',
      context: { ...context, limit },
      urgency: 'normal',
      userProfile,
      requiresOfflineCapability: true
    });

    res.json({
      success: result.success,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Product category prediction
 */
router.post('/predict-category', async (req, res) => {
  try {
    const { productData } = req.body;
    
    if (!productData) {
      return res.status(400).json({
        success: false,
        error: 'Product data is required',
        data: null
      });
    }

    const result = await aiOrchestrator.processRequest({
      query: 'category_prediction',
      type: 'recommendation',
      context: { productData, type: 'category' },
      urgency: 'normal',
      requiresOfflineCapability: true
    });

    res.json({
      success: result.success,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Price prediction endpoint
 */
router.post('/predict-price', async (req, res) => {
  try {
    const { productData } = req.body;
    
    if (!productData) {
      return res.status(400).json({
        success: false,
        error: 'Product data is required',
        data: null
      });
    }

    const result = await aiOrchestrator.processRequest({
      query: 'price_prediction',
      type: 'recommendation',
      context: { productData, type: 'price' },
      urgency: 'normal',
      requiresOfflineCapability: true
    });

    res.json({
      success: result.success,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Bulk processing endpoint for batch operations
 */
router.post('/batch-process', async (req, res) => {
  try {
    const { requests } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Requests array is required',
        data: null
      });
    }

    // Process requests in parallel for better performance
    const results = await Promise.allSettled(
      requests.map(request => aiOrchestrator.processRequest({
        ...request,
        urgency: 'batch'
      }))
    );

    const processedResults = results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value.data : null,
      error: result.status === 'rejected' ? result.reason?.message : null,
      metadata: result.status === 'fulfilled' ? result.value.metadata : null
    }));

    res.json({
      success: true,
      data: {
        results: processedResults,
        summary: {
          total: requests.length,
          successful: processedResults.filter(r => r.success).length,
          failed: processedResults.filter(r => !r.success).length
        }
      },
      metadata: {
        processingTime: Date.now(),
        batchSize: requests.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Performance metrics endpoint
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = aiOrchestrator.getMetrics();
    const serviceHealth = aiOrchestrator.getServiceHealth();
    
    res.json({
      success: true,
      data: {
        metrics: Object.fromEntries(metrics),
        serviceHealth,
        systemInfo: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        collectedAt: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

/**
 * Service configuration endpoint
 */
router.get('/config', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        services: ['DeepSeek AI', 'TensorFlow.js', 'Brain.js', 'ONNX Runtime'],
        capabilities: {
          culturalIntelligence: true,
          realTimeProcessing: true,
          offlineCapability: true,
          multiLanguageSupport: ['en', 'bn', 'hi'],
          imageProcessing: true,
          voiceProcessing: true,
          patternRecognition: true,
          recommendations: true
        },
        performance: {
          maxResponseTime: '3000ms',
          averageResponseTime: '100ms',
          offlineCapability: '70%',
          supportedFormats: ['text', 'image', 'audio']
        }
      },
      metadata: {
        version: '1.0.0',
        buildDate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

export default router;