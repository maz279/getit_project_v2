import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  AlertTriangle, 
  Key, 
  Eye, 
  EyeOff,
  Download,
  Trash2,
  Lock,
  Unlock,
  Clock,
  MapPin
} from 'lucide-react';
import EnhancedUserApiService from '@/shared/services/user/EnhancedUserApiService';

interface SecurityEvent {
  id: string;
  eventType: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface Session {
  id: string;
  deviceInfo: any;
  ipAddress: string;
  location: any;
  lastActivityAt: string;
  createdAt: string;
  isCurrent: boolean;
}

const SecuritySettingsPanel: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaData, setMfaData] = useState<any>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Form States
  const [mfaToken, setMfaToken] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const [eventsRes, sessionsRes] = await Promise.all([
        EnhancedUserApiService.getSecurityEvents(20),
        EnhancedUserApiService.getActiveSessions()
      ]);

      if (eventsRes.success) {
        setSecurityEvents(eventsRes.data.events || []);
      }

      if (sessionsRes.success) {
        setActiveSessions(sessionsRes.data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    setLoading(true);
    try {
      const response = await EnhancedUserApiService.enableMFA();
      if (response.success) {
        setMfaData(response.data);
        setShowMfaSetup(true);
        setAlerts([{ type: 'success', message: 'MFA setup initiated. Scan the QR code with your authenticator app.' }]);
      } else {
        setAlerts([{ type: 'error', message: response.message || 'Failed to enable MFA' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'An error occurred while enabling MFA' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!mfaToken || mfaToken.length !== 6) {
      setAlerts([{ type: 'error', message: 'Please enter a valid 6-digit MFA code' }]);
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.verifyMFASetup(mfaToken);
      if (response.success) {
        setMfaEnabled(true);
        setShowMfaSetup(false);
        setMfaToken('');
        setAlerts([{ type: 'success', message: 'MFA enabled successfully!' }]);
      } else {
        setAlerts([{ type: 'error', message: response.message || 'Invalid MFA code' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'Failed to verify MFA code' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!currentPassword || !mfaToken) {
      setAlerts([{ type: 'error', message: 'Password and MFA code are required to disable MFA' }]);
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.disableMFA(currentPassword, mfaToken);
      if (response.success) {
        setMfaEnabled(false);
        setCurrentPassword('');
        setMfaToken('');
        setAlerts([{ type: 'success', message: 'MFA disabled successfully' }]);
      } else {
        setAlerts([{ type: 'error', message: response.message || 'Failed to disable MFA' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'Failed to disable MFA' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAlerts([{ type: 'error', message: 'All password fields are required' }]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlerts([{ type: 'error', message: 'New passwords do not match' }]);
      return;
    }

    if (newPassword.length < 8) {
      setAlerts([{ type: 'error', message: 'Password must be at least 8 characters long' }]);
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.changePasswordSecure(
        currentPassword, 
        newPassword, 
        mfaEnabled ? mfaToken : undefined
      );
      
      if (response.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMfaToken('');
        setAlerts([{ type: 'success', message: 'Password changed successfully' }]);
      } else {
        setAlerts([{ type: 'error', message: response.message || 'Failed to change password' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'Failed to change password' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await EnhancedUserApiService.terminateSession(sessionId);
      if (response.success) {
        setActiveSessions(sessions => sessions.filter(s => s.id !== sessionId));
        setAlerts([{ type: 'success', message: 'Session terminated successfully' }]);
      } else {
        setAlerts([{ type: 'error', message: response.message || 'Failed to terminate session' }]);
      }
    } catch (error) {
      setAlerts([{ type: 'error', message: 'Failed to terminate session' }]);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-blue-100 text-blue-800';
      case 'password_changed': return 'bg-yellow-100 text-yellow-800';
      case 'mfa_enabled': return 'bg-purple-100 text-purple-800';
      case 'account_locked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mfa">Multi-Factor Auth</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
        </TabsList>

        {/* Security Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overview
              </CardTitle>
              <CardDescription>
                Manage your account security settings and monitor security activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Multi-Factor Auth</p>
                      <p className="text-sm text-gray-600">
                        {mfaEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={mfaEnabled ? "default" : "secondary"}>
                    {mfaEnabled ? 'Secure' : 'Setup Required'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-gray-600">{activeSessions.length} devices</p>
                    </div>
                  </div>
                  <Badge variant="outline">{activeSessions.length}</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="font-medium">Security Events</p>
                      <p className="text-sm text-gray-600">Last 30 days</p>
                    </div>
                  </div>
                  <Badge variant="outline">{securityEvents.length}</Badge>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>

                  {mfaEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="mfaCode">MFA Code</Label>
                      <Input
                        id="mfaCode"
                        type="text"
                        value={mfaToken}
                        onChange={(e) => setMfaToken(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                  className="mt-4"
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Factor Authentication */}
        <TabsContent value="mfa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Multi-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!mfaEnabled ? (
                <div className="space-y-4">
                  {!showMfaSetup ? (
                    <div className="text-center py-8">
                      <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Secure Your Account</h3>
                      <p className="text-gray-600 mb-6">
                        Enable two-factor authentication for enhanced security
                      </p>
                      <Button onClick={handleEnableMFA} disabled={loading}>
                        Enable MFA
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Setup MFA</h3>
                      
                      {mfaData?.qrCode && (
                        <div className="text-center">
                          <img 
                            src={mfaData.qrCode} 
                            alt="MFA QR Code" 
                            className="mx-auto mb-4 border rounded-lg"
                          />
                          <p className="text-sm text-gray-600 mb-4">
                            Scan this QR code with your authenticator app
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="mfaVerificationCode">Verification Code</Label>
                        <Input
                          id="mfaVerificationCode"
                          type="text"
                          value={mfaToken}
                          onChange={(e) => setMfaToken(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleVerifyMFA} disabled={loading || mfaToken.length !== 6}>
                          Verify & Enable
                        </Button>
                        <Button variant="outline" onClick={() => setShowMfaSetup(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">MFA Enabled</p>
                        <p className="text-sm text-green-600">Your account is protected</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Disable MFA</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passwordForMFA">Current Password</Label>
                        <Input
                          id="passwordForMFA"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mfaCodeDisable">MFA Code</Label>
                        <Input
                          id="mfaCodeDisable"
                          type="text"
                          value={mfaToken}
                          onChange={(e) => setMfaToken(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <Button 
                      variant="destructive"
                      onClick={handleDisableMFA}
                      disabled={loading || !currentPassword || !mfaToken}
                      className="mt-4"
                    >
                      Disable MFA
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices that are currently logged into your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {session.deviceInfo?.type === 'mobile' ? (
                          <Smartphone className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Monitor className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {session.deviceInfo?.browser || 'Unknown Browser'}
                          {session.isCurrent && (
                            <Badge variant="secondary" className="ml-2">Current</Badge>
                          )}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(session.lastActivityAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Terminate
                      </Button>
                    )}
                  </div>
                ))}

                {activeSessions.length === 0 && (
                  <div className="text-center py-8">
                    <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active sessions found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Events
              </CardTitle>
              <CardDescription>
                Recent security-related activities on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {formatEventType(event.eventType)}
                      </Badge>
                      <div>
                        <p className="text-sm">
                          {event.details?.action || event.eventType}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{event.ipAddress}</span>
                          <span>{new Date(event.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {securityEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No security events found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettingsPanel;