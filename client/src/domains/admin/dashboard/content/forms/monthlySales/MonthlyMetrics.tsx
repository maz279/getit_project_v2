
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { DollarSign, ShoppingCart, Users, Target, ArrowUp, ArrowDown } from 'lucide-react';

export const MonthlyMetrics: React.FC = () => {
  const metrics = [
    {
      title: 'Monthly Revenue',
      value: '৳3.5M',
      change: '+20.7% vs last month',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Monthly Orders',
      value: '17.5K',
      change: '+8.6% vs last month',
      trend: 'up',
      icon: ShoppingCart,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'New Customers',
      value: '11.2K',
      change: '+14.2% vs last month',
      trend: 'up',
      icon: Users,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Avg Order Value',
      value: '৳200',
      change: '-3.2% vs last month',
      trend: 'down',
      icon: Target,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className={`text-sm mt-1 flex items-center ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {metric.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
