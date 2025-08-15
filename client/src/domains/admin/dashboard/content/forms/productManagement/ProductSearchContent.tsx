import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const ProductSearchContent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Search</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Product search functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );
};