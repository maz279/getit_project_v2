
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { MessageCircle, Clock, Users, ThumbsUp, UserCheck, AlertCircle } from 'lucide-react';
import { ChatMetrics } from './types';

interface LiveChatStatsCardsProps {
  metrics: ChatMetrics;
}

export const LiveChatStatsCards: React.FC<LiveChatStatsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <MessageCircle className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.totalActiveSessions}</div>
          <div className="text-sm text-gray-500 text-center">Active Sessions</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.waitingCustomers}</div>
          <div className="text-sm text-gray-500 text-center">Waiting Queue</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Clock className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.averageWaitTime}m</div>
          <div className="text-sm text-gray-500 text-center">Avg Wait Time</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <ThumbsUp className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.customerSatisfactionRate}</div>
          <div className="text-sm text-gray-500 text-center">Satisfaction Rate</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <UserCheck className="h-6 w-6 text-indigo-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.agentsOnline}</div>
          <div className="text-sm text-gray-500 text-center">Agents Online</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Users className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.totalChatsToday}</div>
          <div className="text-sm text-gray-500 text-center">Chats Today</div>
        </CardContent>
      </Card>
    </div>
  );
};
