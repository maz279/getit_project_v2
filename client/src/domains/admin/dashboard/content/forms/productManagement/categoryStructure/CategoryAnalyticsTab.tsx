
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { TrendingUp, TrendingDown, Eye, ShoppingCart, DollarSign } from 'lucide-react';
import { Category, CategoryAnalytics } from './types';

interface CategoryAnalyticsTabProps {
  analytics: CategoryAnalytics;
  categories: Category[];
}

export const CategoryAnalyticsTab: React.FC<CategoryAnalyticsTabProps> = ({
  analytics,
  categories
}) => {
  return (
    <div className="space-y-6">
      {/* Top Categories Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Performing Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.orders} orders</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">৳{category.revenue.toLocaleString()}</p>
                    <div className="flex items-center space-x-1">
                      {category.growth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(category.growth)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {analytics.categoryPerformance.map((category) => (
          <Card key={category.categoryId}>
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Views</span>
                </div>
                <Badge variant="outline">{category.viewsCount.toLocaleString()}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Products</span>
                </div>
                <Badge variant="outline">{category.productsCount}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Revenue</span>
                </div>
                <Badge variant="default">৳{category.revenue.toLocaleString()}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Conversion Rate</span>
                <Badge variant={category.conversionRate > 4 ? 'default' : 'secondary'}>
                  {category.conversionRate}%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Growth</span>
                <div className="flex items-center space-x-1">
                  {category.growth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <Badge variant={category.growth > 0 ? 'default' : 'destructive'}>
                    {category.growth > 0 ? '+' : ''}{category.growth}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Category Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryTrends.map((trend, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">{trend.month}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(trend.categories).map(([categoryName, value]) => (
                    <div key={categoryName} className="flex justify-between items-center">
                      <span className="text-sm">{categoryName}</span>
                      <Badge variant="outline">{value} products</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
