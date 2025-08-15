
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { PurchaseHistoryHeader } from './purchaseHistory/PurchaseHistoryHeader';
import { PurchaseHistoryStatsCards } from './purchaseHistory/PurchaseHistoryStatsCards';
import { PurchaseOverviewTab } from './purchaseHistory/PurchaseOverviewTab';
import { CustomerDetailsTab } from './purchaseHistory/CustomerDetailsTab';
import { OrderHistoryTab } from './purchaseHistory/OrderHistoryTab';
import { 
  mockPurchaseHistoryData, 
  mockPurchaseAnalytics 
} from './purchaseHistory/mockData';

export const PurchaseHistoryContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleRefresh = () => {
    console.log('Refreshing purchase history data...');
  };

  const handleExport = () => {
    console.log('Exporting purchase history data...');
  };

  // Filter customers based on search and other criteria
  const filteredCustomers = mockPurchaseHistoryData.filter(customer => {
    const matchesSearch = customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.orders.some(order => 
                           order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.items.some(item => 
                             item.productName.toLowerCase().includes(searchQuery.toLowerCase())
                           )
                         );
    
    // Add more filtering logic based on timeframe and status if needed
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PurchaseHistoryHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <PurchaseHistoryStatsCards analytics={mockPurchaseAnalytics} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Analytics Overview</TabsTrigger>
          <TabsTrigger value="customers">Customer Details</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="insights">Purchase Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PurchaseOverviewTab analytics={mockPurchaseAnalytics} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <CustomerDetailsTab customers={filteredCustomers} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrderHistoryTab customers={filteredCustomers} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Advanced purchase insights and recommendations coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
