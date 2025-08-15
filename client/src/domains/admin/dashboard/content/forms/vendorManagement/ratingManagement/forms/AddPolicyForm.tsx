
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';
import { RatingService, RatingPolicyData } from '@/shared/services/database/RatingService';
import { toast } from 'sonner';

interface AddPolicyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddPolicyForm: React.FC<AddPolicyFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<RatingPolicyData>({
    policy_name: '',
    policy_type: 'review_guidelines',
    policy_content: '',
    is_active: true,
    effective_date: new Date().toISOString().split('T')[0],
    created_by: 'admin' // This should be the actual user ID in a real implementation
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof RatingPolicyData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await RatingService.createPolicy(formData);
      toast.success('Policy created successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating policy:', error);
      toast.error('Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Policy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policy_name">Policy Name *</Label>
            <Input
              id="policy_name"
              value={formData.policy_name}
              onChange={(e) => handleInputChange('policy_name', e.target.value)}
              placeholder="Enter policy name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Policy Type *</Label>
            <Select
              value={formData.policy_type}
              onValueChange={(value) => handleInputChange('policy_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="review_guidelines">Review Guidelines</SelectItem>
                <SelectItem value="moderation_rules">Moderation Rules</SelectItem>
                <SelectItem value="dispute_resolution">Dispute Resolution</SelectItem>
                <SelectItem value="vendor_standards">Vendor Standards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy_content">Policy Content *</Label>
            <Textarea
              id="policy_content"
              value={formData.policy_content}
              onChange={(e) => handleInputChange('policy_content', e.target.value)}
              placeholder="Enter the detailed policy content..."
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective_date">Effective Date *</Label>
            <Input
              id="effective_date"
              type="date"
              value={formData.effective_date}
              onChange={(e) => handleInputChange('effective_date', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <Label htmlFor="is_active">Active Policy</Label>
              <p className="text-sm text-gray-500">Enable this policy immediately</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
