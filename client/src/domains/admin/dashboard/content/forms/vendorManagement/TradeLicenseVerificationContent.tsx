
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { TradeLicenseHeader } from './tradeLicense/TradeLicenseHeader';
import { TradeLicenseStatsCards } from './tradeLicense/TradeLicenseStatsCards';
import { PendingLicensesTab } from './tradeLicense/PendingLicensesTab';
import { VerifiedLicensesTab } from './tradeLicense/VerifiedLicensesTab';
import { ExpiredLicensesTab } from './tradeLicense/ExpiredLicensesTab';
import { LicenseComplianceTab } from './tradeLicense/LicenseComplianceTab';
import { LicenseAnalyticsTab } from './tradeLicense/LicenseAnalyticsTab';
import { RegulatoryOverviewTab } from './tradeLicense/RegulatoryOverviewTab';

export const TradeLicenseVerificationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="space-y-6 p-6">
      <TradeLicenseHeader />
      <TradeLicenseStatsCards />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingLicensesTab />
        </TabsContent>

        <TabsContent value="verified">
          <VerifiedLicensesTab />
        </TabsContent>

        <TabsContent value="expired">
          <ExpiredLicensesTab />
        </TabsContent>

        <TabsContent value="compliance">
          <LicenseComplianceTab />
        </TabsContent>

        <TabsContent value="regulatory">
          <RegulatoryOverviewTab />
        </TabsContent>

        <TabsContent value="analytics">
          <LicenseAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
