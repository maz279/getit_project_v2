
import { useState, useEffect } from 'react';
import { RealtimeAnalyticsService } from '@/shared/services/analytics/RealtimeAnalyticsService';

export const useRealtimeAnalytics = (period: string = '24h', refreshInterval: number = 30000) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await RealtimeAnalyticsService.getDashboardAnalytics(period);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Set up real-time subscription
    const subscription = RealtimeAnalyticsService.subscribeToRealtimeUpdates(() => {
      fetchAnalytics();
    });

    // Set up periodic refresh
    const interval = setInterval(fetchAnalytics, refreshInterval);

    return () => {
      clearInterval(interval);
      RealtimeAnalyticsService.unsubscribeFromRealtimeUpdates(subscription);
    };
  }, [period, refreshInterval]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

export const usePerformanceMetrics = (refreshInterval: number = 60000) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await RealtimeAnalyticsService.getPerformanceMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      setError('Failed to fetch performance metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};
