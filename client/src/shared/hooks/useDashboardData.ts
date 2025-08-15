
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardService } from '@/shared/services/database/DashboardService';
import type { DashboardKPIMetric, SystemHealthLog, SecurityEvent, ExecutiveReport, QuickAction } from '@/types/dashboard';

// KPI Metrics hooks
export const useKPIMetrics = (filters?: any) => {
  return useQuery({
    queryKey: ['kpi-metrics', filters],
    queryFn: () => DashboardService.getKPIMetrics(filters),
  });
};

// Alias for compatibility
export const useDashboardKPIMetrics = useKPIMetrics;

export const useCreateKPIMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (metric: Omit<DashboardKPIMetric, 'id' | 'created_at' | 'updated_at'>) =>
      DashboardService.createKPIMetric(metric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    },
  });
};

export const useUpdateKPIMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DashboardKPIMetric> }) =>
      DashboardService.updateKPIMetric(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    },
  });
};

export const useDeleteKPIMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => DashboardService.deleteKPIMetric(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    },
  });
};

// System Health hooks  
export const useSystemHealthLogs = (filters?: any) => {
  return useQuery({
    queryKey: ['system-health-logs', filters],
    queryFn: () => DashboardService.getSystemHealthLogs(filters),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useCreateSystemHealthLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (log: Omit<SystemHealthLog, 'id' | 'created_at'>) =>
      DashboardService.createSystemHealthLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-health-logs'] });
    },
  });
};

// Security Events hooks
export const useSecurityEvents = (filters?: any) => {
  return useQuery({
    queryKey: ['security-events', filters],
    queryFn: () => DashboardService.getSecurityEvents(filters),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useCreateSecurityEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (event: Omit<SecurityEvent, 'id' | 'created_at'>) =>
      DashboardService.createSecurityEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
    },
  });
};

// Executive Reports hooks
export const useExecutiveReports = (filters?: any) => {
  return useQuery({
    queryKey: ['executive-reports', filters],
    queryFn: () => DashboardService.getExecutiveReports(filters),
  });
};

export const useCreateExecutiveReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (report: Omit<ExecutiveReport, 'id' | 'created_at' | 'updated_at'>) =>
      DashboardService.createExecutiveReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executive-reports'] });
    },
  });
};

// Quick Actions hooks
export const useQuickActions = () => {
  return useQuery({
    queryKey: ['quick-actions'],
    queryFn: () => DashboardService.getQuickActions(),
  });
};

export const useQuickActionLogs = (limit?: number) => {
  return useQuery({
    queryKey: ['quick-action-logs', limit],
    queryFn: () => DashboardService.getQuickActionLogs(limit),
  });
};

export const useCreateQuickAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (action: Omit<QuickAction, 'id' | 'created_at' | 'updated_at'>) =>
      DashboardService.createQuickAction(action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-actions'] });
    },
  });
};

export const useUpdateQuickAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<QuickAction> }) =>
      DashboardService.updateQuickAction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-actions'] });
    },
  });
};

export const useLogQuickAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: DashboardService.logQuickAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-action-logs'] });
    },
  });
};

// Real-time Analytics hooks - Fixed to accept optional filters parameter
export const useRealTimeAnalytics = (filters?: any) => {
  return useQuery({
    queryKey: ['realtime-analytics', filters],
    queryFn: () => DashboardService.getRealTimeAnalytics(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Performance Metrics hooks - Fixed to accept object parameter with timeframe
export const usePerformanceMetrics = (options?: { timeframe?: string }) => {
  return useQuery({
    queryKey: ['performance-metrics', options],
    queryFn: () => DashboardService.getPerformanceMetrics(),
    refetchInterval: 60000, // Refetch every minute by default
  });
};

// Dashboard search hook - Fixed to return proper structure with searchResults accessible directly
export const useDashboardSearch = (searchTerm: string, filters?: any) => {
  const query = useQuery({
    queryKey: ['dashboard-search', searchTerm, filters],
    queryFn: async () => {
      const results = await DashboardService.searchDashboardData(searchTerm);
      return { data: results || [], searchResults: results || [] };
    },
    enabled: searchTerm.length > 0,
  });

  return {
    ...query,
    searchResults: query.data?.searchResults || []
  };
};

// Combined dashboard data hook
export const useDashboardData = () => {
  const kpiMetrics = useKPIMetrics();
  const systemHealth = useSystemHealthLogs();
  const securityEvents = useSecurityEvents();
  const executiveReports = useExecutiveReports();
  const quickActions = useQuickActions();
  const quickActionLogs = useQuickActionLogs(10);
  const realtimeAnalytics = useRealTimeAnalytics();
  const performanceMetrics = usePerformanceMetrics();

  const isLoading = 
    kpiMetrics.isLoading || 
    systemHealth.isLoading || 
    securityEvents.isLoading || 
    executiveReports.isLoading || 
    quickActions.isLoading ||
    quickActionLogs.isLoading ||
    realtimeAnalytics.isLoading ||
    performanceMetrics.isLoading;

  const error = 
    kpiMetrics.error || 
    systemHealth.error || 
    securityEvents.error || 
    executiveReports.error || 
    quickActions.error ||
    quickActionLogs.error ||
    realtimeAnalytics.error ||
    performanceMetrics.error;

  return {
    data: {
      kpiMetrics: kpiMetrics.data || [],
      systemHealth: systemHealth.data || [],
      securityEvents: securityEvents.data || [],
      executiveReports: executiveReports.data || [],
      quickActions: quickActions.data || [],
      quickActionLogs: quickActionLogs.data || [],
      realtimeAnalytics: realtimeAnalytics.data || {},
      performanceMetrics: performanceMetrics.data || {}
    },
    isLoading,
    error,
    refetch: () => {
      kpiMetrics.refetch();
      systemHealth.refetch();
      securityEvents.refetch();
      executiveReports.refetch();
      quickActions.refetch();
      quickActionLogs.refetch();
      realtimeAnalytics.refetch();
      performanceMetrics.refetch();
    }
  };
};
