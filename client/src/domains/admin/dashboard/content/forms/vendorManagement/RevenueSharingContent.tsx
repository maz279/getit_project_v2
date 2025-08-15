
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { RevenueSharingHeader } from './revenueSharing/RevenueSharingHeader';
import { RevenueSharingStatsCards } from './revenueSharing/RevenueSharingStatsCards';
import { RevenueModelsTab } from './revenueSharing/RevenueModelsTab';
import { CommissionStructureTab } from './revenueSharing/CommissionStructureTab';
import { RevenueSplitTab } from './revenueSharing/RevenueSplitTab';
import { PaymentTermsTab } from './revenueSharing/PaymentTermsTab';
import { RevenueAnalyticsTab } from './revenueSharing/RevenueAnalyticsTab';
import { RevenueForecastingTab } from './revenueSharing/RevenueForecastingTab';
import { IncentiveProgramsTab } from './revenueSharing/IncentiveProgramsTab';
import { RevenueDisputesTab } from './revenueSharing/RevenueDisputesTab';

export const RevenueSharingContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('models');

  return (
    <div className="space-y-6">
      <RevenueSharingHeader />
      <RevenueSharingStatsCards />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <RevenueModelsTab />
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <CommissionStructureTab />
        </TabsContent>

        <TabsContent value="split" className="space-y-4">
          <RevenueSplitTab />
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <PaymentTermsTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <RevenueAnalyticsTab />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <RevenueForecastingTab />
        </TabsContent>

        <TabsContent value="incentives" className="space-y-4">
          <IncentiveProgramsTab />
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          <RevenueDisputesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
