import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redisService } from '../../../../services/RedisService';

/**
 * Authentication Middleware
 * Amazon.com/Shopee.sg-level authentication with JWT and session management
 */

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify JWT token
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'getit-bangladesh-secret-key');
      
      // Check if session exists in Redis
      try {
        const sessionData = await redisService.getCachedUserSession(token);
        if (sessionData) {
          req.user = sessionData;
        } else {
          req.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            email: decoded.email
          };
        }
      } catch (redisError) {
        // Redis is down, use decoded token data
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
          email: decoded.email
        };
      }

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication token is invalid or expired'
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please authenticate to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['admin']);

// Vendor or Admin middleware
export const requireVendorOrAdmin = requireRole(['vendor', 'admin']);