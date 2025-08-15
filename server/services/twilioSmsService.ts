/**
 * Twilio SMS Service for International OTP Delivery
 * Supports SMS delivery to 200+ countries worldwide
 */

import twilio from 'twilio';

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

class TwilioSMSService {
  private client: any;
  private fromNumber: string;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

      if (accountSid && authToken && this.fromNumber) {
        this.client = twilio(accountSid, authToken);
        this.isConfigured = true;
        console.log('✅ Twilio SMS Service initialized successfully');
      } else {
        console.log('⚠️ Twilio SMS Service not configured - missing credentials');
        console.log('   Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Twilio SMS Service initialization failed:', error);
      this.isConfigured = false;
    }
  }

  async sendOTPSMS(options: SMSOTPOptions): Promise<SMSResponse> {
    const { to, otpCode, type, expiryMinutes = 2 } = options;

    // If Twilio is not configured, log to console (development mode)
    if (!this.isConfigured) {
      console.log(`📱 [DEVELOPMENT MODE] SMS OTP to ${to}: ${otpCode}`);
      console.log('   To enable real SMS delivery, configure Twilio credentials');
      
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
      
      console.log(`📱 Sending SMS OTP via Twilio to ${to}...`);
      
      // Send SMS via Twilio
      const message = await this.client.messages.create({
        body: messageBody,
        from: this.fromNumber,
        to: to
      });

      console.log(`✅ SMS sent successfully! Message SID: ${message.sid}`);
      
      return {
        success: true,
        messageId: message.sid,
        to: to,
        status: message.status
      };

    } catch (error: any) {
      console.error(`❌ Twilio SMS failed for ${to}:`, error);
      
      // Return error details
      return {
        success: false,
        error: error.message || 'Failed to send SMS',
        to: to
      };
    }
  }

  private createSMSMessage(otpCode: string, type: string, expiryMinutes: number): string {
    const typeText = type === 'registration' ? 'registration' : 'verification';
    
    return `Your GetIt ${typeText} code is: ${otpCode}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  getStatus(): { configured: boolean; fromNumber?: string } {
    return {
      configured: this.isConfigured,
      fromNumber: this.isConfigured ? this.fromNumber : undefined
    };
  }
}

// Create singleton instance
export const twilioSmsService = new TwilioSMSService();
export default twilioSmsService;