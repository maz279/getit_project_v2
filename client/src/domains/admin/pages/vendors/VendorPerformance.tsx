/**
 * Vendor Performance - Comprehensive vendor analytics and performance tracking
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  TrendingUp, TrendingDown, Star, Package, Clock, AlertCircle,
  ShoppingCart, DollarSign, Users, BarChart3, Target, Award,
  CheckCircle, XCircle, Timer, MessageSquare, Truck, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/shared/ui/table';

// Performance metrics data
const performanceOverview = {
  overallScore: 87,
  previousScore: 82,
  rank: 15,
  totalRanked: 342,
  performanceGrade: 'A',
  badges: ['Top Seller', 'Fast Shipper', 'Customer Favorite']
};

// Monthly sales trend
const salesTrendData = [
  { month: 'Jan', sales: 450000, orders: 120, returns: 5 },
  { month: 'Feb', sales: 520000, orders: 135, returns: 6 },
  { month: 'Mar', sales: 480000, orders: 125, returns: 4 },
  { month: 'Apr', sales: 620000, orders: 160, returns: 8 },
  { month: 'May', sales: 750000, orders: 195, returns: 7 },
  { month: 'Jun', sales: 820000, orders: 210, returns: 9 },
];

// Performance metrics breakdown
const metricsData = [
  { metric: 'Order Fulfillment Rate', value: 96, target: 95, status: 'excellent' },
  { metric: 'On-Time Delivery', value: 92, target: 90, status: 'good' },
  { metric: 'Customer Rating', value: 4.5, target: 4.0, status: 'excellent' },
  { metric: 'Response Time', value: 2.5, target: 4.0, status: 'excellent' },
  { metric: 'Product Quality', value: 94, target: 90, status: 'excellent' },
  { metric: 'Return Rate', value: 3.2, target: 5.0, status: 'good' },
];

// Category performance
const categoryPerformance = [
  { category: 'Electronics', sales: 320000, percentage: 39, trend: 'up' },
  { category: 'Fashion', sales: 250000, percentage: 30, trend: 'up' },
  { category: 'Home & Living', sales: 150000, percentage: 18, trend: 'stable' },
  { category: 'Others', sales: 100000, percentage: 13, trend: 'down' },
];

// Top performing products
const topProducts = [
  { name: 'Samsung Galaxy A54', sold: 125, revenue: 3750000, rating: 4.8 },
  { name: 'Wireless Earbuds Pro', sold: 342, revenue: 1026000, rating: 4.6 },
  { name: 'Smart Watch Series 5', sold: 89, revenue: 890000, rating: 4.7 },
  { name: 'Laptop Cooling Pad', sold: 215, revenue: 430000, rating: 4.5 },
  { name: 'USB-C Hub 7-in-1', sold: 178, revenue: 356000, rating: 4.4 },
];

// Customer feedback summary
const feedbackSummary = {
  positive: 85,
  neutral: 10,
  negative: 5,
  totalReviews: 1250,
  avgRating: 4.5
};

// Vendor comparison data
const vendorComparison = [
  { metric: 'Sales Volume', vendor: 85, average: 72 },
  { metric: 'Customer Satisfaction', vendor: 92, average: 85 },
  { metric: 'Delivery Speed', vendor: 88, average: 82 },
  { metric: 'Product Range', vendor: 76, average: 80 },
  { metric: 'Response Rate', vendor: 95, average: 78 },
];

const VendorPerformance = () => {
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('sales');

  return (
    <AdminLayout
      currentPage="Vendor Performance"
      breadcrumbItems={[
        { label: 'Vendors', href: '/admin/vendors' },
        { label: 'Vendor Performance' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Vendor Performance Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and analyze vendor performance metrics
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="V001">Dhaka Electronics Hub</SelectItem>
                <SelectItem value="V002">Fashion Paradise BD</SelectItem>
                <SelectItem value="V003">Fresh Foods Market</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              Export Report
            </Button>
          </div>
        </div>

        {/* Performance Score Overview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600">{performanceOverview.overallScore}</div>
                <p className="text-sm text-gray-600 mt-1">Overall Score</p>
                <div className="flex items-center justify-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+5 from last month</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold">{performanceOverview.performanceGrade}</div>
                <p className="text-sm text-gray-600 mt-1">Performance Grade</p>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold">#{performanceOverview.rank}</div>
                <p className="text-sm text-gray-600 mt-1">Platform Rank</p>
                <p className="text-xs text-gray-500 mt-1">out of {performanceOverview.totalRanked} vendors</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Achievements</p>
                <div className="space-y-1">
                  {performanceOverview.badges.map((badge, index) => (
                    <Badge key={index} className="mr-1" variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BDT 45,67,890</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+23.5% vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <div className="flex items-center mt-1">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-gray-600 ml-1">210 this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5 hrs</div>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 ml-1">Excellent</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Customer Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.5/5.0</div>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-gray-600 ml-1">1,250 reviews</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tabs */}
        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="products">Product Performance</TabsTrigger>
            <TabsTrigger value="customer">Customer Insights</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* Key Metrics Tab */}
          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics Breakdown</CardTitle>
                <CardDescription>Detailed view of all performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricsData.map((metric) => (
                    <div key={metric.metric} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{metric.metric}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            (Target: {metric.target}{metric.metric.includes('Rate') || metric.metric.includes('Time') ? '' : '%'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {metric.value}{metric.metric.includes('Rating') ? '/5' : metric.metric.includes('Time') ? ' hrs' : '%'}
                          </span>
                          {metric.status === 'excellent' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : metric.status === 'good' ? (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={metric.metric.includes('Return') ? 100 - (metric.value / metric.target * 100) : (metric.value / metric.target * 100)} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>

                <Alert className="mt-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    This vendor is performing above platform average in 5 out of 6 key metrics.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Analysis Tab */}
          <TabsContent value="sales">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend Analysis</CardTitle>
                  <CardDescription>Monthly sales performance and order volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="sales"
                        fill="#3B82F6"
                        stroke="#3B82F6"
                        fillOpacity={0.3}
                        name="Sales (BDT)"
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="orders" 
                        fill="#10B981" 
                        name="Orders"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="returns" 
                        stroke="#EF4444" 
                        name="Returns"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Sales distribution by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={categoryPerformance}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percentage }) => `${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                          >
                            {categoryPerformance.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {categoryPerformance.map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index] }}
                            />
                            <span className="font-medium">{category.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>BDT {category.sales.toLocaleString()}</span>
                            {category.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : category.trend === 'down' ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : (
                              <span className="text-gray-400">→</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Product Performance Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Best selling products by revenue and customer rating</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-center">Units Sold</TableHead>
                      <TableHead className="text-center">Revenue</TableHead>
                      <TableHead className="text-center">Customer Rating</TableHead>
                      <TableHead className="text-center">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-center">{product.sold}</TableCell>
                        <TableCell className="text-center">BDT {product.revenue.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{product.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Top Seller
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Insights Tab */}
          <TabsContent value="customer">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Feedback Summary</CardTitle>
                  <CardDescription>Overall customer satisfaction metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{feedbackSummary.avgRating}/5.0</div>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-6 w-6 ${i < Math.floor(feedbackSummary.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Based on {feedbackSummary.totalReviews} reviews</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Positive</span>
                          <span>{feedbackSummary.positive}%</span>
                        </div>
                        <Progress value={feedbackSummary.positive} className="h-2 bg-gray-200">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${feedbackSummary.positive}%` }} />
                        </Progress>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Neutral</span>
                          <span>{feedbackSummary.neutral}%</span>
                        </div>
                        <Progress value={feedbackSummary.neutral} className="h-2 bg-gray-200">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${feedbackSummary.neutral}%` }} />
                        </Progress>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Negative</span>
                          <span>{feedbackSummary.negative}%</span>
                        </div>
                        <Progress value={feedbackSummary.negative} className="h-2 bg-gray-200">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${feedbackSummary.negative}%` }} />
                        </Progress>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Feedback Themes</CardTitle>
                  <CardDescription>Most mentioned topics in reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { theme: 'Product Quality', mentions: 450, sentiment: 'positive' },
                      { theme: 'Fast Delivery', mentions: 380, sentiment: 'positive' },
                      { theme: 'Good Packaging', mentions: 290, sentiment: 'positive' },
                      { theme: 'Responsive Support', mentions: 210, sentiment: 'positive' },
                      { theme: 'Pricing', mentions: 150, sentiment: 'neutral' },
                      { theme: 'Return Process', mentions: 45, sentiment: 'negative' }
                    ].map((theme) => (
                      <div key={theme.theme} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{theme.theme}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{theme.mentions} mentions</span>
                          <Badge 
                            variant="outline" 
                            className={
                              theme.sentiment === 'positive' ? 'text-green-600 border-green-600' :
                              theme.sentiment === 'negative' ? 'text-red-600 border-red-600' :
                              'text-yellow-600 border-yellow-600'
                            }
                          >
                            {theme.sentiment}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Vendor vs Platform Average</CardTitle>
                <CardDescription>Performance comparison with platform benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={vendorComparison}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="This Vendor" dataKey="vendor" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Radar name="Platform Average" dataKey="average" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                
                <Alert className="mt-6">
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    This vendor is performing above platform average in 4 out of 5 key areas.
                    Consider improving product range to match platform standards.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Improvement Recommendations</CardTitle>
            <CardDescription>AI-generated suggestions based on performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Expand Product Range</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Consider adding more products in Home & Living category which shows growing demand.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Optimize Delivery Times</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Partner with additional couriers to improve delivery speed in Sylhet region.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Enhance Customer Communication</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Implement automated order updates to keep customers informed.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Streamline Return Process</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Simplify return procedures to improve customer satisfaction scores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VendorPerformance;