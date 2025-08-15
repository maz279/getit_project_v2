
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DocumentReviewHeader } from './documentReview/DocumentReviewHeader';
import { DocumentReviewStatsCards } from './documentReview/DocumentReviewStatsCards';
import { PendingDocumentsTab } from './documentReview/PendingDocumentsTab';
import { VerifiedDocumentsTab } from './documentReview/VerifiedDocumentsTab';
import { RejectedDocumentsTab } from './documentReview/RejectedDocumentsTab';
import { ComplianceOverviewTab } from './documentReview/ComplianceOverviewTab';
import { AuditTrailTab } from './documentReview/AuditTrailTab';
import { DocumentAnalyticsTab } from './documentReview/DocumentAnalyticsTab';

export const DocumentReviewContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div className="space-y-6 p-6">
      <DocumentReviewHeader />
      <DocumentReviewStatsCards />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingDocumentsTab />
        </TabsContent>

        <TabsContent value="verified">
          <VerifiedDocumentsTab />
        </TabsContent>

        <TabsContent value="rejected">
          <RejectedDocumentsTab />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceOverviewTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrailTab />
        </TabsContent>

        <TabsContent value="analytics">
          <DocumentAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
