import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { OrderManagementContent } from '@/domains/admin/dashboard/content/OrderManagementContent';

const ShippingManagement: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Shipping & Logistics"
      breadcrumbItems={[
        { label: 'Order Management', href: '/admin/orders' },
        { label: 'Shipping & Logistics' }
      ]}
    >
      <OrderManagementContent selectedSubmenu="shipping-logistics" />
    </AdminLayout>
  );
};

export default ShippingManagement;