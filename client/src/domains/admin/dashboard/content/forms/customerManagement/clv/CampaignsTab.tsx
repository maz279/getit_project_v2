
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Progress } from '@/shared/ui/progress';
import { Plus, Play, Pause, BarChart3, Target, Calendar } from 'lucide-react';
import { CLVCampaign } from './types';

interface CampaignsTabProps {
  campaigns: CLVCampaign[];
}

export const CampaignsTab: React.FC<CampaignsTabProps> = ({ campaigns }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'retention' as const,
    targetSegment: 'high_value',
    budget: '',
    description: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retention': return 'bg-blue-100 text-blue-800';
      case 'winback': return 'bg-red-100 text-red-800';
      case 'upsell': return 'bg-green-100 text-green-800';
      case 'cross_sell': return 'bg-purple-100 text-purple-800';
      case 'loyalty': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `৳${amount.toLocaleString()}`;
  };

  const handleCreateCampaign = () => {
    console.log('Creating campaign:', newCampaign);
    setIsCreateModalOpen(false);
    setNewCampaign({
      name: '',
      type: 'retention',
      targetSegment: 'high_value',
      budget: '',
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">CLV Optimization Campaigns</h3>
          <p className="text-gray-600">Manage campaigns to improve customer lifetime value</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New CLV Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Enter campaign name"
                />
              </div>

              <div>
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select value={newCampaign.type} onValueChange={(value: any) => setNewCampaign({ ...newCampaign, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retention">Customer Retention</SelectItem>
                    <SelectItem value="winback">Win-back Campaign</SelectItem>
                    <SelectItem value="upsell">Upsell Campaign</SelectItem>
                    <SelectItem value="cross_sell">Cross-sell Campaign</SelectItem>
                    <SelectItem value="loyalty">Loyalty Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target-segment">Target Segment</Label>
                <Select value={newCampaign.targetSegment} onValueChange={(value) => setNewCampaign({ ...newCampaign, targetSegment: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_value">High Value Customers</SelectItem>
                    <SelectItem value="medium_value">Medium Value Customers</SelectItem>
                    <SelectItem value="low_value">Low Value Customers</SelectItem>
                    <SelectItem value="at_risk">At Risk Customers</SelectItem>
                    <SelectItem value="new_customer">New Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget">Budget (৳)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                  placeholder="Enter campaign budget"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  placeholder="Describe the campaign objectives and strategy"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateCampaign} className="flex-1">
                  Create Campaign
                </Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold">12</div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold">125%</div>
              <div className="text-sm text-gray-600">Average ROI</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold">45K</div>
              <div className="text-sm text-gray-600">Customers Targeted</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-bold">৳15M</div>
              <div className="text-sm text-gray-600">CLV Increase</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Segment</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Expected CLV Increase</TableHead>
                <TableHead>Actual CLV Increase</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-600">{campaign.startDate} - {campaign.endDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(campaign.type)}>
                      {campaign.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.targetSegment.replace('_', ' ')}</TableCell>
                  <TableCell>{campaign.targetedCustomers.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(campaign.expectedCLVIncrease)}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(campaign.actualCLVIncrease)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={campaign.roi > 100 ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                        {campaign.roi}%
                      </span>
                      <Progress value={Math.min(campaign.roi, 200)} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {campaign.status === 'active' ? (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
