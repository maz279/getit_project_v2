
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Package, Truck, CheckCircle, XCircle, Clock, RotateCcw, Eye, Download } from 'lucide-react';
import { PurchaseHistoryData } from './types';

interface OrderHistoryTabProps {
  customers: PurchaseHistoryData[];
}

export const OrderHistoryTab: React.FC<OrderHistoryTabProps> = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'returned': return <RotateCcw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const allOrders = customers.flatMap(customer => 
    customer.orders.map(order => ({
      ...order,
      customerName: customer.customerName,
      customerTier: customer.membershipTier
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredOrders = selectedCustomer === 'all' 
    ? allOrders 
    : allOrders.filter(order => customers.find(c => c.customerName === selectedCustomer)?.orders.some(o => o.id === order.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order History</h3>
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.customerId} value={customer.customerName}>
                {customer.customerName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{order.customerName}</span>
                      <span>•</span>
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                      {order.trackingNumber && (
                        <>
                          <span>•</span>
                          <span>Track: {order.trackingNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                  <div className="text-right">
                    <div className="text-xl font-bold">৳{order.total.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{order.items.length} items</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">
                          {item.brand} • {item.category} • SKU: {item.sku}
                        </div>
                        {item.variant && (
                          <div className="text-sm text-gray-500">{item.variant}</div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Qty: {item.quantity}</div>
                        <div className="text-sm text-gray-500">৳{item.unitPrice.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">৳{item.totalPrice.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{item.vendorName}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600">
                      <div>{order.shippingAddress.name}</div>
                      <div>{order.shippingAddress.street}</div>
                      <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                      <div>{order.shippingAddress.zipCode}, {order.shippingAddress.country}</div>
                      {order.shippingAddress.phone && <div>Phone: {order.shippingAddress.phone}</div>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>৳{order.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>৳{order.shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>৳{order.tax.toLocaleString()}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-৳{order.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-1">
                        <span>Total:</span>
                        <span>৳{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download Invoice
                  </Button>
                  {order.canReturn && (
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Process Return
                    </Button>
                  )}
                  {order.canReorder && (
                    <Button variant="outline" size="sm">
                      <Package className="h-4 w-4 mr-1" />
                      Reorder Items
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
