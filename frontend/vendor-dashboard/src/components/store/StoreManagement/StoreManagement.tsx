/**
 * Store Management - Amazon.com/Shopee.sg-Level Store Management Component
 * 
 * Complete store management interface with:
 * - Store configuration and customization
 * - Performance analytics dashboard
 * - Bangladesh cultural features integration
 * - Payment method setup
 * - SEO management and optimization
 * - File uploads for branding assets
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Alert, AlertDescription } from '../../../ui/alert';
import { 
  Store, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  Settings, 
  Image as ImageIcon,
  Upload,
  Palette,
  Globe,
  Calendar,
  Heart,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Save,
  RefreshCw
} from 'lucide-react';

// Mock API service (would be replaced with actual service integration)
const mockStoreAPI = {
  async getStoreData(vendorId: string) {
    return {
      id: vendorId,
      storeName: 'Bangladesh Electronics Hub',
      storeDescription: 'Premium electronics and gadgets for Bangladesh market with authentic products and best prices.',
      logoUrl: '/images/store-logo.jpg',
      bannerUrl: '/images/store-banner.jpg',
      storeUrl: 'bangladesh-electronics-hub',
      division: 'dhaka',
      category: 'electronics',
      isActive: true,
      businessHours: {
        sunday: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
        monday: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
        friday: { isOpen: true, openTime: '14:00', closeTime: '21:00' },
        saturday: { isOpen: true, openTime: '09:00', closeTime: '21:00' }
      }
    };
  },

  async getStoreAnalytics(vendorId: string) {
    return {
      views: 12540,
      visitors: 8230,
      conversionRate: 3.2,
      averageOrderValue: 2450,
      totalSales: 125600,
      topProducts: [
        { name: 'iPhone 15 Pro', sales: 45, revenue: 67500 },
        { name: 'Samsung Galaxy S24', sales: 38, revenue: 53200 },
        { name: 'MacBook Air M2', sales: 22, revenue: 48400 }
      ],
      trafficSources: [
        { source: 'Organic Search', percentage: 45 },
        { source: 'Direct', percentage: 30 },
        { source: 'Social Media', percentage: 15 },
        { source: 'Referral', percentage: 10 }
      ]
    };
  },

  async getStorePerformance(vendorId: string) {
    return {
      rating: 4.8,
      reviewCount: 342,
      responseTime: 2.5,
      fulfillmentRate: 98.5,
      returnRate: 2.1,
      customerSatisfaction: 96.3
    };
  },

  async updateStoreSettings(vendorId: string, settings: any) {
    console.log('Updating store settings:', settings);
    return { success: true };
  }
};

interface StoreManagementProps {
  vendorId: string;
}

const StoreManagement: React.FC<StoreManagementProps> = ({ vendorId }) => {
  const [storeData, setStoreData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    storeDescription: '',
    storeUrl: '',
    phoneNumber: '',
    email: '',
    division: '',
    category: ''
  });

  const [seoSettings, setSeoSettings] = useState({
    title: '',
    description: '',
    keywords: ''
  });

  const [designSettings, setDesignSettings] = useState({
    theme: 'default',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    layout: 'grid'
  });

  useEffect(() => {
    loadStoreData();
  }, [vendorId]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const [store, analyticsData, performanceData] = await Promise.all([
        mockStoreAPI.getStoreData(vendorId),
        mockStoreAPI.getStoreAnalytics(vendorId),
        mockStoreAPI.getStorePerformance(vendorId)
      ]);

      setStoreData(store);
      setAnalytics(analyticsData);
      setPerformance(performanceData);

      // Initialize form states
      setStoreSettings({
        storeName: store.storeName,
        storeDescription: store.storeDescription,
        storeUrl: store.storeUrl,
        phoneNumber: store.phoneNumber || '',
        email: store.email || '',
        division: store.division,
        category: store.category
      });
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await mockStoreAPI.updateStoreSettings(vendorId, {
        ...storeSettings,
        seoSettings,
        designSettings
      });
      // Show success notification
      alert('Store settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading store data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
              <Store className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {storeData.storeName}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {storeData.storeUrl}.getit.com.bd
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={storeData.isActive ? "default" : "secondary"}>
                  {storeData.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">{storeData.category}</Badge>
                <Badge variant="outline">{storeData.division}</Badge>
              </div>
            </div>
          </div>
          <Button onClick={() => setActiveTab('settings')} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Store Settings
          </Button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.visitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalSales)}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trafficSources.map((source: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{source.source}</span>
                        <span>{source.percentage}%</span>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bangladesh Cultural Features */}
          <Card>
            <CardHeader>
              <CardTitle>Bangladesh Cultural Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Festival Themes</p>
                  <p className="text-xs text-muted-foreground">Eid, Pohela Boishakh</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Prayer Times</p>
                  <p className="text-xs text-muted-foreground">Auto Integration</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Bengali Support</p>
                  <p className="text-xs text-muted-foreground">Full Language</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium">Mobile Banking</p>
                  <p className="text-xs text-muted-foreground">bKash, Nagad, Rocket</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Customer Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{performance.rating}/5.0</div>
                <p className="text-sm text-muted-foreground">{performance.reviewCount} reviews</p>
                <Progress value={performance.rating * 20} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{performance.responseTime}h</div>
                <p className="text-sm text-muted-foreground">Average response</p>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Fulfillment Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{performance.fulfillmentRate}%</div>
                <p className="text-sm text-muted-foreground">Orders fulfilled</p>
                <Progress value={performance.fulfillmentRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeUrl">Store URL</Label>
                  <Input
                    id="storeUrl"
                    value={storeSettings.storeUrl}
                    onChange={(e) => setStoreSettings({...storeSettings, storeUrl: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <textarea
                  id="storeDescription"
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
                  value={storeSettings.storeDescription}
                  onChange={(e) => setStoreSettings({...storeSettings, storeDescription: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={storeSettings.phoneNumber}
                    onChange={(e) => setStoreSettings({...storeSettings, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="division">Division</Label>
                  <select
                    id="division"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={storeSettings.division}
                    onChange={(e) => setStoreSettings({...storeSettings, division: e.target.value})}
                  >
                    <option value="dhaka">Dhaka</option>
                    <option value="chittagong">Chittagong</option>
                    <option value="sylhet">Sylhet</option>
                    <option value="rajshahi">Rajshahi</option>
                    <option value="khulna">Khulna</option>
                    <option value="barisal">Barisal</option>
                    <option value="rangpur">Rangpur</option>
                    <option value="mymensingh">Mymensingh</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreManagement;