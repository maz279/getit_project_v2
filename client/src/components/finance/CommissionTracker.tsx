import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

const CommissionTracker: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Commission tracking system will be implemented here.</p>
      </CardContent>
    </Card>
  );
};

export default CommissionTracker;