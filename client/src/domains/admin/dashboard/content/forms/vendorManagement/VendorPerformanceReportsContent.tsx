
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { VendorPerformanceReportsHeader } from './vendorPerformanceReports/VendorPerformanceReportsHeader';
import { VendorPerformanceReportsStatsCards } from './vendorPerformanceReports/VendorPerformanceReportsStatsCards';
import { ReportsOverviewTab } from './vendorPerformanceReports/ReportsOverviewTab';
import { CreateReportTab } from './vendorPerformanceReports/CreateReportTab';
import { ReportsAnalyticsTab } from './vendorPerformanceReports/ReportsAnalyticsTab';
import { BenchmarksTab } from './vendorPerformanceReports/BenchmarksTab';
import { AlertsTab } from './vendorPerformanceReports/AlertsTab';

export const VendorPerformanceReportsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportStats, setReportStats] = useState({
    totalReports: 0,
    publishedReports: 0,
    draftReports: 0,
    averageRating: 0,
    activeAlerts: 0,
    topPerformers: 0
  });

  // Load initial stats
  useEffect(() => {
    // Mock data - in real implementation, fetch from API
    setReportStats({
      totalReports: 248,
      publishedReports: 186,
      draftReports: 62,
      averageRating: 4.2,
      activeAlerts: 23,
      topPerformers: 15
    });
  }, []);

  return (
    <div className="space-y-6">
      <VendorPerformanceReportsHeader />
      <VendorPerformanceReportsStatsCards stats={reportStats} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Reports Overview</TabsTrigger>
          <TabsTrigger value="create">Create Report</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReportsOverviewTab />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <CreateReportTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ReportsAnalyticsTab />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <BenchmarksTab />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
