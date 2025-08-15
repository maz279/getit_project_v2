/**
 * KPI Monitoring Dashboard - Platform performance metrics and targets
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  TrendingUp, TrendingDown, Target, Award, AlertTriangle,
  DollarSign, Users, ShoppingCart, Package, Timer, BarChart3,
  CheckCircle, XCircle, Clock, Percent, Star, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Area
} from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

// Financial KPI Data
const financialKPIs = [
  { metric: 'Total Revenue', value: 'BDT 12,45,000', target: 'BDT 15,00,000', achievement: 83, trend: 'up' },
  { metric: 'Profit Margin', value: '18.5%', target: '20%', achievement: 92.5, trend: 'up' },
  { metric: 'Average Order Value', value: 'BDT 2,450', target: 'BDT 2,800', achievement: 87.5, trend: 'down' },
  { metric: 'Commission Revenue', value: 'BDT 1,85,000', target: 'BDT 2,00,000', achievement: 92.5, trend: 'up' },
];

// Operational KPI Data
const operationalKPIs = [
  { metric: 'Order Fulfillment Rate', value: '94.5%', target: '98%', achievement: 96.4, trend: 'up' },
  { metric: 'Average Delivery Time', value: '2.8 days', target: '2 days', achievement: 71.4, trend: 'down' },
  { metric: 'Return Rate', value: '3.2%', target: '< 5%', achievement: 100, trend: 'up' },
  { metric: 'Inventory Turnover', value: '8.5x', target: '10x', achievement: 85, trend: 'up' },
];

// Customer Satisfaction Data
const customerSatisfactionData = [
  { metric: 'Overall Rating', value: 4.3, max: 5 },
  { metric: 'Product Quality', value: 4.5, max: 5 },
  { metric: 'Delivery Service', value: 4.1, max: 5 },
  { metric: 'Customer Support', value: 4.2, max: 5 },
  { metric: 'Value for Money', value: 4.4, max: 5 },
];

// Vendor Performance Data
const vendorPerformanceData = [
  { metric: 'Response Time', value: 85, target: 90 },
  { metric: 'Order Accuracy', value: 96, target: 98 },
  { metric: 'Shipping Speed', value: 88, target: 95 },
  { metric: 'Product Quality', value: 92, target: 95 },
  { metric: 'Customer Service', value: 87, target: 90 },
  { metric: 'Compliance', value: 94, target: 100 },
];

// Monthly KPI Trend Data
const monthlyTrendData = [
  { month: 'Jan', revenue: 980000, orders: 1200, customers: 15000, satisfaction: 4.1 },
  { month: 'Feb', revenue: 1050000, orders: 1350, customers: 16200, satisfaction: 4.2 },
  { month: 'Mar', revenue: 1120000, orders: 1480, customers: 17500, satisfaction: 4.2 },
  { month: 'Apr', revenue: 1200000, orders: 1600, customers: 18900, satisfaction: 4.3 },
  { month: 'May', revenue: 1180000, orders: 1550, customers: 19800, satisfaction: 4.3 },
  { month: 'Jun', revenue: 1245000, orders: 1680, customers: 21000, satisfaction: 4.3 },
];

// Department-wise Performance
const departmentPerformance = [
  { department: 'Sales', score: 92, color: '#3B82F6' },
  { department: 'Marketing', score: 87, color: '#10B981' },
  { department: 'Operations', score: 94, color: '#F59E0B' },
  { department: 'Customer Service', score: 85, color: '#8B5CF6' },
  { department: 'Technology', score: 96, color: '#EF4444' },
];

const KPIMonitoring = () => {
  return (
    <AdminLayout
      currentPage="KPI Monitoring"
      breadcrumbItems={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'KPI Monitoring' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              KPI Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track platform performance against business objectives
            </p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="monthly">
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Set Targets
            </Button>
            <Button>
              Export KPIs
            </Button>
          </div>
        </div>

        {/* Overall Performance Score */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="text-2xl">Overall Performance Score</CardTitle>
            <CardDescription>Composite score across all KPI categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600">88.5%</div>
                  <p className="text-sm text-gray-600 mt-2">Current Score</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">12 KPIs On Target</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm">5 KPIs Need Attention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm">2 KPIs Below Target</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3.2% from last month
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Financial KPIs
            </CardTitle>
            <CardDescription>Revenue, profit margins, and commission metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financialKPIs.map((kpi) => (
                <div key={kpi.metric} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{kpi.metric}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-2xl font-bold">{kpi.value}</span>
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Target</p>
                      <p className="font-medium">{kpi.target}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Achievement</span>
                      <span className="font-medium">{kpi.achievement}%</span>
                    </div>
                    <Progress 
                      value={kpi.achievement} 
                      className={`h-2 ${kpi.achievement >= 90 ? 'bg-green-100' : kpi.achievement >= 70 ? 'bg-yellow-100' : 'bg-red-100'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operational KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Operational KPIs
            </CardTitle>
            <CardDescription>Order fulfillment, delivery time, and inventory metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {operationalKPIs.map((kpi) => (
                <div key={kpi.metric} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{kpi.metric}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-2xl font-bold">{kpi.value}</span>
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Target</p>
                      <p className="font-medium">{kpi.target}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Achievement</span>
                      <span className="font-medium">{kpi.achievement}%</span>
                    </div>
                    <Progress 
                      value={kpi.achievement} 
                      className={`h-2 ${kpi.achievement >= 90 ? 'bg-green-100' : kpi.achievement >= 70 ? 'bg-yellow-100' : 'bg-red-100'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction and Vendor Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Satisfaction Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Customer Satisfaction Scores
              </CardTitle>
              <CardDescription>Average ratings across key areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSatisfactionData.map((item) => (
                  <div key={item.metric} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.value}</span>
                        <span className="text-sm text-gray-500">/ {item.max}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(item.value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                      <Progress value={(item.value / item.max) * 100} className="flex-1 h-2" />
                    </div>
                  </div>
                ))}
              </div>
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Overall satisfaction improved by 0.2 points from last month
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Vendor Performance Ratings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Vendor Performance Ratings
              </CardTitle>
              <CardDescription>Average performance across all vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={vendorPerformanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Current" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Radar name="Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly KPI Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly KPI Trends</CardTitle>
            <CardDescription>6-month performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  fill="#3B82F6" 
                  stroke="#3B82F6" 
                  fillOpacity={0.3}
                  name="Revenue (BDT)"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="orders" 
                  fill="#10B981" 
                  name="Orders"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Satisfaction"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Performance</CardTitle>
            <CardDescription>Performance scores by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {departmentPerformance.map((dept) => (
                <div key={dept.department} className="text-center">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={[
                          { value: dept.score },
                          { value: 100 - dept.score }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        <Cell fill={dept.color} />
                        <Cell fill="#E5E7EB" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <h4 className="font-medium mt-2">{dept.department}</h4>
                  <p className="text-2xl font-bold" style={{ color: dept.color }}>
                    {dept.score}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertTitle className="text-lg font-semibold">Action Required</AlertTitle>
          <AlertDescription className="mt-2">
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                <span>Average delivery time is 40% above target. Consider expanding courier partnerships in rural areas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                <span>Customer support satisfaction is below 90%. Implement additional training programs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600">•</span>
                <span>Inventory turnover is 15% below target. Review slow-moving SKUs and optimize stock levels.</span>
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
};

export default KPIMonitoring;