
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { SuspendedVendorsHeader } from './suspendedVendors/SuspendedVendorsHeader';
import { SuspendedVendorsStatsCards } from './suspendedVendors/SuspendedVendorsStatsCards';
import { SuspendedVendorsOverviewTab } from './suspendedVendors/SuspendedVendorsOverviewTab';
import { ReinstatementRequestsTab } from './suspendedVendors/ReinstatementRequestsTab';
import { mockSuspendedVendors, mockSuspendedVendorStats, mockReinstatementRequests } from './suspendedVendors/mockData';

export const SuspendedVendorsContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <SuspendedVendorsHeader />
      
      <SuspendedVendorsStatsCards stats={mockSuspendedVendorStats} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Suspended Vendors</TabsTrigger>
          <TabsTrigger value="reinstatement">Reinstatement Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
          <TabsTrigger value="policies">Suspension Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SuspendedVendorsOverviewTab vendors={mockSuspendedVendors} />
        </TabsContent>

        <TabsContent value="reinstatement" className="space-y-6">
          <ReinstatementRequestsTab requests={mockReinstatementRequests} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">Suspension analytics and reporting features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Suspension Policies</h3>
            <p className="text-gray-600">Policy management and configuration features coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
