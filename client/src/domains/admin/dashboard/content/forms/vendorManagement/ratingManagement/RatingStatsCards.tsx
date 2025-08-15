
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TrendingUp, TrendingDown, Star, Shield, AlertTriangle, CheckCircle, Eye, Flag } from 'lucide-react';

interface RatingStats {
  totalReviews: number;
  averageRating: number;
  pendingModeration: number;
  flaggedReviews: number;
  verifiedReviews: number;
  fakeReviewsDetected: number;
  disputesResolved: number;
  activeDisputes: number;
}

interface RatingStatsCardsProps {
  stats: RatingStats;
}

export const RatingStatsCards: React.FC<RatingStatsCardsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Reviews',
      value: stats.totalReviews.toLocaleString(),
      icon: Star,
      change: '+1,234',
      changeType: 'positive' as const,
      description: 'All time reviews'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      change: '+0.1',
      changeType: 'positive' as const,
      description: 'Platform average'
    },
    {
      title: 'Pending Moderation',
      value: stats.pendingModeration.toLocaleString(),
      icon: Eye,
      change: '-45',
      changeType: 'negative' as const,
      description: 'Awaiting review'
    },
    {
      title: 'Flagged Reviews',
      value: stats.flaggedReviews.toString(),
      icon: Flag,
      change: '-3',
      changeType: 'negative' as const,
      description: 'Require attention'
    },
    {
      title: 'Verified Reviews',
      value: stats.verifiedReviews.toLocaleString(),
      icon: CheckCircle,
      change: '+892',
      changeType: 'positive' as const,
      description: 'Authenticated purchases'
    },
    {
      title: 'Fake Reviews Detected',
      value: stats.fakeReviewsDetected.toString(),
      icon: Shield,
      change: '+12',
      changeType: 'neutral' as const,
      description: 'AI detection system'
    },
    {
      title: 'Disputes Resolved',
      value: stats.disputesResolved.toString(),
      icon: CheckCircle,
      change: '+15',
      changeType: 'positive' as const,
      description: 'This month'
    },
    {
      title: 'Active Disputes',
      value: stats.activeDisputes.toString(),
      icon: AlertTriangle,
      change: '-7',
      changeType: 'negative' as const,
      description: 'Under investigation'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.changeType === 'positive';
        const isNeutral = stat.changeType === 'neutral';
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center text-xs ${
                  isNeutral ? 'text-gray-600' : 
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {!isNeutral && (isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ))}
                  {stat.change}
                </div>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
