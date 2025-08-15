// RedX Courier Service Configuration
// Leading courier service in Bangladesh with nationwide coverage

module.exports = {
  // Service Information
  service: {
    name: 'RedX',
    type: 'courier_service',
    category: 'premium_logistics',
    country: 'Bangladesh',
    environment: 'production',
    enabled: true,
    description: 'Premium courier service with next-day delivery and comprehensive tracking',
    website: 'https://redx.com.bd',
    support: '+88 09666 733733'
  },

  // API Configuration
  api: {
    baseUrl: process.env.REDX_API_BASE_URL || 'https://openapi.redx.com.bd/v1.0.0-beta',
    authUrl: 'https://openapi.redx.com.bd/v1.0.0-beta/token',
    version: 'v1.0.0-beta',
    timeout: 30000,
    retries: 3,
    rateLimit: {
      requests: 1000,
      window: 3600 // 1 hour
    },

    // Authentication
    auth: {
      type: 'bearer_token',
      clientId: process.env.REDX_CLIENT_ID,
      clientSecret: process.env.REDX_CLIENT_SECRET,
      tokenEndpoint: '/token',
      grantType: 'client_credentials',
      scope: 'delivery_management tracking parcel_booking'
    },

    // API Endpoints
    endpoints: {
      // Authentication
      authenticate: '/token',
      refreshToken: '/token/refresh',

      // Area Management
      areas: '/areas',
      areaById: '/areas/{areaId}',
      upazila: '/upazila',
      district: '/district',

      // Parcel Management
      createParcel: '/parcel',
      trackParcel: '/parcel/track/{trackingId}',
      cancelParcel: '/parcel/cancel/{parcelId}',
      updateParcel: '/parcel/update/{parcelId}',
      bulkParcel: '/parcel/bulk',

      // Delivery Management
      deliveryStatus: '/delivery/status/{parcelId}',
      deliveryHistory: '/delivery/history/{parcelId}',
      rescheduleDelivery: '/delivery/reschedule/{parcelId}',

      // Pricing
      priceCalculator: '/pricing/calculate',
      serviceTypes: '/services',
      
      // Reports
      parcelReport: '/reports/parcel',
      financialReport: '/reports/financial',
      performanceReport: '/reports/performance'
    }
  },

  // Service Configuration
  services: {
    // Regular Delivery
    regular: {
      name: 'Regular Delivery',
      code: 'REGULAR',
      enabled: true,
      deliveryTime: '2-3 business days',
      maxWeight: 20, // kg
      maxDimensions: {
        length: 100, // cm
        width: 80,   // cm
        height: 50   // cm
      },
      codSupported: true,
      fragileSupported: true,
      insuranceAvailable: true
    },

    // Next Day Delivery
    nextDay: {
      name: 'Next Day Delivery',
      code: 'NEXT_DAY',
      enabled: true,
      deliveryTime: '24 hours',
      maxWeight: 15, // kg
      cutoffTime: '14:00', // 2 PM
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      codSupported: true,
      premiumService: true
    },

    // Same Day Delivery
    sameDay: {
      name: 'Same Day Delivery',
      code: 'SAME_DAY',
      enabled: true,
      deliveryTime: '4-6 hours',
      maxWeight: 10, // kg
      cutoffTime: '12:00', // 12 PM
      availableAreas: ['dhaka', 'chittagong', 'sylhet', 'cumilla'],
      codSupported: true,
      premiumService: true,
      surcharge: 50 // BDT
    },

    // Express Delivery
    express: {
      name: 'Express Delivery',
      code: 'EXPRESS',
      enabled: true,
      deliveryTime: '1-2 business days',
      maxWeight: 25, // kg
      codSupported: true,
      trackingIncluded: true,
      insuranceIncluded: true
    },

    // Business Solutions
    business: {
      name: 'Business Solutions',
      code: 'BUSINESS',
      enabled: true,
      bulkDelivery: true,
      dedicatedManager: true,
      customPricing: true,
      apiIntegration: true,
      monthlyBilling: true
    }
  },

  // Coverage Areas
  coverage: {
    // Dhaka Division
    dhaka: {
      division: 'Dhaka',
      districts: [
        'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj',
        'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj',
        'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'
      ],
      serviceLevels: ['regular', 'nextDay', 'sameDay', 'express'],
      codSupported: true,
      deliveryDays: 6 // Monday to Saturday
    },

    // Chittagong Division
    chittagong: {
      division: 'Chittagong',
      districts: [
        'Chittagong', 'Bandarban', 'Brahmanbaria', 'Chandpur',
        'Cumilla', 'Cox\'s Bazar', 'Feni', 'Khagrachhari',
        'Lakshmipur', 'Noakhali', 'Rangamati'
      ],
      serviceLevels: ['regular', 'nextDay', 'express'],
      codSupported: true,
      hillTractsService: true
    },

    // Rajshahi Division
    rajshahi: {
      division: 'Rajshahi',
      districts: [
        'Rajshahi', 'Bogura', 'Chapai Nawabganj', 'Joypurhat',
        'Naogaon', 'Natore', 'Pabna', 'Sirajganj'
      ],
      serviceLevels: ['regular', 'express'],
      codSupported: true
    },

    // Khulna Division
    khulna: {
      division: 'Khulna',
      districts: [
        'Khulna', 'Bagerhat', 'Chuadanga', 'Jessore',
        'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur',
        'Narail', 'Satkhira'
      ],
      serviceLevels: ['regular', 'express'],
      codSupported: true,
      coastalAreas: true
    },

    // Sylhet Division
    sylhet: {
      division: 'Sylhet',
      districts: ['Sylhet', 'Habiganj', 'Moulvibazar', 'Sunamganj'],
      serviceLevels: ['regular', 'nextDay', 'express'],
      codSupported: true,
      teaGardenService: true
    },

    // Barisal Division
    barisal: {
      division: 'Barisal',
      districts: [
        'Barisal', 'Barguna', 'Bhola', 'Jhalokathi',
        'Patuakhali', 'Pirojpur'
      ],
      serviceLevels: ['regular', 'express'],
      codSupported: true,
      riverineAreas: true
    },

    // Rangpur Division
    rangpur: {
      division: 'Rangpur',
      districts: [
        'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram',
        'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'
      ],
      serviceLevels: ['regular', 'express'],
      codSupported: true,
      northernRegion: true
    },

    // Mymensingh Division
    mymensingh: {
      division: 'Mymensingh',
      districts: ['Mymensingh', 'Jamalpur', 'Netrakona', 'Sherpur'],
      serviceLevels: ['regular', 'express'],
      codSupported: true
    }
  },

  // Pricing Configuration
  pricing: {
    // Base Pricing Structure
    basePricing: {
      withinCity: {
        base: 60,      // BDT for first kg
        additional: 20  // BDT per additional kg
      },
      outsideCity: {
        base: 80,      // BDT for first kg
        additional: 30  // BDT per additional kg
      },
      remoteAreas: {
        base: 120,     // BDT for first kg
        additional: 40  // BDT per additional kg
      }
    },

    // Service-specific Pricing
    servicePricing: {
      regular: {
        multiplier: 1.0,
        minCharge: 60
      },
      nextDay: {
        multiplier: 1.5,
        minCharge: 100,
        surcharge: 30
      },
      sameDay: {
        multiplier: 2.0,
        minCharge: 150,
        surcharge: 50
      },
      express: {
        multiplier: 1.3,
        minCharge: 80,
        surcharge: 20
      }
    },

    // Additional Charges
    additionalCharges: {
      cod: {
        enabled: true,
        type: 'percentage',
        rate: 1.0, // 1% of product value
        minimum: 10,
        maximum: 100
      },
      insurance: {
        enabled: true,
        type: 'percentage',
        rate: 0.5, // 0.5% of declared value
        minimum: 5,
        maximum: 1000
      },
      fragile: {
        enabled: true,
        type: 'fixed',
        amount: 20
      },
      oversized: {
        enabled: true,
        type: 'percentage',
        rate: 25 // 25% surcharge
      },
      fuel: {
        enabled: true,
        type: 'percentage',
        rate: 5 // 5% fuel surcharge
      }
    }
  },

  // Tracking Configuration
  tracking: {
    enabled: true,
    realTimeUpdates: true,
    smsNotifications: true,
    emailNotifications: true,
    webhookSupport: true,

    // Status Codes
    statusCodes: {
      'PICKUP_REQUESTED': 'Pickup Requested',
      'PICKED_UP': 'Picked Up',
      'IN_TRANSIT': 'In Transit',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'DELIVERY_ATTEMPTED': 'Delivery Attempted',
      'RETURNED': 'Returned to Sender',
      'CANCELLED': 'Cancelled',
      'ON_HOLD': 'On Hold',
      'RESCHEDULED': 'Delivery Rescheduled'
    },

    // Update Frequency
    updateFrequency: {
      pickup: 'immediate',
      transit: '2_hours',
      delivery: 'immediate',
      exception: 'immediate'
    }
  },

  // Cash on Delivery (COD)
  cod: {
    enabled: true,
    maxAmount: 100000, // BDT
    minAmount: 50,     // BDT
    feeStructure: {
      type: 'percentage',
      rate: 1.0,        // 1%
      minimum: 10,      // BDT
      maximum: 100      // BDT
    },
    settlementCycle: 'weekly', // weekly, bi-weekly, monthly
    settlementDay: 'tuesday',
    autoSettlement: true,
    verificationRequired: true
  },

  // Business Features
  business: {
    bulkBooking: {
      enabled: true,
      minParcels: 10,
      maxParcels: 1000,
      discountTiers: [
        { from: 10, to: 49, discount: 5 },   // 5% discount
        { from: 50, to: 99, discount: 10 },  // 10% discount
        { from: 100, to: 499, discount: 15 }, // 15% discount
        { from: 500, to: 999, discount: 20 }, // 20% discount
        { from: 1000, discount: 25 }          // 25% discount
      ]
    },

    merchantPortal: {
      enabled: true,
      url: 'https://merchant.redx.com.bd',
      features: [
        'bulk_booking',
        'tracking_dashboard',
        'financial_reports',
        'pickup_scheduling',
        'address_book',
        'api_integration'
      ]
    },

    creditFacility: {
      enabled: true,
      eligibilityCriteria: {
        minimumMonthlyVolume: 100,
        businessVerification: true,
        creditScore: 'good'
      },
      creditLimit: 50000, // BDT
      settlementTerms: '15_days'
    }
  },

  // Integration Settings
  integration: {
    webhooks: {
      enabled: true,
      supportedEvents: [
        'parcel.created',
        'parcel.picked_up',
        'parcel.in_transit',
        'parcel.out_for_delivery',
        'parcel.delivered',
        'parcel.returned',
        'parcel.cancelled',
        'cod.collected'
      ],
      retryPolicy: {
        maxRetries: 5,
        backoffStrategy: 'exponential',
        initialDelay: 1000, // ms
        maxDelay: 60000     // ms
      },
      authentication: {
        type: 'signature',
        algorithm: 'hmac-sha256',
        header: 'X-RedX-Signature'
      }
    },

    apiIntegration: {
      rateLimit: {
        requests: 1000,
        window: 3600, // 1 hour
        burst: 50
      },
      dataFormat: 'json',
      errorHandling: {
        retryableErrors: [500, 502, 503, 504],
        maxRetries: 3,
        backoffDelay: 1000
      }
    }
  },

  // Quality Assurance
  qualityAssurance: {
    deliveryTargets: {
      regular: {
        onTime: 95,      // 95% on-time delivery
        maxDelay: 1      // Maximum 1 day delay
      },
      nextDay: {
        onTime: 98,      // 98% on-time delivery
        maxDelay: 0.5    // Maximum 12 hours delay
      },
      sameDay: {
        onTime: 99,      // 99% on-time delivery
        maxDelay: 0.25   // Maximum 6 hours delay
      }
    },

    customerSatisfaction: {
      targetScore: 4.5,  // Out of 5
      feedbackCollection: true,
      complaintResolution: '24_hours'
    },

    damageProtection: {
      packageInsurance: true,
      liabilityCoverage: 10000, // BDT
      claimProcess: 'automated',
      claimSettlement: '7_days'
    }
  },

  // Bangladesh Specific Features
  bangladeshSpecific: {
    language: {
      supported: ['bengali', 'english'],
      defaultLanguage: 'bengali',
      smsLanguage: 'bengali'
    },

    localCompliance: {
      businessLicense: true,
      taxCompliance: true,
      laborLaw: true,
      environmentalStandards: true
    },

    culturalConsiderations: {
      fridayOperations: false,
      festivalSchedule: true,
      ramadanSchedule: true,
      prayerTimeConsideration: true
    },

    localPartnership: {
      banks: ['Dutch Bangla Bank', 'Brac Bank', 'Eastern Bank'],
      paymentMethods: ['bKash', 'Nagad', 'Rocket'],
      governmentTies: true
    }
  },

  // Performance Monitoring
  monitoring: {
    metrics: {
      deliverySuccess: true,
      averageDeliveryTime: true,
      customerSatisfaction: true,
      codCollection: true,
      returnRate: true,
      damageRate: true
    },

    alerts: {
      deliveryDelay: true,
      codCollectionIssue: true,
      systemDowntime: true,
      highReturnRate: true
    },

    reporting: {
      dailyReports: true,
      weeklyReports: true,
      monthlyReports: true,
      customReports: true
    }
  },

  // Security & Compliance
  security: {
    dataEncryption: true,
    apiSecurity: {
      authentication: 'oauth2',
      encryption: 'tls_1_3',
      rateLimit: true,
      ipWhitelist: true
    },
    complianceStandards: [
      'ISO_27001',
      'BANGLADESH_DATA_PROTECTION',
      'POSTAL_REGULATION'
    ]
  }
};