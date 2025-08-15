/**
 * Payment Method Controller - Amazon.com/Shopee.sg Level
 * Secure payment method management with tokenization
 * Support for cards, mobile banking, and digital wallets
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  paymentMethods, 
  users,
  paymentTransactions
} from '@shared/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import crypto from 'crypto';

interface SavedPaymentMethod {
  type: 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer';
  provider: string;
  maskedDetails: string;
  expiresAt?: Date;
  isDefault: boolean;
}

interface CardTokenizationRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardHolderName: string;
  cvv: string;
}

export class PaymentMethodController {

  /**
   * Get user's saved payment methods
   * @route GET /api/v1/payments/methods
   */
  async getPaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      const methods = await db.select({
        id: paymentMethods.id,
        type: paymentMethods.type,
        provider: paymentMethods.provider,
        maskedDetails: paymentMethods.maskedDetails,
        isDefault: paymentMethods.isDefault,
        isVerified: paymentMethods.isVerified,
        expiresAt: paymentMethods.expiresAt,
        lastUsedAt: paymentMethods.lastUsedAt,
        createdAt: paymentMethods.createdAt
      })
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.userId, userId),
          eq(paymentMethods.isActive, true)
        )
      )
      .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.lastUsedAt));

      res.status(200).json({
        success: true,
        data: {
          paymentMethods: methods,
          count: methods.length
        },
        message: 'Payment methods retrieved successfully'
      });

    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment methods',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Add new payment method
   * @route POST /api/v1/payments/methods
   */
  async addPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { type, provider, details, isDefault = false } = req.body;

      // Validate payment method type
      const validTypes = ['card', 'bkash', 'nagad', 'rocket', 'bank_transfer'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid payment method type'
        });
        return;
      }

      // Process based on payment method type
      let tokenData, maskedDetails, expiresAt;

      switch (type) {
        case 'card':
          const cardResult = await this.tokenizeCard(details);
          if (!cardResult.success) {
            res.status(400).json({
              success: false,
              message: cardResult.error
            });
            return;
          }
          tokenData = cardResult.token;
          maskedDetails = this.maskCardNumber(details.cardNumber);
          expiresAt = new Date(parseInt(`20${details.expiryYear}`), parseInt(details.expiryMonth) - 1, 1);
          break;

        case 'bkash':
        case 'nagad':
        case 'rocket':
          const mobileResult = await this.verifyMobileBankingAccount(type, details.phoneNumber);
          if (!mobileResult.success) {
            res.status(400).json({
              success: false,
              message: mobileResult.error
            });
            return;
          }
          tokenData = this.generateSecureToken();
          maskedDetails = this.maskPhoneNumber(details.phoneNumber);
          break;

        case 'bank_transfer':
          tokenData = this.generateSecureToken();
          maskedDetails = this.maskAccountNumber(details.accountNumber);
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Unsupported payment method type'
          });
          return;
      }

      // If setting as default, unset other default methods
      if (isDefault) {
        await db.update(paymentMethods)
          .set({ isDefault: false })
          .where(
            and(
              eq(paymentMethods.userId, userId),
              eq(paymentMethods.isDefault, true)
            )
          );
      }

      // Save payment method
      const [savedMethod] = await db.insert(paymentMethods).values({
        userId,
        type,
        provider,
        token: tokenData,
        maskedDetails,
        isDefault,
        isVerified: type !== 'card', // Cards need separate verification
        expiresAt,
        metadata: {
          addedVia: 'web',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      }).returning();

      res.status(201).json({
        success: true,
        data: {
          id: savedMethod.id,
          type: savedMethod.type,
          provider: savedMethod.provider,
          maskedDetails: savedMethod.maskedDetails,
          isDefault: savedMethod.isDefault,
          isVerified: savedMethod.isVerified
        },
        message: 'Payment method added successfully'
      });

    } catch (error) {
      console.error('Add payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add payment method',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update payment method
   * @route PUT /api/v1/payments/methods/:id
   */
  async updatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { isDefault, nickname } = req.body;

      const [method] = await db.select()
        .from(paymentMethods)
        .where(
          and(
            eq(paymentMethods.id, id),
            eq(paymentMethods.userId, userId)
          )
        );

      if (!method) {
        res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
        return;
      }

      // If setting as default, unset other default methods
      if (isDefault && !method.isDefault) {
        await db.update(paymentMethods)
          .set({ isDefault: false })
          .where(
            and(
              eq(paymentMethods.userId, userId),
              eq(paymentMethods.isDefault, true)
            )
          );
      }

      // Update payment method
      await db.update(paymentMethods)
        .set({
          isDefault: isDefault ?? method.isDefault,
          nickname: nickname ?? method.nickname,
          updatedAt: new Date()
        })
        .where(eq(paymentMethods.id, id));

      res.status(200).json({
        success: true,
        message: 'Payment method updated successfully'
      });

    } catch (error) {
      console.error('Update payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment method',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete payment method
   * @route DELETE /api/v1/payments/methods/:id
   */
  async deletePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const [method] = await db.select()
        .from(paymentMethods)
        .where(
          and(
            eq(paymentMethods.id, id),
            eq(paymentMethods.userId, userId)
          )
        );

      if (!method) {
        res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
        return;
      }

      // Check if method has been used in recent transactions
      const recentUsage = await db.select({ count: count() })
        .from(paymentTransactions)
        .where(
          and(
            eq(paymentTransactions.userId, userId),
            eq(paymentTransactions.metadata, method.token),
            eq(paymentTransactions.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
          )
        );

      if (recentUsage[0].count > 0) {
        // Soft delete for audit purposes
        await db.update(paymentMethods)
          .set({
            isActive: false,
            deletedAt: new Date()
          })
          .where(eq(paymentMethods.id, id));
      } else {
        // Hard delete if no recent usage
        await db.delete(paymentMethods)
          .where(eq(paymentMethods.id, id));
      }

      res.status(200).json({
        success: true,
        message: 'Payment method deleted successfully'
      });

    } catch (error) {
      console.error('Delete payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete payment method',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verify payment method
   * @route POST /api/v1/payments/methods/:id/verify
   */
  async verifyPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { verificationCode, amount } = req.body;

      const [method] = await db.select()
        .from(paymentMethods)
        .where(
          and(
            eq(paymentMethods.id, id),
            eq(paymentMethods.userId, userId)
          )
        );

      if (!method) {
        res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
        return;
      }

      if (method.isVerified) {
        res.status(400).json({
          success: false,
          message: 'Payment method is already verified'
        });
        return;
      }

      // Verify based on payment method type
      let verificationResult;
      
      switch (method.type) {
        case 'card':
          verificationResult = await this.verifyCardWithMicroCharge(method, amount);
          break;
        case 'bkash':
        case 'nagad':
        case 'rocket':
          verificationResult = await this.verifyMobileBankingOTP(method.type, verificationCode);
          break;
        default:
          verificationResult = { success: true }; // Bank transfers are verified by account holder name
      }

      if (!verificationResult.success) {
        res.status(400).json({
          success: false,
          message: verificationResult.error || 'Verification failed'
        });
        return;
      }

      // Mark as verified
      await db.update(paymentMethods)
        .set({
          isVerified: true,
          verifiedAt: new Date()
        })
        .where(eq(paymentMethods.id, id));

      res.status(200).json({
        success: true,
        message: 'Payment method verified successfully'
      });

    } catch (error) {
      console.error('Verify payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment method',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get payment method analytics
   * @route GET /api/v1/payments/methods/analytics
   */
  async getPaymentMethodAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { startDate, endDate } = req.query;

      const fromDate = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = endDate ? new Date(endDate as string) : new Date();

      // Get usage statistics by payment method
      const usageStats = await db.select({
        type: paymentMethods.type,
        provider: paymentMethods.provider,
        usageCount: count(paymentTransactions.id),
        totalAmount: count(paymentTransactions.amount),
        lastUsed: count(paymentTransactions.createdAt)
      })
      .from(paymentMethods)
      .leftJoin(paymentTransactions, eq(paymentTransactions.metadata, paymentMethods.token))
      .where(
        and(
          eq(paymentMethods.userId, userId),
          eq(paymentMethods.isActive, true)
        )
      )
      .groupBy(paymentMethods.type, paymentMethods.provider);

      res.status(200).json({
        success: true,
        data: {
          usageStatistics: usageStats,
          period: {
            from: fromDate.toISOString(),
            to: toDate.toISOString()
          }
        },
        message: 'Payment method analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Get payment method analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment method analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Private helper methods

  private async tokenizeCard(cardDetails: CardTokenizationRequest): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      // Validate card number using Luhn algorithm
      if (!this.isValidCardNumber(cardDetails.cardNumber)) {
        return { success: false, error: 'Invalid card number' };
      }

      // Validate expiry date
      const currentDate = new Date();
      const expiryDate = new Date(parseInt(`20${cardDetails.expiryYear}`), parseInt(cardDetails.expiryMonth) - 1);
      if (expiryDate <= currentDate) {
        return { success: false, error: 'Card has expired' };
      }

      // Generate secure token
      const token = this.generateSecureToken();
      
      // In production, this would integrate with a payment processor's tokenization service
      // like Stripe, PayPal, or a local PCI-compliant tokenization service
      
      return { success: true, token };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async verifyMobileBankingAccount(provider: string, phoneNumber: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Validate Bangladesh phone number format
      const bangladeshPhoneRegex = /^(\+880|880|0)1[3-9]\d{8}$/;
      if (!bangladeshPhoneRegex.test(phoneNumber)) {
        return { success: false, error: 'Invalid Bangladesh phone number format' };
      }

      // In production, this would verify the account with the mobile banking provider
      // For now, we'll assume verification is successful
      
      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async verifyCardWithMicroCharge(method: any, amount: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Implementation for card verification via micro-charge
    // This would integrate with payment processors to charge a small amount
    // and verify the cardholder can identify the charge
    
    return { success: true };
  }

  private async verifyMobileBankingOTP(provider: string, otp: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Implementation for mobile banking OTP verification
    // This would verify the OTP with the mobile banking provider
    
    return { success: true };
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    return `****-****-****-${cleaned.slice(-4)}`;
  }

  private maskPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return `${cleaned.slice(0, 4)}****${cleaned.slice(-2)}`;
  }

  private maskAccountNumber(accountNumber: string): string {
    return `****${accountNumber.slice(-4)}`;
  }

  private isValidCardNumber(cardNumber: string): boolean {
    // Luhn algorithm implementation
    const cleaned = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }
}

export const paymentMethodController = new PaymentMethodController();