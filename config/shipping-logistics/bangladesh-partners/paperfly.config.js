// Paperfly Courier Configuration
// Professional courier and logistics service provider in Bangladesh

module.exports = {
  // Courier Information
  courier: {
    name: 'Paperfly',
    code: 'PAPERFLY',
    type: 'courier_service',
    country: 'BD',
    enabled: true,
    priority: 2,
    description: 'Paperfly - Professional courier service with nationwide coverage and express delivery solutions'
  },

  // API Configuration
  api: {
    sandbox: {
      baseUrl: 'https://sandbox.paperfly.com.bd/api/v1',
      authUrl: '/auth/login',
      refreshUrl: '/auth/refresh',
      merchantUrl: '/merchant/profile',
      zonesUrl: '/zones',
      areasUrl: '/areas',
      pricingUrl: '/pricing/calculate',
      orderCreateUrl: '/orders/create',
      orderDetailsUrl: '/orders/{order_id}',
      orderCancelUrl: '/orders/{order_id}/cancel',
      orderTrackUrl: '/orders/{order_id}/track',
      bulkOrderUrl: '/orders/bulk',
      pickupRequestUrl: '/pickup/request',
      coverageUrl: '/coverage/check'
    },
    production: {
      baseUrl: 'https://api.paperfly.com.bd/v1',
      authUrl: '/auth/login',
      refreshUrl: '/auth/refresh',
      merchantUrl: '/merchant/profile',
      zonesUrl: '/zones',
      areasUrl: '/areas',
      pricingUrl: '/pricing/calculate',
      orderCreateUrl: '/orders/create',
      orderDetailsUrl: '/orders/{order_id}',
      orderCancelUrl: '/orders/{order_id}/cancel',
      orderTrackUrl: '/orders/{order_id}/track',
      bulkOrderUrl: '/orders/bulk',
      pickupRequestUrl: '/pickup/request',
      coverageUrl: '/coverage/check'
    }
  },

  // Authentication Configuration
  authentication: {
    method: 'JWT_TOKEN',
    tokenType: 'Bearer',
    loginRequired: true,
    tokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 86400, // 24 hours
    autoRefresh: true,
    scope: 'orders pricing zones tracking pickup coverage'
  },

  // Service Configuration
  services: {
    delivery: {
      enabled: true,
      types: ['express', 'standard', 'economy', 'premium'],
      maxWeight: 50, // kg
      maxDimensions: {
        length: 150, // cm
        width: 150,  // cm
        height: 150  // cm
      },
      volumetricWeight: true
    },
    pickup: {
      enabled: true,
      sameDay: true,
      scheduled: true,
      flexibleTiming: true,
      cutoffTime: '19:00',
      weekendService: true,
      holidayService: false
    },
    tracking: {
      enabled: true,
      realTime: true,
      detailedTracking: true,
      smsNotifications: true,
      emailNotifications: true,
      webhookNotifications: true,
      proofOfDelivery: true
    },
    cashOnDelivery: {
      enabled: true,
      maxAmount: 100000, // BDT
      collectionFee: 1.0, // 1% of order value
      settlementPeriod: 'T+2', // 2 business days
      minimumCOD: 50 // BDT
    },
    returnService: {
      enabled: true,
      returnPolicy: true,
      exchangeService: true,
      returnTracking: true
    }
  },

  // Coverage Areas
  coverage: {
    dhaka: {
      enabled: true,
      zones: [
        'Adabar', 'Badda', 'Banani', 'Bangshal', 'Biman Bandar',
        'Cantonment', 'Chackbazar', 'Dhanmondi', 'Gendaria', 'Gulshan',
        'Hazaribagh', 'Jatrabari', 'Kafrul', 'Kalabagan', 'Kamrangirchar',
        'Khilgaon', 'Khilkhet', 'Kotwali', 'Lalbagh', 'Mirpur',
        'Mohammadpur', 'Motijheel', 'New Market', 'Old Dhaka', 'Pallabi',
        'Paltan', 'Panthapath', 'Ramna', 'Rampura', 'Sabujbagh',
        'Shah Ali', 'Shahbagh', 'Sher-e-Bangla Nagar', 'Tejgaon',
        'Turag', 'Uttara', 'Wari'
      ],
      deliveryTypes: ['express', 'standard', 'economy', 'premium'],
      sameDayDelivery: true,
      nextDayDelivery: true,
      coverage: 100 // percentage
    },
    chittagong: {
      enabled: true,
      zones: [
        'Agrabad', 'Akbar Shah', 'Bakalia', 'Bandar', 'Bayezid',
        'Chandgaon', 'Chawkbazar', 'Double Mooring', 'EPZ',
        'Halishahar', 'Khulshi', 'Kotwali', 'Pahartali', 'Panchlaish',
        'Patiya', 'Port', 'Sadarghat', 'Wasa'
      ],
      deliveryTypes: ['standard', 'economy', 'premium'],
      sameDayDelivery: false,
      nextDayDelivery: true,
      coverage: 95
    },
    sylhet: {
      enabled: true,
      zones: [
        'Ambarkhana', 'Balaganj', 'Beanibazar', 'Companiganj',
        'Dakshin Surma', 'Fenchuganj', 'Golapganj', 'Gowainghat',
        'Jaintiapur', 'Kanaighat', 'Osmani Nagar', 'Sylhet Sadar',
        'Zakiganj', 'Zindabazar'
      ],
      deliveryTypes: ['standard', 'economy'],
      sameDayDelivery: false,
      nextDayDelivery: true,
      coverage: 90
    },
    rajshahi: {
      enabled: true,
      zones: [
        'Bagha', 'Bagmara', 'Boalia', 'Charghat', 'Durgapur',
        'Godagari', 'Mohanpur', 'Motihar', 'Paba', 'Puthia',
        'Rajshahi Sadar', 'Shah Makhdum', 'Tanore'
      ],
      deliveryTypes: ['standard', 'economy'],
      sameDayDelivery: false,
      nextDayDelivery: true,
      coverage: 85
    },
    khulna: {
      enabled: true,
      zones: [
        'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra',
        'Khalishpur', 'Khan Jahan Ali', 'Paikgachha', 'Phultala',
        'Rupsha', 'Sonadanga', 'Terokhada'
      ],
      deliveryTypes: ['standard', 'economy'],
      sameDayDelivery: false,
      nextDayDelivery: true,
      coverage: 80
    },
    barisal: {
      enabled: true,
      zones: [
        'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara',
        'Barisal Sadar', 'Gaurnadi', 'Hizla', 'Kotwali',
        'Mehendiganj', 'Muladi', 'Wazirpur'
      ],
      deliveryTypes: ['standard', 'economy'],
      sameDayDelivery: false,
      nextDayDelivery: false,
      coverage: 70
    },
    rangpur: {
      enabled: true,
      zones: [
        'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur',
        'Pirgacha', 'Pirganj', 'Rangpur Sadar', 'Taraganj'
      ],
      deliveryTypes: ['standard', 'economy'],
      sameDayDelivery: false,
      nextDayDelivery: false,
      coverage: 65
    },
    mymensingh: {
      enabled: true,
      zones: [
        'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon',
        'Gauripur', 'Haluaghat', 'Ishwarganj', 'Mymensingh Sadar',
        'Muktagachha', 'Nandail', 'Phulpur', 'Trishal'
      ],
      deliveryTypes: ['standard', 'economy'],
      sameDayDelivery: false,
      nextDayDelivery: false,
      coverage: 60
    }
  },

  // Pricing Configuration
  pricing: {
    express: {
      insideDhaka: {
        baseCharge: 80,
        perKg: 20,
        codCharge: 15,
        fuelSurcharge: 5
      },
      outsideDhaka: {
        baseCharge: 150,
        perKg: 30,
        codCharge: 20,
        fuelSurcharge: 10
      }
    },
    standard: {
      insideDhaka: {
        baseCharge: 60,
        perKg: 15,
        codCharge: 12,
        fuelSurcharge: 3
      },
      outsideDhaka: {
        baseCharge: 120,
        perKg: 25,
        codCharge: 15,
        fuelSurcharge: 8
      },
      subArea: {
        baseCharge: 100,
        perKg: 20,
        codCharge: 15,
        fuelSurcharge: 5
      }
    },
    economy: {
      insideDhaka: {
        baseCharge: 45,
        perKg: 12,
        codCharge: 10,
        fuelSurcharge: 2
      },
      outsideDhaka: {
        baseCharge: 90,
        perKg: 18,
        codCharge: 12,
        fuelSurcharge: 5
      }
    },
    premium: {
      insideDhaka: {
        baseCharge: 120,
        perKg: 30,
        codCharge: 20,
        fuelSurcharge: 8,
        priorityHandling: 15
      },
      outsideDhaka: {
        baseCharge: 200,
        perKg: 40,
        codCharge: 25,
        fuelSurcharge: 15,
        priorityHandling: 20
      }
    },
    bulk: {
      enabled: true,
      minimumOrders: 50,
      discountTiers: [
        { min: 50, max: 100, discount: 5 },
        { min: 101, max: 200, discount: 10 },
        { min: 201, max: 500, discount: 15 },
        { min: 501, discount: 20 }
      ]
    },
    volumetricWeight: {
      enabled: true,
      formula: '(L × W × H) / 5000',
      unit: 'cubic_cm_to_kg'
    }
  },

  // Order Configuration
  order: {
    orderId: {
      prefix: 'GETIT_PFL',
      format: 'GETIT_PFL_{YYYYMMDD}_{HHMMSS}_{XXXXX}',
      length: 35
    },
    itemCategories: [
      'electronics',
      'clothing',
      'books',
      'cosmetics',
      'food_items',
      'medicine',
      'documents',
      'fragile',
      'liquid',
      'hazardous',
      'others'
    ],
    specialInstructions: {
      enabled: true,
      maxLength: 300,
      predefinedOptions: [
        'Handle with care - Fragile',
        'Keep upright',
        'Do not bend',
        'Call before delivery',
        'Ring doorbell',
        'Leave at reception',
        'Signature required',
        'Photo proof required'
      ]
    },
    packaging: {
      standardBox: true,
      customPackaging: true,
      packagingCharges: true,
      insurance: true,
      insuranceRate: 0.5 // 0.5% of declared value
    }
  },

  // Callback Configuration
  callbacks: {
    webhook: {
      url: process.env.PAPERFLY_WEBHOOK_URL || 'https://getit.com.bd/api/v1/shipping/paperfly/webhook',
      method: 'POST',
      events: [
        'order_created',
        'order_confirmed',
        'pickup_scheduled',
        'pickup_completed',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'delivery_failed',
        'returned',
        'cancelled',
        'cod_collected',
        'payment_settled'
      ],
      signatureVerification: true,
      retryAttempts: 5,
      retryDelay: 300000 // 5 minutes
    }
  },

  // Status Mapping
  statusMapping: {
    'Order Created': 'order_created',
    'Order Confirmed': 'order_confirmed',
    'Pickup Scheduled': 'pickup_scheduled',
    'Pickup Completed': 'picked_up',
    'In Transit': 'in_transit',
    'Arrived at Hub': 'at_hub',
    'Out for Delivery': 'out_for_delivery',
    'Delivered': 'delivered',
    'Delivery Failed': 'delivery_failed',
    'Customer Not Available': 'customer_unavailable',
    'Address Issue': 'address_issue',
    'Returned to Hub': 'returned_to_hub',
    'Returned to Merchant': 'returned',
    'Cancelled': 'cancelled',
    'Lost': 'lost',
    'Damaged': 'damaged'
  },

  // Error Handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 3000, // 3 seconds
    timeoutDuration: 45000, // 45 seconds
    logLevel: 'info',
    circuitBreakerEnabled: true,
    fallbackEnabled: true
  },

  // Business Rules
  businessRules: {
    operatingHours: {
      pickup: {
        weekday: { start: '09:00', end: '18:00' },
        saturday: { start: '09:00', end: '16:00' },
        friday: { enabled: false },
        timezone: 'Asia/Dhaka'
      },
      delivery: {
        weekday: { start: '09:00', end: '20:00' },
        saturday: { start: '09:00', end: '18:00' },
        friday: { start: '14:00', end: '20:00' },
        timezone: 'Asia/Dhaka'
      },
      customerService: {
        weekday: { start: '09:00', end: '22:00' },
        weekend: { start: '10:00', end: '18:00' },
        timezone: 'Asia/Dhaka'
      }
    },
    restrictions: {
      prohibitedItems: [
        'illegal_drugs',
        'weapons',
        'explosive_materials',
        'radioactive_materials',
        'live_animals',
        'perishable_food_without_cooling',
        'currency_notes',
        'precious_metals',
        'antique_items',
        'lottery_tickets'
      ],
      restrictedItems: [
        'alcohol',
        'tobacco_products',
        'medicines_without_prescription',
        'chemicals',
        'batteries',
        'perfumes',
        'aerosols'
      ],
      weightLimits: {
        single_package: 50, // kg
        bulk_shipment: 1000 // kg
      },
      sizeLimits: {
        max_length: 150, // cm
        max_width: 150,  // cm
        max_height: 150, // cm
        max_girth: 300   // cm (length + 2×width + 2×height)
      }
    },
    deliveryAttempts: {
      maximum: 3,
      attemptInterval: 24, // hours
      finalAttemptNotification: true,
      returnAfterFailedAttempts: true
    },
    cancellation: {
      allowed: true,
      cutoffTime: 1, // hour before pickup
      cancellationFee: 0,
      partialCancellation: true,
      reschedulingAllowed: true,
      maxReschedules: 3
    }
  },

  // Tracking Configuration
  tracking: {
    realTimeUpdates: true,
    locationTracking: true,
    deliveryTimeEstimation: true,
    notificationChannels: ['sms', 'email', 'push', 'whatsapp'],
    trackingUrl: 'https://paperfly.com.bd/track?order_id={order_id}',
    apiTracking: {
      enabled: true,
      updateFrequency: 600, // 10 minutes
      batchTracking: true
    },
    proofOfDelivery: {
      photo: true,
      signature: true,
      timestamp: true,
      location: true,
      recipientDetails: true
    }
  },

  // Integration Settings
  integration: {
    bulkOperations: true,
    webhookVerification: true,
    realTimeRateCalculation: true,
    addressValidation: true,
    pickupScheduling: true,
    returnManagement: true,
    inventoryManagement: false,
    customReporting: true
  },

  // Bangladesh Specific Configuration
  bangladeshConfig: {
    divisions: [
      {
        name: 'Dhaka',
        enabled: true,
        serviceLevel: 'premium',
        sameDayDelivery: true,
        coverage: 100
      },
      {
        name: 'Chittagong',
        enabled: true,
        serviceLevel: 'standard',
        sameDayDelivery: false,
        coverage: 95
      },
      {
        name: 'Sylhet',
        enabled: true,
        serviceLevel: 'standard',
        sameDayDelivery: false,
        coverage: 90
      },
      {
        name: 'Rajshahi',
        enabled: true,
        serviceLevel: 'standard',
        sameDayDelivery: false,
        coverage: 85
      },
      {
        name: 'Khulna',
        enabled: true,
        serviceLevel: 'standard',
        sameDayDelivery: false,
        coverage: 80
      },
      {
        name: 'Barisal',
        enabled: true,
        serviceLevel: 'basic',
        sameDayDelivery: false,
        coverage: 70
      },
      {
        name: 'Rangpur',
        enabled: true,
        serviceLevel: 'basic',
        sameDayDelivery: false,
        coverage: 65
      },
      {
        name: 'Mymensingh',
        enabled: true,
        serviceLevel: 'basic',
        sameDayDelivery: false,
        coverage: 60
      }
    ],
    culturalConsiderations: {
      fridayService: true, // Limited hours
      ramadanSchedule: true,
      festivalAdjustments: true,
      prayerTimeAwareness: true,
      localHolidays: true
    },
    languageSupport: {
      bengali: true,
      english: true,
      localDialects: false
    },
    addressFormat: {
      structure: 'flat_house_road_area_thana_district_division',
      validation: true,
      standardization: true,
      geocoding: false
    }
  },

  // Performance Configuration
  performance: {
    deliveryTimeTargets: {
      express: {
        sameDayDhaka: 8, // hours
        nextDayMajorCities: 24, // hours
        otherAreas: 48 // hours
      },
      standard: {
        insideDhaka: 24, // hours
        majorCities: 48, // hours
        otherAreas: 72, // hours
        remoteAreas: 120 // hours
      },
      economy: {
        insideDhaka: 48, // hours
        majorCities: 72, // hours
        otherAreas: 96, // hours
        remoteAreas: 168 // hours
      }
    },
    successRateTargets: {
      delivery: 96, // percentage
      pickup: 99, // percentage
      onTime: 92, // percentage
      firstAttempt: 85 // percentage
    },
    customerSatisfactionTargets: {
      overall: 4.5, // out of 5
      delivery: 4.6,
      tracking: 4.4,
      customerService: 4.3
    }
  },

  // Monitoring & Analytics
  monitoring: {
    metricsEnabled: true,
    performanceTracking: true,
    deliveryAnalytics: true,
    routeOptimization: true,
    customerFeedback: true,
    realTimeAlerts: true,
    dashboardIntegration: true,
    reportingSchedule: 'daily'
  },

  // Testing Configuration
  testing: {
    sandboxEnabled: true,
    testOrders: {
      enabled: true,
      autoComplete: true,
      mockTracking: true,
      simulateFailures: true
    },
    testLocations: {
      dhaka: 'House 123, Road 27, Block A, Banani, Dhaka 1213',
      chittagong: 'Plot 456, CDA Avenue, Agrabad, Chittagong 4100',
      sylhet: 'Zindabazar Main Road, Sylhet 3100'
    },
    testScenarios: [
      'successful_delivery',
      'failed_delivery',
      'customer_unavailable',
      'address_issue',
      'item_damaged',
      'return_request'
    ]
  }
};