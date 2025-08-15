# Gmail SMTP Setup Instructions

## Quick Setup Steps:

1. **Get Gmail App Password:**
   - Go to https://myaccount.google.com/
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate password for "Mail" application
   - Copy the 16-character password

2. **Update .env file:**
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

3. **Remove the # comments** from these lines in .env:
   ```
   # GMAIL_USER=your-email@gmail.com          ← Remove #
   # GMAIL_APP_PASSWORD=your-16-character...  ← Remove #
   ```

4. **Restart the server** - The system will automatically detect Gmail credentials

## Example .env Configuration:
```
GMAIL_USER=mazhar@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

## Testing:
- Once configured, test the OTP email functionality
- Real emails will be sent to the recipient
- Check spam folder if email not received immediately

## Current Status:
- ✅ Email service implemented with professional templates
- ✅ OTP timeout reduced to 2 minutes
- ✅ Fallback to console logging when credentials not configured
- ⏳ Waiting for Gmail credentials to enable email delivery