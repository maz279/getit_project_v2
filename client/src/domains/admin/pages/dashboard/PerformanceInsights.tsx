/**
 * Performance Insights Dashboard - Platform performance insights and recommendations
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  TrendingUp, TrendingDown, Target, Award, AlertTriangle, Brain,
  DollarSign, Users, ShoppingCart, Package, Timer, BarChart3,
  CheckCircle, XCircle, Clock, Percent, Star, Zap, Lightbulb,
  Info, ThumbsUp, ThumbsDown, ArrowRight, Calendar
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Area, Scatter, ScatterChart
} from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

// AI-Generated Insights Data
const aiInsights = [
  {
    category: 'Revenue Optimization',
    priority: 'high',
    impact: 'BDT 2.5L/month',
    insight: 'Peak shopping hours (7-10 PM) show 45% cart abandonment',
    recommendation: 'Implement time-limited checkout incentives during peak hours',
    confidence: 89
  },
  {
    category: 'Vendor Performance',
    priority: 'medium',
    impact: 'BDT 1.8L/month',
    insight: '23% of vendors have delivery delays in Rangpur division',
    recommendation: 'Partner with local courier services in Rangpur for faster delivery',
    confidence: 92
  },
  {
    category: 'Customer Retention',
    priority: 'high',
    impact: 'BDT 3.2L/month',
    insight: 'First-time buyers have 68% lower repeat purchase rate',
    recommendation: 'Launch targeted welcome campaigns with personalized offers',
    confidence: 87
  },
  {
    category: 'Inventory Management',
    priority: 'medium',
    impact: 'BDT 1.5L/month',
    insight: 'Electronics category has 35% overstock during monsoon',
    recommendation: 'Adjust inventory planning based on seasonal patterns',
    confidence: 85
  }
];

// Performance Anomalies
const performanceAnomalies = [
  { date: '2024-06-28', metric: 'Conversion Rate', expected: 15.2, actual: 8.7, severity: 'high' },
  { date: '2024-06-27', metric: 'Page Load Time', expected: 2.1, actual: 4.8, severity: 'medium' },
  { date: '2024-06-26', metric: 'Payment Success', expected: 98.5, actual: 94.2, severity: 'medium' },
  { date: '2024-06-25', metric: 'Order Fulfillment', expected: 96.0, actual: 89.5, severity: 'high' },
];

// Predictive Analytics Data
const predictiveData = [
  { month: 'Jul', predicted: 1450000, confidence: 85, lower: 1320000, upper: 1580000 },
  { month: 'Aug', predicted: 1680000, confidence: 82, lower: 1520000, upper: 1840000 },
  { month: 'Sep', predicted: 1920000, confidence: 78, lower: 1720000, upper: 2120000 },
  { month: 'Oct', predicted: 2250000, confidence: 75, lower: 2000000, upper: 2500000 },
  { month: 'Nov', predicted: 2800000, confidence: 72, lower: 2450000, upper: 3150000 },
  { month: 'Dec', predicted: 3200000, confidence: 70, lower: 2800000, upper: 3600000 },
];

// Competitive Analysis
const competitiveData = [
  { metric: 'Pricing', ours: 85, competitor1: 78, competitor2: 82, industry: 80 },
  { metric: 'Delivery Speed', ours: 88, competitor1: 92, competitor2: 85, industry: 87 },
  { metric: 'Product Range', ours: 92, competitor1: 88, competitor2: 95, industry: 90 },
  { metric: 'Customer Service', ours: 86, competitor1: 84, competitor2: 88, industry: 85 },
  { metric: 'Mobile Experience', ours: 94, competitor1: 90, competitor2: 92, industry: 91 },
];

// User Behavior Patterns
const behaviorPatterns = [
  { pattern: 'Browse → Cart → Purchase', percentage: 35, trend: 'stable' },
  { pattern: 'Search → Product → Purchase', percentage: 28, trend: 'up' },
  { pattern: 'Browse → Cart → Abandon', percentage: 22, trend: 'down' },
  { pattern: 'Direct Product → Purchase', percentage: 15, trend: 'up' },
];

const PerformanceInsights = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');

  return (
    <AdminLayout
      currentPage="Performance Insights"
      breadcrumbItems={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Performance Insights' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Performance Insights
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              AI-powered insights and recommendations for business growth
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
            <Button>
              <Brain className="w-4 h-4 mr-2" />
              Generate New Insights
            </Button>
          </div>
        </div>

        {/* AI Insights Summary */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              AI-Powered Business Insights
            </CardTitle>
            <CardDescription>
              Machine learning analysis of platform performance with actionable recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{insight.category}</h4>
                        <Badge 
                          variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Potential Impact: <span className="font-semibold text-green-600">{insight.impact}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Confidence</div>
                      <div className="text-xl font-bold">{insight.confidence}%</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p className="text-sm">{insight.insight}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm font-medium text-blue-600">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Anomalies Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Performance Anomalies Detection
            </CardTitle>
            <CardDescription>Real-time detection of unusual patterns and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceAnomalies.map((anomaly, index) => (
                <Alert 
                  key={index}
                  className={anomaly.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}
                >
                  <AlertTriangle className={`h-4 w-4 ${anomaly.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                  <AlertTitle className="text-sm font-medium">
                    {anomaly.metric} Anomaly - {anomaly.date}
                  </AlertTitle>
                  <AlertDescription>
                    Expected: {anomaly.expected} | Actual: {anomaly.actual} 
                    <span className="ml-2 font-medium">
                      ({Math.round(((anomaly.actual - anomaly.expected) / anomaly.expected) * 100)}% deviation)
                    </span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Predictive Analytics and Competitive Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Predictive Revenue Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast (6 Months)</CardTitle>
              <CardDescription>ML-based prediction with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={predictiveData}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `BDT ${value.toLocaleString()}`} />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    fill="url(#colorConfidence)" 
                    stroke="transparent"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower" 
                    fill="white" 
                    stroke="transparent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Competitive Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
              <CardDescription>Performance comparison with market leaders</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={competitiveData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="GetIt" dataKey="ours" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Radar name="Competitor 1" dataKey="competitor1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Radar name="Industry Avg" dataKey="industry" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Behavior Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>User Behavior Patterns</CardTitle>
            <CardDescription>Common user journeys and conversion paths</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {behaviorPatterns.map((pattern, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">{pattern.pattern}</h4>
                    {pattern.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : pattern.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <span className="text-gray-400">→</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Progress value={pattern.percentage} className="h-2" />
                    <p className="text-xs text-gray-500">{pattern.percentage}% of users</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actionable Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Actionable Recommendations</CardTitle>
            <CardDescription>Priority actions based on insights analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="immediate" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="immediate">Immediate (1-7 days)</TabsTrigger>
                <TabsTrigger value="shortterm">Short-term (1-4 weeks)</TabsTrigger>
                <TabsTrigger value="longterm">Long-term (1-3 months)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="immediate" className="space-y-3 mt-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <Zap className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Fix Payment Gateway Timeout Issues</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      4.3% payment failures detected during peak hours. Optimize gateway connections.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Launch Flash Sale Recovery Campaign</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Target 22% abandoned cart users with personalized discount codes.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="shortterm" className="space-y-3 mt-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Expand Courier Network in Rangpur</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Partner with 3 additional local couriers to reduce delivery time by 40%.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Implement Loyalty Program</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Design tiered rewards system to improve retention by estimated 25%.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="longterm" className="space-y-3 mt-4">
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Deploy Advanced ML Recommendation Engine</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Implement collaborative filtering to increase AOV by projected 35%.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <Target className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Launch B2B Marketplace</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Target wholesale buyers with bulk ordering features and credit terms.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Performance Score Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Score Summary</CardTitle>
            <CardDescription>Overall platform health and growth indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">Growth Score</h4>
                <p className="text-3xl font-bold text-green-600">92/100</p>
                <p className="text-xs text-gray-600 mt-1">+8 from last month</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold">Quality Score</h4>
                <p className="text-3xl font-bold text-blue-600">88/100</p>
                <p className="text-xs text-gray-600 mt-1">+3 from last month</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">Efficiency Score</h4>
                <p className="text-3xl font-bold text-purple-600">85/100</p>
                <p className="text-xs text-gray-600 mt-1">+5 from last month</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold">Overall Score</h4>
                <p className="text-3xl font-bold text-orange-600">88/100</p>
                <p className="text-xs text-gray-600 mt-1">Industry Leader</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PerformanceInsights;