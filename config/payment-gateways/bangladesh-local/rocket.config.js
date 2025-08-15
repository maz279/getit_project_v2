// Rocket Payment Gateway Configuration
// Mobile Financial Service (MFS) - Dutch-Bangla Bank's digital payment solution

module.exports = {
  // Gateway Information
  gateway: {
    name: 'Rocket',
    code: 'ROCKET',
    type: 'mobile_banking',
    country: 'BD',
    currency: 'BDT',
    enabled: true,
    priority: 3,
    description: 'Rocket Mobile Financial Service - Secure and fast digital payment solution by Dutch-Bangla Bank'
  },

  // API Configuration
  api: {
    sandbox: {
      baseUrl: 'https://sandbox.rocket.com.bd/api/v2',
      initPaymentUrl: '/payment/init',
      executePaymentUrl: '/payment/execute',
      verifyPaymentUrl: '/payment/verify',
      refundUrl: '/payment/refund',
      statusUrl: '/payment/status',
      balanceUrl: '/account/balance',
      transactionHistoryUrl: '/transaction/history'
    },
    production: {
      baseUrl: 'https://api.rocket.com.bd/v2',
      initPaymentUrl: '/payment/init',
      executePaymentUrl: '/payment/execute',
      verifyPaymentUrl: '/payment/verify',
      refundUrl: '/payment/refund',
      statusUrl: '/payment/status',
      balanceUrl: '/account/balance',
      transactionHistoryUrl: '/transaction/history'
    }
  },

  // Authentication Configuration
  authentication: {
    method: 'HMAC_SHA256',
    tokenType: 'Bearer',
    keyLength: 256,
    tokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 86400, // 24 hours
    scope: 'payment_init payment_execute payment_verify payment_refund balance_inquiry'
  },

  // Transaction Configuration
  transaction: {
    minAmount: 5.00,
    maxAmount: 50000.00,
    currency: 'BDT',
    timeout: 600, // 10 minutes
    transactionId: {
      prefix: 'GETIT_RKT',
      format: 'GETIT_RKT_{YYYYMMDD}_{HHMMSS}_{XXXXX}',
      length: 32
    },
    supportedChannels: ['web', 'mobile', 'api', 'ussd']
  },

  // Callback Configuration
  callbacks: {
    success: {
      url: process.env.ROCKET_SUCCESS_URL || 'https://getit.com.bd/api/v1/payments/rocket/success',
      method: 'POST',
      timeout: 30000
    },
    fail: {
      url: process.env.ROCKET_FAIL_URL || 'https://getit.com.bd/api/v1/payments/rocket/fail',
      method: 'POST',
      timeout: 30000
    },
    cancel: {
      url: process.env.ROCKET_CANCEL_URL || 'https://getit.com.bd/api/v1/payments/rocket/cancel',
      method: 'POST',
      timeout: 30000
    },
    webhook: {
      url: process.env.ROCKET_WEBHOOK_URL || 'https://getit.com.bd/api/v1/payments/rocket/webhook',
      method: 'POST',
      signatureVerification: true,
      timeout: 45000
    }
  },

  // Error Handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 2500, // 2.5 seconds
    timeoutDuration: 60000, // 60 seconds
    logLevel: 'warn',
    circuitBreakerEnabled: true,
    fallbackEnabled: false
  },

  // Security Configuration
  security: {
    encryption: 'AES-256-GCM',
    hashAlgorithm: 'SHA256',
    signatureRequired: true,
    timestampValidation: true,
    nonceValidation: true,
    ipWhitelist: [],
    sslRequired: true,
    certificatePinning: true,
    requestEncryption: true,
    responseDecryption: true
  },

  // Business Rules
  businessRules: {
    allowedPaymentMethods: ['rocket_wallet', 'rocket_bank_account', 'rocket_agent'],
    supportedAccountTypes: ['personal', 'merchant', 'agent', 'corporate'],
    feeTierStructure: {
      tier1: { min: 5, max: 1000, fee: 0.018 }, // 1.8%
      tier2: { min: 1001, max: 10000, fee: 0.015 }, // 1.5%
      tier3: { min: 10001, max: 50000, fee: 0.012 } // 1.2%
    },
    settlementPeriod: 'T+0', // Same day settlement
    refundPolicy: {
      allowed: true,
      maxDays: 180,
      partialRefund: true,
      refundFee: 5.00, // Fixed fee
      instantRefund: false,
      refundProcessingTime: '2-3 business days'
    },
    dailyTransactionLimit: 50000.00,
    monthlyTransactionLimit: 500000.00,
    transactionFrequencyLimit: 100 // per day
  },

  // Status Mapping
  statusMapping: {
    'COMPLETED': 'completed',
    'PENDING': 'pending',
    'FAILED': 'failed',
    'CANCELLED': 'cancelled',
    'EXPIRED': 'expired',
    'PROCESSING': 'processing',
    'INITIATED': 'initiated',
    'APPROVED': 'approved',
    'DECLINED': 'declined',
    'REFUNDED': 'refunded',
    'PARTIAL_REFUNDED': 'partial_refunded'
  },

  // Error Code Mapping
  errorCodes: {
    'R001': 'Invalid merchant credentials',
    'R002': 'Insufficient balance in wallet',
    'R003': 'Daily transaction limit exceeded',
    'R004': 'Monthly transaction limit exceeded',
    'R005': 'Invalid transaction amount',
    'R006': 'Service temporarily unavailable',
    'R007': 'Invalid request signature',
    'R008': 'Request timestamp expired',
    'R009': 'Duplicate transaction reference',
    'R010': 'Account temporarily blocked',
    'R011': 'Invalid account number',
    'R012': 'Transaction not found',
    'R013': 'Refund not permitted',
    'R014': 'Already refunded',
    'R015': 'PIN verification failed',
    'R016': 'OTP verification failed',
    'R017': 'Transaction frequency limit exceeded',
    'R018': 'Invalid mobile number format',
    'R019': 'Account KYC incomplete',
    'R020': 'Service under maintenance'
  },

  // Request/Response Format
  requestFormat: {
    contentType: 'application/json',
    charset: 'UTF-8',
    version: 'v2.0',
    headers: {
      'X-Rocket-Version': 'v2.0',
      'X-Rocket-Timestamp': 'UNIX_TIMESTAMP',
      'X-Rocket-Signature': 'HMAC_SHA256_SIGNATURE',
      'X-Rocket-Merchant-Id': 'MERCHANT_ID'
    }
  },

  // HMAC Configuration
  hmac: {
    algorithm: 'sha256',
    encoding: 'hex',
    fields: [
      'merchant_id',
      'transaction_id',
      'amount',
      'currency',
      'timestamp',
      'nonce'
    ],
    separator: '|',
    secretKey: process.env.ROCKET_SECRET_KEY
  },

  // Logging Configuration
  logging: {
    enabled: true,
    level: 'info',
    sensitiveFields: ['secret_key', 'signature', 'pin', 'otp'],
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logWebhooks: true,
    retentionDays: 365,
    structuredLogging: true
  },

  // Monitoring & Analytics
  monitoring: {
    metricsEnabled: true,
    performanceTracking: true,
    errorRateThreshold: 0.02, // 2%
    responseTimeThreshold: 10000, // 10 seconds
    healthCheckInterval: 180000, // 3 minutes
    alerting: {
      enabled: true,
      channels: ['email', 'sms', 'webhook'],
      escalationMatrix: true
    },
    dashboardEnabled: true
  },

  // Bangladesh Specific Configuration
  bangladeshConfig: {
    supportedMobileOperators: [
      'Grameenphone',
      'Robi',
      'Banglalink',
      'Teletalk',
      'Airtel'
    ],
    supportedBanks: [
      'Dutch_Bangla_Bank',
      'Sonali_Bank',
      'Janata_Bank',
      'Agrani_Bank',
      'Rupali_Bank',
      'BASIC_Bank',
      'Bangladesh_Krishi_Bank',
      'Rajshahi_Krishi_Unnayan_Bank'
    ],
    businessHours: {
      start: '05:00',
      end: '23:00',
      timezone: 'Asia/Dhaka',
      weekends: ['Friday'],
      publicHolidays: true
    },
    supportedLanguages: ['bn', 'en'],
    culturalConsiderations: {
      festivalSupport: true,
      holidaySchedule: true,
      localCustoms: true,
      religiousObservances: true
    },
    geographicCoverage: {
      nationalCoverage: true,
      ruralAccess: true,
      islandAreas: true,
      borderAreas: true,
      divisions: [
        'Dhaka',
        'Chittagong',
        'Rajshahi',
        'Khulna',
        'Sylhet',
        'Barisal',
        'Rangpur',
        'Mymensingh'
      ]
    },
    regulatoryCompliance: {
      bangladeshBankApproved: true,
      antiMoneyLaunderingCompliant: true,
      knowYourCustomerCompliant: true,
      digitalCommerceActCompliant: true
    }
  },

  // Integration Settings
  integration: {
    webhookVerification: true,
    realTimeNotifications: true,
    batchProcessing: true,
    apiVersioning: 'v2.0',
    sdkVersion: '2.1.0',
    concurrentRequestLimit: 15,
    requestQueueing: true,
    loadBalancing: true,
    failoverSupport: true
  },

  // Testing Configuration
  testing: {
    sandboxEnabled: true,
    testMerchantId: 'TEST_ROCKET_MERCHANT_001',
    testPhoneNumbers: [
      '01777777777',
      '01888888888',
      '01999999999'
    ],
    testAmounts: {
      success: [50, 100, 500, 1000, 5000],
      failure: [1, 2, 3, 4, 5],
      pending: [888, 1888, 2888],
      timeout: [999, 1999, 2999]
    },
    testScenarios: {
      normalFlow: true,
      errorFlow: true,
      timeoutFlow: true,
      refundFlow: true,
      webhookFlow: true
    }
  },

  // Performance Optimization
  performance: {
    connectionPooling: true,
    keepAlive: true,
    compression: true,
    caching: {
      enabled: true,
      ttl: 600, // 10 minutes
      keys: ['merchant_config', 'fee_structure', 'exchange_rates']
    },
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 120,
      burstLimit: 30,
      slidingWindow: true
    },
    optimization: {
      requestBatching: false,
      responseCaching: true,
      compressionEnabled: true,
      connectionReuse: true
    }
  },

  // Compliance & Audit
  compliance: {
    pciDssCompliant: true,
    iso27001Compliant: true,
    auditLogging: true,
    dataRetention: {
      transactionData: 7, // years
      logData: 2, // years
      auditTrail: 10 // years
    },
    dataPrivacy: {
      gdprCompliant: false, // Not applicable for Bangladesh
      personalDataProtection: true,
      dataMinimization: true,
      rightToErasure: false
    }
  }
};