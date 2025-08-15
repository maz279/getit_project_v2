
import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { PaymentMethodCard } from './PaymentMethodCard';

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

interface PaymentMethodsTabProps {
  paymentMethods: PaymentMethod[];
}

export const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({ paymentMethods }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search payment methods..."
                  className="pl-10 pr-4 py-2 w-80 focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="all">All Providers</option>
                <option value="stripe">Stripe</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="local">Local Banks</option>
              </select>
              <select 
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">✅ Active</option>
                <option value="inactive">❌ Inactive</option>
                <option value="pending">⏳ Pending</option>
                <option value="maintenance">🔧 Maintenance</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map((method, index) => (
          <PaymentMethodCard key={index} method={method} />
        ))}
      </div>
    </div>
  );
};
