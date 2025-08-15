
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { TinVerificationHeader } from './tinVerification/TinVerificationHeader';
import { TinVerificationStatsCards } from './tinVerification/TinVerificationStatsCards';
import { PendingTinTab } from './tinVerification/PendingTinTab';
import { VerifiedTinTab } from './tinVerification/VerifiedTinTab';
import { ExpiredTinTab } from './tinVerification/ExpiredTinTab';
import { TaxComplianceTab } from './tinVerification/TaxComplianceTab';
import { TinAnalyticsTab } from './tinVerification/TinAnalyticsTab';
import { TaxAuthorityTab } from './tinVerification/TaxAuthorityTab';

export const TinVerificationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="space-y-6 p-6">
      <TinVerificationHeader />
      <TinVerificationStatsCards />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="verified">Verified TINs</TabsTrigger>
          <TabsTrigger value="expired">Expired/Issues</TabsTrigger>
          <TabsTrigger value="compliance">Tax Compliance</TabsTrigger>
          <TabsTrigger value="authority">Tax Authorities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingTinTab />
        </TabsContent>

        <TabsContent value="verified">
          <VerifiedTinTab />
        </TabsContent>

        <TabsContent value="expired">
          <ExpiredTinTab />
        </TabsContent>

        <TabsContent value="compliance">
          <TaxComplianceTab />
        </TabsContent>

        <TabsContent value="authority">
          <TaxAuthorityTab />
        </TabsContent>

        <TabsContent value="analytics">
          <TinAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
