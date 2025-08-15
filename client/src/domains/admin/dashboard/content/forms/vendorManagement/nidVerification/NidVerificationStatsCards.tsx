
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  TrendingUp, 
  Users,
  Scan,
  Target
} from 'lucide-react';
import { mockNidStats } from './mockData';

export const NidVerificationStatsCards: React.FC = () => {
  const stats = mockNidStats;

  const statCards = [
    {
      title: 'Total NIDs',
      value: stats.totalNids.toLocaleString(),
      change: `+${stats.monthlyTrend}%`,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Pending Verification',
      value: stats.pendingVerification.toLocaleString(),
      change: `${stats.weeklyTrend > 0 ? '+' : ''}${stats.weeklyTrend}%`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: stats.weeklyTrend > 0 ? 'up' : 'down'
    },
    {
      title: 'Verified NIDs',
      value: stats.verifiedNids.toLocaleString(),
      change: `${stats.successRate}% success`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    },
    {
      title: 'Rejected/Flagged',
      value: (stats.rejectedNids + stats.flaggedNids).toLocaleString(),
      change: `${stats.fraudDetectionRate}% fraud rate`,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'down'
    },
    {
      title: 'Biometric Verified',
      value: stats.biometricVerified.toLocaleString(),
      change: `${((stats.biometricVerified / stats.totalNids) * 100).toFixed(1)}%`,
      icon: Scan,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'up'
    },
    {
      title: 'Compliance Rate',
      value: `${stats.complianceRate}%`,
      change: stats.averageProcessingTime,
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: 'up'
    },
    {
      title: 'Today Processed',
      value: stats.todayProcessed.toLocaleString(),
      change: 'Active verifications',
      icon: Target,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      trend: 'up'
    },
    {
      title: 'Expired NIDs',
      value: stats.expiredNids.toLocaleString(),
      change: 'Need renewal',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      trend: 'neutral'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        const isPositive = stat.trend === 'up';
        const isNegative = stat.trend === 'down';
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="flex items-center text-sm">
                {stat.trend !== 'neutral' && (
                  <TrendingUp 
                    className={`h-3 w-3 mr-1 ${
                      isPositive ? 'text-green-600 rotate-0' : 
                      isNegative ? 'text-red-600 rotate-180' : 
                      'text-gray-600'
                    }`} 
                  />
                )}
                <span className={`${
                  isPositive ? 'text-green-600' : 
                  isNegative ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
