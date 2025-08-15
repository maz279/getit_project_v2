
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
  FileText, 
  Clock,
  AlertTriangle
} from 'lucide-react';

export const PendingApplicationsHeader: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Vendor Applications</h1>
          <p className="text-gray-600 mt-1">Review and process new vendor registration requests</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Applications
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <FileText className="h-4 w-4 mr-2" />
            Bulk Review
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
                  placeholder="Search by business name, email, or application number..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Application Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="pending_documents">Pending Documents</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Priority Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              <Clock className="h-3 w-3 mr-1" />
              Pending Review (42)
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              <FileText className="h-3 w-3 mr-1" />
              Missing Documents (34)
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent (8)
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
