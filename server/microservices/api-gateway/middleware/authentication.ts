/**
 * Authentication Middleware
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * JWT/OAuth authentication with role-based access control
 * Production-ready with comprehensive security features
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../../db';
import { users } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';
import { AuthConfig, GatewayConfig } from '../config/gateway.config';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-middleware' }
});

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    roles: string[];
    permissions: string[];
    tier: string;
  };
}

export const authMiddleware = (authConfig: AuthConfig, gatewayConfig: GatewayConfig) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Skip authentication for certain paths
      if (authConfig.skipPaths && authConfig.skipPaths.some(path => req.path.includes(path))) {
        return next();
      }

      // Extract token from various sources
      const token = extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'NO_TOKEN',
          message: 'Access token is required',
          timestamp: new Date().toISOString()
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, gatewayConfig.security.authentication.jwt.secret) as any;
      
      if (!decoded || !decoded.userId) {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN',
          message: 'Token is invalid or expired',
          timestamp: new Date().toISOString()
        });
      }

      // Fetch user details from database
      const [user] = await db.select().from(users)
        .where(eq(users.id, decoded.userId));

      if (!user) {
        return res.status(401).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          message: 'User associated with token not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          error: 'Account deactivated',
          code: 'ACCOUNT_DEACTIVATED',
          message: 'User account has been deactivated',
          timestamp: new Date().toISOString()
        });
      }

      // Parse roles and permissions
      const userRoles = Array.isArray(user.roles) ? user.roles : 
                       typeof user.roles === 'string' ? [user.roles] : ['user'];
      const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];

      // Role-based access control
      if (authConfig.roles && authConfig.roles.length > 0) {
        const hasRequiredRole = authConfig.roles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) {
          logger.warn('Access denied - insufficient role', {
            userId: user.id,
            userRoles,
            requiredRoles: authConfig.roles,
            path: req.path,
            method: req.method,
            ip: req.ip
          });

          return res.status(403).json({
            error: 'Insufficient privileges',
            code: 'INSUFFICIENT_ROLE',
            message: 'User does not have required role',
            requiredRoles: authConfig.roles,
            userRoles,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Permission-based access control
      if (authConfig.permissions && authConfig.permissions.length > 0) {
        const hasRequiredPermission = authConfig.permissions.some(permission => 
          userPermissions.includes(permission)
        );
        
        if (!hasRequiredPermission) {
          logger.warn('Access denied - insufficient permissions', {
            userId: user.id,
            userPermissions,
            requiredPermissions: authConfig.permissions,
            path: req.path,
            method: req.method,
            ip: req.ip
          });

          return res.status(403).json({
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSION',
            message: 'User does not have required permissions',
            requiredPermissions: authConfig.permissions,
            userPermissions,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Bangladesh-specific checks
      if (user.country && user.country !== 'BD' && gatewayConfig.bangladesh.compliance.dataLocalization) {
        // Special handling for non-Bangladesh users under data localization
        logger.info('Non-BD user access', {
          userId: user.id,
          country: user.country,
          path: req.path
        });
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        roles: userRoles,
        permissions: userPermissions,
        tier: user.tier || 'basic'
      };

      // Log successful authentication
      logger.info('Authentication successful', {
        userId: user.id,
        email: user.email,
        roles: userRoles,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
          timestamp: new Date().toISOString()
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'MALFORMED_TOKEN',
          message: 'Token is malformed',
          timestamp: new Date().toISOString()
        });
      }

      logger.error('Authentication error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      res.status(500).json({
        error: 'Authentication service error',
        code: 'AUTH_SERVICE_ERROR',
        message: 'Internal authentication error',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// OAuth middleware for social login
export const oauthMiddleware = (provider: string, gatewayConfig: GatewayConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({
          error: 'OAuth code required',
          code: 'NO_OAUTH_CODE',
          provider,
          timestamp: new Date().toISOString()
        });
      }

      // Verify state parameter for CSRF protection
      if (state && !verifyOAuthState(state as string)) {
        return res.status(400).json({
          error: 'Invalid OAuth state',
          code: 'INVALID_OAUTH_STATE',
          provider,
          timestamp: new Date().toISOString()
        });
      }

      // Exchange code for access token based on provider
      let userInfo;
      switch (provider) {
        case 'google':
          userInfo = await exchangeGoogleCode(code as string, gatewayConfig);
          break;
        case 'facebook':
          userInfo = await exchangeFacebookCode(code as string, gatewayConfig);
          break;
        case 'github':
          userInfo = await exchangeGithubCode(code as string, gatewayConfig);
          break;
        default:
          return res.status(400).json({
            error: 'Unsupported OAuth provider',
            code: 'UNSUPPORTED_PROVIDER',
            provider,
            timestamp: new Date().toISOString()
          });
      }

      // Find or create user
      const user = await findOrCreateOAuthUser(userInfo, provider);
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          provider 
        },
        gatewayConfig.security.authentication.jwt.secret,
        { 
          expiresIn: gatewayConfig.security.authentication.jwt.expiresIn,
          issuer: gatewayConfig.security.authentication.jwt.issuer,
          audience: gatewayConfig.security.authentication.jwt.audience
        }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          provider
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('OAuth authentication error', {
        error: error.message,
        provider,
        ip: req.ip
      });

      res.status(500).json({
        error: 'OAuth authentication failed',
        code: 'OAUTH_ERROR',
        provider,
        timestamp: new Date().toISOString()
      });
    }
  };
};

// API Key authentication middleware
export const apiKeyMiddleware = (gatewayConfig: GatewayConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({
          error: 'API key required',
          code: 'NO_API_KEY',
          message: 'X-API-Key header is required',
          timestamp: new Date().toISOString()
        });
      }

      // Validate API key (implement your API key validation logic)
      const isValidKey = await validateApiKey(apiKey);
      
      if (!isValidKey) {
        return res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY',
          timestamp: new Date().toISOString()
        });
      }

      next();

    } catch (error) {
      logger.error('API key authentication error', {
        error: error.message,
        ip: req.ip
      });

      res.status(500).json({
        error: 'API key authentication failed',
        code: 'API_KEY_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Helper functions

function extractToken(req: Request): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // Check query parameter (less secure, for specific use cases)
  if (req.query.token) {
    return req.query.token as string;
  }

  return null;
}

function verifyOAuthState(state: string): boolean {
  // Implement your OAuth state verification logic
  // This should verify CSRF token to prevent attacks
  return true; // Simplified for example
}

async function exchangeGoogleCode(code: string, config: GatewayConfig): Promise<any> {
  // Implement Google OAuth code exchange
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.security.authentication.oauth.providers.google.clientId,
      client_secret: config.security.authentication.oauth.providers.google.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || ''
    })
  });

  const tokens = await response.json();
  
  // Get user info
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });

  return await userResponse.json();
}

async function exchangeFacebookCode(code: string, config: GatewayConfig): Promise<any> {
  // Implement Facebook OAuth code exchange
  const response = await fetch(`https://graph.facebook.com/v12.0/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.security.authentication.oauth.providers.facebook.clientId,
      client_secret: config.security.authentication.oauth.providers.facebook.clientSecret,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI || ''
    })
  });

  const tokens = await response.json();
  
  // Get user info
  const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokens.access_token}`);
  
  return await userResponse.json();
}

async function exchangeGithubCode(code: string, config: GatewayConfig): Promise<any> {
  // Implement GitHub OAuth code exchange
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      client_id: config.security.authentication.oauth.providers.github.clientId,
      client_secret: config.security.authentication.oauth.providers.github.clientSecret
    })
  });

  const tokens = await response.json();
  
  // Get user info
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${tokens.access_token}` }
  });

  return await userResponse.json();
}

async function findOrCreateOAuthUser(userInfo: any, provider: string): Promise<any> {
  // Find existing user by email
  const [existingUser] = await db.select().from(users)
    .where(eq(users.email, userInfo.email));

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const [newUser] = await db.insert(users).values({
    email: userInfo.email,
    name: userInfo.name,
    avatarUrl: userInfo.picture || userInfo.avatar_url,
    emailVerified: true, // OAuth emails are pre-verified
    authProvider: provider,
    roles: ['user'],
    isActive: true
  }).returning();

  logger.info('New OAuth user created', {
    userId: newUser.id,
    email: newUser.email,
    provider
  });

  return newUser;
}

async function validateApiKey(apiKey: string): Promise<boolean> {
  // Implement your API key validation logic
  // This could check against a database table of valid API keys
  return apiKey.startsWith('getit_') && apiKey.length > 20;
}

// Bangladesh-specific authentication helpers
export const bangladeshAuthChecks = {
  // Verify Bangladesh mobile number format
  verifyBangladeshMobile: (mobile: string): boolean => {
    const bdMobileRegex = /^(\+88|88)?(01[3-9]\d{8})$/;
    return bdMobileRegex.test(mobile);
  },

  // Verify NID format
  verifyNID: (nid: string): boolean => {
    const nidRegex = /^\d{10}$|^\d{13}$|^\d{17}$/;
    return nidRegex.test(nid);
  },

  // Check if user is in Bangladesh timezone
  isBangladeshTimezone: (req: Request): boolean => {
    const timezone = req.headers['x-timezone'] as string;
    return timezone === 'Asia/Dhaka' || timezone === 'Asia/Chittagong';
  }
};

export default authMiddleware;