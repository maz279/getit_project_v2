import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { users, profiles, socialAccounts, type InsertUser, type InsertProfile, type InsertSocialAccount } from '../../../../../shared/schema.js';
import { eq, and, or } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import axios from 'axios';

/**
 * Social Authentication Controller
 * Handles OAuth integration with Google, Facebook, GitHub, LinkedIn
 */
export class SocialAuthController {

  /**
   * Initiate Google OAuth
   */
  async googleAuth(req: Request, res: Response) {
    try {
      const { redirectUrl } = req.query;
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `state=${Buffer.from(JSON.stringify({ redirectUrl })).toString('base64')}`;

      res.json({
        success: true,
        message: 'Google OAuth URL generated',
        data: {
          authUrl: googleAuthUrl,
          provider: 'google'
        }
      });

    } catch (error) {
      console.error('Google auth initiation error:', error);
      res.status(500).json({
        success: false,
        error: 'OAuth initiation failed',
        message: 'Failed to initiate Google authentication'
      });
    }
  }

  /**
   * Initiate Facebook OAuth
   */
  async facebookAuth(req: Request, res: Response) {
    try {
      const { redirectUrl } = req.query;
      
      const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&` +
        `response_type=code&` +
        `scope=email,public_profile&` +
        `state=${Buffer.from(JSON.stringify({ redirectUrl })).toString('base64')}`;

      res.json({
        success: true,
        message: 'Facebook OAuth URL generated',
        data: {
          authUrl: facebookAuthUrl,
          provider: 'facebook'
        }
      });

    } catch (error) {
      console.error('Facebook auth initiation error:', error);
      res.status(500).json({
        success: false,
        error: 'OAuth initiation failed',
        message: 'Failed to initiate Facebook authentication'
      });
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(req: Request, res: Response) {
    try {
      const { code, state, provider } = req.body;

      if (!code || !provider) {
        return res.status(400).json({
          success: false,
          error: 'Missing parameters',
          message: 'Authorization code and provider are required'
        });
      }

      let userProfile;
      
      switch (provider.toLowerCase()) {
        case 'google':
          userProfile = await this.handleGoogleCallback(code);
          break;
        case 'facebook':
          userProfile = await this.handleFacebookCallback(code);
          break;
        case 'github':
          userProfile = await this.handleGitHubCallback(code);
          break;
        case 'linkedin':
          userProfile = await this.handleLinkedInCallback(code);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported provider',
            message: 'OAuth provider not supported'
          });
      }

      if (!userProfile) {
        return res.status(400).json({
          success: false,
          error: 'OAuth failed',
          message: 'Failed to retrieve user profile from OAuth provider'
        });
      }

      // Check if user exists with this social account
      const existingSocialAccount = await db
        .select()
        .from(socialAccounts)
        .where(
          and(
            eq(socialAccounts.provider, provider.toLowerCase()),
            eq(socialAccounts.providerUserId, userProfile.id)
          )
        )
        .limit(1);

      let user;
      let isNewUser = false;

      if (existingSocialAccount.length > 0) {
        // User exists with this social account
        user = await db
          .select()
          .from(users)
          .where(eq(users.id, existingSocialAccount[0].userId))
          .limit(1);
        
        if (user.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Account error',
            message: 'Social account found but user not found'
          });
        }

        user = user[0];
      } else {
        // Check if user exists with same email
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, userProfile.email))
          .limit(1);

        if (existingUser.length > 0) {
          // Link social account to existing user
          user = existingUser[0];
          
          await db.insert(socialAccounts).values({
            userId: user.id,
            provider: provider.toLowerCase(),
            providerUserId: userProfile.id,
            email: userProfile.email,
            profileData: userProfile
          });
        } else {
          // Create new user
          const newUser = await db
            .insert(users)
            .values({
              username: userProfile.username || userProfile.email.split('@')[0],
              email: userProfile.email,
              fullName: userProfile.name,
              avatar: userProfile.picture || userProfile.avatar,
              role: 'customer',
              isEmailVerified: true, // Email is verified by OAuth provider
              lastLoginAt: new Date()
            })
            .returning();

          user = newUser[0];
          isNewUser = true;

          // Create social account link
          await db.insert(socialAccounts).values({
            userId: user.id,
            provider: provider.toLowerCase(),
            providerUserId: userProfile.id,
            email: userProfile.email,
            profileData: userProfile
          });

          // Create user profile
          await db.insert(profiles).values({
            userId: user.id,
            firstName: userProfile.given_name || userProfile.first_name,
            lastName: userProfile.family_name || userProfile.last_name,
            bio: userProfile.bio || null,
            website: userProfile.blog || userProfile.website,
            socialLinks: {
              [provider.toLowerCase()]: userProfile.html_url || userProfile.link
            }
          });
        }
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

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

      res.json({
        success: true,
        message: isNewUser ? 'Account created and logged in successfully' : 'Logged in successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          token,
          isNewUser,
          provider: provider.toLowerCase()
        }
      });

    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({
        success: false,
        error: 'OAuth callback failed',
        message: 'Failed to process OAuth callback'
      });
    }
  }

  /**
   * Link social account to existing user
   */
  async linkSocialAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to link social account'
        });
      }

      const { code, provider } = req.body;
      const userId = req.user.userId;

      if (!code || !provider) {
        return res.status(400).json({
          success: false,
          error: 'Missing parameters',
          message: 'Authorization code and provider are required'
        });
      }

      let userProfile;
      
      switch (provider.toLowerCase()) {
        case 'google':
          userProfile = await this.handleGoogleCallback(code);
          break;
        case 'facebook':
          userProfile = await this.handleFacebookCallback(code);
          break;
        case 'github':
          userProfile = await this.handleGitHubCallback(code);
          break;
        case 'linkedin':
          userProfile = await this.handleLinkedInCallback(code);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported provider',
            message: 'OAuth provider not supported'
          });
      }

      if (!userProfile) {
        return res.status(400).json({
          success: false,
          error: 'OAuth failed',
          message: 'Failed to retrieve user profile from OAuth provider'
        });
      }

      // Check if this social account is already linked to another user
      const existingSocialAccount = await db
        .select()
        .from(socialAccounts)
        .where(
          and(
            eq(socialAccounts.provider, provider.toLowerCase()),
            eq(socialAccounts.providerUserId, userProfile.id)
          )
        )
        .limit(1);

      if (existingSocialAccount.length > 0 && existingSocialAccount[0].userId !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Account already linked',
          message: 'This social account is already linked to another user'
        });
      }

      // Link or update social account
      if (existingSocialAccount.length > 0) {
        // Update existing link
        await db
          .update(socialAccounts)
          .set({
            email: userProfile.email,
            profileData: userProfile,
            updatedAt: new Date()
          })
          .where(eq(socialAccounts.id, existingSocialAccount[0].id));
      } else {
        // Create new link
        await db.insert(socialAccounts).values({
          userId,
          provider: provider.toLowerCase(),
          providerUserId: userProfile.id,
          email: userProfile.email,
          profileData: userProfile
        });
      }

      res.json({
        success: true,
        message: 'Social account linked successfully',
        data: {
          provider: provider.toLowerCase(),
          email: userProfile.email,
          name: userProfile.name
        }
      });

    } catch (error) {
      console.error('Link social account error:', error);
      res.status(500).json({
        success: false,
        error: 'Account linking failed',
        message: 'Failed to link social account'
      });
    }
  }

  /**
   * Unlink social account
   */
  async unlinkSocialAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to unlink social account'
        });
      }

      const { provider } = req.params;
      const userId = req.user.userId;

      if (!provider) {
        return res.status(400).json({
          success: false,
          error: 'Provider required',
          message: 'OAuth provider is required'
        });
      }

      // Check if social account exists
      const socialAccount = await db
        .select()
        .from(socialAccounts)
        .where(
          and(
            eq(socialAccounts.userId, userId),
            eq(socialAccounts.provider, provider.toLowerCase())
          )
        )
        .limit(1);

      if (socialAccount.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Account not found',
          message: 'Social account not found'
        });
      }

      // Remove social account link
      await db
        .delete(socialAccounts)
        .where(eq(socialAccounts.id, socialAccount[0].id));

      res.json({
        success: true,
        message: 'Social account unlinked successfully',
        data: {
          provider: provider.toLowerCase()
        }
      });

    } catch (error) {
      console.error('Unlink social account error:', error);
      res.status(500).json({
        success: false,
        error: 'Account unlinking failed',
        message: 'Failed to unlink social account'
      });
    }
  }

  /**
   * Get linked social accounts
   */
  async getLinkedAccounts(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to view linked accounts'
        });
      }

      const userId = req.user.userId;

      const linkedAccounts = await db
        .select()
        .from(socialAccounts)
        .where(eq(socialAccounts.userId, userId));

      res.json({
        success: true,
        message: 'Linked accounts retrieved successfully',
        data: {
          accounts: linkedAccounts.map(account => ({
            id: account.id,
            provider: account.provider,
            email: account.email,
            linkedAt: account.createdAt,
            lastUpdated: account.updatedAt
          }))
        }
      });

    } catch (error) {
      console.error('Get linked accounts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve accounts',
        message: 'Failed to retrieve linked social accounts'
      });
    }
  }

  /**
   * Private helper methods for OAuth providers
   */
  private async handleGoogleCallback(code: string): Promise<any> {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      });

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      return profileResponse.data;
    } catch (error) {
      console.error('Google OAuth error:', error);
      return null;
    }
  }

  private async handleFacebookCallback(code: string): Promise<any> {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          code,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI
        }
      });

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await axios.get('https://graph.facebook.com/me', {
        params: {
          access_token,
          fields: 'id,name,email,picture,first_name,last_name'
        }
      });

      return profileResponse.data;
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      return null;
    }
  }

  private async handleGitHubCallback(code: string): Promise<any> {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      }, {
        headers: { Accept: 'application/json' }
      });

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      return profileResponse.data;
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return null;
    }
  }

  private async handleLinkedInCallback(code: string): Promise<any> {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,emailAddress)', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      return profileResponse.data;
    } catch (error) {
      console.error('LinkedIn OAuth error:', error);
      return null;
    }
  }
}