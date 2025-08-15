import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { ProductManagementContent } from '@/domains/admin/dashboard/content/ProductManagementContent';

const InventoryManagement: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Inventory Management"
      breadcrumbItems={[
        { label: 'Product Management', href: '/admin/products' },
        { label: 'Inventory Management' }
      ]}
    >
      <ProductManagementContent selectedSubmenu="inventory-management" />
    </AdminLayout>
  );
};

export default InventoryManagement;