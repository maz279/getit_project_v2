# Gmail SMTP Troubleshooting Guide

## Current Status
✅ **OTP System Working**: OTP generation and verification is fully functional
✅ **Backend API Working**: All OTP endpoints returning proper responses  
❌ **Gmail SMTP Failed**: Email delivery failing due to authentication issues

## Gmail SMTP Error Details
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

## Root Cause Analysis
The Gmail authentication is failing because one of these issues:

1. **Gmail credentials are incorrect**
2. **2-Factor Authentication not enabled on Gmail account**
3. **Using regular password instead of App Password**
4. **App Password not generated correctly**

## Gmail SMTP Setup Requirements

### Step 1: Enable 2-Factor Authentication
1. Go to Google Account settings: https://myaccount.google.com/
2. Security → 2-Step Verification
3. Enable if not already enabled

### Step 2: Generate App Password
1. Go to Security → App passwords
2. Select "Mail" as the app
3. Generate a 16-character app password (e.g., "abcd efgh ijkl mnop")
4. **Important**: Use this App Password, NOT your regular Gmail password

### Step 3: Update Replit Secrets
Set these environment variables in Replit Secrets:
- `GMAIL_USER`: Your Gmail email address (e.g., yourname@gmail.com)
- `GMAIL_APP_PASSWORD`: The 16-character app password from Step 2

## Current Workaround
The system has been enhanced with a backup solution:
- OTP is stored in memory for verification
- OTP codes are logged in console for testing
- Frontend can proceed with OTP verification using console-logged codes

## Testing the Current System
1. **Send OTP**: Request OTP via frontend signup form
2. **Check Console**: Look for "OTP for email is: XXXXXX" in server logs
3. **Use OTP**: Enter the 6-digit code from logs into verification form
4. **Verify**: System will validate against stored OTP

## Example API Test
```bash
# Send OTP
curl -X POST http://localhost:5000/api/v1/notifications/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"registration"}'

# Check console logs for OTP code, then verify
curl -X POST http://localhost:5000/api/v1/notifications/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## When Gmail SMTP is Fixed
Once proper Gmail credentials are provided:
- Emails will be sent automatically to recipients
- No need to check console logs
- OTP verification will work with received emails
- Remove backup logging for production use

## Security Notes
- App Password should be treated as confidential
- Don't share App Password in public repositories
- In production, remove console logging of OTP codes
- Consider using professional email service (SendGrid, AWS SES) for production