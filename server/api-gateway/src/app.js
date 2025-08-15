const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import middleware
const authMiddleware = require('./middleware/auth-middleware');
const rateLimiter = require('./middleware/rate-limiter');
const requestLogger = require('./middleware/request-logger');
const errorHandler = require('./middleware/error-handler');
const corsHandler = require('./middleware/cors-handler');
const securityHeaders = require('./middleware/security-headers');
const requestValidator = require('./middleware/request-validator');
const responseFormatter = require('./middleware/response-formatter');
const loadBalancer = require('./middleware/load-balancer');
const circuitBreaker = require('./middleware/circuit-breaker');

// Import routes
const healthCheck = require('./routes/health-check');
const apiRoutes = require('./routes/api-routes');
const adminRoutes = require('./routes/admin-routes');
const vendorRoutes = require('./routes/vendor-routes');
const customerRoutes = require('./routes/customer-routes');
const mobileApiRoutes = require('./routes/mobile-api-routes');
const webhookRoutes = require('./routes/webhook-routes');
const publicApiRoutes = require('./routes/public-api-routes');

// Import services
const serviceDiscovery = require('./services/service-discovery');
const healthMonitor = require('./services/health-monitor');
const metricsCollector = require('./services/metrics-collector');
const cacheService = require('./services/cache-service');
const authService = require('./services/auth-service');

// Import utilities
const logger = require('./utils/logger');
const responseBuilder = require('./utils/response-builder');
const bangladeshUtils = require('./utils/bangladesh-utils');

// Import configuration
const config = require('./config/environment');
const redisConfig = require('./config/redis');

class ApiGateway {
  constructor() {
    this.app = express();
    this.services = new Map();
    this.isShuttingDown = false;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeServices();
    this.initializeErrorHandling();
  }

  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          fontSrc: ["'self'", "fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration for Bangladesh market
    this.app.use(corsHandler);

    // Compression
    this.app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    }));

    // Request parsing
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));

    // Custom middleware stack
    this.app.use(requestLogger);
    this.app.use(securityHeaders);
    this.app.use(rateLimiter);
    this.app.use(requestValidator);
    this.app.use(circuitBreaker);
    this.app.use(loadBalancer);

    // Authentication middleware (applied selectively)
    this.app.use('/api/v1/admin', authMiddleware.requireAdmin);
    this.app.use('/api/v1/vendor', authMiddleware.requireVendor);
    this.app.use('/api/v1/user', authMiddleware.requireAuth);

    // Response formatting
    this.app.use(responseFormatter);
  }

  initializeRoutes() {
    // Health check (highest priority)
    this.app.use('/health', healthCheck);
    this.app.use('/api/health', healthCheck);

    // Public routes (no authentication required)
    this.app.use('/api/v1/public', publicApiRoutes);
    this.app.use('/api/v1/webhooks', webhookRoutes);

    // Customer-facing routes
    this.app.use('/api/v1/customer', customerRoutes);
    
    // Mobile API routes
    this.app.use('/api/v1/mobile', mobileApiRoutes);

    // Vendor routes
    this.app.use('/api/v1/vendor', vendorRoutes);

    // Admin routes
    this.app.use('/api/v1/admin', adminRoutes);

    // Core API routes (catch-all for microservices)
    this.app.use('/api/v1', apiRoutes);

    // API documentation routes
    this.app.get('/api/docs', (req, res) => {
      res.json({
        title: 'GetIt Bangladesh API Gateway',
        version: '1.0.0',
        description: 'API Gateway for GetIt Multi-Vendor Ecommerce Platform',
        endpoints: {
          health: '/health',
          public: '/api/v1/public',
          customer: '/api/v1/customer',
          vendor: '/api/v1/vendor',
          admin: '/api/v1/admin',
          mobile: '/api/v1/mobile',
          webhooks: '/api/v1/webhooks'
        },
        bangladesh_features: {
          payment_gateways: ['bkash', 'nagad', 'rocket', 'cod'],
          courier_services: ['pathao', 'paperfly', 'sundarban', 'redx', 'ecourier'],
          languages: ['bengali', 'english'],
          currency: 'BDT',
          timezone: 'Asia/Dhaka'
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json(responseBuilder.error(
        'Resource not found',
        'RESOURCE_NOT_FOUND',
        404
      ));
    });
  }

  initializeServices() {
    // Initialize service discovery
    serviceDiscovery.initialize({
      consulUrl: config.consul?.url || 'http://localhost:8500',
      serviceName: 'api-gateway',
      servicePort: config.port,
      healthCheckUrl: '/health'
    });

    // Initialize health monitoring
    healthMonitor.initialize();

    // Initialize metrics collection
    metricsCollector.initialize();

    // Initialize cache service
    cacheService.initialize(redisConfig);

    // Initialize authentication service
    authService.initialize();

    logger.info('🚀 API Gateway services initialized', {
      services: [
        'service-discovery',
        'health-monitor',
        'metrics-collector',
        'cache-service',
        'auth-service'
      ]
    });
  }

  initializeErrorHandling() {
    // Global error handler (must be last)
    this.app.use(errorHandler);

    // Graceful shutdown handling
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  }

  async gracefulShutdown(signal) {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`🛑 Graceful shutdown initiated (${signal})`);

    try {
      // Stop accepting new requests
      if (this.server) {
        this.server.close();
      }

      // Deregister from service discovery
      await serviceDiscovery.deregister();

      // Close database connections
      // await database.close();

      // Close Redis connections
      await cacheService.close();

      // Close other resources
      await healthMonitor.close();
      await metricsCollector.close();

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  async start(port = 3000) {
    try {
      this.server = this.app.listen(port, '0.0.0.0', () => {
        logger.info(`🚀 API Gateway started successfully`, {
          port,
          environment: config.environment,
          features: {
            bangladesh_market: true,
            payment_gateways: ['bkash', 'nagad', 'rocket'],
            courier_services: ['pathao', 'paperfly', 'sundarban', 'redx', 'ecourier'],
            security: ['jwt', 'rate_limiting', 'cors', 'helmet'],
            monitoring: ['prometheus', 'health_checks', 'metrics'],
            caching: ['redis'],
            load_balancing: true,
            circuit_breaker: true
          }
        });
      });

      // Register with service discovery
      await serviceDiscovery.register();

      return this.server;
    } catch (error) {
      logger.error('❌ Failed to start API Gateway:', error);
      throw error;
    }
  }

  getApp() {
    return this.app;
  }
}

module.exports = ApiGateway;