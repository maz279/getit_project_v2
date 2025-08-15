/**
 * Vendor Store Hook
 * 
 * Manages vendor store state, KYC status, and store configuration
 * Integrates with vendor-service microservice for store management
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface VendorStore {
  id: string;
  vendorId: string;
  storeName: string;
  storeDescription: string;
  storeLogo?: string;
  storeBanner?: string;
  storeStatus: 'active' | 'inactive' | 'suspended';
  customDomain?: string;
  storeSettings: {
    allowReviews: boolean;
    showContactInfo: boolean;
    enableChat: boolean;
    autoApproveProducts: boolean;
    returnPolicy: string;
    shippingPolicy: string;
  };
  analytics: {
    totalVisits: number;
    uniqueVisitors: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface KYCData {
  status: 'not_started' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  documents: {
    nid?: string;
    tradeLicense?: string;
    tinCertificate?: string;
    bankStatement?: string;
  };
  verificationNotes?: string;
}

interface VendorStoreState {
  store: VendorStore | null;
  kycData: KYCData | null;
  loading: boolean;
  error: string | null;
}

export const useVendorStore = () => {
  const [state, setState] = useState<VendorStoreState>({
    store: null,
    kycData: null,
    loading: true,
    error: null
  });

  // Fetch store data
  const fetchStoreData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem('vendor_auth_token');
      if (!token) {
        setState(prev => ({ 
          ...prev, 
          loading: false,
          store: null,
          kycData: null
        }));
        return;
      }

      // Fetch store information
      const storeResponse = await axios.get('/api/v1/vendors/store', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      // Fetch KYC data
      const kycResponse = await axios.get('/api/v1/vendors/kyc', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      setState({
        store: storeResponse.data?.store || null,
        kycData: kycResponse.data?.kyc || { status: 'not_started', documents: {} },
        loading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Failed to fetch store data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load store information'
      }));
    }
  }, []);

  // Update store settings
  const updateStoreSettings = useCallback(async (updates: Partial<VendorStore>) => {
    try {
      const token = localStorage.getItem('vendor_auth_token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await axios.put('/api/v1/vendors/store', updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setState(prev => ({
          ...prev,
          store: response.data.store
        }));
        return { success: true };
      }

      return { success: false, error: response.data?.message || 'Update failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Store update failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Submit KYC documents
  const submitKYC = useCallback(async (documents: FormData) => {
    try {
      const token = localStorage.getItem('vendor_auth_token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await axios.post('/api/v1/vendors/kyc/submit', documents, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        setState(prev => ({
          ...prev,
          kycData: response.data.kyc
        }));
        return { success: true };
      }

      return { success: false, error: response.data?.message || 'KYC submission failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'KYC submission failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Toggle store status
  const toggleStoreStatus = useCallback(async () => {
    try {
      if (!state.store) return { success: false, error: 'No store found' };

      const newStatus = state.store.storeStatus === 'active' ? 'inactive' : 'active';
      
      const result = await updateStoreSettings({ storeStatus: newStatus });
      return result;
    } catch (error: any) {
      return { success: false, error: 'Failed to toggle store status' };
    }
  }, [state.store, updateStoreSettings]);

  // Upload store logo
  const uploadStoreLogo = useCallback(async (file: File) => {
    try {
      const token = localStorage.getItem('vendor_auth_token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post('/api/v1/vendors/store/upload-logo', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        setState(prev => ({
          ...prev,
          store: prev.store ? {
            ...prev.store,
            storeLogo: response.data.logoUrl
          } : null
        }));
        return { success: true, logoUrl: response.data.logoUrl };
      }

      return { success: false, error: response.data?.message || 'Logo upload failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Logo upload failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Upload store banner
  const uploadStoreBanner = useCallback(async (file: File) => {
    try {
      const token = localStorage.getItem('vendor_auth_token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const formData = new FormData();
      formData.append('banner', file);

      const response = await axios.post('/api/v1/vendors/store/upload-banner', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        setState(prev => ({
          ...prev,
          store: prev.store ? {
            ...prev.store,
            storeBanner: response.data.bannerUrl
          } : null
        }));
        return { success: true, bannerUrl: response.data.bannerUrl };
      }

      return { success: false, error: response.data?.message || 'Banner upload failed' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Banner upload failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get store analytics
  const getStoreAnalytics = useCallback(() => {
    return state.store?.analytics || {
      totalVisits: 0,
      uniqueVisitors: 0,
      conversionRate: 0,
      averageOrderValue: 0
    };
  }, [state.store]);

  // Check KYC status
  const isKYCCompleted = useCallback(() => {
    return state.kycData?.status === 'approved';
  }, [state.kycData]);

  const isKYCPending = useCallback(() => {
    return state.kycData?.status === 'pending';
  }, [state.kycData]);

  const isKYCRejected = useCallback(() => {
    return state.kycData?.status === 'rejected';
  }, [state.kycData]);

  // Initialize store data
  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  return {
    store: state.store,
    kycData: state.kycData,
    kycStatus: state.kycData?.status || 'not_started',
    storeStatus: state.store?.storeStatus || 'inactive',
    loading: state.loading,
    error: state.error,
    updateStoreSettings,
    submitKYC,
    toggleStoreStatus,
    uploadStoreLogo,
    uploadStoreBanner,
    refreshStoreData: fetchStoreData,
    getStoreAnalytics,
    isKYCCompleted,
    isKYCPending,
    isKYCRejected
  };
};