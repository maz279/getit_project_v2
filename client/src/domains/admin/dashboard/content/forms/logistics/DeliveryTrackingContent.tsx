
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DeliveryHeader } from './deliveryTracking/DeliveryHeader';
import { StatsCards } from './deliveryTracking/StatsCards';
import { SearchFilters } from './deliveryTracking/SearchFilters';
import { OverviewTab } from './deliveryTracking/OverviewTab';
import { DeliveryCard } from './deliveryTracking/DeliveryCard';
import { MapTab } from './deliveryTracking/MapTab';
import { AnalyticsTab } from './deliveryTracking/AnalyticsTab';
import { mockDeliveryData } from './deliveryTracking/mockData';
import { DeliveryItem, DeliveryStats } from './deliveryTracking/types';

export const DeliveryTrackingContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);

  // Calculate stats from mock data
  const stats: DeliveryStats = {
    total: mockDeliveryData.length,
    delivered: mockDeliveryData.filter(d => d.status === 'delivered').length,
    outForDelivery: mockDeliveryData.filter(d => d.status === 'out_for_delivery').length,
    delayed: mockDeliveryData.filter(d => d.status === 'delayed').length,
    inTransit: mockDeliveryData.filter(d => d.status === 'in_transit').length,
  };

  // Filter deliveries based on search and status
  const filteredDeliveries = mockDeliveryData.filter(delivery => {
    const matchesSearch = searchTerm === '' || 
      delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (delivery: DeliveryItem) => {
    setSelectedDelivery(delivery);
    // In a real app, this might open a modal or navigate to a detail page
    console.log('Viewing details for:', delivery.trackingNumber);
  };

  return (
    <div className="space-y-6">
      <DeliveryHeader />
      
      <StatsCards stats={stats} />
      
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Live Map</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <OverviewTab deliveries={mockDeliveryData} />
        </TabsContent>

        <TabsContent value="map">
          <MapTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
