
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  DollarSign,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';
import {
  EnhancedCommissionTrackingService,
  type EnhancedVendorCommission,
  type CommissionFilters,
  type PaginationParams,
  type CommissionInsert,
  type PaginatedResponse
} from '@/shared/services/database/EnhancedCommissionTrackingService';

export const CommissionManagementTab: React.FC = () => {
  const [commissions, setCommissions] = useState<EnhancedVendorCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CommissionFilters>({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const paginationParams: PaginationParams = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      const searchFilters: CommissionFilters = {
        ...filters,
        search: searchTerm || undefined
      };

      const result: PaginatedResponse<EnhancedVendorCommission> = 
        await EnhancedCommissionTrackingService.getCommissionsWithPagination(searchFilters, paginationParams);
      
      setCommissions(result.data);
      setPagination(prev => ({
        ...prev,
        totalPages: result.total_pages,
        totalItems: result.total,
        currentPage: result.current_page
      }));
    } catch (error) {
      console.error('Error loading commissions:', error);
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, [pagination.currentPage, filters, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadCommissions();
  };

  const handleFilterChange = (key: keyof CommissionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSelectionChange = (commissionId: string, checked: boolean) => {
    setSelectedCommissions(prev => 
      checked 
        ? [...prev, commissionId]
        : prev.filter(id => id !== commissionId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCommissions(checked ? commissions.map(c => c.id) : []);
  };

  const handleBulkDelete = async () => {
    if (selectedCommissions.length === 0) return;
    
    try {
      await EnhancedCommissionTrackingService.bulkDeleteCommissions(selectedCommissions);
      toast.success(`Deleted ${selectedCommissions.length} commissions`);
      setSelectedCommissions([]);
      loadCommissions();
    } catch (error) {
      console.error('Error deleting commissions:', error);
      toast.error('Failed to delete commissions');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search & Filter Commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search commissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.commission_type || ''}
                onChange={(e) => handleFilterChange('commission_type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="sale">Sale</option>
                <option value="referral">Referral</option>
                <option value="bonus">Bonus</option>
              </select>

              <Button type="submit" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedCommissions.length} of {pagination.totalItems} selected
              </span>
              
              {selectedCommissions.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loadCommissions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Commission
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading commissions...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <Checkbox
                        checked={selectedCommissions.length === commissions.length && commissions.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4">Transaction ID</th>
                    <th className="text-left p-4">Vendor</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Commission</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedCommissions.includes(commission.id)}
                          onCheckedChange={(checked) => handleSelectionChange(commission.id, !!checked)}
                        />
                      </td>
                      <td className="p-4 font-mono text-sm">{commission.transaction_id}</td>
                      <td className="p-4">{commission.vendor_id}</td>
                      <td className="p-4">{formatCurrency(commission.gross_amount)}</td>
                      <td className="p-4 font-semibold text-green-600">
                        {formatCurrency(commission.commission_amount)}
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(commission.status || 'pending')}>
                          {commission.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {new Date(commission.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </span>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={pagination.currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
