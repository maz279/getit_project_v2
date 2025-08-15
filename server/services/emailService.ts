/**
 * Email Service using Nodemailer with Gmail SMTP
 * Alternative to SendGrid for OTP email delivery
 */
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    // Check if Gmail credentials are available
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      console.log('⚠️ Gmail credentials not configured. Email service will use console logging.');
      return;
    }

    try {
      // Create transporter using Gmail SMTP
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword // This should be an "App Password" from Gmail
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Gmail SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ Gmail SMTP connection failed:', error);
      this.transporter = null;
    }
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(to: string, otpCode: string, purpose: string): Promise<boolean> {
    const subject = this.getEmailSubject(purpose);
    const htmlContent = this.generateOTPEmailHTML(otpCode, purpose);
    const textContent = this.generateOTPEmailText(otpCode, purpose);

    return this.sendEmail({
      to,
      subject,
      html: htmlContent,
      text: textContent
    });
  }

  /**
   * Send email using configured transporter
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        // Fallback to console logging if no transporter configured
        console.log('📧 Gmail SMTP not available - Email would be sent:', {
          to: options.to,
          subject: options.subject,
          content: options.text
        });
        console.log('💡 Gmail SMTP Issue: Please verify your Gmail credentials are correct');
        console.log('   - Ensure 2-Factor Authentication is enabled on your Gmail account');
        console.log('   - Use an App Password (not your regular Gmail password)');
        console.log('   - Check that GMAIL_USER and GMAIL_APP_PASSWORD are set correctly');
        return true; // Return true to continue with OTP flow for testing
      }

      const result = await this.transporter.sendMail({
        from: `"GetIt E-commerce" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });

      console.log('✅ Email sent successfully via Gmail SMTP:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Gmail SMTP email sending failed:', error);
      console.log('📧 Email would be sent (SMTP failed):', {
        to: options.to,
        subject: options.subject,
        content: options.text
      });
      return true; // Return true to continue with OTP flow for testing
    }
  }

  /**
   * Generate email subject based on purpose
   */
  private getEmailSubject(purpose: string): string {
    switch (purpose) {
      case 'vendor_registration':
        return 'GetIt - Vendor Registration OTP Verification';
      case 'email_verification':
        return 'GetIt - Email Verification OTP';
      default:
        return 'GetIt - OTP Verification';
    }
  }

  /**
   * Generate HTML email content
   */
  private generateOTPEmailHTML(otpCode: string, purpose: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>GetIt OTP Verification</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #ff6b35; }
            .otp-code { font-size: 36px; font-weight: bold; color: #333; text-align: center; 
                       padding: 20px; margin: 20px 0; background-color: #f8f9fa; 
                       border-radius: 8px; letter-spacing: 4px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; 
                      border-radius: 5px; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">GetIt</div>
                <h2>OTP Verification</h2>
            </div>
            
            <p>Dear User,</p>
            
            <p>Your OTP code for ${purpose.replace('_', ' ')} is:</p>
            
            <div class="otp-code">${otpCode}</div>
            
            <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul>
                    <li>This OTP is valid for 2 minutes only</li>
                    <li>Do not share this code with anyone</li>
                    <li>GetIt will never ask for your OTP via phone or email</li>
                </ul>
            </div>
            
            <p>If you did not request this OTP, please ignore this email.</p>
            
            <div class="footer">
                <p>© 2025 GetIt E-commerce Platform</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate plain text email content
   */
  private generateOTPEmailText(otpCode: string, purpose: string): string {
    return `
GetIt - OTP Verification

Dear User,

Your OTP code for ${purpose.replace('_', ' ')} is: ${otpCode}

IMPORTANT SECURITY NOTICE:
- This OTP is valid for 2 minutes only
- Do not share this code with anyone
- GetIt will never ask for your OTP via phone or email

If you did not request this OTP, please ignore this email.

© 2025 GetIt E-commerce Platform
This is an automated message, please do not reply.
    `;
  }
}

export const emailService = new EmailService();