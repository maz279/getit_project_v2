
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Download, Upload, Eye, RefreshCw } from 'lucide-react';
import { ImportOperation, ExportOperation } from './types';

interface ImportExportHistoryTabProps {
  importHistory: ImportOperation[];
  exportHistory: ExportOperation[];
}

export const ImportExportHistoryTab: React.FC<ImportExportHistoryTabProps> = ({ 
  importHistory, 
  exportHistory 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Operation History</h2>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="imports" className="w-full">
        <TabsList>
          <TabsTrigger value="imports">Import History</TabsTrigger>
          <TabsTrigger value="exports">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="imports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Import Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importHistory.map((operation) => (
                  <div key={operation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{operation.fileName}</h4>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(operation.fileSize)} • {operation.fileType.toUpperCase()}
                        </p>
                      </div>
                      {getStatusBadge(operation.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total Rows:</span>
                        <p className="font-medium">{operation.totalRows.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Successful:</span>
                        <p className="font-medium text-green-600">{operation.successfulRows.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Failed:</span>
                        <p className="font-medium text-red-600">{operation.failedRows.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Started:</span>
                        <p className="font-medium">{formatDate(operation.startTime)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      {operation.status === 'failed' && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Export Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportHistory.map((operation) => (
                  <div key={operation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{operation.fileName}</h4>
                        <p className="text-sm text-gray-600">
                          {operation.fileType.toUpperCase()} Export
                        </p>
                      </div>
                      {getStatusBadge(operation.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Records:</span>
                        <p className="font-medium">{operation.totalRecords.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Fields:</span>
                        <p className="font-medium">{operation.fields.length}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium">{formatDate(operation.startTime)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      {operation.status === 'completed' && operation.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
