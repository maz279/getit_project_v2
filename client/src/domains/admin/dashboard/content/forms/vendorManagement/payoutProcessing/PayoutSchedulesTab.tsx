
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Switch } from '@/shared/ui/switch';
import { Search, Plus, Edit, Calendar, Clock } from 'lucide-react';
import { PayoutScheduleForm } from './forms/PayoutScheduleForm';

export const PayoutSchedulesTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  // Mock data - replace with actual service call
  const payoutSchedules = [
    {
      id: '1',
      vendor: 'TechStore Bangladesh',
      vendorId: 'vendor_001',
      scheduleType: 'monthly',
      payoutDay: 15,
      minimumAmount: 5000,
      autoPayoutEnabled: true,
      preferredMethod: 'bank_transfer',
      isActive: true,
      nextPayout: '2024-02-15'
    },
    {
      id: '2',
      vendor: 'Fashion World',
      vendorId: 'vendor_002',
      scheduleType: 'bi_weekly',
      payoutDay: 1,
      minimumAmount: 3000,
      autoPayoutEnabled: false,
      preferredMethod: 'mobile_banking',
      isActive: true,
      nextPayout: '2024-02-01'
    }
  ];

  const getScheduleBadge = (type: string) => {
    const colors = {
      weekly: 'bg-blue-100 text-blue-800',
      bi_weekly: 'bg-purple-100 text-purple-800',
      monthly: 'bg-green-100 text-green-800',
      quarterly: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout Schedules</CardTitle>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Payout Schedule</DialogTitle>
                </DialogHeader>
                <PayoutScheduleForm onClose={() => setShowForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={scheduleFilter} onValueChange={setScheduleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schedules</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Schedule Type</TableHead>
                  <TableHead>Payout Day</TableHead>
                  <TableHead>Min Amount</TableHead>
                  <TableHead>Auto Payout</TableHead>
                  <TableHead>Next Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{schedule.vendor}</div>
                        <div className="text-sm text-gray-500">{schedule.vendorId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getScheduleBadge(schedule.scheduleType)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {schedule.scheduleType === 'monthly' ? `${schedule.payoutDay}th` : 
                           schedule.scheduleType === 'weekly' ? `Day ${schedule.payoutDay}` : 
                           `Every ${schedule.payoutDay}st`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ৳{schedule.minimumAmount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch checked={schedule.autoPayoutEnabled} disabled />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{schedule.nextPayout}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
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
