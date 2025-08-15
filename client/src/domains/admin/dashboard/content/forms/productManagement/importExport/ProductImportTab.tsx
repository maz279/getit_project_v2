
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/shared/ui/progress';

interface ProductImportTabProps {
  onOperationStart: (operation: any) => void;
  activeOperations: any[];
}

export const ProductImportTab: React.FC<ProductImportTabProps> = ({ onOperationStart, activeOperations }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importTemplate, setImportTemplate] = useState('standard');
  const [duplicateHandling, setDuplicateHandling] = useState('update');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportStart = () => {
    if (selectedFile) {
      const newOperation = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.name.split('.').pop() as 'csv' | 'xlsx',
        status: 'pending' as const,
        progress: 0,
        startTime: new Date(),
        createdBy: 'current-user'
      };
      onOperationStart(newOperation);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Product Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: CSV, Excel (.xlsx, .xls)
              </p>
            </div>

            <div>
              <Label>Import Template</Label>
              <Select value={importTemplate} onValueChange={setImportTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Product Import</SelectItem>
                  <SelectItem value="fashion">Fashion Products</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="custom">Custom Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duplicate Handling</Label>
              <Select value={duplicateHandling} onValueChange={setDuplicateHandling}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skip">Skip Duplicates</SelectItem>
                  <SelectItem value="update">Update Existing</SelectItem>
                  <SelectItem value="create-new">Create New</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleImportStart} 
              disabled={!selectedFile}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Start Import
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Import Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Required Fields</p>
                  <p className="text-sm text-gray-600">Product Name, SKU, Price, Stock Quantity</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">File Size Limit</p>
                  <p className="text-sm text-gray-600">Maximum 50MB per file</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Data Validation</p>
                  <p className="text-sm text-gray-600">Automatic validation for prices, SKUs, and categories</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Sample Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Import Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeOperations.map((operation) => (
                <div key={operation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{operation.fileName}</h4>
                    <span className="text-sm text-gray-500">{operation.status}</span>
                  </div>
                  <Progress value={operation.progress || 0} className="mb-2" />
                  <div className="text-sm text-gray-600">
                    {operation.processedRows || 0} / {operation.totalRows || 0} rows processed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
