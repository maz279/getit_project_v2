
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ActiveVendorsHeader } from './activeVendors/ActiveVendorsHeader';
import { ActiveVendorsStatsCards } from './activeVendors/ActiveVendorsStatsCards';
import { VendorsOverviewTab } from './activeVendors/VendorsOverviewTab';
import { VendorDetailsTab } from './activeVendors/VendorDetailsTab';
import { VendorAnalyticsTab } from './activeVendors/VendorAnalyticsTab';
import { VendorOnboardingTab } from './activeVendors/VendorOnboardingTab';
import { VendorSettingsTab } from './activeVendors/VendorSettingsTab';
import { 
  mockActiveVendors,
  mockVendorMetrics,
  mockVendorAnalytics
} from './activeVendors/mockData';

export const ActiveVendorsContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPerformance, setSelectedPerformance] = useState('all');

  const handleRefresh = () => {
    console.log('Refreshing active vendors data...');
  };

  const handleExport = () => {
    console.log('Exporting active vendors data...');
  };

  const handleBulkActions = () => {
    console.log('Opening bulk actions menu...');
  };

  return (
    <div className="space-y-6">
      <ActiveVendorsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPerformance={selectedPerformance}
        onPerformanceChange={setSelectedPerformance}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onBulkActions={handleBulkActions}
      />

      <ActiveVendorsStatsCards metrics={mockVendorMetrics} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vendors Overview</TabsTrigger>
          <TabsTrigger value="details">Vendor Details</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding Queue</TabsTrigger>
          <TabsTrigger value="settings">Management Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <VendorsOverviewTab vendors={mockActiveVendors} />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <VendorDetailsTab vendors={mockActiveVendors} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <VendorAnalyticsTab analytics={mockVendorAnalytics} />
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <VendorOnboardingTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <VendorSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
