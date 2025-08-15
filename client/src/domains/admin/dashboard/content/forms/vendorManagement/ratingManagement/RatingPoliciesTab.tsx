
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { Shield, FileText, Settings, Save, AlertTriangle } from 'lucide-react';

export const RatingPoliciesTab: React.FC = () => {
  const [autoModeration, setAutoModeration] = useState(true);
  const [requireVerification, setRequireVerification] = useState(false);
  const [allowEditing, setAllowEditing] = useState(true);

  const policyCategories = [
    {
      title: 'Review Guidelines',
      policies: [
        'Reviews must be based on genuine experience with the product/service',
        'No profanity, hate speech, or inappropriate content',
        'Reviews should be constructive and helpful to other customers',
        'Personal information should not be shared in reviews'
      ]
    },
    {
      title: 'Vendor Guidelines',
      policies: [
        'Vendors cannot offer incentives for positive reviews',
        'Fake reviews or review manipulation is strictly prohibited',
        'Vendors can respond to reviews professionally and constructively',
        'Vendors cannot demand removal of legitimate negative reviews'
      ]
    },
    {
      title: 'Moderation Policies',
      policies: [
        'All reviews are subject to automated and manual moderation',
        'Reviews violating guidelines will be flagged or removed',
        'Repeat violations may result in account restrictions',
        'Appeals process is available for disputed decisions'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Policy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-500" />
            Rating System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-moderation">Auto-Moderation</Label>
                  <p className="text-sm text-gray-500">Automatically moderate reviews using AI</p>
                </div>
                <Switch
                  id="auto-moderation"
                  checked={autoModeration}
                  onCheckedChange={setAutoModeration}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-verification">Require Purchase Verification</Label>
                  <p className="text-sm text-gray-500">Only allow reviews from verified purchasers</p>
                </div>
                <Switch
                  id="require-verification"
                  checked={requireVerification}
                  onCheckedChange={setRequireVerification}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-editing">Allow Review Editing</Label>
                  <p className="text-sm text-gray-500">Let customers edit their reviews</p>
                </div>
                <Switch
                  id="allow-editing"
                  checked={allowEditing}
                  onCheckedChange={setAllowEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="min-chars">Minimum Review Length</Label>
                <Input
                  id="min-chars"
                  type="number"
                  placeholder="50"
                  defaultValue="50"
                />
                <p className="text-sm text-gray-500 mt-1">Minimum characters required for reviews</p>
              </div>
              
              <div>
                <Label htmlFor="max-chars">Maximum Review Length</Label>
                <Input
                  id="max-chars"
                  type="number"
                  placeholder="2000"
                  defaultValue="2000"
                />
                <p className="text-sm text-gray-500 mt-1">Maximum characters allowed for reviews</p>
              </div>
              
              <div>
                <Label htmlFor="review-cooldown">Review Cooldown Period</Label>
                <Input
                  id="review-cooldown"
                  type="number"
                  placeholder="24"
                  defaultValue="24"
                />
                <p className="text-sm text-gray-500 mt-1">Hours between reviews from same user</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {policyCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {category.policies.map((policy, policyIndex) => (
                  <li key={policyIndex} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{policy}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-red-500" />
            Content Moderation Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banned-words">Banned Words/Phrases</Label>
              <Textarea
                id="banned-words"
                placeholder="Enter comma-separated list of banned words or phrases..."
                className="mt-1"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">Reviews containing these terms will be automatically flagged</p>
            </div>
            
            <div>
              <Label htmlFor="auto-responses">Automated Response Templates</Label>
              <Textarea
                id="auto-responses"
                placeholder="Template for responding to flagged reviews..."
                className="mt-1"
                rows={4}
                defaultValue="Thank you for your review. We take all feedback seriously and are investigating the concerns raised. Our team will respond within 24-48 hours."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                  Warning Thresholds
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Fake Review Risk Score:</span>
                    <Badge variant="outline">≥ 70%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Sentiment Negativity:</span>
                    <Badge variant="outline">≥ 85%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate Content:</span>
                    <Badge variant="outline">≥ 80%</Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                  Auto-Approval Criteria
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Verified Purchase:</span>
                    <Badge variant="default">Required</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Score:</span>
                    <Badge variant="default">≤ 30%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Age:</span>
                    <Badge variant="default">≥ 30 days</Badge>
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
