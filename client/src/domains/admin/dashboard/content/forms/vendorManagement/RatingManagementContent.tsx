
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { RatingManagementHeader } from './ratingManagement/RatingManagementHeader';
import { RatingStatsCards } from './ratingManagement/RatingStatsCards';
import { RatingOverviewTab } from './ratingManagement/RatingOverviewTab';
import { RatingModerationTab } from './ratingManagement/RatingModerationTab';
import { RatingAnalyticsTab } from './ratingManagement/RatingAnalyticsTab';
import { RatingPoliciesTab } from './ratingManagement/RatingPoliciesTab';
import { RatingDisputesTab } from './ratingManagement/RatingDisputesTab';
import { mockRatingStats } from './ratingManagement/mockData';

export const RatingManagementContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <RatingManagementHeader />
      <RatingStatsCards stats={mockRatingStats} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Rating Overview</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RatingOverviewTab />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <RatingModerationTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RatingAnalyticsTab />
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <RatingDisputesTab />
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <RatingPoliciesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
