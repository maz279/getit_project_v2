import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  Settings, 
  Globe, 
  Shield, 
  Zap, 
  Database, 
  Mail, 
  Bell,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface ConfigSection {
  id: string;
  name: string;
  description: string;
  settings: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password';
    value: any;
    options?: string[];
    description?: string;
    required?: boolean;
  }>;
}

export const ConfigurationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);

  // Mock configuration data - in real app, this would come from API
  const [configSections, setConfigSections] = useState<ConfigSection[]>([
    {
      id: 'general',
      name: 'General Settings',
      description: 'Basic application configuration',
      settings: [
        {
          key: 'site_name',
          label: 'Site Name',
          type: 'text',
          value: 'GetIt Bangladesh',
          required: true,
          description: 'The name of your e-commerce platform'
        },
        {
          key: 'site_description',
          label: 'Site Description',
          type: 'textarea',
          value: 'Bangladesh\'s premier multi-vendor e-commerce platform',
          description: 'Brief description of your platform'
        },
        {
          key: 'maintenance_mode',
          label: 'Maintenance Mode',
          type: 'boolean',
          value: false,
          description: 'Enable maintenance mode to take the site offline'
        },
        {
          key: 'default_language',
          label: 'Default Language',
          type: 'select',
          value: 'en',
          options: ['en', 'bn'],
          description: 'Default language for the platform'
        },
        {
          key: 'timezone',
          label: 'Timezone',
          type: 'select',
          value: 'Asia/Dhaka',
          options: ['Asia/Dhaka', 'UTC', 'Asia/Kolkata'],
          description: 'Default timezone for the platform'
        }
      ]
    },
    {
      id: 'payments',
      name: 'Payment Settings',
      description: 'Payment gateway and billing configuration',
      settings: [
        {
          key: 'bkash_enabled',
          label: 'bKash Integration',
          type: 'boolean',
          value: true,
          description: 'Enable bKash mobile banking payments'
        },
        {
          key: 'bkash_app_key',
          label: 'bKash App Key',
          type: 'password',
          value: 'bkash_app_key_123',
          description: 'Your bKash application key'
        },
        {
          key: 'nagad_enabled',
          label: 'Nagad Integration',
          type: 'boolean',
          value: true,
          description: 'Enable Nagad mobile banking payments'
        },
        {
          key: 'nagad_merchant_id',
          label: 'Nagad Merchant ID',
          type: 'text',
          value: 'NAG-MERCHANT-123',
          description: 'Your Nagad merchant identifier'
        },
        {
          key: 'rocket_enabled',
          label: 'Rocket Integration',
          type: 'boolean',
          value: true,
          description: 'Enable Rocket mobile banking payments'
        },
        {
          key: 'payment_timeout',
          label: 'Payment Timeout (seconds)',
          type: 'number',
          value: 300,
          description: 'Payment session timeout in seconds'
        }
      ]
    },
    {
      id: 'notifications',
      name: 'Notification Settings',
      description: 'Email and SMS notification configuration',
      settings: [
        {
          key: 'email_enabled',
          label: 'Email Notifications',
          type: 'boolean',
          value: true,
          description: 'Enable email notifications'
        },
        {
          key: 'smtp_host',
          label: 'SMTP Host',
          type: 'text',
          value: 'smtp.gmail.com',
          description: 'SMTP server hostname'
        },
        {
          key: 'smtp_port',
          label: 'SMTP Port',
          type: 'number',
          value: 587,
          description: 'SMTP server port'
        },
        {
          key: 'smtp_username',
          label: 'SMTP Username',
          type: 'text',
          value: 'noreply@getit-bangladesh.com',
          description: 'SMTP authentication username'
        },
        {
          key: 'smtp_password',
          label: 'SMTP Password',
          type: 'password',
          value: 'smtp_password_123',
          description: 'SMTP authentication password'
        },
        {
          key: 'sms_enabled',
          label: 'SMS Notifications',
          type: 'boolean',
          value: true,
          description: 'Enable SMS notifications'
        },
        {
          key: 'sms_api_key',
          label: 'SMS API Key',
          type: 'password',
          value: 'sms_api_key_123',
          description: 'SMS service API key'
        }
      ]
    },
    {
      id: 'security',
      name: 'Security Settings',
      description: 'Security and authentication configuration',
      settings: [
        {
          key: 'password_min_length',
          label: 'Minimum Password Length',
          type: 'number',
          value: 8,
          description: 'Minimum required password length'
        },
        {
          key: 'require_2fa',
          label: 'Require 2FA',
          type: 'boolean',
          value: false,
          description: 'Force all users to enable 2FA'
        },
        {
          key: 'session_timeout',
          label: 'Session Timeout (minutes)',
          type: 'number',
          value: 60,
          description: 'User session timeout in minutes'
        },
        {
          key: 'max_login_attempts',
          label: 'Max Login Attempts',
          type: 'number',
          value: 5,
          description: 'Maximum failed login attempts before lockout'
        },
        {
          key: 'lockout_duration',
          label: 'Lockout Duration (minutes)',
          type: 'number',
          value: 30,
          description: 'Account lockout duration in minutes'
        },
        {
          key: 'jwt_secret',
          label: 'JWT Secret',
          type: 'password',
          value: 'jwt_secret_key_123',
          description: 'JWT token signing secret'
        }
      ]
    },
    {
      id: 'performance',
      name: 'Performance Settings',
      description: 'Caching and performance optimization',
      settings: [
        {
          key: 'cache_enabled',
          label: 'Enable Caching',
          type: 'boolean',
          value: true,
          description: 'Enable application caching'
        },
        {
          key: 'cache_ttl',
          label: 'Cache TTL (seconds)',
          type: 'number',
          value: 3600,
          description: 'Default cache time-to-live'
        },
        {
          key: 'redis_enabled',
          label: 'Redis Cache',
          type: 'boolean',
          value: false,
          description: 'Use Redis for caching'
        },
        {
          key: 'redis_host',
          label: 'Redis Host',
          type: 'text',
          value: 'localhost',
          description: 'Redis server hostname'
        },
        {
          key: 'redis_port',
          label: 'Redis Port',
          type: 'number',
          value: 6379,
          description: 'Redis server port'
        },
        {
          key: 'compression_enabled',
          label: 'Enable Compression',
          type: 'boolean',
          value: true,
          description: 'Enable response compression'
        }
      ]
    }
  ]);

  const handleSettingChange = (sectionId: string, settingKey: string, value: any) => {
    setConfigSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              settings: section.settings.map(setting => 
                setting.key === settingKey 
                  ? { ...setting, value }
                  : setting
              )
            }
          : section
      )
    );
    setHasChanges(true);
  };

  const handleSaveConfig = () => {
    // In real app, this would save to API
    console.log('Saving configuration...', configSections);
    setHasChanges(false);
  };

  const handleResetConfig = () => {
    // In real app, this would reset to defaults
    setHasChanges(false);
  };

  const renderSettingInput = (section: ConfigSection, setting: any) => {
    const value = setting.value;
    const onChange = (newValue: any) => handleSettingChange(section.id, setting.key, newValue);

    switch (setting.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.description}
            required={setting.required}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            placeholder={setting.description}
            required={setting.required}
          />
        );
      
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={onChange}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.description}
            rows={3}
            required={setting.required}
          />
        );
      
      case 'password':
        return (
          <div className="relative">
            <Input
              type={showApiKeys ? 'text' : 'password'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={setting.description}
              required={setting.required}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowApiKeys(!showApiKeys)}
            >
              {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'general': return <Settings className="w-5 h-5" />;
      case 'payments': return <Zap className="w-5 h-5" />;
      case 'notifications': return <Bell className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'performance': return <Database className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Dashboard</h1>
          <p className="text-gray-600">Manage your platform settings and configuration</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleResetConfig} disabled={!hasChanges}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveConfig} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {configSections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center">
              {getSectionIcon(section.id)}
              <span className="ml-2 hidden sm:inline">{section.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {configSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getSectionIcon(section.id)}
                  <span className="ml-2">{section.name}</span>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {section.settings.map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={setting.key} className="text-sm font-medium">
                          {setting.label}
                          {setting.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {setting.type === 'boolean' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {setting.value ? 'Enabled' : 'Disabled'}
                            </span>
                            {renderSettingInput(section, setting)}
                          </div>
                        )}
                      </div>
                      {setting.type !== 'boolean' && (
                        <div className="space-y-1">
                          {renderSettingInput(section, setting)}
                          {setting.description && (
                            <p className="text-sm text-gray-600">{setting.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Database Connected</p>
                <p className="text-sm text-green-600">All database connections healthy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Services Running</p>
                <p className="text-sm text-green-600">All microservices operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Cache Warning</p>
                <p className="text-sm text-yellow-600">Redis cache not connected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};