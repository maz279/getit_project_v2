
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { PerformanceMetricsHeader } from './performanceMetrics/PerformanceMetricsHeader';
import { PerformanceMetricsCards } from './performanceMetrics/PerformanceMetricsCards';
import { PerformanceOverviewTab } from './performanceMetrics/PerformanceOverviewTab';
import { mockPerformanceMetricsData } from './performanceMetrics/mockData';

export const PerformanceMetricsContent: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [selectedMetricType, setSelectedMetricType] = useState('all');

  return (
    <div className="space-y-6">
      <PerformanceMetricsHeader />
      
      <PerformanceMetricsCards 
        processingMetrics={mockPerformanceMetricsData.processingMetrics}
        operationalKPIs={mockPerformanceMetricsData.operationalKPIs}
        qualityMetrics={mockPerformanceMetricsData.qualityMetrics}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="operational">⚙️ Operational</TabsTrigger>
          <TabsTrigger value="quality">🎯 Quality</TabsTrigger>
          <TabsTrigger value="teams">👥 Teams</TabsTrigger>
          <TabsTrigger value="compliance">📋 Compliance</TabsTrigger>
          <TabsTrigger value="alerts">🚨 Alerts</TabsTrigger>
          <TabsTrigger value="reports">📈 Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <PerformanceOverviewTab 
            trends={mockPerformanceMetricsData.trends}
            benchmarks={mockPerformanceMetricsData.benchmarks}
          />
        </TabsContent>

        <TabsContent value="operational" className="mt-6">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Operational KPIs</h3>
            <p className="text-gray-600">Detailed operational performance metrics and analysis</p>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="mt-6">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Quality Metrics</h3>
            <p className="text-gray-600">Quality control metrics and performance indicators</p>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Team Performance</h3>
            <p className="text-gray-600">Individual and team performance analytics</p>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Compliance Metrics</h3>
            <p className="text-gray-600">Regulatory compliance and audit metrics</p>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Performance Alerts</h3>
            <p className="text-gray-600">Real-time alerts and notifications</p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Performance Reports</h3>
            <p className="text-gray-600">Detailed performance reports and analytics</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
