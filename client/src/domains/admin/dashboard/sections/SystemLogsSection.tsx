
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';

export const SystemLogsSection: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold flex items-center">
      <FileText className="h-6 w-6 mr-2" />
      System Logs
    </h2>

    <Card>
      <CardHeader>
        <CardTitle>Recent System Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { level: 'INFO', message: 'User authentication successful', time: '2 min ago', user: 'admin@getit.com' },
            { level: 'WARN', message: 'High memory usage detected', time: '5 min ago', user: 'system' },
            { level: 'ERROR', message: 'Database connection timeout', time: '10 min ago', user: 'system' },
            { level: 'INFO', message: 'Backup process completed', time: '15 min ago', user: 'system' },
            { level: 'WARN', message: 'Multiple login attempts detected', time: '20 min ago', user: '192.168.1.100' }
          ].map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant={log.level === 'ERROR' ? 'destructive' : log.level === 'WARN' ? 'secondary' : 'default'}>
                  {log.level}
                </Badge>
                <span className="text-sm">{log.message}</span>
              </div>
              <div className="text-xs text-gray-500">
                {log.user} • {log.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Log Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="log-level">Log Level</Label>
            <Select defaultValue="INFO">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBUG">Debug</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="retention-days">Retention Period (days)</Label>
            <Input id="retention-days" type="number" defaultValue="30" />
          </div>
        </div>
        <Button>Save Log Settings</Button>
      </CardContent>
    </Card>
  </div>
);
