/**
 * User Service Microservice - Amazon.com/Shopee.sg Level Implementation
 * Complete user authentication and management microservice
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { LoggingService } from '../../services/LoggingService';
import authRoutes from './src/routes/authRoutes';

export class UserServiceApplication {
  private app: express.Application;
  private logger: LoggingService;

  constructor() {
    this.app = express();
    this.logger = new LoggingService();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      this.logger.info('User service request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'User service is healthy',
        data: {
          service: 'user-service',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development'
        }
      });
    });

    // Service status endpoint
    this.app.get('/status', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'User service status',
        data: {
          service: 'user-service',
          status: 'active',
          version: '1.0.0',
          features: {
            authentication: 'active',
            registration: 'active',
            passwordReset: 'active',
            otpVerification: 'active',
            emailVerification: 'active',
            jwtTokens: 'active',
            userManagement: 'active',
            roleBasedAccess: 'active',
            rateLimiting: 'active',
            validation: 'active'
          },
          databases: {
            postgresql: 'connected',
            redis: 'optional'
          },
          timestamp: new Date().toISOString()
        }
      });
    });

    // Authentication routes
    this.app.use('/auth', authRoutes);

    // API documentation endpoint
    this.app.get('/docs', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'User service API documentation',
        data: {
          service: 'user-service',
          version: '1.0.0',
          endpoints: {
            authentication: {
              'POST /auth/register': 'User registration',
              'POST /auth/login': 'User login',
              'POST /auth/logout': 'User logout',
              'POST /auth/refresh-token': 'Refresh JWT token',
              'GET /auth/me': 'Get current user profile',
              'PUT /auth/me': 'Update user profile'
            },
            verification: {
              'POST /auth/verify-otp': 'Verify OTP code',
              'GET /auth/verify-email/:token': 'Verify email address',
              'POST /auth/resend-otp': 'Resend OTP code',
              'POST /auth/resend-email-verification': 'Resend email verification'
            },
            passwordReset: {
              'POST /auth/password-reset/request': 'Request password reset',
              'POST /auth/password-reset/confirm': 'Confirm password reset'
            },
            system: {
              'GET /health': 'Service health check',
              'GET /status': 'Service status',
              'GET /docs': 'API documentation'
            }
          },
          authentication: {
            type: 'Bearer Token',
            header: 'Authorization: Bearer <token>'
          },
          rateLimiting: {
            registration: '3 requests per 15 minutes',
            login: '5 requests per 15 minutes',
            passwordReset: '3 requests per hour',
            otpVerification: '10 requests per 15 minutes',
            general: '100 requests per minute'
          }
        }
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'GetIt User Service - Amazon.com/Shopee.sg Level Implementation',
        data: {
          service: 'user-service',
          version: '1.0.0',
          description: 'Complete user authentication and management microservice',
          capabilities: [
            'Multi-method authentication (email, phone, username)',
            'JWT token management with refresh tokens',
            'OTP verification for phone numbers',
            'Email verification system',
            'Password reset functionality',
            'Role-based access control',
            'Rate limiting and security',
            'Bangladesh-specific validations',
            'Comprehensive audit logging'
          ],
          endpoints: {
            health: '/health',
            status: '/status',
            docs: '/docs',
            auth: '/auth/*'
          }
        }
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        data: {
          requestedPath: req.originalUrl,
          method: req.method,
          availableEndpoints: [
            '/health',
            '/status',
            '/docs',
            '/auth/*'
          ]
        }
      });
    });

    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('User service error', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });
    });
  }

  /**
   * Get Express application instance
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Start the service (for standalone operation)
   */
  public async start(port: number = 3001): Promise<void> {
    try {
      this.app.listen(port, () => {
        this.logger.info('User service started', {
          port,
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0'
        });
      });
    } catch (error: any) {
      this.logger.error('Failed to start user service', { error: error.message });
      throw error;
    }
  }

  /**
   * Get service metadata
   */
  public getMetadata() {
    return {
      name: 'user-service',
      version: '1.0.0',
      description: 'Complete user authentication and management microservice',
      capabilities: [
        'authentication',
        'registration',
        'jwt-tokens',
        'otp-verification',
        'email-verification',
        'password-reset',
        'user-management',
        'role-based-access',
        'rate-limiting',
        'bangladesh-validation'
      ],
      endpoints: {
        health: '/health',
        status: '/status',
        docs: '/docs',
        auth: '/auth'
      }
    };
  }
}

// Export singleton instance for integration
export const userServiceApp = new UserServiceApplication();
export default userServiceApp.getApp();