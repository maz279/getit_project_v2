import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const ReconciliationCenter: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reconciliation Center</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Payment reconciliation system will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default ReconciliationCenter;