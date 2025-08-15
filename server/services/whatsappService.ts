/**
 * WhatsApp Business API Service for OTP Delivery
 * More trusted and reliable than SMS, especially in Bangladesh and developing countries
 */

import fetch from 'node-fetch';

interface WhatsAppOTPOptions {
  to: string;
  otpCode: string;
  type: string;
  expiryMinutes?: number;
  language?: 'en' | 'bn';
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  to: string;
  status?: string;
}

class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private businessAccountId: string;
  private isConfigured: boolean = false;
  private baseUrl: string = 'https://graph.facebook.com/v18.0';

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    try {
      this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
      this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';

      if (this.accessToken && this.phoneNumberId) {
        this.isConfigured = true;
        console.log('✅ WhatsApp Business API Service initialized successfully');
        console.log(`   Phone Number ID: ${this.phoneNumberId.substring(0, 8)}...`);
      } else {
        console.log('⚠️ WhatsApp Business API not configured - missing credentials');
        console.log('   Required: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ WhatsApp Service initialization failed:', error);
      this.isConfigured = false;
    }
  }

  async sendOTPWhatsApp(options: WhatsAppOTPOptions): Promise<WhatsAppResponse> {
    const { to, otpCode, type, expiryMinutes = 2, language = 'en' } = options;

    // If WhatsApp is not configured, log to console (development mode)
    if (!this.isConfigured) {
      console.log(`📱 [DEVELOPMENT MODE] WhatsApp OTP to ${to}: ${otpCode}`);
      console.log('   To enable real WhatsApp delivery, configure WhatsApp Business API credentials');
      
      return {
        success: true,
        messageId: `whatsapp_dev_${Date.now()}`,
        to,
        status: 'development_mode'
      };
    }

    try {
      // Format phone number for WhatsApp (remove + and spaces)
      const cleanPhone = to.replace(/[^\d]/g, '');
      
      console.log(`📱 Sending WhatsApp OTP to ${to}...`);
      
      // Use template message for OTP (template must be pre-approved by Meta)
      const requestUrl = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const messageData = {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "template",
        template: {
          name: "otp_verification", // Pre-approved template name
          language: {
            code: language === 'bn' ? 'bn' : 'en'
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otpCode
                },
                {
                  type: "text", 
                  text: expiryMinutes.toString()
                }
              ]
            }
          ]
        }
      };

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json() as any;
      console.log(`✅ WhatsApp OTP sent successfully! Message ID: ${result.messages?.[0]?.id || 'unknown'}`);
      
      return {
        success: true,
        messageId: result.messages?.[0]?.id || `whatsapp_${Date.now()}`,
        to: to,
        status: 'sent'
      };

    } catch (error: any) {
      console.error(`❌ WhatsApp delivery failed for ${to}:`, error);
      
      // Fallback to text message if template fails
      return await this.sendTextMessage(to, otpCode, type, expiryMinutes);
    }
  }

  private async sendTextMessage(to: string, otpCode: string, type: string, expiryMinutes: number): Promise<WhatsAppResponse> {
    try {
      const cleanPhone = to.replace(/[^\d]/g, '');
      const message = this.createOTPMessage(otpCode, type, expiryMinutes);
      
      console.log(`📱 Sending WhatsApp text message fallback to ${to}...`);
      
      const requestUrl = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const messageData = {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: {
          body: message
        }
      };

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(`WhatsApp text API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json() as any;
      console.log(`✅ WhatsApp text message sent successfully! Message ID: ${result.messages?.[0]?.id || 'unknown'}`);
      
      return {
        success: true,
        messageId: result.messages?.[0]?.id || `whatsapp_text_${Date.now()}`,
        to: to,
        status: 'sent'
      };

    } catch (error: any) {
      console.error(`❌ WhatsApp text message failed for ${to}:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message',
        to: to
      };
    }
  }

  private createOTPMessage(otpCode: string, type: string, expiryMinutes: number): string {
    const typeText = type === 'registration' ? 'registration' : 'verification';
    
    return `🔐 Your GetIt ${typeText} code: *${otpCode}*\n\n⏰ Valid for ${expiryMinutes} minutes\n🔒 Do not share this code with anyone\n\n*GetIt Bangladesh* - Trusted Shopping Platform`;
  }

  async getBusinessProfile(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'WhatsApp service not configured' };
    }

    try {
      const requestUrl = `${this.baseUrl}/${this.phoneNumberId}`;
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`WhatsApp profile API error: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };

    } catch (error: any) {
      console.error('❌ WhatsApp profile fetch failed:', error);
      return { success: false, error: error.message };
    }
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  getStatus(): { configured: boolean; phoneNumberId?: string } {
    return {
      configured: this.isConfigured,
      phoneNumberId: this.isConfigured ? this.phoneNumberId.substring(0, 8) + '...' : undefined
    };
  }
}

// Create singleton instance
export const whatsappService = new WhatsAppService();
export default whatsappService;