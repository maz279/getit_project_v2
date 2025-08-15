
import React from 'react';
import { DollarSign, ShoppingCart, Calculator, Target, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const MetricsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">৳7.8M</div>
          <div className="flex items-center text-xs opacity-80">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            +12.5% vs last month
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Order Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">28,450</div>
          <div className="flex items-center text-xs opacity-80">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            +8.3% vs last month
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Avg Order Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">৳274</div>
          <div className="flex items-center text-xs opacity-80">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            +3.8% vs last month
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Target Achievement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">104.1%</div>
          <div className="flex items-center text-xs opacity-80">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Above target by 4.1%
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
