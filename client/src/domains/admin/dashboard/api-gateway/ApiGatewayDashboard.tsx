import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Activity, 
  Server, 
  Route, 
  Shield, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Zap,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiGatewayApiService } from '@/shared/services/api-gateway/ApiGatewayApiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface GatewayHealth {
  status: string;
  gateway: string;
  services: any;
  metrics: any;
  timestamp: string;
}

interface ServiceHealth {
  totalInstances: number;
  healthyInstances: number;
  instances: Array<{
    id: string;
    host: string;
    port: number;
    healthy: boolean;
    lastCheck: string;
  }>;
}

interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

const ApiGatewayDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [gatewayHealth, setGatewayHealth] = useState<GatewayHealth | null>(null);
  const [metrics, setMetrics] = useState<GatewayMetrics | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    period: '24h',
    status: 'all',
    service: 'all'
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [healthData, metricsData, servicesData, routesData] = await Promise.all([
        apiGatewayApiService.getGatewayHealth(),
        apiGatewayApiService.getGatewayMetrics(filters.period),
        apiGatewayApiService.getServices(),
        apiGatewayApiService.getRoutes()
      ]);

      setGatewayHealth(healthData);
      setMetrics(metricsData.metrics);
      setServices(servicesData.services || []);
      setRoutes(routesData.routes || []);
      setError(null);
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const calculateSuccessRate = () => {
    if (!metrics || metrics.totalRequests === 0) return 0;
    return Math.round((metrics.successfulRequests / metrics.totalRequests) * 100);
  };

  const exportData = async (type: string) => {
    try {
      const exportConfig = {
        type,
        period: filters.period,
        format: 'csv'
      };
      await apiGatewayApiService.exportAnalytics(exportConfig);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading && !gatewayHealth) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Gateway</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Amazon.com/Shopee.sg-Level Gateway Management & Monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filters.period} onValueChange={(value) => setFilters({...filters, period: value})}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Gateway Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gateway Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(gatewayHealth?.status || 'unknown')}`}></div>
                  <span className="text-lg font-semibold capitalize">
                    {gatewayHealth?.status || 'Unknown'}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold">{formatNumber(metrics?.totalRequests || 0)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs yesterday
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold">{calculateSuccessRate()}%</p>
                <Progress value={calculateSuccessRate()} className="mt-2" />
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold">{formatResponseTime(metrics?.averageResponseTime || 0)}</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -5ms vs yesterday
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-time Traffic Metrics
              </CardTitle>
              <CardDescription>Request volume and response times over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="responseTime" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Service Health Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Service Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(gatewayHealth?.services || {}).map(([serviceName, health]) => {
                    const serviceHealth = health as ServiceHealth;
                    const healthPercentage = serviceHealth.totalInstances > 0 
                      ? Math.round((serviceHealth.healthyInstances / serviceHealth.totalInstances) * 100)
                      : 0;
                    
                    return (
                      <div key={serviceName} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            healthPercentage >= 80 ? 'bg-green-500' : 
                            healthPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium">{serviceName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {serviceHealth.healthyInstances}/{serviceHealth.totalInstances}
                          </span>
                          <Badge variant={healthPercentage >= 80 ? 'default' : 'destructive'}>
                            {healthPercentage}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Top Routes by Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routes.slice(0, 5).map((route, index) => (
                    <div key={route.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {route.method}
                        </span>
                        <span className="font-medium">{route.path}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {formatNumber(Math.floor(Math.random() * 10000))} req/h
                        </span>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Registered Services</CardTitle>
                  <CardDescription>Manage microservices registered with the gateway</CardDescription>
                </div>
                <Button>
                  <Server className="h-4 w-4 mr-2" />
                  Register Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.host}:{service.port}{service.basePath}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{service.version}</Badge>
                        <Badge variant="outline">Priority: {service.priority}</Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>API Routes</CardTitle>
                  <CardDescription>Configure and manage API routing rules</CardDescription>
                </div>
                <Button>
                  <Route className="h-4 w-4 mr-2" />
                  Create Route
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map((route) => (
                  <div key={route.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          route.method === 'GET' ? 'bg-green-100 text-green-800' :
                          route.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          route.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          route.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {route.method}
                        </span>
                        <div>
                          <p className="font-medium font-mono">{route.path}</p>
                          <p className="text-sm text-gray-600">→ {route.targetPath}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {route.requiresAuth && <Badge variant="secondary">Auth</Badge>}
                        {route.circuitBreaker && <Badge variant="outline">Circuit Breaker</Badge>}
                        <Badge variant="outline">Rate: {route.rateLimit}/min</Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { range: '0-100ms', count: 1200 },
                      { range: '100-500ms', count: 800 },
                      { range: '500ms-1s', count: 200 },
                      { range: '1s+', count: 50 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.slice(0, 5).map((service, index) => {
                    const errorRate = Math.random() * 5; // Mock error rate
                    return (
                      <div key={service.id} className="flex items-center justify-between">
                        <span className="font-medium">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${errorRate * 20}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">{errorRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>Download monitoring data and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={() => exportData('metrics')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Metrics
                </Button>
                <Button onClick={() => exportData('logs')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
                <Button onClick={() => exportData('analytics')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold">SSL/TLS</p>
                      <p className="text-sm text-gray-600">Active</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-semibold">Rate Limiting</p>
                      <p className="text-sm text-gray-600">Configured</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="font-semibold">Authentication</p>
                      <p className="text-sm text-gray-600">JWT</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blocked IPs & Rate Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">192.168.1.100</p>
                    <p className="text-sm text-gray-600">Exceeded rate limit (1000 req/min)</p>
                  </div>
                  <Badge variant="destructive">Blocked</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">10.0.0.50</p>
                    <p className="text-sm text-gray-600">Suspicious activity detected</p>
                  </div>
                  <Badge variant="destructive">Blocked</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gateway Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Rate Limit</label>
                    <Input type="number" defaultValue="100" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Request Timeout</label>
                    <Input type="number" defaultValue="30000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Circuit Breaker Threshold</label>
                    <Input type="number" defaultValue="5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Load Balancing Algorithm</label>
                    <Select defaultValue="round_robin">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round_robin">Round Robin</SelectItem>
                        <SelectItem value="least_connections">Least Connections</SelectItem>
                        <SelectItem value="weighted_round_robin">Weighted Round Robin</SelectItem>
                        <SelectItem value="ip_hash">IP Hash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Health Check Interval</label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bangladesh Region Optimization</label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button>Save Configuration</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiGatewayDashboard;