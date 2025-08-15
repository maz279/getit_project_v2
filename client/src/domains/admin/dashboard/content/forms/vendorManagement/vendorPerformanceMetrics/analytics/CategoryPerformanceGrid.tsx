
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Package } from 'lucide-react';

const mockCategoryData = [
  { category: 'Electronics', vendors: 45, avgScore: 8.7, trend: 'up' },
  { category: 'Fashion', vendors: 78, avgScore: 8.1, trend: 'stable' },
  { category: 'Home & Garden', vendors: 34, avgScore: 7.9, trend: 'down' },
  { category: 'Sports & Outdoors', vendors: 29, avgScore: 8.4, trend: 'up' },
  { category: 'Books & Education', vendors: 56, avgScore: 8.8, trend: 'up' },
  { category: 'Health & Beauty', vendors: 67, avgScore: 8.2, trend: 'stable' }
];

export const CategoryPerformanceGrid: React.FC = () => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2 text-orange-600" />
          Category Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCategoryData.map((category) => (
            <div key={category.category} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{category.category}</h4>
                <Badge className={getTrendColor(category.trend)}>
                  {category.trend}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Vendors: {category.vendors}</span>
                  <span>Score: {category.avgScore}/10</span>
                </div>
                <Progress value={category.avgScore * 10} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
