/**
 * Product Service Authentication Middleware
 * Enterprise-level authentication and authorization
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        vendorId?: string;
      };
    }
  }
}

/**
 * Authenticate JWT token from request headers
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    // For now, we'll use a default secret - should be from environment
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    jwt.verify(token, secret, (err: any, user: any) => {
      if (err) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize specific roles for the request
 */
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can access/modify specific vendor's products
 */
export const checkVendorAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admin can access any vendor's products
    if (req.user.role === 'admin') {
      return next();
    }

    // Vendors can only access their own products
    if (req.user.role === 'vendor') {
      const { vendorId } = req.query;
      
      if (vendorId && vendorId !== req.user.vendorId) {
        throw new ForbiddenError('Access denied. You can only access your own products');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - sets user if token is present but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      
      jwt.verify(token, secret, (err: any, user: any) => {
        if (!err && user) {
          req.user = user;
        }
        // Continue regardless of token validity for optional auth
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    // For optional auth, we don't throw errors, just continue
    next();
  }
};