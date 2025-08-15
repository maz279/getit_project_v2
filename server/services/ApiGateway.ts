import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

interface ServiceRoute {
  path: string;
  target: string;
  auth?: boolean;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  timeout?: number;
}

interface ApiGatewayConfig {
  services: {
    [serviceName: string]: ServiceRoute;
  };
  defaultTimeout: number;
  authentication: {
    secret: string;
    algorithms: string[];
  };
}

/**
 * API Gateway for microservices architecture
 * Provides routing, authentication, rate limiting, and load balancing
 */
export class ApiGateway {
  private app: express.Application;
  private config: ApiGatewayConfig;

  constructor(config: ApiGatewayConfig) {
    this.app = express();
    this.config = config;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // Global middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: this.getServiceHealth()
      });
    });

    // Service discovery endpoint
    this.app.get('/api/discovery', (req, res) => {
      res.json({
        services: Object.keys(this.config.services),
        routes: this.config.services
      });
    });

    // Setup service routes
    Object.entries(this.config.services).forEach(([serviceName, route]) => {
      this.setupServiceRoute(serviceName, route);
    });
  }

  private setupServiceRoute(serviceName: string, route: ServiceRoute) {
    const routePath = `/api/${serviceName}`;

    // Apply rate limiting if configured
    if (route.rateLimit) {
      const limiter = rateLimit({
        windowMs: route.rateLimit.windowMs,
        max: route.rateLimit.max,
        message: {
          error: 'Too many requests',
          service: serviceName,
          retryAfter: route.rateLimit.windowMs / 1000
        }
      });
      this.app.use(routePath, limiter);
    }

    // Apply authentication if required
    if (route.auth) {
      this.app.use(routePath, this.authenticationMiddleware.bind(this));
    }

    // Create proxy middleware for the service
    const proxyMiddleware = createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      pathRewrite: {
        [`^/api/${serviceName}`]: route.path
      },
      timeout: route.timeout || this.config.defaultTimeout,
      onError: (err, req, res) => {
        console.error(`Proxy error for ${serviceName}:`, err.message);
        res.status(502).json({
          error: 'Service temporarily unavailable',
          service: serviceName,
          timestamp: new Date().toISOString()
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add service identification headers
        proxyReq.setHeader('X-Service-Gateway', 'GetIt-API-Gateway');
        proxyReq.setHeader('X-Request-ID', this.generateRequestId());
        proxyReq.setHeader('X-Forwarded-For', req.ip);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add response headers
        proxyRes.headers['X-Service-Name'] = serviceName;
        proxyRes.headers['X-Response-Time'] = Date.now().toString();
      }
    });

    this.app.use(routePath, proxyMiddleware);
  }

  private authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, this.config.authentication.secret, {
        algorithms: this.config.authentication.algorithms as jwt.Algorithm[]
      });

      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication failed'
      });
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getServiceHealth() {
    // In production, this would check actual service health
    return Object.keys(this.config.services).reduce((health, serviceName) => {
      health[serviceName] = {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 100) + 50 // Mock response time
      };
      return health;
    }, {} as Record<string, any>);
  }

  public getApp(): express.Application {
    return this.app;
  }

  public addService(name: string, route: ServiceRoute) {
    this.config.services[name] = route;
    this.setupServiceRoute(name, route);
  }

  public removeService(name: string) {
    delete this.config.services[name];
    // Note: In production, you'd need to properly remove the route
  }

  public updateServiceRoute(name: string, route: Partial<ServiceRoute>) {
    if (this.config.services[name]) {
      this.config.services[name] = { ...this.config.services[name], ...route };
      this.setupServiceRoute(name, this.config.services[name]);
    }
  }
}

// Default configuration for GetIt microservices
export const defaultGatewayConfig: ApiGatewayConfig = {
  services: {
    // User Management Service
    'users': {
      path: '/',
      target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      auth: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000 // limit each IP to 1000 requests per windowMs
      },
      timeout: 5000
    },
    
    // Product Catalog Service
    'products': {
      path: '/',
      target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
      auth: false,
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 2000
      },
      timeout: 5000
    },
    
    // Order Management Service
    'orders': {
      path: '/',
      target: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
      auth: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 500
      },
      timeout: 10000
    },
    
    // Payment Service
    'payments': {
      path: '/',
      target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
      auth: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 200
      },
      timeout: 15000
    },
    
    // Notification Service
    'notifications': {
      path: '/',
      target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
      auth: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 300
      },
      timeout: 5000
    },
    
    // Analytics Service
    'analytics': {
      path: '/',
      target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006',
      auth: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 1000
      },
      timeout: 10000
    },
    
    // Search Service
    'search': {
      path: '/',
      target: process.env.SEARCH_SERVICE_URL || 'http://localhost:3007',
      auth: false,
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 5000
      },
      timeout: 3000
    }
  },
  defaultTimeout: 5000,
  authentication: {
    secret: process.env.JWT_SECRET || 'getit-default-secret-change-in-production',
    algorithms: ['HS256']
  }
};

// Service registry for dynamic service discovery
export class ServiceRegistry {
  private services: Map<string, {
    url: string;
    health: 'healthy' | 'unhealthy';
    lastHeartbeat: Date;
    metadata: any;
  }> = new Map();

  register(serviceName: string, url: string, metadata: any = {}) {
    this.services.set(serviceName, {
      url,
      health: 'healthy',
      lastHeartbeat: new Date(),
      metadata
    });
  }

  unregister(serviceName: string) {
    this.services.delete(serviceName);
  }

  getService(serviceName: string) {
    return this.services.get(serviceName);
  }

  getAllServices() {
    return Array.from(this.services.entries()).map(([name, service]) => ({
      name,
      ...service
    }));
  }

  updateHeartbeat(serviceName: string) {
    const service = this.services.get(serviceName);
    if (service) {
      service.lastHeartbeat = new Date();
      service.health = 'healthy';
    }
  }

  checkHealth() {
    const now = new Date();
    const healthTimeout = 30000; // 30 seconds

    this.services.forEach((service, name) => {
      const timeSinceHeartbeat = now.getTime() - service.lastHeartbeat.getTime();
      if (timeSinceHeartbeat > healthTimeout) {
        service.health = 'unhealthy';
      }
    });
  }
}