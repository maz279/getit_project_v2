
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { ChatSettings } from './types';
import { Save, Plus, Trash2 } from 'lucide-react';

interface ChatSettingsTabProps {
  settings: ChatSettings;
}

export const ChatSettingsTab: React.FC<ChatSettingsTabProps> = ({ settings }) => {
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    console.log('Saving chat settings:', formData);
    // Implementation for saving settings
  };

  const addEscalationRule = () => {
    setFormData({
      ...formData,
      automation: {
        ...formData.automation,
        escalationRules: [
          ...formData.automation.escalationRules,
          { condition: '', action: '' }
        ]
      }
    });
  };

  const removeEscalationRule = (index: number) => {
    const newRules = formData.automation.escalationRules.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      automation: {
        ...formData.automation,
        escalationRules: newRules
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="chat-enabled">Enable Live Chat</Label>
              <p className="text-sm text-gray-600">Allow customers to start chat sessions</p>
            </div>
            <Switch
              id="chat-enabled"
              checked={formData.general.chatEnabled}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  general: { ...formData.general, chatEnabled: checked }
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-time">Operating Hours Start</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.general.operatingHours.start}
                onChange={(e) => 
                  setFormData({
                    ...formData,
                    general: {
                      ...formData.general,
                      operatingHours: {
                        ...formData.general.operatingHours,
                        start: e.target.value
                      }
                    }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="end-time">Operating Hours End</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.general.operatingHours.end}
                onChange={(e) => 
                  setFormData({
                    ...formData,
                    general: {
                      ...formData.general,
                      operatingHours: {
                        ...formData.general.operatingHours,
                        end: e.target.value
                      }
                    }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.general.operatingHours.timezone}
                onValueChange={(value) => 
                  setFormData({
                    ...formData,
                    general: {
                      ...formData.general,
                      operatingHours: {
                        ...formData.general.operatingHours,
                        timezone: value
                      }
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC+0">UTC+0 (London)</SelectItem>
                  <SelectItem value="UTC+8">UTC+8 (Singapore)</SelectItem>
                  <SelectItem value="UTC-5">UTC-5 (New York)</SelectItem>
                  <SelectItem value="UTC-8">UTC-8 (Los Angeles)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-chats">Max Concurrent Chats per Agent</Label>
              <Input
                id="max-chats"
                type="number"
                value={formData.general.maxConcurrentChats}
                onChange={(e) => 
                  setFormData({
                    ...formData,
                    general: { ...formData.general, maxConcurrentChats: parseInt(e.target.value) }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="queue-limit">Queue Limit</Label>
              <Input
                id="queue-limit"
                type="number"
                value={formData.general.queueLimit}
                onChange={(e) => 
                  setFormData({
                    ...formData,
                    general: { ...formData.general, queueLimit: parseInt(e.target.value) }
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Automation & Bot Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-greeting">Auto Greeting</Label>
              <p className="text-sm text-gray-600">Send automatic welcome message</p>
            </div>
            <Switch
              id="auto-greeting"
              checked={formData.automation.autoGreeting}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  automation: { ...formData.automation, autoGreeting: checked }
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="greeting-message">Greeting Message</Label>
            <Textarea
              id="greeting-message"
              value={formData.automation.greetingMessage}
              onChange={(e) => 
                setFormData({
                  ...formData,
                  automation: { ...formData.automation, greetingMessage: e.target.value }
                })
              }
              placeholder="Enter your greeting message..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="prebot-enabled">Pre-chat Bot</Label>
              <p className="text-sm text-gray-600">Enable pre-chat questionnaire</p>
            </div>
            <Switch
              id="prebot-enabled"
              checked={formData.automation.prebotEnabled}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  automation: { ...formData.automation, prebotEnabled: checked }
                })
              }
            />
          </div>

          <div>
            <Label>Escalation Rules</Label>
            <div className="space-y-2 mt-2">
              {formData.automation.escalationRules.map((rule, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Condition"
                    value={rule.condition}
                    onChange={(e) => {
                      const newRules = [...formData.automation.escalationRules];
                      newRules[index] = { ...newRules[index], condition: e.target.value };
                      setFormData({
                        ...formData,
                        automation: { ...formData.automation, escalationRules: newRules }
                      });
                    }}
                  />
                  <Input
                    placeholder="Action"
                    value={rule.action}
                    onChange={(e) => {
                      const newRules = [...formData.automation.escalationRules];
                      newRules[index] = { ...newRules[index], action: e.target.value };
                      setFormData({
                        ...formData,
                        automation: { ...formData.automation, escalationRules: newRules }
                      });
                    }}
                  />
                  <Button size="sm" variant="outline" onClick={() => removeEscalationRule(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addEscalationRule}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Chat Widget Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="widget-color">Widget Color</Label>
              <Input
                id="widget-color"
                type="color"
                value={formData.appearance.chatWidgetColor}
                onChange={(e) => 
                  setFormData({
                    ...formData,
                    appearance: { ...formData.appearance, chatWidgetColor: e.target.value }
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="widget-position">Widget Position</Label>
              <Select
                value={formData.appearance.chatWidgetPosition}
                onValueChange={(value: 'bottom-right' | 'bottom-left') => 
                  setFormData({
                    ...formData,
                    appearance: { ...formData.appearance, chatWidgetPosition: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-avatar">Show Agent Avatar</Label>
              <p className="text-sm text-gray-600">Display agent profile pictures</p>
            </div>
            <Switch
              id="show-avatar"
              checked={formData.appearance.showAgentAvatar}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  appearance: { ...formData.appearance, showAgentAvatar: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="typing-indicator">Typing Indicator</Label>
              <p className="text-sm text-gray-600">Show when agent/customer is typing</p>
            </div>
            <Switch
              id="typing-indicator"
              checked={formData.appearance.showTypingIndicator}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  appearance: { ...formData.appearance, showTypingIndicator: checked }
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-600">Send notifications via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={formData.notifications.emailNotifications}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, emailNotifications: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-gray-600">Send browser push notifications</p>
            </div>
            <Switch
              id="push-notifications"
              checked={formData.notifications.pushNotifications}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, pushNotifications: checked }
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="notification-recipients">Notification Recipients</Label>
            <Textarea
              id="notification-recipients"
              value={formData.notifications.notificationRecipients.join(', ')}
              onChange={(e) => 
                setFormData({
                  ...formData,
                  notifications: {
                    ...formData.notifications,
                    notificationRecipients: e.target.value.split(', ').filter(email => email.trim())
                  }
                })
              }
              placeholder="Enter email addresses separated by commas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
