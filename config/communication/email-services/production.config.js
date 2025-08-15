// Email Services Production Configuration
// Comprehensive email infrastructure for GetIt platform

module.exports = {
  // Email Service Information
  emailService: {
    name: 'GetIt Email Infrastructure',
    version: '2.0',
    type: 'multi_provider_email',
    environment: 'production',
    enabled: true,
    description: 'Enterprise email delivery system with multiple providers and advanced features'
  },

  // Primary Email Providers
  providers: {
    // SendGrid Configuration
    sendgrid: {
      enabled: true,
      priority: 1,
      type: 'primary',
      
      // API Configuration
      api: {
        key: process.env.SENDGRID_API_KEY,
        baseUrl: 'https://api.sendgrid.com/v3',
        timeout: 30000,
        retries: 3
      },

      // Rate Limits
      rateLimit: {
        requests: 1000,
        window: 3600, // 1 hour
        burst: 100
      },

      // Features
      features: {
        templates: true,
        analytics: true,
        webhooks: true,
        suppressionManagement: true,
        ipPools: true,
        dynamicTemplates: true
      },

      // Dedicated IPs
      dedicatedIPs: {
        enabled: true,
        ips: [
          process.env.SENDGRID_DEDICATED_IP_1,
          process.env.SENDGRID_DEDICATED_IP_2
        ],
        warmupRequired: true
      }
    },

    // AWS SES Configuration
    awsSes: {
      enabled: true,
      priority: 2,
      type: 'backup',
      
      // AWS Configuration
      aws: {
        region: process.env.AWS_SES_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        configurationSet: 'getit-production'
      },

      // Rate Limits
      rateLimit: {
        requests: 14, // per second
        window: 1,
        daily: 200000
      },

      // Features
      features: {
        templates: true,
        analytics: true,
        bounceHandling: true,
        complaintHandling: true,
        reputationTracking: true
      }
    },

    // Mailgun Configuration (Tertiary)
    mailgun: {
      enabled: true,
      priority: 3,
      type: 'fallback',
      
      // API Configuration
      api: {
        key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN || 'mg.getit.com.bd',
        baseUrl: 'https://api.mailgun.net/v3',
        timeout: 30000
      },

      // Rate Limits
      rateLimit: {
        requests: 100,
        window: 3600, // 1 hour
        burst: 50
      },

      // Features
      features: {
        templates: true,
        analytics: true,
        tracking: true,
        validation: true
      }
    }
  },

  // Load Balancing & Failover
  loadBalancing: {
    strategy: 'priority_weighted',
    healthChecks: {
      enabled: true,
      interval: 300, // 5 minutes
      timeout: 10000, // 10 seconds
      retries: 3
    },
    
    failover: {
      enabled: true,
      autoFailover: true,
      failbackDelay: 1800, // 30 minutes
      maxFailures: 5
    },

    weights: {
      sendgrid: 70,
      awsSes: 20,
      mailgun: 10
    }
  },

  // Email Types & Categories
  emailTypes: {
    // Transactional Emails
    transactional: {
      enabled: true,
      provider: 'sendgrid',
      priority: 'high',
      
      categories: [
        'order_confirmation',
        'payment_receipt',
        'shipping_notification',
        'delivery_confirmation',
        'order_cancellation',
        'refund_notification',
        'account_verification',
        'password_reset',
        'login_notification',
        'security_alert'
      ],

      settings: {
        trackOpens: true,
        trackClicks: true,
        unsubscribeTracking: false,
        bypassListManagement: true,
        sandboxMode: false
      }
    },

    // Marketing Emails
    marketing: {
      enabled: true,
      provider: 'sendgrid',
      priority: 'medium',
      
      categories: [
        'promotional_campaigns',
        'product_recommendations',
        'seasonal_offers',
        'flash_sales',
        'newsletter',
        'abandoned_cart',
        'win_back',
        'loyalty_rewards'
      ],

      settings: {
        trackOpens: true,
        trackClicks: true,
        unsubscribeTracking: true,
        bypassListManagement: false,
        sandboxMode: false,
        suppressionGroupId: process.env.SENDGRID_MARKETING_SUPPRESSION_GROUP
      }
    },

    // Notification Emails
    notifications: {
      enabled: true,
      provider: 'sendgrid',
      priority: 'medium',
      
      categories: [
        'system_alerts',
        'maintenance_notices',
        'policy_updates',
        'feature_announcements',
        'vendor_notifications',
        'admin_alerts'
      ],

      settings: {
        trackOpens: true,
        trackClicks: false,
        unsubscribeTracking: true,
        bypassListManagement: false
      }
    }
  },

  // Email Templates
  templates: {
    // Dynamic Template IDs (SendGrid)
    sendgridTemplates: {
      orderConfirmation: process.env.SENDGRID_TEMPLATE_ORDER_CONFIRMATION,
      paymentReceipt: process.env.SENDGRID_TEMPLATE_PAYMENT_RECEIPT,
      shippingNotification: process.env.SENDGRID_TEMPLATE_SHIPPING,
      deliveryConfirmation: process.env.SENDGRID_TEMPLATE_DELIVERY,
      passwordReset: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET,
      accountVerification: process.env.SENDGRID_TEMPLATE_VERIFICATION,
      welcomeEmail: process.env.SENDGRID_TEMPLATE_WELCOME,
      promotionalCampaign: process.env.SENDGRID_TEMPLATE_PROMOTIONAL,
      abandonedCart: process.env.SENDGRID_TEMPLATE_ABANDONED_CART,
      newsletter: process.env.SENDGRID_TEMPLATE_NEWSLETTER
    },

    // Template Configuration
    configuration: {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'bn'],
      fallbackTemplate: 'default_notification',
      customization: {
        logo: 'https://cdn.getit.com.bd/logo.png',
        brandColors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#dc2626'
        },
        fonts: {
          primary: 'Inter, sans-serif',
          secondary: 'Kalpurush, serif' // Bengali font
        }
      }
    }
  },

  // Personalization & Segmentation
  personalization: {
    enabled: true,
    
    // User Segmentation
    segments: {
      customers: {
        newCustomers: 'customer_tenure < 30 days',
        loyalCustomers: 'customer_tenure > 365 days AND orders > 10',
        vipCustomers: 'total_spent > 50000',
        inactiveCustomers: 'last_order > 90 days'
      },
      
      vendors: {
        newVendors: 'vendor_tenure < 30 days',
        topVendors: 'monthly_sales > 100000',
        strugglingVendors: 'monthly_sales < 10000'
      },
      
      geography: {
        dhaka: 'city = "Dhaka"',
        chittagong: 'city = "Chittagong"',
        outsideMajorCities: 'city NOT IN ("Dhaka", "Chittagong", "Sylhet")'
      }
    },

    // Dynamic Content
    dynamicContent: {
      productRecommendations: {
        enabled: true,
        algorithm: 'collaborative_filtering',
        maxItems: 6
      },
      
      priceAlerts: {
        enabled: true,
        threshold: 10 // percentage discount
      },
      
      localization: {
        enabled: true,
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        language: 'auto_detect'
      }
    }
  },

  // Email Analytics & Tracking
  analytics: {
    enabled: true,
    
    // Tracking Configuration
    tracking: {
      opens: {
        enabled: true,
        pixelTracking: true,
        openTimeTracking: true
      },
      
      clicks: {
        enabled: true,
        linkTracking: true,
        clickHeatmap: true
      },
      
      unsubscribes: {
        enabled: true,
        reasonTracking: true,
        feedbackCollection: true
      },
      
      bounces: {
        enabled: true,
        softBounceRetry: 3,
        hardBounceAutoRemove: true
      },
      
      spam: {
        enabled: true,
        autoSuppression: true,
        reputationMonitoring: true
      }
    },

    // Reporting
    reporting: {
      realTimeMetrics: true,
      historicalData: 365, // days
      exportFormats: ['csv', 'json', 'pdf'],
      scheduledReports: {
        daily: ['delivery_rates', 'engagement_metrics'],
        weekly: ['campaign_performance', 'list_health'],
        monthly: ['revenue_attribution', 'roi_analysis']
      }
    }
  },

  // List Management & Suppression
  listManagement: {
    enabled: true,
    
    // Subscription Management
    subscriptions: {
      doubleOptIn: true,
      confirmationTimeout: 24, // hours
      welcomeEmailDelay: 1, // hour
      
      // Subscription Categories
      categories: [
        'order_updates',
        'promotional_offers',
        'product_recommendations',
        'newsletter',
        'vendor_communications',
        'system_notifications'
      ]
    },

    // Suppression Lists
    suppression: {
      globalSuppression: true,
      categorySuppression: true,
      temporarySuppression: true,
      
      // Auto-suppression Rules
      autoSuppression: {
        hardBounces: true,
        spamComplaints: true,
        multipleUnsubscribes: true,
        inactiveUsers: {
          enabled: true,
          threshold: 180 // days
        }
      }
    },

    // List Hygiene
    hygiene: {
      emailValidation: {
        enabled: true,
        realTimeValidation: true,
        bulkValidation: true,
        provider: 'sendgrid'
      },
      
      duplicateRemoval: true,
      inactiveRemoval: {
        enabled: true,
        threshold: 365 // days
      }
    }
  },

  // Deliverability Optimization
  deliverability: {
    // SPF, DKIM, DMARC Configuration
    authentication: {
      spf: {
        enabled: true,
        record: 'v=spf1 include:sendgrid.net include:amazonses.com include:mailgun.org ~all'
      },
      
      dkim: {
        enabled: true,
        domains: ['getit.com.bd', 'mail.getit.com.bd'],
        keySize: 2048
      },
      
      dmarc: {
        enabled: true,
        policy: 'quarantine',
        reportEmail: 'dmarc@getit.com.bd',
        percentage: 100
      }
    },

    // IP Warming
    ipWarming: {
      enabled: true,
      duration: 30, // days
      dailyVolumeIncrease: 20, // percentage
      startingVolume: 50 // emails per day
    },

    // Reputation Monitoring
    reputation: {
      monitoring: {
        enabled: true,
        providers: ['senderscore', 'talos', 'spamhaus'],
        alertThreshold: 80 // score below this triggers alert
      },
      
      feedback: {
        enabled: true,
        feedbackLoops: ['gmail', 'yahoo', 'outlook', 'aol'],
        autoProcessing: true
      }
    }
  },

  // A/B Testing
  abTesting: {
    enabled: true,
    
    // Test Configuration
    configuration: {
      maxTestDuration: 7, // days
      minSampleSize: 1000,
      confidenceLevel: 95, // percentage
      autoWinner: true,
      winnerDeploymentDelay: 24 // hours
    },

    // Test Types
    testTypes: [
      'subject_line',
      'sender_name',
      'content',
      'send_time',
      'call_to_action',
      'personalization'
    ],

    // Statistical Analysis
    analysis: {
      primaryMetric: 'click_rate',
      secondaryMetrics: ['open_rate', 'conversion_rate', 'unsubscribe_rate'],
      statisticalSignificance: 'bayesian'
    }
  },

  // Automation & Triggers
  automation: {
    enabled: true,
    
    // Triggered Campaigns
    triggers: {
      // Behavioral Triggers
      behavioral: {
        abandonedCart: {
          enabled: true,
          delay: [1, 24, 72], // hours
          discountProgression: [0, 5, 10] // percentage
        },
        
        browseAbandonment: {
          enabled: true,
          delay: 24, // hours
          categories: true
        },
        
        purchaseFollow: {
          enabled: true,
          delay: [3, 7, 30], // days after purchase
          crossSell: true,
          reviews: true
        }
      },

      // Lifecycle Triggers
      lifecycle: {
        welcome: {
          enabled: true,
          series: 3, // emails
          delays: [0, 3, 7] // days
        },
        
        onboarding: {
          enabled: true,
          duration: 14, // days
          milestones: ['first_browse', 'first_purchase', 'account_complete']
        },
        
        winback: {
          enabled: true,
          inactivityThreshold: 60, // days
          series: 2,
          incentives: true
        }
      }
    },

    // Drip Campaigns
    dripCampaigns: {
      enabled: true,
      maxCampaigns: 50,
      personalizedTiming: true,
      frequencyCapping: {
        daily: 2,
        weekly: 7,
        monthly: 20
      }
    }
  },

  // Integration Configuration
  integration: {
    // CRM Integration
    crm: {
      enabled: true,
      bidirectionalSync: true,
      syncFrequency: 'hourly',
      customFields: true
    },

    // E-commerce Integration
    ecommerce: {
      enabled: true,
      platforms: ['custom', 'woocommerce', 'shopify'],
      revenueTracking: true,
      productSync: true,
      orderSync: true
    },

    // Analytics Integration
    analytics: {
      googleAnalytics: {
        enabled: true,
        trackingId: process.env.GA_TRACKING_ID,
        utmTracking: true
      },
      
      facebook: {
        enabled: true,
        pixelId: process.env.FACEBOOK_PIXEL_ID,
        conversionTracking: true
      }
    },

    // Webhooks
    webhooks: {
      enabled: true,
      endpoints: {
        delivered: process.env.WEBHOOK_EMAIL_DELIVERED,
        opened: process.env.WEBHOOK_EMAIL_OPENED,
        clicked: process.env.WEBHOOK_EMAIL_CLICKED,
        bounced: process.env.WEBHOOK_EMAIL_BOUNCED,
        unsubscribed: process.env.WEBHOOK_EMAIL_UNSUBSCRIBED
      },
      
      security: {
        authentication: 'signature',
        timeout: 30000,
        retries: 3
      }
    }
  },

  // Bangladesh Specific Configuration
  bangladeshSpecific: {
    // Language Support
    language: {
      supported: ['english', 'bengali'],
      defaultLanguage: 'english',
      autoDetect: true,
      rtlSupport: false
    },

    // Cultural Considerations
    cultural: {
      festivalAwareness: true,
      prayerTimeAvoidance: true,
      fridayConsideration: true,
      ramadanScheduling: true
    },

    // Local Compliance
    compliance: {
      dataProtection: true,
      spamLaws: true,
      governmentRegulations: true,
      digitalSecurityAct: true
    },

    // Time Zone Optimization
    scheduling: {
      timezone: 'Asia/Dhaka',
      optimalSendTimes: {
        weekdays: ['09:00', '14:00', '20:00'],
        weekends: ['10:00', '16:00'],
        avoid: ['01:00-06:00', '12:00-13:00', '18:00-19:00'] // prayer times
      }
    }
  },

  // Security & Compliance
  security: {
    // Data Encryption
    encryption: {
      inTransit: 'TLS_1_3',
      atRest: 'AES_256',
      keyManagement: 'aws_kms'
    },

    // Access Control
    accessControl: {
      rbac: true,
      apiKeyManagement: true,
      ipWhitelist: true,
      mfa: true
    },

    // Compliance Standards
    compliance: {
      gdpr: true,
      canSpam: true,
      casl: true,
      bangladeshDataProtection: true
    },

    // Audit Logging
    auditLogging: {
      enabled: true,
      events: ['send', 'bounce', 'complaint', 'unsubscribe'],
      retention: 2555 // days (7 years)
    }
  },

  // Performance & Monitoring
  performance: {
    // Delivery Optimization
    delivery: {
      throttling: {
        enabled: true,
        maxPerSecond: 100,
        respectProviderLimits: true
      },
      
      retryLogic: {
        enabled: true,
        maxRetries: 3,
        backoffStrategy: 'exponential',
        retryDelay: [300, 900, 2700] // seconds
      }
    },

    // Monitoring
    monitoring: {
      healthChecks: {
        enabled: true,
        interval: 60, // seconds
        endpoints: ['smtp', 'api', 'webhooks']
      },
      
      alerts: {
        enabled: true,
        channels: ['email', 'slack', 'webhook'],
        thresholds: {
          deliveryRate: 95, // percentage
          bounceRate: 5,    // percentage
          openRate: 15,     // percentage
          clickRate: 2      // percentage
        }
      }
    }
  }
};