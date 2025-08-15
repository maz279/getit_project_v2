
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Plus, Search, Filter, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { AddReviewModerationForm } from './forms/AddReviewModerationForm';
import { RatingService, ReviewModerationData, AIDetectionSetting } from '@/shared/services/database/RatingService';
import { toast } from 'sonner';

export const RatingModerationTab: React.FC = () => {
  const [reviewModerations, setReviewModerations] = useState<ReviewModerationData[]>([]);
  const [aiSettings, setAISettings] = useState<AIDetectionSetting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [moderationData, settingsData] = await Promise.all([
        RatingService.getReviewsForModeration(),
        RatingService.getAIDetectionSettings()
      ]);
      
      // Transform moderation data to match our interface
      const transformedModerationData: ReviewModerationData[] = moderationData.map((item: any) => ({
        ...item,
        moderation_status: item.moderation_status as 'pending' | 'approved' | 'rejected' | 'flagged',
        priority_level: item.priority_level as 'low' | 'medium' | 'high',
        flags: Array.isArray(item.flags) ? item.flags : []
      }));
      
      // Transform AI settings data to match our interface
      const transformedSettingsData: AIDetectionSetting[] = settingsData.map((item: any) => ({
        ...item,
        setting_type: item.setting_type as 'detection_rule' | 'auto_moderation',
        configuration: item.configuration || {}
      }));
      
      setReviewModerations(transformedModerationData);
      setAISettings(transformedSettingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    try {
      await RatingService.updateModerationStatus(id, status, notes);
      toast.success('Status updated successfully');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleToggleAISetting = async (settingName: string, isEnabled: boolean) => {
    try {
      await RatingService.updateAIDetectionSetting(settingName, isEnabled);
      toast.success('AI setting updated successfully');
      loadData();
    } catch (error) {
      console.error('Error updating AI setting:', error);
      toast.error('Failed to update AI setting');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const filteredReviews = reviewModerations.filter(review => {
    const matchesSearch = review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.review_text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.moderation_status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || review.priority_level === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading moderation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Detection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-3 h-5 w-5 text-purple-600" />
            AI Detection Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{setting.setting_name.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-sm text-gray-500 capitalize">{setting.setting_type.replace(/_/g, ' ')}</p>
                </div>
                <Switch
                  checked={setting.is_enabled}
                  onCheckedChange={(enabled) => handleToggleAISetting(setting.setting_name, enabled)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviews by customer, product, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Add Review for Moderation</DialogTitle>
                  </DialogHeader>
                  <AddReviewModerationForm
                    onSuccess={() => {
                      setShowAddForm(false);
                      loadData();
                    }}
                    onCancel={() => setShowAddForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews for Moderation ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews found matching your criteria</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{review.customer_name}</h4>
                        <Badge className={getStatusColor(review.moderation_status || 'pending')}>
                          {review.moderation_status?.toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(review.priority_level || 'medium')}>
                          {review.priority_level?.toUpperCase()}
                        </Badge>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-sm ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Product: {review.product_name}</p>
                      <p className="text-gray-700 mb-2">{review.review_text}</p>
                      {review.flags && review.flags.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {review.flags.map((flag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center text-xs text-gray-500 gap-4">
                        <span>Risk Score: {review.risk_score || 0}%</span>
                        <span>Created: {new Date(review.created_at || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(review.id!, 'approved')}
                        disabled={review.moderation_status === 'approved'}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(review.id!, 'rejected')}
                        disabled={review.moderation_status === 'rejected'}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(review.id!, 'flagged')}
                        disabled={review.moderation_status === 'flagged'}
                      >
                        Flag
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
