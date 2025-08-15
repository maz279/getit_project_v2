
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { 
  Store,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react';

interface ActiveVendorsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPerformance: string;
  onPerformanceChange: (performance: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onBulkActions: () => void;
}

export const ActiveVendorsHeader: React.FC<ActiveVendorsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  selectedPerformance,
  onPerformanceChange,
  onRefresh,
  onExport,
  onBulkActions
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Store className="mr-3 h-8 w-8 text-green-600" />
            Active Vendors Management
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📍 Vendor Management → Vendor Directory → Active Vendors
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            Manage all active vendor partnerships, performance monitoring, and business relationships
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={onBulkActions}>
            <Settings className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search vendors by name, email, or business..."
              className="pl-10 pr-4 py-2 w-80 focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">✅ Active</option>
            <option value="suspended">⛔ Suspended</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="inactive">💤 Inactive</option>
          </select>

          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="electronics">📱 Electronics</option>
            <option value="fashion">👗 Fashion</option>
            <option value="home">🏠 Home & Living</option>
            <option value="books">📚 Books</option>
            <option value="sports">⚽ Sports</option>
            <option value="beauty">💄 Beauty</option>
          </select>

          <select 
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            value={selectedPerformance}
            onChange={(e) => onPerformanceChange(e.target.value)}
          >
            <option value="all">All Performance</option>
            <option value="excellent">⭐ Excellent (4.5+)</option>
            <option value="good">👍 Good (4.0-4.4)</option>
            <option value="average">➖ Average (3.5-3.9)</option>
            <option value="poor">👎 Poor (&lt;3.5)</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>
    </div>
  );
};
