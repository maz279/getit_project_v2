import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { ProductManagementContent } from '@/domains/admin/dashboard/content/ProductManagementContent';

const CategoryManagement: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Category Management"
      breadcrumbItems={[
        { label: 'Product Management', href: '/admin/products' },
        { label: 'Category Management' }
      ]}
    >
      <ProductManagementContent selectedSubmenu="category-management" />
    </AdminLayout>
  );
};

export default CategoryManagement;