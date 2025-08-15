
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { LoyaltyAnalysisHeader } from './loyaltyAnalysis/LoyaltyAnalysisHeader';
import { LoyaltyStatsCards } from './loyaltyAnalysis/LoyaltyStatsCards';
import { LoyaltyOverviewTab } from './loyaltyAnalysis/LoyaltyOverviewTab';
import { MemberManagementTab } from './loyaltyAnalysis/MemberManagementTab';
import { RewardsManagementTab } from './loyaltyAnalysis/RewardsManagementTab';
import { CampaignManagementTab } from './loyaltyAnalysis/CampaignManagementTab';
import { 
  mockLoyaltyAnalytics, 
  mockLoyaltyMembers, 
  mockLoyaltyRewards,
  mockLoyaltyCampaigns
} from './loyaltyAnalysis/mockData';

export const LoyaltyAnalysisContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');

  const handleRefresh = () => {
    console.log('Refreshing loyalty analysis data...');
  };

  const handleExport = () => {
    console.log('Exporting loyalty analysis data...');
  };

  return (
    <div className="space-y-6">
      <LoyaltyAnalysisHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedProgram={selectedProgram}
        onProgramChange={setSelectedProgram}
        selectedTier={selectedTier}
        onTierChange={setSelectedTier}
      />

      <LoyaltyStatsCards analytics={mockLoyaltyAnalytics} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Program Overview</TabsTrigger>
          <TabsTrigger value="members">Member Management</TabsTrigger>
          <TabsTrigger value="rewards">Rewards Catalog</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Management</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <LoyaltyOverviewTab analytics={mockLoyaltyAnalytics} />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <MemberManagementTab members={mockLoyaltyMembers} />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <RewardsManagementTab rewards={mockLoyaltyRewards} />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignManagementTab campaigns={mockLoyaltyCampaigns} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Advanced loyalty analytics and predictive insights coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
