
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle, Building, MapPin, Phone } from 'lucide-react';
import { mockTradeLicenses } from './mockData';

export const PendingLicensesTab: React.FC = () => {
  const pendingLicenses = mockTradeLicenses.filter(license => license.status === 'pending');

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'trade': return 'bg-blue-100 text-blue-800';
      case 'manufacturing': return 'bg-purple-100 text-purple-800';
      case 'import_export': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-orange-100 text-orange-800';
      case 'retail': return 'bg-pink-100 text-pink-800';
      case 'wholesale': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Trade License Verification ({pendingLicenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Details</TableHead>
                  <TableHead>License Info</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Compliance Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-900">{license.businessName}</div>
                        <div className="text-sm text-gray-500">{license.vendorName}</div>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <Building className="h-3 w-3 mr-1" />
                          {license.businessCategory}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {license.contactDetails.primaryPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{license.licenseNumber}</div>
                        <Badge className={getLicenseTypeColor(license.licenseType)}>
                          {license.licenseType.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {license.issuingAuthority}
                        </div>
                        <div className="text-xs text-gray-400">
                          Expires: {new Date(license.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {license.registrationAddress.city}
                        </div>
                        <div className="text-xs text-gray-500">
                          {license.registrationAddress.district}, {license.registrationAddress.division}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(license.riskLevel)}>
                        {license.riskLevel.toUpperCase()}
                      </Badge>
                      {license.flags.length > 0 && (
                        <div className="flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs text-yellow-600">{license.flags.length} flags</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{license.complianceScore}%</div>
                        <div className={`w-full bg-gray-200 rounded-full h-2 mt-1`}>
                          <div
                            className={`h-2 rounded-full ${
                              license.complianceScore >= 80 ? 'bg-green-600' :
                              license.complianceScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${license.complianceScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(license.issueDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {license.documents.length} documents
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
