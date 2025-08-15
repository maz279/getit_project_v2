import React, { useState } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Shield, Eye, Globe, Users, Database, Download, Trash2, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacySettings: React.FC = () => {
  const [dataCollection, setDataCollection] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(true);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);
  const [crossDeviceTracking, setCrossDeviceTracking] = useState(false);
  const [thirdPartySharing, setThirdPartySharing] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('friends');
  const [searchVisibility, setSearchVisibility] = useState(true);
  const [activityVisibility, setActivityVisibility] = useState(false);
  const [dataRetention, setDataRetention] = useState('24-months');

  const privacyScore = Math.round(
    ((!dataCollection ? 20 : 0) + 
     (!personalizedAds ? 15 : 0) + 
     (!analyticsTracking ? 15 : 0) + 
     (!crossDeviceTracking ? 15 : 0) + 
     (!thirdPartySharing ? 20 : 0) + 
     (!locationTracking ? 10 : 0) + 
     (profileVisibility === 'private' ? 5 : 0)) + 
    (dataCollection && personalizedAds && analyticsTracking ? 40 : 60)
  );

  const getPrivacyScoreColor = () => {
    if (privacyScore >= 80) return 'text-green-600 bg-green-100';
    if (privacyScore >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPrivacyLevel = () => {
    if (privacyScore >= 80) return 'High';
    if (privacyScore >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      {/* Blue-purple-red gradient header for consistent design */}
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/account/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Settings</h1>
          <p className="text-gray-600">Control how your data is collected, used, and shared</p>
        </div>

        {/* Privacy Score Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Privacy Level: {getPrivacyLevel()}</h3>
                  <p className="text-sm text-gray-600">Your current privacy protection score</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getPrivacyScoreColor()} px-4 py-2 rounded-lg`}>
                  {privacyScore}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Privacy Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="data-collection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="data-collection">Data Collection</TabsTrigger>
            <TabsTrigger value="visibility">Profile Visibility</TabsTrigger>
            <TabsTrigger value="sharing">Data Sharing</TabsTrigger>
            <TabsTrigger value="management">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="data-collection" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Collection Settings
                </CardTitle>
                <CardDescription>
                  Control what data we collect about your activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="dataCollection" className="font-medium">Basic Data Collection</Label>
                      <p className="text-sm text-gray-600">Collect basic usage data to improve your experience</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Essential</Badge>
                        <Badge variant="outline">Required for Service</Badge>
                      </div>
                    </div>
                    <Switch
                      id="dataCollection"
                      checked={dataCollection}
                      onCheckedChange={setDataCollection}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="analyticsTracking" className="font-medium">Analytics Tracking</Label>
                      <p className="text-sm text-gray-600">Help us understand how you use our platform</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Performance</Badge>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                    </div>
                    <Switch
                      id="analyticsTracking"
                      checked={analyticsTracking}
                      onCheckedChange={setAnalyticsTracking}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="locationTracking" className="font-medium">Location Tracking</Label>
                      <p className="text-sm text-gray-600">Use your location for delivery and local offers</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Bangladesh Features</Badge>
                        <Badge variant="outline">Delivery</Badge>
                      </div>
                    </div>
                    <Switch
                      id="locationTracking"
                      checked={locationTracking}
                      onCheckedChange={setLocationTracking}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="crossDeviceTracking" className="font-medium">Cross-Device Tracking</Label>
                      <p className="text-sm text-gray-600">Link your activity across different devices</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Personalization</Badge>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                    </div>
                    <Switch
                      id="crossDeviceTracking"
                      checked={crossDeviceTracking}
                      onCheckedChange={setCrossDeviceTracking}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">What We Collect</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Browsing and purchase history</li>
                        <li>• Device and browser information</li>
                        <li>• Location data (when enabled)</li>
                        <li>• Communication preferences</li>
                        <li>• Account and profile information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visibility" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Profile Visibility
                </CardTitle>
                <CardDescription>
                  Control who can see your profile and activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="profileVisibility" className="font-medium">Profile Visibility</Label>
                      <p className="text-sm text-gray-600">Who can see your basic profile information</p>
                    </div>
                    <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="searchVisibility" className="font-medium">Search Visibility</Label>
                      <p className="text-sm text-gray-600">Allow others to find you through search</p>
                    </div>
                    <Switch
                      id="searchVisibility"
                      checked={searchVisibility}
                      onCheckedChange={setSearchVisibility}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="activityVisibility" className="font-medium">Activity Visibility</Label>
                      <p className="text-sm text-gray-600">Show your recent purchases and reviews</p>
                    </div>
                    <Switch
                      id="activityVisibility"
                      checked={activityVisibility}
                      onCheckedChange={setActivityVisibility}
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Visibility Information</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Even with private settings, basic information may be visible to merchants for order processing and customer service.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Data Sharing & Third Parties
                </CardTitle>
                <CardDescription>
                  Control how your data is shared with external services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="personalizedAds" className="font-medium">Personalized Advertising</Label>
                      <p className="text-sm text-gray-600">Use your data to show relevant ads and offers</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Revenue Support</Badge>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                    </div>
                    <Switch
                      id="personalizedAds"
                      checked={personalizedAds}
                      onCheckedChange={setPersonalizedAds}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="thirdPartySharing" className="font-medium">Third-Party Data Sharing</Label>
                      <p className="text-sm text-gray-600">Share anonymized data with trusted partners</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Marketing</Badge>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                    </div>
                    <Switch
                      id="thirdPartySharing"
                      checked={thirdPartySharing}
                      onCheckedChange={setThirdPartySharing}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Our Partners</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Payment Processors</h4>
                      <p className="text-sm text-gray-600">bKash, Nagad, Rocket, Credit Card processors</p>
                      <Badge className="bg-green-100 text-green-800 mt-2">Required</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Shipping Partners</h4>
                      <p className="text-sm text-gray-600">Pathao, Paperfly, Sundarban Courier</p>
                      <Badge className="bg-green-100 text-green-800 mt-2">Required</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Analytics Services</h4>
                      <p className="text-sm text-gray-600">Anonymous usage analytics and insights</p>
                      <Badge className="bg-blue-100 text-blue-800 mt-2">Optional</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">Marketing Platforms</h4>
                      <p className="text-sm text-gray-600">Targeted advertising and promotions</p>
                      <Badge className="bg-blue-100 text-blue-800 mt-2">Optional</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Manage your data retention and deletion preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="dataRetention" className="font-medium">Data Retention Period</Label>
                      <p className="text-sm text-gray-600">How long to keep your personal data</p>
                    </div>
                    <Select value={dataRetention} onValueChange={setDataRetention}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="12-months">12 Months</SelectItem>
                        <SelectItem value="24-months">24 Months</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Data Rights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="flex items-start gap-3">
                        <Download className="h-5 w-5 mt-1" />
                        <div className="text-left">
                          <h4 className="font-medium">Download My Data</h4>
                          <p className="text-sm text-gray-600">Get a copy of all your personal data</p>
                        </div>
                      </div>
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="justify-start h-auto p-4">
                          <div className="flex items-start gap-3">
                            <Trash2 className="h-5 w-5 mt-1 text-red-600" />
                            <div className="text-left">
                              <h4 className="font-medium">Delete My Account</h4>
                              <p className="text-sm text-gray-600">Permanently delete your account and data</p>
                            </div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2">
                          <Button variant="destructive" className="flex-1">
                            Delete Account
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Data Deletion Policy</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Some data may be retained for legal or business purposes even after deletion. 
                        Order history and financial records may be kept for tax and audit requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Bangladesh Compliance</h4>
                      <p className="text-sm text-green-700 mt-1">
                        We comply with Bangladesh Digital Security Act and international data protection standards. 
                        Your data is stored securely and processed according to local regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Gray-blue-purple gradient footer for consistent design */}
      <Footer />
    </div>
  );
};

export default PrivacySettings;