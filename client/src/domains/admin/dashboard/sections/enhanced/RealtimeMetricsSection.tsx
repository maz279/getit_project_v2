
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Activity, Users, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useRealTimeAnalytics } from '@/shared/hooks/useDashboardData';

export const RealtimeMetricsSection: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const { data: analytics, isLoading } = useRealTimeAnalytics({ timeRange: selectedTimeRange });

  const realTimeStats = [
    { label: 'Active Users', value: '2,847', change: '+12%', icon: Users, color: 'text-blue-600', trend: 'up' },
    { label: 'Page Views', value: '18,429', change: '+8%', icon: Activity, color: 'text-green-600', trend: 'up' },
    { label: 'Live Orders', value: '156', change: '+23%', icon: ShoppingCart, color: 'text-purple-600', trend: 'up' },
    { label: 'Revenue/Hour', value: '৳45,230', change: '+15%', icon: DollarSign, color: 'text-orange-600', trend: 'up' },
  ];

  const systemMetrics = [
    { name: 'API Response Time', value: 245, unit: 'ms', status: 'good', threshold: 500 },
    { name: 'Database Load', value: 68, unit: '%', status: 'warning', threshold: 80 },
    { name: 'Cache Hit Rate', value: 94, unit: '%', status: 'excellent', threshold: 90 },
    { name: 'Error Rate', value: 0.2, unit: '%', status: 'good', threshold: 1 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-time Metrics</h1>
          <p className="text-gray-600 mt-1">Live performance monitoring and analytics</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
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
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {realTimeStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{stat.change} from last hour</span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                        <span className="text-sm">{metric.value}{metric.unit}</span>
                      </div>
                    </div>
                    <Progress 
                      value={metric.unit === '%' ? metric.value : (metric.value / metric.threshold) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '2 sec ago', event: 'New order placed', type: 'success', icon: CheckCircle },
                    { time: '15 sec ago', event: 'Payment processed', type: 'info', icon: DollarSign },
                    { time: '1 min ago', event: 'High traffic detected', type: 'warning', icon: AlertTriangle },
                    { time: '2 min ago', event: 'User registered', type: 'success', icon: Users },
                    { time: '3 min ago', event: 'Cache cleared', type: 'info', icon: Activity },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded border">
                      <activity.icon className={`h-4 w-4 ${
                        activity.type === 'success' ? 'text-green-500' :
                        activity.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{activity.event}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>API Average</span>
                    <span className="font-semibold">245ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database</span>
                    <span className="font-semibold">125ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache</span>
                    <span className="font-semibold">15ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Web</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobile</span>
                    <span className="font-semibold">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API</span>
                    <span className="font-semibold">7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>CPU</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Memory</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Storage</span>
                      <span>34%</span>
                    </div>
                    <Progress value={34} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { level: 'Warning', message: 'Database connection pool at 80%', time: '5 min ago' },
                  { level: 'Info', message: 'Scheduled maintenance in 2 hours', time: '10 min ago' },
                  { level: 'Critical', message: 'High error rate detected', time: '15 min ago' },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant={alert.level === 'Critical' ? 'destructive' : 
                        alert.level === 'Warning' ? 'secondary' : 'default'}>
                        {alert.level}
                      </Badge>
                      <span>{alert.message}</span>
                    </div>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                  <Input id="refresh-interval" type="number" defaultValue="30" />
                </div>
                <div>
                  <Label htmlFor="alert-threshold">Alert Threshold</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
