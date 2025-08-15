// Nagad Payment Gateway Configuration
// Mobile Financial Service (MFS) - Bangladesh's digital payment solution

module.exports = {
  // Gateway Information
  gateway: {
    name: 'Nagad',
    code: 'NAGAD',
    type: 'mobile_banking',
    country: 'BD',
    currency: 'BDT',
    enabled: true,
    priority: 2,
    description: 'Nagad Mobile Financial Service - Fast, secure, and convenient digital payment solution'
  },

  // API Configuration
  api: {
    sandbox: {
      baseUrl: 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs',
      initializeUrl: '/check-out/initialize/{MERCHANT_ID}',
      completeUrl: '/check-out/complete/{PAYMENT_REF_ID}',
      verifyUrl: '/verify/payment/{PAYMENT_REF_ID}',
      refundUrl: '/refund/{PAYMENT_REF_ID}',
      statusUrl: '/status/{PAYMENT_REF_ID}',
      balanceUrl: '/balance/inquiry'
    },
    production: {
      baseUrl: 'https://api.mynagad.com/api/dfs',
      initializeUrl: '/check-out/initialize/{MERCHANT_ID}',
      completeUrl: '/check-out/complete/{PAYMENT_REF_ID}',
      verifyUrl: '/verify/payment/{PAYMENT_REF_ID}',
      refundUrl: '/refund/{PAYMENT_REF_ID}',
      statusUrl: '/status/{PAYMENT_REF_ID}',
      balanceUrl: '/balance/inquiry'
    }
  },

  // Authentication Configuration
  authentication: {
    method: 'RSA_SIGNATURE',
    keyFormat: 'PEM',
    signatureAlgorithm: 'SHA256withRSA',
    encryptionAlgorithm: 'RSA/ECB/PKCS1Padding',
    tokenExpiry: 3600 // 1 hour
  },

  // Transaction Configuration
  transaction: {
    minAmount: 10.00,
    maxAmount: 20000.00,
    currency: 'BDT',
    timeout: 900, // 15 minutes
    merchantCallback: 'merchant_callback_url',
    paymentReferenceId: {
      prefix: 'GETIT_NGD',
      format: 'GETIT_NGD_{YYYYMMDD}_{HHMMSS}_{XXXXX}',
      length: 30
    }
  },

  // Callback Configuration
  callbacks: {
    success: {
      url: process.env.NAGAD_SUCCESS_URL || 'https://getit.com.bd/api/v1/payments/nagad/success',
      method: 'POST'
    },
    fail: {
      url: process.env.NAGAD_FAIL_URL || 'https://getit.com.bd/api/v1/payments/nagad/fail',
      method: 'POST'
    },
    cancel: {
      url: process.env.NAGAD_CANCEL_URL || 'https://getit.com.bd/api/v1/payments/nagad/cancel',
      method: 'POST'
    },
    webhook: {
      url: process.env.NAGAD_WEBHOOK_URL || 'https://getit.com.bd/api/v1/payments/nagad/webhook',
      method: 'POST',
      signatureVerification: true
    }
  },

  // Error Handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 3000, // 3 seconds
    timeoutDuration: 45000, // 45 seconds
    logLevel: 'info',
    circuitBreakerEnabled: true
  },

  // Security Configuration
  security: {
    encryption: 'RSA-2048',
    hashAlgorithm: 'SHA256',
    signatureRequired: true,
    timestampValidation: true,
    nonceValidation: true,
    ipWhitelist: [], // To be configured for production
    sslRequired: true,
    requestSigningEnabled: true,
    responseVerificationEnabled: true
  },

  // Business Rules
  businessRules: {
    allowedPaymentMethods: ['nagad_wallet', 'nagad_card'],
    supportedAccountTypes: ['personal', 'merchant', 'agent'],
    feeTierStructure: {
      tier1: { min: 10, max: 1000, fee: 0.015 }, // 1.5%
      tier2: { min: 1001, max: 5000, fee: 0.012 }, // 1.2%
      tier3: { min: 5001, max: 20000, fee: 0.010 } // 1.0%
    },
    settlementPeriod: 'T+1', // Next business day
    refundPolicy: {
      allowed: true,
      maxDays: 365,
      partialRefund: true,
      refundFee: 0.00,
      instantRefund: true
    },
    dailyTransactionLimit: 25000.00,
    monthlyTransactionLimit: 200000.00
  },

  // Status Mapping
  statusMapping: {
    'Success': 'completed',
    'Pending': 'pending',
    'Failed': 'failed',
    'Cancelled': 'cancelled',
    'Expired': 'expired',
    'Processing': 'processing',
    'Initiated': 'initiated',
    'Declined': 'declined'
  },

  // Error Code Mapping
  errorCodes: {
    'E001': 'Invalid merchant configuration',
    'E002': 'Insufficient balance',
    'E003': 'Transaction limit exceeded',
    'E004': 'Invalid amount',
    'E005': 'Service temporarily unavailable',
    'E006': 'Invalid signature',
    'E007': 'Expired request',
    'E008': 'Duplicate transaction',
    'E009': 'Account blocked',
    'E010': 'Invalid account number',
    'E011': 'Transaction not found',
    'E012': 'Refund not allowed',
    'E013': 'Already refunded',
    'E014': 'PIN verification failed',
    'E015': 'OTP verification failed',
    'E016': 'Daily limit exceeded',
    'E017': 'Monthly limit exceeded',
    'E018': 'Service maintenance'
  },

  // Request/Response Format
  requestFormat: {
    contentType: 'application/json',
    charset: 'UTF-8',
    headers: {
      'X-KM-Api-Version': 'v-0.2.0',
      'X-KM-IP-V4': 'CLIENT_IP',
      'X-KM-Client-Type': 'PC_WEB'
    }
  },

  // Signature Configuration
  signature: {
    fields: [
      'merchant_id',
      'datetime',
      'order_id',
      'challenge'
    ],
    separator: '|',
    algorithm: 'SHA256withRSA',
    encoding: 'base64'
  },

  // Logging Configuration
  logging: {
    enabled: true,
    level: 'info',
    sensitiveFields: ['signature', 'challenge', 'account_number'],
    logRequests: true,
    logResponses: true,
    logErrors: true,
    retentionDays: 90
  },

  // Monitoring & Analytics
  monitoring: {
    metricsEnabled: true,
    performanceTracking: true,
    errorRateThreshold: 0.03, // 3%
    responseTimeThreshold: 8000, // 8 seconds
    healthCheckInterval: 120000, // 2 minutes
    alerting: {
      enabled: true,
      channels: ['email', 'sms', 'slack']
    }
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
      'Bangladesh_Post_Office',
      'Sonali_Bank',
      'Janata_Bank',
      'Agrani_Bank',
      'Rupali_Bank',
      'BASIC_Bank',
      'BDBL',
      'Islami_Bank'
    ],
    businessHours: {
      start: '06:00',
      end: '22:00',
      timezone: 'Asia/Dhaka',
      weekends: ['Friday']
    },
    supportedLanguages: ['bn', 'en'],
    culturalConsiderations: {
      festivalSupport: true,
      holidayAwareness: true,
      localNumberFormat: true,
      bengaliDateSupport: true
    },
    geographicCoverage: {
      urban: true,
      rural: true,
      remoteAreas: true,
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
    }
  },

  // Integration Settings
  integration: {
    webhookVerification: true,
    realTimeNotifications: true,
    batchProcessing: true,
    apiVersioning: 'v1.0',
    sdkVersion: '1.2.0',
    concurrentRequestLimit: 10,
    requestQueueing: true
  },

  // Testing Configuration
  testing: {
    sandboxEnabled: true,
    testMerchantId: 'TEST_MERCHANT_001',
    testPhoneNumbers: [
      '01711111111',
      '01811111111',
      '01911111111'
    ],
    testAmounts: {
      success: [100, 500, 1000],
      failure: [1, 2, 3],
      pending: [999, 1999, 2999]
    }
  },

  // Performance Optimization
  performance: {
    connectionPooling: true,
    keepAlive: true,
    compression: true,
    caching: {
      enabled: true,
      ttl: 300, // 5 minutes
      keys: ['merchant_config', 'exchange_rates']
    },
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 100,
      burstLimit: 20
    }
  }
};