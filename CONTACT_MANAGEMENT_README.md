# Contact Management Feature

## Overview
A comprehensive Contact Management system that connects the Contact Page form with the Admin Dashboard, allowing users to submit inquiries and administrators to manage them efficiently.

## Features

### 🎯 Core Functionality
- **Contact Form Submission**: Users can submit inquiries through the Contact page
- **Real-time Admin Dashboard**: Administrators can view and manage all contacts
- **Status Management**: Toggle between "new" and "contacted" status
- **Search & Filter**: Find contacts by name, email, or message content
- **Statistics Dashboard**: View contact metrics and trends

### 📊 Database Schema
```javascript
{
  name: String (required, max 100 chars)
  email: String (required, valid email format)
  phone: String (optional, max 20 chars)
  inquiryType: String (required, enum: general|technical|enterprise|partnership|other)
  message: String (required, max 1000 chars)
  status: String (enum: new|contacted, default: new)
  consent: Boolean (required, default: false)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

## Backend API Endpoints

### 📡 Contact Management API

#### `POST /api/contacts`
Create a new contact inquiry
```javascript
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "inquiryType": "general",
  "message": "Your message here...",
  "consent": true
}

// Response
{
  "success": true,
  "message": "Contact message sent successfully!",
  "data": {
    "id": "contact_id",
    "name": "John Doe",
    "email": "john@example.com",
    "inquiryType": "general",
    "status": "new",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `GET /api/contacts`
Retrieve all contacts (sorted by status and date)
```javascript
// Response
{
  "success": true,
  "data": [
    {
      "_id": "contact_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "inquiryType": "general",
      "message": "Your message here...",
      "status": "new",
      "consent": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### `PATCH /api/contacts/:id/status`
Update contact status
```javascript
// Request Body
{
  "status": "contacted" // or "new"
}

// Response
{
  "success": true,
  "message": "Contact status updated to contacted",
  "data": { /* updated contact object */ }
}
```

#### `GET /api/contacts/stats`
Get contact statistics
```javascript
// Response
{
  "success": true,
  "data": {
    "total": 25,
    "new": 8,
    "contacted": 17,
    "recent": 5
  }
}
```

## Frontend Components

### 📝 Contact Page (`/contact`)
- **Enhanced Form**: Updated to match database schema
- **Real-time Validation**: Client-side validation with error messages
- **Success/Error Feedback**: Visual confirmation of form submission
- **API Integration**: Direct submission to backend API

### 🎛️ Admin Dashboard (`/admin`)
- **Tab Navigation**: Switch between Interviews and Contacts
- **Contact Management Table**: View all contacts with sorting
- **Status Toggle**: Mark contacts as new or contacted
- **Search & Filter**: Find specific contacts quickly
- **Statistics Cards**: Overview of contact metrics

## File Structure

```
backend/
├── models/
│   └── contactSchema.js          # MongoDB schema definition
├── controllers/
│   └── contact.js                # API route handlers
├── routes/
│   └── contact.js                # API route definitions
└── index.js                      # Updated with contact routes

frontend/src/pages/
├── Contact/
│   ├── Contact.js                # Updated contact form
│   └── Contact.css               # Enhanced styling
└── Admin/
    ├── AdminContacts.js          # New contact management component
    ├── AdminContacts.css         # Contact management styling
    ├── Admin.js                  # Updated with tab navigation
    └── Admin.css                 # Enhanced with tab styles
```

## Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
# Contact routes are automatically included in index.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# No additional dependencies required
```

### 3. Database
The Contact schema will be automatically created when the first contact is submitted.

## Usage

### For Users (Contact Page)
1. Navigate to `/contact`
2. Fill out the contact form with:
   - Full Name (required)
   - Email Address (required)
   - Phone Number (optional)
   - Inquiry Type (required)
   - Message (required)
   - Consent checkbox (required)
3. Submit the form
4. Receive confirmation message

### For Administrators (Admin Dashboard)
1. Navigate to `/admin`
2. Click on the "📧 Contacts" tab
3. View all contacts in the management table
4. Use search and filter options to find specific contacts
5. Toggle contact status between "new" and "contacted"
6. Monitor contact statistics

## Key Features

### 🔄 Real-time Updates
- Contact status changes are immediately reflected in the UI
- No page refresh required for status updates

### 📱 Responsive Design
- Mobile-friendly contact form
- Responsive admin dashboard table
- Optimized for all screen sizes

### 🎨 User Experience
- Clear visual feedback for all actions
- Intuitive status indicators
- Smooth animations and transitions

### 🔍 Advanced Filtering
- Search by name, email, or message content
- Filter by status (all, new, contacted)
- Sort by creation date (newest first)

## Testing

### Backend API Testing
```bash
cd backend
node test-contact-api.js
```

This will test all API endpoints and verify functionality.

### Frontend Testing
1. Submit a test contact through the Contact page
2. Verify it appears in the Admin Dashboard
3. Test status toggle functionality
4. Test search and filter features

## Error Handling

### Backend
- Comprehensive validation for all fields
- Proper error messages for invalid data
- Graceful handling of database errors

### Frontend
- Form validation with real-time feedback
- Network error handling
- User-friendly error messages

## Security Considerations

- Input validation and sanitization
- Email format validation
- Consent requirement for data processing
- CORS configuration for API access

## Future Enhancements

- Email notifications for new contacts
- Bulk status updates
- Contact export functionality
- Advanced analytics and reporting
- Integration with external CRM systems

## Support

For technical support or questions about the Contact Management feature, please contact the development team or refer to the main project documentation.

