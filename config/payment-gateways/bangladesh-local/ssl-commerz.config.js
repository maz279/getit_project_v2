// SSL Commerz Payment Gateway Configuration
// Leading payment gateway provider in Bangladesh

module.exports = {
  // Gateway Information
  gateway: {
    name: 'SSL Commerz',
    code: 'SSLCOMMERZ',
    type: 'payment_gateway',
    country: 'BD',
    currency: 'BDT',
    enabled: true,
    priority: 4,
    description: 'SSL Commerz - Bangladesh\'s largest online payment gateway provider with comprehensive payment solutions'
  },

  // API Configuration
  api: {
    sandbox: {
      baseUrl: 'https://sandbox.sslcommerz.com',
      sessionUrl: '/gwprocess/v4/api.php',
      validationUrl: '/validator/api/validationserverAPI.php',
      orderValidateUrl: '/validator/api/merchantTransIDvalidationAPI.php',
      refundUrl: '/validator/api/merchantTransIDvalidationAPI.php',
      transactionQueryUrl: '/validator/api/merchantTransIDvalidationAPI.php',
      bankTransactionUrl: '/validator/api/bankTransactionQuery.php'
    },
    production: {
      baseUrl: 'https://securepay.sslcommerz.com',
      sessionUrl: '/gwprocess/v4/api.php',
      validationUrl: '/validator/api/validationserverAPI.php',
      orderValidateUrl: '/validator/api/merchantTransIDvalidationAPI.php',
      refundUrl: '/validator/api/merchantTransIDvalidationAPI.php',
      transactionQueryUrl: '/validator/api/merchantTransIDvalidationAPI.php',
      bankTransactionUrl: '/validator/api/bankTransactionQuery.php'
    }
  },

  // Authentication Configuration
  authentication: {
    method: 'STORE_CREDENTIALS',
    requiresStoreId: true,
    requiresStorePassword: true,
    hashValidation: true,
    signatureValidation: true
  },

  // Transaction Configuration
  transaction: {
    minAmount: 1.00,
    maxAmount: 100000.00,
    currency: 'BDT',
    timeout: 1800, // 30 minutes
    transactionId: {
      prefix: 'GETIT_SSL',
      format: 'GETIT_SSL_{YYYYMMDD}_{HHMMSS}_{XXXXX}',
      length: 35
    },
    multiCurrency: false,
    shippingMethod: 'NO',
    productCategory: 'Digital Goods'
  },

  // Callback Configuration
  callbacks: {
    success: {
      url: process.env.SSLCOMMERZ_SUCCESS_URL || 'https://getit.com.bd/api/v1/payments/sslcommerz/success',
      method: 'POST'
    },
    fail: {
      url: process.env.SSLCOMMERZ_FAIL_URL || 'https://getit.com.bd/api/v1/payments/sslcommerz/fail',
      method: 'POST'
    },
    cancel: {
      url: process.env.SSLCOMMERZ_CANCEL_URL || 'https://getit.com.bd/api/v1/payments/sslcommerz/cancel',
      method: 'POST'
    },
    ipn: {
      url: process.env.SSLCOMMERZ_IPN_URL || 'https://getit.com.bd/api/v1/payments/sslcommerz/ipn',
      method: 'POST'
    }
  },

  // Error Handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    timeoutDuration: 30000,
    logLevel: 'info',
    circuitBreakerEnabled: true
  },

  // Security Configuration
  security: {
    hashValidation: true,
    ipnValidation: true,
    storeValidation: true,
    sslRequired: true,
    fraudDetection: true
  },

  // Business Rules
  businessRules: {
    allowedPaymentMethods: [
      'visa',
      'master',
      'amex',
      'dbbl_visa',
      'dbbl_master',
      'brac_visa',
      'brac_master',
      'city_visa',
      'city_master',
      'ebl_visa',
      'ebl_master',
      'bkash',
      'nagad',
      'rocket',
      'upay',
      'tap',
      'ibbl_visa',
      'ibbl_master',
      'mtbl_visa',
      'mtbl_master',
      'al_arafah_visa',
      'al_arafah_master',
      'shahjalal_visa',
      'shahjalal_master'
    ],
    feeTierStructure: {
      creditCard: { min: 1, max: 100000, fee: 0.025 }, // 2.5%
      debitCard: { min: 1, max: 100000, fee: 0.02 }, // 2.0%
      mobileBanking: { min: 1, max: 100000, fee: 0.018 }, // 1.8%
      internetBanking: { min: 1, max: 100000, fee: 0.015 }, // 1.5%
      eWallet: { min: 1, max: 100000, fee: 0.02 } // 2.0%
    },
    settlementPeriod: 'T+3', // 3 business days
    refundPolicy: {
      allowed: true,
      maxDays: 120,
      partialRefund: true,
      refundFee: 0.00,
      refundProcessingTime: '5-7 business days'
    }
  },

  // Status Mapping
  statusMapping: {
    'VALID': 'completed',
    'VALIDATED': 'completed',
    'FAILED': 'failed',
    'CANCELLED': 'cancelled',
    'UNATTEMPTED': 'pending',
    'EXPIRED': 'expired'
  },

  // Error Code Mapping
  errorCodes: {
    'FAILED': 'Transaction failed at bank end',
    'CANCELLED': 'Transaction cancelled by customer',
    'UNATTEMPTED': 'Customer did not complete payment',
    'EXPIRED': 'Session expired without payment'
  },

  // Payment Gateway Options
  paymentGateways: {
    creditCards: {
      enabled: true,
      methods: ['visa', 'master', 'amex'],
      fees: {
        visa: 2.5,
        master: 2.5,
        amex: 3.0
      }
    },
    debitCards: {
      enabled: true,
      methods: ['dbbl_visa', 'dbbl_master', 'brac_visa', 'brac_master'],
      fees: {
        default: 2.0
      }
    },
    mobileBanking: {
      enabled: true,
      methods: ['bkash', 'nagad', 'rocket', 'upay', 'tap'],
      fees: {
        bkash: 1.8,
        nagad: 1.5,
        rocket: 1.8,
        upay: 2.0,
        tap: 2.0
      }
    },
    internetBanking: {
      enabled: true,
      methods: [
        'brac_bank',
        'city_bank',
        'dbbl_bank',
        'ebl_bank',
        'ibbl_bank',
        'mtbl_bank',
        'al_arafah_bank',
        'shahjalal_bank',
        'standard_chartered',
        'hsbc'
      ],
      fees: {
        default: 1.5
      }
    }
  },

  // Hash Validation
  hashValidation: {
    algorithm: 'MD5',
    fields: [
      'store_id',
      'store_passwd',
      'total_amount',
      'currency',
      'tran_id',
      'success_url',
      'fail_url',
      'cancel_url'
    ],
    hashKey: 'verify_sign'
  },

  // IPN Configuration
  ipn: {
    enabled: true,
    validation: {
      required: true,
      fields: ['val_id', 'store_id', 'store_passwd'],
      hashValidation: true
    },
    processing: {
      async: true,
      timeout: 30000,
      retryAttempts: 3
    }
  },

  // Logging Configuration
  logging: {
    enabled: true,
    level: 'info',
    sensitiveFields: ['store_passwd', 'card_no', 'cvv'],
    logRequests: true,
    logResponses: true,
    logIPN: true,
    retentionDays: 365
  },

  // Monitoring & Analytics
  monitoring: {
    metricsEnabled: true,
    performanceTracking: true,
    errorRateThreshold: 0.05,
    responseTimeThreshold: 15000,
    healthCheckInterval: 300000,
    alerting: {
      enabled: true,
      channels: ['email', 'webhook']
    }
  },

  // Bangladesh Specific Configuration
  bangladeshConfig: {
    supportedBanks: [
      {
        name: 'Dutch Bangla Bank Limited',
        code: 'dbbl',
        methods: ['visa', 'master', 'internet_banking']
      },
      {
        name: 'BRAC Bank Limited',
        code: 'brac',
        methods: ['visa', 'master', 'internet_banking']
      },
      {
        name: 'City Bank Limited',
        code: 'city',
        methods: ['visa', 'master', 'internet_banking']
      },
      {
        name: 'Eastern Bank Limited',
        code: 'ebl',
        methods: ['visa', 'master', 'internet_banking']
      },
      {
        name: 'Islami Bank Bangladesh Limited',
        code: 'ibbl',
        methods: ['visa', 'master', 'internet_banking']
      },
      {
        name: 'Mutual Trust Bank Limited',
        code: 'mtbl',
        methods: ['visa', 'master', 'internet_banking']
      },
      {
        name: 'Al-Arafah Islami Bank Limited',
        code: 'al_arafah',
        methods: ['visa', 'master', 'internet_banking']
      },
      {
        name: 'Shahjalal Islami Bank Limited',
        code: 'shahjalal',
        methods: ['visa', 'master', 'internet_banking']
      }
    ],
    mobileBankingProviders: [
      {
        name: 'bKash',
        code: 'bkash',
        type: 'mobile_banking'
      },
      {
        name: 'Nagad',
        code: 'nagad',
        type: 'mobile_banking'
      },
      {
        name: 'Rocket',
        code: 'rocket',
        type: 'mobile_banking'
      },
      {
        name: 'Upay',
        code: 'upay',
        type: 'mobile_banking'
      },
      {
        name: 'Tap',
        code: 'tap',
        type: 'mobile_banking'
      }
    ],
    businessHours: {
      start: '00:00',
      end: '23:59',
      timezone: 'Asia/Dhaka',
      availability: '24/7'
    },
    supportedLanguages: ['bn', 'en'],
    culturalConsiderations: {
      festivalSupport: true,
      bankHolidays: true,
      religiousObservances: true
    },
    regulatoryCompliance: {
      bangladeshBankApproved: true,
      pciDssCompliant: true,
      iso27001Compliant: true
    }
  },

  // Integration Settings
  integration: {
    hosted: true,
    direct: false,
    seamless: true,
    checkout: {
      embedded: true,
      redirect: true,
      popup: true
    },
    apiVersioning: 'v4',
    sdkAvailable: false
  },

  // Testing Configuration
  testing: {
    sandboxEnabled: true,
    testStoreId: 'testbox',
    testStorePassword: 'qwerty',
    testCards: {
      visa: {
        success: '4444444444444448',
        failure: '4444444444444441'
      },
      master: {
        success: '5555555555554444',
        failure: '5555555555554441'
      }
    },
    testMobileBanking: {
      bkash: {
        success: '01711111111',
        failure: '01711111112'
      },
      nagad: {
        success: '01811111111',
        failure: '01811111112'
      }
    }
  },

  // Performance Configuration
  performance: {
    sessionTimeout: 1800,
    connectionTimeout: 30000,
    readTimeout: 45000,
    maxConnections: 100,
    connectionPooling: true,
    compression: true
  }
};