
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Clock, User, MessageSquare, Star, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Feedback } from './types';

interface FeedbackOverviewTabProps {
  feedback: Feedback[];
}

export const FeedbackOverviewTab: React.FC<FeedbackOverviewTabProps> = ({ feedback }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{item.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-900">{item.customerName}</h4>
                  <p className="text-sm text-gray-600">{item.customerEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(item.priority)}>
                  {item.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">{item.type}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">{item.category}</span>
                {item.subcategory && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{item.subcategory}</span>
                  </>
                )}
                <span className="text-gray-400">•</span>
                <span className={`text-sm font-medium ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment}
                </span>
              </div>
              <h5 className="font-medium text-gray-900 mb-2">{item.title}</h5>
              <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
            </div>

            {item.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{item.rating}/5</span>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {item.attachments && item.attachments.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                <div className="space-y-1">
                  {item.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                      <span>📎</span>
                      <span>{attachment.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                {item.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {item.assignedTo}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {item.source}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                {item.status === 'open' && (
                  <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                    Assign
                  </Button>
                )}
                {item.status === 'in_progress' && (
                  <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>

            {item.customerSatisfactionScore && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  Customer Satisfaction Score: {item.customerSatisfactionScore}/10
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
