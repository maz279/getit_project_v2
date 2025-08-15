
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { VendorPerformanceMetricsHeader } from './vendorPerformanceMetrics/VendorPerformanceMetricsHeader';
import { VendorPerformanceStatsCards } from './vendorPerformanceMetrics/VendorPerformanceStatsCards';
import { PerformanceOverviewTab } from './vendorPerformanceMetrics/PerformanceOverviewTab';
import { PerformanceBenchmarksTab } from './vendorPerformanceMetrics/PerformanceBenchmarksTab';
import { PerformanceAnalyticsTab } from './vendorPerformanceMetrics/PerformanceAnalyticsTab';
import { 
  mockPerformanceStats, 
  mockVendorMetrics, 
  mockBenchmarks
} from './vendorPerformanceMetrics/mockData';

interface VendorPerformanceMetricsContentProps {
  selectedSubmenu?: string;
}

export const VendorPerformanceMetricsContent: React.FC<VendorPerformanceMetricsContentProps> = ({ selectedSubmenu }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Set the active tab based on the selected submenu
  useEffect(() => {
    console.log('🎯 VendorPerformanceMetricsContent - selectedSubmenu:', selectedSubmenu);
    
    if (selectedSubmenu) {
      // Map submenu values to tab values - focused on performance metrics only
      const submenuToTabMap: { [key: string]: string } = {
        'performance-metrics': 'overview',
        'vendor-performance-metrics': 'overview',
        'performance-dashboard': 'overview',
        'performance-analysis': 'analytics',
        'vendor-kpi': 'benchmarks',
        'performance-benchmarks': 'benchmarks',
        'performance-trends': 'analytics',
        'performance-reporting': 'analytics',
        'performance-monitoring': 'overview',
        'performance-improvement': 'benchmarks',
        'performance-alerts': 'analytics'
      };

      const targetTab = submenuToTabMap[selectedSubmenu] || 'overview';
      console.log('🎯 Setting active tab to:', targetTab);
      setActiveTab(targetTab);
    }
  }, [selectedSubmenu]);

  return (
    <div className="space-y-6">
      <VendorPerformanceMetricsHeader />
      <VendorPerformanceStatsCards stats={mockPerformanceStats} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks & KPIs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PerformanceOverviewTab metrics={mockVendorMetrics} />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <PerformanceBenchmarksTab benchmarks={mockBenchmarks} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PerformanceAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
