/**
 * OTP Service - Amazon.com/Shopee.sg Level OTP Management
 * Comprehensive OTP verification for vendor registration
 */

import { apiRequest } from '@/lib/queryClient';

export interface OTPRequest {
  phoneNumber?: string;
  email?: string;
  purpose: 'vendor_registration' | 'phone_verification' | 'email_verification';
  userId?: string;
}

export interface OTPVerification {
  phoneNumber?: string;
  email?: string;
  otpCode: string;
  purpose: string;
  sessionId?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  expiresIn?: string;
  notificationId?: string;
  error?: string;
}

class OTPService {
  private baseUrl = '/api/v1/notifications';

  /**
   * Send OTP to international phone number
   */
  async sendPhoneOTP(phoneNumber: string, purpose: string = 'vendor_registration'): Promise<OTPResponse> {
    try {
      const response = await apiRequest(`${this.baseUrl}/sms/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          type: purpose,
          expiryMinutes: 2,
          provider: 'international_sms'
        })
      });
      
      const data = await response.json();

      return {
        success: data.success,
        message: data.message || 'OTP sent successfully to your international mobile number',
        sessionId: data.notificationId,
        expiresIn: data.expiresIn
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send international SMS OTP',
        error: error.message
      };
    }
  }

  /**
   * Send OTP to email address
   */
  async sendEmailOTP(email: string, purpose: string = 'vendor_registration'): Promise<OTPResponse> {
    try {
      const response = await apiRequest(`${this.baseUrl}/email/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          type: purpose,
          expiryMinutes: 2,
          template: 'vendor_registration_otp'
        })
      });
      
      const data = await response.json();

      return {
        success: data.success,
        message: data.message || 'OTP sent successfully to your email address',
        sessionId: data.notificationId,
        expiresIn: data.expiresIn
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send email OTP',
        error: error.message
      };
    }
  }

  /**
   * Verify international phone OTP
   */
  async verifyPhoneOTP(phoneNumber: string, otpCode: string, purpose: string = 'vendor_registration'): Promise<OTPResponse> {
    try {
      const response = await apiRequest(`${this.baseUrl}/sms/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpCode
        })
      });
      
      const data = await response.json();

      return {
        success: data.verified || data.success || false,
        message: data.message || 'International phone number verified successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Invalid international OTP code',
        error: error.message
      };
    }
  }

  /**
   * Verify email OTP
   */
  async verifyEmailOTP(email: string, otpCode: string, purpose: string = 'vendor_registration'): Promise<OTPResponse> {
    try {
      const response = await apiRequest(`${this.baseUrl}/email/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode
        })
      });
      
      const data = await response.json();

      return {
        success: data.verified || data.success || false,
        message: data.message || 'Email verified successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Invalid OTP code',
        error: error.message
      };
    }
  }

  /**
   * Format international phone number
   */
  formatInternationalPhone(phone: string): string {
    // Remove any non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // If already starts with +, return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // If starts with 00, replace with +
    if (cleaned.startsWith('00')) {
      return `+${cleaned.slice(2)}`;
    }
    
    // If it's a Bangladesh number without country code, add +880
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `+880${cleaned.slice(1)}`;
    }
    
    // If it's a 10-digit number, likely Bangladesh mobile
    if (cleaned.length === 10 && /^(13|14|15|16|17|18|19)/.test(cleaned)) {
      return `+880${cleaned}`;
    }
    
    // Return as is for other international formats
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  /**
   * Validate international phone number
   */
  isValidInternationalPhone(phone: string): boolean {
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Basic validation for international phone numbers
    // Should start with + and have 7-15 digits
    if (cleaned.startsWith('+')) {
      const digits = cleaned.slice(1);
      return digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits);
    }
    
    // Bangladesh numbers without country code
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return /^0(13|14|15|16|17|18|19)/.test(cleaned);
    }
    
    // 10-digit Bangladesh mobile numbers
    if (cleaned.length === 10) {
      return /^(13|14|15|16|17|18|19)/.test(cleaned);
    }
    
    // International numbers without +
    if (cleaned.length >= 7 && cleaned.length <= 15) {
      return /^\d+$/.test(cleaned);
    }
    
    return false;
  }

  /**
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get OTP verification status
   */
  async getVerificationStatus(sessionId: string): Promise<any> {
    try {
      const response = await apiRequest(`${this.baseUrl}/verification-status/${sessionId}`, {
        method: 'GET',
      });

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get verification status',
        error: error.message
      };
    }
  }
}

export const otpService = new OTPService();
export default otpService;