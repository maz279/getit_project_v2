
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { RefreshCw, Upload } from 'lucide-react';
import { BulkActionStats } from './bulkActions/BulkActionStats';
import { OrderSelectionTable } from './bulkActions/OrderSelectionTable';
import { BulkActionForm } from './bulkActions/BulkActionForm';
import { ActionTemplates } from './bulkActions/ActionTemplates';
import { ActionHistory } from './bulkActions/ActionHistory';

export const BulkActionsContent: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Mock orders data for bulk operations
  const ordersData = [
    {
      id: 'ORD-2024-001',
      customer: 'Sarah Ahmed',
      email: 'sarah@email.com',
      phone: '+8801712345678',
      status: 'pending',
      paymentStatus: 'paid',
      total: 2850,
      items: 3,
      orderDate: '2024-01-15T10:30:00Z',
      shippingAddress: 'Dhaka, Bangladesh',
      vendor: 'Tech Store BD',
      priority: 'high',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-2024-002',
      customer: 'Mohammad Rahman',
      email: 'rahman@email.com',
      phone: '+8801823456789',
      status: 'processing',
      paymentStatus: 'paid',
      total: 1650,
      items: 2,
      orderDate: '2024-01-15T09:15:00Z',
      shippingAddress: 'Chittagong, Bangladesh',
      vendor: 'Fashion Hub',
      priority: 'medium',
      trackingNumber: 'TRK123456790'
    },
    {
      id: 'ORD-2024-003',
      customer: 'Fatima Khan',
      email: 'fatima@email.com',
      phone: '+8801934567890',
      status: 'shipped',
      paymentStatus: 'paid',
      total: 3200,
      items: 5,
      orderDate: '2024-01-14T14:20:00Z',
      shippingAddress: 'Sylhet, Bangladesh',
      vendor: 'Home Essentials',
      priority: 'low',
      trackingNumber: 'TRK123456791'
    },
    {
      id: 'ORD-2024-004',
      customer: 'Ahmed Hassan',
      email: 'ahmed@email.com',
      phone: '+8801645678901',
      status: 'delivered',
      paymentStatus: 'paid',
      total: 850,
      items: 1,
      orderDate: '2024-01-13T16:45:00Z',
      shippingAddress: 'Rajshahi, Bangladesh',
      vendor: 'Books & More',
      priority: 'medium',
      trackingNumber: 'TRK123456792'
    },
    {
      id: 'ORD-2024-005',
      customer: 'Nusrat Jahan',
      email: 'nusrat@email.com',
      phone: '+8801756789012',
      status: 'cancelled',
      paymentStatus: 'refunded',
      total: 1200,
      items: 2,
      orderDate: '2024-01-12T11:30:00Z',
      shippingAddress: 'Khulna, Bangladesh',
      vendor: 'Electronics Pro',
      priority: 'high',
      trackingNumber: ''
    }
  ];

  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;
    
    setActionInProgress(true);
    // Simulate API call
    setTimeout(() => {
      console.log(`Performing ${bulkAction} on orders:`, selectedOrders);
      setActionInProgress(false);
      setSelectedOrders([]);
      setBulkAction('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Actions</h1>
          <p className="text-gray-600 mt-1">Perform actions on multiple orders simultaneously</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Orders
          </Button>
        </div>
      </div>

      {/* Bulk Action Stats */}
      <BulkActionStats totalOrders={ordersData.length} selectedOrders={selectedOrders.length} />

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Select Orders</TabsTrigger>
          <TabsTrigger value="actions">Bulk Actions</TabsTrigger>
          <TabsTrigger value="templates">Action Templates</TabsTrigger>
          <TabsTrigger value="history">Action History</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <OrderSelectionTable
            orders={filteredOrders}
            selectedOrders={selectedOrders}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onSelectOrder={handleSelectOrder}
            onSelectAll={handleSelectAll}
            onSearchChange={setSearchQuery}
            onFilterChange={setFilterStatus}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <BulkActionForm
            selectedOrders={selectedOrders}
            bulkAction={bulkAction}
            actionInProgress={actionInProgress}
            onBulkActionChange={setBulkAction}
            onExecuteAction={handleBulkAction}
            onClearSelection={() => setSelectedOrders([])}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <ActionTemplates />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ActionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};
