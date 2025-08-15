
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TrendingUp, Clock, Star, Package, AlertTriangle, RotateCcw, DollarSign, Target } from 'lucide-react';
import { DeliveryPerformanceStats } from './types';

interface PerformanceStatsCardsProps {
  stats: DeliveryPerformanceStats;
}

export const PerformanceStatsCards: React.FC<PerformanceStatsCardsProps> = ({ stats }) => {
  const statsData = [
    {
      title: 'On-Time Delivery',
      value: `${stats.onTimeDeliveryRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+2.3% from last month',
      trend: 'up'
    },
    {
      title: 'Avg Delivery Time',
      value: `${stats.averageDeliveryTime} days`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '-0.2 days improvement',
      trend: 'down'
    },
    {
      title: 'Customer Satisfaction',
      value: `${stats.customerSatisfaction}/5.0`,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+0.1 from last month',
      trend: 'up'
    },
    {
      title: 'Total Deliveries',
      value: stats.totalDeliveries.toLocaleString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15% from last month',
      trend: 'up'
    },
    {
      title: 'Failed Deliveries',
      value: stats.failedDeliveries.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '-12 from last month',
      trend: 'down'
    },
    {
      title: 'Return Rate',
      value: `${stats.returnRate}%`,
      icon: RotateCcw,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-0.3% improvement',
      trend: 'down'
    },
    {
      title: 'Cost per Delivery',
      value: `৳${stats.costPerDelivery}`,
      icon: DollarSign,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      change: '-৳5 optimization',
      trend: 'down'
    },
    {
      title: 'Revenue Impact',
      value: `৳${(stats.revenueImpact / 1000000).toFixed(1)}M`,
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '+8% from last month',
      trend: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            <p className={`text-xs mt-1 flex items-center ${
              stat.trend === 'up' ? 'text-green-600' : 
              stat.trend === 'down' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {stat.trend === 'up' ? '↗️' : stat.trend === 'down' ? '↘️' : '➡️'} {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
