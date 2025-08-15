
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Search, Filter, Download, RefreshCw, Award, TrendingUp, Users, Gift } from 'lucide-react';

interface LoyaltyAnalysisHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedProgram: string;
  onProgramChange: (program: string) => void;
  selectedTier: string;
  onTierChange: (tier: string) => void;
}

export const LoyaltyAnalysisHeader: React.FC<LoyaltyAnalysisHeaderProps> = ({
  onRefresh,
  onExport,
  searchQuery,
  onSearchChange,
  selectedProgram,
  onProgramChange,
  selectedTier,
  onTierChange
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Program Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onRefresh} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          
          <Button variant="outline" onClick={onExport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
          
          <Button className="flex items-center space-x-2">
            <Gift className="h-4 w-4" />
            <span>Create Campaign</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search members, transactions, or rewards..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedProgram} onValueChange={onProgramChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Program Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="rewards">GetIt Rewards</SelectItem>
              <SelectItem value="vip">VIP Program</SelectItem>
              <SelectItem value="cashback">Cashback Program</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTier} onValueChange={onTierChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Member Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics Dashboard</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Member Segments</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
