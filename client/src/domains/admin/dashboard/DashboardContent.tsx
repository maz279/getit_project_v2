
import React, { useState, useEffect } from 'react';
import { 
  RevenueAnalytics, 
  UserActivity,
  InventoryAlertsSection,
  SecurityMonitoringSection,
  SystemLogsSection,
  VendorPerformanceSection,
  OrderInsightsSection,
  PlatformPerformanceSection,
  SystemHealthSection,
  QuickActionsSection,
  ExecutiveSummarySection
} from './sections';
import { EnhancedOverviewDashboard } from './sections/enhanced/EnhancedOverviewDashboard';
import { AnalyticsDashboard } from './sections/AnalyticsDashboard';
import { KPIMonitoringDashboard } from './sections/KPIMonitoringDashboard';
import { PerformanceInsightsDashboard } from './sections/PerformanceInsightsDashboard';
import { RealtimeMetricsSection } from './sections/RealtimeMetricsSection';

interface DashboardContentProps {
  selectedSubmenu: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ selectedSubmenu }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    console.log('=== DashboardContent Debug Info ===');
    console.log('Received selectedSubmenu prop:', selectedSubmenu);
    console.log('Type of selectedSubmenu:', typeof selectedSubmenu);
    console.log('selectedSubmenu length:', selectedSubmenu?.length);
    console.log('JSON.stringify selectedSubmenu:', JSON.stringify(selectedSubmenu));
    console.log('=================================');
  }, [selectedSubmenu]);

  const getContent = () => {
    console.log('🔍 DashboardContent getContent - selectedSubmenu:', selectedSubmenu);
    
    // Normalize the submenu value to handle any whitespace or case issues
    const normalizedSubmenu = selectedSubmenu?.toString().trim().toLowerCase();
    console.log('🔍 Normalized submenu:', normalizedSubmenu);
    
    switch (normalizedSubmenu) {
      case 'overview':
        console.log('✅ Rendering EnhancedOverviewDashboard');
        return <EnhancedOverviewDashboard />;
      
      case 'analytics':
        console.log('✅ Rendering AnalyticsDashboard');
        return <AnalyticsDashboard />;
      
      case 'reports':
        console.log('✅ Rendering ExecutiveSummarySection for reports');
        return <ExecutiveSummarySection />;
      
      case 'metrics':
      case 'real-time-metrics':
      case 'realtime-metrics':
        console.log('✅ Rendering RealtimeMetricsSection');
        return <RealtimeMetricsSection />;
      
      case 'kpi-monitoring':
      case 'kpi_monitoring':
        console.log('✅ Rendering KPIMonitoringDashboard');
        return <KPIMonitoringDashboard />;
      
      case 'performance-insights':
      case 'performance_insights':
        console.log('✅ Rendering PerformanceInsightsDashboard');
        return <PerformanceInsightsDashboard />;
      
      case 'revenue-analytics':
        console.log('✅ Rendering RevenueAnalytics');
        return <RevenueAnalytics 
          selectedTimeRange={selectedTimeRange}
          setSelectedTimeRange={setSelectedTimeRange}
        />;
      
      case 'user-activity':
        console.log('✅ Rendering UserActivity');
        return <UserActivity />;
      
      case 'vendor-performance':
        console.log('✅ Rendering VendorPerformanceSection');
        return <VendorPerformanceSection />;
      
      case 'order-insights':
        console.log('✅ Rendering OrderInsightsSection');
        return <OrderInsightsSection />;
      
      case 'inventory-alerts':
        console.log('✅ Rendering InventoryAlertsSection');
        return <InventoryAlertsSection />;
      
      case 'platform-performance':
        console.log('✅ Rendering PlatformPerformanceSection');
        return <PlatformPerformanceSection />;
      
      case 'system-health':
        console.log('✅ Rendering SystemHealthSection');
        return <SystemHealthSection />;
      
      case 'security-monitoring':
        console.log('✅ Rendering SecurityMonitoringSection');
        return <SecurityMonitoringSection />;
      
      case 'system-logs':
        console.log('✅ Rendering SystemLogsSection');
        return <SystemLogsSection />;
      
      case 'quick-actions':
        console.log('✅ Rendering QuickActionsSection');
        return <QuickActionsSection />;
      
      case 'executive-summary':
        console.log('✅ Rendering ExecutiveSummarySection');
        return <ExecutiveSummarySection />;
      
      default:
        console.log('⚠️ DashboardContent - no matching submenu found for:', normalizedSubmenu);
        console.log('⚠️ Available submenus should include: overview, analytics, reports, metrics, etc.');
        console.log('⚠️ Falling back to EnhancedOverviewDashboard');
        return <EnhancedOverviewDashboard />;
    }
  };

  return (
    <div>
      {getContent()}
    </div>
  );
};
