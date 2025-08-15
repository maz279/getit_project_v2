
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { RegionalPerformance } from './types';
import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RegionalPerformanceTabProps {
  data: RegionalPerformance[];
}

export const RegionalPerformanceTab: React.FC<RegionalPerformanceTabProps> = ({ data }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((region, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  {region.region}
                </div>
                <Badge className={getTrendIcon(region.trend) ? getTrendColor(region.trend) : ''}>
                  {getTrendIcon(region.trend)}
                  <span className="ml-1 capitalize">{region.trend}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{region.onTimeRate}%</div>
                  <div className="text-xs text-gray-600">On-Time Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{region.averageTime}d</div>
                  <div className="text-xs text-gray-600">Avg Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{region.totalDeliveries.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Deliveries</div>
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-red-700 mb-2">⚠️ Challenges</h5>
                <ul className="text-xs text-red-600 space-y-1">
                  {region.challenges.map((challenge, idx) => (
                    <li key={idx}>• {challenge}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-green-700 mb-2">💡 Improvements</h5>
                <ul className="text-xs text-green-600 space-y-1">
                  {region.improvements.map((improvement, idx) => (
                    <li key={idx}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
