import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { ProductManagementContent } from '@/domains/admin/dashboard/content/ProductManagementContent';

const ProductModeration: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Product Moderation"
      breadcrumbItems={[
        { label: 'Product Management', href: '/admin/products' },
        { label: 'Product Moderation' }
      ]}
    >
      <ProductManagementContent selectedSubmenu="product-moderation" />
    </AdminLayout>
  );
};

export default ProductModeration;