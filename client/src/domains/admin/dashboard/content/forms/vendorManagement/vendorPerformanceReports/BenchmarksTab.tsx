
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { VendorPerformanceService, VendorBenchmark } from '@/shared/services/database/VendorPerformanceService';
import { Target, TrendingUp, Award, BarChart3 } from 'lucide-react';

export const BenchmarksTab: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<VendorBenchmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenchmarks();
  }, []);

  const loadBenchmarks = async () => {
    try {
      const data = await VendorPerformanceService.getBenchmarks();
      // Type assertion to ensure proper typing
      setBenchmarks((data || []) as VendorBenchmark[]);
    } catch (error) {
      console.error('Error loading benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBenchmarksByCategory = (category: string) => {
    return benchmarks.filter(b => b.industry_category === category);
  };

  const categories = ['Electronics', 'Fashion', 'Home & Garden'];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Industry Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Compare vendor performance against industry standards across different categories.
          </p>

          {categories.map(category => {
            const categoryBenchmarks = getBenchmarksByCategory(category);
            
            return (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  {category}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryBenchmarks.map(benchmark => (
                    <Card key={benchmark.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{benchmark.metric_name}</h4>
                          <Badge variant="outline">{benchmark.benchmark_type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Benchmark:</span>
                            <span className="font-semibold text-blue-600">
                              {benchmark.benchmark_value}
                              {benchmark.metric_name.includes('rate') || benchmark.metric_name.includes('margin') ? '%' : ''}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>25th percentile:</span>
                              <span>{benchmark.percentile_25}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>50th percentile:</span>
                              <span>{benchmark.percentile_50}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>75th percentile:</span>
                              <span>{benchmark.percentile_75}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>90th percentile:</span>
                              <span>{benchmark.percentile_90}</span>
                            </div>
                          </div>
                          
                          {benchmark.data_source && (
                            <div className="text-xs text-gray-400 pt-2 border-t">
                              Source: {benchmark.data_source}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {categoryBenchmarks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No benchmarks available for {category}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
