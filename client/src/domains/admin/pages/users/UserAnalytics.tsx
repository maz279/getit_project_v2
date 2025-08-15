import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { 
  BarChart3, Users, TrendingUp, TrendingDown, Activity, Calendar,
  MapPin, Globe, Clock, UserCheck, UserX, Shield, Download,
  RefreshCw, ChevronUp, ChevronDown, Smartphone, Monitor, Tablet
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function UserAnalytics() {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('registrations');

  // Mock data - replace with API call
  const registrationData = [
    { date: 'Jan 1', users: 45 },
    { date: 'Jan 2', users: 52 },
    { date: 'Jan 3', users: 48 },
    { date: 'Jan 4', users: 65 },
    { date: 'Jan 5', users: 58 },
    { date: 'Jan 6', users: 72 },
    { date: 'Jan 7', users: 89 }
  ];

  const userActivityData = [
    { hour: '00:00', active: 120 },
    { hour: '03:00', active: 85 },
    { hour: '06:00', active: 150 },
    { hour: '09:00', active: 420 },
    { hour: '12:00', active: 580 },
    { hour: '15:00', active: 490 },
    { hour: '18:00', active: 620 },
    { hour: '21:00', active: 380 }
  ];

  const userDemographics = [
    { name: 'Dhaka', value: 45, color: '#3B82F6' },
    { name: 'Chittagong', value: 20, color: '#10B981' },
    { name: 'Sylhet', value: 15, color: '#F59E0B' },
    { name: 'Rajshahi', value: 10, color: '#EF4444' },
    { name: 'Others', value: 10, color: '#8B5CF6' }
  ];

  const deviceStats = [
    { device: 'Mobile', users: 68, icon: Smartphone },
    { device: 'Desktop', users: 25, icon: Monitor },
    { device: 'Tablet', users: 7, icon: Tablet }
  ];

  const roleDistribution = [
    { role: 'Customers', count: 12450, percentage: 85 },
    { role: 'Vendors', count: 1460, percentage: 10 },
    { role: 'Affiliates', count: 438, percentage: 3 },
    { role: 'Admins', count: 292, percentage: 2 }
  ];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              User Analytics
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive user behavior and demographic insights</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14,640</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">12.5%</span>
                </div>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">8,234</div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={56.2} className="h-2" />
                <span className="text-sm text-gray-500">56.2%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">486</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-red-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">8.3%</span>
                </div>
                <span className="text-sm text-gray-500">vs last week</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Retention Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.4%</div>
              <div className="flex items-center gap-2 mt-2">
                <UserCheck className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">30-day retention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="registrations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
          </TabsList>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trend</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>User activity patterns throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="active" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Users by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userDemographics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, value}) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userDemographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Usage</CardTitle>
                  <CardDescription>User devices breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deviceStats.map((device) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <device.icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium">{device.device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={device.users} className="w-[100px]" />
                          <span className="text-sm text-gray-600 w-10">{device.users}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Roles Distribution</CardTitle>
                  <CardDescription>Breakdown by user type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roleDistribution.map((role) => (
                      <div key={role.role}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{role.role}</span>
                          <span className="text-sm text-gray-600">{role.count.toLocaleString()}</span>
                        </div>
                        <Progress value={role.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Key engagement indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Session Duration</span>
                      <span className="font-medium">8m 34s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pages per Session</span>
                      <span className="font-medium">4.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bounce Rate</span>
                      <span className="font-medium">32.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-medium">3.8%</span>
                    </div>
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