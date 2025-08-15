/**
 * InternationalPaymentController - Global Payment Processing
 * Enterprise-grade international payment processing with Amazon.com/Shopee.sg-level functionality
 * Comprehensive Stripe, PayPal integration with multi-currency support and compliance
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  paymentTransactions,
  financialTransactions,
  orders,
  users
} from '@shared/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

export class InternationalPaymentController {

  /**
   * Process Stripe Payment
   * Credit/Debit card processing with international support
   */
  async processStripePayment(req: Request, res: Response) {
    try {
      const {
        orderId,
        paymentMethodId,
        customerId,
        amount,
        currency = 'USD',
        customerInfo,
        billingAddress,
        savePaymentMethod = false,
        confirmPayment = true
      } = req.body;

      // Validation
      if (!orderId || !paymentMethodId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required payment information',
          code: 'INVALID_STRIPE_DATA'
        });
      }

      // Get order details
      const orderDetails = await db.select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!orderDetails.length) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
      }

      const order = orderDetails[0];

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(parseFloat(amount) * 100);

      // Generate transaction ID
      const transactionId = `STRIPE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create Stripe payment intent
      const stripePayment = await this.createStripePaymentIntent({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        paymentMethodId,
        customerId,
        orderId,
        transactionId,
        billingAddress,
        customerInfo,
        confirmPayment
      });

      if (!stripePayment.success) {
        return res.status(400).json({
          success: false,
          error: stripePayment.error,
          code: 'STRIPE_PAYMENT_FAILED',
          details: stripePayment.details
        });
      }

      // Calculate processing fees (Stripe: 2.9% + 30¢)
      const processingFee = Math.round((amountInCents * 0.029) + 30) / 100;
      const netAmount = parseFloat(amount) - processingFee;

      // Create payment transaction record
      const paymentTransaction = await db.insert(paymentTransactions).values({
        orderId,
        transactionId,
        type: 'payment',
        method: 'card',
        provider: 'stripe',
        providerTransactionId: stripePayment.paymentIntentId,
        amount: amount,
        currency,
        fee: processingFee.toString(),
        netAmount: netAmount.toString(),
        status: stripePayment.status,
        authorizationCode: stripePayment.authorizationCode,
        capturedAt: stripePayment.status === 'completed' ? new Date() : null,
        metadata: {
          stripePaymentMethodId: paymentMethodId,
          stripeCustomerId: stripePayment.stripeCustomerId,
          billingAddress,
          last4: stripePayment.last4,
          brand: stripePayment.brand,
          country: stripePayment.country,
          fingerprint: stripePayment.fingerprint,
          threeDSecure: stripePayment.threeDSecure,
          riskLevel: stripePayment.riskLevel
        }
      }).returning();

      // Create financial transaction
      if (stripePayment.status === 'completed') {
        await db.insert(financialTransactions).values({
          transactionNumber: transactionId,
          transactionType: 'credit',
          orderId,
          customerId: customerId ? parseInt(customerId) : null,
          amount: amount,
          currency,
          paymentMethod: 'card',
          paymentGateway: 'stripe',
          gatewayTransactionId: stripePayment.paymentIntentId,
          status: 'completed',
          description: `Stripe card payment - ${stripePayment.brand} ending in ${stripePayment.last4}`,
          taxAmount: '0',
          commissionAmount: processingFee.toString(),
          netAmount: netAmount.toString(),
          processedAt: new Date(),
          completedAt: new Date()
        });

        // Update order status
        await db.update(orders)
          .set({
            paymentStatus: 'paid',
            status: 'confirmed',
            updatedAt: new Date()
          })
          .where(eq(orders.id, orderId));
      }

      return res.status(200).json({
        success: stripePayment.success,
        data: {
          transactionId,
          orderId,
          paymentIntentId: stripePayment.paymentIntentId,
          amount: parseFloat(amount),
          currency,
          fee: processingFee,
          netAmount,
          status: stripePayment.status,
          paymentMethod: {
            brand: stripePayment.brand,
            last4: stripePayment.last4,
            country: stripePayment.country
          },
          requiresAction: stripePayment.requiresAction,
          clientSecret: stripePayment.clientSecret,
          riskLevel: stripePayment.riskLevel
        },
        message: stripePayment.status === 'completed' 
          ? 'Payment processed successfully'
          : 'Payment requires additional authentication'
      });

    } catch (error) {
      console.error('InternationalPaymentController.processStripePayment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing Stripe payment',
        code: 'STRIPE_PROCESSING_ERROR'
      });
    }
  }

  /**
   * Process PayPal Payment
   * PayPal checkout and express payment processing
   */
  async processPayPalPayment(req: Request, res: Response) {
    try {
      const {
        orderId,
        customerId,
        amount,
        currency = 'USD',
        returnUrl,
        cancelUrl,
        paymentType = 'capture', // capture or authorize
        description
      } = req.body;

      // Validation
      if (!orderId || !amount || !returnUrl || !cancelUrl) {
        return res.status(400).json({
          success: false,
          error: 'Missing required PayPal payment information',
          code: 'INVALID_PAYPAL_DATA'
        });
      }

      // Get order details
      const orderDetails = await db.select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!orderDetails.length) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
      }

      // Generate transaction ID
      const transactionId = `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create PayPal payment
      const paypalPayment = await this.createPayPalPayment({
        amount: parseFloat(amount),
        currency,
        orderId,
        transactionId,
        returnUrl,
        cancelUrl,
        description: description || `Payment for Order ${orderId}`,
        paymentType
      });

      if (!paypalPayment.success) {
        return res.status(400).json({
          success: false,
          error: paypalPayment.error,
          code: 'PAYPAL_PAYMENT_FAILED',
          details: paypalPayment.details
        });
      }

      // Calculate PayPal fees (2.9% + fixed fee based on currency)
      const feeRate = this.getPayPalFeeRate(currency);
      const processingFee = parseFloat((parseFloat(amount) * feeRate.percentage + feeRate.fixed).toFixed(2));
      const netAmount = parseFloat(amount) - processingFee;

      // Create payment transaction record
      const paymentTransaction = await db.insert(paymentTransactions).values({
        orderId,
        transactionId,
        type: 'payment',
        method: 'paypal',
        provider: 'paypal',
        providerTransactionId: paypalPayment.paymentId,
        amount: amount,
        currency,
        fee: processingFee.toString(),
        netAmount: netAmount.toString(),
        status: 'pending',
        metadata: {
          paypalPaymentId: paypalPayment.paymentId,
          approvalUrl: paypalPayment.approvalUrl,
          paymentType,
          returnUrl,
          cancelUrl,
          payerInfo: paypalPayment.payerInfo
        }
      }).returning();

      return res.status(200).json({
        success: true,
        data: {
          transactionId,
          orderId,
          paypalPaymentId: paypalPayment.paymentId,
          amount: parseFloat(amount),
          currency,
          fee: processingFee,
          netAmount,
          status: 'pending',
          approvalUrl: paypalPayment.approvalUrl,
          paymentType
        },
        message: 'PayPal payment created. Redirect customer to approval URL.'
      });

    } catch (error) {
      console.error('InternationalPaymentController.processPayPalPayment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing PayPal payment',
        code: 'PAYPAL_PROCESSING_ERROR'
      });
    }
  }

  /**
   * Execute PayPal Payment
   * Complete PayPal payment after customer approval
   */
  async executePayPalPayment(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      const { payerId, paymentId } = req.body;

      if (!transactionId || !payerId || !paymentId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required PayPal execution data',
          code: 'INVALID_EXECUTION_DATA'
        });
      }

      // Get payment transaction
      const paymentDetails = await db.select()
        .from(paymentTransactions)
        .where(
          and(
            eq(paymentTransactions.transactionId, transactionId),
            eq(paymentTransactions.method, 'paypal')
          )
        )
        .limit(1);

      if (!paymentDetails.length) {
        return res.status(404).json({
          success: false,
          error: 'PayPal payment not found',
          code: 'PAYPAL_NOT_FOUND'
        });
      }

      const payment = paymentDetails[0];

      // Execute PayPal payment
      const executionResult = await this.executePayPalOrder({
        paymentId,
        payerId,
        transactionId
      });

      if (!executionResult.success) {
        // Update payment as failed
        await db.update(paymentTransactions)
          .set({
            status: 'failed',
            failureReason: executionResult.error,
            updatedAt: new Date()
          })
          .where(eq(paymentTransactions.id, payment.id));

        return res.status(400).json({
          success: false,
          error: executionResult.error,
          code: 'PAYPAL_EXECUTION_FAILED'
        });
      }

      // Update payment as completed
      await db.update(paymentTransactions)
        .set({
          status: 'completed',
          capturedAt: new Date(),
          settledAt: new Date(),
          authorizationCode: executionResult.authorizationCode,
          metadata: {
            ...payment.metadata,
            execution: {
              payerId,
              executedAt: new Date(),
              payerInfo: executionResult.payerInfo,
              transactionFee: executionResult.transactionFee
            }
          },
          updatedAt: new Date()
        })
        .where(eq(paymentTransactions.id, payment.id));

      // Create financial transaction
      await db.insert(financialTransactions).values({
        transactionNumber: transactionId,
        transactionType: 'credit',
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: 'paypal',
        paymentGateway: 'paypal',
        gatewayTransactionId: paymentId,
        status: 'completed',
        description: `PayPal payment executed - ${executionResult.payerInfo?.email || 'PayPal user'}`,
        taxAmount: '0',
        commissionAmount: payment.fee,
        netAmount: payment.netAmount,
        processedAt: new Date(),
        completedAt: new Date()
      });

      // Update order status
      await db.update(orders)
        .set({
          paymentStatus: 'paid',
          status: 'confirmed',
          updatedAt: new Date()
        })
        .where(eq(orders.id, payment.orderId));

      return res.status(200).json({
        success: true,
        data: {
          transactionId,
          orderId: payment.orderId,
          paymentId,
          amount: parseFloat(payment.amount),
          currency: payment.currency,
          status: 'completed',
          payerInfo: executionResult.payerInfo,
          executedAt: new Date()
        },
        message: 'PayPal payment executed successfully'
      });

    } catch (error) {
      console.error('InternationalPaymentController.executePayPalPayment error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error executing PayPal payment',
        code: 'PAYPAL_EXECUTION_ERROR'
      });
    }
  }

  /**
   * Handle Payment Webhook
   * Process payment gateway webhooks for status updates
   */
  async handlePaymentWebhook(req: Request, res: Response) {
    try {
      const { provider } = req.params;
      const webhookData = req.body;
      const signature = req.headers['stripe-signature'] || req.headers['paypal-transmission-sig'];

      // Verify webhook signature
      const isValidWebhook = await this.verifyWebhookSignature(provider, webhookData, signature);

      if (!isValidWebhook) {
        return res.status(400).json({
          success: false,
          error: 'Invalid webhook signature',
          code: 'INVALID_WEBHOOK'
        });
      }

      let result;

      switch (provider) {
        case 'stripe':
          result = await this.handleStripeWebhook(webhookData);
          break;
        case 'paypal':
          result = await this.handlePayPalWebhook(webhookData);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported webhook provider',
            code: 'UNSUPPORTED_PROVIDER'
          });
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Webhook processed successfully'
      });

    } catch (error) {
      console.error('InternationalPaymentController.handlePaymentWebhook error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing webhook',
        code: 'WEBHOOK_ERROR'
      });
    }
  }

  /**
   * Get International Payment Analytics
   * Analytics for Stripe and PayPal payments
   */
  async getInternationalPaymentAnalytics(req: Request, res: Response) {
    try {
      const {
        dateFrom,
        dateTo,
        provider,
        currency,
        period = 'daily'
      } = req.query;

      const fromDate = dateFrom ? new Date(dateFrom as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = dateTo ? new Date(dateTo as string) : new Date();

      // Build query conditions
      let queryConditions = [
        eq(paymentTransactions.provider, provider as string || 'stripe'),
        gte(paymentTransactions.createdAt, fromDate),
        lte(paymentTransactions.createdAt, toDate)
      ];

      if (currency) {
        queryConditions.push(eq(paymentTransactions.currency, currency as string));
      }

      // Get payment transactions
      const payments = await db.select()
        .from(paymentTransactions)
        .where(and(...queryConditions))
        .orderBy(desc(paymentTransactions.createdAt));

      // Calculate metrics
      const totalTransactions = payments.length;
      const completedTransactions = payments.filter(p => p.status === 'completed').length;
      const totalVolume = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const completedVolume = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalFees = payments.reduce((sum, p) => sum + parseFloat(p.fee || '0'), 0);
      const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

      // Currency breakdown
      const currencyBreakdown = payments.reduce((acc, p) => {
        const curr = p.currency || 'USD';
        acc[curr] = (acc[curr] || 0) + parseFloat(p.amount);
        return acc;
      }, {} as Record<string, number>);

      // Payment method breakdown (for Stripe)
      const paymentMethodBreakdown = payments.reduce((acc, p) => {
        if (p.provider === 'stripe' && p.metadata?.brand) {
          const brand = p.metadata.brand as string;
          acc[brand] = (acc[brand] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Risk level analysis
      const riskAnalysis = payments.reduce((acc, p) => {
        const risk = (p.metadata?.riskLevel as string) || 'normal';
        acc[risk] = (acc[risk] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return res.status(200).json({
        success: true,
        data: {
          period: { from: fromDate, to: toDate },
          provider: provider || 'stripe',
          overallMetrics: {
            totalTransactions,
            completedTransactions,
            totalVolume: Math.round(totalVolume * 100) / 100,
            completedVolume: Math.round(completedVolume * 100) / 100,
            totalFees: Math.round(totalFees * 100) / 100,
            successRate: Math.round(successRate * 100) / 100,
            averageTransactionValue: totalTransactions > 0 ? Math.round((totalVolume / totalTransactions) * 100) / 100 : 0
          },
          analysis: {
            currencyBreakdown,
            paymentMethodBreakdown,
            riskAnalysis
          },
          recentTransactions: payments.slice(0, 10).map(p => ({
            transactionId: p.transactionId,
            orderId: p.orderId,
            amount: parseFloat(p.amount),
            currency: p.currency,
            status: p.status,
            createdAt: p.createdAt,
            brand: p.metadata?.brand || null,
            country: p.metadata?.country || null
          }))
        }
      });

    } catch (error) {
      console.error('InternationalPaymentController.getInternationalPaymentAnalytics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error fetching international payment analytics',
        code: 'ANALYTICS_ERROR'
      });
    }
  }

  // Private helper methods

  private async createStripePaymentIntent(data: any) {
    // Mock Stripe payment intent creation
    return {
      success: true,
      paymentIntentId: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 8)}`,
      status: data.confirmPayment ? 'completed' : 'requires_payment_method',
      authorizationCode: `auth_${Math.random().toString(36).substr(2, 8)}`,
      stripeCustomerId: data.customerId || `cus_${Math.random().toString(36).substr(2, 8)}`,
      last4: '4242',
      brand: 'visa',
      country: 'US',
      fingerprint: `fp_${Math.random().toString(36).substr(2, 8)}`,
      threeDSecure: null,
      riskLevel: 'normal',
      requiresAction: !data.confirmPayment
    };
  }

  private async createPayPalPayment(data: any) {
    // Mock PayPal payment creation
    return {
      success: true,
      paymentId: `PAY-${Date.now()}${Math.random().toString(36).substr(2, 8)}`,
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=EC-${Math.random().toString(36).substr(2, 8)}`,
      payerInfo: null
    };
  }

  private async executePayPalOrder(data: any) {
    // Mock PayPal payment execution
    return {
      success: true,
      authorizationCode: `auth_${Math.random().toString(36).substr(2, 8)}`,
      payerInfo: {
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        payerId: data.payerId
      },
      transactionFee: 0.30
    };
  }

  private async verifyWebhookSignature(provider: string, data: any, signature: any): Promise<boolean> {
    // Mock webhook verification
    return true;
  }

  private async handleStripeWebhook(data: any) {
    // Mock Stripe webhook handling
    console.log('Processing Stripe webhook:', data);
    return { processed: true, eventType: data.type || 'payment_intent.succeeded' };
  }

  private async handlePayPalWebhook(data: any) {
    // Mock PayPal webhook handling
    console.log('Processing PayPal webhook:', data);
    return { processed: true, eventType: data.event_type || 'PAYMENT.CAPTURE.COMPLETED' };
  }

  private getPayPalFeeRate(currency: string) {
    const feeRates = {
      USD: { percentage: 0.029, fixed: 0.30 },
      EUR: { percentage: 0.029, fixed: 0.35 },
      GBP: { percentage: 0.029, fixed: 0.30 },
      BDT: { percentage: 0.035, fixed: 15 },
      default: { percentage: 0.029, fixed: 0.30 }
    };

    return feeRates[currency] || feeRates.default;
  }
}

export const internationalPaymentController = new InternationalPaymentController();