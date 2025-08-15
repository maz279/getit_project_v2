
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { FileSpreadsheet, Download, Edit, Trash2, Plus, Star } from 'lucide-react';
import { ImportTemplate } from './types';

interface TemplateManagementTabProps {
  templates: ImportTemplate[];
}

export const TemplateManagementTab: React.FC<TemplateManagementTabProps> = ({ templates }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Template Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.isDefault && (
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                        <span className="text-xs text-yellow-600">Default</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {template.fileType.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fields:</span>
                  <span className="font-medium">{template.fieldMappings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Usage:</span>
                  <span className="font-medium">{template.usageCount} times</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated:</span>
                  <span className="font-medium">{formatDate(template.updatedAt)}</span>
                </div>
              </div>

              <div className="flex justify-between space-x-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Import Templates</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pre-configured field mappings</li>
                <li>• Built-in validation rules</li>
                <li>• Sample data for reference</li>
                <li>• Support for multiple file formats</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use consistent naming conventions</li>
                <li>• Include required field validation</li>
                <li>• Test with sample data first</li>
                <li>• Keep templates updated</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
