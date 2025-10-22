# Email Notification System Setup Guide

## Overview

Your EIRA platform now has a professional email notification system that sends beautiful HTML emails when users are activated, deactivated, or log in. This guide will help you set up and test the email functionality.

## ✅ What's Already Implemented

### Email Templates:
1. **Welcome Email** - Sent when new users register
2. **Login Notification** - Sent when existing users log in
3. **Deactivation Email** - Sent when admin deactivates a user
4. **Activation Email** - Sent when admin reactivates a user

### Features:
- Beautiful HTML email templates with professional styling
- Responsive design that works on all devices
- Fallback plain text versions
- Proper error handling and logging
- Personalized content with user names

## 🔧 Setup Instructions

### Step 1: Configure Email Settings

1. **Copy the environment file:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit the .env file with your Gmail credentials:**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Step 2: Get Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/
   - Click "Security" → "2-Step Verification"
   - Enable if not already enabled

3. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

4. **Use the App Password:**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop  # Use the 16-character app password
   ```

## 🧪 Testing the Email System

### Method 1: Test Script (Recommended)

Run the test script to verify all email templates:

```bash
cd backend
node test-email-notifications.js
```

This will send test emails to your configured email address for all templates.

### Method 2: Manual Testing

1. **Start your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Test through Admin Panel:**
   - Login as admin
   - Go to user management
   - Deactivate a test user
   - Check if deactivation email is sent
   - Reactivate the user
   - Check if activation email is sent

3. **Test through Login:**
   - Create a new user account
   - Check if welcome email is sent
   - Login with existing account
   - Check if login notification is sent

## 📧 Email Templates Preview

### Welcome Email
- **Subject:** "Welcome to EIRA Interview Platform"
- **Features:** Getting started guide, pro tips, platform features
- **Design:** Blue gradient header, professional layout

### Deactivation Email
- **Subject:** "Account Deactivated - EIRA Interview Platform"
- **Features:** Clear explanation, next steps, contact information
- **Design:** Red gradient header, alert styling

### Activation Email
- **Subject:** "Account Reactivated - EIRA Interview Platform"
- **Features:** Welcome back message, available features
- **Design:** Green gradient header, success styling

### Login Notification
- **Subject:** "Login Notification - EIRA"
- **Features:** Continue journey tips, progress tracking
- **Design:** Blue gradient header, informational layout

## 🔍 Troubleshooting

### Common Issues:

1. **"Email configuration missing" warning:**
   - Make sure your .env file exists
   - Check that SMTP_USER and SMTP_PASS are set
   - Restart your server after changing .env

2. **"Authentication failed" error:**
   - Use App Password, not your regular Gmail password
   - Make sure 2FA is enabled on your Gmail account
   - Check that the app password is correct (16 characters, no spaces)

3. **Emails not being sent:**
   - Check server console for error messages
   - Verify internet connection
   - Check Gmail's "Less secure app access" (not needed with App Passwords)

4. **Emails going to spam:**
   - This is normal for automated emails
   - Add your email to contacts
   - Check spam folder

### Debug Commands:

```bash
# Check if .env file exists
ls -la backend/.env

# Check environment variables
cd backend
node -e "require('dotenv').config(); console.log('SMTP_USER:', process.env.SMTP_USER); console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Not set');"

# Test email connection
node test-email-notifications.js
```

## 📊 Email Analytics

The system logs all email activities:

```
✅ Welcome email sent successfully to user@example.com
✅ Deactivation email sent successfully to user@example.com
✅ Activation email sent successfully to user@example.com
❌ Failed to send email: Authentication failed
```

## 🎨 Customization

### Modify Email Templates:

Edit the email templates in `backend/controllers/users.js`:

- `sendLoginEmail()` - Welcome and login notifications
- `sendDeactivationEmail()` - Deactivation notifications
- `sendActivationEmail()` - Activation notifications

### Customize Styling:

The HTML templates use inline CSS for maximum compatibility. You can modify:
- Colors and gradients
- Fonts and spacing
- Layout and structure
- Content and messaging

## 🚀 Production Considerations

### For Production Use:

1. **Use a dedicated email service:**
   - SendGrid
   - Mailgun
   - Amazon SES
   - Or keep Gmail with proper rate limiting

2. **Set up proper error handling:**
   - Log failed emails
   - Implement retry logic
   - Monitor email delivery rates

3. **Comply with email regulations:**
   - Include unsubscribe links
   - Follow CAN-SPAM guidelines
   - Respect user preferences

## ✅ Verification Checklist

- [ ] .env file created with correct credentials
- [ ] Gmail App Password generated and configured
- [ ] Backend server starts without email warnings
- [ ] Test script runs successfully
- [ ] All email templates received in inbox
- [ ] Admin panel activation/deactivation sends emails
- [ ] User registration sends welcome email
- [ ] User login sends notification email

## 🎉 Success!

Once all tests pass, your email notification system is fully functional and will automatically send professional emails for all user account activities!
