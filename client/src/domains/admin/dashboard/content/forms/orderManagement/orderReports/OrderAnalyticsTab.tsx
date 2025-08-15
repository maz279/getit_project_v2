
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { OrderAnalytics } from './types';

interface OrderAnalyticsTabProps {
  data: OrderAnalytics;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const OrderAnalyticsTab: React.FC<OrderAnalyticsTabProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order Analytics & Performance</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {data.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Orders']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 space-y-2">
                {data.ordersByStatus.map((status, index) => (
                  <div key={status.status} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{status.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{status.count.toLocaleString()}</span>
                      <Badge variant={status.trend === 'up' ? 'default' : status.trend === 'down' ? 'destructive' : 'secondary'}>
                        {status.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                         status.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : 
                         <Target className="h-3 w-3" />}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⏰ Orders by Hour of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.ordersByTimeOfDay.filter(item => item.hour % 2 === 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'orders' ? value.toLocaleString() : `৳${value.toLocaleString()}`,
                    name === 'orders' ? 'Orders' : 'Revenue'
                  ]} 
                />
                <Bar dataKey="orders" fill="#3b82f6" />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Fulfillment Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-bold text-blue-600">{data.fulfillmentMetrics.averageProcessingTime} days</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Avg Shipping Time</p>
              <p className="text-2xl font-bold text-green-600">{data.fulfillmentMetrics.averageShippingTime} days</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">On-Time Delivery Rate</p>
              <p className="text-2xl font-bold text-purple-600">{data.fulfillmentMetrics.onTimeDeliveryRate}%</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Cancellation Rate</p>
              <p className="text-2xl font-bold text-red-600">{data.fulfillmentMetrics.cancellationRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
