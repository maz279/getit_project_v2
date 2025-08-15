
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';
import { mockBankVerificationStats } from './mockData';

export const BankAccountVerificationStatsCards: React.FC = () => {
  const stats = mockBankVerificationStats;

  const statsCards = [
    {
      title: 'Total Bank Accounts',
      value: stats.totalAccounts.toLocaleString(),
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      change: '+12.5%',
      changeType: 'positive' as const
    },
    {
      title: 'Verified Accounts',
      value: stats.verifiedAccounts.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      change: '+8.3%',
      changeType: 'positive' as const
    },
    {
      title: 'Pending Verification',
      value: stats.pendingVerification.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      change: '-5.2%',
      changeType: 'positive' as const
    },
    {
      title: 'Rejected Accounts',
      value: stats.rejectedAccounts.toLocaleString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      change: '+2.1%',
      changeType: 'negative' as const
    },
    {
      title: 'Success Rate',
      value: `${stats.verificationSuccessRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      change: '+1.8%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg. Verification Time',
      value: `${stats.averageVerificationTime} days`,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      change: '-0.3 days',
      changeType: 'positive' as const
    },
    {
      title: 'Fraud Alerts',
      value: stats.fraudAlertsCount.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      change: '-15.4%',
      changeType: 'positive' as const
    },
    {
      title: 'Compliance Issues',
      value: stats.complianceIssues.toLocaleString(),
      icon: Shield,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      change: '-8.7%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${stat.borderColor} ${stat.bgColor} transition-all hover:shadow-md`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="flex items-center text-xs">
                <span className={`font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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
