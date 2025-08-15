import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { insertKycApplicationSchema } from '../../../../shared/kyc-schema';

// Application validation schema
const applicationValidationSchema = insertKycApplicationSchema.extend({
  // Additional validation rules
  nidNumber: z.string()
    .min(10, 'NID number must be at least 10 digits')
    .max(17, 'NID number cannot exceed 17 digits')
    .regex(/^\d+$/, 'NID number must contain only digits'),
  
  phone: z.string()
    .min(11, 'Phone number must be at least 11 digits')
    .regex(/^(\+8801|01)[3-9]\d{8}$/, 'Invalid Bangladesh phone number format'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters'),
  
  presentAddress: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    area: z.string().min(2, 'Area must be at least 2 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    district: z.string().min(2, 'District must be at least 2 characters'),
    postalCode: z.string().regex(/^\d{4}$/, 'Postal code must be 4 digits'),
    country: z.string().default('Bangladesh')
  }),
  
  permanentAddress: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    area: z.string().min(2, 'Area must be at least 2 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    district: z.string().min(2, 'District must be at least 2 characters'),
    postalCode: z.string().regex(/^\d{4}$/, 'Postal code must be 4 digits'),
    country: z.string().default('Bangladesh')
  })
});

// Document upload validation schema
const documentUploadSchema = z.object({
  kycApplicationId: z.string().uuid('Invalid application ID'),
  documentType: z.enum([
    'nid', 'passport', 'driving_license', 'trade_license', 
    'tin_certificate', 'bank_statement', 'utility_bill', 'photo'
  ]),
  documentNumber: z.string().optional()
});

// Face verification validation schema
const faceVerificationSchema = z.object({
  selfieUrl: z.string().url('Invalid selfie URL'),
  documentPhotoUrl: z.string().url('Invalid document photo URL'),
  strictMode: z.boolean().default(true)
});

// OCR request validation schema
const ocrRequestSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  documentType: z.enum([
    'nid', 'passport', 'driving_license', 'trade_license', 
    'tin_certificate', 'bank_statement', 'utility_bill'
  ]),
  language: z.enum(['en', 'bn', 'hi', 'ur', 'ar']).default('en')
});

// Business validation schema (for business/vendor applications)
const businessValidationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  tradeLicenseNumber: z.string()
    .min(6, 'Trade license number must be at least 6 characters')
    .max(20, 'Trade license number cannot exceed 20 characters'),
  tinNumber: z.string()
    .regex(/^\d{9,12}$/, 'TIN number must be 9-12 digits')
    .optional(),
  vatRegistrationNumber: z.string().optional(),
  businessType: z.enum([
    'sole_proprietorship', 'partnership', 'private_limited', 
    'public_limited', 'cooperative'
  ]),
  businessAddress: z.object({
    street: z.string().min(5, 'Business street address must be at least 5 characters'),
    area: z.string().min(2, 'Business area must be at least 2 characters'),
    city: z.string().min(2, 'Business city must be at least 2 characters'),
    district: z.string().min(2, 'Business district must be at least 2 characters'),
    postalCode: z.string().regex(/^\d{4}$/, 'Business postal code must be 4 digits'),
    country: z.string().default('Bangladesh')
  })
});

// Bank details validation schema
const bankDetailsSchema = z.object({
  bankAccountNumber: z.string()
    .min(8, 'Bank account number must be at least 8 digits')
    .max(20, 'Bank account number cannot exceed 20 digits')
    .regex(/^\d+$/, 'Bank account number must contain only digits'),
  bankName: z.string().min(2, 'Bank name is required'),
  bankBranch: z.string().min(2, 'Bank branch is required'),
  bankRoutingNumber: z.string()
    .regex(/^\d{9}$/, 'Bank routing number must be 9 digits')
});

// Middleware functions
export const kycValidation = {
  /**
   * Validate KYC application data
   */
  validateApplication: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = applicationValidationSchema.parse(req.body);
      
      // Additional business validation for business/vendor applications
      if (validatedData.applicationType === 'business' || validatedData.applicationType === 'vendor') {
        const businessData = businessValidationSchema.parse(req.body);
        Object.assign(validatedData, businessData);
      }
      
      // Replace request body with validated data
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  },

  /**
   * Validate application update data
   */
  validateApplicationUpdate: (req: Request, res: Response, next: NextFunction) => {
    try {
      // Make all fields optional for updates
      const updateSchema = applicationValidationSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  },

  /**
   * Validate document upload data
   */
  validateDocumentUpload: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = documentUploadSchema.parse(req.body);
      
      // Additional validation based on document type
      if (validatedData.documentType === 'nid' && !validatedData.documentNumber) {
        throw new z.ZodError([{
          code: 'custom',
          path: ['documentNumber'],
          message: 'NID number is required for NID documents'
        }]);
      }
      
      if (validatedData.documentType === 'passport' && !validatedData.documentNumber) {
        throw new z.ZodError([{
          code: 'custom',
          path: ['documentNumber'],
          message: 'Passport number is required for passport documents'
        }]);
      }
      
      if (validatedData.documentType === 'trade_license' && !validatedData.documentNumber) {
        throw new z.ZodError([{
          code: 'custom',
          path: ['documentNumber'],
          message: 'Trade license number is required for trade license documents'
        }]);
      }
      
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  },

  /**
   * Validate face verification data
   */
  validateFaceVerification: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = faceVerificationSchema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  },

  /**
   * Validate OCR request data
   */
  validateOCRRequest: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = ocrRequestSchema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  },

  /**
   * Validate bank details
   */
  validateBankDetails: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = bankDetailsSchema.parse(req.body);
      
      // Validate Bangladesh bank routing numbers
      const bangladeshiBanks = {
        '010': 'Sonali Bank',
        '020': 'Janata Bank',
        '030': 'Agrani Bank',
        '040': 'Rupali Bank',
        '050': 'Bangladesh Development Bank',
        '060': 'Bangladesh Krishi Bank',
        '070': 'Rajshahi Krishi Unnayan Bank'
      };
      
      const routingPrefix = validatedData.bankRoutingNumber.substring(0, 3);
      if (!bangladeshiBanks[routingPrefix] && !validatedData.bankRoutingNumber.startsWith('1')) {
        throw new z.ZodError([{
          code: 'custom',
          path: ['bankRoutingNumber'],
          message: 'Invalid Bangladesh bank routing number'
        }]);
      }
      
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  },

  /**
   * Validate NID number format
   */
  validateNIDNumber: (nidNumber: string): boolean => {
    // Bangladesh NID formats:
    // Old format: 10 digits
    // New format: 13 digits (smart card)
    // Voter ID: 17 digits
    const nidRegex = /^(\d{10}|\d{13}|\d{17})$/;
    return nidRegex.test(nidNumber);
  },

  /**
   * Validate Bangladesh phone number
   */
  validatePhoneNumber: (phone: string): boolean => {
    // Bangladesh mobile number formats:
    // +8801XXXXXXXXX or 01XXXXXXXXX
    const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate trade license number
   */
  validateTradeLicenseNumber: (licenseNumber: string): boolean => {
    // Trade license numbers are typically 6-12 digits
    const licenseRegex = /^\d{6,12}$/;
    return licenseRegex.test(licenseNumber);
  },

  /**
   * Validate TIN number
   */
  validateTINNumber: (tinNumber: string): boolean => {
    // Bangladesh TIN numbers are 9-12 digits
    const tinRegex = /^\d{9,12}$/;
    return tinRegex.test(tinNumber);
  },

  /**
   * Validate business name
   */
  validateBusinessName: (businessName: string): boolean => {
    // Business name should be 2-100 characters, alphanumeric + spaces + common symbols
    const businessNameRegex = /^[a-zA-Z0-9\s\-\&\.\,\']{2,100}$/;
    return businessNameRegex.test(businessName);
  },

  /**
   * Check if email domain is suspicious
   */
  validateEmailDomain: (email: string): boolean => {
    const suspiciousDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'throwaway.email'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    return !suspiciousDomains.includes(domain);
  },

  /**
   * Validate file upload
   */
  validateFileUpload: (file: Express.Multer.File): { valid: boolean; error?: string } => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size cannot exceed 10MB' };
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Only JPEG, PNG, and PDF files are allowed' };
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'Invalid file extension' };
    }
    
    return { valid: true };
  },

  /**
   * Sanitize input data
   */
  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .substring(0, 1000); // Limit length
  },

  /**
   * Validate address completeness
   */
  validateAddress: (address: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!address.street || address.street.length < 5) {
      errors.push('Street address must be at least 5 characters');
    }
    
    if (!address.area || address.area.length < 2) {
      errors.push('Area must be at least 2 characters');
    }
    
    if (!address.city || address.city.length < 2) {
      errors.push('City must be at least 2 characters');
    }
    
    if (!address.district || address.district.length < 2) {
      errors.push('District must be at least 2 characters');
    }
    
    if (!address.postalCode || !/^\d{4}$/.test(address.postalCode)) {
      errors.push('Postal code must be 4 digits');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default kycValidation;