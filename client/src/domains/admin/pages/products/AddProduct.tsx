import React from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { ProductManagementContent } from '@/domains/admin/dashboard/content/ProductManagementContent';

const AddProduct: React.FC = () => {
  return (
    <AdminLayout
      currentPage="Add Product"
      breadcrumbItems={[
        { label: 'Product Management', href: '/admin/products' },
        { label: 'Add Product' }
      ]}
    >
      <ProductManagementContent selectedSubmenu="add-product" />
    </AdminLayout>
  );
};

export default AddProduct;