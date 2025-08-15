import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Checkbox } from '@/shared/ui/checkbox';
import { 
  Shield, Plus, Edit, Trash, Users, Lock, Key, Settings,
  FileText, ShoppingCart, Package, DollarSign, BarChart3, 
  Megaphone, UserCheck, Truck, Building2, Search
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  createdAt: string;
  isSystemRole: boolean;
}

export default function RoleManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock data - replace with API call
  const roles: Role[] = [
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      usersCount: 2,
      createdAt: '2023-01-01',
      isSystemRole: true
    },
    {
      id: '2',
      name: 'Operations Manager',
      description: 'Manage orders, vendors, and shipping operations',
      permissions: ['orders.view', 'orders.edit', 'vendors.view', 'vendors.edit', 'shipping.manage'],
      usersCount: 3,
      createdAt: '2023-01-15',
      isSystemRole: false
    },
    {
      id: '3',
      name: 'Finance Manager',
      description: 'Manage financial operations, payouts, and reports',
      permissions: ['finance.view', 'finance.edit', 'payouts.manage', 'reports.financial'],
      usersCount: 2,
      createdAt: '2023-02-01',
      isSystemRole: false
    },
    {
      id: '4',
      name: 'Customer Support',
      description: 'Handle customer queries and order issues',
      permissions: ['customers.view', 'orders.view', 'support.tickets'],
      usersCount: 5,
      createdAt: '2023-03-10',
      isSystemRole: false
    },
    {
      id: '5',
      name: 'Marketing Manager',
      description: 'Manage campaigns, promotions, and content',
      permissions: ['marketing.campaigns', 'content.manage', 'analytics.view'],
      usersCount: 2,
      createdAt: '2023-04-05',
      isSystemRole: false
    }
  ];

  const permissionGroups = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      permissions: [
        { key: 'dashboard.view', label: 'View Dashboard' },
        { key: 'dashboard.analytics', label: 'View Analytics' },
        { key: 'dashboard.reports', label: 'Generate Reports' }
      ]
    },
    {
      name: 'User Management',
      icon: Users,
      permissions: [
        { key: 'users.view', label: 'View Users' },
        { key: 'users.create', label: 'Create Users' },
        { key: 'users.edit', label: 'Edit Users' },
        { key: 'users.delete', label: 'Delete Users' },
        { key: 'users.roles', label: 'Manage Roles' }
      ]
    },
    {
      name: 'Orders',
      icon: ShoppingCart,
      permissions: [
        { key: 'orders.view', label: 'View Orders' },
        { key: 'orders.edit', label: 'Edit Orders' },
        { key: 'orders.process', label: 'Process Orders' },
        { key: 'orders.cancel', label: 'Cancel Orders' },
        { key: 'orders.refund', label: 'Process Refunds' }
      ]
    },
    {
      name: 'Products',
      icon: Package,
      permissions: [
        { key: 'products.view', label: 'View Products' },
        { key: 'products.create', label: 'Add Products' },
        { key: 'products.edit', label: 'Edit Products' },
        { key: 'products.delete', label: 'Delete Products' },
        { key: 'products.inventory', label: 'Manage Inventory' }
      ]
    },
    {
      name: 'Vendors',
      icon: Building2,
      permissions: [
        { key: 'vendors.view', label: 'View Vendors' },
        { key: 'vendors.approve', label: 'Approve Vendors' },
        { key: 'vendors.edit', label: 'Edit Vendors' },
        { key: 'vendors.kyc', label: 'Manage KYC' },
        { key: 'vendors.payouts', label: 'Manage Payouts' }
      ]
    },
    {
      name: 'Finance',
      icon: DollarSign,
      permissions: [
        { key: 'finance.view', label: 'View Finance' },
        { key: 'finance.edit', label: 'Edit Finance' },
        { key: 'payouts.manage', label: 'Manage Payouts' },
        { key: 'reports.financial', label: 'Financial Reports' }
      ]
    },
    {
      name: 'Marketing',
      icon: Megaphone,
      permissions: [
        { key: 'marketing.campaigns', label: 'Manage Campaigns' },
        { key: 'marketing.promotions', label: 'Manage Promotions' },
        { key: 'content.manage', label: 'Manage Content' },
        { key: 'analytics.view', label: 'View Analytics' }
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              Role Management
            </h1>
            <p className="text-gray-600 mt-2">Define and manage user roles and permissions</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input id="role-name" placeholder="e.g., Content Editor" />
                </div>
                <div>
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea 
                    id="role-description" 
                    placeholder="Describe the role and its responsibilities..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="mt-4 space-y-4">
                    {permissionGroups.map((group) => (
                      <Card key={group.name}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <group.icon className="h-4 w-4" />
                            {group.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {group.permissions.map((permission) => (
                            <div key={permission.key} className="flex items-center space-x-2">
                              <Checkbox id={permission.key} />
                              <Label 
                                htmlFor={permission.key} 
                                className="text-sm font-normal cursor-pointer"
                              >
                                {permission.label}
                              </Label>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">Create Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-sm text-gray-500 mt-1">2 system roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">14</div>
              <p className="text-sm text-gray-500 mt-1">Across all roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Custom Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-sm text-gray-500 mt-1">User-defined</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Last Modified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2d</div>
              <p className="text-sm text-gray-500 mt-1">Marketing Manager</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search roles by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Roles List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {role.name}
                          {role.isSystemRole && (
                            <Badge variant="secondary" className="text-xs">System</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{role.usersCount} users</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {role.permissions[0] === 'all' ? (
                        <Badge className="bg-purple-100 text-purple-800">All Permissions</Badge>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{role.permissions.length} permissions</Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">{role.createdAt}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={role.isSystemRole}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={role.isSystemRole}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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