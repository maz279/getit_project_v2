
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { useKPIMetrics } from '@/shared/hooks/useDashboardData';
import type { DashboardKPIMetric } from '@/types/dashboard';

interface KPIMetricsSectionProps {
  searchTerm?: string;
}

export const KPIMetricsSection: React.FC<KPIMetricsSectionProps> = ({ searchTerm }) => {
  const { data: metrics, isLoading, error } = useKPIMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading KPI metrics</p>
        </CardContent>
      </Card>
    );
  }

  const filteredMetrics = searchTerm 
    ? metrics?.filter(metric => 
        metric.metric_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.metric_category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : metrics;

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMetrics?.map((metric: DashboardKPIMetric) => (
            <div key={metric.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">
                  {metric.metric_name}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {metric.metric_category}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {metric.metric_value}
                    {metric.metric_unit && (
                      <span className="text-sm text-gray-500 ml-1">
                        {metric.metric_unit}
                      </span>
                    )}
                  </div>
                  
                  {metric.percentage_change && (
                    <div className={`flex items-center text-sm ${getTrendColor(metric.trend_direction)}`}>
                      {getTrendIcon(metric.trend_direction)}
                      <span className="ml-1">
                        {Math.abs(metric.percentage_change)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                {metric.time_period}
              </div>
            </div>
          ))}
        </div>
        
        {(!filteredMetrics || filteredMetrics.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">No KPI metrics found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Make it the default export as well for better compatibility
export default KPIMetricsSection;
