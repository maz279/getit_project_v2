
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TrendingUp, TrendingDown, Users, Award, AlertTriangle, Target, BarChart3, CheckCircle } from 'lucide-react';
import { PerformanceStats } from './types';

interface VendorPerformanceStatsCardsProps {
  stats: PerformanceStats;
}

export const VendorPerformanceStatsCards: React.FC<VendorPerformanceStatsCardsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Vendors',
      value: stats.totalVendors.toLocaleString(),
      icon: Users,
      change: '+12.5%',
      changeType: 'positive' as const,
      description: 'Active marketplace vendors'
    },
    {
      title: 'Active Vendors',
      value: stats.activeVendors.toLocaleString(),
      icon: CheckCircle,
      change: '+8.3%',
      changeType: 'positive' as const,
      description: 'Currently selling vendors'
    },
    {
      title: 'Excellent Performers',
      value: stats.excellentPerformers.toLocaleString(),
      icon: Award,
      change: '+15.2%',
      changeType: 'positive' as const,
      description: 'Score ≥ 9.0 vendors'
    },
    {
      title: 'Under Performers',
      value: stats.underPerformers.toLocaleString(),
      icon: AlertTriangle,
      change: '-23.1%',
      changeType: 'negative' as const,
      description: 'Score < 7.0 vendors'
    },
    {
      title: 'Average Score',
      value: stats.averageScore.toFixed(1),
      icon: BarChart3,
      change: '+0.3',
      changeType: 'positive' as const,
      description: 'Overall performance score'
    },
    {
      title: 'Monthly Growth',
      value: `${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      change: '+2.1%',
      changeType: 'positive' as const,
      description: 'Performance improvement'
    },
    {
      title: 'Active Alerts',
      value: stats.alertsCount.toString(),
      icon: AlertTriangle,
      change: '-12',
      changeType: 'negative' as const,
      description: 'Requires attention'
    },
    {
      title: 'Compliance Rate',
      value: `${stats.complianceRate}%`,
      icon: Target,
      change: '+1.2%',
      changeType: 'positive' as const,
      description: 'Meeting standards'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.changeType === 'positive';
        
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
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
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
