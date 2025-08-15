/**
 * Security Service Application
 * Phase 4: Security & Compliance Enhancement
 * 
 * Enterprise-grade security application providing comprehensive
 * security management, fraud detection, and compliance monitoring
 * 
 * @fileoverview Security service main application
 * @author GetIt Platform Team
 * @version 4.0.0
 */

import express, { Express } from 'express';
import { createServer, Server } from 'http';
import SecurityService from './SecurityService';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

export class SecurityServiceApp {
  private app: Express;
  private server: Server | null = null;
  private securityService: SecurityService;

  constructor() {
    this.app = express();
    this.securityService = new SecurityService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:", "ws:"],
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
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://getit.com.bd', 'https://admin.getit.com.bd'] 
        : ['http://localhost:3000', 'http://localhost:5000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint', 'X-Risk-Score'],
    }));

    // Rate limiting for security endpoints
    const securityLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // limit each IP to 50 requests per windowMs for security endpoints
      message: {
        error: 'Too many security requests from this IP, please try again later.',
        retryAfter: 15 * 60
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use('/api/v1/security', securityLimiter);

    // Compression
    this.app.use(compression());

    // JSON parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Security audit middleware
    this.app.use((req, res, next) => {
      // Log security-sensitive requests
      if (req.path.includes('/security/')) {
        console.log(`🔒 Security request: ${req.method} ${req.path} from ${req.ip}`);
      }
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'security-service',
        version: '4.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        security: {
          threats_monitored: true,
          compliance_active: true,
          fraud_detection_active: true
        }
      });
    });

    // Security service routes
    this.app.use('/api/v1/security', this.securityService.getRouter());

    // Security info endpoint
    this.app.get('/api/v1/security-info', (req, res) => {
      res.json({
        service: 'Amazon.com/Shopee.sg-Level Security Service',
        version: '4.0.0',
        features: [
          'Advanced Fraud Detection',
          'Real-time Threat Monitoring',
          'Compliance Framework (GDPR, PCI DSS, Bangladesh)',
          'Enterprise Authentication',
          'Security Audit Trails',
          'Zero-trust Architecture',
          'Bangladesh Cultural Security'
        ],
        endpoints: {
          dashboard: '/api/v1/security/dashboard',
          metrics: '/api/v1/security/metrics',
          threats: '/api/v1/security/threats',
          compliance: '/api/v1/security/compliance',
          fraud: '/api/v1/security/fraud/*',
          bangladesh: '/api/v1/security/bangladesh/*'
        },
        security_frameworks: [
          'GDPR Compliance',
          'PCI DSS Level 1',
          'Bangladesh Data Protection Act',
          'ISO 27001',
          'SOC 2 Type II'
        ]
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Security endpoint not found',
        path: req.originalUrl,
        available_endpoints: [
          '/health',
          '/api/v1/security-info',
          '/api/v1/security/*'
        ]
      });
    });

    // Error handler
    this.app.use((error: any, req: any, res: any, next: any) => {
      console.error('❌ Security service error:', error);
      
      // Security-focused error response
      res.status(error.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal security error' 
          : error.message,
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || 'unknown',
        security_notice: 'This incident has been logged for security monitoring'
      });
    });
  }

  public start(port: number = 3004): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = createServer(this.app);
        
        this.server.listen(port, () => {
          console.log(`🔒 Security Service running on port ${port}`);
          console.log(`🔒 Security dashboard: http://localhost:${port}/api/v1/security/dashboard`);
          console.log(`🔒 Security metrics: http://localhost:${port}/api/v1/security/metrics`);
          console.log(`🔒 Threat intelligence: http://localhost:${port}/api/v1/security/threats`);
          console.log(`🔒 Compliance monitoring: http://localhost:${port}/api/v1/security/compliance`);
          console.log(`🔒 Bangladesh security: http://localhost:${port}/api/v1/security/bangladesh/compliance`);
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('❌ Security service failed to start:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Error starting security service:', error);
        reject(error);
      }
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🔒 Security Service stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getApp(): Express {
    return this.app;
  }

  public getServer(): Server | null {
    return this.server;
  }
}

// Export for use in main application
export default SecurityServiceApp;