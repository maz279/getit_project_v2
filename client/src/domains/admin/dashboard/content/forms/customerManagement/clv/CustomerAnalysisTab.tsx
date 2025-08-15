
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { TrendingUp, TrendingDown, Minus, Mail, Phone, Eye } from 'lucide-react';
import { CLVCustomer } from './types';

interface CustomerAnalysisTabProps {
  customers: CLVCustomer[];
}

export const CustomerAnalysisTab: React.FC<CustomerAnalysisTabProps> = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<CLVCustomer | null>(null);

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'high_value': return 'bg-green-100 text-green-800';
      case 'medium_value': return 'bg-blue-100 text-blue-800';
      case 'low_value': return 'bg-yellow-100 text-yellow-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'new_customer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `৳${amount.toLocaleString()}`;
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk < 0.3) return 'text-green-600';
    if (risk < 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {selectedCustomer ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Detail Analysis</CardTitle>
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Back to List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>{selectedCustomer.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCustomer.customerName}</h3>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                    <p className="text-sm text-gray-500">ID: {selectedCustomer.customerId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Current CLV</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.currentCLV)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Predicted CLV</div>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedCustomer.predictedCLV)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Loyalty Score</span>
                    <span className="text-sm font-bold">{selectedCustomer.loyaltyScore}/100</span>
                  </div>
                  <Progress value={selectedCustomer.loyaltyScore} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Churn Risk</span>
                    <span className={`text-sm font-bold ${getChurnRiskColor(selectedCustomer.churnProbability)}`}>
                      {(selectedCustomer.churnProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={selectedCustomer.churnProbability * 100} className="h-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="text-xl font-bold">{selectedCustomer.totalOrders}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Total Spent</div>
                    <div className="text-xl font-bold">{formatCurrency(selectedCustomer.totalSpent)}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Avg Order Value</div>
                    <div className="text-xl font-bold">{formatCurrency(selectedCustomer.averageOrderValue)}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Months Active</div>
                    <div className="text-xl font-bold">{selectedCustomer.monthsActive}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Preferred Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.preferredCategories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">Cross-sell Potential</div>
                    <div className="text-lg font-bold text-blue-700">{selectedCustomer.crossSellPotential}%</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">Up-sell Potential</div>
                    <div className="text-lg font-bold text-green-700">{selectedCustomer.upSellPotential}%</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Customer CLV Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Current CLV</TableHead>
                  <TableHead>Predicted CLV</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Churn Risk</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{customer.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.customerName}</div>
                          <div className="text-sm text-gray-600">{customer.customerId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSegmentColor(customer.customerSegment)}>
                        {customer.customerSegment.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(customer.currentCLV)}</TableCell>
                    <TableCell className="font-medium text-blue-600">{formatCurrency(customer.predictedCLV)}</TableCell>
                    <TableCell>{getTrendIcon(customer.clvTrend)}</TableCell>
                    <TableCell>
                      <span className={getChurnRiskColor(customer.churnProbability)}>
                        {(customer.churnProbability * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(customer)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
