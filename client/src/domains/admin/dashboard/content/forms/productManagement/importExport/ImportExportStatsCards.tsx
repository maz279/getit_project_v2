
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Upload, Download, CheckCircle, XCircle, Clock, Database, Activity, Calendar } from 'lucide-react';
import { ImportExportStats } from './types';

interface ImportExportStatsCardsProps {
  stats: ImportExportStats;
}

export const ImportExportStatsCards: React.FC<ImportExportStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
          <Upload className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.totalImports}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.activeOperations} currently active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
          <Download className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.totalExports}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.scheduledOperations} scheduled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {Math.round((stats.successfulOperations / (stats.successfulOperations + stats.failedOperations)) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.successfulOperations} successful, {stats.failedOperations} failed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.avgProcessingTime}m</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.dataProcessedToday.toLocaleString()} records today
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
