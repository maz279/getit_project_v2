
import React from 'react';
import { Upload, Download, Database, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const ProductImportExportHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg p-6 border border-indigo-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-cyan-600 rounded-xl shadow-lg">
            <Database className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Import & Export Management</h1>
            <p className="text-gray-600 mt-1">Efficiently manage bulk product operations, imports, and exports</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Products
          </Button>
          <Button className="flex items-center bg-gradient-to-r from-indigo-500 to-cyan-600">
            <Upload className="h-4 w-4 mr-2" />
            Import Products
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center">
            <Upload className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Bulk Import</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Import thousands of products at once</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center">
            <Download className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Smart Export</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Export with advanced filtering options</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Bulk Operations</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Mass update prices and inventory</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Template Manager</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Create and manage import templates</p>
        </div>
      </div>
    </div>
  );
};
