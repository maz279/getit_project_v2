
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Star, Package, CreditCard, MapPin, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { PurchaseHistoryData } from './types';

interface CustomerDetailsTabProps {
  customers: PurchaseHistoryData[];
}

export const CustomerDetailsTab: React.FC<CustomerDetailsTabProps> = ({ customers }) => {
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'diamond': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {customers.map((customer) => (
        <Card key={customer.customerId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={customer.avatar} alt={customer.customerName} />
                  <AvatarFallback>{customer.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{customer.customerName}</span>
                    <Badge className={getTierColor(customer.membershipTier)}>
                      {customer.membershipTier}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{customer.customerEmail}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">৳{customer.totalSpent.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Spent</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Purchase Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-600">{customer.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-600">৳{customer.averageOrderValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Avg Order Value</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-purple-600">{customer.loyaltyPoints.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Loyalty Points</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-orange-600">{(customer.returnRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Return Rate</div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Purchase Preferences</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Favorite Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customer.favoriteCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Payment Methods:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customer.paymentMethods.map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Delivery Preference:</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {customer.deliveryPreference}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Customer Journey</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">First Purchase:</span>
                    <span className="text-sm font-medium">{new Date(customer.firstPurchaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Purchase:</span>
                    <span className="text-sm font-medium">{new Date(customer.lastPurchaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lifetime Value:</span>
                    <span className="text-sm font-bold text-green-600">৳{customer.customerLifetimeValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button variant="outline" size="sm">View All Orders</Button>
              <Button variant="outline" size="sm">Contact Customer</Button>
              <Button variant="outline" size="sm">Send Promotion</Button>
              <Button variant="outline" size="sm">Generate Report</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
