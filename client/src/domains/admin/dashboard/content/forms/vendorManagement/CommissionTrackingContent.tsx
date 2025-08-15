
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { CommissionTrackingHeader } from './commissionTracking/CommissionTrackingHeader';
import { CommissionTrackingStatsCards } from './commissionTracking/CommissionTrackingStatsCards';
import { CommissionsOverviewTab } from './commissionTracking/CommissionsOverviewTab';
import { CommissionRatesTab } from './commissionTracking/CommissionRatesTab';
import { PayoutsTab } from './commissionTracking/PayoutsTab';
import { AnalyticsTab } from './commissionTracking/AnalyticsTab';
import { DisputesTab } from './commissionTracking/DisputesTab';
import { CommissionManagementTab } from './commissionTracking/CommissionManagementTab';

export const CommissionTrackingContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <div className="space-y-6">
      <CommissionTrackingHeader />
      <CommissionTrackingStatsCards />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rates">Rates</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management" className="mt-6">
          <CommissionManagementTab />
        </TabsContent>
        
        <TabsContent value="overview" className="mt-6">
          <CommissionsOverviewTab />
        </TabsContent>
        
        <TabsContent value="rates" className="mt-6">
          <CommissionRatesTab />
        </TabsContent>
        
        <TabsContent value="payouts" className="mt-6">
          <PayoutsTab />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab />
        </TabsContent>
        
        <TabsContent value="disputes" className="mt-6">
          <DisputesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
