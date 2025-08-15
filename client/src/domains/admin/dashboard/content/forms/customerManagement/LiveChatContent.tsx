
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { LiveChatHeader } from './liveChat/LiveChatHeader';
import { LiveChatStatsCards } from './liveChat/LiveChatStatsCards';
import { ChatSessionsTab } from './liveChat/ChatSessionsTab';
import { AgentDashboardTab } from './liveChat/AgentDashboardTab';
import { ChatAnalyticsTab } from './liveChat/ChatAnalyticsTab';
import { ChatSettingsTab } from './liveChat/ChatSettingsTab';
import { 
  mockChatSessions,
  mockChatAgents,
  mockChatMetrics,
  mockChatAnalytics,
  mockChatSettings
} from './liveChat/mockData';

export const LiveChatContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');

  const handleRefresh = () => {
    console.log('Refreshing live chat data...');
  };

  const handleExport = () => {
    console.log('Exporting chat data...');
  };

  return (
    <div className="space-y-6">
      <LiveChatHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedAgent={selectedAgent}
        onAgentChange={setSelectedAgent}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <LiveChatStatsCards metrics={mockChatMetrics} />

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Chat Sessions</TabsTrigger>
          <TabsTrigger value="agents">Agent Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Chat Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <ChatSessionsTab
            sessions={mockChatSessions}
            metrics={mockChatMetrics}
            searchQuery={searchQuery}
            selectedStatus={selectedStatus}
          />
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <AgentDashboardTab
            agents={mockChatAgents}
            sessions={mockChatSessions}
            analytics={mockChatAnalytics}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <ChatAnalyticsTab analytics={mockChatAnalytics} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ChatSettingsTab settings={mockChatSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
