
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DeliveryPerformanceHeader } from './deliveryPerformance/DeliveryPerformanceHeader';
import { PerformanceStatsCards } from './deliveryPerformance/PerformanceStatsCards';
import { PerformanceOverviewTab } from './deliveryPerformance/PerformanceOverviewTab';
import { CourierPerformanceTab } from './deliveryPerformance/CourierPerformanceTab';
import { RegionalPerformanceTab } from './deliveryPerformance/RegionalPerformanceTab';
import { TimeAnalysisTab } from './deliveryPerformance/TimeAnalysisTab';
import { CustomerSatisfactionTab } from './deliveryPerformance/CustomerSatisfactionTab';
import { BenchmarkingTab } from './deliveryPerformance/BenchmarkingTab';
import { mockPerformanceData } from './deliveryPerformance/mockData';

export const DeliveryPerformanceContent: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedCourier, setSelectedCourier] = useState('all');

  return (
    <div className="space-y-6">
      <DeliveryPerformanceHeader />
      
      <PerformanceStatsCards stats={mockPerformanceData.stats} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="courier">🚚 Courier Performance</TabsTrigger>
          <TabsTrigger value="regional">🗺️ Regional Analysis</TabsTrigger>
          <TabsTrigger value="time">⏱️ Time Analysis</TabsTrigger>
          <TabsTrigger value="satisfaction">⭐ Customer Satisfaction</TabsTrigger>
          <TabsTrigger value="benchmarking">📈 Benchmarking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <PerformanceOverviewTab 
            data={mockPerformanceData} 
            timeRange={selectedTimeRange}
            onTimeRangeChange={setSelectedTimeRange}
          />
        </TabsContent>

        <TabsContent value="courier" className="mt-6">
          <CourierPerformanceTab 
            data={mockPerformanceData.courierPerformance}
            selectedCourier={selectedCourier}
            onCourierChange={setSelectedCourier}
          />
        </TabsContent>

        <TabsContent value="regional" className="mt-6">
          <RegionalPerformanceTab data={mockPerformanceData.regionalPerformance} />
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <TimeAnalysisTab data={mockPerformanceData.timeAnalysis} />
        </TabsContent>

        <TabsContent value="satisfaction" className="mt-6">
          <CustomerSatisfactionTab data={mockPerformanceData.customerSatisfaction} />
        </TabsContent>

        <TabsContent value="benchmarking" className="mt-6">
          <BenchmarkingTab data={mockPerformanceData.benchmarking} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
