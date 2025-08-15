import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Calculator, Settings, TrendingUp } from 'lucide-react';
import { RevenueSharingService } from '@/shared/services/database/revenue/RevenueSharingService';
import { CommissionStructure } from '@/types/revenue';

export const CommissionStructureTab: React.FC = () => {
  const [structures, setStructures] = useState<CommissionStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadCommissionStructures();
  }, []);

  const loadCommissionStructures = async () => {
    try {
      setLoading(true);
      const data = await RevenueSharingService.getRevenueModels();
      
      // Properly cast the database response to our interface
      const typedStructures: CommissionStructure[] = data.map(structure => ({
        ...structure,
        model_type: structure.model_type as 'percentage' | 'tiered' | 'flat_fee' | 'hybrid',
        tier_structure: Array.isArray(structure.tier_structure) 
          ? structure.tier_structure 
          : typeof structure.tier_structure === 'string' 
            ? JSON.parse(structure.tier_structure) 
            : [],
        category_rates: typeof structure.category_rates === 'object' && structure.category_rates !== null
          ? structure.category_rates as Record<string, any>
          : {}
      }));
      
      setStructures(typedStructures);
    } catch (error) {
      console.error('Error loading commission structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'electronics', name: 'Electronics', rate: 8.5 },
    { id: 'fashion', name: 'Fashion & Apparel', rate: 12.0 },
    { id: 'home', name: 'Home & Garden', rate: 10.0 },
    { id: 'books', name: 'Books & Media', rate: 15.0 },
    { id: 'sports', name: 'Sports & Outdoors', rate: 9.5 }
  ];

  const vendorTiers = [
    { tier: 'bronze', name: 'Bronze', minSales: 0, maxSales: 50000, rate: 10.0 },
    { tier: 'silver', name: 'Silver', minSales: 50001, maxSales: 200000, rate: 12.0 },
    { tier: 'gold', name: 'Gold', minSales: 200001, maxSales: 500000, rate: 15.0 },
    { tier: 'platinum', name: 'Platinum', minSales: 500001, maxSales: null, rate: 18.0 }
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Loading commission structures...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Commission Structure</h3>
          <p className="text-gray-600">Configure commission rates by category and vendor tier</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Global Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Category-based Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-gray-500">Category: {category.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={category.rate}
                    className="w-20 h-8"
                    step="0.1"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Vendor Tier Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendorTiers.map((tier) => (
              <div key={tier.tier} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {tier.name}
                    </Badge>
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={tier.rate}
                      className="w-20 h-8"
                      step="0.1"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Sales Range: ৳{tier.minSales.toLocaleString()} - {tier.maxSales ? `৳${tier.maxSales.toLocaleString()}` : 'Unlimited'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Transaction Amount (৳)</Label>
              <Input type="number" placeholder="10000" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vendor Tier</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {vendorTiers.map((tier) => (
                    <SelectItem key={tier.tier} value={tier.tier}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Calculate</Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Commission Breakdown:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Base Commission</p>
                <p className="font-semibold">৳1,200</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tier Bonus</p>
                <p className="font-semibold">৳300</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category Adjustment</p>
                <p className="font-semibold">৳150</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Commission</p>
                <p className="font-semibold text-green-600">৳1,650</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
