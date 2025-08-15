
import React from 'react';
import { Button } from '@/shared/ui/button';
import { QuickStatsCards } from './overview/QuickStatsCards';
import { OverviewCharts } from './overview/OverviewCharts';
import { QuickActionsForm } from './overview/QuickActionsForm';
import { RecentActivityPanel } from './overview/RecentActivityPanel';
import { Download, FileText, Settings } from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600 text-lg">Welcome to your comprehensive admin dashboard</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Last updated: {new Date().toLocaleString()}</span>
            <span>•</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live Data
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Quick Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Key Performance Metrics</h2>
          <p className="text-gray-600 text-sm">Real-time overview of your platform's performance</p>
        </div>
        <QuickStatsCards />
      </section>

      {/* Charts Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Analytics Overview</h2>
          <p className="text-gray-600 text-sm">Visual insights into sales trends and category performance</p>
        </div>
        <OverviewCharts />
      </section>

      {/* Quick Actions and Data Entry Forms */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Quick Actions & Data Entry</h2>
          <p className="text-gray-600 text-sm">Streamlined tools for common administrative tasks</p>
        </div>
        <QuickActionsForm />
      </section>

      {/* Recent Activity Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Activity & Performance</h2>
          <p className="text-gray-600 text-sm">Live updates and performance metrics across your platform</p>
        </div>
        <RecentActivityPanel />
      </section>
    </div>
  );
};
