
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { VendorScorecardHeader } from './vendorScorecard/VendorScorecardHeader';
import { ScorecardStatsCards } from './vendorScorecard/ScorecardStatsCards';
import { VendorEvaluationTab } from './vendorScorecard/VendorEvaluationTab';
import { RatingSystemTab } from './vendorScorecard/RatingSystemTab';
import { AssessmentFormsTab } from './vendorScorecard/AssessmentFormsTab';
import { ComplianceTrackingTab } from './vendorScorecard/ComplianceTrackingTab';
import { mockScorecardStats } from './vendorScorecard/mockData';

export const VendorScorecardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('evaluation');

  return (
    <div className="space-y-6">
      <VendorScorecardHeader />
      <ScorecardStatsCards stats={mockScorecardStats} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evaluation">Vendor Evaluation</TabsTrigger>
          <TabsTrigger value="rating">Rating System</TabsTrigger>
          <TabsTrigger value="assessment">Assessment Forms</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluation" className="space-y-6">
          <VendorEvaluationTab />
        </TabsContent>

        <TabsContent value="rating" className="space-y-6">
          <RatingSystemTab />
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <AssessmentFormsTab />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceTrackingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
