import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const OrderProcessingContent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Processing</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Order processing functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );
};