
import React from 'react';
import { AllCustomersContent } from './AllCustomersContent';
import { CustomerAnalyticsContent } from './CustomerAnalyticsContent';
import { CustomerSupportContent } from './CustomerSupportContent';
import { LiveChatContent } from './LiveChatContent';
import { CustomerSegmentsContent } from './CustomerSegmentsContent';
import { VIPCustomersContent } from './VIPCustomersContent';
import { CustomerBehaviorContent } from './CustomerBehaviorContent';
import { CustomerOverviewContent } from './CustomerOverviewContent';
import { CustomerSearchContent } from './CustomerSearchContent';
import { PurchaseHistoryContent } from './PurchaseHistoryContent';
import { LoyaltyAnalysisContent } from './LoyaltyAnalysisContent';
import { CLVContent } from './CLVContent';
import { FeedbackReviewsContent } from './FeedbackReviewsContent';

interface CustomerManagementRouterProps {
  selectedSubmenu: string;
}

export const CustomerManagementRouter: React.FC<CustomerManagementRouterProps> = ({ selectedSubmenu }) => {
  console.log('🔍 CustomerManagementRouter - selectedSubmenu:', selectedSubmenu);
  
  switch (selectedSubmenu) {
    case 'all-customers':
    case 'customer-database':
      console.log('✅ Routing to AllCustomersContent');
      return <AllCustomersContent />;
    case 'customer-search':
      console.log('✅ Routing to CustomerSearchContent');
      return <CustomerSearchContent />;
    case 'customer-analytics':
    case 'customer-insights':
      console.log('✅ Routing to CustomerAnalyticsContent');
      return <CustomerAnalyticsContent />;
    case 'customer-support':
    case 'support-tickets':
      console.log('✅ Routing to CustomerSupportContent');
      return <CustomerSupportContent />;
    case 'live-chat':
      console.log('✅ Routing to LiveChatContent');
      return <LiveChatContent />;
    case 'feedback-reviews':
    case 'customer-feedback':
    case 'reviews-management':
      console.log('✅ Routing to FeedbackReviewsContent');
      return <FeedbackReviewsContent />;
    case 'customer-segments':
    case 'customer-demographics':
      console.log('✅ Routing to CustomerSegmentsContent');
      return <CustomerSegmentsContent />;
    case 'vip-customers':
      console.log('✅ Routing to VIPCustomersContent');
      return <VIPCustomersContent />;
    case 'customer-lifetime-value':
      console.log('✅ Routing to CLVContent');
      return <CLVContent />;
    case 'customer-behavior':
    case 'customer-engagement':
      console.log('✅ Routing to CustomerBehaviorContent');
      return <CustomerBehaviorContent />;
    case 'purchase-history':
      console.log('✅ Routing to PurchaseHistoryContent');
      return <PurchaseHistoryContent />;
    case 'loyalty-analysis':
      console.log('✅ Routing to LoyaltyAnalysisContent');
      return <LoyaltyAnalysisContent />;
    case 'customer-overview':
    case 'customer-retention':
    case 'customer-acquisition':
    case 'customer-satisfaction':
    default:
      console.log('✅ Routing to CustomerOverviewContent (default)');
      return <CustomerOverviewContent />;
  }
};
