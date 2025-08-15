
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ProductImportExportHeader } from './importExport/ProductImportExportHeader';
import { ImportExportStatsCards } from './importExport/ImportExportStatsCards';
import { ProductImportTab } from './importExport/ProductImportTab';
import { ProductExportTab } from './importExport/ProductExportTab';
import { BulkOperationsTab } from './importExport/BulkOperationsTab';
import { ImportExportHistoryTab } from './importExport/ImportExportHistoryTab';
import { TemplateManagementTab } from './importExport/TemplateManagementTab';
import { mockImportExportData } from './importExport/mockData';

export const ProductImportExportContent: React.FC = () => {
  const [activeOperations, setActiveOperations] = useState(mockImportExportData.activeOperations);
  const [importHistory, setImportHistory] = useState(mockImportExportData.importHistory);
  const [exportHistory, setExportHistory] = useState(mockImportExportData.exportHistory);

  const handleOperationStart = (operation: any) => {
    setActiveOperations(prev => [...prev, operation]);
  };

  const handleOperationComplete = (operationId: string) => {
    setActiveOperations(prev => prev.filter(op => op.id !== operationId));
  };

  return (
    <div className="space-y-6">
      <ProductImportExportHeader />
      
      <ImportExportStatsCards stats={mockImportExportData.stats} />

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="import">📥 Product Import</TabsTrigger>
          <TabsTrigger value="export">📤 Product Export</TabsTrigger>
          <TabsTrigger value="bulk">⚡ Bulk Operations</TabsTrigger>
          <TabsTrigger value="history">📋 Operation History</TabsTrigger>
          <TabsTrigger value="templates">📄 Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-6">
          <ProductImportTab 
            onOperationStart={handleOperationStart}
            activeOperations={activeOperations}
          />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ProductExportTab 
            onOperationStart={handleOperationStart}
            activeOperations={activeOperations}
          />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <BulkOperationsTab 
            onOperationStart={handleOperationStart}
            activeOperations={activeOperations}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ImportExportHistoryTab 
            importHistory={importHistory}
            exportHistory={exportHistory}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplateManagementTab 
            templates={mockImportExportData.templates}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
