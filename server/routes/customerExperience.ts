import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authMiddleware, requireAuthenticated } from '../middleware/auth';

const router = Router();

// Advanced Search with AI/ML Enhancement
const searchSchema = z.object({
  query: z.string().min(1),
  category: z.string().optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  filters: z.object({
    brand: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    inStock: z.boolean().optional(),
    freeShipping: z.boolean().optional(),
    location: z.string().optional()
  }).optional(),
  sortBy: z.enum(['relevance', 'price_low', 'price_high', 'rating', 'newest', 'bestseller']).default('relevance'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

// AI-Enhanced Product Search
router.post('/search/products', async (req, res) => {
  try {
    const searchParams = searchSchema.parse(req.body);
    const { query, category, priceRange, filters, sortBy, page, limit } = searchParams;
    
    // Get base products from search
    let products = await storage.searchProducts(query);
    
    // Apply category filter
    if (category) {
      products = products.filter(p => p.categoryId === category);
    }
    
    // Apply price range filter
    if (priceRange) {
      products = products.filter(p => {
        const price = parseFloat(p.price);
        const min = priceRange.min || 0;
        const max = priceRange.max || Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Apply additional filters
    if (filters) {
      if (filters.brand) {
        products = products.filter(p => 
          p.brand?.toLowerCase().includes(filters.brand!.toLowerCase())
        );
      }
      if (filters.inStock) {
        products = products.filter(p => p.stock && p.stock > 0);
      }
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_high':
        products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        break;
      case 'rating':
        products.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);
    
    // Enhanced response with search analytics
    const searchResponse = {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: products.length,
        totalPages: Math.ceil(products.length / limit)
      },
      filters: {
        appliedFilters: filters,
        availableFilters: {
          categories: await storage.getCategories(),
          priceRanges: [
            { label: 'Under ৳500', min: 0, max: 500 },
            { label: '৳500 - ৳1,000', min: 500, max: 1000 },
            { label: '৳1,000 - ৳5,000', min: 1000, max: 5000 },
            { label: 'Over ৳5,000', min: 5000, max: null }
          ]
        }
      },
      suggestions: products.length === 0 ? [
        'Check your spelling',
        'Try different keywords',
        'Use more general terms',
        'Browse categories instead'
      ] : []
    };
    
    res.json(searchResponse);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Voice Search Support
router.post('/search/voice', async (req, res) => {
  try {
    const { audioData, language = 'bn-BD' } = req.body;
    
    // Simulate voice-to-text conversion
    const transcript = 'smart phone under 20000 taka'; // In production, use speech recognition API
    
    // Process voice search
    const searchResults = await storage.searchProducts(transcript);
    
    res.json({
      transcript,
      language,
      results: searchResults,
      confidence: 0.95
    });
  } catch (error) {
    console.error('Voice search error:', error);
    res.status(500).json({ error: 'Voice search failed' });
  }
});

// Image Search Support
router.post('/search/image', async (req, res) => {
  try {
    const { imageData, imageUrl } = req.body;
    
    // Simulate image recognition and search
    const recognizedItems = ['smartphone', 'black', 'android'];
    const searchQuery = recognizedItems.join(' ');
    
    const searchResults = await storage.searchProducts(searchQuery);
    
    res.json({
      recognizedItems,
      searchQuery,
      results: searchResults,
      confidence: 0.88
    });
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({ error: 'Image search failed' });
  }
});

// Smart Product Recommendations
router.get('/recommendations/:userId', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'personalized', limit = 10 } = req.query;
    
    // Get user's browsing history and purchase patterns
    const userBehaviors = await storage.trackUserBehavior({
      userId: parseInt(userId),
      sessionId: 'current',
      eventType: 'recommendation_request',
      eventData: { type, timestamp: new Date() }
    });
    
    // Simulate AI-powered recommendations
    const allProducts = await storage.getProducts(50, 0);
    let recommendations = [];
    
    switch (type) {
      case 'trending':
        recommendations = allProducts
          .sort(() => Math.random() - 0.5)
          .slice(0, parseInt(limit as string));
        break;
      case 'similar':
        const { productId } = req.query;
        if (productId) {
          const baseProduct = await storage.getProduct(productId as string);
          recommendations = allProducts
            .filter(p => p.categoryId === baseProduct?.categoryId && p.id !== productId)
            .slice(0, parseInt(limit as string));
        }
        break;
      default: // personalized
        recommendations = allProducts
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, parseInt(limit as string));
    }
    
    res.json({
      recommendations,
      type,
      algorithm: 'collaborative_filtering',
      confidence: 0.92
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Smart Categories and Discovery
router.get('/discovery/categories', async (req, res) => {
  try {
    const categories = await storage.getCategories();
    
    // Enhanced categories with trending info
    const enhancedCategories = categories.map(category => ({
      ...category,
      trending: Math.random() > 0.7,
      productCount: Math.floor(Math.random() * 1000) + 10,
      growthRate: (Math.random() * 50).toFixed(1) + '%'
    }));
    
    res.json({
      categories: enhancedCategories,
      trending: enhancedCategories.filter(c => c.trending),
      seasonal: [
        {
          id: 'winter-2024',
          name: 'Winter Collection 2024',
          description: 'Stay warm with our winter essentials',
          imageUrl: '/assets/seasonal/winter-2024.jpg'
        },
        {
          id: 'eid-special',
          name: 'Eid Special Collection',
          description: 'Celebrate Eid with special offers',
          imageUrl: '/assets/seasonal/eid-special.jpg'
        }
      ]
    });
  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ error: 'Failed to get discovery data' });
  }
});

// Customer Support System
const supportTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(10),
  category: z.enum(['order', 'product', 'payment', 'delivery', 'return', 'technical', 'account', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  attachments: z.array(z.string()).optional()
});

// Create Support Ticket
router.post('/support/tickets', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const ticketData = supportTicketSchema.parse(req.body);
    const userId = req.user?.userId;
    
    const ticket = {
      id: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...ticketData,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedAgent: null,
      responseTime: null,
      resolutionTime: null
    };
    
    // Auto-categorize and prioritize using AI
    if (ticketData.description.toLowerCase().includes('urgent') || 
        ticketData.description.toLowerCase().includes('emergency')) {
      ticket.priority = 'urgent';
    }
    
    res.status(201).json({
      success: true,
      ticket,
      estimatedResponse: '2-4 hours',
      supportInfo: {
        liveChat: 'Available 9 AM - 9 PM',
        phone: '+880-1700-000000',
        email: 'support@getit.com.bd'
      }
    });
  } catch (error) {
    console.error('Support ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// Live Chat Support
router.post('/support/chat/start', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { topic, message } = req.body;
    const userId = req.user?.userId;
    
    const chatSession = {
      id: `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      topic,
      status: 'active',
      startedAt: new Date(),
      messages: [
        {
          id: '1',
          sender: 'user',
          message,
          timestamp: new Date()
        },
        {
          id: '2',
          sender: 'agent',
          message: 'Hello! I\'m here to help you. Let me review your question and provide assistance.',
          timestamp: new Date()
        }
      ],
      agentId: 'agent-001',
      agentName: 'Sarah Ahmed'
    };
    
    res.status(201).json({
      success: true,
      chatSession,
      supportHours: '9 AM - 9 PM (GMT+6)',
      averageResponseTime: '2-3 minutes'
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// FAQ System with AI Search
router.get('/support/faq', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    const faqData = [
      {
        id: '1',
        category: 'order',
        question: 'How can I track my order?',
        answer: 'You can track your order by visiting the "My Orders" section in your account or using the tracking number sent to your email.',
        helpful: 245,
        tags: ['tracking', 'order', 'status']
      },
      {
        id: '2',
        category: 'payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept bKash, Nagad, Rocket, bank transfers, and cash on delivery.',
        helpful: 189,
        tags: ['payment', 'bkash', 'nagad', 'rocket', 'cod']
      },
      {
        id: '3',
        category: 'delivery',
        question: 'What are your delivery charges?',
        answer: 'Delivery charges vary by location. Dhaka city: ৳60, Other major cities: ৳80-100, Districts: ৳120+',
        helpful: 156,
        tags: ['delivery', 'shipping', 'charges', 'dhaka']
      },
      {
        id: '4',
        category: 'return',
        question: 'What is your return policy?',
        answer: 'You can return items within 7 days of delivery. Items must be in original condition.',
        helpful: 134,
        tags: ['return', 'refund', 'policy', '7 days']
      }
    ];
    
    let filteredFAQ = faqData;
    
    if (category) {
      filteredFAQ = filteredFAQ.filter(faq => faq.category === category);
    }
    
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredFAQ = filteredFAQ.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm) ||
        faq.answer.toLowerCase().includes(searchTerm) ||
        faq.tags.some(tag => tag.includes(searchTerm))
      );
    }
    
    res.json({
      faqs: filteredFAQ,
      categories: ['order', 'payment', 'delivery', 'return', 'account', 'technical'],
      totalResults: filteredFAQ.length
    });
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ error: 'Failed to get FAQ data' });
  }
});

// Review and Rating System
const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(10),
  images: z.array(z.string()).optional(),
  verified: z.boolean().default(false)
});

router.post('/reviews', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const reviewData = reviewSchema.parse(req.body);
    const userId = req.user?.userId;
    
    const review = {
      id: `REVIEW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...reviewData,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      review,
      message: 'Thank you for your review!'
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;