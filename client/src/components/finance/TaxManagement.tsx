import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const TaxManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Tax management system will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default TaxManagement;