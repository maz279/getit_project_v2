
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Download, Filter, Calendar } from 'lucide-react';

interface ProductExportTabProps {
  onOperationStart: (operation: any) => void;
  activeOperations: any[];
}

export const ProductExportTab: React.FC<ProductExportTabProps> = ({ onOperationStart, activeOperations }) => {
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'sku', 'price', 'stock_quantity', 'category'
  ]);

  const availableFields = [
    { id: 'name', label: 'Product Name' },
    { id: 'sku', label: 'SKU' },
    { id: 'price', label: 'Price' },
    { id: 'stock_quantity', label: 'Stock Quantity' },
    { id: 'category', label: 'Category' },
    { id: 'description', label: 'Description' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'status', label: 'Status' },
    { id: 'created_at', label: 'Created Date' },
    { id: 'updated_at', label: 'Updated Date' }
  ];

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExportStart = () => {
    const newOperation = {
      id: Date.now().toString(),
      fileName: `product_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`,
      fileType: exportFormat,
      status: 'pending' as const,
      progress: 0,
      startTime: new Date(),
      fields: selectedFields,
      createdBy: 'current-user'
    };
    onOperationStart(newOperation);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Export Filters</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-sm">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={handleExportStart} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Start Export
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Select Fields to Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                  />
                  <Label htmlFor={field.id} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                {selectedFields.length} of {availableFields.length} fields selected
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
