
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Target, TrendingUp, Award, BarChart3, Settings, Download } from 'lucide-react';
import { PerformanceBenchmark } from './types';

interface PerformanceBenchmarksTabProps {
  benchmarks: PerformanceBenchmark[];
}

export const PerformanceBenchmarksTab: React.FC<PerformanceBenchmarksTabProps> = ({ benchmarks }) => {
  const getBenchmarkStatus = (value: number, benchmark: PerformanceBenchmark) => {
    if (value >= benchmark.topPerformers * 0.95) return { status: 'excellent', color: 'bg-green-100 text-green-800' };
    if (value >= benchmark.industryAverage) return { status: 'above-average', color: 'bg-blue-100 text-blue-800' };
    if (value >= benchmark.minimumThreshold) return { status: 'acceptable', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'below-threshold', color: 'bg-red-100 text-red-800' };
  };

  // Mock current performance data
  const currentPerformance = {
    'Order Fulfillment Rate': 94.2,
    'Customer Satisfaction Score': 4.4,
    'On-Time Delivery Rate': 91.3,
    'Defect Rate': 1.8
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Performance Benchmarks
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Industry standards and performance targets for vendor evaluation
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Benchmark Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {benchmarks.map((benchmark) => {
          const currentValue = currentPerformance[benchmark.metric as keyof typeof currentPerformance] || 0;
          const status = getBenchmarkStatus(currentValue, benchmark);
          const progressPercentage = Math.min((currentValue / benchmark.topPerformers) * 100, 100);

          return (
            <Card key={benchmark.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{benchmark.metric}</CardTitle>
                    <p className="text-sm text-gray-600">{benchmark.category}</p>
                  </div>
                  <Badge className={status.color}>
                    {status.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Performance */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Performance</span>
                    <span className="text-lg font-bold text-blue-600">
                      {currentValue}{benchmark.unit}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Min: {benchmark.minimumThreshold}{benchmark.unit}</span>
                      <span>Top: {benchmark.topPerformers}{benchmark.unit}</span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-3"
                    />
                  </div>

                  {/* Benchmark Values */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-700">
                        {benchmark.minimumThreshold}{benchmark.unit}
                      </div>
                      <div className="text-xs text-red-600">Minimum</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">
                        {benchmark.industryAverage}{benchmark.unit}
                      </div>
                      <div className="text-xs text-blue-600">Industry Avg</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-700">
                        {benchmark.topPerformers}{benchmark.unit}
                      </div>
                      <div className="text-xs text-green-600">Top Performers</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 mt-3">
                    {benchmark.description}
                  </p>

                  {/* Performance Insights */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {currentValue >= benchmark.topPerformers * 0.95 ? (
                        <Award className="h-4 w-4 text-green-600" />
                      ) : currentValue >= benchmark.industryAverage ? (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-xs font-medium">
                        {currentValue >= benchmark.topPerformers * 0.95 
                          ? 'Excellent performance - among top performers'
                          : currentValue >= benchmark.industryAverage 
                          ? 'Above industry average - good performance'
                          : currentValue >= benchmark.minimumThreshold
                          ? 'Meets minimum requirements - room for improvement'
                          : 'Below minimum threshold - immediate attention required'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Overall Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-green-700">Excellent</div>
              <div className="text-xs text-gray-600">≥95% of top performers</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-blue-700">Above Average</div>
              <div className="text-xs text-gray-600">≥Industry average</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-sm text-yellow-700">Acceptable</div>
              <div className="text-xs text-gray-600">≥Minimum threshold</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-red-700">Below Threshold</div>
              <div className="text-xs text-gray-600">&lt; Minimum required</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
