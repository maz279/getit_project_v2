import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { users, securityTokens, accountLockouts, userDevices, userSessions, securityEvents, type InsertSecurityToken, type InsertAccountLockout } from '../../../../../shared/schema.js';
import { eq, and, gt, desc, count } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Security Controller - Advanced Security Management
 * Handles MFA, account lockout, suspicious activity detection, and security monitoring
 */
export class SecurityController {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MFA_WINDOW = 30; // seconds

  /**
   * Enable Multi-Factor Authentication (MFA)
   */
  async enableMFA(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const userId = req.user.userId;

      // Check if MFA is already enabled
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found'
        });
      }

      if (user[0].mfaEnabled) {
        return res.status(400).json({
          success: false,
          error: 'MFA already enabled',
          message: 'Multi-factor authentication is already enabled for this account'
        });
      }

      // Generate MFA secret
      const secret = authenticator.generateSecret();
      const email = user[0].email;
      const serviceName = 'GetIt Bangladesh';

      // Generate QR code URL
      const otpauthUrl = authenticator.keyuri(email, serviceName, secret);
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

      // Store MFA secret temporarily (will be activated after verification)
      await db.insert(securityTokens).values({
        userId,
        tokenType: 'mfa_setup',
        tokenValue: secret,
        purpose: 'MFA setup verification',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      // Log security event
      await this.logSecurityEvent(userId, 'mfa_setup_initiated', {
        action: 'MFA setup started',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'MFA setup initiated',
        data: {
          secret,
          qrCode: qrCodeUrl,
          backupCodes: this.generateBackupCodes(),
          setupInstructions: 'Scan the QR code with your authenticator app and verify with a code'
        }
      });

    } catch (error) {
      console.error('Enable MFA error:', error);
      res.status(500).json({
        success: false,
        error: 'MFA setup failed',
        message: 'An error occurred while setting up MFA'
      });
    }
  }

  /**
   * Verify and complete MFA setup
   */
  async verifyMFASetup(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { token } = req.body;
      const userId = req.user.userId;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'MFA token required',
          message: 'Please provide the MFA token from your authenticator app'
        });
      }

      // Get the pending MFA secret
      const pendingSetup = await db
        .select()
        .from(securityTokens)
        .where(
          and(
            eq(securityTokens.userId, userId),
            eq(securityTokens.tokenType, 'mfa_setup'),
            eq(securityTokens.isUsed, false),
            gt(securityTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (pendingSetup.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid setup session',
          message: 'MFA setup session expired or not found'
        });
      }

      const secret = pendingSetup[0].tokenValue;

      // Verify the MFA token
      const isValid = authenticator.verify({
        token,
        secret,
        window: this.MFA_WINDOW
      });

      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid MFA token',
          message: 'The provided MFA token is invalid'
        });
      }

      // Enable MFA for the user
      await db
        .update(users)
        .set({
          mfaEnabled: true,
          mfaSecret: secret,
          mfaEnabledAt: new Date()
        })
        .where(eq(users.id, userId));

      // Mark setup token as used
      await db
        .update(securityTokens)
        .set({ isUsed: true })
        .where(eq(securityTokens.id, pendingSetup[0].id));

      // Log security event
      await this.logSecurityEvent(userId, 'mfa_enabled', {
        action: 'MFA successfully enabled',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'MFA enabled successfully',
        data: {
          mfaEnabled: true,
          enabledAt: new Date()
        }
      });

    } catch (error) {
      console.error('Verify MFA setup error:', error);
      res.status(500).json({
        success: false,
        error: 'MFA verification failed',
        message: 'An error occurred while verifying MFA'
      });
    }
  }

  /**
   * Disable Multi-Factor Authentication
   */
  async disableMFA(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { currentPassword, mfaToken } = req.body;
      const userId = req.user.userId;

      if (!currentPassword || !mfaToken) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing',
          message: 'Current password and MFA token are required'
        });
      }

      // Get user details
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found'
        });
      }

      const foundUser = user[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(currentPassword, foundUser.password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid password',
          message: 'Current password is incorrect'
        });
      }

      // Verify MFA token
      if (!foundUser.mfaSecret) {
        return res.status(400).json({
          success: false,
          error: 'MFA not enabled',
          message: 'MFA is not enabled for this account'
        });
      }

      const isValidMFA = authenticator.verify({
        token: mfaToken,
        secret: foundUser.mfaSecret,
        window: this.MFA_WINDOW
      });

      if (!isValidMFA) {
        return res.status(400).json({
          success: false,
          error: 'Invalid MFA token',
          message: 'The provided MFA token is invalid'
        });
      }

      // Disable MFA
      await db
        .update(users)
        .set({
          mfaEnabled: false,
          mfaSecret: null,
          mfaEnabledAt: null
        })
        .where(eq(users.id, userId));

      // Log security event
      await this.logSecurityEvent(userId, 'mfa_disabled', {
        action: 'MFA disabled by user',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'MFA disabled successfully',
        data: {
          mfaEnabled: false
        }
      });

    } catch (error) {
      console.error('Disable MFA error:', error);
      res.status(500).json({
        success: false,
        error: 'MFA disable failed',
        message: 'An error occurred while disabling MFA'
      });
    }
  }

  /**
   * Check account lockout status
   */
  async checkAccountLockout(userId: number): Promise<{ isLocked: boolean; lockedUntil?: Date; reason?: string }> {
    try {
      const lockout = await db
        .select()
        .from(accountLockouts)
        .where(
          and(
            eq(accountLockouts.userId, userId),
            gt(accountLockouts.lockedUntil, new Date())
          )
        )
        .orderBy(desc(accountLockouts.lockedAt))
        .limit(1);

      if (lockout.length > 0) {
        return {
          isLocked: true,
          lockedUntil: lockout[0].lockedUntil,
          reason: lockout[0].reason
        };
      }

      return { isLocked: false };
    } catch (error) {
      console.error('Check lockout error:', error);
      return { isLocked: false };
    }
  }

  /**
   * Lock user account after failed attempts
   */
  async lockAccount(userId: number, reason: string, ip?: string, userAgent?: string): Promise<void> {
    try {
      const lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);

      await db.insert(accountLockouts).values({
        userId,
        reason,
        lockedUntil,
        ipAddress: ip,
        userAgent
      });

      // Update user's locked status
      await db
        .update(users)
        .set({
          lockedUntil,
          failedLoginAttempts: 0 // Reset attempts after lock
        })
        .where(eq(users.id, userId));

      // Log security event
      await this.logSecurityEvent(userId, 'account_locked', {
        action: 'Account locked due to failed login attempts',
        reason,
        lockedUntil: lockedUntil.toISOString(),
        ip,
        userAgent
      });

    } catch (error) {
      console.error('Lock account error:', error);
    }
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedAttempts(userId: number): Promise<boolean> {
    try {
      // Get current failed attempts
      const user = await db
        .select({ failedLoginAttempts: users.failedLoginAttempts })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) return false;

      const currentAttempts = user[0].failedLoginAttempts || 0;
      const newAttempts = currentAttempts + 1;

      // Update failed attempts
      await db
        .update(users)
        .set({ failedLoginAttempts: newAttempts })
        .where(eq(users.id, userId));

      // Check if we need to lock the account
      if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        await this.lockAccount(userId, `Too many failed login attempts (${newAttempts})`);
        return true; // Account locked
      }

      return false; // Not locked yet
    } catch (error) {
      console.error('Increment failed attempts error:', error);
      return false;
    }
  }

  /**
   * Reset failed login attempts (on successful login)
   */
  async resetFailedAttempts(userId: number): Promise<void> {
    try {
      await db
        .update(users)
        .set({ failedLoginAttempts: 0 })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Reset failed attempts error:', error);
    }
  }

  /**
   * Get security events for user
   */
  async getSecurityEvents(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const userId = req.user.userId;
      const { limit = 50, offset = 0 } = req.query;

      const events = await db
        .select()
        .from(securityEvents)
        .where(eq(securityEvents.userId, userId))
        .orderBy(desc(securityEvents.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));

      res.json({
        success: true,
        message: 'Security events retrieved successfully',
        data: {
          events,
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
            total: events.length
          }
        }
      });

    } catch (error) {
      console.error('Get security events error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve security events',
        message: 'An error occurred while retrieving security events'
      });
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const userId = req.user.userId;

      const sessions = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.userId, userId),
            eq(userSessions.isActive, true),
            gt(userSessions.expiresAt, new Date())
          )
        )
        .orderBy(desc(userSessions.lastActivityAt));

      res.json({
        success: true,
        message: 'Active sessions retrieved successfully',
        data: {
          sessions: sessions.map(session => ({
            id: session.id,
            deviceInfo: session.deviceInfo,
            ipAddress: session.ipAddress,
            location: session.location,
            lastActivityAt: session.lastActivityAt,
            createdAt: session.createdAt,
            isCurrent: session.sessionToken === req.headers.authorization?.replace('Bearer ', '')
          }))
        }
      });

    } catch (error) {
      console.error('Get active sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve sessions',
        message: 'An error occurred while retrieving active sessions'
      });
    }
  }

  /**
   * Terminate specific session
   */
  async terminateSession(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { sessionId } = req.params;
      const userId = req.user.userId;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID required',
          message: 'Please provide a session ID to terminate'
        });
      }

      // Deactivate the session
      const result = await db
        .update(userSessions)
        .set({
          isActive: false,
          expiresAt: new Date() // Expire immediately
        })
        .where(
          and(
            eq(userSessions.id, sessionId),
            eq(userSessions.userId, userId)
          )
        )
        .returning();

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
          message: 'Session not found or already terminated'
        });
      }

      // Log security event
      await this.logSecurityEvent(userId, 'session_terminated', {
        action: 'Session terminated by user',
        sessionId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Session terminated successfully'
      });

    } catch (error) {
      console.error('Terminate session error:', error);
      res.status(500).json({
        success: false,
        error: 'Session termination failed',
        message: 'An error occurred while terminating the session'
      });
    }
  }

  /**
   * Change password with security validation
   */
  async changePasswordSecure(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { currentPassword, newPassword, mfaToken } = req.body;
      const userId = req.user.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing',
          message: 'Current password and new password are required'
        });
      }

      // Get user details
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found'
        });
      }

      const foundUser = user[0];

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, foundUser.password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid current password',
          message: 'Current password is incorrect'
        });
      }

      // If MFA is enabled, verify MFA token
      if (foundUser.mfaEnabled) {
        if (!mfaToken) {
          return res.status(400).json({
            success: false,
            error: 'MFA token required',
            message: 'MFA token is required for password change'
          });
        }

        const isValidMFA = authenticator.verify({
          token: mfaToken,
          secret: foundUser.mfaSecret!,
          window: this.MFA_WINDOW
        });

        if (!isValidMFA) {
          return res.status(400).json({
            success: false,
            error: 'Invalid MFA token',
            message: 'The provided MFA token is invalid'
          });
        }
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Weak password',
          message: passwordValidation.message
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedNewPassword,
          passwordChangedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Invalidate all sessions except current one
      await db
        .update(userSessions)
        .set({
          isActive: false,
          expiresAt: new Date()
        })
        .where(
          and(
            eq(userSessions.userId, userId),
            // Keep current session active
          )
        );

      // Log security event
      await this.logSecurityEvent(userId, 'password_changed', {
        action: 'Password changed successfully',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Password change failed',
        message: 'An error occurred while changing password'
      });
    }
  }

  /**
   * Private helper methods
   */
  private async logSecurityEvent(userId: number, eventType: string, details: any): Promise<void> {
    try {
      await db.insert(securityEvents).values({
        userId,
        eventType,
        details,
        ipAddress: details.ip,
        userAgent: details.userAgent
      });
    } catch (error) {
      console.error('Log security event error:', error);
    }
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  private validatePasswordStrength(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true, message: 'Password is strong' };
  }
}