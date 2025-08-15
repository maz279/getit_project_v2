import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Profile validation schemas
const profileUpdateSchema = z.object({
  user: z.object({
    fullName: z.string().min(1).max(100).optional(),
    phone: z.string().regex(/^(\+880|880|0)?[13-9]\d{8}$/).optional(), // Bangladesh phone format
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    preferredLanguage: z.enum(['en', 'bn', 'hi', 'ar']).optional(),
    avatar: z.string().url().optional()
  }).optional(),
  profile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    address: z.object({
      division: z.string().optional(),
      district: z.string().optional(),
      upazila: z.string().optional(),
      area: z.string().optional(),
      streetAddress: z.string().optional(),
      postalCode: z.string().optional(),
      coordinates: z.object({
        lat: z.number().optional(),
        lng: z.number().optional()
      }).optional()
    }).optional(),
    preferences: z.object({
      newsletter: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
      currency: z.enum(['BDT', 'USD', 'EUR']).optional(),
      timezone: z.string().optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional()
    }).optional(),
    emergencyContacts: z.array(z.object({
      name: z.string().min(1).max(100),
      relationship: z.string().min(1).max(50),
      phone: z.string().regex(/^(\+880|880|0)?[13-9]\d{8}$/),
      email: z.string().email().optional()
    })).max(3).optional()
  }).optional()
});

/**
 * Profile validation middleware
 * Validates profile update requests for consistency and data integrity
 */
export const profileValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate the request body
    const validationResult = profileUpdateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message,
        code: error.code
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Additional business logic validations
    const { user, profile } = validationResult.data;
    
    // Validate Bangladesh-specific data
    if (user?.phone) {
      const phoneRegex = /^(\+880|880|0)?[13-9]\d{8}$/;
      if (!phoneRegex.test(user.phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Bangladesh phone number format',
          code: 'INVALID_PHONE_FORMAT'
        });
      }
    }
    
    // Validate address fields for Bangladesh
    if (profile?.address) {
      const bangladeshDivisions = [
        'Dhaka', 'Chittagong', 'Rajshahi', 'Sylhet', 
        'Barisal', 'Khulna', 'Rangpur', 'Mymensingh'
      ];
      
      if (profile.address.division && !bangladeshDivisions.includes(profile.address.division)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Bangladesh division',
          code: 'INVALID_DIVISION'
        });
      }
      
      // Validate postal code format (Bangladesh format: 4 digits)
      if (profile.address.postalCode && !/^\d{4}$/.test(profile.address.postalCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid postal code format. Use 4-digit format.',
          code: 'INVALID_POSTAL_CODE'
        });
      }
    }
    
    // Validate emergency contacts
    if (profile?.emergencyContacts) {
      for (const contact of profile.emergencyContacts) {
        if (!contact.phone.match(/^(\+880|880|0)?[13-9]\d{8}$/)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid emergency contact phone number format',
            code: 'INVALID_EMERGENCY_PHONE'
          });
        }
      }
    }
    
    // Validate age (must be at least 13 years old)
    if (user?.dateOfBirth) {
      const birthDate = new Date(user.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13) {
        return res.status(400).json({
          success: false,
          message: 'User must be at least 13 years old',
          code: 'AGE_RESTRICTION'
        });
      }
    }
    
    // Pass validated data to the next middleware
    req.body = validationResult.data;
    next();
    
  } catch (error) {
    console.error('Profile validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Profile validation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'VALIDATION_SYSTEM_ERROR'
    });
  }
};