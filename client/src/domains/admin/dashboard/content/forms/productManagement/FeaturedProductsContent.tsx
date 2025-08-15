
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { FeaturedProductsHeader } from './featuredProducts/FeaturedProductsHeader'; 
import { FeaturedStatsCards } from './featuredProducts/FeaturedStatsCards';
import { FeaturedManagementTab } from './featuredProducts/FeaturedManagementTab';
import { FeaturedAnalyticsTab } from './featuredProducts/FeaturedAnalyticsTab';
import { FeaturedCampaignsTab } from './featuredProducts/FeaturedCampaignsTab';
import { FeaturedSettingsTab } from './featuredProducts/FeaturedSettingsTab';
import { mockFeaturedProductsData } from './featuredProducts/mockData';

export const FeaturedProductsContent: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState(mockFeaturedProductsData.featuredProducts);
  const [campaigns, setCampaigns] = useState(mockFeaturedProductsData.campaigns);

  const handleProductToggle = (productId: string) => {
    setFeaturedProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, isFeatured: !product.isFeatured }
          : product
      )
    );
  };

  const handleCampaignUpdate = (campaignId: string, updates: any) => {
    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, ...updates }
          : campaign
      )
    );
  };

  return (
    <div className="space-y-6">
      <FeaturedProductsHeader />
      
      <FeaturedStatsCards stats={mockFeaturedProductsData.stats} />

      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="management">⭐ Featured Management</TabsTrigger>
          <TabsTrigger value="analytics">📊 Performance Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">🎯 Featured Campaigns</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Featured Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="mt-6">
          <FeaturedManagementTab 
            featuredProducts={featuredProducts}
            onProductToggle={handleProductToggle}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <FeaturedAnalyticsTab 
            analytics={mockFeaturedProductsData.analytics}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <FeaturedCampaignsTab 
            campaigns={campaigns}
            onCampaignUpdate={handleCampaignUpdate}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <FeaturedSettingsTab 
            settings={mockFeaturedProductsData.settings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
