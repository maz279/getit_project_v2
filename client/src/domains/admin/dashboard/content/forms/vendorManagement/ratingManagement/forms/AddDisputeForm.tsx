
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { RatingService, RatingDisputeData } from '@/shared/services/database/RatingService';
import { toast } from 'sonner';

interface AddDisputeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddDisputeForm: React.FC<AddDisputeFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<RatingDisputeData>({
    review_id: '',
    vendor_id: '',
    customer_id: '',
    dispute_reason: '',
    dispute_description: '',
    dispute_status: 'pending',
    priority_level: 'medium'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof RatingDisputeData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await RatingService.createDispute(formData);
      toast.success('Dispute created successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast.error('Failed to create dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disputeReasons = [
    'Fake Review Claim',
    'Inappropriate Content',
    'Spam Review',
    'Defamatory Content',
    'Misleading Information',
    'Duplicate Review',
    'Irrelevant Review',
    'Privacy Violation',
    'Other'
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Dispute</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="review_id">Review ID *</Label>
              <Input
                id="review_id"
                value={formData.review_id}
                onChange={(e) => handleInputChange('review_id', e.target.value)}
                placeholder="Enter review ID"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor_id">Vendor ID *</Label>
              <Input
                id="vendor_id"
                value={formData.vendor_id}
                onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                placeholder="Enter vendor ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_id">Customer ID</Label>
            <Input
              id="customer_id"
              value={formData.customer_id}
              onChange={(e) => handleInputChange('customer_id', e.target.value)}
              placeholder="Enter customer ID (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Dispute Reason *</Label>
            <Select
              value={formData.dispute_reason}
              onValueChange={(value) => handleInputChange('dispute_reason', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dispute reason" />
              </SelectTrigger>
              <SelectContent>
                {disputeReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispute_description">Dispute Description</Label>
            <Textarea
              id="dispute_description"
              value={formData.dispute_description}
              onChange={(e) => handleInputChange('dispute_description', e.target.value)}
              placeholder="Describe the dispute in detail..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dispute Status</Label>
              <Select
                value={formData.dispute_status}
                onValueChange={(value) => handleInputChange('dispute_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select
                value={formData.priority_level}
                onValueChange={(value) => handleInputChange('priority_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Dispute'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
