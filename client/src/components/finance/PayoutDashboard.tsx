import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const PayoutDashboard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Payout management system will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default PayoutDashboard;