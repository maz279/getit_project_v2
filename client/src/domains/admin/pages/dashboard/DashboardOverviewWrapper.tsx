/**
 * Dashboard Overview Wrapper - Clean wrapper with AdminLayout
 */

import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { 
  TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign, 
  Eye, Target, Clock, AlertTriangle, CheckCircle, Star, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Download, Filter,
  BarChart3, PieChart, LineChart, Activity, Calendar, Flag,
  Truck, CreditCard, Store, MessageSquare, Bell, Zap
} from 'lucide-react';

export default function DashboardOverviewWrapper() {
  return (
    <AdminLayout 
      currentPage="Dashboard Overview"
      breadcrumbItems={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Overview' }
      ]}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Real-time platform monitoring and KPI tracking
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              Live Data
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                  <p className="text-sm text-gray-500">মোট আয়</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">৳12,45,678</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+15.2%</span>
                    <span className="text-xs text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Users</p>
                  <p className="text-sm text-gray-500">সক্রিয় ব্যবহারকারী</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">23,456</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+8.5%</span>
                    <span className="text-xs text-gray-500 ml-2">vs last week</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Orders</p>
                  <p className="text-sm text-gray-500">মোট অর্ডার</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">1,892</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12.8%</span>
                    <span className="text-xs text-gray-500 ml-2">today</span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Products</p>
                  <p className="text-sm text-gray-500">পণ্য সংখ্যা</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">12,345</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+6.8%</span>
                    <span className="text-xs text-gray-500 ml-2">new this week</span>
                  </div>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bangladesh Market Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-green-600" />
              Bangladesh Market Status
              <span className="text-sm font-normal text-gray-500">• বাংলাদেশ বাজার অবস্থা</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Payment Success Rate</p>
                      <p className="text-lg font-bold">98.5%</p>
                      <p className="text-xs text-gray-500">bKash, Nagad, Rocket</p>
                    </div>
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Delivery Performance</p>
                      <p className="text-lg font-bold">94.2%</p>
                      <p className="text-xs text-gray-500">Pathao, Paperfly, RedX</p>
                    </div>
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Customer Satisfaction</p>
                      <p className="text-lg font-bold">4.8/5.0</p>
                      <p className="text-xs text-gray-500">Based on 15,247 reviews</p>
                    </div>
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Live Activity Feed
              </CardTitle>
              <CardDescription>
                Real-time platform activity and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'New Order Placed', user: 'Rahman Khan', amount: '৳2,450', time: '2 minutes ago', status: 'success' },
                  { action: 'Payment Verified', user: 'Fatima Begum', amount: '৳1,890', time: '5 minutes ago', status: 'success' },
                  { action: 'Product Listed', user: 'Tech Store BD', amount: 'Smartphone', time: '8 minutes ago', status: 'info' },
                  { action: 'Delivery Completed', user: 'Agro Products', amount: '৳950', time: '12 minutes ago', status: 'success' },
                  { action: 'New Vendor Registered', user: 'Fashion House', amount: 'KYC Pending', time: '18 minutes ago', status: 'warning' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.amount}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                System performance and health indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Server Response Time</span>
                    <span className="text-green-600">Fast (120ms)</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Database Performance</span>
                    <span className="text-green-600">Excellent (95%)</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>API Gateway Health</span>
                    <span className="text-green-600">Healthy (99.9%)</span>
                  </div>
                  <Progress value={99} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Payment Gateway Status</span>
                    <span className="text-green-600">All Systems Operational</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      All systems operational
                    </p>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                <span className="text-xs">User Management</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Package className="h-6 w-6" />
                <span className="text-xs">Product Catalog</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs">Order Processing</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-xs">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}