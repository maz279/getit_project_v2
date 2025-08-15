/**
 * JWT Service - Amazon.com/Shopee.sg Level Implementation
 * JWT token generation, validation, and management
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../../../db';
import { userSessions } from '../../../../../shared/schema';
import { eq, and, gte } from 'drizzle-orm';
import { LoggingService } from '../../../../services/LoggingService';
import { AuthUser, JWTTokens } from '../types/AuthTypes';

export interface JWTPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
  sessionId: string;
  tokenType: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
}

export interface RefreshTokenResult {
  success: boolean;
  accessToken?: string;
  expiresIn?: number;
  error?: string;
}

export class JWTService {
  private logger: LoggingService;
  private readonly ACCESS_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '30d';

  constructor() {
    this.logger = new LoggingService();
    this.ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || this.generateSecret();
    this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || this.generateSecret();
  }

  /**
   * Generate JWT tokens for user
   */
  async generateTokens(user: AuthUser): Promise<JWTTokens> {
    try {
      const sessionId = crypto.randomUUID();
      
      // Access token payload
      const accessPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        sessionId,
        tokenType: 'access'
      };

      // Refresh token payload
      const refreshPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        sessionId,
        tokenType: 'refresh'
      };

      // Generate tokens
      const accessToken = jwt.sign(accessPayload, this.ACCESS_TOKEN_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        issuer: 'getit-platform',
        audience: 'getit-users'
      });

      const refreshToken = jwt.sign(refreshPayload, this.REFRESH_TOKEN_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        issuer: 'getit-platform',
        audience: 'getit-users'
      });

      // Calculate expiry time for access token (15 minutes)
      const expiresIn = 15 * 60; // 15 minutes in seconds

      this.logger.info('JWT tokens generated', {
        userId: user.id,
        sessionId,
        expiresIn
      });

      return {
        accessToken,
        refreshToken,
        expiresIn
      };

    } catch (error) {
      this.logger.error('JWT token generation failed', { error: error.message });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Validate access token
   */
  async validateAccessToken(token: string): Promise<TokenValidationResult> {
    try {
      const payload = jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'getit-platform',
        audience: 'getit-users'
      }) as JWTPayload;

      // Verify token type
      if (payload.tokenType !== 'access') {
        return {
          isValid: false,
          error: 'Invalid token type'
        };
      }

      // Check if session exists and is active
      const [session] = await db.select()
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, payload.userId),
            eq(sessions.isActive, true),
            gte(sessions.expiresAt, new Date())
          )
        );

      if (!session) {
        return {
          isValid: false,
          error: 'Session not found or expired'
        };
      }

      return {
        isValid: true,
        payload
      };

    } catch (error) {
      this.logger.warn('Access token validation failed', { error: error.message });
      
      let errorMessage = 'Invalid token';
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token expired';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Malformed token';
      }

      return {
        isValid: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate refresh token
   */
  async validateRefreshToken(token: string): Promise<TokenValidationResult> {
    try {
      const payload = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'getit-platform',
        audience: 'getit-users'
      }) as JWTPayload;

      // Verify token type
      if (payload.tokenType !== 'refresh') {
        return {
          isValid: false,
          error: 'Invalid token type'
        };
      }

      // Check if session exists and is active
      const [session] = await db.select()
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, payload.userId),
            eq(sessions.refreshToken, token),
            eq(sessions.isActive, true),
            gte(sessions.expiresAt, new Date())
          )
        );

      if (!session) {
        return {
          isValid: false,
          error: 'Session not found or expired'
        };
      }

      return {
        isValid: true,
        payload
      };

    } catch (error) {
      this.logger.warn('Refresh token validation failed', { error: error.message });
      
      let errorMessage = 'Invalid refresh token';
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Refresh token expired';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Malformed refresh token';
      }

      return {
        isValid: false,
        error: errorMessage
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      // Validate refresh token
      const validation = await this.validateRefreshToken(refreshToken);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const { payload } = validation;

      // Generate new access token
      const newAccessPayload: JWTPayload = {
        userId: payload.userId,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        sessionId: payload.sessionId,
        tokenType: 'access'
      };

      const newAccessToken = jwt.sign(newAccessPayload, this.ACCESS_TOKEN_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        issuer: 'getit-platform',
        audience: 'getit-users'
      });

      const expiresIn = 15 * 60; // 15 minutes in seconds

      this.logger.info('Access token refreshed', {
        userId: payload.userId,
        sessionId: payload.sessionId
      });

      return {
        success: true,
        accessToken: newAccessToken,
        expiresIn
      };

    } catch (error) {
      this.logger.error('Token refresh failed', { error: error.message });
      return {
        success: false,
        error: 'Token refresh failed'
      };
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      this.logger.warn('Token decode failed', { error: error.message });
      return null;
    }
  }

  /**
   * Extract user ID from token
   */
  extractUserIdFromToken(token: string): string | null {
    try {
      const decoded = this.decodeToken(token);
      return decoded?.userId || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate blacklist token for logout
   */
  async blacklistToken(token: string): Promise<boolean> {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) {
        return false;
      }

      // Store token in Redis blacklist with expiration matching token expiry
      const blacklistKey = `blacklist:${token}`;
      const expiresIn = decoded.exp ? (decoded.exp * 1000 - Date.now()) / 1000 : 3600;
      
      if (expiresIn > 0) {
        await this.redis.setex(blacklistKey, Math.floor(expiresIn), 'blacklisted');
      }

      this.logger.info('Token blacklisted successfully', {
        userId: decoded.userId,
        sessionId: decoded.sessionId,
        expiresIn: Math.floor(expiresIn)
      });
      
      return true;
    } catch (error) {
      this.logger.error('Token blacklisting failed', { error: error.message });
      return false;
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistKey = `blacklist:${token}`;
      const isBlacklisted = await this.redis.get(blacklistKey);
      
      return !!isBlacklisted;
    } catch (error) {
      this.logger.error('Blacklist check failed', { error: error.message });
      return true; // Err on the side of caution
    }
  }

  /**
   * Generate token for password reset
   */
  async generatePasswordResetToken(userId: string): Promise<string> {
    try {
      const payload = {
        userId,
        tokenType: 'password_reset',
        timestamp: Date.now()
      };

      const token = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
        expiresIn: '1h',
        issuer: 'getit-platform',
        audience: 'getit-password-reset'
      });

      this.logger.info('Password reset token generated', { userId });
      return token;

    } catch (error) {
      this.logger.error('Password reset token generation failed', { error: error.message });
      throw new Error('Password reset token generation failed');
    }
  }

  /**
   * Validate password reset token
   */
  async validatePasswordResetToken(token: string): Promise<{ isValid: boolean; userId?: string; error?: string }> {
    try {
      const payload = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'getit-platform',
        audience: 'getit-password-reset'
      }) as any;

      if (payload.tokenType !== 'password_reset') {
        return {
          isValid: false,
          error: 'Invalid token type'
        };
      }

      return {
        isValid: true,
        userId: payload.userId
      };

    } catch (error) {
      this.logger.warn('Password reset token validation failed', { error: error.message });
      
      let errorMessage = 'Invalid reset token';
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Reset token expired';
      }

      return {
        isValid: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate email verification token
   */
  async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    try {
      const payload = {
        userId,
        email,
        tokenType: 'email_verification',
        timestamp: Date.now()
      };

      const token = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
        expiresIn: '24h',
        issuer: 'getit-platform',
        audience: 'getit-email-verification'
      });

      this.logger.info('Email verification token generated', { userId, email });
      return token;

    } catch (error) {
      this.logger.error('Email verification token generation failed', { error: error.message });
      throw new Error('Email verification token generation failed');
    }
  }

  /**
   * Validate email verification token
   */
  async validateEmailVerificationToken(token: string): Promise<{ isValid: boolean; userId?: string; email?: string; error?: string }> {
    try {
      const payload = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'getit-platform',
        audience: 'getit-email-verification'
      }) as any;

      if (payload.tokenType !== 'email_verification') {
        return {
          isValid: false,
          error: 'Invalid token type'
        };
      }

      return {
        isValid: true,
        userId: payload.userId,
        email: payload.email
      };

    } catch (error) {
      this.logger.warn('Email verification token validation failed', { error: error.message });
      
      let errorMessage = 'Invalid verification token';
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Verification token expired';
      }

      return {
        isValid: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate secure secret for JWT signing
   */
  private generateSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Get token expiry information
   */
  getTokenExpiry(token: string): { expiresAt: Date | null; isExpired: boolean } {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return { expiresAt: null, isExpired: true };
      }

      const expiresAt = new Date(decoded.exp * 1000);
      const isExpired = expiresAt <= new Date();

      return { expiresAt, isExpired };
    } catch (error) {
      return { expiresAt: null, isExpired: true };
    }
  }

  /**
   * Calculate remaining token lifetime
   */
  getTokenRemainingLifetime(token: string): number {
    try {
      const { expiresAt, isExpired } = this.getTokenExpiry(token);
      
      if (isExpired || !expiresAt) {
        return 0;
      }

      return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    } catch (error) {
      return 0;
    }
  }
}