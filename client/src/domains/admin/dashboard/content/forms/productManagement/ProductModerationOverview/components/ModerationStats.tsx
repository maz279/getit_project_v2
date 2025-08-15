/**
 * PHASE 2: MODERATION STATS COMPONENT
 * Statistics dashboard component with performance metrics and trends
 * Investment: $25,000 | Week 1: Component Decomposition
 * Date: July 26, 2025
 */

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Target,
  RefreshCw,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { useModerationStats } from '../hooks/useModerationStats';
import type { ModerationStats as StatsType } from '../types/moderationTypes';

interface ModerationStatsProps {
  className?: string;
  autoRefresh?: boolean;
  showTrends?: boolean;
  showRecommendations?: boolean;
}

export const ModerationStats = memo<ModerationStatsProps>(({ 
  className = '',
  autoRefresh = true,
  showTrends = true,
  showRecommendations = true,
}) => {
  const {
    stats,
    loading,
    refreshing,
    error,
    refreshStats,
    efficiency,
    trendsData,
    performanceScore,
    bottlenecks,
    recommendations,
  } = useModerationStats({ autoRefresh });

  // Get trend icon and color
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <div className="h-3 w-3" />; // Spacer
    }
  };

  // Get performance color based on score
  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600 border-green-500';
    if (score >= 70) return 'text-yellow-600 border-yellow-500';
    return 'text-red-600 border-red-500';
  };

  // Loading state
  if (loading && !stats) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Failed to load moderation statistics</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            className="mt-3"
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Moderation Statistics</h3>
          <p className="text-sm text-gray-600">Real-time overview of moderation performance</p>
        </div>
        <div className="flex items-center space-x-2">
          {showTrends && (
            <Badge variant="outline" className={getPerformanceColor(performanceScore)}>
              <BarChart3 className="h-3 w-3 mr-1" />
              Performance: {performanceScore}%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshStats}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Products */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-orange-500" />
              {showTrends && getTrendIcon(trendsData.pendingTrend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
            <Progress 
              value={Math.min((stats.pending / 150) * 100, 100)} 
              className="mt-2 h-2"
            />
            <div className="text-xs text-gray-500 mt-1">
              Target: &lt; 50 items
            </div>
          </CardContent>
        </Card>

        {/* Approved Products */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {showTrends && getTrendIcon(trendsData.approvalTrend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Quality approved</p>
            <Progress value={85} className="mt-2 h-2" />
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((stats.approved / (stats.approved + stats.rejected)) * 100)}% approval rate
            </div>
          </CardContent>
        </Card>

        {/* Rejected Products */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Need vendor revision</p>
            <Progress value={15} className="mt-2 h-2" />
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((stats.rejected / (stats.approved + stats.rejected)) * 100)}% rejection rate
            </div>
          </CardContent>
        </Card>

        {/* Average Review Time */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <div className="flex items-center space-x-1">
              <Zap className="h-4 w-4 text-purple-500" />
              {showTrends && getTrendIcon(trendsData.reviewTimeTrend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.reviewTime}h</div>
            <p className="text-xs text-muted-foreground">Target: &lt; 2.5h</p>
            <Progress 
              value={Math.max(0, Math.min(100, ((2.5 - stats.reviewTime) / 2.5) * 100))} 
              className="mt-2 h-2" 
            />
            <div className="text-xs text-gray-500 mt-1">
              {stats.reviewTime <= 2.5 ? 'On target' : 'Above target'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Accuracy Rate */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-500" />
              Accuracy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{stats.accuracy}%</div>
            <Progress value={stats.accuracy} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.accuracy >= 98 ? 'Excellent' : stats.accuracy >= 95 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        {/* Daily Progress */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.completedToday}/{stats.dailyQuota}</div>
            <Progress 
              value={(stats.completedToday / stats.dailyQuota) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((stats.completedToday / stats.dailyQuota) * 100)}% of daily quota
            </p>
          </CardContent>
        </Card>

        {/* Efficiency Score */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{efficiency}%</div>
            <Progress value={efficiency} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Overall team efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recommendations */}
      {(showRecommendations && (bottlenecks.length > 0 || recommendations.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bottlenecks */}
          {bottlenecks.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {bottlenecks.slice(0, 3).map((bottleneck, index) => (
                    <li key={index} className="text-sm text-orange-700 flex items-start">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {bottleneck}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.slice(0, 3).map((recommendation, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
});

ModerationStats.displayName = 'ModerationStats';