
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Scan,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { mockNidRecords } from './mockData';

export const PendingNidTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  
  const pendingNids = mockNidRecords.filter(nid => nid.status === 'pending');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-400 text-white';
      case 'medium': return 'bg-yellow-400 text-white';
      case 'low': return 'bg-green-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              Pending NID Verifications ({pendingNids.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline">
                <Scan className="h-4 w-4 mr-2" />
                Bulk Scan
              </Button>
              <Button size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Bulk Approve
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by NID number, vendor name, or holder name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending NID Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pendingNids.map((nid) => (
          <Card key={nid.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-gray-900">{nid.nidNumber}</span>
                    <Badge className={getPriorityColor(nid.priority)}>
                      {nid.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{nid.businessName}</p>
                </div>
                <Badge className={getRiskLevelColor(nid.riskLevel)}>
                  {nid.riskLevel} risk
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Holder Information */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-sm">{nid.holderName}</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>DOB: {new Date(nid.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{nid.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{nid.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{nid.division}, {nid.district}</span>
                  </div>
                </div>
              </div>

              {/* Verification Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Compliance Score:</span>
                  <span className={`font-medium ${nid.complianceScore >= 80 ? 'text-green-600' : nid.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {nid.complianceScore}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Verification Method:</span>
                  <span className="font-medium capitalize">{nid.verificationMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">NID Type:</span>
                  <Badge variant="outline" className="text-xs">
                    {nid.nidType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Fraud Flags */}
              {nid.fraudFlags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    Fraud Flags:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {nid.fraudFlags.map((flag, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {flag.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Notes */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Verification Notes</p>
                    <p className="text-xs text-blue-700 mt-1">{nid.verificationNotes}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {nid.verificationMethod === 'biometric' && (
                    <Button size="sm" variant="outline">
                      <Scan className="h-4 w-4 mr-1" />
                      Scan
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Load More NIDs
        </Button>
      </div>
    </div>
  );
};
