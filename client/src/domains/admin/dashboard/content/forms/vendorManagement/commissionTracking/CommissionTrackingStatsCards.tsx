
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { CommissionTrackingService } from '@/shared/services/database/CommissionTrackingService';
import { DollarSign, TrendingUp, AlertCircle, CreditCard, Users, Calendar } from 'lucide-react';

export const CommissionTrackingStatsCards: React.FC = () => {
  const [stats, setStats] = useState({
    totalCommissions: 0,
    pendingCommissions: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    totalDisputes: 0,
    openDisputes: 0,
    disputedAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await CommissionTrackingService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading commission stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Commissions',
      value: `৳${stats.totalCommissions.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Pending Commissions',
      value: stats.pendingCommissions.toString(),
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: '+5.2%',
      changeType: 'neutral'
    },
    {
      title: 'Total Payouts',
      value: `৳${stats.totalPayouts.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+8.3%',
      changeType: 'positive'
    },
    {
      title: 'Pending Payouts',
      value: stats.pendingPayouts.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '-2.1%',
      changeType: 'negative'
    },
    {
      title: 'Open Disputes',
      value: stats.openDisputes.toString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '-15.4%',
      changeType: 'positive'
    },
    {
      title: 'Disputed Amount',
      value: `৳${stats.disputedAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-8.7%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="flex items-center text-sm">
                <span className={`font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
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
