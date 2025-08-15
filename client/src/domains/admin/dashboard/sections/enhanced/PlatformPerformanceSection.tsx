
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Activity, Server, Database, Wifi, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { usePerformanceMetrics } from '@/shared/hooks/useDashboardData';

export const PlatformPerformanceSection: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const { data: metrics, isLoading } = usePerformanceMetrics({ timeframe: selectedTimeframe });

  const performanceStats = [
    { label: 'API Response Time', value: '245ms', target: '< 500ms', status: 'good', icon: Server },
    { label: 'Database Performance', value: '123ms', target: '< 200ms', status: 'excellent', icon: Database },
    { label: 'Network Latency', value: '45ms', target: '< 100ms', status: 'excellent', icon: Wifi },
    { label: 'System Load', value: '68%', target: '< 80%', status: 'good', icon: Activity },
  ];

  const systemComponents = [
    { name: 'Web Server', status: 'healthy', uptime: 99.9, responseTime: 125 },
    { name: 'API Gateway', status: 'healthy', uptime: 99.8, responseTime: 89 },
    { name: 'Database', status: 'warning', uptime: 99.5, responseTime: 156 },
    { name: 'Cache Server', status: 'healthy', uptime: 99.9, responseTime: 23 },
    { name: 'File Storage', status: 'healthy', uptime: 99.7, responseTime: 67 },
    { name: 'Search Engine', status: 'healthy', uptime: 99.6, responseTime: 234 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      case 'healthy': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Performance</h1>
          <p className="text-gray-600 mt-1">Monitor system performance and infrastructure health</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5 Minutes</SelectItem>
              <SelectItem value="15m">15 Minutes</SelectItem>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Target: {stat.target}</span>
                <Badge className={getStatusColor(stat.status)}>
                  {stat.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall System Health</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">System Availability</span>
                      <span className="text-sm font-semibold">99.8%</span>
                    </div>
                    <Progress value={99.8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Performance Score</span>
                      <span className="text-sm font-semibold">94/100</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-semibold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-semibold">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Disk Usage</span>
                      <span className="text-sm font-semibold">34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Network Bandwidth</span>
                      <span className="text-sm font-semibold">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Components Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemComponents.map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(component.status)}
                      <div>
                        <h3 className="font-medium">{component.name}</h3>
                        <p className="text-sm text-gray-600">Uptime: {component.uptime}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Response: {component.responseTime}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Requests/Second</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time</span>
                    <span className="font-semibold">245ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-semibold text-green-600">99.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="font-semibold text-red-600">0.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Query Time</span>
                    <span className="font-semibold">123ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connections</span>
                    <span className="font-semibold">45/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Hit Rate</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Queries</span>
                    <span className="font-semibold text-yellow-600">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Server Load</span>
                    <span className="font-semibold">2.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network I/O</span>
                    <span className="font-semibold">234 MB/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disk I/O</span>
                    <span className="font-semibold">67 MB/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Sessions</span>
                    <span className="font-semibold">1,834</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { level: 'Warning', message: 'High memory usage on web server', time: '5 min ago', component: 'Web Server' },
                  { level: 'Info', message: 'Cache invalidation completed', time: '10 min ago', component: 'Cache' },
                  { level: 'Critical', message: 'Database connection timeout', time: '15 min ago', component: 'Database' },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant={alert.level === 'Critical' ? 'destructive' : 
                        alert.level === 'Warning' ? 'secondary' : 'default'}>
                        {alert.level}
                      </Badge>
                      <div>
                        <span className="text-sm">{alert.message}</span>
                        <p className="text-xs text-gray-500">{alert.component}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
                  <Input id="cache-ttl" type="number" defaultValue="3600" />
                </div>
                <div>
                  <Label htmlFor="connection-pool">Max Connections</Label>
                  <Input id="connection-pool" type="number" defaultValue="100" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button>Apply Optimization</Button>
                <Button variant="outline">Reset to Default</Button>
                <Button variant="outline">Run Performance Test</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
