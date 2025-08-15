
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { XCircle } from 'lucide-react';

export const RejectedBankAccountsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-600" />
            Rejected Bank Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Management of rejected bank accounts, resubmission requests, and resolution tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
