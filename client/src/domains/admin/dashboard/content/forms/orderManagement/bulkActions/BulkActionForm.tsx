
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Package, RefreshCw, Send, Edit, Mail, Download, Truck, Star, Tag, Archive, X } from 'lucide-react';

interface BulkActionFormProps {
  selectedOrders: string[];
  bulkAction: string;
  actionInProgress: boolean;
  onBulkActionChange: (action: string) => void;
  onExecuteAction: () => void;
  onClearSelection: () => void;
}

export const BulkActionForm: React.FC<BulkActionFormProps> = ({
  selectedOrders,
  bulkAction,
  actionInProgress,
  onBulkActionChange,
  onExecuteAction,
  onClearSelection,
}) => {
  const bulkActionOptions = [
    { value: 'update-status', label: 'Update Status', icon: Edit },
    { value: 'send-notification', label: 'Send Notification', icon: Mail },
    { value: 'export-data', label: 'Export Data', icon: Download },
    { value: 'assign-courier', label: 'Assign Courier', icon: Truck },
    { value: 'update-priority', label: 'Update Priority', icon: Star },
    { value: 'add-tags', label: 'Add Tags', icon: Tag },
    { value: 'archive', label: 'Archive Orders', icon: Archive },
    { value: 'cancel', label: 'Cancel Orders', icon: X }
  ];

  const renderActionSpecificForm = () => {
    switch (bulkAction) {
      case 'update-status':
        return (
          <div className="space-y-4">
            <Label>Update Status To:</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Label htmlFor="status-note">Status Update Note (Optional)</Label>
              <Textarea id="status-note" placeholder="Add a note about this status update..." />
            </div>
          </div>
        );

      case 'send-notification':
        return (
          <div className="space-y-4">
            <div>
              <Label>Notification Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Notification</SelectItem>
                  <SelectItem value="sms">SMS Notification</SelectItem>
                  <SelectItem value="both">Email + SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notification-subject">Subject</Label>
              <Input id="notification-subject" placeholder="Notification subject..." />
            </div>
            <div>
              <Label htmlFor="notification-message">Message</Label>
              <Textarea id="notification-message" placeholder="Your notification message..." rows={4} />
            </div>
          </div>
        );

      case 'assign-courier':
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Courier Partner</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose courier partner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="redx">RedX</SelectItem>
                  <SelectItem value="steadfast">Steadfast</SelectItem>
                  <SelectItem value="pathao">Pathao</SelectItem>
                  <SelectItem value="ecourier">eCourier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pickup-date">Pickup Date</Label>
              <Input id="pickup-date" type="date" />
            </div>
          </div>
        );

      case 'add-tags':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" placeholder="urgent, vip-customer, fragile..." />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute Bulk Actions</CardTitle>
        <p className="text-sm text-gray-600">
          {selectedOrders.length} orders selected for bulk action
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Please select orders from the "Select Orders" tab first</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Selection */}
            <div>
              <Label htmlFor="bulk-action">Select Action</Label>
              <Select value={bulkAction} onValueChange={onBulkActionChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a bulk action..." />
                </SelectTrigger>
                <SelectContent>
                  {bulkActionOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-2" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Action-specific forms */}
            {renderActionSpecificForm()}

            {/* Action Summary */}
            {bulkAction && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Action Summary</h4>
                  <p className="text-blue-800 text-sm">
                    This action will be applied to <strong>{selectedOrders.length}</strong> selected orders.
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    Order IDs: {selectedOrders.join(', ')}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Execute Button */}
            <div className="flex items-center space-x-3">
              <Button 
                onClick={onExecuteAction}
                disabled={!bulkAction || actionInProgress}
                className="flex-1"
              >
                {actionInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Execute Bulk Action
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClearSelection}>
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
