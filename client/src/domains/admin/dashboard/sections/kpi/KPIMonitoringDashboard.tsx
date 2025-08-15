
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KPIHeader } from './KPIHeader';
import { KPIFilters } from './KPIFilters';
import { KPIOverviewTab } from './KPIOverviewTab';
import { KPITrendsTab } from './KPITrendsTab';
import { KPIGoalsTab } from './KPIGoalsTab';
import { KPIBenchmarksTab } from './KPIBenchmarksTab';
import { KPISettingsTab } from './KPISettingsTab';
import { KPIGoalForm } from './KPIGoalForm';
import { generateKPIData } from './kpiData';
import { KPIMetric } from './types';

export const KPIMonitoringDashboard: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIMetric[]>(generateKPIData());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('monthly');
  const [showGoalForm, setShowGoalForm] = useState(false);

  const filteredKPIs = selectedCategory === 'all' 
    ? kpiData 
    : kpiData.filter(kpi => kpi.category.toLowerCase() === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-50 border-green-200';
      case 'at-risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'behind': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <KPIHeader onShowGoalForm={() => setShowGoalForm(true)} />
      
      <KPIFilters 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">KPI Overview</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <KPIOverviewTab 
            filteredKPIs={filteredKPIs}
            getStatusColor={getStatusColor}
            getTrendIcon={getTrendIcon}
          />
        </TabsContent>

        <TabsContent value="trends">
          <KPITrendsTab />
        </TabsContent>

        <TabsContent value="goals">
          <KPIGoalsTab getStatusColor={getStatusColor} />
        </TabsContent>

        <TabsContent value="benchmarks">
          <KPIBenchmarksTab />
        </TabsContent>

        <TabsContent value="settings">
          <KPISettingsTab />
        </TabsContent>
      </Tabs>

      {showGoalForm && (
        <KPIGoalForm 
          kpiData={kpiData}
          onClose={() => setShowGoalForm(false)}
        />
      )}
    </div>
  );
};
