
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Search, Download, Eye } from 'lucide-react';

export const PayoutHistoryTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock data
  const payoutHistory = [
    {
      id: '1',
      vendor: 'TechStore Bangladesh',
      payoutRequestId: 'PAY-001',
      action: 'created',
      performedBy: 'John Doe',
      previousStatus: null,
      newStatus: 'pending',
      timestamp: '2024-01-15 10:30:00',
      notes: 'Payout request created for January period'
    },
    {
      id: '2',
      vendor: 'TechStore Bangladesh',
      payoutRequestId: 'PAY-001',
      action: 'approved',
      performedBy: 'Jane Smith',
      previousStatus: 'pending',
      newStatus: 'approved',
      timestamp: '2024-01-16 14:45:00',
      notes: 'Approved after verification'
    },
    {
      id: '3',
      vendor: 'Fashion World',
      payoutRequestId: 'PAY-002',
      action: 'rejected',
      performedBy: 'Mike Johnson',
      previousStatus: 'pending',
      newStatus: 'rejected',
      timestamp: '2024-01-14 09:15:00',
      notes: 'Insufficient documentation'
    }
  ];

  const getActionBadge = (action: string) => {
    const colors = {
      created: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processed: 'bg-purple-100 text-purple-800',
      paid: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout History</CardTitle>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status Change</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">{record.vendor}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono">{record.payoutRequestId}</div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(record.action)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {record.previousStatus && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {record.previousStatus}
                            </Badge>
                            <span className="text-gray-400">→</span>
                          </>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {record.newStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{record.performedBy}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{record.timestamp}</div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
