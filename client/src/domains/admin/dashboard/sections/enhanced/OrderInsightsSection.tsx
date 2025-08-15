
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { ShoppingCart, TrendingUp, Clock, Package, CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react';

export const OrderInsightsSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const orderStats = [
    { label: 'Total Orders', value: '12,847', change: '+23%', icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Completed Orders', value: '11,234', change: '+18%', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending Orders', value: '1,456', change: '+15%', icon: Clock, color: 'text-yellow-600' },
    { label: 'Cancelled Orders', value: '157', change: '-8%', icon: XCircle, color: 'text-red-600' },
  ];

  const orderStatusBreakdown = [
    { status: 'Delivered', count: 8945, percentage: 70, color: 'text-green-600' },
    { status: 'Processing', count: 1823, percentage: 14, color: 'text-blue-600' },
    { status: 'Shipped', count: 1279, percentage: 10, color: 'text-purple-600' },
    { status: 'Pending', count: 643, percentage: 5, color: 'text-yellow-600' },
    { status: 'Cancelled', count: 157, percentage: 1, color: 'text-red-600' },
  ];

  const recentOrders = [
    { id: '#ORD-2024-001', customer: 'Ahmed Hassan', amount: 2450, status: 'delivered', time: '2 min ago' },
    { id: '#ORD-2024-002', customer: 'Fatima Khan', amount: 1890, status: 'processing', time: '5 min ago' },
    { id: '#ORD-2024-003', customer: 'Rahul Islam', amount: 3200, status: 'shipped', time: '8 min ago' },
    { id: '#ORD-2024-004', customer: 'Ayesha Rahman', amount: 1650, status: 'pending', time: '12 min ago' },
    { id: '#ORD-2024-005', customer: 'Karim Ahmed', amount: 2890, status: 'delivered', time: '15 min ago' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'shipped': return 'text-purple-600 bg-purple-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Insights</h1>
          <p className="text-gray-600 mt-1">Comprehensive order analytics and management</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Order Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className={`h-3 w-3 mr-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last period
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderStatusBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.status}</span>
                      <span className={`text-sm font-semibold ${item.color}`}>
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">৳{order.amount.toLocaleString()}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <span className="text-xs text-gray-500">{order.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-semibold text-green-600">87.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Processing Time</span>
                    <span className="font-semibold text-blue-600">2.3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Satisfaction</span>
                    <span className="font-semibold text-purple-600">4.6/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">৳2.4M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Order Value</span>
                    <span className="font-semibold">৳2,187</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth Rate</span>
                    <span className="font-semibold text-green-600">+23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Morning (8AM-12PM)</span>
                    <span className="font-semibold">23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Afternoon (12PM-6PM)</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evening (6PM-12AM)</span>
                    <span className="font-semibold">32%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Order volume trend charts would be displayed here...</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { season: 'Winter', orders: 3456, growth: '+15%' },
                    { season: 'Spring', orders: 2890, growth: '+8%' },
                    { season: 'Summer', orders: 3124, growth: '+12%' },
                    { season: 'Autumn', orders: 3377, growth: '+18%' },
                  ].map((season, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{season.season}</span>
                      <div className="text-right">
                        <span className="font-semibold">{season.orders}</span>
                        <span className="text-xs text-green-600 ml-2">{season.growth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select defaultValue="summary">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Analysis</SelectItem>
                      <SelectItem value="performance">Performance Report</SelectItem>
                      <SelectItem value="customer">Customer Insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select defaultValue="last-month">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-quarter">Last Quarter</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button>Generate Report</Button>
                <Button variant="outline">Schedule Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Management Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="auto-cancel">Auto-cancel Duration (hours)</Label>
                  <Input id="auto-cancel" type="number" defaultValue="24" />
                </div>
                <div>
                  <Label htmlFor="processing-time">Default Processing Time (days)</Label>
                  <Input id="processing-time" type="number" defaultValue="2" />
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
