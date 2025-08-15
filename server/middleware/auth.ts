import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

interface JWTPayload {
  userId: number;
  username: string;
  email: string | null;
  role: 'customer' | 'vendor' | 'admin' | 'moderator';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret',
      {
        issuer: 'getit-bangladesh',
        audience: 'getit-users'
      }
    ) as JWTPayload;

    // Check if session is still active (if session management is implemented)
    if ('isSessionActive' in storage && typeof storage.isSessionActive === 'function') {
      const isActive = await (storage as any).isSessionActive(token);
      if (!isActive) {
        return res.status(401).json({ error: 'Session expired or invalid' });
      }
    }

    // Check if user still exists and is active
    const user = await storage.getUser(decoded.userId.toString());
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account not found or deactivated' });
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['admin']);

// Vendor or Admin middleware
export const requireVendorOrAdmin = requireRole(['vendor', 'admin']);

// Customer, Vendor, or Admin middleware (any authenticated user)
export const requireAuthenticated = requireRole(['customer', 'vendor', 'admin', 'moderator']);

// Optional authentication (attach user if token is valid, but don't require it)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret',
      {
        issuer: 'getit-bangladesh',
        audience: 'getit-users'
      }
    ) as JWTPayload;

    // Check if user still exists and is active
    const user = await storage.getUser(decoded.userId.toString());
    if (user && user.isActive) {
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};

// Check if user owns resource or is admin
export const requireOwnershipOrAdmin = (getUserIdFromParams: (req: Request) => number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const userId = req.user.userId;
    const resourceUserId = getUserIdFromParams(req);

    // Admin can access any resource
    if (userRole === 'admin') {
      return next();
    }

    // User can only access their own resources
    if (userId === resourceUserId) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied' });
  };
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = async (req: Request, res: Response, next: NextFunction) => {
  // This could be enhanced with Redis-based rate limiting
  // For now, we'll implement a simple in-memory rate limiter
  
  const key = `${req.ip}-${req.path}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // In production, this should use Redis or a proper rate limiting service
  // For now, we'll just log and continue
  console.log(`Rate limit check for ${key} at ${new Date(now).toISOString()}`);
  
  next();
};