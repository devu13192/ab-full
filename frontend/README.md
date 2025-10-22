# CopyPro - Interview Management System

A comprehensive interview management system built with React frontend and Node.js backend, featuring user authentication, interview scheduling, and admin dashboard.

## Project Structure

```
copypro/
├── backend/                          # Node.js Backend Server
│   ├── controllers/                  # Route Controllers
│   │   ├── interview.js             # Interview CRUD operations
│   │   ├── userInterview.js         # User interview management
│   │   └── users.js                 # User management
│   ├── models/                      # MongoDB Schemas
│   │   ├── interviewSchema.js       # Interview data model
│   │   ├── userInterviewSchema.js   # User interview data model
│   │   └── userSchema.js            # User data model
│   ├── routes/                      # API Routes
│   │   ├── interview.js             # Interview endpoints
│   │   ├── userInterview.js         # User interview endpoints
│   │   └── users.js                 # User endpoints
│   ├── index.js                     # Main server file
│   ├── package.json                 # Backend dependencies
│   └── package-lock.json            # Backend dependency lock
│
├── frontend/                         # React Frontend Application
│   ├── public/                      # Static Assets
│   │   ├── favicon.ico              # Site favicon
│   │   ├── index.html               # Main HTML template
│   │   ├── logo192.png              # App logo (192px)
│   │   ├── logo512.png              # App logo (512px)
│   │   ├── manifest.json            # PWA manifest
│   │   └── robots.txt               # SEO robots file
│   │
│   ├── src/                         # Source Code
│   │   ├── components/              # Reusable Components
│   │   │   ├── Card/                # Card component
│   │   │   │   ├── Card.css         # Card styles
│   │   │   │   └── Card.js          # Card component logic
│   │   │   ├── Footer/              # Footer component
│   │   │   │   └── Footer.js        # Footer component logic
│   │   │   ├── InterviewAdder/      # Interview creation
│   │   │   │   ├── InterviewForm.css # Form styles
│   │   │   │   ├── InterviewForm.js  # Form component
│   │   │   │   ├── Question.css     # Question styles
│   │   │   │   └── Question.js      # Question component
│   │   │   ├── InterviewCard/       # Interview display
│   │   │   │   ├── InterviewCard.css # Card styles
│   │   │   │   └── InterviewCard.js  # Card component
│   │   │   ├── LoadingComponent/    # Loading states
│   │   │   │   ├── LoadingComponent.css # Loading styles
│   │   │   │   └── LoadingComponent.js  # Loading component
│   │   │   ├── Navbar/              # Navigation bar
│   │   │   │   ├── Navbar.css       # Navbar styles
│   │   │   │   └── Navbar.js        # Navbar component
│   │   │   ├── Navbar2/             # Alternative navbar
│   │   │   │   ├── Navbar2.css      # Navbar2 styles
│   │   │   │   └── Navbar2.js       # Navbar2 component
│   │   │   ├── SpeechRecognition/   # Speech features
│   │   │   │   ├── SpeechRecognition.css # Speech styles
│   │   │   │   └── SpeechRecognition.js  # Speech component
│   │   │   ├── SpeechToText/        # Speech-to-text
│   │   │   │   ├── SpeechToText.css # STT styles
│   │   │   │   └── SpeechToText.js  # STT component
│   │   │   └── UserInterview/       # User interview
│   │   │       ├── UserInterview.css # User interview styles
│   │   │       └── UserInterview.js  # User interview component
│   │   │
│   │   ├── context/                 # React Context
│   │   │   └── AuthContext.js       # Authentication context
│   │   │
│   │   ├── firebase/                # Firebase Configuration
│   │   │   ├── AdminProtected.js    # Admin route protection
│   │   │   ├── firebase.js          # Firebase config
│   │   │   └── Protected.js         # Route protection
│   │   │
│   │   ├── pages/                   # Page Components
│   │   │   ├── About/               # About page
│   │   │   │   ├── About.css        # About styles
│   │   │   │   └── About.js         # About component
│   │   │   ├── Admin/               # Admin dashboard
│   │   │   │   ├── Admin.css        # Admin styles
│   │   │   │   └── Admin.js         # Admin component
│   │   │   ├── Contact/             # Contact page
│   │   │   │   ├── Contact.css      # Contact styles
│   │   │   │   └── Contact.js       # Contact component
│   │   │   ├── Evaluation/          # Interview evaluation
│   │   │   │   ├── Evaluation.css   # Evaluation styles
│   │   │   │   └── Evaluation.js    # Evaluation component
│   │   │   ├── Finish/              # Interview completion
│   │   │   │   ├── Finish.css       # Finish styles
│   │   │   │   └── Finish.js        # Finish component
│   │   │   ├── Home/                # Home page
│   │   │   │   ├── Home.css         # Home styles
│   │   │   │   └── Home.js          # Home component
│   │   │   ├── Interview/           # Interview page
│   │   │   │   ├── Interview.css    # Interview styles
│   │   │   │   └── Interview.js     # Interview component
│   │   │   ├── Landing/             # Landing page
│   │   │   │   ├── Landing.css      # Landing styles
│   │   │   │   └── Landing.js       # Landing component
│   │   │   ├── Login/               # Login page
│   │   │   │   ├── Login.css        # Login styles
│   │   │   │   └── Login.js         # Login component
│   │   │   ├── PreInterview/        # Pre-interview setup
│   │   │   │   ├── PreInterview.css # Pre-interview styles
│   │   │   │   └── PreInterview.js  # Pre-interview component
│   │   │   └── Profile/             # User profile
│   │   │       ├── Profile.css      # Profile styles
│   │   │       └── Profile.js       # Profile component
│   │   │
│   │   ├── App.js                   # Main App component
│   │   ├── index.css                # Global styles
│   │   └── index.js                 # App entry point
│   │
│   ├── ADMIN_DASHBOARD_README.md    # Admin dashboard documentation
│   ├── package.json                 # Frontend dependencies
│   ├── package-lock.json            # Frontend dependency lock
│   └── README.md                    # This file
│
└── package-lock.json                # Root dependency lock
```

## Features

### 🎯 **Core Functionality**
- **User Authentication**: Firebase-based login system
- **Interview Management**: Create, read, update, delete interviews
- **Admin Dashboard**: Comprehensive admin interface
- **Speech Recognition**: Voice-based interview responses
- **Real-time Evaluation**: Live interview assessment

### 📊 **Admin Dashboard**
- **Statistics Overview**: Total interviews, companies, roles, questions
- **Interview Management**: Full CRUD operations
- **User Management**: Admin user controls
- **Data Visualization**: Interactive charts and metrics

### 🎤 **Interview Features**
- **Speech-to-Text**: Voice input for answers
- **Question Categories**: DBMS, OS, Networks, HR, etc.
- **Progress Tracking**: Real-time interview progress
- **Evaluation System**: Automated scoring and feedback

### 🔐 **Security & Authentication**
- **Firebase Auth**: Secure user authentication
- **Protected Routes**: Role-based access control
- **Admin Protection**: Secure admin-only areas

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Material-UI**: Component library
- **Firebase**: Authentication and hosting
- **CSS3**: Modern styling with gradients and animations

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd copypro
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   - Set up MongoDB connection string in `backend/.env`
   - Configure Firebase credentials in `frontend/.env`

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend (runs on port 5000)
   cd backend
   npm start

   # Terminal 2 - Frontend (runs on port 3000)
   cd frontend
   npm start
   ```

### Development Commands

#### Backend Commands
```bash
cd backend
npm start          # Start development server
npm run dev        # Start with nodemon (if configured)
npm test           # Run backend tests
```

#### Frontend Commands
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run frontend tests
npm run eject      # Eject from Create React App
```

## API Endpoints

### Interview Management
- `GET /interview` - Fetch all interviews
- `POST /interview` - Create new interview
- `PUT /interview/:id` - Update interview
- `DELETE /interview/:id` - Delete interview

### User Management
- `GET /users` - Fetch all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user

### User Interviews
- `GET /userInterview` - Fetch user interviews
- `POST /userInterview` - Create user interview
- `PUT /userInterview/:id` - Update user interview

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, Node.js, and MongoDB**
