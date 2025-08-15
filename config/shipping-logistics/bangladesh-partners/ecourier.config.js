// eCourier Service Configuration
// Bangladesh's trusted courier and logistics service

module.exports = {
  // Service Information
  service: {
    name: 'eCourier',
    type: 'courier_service',
    category: 'comprehensive_logistics',
    country: 'Bangladesh',
    environment: 'production',
    enabled: true,
    description: 'Trusted courier service with comprehensive delivery solutions across Bangladesh',
    website: 'https://ecourier.com.bd',
    support: '+880 9610-200200'
  },

  // API Configuration
  api: {
    baseUrl: process.env.ECOURIER_API_BASE_URL || 'https://backoffice.ecourier.com.bd/api',
    authUrl: 'https://backoffice.ecourier.com.bd/api/authenticate',
    version: 'v1',
    timeout: 30000,
    retries: 3,
    rateLimit: {
      requests: 500,
      window: 3600 // 1 hour
    },

    // Authentication
    auth: {
      type: 'api_key',
      apiKey: process.env.ECOURIER_API_KEY,
      userId: process.env.ECOURIER_USER_ID,
      apiSecret: process.env.ECOURIER_API_SECRET,
      headers: {
        'API-KEY': process.env.ECOURIER_API_KEY,
        'API-SECRET': process.env.ECOURIER_API_SECRET,
        'USER-ID': process.env.ECOURIER_USER_ID
      }
    },

    // API Endpoints
    endpoints: {
      // Area Management
      cities: '/city-list',
      areas: '/area-list',
      branches: '/branch-list',

      // Parcel Management
      placeOrder: '/order-place',
      trackParcel: '/track-order',
      cancelOrder: '/cancel-order',
      orderList: '/order-list',
      
      // Pricing
      calculatePrice: '/price-calculate',
      packagePrice: '/package-price',
      
      // Reports
      orderReport: '/order-report',
      paymentStatus: '/payment-status',
      
      // Pickup
      pickupRequest: '/pickup-request',
      pickupCancel: '/pickup-cancel'
    }
  },

  // Service Configuration
  services: {
    // Regular Delivery
    regular: {
      name: 'Regular Delivery',
      code: 'REGULAR',
      enabled: true,
      deliveryTime: '1-3 business days',
      maxWeight: 30, // kg
      codSupported: true,
      fragileSupported: true,
      description: 'Standard delivery service across Bangladesh'
    },

    // Express Delivery
    express: {
      name: 'Express Delivery',
      code: 'EXPRESS',
      enabled: true,
      deliveryTime: '24-48 hours',
      maxWeight: 25, // kg
      codSupported: true,
      premiumService: true,
      description: 'Fast delivery within Dhaka and major cities'
    },

    // Same Day Delivery
    sameDay: {
      name: 'Same Day Delivery',
      code: 'SAME_DAY',
      enabled: true,
      deliveryTime: '4-8 hours',
      maxWeight: 15, // kg
      cutoffTime: '14:00',
      availableAreas: ['dhaka', 'chittagong'],
      codSupported: true,
      premiumService: true,
      description: 'Same day delivery in select cities'
    },

    // Document Service
    document: {
      name: 'Document Delivery',
      code: 'DOCUMENT',
      enabled: true,
      deliveryTime: '24-48 hours',
      maxWeight: 2, // kg
      codSupported: false,
      specialHandling: true,
      description: 'Secure document delivery service'
    },

    // Fragile Items
    fragile: {
      name: 'Fragile Item Delivery',
      code: 'FRAGILE',
      enabled: true,
      deliveryTime: '2-4 business days',
      maxWeight: 20, // kg
      specialPackaging: true,
      codSupported: true,
      insuranceRequired: true,
      description: 'Special handling for fragile items'
    }
  },

  // Coverage Areas
  coverage: {
    // Inside Dhaka
    insideDhaka: {
      areas: [
        'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur',
        'Mohammadpur', 'Old Dhaka', 'Wari', 'Ramna', 'Tejgaon',
        'Pallabi', 'Savar', 'Keraniganj', 'Dohar'
      ],
      serviceLevels: ['regular', 'express', 'sameDay', 'document', 'fragile'],
      codSupported: true,
      deliveryDays: 6
    },

    // Dhaka Sub Area
    dhakaSubArea: {
      areas: [
        'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj',
        'Narsingdi', 'Tangail'
      ],
      serviceLevels: ['regular', 'express', 'document'],
      codSupported: true,
      deliveryDays: 5
    },

    // Outside Dhaka
    outsideDhaka: {
      divisions: [
        'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet',
        'Barisal', 'Rangpur', 'Mymensingh'
      ],
      majorCities: [
        'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet',
        'Cumilla', 'Bogura', 'Jessore', 'Rangpur'
      ],
      serviceLevels: ['regular', 'express', 'document'],
      codSupported: true,
      deliveryDays: 5
    }
  },

  // Pricing Configuration
  pricing: {
    // Weight-based Pricing
    weightBased: {
      insideDhaka: {
        upTo1kg: 60,
        upTo2kg: 80,
        upTo3kg: 100,
        upTo5kg: 140,
        upTo10kg: 200,
        above10kg: 20 // per kg
      },
      
      dhakaSubArea: {
        upTo1kg: 80,
        upTo2kg: 100,
        upTo3kg: 120,
        upTo5kg: 160,
        upTo10kg: 240,
        above10kg: 24 // per kg
      },
      
      outsideDhaka: {
        upTo1kg: 120,
        upTo2kg: 150,
        upTo3kg: 180,
        upTo5kg: 220,
        upTo10kg: 300,
        above10kg: 30 // per kg
      }
    },

    // Service-specific Charges
    serviceCharges: {
      express: {
        multiplier: 1.5,
        minCharge: 100
      },
      sameDay: {
        multiplier: 2.5,
        minCharge: 200,
        surcharge: 100
      },
      document: {
        flatRate: 80,
        maxWeight: 2
      },
      fragile: {
        multiplier: 1.3,
        packagingFee: 50,
        minCharge: 120
      }
    },

    // Additional Charges
    additionalCharges: {
      cod: {
        enabled: true,
        type: 'percentage',
        rate: 1.0, // 1%
        minimum: 10,
        maximum: 200
      },
      
      insurance: {
        enabled: true,
        type: 'percentage',
        rate: 0.5, // 0.5%
        minimum: 10,
        maximum: 1000
      },
      
      packaging: {
        enabled: true,
        standardBox: 30,
        customPackaging: 50,
        fragilePackaging: 80
      },
      
      pickup: {
        enabled: true,
        withinCity: 50,
        outsideCity: 100,
        emergencyPickup: 150
      }
    }
  },

  // Cash on Delivery (COD)
  cod: {
    enabled: true,
    maxAmount: 50000, // BDT
    minAmount: 100,   // BDT
    
    feeStructure: {
      type: 'percentage',
      rate: 1.0,       // 1%
      minimum: 10,     // BDT
      maximum: 200     // BDT
    },
    
    settlementCycle: 'weekly',
    settlementDay: 'thursday',
    autoSettlement: false,
    manualApproval: true,
    
    verification: {
      otpRequired: true,
      photoRequired: false,
      signatureRequired: true
    }
  },

  // Tracking Configuration
  tracking: {
    enabled: true,
    realTimeUpdates: false,
    updateFrequency: '4_hours',
    smsNotifications: true,
    emailNotifications: false,

    // Status Mapping
    statusMapping: {
      'Order Placed': 'ORDER_PLACED',
      'Picked Up': 'PICKED_UP',
      'In Transit': 'IN_TRANSIT',
      'Out for Delivery': 'OUT_FOR_DELIVERY',
      'Delivered': 'DELIVERED',
      'Delivery Failed': 'DELIVERY_FAILED',
      'Returned': 'RETURNED',
      'Cancelled': 'CANCELLED'
    },

    // Delivery Confirmation
    deliveryConfirmation: {
      otpRequired: false,
      photoRequired: false,
      signatureRequired: true,
      recipientContactRequired: true
    }
  },

  // Pickup Services
  pickup: {
    enabled: true,
    
    // Pickup Times
    pickupTimes: {
      morning: '10:00-13:00',
      afternoon: '14:00-17:00',
      evening: '17:00-20:00'
    },
    
    // Pickup Areas
    pickupAreas: {
      insideDhaka: {
        enabled: true,
        fee: 50,
        sameDayPickup: true,
        advanceBooking: 1 // hours
      },
      
      dhakaSubArea: {
        enabled: true,
        fee: 100,
        sameDayPickup: false,
        advanceBooking: 24 // hours
      },
      
      outsideDhaka: {
        enabled: true,
        fee: 150,
        sameDayPickup: false,
        advanceBooking: 48 // hours
      }
    },
    
    // Bulk Pickup
    bulkPickup: {
      enabled: true,
      minParcels: 5,
      freePickupThreshold: 10,
      scheduledPickup: true
    }
  },

  // Business Solutions
  business: {
    corporateAccount: {
      enabled: true,
      minMonthlyVolume: 50,
      creditFacility: true,
      dedicatedSupport: true,
      customPricing: true
    },
    
    ecommerceSolution: {
      enabled: true,
      bulkBooking: true,
      csvUpload: true,
      apiIntegration: true,
      webhookSupport: false,
      returnManagement: true
    },
    
    subscriptionService: {
      enabled: true,
      recurringDelivery: true,
      scheduleManagement: true,
      customerNotification: true
    }
  },

  // Integration Features
  integration: {
    // API Integration
    api: {
      bulkOrderUpload: true,
      orderTracking: true,
      priceCalculation: true,
      areaValidation: true,
      orderCancellation: true
    },
    
    // Third-party Integration
    thirdParty: {
      ecommercePlugins: [
        'woocommerce',
        'shopify',
        'magento',
        'prestashop'
      ],
      accountingSoftware: [
        'quickbooks',
        'tally',
        'sage'
      ]
    },
    
    // Data Format
    dataFormat: {
      input: ['json', 'xml', 'csv'],
      output: ['json', 'xml'],
      encoding: 'utf-8'
    }
  },

  // Quality Standards
  qualityStandards: {
    deliveryTargets: {
      insideDhaka: {
        regular: '95%', // within promised time
        express: '98%'
      },
      outsideDhaka: {
        regular: '92%',
        express: '95%'
      }
    },
    
    damageRate: {
      target: '<0.5%',
      compensation: 'full_value',
      claimProcess: '7_days'
    },
    
    customerService: {
      responseTime: '2_hours',
      resolutionTime: '24_hours',
      supportChannels: ['phone', 'email', 'live_chat']
    }
  },

  // Bangladesh Specific Features
  bangladeshSpecific: {
    language: {
      supported: ['bengali', 'english'],
      defaultLanguage: 'bengali',
      customerService: 'bengali'
    },
    
    localCompliance: {
      tradeAuthorization: true,
      customsClearance: false,
      taxCompliance: true,
      laborRegulations: true
    },
    
    culturalAdaptation: {
      fridayOperations: true,
      festivalAwareness: true,
      prayerTimeFlexibility: true,
      localHolidays: true
    },
    
    paymentIntegration: {
      mobileBanking: ['bkash', 'nagad', 'rocket'],
      bankTransfer: true,
      cashPayment: true,
      creditTerms: '15_days'
    }
  },

  // Performance Monitoring
  monitoring: {
    kpi: {
      onTimeDelivery: true,
      customerSatisfaction: true,
      pickupCompliance: true,
      codCollection: true,
      returnRate: true
    },
    
    reporting: {
      dailyPerformance: true,
      weeklyReports: true,
      monthlyAnalytics: true,
      customReports: false
    },
    
    alerts: {
      deliveryDelays: true,
      serviceDisruptions: true,
      qualityIssues: true,
      systemDowntime: true
    }
  },

  // Customer Experience
  customerExperience: {
    communication: {
      smsUpdates: true,
      emailUpdates: false,
      appNotifications: true,
      callNotifications: true
    },
    
    flexibility: {
      rescheduleDelivery: true,
      changeAddress: true,
      holdDelivery: true,
      specialInstructions: true
    },
    
    support: {
      customerHotline: '+880 9610-200200',
      emailSupport: 'support@ecourier.com.bd',
      liveChat: false,
      socialMediaSupport: true
    }
  },

  // Security & Insurance
  security: {
    parcelSecurity: {
      sealedPackaging: true,
      tamperProof: true,
      secureTransit: true,
      restrictedAccess: true
    },
    
    insurance: {
      coverage: 'up_to_5000',
      claimProcess: 'documented',
      settlementTime: '7_business_days',
      premiumInsurance: true
    },
    
    dataProtection: {
      customerDataEncryption: true,
      gdprCompliant: false,
      localDataProtection: true,
      secureApi: true
    }
  },

  // Environmental Initiatives
  environmental: {
    greenDelivery: {
      ecoFriendlyPackaging: true,
      carbonNeutralOptions: false,
      recyclingProgram: true,
      sustainablePractices: true
    },
    
    efficiency: {
      routeOptimization: true,
      consolidatedDelivery: true,
      returnTrips: true,
      fuelEfficiency: true
    }
  }
};