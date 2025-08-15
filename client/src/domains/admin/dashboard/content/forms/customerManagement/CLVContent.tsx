
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { CLVHeader } from './clv/CLVHeader';
import { CLVStatsCards } from './clv/CLVStatsCards';
import { CLVOverviewTab } from './clv/CLVOverviewTab';
import { CustomerAnalysisTab } from './clv/CustomerAnalysisTab';
import { PredictionsTab } from './clv/PredictionsTab';
import { CampaignsTab } from './clv/CampaignsTab';
import { 
  mockCLVMetrics, 
  mockCLVTrendData, 
  mockCLVSegmentData, 
  mockCLVCustomers,
  mockCLVPredictions,
  mockCLVCampaigns,
  mockCLVAnalytics
} from './clv/mockData';

export const CLVContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  const handleRefresh = () => {
    console.log('Refreshing CLV data...');
  };

  const handleExport = () => {
    console.log('Exporting CLV data...');
  };

  return (
    <div className="space-y-6">
      <CLVHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSegment={selectedSegment}
        onSegmentChange={setSelectedSegment}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <CLVStatsCards metrics={mockCLVMetrics} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">CLV Overview</TabsTrigger>
          <TabsTrigger value="customers">Customer Analysis</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="campaigns">CLV Campaigns</TabsTrigger>
          <TabsTrigger value="insights">Advanced Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CLVOverviewTab
            trendData={mockCLVTrendData}
            segmentData={mockCLVSegmentData}
            analytics={mockCLVAnalytics}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <CustomerAnalysisTab customers={mockCLVCustomers} />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <PredictionsTab predictions={mockCLVPredictions} />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignsTab campaigns={mockCLVCampaigns} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Advanced CLV insights and machine learning analytics coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
