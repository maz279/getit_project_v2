import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const AccountingOverview: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounting Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Accounting overview content will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default AccountingOverview;