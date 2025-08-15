
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { RevenueSharingService } from '@/shared/services/database/revenue/RevenueSharingService';
import { RevenueModel } from '@/types/revenue';

export const RevenueModelsTab: React.FC = () => {
  const [models, setModels] = useState<RevenueModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModelType, setSelectedModelType] = useState<'percentage' | 'tiered' | 'flat_fee' | 'hybrid'>('percentage');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadRevenueModels();
  }, []);

  const loadRevenueModels = async () => {
    try {
      setLoading(true);
      const data = await RevenueSharingService.getRevenueModels();
      
      // Properly cast the database response to our interface
      const typedModels: RevenueModel[] = data.map(model => ({
        ...model,
        model_type: model.model_type as 'percentage' | 'tiered' | 'flat_fee' | 'hybrid',
        tier_structure: Array.isArray(model.tier_structure) 
          ? model.tier_structure 
          : typeof model.tier_structure === 'string' 
            ? JSON.parse(model.tier_structure) 
            : [],
        category_rates: typeof model.category_rates === 'object' && model.category_rates !== null
          ? model.category_rates as Record<string, any>
          : {}
      }));
      
      setModels(typedModels);
    } catch (error) {
      console.error('Error loading revenue models:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading revenue models...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Revenue Models</h3>
          <p className="text-gray-600">Configure commission models and revenue sharing structures</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Model
        </Button>
      </div>

      {/* Revenue Model Creation Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Revenue Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Model Name</Label>
                <Input placeholder="e.g., Electronics Commission Model" />
              </div>
              <div className="space-y-2">
                <Label>Model Type</Label>
                <Select value={selectedModelType} onValueChange={(value: 'percentage' | 'tiered' | 'flat_fee' | 'hybrid') => setSelectedModelType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Based</SelectItem>
                    <SelectItem value="tiered">Tiered Structure</SelectItem>
                    <SelectItem value="flat_fee">Flat Fee</SelectItem>
                    <SelectItem value="hybrid">Hybrid Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the revenue model and its purpose..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Base Rate (%)</Label>
                <Input type="number" placeholder="10.00" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Minimum Threshold (৳)</Label>
                <Input type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label>Maximum Threshold (৳)</Label>
                <Input type="number" placeholder="50000" />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button>
                Create Model
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Models List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{model.model_name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={model.is_active ? "default" : "secondary"}>
                    {model.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {model.model_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {model.description || 'No description provided'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Base Rate:</span>
                  <p>{model.base_rate}%</p>
                </div>
                <div>
                  <span className="font-medium">Min Threshold:</span>
                  <p>৳{model.minimum_threshold?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  Effective from: {new Date(model.effective_from).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {models.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">
              No revenue models configured yet.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Model
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
