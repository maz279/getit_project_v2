/**
 * Validation Middleware - Amazon.com/Shopee.sg Level Input Validation
 * Enterprise-grade validation with comprehensive schema checking
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LoggingService } from '../../../../services/LoggingService';

const loggingService = new LoggingService();

// Bangladesh-specific validation patterns
const bangladeshMobilePattern = /^(\+8801|8801|01)[3-9]\d{8}$/;
const bangladeshNIDPattern = /^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/;
const bangladeshTINPattern = /^[0-9]{12}$/;

// Vendor registration validation schema
const vendorRegistrationSchema = z.object({
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s&.-]+$/, 'Business name contains invalid characters'),
  
  businessType: z.enum([
    'sole_proprietorship', 
    'partnership', 
    'private_limited', 
    'public_limited', 
    'cooperative',
    'ngo',
    'other'
  ]).optional(),
  
  contactEmail: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .optional(),
  
  contactPhone: z.string()
    .regex(bangladeshMobilePattern, 'Invalid Bangladesh mobile number format')
    .optional(),
  
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.enum([
      'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 
      'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'
    ]),
    postalCode: z.string().regex(/^[0-9]{4}$/, 'Invalid postal code format'),
    country: z.literal('Bangladesh')
  }).optional(),
  
  businessLicense: z.string()
    .min(5, 'Business license number must be at least 5 characters')
    .max(50, 'Business license number cannot exceed 50 characters')
    .optional(),
  
  taxId: z.string()
    .regex(bangladeshTINPattern, 'Invalid TIN format (12 digits required)')
    .optional(),
  
  bankAccountInfo: z.object({
    accountName: z.string().min(2, 'Account name must be at least 2 characters'),
    accountNumber: z.string().min(10, 'Account number must be at least 10 characters'),
    bankName: z.enum([
      'Sonali Bank', 'Janata Bank', 'Agrani Bank', 'Rupali Bank',
      'BASIC Bank', 'Bangladesh Development Bank', 'Dutch-Bangla Bank',
      'BRAC Bank', 'Eastern Bank', 'IFIC Bank', 'Mutual Trust Bank',
      'Prime Bank', 'City Bank', 'Southeast Bank', 'Standard Bank',
      'Islami Bank Bangladesh', 'Al-Arafah Islami Bank', 'Social Islami Bank'
    ]),
    routingNumber: z.string().regex(/^[0-9]{9}$/, 'Invalid routing number').optional()
  }).optional()
});

// Vendor update validation schema
const vendorUpdateSchema = z.object({
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters')
    .optional(),
  
  businessType: z.enum([
    'sole_proprietorship', 
    'partnership', 
    'private_limited', 
    'public_limited', 
    'cooperative',
    'ngo',
    'other'
  ]).optional(),
  
  contactEmail: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .optional(),
  
  contactPhone: z.string()
    .regex(bangladeshMobilePattern, 'Invalid Bangladesh mobile number format')
    .optional(),
  
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.enum([
      'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 
      'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'
    ]),
    postalCode: z.string().regex(/^[0-9]{4}$/, 'Invalid postal code format'),
    country: z.literal('Bangladesh')
  }).optional(),
  
  bankAccountInfo: z.object({
    accountName: z.string().min(2, 'Account name must be at least 2 characters'),
    accountNumber: z.string().min(10, 'Account number must be at least 10 characters'),
    bankName: z.string().min(2, 'Bank name is required'),
    routingNumber: z.string().regex(/^[0-9]{9}$/, 'Invalid routing number').optional()
  }).optional()
});

// KYC submission validation schema
const kycSubmissionSchema = z.object({
  personalInfo: z.object({
    fullName: z.string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .regex(/^[a-zA-Z\s.]+$/, 'Full name contains invalid characters'),
    
    dateOfBirth: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
    
    nationality: z.literal('Bangladeshi'),
    
    idNumber: z.string()
      .regex(bangladeshNIDPattern, 'Invalid NID format'),
    
    idType: z.enum(['nid', 'passport', 'driving_license'])
  }),
  
  businessInfo: z.object({
    registrationNumber: z.string()
      .min(5, 'Registration number must be at least 5 characters')
      .max(50, 'Registration number cannot exceed 50 characters'),
    
    registrationDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Registration date must be in YYYY-MM-DD format'),
    
    businessType: z.enum([
      'sole_proprietorship', 
      'partnership', 
      'private_limited', 
      'public_limited', 
      'cooperative',
      'ngo'
    ]),
    
    tradeLicense: z.string()
      .min(5, 'Trade license number must be at least 5 characters')
      .max(50, 'Trade license number cannot exceed 50 characters'),
    
    tinNumber: z.string()
      .regex(bangladeshTINPattern, 'Invalid TIN format (12 digits required)')
  }),
  
  bankDetails: z.object({
    accountName: z.string()
      .min(2, 'Account name must be at least 2 characters')
      .max(100, 'Account name cannot exceed 100 characters'),
    
    accountNumber: z.string()
      .min(10, 'Account number must be at least 10 characters')
      .max(20, 'Account number cannot exceed 20 characters'),
    
    bankName: z.string()
      .min(2, 'Bank name is required'),
    
    branchCode: z.string()
      .min(3, 'Branch code must be at least 3 characters')
      .max(10, 'Branch code cannot exceed 10 characters'),
    
    swiftCode: z.string()
      .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT code format')
      .optional()
  }),
  
  documents: z.object({
    idDocument: z.string()
      .url('ID document must be a valid URL')
      .min(10, 'ID document URL is required'),
    
    businessRegistration: z.string()
      .url('Business registration document must be a valid URL')
      .min(10, 'Business registration URL is required'),
    
    bankStatement: z.string()
      .url('Bank statement must be a valid URL')
      .min(10, 'Bank statement URL is required'),
    
    addressProof: z.string()
      .url('Address proof must be a valid URL')
      .min(10, 'Address proof URL is required'),
    
    tradeLicense: z.string()
      .url('Trade license must be a valid URL')
      .min(10, 'Trade license URL is required')
  }),
  
  declarations: z.object({
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'Terms and conditions must be accepted' })
    }),
    
    privacyAccepted: z.literal(true, {
      errorMap: () => ({ message: 'Privacy policy must be accepted' })
    }),
    
    dataProcessingConsent: z.literal(true, {
      errorMap: () => ({ message: 'Data processing consent must be given' })
    }),
    
    complianceDeclaration: z.literal(true, {
      errorMap: () => ({ message: 'Compliance declaration must be accepted' })
    })
  })
});

// Payout request validation schema
const payoutRequestSchema = z.object({
  amount: z.number()
    .min(100, 'Minimum payout amount is 100 BDT')
    .max(500000, 'Maximum payout amount is 500,000 BDT'),
  
  paymentMethod: z.enum([
    'bank_transfer', 
    'bkash', 
    'nagad', 
    'rocket', 
    'upay'
  ]),
  
  paymentDetails: z.object({
    accountName: z.string().min(2, 'Account name is required').optional(),
    accountNumber: z.string().min(5, 'Account number is required').optional(),
    bankName: z.string().min(2, 'Bank name is required').optional(),
    routingNumber: z.string().optional(),
    mobileNumber: z.string()
      .regex(bangladeshMobilePattern, 'Invalid Bangladesh mobile number')
      .optional(),
    walletType: z.enum(['bkash', 'nagad', 'rocket', 'upay']).optional()
  })
});

/**
 * Generic validation middleware factory
 */
const createValidationMiddleware = (schema: z.ZodSchema, dataSource: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[dataSource];
      const validatedData = schema.parse(data);
      
      // Replace the original data with validated data
      req[dataSource] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        loggingService.warn('Validation failed for vendor service', {
          endpoint: req.path,
          method: req.method,
          errors: validationErrors,
          userId: req.user?.id
        });

        res.status(400).json({
          error: 'Validation failed',
          message: 'Please check your input data',
          details: validationErrors
        });
        return;
      }

      loggingService.error('Unexpected validation error', {
        error: error.message,
        endpoint: req.path,
        method: req.method,
        userId: req.user?.id
      });

      res.status(500).json({
        error: 'Validation error',
        message: 'An unexpected error occurred during validation'
      });
    }
  };
};

/**
 * Vendor registration validation middleware
 */
export const validateVendorRegistration = createValidationMiddleware(vendorRegistrationSchema);

/**
 * Vendor update validation middleware
 */
export const validateVendorUpdate = createValidationMiddleware(vendorUpdateSchema);

/**
 * KYC submission validation middleware
 */
export const validateKYCSubmission = createValidationMiddleware(kycSubmissionSchema);

/**
 * Payout request validation middleware
 */
export const validatePayoutRequest = createValidationMiddleware(payoutRequestSchema);

/**
 * Query parameter validation middleware
 */
export const validateQueryParams = (schema: z.ZodSchema) => {
  return createValidationMiddleware(schema, 'query');
};

/**
 * URL parameter validation middleware
 */
export const validateParams = (schema: z.ZodSchema) => {
  return createValidationMiddleware(schema, 'params');
};

/**
 * Common query parameter schemas
 */
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0, 'Page must be positive').default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').default('10')
});

export const vendorQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).default('10'),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  search: z.string().min(2, 'Search term must be at least 2 characters').optional(),
  sortBy: z.enum(['businessName', 'createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const analyticsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).optional()
});

/**
 * File upload validation middleware
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file && !req.files) {
    res.status(400).json({
      error: 'File required',
      message: 'No file was uploaded'
    });
    return;
  }

  const file = req.file || (Array.isArray(req.files) ? req.files[0] : req.files);
  
  if (!file) {
    res.status(400).json({
      error: 'Invalid file',
      message: 'File upload failed'
    });
    return;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    res.status(400).json({
      error: 'File too large',
      message: 'File size cannot exceed 5MB'
    });
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    res.status(400).json({
      error: 'Invalid file type',
      message: 'Only JPEG, PNG, and PDF files are allowed'
    });
    return;
  }

  next();
};

/**
 * Sanitize input middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim(); // Remove leading/trailing whitespace
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};