import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  DollarSign,
  RefreshCw,
  Gift,
  CreditCard
} from 'lucide-react';

interface ReturnResolutionProps {
  returnId: string;
  onResolutionComplete?: () => void;
}

interface Resolution {
  id: string;
  type: 'approved' | 'rejected' | 'partial';
  reason: string;
  refundAmount: number;
  refundMethod: string;
  processingTime: string;
  additionalCompensation?: {
    type: 'store_credit' | 'coupon' | 'gift_card';
    amount: number;
    reason: string;
  };
}

export const ReturnResolution: React.FC<ReturnResolutionProps> = ({
  returnId,
  onResolutionComplete
}) => {
  const [resolution, setResolution] = useState<Resolution>({
    id: 'RES-' + Date.now(),
    type: 'approved',
    reason: 'Screen defect confirmed. Product eligible for full refund.',
    refundAmount: 145000,
    refundMethod: 'bKash',
    processingTime: '2-3 business days',
    additionalCompensation: {
      type: 'store_credit',
      amount: 5000,
      reason: 'Inconvenience compensation'
    }
  });

  const [feedback, setFeedback] = useState({
    rating: 0,
    satisfaction: '',
    experienceRating: 0,
    comments: '',
    wouldRecommend: '',
    improvements: ''
  });

  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async () => {
    setIsSubmittingFeedback(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onResolutionComplete?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getResolutionIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-12 w-12 text-red-600" />;
      case 'partial':
        return <RefreshCw className="h-12 w-12 text-yellow-600" />;
      default:
        return <CheckCircle className="h-12 w-12 text-green-600" />;
    }
  };

  const getResolutionBadge = (type: string) => {
    const config = {
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      partial: { label: 'Partially Approved', color: 'bg-yellow-100 text-yellow-800' }
    };

    const { label, color } = config[type as keyof typeof config];
    return <Badge className={`${color} border-0 text-sm`}>{label}</Badge>;
  };

  const renderStarRating = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`
              h-8 w-8 rounded-full transition-colors
              ${star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}
            `}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  if (showFeedback) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
          <p className="text-gray-600">Help us improve our return process</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Return Experience Feedback</CardTitle>
            <CardDescription>Your feedback helps us serve you better</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Overall Return Experience Rating
              </Label>
              {renderStarRating(feedback.rating, (rating) => 
                setFeedback(prev => ({ ...prev, rating }))
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                How satisfied are you with the resolution?
              </Label>
              <RadioGroup 
                value={feedback.satisfaction} 
                onValueChange={(value) => setFeedback(prev => ({ ...prev, satisfaction: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_satisfied" id="very_satisfied" />
                  <Label htmlFor="very_satisfied">Very Satisfied</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="satisfied" id="satisfied" />
                  <Label htmlFor="satisfied">Satisfied</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral">Neutral</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dissatisfied" id="dissatisfied" />
                  <Label htmlFor="dissatisfied">Dissatisfied</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very_dissatisfied" id="very_dissatisfied" />
                  <Label htmlFor="very_dissatisfied">Very Dissatisfied</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                Processing Speed Rating
              </Label>
              {renderStarRating(feedback.experienceRating, (rating) => 
                setFeedback(prev => ({ ...prev, experienceRating: rating }))
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                Would you recommend our return process to others?
              </Label>
              <RadioGroup 
                value={feedback.wouldRecommend} 
                onValueChange={(value) => setFeedback(prev => ({ ...prev, wouldRecommend: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="recommend_yes" />
                  <Label htmlFor="recommend_yes">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span>Yes</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="recommend_no" />
                  <Label htmlFor="recommend_no">
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span>No</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Additional Comments
              </Label>
              <Textarea
                placeholder="Tell us about your experience or suggest improvements..."
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                What could we improve?
              </Label>
              <Textarea
                placeholder="Specific suggestions for improvement..."
                value={feedback.improvements}
                onChange={(e) => setFeedback(prev => ({ ...prev, improvements: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowFeedback(false)}
              >
                Back to Resolution
              </Button>
              <Button 
                onClick={handleFeedbackSubmit}
                disabled={isSubmittingFeedback || feedback.rating === 0}
              >
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        {getResolutionIcon(resolution.type)}
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Return Resolution</h2>
        <div className="flex justify-center mt-2">
          {getResolutionBadge(resolution.type)}
        </div>
      </div>

      {/* Resolution Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resolution Details</span>
            <span className="text-sm font-normal text-gray-500">#{returnId}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Resolution Type</Label>
              <p className="text-lg font-semibold capitalize">{resolution.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Processing Time</Label>
              <p className="text-lg font-semibold">{resolution.processingTime}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Reason</Label>
            <p className="text-gray-900 mt-1">{resolution.reason}</p>
          </div>

          {resolution.type === 'approved' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your return has been approved! Refund will be processed within {resolution.processingTime}.
              </AlertDescription>
            </Alert>
          )}

          {resolution.type === 'rejected' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Your return has been rejected. If you disagree with this decision, you can contact our support team.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Refund Information */}
      {resolution.type !== 'rejected' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Refund Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Refund Amount</Label>
                <p className="text-2xl font-bold text-green-600">
                  ৳{resolution.refundAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Refund Method</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">{resolution.refundMethod}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Refund will be processed to your {resolution.refundMethod} account</span>
                <span className="text-sm font-medium text-blue-600">Track Refund Status</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Compensation */}
      {resolution.additionalCompensation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5" />
              <span>Additional Compensation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">
                  ৳{resolution.additionalCompensation.amount.toLocaleString()} Store Credit
                </p>
                <p className="text-sm text-blue-700">
                  {resolution.additionalCompensation.reason}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-0">
                {resolution.additionalCompensation.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => window.location.href = '/account/orders'}>
          View All Orders
        </Button>
        <Button onClick={() => setShowFeedback(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Share Feedback
        </Button>
      </div>

      {/* Contact Support */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Have questions about your return resolution?
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnResolution;