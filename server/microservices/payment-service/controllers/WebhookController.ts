/**
 * Webhook Controller - Amazon.com/Shopee.sg Level
 * Comprehensive webhook management for all payment gateways
 * Secure webhook processing with signature validation and idempotency
 */

import { Request, Response } from 'express';
import { db } from '../../../db';
import { 
  paymentWebhooks, 
  paymentTransactions, 
  orders,
  orderItems,
  vendorPayouts
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

interface WebhookPayload {
  id: string;
  event: string;
  data: any;
  created: number;
  livemode: boolean;
}

interface BkashWebhookData {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
}

interface StripeWebhookData {
  id: string;
  object: string;
  amount: number;
  currency: string;
  status: string;
  payment_intent: string;
  metadata: Record<string, string>;
}

export class WebhookController {

  /**
   * Process bKash webhook notifications
   * @route POST /api/v1/payments/webhooks/bkash
   */
  async processBkashWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-bkash-signature'] as string;
      const payload = req.body;

      // Verify bKash webhook signature
      if (!this.verifyBkashSignature(payload, signature)) {
        res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
        return;
      }

      // Check for webhook idempotency
      const existingWebhook = await this.checkWebhookIdempotency('bkash', payload.trxID);
      if (existingWebhook) {
        res.status(200).json({ success: true, message: 'Webhook already processed' });
        return;
      }

      // Log webhook
      const [webhookRecord] = await db.insert(paymentWebhooks).values({
        provider: 'bkash',
        eventType: 'payment.completed',
        externalId: payload.trxID,
        payload: payload,
        signature: signature,
        status: 'processing'
      }).returning();

      // Process bKash payment update
      await this.processBkashPaymentUpdate(payload);

      // Update webhook status
      await db.update(paymentWebhooks)
        .set({ 
          status: 'processed',
          processedAt: new Date()
        })
        .where(eq(paymentWebhooks.id, webhookRecord.id));

      res.status(200).json({
        success: true,
        message: 'bKash webhook processed successfully'
      });

    } catch (error) {
      console.error('bKash webhook error:', error);
      
      // Mark webhook as failed
      if (req.body.trxID) {
        try {
          await db.update(paymentWebhooks)
            .set({ 
              status: 'failed',
              errorMessage: error.message,
              processedAt: new Date()
            })
            .where(eq(paymentWebhooks.externalId, req.body.trxID));
        } catch (dbError) {
          console.error('Failed to update webhook status:', dbError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process bKash webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Process Nagad webhook notifications
   * @route POST /api/v1/payments/webhooks/nagad
   */
  async processNagadWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-nagad-signature'] as string;
      const payload = req.body;

      // Verify Nagad webhook signature
      if (!this.verifyNagadSignature(payload, signature)) {
        res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
        return;
      }

      // Check for webhook idempotency
      const existingWebhook = await this.checkWebhookIdempotency('nagad', payload.paymentRefId);
      if (existingWebhook) {
        res.status(200).json({ success: true, message: 'Webhook already processed' });
        return;
      }

      // Log webhook
      const [webhookRecord] = await db.insert(paymentWebhooks).values({
        provider: 'nagad',
        eventType: 'payment.completed',
        externalId: payload.paymentRefId,
        payload: payload,
        signature: signature,
        status: 'processing'
      }).returning();

      // Process Nagad payment update
      await this.processNagadPaymentUpdate(payload);

      // Update webhook status
      await db.update(paymentWebhooks)
        .set({ 
          status: 'processed',
          processedAt: new Date()
        })
        .where(eq(paymentWebhooks.id, webhookRecord.id));

      res.status(200).json({
        success: true,
        message: 'Nagad webhook processed successfully'
      });

    } catch (error) {
      console.error('Nagad webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process Nagad webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Process Stripe webhook notifications
   * @route POST /api/v1/payments/webhooks/stripe
   */
  async processStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      // Verify Stripe webhook signature
      if (!this.verifyStripeSignature(JSON.stringify(payload), signature)) {
        res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
        return;
      }

      // Check for webhook idempotency
      const existingWebhook = await this.checkWebhookIdempotency('stripe', payload.id);
      if (existingWebhook) {
        res.status(200).json({ success: true, message: 'Webhook already processed' });
        return;
      }

      // Log webhook
      const [webhookRecord] = await db.insert(paymentWebhooks).values({
        provider: 'stripe',
        eventType: payload.type,
        externalId: payload.id,
        payload: payload,
        signature: signature,
        status: 'processing'
      }).returning();

      // Process based on event type
      switch (payload.type) {
        case 'payment_intent.succeeded':
          await this.processStripePaymentSuccess(payload.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.processStripePaymentFailure(payload.data.object);
          break;
        case 'charge.dispute.created':
          await this.processStripeDispute(payload.data.object);
          break;
        default:
          console.log(`Unhandled Stripe event type: ${payload.type}`);
      }

      // Update webhook status
      await db.update(paymentWebhooks)
        .set({ 
          status: 'processed',
          processedAt: new Date()
        })
        .where(eq(paymentWebhooks.id, webhookRecord.id));

      res.status(200).json({
        success: true,
        message: 'Stripe webhook processed successfully'
      });

    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process Stripe webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get webhook logs and analytics
   * @route GET /api/v1/payments/webhooks/logs
   */
  async getWebhookLogs(req: Request, res: Response): Promise<void> {
    try {
      const { 
        provider, 
        status, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 20 
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      let whereConditions = [];
      if (provider) whereConditions.push(eq(paymentWebhooks.provider, provider as string));
      if (status) whereConditions.push(eq(paymentWebhooks.status, status as string));
      if (startDate) whereConditions.push(eq(paymentWebhooks.createdAt, new Date(startDate as string)));
      if (endDate) whereConditions.push(eq(paymentWebhooks.createdAt, new Date(endDate as string)));

      const webhooks = await db.select({
        id: paymentWebhooks.id,
        provider: paymentWebhooks.provider,
        eventType: paymentWebhooks.eventType,
        externalId: paymentWebhooks.externalId,
        status: paymentWebhooks.status,
        errorMessage: paymentWebhooks.errorMessage,
        createdAt: paymentWebhooks.createdAt,
        processedAt: paymentWebhooks.processedAt
      })
      .from(paymentWebhooks)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(paymentWebhooks.createdAt)
      .limit(Number(limit))
      .offset(offset);

      res.status(200).json({
        success: true,
        data: {
          webhooks,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: webhooks.length
          }
        },
        message: 'Webhook logs retrieved successfully'
      });

    } catch (error) {
      console.error('Get webhook logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve webhook logs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Retry failed webhook processing
   * @route POST /api/v1/payments/webhooks/:id/retry
   */
  async retryWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const [webhook] = await db.select()
        .from(paymentWebhooks)
        .where(eq(paymentWebhooks.id, id));

      if (!webhook) {
        res.status(404).json({
          success: false,
          message: 'Webhook not found'
        });
        return;
      }

      if (webhook.status !== 'failed') {
        res.status(400).json({
          success: false,
          message: 'Can only retry failed webhooks'
        });
        return;
      }

      // Update status to processing
      await db.update(paymentWebhooks)
        .set({ 
          status: 'processing',
          errorMessage: null,
          retryCount: webhook.retryCount + 1
        })
        .where(eq(paymentWebhooks.id, id));

      // Reprocess based on provider
      switch (webhook.provider) {
        case 'bkash':
          await this.processBkashPaymentUpdate(webhook.payload);
          break;
        case 'nagad':
          await this.processNagadPaymentUpdate(webhook.payload);
          break;
        case 'stripe':
          if (webhook.eventType === 'payment_intent.succeeded') {
            await this.processStripePaymentSuccess(webhook.payload.data.object);
          }
          break;
      }

      // Update status to processed
      await db.update(paymentWebhooks)
        .set({ 
          status: 'processed',
          processedAt: new Date()
        })
        .where(eq(paymentWebhooks.id, id));

      res.status(200).json({
        success: true,
        message: 'Webhook retried successfully'
      });

    } catch (error) {
      console.error('Retry webhook error:', error);
      
      // Mark as failed again
      await db.update(paymentWebhooks)
        .set({ 
          status: 'failed',
          errorMessage: error.message
        })
        .where(eq(paymentWebhooks.id, req.params.id));

      res.status(500).json({
        success: false,
        message: 'Failed to retry webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Private helper methods

  private verifyBkashSignature(payload: any, signature: string): boolean {
    const secret = process.env.BKASH_WEBHOOK_SECRET || 'test-secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  private verifyNagadSignature(payload: any, signature: string): boolean {
    const secret = process.env.NAGAD_WEBHOOK_SECRET || 'test-secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  private verifyStripeSignature(payload: string, signature: string): boolean {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'test-secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return signature.includes(expectedSignature);
  }

  private async checkWebhookIdempotency(provider: string, externalId: string): Promise<boolean> {
    const existing = await db.select()
      .from(paymentWebhooks)
      .where(
        and(
          eq(paymentWebhooks.provider, provider),
          eq(paymentWebhooks.externalId, externalId),
          eq(paymentWebhooks.status, 'processed')
        )
      )
      .limit(1);

    return existing.length > 0;
  }

  private async processBkashPaymentUpdate(payload: BkashWebhookData): Promise<void> {
    const transaction = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.providerTransactionId, payload.trxID))
      .limit(1);

    if (transaction.length === 0) {
      throw new Error(`Transaction not found for bKash trxID: ${payload.trxID}`);
    }

    const status = payload.transactionStatus === 'Completed' ? 'completed' : 'failed';
    
    await db.update(paymentTransactions)
      .set({
        status,
        settledAt: status === 'completed' ? new Date() : null,
        metadata: { ...transaction[0].metadata, webhookData: payload }
      })
      .where(eq(paymentTransactions.id, transaction[0].id));

    // Update order status if payment completed
    if (status === 'completed') {
      await this.updateOrderStatus(transaction[0].orderId, 'confirmed');
    }
  }

  private async processNagadPaymentUpdate(payload: any): Promise<void> {
    // Similar to bKash processing
    const transaction = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.providerTransactionId, payload.paymentRefId))
      .limit(1);

    if (transaction.length === 0) {
      throw new Error(`Transaction not found for Nagad paymentRefId: ${payload.paymentRefId}`);
    }

    const status = payload.status === 'Success' ? 'completed' : 'failed';
    
    await db.update(paymentTransactions)
      .set({
        status,
        settledAt: status === 'completed' ? new Date() : null,
        metadata: { ...transaction[0].metadata, webhookData: payload }
      })
      .where(eq(paymentTransactions.id, transaction[0].id));

    if (status === 'completed') {
      await this.updateOrderStatus(transaction[0].orderId, 'confirmed');
    }
  }

  private async processStripePaymentSuccess(paymentIntent: StripeWebhookData): Promise<void> {
    const transaction = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.providerTransactionId, paymentIntent.id))
      .limit(1);

    if (transaction.length === 0) {
      throw new Error(`Transaction not found for Stripe payment intent: ${paymentIntent.id}`);
    }

    await db.update(paymentTransactions)
      .set({
        status: 'completed',
        settledAt: new Date(),
        metadata: { ...transaction[0].metadata, stripePaymentIntent: paymentIntent }
      })
      .where(eq(paymentTransactions.id, transaction[0].id));

    await this.updateOrderStatus(transaction[0].orderId, 'confirmed');
  }

  private async processStripePaymentFailure(paymentIntent: StripeWebhookData): Promise<void> {
    const transaction = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.providerTransactionId, paymentIntent.id))
      .limit(1);

    if (transaction.length === 0) {
      throw new Error(`Transaction not found for Stripe payment intent: ${paymentIntent.id}`);
    }

    await db.update(paymentTransactions)
      .set({
        status: 'failed',
        failureReason: 'Payment failed via Stripe webhook',
        metadata: { ...transaction[0].metadata, stripePaymentIntent: paymentIntent }
      })
      .where(eq(paymentTransactions.id, transaction[0].id));
  }

  private async processStripeDispute(dispute: any): Promise<void> {
    // Handle Stripe disputes/chargebacks
    console.log('Processing Stripe dispute:', dispute);
    // Implementation for dispute handling
  }

  private async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db.update(orders)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));
  }
}

export const webhookController = new WebhookController();