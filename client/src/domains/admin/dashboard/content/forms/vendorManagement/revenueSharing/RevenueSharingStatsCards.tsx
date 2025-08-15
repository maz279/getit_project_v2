
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, Users, Target } from 'lucide-react';

export const RevenueSharingStatsCards: React.FC = () => {
  const stats = [
    {
      title: 'Total Shared Revenue',
      value: '৳12.4M',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      description: 'This month'
    },
    {
      title: 'Average Commission Rate',
      value: '14.8%',
      change: '+0.5%',
      trend: 'up',
      icon: Percent,
      description: 'Across all categories'
    },
    {
      title: 'Active Revenue Models',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Target,
      description: 'Currently running'
    },
    {
      title: 'Participating Vendors',
      value: '1,247',
      change: '+89',
      trend: 'up',
      icon: Users,
      description: 'This quarter'
    },
    {
      title: 'Revenue Growth Rate',
      value: '23.5%',
      change: '+4.2%',
      trend: 'up',
      icon: TrendingUp,
      description: 'YoY growth'
    },
    {
      title: 'Payout Efficiency',
      value: '98.7%',
      change: '-0.3%',
      trend: 'down',
      icon: Target,
      description: 'On-time payments'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === 'up';
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center mt-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
