
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Zap } from 'lucide-react';

interface WorkflowStep {
  step: string;
  description: string;
  automation: string;
  sla: string;
}

interface RefundWorkflowSectionProps {
  workflow: WorkflowStep[];
}

export const RefundWorkflowSection: React.FC<RefundWorkflowSectionProps> = ({ workflow }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-3 h-5 w-5 text-green-600" />
          Refund Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflow.map((step, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{step.step}</h4>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{step.automation}</span>
                  <span className="text-xs text-gray-500">SLA: {step.sla}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
