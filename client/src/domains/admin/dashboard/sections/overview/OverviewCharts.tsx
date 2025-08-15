
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const OverviewCharts: React.FC = () => {
  const salesData = [
    { name: 'Jan', sales: 4000, orders: 240, users: 400 },
    { name: 'Feb', sales: 3000, orders: 139, users: 300 },
    { name: 'Mar', sales: 2000, orders: 980, users: 200 },
    { name: 'Apr', sales: 2780, orders: 390, users: 278 },
    { name: 'May', sales: 1890, orders: 480, users: 189 },
    { name: 'Jun', sales: 2390, orders: 380, users: 239 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400, color: '#0088FE' },
    { name: 'Fashion', value: 300, color: '#00C49F' },
    { name: 'Home & Garden', value: 300, color: '#FFBB28' },
    { name: 'Books', value: 200, color: '#FF8042' },
    { name: 'Sports', value: 150, color: '#8884D8' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Sales Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
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
  );
};
