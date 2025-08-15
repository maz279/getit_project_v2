
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { TrendingUp, TrendingDown, BarChart3, Plus, Target, Calendar } from 'lucide-react';
import { RevenueSharingService } from '@/shared/services/database/revenue/RevenueSharingService';
import { useToast } from '@/shared/ui/use-toast';

interface RevenueForecast {
  id: string;
  forecast_period: string;
  forecast_date: string;
  vendor_id?: string;
  category_id?: string;
  predicted_revenue: number;
  predicted_commission: number;
  confidence_score: number;
  forecast_factors: any;
  actual_revenue?: number;
  actual_commission?: number;
  variance_percentage?: number;
  model_version: string;
  created_at: string;
}

export const RevenueForecastingTab: React.FC = () => {
  const [forecasts, setForecasts] = useState<RevenueForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    forecast_period: 'monthly',
    forecast_date: new Date().toISOString().split('T')[0],
    predicted_revenue: 0,
    predicted_commission: 0,
    confidence_score: 0.75,
    forecast_factors: '{}',
    model_version: 'v1.0'
  });

  const { toast } = useToast();

  useEffect(() => {
    loadForecasts();
  }, [selectedPeriod]);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const data = await RevenueSharingService.getRevenueForecasts({}, { limit: 50 });
      setForecasts(data);
    } catch (error) {
      console.error('Failed to load forecasts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revenue forecasts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const forecastData = {
        ...formData,
        predicted_revenue: Number(formData.predicted_revenue),
        predicted_commission: Number(formData.predicted_commission),
        confidence_score: Number(formData.confidence_score),
        forecast_factors: JSON.parse(formData.forecast_factors || '{}')
      };

      await RevenueSharingService.createRevenueForecast(forecastData);
      
      toast({
        title: 'Success',
        description: 'Revenue forecast created successfully'
      });

      setIsDialogOpen(false);
      resetForm();
      loadForecasts();
    } catch (error) {
      console.error('Failed to create forecast:', error);
      toast({
        title: 'Error',
        description: 'Failed to create revenue forecast',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      forecast_period: 'monthly',
      forecast_date: new Date().toISOString().split('T')[0],
      predicted_revenue: 0,
      predicted_commission: 0,
      confidence_score: 0.75,
      forecast_factors: '{}',
      model_version: 'v1.0'
    });
  };

  const calculateAccuracy = (forecast: RevenueForecast): number => {
    if (!forecast.actual_revenue || !forecast.predicted_revenue) return 0;
    const accuracy = 100 - Math.abs((forecast.actual_revenue - forecast.predicted_revenue) / forecast.actual_revenue * 100);
    return Math.max(0, Math.min(100, accuracy));
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSummaryStats = () => {
    const totalPredicted = forecasts.reduce((sum, f) => sum + f.predicted_revenue, 0);
    const totalActual = forecasts.reduce((sum, f) => sum + (f.actual_revenue || 0), 0);
    const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence_score, 0) / forecasts.length;
    const forecastsWithActuals = forecasts.filter(f => f.actual_revenue);
    const avgAccuracy = forecastsWithActuals.length > 0 
      ? forecastsWithActuals.reduce((sum, f) => sum + calculateAccuracy(f), 0) / forecastsWithActuals.length 
      : 0;

    return { totalPredicted, totalActual, avgConfidence, avgAccuracy };
  };

  const stats = getSummaryStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Revenue Forecasting</h3>
          <p className="text-gray-600">AI-powered revenue predictions and analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Forecast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Revenue Forecast</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="forecast_period">Period</Label>
                    <Select value={formData.forecast_period} onValueChange={(value) => setFormData({ ...formData, forecast_period: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="forecast_date">Forecast Date</Label>
                    <Input
                      id="forecast_date"
                      type="date"
                      value={formData.forecast_date}
                      onChange={(e) => setFormData({ ...formData, forecast_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="predicted_revenue">Predicted Revenue (৳)</Label>
                    <Input
                      id="predicted_revenue"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.predicted_revenue}
                      onChange={(e) => setFormData({ ...formData, predicted_revenue: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="predicted_commission">Predicted Commission (৳)</Label>
                    <Input
                      id="predicted_commission"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.predicted_commission}
                      onChange={(e) => setFormData({ ...formData, predicted_commission: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confidence_score">Confidence Score (0-1)</Label>
                    <Input
                      id="confidence_score"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={formData.confidence_score}
                      onChange={(e) => setFormData({ ...formData, confidence_score: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model_version">Model Version</Label>
                    <Input
                      id="model_version"
                      value={formData.model_version}
                      onChange={(e) => setFormData({ ...formData, model_version: e.target.value })}
                      placeholder="v1.0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Forecast</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predicted</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats.totalPredicted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue forecast</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats.totalActual.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Realized revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Model confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Prediction accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecasts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Revenue Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecasts.map((forecast) => (
              <div key={forecast.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{forecast.forecast_period}</Badge>
                    <Badge className={getConfidenceColor(forecast.confidence_score)}>
                      {(forecast.confidence_score * 100).toFixed(0)}% confidence
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(forecast.forecast_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Predicted:</span>
                      <div className="font-semibold">৳{forecast.predicted_revenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Commission:</span>
                      <div className="font-semibold">৳{forecast.predicted_commission.toLocaleString()}</div>
                    </div>
                    {forecast.actual_revenue && (
                      <div>
                        <span className="text-gray-600">Actual:</span>
                        <div className="font-semibold">৳{forecast.actual_revenue.toLocaleString()}</div>
                      </div>
                    )}
                    {forecast.actual_revenue && (
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <div className="font-semibold">{calculateAccuracy(forecast).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {forecast.variance_percentage && (
                    <div className="flex items-center">
                      {forecast.variance_percentage > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(forecast.variance_percentage).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {forecasts.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecasts Found</h3>
              <p className="text-gray-500 mb-4">Create your first revenue forecast to get started.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Forecast
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
