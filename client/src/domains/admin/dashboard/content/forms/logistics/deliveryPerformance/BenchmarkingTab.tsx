
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Benchmarking } from './types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BenchmarkingTabProps {
  data: Benchmarking[];
}

export const BenchmarkingTab: React.FC<BenchmarkingTabProps> = ({ data }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (ourValue: number, industryAvg: number, isLowerBetter: boolean = false) => {
    const better = isLowerBetter ? ourValue < industryAvg : ourValue > industryAvg;
    return better ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {data.map((benchmark, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{benchmark.metric}</span>
                <Badge className="flex items-center">
                  {getTrendIcon(benchmark.trend)}
                  <span className="ml-1 capitalize">{benchmark.trend}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className={`p-3 rounded-lg text-center ${getPerformanceColor(
                  benchmark.ourPerformance, 
                  benchmark.industryAverage,
                  benchmark.metric.includes('Time') || benchmark.metric.includes('Cost')
                )}`}>
                  <div className="text-lg font-bold">
                    {benchmark.ourPerformance}{benchmark.unit}
                  </div>
                  <div className="text-xs">Our Performance</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-700">
                    {benchmark.industryAverage}{benchmark.unit}
                  </div>
                  <div className="text-xs text-gray-600">Industry Average</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-700">
                    {benchmark.bestInClass}{benchmark.unit}
                  </div>
                  <div className="text-xs text-blue-600">Best in Class</div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-700">
                    {benchmark.competitorA}{benchmark.unit}
                  </div>
                  <div className="text-xs text-purple-600">Competitor A</div>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-orange-700">
                    {benchmark.competitorB}{benchmark.unit}
                  </div>
                  <div className="text-xs text-orange-600">Competitor B</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
