
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

export const ActionTemplates: React.FC = () => {
  const templates = [
    {
      name: 'Rush Order Processing',
      description: 'Update status to processing + assign priority courier',
      actions: 2,
      lastUsed: '2 days ago'
    },
    {
      name: 'Delivery Notification',
      description: 'Send delivery confirmation email + SMS',
      actions: 1,
      lastUsed: '1 week ago'
    },
    {
      name: 'Holiday Orders',
      description: 'Add holiday tag + update delivery timeline',
      actions: 2,
      lastUsed: '3 days ago'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Action Templates</CardTitle>
        <p className="text-sm text-gray-600">Pre-configured bulk actions for common scenarios</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{template.name}</h4>
                  <Badge variant="secondary">{template.actions} actions</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last used: {template.lastUsed}</span>
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
