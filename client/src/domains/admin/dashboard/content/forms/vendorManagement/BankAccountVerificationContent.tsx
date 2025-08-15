
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { BankAccountVerificationHeader } from './bankAccountVerification/BankAccountVerificationHeader';
import { BankAccountVerificationStatsCards } from './bankAccountVerification/BankAccountVerificationStatsCards';
import { PendingBankAccountsTab } from './bankAccountVerification/PendingBankAccountsTab';
import { VerifiedBankAccountsTab } from './bankAccountVerification/VerifiedBankAccountsTab';
import { RejectedBankAccountsTab } from './bankAccountVerification/RejectedBankAccountsTab';
import { FraudDetectionTab } from './bankAccountVerification/FraudDetectionTab';
import { ComplianceMonitoringTab } from './bankAccountVerification/ComplianceMonitoringTab';
import { BankingAnalyticsTab } from './bankAccountVerification/BankingAnalyticsTab';

export const BankAccountVerificationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="space-y-6 p-6">
      <BankAccountVerificationHeader />
      <BankAccountVerificationStatsCards />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="verified">Verified Accounts</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Accounts</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingBankAccountsTab />
        </TabsContent>

        <TabsContent value="verified">
          <VerifiedBankAccountsTab />
        </TabsContent>

        <TabsContent value="rejected">
          <RejectedBankAccountsTab />
        </TabsContent>

        <TabsContent value="fraud">
          <FraudDetectionTab />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceMonitoringTab />
        </TabsContent>

        <TabsContent value="analytics">
          <BankingAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
