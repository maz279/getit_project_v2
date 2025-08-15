
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Calendar } from 'lucide-react';

export const ScheduledExports: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Exports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Exports</h3>
          <p className="text-gray-600 mb-4">Set up automated exports to run on a schedule</p>
          <Button>Create Scheduled Export</Button>
        </div>
      </CardContent>
    </Card>
  );
};
