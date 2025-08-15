
import React from 'react';
import { Lock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';

export const RoleSecurityCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">High Risk Roles</h4>
              <p className="text-2xl font-bold text-red-900">11</p>
              <p className="text-sm text-red-600">Require immediate attention</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Privilege Escalation</h4>
              <p className="text-2xl font-bold text-yellow-900">3</p>
              <p className="text-sm text-yellow-600">Recent role modifications</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Compliance Score</h4>
              <p className="text-2xl font-bold text-green-900">94%</p>
              <p className="text-sm text-green-600">Meeting security standards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Configuration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Automatic Role Assignment</h4>
                <p className="text-sm text-gray-600">Automatically assign roles based on user attributes</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Role Hierarchy Enforcement</h4>
                <p className="text-sm text-gray-600">Enforce strict role hierarchy rules</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Permission Inheritance</h4>
                <p className="text-sm text-gray-600">Allow child roles to inherit parent permissions</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
