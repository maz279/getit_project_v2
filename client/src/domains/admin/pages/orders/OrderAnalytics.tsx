import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { OrderManagementContent } from '@/domains/admin/dashboard/content/OrderManagementContent';

const OrderAnalytics: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Order Analytics"
      breadcrumbItems={[
        { label: 'Order Management', href: '/admin/orders' },
        { label: 'Order Analytics' }
      ]}
    >
      <OrderManagementContent selectedSubmenu="order-analytics" />
    </AdminLayout>
  );
};

export default OrderAnalytics;