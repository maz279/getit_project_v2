/**
 * PHASE 2: BULK OPERATIONS COMPONENT
 * Batch operations for product moderation workflow
 * Investment: $25,000 | Week 1: Component Decomposition
 * Date: July 26, 2025
 */

import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Flag, 
  User, 
  Calendar,
  AlertTriangle,
  Loader2,
  FileCheck,
  Clock,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../../../../store';
import { 
  selectAllProducts, 
  clearSelection, 
  bulkModerateProducts 
} from '../../../../../../../../store/slices/moderationSlice';
import type { BulkOperation, ModerationTeamMember } from '../types/moderationTypes';

interface BulkOperationsProps {
  className?: string;
  teamMembers?: ModerationTeamMember[];
  onOperationComplete?: (operation: BulkOperation) => void;
}

export const BulkOperations = memo<BulkOperationsProps>(({
  className = '',
  teamMembers = [],
  onOperationComplete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { selectedProducts, products, loading } = useSelector((state: RootState) => ({
    selectedProducts: state.moderation.selectedProducts,
    products: state.moderation.products,
    loading: state.moderation.loading.bulkOperation,
  }));

  // Local state
  const [operation, setOperation] = useState<BulkOperation['type']>('approve');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedReviewer, setAssignedReviewer] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get selected product details
  const selectedProductDetails = products.filter(product => 
    selectedProducts.includes(product.id)
  );

  // Handle select all
  const handleSelectAll = useCallback(() => {
    dispatch(selectAllProducts());
  }, [dispatch]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    dispatch(clearSelection());
    setShowConfirmation(false);
  }, [dispatch]);

  // Handle operation execution
  const handleExecuteOperation = useCallback(async () => {
    if (selectedProducts.length === 0) return;

    const bulkOperation: BulkOperation = {
      type: operation,
      productIds: selectedProducts,
      reason: reason || undefined,
      notes: notes || undefined,
      assignedReviewer: assignedReviewer || undefined,
      scheduledFor: scheduledFor || undefined,
    };

    try {
      await dispatch(bulkModerateProducts({
        productIds: selectedProducts,
        action: operation,
        reason,
        notes,
      })).unwrap();

      // Clear form and selection
      setReason('');
      setNotes('');
      setAssignedReviewer('');
      setScheduledFor('');
      setShowConfirmation(false);
      
      onOperationComplete?.(bulkOperation);
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  }, [selectedProducts, operation, reason, notes, assignedReviewer, scheduledFor, dispatch, onOperationComplete]);

  // Handle operation type change
  const handleOperationChange = useCallback((newOperation: BulkOperation['type']) => {
    setOperation(newOperation);
    setShowConfirmation(false);
  }, []);

  // Get operation details
  const getOperationDetails = useCallback((op: BulkOperation['type']) => {
    switch (op) {
      case 'approve':
        return {
          label: 'Bulk Approve',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: 'Approve all selected products for publication',
        };
      case 'reject':
        return {
          label: 'Bulk Reject',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          description: 'Reject all selected products with reason',
        };
      case 'flag':
        return {
          label: 'Bulk Flag',
          icon: Flag,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          description: 'Flag all selected products for review',
        };
      case 'assign':
        return {
          label: 'Assign Reviewer',
          icon: User,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Assign all selected products to a team member',
        };
      case 'escalate':
        return {
          label: 'Escalate',
          icon: AlertTriangle,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          description: 'Escalate all selected products to senior review',
        };
      default:
        return {
          label: 'Unknown Operation',
          icon: FileCheck,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          description: '',
        };
    }
  }, []);

  const currentOperationDetails = getOperationDetails(operation);
  const Icon = currentOperationDetails.icon;

  // No products selected
  if (selectedProducts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileCheck className="h-5 w-5 mr-2" />
            Bulk Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No products selected</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Select products to perform bulk operations
              </p>
              <Button variant="outline" onClick={handleSelectAll}>
                Select All ({products.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <FileCheck className="h-5 w-5 mr-2" />
            Bulk Operations
            <Badge variant="secondary" className="ml-2">
              {selectedProducts.length} selected
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="text-red-600 hover:text-red-700"
          >
            Clear Selection
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Selected Products Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Selected Products ({selectedProducts.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Categories: </span>
              {[...new Set(selectedProductDetails.map(p => p.category))].join(', ')}
            </div>
            <div>
              <span className="font-medium">Vendors: </span>
              {[...new Set(selectedProductDetails.map(p => p.vendor))].join(', ')}
            </div>
            <div>
              <span className="font-medium">Status: </span>
              {[...new Set(selectedProductDetails.map(p => p.status))].join(', ')}
            </div>
            <div>
              <span className="font-medium">Priority: </span>
              {[...new Set(selectedProductDetails.map(p => p.priority))].join(', ')}
            </div>
          </div>
        </div>

        {/* Operation Selection */}
        <div>
          <Label className="text-base font-medium">Select Operation</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {(['approve', 'reject', 'flag', 'assign', 'escalate'] as const).map((op) => {
              const details = getOperationDetails(op);
              const OpIcon = details.icon;
              const isSelected = operation === op;
              
              return (
                <button
                  key={op}
                  type="button"
                  onClick={() => handleOperationChange(op)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? `border-current ${details.color} ${details.bgColor}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <OpIcon className={`h-4 w-4 ${isSelected ? details.color : 'text-gray-400'}`} />
                    <span className={`font-medium ${isSelected ? details.color : 'text-gray-700'}`}>
                      {details.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {details.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Operation-specific Inputs */}
        <div className="space-y-4">
          {/* Reason (required for reject/flag) */}
          {(operation === 'reject' || operation === 'flag') && (
            <div>
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {operation === 'reject' ? (
                    <>
                      <SelectItem value="quality-issues">Quality Issues</SelectItem>
                      <SelectItem value="missing-information">Missing Information</SelectItem>
                      <SelectItem value="policy-violation">Policy Violation</SelectItem>
                      <SelectItem value="duplicate-product">Duplicate Product</SelectItem>
                      <SelectItem value="inappropriate-content">Inappropriate Content</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="needs-review">Needs Additional Review</SelectItem>
                      <SelectItem value="suspicious-activity">Suspicious Activity</SelectItem>
                      <SelectItem value="pricing-concern">Pricing Concern</SelectItem>
                      <SelectItem value="image-quality">Image Quality Issue</SelectItem>
                      <SelectItem value="description-issue">Description Issue</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reviewer Assignment */}
          {operation === 'assign' && (
            <div>
              <Label htmlFor="reviewer">
                Assign to Reviewer <span className="text-red-500">*</span>
              </Label>
              <Select value={assignedReviewer} onValueChange={setAssignedReviewer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{member.name}</span>
                        <Badge variant={member.isOnline ? 'default' : 'secondary'} className="ml-2">
                          {member.currentWorkload}/10
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Schedule For Later */}
          <div>
            <Label htmlFor="schedule">Schedule For (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                id="schedule"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes for this bulk operation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Confirmation */}
        {!showConfirmation ? (
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={
              loading ||
              (operation === 'reject' && !reason) ||
              (operation === 'flag' && !reason) ||
              (operation === 'assign' && !assignedReviewer)
            }
            className="w-full"
          >
            <Icon className="h-4 w-4 mr-2" />
            Preview {currentOperationDetails.label}
          </Button>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Confirm Bulk Operation:</strong>
                <br />
                You are about to <strong>{operation}</strong> {selectedProducts.length} products.
                {reason && (
                  <>
                    <br />
                    <strong>Reason:</strong> {reason}
                  </>
                )}
                {assignedReviewer && (
                  <>
                    <br />
                    <strong>Assigned to:</strong> {teamMembers.find(m => m.id === assignedReviewer)?.name}
                  </>
                )}
                {scheduledFor && (
                  <>
                    <br />
                    <strong>Scheduled for:</strong> {new Date(scheduledFor).toLocaleString()}
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                onClick={handleExecuteOperation}
                disabled={loading}
                className="flex-1"
                variant={operation === 'reject' ? 'destructive' : 'default'}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 mr-2" />
                )}
                Execute {currentOperationDetails.label}
              </Button>
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

BulkOperations.displayName = 'BulkOperations';