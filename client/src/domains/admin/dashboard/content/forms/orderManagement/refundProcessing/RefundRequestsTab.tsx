
import React from 'react';
import { RefundSearchFilters } from './RefundSearchFilters';
import { RefundRequestsTable } from './RefundRequestsTable';

interface RefundRequestsTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedReason: string;
  setSelectedReason: (reason: string) => void;
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
  refunds: Array<{
    id: string;
    orderId: string;
    customer: string;
    email: string;
    phone: string;
    amount: number;
    currency: string;
    reason: string;
    status: string;
    requestDate: string;
    processedDate: string | null;
    method: string;
    gateway: string;
    product: string;
    customerNote: string;
    images: string[];
    priority: string;
    assignedTo: string;
    estimatedCompletion: string;
  }>;
}

export const RefundRequestsTab: React.FC<RefundRequestsTabProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedReason,
  setSelectedReason,
  selectedTimeRange,
  setSelectedTimeRange,
  refunds
}) => {
  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <RefundSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedReason={selectedReason}
        setSelectedReason={setSelectedReason}
        selectedTimeRange={selectedTimeRange}
        setSelectedTimeRange={setSelectedTimeRange}
      />

      {/* Refunds Table */}
      <RefundRequestsTable refunds={refunds} />
    </div>
  );
};
