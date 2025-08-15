
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Star, ThumbsUp, ThumbsDown, Flag, MessageSquare, Image, CheckCircle, XCircle } from 'lucide-react';
import { Review } from './types';

interface ReviewsOverviewTabProps {
  reviews: Review[];
}

export const ReviewsOverviewTab: React.FC<ReviewsOverviewTabProps> = ({ reviews }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.customerAvatar} alt={review.customerName} />
                  <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{review.customerEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(review.status)}>
                  {review.status}
                </Badge>
                <span className={`text-sm font-medium ${getSentimentColor(review.sentiment)}`}>
                  {review.sentiment}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              {review.productImage && (
                <img
                  src={review.productImage}
                  alt={review.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{review.productName}</h5>
                <p className="text-sm text-gray-600">by {review.vendorName}</p>
                <p className="text-xs text-gray-500">Order #{review.orderId}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(review.rating)}
                <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
                <span className="text-sm text-gray-500">
                  • {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h6 className="font-medium text-gray-900 mb-1">{review.title}</h6>
              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
            </div>

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            )}

            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {review.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <ThumbsUp className="h-4 w-4" />
                  {review.helpful}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <ThumbsDown className="h-4 w-4" />
                  {review.notHelpful}
                </div>
                {review.reportCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <Flag className="h-4 w-4" />
                    {review.reportCount}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {review.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Respond
                </Button>
              </div>
            </div>

            {review.responseFromVendor && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Vendor Response:</p>
                <p className="text-sm text-gray-700">{review.responseFromVendor.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  by {review.responseFromVendor.respondedBy} • 
                  {new Date(review.responseFromVendor.timestamp).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
