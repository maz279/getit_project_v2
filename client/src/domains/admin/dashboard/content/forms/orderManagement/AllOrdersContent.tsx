import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const AllOrdersContent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">All orders management will be implemented here.</p>
      </CardContent>
    </Card>
  );
};