const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

// Import utilities
const logger = require('../utils/logger');
const responseBuilder = require('../utils/response-builder');
const serviceDiscovery = require('../services/service-discovery');

// Microservice configurations
const MICROSERVICES = {
  'users': {
    target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    pathPrefix: '/users',
    timeout: 30000,
    retries: 3
  },
  'products': {
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
    pathPrefix: '/products',
    timeout: 30000,
    retries: 3
  },
  'orders': {
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
    pathPrefix: '/orders',
    timeout: 30000,
    retries: 3
  },
  'payments': {
    target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
    pathPrefix: '/payments',
    timeout: 30000,
    retries: 3
  },
  'notifications': {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    pathPrefix: '/notifications',
    timeout: 30000,
    retries: 3
  },
  'analytics': {
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006',
    pathPrefix: '/analytics',
    timeout: 30000,
    retries: 3
  },
  'vendors': {
    target: process.env.VENDOR_SERVICE_URL || 'http://localhost:3007',
    pathPrefix: '/vendors',
    timeout: 30000,
    retries: 3
  },
  'shipping': {
    target: process.env.SHIPPING_SERVICE_URL || 'http://localhost:3008',
    pathPrefix: '/shipping',
    timeout: 30000,
    retries: 3
  },
  'ml': {
    target: process.env.ML_SERVICE_URL || 'http://localhost:3009',
    pathPrefix: '/ml',
    timeout: 30000,
    retries: 3
  },
  'finance': {
    target: process.env.FINANCE_SERVICE_URL || 'http://localhost:3010',
    pathPrefix: '/finance',
    timeout: 30000,
    retries: 3
  },
  'kyc': {
    target: process.env.KYC_SERVICE_URL || 'http://localhost:3011',
    pathPrefix: '/kyc',
    timeout: 30000,
    retries: 3
  }
};

// Common proxy options
const createProxyOptions = (service) => ({
  target: service.target,
  changeOrigin: true,
  timeout: service.timeout,
  retries: service.retries,
  
  // Path rewriting
  pathRewrite: {
    [`^/api/v1${service.pathPrefix}`]: ''
  },
  
  // Request transformation
  onProxyReq: (proxyReq, req, res) => {
    // Add correlation ID for distributed tracing
    if (!proxyReq.getHeader('x-correlation-id')) {
      proxyReq.setHeader('x-correlation-id', req.correlationId || generateCorrelationId());
    }
    
    // Add source gateway information
    proxyReq.setHeader('x-gateway-source', 'api-gateway');
    proxyReq.setHeader('x-forwarded-host', req.get('host'));
    
    // Bangladesh-specific headers
    proxyReq.setHeader('x-country', 'BD');
    proxyReq.setHeader('x-timezone', 'Asia/Dhaka');
    proxyReq.setHeader('x-currency', 'BDT');
    
    // Forward user context
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.id);
      proxyReq.setHeader('x-user-role', req.user.role);
      proxyReq.setHeader('x-user-type', req.user.userType || 'customer');
    }
    
    logger.debug('Proxying request', {
      service: service.pathPrefix,
      method: req.method,
      path: req.path,
      target: service.target,
      correlationId: req.correlationId
    });
  },
  
  // Response transformation
  onProxyRes: (proxyRes, req, res) => {
    // Add gateway headers to response
    proxyRes.headers['x-gateway'] = 'api-gateway';
    proxyRes.headers['x-service'] = service.pathPrefix.replace('/', '');
    
    // Security headers
    proxyRes.headers['x-frame-options'] = 'DENY';
    proxyRes.headers['x-content-type-options'] = 'nosniff';
    
    logger.debug('Received response from service', {
      service: service.pathPrefix,
      statusCode: proxyRes.statusCode,
      correlationId: req.correlationId
    });
  },
  
  // Error handling
  onError: (err, req, res) => {
    logger.error('Proxy error', {
      service: service.pathPrefix,
      error: err.message,
      code: err.code,
      correlationId: req.correlationId
    });
    
    // Return standardized error response
    if (!res.headersSent) {
      res.status(503).json(responseBuilder.error(
        'Service temporarily unavailable',
        'SERVICE_UNAVAILABLE',
        503,
        {
          service: service.pathPrefix.replace('/', ''),
          correlationId: req.correlationId
        }
      ));
    }
  }
});

// Generate correlation ID for distributed tracing
const generateCorrelationId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Middleware to add correlation ID
router.use((req, res, next) => {
  req.correlationId = req.get('x-correlation-id') || generateCorrelationId();
  res.set('x-correlation-id', req.correlationId);
  next();
});

// Create proxy routes for each microservice
Object.entries(MICROSERVICES).forEach(([serviceName, serviceConfig]) => {
  const proxyOptions = createProxyOptions(serviceConfig);
  const proxy = createProxyMiddleware(proxyOptions);
  
  router.use(serviceConfig.pathPrefix, proxy);
  
  logger.info(`✅ Proxy route registered: /api/v1${serviceConfig.pathPrefix} -> ${serviceConfig.target}`);
});

// Service discovery integration
router.get('/services', async (req, res) => {
  try {
    const services = await serviceDiscovery.getAllServices();
    
    res.json(responseBuilder.success({
      services: services.map(service => ({
        name: service.name,
        address: service.address,
        port: service.port,
        health: service.health,
        lastUpdated: service.lastUpdated
      })),
      gateway: {
        registered_routes: Object.keys(MICROSERVICES),
        total_services: services.length
      }
    }));
  } catch (error) {
    logger.error('Failed to fetch services', { error: error.message });
    res.status(500).json(responseBuilder.error(
      'Failed to fetch services',
      'SERVICE_DISCOVERY_ERROR',
      500
    ));
  }
});

// Service health check endpoint
router.get('/services/:serviceName/health', async (req, res) => {
  const { serviceName } = req.params;
  
  try {
    const service = MICROSERVICES[serviceName];
    if (!service) {
      return res.status(404).json(responseBuilder.error(
        'Service not found',
        'SERVICE_NOT_FOUND',
        404
      ));
    }
    
    // Perform health check on the service
    const healthCheck = await serviceDiscovery.checkServiceHealth(serviceName);
    
    res.json(responseBuilder.success({
      service: serviceName,
      health: healthCheck,
      target: service.target,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Service health check failed', { 
      service: serviceName, 
      error: error.message 
    });
    
    res.status(503).json(responseBuilder.error(
      'Service health check failed',
      'HEALTH_CHECK_FAILED',
      503
    ));
  }
});

// Bangladesh-specific API endpoints
router.get('/bangladesh/config', (req, res) => {
  res.json(responseBuilder.success({
    country: 'BD',
    timezone: 'Asia/Dhaka',
    currency: 'BDT',
    languages: ['bn', 'en'],
    payment_gateways: [
      { id: 'bkash', name: 'bKash', enabled: true },
      { id: 'nagad', name: 'Nagad', enabled: true },
      { id: 'rocket', name: 'Rocket', enabled: true },
      { id: 'cod', name: 'Cash on Delivery', enabled: true }
    ],
    courier_services: [
      { id: 'pathao', name: 'Pathao', enabled: true },
      { id: 'paperfly', name: 'Paperfly', enabled: true },
      { id: 'sundarban', name: 'Sundarban Courier', enabled: true },
      { id: 'redx', name: 'RedX', enabled: true },
      { id: 'ecourier', name: 'eCourier', enabled: true }
    ],
    divisions: [
      'Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 
      'Rajshahi', 'Barisal', 'Rangpur', 'Mymensingh'
    ]
  }));
});

// API status and information
router.get('/status', (req, res) => {
  res.json(responseBuilder.success({
    gateway: 'api-gateway',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    bangladesh_features: {
      payment_gateways: Object.keys(MICROSERVICES).includes('payments'),
      courier_services: Object.keys(MICROSERVICES).includes('shipping'),
      ml_capabilities: Object.keys(MICROSERVICES).includes('ml'),
      analytics: Object.keys(MICROSERVICES).includes('analytics'),
      kyc_verification: Object.keys(MICROSERVICES).includes('kyc')
    },
    registered_services: Object.keys(MICROSERVICES),
    correlation_id: req.correlationId
  }));
});

module.exports = router;