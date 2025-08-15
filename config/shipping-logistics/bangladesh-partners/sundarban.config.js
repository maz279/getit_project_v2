// Sundarban Courier Configuration
// Leading courier service with extensive coverage across Bangladesh

module.exports = {
  // Courier Information
  courier: {
    name: 'Sundarban Courier',
    code: 'SUNDARBAN',
    type: 'courier_service',
    country: 'BD',
    enabled: true,
    priority: 3,
    description: 'Sundarban Courier - Trusted courier service with wide coverage across Bangladesh including remote areas'
  },

  // API Configuration
  api: {
    sandbox: {
      baseUrl: 'https://api-sandbox.sundarbancourier.com/v1',
      authUrl: '/auth/login',
      merchantUrl: '/merchant/details',
      areasUrl: '/delivery/areas',
      ratesUrl: '/delivery/rates',
      orderCreateUrl: '/orders/create',
      orderUpdateUrl: '/orders/{order_id}/update',
      orderCancelUrl: '/orders/{order_id}/cancel',
      orderTrackUrl: '/orders/{order_id}/track',
      bulkCreateUrl: '/orders/bulk-create',
      pickupUrl: '/pickup/schedule',
      coverageUrl: '/coverage/check'
    },
    production: {
      baseUrl: 'https://api.sundarbancourier.com/v1',
      authUrl: '/auth/login',
      merchantUrl: '/merchant/details',
      areasUrl: '/delivery/areas',
      ratesUrl: '/delivery/rates',
      orderCreateUrl: '/orders/create',
      orderUpdateUrl: '/orders/{order_id}/update',
      orderCancelUrl: '/orders/{order_id}/cancel',
      orderTrackUrl: '/orders/{order_id}/track',
      bulkCreateUrl: '/orders/bulk-create',
      pickupUrl: '/pickup/schedule',
      coverageUrl: '/coverage/check'
    }
  },

  // Authentication Configuration
  authentication: {
    method: 'API_KEY',
    authType: 'header',
    headerName: 'X-API-Key',
    tokenExpiry: 0, // No expiry for API key
    refreshRequired: false,
    scope: 'orders tracking pricing coverage pickup'
  },

  // Service Configuration
  services: {
    delivery: {
      enabled: true,
      types: ['regular', 'express', 'overnight', 'special'],
      maxWeight: 30, // kg
      maxDimensions: {
        length: 120, // cm
        width: 120,  // cm
        height: 120  // cm
      },
      bulkDelivery: true
    },
    pickup: {
      enabled: true,
      sameDay: true,
      scheduled: true,
      multiplePickups: true,
      cutoffTime: '17:00',
      weekendService: false
    },
    tracking: {
      enabled: true,
      realTime: false,
      smsNotifications: true,
      emailNotifications: false,
      callbackNotifications: true
    },
    cashOnDelivery: {
      enabled: true,
      maxAmount: 30000, // BDT
      collectionFee: 1.5, // 1.5% of order value
      settlementPeriod: 'T+7', // 7 business days
      minimumCOD: 100 // BDT
    },
    returnService: {
      enabled: true,
      returnPolicy: true,
      exchangeService: false
    }
  },

  // Coverage Areas
  coverage: {
    dhaka: {
      enabled: true,
      areas: [
        'Adabar', 'Badda', 'Banani', 'Baridhara', 'Bashundhara',
        'Cantonment', 'Dhanmondi', 'Gulshan', 'Hatirjheel', 'Jatrabari',
        'Kalabagan', 'Kawran Bazar', 'Khilgaon', 'Lalmatia', 'Mirpur',
        'Mohammadpur', 'Motijheel', 'New Market', 'Old Dhaka', 'Paltan',
        'Ramna', 'Rampura', 'Segunbagicha', 'Tejgaon', 'Uttara', 'Wari'
      ],
      serviceTypes: ['regular', 'express', 'overnight', 'special'],
      deliveryTime: '24-48 hours',
      sameDayDelivery: false
    },
    chittagong: {
      enabled: true,
      areas: [
        'Agrabad', 'Anderkilla', 'Bakalia', 'Bayezid', 'Chawkbazar',
        'GEC', 'Halishahar', 'Khulshi', 'Nasirabad', 'Pahartali',
        'Panchlaish', 'Port Area', 'Sholoshohor', 'Tigerpass'
      ],
      serviceTypes: ['regular', 'express', 'overnight'],
      deliveryTime: '48-72 hours',
      sameDayDelivery: false
    },
    sylhet: {
      enabled: true,
      areas: [
        'Ambarkhana', 'Bagbari', 'Bandar Bazar', 'Chowhatta',
        'Dargah Gate', 'Jalalabad', 'Lamabazar', 'Mirer Dalan',
        'Subhanighat', 'Uposhohor', 'Zindabazar'
      ],
      serviceTypes: ['regular', 'express'],
      deliveryTime: '72-96 hours',
      sameDayDelivery: false
    },
    rajshahi: {
      enabled: true,
      areas: [
        'Boalia', 'Court Station', 'Kazla', 'Laxmipur', 'Motihar',
        'New Market', 'Railway Station', 'Rajpara', 'Saheb Bazar',
        'Talaimari', 'Uposhohor'
      ],
      serviceTypes: ['regular', 'express'],
      deliveryTime: '72-96 hours',
      sameDayDelivery: false
    },
    khulna: {
      enabled: true,
      areas: [
        'Daulatpur', 'Khalishpur', 'Khan Jahan Ali', 'Khulna Sadar',
        'Labanchara', 'Nirala', 'Rupsha', 'Shiromoni', 'Sonadanga',
        'Tutpara'
      ],
      serviceTypes: ['regular', 'express'],
      deliveryTime: '72-96 hours',
      sameDayDelivery: false
    },
    barisal: {
      enabled: true,
      areas: [
        'Alekanda', 'Band Road', 'Barisal Sadar', 'Charmonai',
        'Natullabad', 'Oxford Mission', 'Rupatali', 'Sagordi'
      ],
      serviceTypes: ['regular'],
      deliveryTime: '96-120 hours',
      sameDayDelivery: false
    },
    rangpur: {
      enabled: true,
      areas: [
        'Cantonment', 'Central Road', 'Dhap', 'Lalbagh', 'Modern',
        'Munshipara', 'Rangpur Sadar', 'Station Road', 'Tajhat'
      ],
      serviceTypes: ['regular'],
      deliveryTime: '96-120 hours',
      sameDayDelivery: false
    },
    mymensingh: {
      enabled: true,
      areas: [
        'Akua', 'Charpara', 'Choto Bazar', 'Kachari', 'Kewatkhali',
        'Mymensingh Sadar', 'Ranirbazar', 'Shambhuganj'
      ],
      serviceTypes: ['regular'],
      deliveryTime: '96-120 hours',
      sameDayDelivery: false
    },
    districtCoverage: {
      enabled: true,
      totalDistricts: 64,
      coveredDistricts: 58,
      upazilaCoverage: 450,
      remoteCoverage: true
    }
  },

  // Pricing Configuration
  pricing: {
    regular: {
      insideDhaka: {
        baseCharge: 70,
        perKg: 15,
        codCharge: 15
      },
      outsideDhaka: {
        baseCharge: 120,
        perKg: 20,
        codCharge: 20
      },
      district: {
        baseCharge: 100,
        perKg: 18,
        codCharge: 18
      },
      upazila: {
        baseCharge: 130,
        perKg: 25,
        codCharge: 25
      }
    },
    express: {
      insideDhaka: {
        baseCharge: 90,
        perKg: 20,
        codCharge: 15
      },
      majorCities: {
        baseCharge: 150,
        perKg: 30,
        codCharge: 20
      },
      otherAreas: {
        baseCharge: 180,
        perKg: 35,
        codCharge: 25
      }
    },
    overnight: {
      dhakaToDhaka: {
        baseCharge: 120,
        perKg: 25,
        codCharge: 15
      },
      dhakaToMajorCities: {
        baseCharge: 200,
        perKg: 40,
        codCharge: 20
      }
    },
    special: {
      enabled: true,
      surcharge: 50,
      specialHandling: true,
      timeDefiniteDelivery: true
    },
    bulk: {
      enabled: true,
      minimumOrders: 30,
      discountStructure: [
        { min: 30, max: 50, discount: 5 },
        { min: 51, max: 100, discount: 8 },
        { min: 101, max: 200, discount: 12 },
        { min: 201, discount: 15 }
      ]
    }
  },

  // Order Configuration
  order: {
    consignmentNumber: {
      prefix: 'GETIT_SBC',
      format: 'GETIT_SBC_{YYYYMMDD}_{HHMMSS}_{XXXXX}',
      length: 35
    },
    itemTypes: [
      'general',
      'documents',
      'electronics',
      'clothing',
      'books',
      'medicine',
      'food_items',
      'fragile',
      'valuable',
      'others'
    ],
    specialHandling: {
      enabled: true,
      options: [
        'fragile_handling',
        'urgent_delivery',
        'morning_delivery',
        'evening_delivery',
        'office_hours_only',
        'signature_required'
      ]
    },
    packaging: {
      required: false,
      standardBox: false,
      customPackaging: false,
      packagingCharges: false
    }
  },

  // Callback Configuration
  callbacks: {
    webhook: {
      url: process.env.SUNDARBAN_WEBHOOK_URL || 'https://getit.com.bd/api/v1/shipping/sundarban/webhook',
      method: 'POST',
      events: [
        'order_received',
        'order_processed',
        'pickup_completed',
        'in_transit',
        'reached_destination',
        'out_for_delivery',
        'delivered',
        'delivery_attempted',
        'returned',
        'cancelled'
      ],
      signatureVerification: false,
      retryAttempts: 3,
      retryInterval: 3600 // 1 hour
    }
  },

  // Status Mapping
  statusMapping: {
    'Order Received': 'order_received',
    'Order Processed': 'order_processed',
    'Pickup Completed': 'picked_up',
    'In Transit': 'in_transit',
    'Reached Destination': 'reached_destination',
    'Out for Delivery': 'out_for_delivery',
    'Delivered': 'delivered',
    'Delivery Attempted': 'delivery_attempted',
    'Customer Unavailable': 'customer_unavailable',
    'Returned to Hub': 'returned_to_hub',
    'Returned to Merchant': 'returned',
    'Cancelled': 'cancelled',
    'On Hold': 'on_hold'
  },

  // Error Handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
    timeoutDuration: 60000, // 60 seconds
    logLevel: 'warn',
    circuitBreakerEnabled: false
  },

  // Business Rules
  businessRules: {
    operatingHours: {
      pickup: {
        weekday: { start: '09:00', end: '17:00' },
        saturday: { start: '09:00', end: '15:00' },
        friday: { enabled: false },
        timezone: 'Asia/Dhaka'
      },
      delivery: {
        weekday: { start: '09:00', end: '18:00' },
        saturday: { start: '09:00', end: '16:00' },
        friday: { start: '14:00', end: '18:00' },
        timezone: 'Asia/Dhaka'
      }
    },
    restrictions: {
      prohibitedItems: [
        'illegal_substances',
        'weapons',
        'explosives',
        'flammable_liquids',
        'live_animals',
        'perishable_food',
        'valuable_items_over_50k',
        'antiques',
        'artwork'
      ],
      weightLimits: {
        single: 30, // kg
        bulk: 500  // kg per batch
      },
      sizeLimits: {
        length: 120, // cm
        width: 120,  // cm
        height: 120, // cm
        girth: 300   // cm
      }
    },
    deliveryAttempts: {
      maximum: 2,
      attemptInterval: 24, // hours
      finalNotification: true,
      returnAfterFailure: true
    },
    cancellation: {
      allowed: true,
      cutoffTime: 2, // hours before pickup
      cancellationFee: 20, // BDT
      reschedulingAllowed: true,
      maxReschedules: 2
    }
  },

  // Tracking Configuration
  tracking: {
    realTimeUpdates: false,
    manualUpdates: true,
    locationTracking: false,
    estimatedDelivery: true,
    notificationChannels: ['sms', 'call'],
    trackingUrl: 'https://sundarbancourier.com/track?cn={consignment_number}',
    apiTracking: {
      enabled: true,
      updateFrequency: 3600, // 1 hour
      batchTracking: false
    }
  },

  // Integration Settings
  integration: {
    bulkOperations: true,
    webhookVerification: false,
    realTimeRateCalculation: false,
    addressValidation: false,
    pickupScheduling: true,
    returnManagement: true
  },

  // Bangladesh Specific Configuration
  bangladeshConfig: {
    divisions: [
      {
        name: 'Dhaka',
        enabled: true,
        serviceLevel: 'full',
        coverage: 100
      },
      {
        name: 'Chittagong',
        enabled: true,
        serviceLevel: 'full',
        coverage: 95
      },
      {
        name: 'Sylhet',
        enabled: true,
        serviceLevel: 'standard',
        coverage: 90
      },
      {
        name: 'Rajshahi',
        enabled: true,
        serviceLevel: 'standard',
        coverage: 85
      },
      {
        name: 'Khulna',
        enabled: true,
        serviceLevel: 'standard',
        coverage: 80
      },
      {
        name: 'Barisal',
        enabled: true,
        serviceLevel: 'basic',
        coverage: 75
      },
      {
        name: 'Rangpur',
        enabled: true,
        serviceLevel: 'basic',
        coverage: 70
      },
      {
        name: 'Mymensingh',
        enabled: true,
        serviceLevel: 'basic',
        coverage: 65
      }
    ],
    remoteAreaCoverage: {
      enabled: true,
      charCoverage: true, // River island areas
      hillTractCoverage: true, // Chittagong Hill Tracts
      haorCoverage: true, // Haor areas in Sylhet/Sunamganj
      coastalCoverage: true // Coastal areas
    },
    culturalConsiderations: {
      fridayService: false,
      ramadanAdjustments: true,
      festivalSchedule: true,
      localHolidays: true
    },
    languageSupport: {
      bengali: true,
      english: true,
      arabicNumerals: true
    }
  },

  // Performance Configuration
  performance: {
    deliveryTimeTargets: {
      regular: {
        insideDhaka: 24, // hours
        majorCities: 72, // hours
        districtHQ: 96, // hours
        upazila: 120, // hours
        remote: 168 // hours
      },
      express: {
        insideDhaka: 12, // hours
        majorCities: 48, // hours
        otherAreas: 72 // hours
      },
      overnight: {
        insideDhaka: 24, // hours
        majorCities: 48 // hours
      }
    },
    successRateTargets: {
      delivery: 94, // percentage
      pickup: 97, // percentage
      onTime: 88, // percentage
      firstAttempt: 80 // percentage
    }
  },

  // Monitoring & Analytics
  monitoring: {
    metricsEnabled: true,
    performanceTracking: true,
    deliveryAnalytics: true,
    routeOptimization: false,
    customerFeedback: false,
    realTimeAlerts: false,
    dashboardIntegration: true
  },

  // Testing Configuration
  testing: {
    sandboxEnabled: true,
    testOrders: {
      enabled: true,
      autoProcess: true,
      mockDelivery: true
    },
    testLocations: {
      dhaka: 'Road 32, Dhanmondi R/A, Dhaka 1209',
      chittagong: 'Agrabad Commercial Area, Chittagong 4100',
      sylhet: 'Subhanighat, Sylhet 3100',
      rajshahi: 'Boalia, Rajshahi 6000'
    }
  },

  // Additional Features
  additionalFeatures: {
    insurance: {
      enabled: false,
      maxCoverage: 0,
      premiumRate: 0
    },
    proof_of_delivery: {
      enabled: false,
      photo: false,
      signature: false
    },
    white_label: {
      enabled: false,
      custom_branding: false
    },
    analytics_dashboard: {
      enabled: false,
      real_time_reports: false
    }
  }
};