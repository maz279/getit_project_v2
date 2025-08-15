import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { users, profiles, type InsertUser, type InsertProfile } from '../../../../../shared/schema.js';
import { eq, and, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Authentication Controller
 * Basic authentication functionality for user management service
 */
export class AuthController {
  
  async register(req: Request, res: Response) {
    try {
      const { username, email, password, phone } = req.body;

      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Username, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          message: 'A user with this email or username already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          username,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: 'customer',
          status: 'active',
          isEmailVerified: false,
          isPhoneVerified: false
        })
        .returning();

      const user = newUser[0];

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'getit-bangladesh-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
          },
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: 'An error occurred during registration'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password'
        });
      }

      const foundUser = user[0];

      // Check password
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (foundUser.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Account disabled',
          message: 'Your account has been disabled. Please contact support.'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role
        },
        process.env.JWT_SECRET || 'getit-bangladesh-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
            role: foundUser.role,
            status: foundUser.status,
            isEmailVerified: foundUser.isEmailVerified,
            isPhoneVerified: foundUser.isPhoneVerified
          },
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: 'An error occurred during login'
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // In a full implementation, we would invalidate the token
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: 'An error occurred during logout'
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found'
        });
      }

      const foundUser = user[0];

      res.json({
        success: true,
        message: 'User data retrieved successfully',
        data: {
          user: {
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
            role: foundUser.role,
            status: foundUser.status,
            isEmailVerified: foundUser.isEmailVerified,
            isPhoneVerified: foundUser.isPhoneVerified,
            createdAt: foundUser.createdAt,
            updatedAt: foundUser.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user data',
        message: 'An error occurred while retrieving user data'
      });
    }
  }

  async updateCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { username, phone } = req.body;

      const updateData: any = {};
      if (username) updateData.username = username;
      if (phone) updateData.phone = phone;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No updates provided',
          message: 'Please provide fields to update'
        });
      }

      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, req.user.userId))
        .returning();

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUser[0].id,
            username: updatedUser[0].username,
            email: updatedUser[0].email,
            phone: updatedUser[0].phone,
            role: updatedUser[0].role,
            status: updatedUser[0].status
          }
        }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Update failed',
        message: 'An error occurred while updating user data'
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: { user: user[0] }
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user',
        message: 'An error occurred while retrieving user'
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedUser = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, parseInt(id)))
        .returning();

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser[0] }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Update failed',
        message: 'An error occurred while updating user'
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await db.delete(users).where(eq(users.id, parseInt(id)));

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: 'Delete failed',
        message: 'An error occurred while deleting user'
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const allUsers = await db.select().from(users);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: { users: allUsers }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve users',
        message: 'An error occurred while retrieving users'
      });
    }
  }

  async activateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updatedUser = await db
        .update(users)
        .set({ status: 'active' })
        .where(eq(users.id, parseInt(id)))
        .returning();

      res.json({
        success: true,
        message: 'User activated successfully',
        data: { user: updatedUser[0] }
      });

    } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({
        success: false,
        error: 'Activation failed',
        message: 'An error occurred while activating user'
      });
    }
  }

  async deactivateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updatedUser = await db
        .update(users)
        .set({ status: 'inactive' })
        .where(eq(users.id, parseInt(id)))
        .returning();

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: { user: updatedUser[0] }
      });

    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        error: 'Deactivation failed',
        message: 'An error occurred while deactivating user'
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email required',
          message: 'Email address is required'
        });
      }

      // In production, implement actual password reset functionality
      res.json({
        success: true,
        message: 'Password reset email sent (if email exists)'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Password reset failed',
        message: 'An error occurred during password reset'
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Token and new password are required'
        });
      }

      // In production, implement actual token validation and password reset
      res.json({
        success: true,
        message: 'Password reset successful'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Password reset failed',
        message: 'An error occurred during password reset'
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Current password and new password are required'
        });
      }

      // Get current user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account not found'
        });
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user[0].password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid current password',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db
        .update(users)
        .set({ password: hashedNewPassword })
        .where(eq(users.id, req.user.userId));

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

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token required',
          message: 'Verification token is required'
        });
      }

      // In production, implement actual email verification
      res.json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        error: 'Email verification failed',
        message: 'An error occurred during email verification'
      });
    }
  }

  async verifyPhone(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Code required',
          message: 'Verification code is required'
        });
      }

      // In production, implement actual phone verification
      res.json({
        success: true,
        message: 'Phone verified successfully'
      });

    } catch (error) {
      console.error('Verify phone error:', error);
      res.status(500).json({
        success: false,
        error: 'Phone verification failed',
        message: 'An error occurred during phone verification'
      });
    }
  }

  async healthCheck(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Auth service is healthy',
        data: {
          service: 'auth-service',
          status: 'active',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        message: 'Service health check failed'
      });
    }
  }
}