
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  UserX,
  Clock,
  Shield
} from 'lucide-react';

export const SuspendedVendorsHeader: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suspended Vendors</h1>
          <p className="text-gray-600 mt-1">Manage and review suspended vendor accounts</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Shield className="h-4 w-4 mr-2" />
            Review Appeals
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by business name, email, or vendor ID..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Suspension Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Violation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Violations</SelectItem>
                <SelectItem value="quality_issues">Quality Issues</SelectItem>
                <SelectItem value="policy_violation">Policy Violation</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="non_compliance">Non-Compliance</SelectItem>
                <SelectItem value="customer_complaints">Customer Complaints</SelectItem>
                <SelectItem value="payment_issues">Payment Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Critical (8)
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              <UserX className="h-3 w-3 mr-1" />
              Temporary (32)
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              <Clock className="h-3 w-3 mr-1" />
              Pending Appeals (12)
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              <Shield className="h-3 w-3 mr-1" />
              Eligible for Reinstatement (8)
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
