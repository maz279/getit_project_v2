
import React from 'react';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Filter } from 'lucide-react';

interface VIPHeaderProps {
  searchQuery: string;
  selectedTier: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTierChange: (value: string) => void;
}

export const VIPHeader: React.FC<VIPHeaderProps> = ({
  searchQuery,
  selectedTier,
  onSearchChange,
  onTierChange
}) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">VIP Customers Management</h1>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search customers..."
          className="md:w-80"
          value={searchQuery}
          onChange={onSearchChange}
        />
        <Select value={selectedTier} onValueChange={onTierChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="diamond">Diamond</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
    </div>
  );
};
