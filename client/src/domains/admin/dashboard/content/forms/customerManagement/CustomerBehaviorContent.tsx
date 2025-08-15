
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { BehaviorHeader } from './customerBehavior/BehaviorHeader';
import { BehaviorStatsCards } from './customerBehavior/BehaviorStatsCards';
import { BehaviorOverviewTab } from './customerBehavior/BehaviorOverviewTab';
import { CustomerJourneyTab } from './customerBehavior/CustomerJourneyTab';
import { PersonalizationTab } from './customerBehavior/PersonalizationTab';
import { AlertsTab } from './customerBehavior/AlertsTab';
import { 
  mockCustomerBehaviorData, 
  mockBehaviorSegments, 
  mockBehaviorMetrics, 
  mockPersonalizationInsights,
  mockBehaviorAlerts 
} from './customerBehavior/mockData';

export const CustomerBehaviorContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [alerts, setAlerts] = useState(mockBehaviorAlerts);

  const handleRefresh = () => {
    console.log('Refreshing behavior data...');
  };

  const handleExport = () => {
    console.log('Exporting behavior data...');
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleTakeAction = (alertId: string, action: string) => {
    console.log(`Taking action: ${action} for alert: ${alertId}`);
  };

  // Filter customers based on search and segment
  const filteredCustomers = mockCustomerBehaviorData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = selectedSegment === 'all' || 
                          (selectedSegment === 'high_value' && customer.lifetimeValue > 20000) ||
                          (selectedSegment === 'at_risk' && customer.riskLevel === 'high') ||
                          (selectedSegment === 'new_customers' && customer.customerStage === 'new');
    
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-6">
      <BehaviorHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSegment={selectedSegment}
        onSegmentChange={setSelectedSegment}
      />

      <BehaviorStatsCards metrics={mockBehaviorMetrics} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="journey">Customer Journey</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="insights">ML Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <BehaviorOverviewTab 
            metrics={mockBehaviorMetrics} 
            segments={mockBehaviorSegments} 
          />
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <CustomerJourneyTab customers={filteredCustomers} />
        </TabsContent>

        <TabsContent value="personalization" className="space-y-4">
          <PersonalizationTab insights={mockPersonalizationInsights} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsTab 
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
            onTakeAction={handleTakeAction}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Advanced ML insights coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
