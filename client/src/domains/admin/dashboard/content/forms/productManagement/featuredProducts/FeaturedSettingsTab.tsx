
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import { Badge } from '@/shared/ui/badge';
import { Settings, Star, Clock, Shield, Target, Award, Save, RotateCcw } from 'lucide-react';
import { FeaturedSettings } from './types';

interface FeaturedSettingsTabProps {
  settings: FeaturedSettings;
}

export const FeaturedSettingsTab: React.FC<FeaturedSettingsTabProps> = ({ settings }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: keyof FeaturedSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePlacementRuleChange = (placement: keyof FeaturedSettings['placementRules'], value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      placementRules: {
        ...prev.placementRules,
        [placement]: value
      }
    }));
  };

  const handleQualityThresholdChange = (threshold: keyof FeaturedSettings['qualityThresholds'], value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      qualityThresholds: {
        ...prev.qualityThresholds,
        [threshold]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Featured Products Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              General Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxFeatured">Maximum Featured Products</Label>
                <Input
                  id="maxFeatured"
                  type="number"
                  value={localSettings.maxFeaturedProducts}
                  onChange={(e) => handleSettingChange('maxFeaturedProducts', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Maximum number of products that can be featured simultaneously</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultDuration">Default Featured Duration (days)</Label>
                <Input
                  id="defaultDuration"
                  type="number"
                  value={localSettings.defaultFeaturedDuration}
                  onChange={(e) => handleSettingChange('defaultFeaturedDuration', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Default duration for featured products</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Auto-Rotation Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Auto-Rotation Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoRotation">Enable Auto-Rotation</Label>
                  <p className="text-sm text-gray-500">Automatically rotate featured products</p>
                </div>
                <Switch
                  id="autoRotation"
                  checked={localSettings.autoRotation}
                  onCheckedChange={(checked) => handleSettingChange('autoRotation', checked)}
                />
              </div>
              
              {localSettings.autoRotation && (
                <div className="space-y-2">
                  <Label htmlFor="rotationInterval">Rotation Interval (hours)</Label>
                  <Input
                    id="rotationInterval"
                    type="number"
                    value={localSettings.rotationInterval}
                    onChange={(e) => handleSettingChange('rotationInterval', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">How often featured products should rotate</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Approval Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Approval & Quality Control
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireApproval">Require Admin Approval</Label>
                  <p className="text-sm text-gray-500">All featured products must be approved by admin</p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={localSettings.requireApproval}
                  onCheckedChange={(checked) => handleSettingChange('requireApproval', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vendorNomination">Allow Vendor Nomination</Label>
                  <p className="text-sm text-gray-500">Vendors can nominate their products to be featured</p>
                </div>
                <Switch
                  id="vendorNomination"
                  checked={localSettings.allowVendorNomination}
                  onCheckedChange={(checked) => handleSettingChange('allowVendorNomination', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Placement Rules */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-500" />
              Placement Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homepageSlots">Homepage Slots</Label>
                <Input
                  id="homepageSlots"
                  type="number"
                  value={localSettings.placementRules.homepage}
                  onChange={(e) => handlePlacementRuleChange('homepage', parseInt(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">High Impact</Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categorySlots">Category Page Slots</Label>
                <Input
                  id="categorySlots"
                  type="number"
                  value={localSettings.placementRules.categoryPages}
                  onChange={(e) => handlePlacementRuleChange('categoryPages', parseInt(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">Targeted</Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="searchSlots">Search Result Slots</Label>
                <Input
                  id="searchSlots"
                  type="number"
                  value={localSettings.placementRules.searchResults}
                  onChange={(e) => handlePlacementRuleChange('searchResults', parseInt(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">Intent-Based</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quality Thresholds */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-orange-500" />
              Quality Thresholds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minRating">Minimum Rating</Label>
                <Input
                  id="minRating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={localSettings.qualityThresholds.minRating}
                  onChange={(e) => handleQualityThresholdChange('minRating', parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500">Minimum star rating required</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minReviews">Minimum Reviews</Label>
                <Input
                  id="minReviews"
                  type="number"
                  value={localSettings.qualityThresholds.minReviews}
                  onChange={(e) => handleQualityThresholdChange('minReviews', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Minimum number of reviews</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={localSettings.qualityThresholds.minStock}
                  onChange={(e) => handleQualityThresholdChange('minStock', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Minimum stock level required</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setLocalSettings(settings)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
