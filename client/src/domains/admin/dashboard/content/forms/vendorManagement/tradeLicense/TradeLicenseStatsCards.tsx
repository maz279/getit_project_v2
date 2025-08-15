
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Building, Timer } from 'lucide-react';

export const TradeLicenseStatsCards: React.FC = () => {
  const stats = [
    {
      title: 'Pending Review',
      value: '89',
      change: '+5%',
      changeType: 'increase' as const,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Verified Licenses',
      value: '1,247',
      change: '+12%',
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Expired Licenses',
      value: '34',
      change: '-8%',
      changeType: 'decrease' as const,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Licenses',
      value: '1,423',
      change: '+18%',
      changeType: 'increase' as const,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Expiring in 30 Days',
      value: '56',
      change: '+7',
      changeType: 'increase' as const,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Compliance Rate',
      value: '96.8%',
      change: '+1.2%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'High Risk Licenses',
      value: '23',
      change: '-5',
      changeType: 'decrease' as const,
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Avg Processing Time',
      value: '3.2 days',
      change: '-0.5 days',
      changeType: 'decrease' as const,
      icon: Timer,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center text-sm mt-1">
                <span className={`
                  ${stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'}
                `}>
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
