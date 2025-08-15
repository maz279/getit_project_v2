import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Store, TrendingUp, Users, DollarSign, Star, AlertTriangle, Package, Clock } from 'lucide-react';

export const VendorPerformanceSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedVendor, setSelectedVendor] = useState('all');

  const topVendors = [
    { name: 'TechMart BD', rating: 4.8, orders: 1247, revenue: 245000, growth: '+15%', status: 'excellent' },
    { name: 'Fashion House', rating: 4.6, orders: 967, revenue: 189000, growth: '+8%', status: 'good' },
    { name: 'Electronics Pro', rating: 4.5, orders: 834, revenue: 167000, growth: '+12%', status: 'good' },
    { name: 'Home Essentials', rating: 4.3, orders: 756, revenue: 134000, growth: '+5%', status: 'average' },
  ];

  const performanceMetrics = [
    { metric: 'Order Fulfillment Rate', value: 94.5, target: 95, unit: '%' },
    { metric: 'Average Delivery Time', value: 2.3, target: 3, unit: 'days' },
    { metric: 'Customer Satisfaction', value: 4.6, target: 4.5, unit: '/5' },
    { metric: 'Return Rate', value: 3.2, target: 5, unit: '%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Performance</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze vendor performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Store className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,156</div>
            <p className="text-xs text-muted-foreground">92.7% activity rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳2.4M</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">+0.2 improvement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="vendors">Top Vendors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <span className="text-sm">{metric.value}{metric.unit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={(metric.value / metric.target) * 100} className="flex-1" />
                      <span className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: 'Electronics', count: 342, percentage: 27 },
                    { category: 'Fashion', count: 298, percentage: 24 },
                    { category: 'Home & Garden', count: 234, percentage: 19 },
                    { category: 'Books', count: 189, percentage: 15 },
                    { category: 'Sports', count: 184, percentage: 15 },
                  ].map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{cat.category}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={cat.percentage} className="w-20" />
                        <span className="text-xs text-gray-500 w-12">{cat.count}</span>
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
                <CardTitle>Fulfillment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>On-time Delivery</span>
                    <span className="font-semibold text-green-600">94.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Accuracy</span>
                    <span className="font-semibold text-blue-600">96.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span className="font-semibold text-purple-600">2.1h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Product Quality</span>
                    <span className="font-semibold">4.6/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Rate</span>
                    <span className="font-semibold text-yellow-600">3.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complaint Rate</span>
                    <span className="font-semibold text-green-600">1.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Avg Order Value</span>
                    <span className="font-semibold">৳2,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission Rate</span>
                    <span className="font-semibold">15.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Growth</span>
                    <span className="font-semibold text-green-600">+18%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendors.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{vendor.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{vendor.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">Orders</p>
                          <p className="font-semibold">{vendor.orders}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Revenue</p>
                          <p className="font-semibold">৳{vendor.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <Badge className={getStatusColor(vendor.status)}>
                            {vendor.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Vendor performance trend charts would be displayed here...</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { region: 'Dhaka', vendors: 456, percentage: 37 },
                    { region: 'Chittagong', vendors: 234, percentage: 19 },
                    { region: 'Sylhet', vendors: 167, percentage: 13 },
                    { region: 'Rajshahi', vendors: 145, percentage: 12 },
                    { region: 'Others', vendors: 245, percentage: 19 },
                  ].map((region, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{region.region}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={region.percentage} className="w-20" />
                        <span className="text-xs text-gray-500 w-12">{region.vendors}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Management Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-rating">Minimum Rating Threshold</Label>
                  <Input id="min-rating" type="number" step="0.1" defaultValue="4.0" />
                </div>
                <div>
                  <Label htmlFor="performance-period">Performance Review Period</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button>Update Settings</Button>
                <Button variant="outline">Export Report</Button>
                <Button variant="outline">Send Notifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
