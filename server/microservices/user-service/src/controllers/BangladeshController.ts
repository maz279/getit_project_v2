import { Request, Response } from 'express';
import { db } from '../../../../db.js';
import { users, profiles, bangladeshProfiles, nidVerifications, mobileBankingAccounts, culturalPreferences, localAddresses, type InsertBangladeshProfile, type InsertNidVerification } from '../../../../../shared/schema.js';
import { eq, and, or } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Bangladesh Controller - Bangladesh-Specific User Management
 * Handles NID validation, mobile banking integration, cultural preferences, and local features
 */
export class BangladeshController {
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-for-dev';

  /**
   * Complete Bangladesh profile setup
   */
  async setupBangladeshProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const {
        nidNumber,
        district,
        upazila,
        postOffice,
        postalCode,
        religion,
        occupation,
        emergencyContact,
        culturalPrefs
      } = req.body;

      const userId = req.user.userId;

      // Validate required fields
      if (!nidNumber || !district) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing',
          message: 'NID number and district are required'
        });
      }

      // Validate NID format
      const nidValidation = this.validateNIDFormat(nidNumber);
      if (!nidValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid NID',
          message: nidValidation.message
        });
      }

      // Check if NID already exists
      const existingNID = await db
        .select()
        .from(bangladeshProfiles)
        .where(eq(bangladeshProfiles.nidNumber, nidNumber))
        .limit(1);

      if (existingNID.length > 0 && existingNID[0].userId !== userId) {
        return res.status(409).json({
          success: false,
          error: 'NID already registered',
          message: 'This NID number is already registered with another account'
        });
      }

      // Create or update Bangladesh profile
      const bangladeshProfileData = {
        userId,
        nidNumber,
        district,
        upazila,
        postOffice,
        postalCode,
        religion,
        occupation,
        emergencyContact,
        verificationStatus: 'pending' as const,
        isVerified: false
      };

      const existingProfile = await db
        .select()
        .from(bangladeshProfiles)
        .where(eq(bangladeshProfiles.userId, userId))
        .limit(1);

      let profile;
      if (existingProfile.length > 0) {
        // Update existing profile
        profile = await db
          .update(bangladeshProfiles)
          .set(bangladeshProfileData)
          .where(eq(bangladeshProfiles.userId, userId))
          .returning();
      } else {
        // Create new profile
        profile = await db
          .insert(bangladeshProfiles)
          .values(bangladeshProfileData)
          .returning();
      }

      // Update user's NID fields
      await db
        .update(users)
        .set({
          nidNumber,
          nidVerified: false // Will be verified later
        })
        .where(eq(users.id, userId));

      // Create cultural preferences if provided
      if (culturalPrefs) {
        await this.updateCulturalPreferences(userId, culturalPrefs);
      }

      // Initiate NID verification process
      await this.initiateNIDVerification(userId, nidNumber);

      res.status(201).json({
        success: true,
        message: 'Bangladesh profile setup successful',
        data: {
          profile: profile[0],
          verificationStatus: 'pending',
          message: 'NID verification process initiated'
        }
      });

    } catch (error) {
      console.error('Setup Bangladesh profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Profile setup failed',
        message: 'An error occurred while setting up Bangladesh profile'
      });
    }
  }

  /**
   * Verify National ID (NID)
   */
  async verifyNID(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { nidNumber, dateOfBirth, fatherName, motherName } = req.body;
      const userId = req.user.userId;

      if (!nidNumber || !dateOfBirth) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing',
          message: 'NID number and date of birth are required for verification'
        });
      }

      // Validate NID format
      const nidValidation = this.validateNIDFormat(nidNumber);
      if (!nidValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid NID format',
          message: nidValidation.message
        });
      }

      // Create verification record
      const verificationData = {
        userId,
        nidNumber,
        dateOfBirth: new Date(dateOfBirth),
        fatherName,
        motherName,
        verificationStatus: 'pending' as const,
        submittedAt: new Date()
      };

      const verification = await db
        .insert(nidVerifications)
        .values(verificationData)
        .returning();

      // In production, this would call government API
      // For now, we'll simulate verification with basic validation
      const verificationResult = await this.processNIDVerification(nidNumber, dateOfBirth, fatherName, motherName);

      // Update verification status
      await db
        .update(nidVerifications)
        .set({
          verificationStatus: verificationResult.status,
          verificationDetails: verificationResult.details,
          verifiedAt: verificationResult.status === 'verified' ? new Date() : null
        })
        .where(eq(nidVerifications.id, verification[0].id));

      // Update user and Bangladesh profile if verified
      if (verificationResult.status === 'verified') {
        await db
          .update(users)
          .set({
            nidVerified: true,
            nidVerifiedAt: new Date()
          })
          .where(eq(users.id, userId));

        await db
          .update(bangladeshProfiles)
          .set({
            isVerified: true,
            verificationStatus: 'verified',
            verifiedAt: new Date()
          })
          .where(eq(bangladeshProfiles.userId, userId));
      }

      res.json({
        success: true,
        message: 'NID verification processed',
        data: {
          verificationId: verification[0].id,
          status: verificationResult.status,
          message: verificationResult.message
        }
      });

    } catch (error) {
      console.error('Verify NID error:', error);
      res.status(500).json({
        success: false,
        error: 'NID verification failed',
        message: 'An error occurred during NID verification'
      });
    }
  }

  /**
   * Setup mobile banking account
   */
  async setupMobileBanking(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { provider, accountNumber, accountName, isPrimary } = req.body;
      const userId = req.user.userId;

      // Validate required fields
      if (!provider || !accountNumber || !accountName) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing',
          message: 'Provider, account number, and account name are required'
        });
      }

      // Validate provider
      const validProviders = ['bkash', 'nagad', 'rocket'];
      if (!validProviders.includes(provider.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid provider',
          message: 'Provider must be one of: bKash, Nagad, Rocket'
        });
      }

      // Validate account number format
      const accountValidation = this.validateMobileBankingAccount(provider, accountNumber);
      if (!accountValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid account number',
          message: accountValidation.message
        });
      }

      // Check if account already exists
      const existingAccount = await db
        .select()
        .from(mobileBankingAccounts)
        .where(
          and(
            eq(mobileBankingAccounts.provider, provider.toLowerCase()),
            eq(mobileBankingAccounts.accountNumber, this.encryptData(accountNumber))
          )
        )
        .limit(1);

      if (existingAccount.length > 0 && existingAccount[0].userId !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Account already linked',
          message: 'This mobile banking account is already linked to another user'
        });
      }

      // If setting as primary, unset other primary accounts
      if (isPrimary) {
        await db
          .update(mobileBankingAccounts)
          .set({ isPrimary: false })
          .where(eq(mobileBankingAccounts.userId, userId));
      }

      // Create mobile banking account record
      const accountData = {
        userId,
        provider: provider.toLowerCase(),
        accountNumber: this.encryptData(accountNumber),
        accountName,
        isPrimary: isPrimary || false,
        verificationStatus: 'pending' as const,
        isActive: true
      };

      const newAccount = await db
        .insert(mobileBankingAccounts)
        .values(accountData)
        .returning();

      // Initiate account verification (send OTP)
      const verificationCode = this.generateOTP();
      // In production, send OTP to the mobile banking account
      
      res.status(201).json({
        success: true,
        message: 'Mobile banking account setup successful',
        data: {
          accountId: newAccount[0].id,
          provider: provider.toLowerCase(),
          accountName,
          verificationStatus: 'pending',
          message: 'Verification OTP sent to your mobile banking account'
        }
      });

    } catch (error) {
      console.error('Setup mobile banking error:', error);
      res.status(500).json({
        success: false,
        error: 'Mobile banking setup failed',
        message: 'An error occurred while setting up mobile banking account'
      });
    }
  }

  /**
   * Verify mobile banking account
   */
  async verifyMobileBanking(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const { accountId, verificationCode } = req.body;
      const userId = req.user.userId;

      if (!accountId || !verificationCode) {
        return res.status(400).json({
          success: false,
          error: 'Required fields missing',
          message: 'Account ID and verification code are required'
        });
      }

      // Get mobile banking account
      const account = await db
        .select()
        .from(mobileBankingAccounts)
        .where(
          and(
            eq(mobileBankingAccounts.id, accountId),
            eq(mobileBankingAccounts.userId, userId)
          )
        )
        .limit(1);

      if (account.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Account not found',
          message: 'Mobile banking account not found'
        });
      }

      // In production, verify the OTP code
      // For now, we'll accept any 6-digit code
      if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code',
          message: 'Verification code must be 6 digits'
        });
      }

      // Update account verification status
      await db
        .update(mobileBankingAccounts)
        .set({
          verificationStatus: 'verified',
          verifiedAt: new Date(),
          isActive: true
        })
        .where(eq(mobileBankingAccounts.id, accountId));

      res.json({
        success: true,
        message: 'Mobile banking account verified successfully',
        data: {
          accountId,
          verificationStatus: 'verified',
          verifiedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Verify mobile banking error:', error);
      res.status(500).json({
        success: false,
        error: 'Mobile banking verification failed',
        message: 'An error occurred during mobile banking verification'
      });
    }
  }

  /**
   * Update cultural preferences
   */
  async updateCulturalPreferences(userId: number, preferences: any): Promise<void> {
    try {
      const culturalData = {
        userId,
        language: preferences.language || 'bn',
        preferredCurrency: 'BDT',
        timezone: 'Asia/Dhaka',
        festivalNotifications: preferences.festivalNotifications || true,
        prayerTimeNotifications: preferences.prayerTimeNotifications || false,
        ramadanMode: preferences.ramadanMode || false,
        localHolidays: preferences.localHolidays || true,
        culturalEvents: preferences.culturalEvents || true,
        religiousEvents: preferences.religiousEvents || false
      };

      // Check if preferences exist
      const existing = await db
        .select()
        .from(culturalPreferences)
        .where(eq(culturalPreferences.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(culturalPreferences)
          .set(culturalData)
          .where(eq(culturalPreferences.userId, userId));
      } else {
        await db
          .insert(culturalPreferences)
          .values(culturalData);
      }
    } catch (error) {
      console.error('Update cultural preferences error:', error);
    }
  }

  /**
   * Get Bangladesh profile
   */
  async getBangladeshProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please authenticate to access this resource'
        });
      }

      const userId = req.user.userId;

      // Get Bangladesh profile
      const profile = await db
        .select()
        .from(bangladeshProfiles)
        .where(eq(bangladeshProfiles.userId, userId))
        .limit(1);

      // Get mobile banking accounts
      const mobileBanking = await db
        .select()
        .from(mobileBankingAccounts)
        .where(eq(mobileBankingAccounts.userId, userId));

      // Get cultural preferences
      const cultural = await db
        .select()
        .from(culturalPreferences)
        .where(eq(culturalPreferences.userId, userId))
        .limit(1);

      res.json({
        success: true,
        message: 'Bangladesh profile retrieved successfully',
        data: {
          profile: profile.length > 0 ? profile[0] : null,
          mobileBankingAccounts: mobileBanking.map(acc => ({
            id: acc.id,
            provider: acc.provider,
            accountName: acc.accountName,
            isPrimary: acc.isPrimary,
            verificationStatus: acc.verificationStatus,
            isActive: acc.isActive,
            verifiedAt: acc.verifiedAt
          })),
          culturalPreferences: cultural.length > 0 ? cultural[0] : null
        }
      });

    } catch (error) {
      console.error('Get Bangladesh profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve profile',
        message: 'An error occurred while retrieving Bangladesh profile'
      });
    }
  }

  /**
   * Private helper methods
   */
  private validateNIDFormat(nidNumber: string): { valid: boolean; message: string } {
    // Bangladesh NID formats: 10 digits (old), 13 digits (new), 17 digits (new smart)
    const nidPattern = /^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/;
    
    if (!nidPattern.test(nidNumber)) {
      return {
        valid: false,
        message: 'NID must be 10, 13, or 17 digits'
      };
    }
    
    return { valid: true, message: 'Valid NID format' };
  }

  private validateMobileBankingAccount(provider: string, accountNumber: string): { valid: boolean; message: string } {
    const patterns = {
      bkash: /^01[3-9]\d{8}$/, // bKash uses mobile numbers
      nagad: /^01[3-9]\d{8}$/, // Nagad uses mobile numbers
      rocket: /^01[3-9]\d{8}$/ // Rocket uses mobile numbers
    };

    const pattern = patterns[provider.toLowerCase() as keyof typeof patterns];
    if (!pattern) {
      return { valid: false, message: 'Unsupported provider' };
    }

    if (!pattern.test(accountNumber)) {
      return { valid: false, message: `Invalid ${provider} account number format` };
    }

    return { valid: true, message: 'Valid account number' };
  }

  private async initiateNIDVerification(userId: number, nidNumber: string): Promise<void> {
    try {
      // In production, this would call government API
      // For now, we create a pending verification record
      await db.insert(nidVerifications).values({
        userId,
        nidNumber,
        verificationStatus: 'pending',
        submittedAt: new Date()
      });
    } catch (error) {
      console.error('Initiate NID verification error:', error);
    }
  }

  private async processNIDVerification(nidNumber: string, dateOfBirth: string, fatherName?: string, motherName?: string): Promise<{ status: string; message: string; details: any }> {
    // Simulate government API verification
    // In production, this would call actual government verification API
    
    // Basic validation - for demo purposes
    const dob = new Date(dateOfBirth);
    const age = (new Date().getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (age < 18 || age > 100) {
      return {
        status: 'rejected',
        message: 'Age verification failed',
        details: { reason: 'Invalid age' }
      };
    }

    // Simulate verification success
    return {
      status: 'verified',
      message: 'NID verified successfully',
      details: {
        verifiedAt: new Date(),
        verificationMethod: 'government_api'
      }
    };
  }

  private encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}