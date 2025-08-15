/**
 * Agent Routing Admin Page - Amazon.com/Shopee.sg Level
 * Admin interface for managing smart agent routing and assignments
 */

import React from 'react';
// import { AgentRoutingDashboard } from '@/components/ai';

export default function AgentRouting() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Routing Dashboard</h1>
          <p className="text-gray-600">Manage smart agent assignment with 92% accuracy and ML optimization</p>
        </div>
        
        <AgentRoutingDashboard />
      </div>
    </div>
  );
}