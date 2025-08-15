
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

interface ExportTemplatesProps {
  exportTemplates: Array<{
    id: number;
    name: string;
    description: string;
    fields: number;
    popular: boolean;
  }>;
  setSelectedTemplate: (templateId: string) => void;
}

export const ExportTemplates: React.FC<ExportTemplatesProps> = ({
  exportTemplates,
  setSelectedTemplate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exportTemplates.map((template) => (
        <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {template.name}
              {template.popular && <Badge>Popular</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{template.fields} fields</span>
              <Button size="sm" onClick={() => setSelectedTemplate(template.id.toString())}>
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
