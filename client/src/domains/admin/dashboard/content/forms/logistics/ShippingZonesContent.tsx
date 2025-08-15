
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ShippingZonesHeader } from './shippingZones/ShippingZonesHeader';
import { ZoneStatsCards } from './shippingZones/ZoneStatsCards';
import { ZoneManagementTab } from './shippingZones/ZoneManagementTab';
import { RatesConfigTab } from './shippingZones/RatesConfigTab';
import { CoverageMapTab } from './shippingZones/CoverageMapTab';
import { ZoneAnalyticsTab } from './shippingZones/ZoneAnalyticsTab';
import { mockZoneData } from './shippingZones/mockData';
import { ShippingZone, ZoneStats } from './shippingZones/types';

export const ShippingZonesContent: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate stats from mock data
  const stats: ZoneStats = {
    totalZones: mockZoneData.length,
    activeZones: mockZoneData.filter(z => z.status === 'active').length,
    inactiveZones: mockZoneData.filter(z => z.status === 'inactive').length,
    pendingZones: mockZoneData.filter(z => z.status === 'pending').length,
    totalCoverage: mockZoneData.reduce((acc, zone) => acc + zone.coverageArea, 0),
  };

  // Filter zones based on search and status
  const filteredZones = mockZoneData.filter(zone => {
    const matchesSearch = searchTerm === '' || 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.cities.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || zone.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleZoneSelect = (zone: ShippingZone) => {
    setSelectedZone(zone);
    console.log('Selected zone:', zone.name);
  };

  return (
    <div className="space-y-6">
      <ShippingZonesHeader />
      
      <ZoneStatsCards stats={stats} />

      <Tabs defaultValue="zones" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="zones">Zone Management</TabsTrigger>
          <TabsTrigger value="rates">Rates & Pricing</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Map</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="zones">
          <ZoneManagementTab 
            zones={filteredZones}
            onZoneSelect={handleZoneSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </TabsContent>

        <TabsContent value="rates">
          <RatesConfigTab zones={mockZoneData} selectedZone={selectedZone} />
        </TabsContent>

        <TabsContent value="coverage">
          <CoverageMapTab zones={mockZoneData} />
        </TabsContent>

        <TabsContent value="analytics">
          <ZoneAnalyticsTab zones={mockZoneData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
