
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  // Mock data for demonstration
  const monthlyData = [
    { month: 'Jan', commissions: 45000, payouts: 40000 },
    { month: 'Feb', commissions: 52000, payouts: 48000 },
    { month: 'Mar', commissions: 48000, payouts: 45000 },
    { month: 'Apr', commissions: 61000, payouts: 58000 },
    { month: 'May', commissions: 55000, payouts: 52000 },
    { month: 'Jun', commissions: 67000, payouts: 63000 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#8884d8' },
    { name: 'Fashion', value: 25, color: '#82ca9d' },
    { name: 'Home & Garden', value: 20, color: '#ffc658' },
    { name: 'Sports', value: 12, color: '#ff7300' },
    { name: 'Books', value: 8, color: '#00ff00' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Commission', value: '৳3,45,000', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
          { title: 'Active Vendors', value: '1,247', change: '+8.2%', icon: Users, color: 'text-blue-600' },
          { title: 'Avg. Commission Rate', value: '8.5%', change: '+0.3%', icon: TrendingUp, color: 'text-purple-600' },
          { title: 'This Month', value: '৳67,000', change: '+15.7%', icon: Calendar, color: 'text-orange-600' }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.title}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className={`text-sm ${item.color}`}>{item.change}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${item.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Commission Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="commissions" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="payouts" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Commission vs Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="commissions" fill="#8884d8" />
                <Bar dataKey="payouts" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Commission by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
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
      </div>
    </div>
  );
};
