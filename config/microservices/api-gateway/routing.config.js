/**
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * API Gateway Routing Configuration
 * Amazon.com/Shopee.sg-Level Service Orchestration
 * Last Updated: July 6, 2025
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment-specific configuration
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.join(__dirname, '../../../environments', `${env}.env`) });

/**
 * API Gateway Routing Configuration
 * Central routing hub for all microservices
 */
module.exports = {
  // Gateway Configuration
  gateway: {
    name: 'GetIt API Gateway',
    version: '2.0.0',
    port: parseInt(process.env.API_GATEWAY_PORT) || 8080,
    host: process.env.API_GATEWAY_HOST || '0.0.0.0',
    basePath: '/api/v1',
    
    // Health Check Configuration
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
      retries: 3
    }
  },

  // Load Balancing Configuration
  loadBalancing: {
    strategy: 'round_robin', // round_robin, least_connections, weighted_round_robin, ip_hash
    healthCheck: {
      enabled: true,
      interval: 10000, // 10 seconds
      timeout: 5000,   // 5 seconds
      unhealthyThreshold: 3,
      healthyThreshold: 2
    },
    
    // Sticky Sessions
    stickySession: {
      enabled: false,
      cookieName: 'GATEWAY_SESSION',
      cookieMaxAge: 86400000 // 24 hours
    }
  },

  // Service Discovery Configuration
  serviceDiscovery: {
    enabled: true,
    type: 'static', // static, consul, eureka, kubernetes
    refreshInterval: 30000, // 30 seconds
    
    // Static Service Registry
    services: {
      'user-service': {
        name: 'User Management Service',
        instances: [
          {
            host: process.env.USER_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.USER_SERVICE_PORT) || 3001,
            weight: 1,
            tags: ['authentication', 'profiles', 'users']
          }
        ]
      },
      
      'product-service': {
        name: 'Product Catalog Service',
        instances: [
          {
            host: process.env.PRODUCT_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.PRODUCT_SERVICE_PORT) || 3002,
            weight: 1,
            tags: ['catalog', 'inventory', 'search']
          }
        ]
      },
      
      'order-service': {
        name: 'Order Management Service',
        instances: [
          {
            host: process.env.ORDER_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.ORDER_SERVICE_PORT) || 3003,
            weight: 1,
            tags: ['orders', 'cart', 'checkout']
          }
        ]
      },
      
      'payment-service': {
        name: 'Payment Processing Service',
        instances: [
          {
            host: process.env.PAYMENT_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.PAYMENT_SERVICE_PORT) || 3004,
            weight: 1,
            tags: ['payments', 'bkash', 'nagad', 'rocket']
          }
        ]
      },
      
      'notification-service': {
        name: 'Multi-Channel Notification Service',
        instances: [
          {
            host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.NOTIFICATION_SERVICE_PORT) || 3005,
            weight: 1,
            tags: ['notifications', 'sms', 'email', 'push']
          }
        ]
      },
      
      'analytics-service': {
        name: 'Business Intelligence Service',
        instances: [
          {
            host: process.env.ANALYTICS_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.ANALYTICS_SERVICE_PORT) || 3006,
            weight: 1,
            tags: ['analytics', 'reporting', 'insights']
          }
        ]
      },
      
      'vendor-service': {
        name: 'Vendor Management Service',
        instances: [
          {
            host: process.env.VENDOR_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.VENDOR_SERVICE_PORT) || 3007,
            weight: 1,
            tags: ['vendors', 'kyc', 'stores', 'payouts']
          }
        ]
      },
      
      'shipping-service': {
        name: 'Shipping & Logistics Service',
        instances: [
          {
            host: process.env.SHIPPING_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.SHIPPING_SERVICE_PORT) || 3008,
            weight: 1,
            tags: ['shipping', 'pathao', 'paperfly', 'tracking']
          }
        ]
      },
      
      'search-service': {
        name: 'Search & Discovery Service',
        instances: [
          {
            host: process.env.SEARCH_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.SEARCH_SERVICE_PORT) || 3009,
            weight: 1,
            tags: ['search', 'elasticsearch', 'recommendations']
          }
        ]
      },
      
      'ml-service': {
        name: 'Machine Learning Service',
        instances: [
          {
            host: process.env.ML_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.ML_SERVICE_PORT) || 3010,
            weight: 1,
            tags: ['ml', 'recommendations', 'fraud-detection']
          }
        ]
      },
      
      'finance-service': {
        name: 'Financial Management Service',
        instances: [
          {
            host: process.env.FINANCE_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.FINANCE_SERVICE_PORT) || 3011,
            weight: 1,
            tags: ['finance', 'accounting', 'taxes', 'commissions']
          }
        ]
      },
      
      'inventory-service': {
        name: 'Inventory Management Service',
        instances: [
          {
            host: process.env.INVENTORY_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.INVENTORY_SERVICE_PORT) || 3012,
            weight: 1,
            tags: ['inventory', 'stock', 'warehouses']
          }
        ]
      },
      
      'kyc-service': {
        name: 'KYC Verification Service',
        instances: [
          {
            host: process.env.KYC_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.KYC_SERVICE_PORT) || 3013,
            weight: 1,
            tags: ['kyc', 'verification', 'compliance', 'nid']
          }
        ]
      },
      
      'marketing-service': {
        name: 'Marketing Campaign Service',
        instances: [
          {
            host: process.env.MARKETING_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.MARKETING_SERVICE_PORT) || 3014,
            weight: 1,
            tags: ['marketing', 'campaigns', 'coupons', 'promotions']
          }
        ]
      },
      
      'localization-service': {
        name: 'Localization & Cultural Service',
        instances: [
          {
            host: process.env.LOCALIZATION_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.LOCALIZATION_SERVICE_PORT) || 3015,
            weight: 1,
            tags: ['localization', 'i18n', 'bengali', 'cultural']
          }
        ]
      }
    }
  },

  // Routing Rules Configuration
  routes: [
    // User Service Routes
    {
      id: 'user-auth',
      path: '/auth/*',
      service: 'user-service',
      stripPath: true,
      preserveHost: false,
      timeout: 30000,
      retries: 3,
      tags: ['authentication', 'public']
    },
    
    {
      id: 'user-profile',
      path: '/users/*',
      service: 'user-service',
      stripPath: true,
      preserveHost: false,
      timeout: 15000,
      retries: 2,
      tags: ['users', 'private']
    },

    // Product Service Routes
    {
      id: 'product-catalog',
      path: '/products/*',
      service: 'product-service',
      stripPath: true,
      preserveHost: false,
      timeout: 10000,
      retries: 2,
      tags: ['products', 'public', 'cacheable']
    },
    
    {
      id: 'product-search',
      path: '/search/*',
      service: 'search-service',
      stripPath: true,
      preserveHost: false,
      timeout: 5000,
      retries: 1,
      tags: ['search', 'public', 'fast']
    },

    // Order Service Routes
    {
      id: 'order-management',
      path: '/orders/*',
      service: 'order-service',
      stripPath: true,
      preserveHost: false,
      timeout: 30000,
      retries: 3,
      tags: ['orders', 'private', 'critical']
    },
    
    {
      id: 'cart-management',
      path: '/cart/*',
      service: 'order-service',
      stripPath: true,
      preserveHost: false,
      timeout: 10000,
      retries: 2,
      tags: ['cart', 'session', 'fast']
    },

    // Payment Service Routes
    {
      id: 'payment-processing',
      path: '/payments/*',
      service: 'payment-service',
      stripPath: true,
      preserveHost: false,
      timeout: 60000,
      retries: 1,
      tags: ['payments', 'private', 'secure', 'critical']
    },

    // Vendor Service Routes
    {
      id: 'vendor-management',
      path: '/vendors/*',
      service: 'vendor-service',
      stripPath: true,
      preserveHost: false,
      timeout: 20000,
      retries: 2,
      tags: ['vendors', 'private']
    },
    
    {
      id: 'vendor-kyc',
      path: '/kyc/*',
      service: 'kyc-service',
      stripPath: true,
      preserveHost: false,
      timeout: 45000,
      retries: 1,
      tags: ['kyc', 'private', 'secure']
    },

    // Shipping Service Routes
    {
      id: 'shipping-management',
      path: '/shipping/*',
      service: 'shipping-service',
      stripPath: true,
      preserveHost: false,
      timeout: 15000,
      retries: 2,
      tags: ['shipping', 'logistics']
    },

    // Notification Service Routes
    {
      id: 'notification-management',
      path: '/notifications/*',
      service: 'notification-service',
      stripPath: true,
      preserveHost: false,
      timeout: 10000,
      retries: 1,
      tags: ['notifications', 'async']
    },

    // Analytics Service Routes
    {
      id: 'analytics-dashboard',
      path: '/analytics/*',
      service: 'analytics-service',
      stripPath: true,
      preserveHost: false,
      timeout: 30000,
      retries: 1,
      tags: ['analytics', 'private', 'heavy']
    },

    // Finance Service Routes
    {
      id: 'finance-management',
      path: '/finance/*',
      service: 'finance-service',
      stripPath: true,
      preserveHost: false,
      timeout: 20000,
      retries: 2,
      tags: ['finance', 'private', 'secure']
    },

    // Inventory Service Routes
    {
      id: 'inventory-management',
      path: '/inventory/*',
      service: 'inventory-service',
      stripPath: true,
      preserveHost: false,
      timeout: 10000,
      retries: 2,
      tags: ['inventory', 'private']
    },

    // Marketing Service Routes
    {
      id: 'marketing-campaigns',
      path: '/marketing/*',
      service: 'marketing-service',
      stripPath: true,
      preserveHost: false,
      timeout: 15000,
      retries: 2,
      tags: ['marketing', 'campaigns']
    },

    // ML Service Routes
    {
      id: 'ml-recommendations',
      path: '/ml/*',
      service: 'ml-service',
      stripPath: true,
      preserveHost: false,
      timeout: 20000,
      retries: 1,
      tags: ['ml', 'recommendations', 'heavy']
    },

    // Localization Service Routes
    {
      id: 'localization-content',
      path: '/localization/*',
      service: 'localization-service',
      stripPath: true,
      preserveHost: false,
      timeout: 10000,
      retries: 2,
      tags: ['localization', 'i18n', 'cacheable']
    }
  ],

  // Request/Response Transformation
  transformation: {
    // Request Headers
    requestHeaders: {
      add: {
        'X-Gateway-Version': '2.0.0',
        'X-Request-ID': '${request_id}',
        'X-Forwarded-Proto': '${scheme}',
        'X-Real-IP': '${remote_addr}',
        'X-Forwarded-For': '${proxy_add_x_forwarded_for}'
      },
      remove: ['Server', 'X-Powered-By']
    },

    // Response Headers
    responseHeaders: {
      add: {
        'X-Gateway': 'GetIt-API-Gateway',
        'X-Response-Time': '${upstream_response_time}',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      },
      remove: ['Server', 'X-Powered-By']
    }
  },

  // CORS Configuration
  cors: {
    enabled: true,
    origins: process.env.NODE_ENV === 'production' 
      ? ['https://getit.com.bd', 'https://www.getit.com.bd']
      : ['http://localhost:3000', 'http://localhost:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Request-ID'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
  },

  // WebSocket Configuration
  websocket: {
    enabled: true,
    routes: [
      {
        path: '/ws/notifications',
        service: 'notification-service',
        timeout: 300000 // 5 minutes
      },
      {
        path: '/ws/chat',
        service: 'notification-service',
        timeout: 600000 // 10 minutes
      },
      {
        path: '/ws/analytics',
        service: 'analytics-service',
        timeout: 300000 // 5 minutes
      }
    ]
  },

  // Bangladesh-Specific Configuration
  bangladesh: {
    // Local Service Priorities
    servicePriorities: {
      'payment-service': 1, // Highest priority for payments
      'user-service': 2,
      'order-service': 3,
      'product-service': 4
    },

    // Cultural Headers
    culturalHeaders: {
      'X-Country': 'BD',
      'X-Currency': 'BDT',
      'X-Timezone': 'Asia/Dhaka',
      'X-Language': 'bn'
    },

    // Local Compliance
    compliance: {
      dataResidency: true,
      governmentAccess: true,
      auditLogging: true
    }
  },

  // Monitoring and Observability
  monitoring: {
    // Metrics Collection
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      interval: 30000, // 30 seconds
      detailed: process.env.NODE_ENV !== 'production'
    },

    // Distributed Tracing
    tracing: {
      enabled: true,
      samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      jaegerEndpoint: process.env.JAEGER_URL || 'http://localhost:14268/api/traces'
    },

    // Logging
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      includeRequestBody: process.env.NODE_ENV !== 'production',
      includeResponseBody: process.env.NODE_ENV !== 'production',
      sensitiveFields: ['password', 'token', 'authorization']
    }
  },

  // Error Handling
  errorHandling: {
    // Default Error Responses
    defaultErrors: {
      400: { message: 'Bad Request', code: 'INVALID_REQUEST' },
      401: { message: 'Unauthorized', code: 'AUTHENTICATION_REQUIRED' },
      403: { message: 'Forbidden', code: 'ACCESS_DENIED' },
      404: { message: 'Not Found', code: 'RESOURCE_NOT_FOUND' },
      429: { message: 'Too Many Requests', code: 'RATE_LIMIT_EXCEEDED' },
      500: { message: 'Internal Server Error', code: 'INTERNAL_ERROR' },
      502: { message: 'Bad Gateway', code: 'SERVICE_UNAVAILABLE' },
      503: { message: 'Service Unavailable', code: 'SERVICE_UNAVAILABLE' },
      504: { message: 'Gateway Timeout', code: 'SERVICE_TIMEOUT' }
    },

    // Error Response Format
    responseFormat: {
      success: false,
      error: {
        code: '${error_code}',
        message: '${error_message}',
        timestamp: '${timestamp}',
        requestId: '${request_id}'
      }
    },

    // Retry Configuration
    retry: {
      enabled: true,
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      baseDelay: 1000, // 1 second
      maxDelay: 10000  // 10 seconds
    }
  }
};

/**
 * Environment-specific configuration override
 */
module.exports.getEnvironmentConfig = function(environment = process.env.NODE_ENV) {
  const config = { ...module.exports };
  
  if (environment === 'production') {
    // Production optimizations
    config.monitoring.tracing.samplingRate = 0.1;
    config.monitoring.logging.includeRequestBody = false;
    config.monitoring.logging.includeResponseBody = false;
    config.cors.origins = ['https://getit.com.bd', 'https://www.getit.com.bd'];
  } else if (environment === 'development') {
    // Development optimizations
    config.monitoring.tracing.samplingRate = 1.0;
    config.monitoring.logging.includeRequestBody = true;
    config.monitoring.logging.includeResponseBody = true;
    config.cors.origins = ['http://localhost:3000', 'http://localhost:5000'];
  }
  
  return config;
};