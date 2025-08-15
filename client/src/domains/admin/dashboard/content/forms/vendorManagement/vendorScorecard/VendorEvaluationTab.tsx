
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Star, Eye, Edit, MessageSquare, Calendar, User, Building } from 'lucide-react';

export const VendorEvaluationTab: React.FC = () => {
  const evaluations = [
    {
      id: 1,
      vendorName: 'TechCorp Solutions',
      businessName: 'TechCorp Solutions Ltd.',
      category: 'Electronics',
      lastEvaluation: '2024-01-15',
      overallRating: 4.2,
      status: 'excellent',
      evaluator: 'Sarah Johnson',
      nextReview: '2024-04-15',
      scores: {
        quality: 4.5,
        delivery: 4.0,
        communication: 4.2,
        compliance: 4.1,
        pricing: 3.8
      }
    },
    {
      id: 2,
      vendorName: 'Fashion Forward Co.',
      businessName: 'Fashion Forward Company',
      category: 'Apparel',
      lastEvaluation: '2024-01-10',
      overallRating: 3.8,
      status: 'good',
      evaluator: 'Mike Chen',
      nextReview: '2024-04-10',
      scores: {
        quality: 4.0,
        delivery: 3.5,
        communication: 4.0,
        compliance: 3.8,
        pricing: 3.9
      }
    },
    {
      id: 3,
      vendorName: 'Home Essentials',
      businessName: 'Home Essentials Pvt Ltd',
      category: 'Home & Garden',
      lastEvaluation: '2024-01-08',
      overallRating: 2.8,
      status: 'needs_improvement',
      evaluator: 'Lisa Wang',
      nextReview: '2024-02-08',
      scores: {
        quality: 3.0,
        delivery: 2.5,
        communication: 2.8,
        compliance: 2.9,
        pricing: 3.2
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_improvement': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.0) return 'text-green-600';
    if (rating >= 3.0) return 'text-blue-600';
    if (rating >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Evaluations</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          <Edit className="h-4 w-4 mr-2" />
          New Evaluation
        </Button>
      </div>

      <div className="grid gap-6">
        {evaluations.map((evaluation) => (
          <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{evaluation.businessName}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {evaluation.vendorName} • {evaluation.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(evaluation.status)}>
                    {evaluation.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRatingColor(evaluation.overallRating)}`}>
                      {evaluation.overallRating.toFixed(1)}
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= evaluation.overallRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Score Breakdown */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                {Object.entries(evaluation.scores).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 capitalize">{category}</span>
                      <span className="text-xs font-medium">{score.toFixed(1)}</span>
                    </div>
                    <Progress value={score * 20} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Evaluation Details */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Last Evaluation</div>
                    <div className="text-sm font-medium">{evaluation.lastEvaluation}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Evaluator</div>
                    <div className="text-sm font-medium">{evaluation.evaluator}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-xs text-gray-500">Next Review</div>
                    <div className="text-sm font-medium">{evaluation.nextReview}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Evaluation
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Feedback
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  {evaluation.status === 'needs_improvement' && (
                    <span className="text-orange-600 font-medium">Action Required</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
