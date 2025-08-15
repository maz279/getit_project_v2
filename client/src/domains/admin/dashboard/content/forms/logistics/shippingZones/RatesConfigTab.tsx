
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { DollarSign, Package, Truck, Clock, Edit, Plus } from 'lucide-react';
import { ShippingZone } from './types';

interface RatesConfigTabProps {
  zones: ShippingZone[];
  selectedZone: ShippingZone | null;
}

export const RatesConfigTab: React.FC<RatesConfigTabProps> = ({ zones, selectedZone }) => {
  return (
    <div className="space-y-6">
      {/* Zone Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Shipping Rates Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Configure shipping rates and pricing for different zones. Select a zone to view or modify its rates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <Card key={zone.id} className="border-2 hover:border-blue-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{zone.name}</h4>
                    <Badge className={zone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {zone.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{zone.code}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Base Rate:</span>
                      <span className="font-medium">৳{zone.baseCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per KG:</span>
                      <span className="font-medium">৳{zone.costPerKg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Free Shipping:</span>
                      <span className="font-medium">৳{zone.freeShippingThreshold}+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Rate Configuration
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Rate Tier
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedZone ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Configuring rates for: {selectedZone.name}
                </h4>
                <p className="text-sm text-blue-700">
                  Zone Code: {selectedZone.code} | Type: {selectedZone.type}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="baseCost">Base Cost (৳)</Label>
                    <Input id="baseCost" type="number" defaultValue={selectedZone.baseCost} />
                  </div>
                  <div>
                    <Label htmlFor="costPerKg">Cost Per KG (৳)</Label>
                    <Input id="costPerKg" type="number" defaultValue={selectedZone.costPerKg} />
                  </div>
                  <div>
                    <Label htmlFor="costPerKm">Cost Per KM (৳)</Label>
                    <Input id="costPerKm" type="number" defaultValue={selectedZone.costPerKm} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="freeShipping">Free Shipping Threshold (৳)</Label>
                    <Input id="freeShipping" type="number" defaultValue={selectedZone.freeShippingThreshold} />
                  </div>
                  <div>
                    <Label htmlFor="maxWeight">Maximum Weight (KG)</Label>
                    <Input id="maxWeight" type="number" defaultValue={selectedZone.maxWeight} />
                  </div>
                  <div>
                    <Label htmlFor="deliveryTime">Delivery Time (Days)</Label>
                    <div className="flex space-x-2">
                      <Input placeholder="Min" type="number" defaultValue={selectedZone.deliveryTimeMin} />
                      <Input placeholder="Max" type="number" defaultValue={selectedZone.deliveryTimeMax} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline">Reset</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No Zone Selected</h4>
              <p className="text-gray-500">Select a zone from above to configure its shipping rates</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate Tiers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Weight-Based Rate Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left">Weight Range (KG)</th>
                  <th className="border border-gray-200 p-3 text-left">Standard Rate (৳)</th>
                  <th className="border border-gray-200 p-3 text-left">Express Rate (৳)</th>
                  <th className="border border-gray-200 p-3 text-left">COD Fee (৳)</th>
                  <th className="border border-gray-200 p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-3">0 - 1 KG</td>
                  <td className="border border-gray-200 p-3">৳60</td>
                  <td className="border border-gray-200 p-3">৳80</td>
                  <td className="border border-gray-200 p-3">৳10</td>
                  <td className="border border-gray-200 p-3">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3">1 - 5 KG</td>
                  <td className="border border-gray-200 p-3">৳80</td>
                  <td className="border border-gray-200 p-3">৳120</td>
                  <td className="border border-gray-200 p-3">৳15</td>
                  <td className="border border-gray-200 p-3">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3">5+ KG</td>
                  <td className="border border-gray-200 p-3">৳100 + ৳15/kg</td>
                  <td className="border border-gray-200 p-3">৳150 + ৳20/kg</td>
                  <td className="border border-gray-200 p-3">৳20</td>
                  <td className="border border-gray-200 p-3">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
