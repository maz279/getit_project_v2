/**
 * API Gateway Management Dashboard
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Amazon.com/Shopee.sg-level API Gateway management interface with real-time monitoring,
 * service discovery, analytics, and comprehensive gateway administration.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Server, Shield, Clock, Users, Zap, Globe, 
  Database, AlertTriangle, CheckCircle, XCircle, Settings,
  TrendingUp, TrendingDown, Eye, Filter, Search, RefreshCw,
  Network, Cpu, Memory, HardDrive, Wifi, WifiOff, BarChart3,
  PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';

// Types for API Gateway data
interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'warning';
  responseTime: number;
  lastHeartbeat: string;
  version: string;
  load: number;
}

interface GatewayMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
  activeConnections: number;
  bandwidth: number;
  cacheHitRate: number;
}

interface TrafficData {
  timestamp: string;
  requests: number;
  errors: number;
  responseTime: number;
  bandwidth: number;
}

interface SecurityMetrics {
  blockedRequests: number;
  rateLimitHits: number;
  authFailures: number;
  suspiciousActivity: number;
  ddosAttempts: number;
}

interface BangladeshMetrics {
  mobileTraffic: number;
  popularPaymentMethods: { name: string; percentage: number; color: string }[];
  regionalDistribution: { region: string; requests: number }[];
  festivalImpact: { event: string; traffic: number; date: string }[];
  prayerTimeAdjustments: number;
}

const ApiGatewayDashboard: React.FC = () => {
  const [gatewayMetrics, setGatewayMetrics] = useState<GatewayMetrics>({
    totalRequests: 1248567,
    successRate: 99.7,
    averageResponseTime: 87,
    errorRate: 0.3,
    requestsPerSecond: 1248,
    activeConnections: 15847,
    bandwidth: 245.8,
    cacheHitRate: 94.2
  });

  const [serviceInstances, setServiceInstances] = useState<ServiceInstance[]>([
    {
      id: '1',
      name: 'user-service',
      host: 'localhost',
      port: 5001,
      status: 'healthy',
      responseTime: 45,
      lastHeartbeat: '2025-07-09T10:30:00Z',
      version: '2.1.0',
      load: 68
    },
    {
      id: '2',
      name: 'product-service',
      host: 'localhost',
      port: 5002,
      status: 'healthy',
      responseTime: 62,
      lastHeartbeat: '2025-07-09T10:30:01Z',
      version: '1.9.4',
      load: 72
    },
    {
      id: '3',
      name: 'order-service',
      host: 'localhost',
      port: 5003,
      status: 'warning',
      responseTime: 156,
      lastHeartbeat: '2025-07-09T10:29:45Z',
      version: '2.0.1',
      load: 89
    },
    {
      id: '4',
      name: 'payment-service',
      host: 'localhost',
      port: 5004,
      status: 'healthy',
      responseTime: 78,
      lastHeartbeat: '2025-07-09T10:30:02Z',
      version: '1.8.7',
      load: 45
    },
    {
      id: '5',
      name: 'analytics-service',
      host: 'localhost',
      port: 5005,
      status: 'healthy',
      responseTime: 34,
      lastHeartbeat: '2025-07-09T10:30:00Z',
      version: '3.0.0',
      load: 56
    }
  ]);

  const [trafficData, setTrafficData] = useState<TrafficData[]>([
    { timestamp: '00:00', requests: 850, errors: 3, responseTime: 89, bandwidth: 120.5 },
    { timestamp: '04:00', requests: 420, errors: 1, responseTime: 67, bandwidth: 78.2 },
    { timestamp: '08:00', requests: 1200, errors: 8, responseTime: 95, bandwidth: 180.3 },
    { timestamp: '12:00', requests: 1450, errors: 12, responseTime: 102, bandwidth: 220.7 },
    { timestamp: '16:00', requests: 1680, errors: 15, responseTime: 87, bandwidth: 245.8 },
    { timestamp: '20:00', requests: 1320, errors: 6, responseTime: 79, bandwidth: 195.4 },
  ]);

  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    blockedRequests: 2847,
    rateLimitHits: 1256,
    authFailures: 847,
    suspiciousActivity: 23,
    ddosAttempts: 5
  });

  const [bangladeshMetrics, setBangladeshMetrics] = useState<BangladeshMetrics>({
    mobileTraffic: 78.5,
    popularPaymentMethods: [
      { name: 'bKash', percentage: 42.3, color: '#E2136E' },
      { name: 'Nagad', percentage: 28.7, color: '#FF6600' },
      { name: 'Rocket', percentage: 18.9, color: '#8B1538' },
      { name: 'Credit Card', percentage: 10.1, color: '#0066CC' }
    ],
    regionalDistribution: [
      { region: 'Dhaka', requests: 45680 },
      { region: 'Chittagong', requests: 23450 },
      { region: 'Sylhet', requests: 12890 },
      { region: 'Rajshahi', requests: 8750 },
      { region: 'Khulna', requests: 7850 },
      { region: 'Barisal', requests: 5670 },
      { region: 'Rangpur', requests: 4560 },
      { region: 'Mymensingh', requests: 3890 }
    ],
    festivalImpact: [
      { event: 'Eid ul-Fitr', traffic: 285, date: '2025-04-10' },
      { event: 'Pohela Boishakh', traffic: 195, date: '2025-04-14' },
      { event: 'Eid ul-Adha', traffic: 220, date: '2025-06-17' },
      { event: 'Victory Day', traffic: 145, date: '2025-12-16' }
    ],
    prayerTimeAdjustments: 1247
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState('all');

  // Auto-refresh data every 30 seconds in live mode
  useEffect(() => {
    if (isLiveMode) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setGatewayMetrics(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + Math.floor(Math.random() * 100),
          requestsPerSecond: 1200 + Math.floor(Math.random() * 200),
          activeConnections: 15800 + Math.floor(Math.random() * 100),
          averageResponseTime: 80 + Math.floor(Math.random() * 20)
        }));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isLiveMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const filteredServices = serviceInstances.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            API Gateway Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Amazon.com/Shopee.sg-level Enterprise Gateway Management
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="live-mode">Live Mode</Label>
            <Switch
              id="live-mode"
              checked={isLiveMode}
              onCheckedChange={setIsLiveMode}
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(gatewayMetrics.totalRequests)}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from yesterday
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {gatewayMetrics.successRate}%
                </p>
                <Progress value={gatewayMetrics.successRate} className="mt-2" />
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {gatewayMetrics.averageResponseTime}ms
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -8ms from yesterday
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Connections
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatNumber(gatewayMetrics.activeConnections)}
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  {formatNumber(gatewayMetrics.requestsPerSecond)}/sec
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Network className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="bangladesh">Bangladesh</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChartIcon className="h-5 w-5 mr-2" />
                  Traffic Overview (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="errors"
                      stackId="2"
                      stroke="#ff7300"
                      fill="#ff7300"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Time Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Response Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#82ca9d"
                      strokeWidth={3}
                      dot={{ fill: '#82ca9d' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Health Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                System Health Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Cpu className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">CPU Usage</p>
                      <p className="text-2xl font-bold">68%</p>
                    </div>
                  </div>
                  <Progress value={68} className="w-16" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Memory className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Memory</p>
                      <p className="text-2xl font-bold">72%</p>
                    </div>
                  </div>
                  <Progress value={72} className="w-16" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <HardDrive className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Disk I/O</p>
                      <p className="text-2xl font-bold">45%</p>
                    </div>
                  </div>
                  <Progress value={45} className="w-16" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wifi className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Network</p>
                      <p className="text-2xl font-bold">{gatewayMetrics.bandwidth}MB/s</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Optimal
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Server className="h-4 w-4 mr-2" />
              Register Service
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {getStatusIcon(service.status)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{service.version}</Badge>
                    <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Host:Port</p>
                      <p className="font-medium">{service.host}:{service.port}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Response Time</p>
                      <p className="font-medium">{service.responseTime}ms</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Load</span>
                      <span className="text-sm font-medium">{service.load}%</span>
                    </div>
                    <Progress value={service.load} />
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Last heartbeat:</span>
                    <span>{new Date(service.lastHeartbeat).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Monitor
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Request Distribution by Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceInstances}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="load" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cache Hit Rate</span>
                    <span className="font-bold text-green-600">{gatewayMetrics.cacheHitRate}%</span>
                  </div>
                  <Progress value={gatewayMetrics.cacheHitRate} />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">94.2%</p>
                      <p className="text-sm text-gray-600">Cache Hits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">5.8%</p>
                      <p className="text-sm text-gray-600">Cache Misses</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bandwidth Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Bandwidth Usage Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="bandwidth"
                    stroke="#ff7300"
                    fill="#ff7300"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(securityMetrics.blockedRequests)}</p>
                <p className="text-sm text-gray-600">Blocked Requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(securityMetrics.rateLimitHits)}</p>
                <p className="text-sm text-gray-600">Rate Limit Hits</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(securityMetrics.authFailures)}</p>
                <p className="text-sm text-gray-600">Auth Failures</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(securityMetrics.suspiciousActivity)}</p>
                <p className="text-sm text-gray-600">Suspicious Activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <WifiOff className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(securityMetrics.ddosAttempts)}</p>
                <p className="text-sm text-gray-600">DDoS Attempts</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Events Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>High Risk Activity Detected</AlertTitle>
                  <AlertDescription>
                    Multiple failed authentication attempts from IP 192.168.1.100. 
                    Automatic rate limiting applied.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>DDoS Protection Activated</AlertTitle>
                  <AlertDescription>
                    Traffic spike detected. DDoS protection mechanisms activated automatically.
                    5 attacking IPs have been blocked.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bangladesh Tab */}
        <TabsContent value="bangladesh" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Payment Methods Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bangladeshMetrics.popularPaymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {bangladeshMetrics.popularPaymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Regional Traffic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bangladeshMetrics.regionalDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bangladesh-specific Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">{bangladeshMetrics.mobileTraffic}%</p>
                  <p className="text-sm text-gray-600 mt-2">of total traffic</p>
                  <Progress value={bangladeshMetrics.mobileTraffic} className="mt-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prayer Time Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">{bangladeshMetrics.prayerTimeAdjustments}</p>
                  <p className="text-sm text-gray-600 mt-2">auto-adjustments today</p>
                  <Badge variant="outline" className="mt-4">
                    Cultural Optimization Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Festival Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bangladeshMetrics.festivalImpact.map((festival, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{festival.event}</span>
                      <Badge variant="outline">+{festival.traffic}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Protocols Tab */}
        <TabsContent value="protocols" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* HTTP/REST */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HTTP/REST</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Requests/min</span>
                    <span className="font-bold">75,842</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-bold text-green-600">99.7%</span>
                  </div>
                  <Progress value={99.7} />
                </div>
              </CardContent>
            </Card>

            {/* WebSocket */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WebSocket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Connections</span>
                    <span className="font-bold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency</span>
                    <span className="font-bold">-</span>
                  </div>
                  <Button size="sm" className="w-full">Enable</Button>
                </div>
              </CardContent>
            </Card>

            {/* GraphQL */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GraphQL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Queries/min</span>
                    <span className="font-bold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schema Version</span>
                    <span className="font-bold">-</span>
                  </div>
                  <Button size="sm" className="w-full">Enable</Button>
                </div>
              </CardContent>
            </Card>

            {/* gRPC */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">gRPC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>RPCs/min</span>
                    <span className="font-bold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Services</span>
                    <span className="font-bold">-</span>
                  </div>
                  <Button size="sm" className="w-full">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Protocol Enhancement Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>WebSocket APIs - Week 1</AlertTitle>
                  <AlertDescription>
                    Real-time bidirectional communication support with Socket.IO integration.
                    Enabling live chat, notifications, and real-time updates.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>GraphQL Gateway - Week 2</AlertTitle>
                  <AlertDescription>
                    Schema federation and intelligent query optimization with Apollo Gateway.
                    Supporting multiple GraphQL services with unified schema.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Network className="h-4 w-4" />
                  <AlertTitle>gRPC Support - Week 3</AlertTitle>
                  <AlertDescription>
                    High-performance RPC protocol support for microservice communication.
                    Enabling efficient inter-service communication with type safety.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiGatewayDashboard;