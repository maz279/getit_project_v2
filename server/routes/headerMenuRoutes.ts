import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertVendorSchema, insertUserSchema } from '@shared/schema';

const router = Router();

// Standardized response helpers (simple version)
const responseHelpers = {
  success: (req: any, res: any, data: any) => {
    res.json({
      success: true,
      data,
      metadata: {
        requestId: req.requestId || 'unknown',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
      }
    });
  },
  error: (req: any, res: any, message: string, statusCode = 500) => {
    res.status(statusCode).json({
      success: false,
      error: message,
      metadata: {
        requestId: req.requestId || 'unknown',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
      }
    });
  }
};

// Customer Service Routes
router.get('/help', async (req, res) => {
  try {
    const helpData = {
      supportChannels: [
        { type: 'live_chat', available: true, responseTime: '2-5 minutes' },
        { type: 'email', available: true, responseTime: '24 hours' },
        { type: 'phone', available: true, responseTime: 'immediate' }
      ],
      faq: [
        { question: 'How to track my order?', answer: 'Use the tracking number sent via email' },
        { question: 'How to return a product?', answer: 'Visit your orders page and click return' },
        { question: 'Payment methods available?', answer: 'Credit card, bKash, Nagad, Rocket' }
      ],
      contactInfo: {
        email: 'support@getit.com',
        phone: '+880-1234-567890',
        hours: '9 AM - 9 PM (Dhaka Time)'
      }
    };
    responseHelpers.success(req, res, helpData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch help information');
  }
});

// Order Tracking Routes
router.get('/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Order tracking request for ID:', orderId);
    console.log('About to call storage.getOrderById...');
    console.log('Storage object:', typeof storage);
    console.log('Storage getOrderById method:', typeof storage.getOrderById);
    const order = await storage.getOrderById(orderId);
    console.log('Order retrieved:', order);
    
    if (!order) {
      console.log('Order not found in database');
      responseHelpers.error(req, res, 'Order not found', 404);
      return;
    }

    const trackingData = {
      orderId: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber || 'TRK' + order.id,
      estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        { status: 'Order Placed', date: order.createdAt || order.created_at, completed: true },
        { status: 'Order Confirmed', date: order.confirmedAt || order.confirmed_at, completed: !!order.confirmedAt || !!order.confirmed_at },
        { status: 'Processing', date: order.processingAt || order.processing_at, completed: order.status !== 'pending' },
        { status: 'Shipped', date: order.shippedAt || order.shipped_at, completed: ['shipped', 'delivered'].includes(order.status) },
        { status: 'Delivered', date: order.deliveredAt || order.delivered_at, completed: order.status === 'delivered' }
      ],
      shippingAddress: order.shippingAddress || order.shipping_address,
      items: order.items || []
    };

    responseHelpers.success(req, res, trackingData);
  } catch (error) {
    console.error('Error in order tracking:', error);
    responseHelpers.error(req, res, 'Failed to track order');
  }
});

// Vendor Application Routes
router.post('/vendor/apply', async (req, res) => {
  try {
    const applicationSchema = z.object({
      businessName: z.string().min(2),
      ownerName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(10),
      businessType: z.enum(['individual', 'company', 'partnership']),
      businessAddress: z.string().min(10),
      tradeLicense: z.string().optional(),
      taxNumber: z.string().optional(),
      bankAccount: z.string().min(10),
      products: z.array(z.string()).min(1),
      businessDescription: z.string().min(50)
    });

    const validatedData = applicationSchema.parse(req.body);
    
    const application = await storage.createVendorApplication({
      ...validatedData,
      status: 'pending',
      appliedAt: new Date(),
      reviewedAt: null,
      approvedAt: null
    });

    responseHelpers.success(req, res, {
      applicationId: application.id,
      status: 'submitted',
      message: 'Vendor application submitted successfully',
      nextSteps: [
        'Document verification within 24 hours',
        'Business verification within 48 hours',
        'Account setup within 72 hours'
      ]
    });
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to submit vendor application');
  }
});

// Vendor Dashboard Routes
router.get('/vendor/dashboard', async (req, res) => {
  try {
    const vendorId = req.user?.vendorId || req.query.vendorId;
    
    if (!vendorId) {
      responseHelpers.error(req, res, 'Vendor authentication required', 401);
      return;
    }

    const vendor = await storage.getVendorById(parseInt(vendorId as string));
    
    if (!vendor) {
      responseHelpers.error(req, res, 'Vendor not found', 404);
      return;
    }

    const dashboardData = {
      vendor: {
        id: vendor.id,
        businessName: vendor.businessName,
        status: vendor.status,
        joinedDate: vendor.createdAt
      },
      metrics: {
        totalOrders: await storage.getVendorOrderCount(vendor.id),
        totalRevenue: await storage.getVendorRevenue(vendor.id),
        totalProducts: await storage.getVendorProductCount(vendor.id),
        averageRating: await storage.getVendorAverageRating(vendor.id)
      },
      recentOrders: await storage.getVendorRecentOrders(vendor.id, 10),
      topProducts: await storage.getVendorTopProducts(vendor.id, 5),
      notifications: await storage.getVendorNotifications(vendor.id, 5)
    };

    responseHelpers.success(req, res, dashboardData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch vendor dashboard');
  }
});

// Vendor Benefits Routes
router.get('/vendor/benefits', async (req, res) => {
  try {
    const benefitsData = {
      commission: {
        standard: '5%',
        premium: '3%',
        volume_discount: 'Up to 1% additional discount for high volume'
      },
      features: [
        { feature: 'Free store setup', included: true },
        { feature: 'Marketing tools', included: true },
        { feature: 'Analytics dashboard', included: true },
        { feature: 'Mobile app integration', included: true },
        { feature: 'Customer support', included: true },
        { feature: 'Payment processing', included: true }
      ],
      support: {
        onboarding: 'Dedicated onboarding specialist',
        training: 'Free training sessions',
        support: '24/7 vendor support hotline'
      },
      growth: {
        marketing: 'Featured product placement',
        promotion: 'Seasonal promotion campaigns',
        advertising: 'Sponsored product ads'
      }
    };

    responseHelpers.success(req, res, benefitsData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch vendor benefits');
  }
});

// User Profile Routes
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
      responseHelpers.error(req, res, 'User authentication required', 401);
      return;
    }

    const user = await storage.getUserById(parseInt(userId as string));
    
    if (!user) {
      responseHelpers.error(req, res, 'User not found', 404);
      return;
    }

    const profileData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isPremium: user.isPremium || false,
        memberSince: user.createdAt
      },
      preferences: {
        language: user.language || 'en',
        currency: user.currency || 'BDT',
        notifications: user.notifications || true
      },
      stats: {
        totalOrders: await storage.getUserOrderCount(user.id),
        totalSpent: await storage.getUserTotalSpent(user.id),
        wishlistItems: await storage.getUserWishlistCount(user.id),
        reviewsGiven: await storage.getUserReviewCount(user.id)
      }
    };

    responseHelpers.success(req, res, profileData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch user profile');
  }
});

// User Orders Routes
router.get('/orders', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!userId) {
      responseHelpers.error(req, res, 'User authentication required', 401);
      return;
    }

    const orders = await storage.getUserOrders(parseInt(userId as string), page, limit);
    const totalOrders = await storage.getUserOrderCount(parseInt(userId as string));

    const ordersData = {
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: 'ORD' + order.id,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        items: order.items || [],
        trackingNumber: order.trackingNumber || 'TRK' + order.id
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1
      }
    };

    responseHelpers.success(req, res, ordersData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch user orders');
  }
});

// Premium Subscription Routes
router.get('/premium', async (req, res) => {
  try {
    const premiumData = {
      plans: [
        {
          id: 'basic',
          name: 'Premium Basic',
          price: 299,
          currency: 'BDT',
          duration: 'month',
          features: [
            'Free shipping on all orders',
            'Priority customer support',
            'Early access to sales',
            'Extended return period'
          ]
        },
        {
          id: 'pro',
          name: 'Premium Pro',
          price: 499,
          currency: 'BDT',
          duration: 'month',
          features: [
            'All Basic features',
            'Exclusive deals and discounts',
            'Premium product reviews',
            'VIP customer service',
            'Birthday and anniversary gifts'
          ]
        }
      ],
      currentUserPlan: null,
      benefits: {
        shipping: 'Free shipping on all orders',
        support: 'Priority customer support',
        deals: 'Exclusive member-only deals',
        returns: '60-day return policy'
      }
    };

    responseHelpers.success(req, res, premiumData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch premium information');
  }
});

// Categories Routes
router.get('/categories', async (req, res) => {
  try {
    const categories = await storage.getCategories();
    
    const categoriesData = {
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.imageUrl || 'default-icon',
        productCount: 0, // Would be calculated dynamically in a real system
        subcategories: []
      })),
      featured: categories.filter(cat => cat.isActive).slice(0, 8) // Using isActive since no featured column
    };

    responseHelpers.success(req, res, categoriesData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch categories');
  }
});

// Flash Sale Routes
router.get('/flash-sale', async (req, res) => {
  try {
    const flashSaleData = {
      active: true,
      title: 'Flash Sale - Limited Time Only!',
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      products: await storage.getFlashSaleProducts(20),
      discounts: {
        min: 10,
        max: 70,
        average: 35
      },
      stats: {
        totalProducts: await storage.getFlashSaleProductCount(),
        soldCount: await storage.getFlashSaleSoldCount(),
        remainingTime: '23:45:30'
      }
    };

    responseHelpers.success(req, res, flashSaleData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch flash sale data');
  }
});

// Deals Routes
router.get('/deals', async (req, res) => {
  try {
    const dealsData = {
      todayDeals: await storage.getTodayDeals(10),
      weeklyDeals: await storage.getWeeklyDeals(10),
      bundleDeals: await storage.getBundleDeals(5),
      clearanceDeals: await storage.getClearanceDeals(10),
      categories: [
        { name: 'Electronics', discount: 'Up to 50% off' },
        { name: 'Fashion', discount: 'Up to 70% off' },
        { name: 'Home & Living', discount: 'Up to 40% off' },
        { name: 'Beauty', discount: 'Up to 60% off' }
      ]
    };

    responseHelpers.success(req, res, dealsData);
  } catch (error) {
    responseHelpers.error(req, res, 'Failed to fetch deals data');
  }
});

export default router;