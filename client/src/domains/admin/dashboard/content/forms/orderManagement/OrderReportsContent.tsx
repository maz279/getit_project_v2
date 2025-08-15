
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { OrderReportsHeader } from './orderReports/OrderReportsHeader';
import { ReportsStatsCards } from './orderReports/ReportsStatsCards';
import { SalesReportsTab } from './orderReports/SalesReportsTab';
import { OrderAnalyticsTab } from './orderReports/OrderAnalyticsTab';
import { CustomerInsightsTab } from './orderReports/CustomerInsightsTab';
import { ProductPerformanceTab } from './orderReports/ProductPerformanceTab';
import { GeographicAnalysisTab } from './orderReports/GeographicAnalysisTab';
import { TrendAnalysisTab } from './orderReports/TrendAnalysisTab';
import { ExportReportsTab } from './orderReports/ExportReportsTab';
import { mockOrderReportsData } from './orderReports/mockData';

export const OrderReportsContent: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedRegion, setSelectedRegion] = useState('all');

  return (
    <div className="space-y-6">
      <OrderReportsHeader />
      
      <ReportsStatsCards data={mockOrderReportsData.stats} />

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="sales">📊 Sales Reports</TabsTrigger>
          <TabsTrigger value="analytics">📈 Order Analytics</TabsTrigger>
          <TabsTrigger value="customers">👥 Customer Insights</TabsTrigger>
          <TabsTrigger value="products">📦 Product Performance</TabsTrigger>
          <TabsTrigger value="geographic">🗺️ Geographic Analysis</TabsTrigger>
          <TabsTrigger value="trends">📉 Trend Analysis</TabsTrigger>
          <TabsTrigger value="export">💾 Export Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <SalesReportsTab 
            data={mockOrderReportsData.salesReports} 
            timeRange={selectedTimeRange}
            onTimeRangeChange={setSelectedTimeRange}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <OrderAnalyticsTab data={mockOrderReportsData.orderAnalytics} />
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomerInsightsTab data={mockOrderReportsData.customerInsights} />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductPerformanceTab data={mockOrderReportsData.productPerformance} />
        </TabsContent>

        <TabsContent value="geographic" className="mt-6">
          <GeographicAnalysisTab 
            data={mockOrderReportsData.geographicAnalysis}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
          />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <TrendAnalysisTab data={mockOrderReportsData.trendAnalysis} />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ExportReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
