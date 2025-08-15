import React, { useState } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Shield, Key, Smartphone, Mail, Eye, EyeOff, AlertTriangle, CheckCircle, Clock, ArrowLeft, Trash2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SecurityDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  location: string;
  lastUsed: string;
  isCurrent: boolean;
  trusted: boolean;
}

interface LoginAttempt {
  id: string;
  timestamp: string;
  location: string;
  device: string;
  success: boolean;
  ipAddress: string;
}

const SecuritySettings: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [deviceTrustEnabled, setDeviceTrustEnabled] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const securityDevices: SecurityDevice[] = [
    {
      id: '1',
      name: 'iPhone 14 Pro',
      type: 'mobile',
      browser: 'Safari 17.2',
      location: 'Dhaka, Bangladesh',
      lastUsed: '2025-01-11T10:30:00Z',
      isCurrent: true,
      trusted: true
    },
    {
      id: '2',
      name: 'MacBook Pro',
      type: 'desktop',
      browser: 'Chrome 120.0',
      location: 'Dhaka, Bangladesh',
      lastUsed: '2025-01-10T18:45:00Z',
      isCurrent: false,
      trusted: true
    },
    {
      id: '3',
      name: 'Samsung Galaxy Tab',
      type: 'tablet',
      browser: 'Chrome Mobile 120.0',
      location: 'Chittagong, Bangladesh',
      lastUsed: '2025-01-08T14:20:00Z',
      isCurrent: false,
      trusted: false
    }
  ];

  const recentLogins: LoginAttempt[] = [
    {
      id: '1',
      timestamp: '2025-01-11T10:30:00Z',
      location: 'Dhaka, Bangladesh',
      device: 'iPhone 14 Pro',
      success: true,
      ipAddress: '103.4.145.22'
    },
    {
      id: '2',
      timestamp: '2025-01-10T18:45:00Z',
      location: 'Dhaka, Bangladesh',
      device: 'MacBook Pro',
      success: true,
      ipAddress: '103.4.145.22'
    },
    {
      id: '3',
      timestamp: '2025-01-09T09:15:00Z',
      location: 'Sylhet, Bangladesh',
      device: 'Unknown Device',
      success: false,
      ipAddress: '27.147.156.78'
    }
  ];

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = () => {
    // Handle password change
    console.log('Changing password...', passwordData);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return '📱';
      case 'desktop': return '💻';
      case 'tablet': return '📱';
      default: return '🖥️';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
          <p className="text-gray-600">Manage your account security and privacy settings</p>
        </div>

        {/* Security Status Overview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Security Status: Excellent</h3>
                <p className="text-sm text-gray-600">Your account has strong security settings enabled</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Secure</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="two-factor">2FA</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Password Security
                </CardTitle>
                <CardDescription>
                  Update your password and manage password security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Change Password</h3>
                  <div className="grid grid-cols-1 gap-4 max-w-md">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handlePasswordSubmit} className="w-full">
                      Update Password
                    </Button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Password Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>At least 8 characters long</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Contains uppercase and lowercase letters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Contains at least one number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Contains at least one special character</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="two-factor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 2FA Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">
                        {twoFactorEnabled ? 'Enabled and protecting your account' : 'Add extra security to your account'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>

                {/* 2FA Methods */}
                {twoFactorEnabled && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Authentication Methods</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">Authenticator App</h4>
                            <p className="text-sm text-gray-600">Use Google Authenticator or similar apps</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium">Email Verification</h4>
                            <p className="text-sm text-gray-600">Send codes to ahmed.rahman@gmail.com</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Setup</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-orange-600" />
                          <div>
                            <h4 className="font-medium">SMS Authentication</h4>
                            <p className="text-sm text-gray-600">Send codes to +880 1712-****78</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Setup</Button>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Backup Codes</h4>
                          <p className="text-sm text-yellow-700">
                            Generate backup codes in case you lose access to your authentication methods.
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Generate Backup Codes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Device Management
                </CardTitle>
                <CardDescription>
                  Manage devices that have access to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Device Trust Settings */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Trust New Devices</h3>
                    <p className="text-sm text-gray-600">Automatically trust devices from known locations</p>
                  </div>
                  <Switch
                    checked={deviceTrustEnabled}
                    onCheckedChange={setDeviceTrustEnabled}
                  />
                </div>

                {/* Device List */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Active Devices</h3>
                  {securityDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getDeviceIcon(device.type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{device.name}</h4>
                            {device.isCurrent && (
                              <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                            )}
                            {device.trusted && (
                              <Badge className="bg-green-100 text-green-800">Trusted</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{device.browser}</p>
                          <p className="text-sm text-gray-500">{device.location} • {formatDate(device.lastUsed)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!device.trusted && (
                          <Button variant="outline" size="sm">
                            Trust
                          </Button>
                        )}
                        {!device.isCurrent && (
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Security Activity
                </CardTitle>
                <CardDescription>
                  Recent login attempts and security events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Security Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Alerts</h4>
                        <p className="text-sm text-gray-600">Get notified of suspicious activity via email</p>
                      </div>
                      <Switch
                        checked={emailAlerts}
                        onCheckedChange={setEmailAlerts}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">SMS Alerts</h4>
                        <p className="text-sm text-gray-600">Get notified of suspicious activity via SMS</p>
                      </div>
                      <Switch
                        checked={smsAlerts}
                        onCheckedChange={setSmsAlerts}
                      />
                    </div>
                  </div>
                </div>

                {/* Recent Login Activity */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Recent Login Activity</h3>
                  <div className="space-y-3">
                    {recentLogins.map((login) => (
                      <div key={login.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            login.success ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {login.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {login.success ? 'Successful Login' : 'Failed Login Attempt'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {login.device} • {login.location}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(login.timestamp)} • {login.ipAddress}
                            </p>
                          </div>
                        </div>
                        {!login.success && (
                          <Badge variant="destructive">Blocked</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    View Full Activity Log
                  </Button>
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

export default SecuritySettings;