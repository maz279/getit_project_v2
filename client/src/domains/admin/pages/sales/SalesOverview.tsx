import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users,
  Calendar, Download, RefreshCw, BarChart3, PieChart, Activity
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesOverview() {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedView, setSelectedView] = useState('revenue');

  // Mock data - replace with API call
  const salesData = [
    { date: 'Jan 1', revenue: 125000, orders: 145, avgOrderValue: 862 },
    { date: 'Jan 2', revenue: 132000, orders: 158, avgOrderValue: 835 },
    { date: 'Jan 3', revenue: 118000, orders: 142, avgOrderValue: 831 },
    { date: 'Jan 4', revenue: 145000, orders: 168, avgOrderValue: 863 },
    { date: 'Jan 5', revenue: 156000, orders: 185, avgOrderValue: 843 },
    { date: 'Jan 6', revenue: 172000, orders: 198, avgOrderValue: 869 },
    { date: 'Jan 7', revenue: 189000, orders: 215, avgOrderValue: 879 }
  ];

  const categoryBreakdown = [
    { name: 'Electronics', value: 35, revenue: 450000, color: '#3B82F6' },
    { name: 'Fashion', value: 28, revenue: 360000, color: '#10B981' },
    { name: 'Home & Living', value: 18, revenue: 231000, color: '#F59E0B' },
    { name: 'Health & Beauty', value: 12, revenue: 154000, color: '#EF4444' },
    { name: 'Others', value: 7, revenue: 90000, color: '#8B5CF6' }
  ];

  const topProducts = [
    { id: '1', name: 'Samsung Galaxy S24', category: 'Electronics', sales: 245, revenue: 195510, trend: 'up' },
    { id: '2', name: 'Cotton Saree Collection', category: 'Fashion', sales: 189, revenue: 113400, trend: 'up' },
    { id: '3', name: 'Rice Cooker Premium', category: 'Home & Living', sales: 156, revenue: 93600, trend: 'down' },
    { id: '4', name: 'Organic Face Cream', category: 'Health & Beauty', sales: 142, revenue: 71000, trend: 'up' },
    { id: '5', name: 'Laptop Backpack', category: 'Accessories', sales: 128, revenue: 51200, trend: 'stable' }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              Sales Overview
            </h1>
            <p className="text-gray-600 mt-2">Monitor your sales performance and revenue trends</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳11,37,000</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">18.2%</span>
                </div>
                <span className="text-sm text-gray-500">vs last week</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,311</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">12.5%</span>
                </div>
                <span className="text-sm text-gray-500">vs last week</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳867</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">5.3%</span>
                </div>
                <span className="text-sm text-gray-500">vs last week</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.8%</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-red-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">0.5%</span>
                </div>
                <span className="text-sm text-gray-500">vs last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
            <TabsTrigger value="category">Category Breakdown</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
          </TabsList>

          {/* Revenue Trend */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue performance for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => `৳${value.toLocaleString()}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Breakdown */}
          <TabsContent value="category">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Revenue distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, value}) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Revenue breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryBreakdown.map((category) => (
                      <div key={category.name}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-gray-600">৳{(category.revenue / 1000).toFixed(0)}k</span>
                        </div>
                        <Progress value={category.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Products */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-center">{product.sales}</TableCell>
                        <TableCell className="text-right">৳{product.revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          {getTrendIcon(product.trend)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Peak Sales Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8:00 PM</div>
              <p className="text-sm text-gray-500 mt-1">Most orders placed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Best Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Saturday</div>
              <p className="text-sm text-gray-500 mt-1">Highest revenue day</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cart Abandonment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28.5%</div>
              <p className="text-sm text-gray-500 mt-1">Last 7 days average</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}