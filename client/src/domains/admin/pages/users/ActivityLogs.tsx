import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { 
  FileText, Search, Filter, Download, RefreshCw, Calendar, Clock,
  User, Shield, Key, Edit, Trash, Plus, Check, X, AlertTriangle,
  LogIn, LogOut, Settings, CreditCard, Package, ShoppingCart
} from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');

  // Mock data - replace with API call
  const activityLogs: ActivityLog[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'User Login',
      module: 'Authentication',
      details: 'Successful login from Chrome browser',
      ipAddress: '103.95.98.123',
      userAgent: 'Chrome/120.0 Windows',
      timestamp: '2 minutes ago',
      status: 'success',
      severity: 'low'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Rafiqul Islam',
      userRole: 'Operations Manager',
      action: 'Order Status Update',
      module: 'Orders',
      details: 'Changed order #12345 status from Processing to Shipped',
      ipAddress: '203.76.118.45',
      userAgent: 'Firefox/121.0 Windows',
      timestamp: '15 minutes ago',
      status: 'success',
      severity: 'medium'
    },
    {
      id: '3',
      userId: '3',
      userName: 'Fatema Begum',
      userRole: 'Finance Manager',
      action: 'Payout Processed',
      module: 'Finance',
      details: 'Processed vendor payout of ৳25,000 to Vendor #234',
      ipAddress: '123.49.41.67',
      userAgent: 'Safari/17.1 MacOS',
      timestamp: '1 hour ago',
      status: 'success',
      severity: 'high'
    },
    {
      id: '4',
      userId: '4',
      userName: 'Unknown User',
      userRole: 'N/A',
      action: 'Failed Login Attempt',
      module: 'Authentication',
      details: 'Multiple failed login attempts detected',
      ipAddress: '185.220.101.45',
      userAgent: 'Unknown',
      timestamp: '2 hours ago',
      status: 'failed',
      severity: 'critical'
    },
    {
      id: '5',
      userId: '1',
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'User Deleted',
      module: 'Users',
      details: 'Deleted user account: test@example.com',
      ipAddress: '103.95.98.123',
      userAgent: 'Chrome/120.0 Windows',
      timestamp: '3 hours ago',
      status: 'warning',
      severity: 'high'
    },
    {
      id: '6',
      userId: '5',
      userName: 'Nasreen Akter',
      userRole: 'Marketing Manager',
      action: 'Campaign Created',
      module: 'Marketing',
      details: 'Created new campaign: Winter Sale 2025',
      ipAddress: '45.127.248.92',
      userAgent: 'Edge/120.0 Windows',
      timestamp: '4 hours ago',
      status: 'success',
      severity: 'low'
    },
    {
      id: '7',
      userId: '2',
      userName: 'Rafiqul Islam',
      userRole: 'Operations Manager',
      action: 'KYC Approved',
      module: 'Vendors',
      details: 'Approved KYC documents for Fashion Hub BD',
      ipAddress: '203.76.118.45',
      userAgent: 'Firefox/121.0 Windows',
      timestamp: '5 hours ago',
      status: 'success',
      severity: 'medium'
    },
    {
      id: '8',
      userId: '1',
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'Role Permissions Updated',
      module: 'Permissions',
      details: 'Modified permissions for Finance Manager role',
      ipAddress: '103.95.98.123',
      userAgent: 'Chrome/120.0 Windows',
      timestamp: '6 hours ago',
      status: 'warning',
      severity: 'critical'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="outline" className="text-gray-600">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-blue-600">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="text-orange-600">High</Badge>;
      case 'critical':
        return <Badge variant="outline" className="text-red-600 border-red-300">Critical</Badge>;
      default:
        return null;
    }
  };

  const getActionIcon = (module: string) => {
    switch (module) {
      case 'Authentication':
        return <Key className="h-4 w-4" />;
      case 'Orders':
        return <ShoppingCart className="h-4 w-4" />;
      case 'Finance':
        return <CreditCard className="h-4 w-4" />;
      case 'Users':
        return <User className="h-4 w-4" />;
      case 'Marketing':
        return <Settings className="h-4 w-4" />;
      case 'Vendors':
        return <Shield className="h-4 w-4" />;
      case 'Permissions':
        return <Key className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-600" />
              Activity Logs
            </h1>
            <p className="text-gray-600 mt-2">Monitor user activities and system events</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-sm text-gray-500 mt-1">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">14</div>
              <p className="text-sm text-gray-500 mt-1">In last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Failed Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">23</div>
              <p className="text-sm text-gray-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">5</div>
              <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by user, action, or details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="vendors">Vendors</SelectItem>
                  <SelectItem value="permissions">Permissions</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{log.timestamp}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{log.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{log.userName}</div>
                          <div className="text-xs text-gray-500">{log.userRole}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.module)}
                        <div>
                          <div className="font-medium text-sm">{log.action}</div>
                          <div className="text-xs text-gray-500">{log.module}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{log.userAgent}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{log.ipAddress}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}