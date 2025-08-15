import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authMiddleware, requireAuthenticated } from '../middleware/auth';

const router = Router();

// Bangladesh Mobile Banking Integration (bKash, Nagad, Rocket)
const mobilePaymentSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'upay', 'mcash']),
  phoneNumber: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladesh mobile number'),
  amount: z.number().positive(),
  pin: z.string().optional(),
  currency: z.literal('BDT').default('BDT')
});

const bankTransferSchema = z.object({
  orderId: z.string(),
  bankName: z.enum([
    'dutch_bangla', 'brac_bank', 'city_bank', 'eastern_bank', 
    'islami_bank', 'standard_chartered', 'hsbc', 'mutual_trust_bank'
  ]),
  accountNumber: z.string(),
  routingNumber: z.string(),
  amount: z.number().positive(),
  currency: z.literal('BDT').default('BDT')
});

// bKash Payment Integration
router.post('/payments/bkash/initiate', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId, phoneNumber, amount } = mobilePaymentSchema.parse(req.body);
    
    // Generate unique transaction ID
    const transactionId = `BKASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment transaction record
    const paymentTransaction = await storage.createPaymentTransaction({
      orderId,
      transactionId,
      method: 'bkash',
      type: 'mobile_banking',
      amount: amount.toString(),
      currency: 'BDT',
      status: 'pending',
      gatewayTransactionId: null,
      gatewayResponse: JSON.stringify({
        phoneNumber,
        provider: 'bKash',
        gatewayResponse: null
      }),
      processedAt: null,
      failureReason: null
    });

    // In production, integrate with bKash API
    // For now, simulate the payment flow
    const bkashResponse = {
      paymentID: transactionId,
      createTime: new Date().toISOString(),
      amount: amount.toString(),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: orderId,
      bkashURL: `https://checkout.pay.bka.sh/v1.2.0-beta/checkout/payment/${transactionId}`,
      callbackURL: `${process.env.BASE_URL}/api/payments/bkash/callback`,
      successCallbackURL: `${process.env.BASE_URL}/api/payments/bkash/success`,
      failureCallbackURL: `${process.env.BASE_URL}/api/payments/bkash/failure`
    };

    res.json({
      success: true,
      transactionId,
      paymentUrl: bkashResponse.bkashURL,
      bkashResponse
    });
  } catch (error) {
    console.error('bKash payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate bKash payment' });
  }
});

// Nagad Payment Integration
router.post('/payments/nagad/initiate', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId, phoneNumber, amount } = mobilePaymentSchema.parse(req.body);
    
    const transactionId = `NAGAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentTransaction = await storage.createPaymentTransaction({
      orderId,
      transactionId,
      method: 'nagad',
      type: 'mobile_banking',
      amount: amount.toString(),
      currency: 'BDT',
      status: 'pending',
      gatewayTransactionId: null,
      gatewayResponse: JSON.stringify({
        phoneNumber,
        provider: 'Nagad',
        gatewayResponse: null
      }),
      processedAt: null,
      failureReason: null
    });

    // Simulate Nagad API integration
    const nagadResponse = {
      paymentReferenceId: transactionId,
      challenge: Math.random().toString(36).substr(2, 16),
      amount: amount.toString(),
      currency: 'BDT',
      merchantId: process.env.NAGAD_MERCHANT_ID || 'DEMO_MERCHANT',
      redirectURL: `https://api.mynagad.com/api/dfs/check-out/initialize/${transactionId}`,
      callbackURL: `${process.env.BASE_URL}/api/payments/nagad/callback`
    };

    res.json({
      success: true,
      transactionId,
      paymentUrl: nagadResponse.redirectURL,
      nagadResponse
    });
  } catch (error) {
    console.error('Nagad payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate Nagad payment' });
  }
});

// Rocket Payment Integration
router.post('/payments/rocket/initiate', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId, phoneNumber, amount } = mobilePaymentSchema.parse(req.body);
    
    const transactionId = `ROCKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentTransaction = await storage.createPaymentTransaction({
      orderId,
      transactionId,
      method: 'rocket',
      type: 'mobile_banking',
      amount: amount.toString(),
      currency: 'BDT',
      status: 'pending',
      gatewayTransactionId: null,
      gatewayResponse: JSON.stringify({
        phoneNumber,
        provider: 'Rocket',
        gatewayResponse: null
      }),
      processedAt: null,
      failureReason: null
    });

    // Simulate Rocket API integration
    const rocketResponse = {
      transactionId,
      sessionKey: Math.random().toString(36).substr(2, 24),
      amount: amount.toString(),
      currency: 'BDT',
      paymentURL: `https://rocket.com.bd/payment/checkout/${transactionId}`,
      callbackURL: `${process.env.BASE_URL}/api/payments/rocket/callback`
    };

    res.json({
      success: true,
      transactionId,
      paymentUrl: rocketResponse.paymentURL,
      rocketResponse
    });
  } catch (error) {
    console.error('Rocket payment initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate Rocket payment' });
  }
});

// Bank Transfer Integration
router.post('/payments/bank-transfer', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId, bankName, accountNumber, routingNumber, amount } = bankTransferSchema.parse(req.body);
    
    const transactionId = `BANK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentTransaction = await storage.createPaymentTransaction({
      orderId,
      transactionId,
      paymentMethod: 'bank_transfer',
      amount: amount.toString(),
      currency: 'BDT',
      status: 'pending',
      paymentData: {
        bankName,
        accountNumber,
        routingNumber,
        transferType: 'online_banking'
      },
      processedAt: null,
      failureReason: null
    });

    // Generate bank transfer instructions
    const transferInstructions = {
      transactionId,
      beneficiaryName: 'GetIt Bangladesh Ltd.',
      beneficiaryAccount: process.env.COMPANY_BANK_ACCOUNT || '1234567890',
      beneficiaryBank: 'Dutch-Bangla Bank Limited',
      routingNumber: '090260323',
      transferAmount: amount,
      currency: 'BDT',
      reference: `GetIt-${orderId}`,
      instructions: [
        'Log in to your online banking portal',
        'Select Fund Transfer or BEFTN',
        'Enter the beneficiary details provided',
        'Use the reference number for easy tracking',
        'Upload the payment receipt after transfer'
      ]
    };

    res.json({
      success: true,
      transactionId,
      transferInstructions
    });
  } catch (error) {
    console.error('Bank transfer initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate bank transfer' });
  }
});

// Payment Status Check
router.get('/payments/status/:transactionId', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transactions = await storage.getPaymentTransactions(req.body.orderId || '');
    const transaction = transactions.find(t => t.transactionId === transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod: transaction.paymentMethod,
        processedAt: transaction.processedAt,
        failureReason: transaction.failureReason
      }
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Payment Webhooks for Gateway Responses
router.post('/payments/bkash/callback', async (req, res) => {
  try {
    const { paymentID, status, trxID } = req.body;
    
    // Update payment transaction status
    if (status === 'Completed') {
      await storage.updatePaymentTransactionStatus(paymentID, 'completed');
    } else {
      await storage.updatePaymentTransactionStatus(paymentID, 'failed');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('bKash callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

router.post('/payments/nagad/callback', async (req, res) => {
  try {
    const { payment_ref_id, status, issuer_payment_ref } = req.body;
    
    if (status === 'Success') {
      await storage.updatePaymentTransactionStatus(payment_ref_id, 'completed');
    } else {
      await storage.updatePaymentTransactionStatus(payment_ref_id, 'failed');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Nagad callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

router.post('/payments/rocket/callback', async (req, res) => {
  try {
    const { transaction_id, status, reference_id } = req.body;
    
    if (status === 'SUCCESSFUL') {
      await storage.updatePaymentTransactionStatus(transaction_id, 'completed');
    } else {
      await storage.updatePaymentTransactionStatus(transaction_id, 'failed');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Rocket callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// Cash on Delivery (COD) - Popular in Bangladesh
router.post('/payments/cod/confirm', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId, deliveryAddress, phoneNumber } = req.body;
    
    const transactionId = `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentTransaction = await storage.createPaymentTransaction({
      orderId,
      transactionId,
      paymentMethod: 'cash_on_delivery',
      amount: '0', // Amount will be collected on delivery
      currency: 'BDT',
      status: 'pending',
      paymentData: {
        deliveryAddress,
        phoneNumber,
        codConfirmed: true,
        collectionInstructions: 'Collect payment upon delivery'
      },
      processedAt: null,
      failureReason: null
    });

    res.json({
      success: true,
      transactionId,
      message: 'Cash on Delivery confirmed. Payment will be collected upon delivery.',
      deliveryInstructions: {
        phoneNumber,
        address: deliveryAddress,
        paymentMethod: 'Cash on Delivery',
        prepareCash: 'Please prepare exact cash amount for smooth delivery'
      }
    });
  } catch (error) {
    console.error('COD confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm Cash on Delivery' });
  }
});

export default router;