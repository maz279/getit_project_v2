
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { SupportHeader } from './customerSupport/SupportHeader';
import { SupportStatsCards } from './customerSupport/SupportStatsCards';
import { TicketsOverviewTab } from './customerSupport/TicketsOverviewTab';
import { AgentPerformanceTab } from './customerSupport/AgentPerformanceTab';
import { KnowledgeBaseTab } from './customerSupport/KnowledgeBaseTab';
import { 
  mockSupportTickets,
  mockSupportAgents,
  mockSupportMetrics,
  mockSupportAnalytics,
  mockKnowledgeBase
} from './customerSupport/mockData';

export const CustomerSupportContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const handleRefresh = () => {
    console.log('Refreshing support data...');
  };

  const handleExport = () => {
    console.log('Exporting support data...');
  };

  const handleCreateTicket = () => {
    console.log('Creating new ticket...');
  };

  return (
    <div className="space-y-6">
      <SupportHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onCreateTicket={handleCreateTicket}
      />

      <SupportStatsCards metrics={mockSupportMetrics} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Tickets Overview</TabsTrigger>
          <TabsTrigger value="agent-performance">Agent Performance</TabsTrigger>
          <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <TicketsOverviewTab
            tickets={mockSupportTickets}
            metrics={mockSupportMetrics}
            analytics={mockSupportAnalytics}
          />
        </TabsContent>

        <TabsContent value="agent-performance" className="space-y-4">
          <AgentPerformanceTab
            agents={mockSupportAgents}
            analytics={mockSupportAnalytics}
          />
        </TabsContent>

        <TabsContent value="knowledge-base" className="space-y-4">
          <KnowledgeBaseTab knowledgeBase={mockKnowledgeBase} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Advanced analytics and reporting features coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Support system settings and configuration coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
