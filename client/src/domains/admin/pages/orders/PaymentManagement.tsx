import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { OrderManagementContent } from '@/domains/admin/dashboard/content/OrderManagementContent';

const PaymentManagement: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Payment Management"
      breadcrumbItems={[
        { label: 'Order Management', href: '/admin/orders' },
        { label: 'Payment Management' }
      ]}
    >
      <OrderManagementContent selectedSubmenu="payment-management" />
    </AdminLayout>
  );
};

export default PaymentManagement;