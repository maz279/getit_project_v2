
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Star, Eye, MousePointer, TrendingUp, DollarSign, Target, Award, Zap } from 'lucide-react';
import { FeaturedStats } from './types';

interface FeaturedStatsCardsProps {
  stats: FeaturedStats;
}

export const FeaturedStatsCards: React.FC<FeaturedStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Star className="h-4 w-4 mr-2 text-blue-600" />
            Featured Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">{stats.totalFeatured}</div>
          <div className="flex items-center mt-1">
            <Badge variant="secondary" className="text-xs">Active</Badge>
            <span className="text-xs text-gray-600 ml-2">Currently featured</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-2 text-green-600" />
            Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{stats.activeCampaigns}</div>
          <div className="flex items-center mt-1">
            <Badge variant="default" className="text-xs bg-green-500">Running</Badge>
            <span className="text-xs text-gray-600 ml-2">Live campaigns</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Eye className="h-4 w-4 mr-2 text-purple-600" />
            Total Impressions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">{(stats.totalImpressions / 1000000).toFixed(1)}M</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600">+12.5% vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <MousePointer className="h-4 w-4 mr-2 text-orange-600" />
            Total Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">{(stats.totalClicks / 1000).toFixed(0)}K</div>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="text-xs">{stats.clickThroughRate}% CTR</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2 text-emerald-600" />
            Conversion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">{stats.avgConversionRate}%</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600">Above average</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-indigo-600" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-700">৳{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600">+18.3% growth</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Award className="h-4 w-4 mr-2 text-rose-600" />
            Top Performer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-rose-700 truncate">{stats.topPerformer}</div>
          <div className="flex items-center mt-1">
            <Badge variant="default" className="text-xs bg-rose-500">Best Seller</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-2 text-cyan-600" />
            Click-Through Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-700">{stats.clickThroughRate}%</div>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="text-xs">Industry Leading</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
