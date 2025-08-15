
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { MapPin, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';
import { ZoneStats } from './types';

interface ZoneStatsCardsProps {
  stats: ZoneStats;
}

export const ZoneStatsCards: React.FC<ZoneStatsCardsProps> = ({ stats }) => {
  const statsData = [
    {
      title: 'Total Zones',
      value: stats.totalZones,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+2 from last month'
    },
    {
      title: 'Active Zones',
      value: stats.activeZones,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${((stats.activeZones / stats.totalZones) * 100).toFixed(1)}% coverage`
    },
    {
      title: 'Inactive Zones',
      value: stats.inactiveZones,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: 'Under maintenance'
    },
    {
      title: 'Pending Setup',
      value: stats.pendingZones,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: 'Awaiting approval'
    },
    {
      title: 'Total Coverage',
      value: `${stats.totalCoverage.toLocaleString()} km²`,
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '98.5% of Bangladesh'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              {typeof stat.value === 'number' ? stat.value : stat.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
