import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Mail, 
  Key, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  EyeOff,
  Device,
  Clock,
  MapPin,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface SecurityDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  location: string;
  lastActive: string;
  current: boolean;
}

interface SecurityActivity {
  id: string;
  action: string;
  timestamp: string;
  location: string;
  device: string;
  success: boolean;
}

export const SecuritySettings: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Mock data - in real app, this would come from API
  const devices: SecurityDevice[] = [
    {
      id: '1',
      name: 'iPhone 14 Pro',
      type: 'mobile',
      location: 'Dhaka, Bangladesh',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: '2',
      name: 'MacBook Pro',
      type: 'desktop',
      location: 'Dhaka, Bangladesh',
      lastActive: '1 hour ago',
      current: false
    },
    {
      id: '3',
      name: 'Samsung Galaxy Tab',
      type: 'tablet',
      location: 'Chittagong, Bangladesh',
      lastActive: '3 days ago',
      current: false
    }
  ];

  const securityActivity: SecurityActivity[] = [
    {
      id: '1',
      action: 'Login',
      timestamp: '2024-07-15 10:30:00',
      location: 'Dhaka, Bangladesh',
      device: 'iPhone 14 Pro',
      success: true
    },
    {
      id: '2',
      action: 'Password Change',
      timestamp: '2024-07-14 15:45:00',
      location: 'Dhaka, Bangladesh',
      device: 'MacBook Pro',
      success: true
    },
    {
      id: '3',
      action: 'Failed Login Attempt',
      timestamp: '2024-07-13 22:15:00',
      location: 'Unknown Location',
      device: 'Unknown Device',
      success: false
    }
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'desktop': return <Device className="w-4 h-4" />;
      case 'tablet': return <Device className="w-4 h-4" />;
      default: return <Device className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Your account security status and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Strong Password</p>
                <p className="text-sm text-green-600">Your password is secure</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">2FA Enabled</p>
                <p className="text-sm text-green-600">Extra security active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Email Verification</p>
                <p className="text-sm text-yellow-600">Verify your email</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2 text-blue-600" />
            Password Settings
          </CardTitle>
          <CardDescription>
            Manage your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button>Update Password</Button>
            <Button variant="outline">Generate Strong Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2 text-purple-600" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Authenticator App</p>
              <p className="text-sm text-gray-600">Use Google Authenticator or similar app</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <p className="font-semibold">Backup Codes</p>
            <p className="text-sm text-gray-600">
              Generate backup codes to access your account if you lose your phone
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline">Generate New Codes</Button>
              <Button variant="outline">Download Codes</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Security Alerts
          </CardTitle>
          <CardDescription>
            Configure how you want to be notified about security events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Email Alerts</p>
              <p className="text-sm text-gray-600">Receive security notifications via email</p>
            </div>
            <Switch
              checked={emailAlerts}
              onCheckedChange={setEmailAlerts}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">SMS Alerts</p>
              <p className="text-sm text-gray-600">Receive security notifications via SMS</p>
            </div>
            <Switch
              checked={smsAlerts}
              onCheckedChange={setSmsAlerts}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Login Alerts</p>
              <p className="text-sm text-gray-600">Get notified of new device logins</p>
            </div>
            <Switch
              checked={loginAlerts}
              onCheckedChange={setLoginAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Device className="w-5 h-5 mr-2 text-indigo-600" />
            Trusted Devices
          </CardTitle>
          <CardDescription>
            Manage devices that have access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(device.type)}
                  <div>
                    <p className="font-semibold">{device.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{device.location}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{device.lastActive}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {device.current && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Current Device
                    </Badge>
                  )}
                  {!device.current && (
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Recent Security Activity
          </CardTitle>
          <CardDescription>
            Monitor recent security events on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {activity.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold">{activity.action}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{activity.timestamp}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                      <span>•</span>
                      <span>{activity.device}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={activity.success ? 'secondary' : 'destructive'}>
                  {activity.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};