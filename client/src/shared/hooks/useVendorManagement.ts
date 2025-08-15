
import { useState, useEffect } from 'react';
import { VendorManagementService, VendorData } from '@/shared/services/database/VendorManagementService';

export const useVendors = (filters?: any) => {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await VendorManagementService.getVendors(filters);
      setVendors(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [JSON.stringify(filters)]);

  return {
    vendors,
    loading,
    error,
    refetch: fetchVendors
  };
};

export const useVendorPerformance = (vendorId?: string, filters?: any) => {
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const data = await VendorManagementService.getVendorPerformanceReports({
        vendor_id: vendorId,
        ...filters
      });
      setPerformance(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching vendor performance:', err);
      setError('Failed to fetch vendor performance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [vendorId, JSON.stringify(filters)]);

  return {
    performance,
    loading,
    error,
    refetch: fetchPerformance
  };
};

export const useVendorAnalytics = (vendorId: string, period: string = '30d') => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await VendorManagementService.getVendorAnalytics(vendorId);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching vendor analytics:', err);
      setError('Failed to fetch vendor analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchAnalytics();
    }
  }, [vendorId, period]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};
