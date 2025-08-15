
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { CommissionTrackingService, VendorCommissionRate } from '@/shared/services/database/CommissionTrackingService';
import { Plus, Edit, Trash2, Settings, TrendingUp } from 'lucide-react';

export const CommissionRatesTab: React.FC = () => {
  const [rates, setRates] = useState<VendorCommissionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      const data = await CommissionTrackingService.getCommissionRates();
      setRates(data);
    } catch (error) {
      console.error('Error loading commission rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRateTypeBadge = (type: string) => {
    const colors = {
      percentage: 'bg-blue-100 text-blue-800',
      fixed_amount: 'bg-green-100 text-green-800',
      tiered: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Commission Rate Configuration</CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Rate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates.map((rate) => (
              <Card key={rate.id} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{rate.product_type || 'General'}</h4>
                      <p className="text-sm text-gray-600">Vendor: {rate.vendor_id}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rate Type:</span>
                    {getRateTypeBadge(rate.rate_type)}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Base Rate:</span>
                    <span className="font-medium text-green-600">
                      {rate.rate_type === 'percentage' ? `${rate.base_rate}%` : `৳${rate.base_rate}`}
                    </span>
                  </div>
                  
                  {rate.minimum_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Minimum:</span>
                      <span className="text-sm">৳{rate.minimum_amount}</span>
                    </div>
                  )}
                  
                  {rate.maximum_amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Maximum:</span>
                      <span className="text-sm">৳{rate.maximum_amount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Platform Fee:</span>
                    <span className="text-sm">{rate.platform_fee_rate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Effective From:</span>
                    <span className="text-sm">{new Date(rate.effective_from).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={rate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {rate.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  {rate.rate_type === 'tiered' && rate.tier_rates.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600 mb-2 block">Tier Structure:</span>
                      <div className="space-y-1">
                        {rate.tier_rates.slice(0, 2).map((tier: any, index: number) => (
                          <div key={index} className="text-xs text-gray-500">
                            {tier.min_amount} - {tier.max_amount}: {tier.rate}%
                          </div>
                        ))}
                        {rate.tier_rates.length > 2 && (
                          <div className="text-xs text-blue-600">
                            +{rate.tier_rates.length - 2} more tiers
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {rates.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No commission rates configured yet.</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Add Your First Rate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Bulk Rate Update
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Rate Analytics
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              Import Rates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
