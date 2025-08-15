import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  CreditCard, 
  Building, 
  Smartphone, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { PaymentMethod } from '../services/paymentIntegrationService';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethods: string[];
  onMethodSelect: (methodId: string, selected: boolean) => void;
  loading: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods,
  selectedMethods,
  onMethodSelect,
  loading
}) => {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return <Building className="w-6 h-6 text-blue-500" />;
      case 'mobile_banking':
        return <Smartphone className="w-6 h-6 text-purple-500" />;
      case 'credit_card':
        return <CreditCard className="w-6 h-6 text-green-500" />;
      case 'digital_wallet':
        return <Globe className="w-6 h-6 text-orange-500" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFee = (fixed: number, percentage: number) => {
    return `৳${fixed} + ${percentage}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Available Payment Methods</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {methods.length} methods available
        </Badge>
      </div>

      {methods.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No payment methods available. Please contact support to set up payment processing.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method) => (
            <Card 
              key={method.id} 
              className={`cursor-pointer transition-colors ${
                selectedMethods.includes(method.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => onMethodSelect(method.id, !selectedMethods.includes(method.id))}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMethodIcon(method.type)}
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {method.provider}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(method.status)}
                    <Checkbox
                      checked={selectedMethods.includes(method.id)}
                      onChange={(checked) => onMethodSelect(method.id, checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Fee</span>
                    <Badge variant="outline">
                      {formatFee(method.fees.fixed, method.fees.percentage)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge 
                      variant={method.status === 'active' ? 'default' : 'destructive'}
                    >
                      {method.status}
                    </Badge>
                  </div>

                  {method.configuration && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedMethod(
                            expandedMethod === method.id ? null : method.id
                          );
                        }}
                      >
                        {expandedMethod === method.id ? 'Hide Details' : 'Show Details'}
                      </Button>
                      
                      {expandedMethod === method.id && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <div className="space-y-2 text-sm">
                            {method.configuration.processing_time && (
                              <div className="flex justify-between">
                                <span>Processing Time:</span>
                                <span className="font-medium">
                                  {method.configuration.processing_time}
                                </span>
                              </div>
                            )}
                            {method.configuration.minimum_amount && (
                              <div className="flex justify-between">
                                <span>Minimum Amount:</span>
                                <span className="font-medium">
                                  ৳{method.configuration.minimum_amount}
                                </span>
                              </div>
                            )}
                            {method.configuration.maximum_amount && (
                              <div className="flex justify-between">
                                <span>Maximum Amount:</span>
                                <span className="font-medium">
                                  ৳{method.configuration.maximum_amount}
                                </span>
                              </div>
                            )}
                            {method.configuration.transaction_limits && (
                              <div>
                                <span className="font-medium">Transaction Limits:</span>
                                <div className="ml-2 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Daily:</span>
                                    <span>৳{method.configuration.transaction_limits.daily}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Monthly:</span>
                                    <span>৳{method.configuration.transaction_limits.monthly}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedMethods.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You have selected {selectedMethods.length} payment method(s). 
            Customers will be able to pay using these methods.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};