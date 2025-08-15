
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Package, Clock, DollarSign } from 'lucide-react';
import { ShippingZone } from './types';

interface ZoneAnalyticsTabProps {
  zones: ShippingZone[];
}

export const ZoneAnalyticsTab: React.FC<ZoneAnalyticsTabProps> = ({ zones }) => {
  // Mock analytics data
  const deliveryPerformanceData = zones.map(zone => ({
    name: zone.name,
    avgDeliveryTime: (zone.deliveryTimeMin + zone.deliveryTimeMax) / 2,
    cost: zone.baseCost,
    volume: Math.floor(Math.random() * 1000) + 100
  }));

  const zoneTypeData = [
    { name: 'Express', value: zones.filter(z => z.type === 'express').length, color: '#3B82F6' },
    { name: 'Standard', value: zones.filter(z => z.type === 'standard').length, color: '#10B981' },
    { name: 'International', value: zones.filter(z => z.type === 'international').length, color: '#8B5CF6' }
  ];

  const monthlyTrendData = [
    { month: 'Jan', deliveries: 2400, revenue: 24000 },
    { month: 'Feb', deliveries: 1398, revenue: 18000 },
    { month: 'Mar', deliveries: 9800, revenue: 45000 },
    { month: 'Apr', deliveries: 3908, revenue: 32000 },
    { month: 'May', deliveries: 4800, revenue: 38000 },
    { month: 'Jun', deliveries: 3800, revenue: 35000 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">2.8 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">15,243</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">৳8.5L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zone Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgDeliveryTime" fill="#3B82F6" name="Avg Delivery Time (days)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zone Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={zoneTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {zoneTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Delivery Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="deliveries" stroke="#3B82F6" strokeWidth={2} name="Deliveries" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue (৳)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left">Zone</th>
                  <th className="border border-gray-200 p-3 text-left">Deliveries</th>
                  <th className="border border-gray-200 p-3 text-left">Avg Cost</th>
                  <th className="border border-gray-200 p-3 text-left">On-Time %</th>
                  <th className="border border-gray-200 p-3 text-left">Customer Rating</th>
                  <th className="border border-gray-200 p-3 text-left">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {deliveryPerformanceData.map((zone, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 p-3 font-medium">{zone.name}</td>
                    <td className="border border-gray-200 p-3">{zone.volume.toLocaleString()}</td>
                    <td className="border border-gray-200 p-3">৳{zone.cost}</td>
                    <td className="border border-gray-200 p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        Math.random() > 0.3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {(Math.random() * 20 + 80).toFixed(1)}%
                      </span>
                    </td>
                    <td className="border border-gray-200 p-3">
                      ⭐ {(Math.random() * 2 + 3).toFixed(1)}
                    </td>
                    <td className="border border-gray-200 p-3">
                      ৳{(zone.volume * zone.cost).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
