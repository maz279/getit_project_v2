/**
 * Authentication Types - Amazon.com/Shopee.sg Level Implementation
 * Comprehensive type definitions for user authentication system
 */

export interface LoginRequest {
  loginType: 'email' | 'phone' | 'username';
  identifier: string; // email, phone, or username
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface RegisterRequest {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  agreesToTerms: boolean;
  agreesToMarketing?: boolean;
  referralCode?: string;
  deviceInfo?: DeviceInfo;
}

export interface OTPVerificationRequest {
  userId: string;
  phone: string;
  otp: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  platform: string;
  appVersion?: string;
  userAgent: string;
  ipAddress: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: 'customer' | 'vendor' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SessionData {
  id: string;
  userId: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OTPSession {
  id: string;
  userId: string;
  phone: string;
  otp: string;
  attempts: number;
  expiresAt: Date;
  isVerified: boolean;
  createdAt: Date;
}

export interface EmailVerificationToken {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook' | 'apple';
  accessToken: string;
  idToken?: string;
  deviceInfo?: DeviceInfo;
}

export interface SocialUserInfo {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isEmailVerified: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  sessionTimeout: number;
}

export interface LoginAttempt {
  id: string;
  identifier: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  createdAt: Date;
}

export interface AccountLockout {
  id: string;
  userId: string;
  reason: string;
  lockedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Bangladesh-specific types
export interface BangladeshUserProfile {
  nidNumber?: string;
  division: string;
  district: string;
  upazila?: string;
  preferredLanguage: 'bengali' | 'english';
  mobileOperator: 'grameenphone' | 'robi' | 'banglalink' | 'teletalk' | 'airtel';
}

export interface MobileBankingInfo {
  provider: 'bkash' | 'nagad' | 'rocket';
  accountNumber: string;
  isVerified: boolean;
  verifiedAt?: Date;
}

export interface KYCDocument {
  type: 'nid' | 'passport' | 'driving_license';
  documentNumber: string;
  frontImageUrl: string;
  backImageUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  rejectionReason?: string;
}