import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Shield, Search, Key, Lock, Settings, Users, ShoppingCart, Package,
  DollarSign, BarChart3, Megaphone, Truck, Building2, FileText,
  AlertTriangle, Check, X, RefreshCw, Save, Filter
} from 'lucide-react';

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  module: string;
  type: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  roles: string[];
  critical: boolean;
}

export default function Permissions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  // Mock data - replace with API call
  const permissions: Permission[] = [
    // Dashboard permissions
    {
      id: '1',
      key: 'dashboard.view',
      name: 'View Dashboard',
      description: 'Access to main dashboard and overview metrics',
      module: 'Dashboard',
      type: 'view',
      roles: ['Super Admin', 'Operations Manager', 'Finance Manager'],
      critical: false
    },
    {
      id: '2',
      key: 'dashboard.analytics',
      name: 'View Analytics',
      description: 'Access to detailed analytics and reports',
      module: 'Dashboard',
      type: 'view',
      roles: ['Super Admin', 'Operations Manager'],
      critical: false
    },
    // User Management permissions
    {
      id: '3',
      key: 'users.view',
      name: 'View Users',
      description: 'View user list and details',
      module: 'Users',
      type: 'view',
      roles: ['Super Admin', 'Operations Manager'],
      critical: false
    },
    {
      id: '4',
      key: 'users.create',
      name: 'Create Users',
      description: 'Add new users to the system',
      module: 'Users',
      type: 'create',
      roles: ['Super Admin'],
      critical: true
    },
    {
      id: '5',
      key: 'users.delete',
      name: 'Delete Users',
      description: 'Remove users from the system',
      module: 'Users',
      type: 'delete',
      roles: ['Super Admin'],
      critical: true
    },
    // Orders permissions
    {
      id: '6',
      key: 'orders.view',
      name: 'View Orders',
      description: 'Access order list and details',
      module: 'Orders',
      type: 'view',
      roles: ['Super Admin', 'Operations Manager', 'Customer Support'],
      critical: false
    },
    {
      id: '7',
      key: 'orders.process',
      name: 'Process Orders',
      description: 'Update order status and manage fulfillment',
      module: 'Orders',
      type: 'manage',
      roles: ['Super Admin', 'Operations Manager'],
      critical: true
    },
    {
      id: '8',
      key: 'orders.refund',
      name: 'Process Refunds',
      description: 'Initiate and approve refunds',
      module: 'Orders',
      type: 'manage',
      roles: ['Super Admin', 'Finance Manager'],
      critical: true
    },
    // Finance permissions
    {
      id: '9',
      key: 'finance.view',
      name: 'View Finance',
      description: 'Access financial reports and metrics',
      module: 'Finance',
      type: 'view',
      roles: ['Super Admin', 'Finance Manager'],
      critical: false
    },
    {
      id: '10',
      key: 'payouts.manage',
      name: 'Manage Payouts',
      description: 'Process vendor payouts and withdrawals',
      module: 'Finance',
      type: 'manage',
      roles: ['Super Admin', 'Finance Manager'],
      critical: true
    },
    // Vendor permissions
    {
      id: '11',
      key: 'vendors.approve',
      name: 'Approve Vendors',
      description: 'Approve or reject vendor applications',
      module: 'Vendors',
      type: 'manage',
      roles: ['Super Admin', 'Operations Manager'],
      critical: true
    },
    {
      id: '12',
      key: 'vendors.kyc',
      name: 'Manage KYC',
      description: 'Review and verify vendor KYC documents',
      module: 'Vendors',
      type: 'manage',
      roles: ['Super Admin', 'Operations Manager'],
      critical: true
    }
  ];

  const modules = [
    { name: 'Dashboard', icon: BarChart3, count: 2 },
    { name: 'Users', icon: Users, count: 5 },
    { name: 'Orders', icon: ShoppingCart, count: 6 },
    { name: 'Products', icon: Package, count: 5 },
    { name: 'Vendors', icon: Building2, count: 4 },
    { name: 'Finance', icon: DollarSign, count: 4 },
    { name: 'Marketing', icon: Megaphone, count: 3 }
  ];

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      view: 'bg-blue-100 text-blue-800',
      create: 'bg-green-100 text-green-800',
      edit: 'bg-yellow-100 text-yellow-800',
      delete: 'bg-red-100 text-red-800',
      manage: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permission.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || permission.module === selectedModule;
    const matchesCritical = !showCriticalOnly || permission.critical;
    return matchesSearch && matchesModule && matchesCritical;
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-indigo-600" />
              Permission Management
            </h1>
            <p className="text-gray-600 mt-2">Configure module-wise permissions and access control</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Permissions
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Changes to permissions will take effect immediately for all users. 
            Critical permissions are marked with a red badge and require extra caution.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-sm text-gray-500 mt-1">Across all modules</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">12</div>
              <p className="text-sm text-gray-500 mt-1">Require approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-sm text-gray-500 mt-1">With permissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3d</div>
              <p className="text-sm text-gray-500 mt-1">Admin permissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="all" value={selectedModule} onValueChange={setSelectedModule}>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {modules.map(module => (
                    <TabsTrigger key={module.name} value={module.name}>
                      {module.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-[250px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="critical-only"
                      checked={showCriticalOnly}
                      onCheckedChange={setShowCriticalOnly}
                    />
                    <label htmlFor="critical-only" className="text-sm">
                      Critical only
                    </label>
                  </div>
                </div>
              </div>

              <TabsContent value={selectedModule} className="mt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Assigned Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Key className="h-4 w-4 text-gray-400" />
                              {permission.name}
                              {permission.critical && (
                                <Badge variant="destructive" className="text-xs">Critical</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{permission.description}</div>
                            <div className="text-xs text-gray-400 mt-1">Key: {permission.key}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(permission.type)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {permission.roles.map(role => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Active</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}