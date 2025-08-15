
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { MessageSquare, Star, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { ReviewMetrics } from './types';

interface FeedbackReviewsStatsCardsProps {
  metrics: ReviewMetrics;
}

export const FeedbackReviewsStatsCards: React.FC<FeedbackReviewsStatsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <MessageSquare className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.totalReviews.toLocaleString()}</div>
          <div className="text-sm text-gray-500 text-center">Total Reviews</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Clock className="h-6 w-6 text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.pendingReviews}</div>
          <div className="text-sm text-gray-500 text-center">Pending Review</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <Star className="h-6 w-6 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.averageRating.toFixed(1)}</div>
          <div className="text-sm text-gray-500 text-center">Average Rating</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.approvedReviews.toLocaleString()}</div>
          <div className="text-sm text-gray-500 text-center">Approved</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.flaggedReviews}</div>
          <div className="text-sm text-gray-500 text-center">Flagged</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-4">
          <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{metrics.customerSatisfactionScore}</div>
          <div className="text-sm text-gray-500 text-center">CSAT Score</div>
        </CardContent>
      </Card>
    </div>
  );
};
