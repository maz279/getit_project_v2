/**
 * Product Analytics Dashboard - Amazon.com/Shopee.sg Level
 * Advanced business intelligence with predictive analytics and competitive insights
 * Real-time data visualization and strategic recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle,
  Brain,
  Globe,
  Award,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AnalyticsOverview {
  revenue: {
    total: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  sales: {
    total: number;
    growth: number;
    conversionRate: number;
  };
  traffic: {
    totalViews: number;
    uniqueVisitors: number;
    bounceRate: number;
  };
  inventory: {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
  };
}

interface PredictiveInsight {
  type: 'demand_forecast' | 'price_optimization' | 'inventory_alert' | 'trend_prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  data: {
    current: number;
    predicted: number;
    timeframe: string;
  };
}

interface CompetitiveAlert {
  id: string;
  competitor: string;
  type: 'price_change' | 'new_product' | 'promotion' | 'market_move';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  actionRequired: boolean;
}

interface PerformanceMetric {
  category: string;
  name: string;
  current: number;
  target: number;
  trend: number;
  status: 'good' | 'warning' | 'critical';
}

export function ProductAnalyticsDashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [alerts, setAlerts] = useState<CompetitiveAlert[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, selectedCategory]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock API calls - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOverview: AnalyticsOverview = {
        revenue: {
          total: Math.floor(Math.random() * 2000000) + 1000000,
          growth: Math.round((Math.random() * 40 - 10) * 100) / 100,
          trend: Math.random() > 0.3 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
        },
        sales: {
          total: Math.floor(Math.random() * 50000) + 10000,
          growth: Math.round((Math.random() * 30 - 5) * 100) / 100,
          conversionRate: Math.round((Math.random() * 5 + 2) * 100) / 100
        },
        traffic: {
          totalViews: Math.floor(Math.random() * 5000000) + 1000000,
          uniqueVisitors: Math.floor(Math.random() * 1000000) + 500000,
          bounceRate: Math.round((Math.random() * 30 + 30) * 100) / 100
        },
        inventory: {
          totalProducts: Math.floor(Math.random() * 10000) + 5000,
          outOfStock: Math.floor(Math.random() * 200) + 50,
          lowStock: Math.floor(Math.random() * 500) + 100
        }
      };

      const mockInsights: PredictiveInsight[] = [
        {
          type: 'demand_forecast',
          title: 'High Demand Expected',
          description: 'Electronics category demand predicted to increase by 35% next month',
          confidence: 89,
          impact: 'high',
          recommendation: 'Increase inventory for top electronics products',
          data: {
            current: 2500,
            predicted: 3375,
            timeframe: '30 days'
          }
        },
        {
          type: 'price_optimization',
          title: 'Pricing Opportunity',
          description: 'Mobile phones category has pricing gaps vs competitors',
          confidence: 76,
          impact: 'medium',
          recommendation: 'Adjust pricing for 15 mobile phone products',
          data: {
            current: 45000,
            predicted: 52000,
            timeframe: '14 days'
          }
        },
        {
          type: 'inventory_alert',
          title: 'Stock Optimization',
          description: 'Seasonal items showing early demand signals',
          confidence: 82,
          impact: 'medium',
          recommendation: 'Prepare inventory for upcoming season',
          data: {
            current: 1200,
            predicted: 2100,
            timeframe: '45 days'
          }
        }
      ];

      const mockAlerts: CompetitiveAlert[] = [
        {
          id: '1',
          competitor: 'Daraz Bangladesh',
          type: 'price_change',
          message: 'Major price cuts on electronics category - average 15% reduction',
          severity: 'high',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          actionRequired: true
        },
        {
          id: '2',
          competitor: 'PriyoShop',
          type: 'promotion',
          message: 'New promotional campaign launched: "Winter Sale 2025"',
          severity: 'medium',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          actionRequired: false
        },
        {
          id: '3',
          competitor: 'Amazon Global',
          type: 'new_product',
          message: 'Launched new product line in home & garden category',
          severity: 'medium',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          actionRequired: false
        }
      ];

      const mockMetrics: PerformanceMetric[] = [
        {
          category: 'Sales',
          name: 'Conversion Rate',
          current: 3.2,
          target: 4.0,
          trend: 0.3,
          status: 'warning'
        },
        {
          category: 'Inventory',
          name: 'Stock Turnover',
          current: 8.5,
          target: 8.0,
          trend: 0.5,
          status: 'good'
        },
        {
          category: 'Customer',
          name: 'Retention Rate',
          current: 67,
          target: 70,
          trend: -2.1,
          status: 'warning'
        },
        {
          category: 'Revenue',
          name: 'Average Order Value',
          current: 2450,
          target: 2500,
          trend: 150,
          status: 'good'
        }
      ];

      setOverview(mockOverview);
      setInsights(mockInsights);
      setAlerts(mockAlerts);
      setMetrics(mockMetrics);

    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercentage = (num: number) => `${num > 0 ? '+' : ''}${num}%`;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertSeverityColor = (severity: CompetitiveAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getInsightIcon = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'demand_forecast':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'price_optimization':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'inventory_alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'trend_prediction':
        return <Brain className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading && !overview) {
    return (
      <Card className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-3" />
        <span>Loading analytics data...</span>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Analytics</h1>
          <p className="text-muted-foreground">
            Advanced insights, predictions, and competitive intelligence
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="home">Home & Garden</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.revenue.total)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(overview.revenue.trend)}
                <span className="ml-1">{formatPercentage(overview.revenue.growth)} from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.sales.total)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{formatPercentage(overview.sales.growth)} conversion rate: {overview.sales.conversionRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Traffic</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.traffic.totalViews)}</div>
              <div className="text-xs text-muted-foreground">
                {formatNumber(overview.traffic.uniqueVisitors)} unique • {overview.traffic.bounceRate}% bounce rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.inventory.totalProducts)}</div>
              <div className="text-xs text-muted-foreground">
                <span className="text-red-600">{overview.inventory.outOfStock} out of stock</span> • 
                <span className="text-orange-600 ml-1">{overview.inventory.lowStock} low stock</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Intelligence</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts & Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Machine learning predictions and recommendations based on your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights.map((insight, index) => (
                  <Card key={index} className="border-l-4 border-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getInsightIcon(insight.type)}
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                        </div>
                        <Badge variant={insight.impact === 'high' ? 'default' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span>Current</span>
                          <span className="font-medium">{formatNumber(insight.data.current)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Predicted</span>
                          <span className="font-medium text-green-600">{formatNumber(insight.data.predicted)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Timeframe</span>
                          <span className="font-medium">{insight.data.timeframe}</span>
                        </div>
                      </div>

                      <Alert className="mt-4">
                        <Zap className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Recommendation:</strong> {insight.recommendation}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Competitive Intelligence
              </CardTitle>
              <CardDescription>
                Real-time competitor monitoring and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`border ${getAlertSeverityColor(alert.severity)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{alert.competitor}</Badge>
                          <Badge variant="secondary">{alert.type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3">{alert.message}</p>
                      
                      {alert.actionRequired && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Target className="h-3 w-3 mr-1" />
                            Analyze Impact
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Reviewed
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Key performance indicators and targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.category}</p>
                          <p className="text-lg font-semibold">{metric.name}</p>
                        </div>
                        <Badge className={getMetricStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current</span>
                          <span className="font-medium">
                            {metric.name.includes('Rate') || metric.name.includes('Retention') 
                              ? `${metric.current}%` 
                              : metric.name.includes('Value') 
                                ? formatCurrency(metric.current)
                                : formatNumber(metric.current)}
                          </span>
                        </div>
                        
                        <Progress 
                          value={(metric.current / metric.target) * 100} 
                          className="h-2" 
                        />
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Target: {
                            metric.name.includes('Rate') || metric.name.includes('Retention') 
                              ? `${metric.target}%` 
                              : metric.name.includes('Value') 
                                ? formatCurrency(metric.target)
                                : formatNumber(metric.target)
                          }</span>
                          <span className={metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {metric.trend >= 0 ? '+' : ''}{metric.trend}
                            {metric.name.includes('Rate') || metric.name.includes('Retention') ? 'pp' : metric.name.includes('Value') ? '৳' : ''}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Revenue Forecast
                </CardTitle>
                <CardDescription>
                  Predicted revenue for next 90 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Revenue forecast chart would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Category Performance
                </CardTitle>
                <CardDescription>
                  Sales distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Category performance chart would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Demand Predictions
                </CardTitle>
                <CardDescription>
                  Product demand forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Electronics', 'Clothing', 'Home & Garden'].map((category, index) => (
                    <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="font-medium">{category}</p>
                        <p className="text-sm text-muted-foreground">Next 30 days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +{Math.floor(Math.random() * 30 + 10)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 20 + 75)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Success Predictions
                </CardTitle>
                <CardDescription>
                  Products likely to succeed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Wireless Earbuds Pro', 'Smart Watch Series X', 'Gaming Laptop Ultra'].map((product, index) => (
                    <div key={product} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{product}</p>
                        <p className="text-sm text-muted-foreground">Success probability</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {Math.floor(Math.random() * 30 + 70)}%
                        </p>
                        <Badge variant="outline">High potential</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}