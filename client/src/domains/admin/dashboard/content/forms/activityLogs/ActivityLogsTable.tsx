
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MapPin,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Eye,
  FileText,
  Activity
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

// Mock activity logs data
const activityLogs = [
  {
    id: 1,
    timestamp: '2024-06-25 14:30:22',
    user: 'john.doe@getit.com',
    action: 'User Login',
    category: 'Authentication',
    status: 'Success',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 125.0.0.0',
    location: 'Dhaka, Bangladesh',
    details: 'Successful login via email/password',
    riskLevel: 'low'
  },
  {
    id: 2,
    timestamp: '2024-06-25 14:25:15',
    user: 'admin@getit.com',
    action: 'Product Updated',
    category: 'Product Management',
    status: 'Success',
    ipAddress: '192.168.1.101',
    userAgent: 'Firefox 126.0',
    location: 'Chittagong, Bangladesh',
    details: 'Updated product "Samsung Galaxy S24" - Changed price from ৳85,000 to ৳82,000',
    riskLevel: 'medium'
  },
  {
    id: 3,
    timestamp: '2024-06-25 14:20:08',
    user: 'vendor@getit.com',
    action: 'Failed Login Attempt',
    category: 'Authentication',
    status: 'Failed',
    ipAddress: '45.123.456.789',
    userAgent: 'Chrome 124.0.0.0',
    location: 'Unknown',
    details: 'Failed login attempt - Invalid password (5th attempt)',
    riskLevel: 'high'
  },
  {
    id: 4,
    timestamp: '2024-06-25 14:15:33',
    user: 'customer@getit.com',
    action: 'Order Placed',
    category: 'Order Management',
    status: 'Success',
    ipAddress: '192.168.1.102',
    userAgent: 'Safari 17.0',
    location: 'Sylhet, Bangladesh',
    details: 'Order #ORD-2024-001234 placed - Total: ৳12,500',
    riskLevel: 'low'
  },
  {
    id: 5,
    timestamp: '2024-06-25 14:10:45',
    user: 'admin@getit.com',
    action: 'User Role Changed',
    category: 'User Management',
    status: 'Success',
    ipAddress: '192.168.1.101',
    userAgent: 'Chrome 125.0.0.0',
    location: 'Dhaka, Bangladesh',
    details: 'Changed user jane.doe@getit.com role from "Customer" to "Vendor"',
    riskLevel: 'high'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Success': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'Failed': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'Warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    default: return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getRiskColor = (level: string) => {
  switch (level) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getActionIcon = (action: string) => {
  if (action.includes('Login')) return <LogIn className="w-4 h-4" />;
  if (action.includes('Logout')) return <LogOut className="w-4 h-4" />;
  if (action.includes('Updated') || action.includes('Edit')) return <Edit className="w-4 h-4" />;
  if (action.includes('Delete')) return <Trash2 className="w-4 h-4" />;
  if (action.includes('View')) return <Eye className="w-4 h-4" />;
  if (action.includes('Order')) return <FileText className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
};

export const ActivityLogsTable: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{log.timestamp}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{log.user}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getActionIcon(log.action)}
                    <span className="text-sm">{log.action}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(log.status)}
                    <span className="text-sm">{log.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{log.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRiskColor(log.riskLevel)}>
                    {log.riskLevel} risk
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="text-xs text-gray-600 truncate" title={log.details}>
                      {log.details}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
