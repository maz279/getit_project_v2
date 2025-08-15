import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  TrendingUp, Calendar, Target, AlertTriangle, Zap, Brain,
  Download, RefreshCw, Activity, BarChart3, LineChart, Info
} from 'lucide-react';
import { LineChart as ReLineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesForecast() {
  const [forecastPeriod, setForecastPeriod] = useState('30days');
  const [confidenceLevel, setConfidenceLevel] = useState('medium');

  // Mock data - replace with API call
  const forecastData = [
    { date: 'Jul 1', actual: 189000, forecast: null, upper: null, lower: null },
    { date: 'Jul 8', actual: null, forecast: 195000, upper: 210000, lower: 180000 },
    { date: 'Jul 15', actual: null, forecast: 205000, upper: 225000, lower: 185000 },
    { date: 'Jul 22', actual: null, forecast: 198000, upper: 218000, lower: 178000 },
    { date: 'Jul 29', actual: null, forecast: 215000, upper: 240000, lower: 190000 },
    { date: 'Aug 5', actual: null, forecast: 225000, upper: 255000, lower: 195000 },
    { date: 'Aug 12', actual: null, forecast: 232000, upper: 265000, lower: 199000 }
  ];

  const seasonalFactors = [
    { factor: 'Eid Festival', impact: '+45%', date: 'April 2025', confidence: 92 },
    { factor: 'Monsoon Season', impact: '-12%', date: 'June-Aug 2025', confidence: 85 },
    { factor: 'Pohela Boishakh', impact: '+28%', date: 'April 14, 2025', confidence: 88 },
    { factor: 'Winter Season', impact: '+15%', date: 'Dec-Jan', confidence: 79 }
  ];

  const productForecast = [
    { category: 'Electronics', currentRevenue: 450000, forecast: 525000, growth: 16.7, confidence: 84 },
    { category: 'Fashion', currentRevenue: 360000, forecast: 385000, growth: 6.9, confidence: 78 },
    { category: 'Home & Living', currentRevenue: 231000, forecast: 268000, growth: 16.0, confidence: 81 },
    { category: 'Health & Beauty', currentRevenue: 154000, forecast: 175000, growth: 13.6, confidence: 76 },
    { category: 'Groceries', currentRevenue: 125000, forecast: 145000, growth: 16.0, confidence: 88 }
  ];

  const keyMetrics = {
    revenue: { current: 1180000, forecast: 1420000, growth: 20.3, confidence: 82 },
    orders: { current: 1311, forecast: 1560, growth: 19.0, confidence: 79 },
    avgOrderValue: { current: 900, forecast: 910, growth: 1.1, confidence: 85 },
    newCustomers: { current: 486, forecast: 580, growth: 19.3, confidence: 74 }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <LineChart className="h-8 w-8 text-orange-600" />
              Sales Forecast
            </h1>
            <p className="text-gray-600 mt-2">AI-powered predictive analytics and sales forecasting</p>
          </div>
          <div className="flex gap-3">
            <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Forecast Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Next 7 days</SelectItem>
                <SelectItem value="30days">Next 30 days</SelectItem>
                <SelectItem value="90days">Next 90 days</SelectItem>
                <SelectItem value="6months">Next 6 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalculate
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Download className="h-4 w-4 mr-2" />
              Export Forecast
            </Button>
          </div>
        </div>

        {/* AI Alert */}
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <strong>AI-Powered Forecast:</strong> Based on historical data, seasonal trends, and market analysis. 
            Confidence level: <Badge variant="outline" className="ml-2">82% Average</Badge>
          </AlertDescription>
        </Alert>

        {/* Forecast Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Forecasted Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳14.2L</div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">{keyMetrics.revenue.growth}%</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {keyMetrics.revenue.confidence}% confidence
                </Badge>
              </div>
              <Progress value={keyMetrics.revenue.confidence} className="h-1 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Forecasted Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.orders.forecast}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">{keyMetrics.orders.growth}%</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {keyMetrics.orders.confidence}% confidence
                </Badge>
              </div>
              <Progress value={keyMetrics.orders.confidence} className="h-1 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{keyMetrics.avgOrderValue.forecast}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">{keyMetrics.avgOrderValue.growth}%</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {keyMetrics.avgOrderValue.confidence}% confidence
                </Badge>
              </div>
              <Progress value={keyMetrics.avgOrderValue.confidence} className="h-1 mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">New Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.newCustomers.forecast}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">{keyMetrics.newCustomers.growth}%</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {keyMetrics.newCustomers.confidence}% confidence
                </Badge>
              </div>
              <Progress value={keyMetrics.newCustomers.confidence} className="h-1 mt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Forecast Tabs */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue Forecast</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Impact</TabsTrigger>
            <TabsTrigger value="category">Category Forecast</TabsTrigger>
            <TabsTrigger value="scenarios">What-If Scenarios</TabsTrigger>
          </TabsList>

          {/* Revenue Forecast */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast with Confidence Bands</CardTitle>
                <CardDescription>AI-predicted revenue with upper and lower bounds</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `৳${(value / 1000).toFixed(0)}k`} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="#FEF3C7"
                      fill="#FEF3C7"
                      strokeWidth={0}
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="#FEF3C7"
                      fill="#FFFFFF"
                      strokeWidth={0}
                      name="Lower Bound"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6' }}
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#F59E0B' }}
                      name="Forecast"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seasonal Impact */}
          <TabsContent value="seasonal">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Factors & Events</CardTitle>
                <CardDescription>Major events impacting sales forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seasonalFactors.map((factor) => (
                    <div key={factor.factor} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-orange-600" />
                          <div>
                            <h4 className="font-medium">{factor.factor}</h4>
                            <p className="text-sm text-gray-500">{factor.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${factor.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {factor.impact}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {factor.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Forecast */}
          <TabsContent value="category">
            <Card>
              <CardHeader>
                <CardTitle>Category-wise Sales Forecast</CardTitle>
                <CardDescription>Predicted performance by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productForecast.map((category) => (
                    <div key={category.category}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-medium">{category.category}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {category.confidence}% confidence
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            ৳{(category.currentRevenue / 1000).toFixed(0)}k → ৳{(category.forecast / 1000).toFixed(0)}k
                          </div>
                          <div className={`text-sm font-medium ${category.growth > 10 ? 'text-green-600' : 'text-blue-600'}`}>
                            +{category.growth}%
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={(category.forecast / category.currentRevenue) * 50} className="h-3" />
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                          {category.growth > 15 && <Zap className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* What-If Scenarios */}
          <TabsContent value="scenarios">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optimistic Scenario</CardTitle>
                  <CardDescription>If all positive factors align</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue</span>
                      <span className="font-medium text-green-600">৳16.5L (+39.8%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Orders</span>
                      <span className="font-medium text-green-600">1,850 (+41.1%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">New Customers</span>
                      <span className="font-medium text-green-600">720 (+48.1%)</span>
                    </div>
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Assumes successful Eid campaign and new product launches
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conservative Scenario</CardTitle>
                  <CardDescription>Accounting for potential challenges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue</span>
                      <span className="font-medium text-orange-600">৳12.8L (+8.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Orders</span>
                      <span className="font-medium text-orange-600">1,380 (+5.3%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">New Customers</span>
                      <span className="font-medium text-orange-600">510 (+4.9%)</span>
                    </div>
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Considers supply chain delays and increased competition
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}