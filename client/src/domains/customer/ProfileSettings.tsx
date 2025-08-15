/**
 * ProfileSettings.tsx - Amazon.com/Shopee.sg-Level Profile Management
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Comprehensive profile settings with Bangladesh-specific features,
 * security management, and Amazon.com/Shopee.sg-level functionality.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Separator } from '@/shared/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shared/ui/alert-dialog';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Camera, 
  Shield, 
  Key, 
  Bell, 
  Globe, 
  Eye, 
  EyeOff, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  Clock,
  LogOut
} from 'lucide-react';

// Bangladesh-specific icons
import { FaMosque, FaFlag } from 'react-icons/fa';

// import { UserApiService } from '@/shared/services/user/UserApiService';
// Temporary placeholder until UserApiService is available
const UserApiService = {
  getProfile: async () => ({ name: '', email: '', phone: '' }),
  updateProfile: async (data: any) => data,
  deleteAccount: async () => true
};
import { notificationApiService as NotificationApiService } from '@/shared/services/NotificationApiService';
import { useToast } from '@/shared/hooks/use-toast';

interface ProfileSettingsProps {
  userId?: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nidNumber?: string; // Bangladesh National ID
  bio?: string;
  profileImage?: string;
}

interface ContactDetails {
  primaryPhone: string;
  secondaryPhone?: string;
  whatsapp?: string;
  telegram?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface ShoppingPreferences {
  preferredLanguage: 'en' | 'bn';
  currency: 'BDT' | 'USD';
  defaultPaymentMethod: string;
  deliveryInstructions: string;
  productRecommendations: boolean;
  priceAlerts: boolean;
  wishlistSharing: boolean;
}

interface CulturalPreferences {
  islamicFeatures: boolean;
  prayerTimeReminders: boolean;
  festivalNotifications: boolean;
  halalProductFilter: boolean;
  arabicLanguageSupport: boolean;
  islamicCalendarView: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastChanged: string;
  loginHistory: Array<{
    date: string;
    device: string;
    location: string;
    ipAddress: string;
    status: 'success' | 'failed';
  }>;
  connectedDevices: Array<{
    id: string;
    name: string;
    type: 'mobile' | 'desktop' | 'tablet';
    lastUsed: string;
    location: string;
    current: boolean;
  }>;
}

interface NotificationSettings {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    securityAlerts: boolean;
    paymentNotifications: boolean;
  };
  sms: {
    orderUpdates: boolean;
    deliveryUpdates: boolean;
    paymentAlerts: boolean;
    securityAlerts: boolean;
    promotions: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    priceDrops: boolean;
    stockAlerts: boolean;
    chatMessages: boolean;
  };
  cultural: {
    prayerTimeReminders: boolean;
    festivalNotifications: boolean;
    islamicEventReminders: boolean;
    ramadanSpecialOffers: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showPurchaseHistory: boolean;
  showWishlist: boolean;
  allowFriendRequests: boolean;
  shareDataForPersonalization: boolean;
  allowTargetedAds: boolean;
  dataDownloadRequested: boolean;
  accountDeletionRequested: boolean;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nidNumber: '',
    bio: '',
    profileImage: ''
  });

  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    primaryPhone: '',
    secondaryPhone: '',
    whatsapp: '',
    telegram: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [shoppingPreferences, setShoppingPreferences] = useState<ShoppingPreferences>({
    preferredLanguage: 'en',
    currency: 'BDT',
    defaultPaymentMethod: '',
    deliveryInstructions: '',
    productRecommendations: true,
    priceAlerts: true,
    wishlistSharing: false
  });

  const [culturalPreferences, setCulturalPreferences] = useState<CulturalPreferences>({
    islamicFeatures: true,
    prayerTimeReminders: true,
    festivalNotifications: true,
    halalProductFilter: true,
    arabicLanguageSupport: false,
    islamicCalendarView: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    passwordLastChanged: '',
    loginHistory: [],
    connectedDevices: []
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
      securityAlerts: true,
      paymentNotifications: true
    },
    sms: {
      orderUpdates: true,
      deliveryUpdates: true,
      paymentAlerts: true,
      securityAlerts: true,
      promotions: false
    },
    push: {
      orderUpdates: true,
      promotions: false,
      priceDrops: true,
      stockAlerts: true,
      chatMessages: true
    },
    cultural: {
      prayerTimeReminders: true,
      festivalNotifications: true,
      islamicEventReminders: true,
      ramadanSpecialOffers: true
    }
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    showPurchaseHistory: false,
    showWishlist: true,
    allowFriendRequests: true,
    shareDataForPersonalization: true,
    allowTargetedAds: false,
    dataDownloadRequested: false,
    accountDeletionRequested: false
  });

  const { toast } = useToast();

  useEffect(() => {
    loadUserSettings();
  }, [userId]);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      
      // Load user profile and settings
      const profile = await UserApiService.getProfile();
      const security = await UserApiService.getSecuritySettings();
      const notifications = await NotificationApiService.getSettings();
      
      // Update state with loaded data
      setPersonalInfo({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        nidNumber: profile.nidNumber || '',
        bio: profile.bio || '',
        profileImage: profile.profileImage || ''
      });

      setSecuritySettings(security);
      setNotificationSettings(notifications);

    } catch (error) {
      console.error('Error loading user settings:', error);
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    try {
      setLoading(true);
      await UserApiService.updateProfile(personalInfo);
      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShoppingPreferences = async () => {
    try {
      setLoading(true);
      await UserApiService.updateShoppingPreferences(shoppingPreferences);
      toast({
        title: "Success",
        description: "Shopping preferences updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shopping preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      setLoading(true);
      await NotificationApiService.updateSettings(notificationSettings);
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      setLoading(true);
      await UserApiService.enableTwoFactor();
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
      toast({
        title: "Success",
        description: "Two-factor authentication enabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutDevice = async (deviceId: string) => {
    try {
      await UserApiService.logoutDevice(deviceId);
      setSecuritySettings(prev => ({
        ...prev,
        connectedDevices: prev.connectedDevices.filter(d => d.id !== deviceId)
      }));
      toast({
        title: "Success",
        description: "Device logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout device",
        variant: "destructive",
      });
    }
  };

  const handleDataDownload = async () => {
    try {
      setLoading(true);
      await UserApiService.requestDataDownload();
      setPrivacySettings(prev => ({ ...prev, dataDownloadRequested: true }));
      toast({
        title: "Success",
        description: "Data download request submitted. You will receive an email with your data within 48 hours.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request data download",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="shopping">Shopping</TabsTrigger>
          <TabsTrigger value="cultural">Cultural</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={personalInfo.profileImage} alt="Profile" />
                  <AvatarFallback>{personalInfo.firstName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mb-2">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+880 1X-XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalInfo.dateOfBirth}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={personalInfo.gender} onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nidNumber">NID Number (Bangladesh)</Label>
                  <Input
                    id="nidNumber"
                    value={personalInfo.nidNumber}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, nidNumber: e.target.value }))}
                    placeholder="17-digit NID number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={personalInfo.bio}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <Button onClick={handleSavePersonalInfo} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Details Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
              <CardDescription>Manage your contact details and communication preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryPhone">Primary Phone</Label>
                  <Input
                    id="primaryPhone"
                    value={contactDetails.primaryPhone}
                    onChange={(e) => setContactDetails(prev => ({ ...prev, primaryPhone: e.target.value }))}
                    placeholder="+880 1X-XXXX-XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                  <Input
                    id="secondaryPhone"
                    value={contactDetails.secondaryPhone}
                    onChange={(e) => setContactDetails(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                    placeholder="+880 1X-XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={contactDetails.whatsapp}
                    onChange={(e) => setContactDetails(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+880 1X-XXXX-XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="telegram">Telegram Username</Label>
                  <Input
                    id="telegram"
                    value={contactDetails.telegram}
                    onChange={(e) => setContactDetails(prev => ({ ...prev, telegram: e.target.value }))}
                    placeholder="@username"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Emergency Contact</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergencyName">Full Name</Label>
                    <Input
                      id="emergencyName"
                      value={contactDetails.emergencyContact.name}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Phone Number</Label>
                    <Input
                      id="emergencyPhone"
                      value={contactDetails.emergencyContact.phone}
                      onChange={(e) => setContactDetails(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                      placeholder="+880 1X-XXXX-XXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Select 
                      value={contactDetails.emergencyContact.relationship}
                      onValueChange={(value) => setContactDetails(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, relationship: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="relative">Relative</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={() => {}}>Save Contact Details</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shopping Preferences Tab */}
        <TabsContent value="shopping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Preferences</CardTitle>
              <CardDescription>Customize your shopping experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Preferred Language</Label>
                  <Select 
                    value={shoppingPreferences.preferredLanguage}
                    onValueChange={(value: 'en' | 'bn') => setShoppingPreferences(prev => ({ ...prev, preferredLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Currency</Label>
                  <Select 
                    value={shoppingPreferences.currency}
                    onValueChange={(value: 'BDT' | 'USD') => setShoppingPreferences(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT (৳)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="deliveryInstructions">Default Delivery Instructions</Label>
                <Textarea
                  id="deliveryInstructions"
                  value={shoppingPreferences.deliveryInstructions}
                  onChange={(e) => setShoppingPreferences(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                  placeholder="e.g., Call before delivery, Leave at door, Ring bell, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Product Recommendations</Label>
                    <p className="text-sm text-gray-600">Show personalized product suggestions</p>
                  </div>
                  <Switch
                    checked={shoppingPreferences.productRecommendations}
                    onCheckedChange={(checked) => setShoppingPreferences(prev => ({ ...prev, productRecommendations: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Price Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified when prices drop</p>
                  </div>
                  <Switch
                    checked={shoppingPreferences.priceAlerts}
                    onCheckedChange={(checked) => setShoppingPreferences(prev => ({ ...prev, priceAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wishlist Sharing</Label>
                    <p className="text-sm text-gray-600">Allow others to see your wishlist</p>
                  </div>
                  <Switch
                    checked={shoppingPreferences.wishlistSharing}
                    onCheckedChange={(checked) => setShoppingPreferences(prev => ({ ...prev, wishlistSharing: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveShoppingPreferences}>Save Shopping Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cultural Preferences Tab */}
        <TabsContent value="cultural" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaMosque className="h-5 w-5 mr-2" />
                Cultural & Religious Preferences
              </CardTitle>
              <CardDescription>Customize features for Bangladesh culture and Islamic practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Islamic Features</Label>
                    <p className="text-sm text-gray-600">Enable Islamic calendar, prayer times, and halal filters</p>
                  </div>
                  <Switch
                    checked={culturalPreferences.islamicFeatures}
                    onCheckedChange={(checked) => setCulturalPreferences(prev => ({ ...prev, islamicFeatures: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prayer Time Reminders</Label>
                    <p className="text-sm text-gray-600">Get notifications for daily prayer times</p>
                  </div>
                  <Switch
                    checked={culturalPreferences.prayerTimeReminders}
                    onCheckedChange={(checked) => setCulturalPreferences(prev => ({ ...prev, prayerTimeReminders: checked }))}
                    disabled={!culturalPreferences.islamicFeatures}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Festival Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified about Islamic and Bengali festivals</p>
                  </div>
                  <Switch
                    checked={culturalPreferences.festivalNotifications}
                    onCheckedChange={(checked) => setCulturalPreferences(prev => ({ ...prev, festivalNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Halal Product Filter</Label>
                    <p className="text-sm text-gray-600">Automatically filter out non-halal products</p>
                  </div>
                  <Switch
                    checked={culturalPreferences.halalProductFilter}
                    onCheckedChange={(checked) => setCulturalPreferences(prev => ({ ...prev, halalProductFilter: checked }))}
                    disabled={!culturalPreferences.islamicFeatures}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Arabic Language Support</Label>
                    <p className="text-sm text-gray-600">Show Arabic text for Islamic content</p>
                  </div>
                  <Switch
                    checked={culturalPreferences.arabicLanguageSupport}
                    onCheckedChange={(checked) => setCulturalPreferences(prev => ({ ...prev, arabicLanguageSupport: checked }))}
                    disabled={!culturalPreferences.islamicFeatures}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Islamic Calendar View</Label>
                    <p className="text-sm text-gray-600">Display Hijri dates alongside Gregorian calendar</p>
                  </div>
                  <Switch
                    checked={culturalPreferences.islamicCalendarView}
                    onCheckedChange={(checked) => setCulturalPreferences(prev => ({ ...prev, islamicCalendarView: checked }))}
                    disabled={!culturalPreferences.islamicFeatures}
                  />
                </div>
              </div>

              <Button onClick={() => {}}>Save Cultural Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Section */}
              <div>
                <h4 className="font-medium mb-4">Password & Authentication</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Password</Label>
                      <p className="text-sm text-gray-600">Last changed: {securitySettings.passwordLastChanged || 'Never'}</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">
                        {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <Button 
                      variant={securitySettings.twoFactorEnabled ? "destructive" : "default"}
                      onClick={handleEnableTwoFactor}
                      disabled={loading}
                    >
                      {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Connected Devices */}
              <div>
                <h4 className="font-medium mb-4">Connected Devices</h4>
                <div className="space-y-3">
                  {securitySettings.connectedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device.type)}
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-gray-600">
                            {device.location} • Last used: {device.lastUsed}
                          </p>
                          {device.current && (
                            <Badge variant="secondary">Current Device</Badge>
                          )}
                        </div>
                      </div>
                      {!device.current && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleLogoutDevice(device.id)}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Login History */}
              <div>
                <h4 className="font-medium mb-4">Recent Login Activity</h4>
                <div className="space-y-2">
                  {securitySettings.loginHistory.slice(0, 5).map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {login.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{login.device}</p>
                          <p className="text-xs text-gray-600">{login.location} • {login.date}</p>
                        </div>
                      </div>
                      <Badge variant={login.status === 'success' ? 'default' : 'destructive'}>
                        {login.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-gray-600">Who can see your profile information</p>
                  </div>
                  <Select 
                    value={privacySettings.profileVisibility}
                    onValueChange={(value: 'public' | 'friends' | 'private') => 
                      setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Purchase History</Label>
                    <p className="text-sm text-gray-600">Allow others to see your purchase history</p>
                  </div>
                  <Switch
                    checked={privacySettings.showPurchaseHistory}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showPurchaseHistory: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Personalization</Label>
                    <p className="text-sm text-gray-600">Use your data to personalize recommendations</p>
                  </div>
                  <Switch
                    checked={privacySettings.shareDataForPersonalization}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, shareDataForPersonalization: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Targeted Advertising</Label>
                    <p className="text-sm text-gray-600">Show personalized ads based on your activity</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowTargetedAds}
                    onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowTargetedAds: checked }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Data Management */}
              <div>
                <h4 className="font-medium mb-4">Data Management</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Download Your Data</Label>
                      <p className="text-sm text-gray-600">Get a copy of all your account data</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={handleDataDownload}
                      disabled={privacySettings.dataDownloadRequested || loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {privacySettings.dataDownloadRequested ? 'Requested' : 'Download'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                    <div>
                      <Label className="text-red-600">Delete Account</Label>
                      <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;