
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Download, CheckCircle, Clock, AlertCircle, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportHistoryProps {
  recentExports: Array<{
    id: number;
    name: string;
    type: string;
    size: string;
    date: string;
    status: string;
    records: number;
  }>;
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({ recentExports }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'excel': return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      case 'csv': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Exports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentExports.map((exportItem) => (
            <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {getFileIcon(exportItem.type)}
                <div>
                  <h4 className="font-medium">{exportItem.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{exportItem.records.toLocaleString()} records</span>
                    <span>{exportItem.size}</span>
                    <span>{exportItem.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(exportItem.status)}
                  <span className="text-sm capitalize">{exportItem.status}</span>
                </div>
                {exportItem.status === 'completed' && (
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
