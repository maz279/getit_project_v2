// Push Notifications Production Configuration
// Multi-platform push notification infrastructure

module.exports = {
  // Push Notification Service Information
  pushService: {
    name: 'GetIt Push Notification System',
    version: '2.0',
    type: 'multi_platform_push',
    environment: 'production',
    enabled: true,
    description: 'Comprehensive push notification delivery across mobile and web platforms'
  },

  // Platform Providers
  providers: {
    // Firebase Cloud Messaging (Primary)
    fcm: {
      enabled: true,
      priority: 1,
      type: 'primary',
      
      // FCM Configuration
      config: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      },

      // API Configuration
      api: {
        baseUrl: 'https://fcm.googleapis.com/v1',
        timeout: 30000,
        retries: 3,
        batchSize: 500
      },

      // Platform Support
      platforms: {
        android: {
          enabled: true,
          googleServicesJson: process.env.GOOGLE_SERVICES_JSON,
          features: ['data_messages', 'notification_messages', 'topics', 'groups']
        },
        ios: {
          enabled: true,
          apnsKey: process.env.APNS_KEY,
          apnsKeyId: process.env.APNS_KEY_ID,
          teamId: process.env.APPLE_TEAM_ID,
          features: ['alerts', 'badges', 'sounds', 'silent_notifications']
        },
        web: {
          enabled: true,
          vapidKeys: {
            publicKey: process.env.VAPID_PUBLIC_KEY,
            privateKey: process.env.VAPID_PRIVATE_KEY
          },
          features: ['web_push', 'background_sync', 'offline_support']
        }
      },

      // Rate Limits
      rateLimit: {
        perSecond: 1000,
        perMinute: 60000,
        dailyLimit: 10000000
      }
    },

    // Apple Push Notification Service
    apns: {
      enabled: true,
      priority: 2,
      type: 'ios_dedicated',
      
      // APNS Configuration
      config: {
        keyId: process.env.APNS_KEY_ID,
        teamId: process.env.APPLE_TEAM_ID,
        key: process.env.APNS_PRIVATE_KEY,
        production: true
      },

      // Features
      features: {
        criticalAlerts: true,
        provisionalAuth: true,
        backgroundRefresh: true,
        richNotifications: true,
        groupedNotifications: true
      },

      // Rate Limits
      rateLimit: {
        perSecond: 300,
        perMinute: 18000,
        concurrent: 1000
      }
    },

    // OneSignal (Backup)
    oneSignal: {
      enabled: true,
      priority: 3,
      type: 'backup',
      
      // OneSignal Configuration
      config: {
        appId: process.env.ONESIGNAL_APP_ID,
        apiKey: process.env.ONESIGNAL_API_KEY,
        userAuthKey: process.env.ONESIGNAL_USER_AUTH_KEY
      },

      // Features
      features: {
        segmentation: true,
        abTesting: true,
        analytics: true,
        automation: true,
        webPush: true
      },

      // Rate Limits
      rateLimit: {
        perSecond: 100,
        perMinute: 6000,
        monthlyLimit: 10000000
      }
    }
  },

  // Notification Types & Categories
  notificationTypes: {
    // Transactional Notifications
    transactional: {
      enabled: true,
      provider: 'fcm',
      priority: 'high',
      
      categories: [
        'order_confirmation',
        'payment_receipt',
        'shipping_update',
        'delivery_confirmation',
        'order_cancellation',
        'refund_processed',
        'account_verification',
        'password_changed',
        'login_alert',
        'security_alert'
      ],

      settings: {
        sound: 'default',
        badge: true,
        vibration: true,
        lights: true,
        persistent: true,
        timeToLive: 86400, // 24 hours
        priority: 'high'
      }
    },

    // Marketing Notifications
    marketing: {
      enabled: true,
      provider: 'fcm',
      priority: 'normal',
      
      categories: [
        'promotional_offers',
        'flash_sales',
        'new_arrivals',
        'price_drops',
        'abandoned_cart',
        'loyalty_rewards',
        'seasonal_campaigns',
        'product_recommendations'
      ],

      settings: {
        sound: 'soft',
        badge: false,
        vibration: false,
        lights: false,
        persistent: false,
        timeToLive: 3600, // 1 hour
        priority: 'normal',
        respectQuietHours: true
      }
    },

    // System Notifications
    system: {
      enabled: true,
      provider: 'fcm',
      priority: 'medium',
      
      categories: [
        'app_updates',
        'maintenance_notice',
        'feature_announcements',
        'policy_updates',
        'system_alerts',
        'performance_tips'
      ],

      settings: {
        sound: 'subtle',
        badge: true,
        vibration: false,
        lights: false,
        persistent: false,
        timeToLive: 86400, // 24 hours
        priority: 'normal'
      }
    },

    // Engagement Notifications
    engagement: {
      enabled: true,
      provider: 'fcm',
      priority: 'low',
      
      categories: [
        'daily_deals',
        'weekend_specials',
        'app_usage_tips',
        'feature_discovery',
        'social_sharing',
        'review_requests',
        'loyalty_milestones'
      ],

      settings: {
        sound: 'none',
        badge: false,
        vibration: false,
        lights: false,
        persistent: false,
        timeToLive: 7200, // 2 hours
        priority: 'low',
        respectQuietHours: true,
        frequencyLimited: true
      }
    }
  },

  // Content Management
  contentManagement: {
    // Templates
    templates: {
      orderConfirmation: {
        title: 'Order Confirmed! 🎉',
        body: 'Your order #{orderNumber} has been confirmed. Amount: {amount} BDT',
        data: {
          orderId: '{orderId}',
          amount: '{amount}',
          action: 'view_order'
        },
        actions: [
          { id: 'view', title: 'View Order', action: 'open_order' },
          { id: 'track', title: 'Track', action: 'track_order' }
        ]
      },

      paymentReceipt: {
        title: 'Payment Received ✅',
        body: 'Payment of {amount} BDT received for order #{orderNumber}',
        data: {
          orderId: '{orderId}',
          amount: '{amount}',
          paymentMethod: '{paymentMethod}',
          action: 'view_receipt'
        }
      },

      shippingUpdate: {
        title: 'Package Update 📦',
        body: 'Your order #{orderNumber} is {status}',
        data: {
          orderId: '{orderId}',
          status: '{status}',
          trackingUrl: '{trackingUrl}',
          action: 'track_order'
        },
        actions: [
          { id: 'track', title: 'Track Package', action: 'open_tracking' }
        ]
      },

      deliveryConfirmation: {
        title: 'Delivered! 🚚',
        body: 'Your order #{orderNumber} has been delivered successfully',
        data: {
          orderId: '{orderId}',
          deliveryTime: '{deliveryTime}',
          action: 'rate_order'
        },
        actions: [
          { id: 'rate', title: 'Rate Order', action: 'open_rating' },
          { id: 'support', title: 'Support', action: 'open_support' }
        ]
      },

      promotionalOffer: {
        title: 'Special Offer! 🔥',
        body: 'Get {discount}% off on {category}. Limited time!',
        data: {
          discount: '{discount}',
          category: '{category}',
          promoCode: '{promoCode}',
          expiryDate: '{expiryDate}',
          action: 'view_offer'
        },
        actions: [
          { id: 'shop', title: 'Shop Now', action: 'open_category' },
          { id: 'save', title: 'Save Offer', action: 'save_offer' }
        ]
      },

      abandonedCart: {
        title: 'Items Waiting for You! 🛒',
        body: 'Complete your purchase and save {discount}%',
        data: {
          cartId: '{cartId}',
          itemCount: '{itemCount}',
          discount: '{discount}',
          action: 'complete_purchase'
        },
        actions: [
          { id: 'checkout', title: 'Complete Purchase', action: 'open_cart' },
          { id: 'save', title: 'Save for Later', action: 'save_cart' }
        ]
      }
    },

    // Localization
    localization: {
      enabled: true,
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'bn'],
      
      translations: {
        en: {
          orderConfirmed: 'Order Confirmed!',
          paymentReceived: 'Payment Received',
          packageUpdate: 'Package Update',
          delivered: 'Delivered!',
          specialOffer: 'Special Offer!',
          itemsWaiting: 'Items Waiting for You!'
        },
        bn: {
          orderConfirmed: 'অর্ডার নিশ্চিত!',
          paymentReceived: 'পেমেন্ট পাওয়া গেছে',
          packageUpdate: 'প্যাকেজ আপডেট',
          delivered: 'ডেলিভার হয়েছে!',
          specialOffer: 'বিশেষ অফার!',
          itemsWaiting: 'আইটেম অপেক্ষা করছে!'
        }
      }
    },

    // Rich Media
    richMedia: {
      enabled: true,
      
      images: {
        baseUrl: 'https://cdn.getit.com.bd/notifications/',
        formats: ['jpg', 'png', 'webp'],
        maxSize: '1MB',
        dimensions: '1024x512'
      },
      
      videos: {
        enabled: false, // for future implementation
        formats: ['mp4', 'webm'],
        maxSize: '5MB',
        duration: 30 // seconds
      },
      
      audio: {
        customSounds: true,
        formats: ['mp3', 'wav'],
        maxSize: '500KB',
        duration: 3 // seconds
      }
    }
  },

  // Targeting & Segmentation
  targeting: {
    enabled: true,
    
    // User Segmentation
    segments: {
      // Behavioral Segments
      behavioral: {
        newUsers: 'user_tenure < 7 days',
        activeUsers: 'last_activity < 7 days',
        loyalCustomers: 'order_count > 10 AND user_tenure > 365 days',
        vipCustomers: 'total_spent > 50000',
        inactiveUsers: 'last_activity > 30 days',
        cartAbandoners: 'cart_abandoned = true AND cart_age < 24 hours'
      },
      
      // Demographic Segments
      demographic: {
        ageGroup18_25: 'age >= 18 AND age <= 25',
        ageGroup26_35: 'age >= 26 AND age <= 35',
        ageGroup36_45: 'age >= 36 AND age <= 45',
        maleUsers: 'gender = "male"',
        femaleUsers: 'gender = "female"'
      },
      
      // Geographic Segments
      geographic: {
        dhaka: 'city = "Dhaka"',
        chittagong: 'city = "Chittagong"',
        sylhet: 'city = "Sylhet"',
        majorCities: 'city IN ("Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna")',
        ruralAreas: 'area_type = "rural"'
      },
      
      // Purchase Behavior
      purchaseBehavior: {
        highSpenders: 'avg_order_value > 2000',
        frequentBuyers: 'orders_per_month > 3',
        bargainHunters: 'discount_usage > 80',
        premiumShoppers: 'premium_products > 50'
      }
    },

    // Dynamic Targeting
    dynamicTargeting: {
      enabled: true,
      realTimeSegmentation: true,
      behaviorTracking: true,
      contextualTargeting: true,
      
      triggers: [
        'page_view',
        'product_view',
        'cart_addition',
        'purchase_completion',
        'app_open',
        'location_change',
        'time_based'
      ]
    }
  },

  // Personalization
  personalization: {
    enabled: true,
    
    // Content Personalization
    content: {
      dynamicContent: true,
      productRecommendations: true,
      personalizedOffers: true,
      behaviorBasedContent: true,
      
      algorithms: {
        collaborative: true,
        contentBased: true,
        hybrid: true,
        deepLearning: false // for future implementation
      }
    },

    // Timing Personalization
    timing: {
      enabled: true,
      optimalSendTime: true,
      timezoneAdjustment: true,
      frequencyOptimization: true,
      
      learningPeriod: 30, // days
      minDataPoints: 10,
      confidenceThreshold: 0.7
    },

    // Channel Preference
    channelPreference: {
      enabled: true,
      adaptiveRouting: true,
      userPreferenceLearning: true,
      engagementBasedSelection: true
    }
  },

  // Delivery Optimization
  delivery: {
    // Scheduling
    scheduling: {
      enabled: true,
      timezone: 'Asia/Dhaka',
      
      // Optimal Send Times
      optimalTimes: {
        transactional: 'immediate',
        marketing: {
          weekdays: ['09:00-11:00', '15:00-17:00', '20:00-22:00'],
          weekends: ['10:00-12:00', '16:00-18:00', '20:00-22:00'],
          avoid: ['01:00-07:00', '12:00-14:00', '18:00-19:30'] // prayer times
        },
        system: ['09:00-21:00'],
        engagement: ['19:00-21:00']
      },

      // Cultural Considerations
      cultural: {
        ramadanScheduling: true,
        festivalAwareness: true,
        prayerTimeAvoidance: true,
        fridayConsideration: false // Friday is working day
      }
    },

    // Frequency Control
    frequencyControl: {
      enabled: true,
      
      // Global Limits
      globalLimits: {
        perHour: 5,
        perDay: 20,
        perWeek: 50,
        perMonth: 200
      },

      // Category-specific Limits
      categoryLimits: {
        transactional: {
          perHour: 10,
          perDay: 50,
          respectGlobalLimits: false
        },
        marketing: {
          perDay: 3,
          perWeek: 10,
          respectGlobalLimits: true
        },
        system: {
          perDay: 5,
          perWeek: 15,
          respectGlobalLimits: true
        },
        engagement: {
          perDay: 2,
          perWeek: 5,
          respectGlobalLimits: true
        }
      },

      // Quiet Hours
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Dhaka',
        emergencyOverride: true
      }
    },

    // Retry Logic
    retryLogic: {
      enabled: true,
      maxRetries: 3,
      retryDelay: [300, 900, 2700], // seconds
      exponentialBackoff: true,
      
      retryableErrors: [
        'rate_limit_exceeded',
        'server_error',
        'timeout',
        'network_error'
      ],
      
      permanentFailures: [
        'invalid_token',
        'unregistered_device',
        'malformed_payload'
      ]
    }
  },

  // Analytics & Tracking
  analytics: {
    enabled: true,
    
    // Event Tracking
    eventTracking: {
      sent: true,
      delivered: true,
      opened: true,
      clicked: true,
      dismissed: true,
      converted: true,
      unsubscribed: true
    },

    // Metrics Collection
    metrics: [
      'delivery_rate',
      'open_rate',
      'click_rate',
      'conversion_rate',
      'unsubscribe_rate',
      'engagement_score',
      'revenue_attribution',
      'cost_per_notification'
    ],

    // Cohort Analysis
    cohortAnalysis: {
      enabled: true,
      retentionTracking: true,
      lifetimeValue: true,
      engagementEvolution: true
    },

    // A/B Testing
    abTesting: {
      enabled: true,
      
      testTypes: [
        'content',
        'timing',
        'frequency',
        'personalization',
        'targeting'
      ],
      
      splitTraffic: [10, 20, 30, 40, 50], // percentage options
      minSampleSize: 1000,
      confidenceLevel: 95,
      testDuration: 7 // days
    }
  },

  // Subscription Management
  subscriptionManagement: {
    enabled: true,
    
    // Subscription Types
    subscriptionTypes: [
      'all_notifications',
      'order_updates',
      'promotional_offers',
      'price_alerts',
      'new_arrivals',
      'system_updates'
    ],

    // Preference Center
    preferenceCenter: {
      enabled: true,
      granularControl: true,
      frequencySettings: true,
      channelPreferences: true,
      categoryPreferences: true
    },

    // Opt-out Management
    optOut: {
      enabled: true,
      gracefulDegradation: true,
      retentionAttempts: 2,
      winbackCampaigns: true,
      
      unsubscribeOptions: [
        'unsubscribe_all',
        'unsubscribe_category',
        'reduce_frequency',
        'pause_temporarily'
      ]
    }
  },

  // Security & Privacy
  security: {
    // Data Protection
    dataProtection: {
      encryption: {
        inTransit: 'TLS_1_3',
        atRest: 'AES_256',
        tokenSecurity: true
      },
      
      tokenManagement: {
        tokenRotation: true,
        expiration: 365, // days
        secureStorage: true,
        accessControl: true
      }
    },

    // Privacy Compliance
    privacy: {
      gdprCompliance: true,
      ccpaCompliance: true,
      bangladeshDataProtection: true,
      
      userRights: {
        dataExport: true,
        dataDelection: true,
        consentWithdrawal: true,
        accessRequest: true
      }
    },

    // Authentication
    authentication: {
      apiKeyAuth: true,
      jwtAuth: true,
      ipWhitelist: true,
      rateLimiting: true
    }
  },

  // Bangladesh-Specific Configuration
  bangladeshSpecific: {
    // Language & Culture
    language: {
      supported: ['english', 'bengali'],
      defaultLanguage: 'english',
      autoDetect: true,
      rtlSupport: false
    },

    // Cultural Adaptations
    cultural: {
      festivalNotifications: true,
      religiousConsiderations: true,
      localEventsIntegration: true,
      culturalColorSchemes: true
    },

    // Local Compliance
    compliance: {
      digitalSecurityAct: true,
      dataProtectionAct: true,
      telecomRegulations: true,
      consumerRights: true
    },

    // Regional Preferences
    regional: {
      timezone: 'Asia/Dhaka',
      currency: 'BDT',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'en-BD'
    }
  },

  // Integration Configuration
  integration: {
    // Webhooks
    webhooks: {
      enabled: true,
      events: [
        'notification_sent',
        'notification_delivered',
        'notification_opened',
        'notification_clicked',
        'notification_dismissed',
        'user_unsubscribed'
      ],
      
      endpoints: {
        analytics: process.env.WEBHOOK_PUSH_ANALYTICS,
        conversion: process.env.WEBHOOK_PUSH_CONVERSION,
        unsubscribe: process.env.WEBHOOK_PUSH_UNSUBSCRIBE
      },
      
      security: {
        authentication: 'signature',
        retries: 3,
        timeout: 30000
      }
    },

    // Third-party Integrations
    thirdParty: {
      analytics: {
        googleAnalytics: true,
        facebookAnalytics: true,
        customAnalytics: true
      },
      
      crm: {
        enabled: true,
        bidirectionalSync: true,
        eventTracking: true
      },
      
      ecommerce: {
        platforms: ['custom', 'woocommerce', 'shopify'],
        revenueTracking: true,
        inventorySync: true
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
      batchProcessing: true,
      connectionPooling: true,
      caching: {
        enabled: true,
        ttl: 300 // seconds
      },
      compression: true
    },

    // Scaling
    scaling: {
      autoScaling: true,
      loadBalancing: true,
      distributedProcessing: true,
      queueManagement: true
    }
  }
};