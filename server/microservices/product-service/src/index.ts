/**
 * Product Service Main Entry Point
 * Amazon.com/Shopee.sg Level Enterprise Microservice
 */

import { Express, Request, Response, NextFunction } from 'express';
import { productRoutes } from './routes';
import { ProductServiceError, ApiResponse } from './types';

export class ProductServiceMicroservice {
  private serviceName = 'product-service';
  private version = '1.0.0';

  constructor() {
    console.log(`🚀 Initializing ${this.serviceName} v${this.version}`);
  }

  /**
   * Register product service routes and middleware
   */
  public registerRoutes(app: Express, basePath: string = '/api/v1/products'): void {
    try {
      // Register all product routes first
      app.use(basePath, productRoutes);
      
      // Add service-specific error handling middleware after routes
      app.use(basePath, this.errorHandler);

      console.log(`✅ ${this.serviceName} routes registered at ${basePath}`);
    } catch (error) {
      console.error(`❌ Failed to register ${this.serviceName} routes:`, error);
      throw error;
    }
  }

  /**
   * Service-specific error handling middleware
   */
  private errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
    // If response was already sent, delegate to Express default error handler
    if (res.headersSent) {
      return next(error);
    }

    console.error(`[${this.serviceName}] Error:`, {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Handle known service errors
    if (error instanceof ProductServiceError) {
      const response: ApiResponse = {
        success: false,
        message: error.message,
        errors: [error.message],
        meta: {
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: this.version
        }
      };

      return res.status(error.statusCode).json(response);
    }

    // Handle validation errors (Zod)
    if (error.name === 'ZodError') {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || ['Validation error'],
        meta: {
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: this.version
        }
      };

      return res.status(400).json(response);
    }

    // Handle database errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      const response: ApiResponse = {
        success: false,
        message: 'Database connection error',
        errors: ['Service temporarily unavailable'],
        meta: {
          timestamp: new Date(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
          version: this.version
        }
      };

      return res.status(503).json(response);
    }

    // Handle unexpected errors
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
      errors: [process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'],
      meta: {
        timestamp: new Date(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
        version: this.version
      }
    };

    res.status(500).json(response);
  };

  /**
   * Get service health and metadata
   */
  public getServiceInfo() {
    return {
      name: this.serviceName,
      version: this.version,
      status: 'running',
      endpoints: [
        'GET /health - Service health check',
        'GET / - Get all products with filtering',
        'GET /search - Search products',
        'GET /featured - Get featured products',
        'GET /category/:categoryId - Get products by category',
        'GET /vendor/:vendorId - Get products by vendor',
        'GET /:id - Get product by ID',
        'POST / - Create new product (auth required)',
        'PUT /:id - Update product (auth required)',
        'DELETE /:id - Delete product (admin only)'
      ],
      timestamp: new Date().toISOString()
    };
  }
}

// Export the microservice instance
export const productServiceMicroservice = new ProductServiceMicroservice();

// Export individual components for direct use if needed
export * from './types';
export * from './controllers/ProductController';
export * from './services/ProductService';
export * from './routes';
export * from './middleware/auth';
export * from './middleware/validation';
export * from './middleware/rateLimit';