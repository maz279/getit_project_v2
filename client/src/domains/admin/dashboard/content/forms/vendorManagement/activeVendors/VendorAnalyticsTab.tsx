
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart3, PieChart, TrendingUp, MapPin } from 'lucide-react';
import { VendorAnalytics } from './types';

interface VendorAnalyticsTabProps {
  analytics: VendorAnalytics;
}

export const VendorAnalyticsTab: React.FC<VendorAnalyticsTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Performance Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-3 h-5 w-5 text-blue-600" />
              Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.performanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ 
                      backgroundColor: `hsl(${index * 80 + 20}, 60%, 50%)` 
                    }}></div>
                    <div>
                      <p className="font-medium text-gray-800">{item.category}</p>
                      <p className="text-sm text-gray-500">{item.count} vendors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-3 h-5 w-5 text-green-600" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.geographicDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.region}</p>
                    <p className="text-sm text-gray-500">{item.vendorCount} vendors</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">৳{(item.revenue / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-gray-500">{item.marketShare}% share</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-3 h-5 w-5 text-purple-600" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.categoryBreakdown.map((category, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800">{category.category}</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vendors:</span>
                    <span className="font-medium">{category.vendorCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-medium">৳{(category.revenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Rating:</span>
                    <span className="font-medium">{category.averageRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Vendors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-3 h-5 w-5 text-orange-600" />
            Top Performing Vendors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Vendor Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topVendors.map((vendor, index) => (
                  <tr key={vendor.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{vendor.name}</td>
                    <td className="py-3 px-4">{vendor.category}</td>
                    <td className="py-3 px-4 font-medium">৳{vendor.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span>{vendor.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance & Verification Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{analytics.complianceMetrics.kycCompleted}%</div>
              <div className="text-sm text-gray-600 mt-1">KYC Completed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{analytics.complianceMetrics.documentsVerified}%</div>
              <div className="text-sm text-gray-600 mt-1">Documents Verified</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{analytics.complianceMetrics.contractsSigned}%</div>
              <div className="text-sm text-gray-600 mt-1">Contracts Signed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{analytics.complianceMetrics.taxComplianceRate}%</div>
              <div className="text-sm text-gray-600 mt-1">Tax Compliance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
