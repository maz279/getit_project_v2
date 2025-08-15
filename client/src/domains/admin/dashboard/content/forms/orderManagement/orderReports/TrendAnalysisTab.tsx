
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, Calendar, Target } from 'lucide-react';
import { TrendAnalysis } from './types';

interface TrendAnalysisTabProps {
  data: TrendAnalysis;
}

export const TrendAnalysisTab: React.FC<TrendAnalysisTabProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Trend Analysis & Forecasting</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 Sales Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.salesTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'orders' ? value.toLocaleString() : 
                  name === 'revenue' ? `৳${value.toLocaleString()}` : 
                  value.toLocaleString(),
                  name === 'orders' ? 'Orders' : 
                  name === 'revenue' ? 'Revenue' : 'Customers'
                ]} />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="customers" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📅 Seasonal Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.seasonalPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'orders' ? value.toLocaleString() : `৳${value.toLocaleString()}`,
                  name === 'orders' ? 'Orders' : 'Revenue'
                ]} />
                <Bar dataKey="orders" fill="#3b82f6" />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🔮 Sales Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.forecastData.map((forecast, index) => (
              <div key={index} className="border rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{forecast.period}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Predicted Orders</p>
                    <p className="text-xl font-bold text-blue-600">{forecast.predictedOrders.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Predicted Revenue</p>
                    <p className="text-xl font-bold text-green-600">৳{forecast.predictedRevenue.toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    <Target className="h-3 w-3 mr-1" />
                    {forecast.confidence}% confidence
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
