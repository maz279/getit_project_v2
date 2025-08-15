/**
 * Bird.com SMS Service for International OTP Delivery
 * Supports SMS delivery to 200+ countries worldwide via Bird.com API
 */

import fetch from 'node-fetch';

interface SMSOTPOptions {
  to: string;
  otpCode: string;
  type: string;
  expiryMinutes?: number;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  to: string;
  status?: string;
}

class BirdSMSService {
  private workspaceId: string;
  private accessKey: string;
  private phoneNumberId: string;
  private useCaseId: string;
  private isConfigured: boolean = false;
  private baseUrl: string = 'https://api.bird.com';

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    try {
      this.workspaceId = process.env.BIRD_WORKSPACE_ID || '';
      this.accessKey = process.env.BIRD_ACCESS_KEY || '';
      this.phoneNumberId = process.env.BIRD_PHONE_NUMBER_ID || '';
      this.useCaseId = process.env.BIRD_USE_CASE_ID || '';

      if (this.workspaceId && this.accessKey && this.phoneNumberId && this.useCaseId) {
        this.isConfigured = true;
        console.log('✅ Bird.com SMS Service initialized successfully');
        console.log(`   Workspace: ${this.workspaceId.substring(0, 8)}...`);
      } else {
        console.log('⚠️ Bird.com SMS Service not configured - missing credentials');
        console.log('   Required: BIRD_WORKSPACE_ID, BIRD_ACCESS_KEY, BIRD_PHONE_NUMBER_ID, BIRD_USE_CASE_ID');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Bird.com SMS Service initialization failed:', error);
      this.isConfigured = false;
    }
  }

  async sendOTPSMS(options: SMSOTPOptions): Promise<SMSResponse> {
    const { to, otpCode, type, expiryMinutes = 2 } = options;

    // If Bird.com is not configured, log to console (development mode)
    if (!this.isConfigured) {
      console.log(`📱 [DEVELOPMENT MODE] SMS OTP to ${to}: ${otpCode}`);
      console.log('   To enable real SMS delivery, configure Bird.com credentials');
      
      return {
        success: true,
        messageId: `dev_${Date.now()}`,
        to,
        status: 'development_mode'
      };
    }

    try {
      // Create SMS message content
      const messageBody = this.createSMSMessage(otpCode, type, expiryMinutes);
      
      console.log(`📱 Sending SMS OTP via Bird.com to ${to}...`);
      
      // Prepare Bird.com SMS API request
      const requestUrl = `${this.baseUrl}/workspaces/${this.workspaceId}/channels/sms/messages`;
      
      const requestBody = {
        to: to,
        body: {
          type: 'text',
          text: {
            text: messageBody
          }
        },
        from: {
          phoneNumberId: this.phoneNumberId
        },
        context: {
          useCaseId: this.useCaseId
        }
      };

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `AccessKey ${this.accessKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bird.com API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as any;
      console.log(`✅ SMS sent successfully via Bird.com! Message ID: ${result.id || result.messageId || 'unknown'}`);
      
      return {
        success: true,
        messageId: result.id || result.messageId || `bird_${Date.now()}`,
        to: to,
        status: result.status || 'sent'
      };

    } catch (error: any) {
      console.error(`❌ Bird.com SMS failed for ${to}:`, error);
      
      // Return error details
      return {
        success: false,
        error: error.message || 'Failed to send SMS via Bird.com',
        to: to
      };
    }
  }

  private createSMSMessage(otpCode: string, type: string, expiryMinutes: number): string {
    const typeText = type === 'registration' ? 'registration' : 'verification';
    
    return `Your GetIt ${typeText} code is: ${otpCode}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
  }

  async createConnector(): Promise<{ success: boolean; connectorId?: string; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Bird.com service not configured' };
    }

    try {
      const requestUrl = `${this.baseUrl}/workspaces/${this.workspaceId}/connectors`;
      
      const requestBody = {
        connectorTemplateRef: "sms-messagebird:1",
        name: "GetIt SMS OTP Channel",
        arguments: {
          phoneNumberId: this.phoneNumberId,
          useCaseId: this.useCaseId
        },
        channelConversationalStatusEnabled: true
      };

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `AccessKey ${this.accessKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bird.com Connector API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as any;
      console.log(`✅ Bird.com SMS connector created successfully! Connector ID: ${result.id}`);
      
      return {
        success: true,
        connectorId: result.id
      };

    } catch (error: any) {
      console.error('❌ Bird.com connector creation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create Bird.com connector'
      };
    }
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  getStatus(): { configured: boolean; workspaceId?: string; phoneNumberId?: string } {
    return {
      configured: this.isConfigured,
      workspaceId: this.isConfigured ? this.workspaceId.substring(0, 8) + '...' : undefined,
      phoneNumberId: this.isConfigured ? this.phoneNumberId.substring(0, 8) + '...' : undefined
    };
  }
}

// Create singleton instance
export const birdSmsService = new BirdSMSService();
export default birdSmsService;