# Email Service Setup Guide

The OTP email service is now configured to use Gmail SMTP instead of SendGrid for easier setup.

## Setup Instructions

### 1. Enable Gmail App Password
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled
4. Go to Security → App passwords
5. Generate a new App Password for "Mail"
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 2. Configure Environment Variables
Add these to your `.env` file:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### 3. Current Status
- ✅ OTP timeout reduced to 2 minutes
- ✅ Email service configured with Gmail SMTP
- ✅ Professional HTML email templates created
- ✅ Nodemailer integrated with OTP system

### 4. Testing
Once you add the Gmail credentials:
1. The system will automatically detect and use them
2. Real emails will be sent to the provided address
3. You'll receive formatted OTP emails with security notices

### 5. Fallback Behavior
If Gmail credentials are not provided:
- The system will continue to work normally
- OTP codes will be logged to console
- No actual emails will be sent

## Email Template Features
- Professional GetIt branding
- Large, clear OTP code display
- Security warnings and notices
- 2-minute expiry notification
- Responsive HTML design
- Plain text fallback

## Testing Email
To test the email delivery:
1. Add your Gmail credentials to `.env`
2. Restart the server
3. Use the vendor registration form
4. Check your email inbox for the OTP