
import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  Search,
  Crown,
  Key
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

export const RoleDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock roles data
  const rolesData = [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      userCount: 3,
      permissions: ['*'],
      level: 'system',
      lastModified: '2024-06-20',
      status: 'active',
      riskLevel: 'high'
    },
    {
      id: 2,
      name: 'Platform Admin',
      description: 'Platform-wide administration capabilities',
      userCount: 8,
      permissions: ['user_management', 'vendor_management', 'product_management', 'order_management'],
      level: 'platform',
      lastModified: '2024-06-19',
      status: 'active',
      riskLevel: 'high'
    },
    {
      id: 3,
      name: 'Category Manager',
      description: 'Manage product categories and inventory',
      userCount: 15,
      permissions: ['product_management', 'inventory_management', 'category_management'],
      level: 'departmental',
      lastModified: '2024-06-18',
      status: 'active',
      riskLevel: 'medium'
    },
    {
      id: 4,
      name: 'Customer Support',
      description: 'Handle customer inquiries and basic operations',
      userCount: 45,
      permissions: ['customer_support', 'order_view', 'ticket_management'],
      level: 'operational',
      lastModified: '2024-06-17',
      status: 'active',
      riskLevel: 'low'
    },
    {
      id: 5,
      name: 'Marketing Manager',
      description: 'Campaign and promotion management',
      userCount: 12,
      permissions: ['campaign_management', 'promotion_management', 'analytics_view'],
      level: 'departmental',
      lastModified: '2024-06-16',
      status: 'active',
      riskLevel: 'medium'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'system': return <Crown className="w-4 h-4" />;
      case 'platform': return <Shield className="w-4 h-4" />;
      case 'departmental': return <Users className="w-4 h-4" />;
      case 'operational': return <Settings className="w-4 h-4" />;
      default: return <Key className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search roles by name, description, or permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="platform">Platform</SelectItem>
                <SelectItem value="departmental">Departmental</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Role Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesData.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {getLevelIcon(role.level)}
                      </div>
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {role.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{role.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {role.permissions.includes('*') ? (
                        <Badge className="bg-red-100 text-red-800">All Permissions</Badge>
                      ) : (
                        <span>{role.permissions.length} permissions</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskColor(role.riskLevel)}>
                      {role.riskLevel} risk
                    </Badge>
                  </TableCell>
                  <TableCell>{role.lastModified}</TableCell>
                  <TableCell>
                    <Badge variant={role.status === 'active' ? 'default' : 'secondary'}>
                      {role.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
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
  );
};
