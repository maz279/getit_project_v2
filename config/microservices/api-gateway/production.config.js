// API Gateway Production Configuration
// Central gateway for microservices communication and external API management

module.exports = {
  // Gateway Information
  gateway: {
    name: 'GetIt API Gateway',
    version: '2.0',
    type: 'api_gateway',
    environment: 'production',
    enabled: true,
    description: 'Central API Gateway for GetIt multi-vendor e-commerce platform with comprehensive routing, security, and monitoring'
  },

  // Server Configuration
  server: {
    host: process.env.API_GATEWAY_HOST || '0.0.0.0',
    port: process.env.API_GATEWAY_PORT || 8080,
    protocol: 'https',
    
    // SSL/TLS Configuration
    ssl: {
      enabled: true,
      cert: process.env.API_GATEWAY_SSL_CERT,
      key: process.env.API_GATEWAY_SSL_KEY,
      ca: process.env.API_GATEWAY_SSL_CA,
      ciphers: [
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES128-SHA256'
      ],
      protocols: ['TLSv1.2', 'TLSv1.3'],
      requestCert: false,
      rejectUnauthorized: true
    },

    // Performance Settings
    performance: {
      keepAliveTimeout: 65000,
      headersTimeout: 66000,
      maxHeadersCount: 2000,
      maxRequestsPerSocket: 0,
      timeout: 120000, // 2 minutes
      bodyParser: {
        limit: '10mb',
        extended: true,
        parameterLimit: 1000
      }
    },

    // CORS Configuration
    cors: {
      enabled: true,
      origins: [
        'https://getit.com.bd',
        'https://www.getit.com.bd',
        'https://admin.getit.com.bd',
        'https://vendor.getit.com.bd',
        'https://api.getit.com.bd'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-Key',
        'X-Client-Version',
        'X-Request-ID',
        'Accept',
        'Origin'
      ],
      exposedHeaders: [
        'X-Request-ID',
        'X-Response-Time',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
      ],
      credentials: true,
      maxAge: 86400 // 24 hours
    }
  },

  // Service Discovery & Registry
  serviceDiscovery: {
    enabled: true,
    type: 'consul', // consul, etcd, or static
    
    consul: {
      host: process.env.CONSUL_HOST || 'consul.getit.internal',
      port: process.env.CONSUL_PORT || 8500,
      secure: true,
      token: process.env.CONSUL_TOKEN,
      datacenter: 'dc1',
      
      // Health Check Configuration
      healthCheck: {
        enabled: true,
        interval: '30s',
        timeout: '10s',
        deregisterAfter: '1m'
      }
    },

    // Static Service Configuration (Fallback)
    staticServices: {
      'user-service': {
        instances: [
          { host: 'user-service-1.getit.internal', port: 3001, weight: 100 },
          { host: 'user-service-2.getit.internal', port: 3001, weight: 100 }
        ]
      },
      'product-service': {
        instances: [
          { host: 'product-service-1.getit.internal', port: 3002, weight: 100 },
          { host: 'product-service-2.getit.internal', port: 3002, weight: 100 }
        ]
      },
      'order-service': {
        instances: [
          { host: 'order-service-1.getit.internal', port: 3003, weight: 100 },
          { host: 'order-service-2.getit.internal', port: 3003, weight: 100 }
        ]
      },
      'payment-service': {
        instances: [
          { host: 'payment-service-1.getit.internal', port: 3004, weight: 100 },
          { host: 'payment-service-2.getit.internal', port: 3004, weight: 100 }
        ]
      },
      'notification-service': {
        instances: [
          { host: 'notification-service-1.getit.internal', port: 3005, weight: 100 }
        ]
      },
      'analytics-service': {
        instances: [
          { host: 'analytics-service-1.getit.internal', port: 3006, weight: 100 }
        ]
      },
      'vendor-service': {
        instances: [
          { host: 'vendor-service-1.getit.internal', port: 3007, weight: 100 }
        ]
      },
      'shipping-service': {
        instances: [
          { host: 'shipping-service-1.getit.internal', port: 3008, weight: 100 }
        ]
      },
      'ml-service': {
        instances: [
          { host: 'ml-service-1.getit.internal', port: 3009, weight: 100 }
        ]
      },
      'finance-service': {
        instances: [
          { host: 'finance-service-1.getit.internal', port: 3010, weight: 100 }
        ]
      }
    }
  },

  // Routing Configuration
  routing: {
    // Route Definitions
    routes: [
      // User Service Routes
      {
        path: '/api/v1/users/*',
        service: 'user-service',
        stripPath: false,
        preserveHost: true,
        timeout: 30000,
        retries: 3,
        healthCheck: '/health',
        circuitBreaker: {
          enabled: true,
          threshold: 50,
          timeout: 60000,
          resetTimeout: 30000
        }
      },

      // Product Service Routes
      {
        path: '/api/v1/products/*',
        service: 'product-service',
        stripPath: false,
        preserveHost: true,
        timeout: 30000,
        retries: 3,
        cache: {
          enabled: true,
          ttl: 300, // 5 minutes
          keys: ['GET']
        }
      },

      // Order Service Routes
      {
        path: '/api/v1/orders/*',
        service: 'order-service',
        stripPath: false,
        preserveHost: true,
        timeout: 45000,
        retries: 2,
        idempotency: {
          enabled: true,
          keys: ['POST', 'PUT', 'PATCH']
        }
      },

      // Payment Service Routes
      {
        path: '/api/v1/payments/*',
        service: 'payment-service',
        stripPath: false,
        preserveHost: true,
        timeout: 60000,
        retries: 1,
        security: {
          encryption: true,
          pciCompliance: true
        }
      },

      // Notification Service Routes
      {
        path: '/api/v1/notifications/*',
        service: 'notification-service',
        stripPath: false,
        preserveHost: true,
        timeout: 30000,
        retries: 2
      },

      // Analytics Service Routes
      {
        path: '/api/v1/analytics/*',
        service: 'analytics-service',
        stripPath: false,
        preserveHost: true,
        timeout: 60000,
        retries: 1,
        cache: {
          enabled: true,
          ttl: 600, // 10 minutes
          keys: ['GET']
        }
      },

      // Vendor Service Routes
      {
        path: '/api/v1/vendors/*',
        service: 'vendor-service',
        stripPath: false,
        preserveHost: true,
        timeout: 30000,
        retries: 3
      },

      // Shipping Service Routes
      {
        path: '/api/v1/shipping/*',
        service: 'shipping-service',
        stripPath: false,
        preserveHost: true,
        timeout: 45000,
        retries: 2
      },

      // ML Service Routes
      {
        path: '/api/v1/ml/*',
        service: 'ml-service',
        stripPath: false,
        preserveHost: true,
        timeout: 120000, // 2 minutes for ML processing
        retries: 1
      },

      // Finance Service Routes
      {
        path: '/api/v1/finance/*',
        service: 'finance-service',
        stripPath: false,
        preserveHost: true,
        timeout: 60000,
        retries: 2,
        security: {
          encryption: true,
          compliance: true
        }
      }
    ],

    // Load Balancing
    loadBalancing: {
      algorithm: 'round_robin',
      healthCheck: {
        enabled: true,
        interval: 30000,
        timeout: 10000,
        unhealthyThreshold: 3,
        healthyThreshold: 2
      }
    }
  },

  // Authentication & Authorization
  authentication: {
    enabled: true,
    
    // JWT Configuration
    jwt: {
      enabled: true,
      secret: process.env.JWT_SECRET,
      algorithm: 'HS256',
      expiresIn: '1h',
      issuer: 'getit-api-gateway',
      audience: 'getit-services'
    },

    // API Key Authentication
    apiKey: {
      enabled: true,
      header: 'X-API-Key',
      query: 'api_key',
      
      types: {
        public: {
          rateLimit: 1000,
          permissions: ['read']
        },
        private: {
          rateLimit: 10000,
          permissions: ['read', 'write']
        },
        admin: {
          rateLimit: 100000,
          permissions: ['read', 'write', 'admin']
        }
      }
    }
  },

  // Rate Limiting
  rateLimiting: {
    enabled: true,
    
    global: {
      enabled: true,
      requests: 10000,
      window: 3600
    },

    perIP: {
      enabled: true,
      requests: 1000,
      window: 3600,
      whitelist: [
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16'
      ]
    },

    perUser: {
      enabled: true,
      requests: 5000,
      window: 3600
    },

    routes: [
      {
        path: '/api/v1/auth/login',
        requests: 5,
        window: 900,
        block: true,
        blockDuration: 900
      },
      {
        path: '/api/v1/payments/*',
        requests: 100,
        window: 3600,
        perUser: true
      }
    ]
  },

  // Caching Configuration
  caching: {
    enabled: true,
    
    storage: {
      type: 'redis',
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        db: 1,
        keyPrefix: 'cache:'
      }
    },

    rules: [
      {
        path: '/api/v1/products',
        methods: ['GET'],
        ttl: 300,
        vary: ['Accept-Language', 'X-User-Location']
      },
      {
        path: '/api/v1/categories',
        methods: ['GET'],
        ttl: 1800,
        vary: ['Accept-Language']
      }
    ]
  },

  // Security Configuration
  security: {
    headers: {
      enabled: true,
      headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    },

    ddosProtection: {
      enabled: true,
      burst: 20,
      rate: '100/minute'
    }
  },

  // Monitoring & Observability
  monitoring: {
    enabled: true,
    
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      format: 'prometheus'
    },

    healthChecks: {
      enabled: true,
      endpoint: '/health'
    },

    logging: {
      enabled: true,
      level: 'info',
      format: 'json'
    }
  },

  // Bangladesh Specific Configuration
  bangladeshConfig: {
    timezone: 'Asia/Dhaka',
    locale: 'bn_BD',
    currency: 'BDT',
    
    compliance: {
      dataResidency: true,
      localDataCenter: true,
      governmentCompliance: true
    },
    
    localServices: {
      enabled: true,
      services: [
        'bangladesh_bank_api',
        'nid_verification_api',
        'mobile_operator_apis',
        'courier_partner_apis'
      ]
    }
  },

  // Environment Configuration
  environment: {
    production: true,
    cluster: true,
    workers: 'auto',
    gracefulShutdown: {
      enabled: true,
      timeout: 30000
    }
  }
};