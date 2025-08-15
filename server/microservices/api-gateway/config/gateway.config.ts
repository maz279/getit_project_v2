/**
 * Gateway Configuration
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Production-ready API Gateway configuration with Bangladesh-specific optimizations
 * Following enterprise standards for security, performance, and compliance
 */

export interface GatewayConfig {
  server: ServerConfig;
  services: ServiceConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  bangladesh: BangladeshConfig;
  monitoring: MonitoringConfig;
  rateLimit: RateLimitConfig;
  circuitBreaker: CircuitBreakerConfig;
}

export interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'staging' | 'production';
  ssl: {
    enabled: boolean;
    keyPath?: string;
    certPath?: string;
    autoTLS: boolean;
  };
  cluster: {
    enabled: boolean;
    workers: number | 'auto';
  };
  gracefulShutdown: {
    timeout: number;
    signals: string[];
  };
}

export interface ServiceConfig {
  discovery: {
    enabled: boolean;
    registry: 'consul' | 'etcd' | 'database';
    healthCheckInterval: number;
    healthCheckTimeout: number;
  };
  loadBalancing: {
    algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
    healthyThreshold: number;
    unhealthyThreshold: number;
    retryAttempts: number;
    retryDelay: number;
  };
  timeout: {
    connect: number;
    request: number;
    response: number;
  };
}

export interface SecurityConfig {
  cors: {
    origin: string | string[];
    credentials: boolean;
    optionsSuccessStatus: number;
  };
  headers: {
    xssProtection: boolean;
    noSniff: boolean;
    frameguard: string;
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
  };
  waf: {
    enabled: boolean;
    rules: string[];
    ipWhitelist: string[];
    ipBlacklist: string[];
    geoBlocking: {
      enabled: boolean;
      allowedCountries: string[];
      blockedCountries: string[];
    };
  };
  authentication: {
    jwt: {
      secret: string;
      algorithm: string;
      expiresIn: string;
      issuer: string;
      audience: string;
    };
    oauth: {
      providers: {
        google: { clientId: string; clientSecret: string; };
        facebook: { clientId: string; clientSecret: string; };
        github: { clientId: string; clientSecret: string; };
      };
    };
  };
}

export interface PerformanceConfig {
  compression: {
    enabled: boolean;
    level: number;
    threshold: number;
    filter: string[];
  };
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: string;
    redis: {
      host: string;
      port: number;
      db: number;
      keyPrefix: string;
    };
  };
  connection: {
    keepAlive: boolean;
    maxSockets: number;
    timeout: number;
  };
}

export interface BangladeshConfig {
  timezone: string;
  currency: string;
  language: {
    default: string;
    supported: string[];
  };
  mobile: {
    optimization: boolean;
    networks: string[];
    compression: 'high' | 'medium' | 'low';
  };
  payments: {
    local: string[];
    international: string[];
  };
  shipping: {
    local: string[];
    international: string[];
  };
  compliance: {
    dataLocalization: boolean;
    digitalCommerceAct: boolean;
    bangladeshBank: boolean;
  };
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: {
    prometheus: {
      enabled: boolean;
      endpoint: string;
      labels: Record<string, string>;
    };
    custom: {
      requestDuration: boolean;
      requestCount: boolean;
      errorRate: boolean;
      serviceHealth: boolean;
    };
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'combined' | 'common';
    destination: 'console' | 'file' | 'elasticsearch';
    auditTrail: boolean;
  };
  alerts: {
    errorThreshold: number;
    latencyThreshold: number;
    healthCheckFailures: number;
    webhooks: string[];
  };
}

export interface RateLimitConfig {
  global: {
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  tiers: {
    anonymous: { requests: number; window: number; };
    registered: { requests: number; window: number; };
    vendor: { requests: number; window: number; };
    premium: { requests: number; window: number; };
    admin: { requests: number; window: number; };
  };
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: string;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  fallback: {
    enabled: boolean;
    response: any;
    cache: boolean;
  };
}

// Default configuration for different environments
export const getGatewayConfig = (environment: string = 'development'): GatewayConfig => {
  const baseConfig: GatewayConfig = {
    server: {
      port: parseInt(process.env.GATEWAY_PORT || '8080'),
      host: process.env.GATEWAY_HOST || '0.0.0.0',
      environment: environment as any,
      ssl: {
        enabled: environment === 'production',
        keyPath: process.env.SSL_KEY_PATH,
        certPath: process.env.SSL_CERT_PATH,
        autoTLS: true
      },
      cluster: {
        enabled: environment === 'production',
        workers: 'auto'
      },
      gracefulShutdown: {
        timeout: 30000,
        signals: ['SIGTERM', 'SIGINT']
      }
    },
    
    services: {
      discovery: {
        enabled: true,
        registry: 'database',
        healthCheckInterval: 30000,
        healthCheckTimeout: 5000
      },
      loadBalancing: {
        algorithm: 'round-robin',
        healthyThreshold: 2,
        unhealthyThreshold: 3,
        retryAttempts: 3,
        retryDelay: 1000
      },
      timeout: {
        connect: 5000,
        request: 30000,
        response: 30000
      }
    },

    security: {
      cors: {
        origin: environment === 'production' 
          ? ['https://getit.com.bd', 'https://admin.getit.com.bd', 'https://vendor.getit.com.bd']
          : true,
        credentials: true,
        optionsSuccessStatus: 200
      },
      headers: {
        xssProtection: true,
        noSniff: true,
        frameguard: 'deny',
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      },
      waf: {
        enabled: environment === 'production',
        rules: ['sql-injection', 'xss', 'lfi', 'rfi'],
        ipWhitelist: [],
        ipBlacklist: [],
        geoBlocking: {
          enabled: false,
          allowedCountries: ['BD', 'IN', 'US', 'GB'],
          blockedCountries: []
        }
      },
      authentication: {
        jwt: {
          secret: process.env.JWT_SECRET || 'getit-bangladesh-secret-key',
          algorithm: 'HS256',
          expiresIn: '24h',
          issuer: 'getit.com.bd',
          audience: 'getit-users'
        },
        oauth: {
          providers: {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID || '',
              clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
            },
            facebook: {
              clientId: process.env.FACEBOOK_CLIENT_ID || '',
              clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ''
            },
            github: {
              clientId: process.env.GITHUB_CLIENT_ID || '',
              clientSecret: process.env.GITHUB_CLIENT_SECRET || ''
            }
          }
        }
      }
    },

    performance: {
      compression: {
        enabled: true,
        level: 6,
        threshold: 1024,
        filter: ['text/*', 'application/json', 'application/javascript']
      },
      caching: {
        enabled: true,
        ttl: 300,
        maxSize: '100mb',
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          db: 1,
          keyPrefix: 'gateway:'
        }
      },
      connection: {
        keepAlive: true,
        maxSockets: 50,
        timeout: 5000
      }
    },

    bangladesh: {
      timezone: 'Asia/Dhaka',
      currency: 'BDT',
      language: {
        default: 'bn',
        supported: ['bn', 'en']
      },
      mobile: {
        optimization: true,
        networks: ['Grameenphone', 'Robi', 'Banglalink', 'Teletalk'],
        compression: 'high'
      },
      payments: {
        local: ['bkash', 'nagad', 'rocket', 'upay', 'mcash', 'cod'],
        international: ['visa', 'mastercard', 'paypal', 'stripe']
      },
      shipping: {
        local: ['pathao', 'paperfly', 'sundarban', 'redx', 'ecourier'],
        international: ['dhl', 'fedex', 'ups']
      },
      compliance: {
        dataLocalization: true,
        digitalCommerceAct: true,
        bangladeshBank: true
      }
    },

    monitoring: {
      enabled: true,
      metrics: {
        prometheus: {
          enabled: true,
          endpoint: '/metrics',
          labels: {
            service: 'api-gateway',
            version: '1.0.0',
            environment
          }
        },
        custom: {
          requestDuration: true,
          requestCount: true,
          errorRate: true,
          serviceHealth: true
        }
      },
      logging: {
        level: environment === 'production' ? 'info' : 'debug',
        format: 'json',
        destination: 'console',
        auditTrail: true
      },
      alerts: {
        errorThreshold: 5, // 5% error rate
        latencyThreshold: 2000, // 2 seconds
        healthCheckFailures: 3,
        webhooks: []
      }
    },

    rateLimit: {
      global: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000,
        standardHeaders: true,
        legacyHeaders: false
      },
      tiers: {
        anonymous: { requests: 100, window: 3600000 }, // 100/hour
        registered: { requests: 1000, window: 3600000 }, // 1000/hour
        vendor: { requests: 5000, window: 3600000 }, // 5000/hour
        premium: { requests: 10000, window: 3600000 }, // 10000/hour
        admin: { requests: 50000, window: 3600000 } // 50000/hour
      },
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: 'ip'
    },

    circuitBreaker: {
      enabled: true,
      failureThreshold: 50, // 50% failure rate
      recoveryTimeout: 30000, // 30 seconds
      monitoringPeriod: 60000, // 1 minute
      fallback: {
        enabled: true,
        response: { error: 'Service temporarily unavailable', code: 503 },
        cache: true
      }
    }
  };

  // Environment-specific overrides
  if (environment === 'production') {
    baseConfig.server.cluster.enabled = true;
    baseConfig.security.waf.enabled = true;
    baseConfig.monitoring.logging.level = 'info';
    baseConfig.performance.compression.level = 9;
  }

  if (environment === 'development') {
    baseConfig.monitoring.logging.level = 'debug';
    baseConfig.rateLimit.tiers.anonymous.requests = 1000;
    baseConfig.security.cors.origin = true;
  }

  return baseConfig;
};

// Export configurations for different environments
export const developmentConfig = getGatewayConfig('development');
export const stagingConfig = getGatewayConfig('staging');
export const productionConfig = getGatewayConfig('production');

export default getGatewayConfig;