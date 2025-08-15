import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  MapPin, 
  CreditCard, 
  Shield, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Phone,
  User,
  Calendar,
  Briefcase,
  Heart
} from 'lucide-react';
import EnhancedUserApiService from '@/shared/services/user/EnhancedUserApiService';

interface BangladeshProfileData {
  nidNumber: string;
  district: string;
  upazila: string;
  postOffice: string;
  postalCode: string;
  religion: string;
  occupation: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  culturalPrefs: {
    language: string;
    festivalNotifications: boolean;
    prayerTimeNotifications: boolean;
    ramadanMode: boolean;
    localHolidays: boolean;
    culturalEvents: boolean;
    religiousEvents: boolean;
  };
}

interface MobileBankingAccount {
  provider: 'bkash' | 'nagad' | 'rocket';
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
}

const BangladeshProfileForm: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<BangladeshProfileData>({
    nidNumber: '',
    district: '',
    upazila: '',
    postOffice: '',
    postalCode: '',
    religion: '',
    occupation: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    culturalPrefs: {
      language: 'bn',
      festivalNotifications: true,
      prayerTimeNotifications: false,
      ramadanMode: false,
      localHolidays: true,
      culturalEvents: true,
      religiousEvents: false
    }
  });

  const [mobileBankingAccounts, setMobileBankingAccounts] = useState<MobileBankingAccount[]>([]);
  const [newMobileBanking, setNewMobileBanking] = useState<MobileBankingAccount>({
    provider: 'bkash',
    accountNumber: '',
    accountName: '',
    isPrimary: false
  });

  const [nidVerification, setNidVerification] = useState({
    dateOfBirth: '',
    fatherName: '',
    motherName: ''
  });

  const [alerts, setAlerts] = useState<any[]>([]);
  const [profileStatus, setProfileStatus] = useState<any>(null);

  // Bangladesh Districts
  const bangladeshDistricts = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh',
    'Comilla', 'Feni', 'Brahmanbaria', 'Rangamati', 'Noakhali', 'Chandpur', 'Lakshmipur',
    'Cox\'s Bazar', 'Bandarban', 'Khagrachhari', 'Bogra', 'Pabna', 'Sirajganj', 'Jaipurhat',
    'Chapainawabganj', 'Natore', 'Naogaon', 'Dinajpur', 'Gaibandha', 'Thakurgaon', 'Panchagarh',
    'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Jessore', 'Narail', 'Magura', 'Khulna',
    'Bagerhat', 'Chuadanga', 'Kushtia', 'Meherpur', 'Satkhira', 'Hobiganj', 'Moulvibazar',
    'Sunamganj', 'Sylhet', 'Barisal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur', 'Barguna'
  ];

  const religions = ['Islam', 'Hinduism', 'Buddhism', 'Christianity', 'Others'];

  useEffect(() => {
    loadBangladeshProfile();
  }, []);

  const loadBangladeshProfile = async () => {
    setLoading(true);
    try {
      const response = await EnhancedUserApiService.getBangladeshProfile();
      if (response.success && response.data.profile) {
        const profile = response.data.profile;
        setProfileData({
          nidNumber: profile.nidNumber || '',
          district: profile.district || '',
          upazila: profile.upazila || '',
          postOffice: profile.postOffice || '',
          postalCode: profile.postalCode || '',
          religion: profile.religion || '',
          occupation: profile.occupation || '',
          emergencyContact: profile.emergencyContact || {
            name: '',
            relationship: '',
            phone: ''
          },
          culturalPrefs: response.data.culturalPreferences || {
            language: 'bn',
            festivalNotifications: true,
            prayerTimeNotifications: false,
            ramadanMode: false,
            localHolidays: true,
            culturalEvents: true,
            religiousEvents: false
          }
        });
        setProfileStatus(profile);
      }

      if (response.data.mobileBankingAccounts) {
        setMobileBankingAccounts(response.data.mobileBankingAccounts);
      }
    } catch (error) {
      console.error('Failed to load Bangladesh profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.nidNumber || !profileData.district) {
      setAlerts([{ type: 'error', message: 'NID number and district are required' }]);
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.setupBangladeshProfile(profileData);
      if (response.success) {
        setAlerts([{ type: 'success', message: 'Bangladesh profile saved successfully' }]);
        setProfileStatus(response.data.profile);
      } else {
        setAlerts([{ type: 'error', message: response.message || 'Failed to save profile' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'Failed to save Bangladesh profile' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNID = async () => {
    if (!profileData.nidNumber || !nidVerification.dateOfBirth) {
      setAlerts([{ type: 'error', message: 'NID number and date of birth are required for verification' }]);
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.verifyNID({
        nidNumber: profileData.nidNumber,
        ...nidVerification
      });

      if (response.success) {
        setAlerts([{ type: 'success', message: 'NID verification submitted successfully' }]);
        await loadBangladeshProfile(); // Reload to get updated status
      } else {
        setAlerts([{ type: 'error', message: response.message || 'NID verification failed' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'Failed to verify NID' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMobileBanking = async () => {
    if (!newMobileBanking.provider || !newMobileBanking.accountNumber || !newMobileBanking.accountName) {
      setAlerts([{ type: 'error', message: 'All mobile banking fields are required' }]);
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.setupMobileBanking(newMobileBanking);
      if (response.success) {
        setAlerts([{ type: 'success', message: 'Mobile banking account added successfully' }]);
        setNewMobileBanking({
          provider: 'bkash',
          accountNumber: '',
          accountName: '',
          isPrimary: false
        });
        await loadBangladeshProfile(); // Reload to get updated accounts
      } else {
        setAlerts([{ type: 'error', message: response.message || 'Failed to add mobile banking account' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'Failed to add mobile banking account' }]);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusBadge = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'bkash': return 'bg-pink-100 text-pink-800';
      case 'nagad': return 'bg-orange-100 text-orange-800';
      case 'rocket': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.map((alert, index) => (
        <Alert key={index} className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="verification">NID Verification</TabsTrigger>
          <TabsTrigger value="banking">Mobile Banking</TabsTrigger>
          <TabsTrigger value="preferences">Cultural Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Information */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Bangladesh Profile Information
              </CardTitle>
              <CardDescription>
                Complete your Bangladesh-specific profile for better service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Verification Status */}
              {profileStatus && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Profile Status</p>
                      <p className="text-sm text-gray-600">
                        Verification Level: {profileStatus.verificationStatus}
                      </p>
                    </div>
                  </div>
                  {getVerificationStatusBadge(profileStatus.verificationStatus, profileStatus.isVerified)}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nidNumber">National ID (NID) Number *</Label>
                  <Input
                    id="nidNumber"
                    type="text"
                    value={profileData.nidNumber}
                    onChange={(e) => setProfileData({...profileData, nidNumber: e.target.value})}
                    placeholder="Enter your NID number"
                    maxLength={17}
                  />
                  <p className="text-xs text-gray-500">10, 13, or 17 digits</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select
                    value={profileData.district}
                    onValueChange={(value) => setProfileData({...profileData, district: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {bangladeshDistricts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upazila">Upazila/Thana</Label>
                  <Input
                    id="upazila"
                    type="text"
                    value={profileData.upazila}
                    onChange={(e) => setProfileData({...profileData, upazila: e.target.value})}
                    placeholder="Enter your upazila"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postOffice">Post Office</Label>
                  <Input
                    id="postOffice"
                    type="text"
                    value={profileData.postOffice}
                    onChange={(e) => setProfileData({...profileData, postOffice: e.target.value})}
                    placeholder="Enter your post office"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={profileData.postalCode}
                    onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                    placeholder="Enter postal code"
                    maxLength={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religion">Religion</Label>
                  <Select
                    value={profileData.religion}
                    onValueChange={(value) => setProfileData({...profileData, religion: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {religions.map(religion => (
                        <SelectItem key={religion} value={religion}>{religion}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    type="text"
                    value={profileData.occupation}
                    onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
                    placeholder="Enter your occupation"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input
                      id="emergencyName"
                      type="text"
                      value={profileData.emergencyContact.name}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        emergencyContact: {...profileData.emergencyContact, name: e.target.value}
                      })}
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      type="text"
                      value={profileData.emergencyContact.relationship}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        emergencyContact: {...profileData.emergencyContact, relationship: e.target.value}
                      })}
                      placeholder="e.g., Father, Mother, Spouse"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Phone Number</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={profileData.emergencyContact.phone}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        emergencyContact: {...profileData.emergencyContact, phone: e.target.value}
                      })}
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                Save Bangladesh Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NID Verification */}
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                National ID Verification
              </CardTitle>
              <CardDescription>
                Verify your NID for enhanced security and access to more features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileStatus?.isVerified ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-800 mb-2">NID Verified</h3>
                  <p className="text-green-600">Your National ID has been successfully verified</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nidForVerification">NID Number</Label>
                    <Input
                      id="nidForVerification"
                      type="text"
                      value={profileData.nidNumber}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={nidVerification.dateOfBirth}
                        onChange={(e) => setNidVerification({...nidVerification, dateOfBirth: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input
                        id="fatherName"
                        type="text"
                        value={nidVerification.fatherName}
                        onChange={(e) => setNidVerification({...nidVerification, fatherName: e.target.value})}
                        placeholder="Enter father's name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motherName">Mother's Name</Label>
                      <Input
                        id="motherName"
                        type="text"
                        value={nidVerification.motherName}
                        onChange={(e) => setNidVerification({...nidVerification, motherName: e.target.value})}
                        placeholder="Enter mother's name"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleVerifyNID} 
                    disabled={loading || !profileData.nidNumber || !nidVerification.dateOfBirth}
                    className="w-full"
                  >
                    Submit for Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Banking */}
        <TabsContent value="banking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Mobile Banking Accounts
              </CardTitle>
              <CardDescription>
                Link your bKash, Nagad, or Rocket accounts for easy payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Accounts */}
              {mobileBankingAccounts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Linked Accounts</h4>
                  {mobileBankingAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {account.accountName}
                            {account.isPrimary && <Badge variant="secondary">Primary</Badge>}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge className={getProviderColor(account.provider)}>
                              {account.provider.toUpperCase()}
                            </Badge>
                            {getVerificationStatusBadge(account.verificationStatus, account.verificationStatus === 'verified')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Account */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Add New Mobile Banking Account</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Select
                        value={newMobileBanking.provider}
                        onValueChange={(value: 'bkash' | 'nagad' | 'rocket') => 
                          setNewMobileBanking({...newMobileBanking, provider: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bkash">bKash</SelectItem>
                          <SelectItem value="nagad">Nagad</SelectItem>
                          <SelectItem value="rocket">Rocket</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        type="tel"
                        value={newMobileBanking.accountNumber}
                        onChange={(e) => setNewMobileBanking({...newMobileBanking, accountNumber: e.target.value})}
                        placeholder="01XXXXXXXXX"
                        maxLength={11}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input
                        id="accountName"
                        type="text"
                        value={newMobileBanking.accountName}
                        onChange={(e) => setNewMobileBanking({...newMobileBanking, accountName: e.target.value})}
                        placeholder="Account holder name"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="isPrimary"
                        checked={newMobileBanking.isPrimary}
                        onCheckedChange={(checked) => setNewMobileBanking({...newMobileBanking, isPrimary: checked})}
                      />
                      <Label htmlFor="isPrimary">Set as primary account</Label>
                    </div>
                  </div>

                  <Button onClick={handleAddMobileBanking} disabled={loading} className="w-full">
                    Add Mobile Banking Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cultural Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Cultural Preferences
              </CardTitle>
              <CardDescription>
                Customize your experience with Bangladesh cultural features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={profileData.culturalPrefs.language}
                    onValueChange={(value) => setProfileData({
                      ...profileData,
                      culturalPrefs: {...profileData.culturalPrefs, language: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Preferences</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="festivalNotifications">Festival Notifications</Label>
                        <p className="text-sm text-gray-600">Get notified about Eid, Pohela Boishakh, and other festivals</p>
                      </div>
                      <Switch
                        id="festivalNotifications"
                        checked={profileData.culturalPrefs.festivalNotifications}
                        onCheckedChange={(checked) => setProfileData({
                          ...profileData,
                          culturalPrefs: {...profileData.culturalPrefs, festivalNotifications: checked}
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="prayerTimeNotifications">Prayer Time Notifications</Label>
                        <p className="text-sm text-gray-600">Daily prayer time reminders</p>
                      </div>
                      <Switch
                        id="prayerTimeNotifications"
                        checked={profileData.culturalPrefs.prayerTimeNotifications}
                        onCheckedChange={(checked) => setProfileData({
                          ...profileData,
                          culturalPrefs: {...profileData.culturalPrefs, prayerTimeNotifications: checked}
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ramadanMode">Ramadan Mode</Label>
                        <p className="text-sm text-gray-600">Special features during Ramadan</p>
                      </div>
                      <Switch
                        id="ramadanMode"
                        checked={profileData.culturalPrefs.ramadanMode}
                        onCheckedChange={(checked) => setProfileData({
                          ...profileData,
                          culturalPrefs: {...profileData.culturalPrefs, ramadanMode: checked}
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="localHolidays">Local Holiday Notifications</Label>
                        <p className="text-sm text-gray-600">Victory Day, Independence Day, Language Day</p>
                      </div>
                      <Switch
                        id="localHolidays"
                        checked={profileData.culturalPrefs.localHolidays}
                        onCheckedChange={(checked) => setProfileData({
                          ...profileData,
                          culturalPrefs: {...profileData.culturalPrefs, localHolidays: checked}
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="culturalEvents">Cultural Event Promotions</Label>
                        <p className="text-sm text-gray-600">Special offers during cultural events</p>
                      </div>
                      <Switch
                        id="culturalEvents"
                        checked={profileData.culturalPrefs.culturalEvents}
                        onCheckedChange={(checked) => setProfileData({
                          ...profileData,
                          culturalPrefs: {...profileData.culturalPrefs, culturalEvents: checked}
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="religiousEvents">Religious Event Notifications</Label>
                        <p className="text-sm text-gray-600">Islamic, Hindu, Buddhist, Christian religious events</p>
                      </div>
                      <Switch
                        id="religiousEvents"
                        checked={profileData.culturalPrefs.religiousEvents}
                        onCheckedChange={(checked) => setProfileData({
                          ...profileData,
                          culturalPrefs: {...profileData.culturalPrefs, religiousEvents: checked}
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                  Save Cultural Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BangladeshProfileForm;