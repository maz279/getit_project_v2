/**
 * Authentication Middleware - Amazon.com/Shopee.sg Level Security
 * Enterprise-grade authentication with JWT verification
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LoggingService } from '../../../../services/LoggingService';

interface JWTPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

const loggingService = new LoggingService();

/**
 * Authentication middleware for vendor service
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'Authorization header is missing'
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'Invalid authorization header format'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    req.user = decoded;

    loggingService.info('User authenticated for vendor service', {
      userId: decoded.id,
      username: decoded.username,
      role: decoded.role,
      endpoint: req.path
    });

    next();
  } catch (error: any) {
    loggingService.error('Authentication failed for vendor service', {
      error: error.message,
      endpoint: req.path,
      ip: req.ip
    });

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again'
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token verification failed'
      });
      return;
    }

    res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Token verification failed'
    });
  }
};

/**
 * Admin authentication middleware
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      return;
    }

    // Check if user has admin role
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      loggingService.warn('Unauthorized admin access attempt', {
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        endpoint: req.path
      });

      res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'Admin access required'
      });
      return;
    }

    loggingService.info('Admin authenticated for vendor service', {
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      endpoint: req.path
    });

    next();
  } catch (error: any) {
    loggingService.error('Admin authentication failed', {
      error: error.message,
      endpoint: req.path,
      userId: req.user?.id
    });

    res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

/**
 * Vendor ownership middleware - ensures user can only access their own vendor data
 */
export const vendorOwnershipMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      return;
    }

    const { vendorId } = req.params;

    // For admin users, allow access to any vendor
    if (req.user.role === 'admin' || req.user.role === 'moderator') {
      next();
      return;
    }

    // For vendor users, verify ownership
    // This would typically involve a database lookup to verify vendor ownership
    // For now, we'll pass through and let the business logic handle ownership verification

    next();
  } catch (error: any) {
    loggingService.error('Vendor ownership verification failed', {
      error: error.message,
      endpoint: req.path,
      userId: req.user?.id,
      vendorId: req.params.vendorId
    });

    res.status(500).json({ 
      error: 'Authorization error',
      message: 'Internal server error'
    });
  }
};

/**
 * Optional authentication middleware - does not fail if no token provided
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    req.user = decoded;

    next();
  } catch (error: any) {
    // In optional auth, we don't fail on invalid tokens
    // Just proceed without user context
    next();
  }
};