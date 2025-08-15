/**
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * bKash Mobile Banking Gateway Configuration
 * Production-Ready Amazon.com/Shopee.sg-Level Implementation
 * Last Updated: July 6, 2025
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment-specific configuration
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.join(__dirname, '../../../environments', `${env}.env`) });

/**
 * bKash Payment Gateway Configuration
 * Bangladesh's leading mobile financial service
 */
module.exports = {
  // Basic Configuration
  gateway: {
    name: 'bKash',
    code: 'BKASH',
    country: 'BD',
    currency: 'BDT',
    logo: '/assets/images/icons/payment-methods/bkash.svg',
    color: '#E2136E',
    enabled: true,
    priority: 1 // Highest priority for Bangladesh
  },

  // API Configuration
  api: {
    // Environment-specific URLs
    baseUrl: process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    
    // Production URLs
    production: {
      baseUrl: 'https://tokenized.pay.bka.sh/v1.2.0-beta',
      tokenUrl: 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      paymentUrl: 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      executeUrl: 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
      queryUrl: 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status'
    },

    // Sandbox URLs
    sandbox: {
      baseUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
      tokenUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      paymentUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      executeUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
      queryUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status'
    },

    // Authentication
    credentials: {
      appKey: process.env.BKASH_APP_KEY,
      appSecret: process.env.BKASH_APP_SECRET,
      username: process.env.BKASH_USERNAME,
      password: process.env.BKASH_PASSWORD
    },

    // Request Configuration
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000 // 1 second
  },

  // Payment Configuration
  payment: {
    // Supported Payment Types
    intent: 'sale', // sale, authorization, capture
    mode: '0011', // Wallet and Savings Account
    
    // Amount Limits
    limits: {
      minimum: 1, // 1 BDT
      maximum: 25000, // 25,000 BDT per transaction
      daily: 150000, // 1,50,000 BDT per day
      monthly: 2000000 // 20,00,000 BDT per month
    },

    // Supported Currencies
    supportedCurrencies: ['BDT'],
    
    // Fee Configuration
    fees: {
      // Merchant fees (charged to vendor)
      merchant: {
        percentage: 1.85, // 1.85% merchant discount rate
        fixedFee: 0, // No fixed fee
        minimumFee: 0,
        maximumFee: null
      },
      
      // Customer fees (charged to customer)
      customer: {
        percentage: 0, // No customer fee
        fixedFee: 0,
        minimumFee: 0,
        maximumFee: null
      }
    }
  },

  // Security Configuration
  security: {
    // Encryption
    encryption: {
      algorithm: 'AES-256-CBC',
      keyRotation: 90, // days
      saltRounds: 12
    },

    // Request Signing
    signing: {
      algorithm: 'HMAC-SHA256',
      headerName: 'X-Signature',
      timestampTolerance: 300 // 5 minutes
    },

    // IP Whitelisting
    ipWhitelist: process.env.NODE_ENV === 'production' ? [
      '103.106.8.0/24',
      '103.106.9.0/24',
      '203.83.177.0/24'
    ] : null,

    // SSL Verification
    sslVerification: process.env.NODE_ENV === 'production',
    
    // Token Security
    token: {
      expiresIn: 3600, // 1 hour
      refreshThreshold: 300 // Refresh 5 minutes before expiry
    }
  },

  // Integration Configuration
  integration: {
    // Webhook Configuration
    webhooks: {
      enabled: true,
      url: `${process.env.APP_URL}/api/v1/payments/bkash/webhook`,
      events: ['payment.completed', 'payment.failed', 'payment.cancelled'],
      retryAttempts: 5,
      retryInterval: 300 // 5 minutes
    },

    // IPN (Instant Payment Notification)
    ipn: {
      enabled: true,
      url: `${process.env.APP_URL}/api/v1/payments/bkash/ipn`,
      timeout: 30,
      verifySource: true
    },

    // Callback URLs
    callbacks: {
      success: `${process.env.APP_URL}/payment/success`,
      failure: `${process.env.APP_URL}/payment/failure`,
      cancel: `${process.env.APP_URL}/payment/cancel`
    }
  },

  // User Experience Configuration
  userExperience: {
    // Language Support
    languages: ['bn', 'en'],
    defaultLanguage: 'bn',

    // UI Customization
    ui: {
      theme: 'light',
      brandColor: '#E2136E',
      fontFamily: 'SolaimanLipi, Arial, sans-serif',
      logoUrl: '/assets/images/icons/payment-methods/bkash.svg'
    },

    // Mobile Optimization
    mobile: {
      appDeepLink: 'bkash://payment',
      fallbackUrl: 'https://www.bkash.com/app-download',
      qrCodeEnabled: true
    },

    // Session Management
    session: {
      timeout: 900, // 15 minutes
      warningAt: 600, // 10 minutes
      extendable: true
    }
  },

  // Bangladesh Specific Features
  bangladesh: {
    // Local Features
    features: {
      instantTransfer: true,
      scheduledPayment: false,
      recurringPayment: false,
      bulkPayment: false,
      cashOut: false // Not available for merchants
    },

    // Regulatory Compliance
    compliance: {
      kycRequired: true,
      amlChecks: true,
      transactionReporting: true,
      bangladeshBankCompliance: true
    },

    // Local Holidays
    holidays: [
      'eid-ul-fitr',
      'eid-ul-adha',
      'durga-puja',
      'victory-day',
      'independence-day',
      'pohela-boishakh'
    ],

    // Business Hours
    businessHours: {
      timezone: 'Asia/Dhaka',
      weekdays: {
        start: '06:00',
        end: '23:59'
      },
      weekends: {
        start: '06:00',
        end: '23:59'
      }
    }
  },

  // Error Handling Configuration
  errorHandling: {
    // Error Codes Mapping
    errorCodes: {
      '2001': 'Insufficient balance',
      '2002': 'Account suspended',
      '2003': 'Invalid PIN',
      '2004': 'Transaction limit exceeded',
      '2005': 'Service temporarily unavailable',
      '2006': 'Invalid merchant',
      '2007': 'Duplicate transaction',
      '2008': 'Transaction timeout',
      '9999': 'Unknown error'
    },

    // Retry Configuration
    retry: {
      enabled: true,
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      baseDelay: 1000 // 1 second
    },

    // Fallback Configuration
    fallback: {
      enabled: true,
      alternatives: ['nagad', 'rocket', 'sslcommerz'],
      autoSwitch: false
    }
  },

  // Monitoring and Logging
  monitoring: {
    // Logging Configuration
    logging: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      includeRequestBody: process.env.NODE_ENV !== 'production',
      includeResponseBody: process.env.NODE_ENV !== 'production',
      sensitiveFields: ['appSecret', 'password', 'pin'],
      retention: 90 // days
    },

    // Metrics Collection
    metrics: {
      enabled: true,
      endpoint: '/metrics/bkash',
      includeBusinessMetrics: true,
      aggregationInterval: 300 // 5 minutes
    },

    // Health Checks
    healthCheck: {
      enabled: true,
      interval: 60, // seconds
      endpoint: '/health/bkash',
      timeout: 10 // seconds
    },

    // Alerting
    alerting: {
      enabled: true,
      thresholds: {
        errorRate: 0.05, // 5%
        responseTime: 5000, // 5 seconds
        availability: 0.99 // 99%
      },
      channels: ['email', 'sms', 'slack']
    }
  },

  // Testing Configuration
  testing: {
    // Test Mode Configuration
    testMode: process.env.NODE_ENV !== 'production',
    
    // Test Credentials
    testCredentials: {
      validNumbers: ['01700000000', '01800000000'],
      validPins: ['1234', '5678'],
      testAmount: 100
    },

    // Mock Responses
    mockResponses: {
      enabled: process.env.MOCK_EXTERNAL_SERVICES === 'true',
      delay: 2000, // 2 seconds to simulate real API
      successRate: 0.95 // 95% success rate
    }
  },

  // Performance Configuration
  performance: {
    // Connection Pooling
    connectionPool: {
      maxConnections: 10,
      timeout: 30000,
      keepAlive: true
    },

    // Caching
    caching: {
      enabled: true,
      tokenCache: true,
      configCache: true,
      ttl: 3600 // 1 hour
    },

    // Rate Limiting
    rateLimit: {
      enabled: true,
      requestsPerMinute: 60,
      burstLimit: 10
    }
  }
};

/**
 * Export environment-specific configuration
 */
module.exports.getConfig = function(environment = process.env.NODE_ENV) {
  const config = { ...module.exports };
  
  if (environment === 'production') {
    config.api.baseUrl = config.api.production.baseUrl;
    config.security.sslVerification = true;
    config.monitoring.logging.level = 'info';
  } else {
    config.api.baseUrl = config.api.sandbox.baseUrl;
    config.security.sslVerification = false;
    config.monitoring.logging.level = 'debug';
  }
  
  return config;
};