
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Zap, DollarSign, Package, Archive } from 'lucide-react';

interface BulkOperationsTabProps {
  onOperationStart: (operation: any) => void;
  activeOperations: any[];
}

export const BulkOperationsTab: React.FC<BulkOperationsTabProps> = ({ onOperationStart, activeOperations }) => {
  const [operationType, setOperationType] = useState('update-prices');
  const [criteria, setCriteria] = useState({
    category: '',
    vendor: '',
    priceMin: '',
    priceMax: '',
    stockMin: '',
    stockMax: ''
  });

  const operationTypes = [
    { value: 'update-prices', label: 'Update Prices', icon: DollarSign },
    { value: 'update-inventory', label: 'Update Inventory', icon: Package },
    { value: 'update-status', label: 'Update Status', icon: Archive },
    { value: 'assign-categories', label: 'Assign Categories', icon: Archive }
  ];

  const handleBulkOperationStart = () => {
    const newOperation = {
      id: Date.now().toString(),
      operationType,
      status: 'pending' as const,
      progress: 0,
      startTime: new Date(),
      criteria,
      createdBy: 'current-user'
    };
    onOperationStart(newOperation);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {operationTypes.map((op) => {
          const IconComponent = op.icon;
          return (
            <Card 
              key={op.value}
              className={`cursor-pointer transition-all ${
                operationType === op.value 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setOperationType(op.value)}
            >
              <CardContent className="p-4 text-center">
                <IconComponent className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">{op.label}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Bulk Operation Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category Filter</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Vendor Filter</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  <SelectItem value="apple">Apple Authorized</SelectItem>
                  <SelectItem value="samsung">Samsung Bangladesh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Price Range</Label>
              <div className="flex space-x-2">
                <Input placeholder="Min price" type="number" />
                <Input placeholder="Max price" type="number" />
              </div>
            </div>

            <div>
              <Label>Stock Range</Label>
              <div className="flex space-x-2">
                <Input placeholder="Min stock" type="number" />
                <Input placeholder="Max stock" type="number" />
              </div>
            </div>
          </div>

          {operationType === 'update-prices' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium">Price Update Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Update Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Change</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="replace">Replace Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input placeholder="Enter value" type="number" />
                </div>
              </div>
            </div>
          )}

          {operationType === 'update-inventory' && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium">Inventory Update Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Update Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add to Stock</SelectItem>
                      <SelectItem value="subtract">Subtract from Stock</SelectItem>
                      <SelectItem value="replace">Replace Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input placeholder="Enter quantity" type="number" />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label>Notes (Optional)</Label>
            <Textarea 
              placeholder="Add any notes about this bulk operation..."
              className="mt-1"
            />
          </div>

          <Button onClick={handleBulkOperationStart} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Start Bulk Operation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
