/**
 * Vendor Authentication Hook
 * 
 * Manages vendor authentication state, login, logout, and session management
 * Integrates with the backend vendor authentication APIs
 * Handles KYC status and vendor permissions
 */

import { useState, useEffect, useCallback } from 'react';
import { vendorAuthService } from '../../services/auth/vendorAuthService';

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
  storeLogo?: string;
  storeType?: string;
  totalProducts?: number;
  totalCustomers?: number;
  unreadNotifications?: number;
  newOrders?: number;
  processingOrders?: number;
  pendingReturns?: number;
  lowStockItems?: number;
  pendingReviews?: number;
  openTickets?: number;
  pendingPayoutAmount?: number;
  isOnline?: boolean;
  storeStatus?: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  vendor: VendorProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
}

export const useVendorAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    vendor: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    token: null
  });

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem('vendor_auth_token');
      if (!token) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          isAuthenticated: false 
        }));
        return;
      }

      // Validate token and get vendor profile
      const response = await vendorAuthService.validateToken();
      
      if (response.success && response.vendor) {
        setAuthState({
          vendor: response.vendor,
          isAuthenticated: true,
          loading: false,
          error: null,
          token: token
        });
      } else {
        // Invalid token, clear storage
        localStorage.removeItem('vendor_auth_token');
        setAuthState({
          vendor: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          token: null
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        vendor: null,
        isAuthenticated: false,
        loading: false,
        error: 'Authentication failed',
        token: null
      });
    }
  };

  // Login function
  const login = useCallback(async (credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await vendorAuthService.login(credentials);

      if (response.success && response.vendor && response.token) {
        // Store token
        localStorage.setItem('vendor_auth_token', response.token);
        
        if (credentials.rememberMe) {
          localStorage.setItem('vendor_remember_me', 'true');
        }

        setAuthState({
          vendor: response.vendor,
          isAuthenticated: true,
          loading: false,
          error: null,
          token: response.token
        });

        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await vendorAuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('vendor_auth_token');
      localStorage.removeItem('vendor_remember_me');
      
      // Reset state
      setAuthState({
        vendor: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        token: null
      });
    }
  }, []);

  // Update vendor profile
  const updateVendorProfile = useCallback(async (updates: Partial<VendorProfile>) => {
    try {
      if (!authState.vendor) return { success: false, error: 'No vendor profile found' };

      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await vendorAuthService.updateProfile(updates);

      if (response.success && response.vendor) {
        setAuthState(prev => ({
          ...prev,
          vendor: response.vendor,
          loading: false,
          error: null
        }));

        return { success: true };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, [authState.vendor]);

  // Refresh vendor data
  const refreshVendorData = useCallback(async () => {
    try {
      if (!authState.isAuthenticated) return;

      const response = await vendorAuthService.getProfile();
      
      if (response.success && response.vendor) {
        setAuthState(prev => ({
          ...prev,
          vendor: response.vendor
        }));
      }
    } catch (error) {
      console.error('Failed to refresh vendor data:', error);
    }
  }, [authState.isAuthenticated]);

  // Check permissions
  const hasPermission = useCallback((permission: string) => {
    if (!authState.vendor) return false;
    
    // Basic permission checks based on vendor status
    if (authState.vendor.status !== 'approved') {
      // Limited permissions for non-approved vendors
      const allowedForPending = ['profile', 'kyc', 'basic_dashboard'];
      return allowedForPending.includes(permission);
    }

    // Full permissions for approved vendors
    return true;
  }, [authState.vendor]);

  // Get vendor statistics
  const getVendorStats = useCallback(() => {
    if (!authState.vendor) return null;

    return {
      totalProducts: authState.vendor.totalProducts || 0,
      totalCustomers: authState.vendor.totalCustomers || 0,
      unreadNotifications: authState.vendor.unreadNotifications || 0,
      newOrders: authState.vendor.newOrders || 0,
      processingOrders: authState.vendor.processingOrders || 0,
      pendingReturns: authState.vendor.pendingReturns || 0,
      lowStockItems: authState.vendor.lowStockItems || 0,
      pendingReviews: authState.vendor.pendingReviews || 0,
      openTickets: authState.vendor.openTickets || 0,
      pendingPayoutAmount: authState.vendor.pendingPayoutAmount || 0
    };
  }, [authState.vendor]);

  return {
    vendor: authState.vendor,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    token: authState.token,
    login,
    logout,
    updateVendorProfile,
    refreshVendorData,
    hasPermission,
    getVendorStats
  };
};