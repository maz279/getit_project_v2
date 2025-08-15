import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const BudgetPlanning: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Planning</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Budget planning and forecasting system will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default BudgetPlanning;