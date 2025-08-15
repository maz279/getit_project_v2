// SMS Providers Production Configuration
// Multi-provider SMS infrastructure for Bangladesh market

module.exports = {
  // SMS Service Information
  smsService: {
    name: 'GetIt SMS Infrastructure',
    version: '2.0',
    type: 'multi_provider_sms',
    environment: 'production',
    enabled: true,
    description: 'Enterprise SMS delivery system with Bangladesh and international providers'
  },

  // Primary SMS Providers
  providers: {
    // Twilio Configuration (International)
    twilio: {
      enabled: true,
      priority: 1,
      type: 'international',
      
      // API Configuration
      api: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        baseUrl: 'https://api.twilio.com/2010-04-01',
        timeout: 30000,
        retries: 3
      },

      // Phone Numbers
      phoneNumbers: {
        default: process.env.TWILIO_PHONE_NUMBER,
        branded: process.env.TWILIO_BRANDED_NUMBER,
        alphanumeric: 'GetIt'
      },

      // Features
      features: {
        unicode: true,
        longMessages: true,
        deliveryReports: true,
        analytics: true,
        shortCodes: true,
        twoWaySms: true
      },

      // Rate Limits
      rateLimit: {
        messagesPerSecond: 100,
        messagesPerMinute: 6000,
        dailyLimit: 500000
      },

      // Pricing
      pricing: {
        domestic: 0.0075, // USD per SMS
        international: 0.0075,
        longMessage: 0.0075 // per segment
      }
    },

    // SSL Wireless (Bangladesh)
    sslWireless: {
      enabled: true,
      priority: 2,
      type: 'local_primary',
      
      // API Configuration
      api: {
        username: process.env.SSL_WIRELESS_USERNAME,
        password: process.env.SSL_WIRELESS_PASSWORD,
        baseUrl: 'https://sms.sslwireless.com/pushapi/dynamic/server.php',
        timeout: 30000,
        retries: 3
      },

      // Features
      features: {
        banglaSupport: true,
        unicodeSupport: true,
        bulkSms: true,
        deliveryReports: true,
        scheduleMessages: true,
        campaignManagement: true
      },

      // Coverage
      coverage: {
        operators: ['grameenphone', 'robi', 'banglalink', 'teletalk', 'airtel'],
        nationwide: true,
        reliability: 98.5 // percentage
      },

      // Rate Limits
      rateLimit: {
        messagesPerSecond: 50,
        messagesPerMinute: 3000,
        dailyLimit: 100000
      },

      // Pricing (BDT)
      pricing: {
        perSms: 0.25, // BDT
        bulkDiscount: {
          '1000+': 0.23,
          '5000+': 0.21,
          '10000+': 0.19
        }
      }
    },

    // Alpha Net (Bangladesh)
    alphaNet: {
      enabled: true,
      priority: 3,
      type: 'local_backup',
      
      // API Configuration
      api: {
        username: process.env.ALPHA_NET_USERNAME,
        password: process.env.ALPHA_NET_PASSWORD,
        baseUrl: 'http://portal.metrotel.com.bd/smsapi',
        timeout: 30000,
        retries: 3
      },

      // Features
      features: {
        banglaSupport: true,
        bulkSms: true,
        deliveryReports: true,
        shortCodes: false,
        twoWaySms: false
      },

      // Coverage
      coverage: {
        operators: ['grameenphone', 'robi', 'banglalink', 'teletalk'],
        reliability: 96.0 // percentage
      },

      // Rate Limits
      rateLimit: {
        messagesPerSecond: 30,
        messagesPerMinute: 1800,
        dailyLimit: 50000
      },

      // Pricing (BDT)
      pricing: {
        perSms: 0.30,
        bulkDiscount: {
          '500+': 0.28,
          '2000+': 0.26,
          '5000+': 0.24
        }
      }
    },

    // BulkSMSBD (Bangladesh)
    bulkSmsBd: {
      enabled: true,
      priority: 4,
      type: 'local_fallback',
      
      // API Configuration
      api: {
        token: process.env.BULK_SMS_BD_TOKEN,
        baseUrl: 'http://66.45.237.70/api.php',
        timeout: 30000,
        retries: 2
      },

      // Features
      features: {
        banglaSupport: true,
        bulkSms: true,
        deliveryReports: false,
        scheduleMessages: true
      },

      // Coverage
      coverage: {
        operators: ['grameenphone', 'robi', 'banglalink'],
        reliability: 94.0 // percentage
      },

      // Rate Limits
      rateLimit: {
        messagesPerSecond: 20,
        messagesPerMinute: 1200,
        dailyLimit: 25000
      },

      // Pricing (BDT)
      pricing: {
        perSms: 0.35,
        bulkDiscount: {
          '1000+': 0.32,
          '3000+': 0.30
        }
      }
    }
  },

  // Load Balancing & Routing
  routing: {
    strategy: 'intelligent',
    
    // Routing Rules
    rules: [
      {
        condition: 'country == "BD"',
        provider: 'sslWireless',
        fallback: ['alphaNet', 'bulkSmsBd', 'twilio']
      },
      {
        condition: 'country != "BD"',
        provider: 'twilio',
        fallback: []
      },
      {
        condition: 'messageType == "otp"',
        provider: 'sslWireless',
        priority: 'high'
      },
      {
        condition: 'messageType == "marketing"',
        provider: 'alphaNet',
        priority: 'normal'
      },
      {
        condition: 'language == "bengali"',
        provider: 'sslWireless',
        fallback: ['alphaNet', 'bulkSmsBd']
      }
    ],

    // Failover Configuration
    failover: {
      enabled: true,
      autoFailover: true,
      maxRetries: 3,
      retryDelay: [30, 60, 120], // seconds
      circuitBreaker: {
        failureThreshold: 5,
        timeout: 300, // seconds
        halfOpenMaxCalls: 3
      }
    },

    // Load Distribution
    loadDistribution: {
      sslWireless: 60,
      alphaNet: 25,
      bulkSmsBd: 10,
      twilio: 5
    }
  },

  // Message Types & Templates
  messageTypes: {
    // OTP Messages
    otp: {
      enabled: true,
      provider: 'sslWireless',
      priority: 'high',
      expiry: 300, // seconds
      
      templates: {
        registration: 'Your GetIt registration OTP is: {otp}. Valid for 5 minutes.',
        login: 'Your GetIt login OTP is: {otp}. Do not share with anyone.',
        passwordReset: 'Your GetIt password reset OTP is: {otp}. Valid for 5 minutes.',
        transaction: 'Your GetIt transaction OTP is: {otp}. Amount: {amount} BDT.'
      },

      settings: {
        alphanumericSender: 'GetIt',
        deliveryReports: true,
        maxAttempts: 3,
        cooldownPeriod: 60 // seconds between attempts
      }
    },

    // Transactional Messages
    transactional: {
      enabled: true,
      provider: 'sslWireless',
      priority: 'high',
      
      templates: {
        orderConfirmation: 'Order #{orderNumber} confirmed! Amount: {amount} BDT. Track: {trackingUrl}',
        paymentConfirmation: 'Payment of {amount} BDT received for order #{orderNumber}. Thank you!',
        shippingUpdate: 'Your order #{orderNumber} is {status}. Track: {trackingUrl}',
        deliveryConfirmation: 'Order #{orderNumber} delivered successfully. Rate your experience: {ratingUrl}',
        refundConfirmation: 'Refund of {amount} BDT processed for order #{orderNumber}. Allow 3-5 business days.'
      },

      settings: {
        alphanumericSender: 'GetIt',
        deliveryReports: true,
        unicode: true,
        maxLength: 160
      }
    },

    // Marketing Messages
    marketing: {
      enabled: true,
      provider: 'alphaNet',
      priority: 'normal',
      
      templates: {
        promotional: 'Exclusive offer! Get {discount}% off on {category}. Use code: {promoCode}. Valid till {expiry}. Shop now: {link}',
        flashSale: 'Flash Sale Alert! Up to {discount}% off for next {duration} hours. Hurry: {link}',
        newArrivals: 'New arrivals in {category}! Check out trending products. Shop: {link}',
        abandonedCart: 'Items in your cart are waiting! Complete purchase & save {discount}%. Checkout: {link}',
        loyaltyReward: 'Congratulations! You earned {points} loyalty points. Your total: {totalPoints}. Redeem: {link}'
      },

      settings: {
        alphanumericSender: 'GetIt',
        deliveryReports: false,
        unicode: true,
        unsubscribeLink: true,
        maxLength: 160,
        respectOptOut: true
      }
    },

    // Notifications
    notifications: {
      enabled: true,
      provider: 'sslWireless',
      priority: 'medium',
      
      templates: {
        accountUpdate: 'Your GetIt account has been updated. If not you, contact support immediately.',
        securityAlert: 'Security alert: Login from new device {device} at {time}. If not you, secure your account.',
        maintenanceNotice: 'GetIt will be under maintenance on {date} from {startTime} to {endTime}. Sorry for inconvenience.',
        priceAlert: 'Price drop alert! {productName} now available for {newPrice} BDT (was {oldPrice}). Buy: {link}',
        stockAlert: '{productName} is back in stock! Limited quantity. Order now: {link}'
      },

      settings: {
        alphanumericSender: 'GetIt',
        deliveryReports: true,
        unicode: true
      }
    },

    // Admin Alerts
    adminAlerts: {
      enabled: true,
      provider: 'twilio',
      priority: 'urgent',
      
      templates: {
        systemDown: 'ALERT: {service} is down. Started: {time}. Immediate action required.',
        highErrorRate: 'WARNING: {service} error rate is {percentage}%. Investigation needed.',
        securityBreach: 'SECURITY BREACH: {details}. Immediate action required.',
        paymentFailure: 'Payment gateway {gateway} failing. Failure rate: {percentage}%.',
        inventoryLow: 'INVENTORY ALERT: {product} stock below {threshold}. Restock needed.'
      },

      settings: {
        deliveryReports: true,
        maxAttempts: 5,
        escalation: true
      }
    }
  },

  // Delivery Optimization
  delivery: {
    // Time-based Optimization
    scheduling: {
      enabled: true,
      timezone: 'Asia/Dhaka',
      
      // Optimal Send Times
      optimalTimes: {
        otp: 'immediate',
        transactional: 'immediate',
        marketing: {
          weekdays: ['09:00-11:00', '15:00-17:00', '20:00-22:00'],
          weekends: ['10:00-12:00', '16:00-18:00', '20:00-22:00'],
          avoid: ['01:00-07:00', '12:00-14:00', '18:00-19:30'] // avoid prayer times
        },
        notifications: ['09:00-21:00']
      },

      // Cultural Considerations
      cultural: {
        avoidFridays: false, // Friday is working day in Bangladesh
        ramadanAdjustment: true,
        festivalAwareness: true,
        prayerTimeAvoidance: true
      }
    },

    // Frequency Management
    frequencyControl: {
      enabled: true,
      
      // Rate Limits per User
      userLimits: {
        otp: {
          perHour: 3,
          perDay: 10,
          cooldown: 60 // seconds
        },
        transactional: {
          perHour: 20,
          perDay: 100
        },
        marketing: {
          perDay: 3,
          perWeek: 10,
          optOutRespect: true
        },
        notifications: {
          perDay: 5,
          perWeek: 20
        }
      },

      // Global Limits
      globalLimits: {
        perSecond: 100,
        perMinute: 6000,
        perHour: 50000,
        perDay: 500000
      }
    }
  },

  // Analytics & Tracking
  analytics: {
    enabled: true,
    
    // Delivery Tracking
    tracking: {
      deliveryReports: true,
      clickTracking: true,
      conversionTracking: true,
      errorTracking: true
    },

    // Metrics Collection
    metrics: [
      'delivery_rate',
      'failure_rate',
      'response_time',
      'cost_per_message',
      'conversion_rate',
      'opt_out_rate',
      'engagement_rate'
    ],

    // Reporting
    reporting: {
      realTime: true,
      historical: true,
      exportFormats: ['csv', 'json', 'pdf'],
      scheduledReports: {
        daily: ['delivery_summary', 'error_report'],
        weekly: ['performance_analysis', 'cost_analysis'],
        monthly: ['roi_analysis', 'trend_analysis']
      }
    }
  },

  // Compliance & Regulations
  compliance: {
    // Bangladesh Regulations
    bangladesh: {
      btrcdCompliance: true,
      spamRegulations: true,
      dataProtection: true,
      operatorGuidelines: true
    },

    // International Standards
    international: {
      gdprCompliance: true,
      ccpaCompliance: true,
      canSpamAct: true,
      tcpaCompliance: true
    },

    // Opt-out Management
    optOut: {
      enabled: true,
      keywords: ['STOP', 'UNSUBSCRIBE', 'বন্ধ', 'BONDHO'],
      autoProcess: true,
      confirmationMessage: 'You have been unsubscribed from GetIt SMS. Reply START to resubscribe.',
      globalSuppressionList: true
    },

    // Consent Management
    consent: {
      doubleOptIn: true,
      consentRecording: true,
      consentWithdrawal: true,
      auditTrail: true
    }
  },

  // Bangladesh-Specific Features
  bangladeshSpecific: {
    // Language Support
    language: {
      supported: ['english', 'bengali'],
      defaultLanguage: 'english',
      autoDetect: true,
      unicodeSupport: true,
      fontEncoding: 'utf-8'
    },

    // Mobile Operator Integration
    operators: {
      grameenphone: {
        enabled: true,
        marketShare: 47.1,
        reliability: 98.5,
        deliverySpeed: 'fast'
      },
      robi: {
        enabled: true,
        marketShare: 30.2,
        reliability: 97.8,
        deliverySpeed: 'fast'
      },
      banglalink: {
        enabled: true,
        marketShare: 20.1,
        reliability: 96.5,
        deliverySpeed: 'medium'
      },
      teletalk: {
        enabled: true,
        marketShare: 2.4,
        reliability: 95.0,
        deliverySpeed: 'medium'
      },
      airtel: {
        enabled: true,
        marketShare: 0.2,
        reliability: 94.0,
        deliverySpeed: 'slow'
      }
    },

    // Local Integrations
    integrations: {
      mobileBanking: {
        bkash: true,
        nagad: true,
        rocket: true
      },
      ecommerce: {
        localPlatforms: true,
        customIntegration: true
      }
    },

    // Cultural Adaptations
    cultural: {
      festivalGreetings: true,
      religiousConsiderations: true,
      localTerminology: true,
      regionalDialects: false
    }
  },

  // Security Configuration
  security: {
    // Message Encryption
    encryption: {
      inTransit: true,
      atRest: true,
      algorithm: 'AES-256'
    },

    // Access Control
    accessControl: {
      apiKeyAuthentication: true,
      ipWhitelisting: true,
      rateLimiting: true,
      roleBasedAccess: true
    },

    // Fraud Prevention
    fraudPrevention: {
      enabled: true,
      duplicateDetection: true,
      velocityChecking: true,
      blacklistManagement: true,
      anomalyDetection: true
    },

    // Audit Logging
    auditLogging: {
      enabled: true,
      events: ['send', 'delivery', 'failure', 'opt_out'],
      retention: 2555, // days (7 years)
      encryption: true
    }
  },

  // Integration Configuration
  integration: {
    // API Configuration
    api: {
      restApi: true,
      webhooks: true,
      bulkApi: true,
      realtimeApi: true
    },

    // Webhooks
    webhooks: {
      enabled: true,
      events: ['delivered', 'failed', 'clicked', 'opted_out'],
      endpoints: {
        delivery: process.env.WEBHOOK_SMS_DELIVERY,
        failure: process.env.WEBHOOK_SMS_FAILURE,
        optOut: process.env.WEBHOOK_SMS_OPTOUT
      },
      security: {
        authentication: 'signature',
        retries: 3,
        timeout: 30000
      }
    },

    // Third-party Integrations
    thirdParty: {
      crm: {
        enabled: true,
        platforms: ['salesforce', 'hubspot', 'custom']
      },
      analytics: {
        googleAnalytics: true,
        customAnalytics: true
      },
      ecommerce: {
        platforms: ['woocommerce', 'shopify', 'custom']
      }
    }
  },

  // Performance & Monitoring
  performance: {
    // Health Monitoring
    monitoring: {
      healthChecks: {
        enabled: true,
        interval: 60, // seconds
        timeout: 10000 // ms
      },
      
      alerts: {
        enabled: true,
        channels: ['email', 'sms', 'webhook'],
        thresholds: {
          deliveryRate: 95, // percentage
          responseTime: 5000, // ms
          errorRate: 5 // percentage
        }
      }
    },

    // Performance Optimization
    optimization: {
      connectionPooling: true,
      requestBatching: true,
      caching: {
        enabled: true,
        ttl: 300 // seconds
      },
      compression: true
    }
  },

  // Cost Management
  costManagement: {
    // Budget Controls
    budgets: {
      daily: 5000, // BDT
      monthly: 150000, // BDT
      alertThresholds: [50, 75, 90] // percentages
    },

    // Cost Optimization
    optimization: {
      providerCostAnalysis: true,
      routeOptimization: true,
      volumeDiscounts: true,
      costAlerts: true
    },

    // Billing
    billing: {
      detailedReporting: true,
      costAttribution: true,
      chargebackSupport: true,
      invoiceGeneration: true
    }
  }
};