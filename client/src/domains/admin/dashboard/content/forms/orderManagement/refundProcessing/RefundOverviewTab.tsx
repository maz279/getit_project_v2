
import React from 'react';
import { RefundStatsCards } from './RefundStatsCards';
import { RefundReasonsChart } from './RefundReasonsChart';
import { RefundWorkflowSection } from './RefundWorkflowSection';

interface RefundOverviewTabProps {
  stats: {
    totalRefundsToday: number;
    totalRefundsThisWeek: number;
    totalRefundsThisMonth: number;
    refundRate: number;
    totalAmountRefunded: number;
    averageRefundAmount: number;
    pendingRefunds: number;
    processingTime: number;
    customerSatisfaction: number;
  };
  reasons: Array<{
    reason: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  workflow: Array<{
    step: string;
    description: string;
    automation: string;
    sla: string;
  }>;
}

export const RefundOverviewTab: React.FC<RefundOverviewTabProps> = ({ stats, reasons, workflow }) => {
  return (
    <div className="space-y-6">
      {/* Refund Statistics Cards */}
      <RefundStatsCards stats={stats} />

      {/* Refund Reasons and Workflow */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RefundReasonsChart reasons={reasons} />
        <RefundWorkflowSection workflow={workflow} />
      </div>
    </div>
  );
};
