
import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Progress } from '@/shared/ui/progress';

export const SecurityMonitoringSection: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold flex items-center">
      <Shield className="h-6 w-6 mr-2" />
      Security Monitoring
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Failed Logins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">15</div>
          <span className="text-xs text-gray-500">Last 24h</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Blocked IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">8</div>
          <span className="text-xs text-gray-500">Active blocks</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Suspicious Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <span className="text-xs text-gray-500">Under review</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Security Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">94%</div>
          <Progress value={94} className="mt-2" />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Security Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
            <Input id="max-login-attempts" type="number" defaultValue="5" />
          </div>
          <div>
            <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
            <Input id="lockout-duration" type="number" defaultValue="30" />
          </div>
        </div>
        <Button>Update Security Settings</Button>
      </CardContent>
    </Card>
  </div>
);
