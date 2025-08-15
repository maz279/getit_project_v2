import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const FinancialReports: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Financial reporting and analytics system will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default FinancialReports;