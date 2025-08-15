/**
 * Amazon.com/Shopee.sg-Level Vendor Dashboard Hub
 * Consolidates vendor management, analytics, and performance tracking
 * Implements enterprise-grade vendor portal with cultural optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Store, 
  Package, 
  BarChart3, 
  DollarSign, 
  Users, 
  Truck,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface VendorStats {
  totalProducts: number;
  activeOrders: number;
  monthlyRevenue: number;
  customerRating: number;
  totalCustomers: number;
  pendingPayouts: number;
}

interface VendorDashboardHubProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const VendorDashboardHub: React.FC<VendorDashboardHubProps> = ({
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 156,
    activeOrders: 23,
    monthlyRevenue: 185000,
    customerRating: 4.7,
    totalCustomers: 1248,
    pendingPayouts: 45000
  });

  return (
    <div className={`vendor-dashboard-hub ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'bn' ? 'বিক্রেতা ড্যাশবোর্ড' : 'Vendor Dashboard'}
          </h1>
          <p className="text-gray-600">
            {language === 'bn' 
              ? 'আপনার ব্যবসার সম্পূর্ণ ওভারভিউ এবং পারফরমেন্স ট্র্যাকিং'
              : 'Complete overview and performance tracking for your business'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold">{stats.totalProducts}</div>
              <div className="text-xs text-gray-600">
                {language === 'bn' ? 'পণ্য' : 'Products'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-xl font-bold">{stats.activeOrders}</div>
              <div className="text-xs text-gray-600">
                {language === 'bn' ? 'সক্রিয় অর্ডার' : 'Active Orders'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold">৳{(stats.monthlyRevenue / 1000).toFixed(0)}K</div>
              <div className="text-xs text-gray-600">
                {language === 'bn' ? 'মাসিক আয়' : 'Monthly Revenue'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-xl font-bold">{stats.customerRating}</div>
              <div className="text-xs text-gray-600">
                {language === 'bn' ? 'রেটিং' : 'Rating'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold">{stats.totalCustomers}</div>
              <div className="text-xs text-gray-600">
                {language === 'bn' ? 'গ্রাহক' : 'Customers'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <div className="text-xl font-bold">৳{(stats.pendingPayouts / 1000).toFixed(0)}K</div>
              <div className="text-xs text-gray-600">
                {language === 'bn' ? 'পেন্ডিং পেআউট' : 'Pending Payouts'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {language === 'bn' ? 'ওভারভিউ' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {language === 'bn' ? 'পণ্য' : 'Products'}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {language === 'bn' ? 'অর্ডার' : 'Orders'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'আজকের পারফরমেন্স' : "Today's Performance"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>{language === 'bn' ? 'নতুন অর্ডার' : 'New Orders'}</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'bn' ? 'বিক্রয়' : 'Sales'}</span>
                      <span className="font-semibold">৳15,400</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'bn' ? 'ভিজিটর' : 'Visitors'}</span>
                      <span className="font-semibold">1,284</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'অর্ডার স্ট্যাটাস' : 'Order Status'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                      </span>
                      <span>18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        {language === 'bn' ? 'প্রক্রিয়াধীন' : 'Processing'}
                      </span>
                      <span>23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        {language === 'bn' ? 'সমস্যা' : 'Issues'}
                      </span>
                      <span>2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {language === 'bn' ? 'পণ্য ব্যবস্থাপনা' : 'Product Management'}
              </h3>
              <Button>
                {language === 'bn' ? 'নতুন পণ্য যোগ করুন' : 'Add New Product'}
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  {language === 'bn' 
                    ? 'পণ্য ব্যবস্থাপনা ইন্টারফেস এখানে প্রদর্শিত হবে'
                    : 'Product management interface will be displayed here'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {language === 'bn' ? 'অর্ডার ব্যবস্থাপনা' : 'Order Management'}
              </h3>
              <Button variant="outline">
                {language === 'bn' ? 'এক্সপোর্ট' : 'Export'}
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  {language === 'bn' 
                    ? 'অর্ডার তালিকা এবং ব্যবস্থাপনা এখানে প্রদর্শিত হবে'
                    : 'Order list and management will be displayed here'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'বিক্রয় ট্রেন্ড' : 'Sales Trend'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    {language === 'bn' ? 'চার্ট এখানে প্রদর্শিত হবে' : 'Chart will be displayed here'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'গ্রাহক ইনসাইট' : 'Customer Insights'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Return Rate</span>
                        <span className="text-sm">2.3%</span>
                      </div>
                      <Progress value={2.3} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Customer Satisfaction</span>
                        <span className="text-sm">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboardHub;