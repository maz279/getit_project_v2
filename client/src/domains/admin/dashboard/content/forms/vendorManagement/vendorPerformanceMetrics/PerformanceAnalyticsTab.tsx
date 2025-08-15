
import React from 'react';
import { AnalyticsHeader } from './analytics/AnalyticsHeader';
import { PerformanceTrendsChart } from './analytics/PerformanceTrendsChart';
import { VendorComparisonChart } from './analytics/VendorComparisonChart';
import { CategoryPerformanceGrid } from './analytics/CategoryPerformanceGrid';
import { AlertsInsightsPanel } from './analytics/AlertsInsightsPanel';

export const PerformanceAnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceTrendsChart />
        <VendorComparisonChart />
      </div>
      
      <CategoryPerformanceGrid />
      
      <AlertsInsightsPanel />
    </div>
  );
};
