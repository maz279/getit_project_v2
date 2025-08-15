
import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { RatingService, ReviewModerationData } from '@/shared/services/database/RatingService';
import { toast } from 'sonner';
import { Star, Plus, X } from 'lucide-react';

interface AddReviewModerationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddReviewModerationForm: React.FC<AddReviewModerationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<ReviewModerationData>({
    vendor_id: '',
    customer_name: '',
    product_name: '',
    rating: 1,
    review_text: '',
    moderation_status: 'pending',
    risk_score: 0,
    flags: [],
    priority_level: 'medium'
  });
  
  const [newFlag, setNewFlag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ReviewModerationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFlag = () => {
    if (newFlag.trim() && !formData.flags.includes(newFlag.trim())) {
      setFormData(prev => ({
        ...prev,
        flags: [...prev.flags, newFlag.trim()]
      }));
      setNewFlag('');
    }
  };

  const removeFlag = (flagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      flags: prev.flags.filter(flag => flag !== flagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await RatingService.createModerationEntry(formData);
      toast.success('Review moderation entry created successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating moderation entry:', error);
      toast.error('Failed to create moderation entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Add Review for Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => handleInputChange('product_name', e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      star <= formData.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    onClick={() => handleInputChange('rating', star)}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">({formData.rating}/5)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_score">Risk Score (0-100)</Label>
              <Input
                id="risk_score"
                type="number"
                min="0"
                max="100"
                value={formData.risk_score}
                onChange={(e) => handleInputChange('risk_score', parseInt(e.target.value) || 0)}
                placeholder="Enter risk score"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_text">Review Text *</Label>
            <Textarea
              id="review_text"
              value={formData.review_text}
              onChange={(e) => handleInputChange('review_text', e.target.value)}
              placeholder="Enter review text"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Moderation Status</Label>
              <Select
                value={formData.moderation_status}
                onValueChange={(value) => handleInputChange('moderation_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
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

          <div className="space-y-2">
            <Label>Flags</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={newFlag}
                onChange={(e) => setNewFlag(e.target.value)}
                placeholder="Add flag (e.g., Suspicious Language)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFlag())}
              />
              <Button type="button" onClick={addFlag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.flags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.flags.map((flag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {flag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => removeFlag(flag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Moderation Entry'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
