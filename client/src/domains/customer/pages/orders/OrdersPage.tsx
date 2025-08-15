import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/common/Layout/MainLayout';
import { Button } from '@/components/common/UI/Button/Button';
import { SearchInput } from '@/components/common/UI/Input/Input';
import { LoadingSpinner, SkeletonCard } from '@/components/common/UI/Loading/Loading';
import { Alert } from '@/components/common/UI/Alert/Alert';
import { Modal } from '@/components/common/UI/Modal/Modal';
import { cn } from "@/lib/utils";

// OrdersPage - Amazon.com/Shopee.sg Level Order Management
export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    // Simulate loading orders
    setTimeout(() => {
      setOrders(generateOrdersData());
      setLoading(false);
    }, 1000);
  }, []);

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
    { id: 'returned', label: 'Returned', count: orders.filter(o => o.status === 'returned').length }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-1">Track and manage your orders</p>
              </div>
              <div className="flex gap-3">
                <SearchInput
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Orders
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={cn(
                    "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                    activeFilter === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <OrdersLoadingSkeleton />
          ) : filteredOrders.length === 0 ? (
            <EmptyOrdersState activeFilter={activeFilter} searchQuery={searchQuery} />
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order}
                  onTrackOrder={() => {
                    setSelectedOrder(order);
                    setShowTrackingModal(true);
                  }}
                  onReturnOrder={() => {
                    setSelectedOrder(order);
                    setShowReturnModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tracking Modal */}
        {showTrackingModal && (
          <OrderTrackingModal 
            order={selectedOrder}
            onClose={() => setShowTrackingModal(false)}
          />
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <OrderReturnModal 
            order={selectedOrder}
            onClose={() => setShowReturnModal(false)}
          />
        )}
      </div>
    </MainLayout>
  );
};

// Generate Orders Data
const generateOrdersData = () => {
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];
  const items = [
    { name: 'Wireless Headphones', price: 4500, quantity: 1, image: '/order-item-1.jpg' },
    { name: 'Smart Watch', price: 12000, quantity: 1, image: '/order-item-2.jpg' },
    { name: 'Phone Case', price: 800, quantity: 2, image: '/order-item-3.jpg' },
    { name: 'Bluetooth Speaker', price: 3200, quantity: 1, image: '/order-item-4.jpg' },
    { name: 'USB Cable', price: 450, quantity: 3, image: '/order-item-5.jpg' }
  ];

  return Array.from({ length: 15 }, (_, index) => {
    const orderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const orderItems = items.slice(0, Math.floor(Math.random() * 3) + 1);
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      id: `ORD-2024-${String(index + 1).padStart(3, '0')}`,
      orderNumber: `GetIt-${Date.now()}-${index}`,
      date: orderDate.toISOString().split('T')[0],
      status: status,
      items: orderItems,
      subtotal: subtotal,
      shipping: status === 'cancelled' ? 0 : 120,
      tax: Math.floor(subtotal * 0.15),
      total: status === 'cancelled' ? 0 : subtotal + 120 + Math.floor(subtotal * 0.15),
      paymentMethod: ['bKash', 'Nagad', 'Rocket', 'Card', 'COD'][Math.floor(Math.random() * 5)],
      shippingAddress: {
        name: 'Ahmed Rahman',
        address: 'House 15, Road 8, Dhanmondi, Dhaka',
        phone: '+8801712345678'
      },
      vendor: `Vendor ${Math.floor(Math.random() * 5) + 1}`,
      trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
      estimatedDelivery: status === 'shipped' ? new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      canCancel: status === 'pending' || status === 'confirmed',
      canReturn: status === 'delivered' && (Date.now() - orderDate.getTime()) < 7 * 24 * 60 * 60 * 1000,
      canTrack: status === 'shipped' || status === 'delivered',
      tracking: generateTrackingData(status)
    };
  });
};

// Generate Tracking Data
const generateTrackingData = (status) => {
  const events = [
    { status: 'Order Placed', description: 'Your order has been placed successfully', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), completed: true },
    { status: 'Order Confirmed', description: 'Your order has been confirmed by the vendor', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), completed: true },
    { status: 'Preparing for Shipment', description: 'Your order is being prepared for shipment', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completed: status !== 'pending' && status !== 'confirmed' },
    { status: 'Shipped', description: 'Your order has been shipped', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: status === 'shipped' || status === 'delivered' },
    { status: 'Out for Delivery', description: 'Your order is out for delivery', timestamp: new Date(), completed: status === 'delivered' },
    { status: 'Delivered', description: 'Your order has been delivered', timestamp: new Date(), completed: status === 'delivered' }
  ];

  return events.filter(event => {
    if (status === 'pending') return event.status === 'Order Placed';
    if (status === 'confirmed') return ['Order Placed', 'Order Confirmed'].includes(event.status);
    if (status === 'shipped') return !['Out for Delivery', 'Delivered'].includes(event.status);
    return true;
  });
};

// Orders Loading Skeleton
const OrdersLoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonCard key={index} className="h-48" />
      ))}
    </div>
  );
};

// Empty Orders State
const EmptyOrdersState = ({ activeFilter, searchQuery }) => {
  return (
    <div className="text-center py-16">
      <div className="mx-auto h-48 w-48 text-gray-400 mb-6">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21l3-3 3 3" />
        </svg>
      </div>
      
      {searchQuery ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            No orders match your search for "{searchQuery}"
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Clear Search
          </Button>
        </div>
      ) : activeFilter === 'all' ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">
            Start shopping to see your orders here
          </p>
          <Button onClick={() => window.location.href = '/products'}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeFilter} orders</h3>
          <p className="text-gray-500 mb-6">
            You don't have any {activeFilter} orders at the moment
          </p>
          <Button variant="outline" onClick={() => setActiveFilter('all')}>
            View All Orders
          </Button>
        </div>
      )}
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, onTrackOrder, onReturnOrder }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Order Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
              <span>Placed on {new Date(order.date).toLocaleDateString()}</span>
              <span>•</span>
              <span>Total: ৳{order.total.toLocaleString()}</span>
              <span>•</span>
              <span>Payment: {order.paymentMethod}</span>
              <span>•</span>
              <span>Vendor: {order.vendor}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              getStatusColor(order.status)
            )}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {order.trackingNumber && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Tracking:</span> {order.trackingNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <div className="text-sm text-gray-600">
                  Quantity: {item.quantity} • ৳{item.price.toLocaleString()} each
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-start">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>৳{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span>৳{order.shipping.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span>৳{order.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
              <span>Total:</span>
              <span>৳{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {order.canTrack && (
              <Button variant="outline" size="sm" onClick={onTrackOrder}>
                Track Order
              </Button>
            )}
            {order.canReturn && (
              <Button variant="outline" size="sm" onClick={onReturnOrder}>
                Return
              </Button>
            )}
            {order.canCancel && (
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                Cancel
              </Button>
            )}
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button variant="outline" size="sm">
              Reorder
            </Button>
          </div>
        </div>

        {/* Estimated Delivery */}
        {order.estimatedDelivery && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium text-blue-900">Estimated Delivery:</span>
              <span className="text-blue-700 ml-2">
                {new Date(order.estimatedDelivery).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Order Tracking Modal
const OrderTrackingModal = ({ order, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Track Your Order" size="lg">
      <div className="space-y-6">
        {/* Order Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Order ID:</span>
              <span className="ml-2 text-gray-600">{order.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Tracking Number:</span>
              <span className="ml-2 text-gray-600">{order.trackingNumber}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Estimated Delivery:</span>
              <span className="ml-2 text-gray-600">
                {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Shipping Address:</span>
              <span className="ml-2 text-gray-600">{order.shippingAddress.address}</span>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="space-y-4">
          {order.tracking.map((event, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                event.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              )}>
                {event.completed ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className={cn(
                  "font-medium",
                  event.completed ? "text-gray-900" : "text-gray-500"
                )}>
                  {event.status}
                </div>
                <div className="text-sm text-gray-600">{event.description}</div>
                {event.completed && (
                  <div className="text-xs text-gray-500 mt-1">
                    {event.timestamp.toLocaleDateString()} at {event.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Contact Support</Button>
        </div>
      </div>
    </Modal>
  );
};

// Order Return Modal
const OrderReturnModal = ({ order, onClose }) => {
  const [returnReason, setReturnReason] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnDescription, setReturnDescription] = useState('');

  const returnReasons = [
    'Product damaged/defective',
    'Wrong item received',
    'Not as described',
    'Size/fit issues',
    'Changed mind',
    'Quality issues',
    'Other'
  ];

  const handleItemToggle = (index) => {
    setSelectedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Return Request" size="lg">
      <div className="space-y-6">
        {/* Order Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
          <div className="text-sm text-gray-600">
            <div>Order ID: {order.id}</div>
            <div>Order Date: {new Date(order.date).toLocaleDateString()}</div>
            <div>Total: ৳{order.total.toLocaleString()}</div>
          </div>
        </div>

        {/* Select Items */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Select items to return</h4>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(index)}
                  onChange={() => handleItemToggle(index)}
                  className="rounded"
                />
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    Qty: {item.quantity} • ৳{item.price.toLocaleString()} each
                  </div>
                </div>
                <div className="font-semibold text-gray-900">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Return Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for return
          </label>
          <select
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a reason</option>
            {returnReasons.map((reason) => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional details (optional)
          </label>
          <textarea
            value={returnDescription}
            onChange={(e) => setReturnDescription(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide any additional details about your return request..."
          />
        </div>

        {/* Return Policy */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Return Policy</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Returns accepted within 7 days of delivery</li>
            <li>• Items must be in original condition</li>
            <li>• Refund will be processed within 5-7 business days</li>
            <li>• Return shipping may be charged for certain reasons</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            disabled={selectedItems.length === 0 || !returnReason}
            onClick={() => {
              Alert.success('Return request submitted successfully');
              onClose();
            }}
          >
            Submit Return Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrdersPage;