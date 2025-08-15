import { z } from 'zod';

/**
 * Comprehensive validation utilities for Bangladesh-specific user service
 * Implements Amazon.com/Shopee.sg-level validation standards
 */

// Bangladesh phone number validation
export const bangladeshPhoneRegex = /^\+8801[3-9]\d{8}$/;

// Bangladesh National ID validation  
export const bangladeshNIDRegex = /^\d{10}$/;

// Bangladesh post code validation
export const bangladeshPostCodeRegex = /^\d{4}$/;

// Strong password validation
export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Common validation schemas
export const validationSchemas = {
  // User registration validation
  userRegistration: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s\u0980-\u09FF]*$/, 'First name can only contain letters and Bengali characters'),
    
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s\u0980-\u09FF]*$/, 'Last name can only contain letters and Bengali characters'),
    
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be less than 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscore and hyphen')
      .refine(async (username) => {
        // Check if username is already taken (implement in service layer)
        return true;
      }, 'Username is already taken'),
    
    email: z.string()
      .email('Invalid email format')
      .min(5, 'Email is too short')
      .max(254, 'Email is too long')
      .refine(async (email) => {
        // Check if email is already registered (implement in service layer)
        return true;
      }, 'Email is already registered'),
    
    phone: z.string()
      .regex(bangladeshPhoneRegex, 'Enter valid Bangladesh phone number (+8801XXXXXXXXX)')
      .refine(async (phone) => {
        // Check if phone is already registered (implement in service layer)
        return true;
      }, 'Phone number is already registered'),
    
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long')
      .regex(strongPasswordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    
    confirmPassword: z.string(),
    
    dateOfBirth: z.string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      }, 'Age must be between 13 and 120 years'),
    
    gender: z.enum(['male', 'female', 'other']).optional(),
    
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
    
    subscribeNewsletter: z.boolean().default(false),
    
    referralCode: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  // User login validation
  userLogin: z.object({
    identifier: z.string().min(1, 'Email, phone, or username is required'),
    password: z.string().min(6, 'Password is required'),
    loginType: z.enum(['email', 'phone', 'username']).default('email'),
    rememberMe: z.boolean().default(false),
  }),

  // Profile update validation
  profileUpdate: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    bio: z.string().max(500).optional(),
    website: z.string().url().optional().or(z.literal('')),
    socialLinks: z.object({
      facebook: z.string().url().optional().or(z.literal('')),
      twitter: z.string().url().optional().or(z.literal('')),
      linkedin: z.string().url().optional().or(z.literal('')),
      instagram: z.string().url().optional().or(z.literal('')),
    }).optional(),
    notificationSettings: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
      marketing: z.boolean().optional(),
    }).optional(),
    privacySettings: z.object({
      profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional(),
    }).optional(),
  }),

  // Bangladesh profile validation
  bangladeshProfile: z.object({
    nidNumber: z.string()
      .regex(bangladeshNIDRegex, 'NID must be 10 digits')
      .optional()
      .or(z.literal('')),
    
    passportNumber: z.string()
      .regex(/^[A-Z]{1,2}\d{6,7}$/, 'Invalid passport format')
      .optional()
      .or(z.literal('')),
    
    birthCertificateNumber: z.string().optional(),
    
    division: z.enum([
      'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 
      'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'
    ]).optional(),
    
    district: z.string().min(2).max(50).optional(),
    
    upazila: z.string().min(2).max(50).optional(),
    
    postCode: z.string()
      .regex(bangladeshPostCodeRegex, 'Post code must be 4 digits')
      .optional()
      .or(z.literal('')),
    
    preferredPaymentMethods: z.array(
      z.enum(['bkash', 'nagad', 'rocket', 'card', 'bank', 'cash'])
    ).optional(),
    
    mobileWalletNumbers: z.object({
      bkash: z.string()
        .regex(bangladeshPhoneRegex, 'Invalid bKash number format')
        .optional()
        .or(z.literal('')),
      nagad: z.string()
        .regex(bangladeshPhoneRegex, 'Invalid Nagad number format')
        .optional()
        .or(z.literal('')),
      rocket: z.string()
        .regex(bangladeshPhoneRegex, 'Invalid Rocket number format')
        .optional()
        .or(z.literal('')),
    }).optional(),
    
    languagePreference: z.enum(['en', 'bn', 'both']).default('en'),
    
    culturalPreferences: z.object({
      festivals: z.array(z.string()).optional(),
      religiousObservances: z.array(z.string()).optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
    }).optional(),
  }),

  // Password change validation
  passwordChange: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .regex(strongPasswordRegex, 'New password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  }),

  // Email verification validation
  emailVerification: z.object({
    email: z.string().email('Invalid email format'),
    token: z.string().min(1, 'Verification token is required'),
  }),

  // Phone verification validation
  phoneVerification: z.object({
    phone: z.string().regex(bangladeshPhoneRegex, 'Invalid phone number format'),
    code: z.string().length(6, 'OTP must be 6 digits'),
  }),

  // Forgot password validation
  forgotPassword: z.object({
    email: z.string().email('Invalid email format'),
  }),

  // Reset password validation
  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(strongPasswordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  // Admin user creation validation
  adminUserCreation: z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    phone: z.string().regex(bangladeshPhoneRegex).optional(),
    password: z.string().min(8).regex(strongPasswordRegex),
    fullName: z.string().min(1).max(100),
    role: z.enum(['customer', 'vendor', 'admin', 'moderator']),
    isEmailVerified: z.boolean().default(false),
    isPhoneVerified: z.boolean().default(false),
    preferredLanguage: z.enum(['en', 'bn']).default('en'),
  }),

  // Admin user update validation
  adminUserUpdate: z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(bangladeshPhoneRegex).optional(),
    fullName: z.string().min(1).max(100).optional(),
    role: z.enum(['customer', 'vendor', 'admin', 'moderator']).optional(),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
    isPhoneVerified: z.boolean().optional(),
    preferredLanguage: z.enum(['en', 'bn']).optional(),
  }),

  // User ban validation
  userBan: z.object({
    reason: z.string().min(10, 'Ban reason must be at least 10 characters').max(500),
    duration: z.number().min(1).max(365).optional(), // Days
    banType: z.enum(['temporary', 'permanent']).default('temporary'),
  }),
};

/**
 * Validation utility class with Bangladesh-specific methods
 */
export class ValidationUtils {
  /**
   * Validate Bangladesh phone number
   */
  static validateBangladeshPhone(phone: string): boolean {
    return bangladeshPhoneRegex.test(phone);
  }

  /**
   * Validate Bangladesh National ID
   */
  static validateBangladeshNID(nid: string): boolean {
    return bangladeshNIDRegex.test(nid);
  }

  /**
   * Validate Bangladesh post code
   */
  static validateBangladeshPostCode(postCode: string): boolean {
    return bangladeshPostCodeRegex.test(postCode);
  }

  /**
   * Validate strong password
   */
  static validateStrongPassword(password: string): {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    feedback: string[];
  } {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character (@$!%*?&)');
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong';
    if (score <= 2) {
      strength = 'weak';
    } else if (score <= 4) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    return {
      isValid: score >= 5,
      strength,
      score: (score / 5) * 100,
      feedback,
    };
  }

  /**
   * Validate email format and domain
   */
  static validateEmail(email: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors = [];

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Length check
    if (email.length > 254) {
      errors.push('Email is too long');
    }

    // Common typos check
    const commonTypos = [
      'gmail.co', 'gmail.cm', 'gmai.com',
      'yahoo.co', 'yahoo.cm', 'yahooo.com',
      'hotmail.co', 'hotmail.cm', 'hotmial.com'
    ];

    const domain = email.split('@')[1];
    if (domain && commonTypos.some(typo => domain.includes(typo))) {
      errors.push('Possible typo in email domain');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate username availability and format
   */
  static validateUsername(username: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors = [];

    // Length check
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    if (username.length > 30) {
      errors.push('Username must be less than 30 characters');
    }

    // Format check
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscore and hyphen');
    }

    // Reserved usernames
    const reservedUsernames = [
      'admin', 'root', 'administrator', 'mod', 'moderator',
      'api', 'www', 'mail', 'ftp', 'blog', 'shop',
      'support', 'help', 'info', 'news', 'contact',
      'service', 'test', 'demo', 'guest', 'user',
      'null', 'undefined', 'true', 'false'
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      errors.push('Username is reserved and cannot be used');
    }

    // Consecutive special characters
    if (/[_-]{2,}/.test(username)) {
      errors.push('Username cannot contain consecutive underscores or hyphens');
    }

    // Start or end with special characters
    if (/^[_-]|[_-]$/.test(username)) {
      errors.push('Username cannot start or end with underscore or hyphen');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate age from date of birth
   */
  static validateAge(dateOfBirth: string): {
    isValid: boolean;
    age: number;
    errors: string[];
  } {
    const errors = [];
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Validate age range
    if (age < 13) {
      errors.push('You must be at least 13 years old to register');
    }
    
    if (age > 120) {
      errors.push('Invalid birth date');
    }

    // Future date check
    if (birthDate > today) {
      errors.push('Birth date cannot be in the future');
    }

    return {
      isValid: errors.length === 0,
      age,
      errors,
    };
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate Bangladesh division
   */
  static validateBangladeshDivision(division: string): boolean {
    const validDivisions = [
      'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 
      'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'
    ];
    return validDivisions.includes(division);
  }

  /**
   * Format phone number to Bangladesh standard
   */
  static formatBangladeshPhone(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If starts with 880, format as +880
    if (digits.startsWith('880') && digits.length === 13) {
      return `+${digits}`;
    }
    
    // If starts with 01, add country code
    if (digits.startsWith('01') && digits.length === 11) {
      return `+880${digits}`;
    }
    
    // If starts with 8801, format as +880
    if (digits.startsWith('8801') && digits.length === 14) {
      return `+${digits.substring(1)}`;
    }
    
    return phone; // Return original if can't format
  }

  /**
   * Validate and format Bangladesh NID
   */
  static validateAndFormatNID(nid: string): {
    isValid: boolean;
    formatted: string;
    errors: string[];
  } {
    const errors = [];
    const digits = nid.replace(/\D/g, '');

    if (digits.length !== 10) {
      errors.push('NID must be exactly 10 digits');
    }

    // Additional NID validation logic can be added here
    // (check digit validation, range validation, etc.)

    return {
      isValid: errors.length === 0,
      formatted: digits,
      errors,
    };
  }

  /**
   * Generate validation report for user registration
   */
  static generateRegistrationValidationReport(userData: any): {
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: string[];
    score: number;
  } {
    const errors: Record<string, string[]> = {};
    const warnings: string[] = [];
    let score = 0;

    // Validate each field
    const usernameValidation = this.validateUsername(userData.username || '');
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.errors;
    } else {
      score += 10;
    }

    const emailValidation = this.validateEmail(userData.email || '');
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
    } else {
      score += 15;
    }

    if (userData.phone) {
      if (!this.validateBangladeshPhone(userData.phone)) {
        errors.phone = ['Invalid Bangladesh phone number format'];
      } else {
        score += 15;
      }
    }

    const passwordValidation = this.validateStrongPassword(userData.password || '');
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.feedback;
    } else {
      score += 20;
    }

    if (userData.dateOfBirth) {
      const ageValidation = this.validateAge(userData.dateOfBirth);
      if (!ageValidation.isValid) {
        errors.dateOfBirth = ageValidation.errors;
      } else {
        score += 10;
      }
    }

    // Add warnings for missing optional fields
    if (!userData.phone) {
      warnings.push('Consider adding a phone number for better account security');
    }
    
    if (!userData.dateOfBirth) {
      warnings.push('Adding your birth date helps with age-appropriate content');
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      score: Math.min(score, 100),
    };
  }
}