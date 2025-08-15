
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Calendar, Target, Play, Pause, Edit, Trash2, Plus, TrendingUp } from 'lucide-react';
import { FeaturedCampaign } from './types';

interface FeaturedCampaignsTabProps {
  campaigns: FeaturedCampaign[];
  onCampaignUpdate: (campaignId: string, updates: any) => void;
}

export const FeaturedCampaignsTab: React.FC<FeaturedCampaignsTabProps> = ({
  campaigns,
  onCampaignUpdate
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesStatus && matchesType;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'seasonal': return 'bg-purple-500';
      case 'flash-sale': return 'bg-red-500';
      case 'new-arrival': return 'bg-blue-500';
      case 'best-seller': return 'bg-green-500';
      case 'clearance': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Campaign Management
            </span>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="flash-sale">Flash Sale</SelectItem>
                <SelectItem value="new-arrival">New Arrival</SelectItem>
                <SelectItem value="best-seller">Best Seller</SelectItem>
                <SelectItem value="clearance">Clearance</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(campaign.type)}>
                      {campaign.type}
                    </Badge>
                    <Badge variant="secondary">
                      Priority {campaign.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {campaign.status === 'active' ? (
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{campaign.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="text-sm font-medium">
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Products:</span>
                  <span className="text-sm font-medium">{campaign.productCount} items</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Target Audience:</span>
                  <div className="flex space-x-1">
                    {campaign.targetAudience.map((audience, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>

                {campaign.status === 'active' && (
                  <>
                    <hr className="my-3" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{campaign.totalViews.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{campaign.totalClicks.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{campaign.conversionRate}%</div>
                        <div className="text-xs text-gray-500">Conversion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">৳{(campaign.totalRevenue / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center mt-3">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Performance trending upward</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No campaigns found matching your filters.</p>
            <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
