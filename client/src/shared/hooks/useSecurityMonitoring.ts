
import { useState, useEffect } from 'react';
import { SecurityService } from '@/shared/services/database/SecurityService';

export const useSecurityEvents = (filters?: any, refreshInterval: number = 30000) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await SecurityService.getSecurityEvents(filters);
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching security events:', err);
      setError('Failed to fetch security events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [JSON.stringify(filters), refreshInterval]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents
  };
};

export const useSecurityAnalytics = (period: string = '30d') => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await SecurityService.getSecurityAnalytics(period);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching security analytics:', err);
      setError('Failed to fetch security analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

export const useSystemHealth = (refreshInterval: number = 60000) => {
  const [healthLogs, setHealthLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthLogs = async () => {
    try {
      setLoading(true);
      const data = await SecurityService.getSystemHealthLogs({ limit: 50 });
      setHealthLogs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system health logs:', err);
      setError('Failed to fetch system health logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthLogs();
    const interval = setInterval(fetchHealthLogs, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    healthLogs,
    loading,
    error,
    refetch: fetchHealthLogs
  };
};
