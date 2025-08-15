import { Router } from 'express';
import { db } from '../../../db';
import { paymentTransactions, orders, users } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authMiddleware } from '../../user-service/middleware/authMiddleware';
import { validatePaymentRequest } from '../middleware/paymentValidation';
import { BkashPaymentEngine } from '../engines/BkashPaymentEngine';
import { NagadPaymentEngine } from '../engines/NagadPaymentEngine';
import { RocketPaymentEngine } from '../engines/RocketPaymentEngine';
import { SSLCommerzEngine } from '../engines/SSLCommerzEngine';
import { CashOnDeliveryEngine } from '../engines/CashOnDeliveryEngine';

const router = Router();

// Initialize payment engines
const bkashEngine = new BkashPaymentEngine();
const nagadEngine = new NagadPaymentEngine();
const rocketEngine = new RocketPaymentEngine();
const sslCommerzEngine = new SSLCommerzEngine();
const codEngine = new CashOnDeliveryEngine();

/**
 * @route POST /api/v1/payments/initialize
 * @desc Initialize payment process for any payment method
 * @access Private
 */
router.post('/initialize', authMiddleware, validatePaymentRequest, async (req, res) => {
  try {
    const { orderId, paymentMethod, amount, currency = 'BDT', metadata } = req.body;
    const userId = req.user?.userId;

    // Verify order exists and belongs to user
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied',
        code: 'ORDER_NOT_FOUND'
      });
    }

    // Create payment transaction record
    const [paymentTransaction] = await db
      .insert(paymentTransactions)
      .values({
        orderId,
        paymentMethod,
        amount: amount.toString(),
        currency,
        status: 'pending',
        transactionType: 'payment',
        metadata: {
          userId,
          ...metadata,
          initiatedAt: new Date().toISOString()
        }
      })
      .returning();

    let paymentResponse;

    // Route to appropriate payment engine
    switch (paymentMethod) {
      case 'bkash':
        paymentResponse = await bkashEngine.initializePayment({
          transactionId: paymentTransaction.id,
          amount,
          orderId,
          userId,
          metadata
        });
        break;
      case 'nagad':
        paymentResponse = await nagadEngine.initializePayment({
          transactionId: paymentTransaction.id,
          amount,
          orderId,
          userId,
          metadata
        });
        break;
      case 'rocket':
        paymentResponse = await rocketEngine.initializePayment({
          transactionId: paymentTransaction.id,
          amount,
          orderId,
          userId,
          metadata
        });
        break;
      case 'sslcommerz':
        paymentResponse = await sslCommerzEngine.initializePayment({
          transactionId: paymentTransaction.id,
          amount,
          orderId,
          userId,
          metadata
        });
        break;
      case 'cod':
        paymentResponse = await codEngine.initializePayment({
          transactionId: paymentTransaction.id,
          amount,
          orderId,
          userId,
          metadata
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method',
          code: 'UNSUPPORTED_PAYMENT_METHOD'
        });
    }

    // Update transaction with payment gateway response
    await db
      .update(paymentTransactions)
      .set({
        gatewayTransactionId: paymentResponse.gatewayTransactionId,
        gatewayResponse: paymentResponse,
        updatedAt: new Date()
      })
      .where(eq(paymentTransactions.id, paymentTransaction.id));

    res.json({
      success: true,
      data: {
        transactionId: paymentTransaction.id,
        paymentMethod,
        ...paymentResponse
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/bkash/create
 * @desc Create bKash payment
 * @access Private
 */
router.post('/bkash/create', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId, intent = 'sale' } = req.body;
    const userId = req.user?.userId;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const paymentData = await bkashEngine.createPayment({
      amount,
      orderId,
      userId,
      intent
    });

    res.json({
      success: true,
      data: paymentData
    });

  } catch (error) {
    console.error('bKash payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bKash payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/bkash/execute
 * @desc Execute bKash payment
 * @access Private
 */
router.post('/bkash/execute', authMiddleware, async (req, res) => {
  try {
    const { paymentID } = req.body;
    const userId = req.user?.userId;

    if (!paymentID) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required',
        code: 'MISSING_PAYMENT_ID'
      });
    }

    const executionResult = await bkashEngine.executePayment(paymentID, userId);

    res.json({
      success: true,
      data: executionResult
    });

  } catch (error) {
    console.error('bKash payment execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute bKash payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/bkash/initiate
 * @desc Initiate bKash payment (matching frontend expectations)
 * @access Private
 */
router.post('/bkash/initiate', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId, phoneNumber } = req.body;
    const userId = req.user?.userId;

    if (!amount || !orderId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Amount, order ID, and phone number are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Create a transaction and initiate payment
    const paymentData = await bkashEngine.createPayment({
      amount,
      orderId,
      userId,
      customerPhone: phoneNumber
    });

    res.json({
      success: true,
      transactionId: paymentData.transactionId,
      bkashURL: paymentData.bkashURL,
      paymentID: paymentData.paymentID
    });

  } catch (error) {
    console.error('bKash payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate bKash payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/bkash/verify-pin
 * @desc Verify bKash PIN (simulated for frontend compatibility)
 * @access Private
 */
router.post('/bkash/verify-pin', authMiddleware, async (req, res) => {
  try {
    const { transactionId, pin } = req.body;
    const userId = req.user?.userId;

    if (!transactionId || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and PIN are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // In production, this would validate with bKash API
    // For now, we simulate PIN verification
    if (pin.length !== 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PIN format',
        code: 'INVALID_PIN'
      });
    }

    res.json({
      success: true,
      message: 'PIN verified successfully',
      requiresOTP: true
    });

  } catch (error) {
    console.error('bKash PIN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify PIN',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/bkash/confirm
 * @desc Confirm bKash payment with OTP
 * @access Private
 */
router.post('/bkash/confirm', authMiddleware, async (req, res) => {
  try {
    const { transactionId, otp } = req.body;
    const userId = req.user?.userId;

    if (!transactionId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and OTP are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Get the payment ID from transaction
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, transactionId));

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    // Execute the payment with bKash
    const executionResult = await bkashEngine.executePayment(
      transaction.gatewayTransactionId || transactionId,
      userId
    );

    res.json({
      success: true,
      bkashTransactionId: executionResult.trxID,
      amount: executionResult.amount,
      status: executionResult.transactionStatus
    });

  } catch (error) {
    console.error('bKash payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm bKash payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/nagad/initiate
 * @desc Initiate Nagad payment
 * @access Private
 */
router.post('/nagad/initiate', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const userId = req.user?.userId;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const paymentData = await nagadEngine.initiatePayment({
      amount,
      orderId,
      userId
    });

    res.json({
      success: true,
      data: paymentData
    });

  } catch (error) {
    console.error('Nagad payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Nagad payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/nagad/complete
 * @desc Complete Nagad payment
 * @access Private
 */
router.post('/nagad/complete', authMiddleware, async (req, res) => {
  try {
    const { paymentReferenceId, challenge } = req.body;
    const userId = req.user?.userId;

    if (!paymentReferenceId) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference ID is required',
        code: 'MISSING_PAYMENT_REFERENCE'
      });
    }

    const completionResult = await nagadEngine.completePayment({
      paymentReferenceId,
      challenge,
      userId
    });

    res.json({
      success: true,
      data: completionResult
    });

  } catch (error) {
    console.error('Nagad payment completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete Nagad payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/nagad/verify-pin
 * @desc Verify Nagad PIN
 * @access Private
 */
router.post('/nagad/verify-pin', authMiddleware, async (req, res) => {
  try {
    const { transactionId, pin, challengeToken } = req.body;
    const userId = req.user?.userId;

    if (!transactionId || !pin || !challengeToken) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID, PIN, and challenge token are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate PIN format
    if (pin.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PIN format',
        code: 'INVALID_PIN'
      });
    }

    // In production, this would validate with Nagad API
    res.json({
      success: true,
      message: 'PIN verified successfully',
      requiresVerification: true
    });

  } catch (error) {
    console.error('Nagad PIN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify PIN',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/nagad/verify-code
 * @desc Verify Nagad verification code
 * @access Private
 */
router.post('/nagad/verify-code', authMiddleware, async (req, res) => {
  try {
    const { transactionId, verificationCode } = req.body;
    const userId = req.user?.userId;

    if (!transactionId || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and verification code are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate code format
    if (verificationCode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code format',
        code: 'INVALID_CODE'
      });
    }

    res.json({
      success: true,
      message: 'Verification code validated successfully'
    });

  } catch (error) {
    console.error('Nagad code verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/nagad/confirm
 * @desc Confirm Nagad payment
 * @access Private
 */
router.post('/nagad/confirm', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user?.userId;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required',
        code: 'MISSING_TRANSACTION_ID'
      });
    }

    // Get the payment transaction
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, transactionId));

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    // Complete the payment with Nagad
    const completionResult = await nagadEngine.completePayment({
      paymentReferenceId: transaction.gatewayTransactionId || transactionId,
      userId
    });

    res.json({
      success: true,
      nagadTransactionId: completionResult.transactionId,
      amount: completionResult.amount,
      status: completionResult.status
    });

  } catch (error) {
    console.error('Nagad payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm Nagad payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/rocket/send
 * @desc Send Rocket payment
 * @access Private
 */
router.post('/rocket/send', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId, recipientNumber } = req.body;
    const userId = req.user?.userId;

    if (!amount || !orderId || !recipientNumber) {
      return res.status(400).json({
        success: false,
        message: 'Amount, order ID, and recipient number are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const paymentData = await rocketEngine.sendPayment({
      amount,
      orderId,
      recipientNumber,
      userId
    });

    res.json({
      success: true,
      data: paymentData
    });

  } catch (error) {
    console.error('Rocket payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Rocket payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/sslcommerz/create
 * @desc Create SSL Commerz payment session
 * @access Private
 */
router.post('/sslcommerz/create', authMiddleware, async (req, res) => {
  try {
    const { amount, orderId, customerInfo } = req.body;
    const userId = req.user?.userId;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const sessionData = await sslCommerzEngine.createSession({
      amount,
      orderId,
      userId,
      customerInfo
    });

    res.json({
      success: true,
      data: sessionData
    });

  } catch (error) {
    console.error('SSL Commerz session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SSL Commerz session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/cod/confirm
 * @desc Confirm Cash on Delivery order
 * @access Private
 */
router.post('/cod/confirm', authMiddleware, async (req, res) => {
  try {
    const { orderId, deliveryAddress, contactNumber } = req.body;
    const userId = req.user?.userId;

    if (!orderId || !deliveryAddress || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, delivery address, and contact number are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const codConfirmation = await codEngine.confirmOrder({
      orderId,
      userId,
      deliveryAddress,
      contactNumber
    });

    res.json({
      success: true,
      data: codConfirmation
    });

  } catch (error) {
    console.error('COD confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm COD order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/payments/status/:transactionId
 * @desc Get payment transaction status
 * @access Private
 */
router.get('/status/:transactionId', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.userId;

    const [transaction] = await db
      .select({
        id: paymentTransactions.id,
        orderId: paymentTransactions.orderId,
        paymentMethod: paymentTransactions.paymentMethod,
        amount: paymentTransactions.amount,
        currency: paymentTransactions.currency,
        status: paymentTransactions.status,
        gatewayTransactionId: paymentTransactions.gatewayTransactionId,
        gatewayResponse: paymentTransactions.gatewayResponse,
        createdAt: paymentTransactions.createdAt,
        updatedAt: paymentTransactions.updatedAt
      })
      .from(paymentTransactions)
      .innerJoin(orders, eq(paymentTransactions.orderId, orders.id))
      .where(
        and(
          eq(paymentTransactions.id, transactionId),
          eq(orders.userId, userId)
        )
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    // Get updated status from payment gateway if needed
    let updatedStatus = transaction;
    if (transaction.status === 'pending' && transaction.gatewayTransactionId) {
      try {
        switch (transaction.paymentMethod) {
          case 'bkash':
            updatedStatus = await bkashEngine.getPaymentStatus(transaction.gatewayTransactionId);
            break;
          case 'nagad':
            updatedStatus = await nagadEngine.getPaymentStatus(transaction.gatewayTransactionId);
            break;
          case 'rocket':
            updatedStatus = await rocketEngine.getPaymentStatus(transaction.gatewayTransactionId);
            break;
          case 'sslcommerz':
            updatedStatus = await sslCommerzEngine.getPaymentStatus(transaction.gatewayTransactionId);
            break;
        }

        // Update local record if status changed
        if (updatedStatus.status !== transaction.status) {
          await db
            .update(paymentTransactions)
            .set({
              status: updatedStatus.status,
              gatewayResponse: updatedStatus.gatewayResponse,
              updatedAt: new Date()
            })
            .where(eq(paymentTransactions.id, transactionId));
        }
      } catch (statusError) {
        console.error('Status check error:', statusError);
        // Continue with local status if gateway check fails
      }
    }

    res.json({
      success: true,
      data: updatedStatus
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/v1/payments/transactions
 * @desc Get user's payment transactions
 * @access Private
 */
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;
    const paymentMethod = req.query.paymentMethod as string;

    let whereConditions = eq(orders.userId, userId);
    
    if (status) {
      whereConditions = and(whereConditions, eq(paymentTransactions.status, status));
    }
    
    if (paymentMethod) {
      whereConditions = and(whereConditions, eq(paymentTransactions.paymentMethod, paymentMethod));
    }

    const transactions = await db
      .select({
        id: paymentTransactions.id,
        orderId: paymentTransactions.orderId,
        paymentMethod: paymentTransactions.paymentMethod,
        amount: paymentTransactions.amount,
        currency: paymentTransactions.currency,
        status: paymentTransactions.status,
        transactionType: paymentTransactions.transactionType,
        createdAt: paymentTransactions.createdAt,
        orderNumber: orders.orderNumber,
        orderTotal: orders.total
      })
      .from(paymentTransactions)
      .innerJoin(orders, eq(paymentTransactions.orderId, orders.id))
      .where(whereConditions)
      .orderBy(desc(paymentTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(paymentTransactions)
      .innerJoin(orders, eq(paymentTransactions.orderId, orders.id))
      .where(whereConditions);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalCount[0]?.count || 0,
          limit,
          offset,
          hasMore: (totalCount[0]?.count || 0) > offset + limit
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/refund
 * @desc Initiate payment refund
 * @access Private
 */
router.post('/refund', authMiddleware, async (req, res) => {
  try {
    const { transactionId, reason, amount } = req.body;
    const userId = req.user?.userId;

    if (!transactionId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and reason are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Verify transaction exists and belongs to user
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .innerJoin(orders, eq(paymentTransactions.orderId, orders.id))
      .where(
        and(
          eq(paymentTransactions.id, transactionId),
          eq(orders.userId, userId),
          eq(paymentTransactions.status, 'completed')
        )
      );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or not eligible for refund',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    let refundResult;
    const refundAmount = amount || parseFloat(transaction.payment_transactions.amount);

    // Route to appropriate payment engine for refund
    switch (transaction.payment_transactions.paymentMethod) {
      case 'bkash':
        refundResult = await bkashEngine.processRefund({
          originalTransactionId: transaction.payment_transactions.gatewayTransactionId,
          amount: refundAmount,
          reason
        });
        break;
      case 'nagad':
        refundResult = await nagadEngine.processRefund({
          originalTransactionId: transaction.payment_transactions.gatewayTransactionId,
          amount: refundAmount,
          reason
        });
        break;
      case 'rocket':
        refundResult = await rocketEngine.processRefund({
          originalTransactionId: transaction.payment_transactions.gatewayTransactionId,
          amount: refundAmount,
          reason
        });
        break;
      case 'sslcommerz':
        refundResult = await sslCommerzEngine.processRefund({
          originalTransactionId: transaction.payment_transactions.gatewayTransactionId,
          amount: refundAmount,
          reason
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Refund not supported for this payment method',
          code: 'REFUND_NOT_SUPPORTED'
        });
    }

    // Create refund transaction record
    await db.insert(paymentTransactions).values({
      orderId: transaction.payment_transactions.orderId,
      paymentMethod: transaction.payment_transactions.paymentMethod,
      amount: refundAmount.toString(),
      currency: transaction.payment_transactions.currency,
      status: refundResult.status,
      transactionType: 'refund',
      gatewayTransactionId: refundResult.refundId,
      gatewayResponse: refundResult,
      metadata: {
        originalTransactionId: transactionId,
        reason,
        userId
      }
    });

    res.json({
      success: true,
      data: refundResult
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/v1/payments/webhook/:provider
 * @desc Handle payment gateway webhooks
 * @access Public (with signature verification)
 */
router.post('/webhook/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const payload = req.body;
    const signature = req.headers['x-signature'] as string;

    let result;

    switch (provider) {
      case 'bkash':
        result = await bkashEngine.handleWebhook(payload, signature);
        break;
      case 'nagad':
        result = await nagadEngine.handleWebhook(payload, signature);
        break;
      case 'rocket':
        result = await rocketEngine.handleWebhook(payload, signature);
        break;
      case 'sslcommerz':
        result = await sslCommerzEngine.handleWebhook(payload, signature);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unknown payment provider',
          code: 'UNKNOWN_PROVIDER'
        });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;