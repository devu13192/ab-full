# User Deactivation System

This document explains how the user deactivation system works in the EIRA platform.

## Overview

The system prevents deactivated users from logging in and accessing the platform while providing clear feedback about their account status.

## Components

### 1. Backend (Node.js/Express)

**File: `backend/controllers/users.js`**

- **`addUser` function**: Checks if user is deactivated before allowing login
- **`getUser` function**: Returns user status including active/deactivated flags
- **`setActive` function**: Admin function to activate/deactivate users
- **Email notifications**: Sends deactivation/activation emails to users

**Key Features:**
- Returns 403 status for deactivated users
- Includes `active` and `deactivated` flags in responses
- Sends email notifications on status changes

### 2. Frontend Authentication Context

**File: `frontend/src/context/AuthContext.js`**

- Monitors authentication state changes
- Checks user status on login
- Shows professional deactivation alert
- Automatically signs out deactivated users

**Key Features:**
- Real-time deactivation detection
- Professional alert dialog
- Automatic logout on deactivation

### 3. Deactivation Alert Component

**File: `frontend/src/components/Alert/DeactivationAlert.js`**

- Professional Material-UI dialog
- Clear explanation of deactivation
- Contact support functionality
- Responsive design

**Features:**
- Cannot be dismissed easily (professional behavior)
- Provides clear next steps
- Contact support integration

### 4. Protected Routes

**File: `frontend/src/firebase/Protected.js`**

- Additional layer of protection
- Checks user status before allowing access
- Redirects deactivated users to login

### 5. Enhanced Login Page

**File: `frontend/src/pages/Login/Login.js`**

- Loading states during authentication
- Error handling and display
- Better user experience

## User Flow

### For Deactivated Users:

1. **Login Attempt**: User tries to login via Google or other methods
2. **Status Check**: System checks user's active status in database
3. **Block Access**: If deactivated, user is immediately signed out
4. **Show Alert**: Professional deactivation dialog appears
5. **Prevent Navigation**: User cannot access any protected routes
6. **Email Notification**: User receives email about deactivation

### For Admins:

1. **Access Admin Panel**: Admin logs in and accesses user management
2. **Deactivate User**: Admin toggles user's active status
3. **Email Sent**: System automatically sends deactivation email
4. **Immediate Effect**: User is blocked on next login attempt

### For Reactivation:

1. **Admin Action**: Admin reactivates user account
2. **Email Notification**: User receives reactivation email
3. **Login Access**: User can now login normally

## Database Schema

**User Model (`backend/models/userSchema.js`)**:
```javascript
{
    id: String,
    email: String,
    score: Number,
    active: Boolean, // true = active, false = deactivated
    createdAt: Date
}
```

## API Endpoints

- `POST /user/:id` - Login/register user (checks deactivation)
- `GET /user/:id` - Get user info (includes status)
- `PATCH /user/active/:id` - Admin: activate/deactivate user
- `GET /user` - Admin: list all users

## Security Features

1. **Multiple Layers**: Authentication context + protected routes
2. **Real-time Checks**: Status verified on every login
3. **Immediate Logout**: Deactivated users are signed out instantly
4. **Email Notifications**: Users are informed of status changes
5. **Professional UX**: Clear, non-intrusive alerts

## Testing the System

### To Test Deactivation:

1. Login as admin
2. Go to user management
3. Deactivate a test user
4. Try to login with that user's account
5. Verify the deactivation alert appears
6. Verify user cannot access protected routes

### To Test Reactivation:

1. Reactivate the user from admin panel
2. Try to login with that user's account
3. Verify normal login flow works
4. Verify user can access protected routes

## Email Templates

The system sends different emails based on action:

- **Deactivation**: "Account Deactivated - EIRA"
- **Activation**: "Account Reactivated - EIRA"
- **Login**: "Login Notification" or "Welcome to EIRA"

## Error Handling

- Network errors are handled gracefully
- Fallback to basic alerts if custom component fails
- Proper error logging for debugging
- User-friendly error messages

## Browser Compatibility

- Works with all modern browsers
- Responsive design for mobile devices
- Material-UI components for consistency
