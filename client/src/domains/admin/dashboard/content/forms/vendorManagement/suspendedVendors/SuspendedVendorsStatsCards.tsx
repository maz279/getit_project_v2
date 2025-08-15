
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { 
  UserX, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Shield,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { SuspendedVendorStats } from './types';

interface SuspendedVendorsStatsCardsProps {
  stats: SuspendedVendorStats;
}

export const SuspendedVendorsStatsCards: React.FC<SuspendedVendorsStatsCardsProps> = ({ stats }) => {
  const statsCards = [
    {
      title: 'Total Suspended',
      value: stats.totalSuspended.toString(),
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+3',
      changeType: 'negative' as const
    },
    {
      title: 'Temporary Suspensions',
      value: stats.temporarySuspensions.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+2',
      changeType: 'neutral' as const
    },
    {
      title: 'Permanent Suspensions',
      value: stats.permanentSuspensions.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+1',
      changeType: 'negative' as const
    },
    {
      title: 'Under Review',
      value: stats.underReview.toString(),
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '-2',
      changeType: 'positive' as const
    },
    {
      title: 'Appeals Pending',
      value: stats.appealsPending.toString(),
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+4',
      changeType: 'neutral' as const
    },
    {
      title: 'Eligible for Reinstatement',
      value: stats.eligibleForReinstatement.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Suspension Duration',
      value: `${stats.averageSuspensionDuration} days`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '-2 days',
      changeType: 'positive' as const
    },
    {
      title: 'Reinstatement Rate',
      value: `${stats.reinstatementRate}%`,
      icon: RotateCcw,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      change: '+5%',
      changeType: 'positive' as const
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
