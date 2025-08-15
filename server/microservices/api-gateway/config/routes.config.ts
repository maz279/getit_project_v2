/**
 * API Gateway Routes Configuration
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Complete service routing configuration for all microservices
 * Production-ready with authentication, rate limiting, and monitoring
 */

export interface RouteConfig {
  path: string;
  target: string;
  methods: string[];
  authentication: AuthConfig;
  rateLimit: RateLimitConfig;
  timeout: number;
  retries: number;
  circuitBreaker: boolean;
  caching: CacheConfig;
  transformation: TransformConfig;
  monitoring: MonitoringConfig;
  bangladesh: BangladeshConfig;
}

export interface AuthConfig {
  required: boolean;
  roles?: string[];
  permissions?: string[];
  skipPaths?: string[];
}

export interface RateLimitConfig {
  enabled: boolean;
  tier?: 'anonymous' | 'registered' | 'vendor' | 'premium' | 'admin';
  custom?: {
    requests: number;
    window: number;
  };
}

export interface CacheConfig {
  enabled: boolean;
  ttl?: number;
  key?: string;
  vary?: string[];
}

export interface TransformConfig {
  request?: {
    headers?: Record<string, string>;
    body?: any;
  };
  response?: {
    headers?: Record<string, string>;
    body?: any;
  };
}

export interface MonitoringConfig {
  metrics: boolean;
  logging: boolean;
  tracing: boolean;
}

export interface BangladeshConfig {
  mobileOptimized: boolean;
  localizedResponse: boolean;
  currencyConversion: boolean;
  timezoneAdjustment: boolean;
}

// Complete service routing configuration
export const serviceRoutes: Record<string, RouteConfig> = {
  // Core User Management Services
  'users': {
    path: '/api/v1/users',
    target: 'http://localhost:5001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    authentication: {
      required: true,
      roles: ['user', 'admin', 'vendor'],
      skipPaths: ['/register', '/login', '/forgot-password', '/verify-email']
    },
    rateLimit: {
      enabled: true,
      tier: 'registered'
    },
    timeout: 10000,
    retries: 3,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 300,
      vary: ['authorization']
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'user-service',
          'X-Bangladesh-Market': 'true'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: false,
      timezoneAdjustment: true
    }
  },

  // Vendor Management Services
  'vendors': {
    path: '/api/v1/vendors',
    target: 'http://localhost:5002',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    authentication: {
      required: true,
      roles: ['vendor', 'admin'],
      permissions: ['vendor:read', 'vendor:write']
    },
    rateLimit: {
      enabled: true,
      tier: 'vendor'
    },
    timeout: 15000,
    retries: 3,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 600,
      key: 'vendor-{id}'
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'vendor-service',
          'X-KYC-Required': 'true'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: true
    }
  },

  // Product Catalog Services
  'products': {
    path: '/api/v1/products',
    target: 'http://localhost:5003',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    authentication: {
      required: false,
      roles: ['user', 'vendor', 'admin'],
      skipPaths: ['/search', '/categories', '/featured', '/public']
    },
    rateLimit: {
      enabled: true,
      tier: 'anonymous'
    },
    timeout: 8000,
    retries: 2,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 1800,
      key: 'product-{id}',
      vary: ['accept-language', 'x-currency']
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'product-service',
          'X-Search-Engine': 'elasticsearch'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: false, // High volume
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: false
    }
  },

  // Order Management Services
  'orders': {
    path: '/api/v1/orders',
    target: 'http://localhost:5004',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    authentication: {
      required: true,
      roles: ['user', 'vendor', 'admin']
    },
    rateLimit: {
      enabled: true,
      tier: 'registered'
    },
    timeout: 20000,
    retries: 3,
    circuitBreaker: true,
    caching: {
      enabled: false // Orders are dynamic
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'order-service',
          'X-Payment-Integration': 'bangladesh'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: true
    }
  },

  // Payment Services
  'payments': {
    path: '/api/v1/payments',
    target: 'http://localhost:5005',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['user', 'vendor', 'admin'],
      permissions: ['payment:process']
    },
    rateLimit: {
      enabled: true,
      custom: {
        requests: 100,
        window: 3600000 // 1 hour
      }
    },
    timeout: 30000,
    retries: 1, // Payments should not be retried automatically
    circuitBreaker: true,
    caching: {
      enabled: false // Never cache payments
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'payment-service',
          'X-PCI-Compliance': 'required',
          'X-Bangladesh-Banking': 'enabled'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: true
    }
  },

  // Shipping & Logistics Services
  'shipping': {
    path: '/api/v1/shipping',
    target: 'http://localhost:5006',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['user', 'vendor', 'admin']
    },
    rateLimit: {
      enabled: true,
      tier: 'registered'
    },
    timeout: 15000,
    retries: 3,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 900,
      key: 'shipping-{zone}-{weight}'
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'shipping-service',
          'X-Bangladesh-Couriers': 'pathao,paperfly,sundarban'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: true
    }
  },

  // Notification Services
  'notifications': {
    path: '/api/v1/notifications',
    target: 'http://localhost:5007',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['user', 'vendor', 'admin']
    },
    rateLimit: {
      enabled: true,
      tier: 'registered'
    },
    timeout: 10000,
    retries: 2,
    circuitBreaker: true,
    caching: {
      enabled: false
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'notification-service',
          'X-SMS-Provider': 'ssl-wireless',
          'X-Email-Provider': 'sendgrid'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: false
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: false,
      timezoneAdjustment: true
    }
  },

  // Search & Discovery Services
  'search': {
    path: '/api/v1/search',
    target: 'http://localhost:5008',
    methods: ['GET', 'POST'],
    authentication: {
      required: false,
      roles: ['user', 'vendor', 'admin']
    },
    rateLimit: {
      enabled: true,
      tier: 'anonymous'
    },
    timeout: 5000,
    retries: 2,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 600,
      key: 'search-{query}-{filters}',
      vary: ['accept-language']
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'search-service',
          'X-Search-Language': 'bengali-english'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: false, // High volume
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: false
    }
  },

  // Analytics & Business Intelligence
  'analytics': {
    path: '/api/v1/analytics',
    target: 'http://localhost:5009',
    methods: ['GET', 'POST'],
    authentication: {
      required: true,
      roles: ['vendor', 'admin'],
      permissions: ['analytics:read']
    },
    rateLimit: {
      enabled: true,
      tier: 'vendor'
    },
    timeout: 25000,
    retries: 2,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 1800,
      key: 'analytics-{type}-{period}'
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'analytics-service',
          'X-BI-Engine': 'elasticsearch'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: false,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: true
    }
  },

  // Inventory Management
  'inventory': {
    path: '/api/v1/inventory',
    target: 'http://localhost:5010',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['vendor', 'admin']
    },
    rateLimit: {
      enabled: true,
      tier: 'vendor'
    },
    timeout: 12000,
    retries: 3,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 300,
      key: 'inventory-{productId}'
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'inventory-service',
          'X-Stock-Management': 'real-time'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: true
    }
  },

  // Marketing & Promotions
  'marketing': {
    path: '/api/v1/marketing',
    target: 'http://localhost:5011',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['vendor', 'admin'],
      skipPaths: ['/public-campaigns', '/featured-deals']
    },
    rateLimit: {
      enabled: true,
      tier: 'vendor'
    },
    timeout: 10000,
    retries: 2,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 900,
      key: 'marketing-{type}-{id}'
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'marketing-service',
          'X-Campaign-Engine': 'rule-based'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: false
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: true
    }
  },

  // Machine Learning Services
  'ml': {
    path: '/api/v1/ml',
    target: 'http://localhost:5012',
    methods: ['GET', 'POST'],
    authentication: {
      required: true,
      roles: ['user', 'vendor', 'admin']
    },
    rateLimit: {
      enabled: true,
      tier: 'registered'
    },
    timeout: 15000,
    retries: 1,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 1800,
      key: 'ml-{algorithm}-{input}'
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'ml-service',
          'X-ML-Engine': 'tensorflow'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: false
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: false,
      timezoneAdjustment: false
    }
  },

  // Content Management
  'content': {
    path: '/api/v1/content',
    target: 'http://localhost:5013',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: false,
      roles: ['admin', 'vendor'],
      skipPaths: ['/public', '/pages', '/media']
    },
    rateLimit: {
      enabled: true,
      tier: 'anonymous'
    },
    timeout: 8000,
    retries: 2,
    circuitBreaker: true,
    caching: {
      enabled: true,
      ttl: 3600,
      key: 'content-{type}-{id}',
      vary: ['accept-language']
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'content-service',
          'X-CMS-Engine': 'headless'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: false,
      tracing: false
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: false,
      timezoneAdjustment: true
    }
  },

  // Support & Customer Service
  'support': {
    path: '/api/v1/support',
    target: 'http://localhost:5014',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['user', 'vendor', 'admin']
    },
    rateLimit: {
      enabled: true,
      tier: 'registered'
    },
    timeout: 20000,
    retries: 2,
    circuitBreaker: true,
    caching: {
      enabled: false
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'support-service',
          'X-Ticket-System': 'zendesk',
          'X-Live-Chat': 'enabled'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: true,
      localizedResponse: true,
      currencyConversion: false,
      timezoneAdjustment: true
    }
  },

  // Finance & Accounting
  'finance': {
    path: '/api/v1/finance',
    target: 'http://localhost:5015',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['admin', 'vendor'],
      permissions: ['finance:read', 'finance:write']
    },
    rateLimit: {
      enabled: true,
      tier: 'vendor'
    },
    timeout: 30000,
    retries: 1,
    circuitBreaker: true,
    caching: {
      enabled: false // Financial data should not be cached
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'finance-service',
          'X-Accounting-Engine': 'double-entry',
          'X-Tax-Compliance': 'bangladesh'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: false,
      localizedResponse: true,
      currencyConversion: true,
      timezoneAdjustment: true
    }
  },

  // Configuration Management
  'config': {
    path: '/api/v1/config',
    target: 'http://localhost:5016',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['admin'],
      permissions: ['config:read', 'config:write']
    },
    rateLimit: {
      enabled: true,
      tier: 'admin'
    },
    timeout: 10000,
    retries: 2,
    circuitBreaker: false,
    caching: {
      enabled: true,
      ttl: 600,
      key: 'config-{key}'
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'config-service',
          'X-Environment': process.env.NODE_ENV || 'development'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: false,
      localizedResponse: false,
      currencyConversion: false,
      timezoneAdjustment: true
    }
  },

  // API Gateway Self-Management
  'gateway': {
    path: '/api/v1/gateway',
    target: 'internal', // Handled internally
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authentication: {
      required: true,
      roles: ['admin'],
      permissions: ['gateway:admin']
    },
    rateLimit: {
      enabled: true,
      tier: 'admin'
    },
    timeout: 5000,
    retries: 1,
    circuitBreaker: false,
    caching: {
      enabled: false
    },
    transformation: {
      request: {
        headers: {
          'X-Service-Name': 'api-gateway',
          'X-Internal-Request': 'true'
        }
      }
    },
    monitoring: {
      metrics: true,
      logging: true,
      tracing: true
    },
    bangladesh: {
      mobileOptimized: false,
      localizedResponse: false,
      currencyConversion: false,
      timezoneAdjustment: true
    }
  }
};

// Public routes that don't require authentication
export const publicRoutes = [
  '/health',
  '/api/health',
  '/api/v1/users/register',
  '/api/v1/users/login',
  '/api/v1/users/forgot-password',
  '/api/v1/users/verify-email',
  '/api/v1/products/search',
  '/api/v1/products/categories',
  '/api/v1/products/featured',
  '/api/v1/products/public',
  '/api/v1/search',
  '/api/v1/content/public',
  '/api/v1/content/pages',
  '/api/v1/content/media',
  '/api/v1/marketing/public-campaigns',
  '/api/v1/marketing/featured-deals'
];

// Admin-only routes
export const adminRoutes = [
  '/api/v1/gateway',
  '/api/v1/config',
  '/api/v1/analytics/admin',
  '/api/v1/users/admin',
  '/api/v1/vendors/admin',
  '/api/v1/finance/reports'
];

// Rate limit exemptions
export const rateLimitExemptions = [
  '/health',
  '/api/health',
  '/metrics',
  '/api/v1/gateway/health'
];

export default serviceRoutes;