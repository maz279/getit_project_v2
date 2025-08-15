import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Eye, 
  Clock, 
  Globe, 
  Smartphone,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * ADVANCED ANALYTICS DASHBOARD
 * Amazon.com/Shopee.sg-Level Real-time Analytics Dashboard
 * 
 * Features:
 * - Real-time WebSocket data streaming
 * - Bangladesh market-specific insights
 * - Festival and cultural analytics
 * - Mobile banking payment tracking
 * - Regional performance analysis
 * - Multi-dimensional KPI tracking
 * - Advanced visualizations
 */

interface RealTimeData {
  sales: {
    totalSales: number;
    salesCount: number;
    averageOrderValue: number;
    growthRate: number;
    bkashSales: number;
    nagadSales: number;
    rocketSales: number;
    codSales: number;
    dhakaRegionSales: number;
    bangladeshFeatures: {
      mobileBankingTotal: number;
      dhakaMarketShare: number;
      codPreference: number;
    };
  };
  traffic: {
    activeUsers: number;
    totalSessions: number;
    pageViews: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    mobileTraffic: number;
    topPages: Array<{
      pageUrl: string;
      visits: number;
      uniqueVisitors: number;
    }>;
    bangladeshInsights: {
      bengaliLanguagePercentage: number;
      mobileTrafficPercentage: number;
    };
  };
  orders: {
    totalOrders: number;
    totalValue: number;
    averageProcessingTime: number;
    pendingOrders: number;
    completedOrders: number;
    failedOrders: number;
    successRate: number;
    vendorPerformance: Array<{
      vendorId: string;
      orderCount: number;
      totalValue: number;
      averageProcessingTime: number;
    }>;
  };
  bangladeshInsights: {
    festivalInsights: {
      activeFestival: any;
      seasonalTrend: string;
      upcomingFestivals: any[];
    };
    prayerTimeImpact: {
      prayerTimes: Record<string, string>;
      trafficDips: string[];
      peakShoppingHours: string[];
    };
    regionalInsights: {
      topPerformingRegion: string;
      fastestGrowingRegion: string;
      regionDistribution: Array<{
        region: string;
        marketShare: number;
        growthRate: number;
      }>;
    };
    culturalPreferences: {
      languagePreference: Record<string, number>;
      categoryPreferences: Record<string, string[]>;
      shoppingPatterns: Record<string, any>;
    };
  };
  paymentMethods: {
    paymentMethods: Array<{
      method: string;
      transactionCount: number;
      totalValue: number;
      averageAmount: number;
      averageProcessingTime: number;
      marketShare: number;
    }>;
    mobileBankingDominance: number;
  };
}

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = `ws://localhost:5000/api/v1/analytics/realtime`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setConnectionStatus('connected');
        console.log('Real-time analytics connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
          setLastUpdated(new Date());
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setConnectionStatus('disconnected');
        console.log('Real-time analytics disconnected');
        
        // Attempt to reconnect after 5 seconds
        if (autoRefresh) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  }, [autoRefresh]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'INITIAL_DASHBOARD_DATA':
        setRealTimeData(message.data);
        break;
      
      case 'SALES_STREAM_UPDATE':
        setRealTimeData(prev => prev ? { ...prev, sales: message.data } : null);
        break;
      
      case 'TRAFFIC_STREAM_UPDATE':
        setRealTimeData(prev => prev ? { ...prev, traffic: message.data } : null);
        break;
      
      case 'ORDER_STREAM_UPDATE':
        setRealTimeData(prev => prev ? { ...prev, orders: message.data } : null);
        break;
      
      case 'BANGLADESH_INSIGHTS_UPDATE':
        setRealTimeData(prev => prev ? { ...prev, bangladeshInsights: message.data } : null);
        break;
      
      case 'PAYMENT_METHOD_UPDATE':
        setRealTimeData(prev => prev ? { ...prev, paymentMethods: message.data } : null);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (autoRefresh) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket, autoRefresh]);

  // Format currency for Bangladesh
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Colors for charts
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    bkash: '#E2136E',
    nagad: '#FF6600',
    rocket: '#8B5CF6',
    cod: '#6B7280'
  };

  // Payment method data for charts
  const paymentMethodChartData = realTimeData?.paymentMethods?.paymentMethods?.map(method => ({
    name: method.method.toUpperCase(),
    value: method.marketShare,
    count: method.transactionCount,
    amount: method.totalValue,
    color: method.method === 'bkash' ? chartColors.bkash :
           method.method === 'nagad' ? chartColors.nagad :
           method.method === 'rocket' ? chartColors.rocket :
           method.method === 'cod' ? chartColors.cod : chartColors.primary
  })) || [];

  // Regional data for charts
  const regionalChartData = realTimeData?.bangladeshInsights?.regionalInsights?.regionDistribution?.map(region => ({
    name: region.region,
    marketShare: region.marketShare,
    growthRate: region.growthRate
  })) || [];

  if (!realTimeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-lg font-medium">Connecting to Real-time Analytics...</p>
          <p className="text-sm text-gray-500">Establishing WebSocket connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights for Bangladesh marketplace</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
            className="flex items-center space-x-1"
          >
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{connectionStatus === 'connected' ? 'Live' : 'Disconnected'}</span>
          </Badge>

          {/* Auto-refresh toggle */}
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>

          {/* Time range selector */}
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500">
        Last updated: {lastUpdated.toLocaleTimeString('en-US', { 
          timeZone: 'Asia/Dhaka',
          hour12: true 
        })} (Dhaka Time)
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="bangladesh">Bangladesh</TabsTrigger>
          <TabsTrigger value="real-time">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold">{formatCurrency(realTimeData.sales.totalSales)}</p>
                    <div className="flex items-center mt-2">
                      {realTimeData.sales.growthRate >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${realTimeData.sales.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(Math.abs(realTimeData.sales.growthRate))}
                      </span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{realTimeData.traffic.activeUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {formatPercentage(realTimeData.traffic.bangladeshInsights.bengaliLanguagePercentage)} Bengali
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{realTimeData.orders.totalOrders.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {formatPercentage(realTimeData.orders.successRate)} Success Rate
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            {/* Mobile Banking */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mobile Banking</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(realTimeData.paymentMethods.mobileBankingDominance)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Market Share</p>
                  </div>
                  <Smartphone className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      >
                        {paymentMethodChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatPercentage(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Regional Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="marketShare" fill={chartColors.primary} name="Market Share %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bangladesh Tab - Shortened for space */}
        <TabsContent value="bangladesh" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cultural Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Cultural Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Language Preferences</h4>
                    <div className="space-y-2">
                      {Object.entries(realTimeData.bangladeshInsights.culturalPreferences.languagePreference).map(([lang, percentage]) => (
                        <div key={lang} className="flex justify-between items-center">
                          <span className="capitalize">{lang}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={percentage} className="w-20 h-2" />
                            <span className="text-sm font-medium">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Seasonal Trend</h4>
                    <Badge variant="outline" className="text-sm">
                      {realTimeData.bangladeshInsights.festivalInsights.seasonalTrend.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Regional Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Top Performing Region</p>
                    <p className="text-xl font-bold">
                      {realTimeData.bangladeshInsights.regionalInsights.topPerformingRegion}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Fastest Growing Region</p>
                    <p className="text-xl font-bold">
                      {realTimeData.bangladeshInsights.regionalInsights.fastestGrowingRegion}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Market Distribution</h4>
                    <div className="space-y-2">
                      {realTimeData.bangladeshInsights.regionalInsights.regionDistribution.slice(0, 5).map((region) => (
                        <div key={region.region} className="flex justify-between items-center">
                          <span className="text-sm">{region.region}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={region.marketShare} className="w-16 h-2" />
                            <span className="text-sm font-medium">{region.marketShare}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};