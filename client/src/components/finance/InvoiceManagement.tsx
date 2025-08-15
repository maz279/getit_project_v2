import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const InvoiceManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Invoice management system will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default InvoiceManagement;