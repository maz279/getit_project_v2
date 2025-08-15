/**
 * Vendor Authentication Service
 * 
 * Handles all vendor authentication operations including login, logout,
 * token validation, and profile management
 * Integrates with the backend vendor-service microservice
 */

import axios, { AxiosInstance } from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface VendorProfile {
  id: string;
  userId: number;
  businessName: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  address: any;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  vendor?: VendorProfile;
  token?: string;
}

class VendorAuthService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api/v1`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('vendor_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('vendor_auth_token');
          window.location.href = '/vendor/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login vendor with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/vendors/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  /**
   * Logout current vendor
   */
  async logout(): Promise<void> {
    try {
      await this.api.post('/vendors/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Validate current auth token
   */
  async validateToken(): Promise<AuthResponse> {
    try {
      const response = await this.api.get('/vendors/auth/validate');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token validation failed'
      };
    }
  }

  /**
   * Get vendor profile
   */
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await this.api.get('/vendors/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile'
      };
    }
  }

  /**
   * Update vendor profile
   */
  async updateProfile(updates: Partial<VendorProfile>): Promise<AuthResponse> {
    try {
      const response = await this.api.put('/vendors/profile', updates);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  }

  /**
   * Register new vendor
   */
  async register(vendorData: any): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/vendors/register', vendorData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/vendors/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset request failed'
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/vendors/auth/reset-password', {
        token,
        password: newPassword
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/vendors/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed'
      };
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/vendors/auth/enable-2fa');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to enable 2FA'
      };
    }
  }

  /**
   * Verify two-factor authentication
   */
  async verifyTwoFactor(code: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/vendors/auth/verify-2fa', { code });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '2FA verification failed'
      };
    }
  }
}

export const vendorAuthService = new VendorAuthService();