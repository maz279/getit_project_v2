
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Plus, Eye, Edit } from 'lucide-react';
import { VIPCustomer, NewCustomer } from './types';

interface CustomersTabProps {
  filteredCustomers: VIPCustomer[];
  newCustomer: NewCustomer;
  onNewCustomerChange: (customer: NewCustomer) => void;
  onAddCustomer: () => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  filteredCustomers,
  newCustomer,
  onNewCustomerChange,
  onAddCustomer
}) => {
  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond': return 'bg-purple-100 text-purple-800';
      case 'platinum': return 'bg-cyan-100 text-cyan-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>VIP Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifetime Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Shopper</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getTierBadgeColor(customer.tier)}>
                        {customer.tier}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.lifetimeValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.personalShopper}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.lastOrder || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New VIP Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                type="text" 
                id="name" 
                value={newCustomer.name} 
                onChange={(e) => onNewCustomerChange({...newCustomer, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                type="email" 
                id="email" 
                value={newCustomer.email} 
                onChange={(e) => onNewCustomerChange({...newCustomer, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                type="tel" 
                id="phone" 
                value={newCustomer.phone} 
                onChange={(e) => onNewCustomerChange({...newCustomer, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="tier">VIP Tier</Label>
              <Select value={newCustomer.tier} onValueChange={(value) => onNewCustomerChange({...newCustomer, tier: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="personalShopper">Personal Shopper</Label>
              <Select value={newCustomer.personalShopper} onValueChange={(value) => onNewCustomerChange({...newCustomer, personalShopper: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign shopper" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="emma-wilson">Emma Wilson</SelectItem>
                  <SelectItem value="james-smith">James Smith</SelectItem>
                  <SelectItem value="lisa-anderson">Lisa Anderson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={onAddCustomer} className="w-fit">
            <Plus className="h-4 w-4 mr-2" />
            Add VIP Customer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
