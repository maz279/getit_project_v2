
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users,
  TrendingUp,
  Timer
} from 'lucide-react';
import { ApplicationStats } from './types';

interface PendingApplicationsStatsCardsProps {
  stats: ApplicationStats;
}

export const PendingApplicationsStatsCards: React.FC<PendingApplicationsStatsCardsProps> = ({ stats }) => {
  const statsCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%',
      changeType: 'neutral' as const
    },
    {
      title: 'Under Review',
      value: stats.underReview.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '-3%',
      changeType: 'positive' as const
    },
    {
      title: 'Approved',
      value: stats.approved.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+18%',
      changeType: 'positive' as const
    },
    {
      title: 'Rejected',
      value: stats.rejected.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '-8%',
      changeType: 'positive' as const
    },
    {
      title: 'Urgent Applications',
      value: stats.urgentApplications.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+2',
      changeType: 'negative' as const
    },
    {
      title: 'Avg Processing Time',
      value: `${stats.avgProcessingTime} days`,
      icon: Timer,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '-0.5 days',
      changeType: 'positive' as const
    },
    {
      title: 'Documents to Verify',
      value: stats.documentsToVerify.toString(),
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      change: '+7%',
      changeType: 'neutral' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                <span>{card.title}</span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <div className={`text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' : 
                  card.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {card.change}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
