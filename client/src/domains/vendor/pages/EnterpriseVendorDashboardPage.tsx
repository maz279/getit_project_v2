/**
 * Enterprise Vendor Dashboard Page
 * Main page wrapper for the enterprise vendor dashboard
 */

import React from 'react';
import { EnterpriseVendorDashboard } from '../dashboard/enterprise/EnterpriseVendorDashboard';
import { useSEO } from '@/shared/hooks/useSEO';

const EnterpriseVendorDashboardPage: React.FC = () => {
  // For demo purposes, using a mock vendor ID
  // In a real application, this would come from authentication/routing
  const vendorId = "vendor_123";

  useSEO({
    title: 'Vendor Dashboard - GetIt Bangladesh | Enterprise Management',
    description: 'Amazon.com/Shopee.sg-level vendor dashboard with advanced analytics, product management, and Bangladesh market optimization.',
    keywords: 'vendor dashboard, seller center, amazon level, shopee level, bangladesh vendors, e-commerce management'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <EnterpriseVendorDashboard vendorId={vendorId} />
    </div>
  );
};

export default EnterpriseVendorDashboardPage;