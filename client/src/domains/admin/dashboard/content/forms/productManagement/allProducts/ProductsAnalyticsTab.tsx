
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { ProductAnalytics, SalesTrend } from './types';

interface ProductsAnalyticsTabProps {
  analytics: ProductAnalytics;
  salesData: SalesTrend[];
}

export const ProductsAnalyticsTab: React.FC<ProductsAnalyticsTabProps> = ({
  analytics,
  salesData
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Sales Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sales Trends Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(Number(value)) : value,
                name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Units'
              ]} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="revenue" />
              <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="orders" />
              <Line type="monotone" dataKey="units" stroke="#f59e0b" strokeWidth={2} name="units" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.customerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segment, percent }) => `${segment} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {analytics.customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Vendor Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.vendorPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendorName" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.categoryPerformance.map((category, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="font-semibold text-lg">{category.category}</h4>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-gray-600">Products: {category.products}</div>
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(category.revenue)}</div>
                  <div className="text-sm text-gray-600">Orders: {category.orders}</div>
                  <div className="text-sm">
                    Rating: <span className="font-semibold">{category.avgRating}/5.0</span>
                  </div>
                  <div className={`text-sm font-semibold ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Growth: {category.growth >= 0 ? '+' : ''}{category.growth}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seasonal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Patterns & Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.seasonalPatterns.map((pattern, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{pattern.period}</h4>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{formatCurrency(pattern.revenue)}</div>
                    <div className="text-sm text-gray-600">Demand: {pattern.demand}%</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Top Products:</p>
                  <div className="flex flex-wrap gap-2">
                    {pattern.topProducts.map((product, productIndex) => (
                      <span key={productIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
