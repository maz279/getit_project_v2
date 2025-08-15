
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Download, Plus } from 'lucide-react';

interface KPIHeaderProps {
  onShowGoalForm: () => void;
}

export const KPIHeader: React.FC<KPIHeaderProps> = ({ onShowGoalForm }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 KPI Monitoring Dashboard</h1>
        <p className="text-gray-600 text-lg">Key Performance Indicators tracking and goal management system</p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
        <Button 
          onClick={onShowGoalForm}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Set KPI Goal
        </Button>
      </div>
    </div>
  );
};
