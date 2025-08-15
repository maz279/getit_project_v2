
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const mockTrendsData = [
  { month: 'Jan', overall: 8.2, quality: 8.5, delivery: 7.8, customer: 8.0 },
  { month: 'Feb', overall: 8.4, quality: 8.7, delivery: 8.1, customer: 8.2 },
  { month: 'Mar', overall: 8.6, quality: 8.9, delivery: 8.3, customer: 8.4 },
  { month: 'Apr', overall: 8.5, quality: 8.8, delivery: 8.2, customer: 8.3 },
  { month: 'May', overall: 8.7, quality: 9.0, delivery: 8.4, customer: 8.6 },
  { month: 'Jun', overall: 8.9, quality: 9.2, delivery: 8.6, customer: 8.8 }
];

export const PerformanceTrendsChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Performance Trends Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockTrendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="overall" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="quality" stroke="#82ca9d" strokeWidth={2} />
            <Line type="monotone" dataKey="delivery" stroke="#ffc658" strokeWidth={2} />
            <Line type="monotone" dataKey="customer" stroke="#ff7300" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
