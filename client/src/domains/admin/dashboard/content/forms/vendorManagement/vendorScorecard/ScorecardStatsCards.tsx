
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TrendingUp, TrendingDown, ClipboardCheck, Star, AlertCircle, CheckCircle, FileText, Target } from 'lucide-react';

interface ScorecardStats {
  totalEvaluations: number;
  pendingReviews: number;
  averageRating: number;
  excellentVendors: number;
  improvementNeeded: number;
  complianceRate: number;
  monthlyAssessments: number;
  criticalIssues: number;
}

interface ScorecardStatsCardsProps {
  stats: ScorecardStats;
}

export const ScorecardStatsCards: React.FC<ScorecardStatsCardsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Evaluations',
      value: stats.totalEvaluations.toLocaleString(),
      icon: ClipboardCheck,
      change: '+45',
      changeType: 'positive' as const,
      description: 'Completed assessments'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews.toLocaleString(),
      icon: AlertCircle,
      change: '-8',
      changeType: 'negative' as const,
      description: 'Awaiting evaluation'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      change: '+0.2',
      changeType: 'positive' as const,
      description: 'Overall vendor score'
    },
    {
      title: 'Excellent Vendors',
      value: stats.excellentVendors.toLocaleString(),
      icon: CheckCircle,
      change: '+12',
      changeType: 'positive' as const,
      description: 'Rating ≥ 4.5 stars'
    },
    {
      title: 'Need Improvement',
      value: stats.improvementNeeded.toLocaleString(),
      icon: TrendingDown,
      change: '-5',
      changeType: 'negative' as const,
      description: 'Rating < 3.0 stars'
    },
    {
      title: 'Compliance Rate',
      value: `${stats.complianceRate}%`,
      icon: Target,
      change: '+3.2%',
      changeType: 'positive' as const,
      description: 'Meeting standards'
    },
    {
      title: 'Monthly Assessments',
      value: stats.monthlyAssessments.toString(),
      icon: FileText,
      change: '+18',
      changeType: 'positive' as const,
      description: 'This month'
    },
    {
      title: 'Critical Issues',
      value: stats.criticalIssues.toString(),
      icon: AlertCircle,
      change: '-3',
      changeType: 'negative' as const,
      description: 'Urgent attention needed'
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
