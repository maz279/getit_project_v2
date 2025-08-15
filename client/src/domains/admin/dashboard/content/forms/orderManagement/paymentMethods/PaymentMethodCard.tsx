
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  type: string;
  status: string;
  setupDate: string;
  transactionCount: number;
  revenue: number;
  successRate: number;
  avgProcessingTime: string;
  fees: string;
  regions: string[];
  currency: string[];
  icon: any;
  color: string;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'maintenance':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />;
    case 'inactive':
      return <XCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'maintenance':
      return <Settings className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ method }) => {
  const IconComponent = method.icon;
  
  return (
    <Card className={`border-l-4 hover:shadow-lg transition-shadow ${
      method.status === 'Active' ? 'border-l-green-500 bg-green-50' :
      method.status === 'Inactive' ? 'border-l-red-500 bg-red-50' :
      'border-l-yellow-500 bg-yellow-50'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${method.color}-100`}>
              <IconComponent className={`h-6 w-6 text-${method.color}-600`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{method.name}</h3>
              <p className="text-sm text-gray-500">{method.provider}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(method.status)} flex items-center space-x-1`}>
            {getStatusIcon(method.status)}
            <span>{method.status}</span>
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Transactions:</span>
              <p className="font-medium">{method.transactionCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Revenue:</span>
              <p className="font-medium">৳ {method.revenue.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Success Rate:</span>
              <p className="font-medium text-green-600">{method.successRate}%</p>
            </div>
            <div>
              <span className="text-gray-500">Avg Time:</span>
              <p className="font-medium">{method.avgProcessingTime}</p>
            </div>
          </div>

          <div className="text-sm">
            <span className="text-gray-500">Fees:</span>
            <p className="font-medium text-orange-600">{method.fees}</p>
          </div>

          <div className="text-sm">
            <span className="text-gray-500">Regions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {method.regions.map((region, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {region}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
