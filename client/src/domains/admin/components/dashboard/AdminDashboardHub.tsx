/**
 * Amazon.com/Shopee.sg-Level Admin Dashboard Hub
 * Consolidates system management, analytics, and administrative controls
 * Implements enterprise-grade admin portal with comprehensive oversight
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Shield, 
  Users, 
  Store, 
  Package, 
  DollarSign, 
  BarChart3,
  Settings,
  AlertTriangle,
  TrendingUp,
  Globe,
  Database,
  Cpu
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalRevenue: number;
  systemLoad: number;
  databaseHealth: number;
  activeIssues: number;
}

interface AdminDashboardHubProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const AdminDashboardHub: React.FC<AdminDashboardHubProps> = ({
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 125000,
    totalVendors: 2450,
    totalProducts: 98500,
    totalRevenue: 15200000,
    systemLoad: 67,
    databaseHealth: 98,
    activeIssues: 3
  });

  return (
    <div className={`admin-dashboard-hub ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
              </h1>
              <p className="text-gray-600">
                {language === 'bn' 
                  ? 'সিস্টেম ওভারভিউ এবং প্ল্যাটফর্ম ব্যবস্থাপনা'
                  : 'System overview and platform management'}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={`${stats.activeIssues > 0 ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                {stats.activeIssues > 0 
                  ? `${stats.activeIssues} Issues` 
                  : 'All Systems Operational'}
              </Badge>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">System Load</div>
                  <div className="text-2xl font-bold">{stats.systemLoad}%</div>
                </div>
                <Cpu className="w-8 h-8 text-blue-600" />
              </div>
              <Progress value={stats.systemLoad} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">DB Health</div>
                  <div className="text-2xl font-bold">{stats.databaseHealth}%</div>
                </div>
                <Database className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={stats.databaseHealth} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Revenue (BDT)</div>
                  <div className="text-2xl font-bold">৳{(stats.totalRevenue / 100000).toFixed(1)}L</div>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Active Issues</div>
                  <div className="text-2xl font-bold">{stats.activeIssues}</div>
                </div>
                <AlertTriangle className={`w-8 h-8 ${stats.activeIssues > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold">{(stats.totalUsers / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-600">
                {language === 'bn' ? 'মোট ব্যবহারকারী' : 'Total Users'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Store className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-xl font-bold">{stats.totalVendors.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {language === 'bn' ? 'মোট বিক্রেতা' : 'Total Vendors'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold">{(stats.totalProducts / 1000).toFixed(0)}K</div>
              <div className="text-sm text-gray-600">
                {language === 'bn' ? 'মোট পণ্য' : 'Total Products'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Globe className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold">64</div>
              <div className="text-sm text-gray-600">
                {language === 'bn' ? 'জেলা কভারেজ' : 'Districts Covered'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {language === 'bn' ? 'ওভারভিউ' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {language === 'bn' ? 'ব্যবহারকারী' : 'Users'}
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              {language === 'bn' ? 'বিক্রেতা' : 'Vendors'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics'}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {language === 'bn' ? 'সেটিংস' : 'Settings'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {language === 'bn' ? 'সিস্টেম নিরাপত্তা' : 'System Security'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Firewall Status</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>SSL Certificate</span>
                      <Badge className="bg-green-500 text-white">Valid</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Security Scan</span>
                      <span className="text-sm text-gray-600">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'সাম্প্রতিক কার্যকলাপ' : 'Recent Activity'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium">New vendor registration</div>
                      <div className="text-gray-500">2 minutes ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">System backup completed</div>
                      <div className="text-gray-500">1 hour ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Performance alert resolved</div>
                      <div className="text-gray-500">3 hours ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {language === 'bn' ? 'ব্যবহারকারী ব্যবস্থাপনা' : 'User Management'}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  {language === 'bn' ? 'এক্সপোর্ট' : 'Export'}
                </Button>
                <Button>
                  {language === 'bn' ? 'নতুন ব্যবহারকারী' : 'New User'}
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  {language === 'bn' 
                    ? 'ব্যবহারকারী তালিকা এবং ব্যবস্থাপনা এখানে প্রদর্শিত হবে'
                    : 'User list and management interface will be displayed here'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {language === 'bn' ? 'বিক্রেতা ব্যবস্থাপনা' : 'Vendor Management'}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  {language === 'bn' ? 'অনুমোদন পেন্ডিং' : 'Pending Approvals'}
                </Button>
                <Button>
                  {language === 'bn' ? 'নতুন বিক্রেতা' : 'New Vendor'}
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  {language === 'bn' 
                    ? 'বিক্রেতা তালিকা এবং ব্যবস্থাপনা এখানে প্রদর্শিত হবে'
                    : 'Vendor list and management interface will be displayed here'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'প্ল্যাটফর্ম গ্রোথ' : 'Platform Growth'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    {language === 'bn' ? 'গ্রোথ চার্ট এখানে প্রদর্শিত হবে' : 'Growth chart will be displayed here'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'রাজস্ব বিশ্লেষণ' : 'Revenue Analysis'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Monthly Growth</span>
                        <span className="text-sm font-medium text-green-600">+19.5%</span>
                      </div>
                      <Progress value={19.5} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Vendor Commission</span>
                        <span className="text-sm font-medium">৳2.1L</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Platform Fee</span>
                        <span className="text-sm font-medium">৳890K</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'সিস্টেম কনফিগারেশন' : 'System Configuration'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'পেমেন্ট সেটিংস' : 'Payment Settings'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'শিপিং কনফিগারেশন' : 'Shipping Configuration'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'ট্যাক্স সেটিংস' : 'Tax Settings'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'নিরাপত্তা সেটিংস' : 'Security Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'অ্যাক্সেস কন্ট্রোল' : 'Access Control'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'এপিআই সিকিউরিটি' : 'API Security'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'ব্যাকআপ সেটিংস' : 'Backup Settings'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardHub;