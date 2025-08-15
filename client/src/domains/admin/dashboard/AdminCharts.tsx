
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const AdminCharts: React.FC = () => {
  const revenueData = [
    { month: 'Jan', revenue: 65000, orders: 1200 },
    { month: 'Feb', revenue: 75000, orders: 1400 },
    { month: 'Mar', revenue: 85000, orders: 1600 },
    { month: 'Apr', revenue: 95000, orders: 1800 },
    { month: 'May', revenue: 105000, orders: 2000 },
    { month: 'Jun', revenue: 115000, orders: 2200 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#3B82F6' },
    { name: 'Fashion', value: 25, color: '#EF4444' },
    { name: 'Home & Garden', value: 20, color: '#10B981' },
    { name: 'Books', value: 12, color: '#F59E0B' },
    { name: 'Others', value: 8, color: '#8B5CF6' }
  ];

  const vendorPerformance = [
    { name: 'TechZone BD', sales: 45000, rating: 4.8 },
    { name: 'Fashion Hub', sales: 38000, rating: 4.6 },
    { name: 'Home Essentials', sales: 32000, rating: 4.7 },
    { name: 'Book Palace', sales: 28000, rating: 4.5 },
    { name: 'Smart Electronics', sales: 25000, rating: 4.4 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue & Orders Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vendorPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
