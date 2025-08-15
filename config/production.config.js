// Production Configuration for DeepSeek AI Service
// Phase 1: Production Environment Setup

module.exports = {
  // Environment Configuration
  environment: {
    NODE_ENV: 'production',
    LOG_LEVEL: 'info',
    PORT: process.env.PORT || 5000,
    
    // DeepSeek AI Service Configuration
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_API_TIMEOUT: 8000,
    DEEPSEEK_MAX_RETRIES: 3,
    
    // Rate Limiting Configuration
    RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
    RATE_LIMIT_MAX_REQUESTS: 8, // 8 requests per minute
    RATE_LIMIT_QUEUE_SIZE: 3, // Max 3 queued requests
    
    // Caching Configuration  
    CACHE_TTL_MS: 300000, // 5 minutes
    CACHE_CLEANUP_INTERVAL_MS: 60000, // 1 minute
    
    // Monitoring Configuration
    HEALTH_CHECK_INTERVAL_MS: 30000, // 30 seconds
    PERFORMANCE_MONITORING_ENABLED: true,
    ERROR_TRACKING_ENABLED: true,
  },
  
  // Production Build Settings
  build: {
    optimization: true,
    minification: true,
    sourceMaps: false,
    bundleAnalysis: true,
  },
  
  // Security Configuration
  security: {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    },
  },
  
  // Database Configuration
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
    maxConnections: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  // Monitoring and Logging
  monitoring: {
    healthCheck: {
      path: '/health',
      interval: 30000,
      timeout: 5000,
    },
    metrics: {
      enabled: true,
      path: '/metrics',
      collectDefaultMetrics: true,
    },
    logging: {
      level: 'info',
      format: 'json',
      transports: ['console', 'file'],
      errorFile: 'logs/error.log',
      combinedFile: 'logs/combined.log',
    },
  },
  
  // Performance Settings
  performance: {
    clustering: {
      enabled: true,
      workers: process.env.WEB_CONCURRENCY || require('os').cpus().length,
    },
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024,
    },
    caching: {
      enabled: true,
      defaultTTL: 300, // 5 minutes
      maxMemory: '100mb',
    },
  },
  
  // API Configuration
  api: {
    version: 'v1',
    prefix: '/api',
    timeout: 30000,
    maxRequestSize: '10mb',
    requestLogging: true,
  },
  
  // Deployment Settings
  deployment: {
    gracefulShutdownTimeout: 30000,
    keepAliveTimeout: 65000,
    headersTimeout: 66000,
    maxHeadersCount: 2000,
  },
};