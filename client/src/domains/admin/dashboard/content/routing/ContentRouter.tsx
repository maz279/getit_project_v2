
import React from 'react';
import { DashboardContent } from '../../dashboard/DashboardContent';
import { UserManagementContent } from '../UserManagementContent';
import { SalesManagementContent } from '../SalesManagementContent';
import { OrderManagementContent } from '../OrderManagementContent';
import { LogisticsContent } from '../LogisticsContent';
import { ProductManagementContent } from '../ProductManagementContent';
import { CustomerManagementContent } from '../CustomerManagementContent';
import { VendorManagementContent } from '../VendorManagementContent';
import { MarketingContent } from '../MarketingContent';
import { AnalyticsContent } from '../AnalyticsContent';
import { PaymentManagementContent } from '../PaymentManagementContent';
import { CommunicationsContent } from '../CommunicationsContent';
import { SecurityContent } from '../SecurityContent';
import { SettingsContent } from '../SettingsContent';
import { SearchContent } from '../SearchContent';
import LocalizationContent from '../LocalizationContent';

interface ContentRouterProps {
  selectedMenu: string;
  selectedSubmenu: string;
}

export const ContentRouter: React.FC<ContentRouterProps> = ({ selectedMenu, selectedSubmenu }) => {
  console.log('🔍 ContentRouter - selectedMenu:', selectedMenu, 'selectedSubmenu:', selectedSubmenu);
  
  // Normalize menu values to handle any inconsistencies
  const normalizedMenu = selectedMenu?.toString().trim().toLowerCase();
  const normalizedSubmenu = selectedSubmenu?.toString().trim().toLowerCase();
  
  console.log('🔍 Normalized values - menu:', normalizedMenu, 'submenu:', normalizedSubmenu);
  
  switch (normalizedMenu) {
    case 'dashboard':
      console.log('✅ ContentRouter routing to DashboardContent');
      return <DashboardContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'user-management':
      console.log('✅ ContentRouter routing to UserManagementContent');
      return <UserManagementContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'search':
      console.log('✅ ContentRouter routing to SearchContent');
      return <SearchContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'localization':
      console.log('✅ ContentRouter routing to LocalizationContent');
      return <LocalizationContent activeTab={normalizedSubmenu} />;
    
    case 'sales-management':
      console.log('✅ ContentRouter routing to SalesManagementContent');
      return <SalesManagementContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'order-management':
      console.log('✅ ContentRouter routing to OrderManagementContent');
      return <OrderManagementContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'logistics-management':
      console.log('✅ ContentRouter routing to LogisticsContent');
      return <LogisticsContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'product-management':
      console.log('✅ ContentRouter routing to ProductManagementContent');
      return <ProductManagementContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'customer-management':
      console.log('✅ ContentRouter routing to CustomerManagementContent');
      return <CustomerManagementContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'vendor-management':
      console.log('✅ ContentRouter routing to VendorManagementContent');
      return <VendorManagementContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'marketing':
      console.log('✅ ContentRouter routing to MarketingContent');
      return <MarketingContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'analytics':
      console.log('✅ ContentRouter routing to AnalyticsContent');
      return <AnalyticsContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'payment-management':
      console.log('✅ ContentRouter routing to PaymentManagementContent');
      return <PaymentManagementContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'communications':
      console.log('✅ ContentRouter routing to CommunicationsContent');
      return <CommunicationsContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'security':
      console.log('✅ ContentRouter routing to SecurityContent');
      return <SecurityContent selectedSubmenu={normalizedSubmenu} />;
    
    case 'settings':
      console.log('✅ ContentRouter routing to SettingsContent');
      return <SettingsContent selectedSubmenu={normalizedSubmenu} />;
    
    default:
      console.log('⚠️ ContentRouter - Unknown menu:', normalizedMenu, '- defaulting to dashboard');
      return <DashboardContent selectedSubmenu="overview" />;
  }
};
