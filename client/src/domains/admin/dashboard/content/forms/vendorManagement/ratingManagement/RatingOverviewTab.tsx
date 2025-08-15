
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Star, TrendingUp, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import { mockVendorRatings, mockRecentReviews } from './mockData';

export const RatingOverviewTab: React.FC = () => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'approved': { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'pending': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'flagged': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className="space-y-6">
      {/* Top Vendor Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Top Performing Vendors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVendorRatings.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{vendor.vendorName}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className={`h-4 w-4 fill-current ${getRatingColor(vendor.overallRating)}`} />
                      <span className={`font-medium ${getRatingColor(vendor.overallRating)}`}>
                        {vendor.overallRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">({vendor.totalReviews} reviews)</span>
                    {vendor.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Quality:</span>
                      <span className="ml-1 font-medium">{vendor.productQuality.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Delivery:</span>
                      <span className="ml-1 font-medium">{vendor.deliverySpeed.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <span className="ml-1 font-medium">{vendor.customerService.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Communication:</span>
                      <span className="ml-1 font-medium">{vendor.communication.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={vendor.status === 'Excellent' ? 'default' : 'secondary'}>
                    {vendor.status}
                  </Badge>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
              Recent Reviews
            </CardTitle>
            <Button variant="outline" size="sm">
              View All Reviews
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{review.customerName}</span>
                      {review.isVerified && (
                        <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{review.vendorName}</span>
                      <span>•</span>
                      <span>{review.productName}</span>
                      <span>•</span>
                      <span>{review.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge className={getStatusBadge(review.status).color}>
                      {review.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.reviewText}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">{review.helpful} helpful</span>
                    </div>
                    {review.reported > 0 && (
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-red-400" />
                        <span className="text-red-500">{review.reported} reported</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    {review.status === 'flagged' && (
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
