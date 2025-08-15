import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Shield, 
  Smartphone, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import EnhancedUserApiService from '@/shared/services/users/EnhancedUserApiService';
import { useToast } from '@/shared/hooks/use-toast';

/**
 * Security Settings Panel Component
 * Amazon.com/Shopee.sg-level security management interface
 */
const SecuritySettingsPanel = ({ userId, userProfile }) => {
  const [loading, setLoading] = useState(false);
  const [mfaSetup, setMfaSetup] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [securityEvents, setSecurityEvents] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadSecurityEvents();
      checkSuspiciousActivity();
    }
  }, [userId]);

  const loadSecurityEvents = async () => {
    try {
      const response = await EnhancedUserApiService.getSecurityEvents(userId, 1, 10);
      if (response.success) {
        setSecurityEvents(response.events || []);
      }
    } catch (error) {
      console.error('Failed to load security events:', error);
    }
  };

  const checkSuspiciousActivity = async () => {
    try {
      const response = await EnhancedUserApiService.detectSuspiciousActivity(userId);
      if (response.success) {
        setSuspiciousActivity(response);
      }
    } catch (error) {
      console.error('Failed to check suspicious activity:', error);
    }
  };

  const setupMFA = async () => {
    setLoading(true);
    try {
      const response = await EnhancedUserApiService.setupMFA(userId);
      
      if (response.success) {
        setMfaSetup(response.setup);
        toast({
          title: "MFA Setup Initiated",
          description: "Scan the QR code with your authenticator app"
        });
      } else {
        toast({
          variant: "destructive",
          title: "MFA Setup Failed",
          description: response.error || "Failed to setup MFA"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "MFA setup failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a 6-digit TOTP code"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await EnhancedUserApiService.verifyAndEnableMFA(userId, totpCode);
      
      if (response.success) {
        setMfaSetup(null);
        setTotpCode('');
        toast({
          title: "MFA Enabled Successfully",
          description: "Two-factor authentication is now active on your account"
        });
        // Refresh user profile to show MFA enabled status
        window.location.reload();
      } else {
        toast({
          variant: "destructive",
          title: "MFA Verification Failed",
          description: response.error || "Invalid TOTP code"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "MFA verification failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Eye className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-BD', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
          <p className="text-muted-foreground">
            Manage your account security and privacy settings
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          Security Center
        </Badge>
      </div>

      <Tabs defaultValue="mfa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mfa">MFA Setup</TabsTrigger>
          <TabsTrigger value="activity">Security Events</TabsTrigger>
          <TabsTrigger value="monitoring">Activity Monitor</TabsTrigger>
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
        </TabsList>

        {/* MFA Setup Tab */}
        <TabsContent value="mfa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Two-Factor Authentication
                {userProfile?.mfaEnabled && (
                  <Badge className="ml-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account with TOTP-based authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userProfile?.mfaEnabled ? (
                <>
                  {!mfaSetup ? (
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Two-factor authentication significantly improves your account security. 
                          You'll need an authenticator app like Google Authenticator or Authy.
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        onClick={setupMFA}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Setting up...' : 'Setup Two-Factor Authentication'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="mb-4">
                          <img 
                            src={mfaSetup.qrCode} 
                            alt="QR Code for MFA Setup" 
                            className="mx-auto border rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Scan this QR code with your authenticator app
                        </p>
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                          Manual Entry Key: {mfaSetup.manualEntryKey}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totp">Enter 6-digit code from your app</Label>
                        <Input
                          id="totp"
                          placeholder="123456"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                        />
                      </div>

                      <Button 
                        onClick={verifyAndEnableMFA}
                        disabled={loading || totpCode.length !== 6}
                        className="w-full"
                      >
                        {loading ? 'Verifying...' : 'Verify and Enable MFA'}
                      </Button>

                      {mfaSetup.backup_codes && (
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowBackupCodes(!showBackupCodes)}
                            className="w-full"
                          >
                            {showBackupCodes ? 'Hide' : 'Show'} Backup Codes
                          </Button>
                          
                          {showBackupCodes && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium mb-2">Backup Codes (save these safely):</p>
                              <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                                {mfaSetup.backup_codes.map((code, index) => (
                                  <div key={index} className="bg-white p-1 rounded text-center">
                                    {code}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is enabled and protecting your account. 
                    You can disable it from your account settings if needed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Monitor security-related activities on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityEvents.length > 0 ? (
                <div className="space-y-3">
                  {securityEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {getSeverityIcon(event.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {event.eventDescription || event.eventType}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {event.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(event.createdAt)}
                          </span>
                          {event.ipAddress && (
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No security events recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Monitor Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Suspicious Activity Monitor
              </CardTitle>
              <CardDescription>
                Real-time monitoring of unusual account activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suspiciousActivity ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${getRiskLevelColor(suspiciousActivity.riskLevel)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Current Risk Level</span>
                      <Badge variant="outline">
                        {suspiciousActivity.riskLevel?.toUpperCase()} ({suspiciousActivity.riskScore}/100)
                      </Badge>
                    </div>
                    <p className="text-sm">
                      Your account is being monitored for unusual activities
                    </p>
                  </div>

                  {suspiciousActivity.suspiciousFactors?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Detected Factors:</h4>
                      {suspiciousActivity.suspiciousFactors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Badge variant="outline" className={getRiskLevelColor(factor.severity)}>
                            {factor.severity}
                          </Badge>
                          <span>{factor.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {suspiciousActivity.recommendations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Security Recommendations:</h4>
                      <ul className="text-sm space-y-1">
                        {suspiciousActivity.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading activity monitor...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {suspiciousActivity ? Math.max(100 - suspiciousActivity.riskScore, 0) : 85}/100
                  </div>
                  <p className="text-sm text-muted-foreground">Excellent Security</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Verified</span>
                    {userProfile?.isEmailVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phone Verified</span>
                    {userProfile?.isPhoneVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Two-Factor Auth</span>
                    {userProfile?.mfaEnabled ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NID Verified</span>
                    {userProfile?.nidVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettingsPanel;