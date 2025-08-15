/**
 * Real-time Metrics Dashboard - Live updating counters and monitoring
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  Activity, Users, ShoppingCart, DollarSign, Bell, Globe,
  Server, Cpu, HardDrive, Wifi, AlertCircle, CheckCircle,
  Package, Truck, Clock, MapPin, TrendingUp, Zap
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadialBarChart, RadialBar, Cell
} from 'recharts';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Alert, AlertDescription } from '@/shared/ui/alert';

// Sample data - In production, this would be real-time WebSocket data
const generateRealtimeData = () => ({
  timestamp: new Date().toLocaleTimeString(),
  activeUsers: Math.floor(Math.random() * 500) + 1500,
  ordersPerMinute: Math.floor(Math.random() * 20) + 10,
  revenue: Math.floor(Math.random() * 50000) + 100000,
  serverLoad: Math.floor(Math.random() * 30) + 50,
});

const liveOrdersData = [
  { time: '2 sec ago', orderId: '#12367', customer: 'Rahim Ahmed', amount: 'BDT 3,450', status: 'new', location: 'Dhaka' },
  { time: '15 sec ago', orderId: '#12366', customer: 'Fatima Khan', amount: 'BDT 8,900', status: 'processing', location: 'Chittagong' },
  { time: '45 sec ago', orderId: '#12365', customer: 'Karim Sheikh', amount: 'BDT 1,250', status: 'new', location: 'Sylhet' },
  { time: '1 min ago', orderId: '#12364', customer: 'Ayesha Begum', amount: 'BDT 5,670', status: 'shipped', location: 'Rajshahi' },
  { time: '2 min ago', orderId: '#12363', customer: 'Hasan Ali', amount: 'BDT 2,340', status: 'delivered', location: 'Khulna' },
];

const activeSessionsData = [
  { division: 'Dhaka', sessions: 580, percentage: 35 },
  { division: 'Chittagong', sessions: 320, percentage: 19 },
  { division: 'Rajshahi', sessions: 180, percentage: 11 },
  { division: 'Khulna', sessions: 150, percentage: 9 },
  { division: 'Sylhet', sessions: 140, percentage: 8 },
  { division: 'Barisal', sessions: 120, percentage: 7 },
  { division: 'Rangpur', sessions: 100, percentage: 6 },
  { division: 'Mymensingh', sessions: 80, percentage: 5 },
];

const systemHealthData = [
  { name: 'CPU Usage', value: 68, color: '#3B82F6' },
  { name: 'Memory', value: 72, color: '#10B981' },
  { name: 'Storage', value: 45, color: '#F59E0B' },
  { name: 'Network', value: 82, color: '#8B5CF6' },
];

const RealTimeMetrics = () => {
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData());
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeNotifications, setActiveNotifications] = useState<any[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateRealtimeData();
      setRealtimeData(newData);
      
      // Update chart data
      setChartData(prev => {
        const updated = [...prev, newData];
        return updated.slice(-20); // Keep last 20 data points
      });

      // Simulate new notifications
      if (Math.random() > 0.7) {
        const notifications = [
          { id: Date.now(), type: 'order', message: 'New order received from Dhaka', time: 'Just now' },
          { id: Date.now(), type: 'payment', message: 'bKash payment confirmed', time: 'Just now' },
          { id: Date.now(), type: 'vendor', message: 'Vendor shipment delayed', time: 'Just now' },
        ];
        setActiveNotifications(prev => [
          notifications[Math.floor(Math.random() * notifications.length)],
          ...prev
        ].slice(0, 5));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout
      currentPage="Real-time Metrics"
      breadcrumbItems={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Real-time Metrics' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Real-time Metrics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Live platform monitoring and performance tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Live Updates Active</span>
            </div>
          </div>
        </div>

        {/* Live Updating Counters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 animate-pulse">
                {realtimeData.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Users online now</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Orders/Min</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {realtimeData.ordersPerMinute}
              </div>
              <p className="text-xs text-gray-500 mt-1">Current order rate</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Live Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                ৳{realtimeData.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Today's revenue</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Server Load</CardTitle>
                <Server className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {realtimeData.serverLoad}%
              </div>
              <Progress value={realtimeData.serverLoad} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Real-time Order Notifications and Active Sessions Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Order Notifications */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Live Order Feed</CardTitle>
                <Badge variant="default" className="animate-pulse">
                  <Bell className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {liveOrdersData.map((order, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{order.orderId}</span>
                            <Badge 
                              variant={
                                order.status === 'new' ? 'default' :
                                order.status === 'processing' ? 'secondary' :
                                order.status === 'shipped' ? 'outline' :
                                'default'
                              }
                              className={order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.customer} • {order.location}
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            {order.amount}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">{order.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Active User Sessions Map */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions by Division</CardTitle>
              <CardDescription>Real-time user distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessionsData.map((division) => (
                  <div key={division.division} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{division.division}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{division.sessions}</span>
                        <span className="text-xs text-gray-500 ml-1">({division.percentage}%)</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={division.percentage} className="h-2" />
                      <div className="absolute -top-1 -right-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Total Active Sessions:</span>
                  <span className="font-semibold">1,670</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Performance Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Health Indicators */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Real-time infrastructure monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {systemHealthData.map((metric) => (
                  <div key={metric.name} className="text-center">
                    <ResponsiveContainer width="100%" height={120}>
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="60%" 
                        outerRadius="90%" 
                        data={[metric]}
                      >
                        <RadialBar
                          dataKey="value"
                          cornerRadius={10}
                          fill={metric.color}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <h4 className="font-medium text-sm mt-2">{metric.name}</h4>
                    <p className="text-2xl font-bold" style={{ color: metric.color }}>
                      {metric.value}%
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    All systems operational. Performance is optimal.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Live Notifications</CardTitle>
                <Badge variant="destructive" className="animate-pulse">
                  {activeNotifications.length} New
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {activeNotifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No new notifications
                    </p>
                  ) : (
                    activeNotifications.map((notif) => (
                      <div key={notif.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notif.type === 'order' ? 'bg-blue-100 text-blue-600' :
                            notif.type === 'payment' ? 'bg-green-100 text-green-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {notif.type === 'order' ? <ShoppingCart className="h-4 w-4" /> :
                             notif.type === 'payment' ? <DollarSign className="h-4 w-4" /> :
                             <AlertCircle className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Live Activity Stream</CardTitle>
            <CardDescription>Platform activity over the last minute</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorActivity)" 
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Server Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Status</CardTitle>
            <CardDescription>Real-time server and service health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Web Server', status: 'operational', uptime: '99.9%', response: '120ms' },
                { name: 'Database', status: 'operational', uptime: '99.8%', response: '45ms' },
                { name: 'Redis Cache', status: 'operational', uptime: '100%', response: '5ms' },
                { name: 'Payment Gateway', status: 'operational', uptime: '99.7%', response: '250ms' },
                { name: 'SMS Service', status: 'degraded', uptime: '95.2%', response: '800ms' },
                { name: 'CDN', status: 'operational', uptime: '100%', response: '30ms' },
              ].map((service) => (
                <div key={service.name} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{service.name}</h4>
                    <Badge 
                      variant={service.status === 'operational' ? 'default' : 'secondary'}
                      className={service.status === 'operational' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
                    >
                      {service.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Uptime:</span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Response:</span>
                      <span className="font-medium">{service.response}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RealTimeMetrics;