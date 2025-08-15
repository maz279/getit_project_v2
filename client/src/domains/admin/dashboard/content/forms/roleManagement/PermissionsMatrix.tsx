
import React from 'react';
import { Key, Database, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';

export const PermissionsMatrix: React.FC = () => {
  // Permission categories
  const permissionCategories = [
    {
      category: 'User Management',
      permissions: [
        { name: 'user_create', label: 'Create Users', description: 'Add new users to the system' },
        { name: 'user_edit', label: 'Edit Users', description: 'Modify user information' },
        { name: 'user_delete', label: 'Delete Users', description: 'Remove users from system' },
        { name: 'user_view', label: 'View Users', description: 'Access user information' },
        { name: 'role_assign', label: 'Assign Roles', description: 'Assign roles to users' }
      ]
    },
    {
      category: 'Product Management',
      permissions: [
        { name: 'product_create', label: 'Create Products', description: 'Add new products' },
        { name: 'product_edit', label: 'Edit Products', description: 'Modify product details' },
        { name: 'product_delete', label: 'Delete Products', description: 'Remove products' },
        { name: 'inventory_manage', label: 'Manage Inventory', description: 'Control stock levels' },
        { name: 'pricing_manage', label: 'Manage Pricing', description: 'Set product prices' }
      ]
    },
    {
      category: 'Order Management',
      permissions: [
        { name: 'order_view', label: 'View Orders', description: 'Access order information' },
        { name: 'order_process', label: 'Process Orders', description: 'Handle order fulfillment' },
        { name: 'order_cancel', label: 'Cancel Orders', description: 'Cancel customer orders' },
        { name: 'refund_process', label: 'Process Refunds', description: 'Handle refund requests' }
      ]
    },
    {
      category: 'Financial',
      permissions: [
        { name: 'financial_view', label: 'View Financials', description: 'Access financial reports' },
        { name: 'payment_manage', label: 'Manage Payments', description: 'Handle payment processing' },
        { name: 'commission_manage', label: 'Manage Commissions', description: 'Control vendor commissions' }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Permission Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionCategories.map((category, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              {category.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.permissions.map((permission, permIndex) => (
                <div key={permIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{permission.label}</p>
                    <p className="text-sm text-gray-600">{permission.description}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
