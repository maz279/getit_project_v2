
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { FeedbackReviewsHeader } from './feedbackReviews/FeedbackReviewsHeader';
import { FeedbackReviewsStatsCards } from './feedbackReviews/FeedbackReviewsStatsCards';
import { ReviewsOverviewTab } from './feedbackReviews/ReviewsOverviewTab';
import { FeedbackOverviewTab } from './feedbackReviews/FeedbackOverviewTab';
import { 
  mockReviews,
  mockFeedback,
  mockReviewMetrics,
  mockReviewAnalytics,
  mockModerationSettings
} from './feedbackReviews/mockData';

export const FeedbackReviewsContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleRefresh = () => {
    console.log('Refreshing feedback and reviews data...');
  };

  const handleExport = () => {
    console.log('Exporting feedback and reviews data...');
  };

  const handleBulkActions = () => {
    console.log('Opening bulk actions menu...');
  };

  return (
    <div className="space-y-6">
      <FeedbackReviewsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onBulkActions={handleBulkActions}
      />

      <FeedbackReviewsStatsCards metrics={mockReviewMetrics} />

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="reviews">Reviews Management</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
          <TabsTrigger value="moderation">Moderation Tools</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsOverviewTab reviews={mockReviews} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <FeedbackOverviewTab feedback={mockFeedback} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Analytics and insights dashboard coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Advanced moderation tools coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Automation and workflow settings coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-600">Review and feedback system settings coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
