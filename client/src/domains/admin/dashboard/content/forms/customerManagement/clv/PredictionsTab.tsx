
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Brain, Target, Lightbulb } from 'lucide-react';
import { CLVPrediction } from './types';

interface PredictionsTabProps {
  predictions: CLVPrediction[];
}

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ predictions }) => {
  const formatCurrency = (amount: number): string => {
    return `৳${amount.toLocaleString()}`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">AI-Powered</div>
              <div className="text-sm text-gray-600">Predictive Analytics</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm text-gray-600">Average Accuracy</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">35%</div>
              <div className="text-sm text-gray-600">CLV Growth Potential</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictions.map((prediction, index) => {
          const chartData = [
            { period: 'Current', value: prediction.currentCLV },
            { period: '3 Months', value: prediction.predictedCLV3Months },
            { period: '6 Months', value: prediction.predictedCLV6Months },
            { period: '12 Months', value: prediction.predictedCLV12Months }
          ];

          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Customer {prediction.customerId}</CardTitle>
                  <Badge className={getConfidenceColor(prediction.confidenceScore)}>
                    {prediction.confidenceScore}% Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Current CLV</div>
                    <div className="text-xl font-bold text-green-600">{formatCurrency(prediction.currentCLV)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">12-Month Prediction</div>
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(prediction.predictedCLV12Months)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">CLV Projection</div>
                  <ChartContainer config={{ value: {} }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Key Factors</div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.keyFactors.map((factor, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Recommendations
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {prediction.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    Implement Strategy
                  </Button>
                  <Button size="sm" variant="ghost">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
