
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { AllProductsHeader } from './allProducts/AllProductsHeader';
import { ProductsStatsCards } from './allProducts/ProductsStatsCards';
import { ProductsOverviewTab } from './allProducts/ProductsOverviewTab';
import { ProductsInventoryTab } from './allProducts/ProductsInventoryTab';
import { ProductsAnalyticsTab } from './allProducts/ProductsAnalyticsTab';
import { ProductsManagementTab } from './allProducts/ProductsManagementTab';
import { mockAllProductsData } from './allProducts/mockData';

export const AllProductsContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFiltersChange = (filters: { category: string; vendor: string; search: string }) => {
    setSelectedCategory(filters.category);
    setSelectedVendor(filters.vendor);
    setSearchQuery(filters.search);
  };

  return (
    <div className="space-y-6">
      <AllProductsHeader />
      
      <ProductsStatsCards 
        stats={mockAllProductsData.overallStats}
        performance={mockAllProductsData.performanceMetrics}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="inventory">📦 Inventory</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="management">⚙️ Management</TabsTrigger>
          <TabsTrigger value="categories">🏷️ Categories</TabsTrigger>
          <TabsTrigger value="vendors">👥 Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProductsOverviewTab 
            products={mockAllProductsData.products}
            trends={mockAllProductsData.trends}
            topPerformers={mockAllProductsData.topPerformers}
            onFiltersChange={handleFiltersChange}
          />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <ProductsInventoryTab 
            inventoryData={mockAllProductsData.inventoryData}
            lowStockAlerts={mockAllProductsData.lowStockAlerts}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <ProductsAnalyticsTab 
            analytics={mockAllProductsData.analytics}
            salesData={mockAllProductsData.salesData}
          />
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          <ProductsManagementTab 
            products={mockAllProductsData.products}
            bulkActions={mockAllProductsData.bulkActions}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Category Management</h3>
            <p className="text-gray-600">Product categories and hierarchical organization</p>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Vendor Products</h3>
            <p className="text-gray-600">Products by vendor and performance metrics</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
