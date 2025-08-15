
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Gift, Plus, Edit, Trash2, TrendingUp, Calendar, Users } from 'lucide-react';
import { LoyaltyReward } from './types';

interface RewardsManagementTabProps {
  rewards: LoyaltyReward[];
}

export const RewardsManagementTab: React.FC<RewardsManagementTabProps> = ({ rewards }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || reward.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || reward.category.toLowerCase() === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discount': return 'bg-green-100 text-green-800';
      case 'free_shipping': return 'bg-blue-100 text-blue-800';
      case 'product': return 'bg-purple-100 text-purple-800';
      case 'voucher': return 'bg-orange-100 text-orange-800';
      case 'experience': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityPercentage = (reward: LoyaltyReward) => {
    return ((reward.availability - reward.redeemed) / reward.availability) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Rewards Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rewards Management</h2>
          <p className="text-gray-600">Manage loyalty program rewards and redemption options</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create New Reward</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="voucher">Voucher</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
                <SelectItem value="gift">Gift</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold">{rewards.length}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rewards</p>
                <p className="text-2xl font-bold">{rewards.filter(r => r.isActive).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Redeemed</p>
                <p className="text-2xl font-bold">{rewards.reduce((sum, r) => sum + r.redeemed, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Popularity</p>
                <p className="text-2xl font-bold">{Math.round(rewards.reduce((sum, r) => sum + r.popularity, 0) / rewards.length)}%</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Catalog ({filteredRewards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reward</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Points Cost</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Popularity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reward.name}</div>
                      <div className="text-sm text-gray-500">{reward.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Eligible: {reward.eligibleTiers.join(', ')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(reward.type)}>
                      {reward.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{reward.pointsCost} pts</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">৳{reward.value.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{reward.availability - reward.redeemed} left</span>
                        <span>{reward.availability} total</span>
                      </div>
                      <Progress value={getAvailabilityPercentage(reward)} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="font-medium">{reward.popularity}%</div>
                      <Progress value={reward.popularity} className="h-2 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={reward.isActive ? "default" : "secondary"}>
                      {reward.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Popular Rewards Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRewards
              .sort((a, b) => b.popularity - a.popularity)
              .slice(0, 5)
              .map((reward, index) => (
                <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{reward.name}</h4>
                      <p className="text-sm text-gray-500">{reward.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <div className="font-bold">{reward.redeemed}</div>
                      <div className="text-sm text-gray-500">Redeemed</div>
                    </div>
                    <div>
                      <div className="font-bold">{reward.popularity}%</div>
                      <div className="text-sm text-gray-500">Popularity</div>
                    </div>
                    <div>
                      <div className="font-bold">৳{reward.value.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Value</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
