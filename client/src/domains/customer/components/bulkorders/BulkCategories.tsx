import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { 
  Laptop, 
  Shirt, 
  Utensils, 
  Briefcase, 
  Building, 
  Wrench,
  Package,
  Truck
} from 'lucide-react';

interface BulkCategory {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  icon: React.ReactNode;
  productCount: number;
  minimumOrder: number;
  discountRange: string;
  featured: boolean;
}

export const BulkCategories: React.FC = () => {
  const categories: BulkCategory[] = [
    {
      id: 'electronics',
      name: 'Electronics & Tech',
      nameBn: 'ইলেকট্রনিক্স ও প্রযুক্তি',
      description: 'Bulk orders for electronics, computers, and tech gadgets',
      icon: <Laptop className="w-8 h-8" />,
      productCount: 1250,
      minimumOrder: 10,
      discountRange: '15-40%',
      featured: true
    },
    {
      id: 'clothing',
      name: 'Clothing & Apparel',
      nameBn: 'পোশাক ও পরিচ্ছদ',
      description: 'Wholesale clothing, uniforms, and textile products',
      icon: <Shirt className="w-8 h-8" />,
      productCount: 2100,
      minimumOrder: 50,
      discountRange: '20-50%',
      featured: true
    },
    {
      id: 'food',
      name: 'Food & Beverages',
      nameBn: 'খাদ্য ও পানীয়',
      description: 'Bulk food items, beverages, and restaurant supplies',
      icon: <Utensils className="w-8 h-8" />,
      productCount: 850,
      minimumOrder: 100,
      discountRange: '10-30%',
      featured: true
    },
    {
      id: 'office',
      name: 'Office Supplies',
      nameBn: 'অফিস সামগ্রী',
      description: 'Business essentials, stationery, and office equipment',
      icon: <Briefcase className="w-8 h-8" />,
      productCount: 650,
      minimumOrder: 25,
      discountRange: '15-35%',
      featured: false
    },
    {
      id: 'construction',
      name: 'Construction & Tools',
      nameBn: 'নির্মাণ ও যন্ত্রপাতি',
      description: 'Building materials, tools, and construction equipment',
      icon: <Wrench className="w-8 h-8" />,
      productCount: 450,
      minimumOrder: 10,
      discountRange: '12-25%',
      featured: false
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      nameBn: 'উৎপাদন',
      description: 'Raw materials and manufacturing supplies',
      icon: <Building className="w-8 h-8" />,
      productCount: 320,
      minimumOrder: 100,
      discountRange: '20-45%',
      featured: false
    },
    {
      id: 'packaging',
      name: 'Packaging & Shipping',
      nameBn: 'প্যাকেজিং ও শিপিং',
      description: 'Packaging materials and shipping supplies',
      icon: <Package className="w-8 h-8" />,
      productCount: 280,
      minimumOrder: 500,
      discountRange: '18-40%',
      featured: false
    },
    {
      id: 'automotive',
      name: 'Automotive & Transport',
      nameBn: 'অটোমোবাইল ও পরিবহন',
      description: 'Vehicle parts, transport equipment, and automotive supplies',
      icon: <Truck className="w-8 h-8" />,
      productCount: 190,
      minimumOrder: 5,
      discountRange: '15-30%',
      featured: false
    }
  ];

  const featuredCategories = categories.filter(cat => cat.featured);
  const regularCategories = categories.filter(cat => !cat.featured);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bulk Order Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of bulk order categories with wholesale prices and business solutions
          </p>
        </div>

        {/* Featured Categories */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-gray-900">Featured Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600 group-hover:text-blue-700">
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <p className="text-sm text-gray-500">{category.nameBn}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Featured
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {category.description}
                  </CardDescription>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Products</p>
                      <p className="font-semibold">{category.productCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Min Order</p>
                      <p className="font-semibold">{category.minimumOrder} pcs</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Discount Range</p>
                      <p className="font-semibold text-green-600">{category.discountRange}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regular Categories */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-gray-900">All Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600 group-hover:text-blue-700">
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <p className="text-xs text-gray-500">{category.nameBn}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Products:</span>
                      <span className="font-semibold">{category.productCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Min Order:</span>
                      <span className="font-semibold">{category.minimumOrder} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount:</span>
                      <span className="font-semibold text-green-600">{category.discountRange}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};