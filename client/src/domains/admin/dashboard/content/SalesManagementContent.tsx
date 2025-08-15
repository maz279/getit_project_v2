
import React from 'react';
import { DailySalesForm } from './forms/DailySalesForm';
import { MonthlySalesForm } from './forms/MonthlySalesForm';
import { YearlySalesForm } from './forms/YearlySalesForm';
import { SalesForecastForm } from './forms/SalesForecastForm';
import { ProfitMarginsForm } from './forms/ProfitMarginsForm';
import { SalesReportsForm } from './forms/SalesReportsForm';
import { SalesOverviewContent } from './forms/salesManagement/SalesOverviewContent';
import { RevenueAnalyticsContent } from './forms/salesManagement/RevenueAnalyticsContent';
import { SalesForecastContent } from './forms/salesManagement/SalesForecastContent';
import { RevenueDashboardContent } from './forms/salesManagement/RevenueDashboardContent';
import { ProfitMarginContent } from './forms/salesManagement/ProfitMarginContent';
import { CostAnalysisContent } from './forms/salesManagement/CostAnalysisContent';
import { ROITrackingContent } from './forms/salesManagement/ROITrackingContent';
import { DetailedReportsContent } from './forms/salesManagement/DetailedReportsContent';
import { ComparativeAnalysisContent } from './forms/salesManagement/ComparativeAnalysisContent';
import { ExportDataContent } from './forms/salesManagement/ExportDataContent';

interface SalesManagementContentProps {
  selectedSubmenu: string;
}

export const SalesManagementContent: React.FC<SalesManagementContentProps> = ({ selectedSubmenu }) => {
  console.log('🔍 SalesManagementContent - selectedSubmenu:', selectedSubmenu);
  
  const getContent = () => {
    switch (selectedSubmenu) {
      // Sales Overview
      case 'sales-overview':
      case 'sales':
      case 'overview':
        console.log('✅ Rendering SalesOverviewContent');
        return <SalesOverviewContent />;
      
      // Daily Sales
      case 'daily-sales':
        console.log('✅ Rendering DailySalesForm');
        return <DailySalesForm />;
      
      // Monthly Sales
      case 'monthly-trends':
        console.log('✅ Rendering MonthlySalesForm');
        return <MonthlySalesForm />;
      
      // Yearly Sales
      case 'yearly-reports':
        console.log('✅ Rendering YearlySalesForm');
        return <YearlySalesForm />;
      
      // Revenue Analytics
      case 'revenue-analytics':
        console.log('✅ Rendering RevenueAnalyticsContent');
        return <RevenueAnalyticsContent />;
      
      // Revenue Dashboard
      case 'revenue-dashboard':
        console.log('✅ Rendering RevenueDashboardContent');
        return <RevenueDashboardContent />;
      
      // Sales Forecast
      case 'sales-forecast':
      case 'forecast':
        console.log('✅ Rendering SalesForecastContent');
        return <SalesForecastContent />;
      
      // Profit Margins
      case 'profit-margins':
        console.log('✅ Rendering ProfitMarginContent');
        return <ProfitMarginContent />;
      
      // Cost Analysis
      case 'cost-analysis':
        console.log('✅ Rendering CostAnalysisContent');
        return <CostAnalysisContent />;
      
      // ROI Tracking
      case 'roi-tracking':
        console.log('✅ Rendering ROITrackingContent');
        return <ROITrackingContent />;
      
      // Sales Reports
      case 'sales-reports':
      case 'detailed-reports':
      case 'summary-reports':
        console.log('✅ Rendering DetailedReportsContent');
        return <DetailedReportsContent />;
      
      // Comparative Analysis
      case 'comparative-analysis':
        console.log('✅ Rendering ComparativeAnalysisContent');
        return <ComparativeAnalysisContent />;
      
      // Export Data
      case 'export-data':
        console.log('✅ Rendering ExportDataContent');
        return <ExportDataContent />;
      
      default:
        console.log('⚠️ SalesManagementContent - defaulting to sales overview for:', selectedSubmenu);
        return <SalesOverviewContent />;
    }
  };

  return (
    <div className="p-6">
      {getContent()}
    </div>
  );
};
