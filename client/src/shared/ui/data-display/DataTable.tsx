/**
 * Data Table Component
 * Enterprise-grade data table with sorting, filtering, and pagination
 * Part of shared component standardization for Phase 1 completion
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: any) => void;
  language?: 'en' | 'bn';
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  searchable = false,
  filterable = false,
  paginated = true,
  pageSize = 10,
  loading = false,
  emptyMessage,
  className,
  onRowClick,
  language = 'en'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{[key: string]: string}>({});

  // Filter data based on search and filters
  const filteredData = data.filter(row => {
    // Search filter
    if (searchQuery) {
      const searchMatch = columns.some(column => {
        const value = row[column.key];
        return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
      if (!searchMatch) return false;
    }

    // Column filters
    for (const [key, filterValue] of Object.entries(filters)) {
      if (filterValue && row[key]?.toString().toLowerCase() !== filterValue.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = paginated 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (key: string) => {
    const direction = sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className={cn('data-table w-full', className)}>
      {/* Controls */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={language === 'bn' ? 'খুঁজুন...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {filterable && (
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {language === 'bn' ? 'ফিল্টার' : 'Filters'}
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={cn(
                              'w-3 h-3 -mb-1',
                              sortConfig?.key === column.key && sortConfig?.direction === 'asc' 
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            )}
                          />
                          <ChevronDown 
                            className={cn(
                              'w-3 h-3',
                              sortConfig?.key === column.key && sortConfig?.direction === 'desc' 
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr 
                  key={index}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-900',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-sm">
            {emptyMessage || (language === 'bn' ? 'কোনো ডেটা পাওয়া যায়নি' : 'No data available')}
          </div>
        </div>
      )}

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            {language === 'bn' ? 'দেখানো হচ্ছে' : 'Showing'} {' '}
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedData.length)} {' '}
            {language === 'bn' ? 'এর' : 'of'} {sortedData.length} {language === 'bn' ? 'ফলাফল' : 'results'}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm">
              {language === 'bn' ? 'পৃষ্ঠা' : 'Page'} {currentPage} {language === 'bn' ? 'এর' : 'of'} {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};