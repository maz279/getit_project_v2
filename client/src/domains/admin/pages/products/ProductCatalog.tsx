import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { ProductManagementContent } from '@/domains/admin/dashboard/content/ProductManagementContent';

const ProductCatalog: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Product Catalog"
      breadcrumbItems={[
        { label: 'Product Management', href: '/admin/products' },
        { label: 'Product Catalog' }
      ]}
    >
      <ProductManagementContent selectedSubmenu="product-catalog" />
    </AdminLayout>
  );
};

export default ProductCatalog;