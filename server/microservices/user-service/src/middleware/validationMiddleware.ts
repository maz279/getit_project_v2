import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validation Middleware
 * Amazon.com/Shopee.sg-level request validation with Zod schemas
 */

// Bangladesh NID validation schema
export const nidValidationSchema = z.object({
  user_id: z.number().positive(),
  nid_number: z.string()
    .regex(/^(\d{10}|\d{13}|\d{17})$/, 'NID must be 10, 13, or 17 digits')
    .transform(val => val.trim())
});

// Bangladesh phone validation schema
export const phoneValidationSchema = z.object({
  user_id: z.number().positive(),
  phone: z.string()
    .regex(/^(\+88)?01[3-9]\d{8}$/, 'Invalid Bangladesh mobile number format')
    .transform(val => val.startsWith('+88') ? val : `+88${val}`)
});

// Mobile banking validation schema
export const mobileBankingSchema = z.object({
  user_id: z.number().positive(),
  provider: z.enum(['bkash', 'nagad', 'rocket', 'upay', 'mcash']),
  account_number: z.string().min(11).max(11),
  account_name: z.string().min(2).max(100)
});

// Address validation schema
export const addressValidationSchema = z.object({
  user_id: z.number().positive(),
  type: z.enum(['home', 'office', 'billing', 'shipping']).default('home'),
  address_line_1: z.string().min(5).max(200),
  address_line_2: z.string().max(200).optional(),
  district: z.string().min(2).max(50),
  upazila: z.string().max(50).optional(),
  union_ward: z.string().max(50).optional(),
  postal_code: z.string().max(10).optional(),
  is_default: z.boolean().default(false)
});

// MFA setup validation schema
export const mfaSetupSchema = z.object({
  user_id: z.number().positive()
});

// MFA verification schema
export const mfaVerificationSchema = z.object({
  user_id: z.number().positive(),
  totp_code: z.string()
    .length(6, 'TOTP code must be 6 digits')
    .regex(/^\d{6}$/, 'TOTP code must contain only digits')
});

// Social auth callback schema
export const socialAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional()
});

// Social account linking schema
export const socialAccountLinkSchema = z.object({
  user_id: z.number().positive(),
  provider: z.enum(['google', 'facebook', 'github', 'linkedin']),
  access_token: z.string().min(1, 'Access token is required')
});

// Generic validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Combine body, params, and query for validation
      const dataToValidate = {
        ...req.body,
        ...req.params,
        ...req.query
      };

      // Convert string numbers to integers where needed
      if (dataToValidate.user_id && typeof dataToValidate.user_id === 'string') {
        dataToValidate.user_id = parseInt(dataToValidate.user_id, 10);
      }

      const validatedData = schema.parse(dataToValidate);
      
      // Replace request data with validated data
      req.body = { ...req.body, ...validatedData };
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
          message: 'Please check your input and try again'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Validation error',
        details: error instanceof Error ? error.message : 'Unknown validation error'
      });
    }
  };
};

// Pre-configured validation middleware for common use cases
export const validateNID = validateRequest(nidValidationSchema);
export const validatePhone = validateRequest(phoneValidationSchema);
export const validateMobileBanking = validateRequest(mobileBankingSchema);
export const validateAddress = validateRequest(addressValidationSchema);
export const validateMfaSetup = validateRequest(mfaSetupSchema);
export const validateMfaVerification = validateRequest(mfaVerificationSchema);
export const validateSocialAuthCallback = validateRequest(socialAuthCallbackSchema);
export const validateSocialAccountLink = validateRequest(socialAccountLinkSchema);

// User preferences validation schema
export const userPreferencesSchema = z.object({
  language: z.enum(['en', 'bn', 'both']).optional(),
  currency: z.enum(['BDT', 'USD', 'EUR']).optional(),
  timezone: z.enum(['Asia/Dhaka', 'UTC', 'Asia/Kolkata']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
    marketing: z.boolean().optional()
  }).optional(),
  cultural: z.object({
    festivals: z.array(z.string()).optional(),
    prayerTimes: z.boolean().optional(),
    localEvents: z.boolean().optional()
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
    dataSharing: z.boolean().optional(),
    analytics: z.boolean().optional()
  }).optional()
});

export const validateUserPreferences = validateRequest(userPreferencesSchema);

// Security event query validation
export const securityEventQuerySchema = z.object({
  user_id: z.string().transform(val => parseInt(val, 10)),
  page: z.string().transform(val => parseInt(val, 10)).default('1'),
  limit: z.string().transform(val => Math.min(parseInt(val, 10), 100)).default('20'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

export const validateSecurityEventQuery = validateRequest(securityEventQuerySchema);

// Helper function for custom validation
export const customValidation = (
  validator: (req: Request) => { isValid: boolean; errors?: string[] }
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validator(req);
    
    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Custom validation failed',
        details: result.errors || ['Validation failed'],
        message: 'Please check your input and try again'
      });
    }
    
    next();
  };
};

// Bangladesh-specific validations
export const bangladeshValidations = {
  // Validate Bangladesh districts
  isValidDistrict: (district: string): boolean => {
    const validDistricts = [
      'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 
      'Rangpur', 'Mymensingh', 'Comilla', 'Feni', 'Brahmanbaria', 
      'Rangamati', 'Noakhali', 'Chandpur', 'Lakshmipur', 'Cox\'s Bazar',
      'Bandarban', 'Khagrachhari', 'Cumilla'
    ];
    return validDistricts.some(d => d.toLowerCase() === district.toLowerCase());
  },

  // Validate Bangladesh postal code
  isValidPostalCode: (code: string): boolean => {
    return /^\d{4}$/.test(code);
  },

  // Validate mobile banking account number format
  isValidMobileBankingAccount: (provider: string, accountNumber: string): boolean => {
    switch (provider.toLowerCase()) {
      case 'bkash':
      case 'nagad':
      case 'rocket':
        return /^01[3-9]\d{8}$/.test(accountNumber);
      case 'upay':
      case 'mcash':
        return /^01[3-9]\d{8}$/.test(accountNumber);
      default:
        return false;
    }
  }
};