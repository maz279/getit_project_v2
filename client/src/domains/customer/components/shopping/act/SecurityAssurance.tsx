/**
 * Phase 3: Act Stage - Security Assurance
 * Amazon.com 5 A's Framework Implementation
 * Trust & Security Verification for Bangladesh Market
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Phone,
  Fingerprint,
  CreditCard,
  UserCheck,
  Globe,
  Award,
  Clock,
  Zap,
  Star,
  Info,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityAssuranceProps {
  userId?: string;
  transactionId?: string;
  className?: string;
}

interface SecurityProfile {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  verificationStatus: VerificationStatus;
  securityFeatures: SecurityFeature[];
  complianceStandards: ComplianceStandard[];
  fraudProtection: FraudProtection;
  privacySettings: PrivacySetting[];
}

interface VerificationStatus {
  identity: {
    verified: boolean;
    method: string;
    score: number;
    lastChecked: string;
  };
  phone: {
    verified: boolean;
    method: string;
    score: number;
    lastChecked: string;
  };
  email: {
    verified: boolean;
    method: string;
    score: number;
    lastChecked: string;
  };
  payment: {
    verified: boolean;
    method: string;
    score: number;
    lastChecked: string;
  };
  address: {
    verified: boolean;
    method: string;
    score: number;
    lastChecked: string;
  };
}

interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  active: boolean;
  strength: 'basic' | 'standard' | 'advanced' | 'enterprise';
  details: string[];
}

interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  logo: string;
  certified: boolean;
  validUntil: string;
  details: string[];
}

interface FraudProtection {
  aiMonitoring: boolean;
  riskAnalysis: number;
  behaviorTracking: boolean;
  deviceFingerprinting: boolean;
  geolocationCheck: boolean;
  velocityLimits: boolean;
  blacklistCheck: boolean;
  alertSystem: boolean;
}

interface PrivacySetting {
  id: string;
  category: string;
  title: string;
  description: string;
  enabled: boolean;
  required: boolean;
}

const SecurityAssurance: React.FC<SecurityAssuranceProps> = ({
  userId,
  transactionId,
  className,
}) => {
  const [securityProfile, setSecurityProfile] = useState<SecurityProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'compliance' | 'privacy'>('overview');
  const [verificationInProgress, setVerificationInProgress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load security profile data
    const loadSecurityProfile = () => {
      const mockProfile: SecurityProfile = {
        overallScore: 92,
        riskLevel: 'low',
        verificationStatus: {
          identity: {
            verified: true,
            method: 'National ID + Biometric',
            score: 95,
            lastChecked: '2024-12-10'
          },
          phone: {
            verified: true,
            method: 'SMS + Voice Call',
            score: 88,
            lastChecked: '2024-12-09'
          },
          email: {
            verified: true,
            method: 'Email Link + Code',
            score: 92,
            lastChecked: '2024-12-08'
          },
          payment: {
            verified: true,
            method: 'Bank Verification + Test Transaction',
            score: 94,
            lastChecked: '2024-12-07'
          },
          address: {
            verified: true,
            method: 'GPS + OTP Delivery',
            score: 89,
            lastChecked: '2024-12-06'
          }
        },
        securityFeatures: [
          {
            id: 'encryption',
            name: '256-bit SSL Encryption',
            description: 'Military-grade encryption for all data transmission',
            icon: Lock,
            active: true,
            strength: 'enterprise',
            details: [
              'TLS 1.3 protocol implementation',
              'End-to-end encryption for sensitive data',
              'Perfect Forward Secrecy (PFS)',
              'Certificate pinning for mobile apps'
            ]
          },
          {
            id: 'mfa',
            name: 'Multi-Factor Authentication',
            description: 'Multiple verification layers for account access',
            icon: UserCheck,
            active: true,
            strength: 'advanced',
            details: [
              'SMS OTP verification',
              'Email verification codes',
              'Biometric authentication (fingerprint/face)',
              'Hardware security key support'
            ]
          },
          {
            id: 'ai-fraud',
            name: 'AI Fraud Detection',
            description: 'Machine learning powered fraud prevention',
            icon: Eye,
            active: true,
            strength: 'enterprise',
            details: [
              'Real-time transaction monitoring',
              'Behavioral pattern analysis',
              'Device fingerprinting',
              'Geolocation anomaly detection'
            ]
          },
          {
            id: 'secure-payment',
            name: 'Secure Payment Processing',
            description: 'Bank-grade payment security infrastructure',
            icon: CreditCard,
            active: true,
            strength: 'enterprise',
            details: [
              'PCI DSS Level 1 compliance',
              'Tokenized payment processing',
              'CVV encryption',
              'Real-time fraud scoring'
            ]
          },
          {
            id: 'biometric',
            name: 'Biometric Security',
            description: 'Advanced biometric verification systems',
            icon: Fingerprint,
            active: true,
            strength: 'advanced',
            details: [
              'Fingerprint recognition',
              'Face ID verification',
              'Voice pattern matching',
              'Liveness detection'
            ]
          }
        ],
        complianceStandards: [
          {
            id: 'pci-dss',
            name: 'PCI DSS Level 1',
            description: 'Payment Card Industry Data Security Standard',
            logo: '🛡️',
            certified: true,
            validUntil: '2025-12-31',
            details: [
              'Secure payment processing',
              'Regular security assessments',
              'Network security controls',
              'Access control measures'
            ]
          },
          {
            id: 'iso-27001',
            name: 'ISO 27001',
            description: 'Information Security Management System',
            logo: '🏆',
            certified: true,
            validUntil: '2025-10-15',
            details: [
              'Information security controls',
              'Risk management framework',
              'Continuous improvement process',
              'Third-party audited'
            ]
          },
          {
            id: 'bangladesh-bank',
            name: 'Bangladesh Bank Approved',
            description: 'Central Bank of Bangladesh certification',
            logo: '🏛️',
            certified: true,
            validUntil: '2025-06-30',
            details: [
              'Digital payment authorization',
              'Anti-money laundering compliance',
              'Customer protection standards',
              'Regular regulatory audits'
            ]
          },
          {
            id: 'gdpr',
            name: 'GDPR Compliant',
            description: 'General Data Protection Regulation',
            logo: '🇪🇺',
            certified: true,
            validUntil: 'Ongoing',
            details: [
              'Data privacy protection',
              'User consent management',
              'Right to be forgotten',
              'Data portability rights'
            ]
          }
        ],
        fraudProtection: {
          aiMonitoring: true,
          riskAnalysis: 94,
          behaviorTracking: true,
          deviceFingerprinting: true,
          geolocationCheck: true,
          velocityLimits: true,
          blacklistCheck: true,
          alertSystem: true
        },
        privacySettings: [
          {
            id: 'data-collection',
            category: 'Data Collection',
            title: 'Minimal Data Collection',
            description: 'We only collect data necessary for service delivery',
            enabled: true,
            required: true
          },
          {
            id: 'data-encryption',
            category: 'Data Security',
            title: 'Data Encryption at Rest',
            description: 'All stored data is encrypted using AES-256',
            enabled: true,
            required: true
          },
          {
            id: 'data-sharing',
            category: 'Data Sharing',
            title: 'No Third-Party Data Sharing',
            description: 'Your data is never shared without explicit consent',
            enabled: true,
            required: false
          },
          {
            id: 'cookie-control',
            category: 'Tracking',
            title: 'Cookie Control',
            description: 'You control which cookies are allowed',
            enabled: true,
            required: false
          }
        ]
      };

      setTimeout(() => {
        setSecurityProfile(mockProfile);
        setLoading(false);
      }, 1000);
    };

    loadSecurityProfile();
  }, [userId, transactionId]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    return 'Needs Improvement';
  };

  const handleVerification = (type: string) => {
    setVerificationInProgress(type);
    
    // Simulate verification process
    setTimeout(() => {
      setVerificationInProgress(null);
      alert(`${type} verification completed successfully!`);
    }, 3000);
  };

  if (loading) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!securityProfile) {
    return (
      <div className={cn('max-w-4xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Security Profile Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load security information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-6 w-6 text-green-500" />
          Security Assurance Center
        </h1>
        <p className="text-muted-foreground">
          Your security and privacy protection status
        </p>
      </div>

      {/* Security Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {securityProfile.overallScore}%
            </div>
            <div className="text-sm text-muted-foreground mb-2">Security Score</div>
            <Badge className="bg-green-100 text-green-700">
              {getScoreBadge(securityProfile.overallScore)}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {securityProfile.fraudProtection.riskAnalysis}%
            </div>
            <div className="text-sm text-muted-foreground mb-2">Fraud Protection</div>
            <Badge className="bg-blue-100 text-blue-700">
              Active Monitoring
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {securityProfile.riskLevel.toUpperCase()}
            </div>
            <div className="text-sm text-muted-foreground mb-2">Risk Level</div>
            <Badge className={cn(
              securityProfile.riskLevel === 'low' && 'bg-green-100 text-green-700',
              securityProfile.riskLevel === 'medium' && 'bg-yellow-100 text-yellow-700',
              securityProfile.riskLevel === 'high' && 'bg-red-100 text-red-700'
            )}>
              {securityProfile.riskLevel === 'low' && 'Secure'}
              {securityProfile.riskLevel === 'medium' && 'Monitor'}
              {securityProfile.riskLevel === 'high' && 'Alert'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['overview', 'verification', 'compliance', 'privacy'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityProfile.securityFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        feature.active ? 'bg-green-100' : 'bg-gray-100'
                      )}>
                        <Icon className={cn(
                          'h-5 w-5',
                          feature.active ? 'text-green-600' : 'text-gray-400'
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{feature.name}</h3>
                          <Badge variant={feature.active ? 'default' : 'secondary'} className="text-xs">
                            {feature.strength}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                        <div className="text-xs text-muted-foreground">
                          {feature.details.slice(0, 2).join(' • ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Fraud Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={cn(
                    'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center',
                    securityProfile.fraudProtection.aiMonitoring ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    <Eye className={cn(
                      'h-6 w-6',
                      securityProfile.fraudProtection.aiMonitoring ? 'text-green-600' : 'text-red-600'
                    )} />
                  </div>
                  <div className="text-sm font-medium">AI Monitoring</div>
                  <div className="text-xs text-muted-foreground">
                    {securityProfile.fraudProtection.aiMonitoring ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {securityProfile.fraudProtection.riskAnalysis}%
                  </div>
                  <div className="text-sm font-medium">Risk Analysis</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center',
                    securityProfile.fraudProtection.deviceFingerprinting ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    <Fingerprint className={cn(
                      'h-6 w-6',
                      securityProfile.fraudProtection.deviceFingerprinting ? 'text-green-600' : 'text-red-600'
                    )} />
                  </div>
                  <div className="text-sm font-medium">Device Tracking</div>
                  <div className="text-xs text-muted-foreground">
                    {securityProfile.fraudProtection.deviceFingerprinting ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center',
                    securityProfile.fraudProtection.alertSystem ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    <AlertTriangle className={cn(
                      'h-6 w-6',
                      securityProfile.fraudProtection.alertSystem ? 'text-green-600' : 'text-red-600'
                    )} />
                  </div>
                  <div className="text-sm font-medium">Alert System</div>
                  <div className="text-xs text-muted-foreground">
                    {securityProfile.fraudProtection.alertSystem ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(securityProfile.verificationStatus).map(([key, status]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        status.verified ? 'bg-green-100' : 'bg-yellow-100'
                      )}>
                        {key === 'identity' && <UserCheck className={cn('h-5 w-5', status.verified ? 'text-green-600' : 'text-yellow-600')} />}
                        {key === 'phone' && <Phone className={cn('h-5 w-5', status.verified ? 'text-green-600' : 'text-yellow-600')} />}
                        {key === 'email' && <Globe className={cn('h-5 w-5', status.verified ? 'text-green-600' : 'text-yellow-600')} />}
                        {key === 'payment' && <CreditCard className={cn('h-5 w-5', status.verified ? 'text-green-600' : 'text-yellow-600')} />}
                        {key === 'address' && <Shield className={cn('h-5 w-5', status.verified ? 'text-green-600' : 'text-yellow-600')} />}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{key} Verification</h3>
                        <p className="text-sm text-muted-foreground">{status.method}</p>
                        <p className="text-xs text-muted-foreground">Last checked: {status.lastChecked}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-lg font-bold', getScoreColor(status.score))}>
                        {status.score}%
                      </div>
                      <div className="flex items-center gap-2">
                        {status.verified ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleVerification(key)}
                            disabled={verificationInProgress === key}
                          >
                            {verificationInProgress === key ? 'Verifying...' : 'Verify Now'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityProfile.complianceStandards.map((standard) => (
                  <div key={standard.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">{standard.logo}</div>
                      <div>
                        <h3 className="font-semibold">{standard.name}</h3>
                        <p className="text-sm text-muted-foreground">{standard.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={cn(
                        standard.certified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {standard.certified ? 'Certified' : 'Not Certified'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Valid until: {standard.validUntil}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-1">Coverage:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {standard.details.slice(0, 3).map((detail, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityProfile.privacySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{setting.title}</h3>
                        {setting.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Category: {setting.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        setting.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      )}>
                        {setting.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      {!setting.required && (
                        <Button variant="outline" size="sm">
                          {setting.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Data Access</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Request a copy of all data we have about you
                  </p>
                  <Button variant="outline" size="sm">Request Data</Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Deletion</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Request permanent deletion of your account and data
                  </p>
                  <Button variant="outline" size="sm">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trust Indicators */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Trust & Safety Commitment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-muted-foreground">Security Monitoring</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">0.01%</div>
              <div className="text-sm text-muted-foreground">Fraud Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAssurance;