
import React from 'react';
import { VendorDirectoryContent } from './VendorDirectoryContent';
import { VendorAnalyticsContent } from './VendorAnalyticsContent';
import { VendorOnboardingContent } from './VendorOnboardingContent';
import { VendorVerificationContent } from './VendorVerificationContent';
import { VendorPerformanceContent } from './VendorPerformanceContent';
import { VendorSupportContent } from './VendorSupportContent';
import { VendorSearchContent } from './VendorSearchContent';
import { VendorScorecardContent } from './VendorScorecardContent';
import { VendorPaymentsContent } from './VendorPaymentsContent';
import { VendorPerformanceReportsContent } from './VendorPerformanceReportsContent';
import { VendorPerformanceMetricsContent } from './VendorPerformanceMetricsContent';
import { CommissionTrackingContent } from './CommissionTrackingContent';
import { PayoutProcessingContent } from './PayoutProcessingContent';
import { RevenueSharingContent } from './RevenueSharingContent';
import { ActiveVendorsContent } from './ActiveVendorsContent';
import { PendingApplicationsContent } from './PendingApplicationsContent';
import { SuspendedVendorsContent } from './SuspendedVendorsContent';
import { VendorVerificationContent as VendorVerificationMain } from './VendorVerificationContent';
import { NidVerificationContent } from './NidVerificationContent';
import { TinVerificationContent } from './TinVerificationContent';
import { TradeLicenseVerificationContent } from './TradeLicenseVerificationContent';
import { BankAccountVerificationContent } from './BankAccountVerificationContent';
import { DocumentReviewContent } from './DocumentReviewContent';
import { RatingManagementContent } from './RatingManagementContent';

interface VendorManagementRouterProps {
  selectedSubmenu: string;
}

export const VendorManagementRouter: React.FC<VendorManagementRouterProps> = ({ selectedSubmenu }) => {
  console.log('🔍 VendorManagementRouter - selectedSubmenu:', selectedSubmenu);
  
  switch (selectedSubmenu) {
    // Main vendor management
    case 'vendor-directory':
      console.log('✅ Routing to VendorDirectoryContent');
      return <VendorDirectoryContent />;
    case 'vendor-analytics':
      console.log('✅ Routing to VendorAnalyticsContent');
      return <VendorAnalyticsContent />;
    case 'all-vendors':
      console.log('✅ Routing to ActiveVendorsContent');
      return <ActiveVendorsContent />;
    case 'vendor-onboarding':
      console.log('✅ Routing to VendorOnboardingContent');
      return <VendorOnboardingContent />;
    case 'vendor-verification':
      console.log('✅ Routing to VendorVerificationContent');
      return <VendorVerificationMain />;
    case 'vendor-performance':
      console.log('✅ Routing to VendorPerformanceContent');
      return <VendorPerformanceContent />;
    case 'vendor-support':
      console.log('✅ Routing to VendorSupportContent');
      return <VendorSupportContent />;
    case 'vendor-search':
      console.log('✅ Routing to VendorSearchContent');
      return <VendorSearchContent />;
    case 'vendor-scorecard':
      console.log('✅ Routing to VendorScorecardContent');
      return <VendorScorecardContent />;
    
    // Vendor status management
    case 'active-vendors':
      console.log('✅ Routing to ActiveVendorsContent');
      return <ActiveVendorsContent />;
    case 'pending-applications':
      console.log('✅ Routing to PendingApplicationsContent');
      return <PendingApplicationsContent />;
    case 'suspended-vendors':
      console.log('✅ Routing to SuspendedVendorsContent');
      return <SuspendedVendorsContent />;
    
    // Verification processes
    case 'nid-verification':
      console.log('✅ Routing to NidVerificationContent');
      return <NidVerificationContent />;
    case 'tin-verification':
      console.log('✅ Routing to TinVerificationContent');
      return <TinVerificationContent />;
    case 'trade-license-verification':
      console.log('✅ Routing to TradeLicenseVerificationContent');
      return <TradeLicenseVerificationContent />;
    case 'bank-account-verification':
      console.log('✅ Routing to BankAccountVerificationContent');
      return <BankAccountVerificationContent />;
    case 'document-review':
      console.log('✅ Routing to DocumentReviewContent');
      return <DocumentReviewContent />;
    
    // Financial management - REVENUE SHARING ROUTING FIXED
    case 'vendor-payments':
      console.log('✅ Routing to VendorPaymentsContent');
      return <VendorPaymentsContent />;
    case 'commission-tracking':
      console.log('✅ Routing to CommissionTrackingContent');
      return <CommissionTrackingContent />;
    case 'payout-processing':
      console.log('✅ Routing to PayoutProcessingContent');
      return <PayoutProcessingContent />;
    case 'revenue-sharing':
      console.log('✅ FIXED: Routing to RevenueSharingContent');
      return <RevenueSharingContent />;
    
    // Performance tracking
    case 'performance-reports':
      console.log('✅ Routing to VendorPerformanceReportsContent');
      return <VendorPerformanceReportsContent />;
    case 'performance-metrics':
      console.log('✅ Routing to VendorPerformanceMetricsContent');
      return <VendorPerformanceMetricsContent />;
    
    // Rating and feedback
    case 'rating-management':
      console.log('✅ Routing to RatingManagementContent');
      return <RatingManagementContent />;
    
    default:
      console.log('⚠️ No matching route for:', selectedSubmenu, '- Routing to VendorDirectoryContent (default)');
      return <VendorDirectoryContent />;
  }
};
