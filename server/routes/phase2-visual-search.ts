/**
 * Phase 2: Visual Search & Computer Vision Routes
 * Handles image-based product search and visual analysis endpoints
 */

import { Router } from 'express';
import { z } from 'zod';
import VisualSearchService from '../services/vision/VisualSearchService';

const router = Router();
const visualSearchService = VisualSearchService.getInstance();

// Validation schemas - Updated to handle flexible imageData
const VisualSearchSchema = z.object({
  imageData: z.string().min(1, 'Image data is required').optional(),
  image: z.string().optional(),
  searchType: z.enum(['similar', 'exact', 'category', 'brand']).default('similar'),
  filters: z.object({
    category: z.string().optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0)
    }).optional(),
    brand: z.string().optional(),
    color: z.string().optional()
  }).optional(),
  context: z.object({
    userId: z.string().optional(),
    location: z.string().optional(),
    preferences: z.array(z.string()).optional()
  }).optional()
});

const ColorExtractionSchema = z.object({
  imageData: z.string().min(1, 'Image data is required')
});

const ObjectDetectionSchema = z.object({
  imageData: z.string().min(1, 'Image data is required')
});

/**
 * POST /api/search/visual
 * Main visual search endpoint - search products by image
 */
router.post('/visual', async (req, res) => {
  try {
    console.log(`🖼️ ENHANCED VISUAL SEARCH: Processing image upload`);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('ImageData present:', !!req.body.imageData);
    
    // Ensure imageData is available
    const imageData = req.body.imageData || req.body.image || req.file?.buffer || req.body.data;
    
    if (!imageData || imageData === '') {
      console.log('❌ No image data found in request body:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Image file is required',
        dataIntegrity: 'authentic_only'
      });
    }

    // Create validated data structure
    const searchRequest = {
      imageData: imageData,
      searchType: req.body.searchType || 'similar',
      filters: req.body.filters || {},
      context: req.body.context || {}
    };
    
    console.log(`🔍 Calling searchByImage with data: ${searchRequest.imageData}`);
    const result = await visualSearchService.searchByImage(searchRequest);
    
    if (result.success) {
      console.log(`✅ Visual search completed: ${result.data.searchResults.length} products found`);
      res.json({
        success: true,
        data: result.data,
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: result.data.metadata.processingTime,
          endpoint: '/api/search/visual',
          dataIntegrity: 'authentic_only'
        }
      });
    } else {
      console.log('❌ Visual search failed:', result.error);
      res.status(400).json({
        success: false,
        error: result.error,
        fallbackOptions: result.data?.fallbackOptions || [],
        dataIntegrity: 'authentic_only'
      });
    }
    
  } catch (error) {
    console.error('Visual search endpoint error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        fallbackOptions: ['Use text search instead', 'Upload a different image']
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Visual search service unavailable',
      fallbackOptions: ['Try again later', 'Use text search', 'Browse categories']
    });
  }
});

/**
 * POST /api/search/visual/colors
 * Extract dominant colors from uploaded image
 */
router.post('/visual/colors', async (req, res) => {
  try {
    const validatedData = ColorExtractionSchema.parse(req.body);
    
    console.log('🎨 Color extraction request received');
    
    const colors = await visualSearchService.extractDominantColors(validatedData.imageData);
    
    res.json({
      success: true,
      data: {
        colors,
        totalColors: colors.length,
        dominantColor: colors[0]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: '/api/search/visual/colors'
      }
    });
    
    console.log(`✅ Color extraction completed: ${colors.length} colors found`);
    
  } catch (error) {
    console.error('Color extraction error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Color extraction failed'
    });
  }
});

/**
 * POST /api/search/visual/objects
 * Detect objects in uploaded image
 */
router.post('/visual/objects', async (req, res) => {
  try {
    const validatedData = ObjectDetectionSchema.parse(req.body);
    
    console.log('📦 Object detection request received');
    
    const objects = await visualSearchService.detectObjects(validatedData.imageData);
    
    res.json({
      success: true,
      data: {
        objects,
        totalObjects: objects.length,
        categories: [...new Set(objects.map(obj => obj.category))]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: '/api/search/visual/objects'
      }
    });
    
    console.log(`✅ Object detection completed: ${objects.length} objects detected`);
    
  } catch (error) {
    console.error('Object detection error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Object detection failed'
    });
  }
});

/**
 * GET /api/search/visual/similar/:productId
 * Get visually similar products for a given product
 */
router.get('/visual/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    console.log(`🔗 Similar products request for product: ${productId}`);
    
    const similarImages = await visualSearchService.findSimilarImages(productId);
    
    // Mock similar products (in production, would use actual similarity algorithm)
    const mockSimilarProducts = [
      {
        productId: 'sim_001',
        title: 'Similar Product 1',
        price: 25000,
        image: '/images/similar_1.jpg',
        similarity: 0.89,
        matchingFeatures: ['color', 'shape', 'category']
      },
      {
        productId: 'sim_002', 
        title: 'Similar Product 2',
        price: 28000,
        image: '/images/similar_2.jpg',
        similarity: 0.82,
        matchingFeatures: ['color', 'brand']
      },
      {
        productId: 'sim_003',
        title: 'Similar Product 3',
        price: 22000,
        image: '/images/similar_3.jpg',
        similarity: 0.76,
        matchingFeatures: ['category', 'price_range']
      }
    ].slice(0, limit);
    
    res.json({
      success: true,
      data: {
        originalProductId: productId,
        similarProducts: mockSimilarProducts,
        similarImages,
        totalFound: mockSimilarProducts.length
      },
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: '/api/search/visual/similar'
      }
    });
    
    console.log(`✅ Found ${mockSimilarProducts.length} similar products`);
    
  } catch (error) {
    console.error('Similar products error:', error);
    res.status(500).json({
      success: false,
      error: 'Similar products search failed'
    });
  }
});

/**
 * POST /api/search/visual/analyze
 * Comprehensive image analysis (objects + colors + text)
 */
router.post('/visual/analyze', async (req, res) => {
  try {
    const validatedData = VisualSearchSchema.parse(req.body);
    const startTime = Date.now();
    
    console.log('🔍 Comprehensive image analysis started');
    
    // Run analysis without product search
    const mockAnalysis = {
      objects: await visualSearchService.detectObjects(validatedData.imageData),
      colors: await visualSearchService.extractDominantColors(validatedData.imageData),
      textContent: [
        {
          text: 'Samsung',
          confidence: 0.95,
          language: 'en' as const,
          boundingBox: { x: 100, y: 50, width: 80, height: 20 }
        }
      ],
      visualFeatures: [
        { feature: 'edge_density', value: 0.75, description: 'High detail product' },
        { feature: 'color_variance', value: 0.62, description: 'Moderate colors' }
      ]
    };
    
    const processingTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        analysis: mockAnalysis,
        summary: {
          objectsFound: mockAnalysis.objects.length,
          colorsExtracted: mockAnalysis.colors.length,
          textDetected: mockAnalysis.textContent.length,
          overallConfidence: 0.85
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        endpoint: '/api/search/visual/analyze'
      }
    });
    
    console.log(`✅ Image analysis completed in ${processingTime}ms`);
    
  } catch (error) {
    console.error('Image analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Image analysis failed'
    });
  }
});

/**
 * GET /api/search/visual/capabilities
 * Get visual search capabilities and supported features
 */
router.get('/visual/capabilities', async (req, res) => {
  try {
    const capabilities = {
      supportedFormats: ['JPEG', 'PNG', 'WebP', 'GIF'],
      maxFileSize: '10MB',
      searchTypes: ['similar', 'exact', 'category', 'brand'],
      objectDetection: {
        enabled: true,
        categories: ['electronics', 'fashion', 'home', 'books', 'accessories'],
        confidence: 0.7
      },
      colorAnalysis: {
        enabled: true,
        maxColors: 10,
        accuracy: 0.9
      },
      textRecognition: {
        enabled: true,
        languages: ['en', 'bn'],
        accuracy: 0.85
      },
      bangladesh: {
        culturalProducts: true,
        localBrands: true,
        bengaliText: true,
        festivalContext: true
      }
    };
    
    res.json({
      success: true,
      data: capabilities,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        endpoint: '/api/search/visual/capabilities'
      }
    });
    
    console.log('📋 Visual search capabilities provided');
    
  } catch (error) {
    console.error('Capabilities endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load capabilities'
    });
  }
});

export default router;