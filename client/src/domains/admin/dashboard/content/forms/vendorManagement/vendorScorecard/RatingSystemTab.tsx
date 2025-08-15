
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Star, Settings, Save, Plus, Trash2 } from 'lucide-react';

export const RatingSystemTab: React.FC = () => {
  const ratingCriteria = [
    {
      id: 1,
      category: 'Product Quality',
      weight: 25,
      description: 'Overall quality of products delivered',
      subCriteria: [
        'Defect rate',
        'Material quality',
        'Durability',
        'Consistency'
      ]
    },
    {
      id: 2,
      category: 'Delivery Performance',
      weight: 20,
      description: 'Timeliness and accuracy of deliveries',
      subCriteria: [
        'On-time delivery',
        'Packaging quality',
        'Order accuracy',
        'Damage rate'
      ]
    },
    {
      id: 3,
      category: 'Communication',
      weight: 15,
      description: 'Responsiveness and clarity of communication',
      subCriteria: [
        'Response time',
        'Clarity',
        'Proactive updates',
        'Issue resolution'
      ]
    },
    {
      id: 4,
      category: 'Compliance & Documentation',
      weight: 20,
      description: 'Adherence to regulations and documentation requirements',
      subCriteria: [
        'Legal compliance',
        'Documentation accuracy',
        'Certification validity',
        'Policy adherence'
      ]
    },
    {
      id: 5,
      category: 'Pricing & Value',
      weight: 20,
      description: 'Competitive pricing and overall value proposition',
      subCriteria: [
        'Price competitiveness',
        'Value for money',
        'Payment terms',
        'Cost transparency'
      ]
    }
  ];

  const ratingScale = [
    { value: 5, label: 'Excellent', description: 'Exceeds expectations', color: 'text-green-600' },
    { value: 4, label: 'Good', description: 'Meets expectations', color: 'text-blue-600' },
    { value: 3, label: 'Satisfactory', description: 'Acceptable performance', color: 'text-yellow-600' },
    { value: 2, label: 'Needs Improvement', description: 'Below expectations', color: 'text-orange-600' },
    { value: 1, label: 'Poor', description: 'Unacceptable performance', color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Rating System Configuration</h2>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Rating Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Rating Scale Definition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {ratingScale.map((scale) => (
              <div key={scale.value} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{scale.value}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= scale.value
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${scale.color}`}>{scale.label}</div>
                  <div className="text-sm text-gray-600">{scale.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Criteria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-500" />
              Evaluation Criteria & Weights
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Criterion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {ratingCriteria.map((criterion) => (
              <div key={criterion.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <Label htmlFor={`category-${criterion.id}`}>Category Name</Label>
                    <Input
                      id={`category-${criterion.id}`}
                      value={criterion.category}
                      className="mt-1"
                    />
                  </div>
                  <div className="w-24 ml-4">
                    <Label htmlFor={`weight-${criterion.id}`}>Weight (%)</Label>
                    <Input
                      id={`weight-${criterion.id}`}
                      type="number"
                      value={criterion.weight}
                      className="mt-1"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="ml-2 mt-6">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor={`description-${criterion.id}`}>Description</Label>
                  <Textarea
                    id={`description-${criterion.id}`}
                    value={criterion.description}
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Sub-criteria</Label>
                  <div className="mt-2 space-y-2">
                    {criterion.subCriteria.map((subCriterion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={subCriterion}
                          className="flex-1"
                          placeholder="Sub-criterion"
                        />
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-criterion
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Weight:</span>
              <span className="text-lg font-bold">
                {ratingCriteria.reduce((sum, criterion) => sum + criterion.weight, 0)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              All criteria weights should total 100%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
