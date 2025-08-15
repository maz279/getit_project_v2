import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Bangladesh mobile number validation regex
const bangladeshMobileRegex = /^(\+88)?01[3-9]\d{8}$/;

// Payment method validation schemas
const paymentInitializationSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'sslcommerz', 'cod'], {
    errorMap: () => ({ message: 'Invalid payment method. Supported: bkash, nagad, rocket, sslcommerz, cod' })
  }),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('BDT'),
  metadata: z.object({}).optional()
});

const bkashPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1 BDT'),
  orderId: z.string().uuid('Invalid order ID format'),
  intent: z.enum(['sale', 'authorization']).default('sale')
});

const nagadPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1 BDT'),
  orderId: z.string().uuid('Invalid order ID format'),
  mobileNumber: z.string().regex(bangladeshMobileRegex, 'Invalid Bangladesh mobile number').optional()
});

const rocketPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1 BDT'),
  orderId: z.string().uuid('Invalid order ID format'),
  recipientNumber: z.string().regex(bangladeshMobileRegex, 'Invalid Bangladesh mobile number')
});

const sslCommerzPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum amount is 1 BDT'),
  orderId: z.string().uuid('Invalid order ID format'),
  customerInfo: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(bangladeshMobileRegex, 'Invalid Bangladesh mobile number'),
    address: z.string().min(1, 'Address is required')
  })
});

const codPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  deliveryAddress: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().regex(bangladeshMobileRegex, 'Invalid Bangladesh mobile number'),
    division: z.string().min(1, 'Division is required'),
    district: z.string().min(1, 'District is required'),
    upazila: z.string().optional(),
    address: z.string().min(1, 'Detailed address is required'),
    postalCode: z.string().optional()
  }),
  contactNumber: z.string().regex(bangladeshMobileRegex, 'Invalid Bangladesh mobile number')
});

/**
 * Validate payment initialization request
 */
export const validatePaymentRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = paymentInitializationSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'VALIDATION_ERROR'
      });
    }
    next(error);
  }
};

/**
 * Validate bKash payment request
 */
export const validateBkashPayment = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = bkashPaymentSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'bKash payment validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'BKASH_VALIDATION_ERROR'
      });
    }
    next(error);
  }
};

/**
 * Validate Nagad payment request
 */
export const validateNagadPayment = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = nagadPaymentSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Nagad payment validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'NAGAD_VALIDATION_ERROR'
      });
    }
    next(error);
  }
};

/**
 * Validate Rocket payment request
 */
export const validateRocketPayment = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = rocketPaymentSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Rocket payment validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'ROCKET_VALIDATION_ERROR'
      });
    }
    next(error);
  }
};

/**
 * Validate SSL Commerz payment request
 */
export const validateSSLCommerzPayment = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = sslCommerzPaymentSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'SSL Commerz payment validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'SSLCOMMERZ_VALIDATION_ERROR'
      });
    }
    next(error);
  }
};

/**
 * Validate Cash on Delivery payment request
 */
export const validateCODPayment = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = codPaymentSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Cash on Delivery validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'COD_VALIDATION_ERROR'
      });
    }
    next(error);
  }
};

/**
 * Validate payment amount limits
 */
export const validateAmountLimits = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, paymentMethod } = req.body;

    // Payment method specific limits (in BDT)
    const limits = {
      bkash: { min: 1, max: 250000 },
      nagad: { min: 1, max: 500000 },
      rocket: { min: 1, max: 250000 },
      sslcommerz: { min: 1, max: 1000000 },
      cod: { min: 50, max: 50000 }
    };

    const methodLimits = limits[paymentMethod as keyof typeof limits];
    
    if (!methodLimits) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
        code: 'INVALID_PAYMENT_METHOD'
      });
    }

    if (amount < methodLimits.min || amount > methodLimits.max) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between ${methodLimits.min} and ${methodLimits.max} BDT for ${paymentMethod}`,
        code: 'AMOUNT_LIMIT_EXCEEDED',
        limits: methodLimits
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Rate limiting for payment requests
 */
export const paymentRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This would typically use Redis for rate limiting
  // For now, we'll implement a simple in-memory rate limiter
  
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // In production, implement proper rate limiting with Redis
  // For now, we'll pass through
  next();
};

/**
 * Validate transaction ID format
 */
export const validateTransactionId = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId || typeof transactionId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid transaction ID is required',
        code: 'INVALID_TRANSACTION_ID'
      });
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format',
        code: 'INVALID_TRANSACTION_ID_FORMAT'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate refund request
 */
export const validateRefundRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    const refundSchema = z.object({
      transactionId: z.string().uuid('Invalid transaction ID format'),
      reason: z.string().min(1, 'Refund reason is required').max(500, 'Reason too long'),
      amount: z.number().positive('Amount must be positive').optional()
    });

    const validatedData = refundSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Refund validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'REFUND_VALIDATION_ERROR'
      });
    }
    next(error);
  }
};

/**
 * Validate webhook signature (to be implemented per gateway)
 */
export const validateWebhookSignature = (provider: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing webhook signature',
          code: 'MISSING_SIGNATURE'
        });
      }

      // In production, implement proper signature validation per provider
      // This would involve verifying HMAC signatures with gateway secrets
      
      next();
    } catch (error) {
      next(error);
    }
  };
};