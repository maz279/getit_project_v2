import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { ProductManagementContent } from '@/domains/admin/dashboard/content/ProductManagementContent';

const ProductList: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Product List"
      breadcrumbItems={[
        { label: 'Product Management', href: '/admin/products' },
        { label: 'Product List' }
      ]}
    >
      <ProductManagementContent selectedSubmenu="all-products" />
    </AdminLayout>
  );
};

export default ProductList;