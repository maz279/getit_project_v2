import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Camera,
  MessageSquare,
  FileText,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';

interface ReturnProcessingProps {
  returnId: string;
}

interface ReturnStatus {
  id: string;
  status: 'initiated' | 'label_generated' | 'picked_up' | 'in_transit' | 'received' | 'inspected' | 'approved' | 'refunded' | 'rejected';
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  estimatedCompletion?: string;
}

interface ReturnDetails {
  id: string;
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    reason: string;
    status: string;
    image: string;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  inspectionNotes?: string;
}

export const ReturnProcessing: React.FC<ReturnProcessingProps> = ({ returnId }) => {
  const [returnDetails, setReturnDetails] = useState<ReturnDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');

  // Mock return details
  useEffect(() => {
    const mockReturnDetails: ReturnDetails = {
      id: returnId,
      orderId: 'GIT-2025-001',
      items: [
        {
          id: '1',
          name: 'Samsung Galaxy S24 Ultra',
          quantity: 1,
          price: 145000,
          reason: 'Defective screen',
          status: 'approved',
          image: '/api/placeholder/100/100'
        }
      ],
      totalAmount: 145000,
      status: 'inspected',
      createdAt: '2025-01-12T10:30:00Z',
      trackingNumber: 'PFL2025001234',
      shippingCarrier: 'Paperfly',
      inspectionNotes: 'Screen defect confirmed. Item eligible for full refund.'
    };

    setTimeout(() => {
      setReturnDetails(mockReturnDetails);
      setIsLoading(false);
    }, 1000);
  }, [returnId]);

  const returnStatuses: ReturnStatus[] = [
    {
      id: '1',
      status: 'initiated',
      title: 'Return Initiated',
      description: 'Your return request has been submitted and is being processed',
      timestamp: '2025-01-12T10:30:00Z',
      completed: true
    },
    {
      id: '2',
      status: 'label_generated',
      title: 'Shipping Label Generated',
      description: 'Return shipping label has been generated and sent to your email',
      timestamp: '2025-01-12T14:15:00Z',
      completed: true
    },
    {
      id: '3',
      status: 'picked_up',
      title: 'Package Picked Up',
      description: 'Your return package has been picked up by our carrier',
      timestamp: '2025-01-13T09:45:00Z',
      completed: true
    },
    {
      id: '4',
      status: 'in_transit',
      title: 'In Transit',
      description: 'Your return package is on its way to our warehouse',
      timestamp: '2025-01-13T16:20:00Z',
      completed: true
    },
    {
      id: '5',
      status: 'received',
      title: 'Package Received',
      description: 'We have received your return package at our warehouse',
      timestamp: '2025-01-14T11:30:00Z',
      completed: true
    },
    {
      id: '6',
      status: 'inspected',
      title: 'Quality Inspection',
      description: 'Our team is inspecting the returned items',
      timestamp: '2025-01-14T15:45:00Z',
      completed: true
    },
    {
      id: '7',
      status: 'approved',
      title: 'Return Approved',
      description: 'Your return has been approved and refund is being processed',
      timestamp: '',
      completed: false,
      estimatedCompletion: '2025-01-15T12:00:00Z'
    },
    {
      id: '8',
      status: 'refunded',
      title: 'Refund Processed',
      description: 'Your refund has been processed and will appear in your account',
      timestamp: '',
      completed: false,
      estimatedCompletion: '2025-01-16T12:00:00Z'
    }
  ];

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'inspected') return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      initiated: { label: 'Initiated', color: 'bg-blue-100 text-blue-800' },
      label_generated: { label: 'Label Generated', color: 'bg-purple-100 text-purple-800' },
      picked_up: { label: 'Picked Up', color: 'bg-orange-100 text-orange-800' },
      in_transit: { label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
      received: { label: 'Received', color: 'bg-indigo-100 text-indigo-800' },
      inspected: { label: 'Under Inspection', color: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      refunded: { label: 'Refunded', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const completedSteps = returnStatuses.filter(s => s.completed).length;
  const progressPercentage = (completedSteps / returnStatuses.length) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!returnDetails) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Return Not Found</h2>
        <p className="text-gray-600">The return with ID {returnId} could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Return Processing</h1>
          <p className="text-gray-600 mt-1">Track your return #{returnId}</p>
        </div>
        {getStatusBadge(returnDetails.status)}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Return Progress</span>
          </CardTitle>
          <CardDescription>Your return is currently being processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedSteps} of {returnStatuses.length} steps completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Initiated</span>
              <span>Processing</span>
              <span>Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status Timeline</TabsTrigger>
          <TabsTrigger value="items">Return Items</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Status Timeline</CardTitle>
              <CardDescription>Follow the progress of your return</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnStatuses.map((status, index) => (
                  <div key={status.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(status.status, status.completed)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium ${status.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                          {status.title}
                        </h4>
                        {status.completed && (
                          <span className="text-sm text-gray-500">
                            {new Date(status.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${status.completed ? 'text-gray-600' : 'text-gray-500'}`}>
                        {status.description}
                      </p>
                      {status.estimatedCompletion && (
                        <p className="text-sm text-blue-600 mt-1">
                          Estimated completion: {new Date(status.estimatedCompletion).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Items</CardTitle>
              <CardDescription>Items included in this return</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnDetails.items.map(item => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} | Price: ৳{item.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Reason: {item.reason}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {returnDetails.inspectionNotes && (
                <Alert className="mt-4">
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Inspection Notes:</strong> {returnDetails.inspectionNotes}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Package Tracking</CardTitle>
              <CardDescription>Real-time tracking information</CardDescription>
            </CardHeader>
            <CardContent>
              {returnDetails.trackingNumber ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tracking Number</label>
                      <p className="text-lg font-mono font-semibold">{returnDetails.trackingNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Carrier</label>
                      <p className="text-lg font-semibold">{returnDetails.shippingCarrier}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Package Status</p>
                      <p className="text-sm text-blue-700">Delivered to warehouse - Ready for inspection</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Detailed Tracking
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">Tracking information will be available once your return is picked up.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>Messages and updates about your return</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Support Team</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your return has been received and is currently under quality inspection. 
                      We'll update you within 24 hours with the inspection results.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Today at 3:45 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">System</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Return package has been delivered to our warehouse. Quality inspection will begin shortly.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">Today at 11:30 AM</p>
                  </div>
                </div>

                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReturnProcessing;