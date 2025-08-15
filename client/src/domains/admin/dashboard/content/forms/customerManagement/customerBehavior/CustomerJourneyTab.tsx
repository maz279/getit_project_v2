
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Eye, ShoppingCart, CreditCard, MessageSquare, Search, Star } from 'lucide-react';
import { CustomerBehaviorData, BehaviorTouchpoint } from './types';

interface CustomerJourneyTabProps {
  customers: CustomerBehaviorData[];
}

export const CustomerJourneyTab: React.FC<CustomerJourneyTabProps> = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>(customers[0]?.customerId || '');

  const customer = customers.find(c => c.customerId === selectedCustomer);

  const getIconForTouchpoint = (type: BehaviorTouchpoint['type']) => {
    switch (type) {
      case 'page_view': return <Eye className="h-4 w-4" />;
      case 'product_view': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'cart_add': return <ShoppingCart className="h-4 w-4 text-orange-500" />;
      case 'purchase': return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'search': return <Search className="h-4 w-4 text-purple-500" />;
      case 'review': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'support_contact': return <MessageSquare className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getBadgeColor = (stage: string) => {
    switch (stage) {
      case 'loyal': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const journeyStages = [
    { stage: 'Discovery', percentage: 100, color: '#10B981' },
    { stage: 'Consideration', percentage: 75, color: '#3B82F6' },
    { stage: 'Purchase', percentage: 45, color: '#F59E0B' },
    { stage: 'Retention', percentage: 68, color: '#8B5CF6' },
    { stage: 'Advocacy', percentage: 32, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Journey Analysis</h3>
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.slice(0, 10).map(customer => (
              <SelectItem key={customer.customerId} value={customer.customerId}>
                {customer.name} - {customer.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {customer && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Customer Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name</span>
                    <div className="text-lg font-semibold">{customer.name}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <div>{customer.email}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer Stage</span>
                    <div>
                      <Badge className={getBadgeColor(customer.customerStage)}>
                        {customer.customerStage.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Lifetime Value</span>
                    <div className="text-lg font-semibold">৳{customer.lifetimeValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Orders</span>
                    <div className="text-lg font-semibold">{customer.totalOrders}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Avg Order Value</span>
                    <div className="text-lg font-semibold">৳{customer.averageOrderValue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Engagement Level</span>
                    <div>
                      <Badge variant={customer.engagementLevel === 'high' ? 'default' : 'secondary'}>
                        {customer.engagementLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Device Preference</span>
                    <div className="capitalize">{customer.devicePreference}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Behavior Score</span>
                    <div className="text-lg font-semibold">{customer.behaviorScore}/100</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Journey Stage Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journeyStages.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          width: `${stage.percentage}%`,
                          backgroundColor: stage.color
                        }}
                      >
                        {stage.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Touchpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.touchpoints.length > 0 ? (
                  customer.touchpoints.map((touchpoint, index) => (
                    <div key={touchpoint.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getIconForTouchpoint(touchpoint.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium capitalize">
                          {touchpoint.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {touchpoint.details.product && `Product: ${touchpoint.details.product}`}
                          {touchpoint.details.page && `Page: ${touchpoint.details.page}`}
                          {touchpoint.details.searchTerm && `Search: ${touchpoint.details.searchTerm}`}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(touchpoint.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent touchpoints available for this customer
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
