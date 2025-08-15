import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const OrderSearchContent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Search</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Order search functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );
};