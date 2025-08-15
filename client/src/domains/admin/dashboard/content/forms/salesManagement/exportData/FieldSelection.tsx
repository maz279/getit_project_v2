
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';

interface FieldSelectionProps {
  selectedFields: string[];
  handleFieldToggle: (field: string) => void;
  availableFields: Array<{
    category: string;
    fields: string[];
  }>;
}

export const FieldSelection: React.FC<FieldSelectionProps> = ({
  selectedFields,
  handleFieldToggle,
  availableFields
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Fields Selection</CardTitle>
        <p className="text-sm text-gray-600">Select the fields you want to include in your export</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {availableFields.map((category, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-medium text-gray-900">{category.category}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {category.fields.map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={() => handleFieldToggle(field)}
                    />
                    <Label htmlFor={field} className="text-sm">{field}</Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
