
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { PendingApplicationsHeader } from './pendingApplications/PendingApplicationsHeader';
import { PendingApplicationsStatsCards } from './pendingApplications/PendingApplicationsStatsCards';
import { ApplicationsOverviewTab } from './pendingApplications/ApplicationsOverviewTab';
import { ApplicationReviewTab } from './pendingApplications/ApplicationReviewTab';
import { DocumentVerificationTab } from './pendingApplications/DocumentVerificationTab';
import { mockApplicationStats, mockPendingApplications } from './pendingApplications/mockData';

export const PendingApplicationsContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <PendingApplicationsHeader />
      
      <PendingApplicationsStatsCards stats={mockApplicationStats} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Applications Overview</TabsTrigger>
          <TabsTrigger value="review">Application Review</TabsTrigger>
          <TabsTrigger value="documents">Document Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ApplicationsOverviewTab applications={mockPendingApplications} />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <ApplicationReviewTab />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentVerificationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
