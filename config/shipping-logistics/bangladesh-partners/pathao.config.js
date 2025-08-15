/**
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * Pathao Courier Service Configuration
 * Production-Ready Amazon.com/Shopee.sg-Level Implementation
 * Last Updated: July 6, 2025
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment-specific configuration
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.join(__dirname, '../../../environments', `${env}.env`) });

/**
 * Pathao Shipping Partner Configuration
 * Bangladesh's leading logistics and delivery service
 */
module.exports = {
  // Basic Configuration
  partner: {
    name: 'Pathao',
    code: 'PATHAO',
    country: 'BD',
    logo: '/assets/images/icons/shipping-partners/pathao.svg',
    color: '#E91E63',
    enabled: true,
    priority: 1 // Highest priority in Bangladesh
  },

  // API Configuration
  api: {
    // Environment-specific URLs
    baseUrl: process.env.PATHAO_BASE_URL || 'https://api-hermes-staging.pathao.com',
    
    // Production URLs
    production: {
      baseUrl: 'https://api-hermes.pathao.com',
      authUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/issue-token',
      cityUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/cities',
      areaUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/cities/{city_id}/area-list',
      zoneUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/cities/{city_id}/zone-list',
      storeUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/stores',
      orderUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/orders',
      priceUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/merchant/price-plan'
    },

    // Staging URLs
    staging: {
      baseUrl: 'https://api-hermes-staging.pathao.com',
      authUrl: 'https://api-hermes-staging.pathao.com/aladdin/api/v1/issue-token',
      cityUrl: 'https://api-hermes-staging.pathao.com/aladdin/api/v1/cities',
      areaUrl: 'https://api-hermes-staging.pathao.com/aladdin/api/v1/cities/{city_id}/area-list',
      zoneUrl: 'https://api-hermes-staging.pathao.com/aladdin/api/v1/cities/{city_id}/zone-list',
      storeUrl: 'https://api-hermes-staging.pathao.com/aladdin/api/v1/stores',
      orderUrl: 'https://api-hermes-staging.pathao.com/aladdin/api/v1/orders',
      priceUrl: 'https://api-hermes-staging.pathao.com/aladdin/api/v1/merchant/price-plan'
    },

    // Authentication
    credentials: {
      clientId: process.env.PATHAO_CLIENT_ID,
      clientSecret: process.env.PATHAO_CLIENT_SECRET,
      grantType: 'client_credentials'
    },

    // Request Configuration
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 2000 // 2 seconds
  },

  // Delivery Services Configuration
  services: {
    // Same Day Delivery
    sameDay: {
      name: 'Same Day Delivery',
      code: 'SAME_DAY',
      enabled: true,
      cutoffTime: '14:00', // 2 PM cutoff
      deliveryTime: 'Same day by 9 PM',
      areas: ['dhaka_metro', 'chittagong_metro'],
      weightLimit: 5000, // 5 KG
      priceMultiplier: 2.0
    },

    // Next Day Delivery
    nextDay: {
      name: 'Next Day Delivery',
      code: 'NEXT_DAY',
      enabled: true,
      cutoffTime: '18:00', // 6 PM cutoff
      deliveryTime: 'Next day by 6 PM',
      areas: ['all_bangladesh'],
      weightLimit: 20000, // 20 KG
      priceMultiplier: 1.5
    },

    // Standard Delivery
    standard: {
      name: 'Standard Delivery',
      code: 'STANDARD',
      enabled: true,
      cutoffTime: '23:59',
      deliveryTime: '2-3 business days',
      areas: ['all_bangladesh'],
      weightLimit: 50000, // 50 KG
      priceMultiplier: 1.0
    },

    // Express Delivery
    express: {
      name: 'Express Delivery',
      code: 'EXPRESS',
      enabled: true,
      cutoffTime: '12:00', // 12 PM cutoff
      deliveryTime: '4-6 hours',
      areas: ['dhaka_metro'],
      weightLimit: 2000, // 2 KG
      priceMultiplier: 3.0
    }
  },

  // Coverage Areas Configuration
  coverage: {
    // Major Cities
    cities: [
      {
        id: 1,
        name: 'Dhaka',
        bnName: 'ঢাকা',
        type: 'metro',
        enabled: true,
        sameDay: true,
        express: true,
        cod: true
      },
      {
        id: 2,
        name: 'Chittagong',
        bnName: 'চট্টগ্রাম',
        type: 'metro',
        enabled: true,
        sameDay: true,
        express: false,
        cod: true
      },
      {
        id: 3,
        name: 'Sylhet',
        bnName: 'সিলেট',
        type: 'city',
        enabled: true,
        sameDay: false,
        express: false,
        cod: true
      },
      {
        id: 4,
        name: 'Rajshahi',
        bnName: 'রাজশাহী',
        type: 'city',
        enabled: true,
        sameDay: false,
        express: false,
        cod: true
      },
      {
        id: 5,
        name: 'Khulna',
        bnName: 'খুলনা',
        type: 'city',
        enabled: true,
        sameDay: false,
        express: false,
        cod: true
      }
    ],

    // Special Zones
    specialZones: [
      {
        name: 'Dhaka Metro',
        areas: ['dhanmondi', 'gulshan', 'banani', 'uttara', 'mirpur', 'mohammadpur'],
        deliveryTime: '2-4 hours',
        extraCharge: 0
      },
      {
        name: 'Dhaka Suburb',
        areas: ['savar', 'keraniganj', 'tongi', 'gazipur'],
        deliveryTime: '4-8 hours',
        extraCharge: 20
      },
      {
        name: 'Remote Areas',
        areas: ['hill_tracts', 'char_areas', 'haor_areas'],
        deliveryTime: '5-7 days',
        extraCharge: 50
      }
    ]
  },

  // Pricing Configuration
  pricing: {
    // Base Rates (BDT)
    baseRates: {
      inside_dhaka: {
        upTo1kg: 60,
        upTo2kg: 70,
        upTo3kg: 80,
        upTo5kg: 100,
        additionalKg: 15
      },
      outside_dhaka: {
        upTo1kg: 100,
        upTo2kg: 110,
        upTo3kg: 120,
        upTo5kg: 140,
        additionalKg: 20
      },
      special_area: {
        upTo1kg: 150,
        upTo2kg: 170,
        upTo3kg: 190,
        upTo5kg: 220,
        additionalKg: 30
      }
    },

    // Additional Charges
    additionalCharges: {
      cod: {
        enabled: true,
        percentage: 1.0, // 1% of product value
        minimum: 10,     // Minimum 10 BDT
        maximum: 200     // Maximum 200 BDT
      },
      insurance: {
        enabled: true,
        percentage: 0.5, // 0.5% of product value
        minimum: 5,      // Minimum 5 BDT
        maximum: 1000    // Maximum 1000 BDT
      },
      fragile: {
        enabled: true,
        flatRate: 25 // 25 BDT for fragile items
      },
      oversized: {
        enabled: true,
        threshold: 0.1, // 0.1 cubic meter
        chargePerCbm: 500 // 500 BDT per cubic meter
      }
    },

    // Discounts and Promotions
    discounts: {
      volume: [
        { threshold: 100, discount: 0.05 }, // 5% for 100+ orders/month
        { threshold: 500, discount: 0.10 }, // 10% for 500+ orders/month
        { threshold: 1000, discount: 0.15 } // 15% for 1000+ orders/month
      ],
      loyalty: {
        enabled: true,
        pointsPerOrder: 10,
        pointsValue: 0.1 // 1 point = 0.1 BDT
      }
    }
  },

  // Order Management Configuration
  orderManagement: {
    // Order Types
    orderTypes: {
      regular: {
        name: 'Regular Delivery',
        description: 'Standard delivery service'
      },
      express: {
        name: 'Express Delivery',
        description: 'Fast delivery service'
      },
      fragile: {
        name: 'Fragile Item',
        description: 'Special handling for fragile items'
      },
      bulk: {
        name: 'Bulk Order',
        description: 'Multiple items in single delivery'
      }
    },

    // Order Status Mapping
    statusMapping: {
      'Pending': 'order_placed',
      'Pickup_Requested': 'pickup_scheduled',
      'On_the_way_to_pickup': 'pickup_in_progress',
      'Picked_Up': 'picked_up',
      'Warehouse_Received': 'in_transit',
      'On_the_way_to_deliver': 'out_for_delivery',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled',
      'Returned': 'returned',
      'Hold': 'on_hold'
    },

    // Delivery Time Slots
    timeSlots: [
      { id: 1, name: 'Morning', time: '09:00-12:00', available: true },
      { id: 2, name: 'Afternoon', time: '12:00-15:00', available: true },
      { id: 3, name: 'Evening', time: '15:00-18:00', available: true },
      { id: 4, name: 'Night', time: '18:00-21:00', available: true }
    ],

    // Package Types
    packageTypes: [
      { id: 1, name: 'Document', maxWeight: 0.5, dimension: '30x21x1' },
      { id: 2, name: 'Small Package', maxWeight: 2, dimension: '30x30x10' },
      { id: 3, name: 'Medium Package', maxWeight: 5, dimension: '40x40x20' },
      { id: 4, name: 'Large Package', maxWeight: 20, dimension: '60x60x40' },
      { id: 5, name: 'Oversized', maxWeight: 50, dimension: 'custom' }
    ]
  },

  // Tracking Configuration
  tracking: {
    // Real-time Tracking
    realTime: {
      enabled: true,
      updateInterval: 300000, // 5 minutes
      gpsTracking: true,
      statusUpdates: true
    },

    // Notification Triggers
    notifications: [
      { event: 'order_confirmed', sms: true, email: true, push: true },
      { event: 'pickup_scheduled', sms: true, email: false, push: true },
      { event: 'picked_up', sms: true, email: false, push: true },
      { event: 'in_transit', sms: false, email: false, push: true },
      { event: 'out_for_delivery', sms: true, email: true, push: true },
      { event: 'delivered', sms: true, email: true, push: true },
      { event: 'failed_delivery', sms: true, email: true, push: true }
    ],

    // Customer Communication
    communication: {
      smsTemplate: 'Your order #{orderId} is {status}. Track: {trackingUrl}',
      emailTemplate: 'pathao_delivery_notification',
      pushTemplate: 'Order Update: {status}',
      language: 'both' // 'bengali', 'english', 'both'
    }
  },

  // Integration Configuration
  integration: {
    // Webhook Configuration
    webhooks: {
      enabled: true,
      url: `${process.env.APP_URL}/api/v1/shipping/pathao/webhook`,
      events: [
        'order.status_changed',
        'delivery.completed',
        'delivery.failed',
        'pickup.scheduled',
        'pickup.completed'
      ],
      retryAttempts: 5,
      retryInterval: 300, // 5 minutes
      secret: process.env.PATHAO_WEBHOOK_SECRET
    },

    // Store Integration
    stores: {
      autoCreate: true,
      defaultStore: {
        name: 'GetIt Bangladesh',
        contactName: 'Store Manager',
        contactNumber: '+8801700000000',
        address: 'Dhaka, Bangladesh',
        businessType: 'E-commerce'
      }
    },

    // Bulk Operations
    bulk: {
      maxOrdersPerBatch: 100,
      batchProcessingTime: 60000, // 1 minute
      parallelProcessing: true
    }
  },

  // Bangladesh-Specific Features
  bangladesh: {
    // Local Features
    features: {
      codSupport: true,
      bengaliInterface: true,
      mobileNumberValidation: true,
      islamicCalendarSupport: true,
      festivalDeliverySchedule: true
    },

    // Cultural Considerations
    cultural: {
      prayerTimeAwareness: true,
      fridayDeliveryLimited: true,
      eIdHolidaySchedule: true,
      ramadanTimingAdjustment: true
    },

    // Regulatory Compliance
    compliance: {
      customsDocumentation: true,
      vatCalculation: true,
      governmentHolidays: true,
      localBusinessLicense: true
    },

    // Local Holidays (No delivery)
    holidays: [
      'eid-ul-fitr',
      'eid-ul-adha',
      'victory-day',
      'independence-day',
      'pohela-boishakh',
      'durga-puja',
      'shab-e-barat',
      'shab-e-qadr'
    ]
  },

  // Quality Assurance
  qualityAssurance: {
    // Service Level Agreement
    sla: {
      pickupTime: '2 hours', // Within 2 hours of request
      deliveryTime: {
        sameDay: '12 hours',
        nextDay: '24 hours',
        standard: '72 hours'
      },
      accuracy: 0.98, // 98% delivery accuracy
      onTimeDelivery: 0.95 // 95% on-time delivery
    },

    // Performance Metrics
    metrics: {
      deliverySuccess: 0.97,
      customerSatisfaction: 4.5, // Out of 5
      damageRate: 0.01, // 1% damage rate
      lossRate: 0.005 // 0.5% loss rate
    }
  },

  // Error Handling
  errorHandling: {
    // Common Error Codes
    errorCodes: {
      'invalid_address': 'Invalid delivery address',
      'area_not_covered': 'Area not covered by Pathao',
      'weight_exceeded': 'Package weight exceeded limit',
      'api_limit_reached': 'API rate limit exceeded',
      'insufficient_balance': 'Insufficient merchant balance',
      'service_unavailable': 'Pathao service temporarily unavailable'
    },

    // Fallback Configuration
    fallback: {
      enabled: true,
      alternatives: ['paperfly', 'sundarban', 'redx'],
      autoSwitch: true,
      threshold: 3 // Switch after 3 consecutive failures
    },

    // Retry Strategy
    retry: {
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      baseDelay: 2000, // 2 seconds
      maxDelay: 30000  // 30 seconds
    }
  },

  // Testing Configuration
  testing: {
    // Test Mode
    testMode: process.env.NODE_ENV !== 'production',
    
    // Test Data
    testAddresses: [
      {
        name: 'Test Customer',
        phone: '01700000000',
        address: 'Dhanmondi, Dhaka',
        area: 'dhanmondi',
        city: 'dhaka'
      }
    ],

    // Mock Responses
    mockEnabled: process.env.MOCK_EXTERNAL_SERVICES === 'true',
    mockDelay: 2000,
    mockSuccessRate: 0.95
  }
};

/**
 * Get environment-specific configuration
 */
module.exports.getConfig = function(environment = process.env.NODE_ENV) {
  const config = { ...module.exports };
  
  if (environment === 'production') {
    config.api.baseUrl = config.api.production.baseUrl;
    config.testing.testMode = false;
    config.testing.mockEnabled = false;
  } else {
    config.api.baseUrl = config.api.staging.baseUrl;
    config.testing.testMode = true;
  }
  
  return config;
};