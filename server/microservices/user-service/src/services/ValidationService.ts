/**
 * Validation Service - Amazon.com/Shopee.sg Level Implementation
 * Comprehensive validation for user data and business logic
 */

import { 
  RegisterRequest, 
  LoginRequest, 
  ValidationResult, 
  ValidationError,
  OTPVerificationRequest 
} from '../types/AuthTypes';
import { LoggingService } from '../../../../services/LoggingService';

export class ValidationService {
  private logger: LoggingService;

  constructor() {
    this.logger = new LoggingService();
  }

  /**
   * Validate user registration data
   */
  async validateRegistration(data: RegisterRequest): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields validation
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push({
        field: 'firstName',
        message: 'First name must be at least 2 characters long',
        code: 'INVALID_FIRST_NAME'
      });
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push({
        field: 'lastName',
        message: 'Last name must be at least 2 characters long',
        code: 'INVALID_LAST_NAME'
      });
    }

    // Email validation (if provided)
    if (data.email) {
      const emailResult = this.validateEmail(data.email);
      if (!emailResult.isValid) {
        errors.push(...emailResult.errors);
      }
    }

    // Phone validation (if provided)
    if (data.phone) {
      const phoneResult = this.validateBangladeshPhone(data.phone);
      if (!phoneResult.isValid) {
        errors.push(...phoneResult.errors);
      }
    }

    // Username validation (if provided)
    if (data.username) {
      const usernameResult = this.validateUsername(data.username);
      if (!usernameResult.isValid) {
        errors.push(...usernameResult.errors);
      }
    }

    // At least one contact method required
    if (!data.email && !data.phone) {
      errors.push({
        field: 'contact',
        message: 'Either email or phone number is required',
        code: 'MISSING_CONTACT_METHOD'
      });
    }

    // Password validation
    const passwordResult = this.validatePassword(data.password);
    if (!passwordResult.isValid) {
      errors.push(...passwordResult.errors);
    }

    // Confirm password
    if (data.password !== data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH'
      });
    }

    // Terms agreement
    if (!data.agreesToTerms) {
      errors.push({
        field: 'agreesToTerms',
        message: 'You must agree to the terms and conditions',
        code: 'TERMS_NOT_ACCEPTED'
      });
    }

    // Date of birth validation (if provided)
    if (data.dateOfBirth) {
      const dateResult = this.validateDateOfBirth(data.dateOfBirth);
      if (!dateResult.isValid) {
        errors.push(...dateResult.errors);
      }
    }

    // Gender validation (if provided)
    if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
      errors.push({
        field: 'gender',
        message: 'Invalid gender value',
        code: 'INVALID_GENDER'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user login data
   */
  async validateLogin(data: LoginRequest): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Login type validation
    if (!['email', 'phone', 'username'].includes(data.loginType)) {
      errors.push({
        field: 'loginType',
        message: 'Invalid login type',
        code: 'INVALID_LOGIN_TYPE'
      });
    }

    // Identifier validation based on login type
    if (!data.identifier || data.identifier.trim().length === 0) {
      errors.push({
        field: 'identifier',
        message: 'Login identifier is required',
        code: 'MISSING_IDENTIFIER'
      });
    } else {
      if (data.loginType === 'email') {
        const emailResult = this.validateEmail(data.identifier);
        if (!emailResult.isValid) {
          errors.push({
            field: 'identifier',
            message: 'Invalid email format',
            code: 'INVALID_EMAIL_FORMAT'
          });
        }
      } else if (data.loginType === 'phone') {
        const phoneResult = this.validateBangladeshPhone(data.identifier);
        if (!phoneResult.isValid) {
          errors.push({
            field: 'identifier',
            message: 'Invalid phone number format',
            code: 'INVALID_PHONE_FORMAT'
          });
        }
      } else if (data.loginType === 'username') {
        const usernameResult = this.validateUsername(data.identifier);
        if (!usernameResult.isValid) {
          errors.push({
            field: 'identifier',
            message: 'Invalid username format',
            code: 'INVALID_USERNAME_FORMAT'
          });
        }
      }
    }

    // Password validation
    if (!data.password || data.password.length === 0) {
      errors.push({
        field: 'password',
        message: 'Password is required',
        code: 'MISSING_PASSWORD'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate OTP verification data
   */
  async validateOTPVerification(data: OTPVerificationRequest): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // User ID validation
    if (!data.userId || !this.isValidUUID(data.userId)) {
      errors.push({
        field: 'userId',
        message: 'Invalid user ID format',
        code: 'INVALID_USER_ID'
      });
    }

    // Phone validation
    const phoneResult = this.validateBangladeshPhone(data.phone);
    if (!phoneResult.isValid) {
      errors.push(...phoneResult.errors);
    }

    // OTP validation
    if (!data.otp || !/^\d{6}$/.test(data.otp)) {
      errors.push({
        field: 'otp',
        message: 'OTP must be 6 digits',
        code: 'INVALID_OTP_FORMAT'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    if (email.length > 254) {
      errors.push({
        field: 'email',
        message: 'Email is too long',
        code: 'EMAIL_TOO_LONG'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Bangladesh phone number
   */
  private validateBangladeshPhone(phone: string): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Remove any non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Bangladesh mobile number patterns
    const bdMobilePatterns = [
      /^01[3-9]\d{8}$/, // Standard BD mobile: 01X-XXXXXXXX (11 digits)
      /^8801[3-9]\d{8}$/, // With country code: 8801X-XXXXXXXX (13 digits)
      /^\+8801[3-9]\d{8}$/, // With + country code: +8801X-XXXXXXXX
    ];

    const isValidBdMobile = bdMobilePatterns.some(pattern => pattern.test(cleanPhone));

    if (!isValidBdMobile) {
      errors.push({
        field: 'phone',
        message: 'Invalid Bangladesh mobile number format',
        code: 'INVALID_BD_PHONE_FORMAT'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate username
   */
  private validateUsername(username: string): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Username requirements
    if (username.length < 3 || username.length > 30) {
      errors.push({
        field: 'username',
        message: 'Username must be between 3 and 30 characters',
        code: 'INVALID_USERNAME_LENGTH'
      });
    }

    // Only alphanumeric and underscore allowed
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username can only contain letters, numbers, and underscores',
        code: 'INVALID_USERNAME_CHARACTERS'
      });
    }

    // Must start with letter
    if (!/^[a-zA-Z]/.test(username)) {
      errors.push({
        field: 'username',
        message: 'Username must start with a letter',
        code: 'INVALID_USERNAME_START'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    if (password.length > 128) {
      errors.push({
        field: 'password',
        message: 'Password is too long',
        code: 'PASSWORD_TOO_LONG'
      });
    }

    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter',
        code: 'PASSWORD_MISSING_UPPERCASE'
      });
    }

    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter',
        code: 'PASSWORD_MISSING_LOWERCASE'
      });
    }

    // Must contain at least one number
    if (!/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
        code: 'PASSWORD_MISSING_NUMBER'
      });
    }

    // Must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character',
        code: 'PASSWORD_MISSING_SPECIAL'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate date of birth
   */
  private validateDateOfBirth(dateOfBirth: string): ValidationResult {
    const errors: ValidationError[] = [];
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      // Haven't had birthday this year
    }

    // Must be valid date
    if (isNaN(birthDate.getTime())) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Invalid date format',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    // Must be at least 13 years old
    if (age < 13) {
      errors.push({
        field: 'dateOfBirth',
        message: 'You must be at least 13 years old',
        code: 'AGE_TOO_YOUNG'
      });
    }

    // Cannot be in the future
    if (birthDate > today) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Date of birth cannot be in the future',
        code: 'FUTURE_DATE_OF_BIRTH'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate Bangladesh National ID (NID)
   */
  validateNID(nid: string): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Remove any non-digit characters
    const cleanNID = nid.replace(/\D/g, '');
    
    // Old NID: 13 digits, New NID: 10 or 17 digits
    if (![10, 13, 17].includes(cleanNID.length)) {
      errors.push({
        field: 'nid',
        message: 'Invalid NID format. Must be 10, 13, or 17 digits',
        code: 'INVALID_NID_FORMAT'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate business email for vendors
   */
  validateBusinessEmail(email: string): ValidationResult {
    const emailResult = this.validateEmail(email);
    
    // Additional business email checks
    const commonPersonalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'live.com', 'aol.com', 'icloud.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (commonPersonalDomains.includes(domain)) {
      emailResult.errors.push({
        field: 'businessEmail',
        message: 'Please use a business email address',
        code: 'PERSONAL_EMAIL_NOT_ALLOWED'
      });
      emailResult.isValid = false;
    }

    return emailResult;
  }

  /**
   * Validate Bangladesh postal code
   */
  validateBangladeshPostalCode(postalCode: string): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Bangladesh postal codes are 4 digits
    if (!/^\d{4}$/.test(postalCode)) {
      errors.push({
        field: 'postalCode',
        message: 'Bangladesh postal code must be 4 digits',
        code: 'INVALID_POSTAL_CODE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}