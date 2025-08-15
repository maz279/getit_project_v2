import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { OrderManagementContent } from '@/domains/admin/dashboard/content/OrderManagementContent';

const AllOrders: React.FC = () => {
  return (
    <AdminLayout
      currentPage="All Orders"
      breadcrumbItems={[
        { label: 'Order Management', href: '/admin/orders' },
        { label: 'All Orders' }
      ]}
    >
      <OrderManagementContent selectedSubmenu="all-orders" />
    </AdminLayout>
  );
};

export default AllOrders;