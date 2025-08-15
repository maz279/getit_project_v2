
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { NidVerificationHeader } from './nidVerification/NidVerificationHeader';
import { NidVerificationStatsCards } from './nidVerification/NidVerificationStatsCards';
import { PendingNidTab } from './nidVerification/PendingNidTab';
import { VerifiedNidTab } from './nidVerification/VerifiedNidTab';
import { ExpiredNidTab } from './nidVerification/ExpiredNidTab';
import { IdentityComplianceTab } from './nidVerification/IdentityComplianceTab';
import { BiometricVerificationTab } from './nidVerification/BiometricVerificationTab';
import { NidAnalyticsTab } from './nidVerification/NidAnalyticsTab';

export const NidVerificationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="space-y-6 p-6">
      <NidVerificationHeader />
      <NidVerificationStatsCards />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="verified">Verified NIDs</TabsTrigger>
          <TabsTrigger value="expired">Expired/Issues</TabsTrigger>
          <TabsTrigger value="compliance">Identity Compliance</TabsTrigger>
          <TabsTrigger value="biometric">Biometric Verify</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingNidTab />
        </TabsContent>

        <TabsContent value="verified">
          <VerifiedNidTab />
        </TabsContent>

        <TabsContent value="expired">
          <ExpiredNidTab />
        </TabsContent>

        <TabsContent value="compliance">
          <IdentityComplianceTab />
        </TabsContent>

        <TabsContent value="biometric">
          <BiometricVerificationTab />
        </TabsContent>

        <TabsContent value="analytics">
          <NidAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
