/**
 * PHASE 2: MODERATION STATS HOOK
 * Custom hook for managing moderation statistics and performance metrics
 * Investment: $25,000 | Week 1: Component Decomposition
 * Date: July 26, 2025
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../../../../store';
import { fetchModerationStats } from '../../../../../../../../store/slices/moderationSlice';
import type { ModerationStats, ModerationAnalytics } from '../types/moderationTypes';

interface UseModerationStatsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  enableRealTime?: boolean;
}

interface UseModerationStatsReturn {
  // Data
  stats: ModerationStats | null;
  analytics: ModerationAnalytics | null;
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  refreshStats: () => Promise<void>;
  clearError: () => void;
  
  // Computed values
  efficiency: number;
  trendsData: {
    pendingTrend: 'up' | 'down' | 'stable';
    approvalTrend: 'up' | 'down' | 'stable';
    reviewTimeTrend: 'up' | 'down' | 'stable';
  };
  
  // Performance indicators
  performanceScore: number;
  bottlenecks: string[];
  recommendations: string[];
}

export const useModerationStats = (
  options: UseModerationStatsOptions = {}
): UseModerationStatsReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTime = false,
  } = options;

  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { stats, loading, errors } = useSelector((state: RootState) => ({
    stats: state.moderation.stats,
    loading: state.moderation.loading.stats,
    errors: state.moderation.errors.stats,
  }));

  // Local state
  const [analytics, setAnalytics] = useState<ModerationAnalytics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [previousStats, setPreviousStats] = useState<ModerationStats | null>(null);

  // Refresh stats function
  const refreshStats = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Store previous stats for trend calculation
      if (stats) {
        setPreviousStats(stats);
      }
      
      await dispatch(fetchModerationStats()).unwrap();
      
      // Fetch analytics data
      const analyticsResponse = await fetch('/api/admin/moderation/analytics');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to refresh moderation stats:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, stats]);

  // Clear error function
  const clearError = useCallback(() => {
    // Dispatch clear error action if available
    // For now, we'll handle this locally
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshStats]);

  // Initial load effect
  useEffect(() => {
    if (!stats && !loading) {
      refreshStats();
    }
  }, [stats, loading, refreshStats]);

  // Real-time updates (WebSocket integration)
  useEffect(() => {
    if (!enableRealTime) return;

    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/moderation`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'stats_update') {
        // Update stats with real-time data
        refreshStats();
      }
    };

    return () => {
      ws.close();
    };
  }, [enableRealTime, refreshStats]);

  // Compute efficiency score
  const efficiency = useMemo(() => {
    if (!stats) return 0;
    
    const targetReviewTime = 2.5; // hours
    const timeEfficiency = Math.max(0, (targetReviewTime - stats.reviewTime) / targetReviewTime);
    const accuracyScore = stats.accuracy / 100;
    const completionRate = stats.completedToday / Math.max(stats.dailyQuota, 1);
    
    return Math.round((timeEfficiency * 0.4 + accuracyScore * 0.4 + completionRate * 0.2) * 100);
  }, [stats]);

  // Compute trend data
  const trendsData = useMemo(() => {
    if (!stats || !previousStats) {
      return {
        pendingTrend: 'stable' as const,
        approvalTrend: 'stable' as const,
        reviewTimeTrend: 'stable' as const,
      };
    }

    const pendingChange = stats.pending - previousStats.pending;
    const approvalChange = stats.approved - previousStats.approved;
    const reviewTimeChange = stats.reviewTime - previousStats.reviewTime;

    return {
      pendingTrend: pendingChange > 2 ? 'up' : pendingChange < -2 ? 'down' : 'stable',
      approvalTrend: approvalChange > 5 ? 'up' : approvalChange < -5 ? 'down' : 'stable',
      reviewTimeTrend: reviewTimeChange > 0.2 ? 'up' : reviewTimeChange < -0.2 ? 'down' : 'stable',
    } as const;
  }, [stats, previousStats]);

  // Compute performance score
  const performanceScore = useMemo(() => {
    if (!stats) return 0;
    
    let score = 100;
    
    // Deduct points for high pending count
    if (stats.pending > 100) score -= 20;
    else if (stats.pending > 50) score -= 10;
    
    // Deduct points for slow review time
    if (stats.reviewTime > 3) score -= 25;
    else if (stats.reviewTime > 2.5) score -= 15;
    
    // Deduct points for low accuracy
    if (stats.accuracy < 95) score -= 15;
    else if (stats.accuracy < 98) score -= 10;
    
    // Deduct points for high escalation rate
    const escalationRate = (stats.escalated / Math.max(stats.approved + stats.rejected + stats.escalated, 1)) * 100;
    if (escalationRate > 10) score -= 15;
    else if (escalationRate > 5) score -= 10;
    
    return Math.max(0, score);
  }, [stats]);

  // Identify bottlenecks
  const bottlenecks = useMemo(() => {
    if (!stats) return [];
    
    const issues: string[] = [];
    
    if (stats.pending > 100) {
      issues.push('High pending queue - consider adding more reviewers');
    }
    
    if (stats.reviewTime > 2.5) {
      issues.push('Slow review time - optimize review workflow');
    }
    
    if (stats.accuracy < 95) {
      issues.push('Low accuracy - provide additional training');
    }
    
    const escalationRate = (stats.escalated / Math.max(stats.approved + stats.rejected + stats.escalated, 1)) * 100;
    if (escalationRate > 10) {
      issues.push('High escalation rate - review complexity guidelines');
    }
    
    if (stats.completedToday < stats.dailyQuota * 0.8) {
      issues.push('Behind daily quota - check team availability');
    }
    
    return issues;
  }, [stats]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    if (!stats) return [];
    
    const recs: string[] = [];
    
    if (stats.pending > 50) {
      recs.push('Enable auto-assignment to distribute workload evenly');
    }
    
    if (stats.reviewTime > 2) {
      recs.push('Implement quick-review templates for common cases');
    }
    
    if (stats.accuracy > 98) {
      recs.push('Excellent accuracy! Consider recognizing top performers');
    }
    
    if (efficiency > 90) {
      recs.push('Outstanding efficiency! Team is performing well');
    } else if (efficiency < 70) {
      recs.push('Focus on process improvements and team training');
    }
    
    const approvalRate = (stats.approved / Math.max(stats.approved + stats.rejected, 1)) * 100;
    if (approvalRate < 60) {
      recs.push('Low approval rate - review vendor guidelines');
    } else if (approvalRate > 90) {
      recs.push('High approval rate - ensure quality standards are maintained');
    }
    
    return recs;
  }, [stats, efficiency]);

  return {
    // Data
    stats,
    analytics,
    
    // Loading states
    loading,
    refreshing,
    
    // Error handling
    error: errors,
    
    // Actions
    refreshStats,
    clearError,
    
    // Computed values
    efficiency,
    trendsData,
    
    // Performance indicators
    performanceScore,
    bottlenecks,
    recommendations,
  };
};