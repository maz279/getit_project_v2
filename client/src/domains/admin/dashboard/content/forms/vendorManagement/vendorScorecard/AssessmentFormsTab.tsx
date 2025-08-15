
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Star, FileText, Send, Save, Plus, Eye } from 'lucide-react';

export const AssessmentFormsTab: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [ratings, setRatings] = useState({
    quality: 0,
    delivery: 0,
    communication: 0,
    compliance: 0,
    pricing: 0
  });

  const vendors = [
    { id: '1', name: 'TechCorp Solutions', business: 'TechCorp Solutions Ltd.' },
    { id: '2', name: 'Fashion Forward Co.', business: 'Fashion Forward Company' },
    { id: '3', name: 'Home Essentials', business: 'Home Essentials Pvt Ltd' }
  ];

  const assessmentCriteria = [
    {
      category: 'quality',
      label: 'Product Quality',
      description: 'Rate the overall quality of products and services',
      questions: [
        'How would you rate the product quality consistency?',
        'Are products delivered according to specifications?',
        'How is the defect rate compared to industry standards?'
      ]
    },
    {
      category: 'delivery',
      label: 'Delivery Performance',
      description: 'Evaluate delivery timeliness and accuracy',
      questions: [
        'How often are deliveries made on time?',
        'Is the packaging adequate and professional?',
        'How accurate are the delivered orders?'
      ]
    },
    {
      category: 'communication',
      label: 'Communication',
      description: 'Assess responsiveness and communication quality',
      questions: [
        'How responsive is the vendor to inquiries?',
        'Is communication clear and professional?',
        'Are proactive updates provided when needed?'
      ]
    },
    {
      category: 'compliance',
      label: 'Compliance & Documentation',
      description: 'Review compliance with regulations and documentation',
      questions: [
        'Are all required documents provided on time?',
        'Does the vendor meet regulatory requirements?',
        'Is documentation accurate and complete?'
      ]
    },
    {
      category: 'pricing',
      label: 'Pricing & Value',
      description: 'Evaluate pricing competitiveness and value',
      questions: [
        'How competitive is the pricing compared to market rates?',
        'Does the vendor provide good value for money?',
        'Are payment terms reasonable and flexible?'
      ]
    }
  ];

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Assessment Form</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Form
          </Button>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Submit Assessment
          </Button>
        </div>
      </div>

      {/* Vendor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Assessment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendor-select">Select Vendor</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a vendor to assess" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.business}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assessment-period">Assessment Period</Label>
              <Input
                id="assessment-period"
                type="date"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="evaluator">Evaluator Name</Label>
              <Input
                id="evaluator"
                placeholder="Enter evaluator name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="quality">Quality Assurance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Criteria */}
      <div className="space-y-6">
        {assessmentCriteria.map((criterion) => (
          <Card key={criterion.category}>
            <CardHeader>
              <CardTitle className="text-lg">{criterion.label}</CardTitle>
              <p className="text-sm text-gray-600">{criterion.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Rating */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Overall {criterion.label} Rating</div>
                    <div className="text-sm text-gray-600">Rate from 1 (Poor) to 5 (Excellent)</div>
                  </div>
                  <StarRating
                    rating={ratings[criterion.category as keyof typeof ratings]}
                    onRatingChange={(rating) => handleRatingChange(criterion.category, rating)}
                  />
                </div>

                {/* Detailed Questions */}
                <div className="space-y-3">
                  <Label>Detailed Assessment Questions</Label>
                  {criterion.questions.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm font-normal">{index + 1}. {question}</Label>
                      <Textarea
                        placeholder="Provide detailed feedback and specific examples..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Improvement Suggestions */}
                <div>
                  <Label htmlFor={`improvements-${criterion.category}`}>
                    Improvement Suggestions (Optional)
                  </Label>
                  <Textarea
                    id={`improvements-${criterion.category}`}
                    placeholder="Suggest specific areas for improvement..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="overall-comments">Overall Comments</Label>
              <Textarea
                id="overall-comments"
                placeholder="Provide an overall summary of the vendor's performance..."
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                placeholder="Provide recommendations for future business relationship..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="next-review">Next Review Date</Label>
                <Input
                  id="next-review"
                  type="date"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="action-required">Action Required</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select if action is needed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Action Required</SelectItem>
                    <SelectItem value="follow_up">Follow-up Required</SelectItem>
                    <SelectItem value="improvement_plan">Improvement Plan Needed</SelectItem>
                    <SelectItem value="contract_review">Contract Review Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Calculate Overall Score */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Calculated Overall Score:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / Object.values(ratings).length || 0}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= (Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / Object.values(ratings).length)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
